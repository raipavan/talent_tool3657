import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCmsStore } from './db/index.js';
import {
  canUserPerform,
  checkLoginRateLimit,
  hashPassword,
  recordFailedLogin,
  recordSuccessfulLogin,
  ROLES,
  signToken,
  verifyPassword,
  verifyToken,
} from './auth/rbac.js';
import { dispatchWebhookEvent, sendWebhookTestPing } from './services/webhooks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const PORT = Number(process.env.PORT || 4050);
const SITE_URL = (process.env.SITE_URL || 'https://talent-tool3657.onrender.com').replace(/\/+$/, '');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
};

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, status, data) {
  setCors(res);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(data));
}

async function readJsonBody(req, maxBytes = 15 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf-8');
        resolve(text ? JSON.parse(text) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
}

async function requireAuth(req, res, store, requiredPermission = null, opts = {}) {
  const authHeader = req.headers.authorization || '';
  let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token && opts.allowQueryToken) {
    const parsed = new URL(req.url || '/', 'http://localhost');
    token = parsed.searchParams.get('token') || '';
  }
  const secret = await store.getJwtSecret();
  const decoded = verifyToken(token, secret);

  if (!decoded) {
    sendJson(res, 401, { error: 'Unauthorized. Please sign in to the CMS.' });
    return null;
  }

  if (requiredPermission && !canUserPerform(decoded.role, requiredPermission)) {
    sendJson(res, 403, {
      error: `Forbidden. Your role (${decoded.role}) does not have permission '${requiredPermission}'.`,
    });
    return null;
  }

  return { user: decoded.sub, uid: decoded.uid, role: decoded.role, tokenData: decoded };
}

async function serveFile(res, filePath) {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) return false;
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    const data = await fs.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

// Built-in assets discovery in public/assets
async function listPublicAssets() {
  const assetsDir = path.join(PUBLIC_DIR, 'assets');
  const results = [];
  try {
    const entries = await fs.readdir(assetsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.mp4'].includes(ext)) {
          results.push({
            id: `builtin-${entry.name}`,
            filename: entry.name,
            url: `/assets/${entry.name}`,
            mimeType: MIME_TYPES[ext] || 'image/jpeg',
            sizeBytes: 0,
            altText: entry.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
            folder: 'builtin',
            tags: ['stock', 'builtin'],
            uploadedBy: 'system',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  } catch {
    // ignore
  }
  return results;
}

export function createCmsServer(store) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;
    const method = req.method || 'GET';
    const ip = getClientIp(req);

    if (method === 'OPTIONS') {
      setCors(res);
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      // ----------------------------------------------------
      // 1. SETUP & AUTHENTICATION ENDPOINTS
      // ----------------------------------------------------
      if (pathname === '/api/auth/setup-status' && method === 'GET') {
        const userCount = await store.countUsers();
        return sendJson(res, 200, {
          needsSetup: userCount === 0,
          storageMode: store.getMode(),
        });
      }

      if (pathname === '/api/auth/setup' && method === 'POST') {
        const userCount = await store.countUsers();
        if (userCount > 0) {
          return sendJson(res, 400, { error: 'Initial setup has already been completed.' });
        }
        const body = await readJsonBody(req);
        const username = String(body.username || '').trim();
        const password = String(body.password || '');
        const email = String(body.email || '').trim();
        const displayName = String(body.displayName || username).trim();

        if (username.length < 3) {
          return sendJson(res, 400, { error: 'Username must be at least 3 characters.' });
        }
        if (password.length < 8) {
          return sendJson(res, 400, { error: 'Password must be at least 8 characters long.' });
        }

        const { salt, hash } = hashPassword(password);
        const user = await store.createUser({
          username,
          email,
          displayName,
          role: ROLES.SUPER_ADMIN,
          passwordSalt: salt,
          passwordHash: hash,
        });

        const secret = await store.getJwtSecret();
        const token = signToken(user, secret);

        await store.addAuditLog({
          actorUsername: username,
          actorRole: ROLES.SUPER_ADMIN,
          action: 'user.setup',
          entityType: 'user',
          entityId: user.id,
          summary: `Initial Super Admin setup completed for ${username}`,
          ipAddress: ip,
        });

        return sendJson(res, 201, {
          ok: true,
          token,
          user,
        });
      }

      if (pathname === '/api/auth/login' && method === 'POST') {
        const rateCheck = checkLoginRateLimit(ip);
        if (!rateCheck.allowed) {
          return sendJson(res, 429, {
            error: `Too many failed attempts. Please wait ${rateCheck.waitSec} seconds before retrying.`,
          });
        }

        const body = await readJsonBody(req);
        const username = String(body.username || '').trim();
        const password = String(body.password || '');

        const user = await store.findUserByUsername(username);

        if (!user || !user.isActive || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
          recordFailedLogin(ip);
          return sendJson(res, 401, { error: 'Invalid username or password.' });
        }

        recordSuccessfulLogin(ip);
        await store.touchUserLogin(user.id);

        const secret = await store.getJwtSecret();
        const token = signToken(user, secret);

        await store.addAuditLog({
          actorUsername: user.username,
          actorRole: user.role,
          action: 'auth.login',
          entityType: 'auth',
          entityId: user.id,
          summary: `User ${user.username} signed in`,
          ipAddress: ip,
        });

        return sendJson(res, 200, {
          ok: true,
          token,
          username: user.username,
          role: user.role,
          displayName: user.displayName,
        });
      }

      if (pathname === '/api/auth/me' && method === 'GET') {
        const auth = await requireAuth(req, res, store);
        if (!auth) return;
        const user = await store.findUserById(auth.uid);
        if (!user) return sendJson(res, 404, { error: 'User not found' });
        const { passwordSalt, passwordHash, ...safe } = user;
        return sendJson(res, 200, { ok: true, user: safe });
      }

      if (pathname === '/api/auth/change-password' && method === 'POST') {
        const auth = await requireAuth(req, res, store);
        if (!auth) return;
        const body = await readJsonBody(req);
        const currentPassword = String(body.currentPassword || '');
        const newPassword = String(body.newPassword || '');

        const user = await store.findUserById(auth.uid);
        if (!user || !verifyPassword(currentPassword, user.passwordSalt, user.passwordHash)) {
          return sendJson(res, 400, { error: 'Current password is incorrect.' });
        }
        if (newPassword.length < 8) {
          return sendJson(res, 400, { error: 'New password must be at least 8 characters.' });
        }

        const { salt, hash } = hashPassword(newPassword);
        await store.updateUser(user.id, { passwordSalt: salt, passwordHash: hash });

        await store.addAuditLog({
          actorUsername: user.username,
          actorRole: user.role,
          action: 'auth.change_password',
          entityType: 'user',
          entityId: user.id,
          summary: `User ${user.username} updated their password`,
          ipAddress: ip,
        });

        return sendJson(res, 200, { ok: true, message: 'Password changed successfully.' });
      }

      // ----------------------------------------------------
      // 2. TEAM & RBAC USERS (SUPER_ADMIN ONLY)
      // ----------------------------------------------------
      if (pathname === '/api/cms/users' && method === 'GET') {
        const auth = await requireAuth(req, res, store, 'users:*');
        if (!auth) return;
        const users = await store.listUsers();
        return sendJson(res, 200, { ok: true, users });
      }

      if (pathname === '/api/cms/users' && method === 'POST') {
        const auth = await requireAuth(req, res, store, 'users:*');
        if (!auth) return;
        const body = await readJsonBody(req);
        const username = String(body.username || '').trim();
        const password = String(body.password || '');
        const email = String(body.email || '').trim();
        const displayName = String(body.displayName || username).trim();
        const role = String(body.role || 'editor');

        if (username.length < 3 || password.length < 8) {
          return sendJson(res, 400, { error: 'Username must be >= 3 chars and password >= 8 chars.' });
        }

        const { salt, hash } = hashPassword(password);
        const created = await store.createUser({
          username,
          email,
          displayName,
          role,
          passwordSalt: salt,
          passwordHash: hash,
        });

        await store.addAuditLog({
          actorUsername: auth.user,
          actorRole: auth.role,
          action: 'user.create',
          entityType: 'user',
          entityId: created.id,
          summary: `Created user ${username} with role ${role}`,
          ipAddress: ip,
        });

        return sendJson(res, 201, { ok: true, user: created });
      }

      if (pathname.startsWith('/api/cms/users/') && method === 'PATCH') {
        const auth = await requireAuth(req, res, store, 'users:*');
        if (!auth) return;
        const targetId = pathname.slice('/api/cms/users/'.length);
        const body = await readJsonBody(req);
        const patch = {};

        if (body.email !== undefined) patch.email = body.email;
        if (body.displayName !== undefined) patch.displayName = body.displayName;
        if (body.role !== undefined) patch.role = body.role;
        if (body.isActive !== undefined) patch.isActive = Boolean(body.isActive);
        if (body.password) {
          if (body.password.length < 8) return sendJson(res, 400, { error: 'Password must be >= 8 chars.' });
          const { salt, hash } = hashPassword(body.password);
          patch.passwordSalt = salt;
          patch.passwordHash = hash;
        }

        const updated = await store.updateUser(targetId, patch);
        await store.addAuditLog({
          actorUsername: auth.user,
          actorRole: auth.role,
          action: 'user.update',
          entityType: 'user',
          entityId: targetId,
          summary: `Updated user ${updated.username}`,
          ipAddress: ip,
        });
        return sendJson(res, 200, { ok: true, user: updated });
      }

      if (pathname.startsWith('/api/cms/users/') && method === 'DELETE') {
        const auth = await requireAuth(req, res, store, 'users:*');
        if (!auth) return;
        const targetId = pathname.slice('/api/cms/users/'.length);
        if (targetId === auth.uid) {
          return sendJson(res, 400, { error: 'Cannot delete your own user account.' });
        }
        await store.deleteUser(targetId);
        await store.addAuditLog({
          actorUsername: auth.user,
          actorRole: auth.role,
          action: 'user.delete',
          entityType: 'user',
          entityId: targetId,
          summary: `Deleted user ${targetId}`,
          ipAddress: ip,
        });
        return sendJson(res, 200, { ok: true });
      }

      // ----------------------------------------------------
      // 3. CMS HEALTH, CONTENT, DRAFT & LIVE
      // ----------------------------------------------------
      if (pathname === '/api/cms/health' && method === 'GET') {
        const liveDoc = await store.getDocument('live');
        const draftDoc = await store.getDocument('draft');
        const schedules = await store.listSchedules();
        const pendingSchedules = schedules.filter((s) => s.status === 'pending');

        return sendJson(res, 200, {
          ok: true,
          service: 'TalentPool365 Enterprise CMS',
          storageMode: store.getMode(),
          updatedAt: liveDoc.updatedAt,
          liveVersion: liveDoc.version,
          draftVersion: draftDoc.version,
          hasDraftChanges: JSON.stringify(liveDoc.content) !== JSON.stringify(draftDoc.content),
          pendingSchedulesCount: pendingSchedules.length,
        });
      }

      // Public or preview content fetch
      if (pathname === '/api/cms/content' && method === 'GET') {
        const env = url.searchParams.get('env') === 'draft' ? 'draft' : 'live';

        // Draft requires valid auth
        if (env === 'draft') {
          const auth = await requireAuth(req, res, store, 'content:read');
          if (!auth) return;
        }

        const doc = await store.getDocument(env);
        const redirects = await store.listRedirects();
        const customPages = await store.listPages({ publishedOnly: env !== 'draft' });

        return sendJson(res, 200, {
          content: doc.content || {},
          updatedAt: doc.updatedAt,
          version: doc.version,
          env,
          redirects: redirects.filter((r) => r.isActive),
          customPages,
        });
      }

      if (pathname === '/api/cms/draft' && method === 'GET') {
        const auth = await requireAuth(req, res, store, 'content:read');
        if (!auth) return;
        const draft = await store.getDocument('draft');
        const live = await store.getDocument('live');
        return sendJson(res, 200, {
          draft: draft.content,
          version: draft.version,
          updatedAt: draft.updatedAt,
          updatedBy: draft.updatedBy,
          hasDraftChanges: JSON.stringify(draft.content) !== JSON.stringify(live.content),
        });
      }

      if (pathname === '/api/cms/draft' && method === 'PUT') {
        const auth = await requireAuth(req, res, store, 'content:edit');
        if (!auth) return;
        const body = await readJsonBody(req);
        const content = body.content !== undefined ? body.content : body;
        const saved = await store.saveDocument('draft', content, auth.user);
        return sendJson(res, 200, { ok: true, ...saved });
      }

      if (pathname.startsWith('/api/cms/draft/section/') && (method === 'PATCH' || method === 'PUT')) {
        const sectionKey = decodeURIComponent(pathname.slice('/api/cms/draft/section/'.length));
        const isSeoSection = sectionKey === 'pageSeo' || sectionKey === 'siteSettings';
        const auth = await requireAuth(req, res, store, isSeoSection ? null : 'content:edit');
        if (!auth) return;
        if (isSeoSection && !canUserPerform(auth.role, 'content:edit') && !canUserPerform(auth.role, 'seo:manage')) {
          return sendJson(res, 403, {
            error: `Forbidden. Your role (${auth.role}) does not have permission to edit SEO/plugin settings.`,
          });
        }
        const body = await readJsonBody(req);
        const val = body.value !== undefined ? body.value : body;
        const saved = await store.patchDocumentSection('draft', sectionKey, val, auth.user);
        return sendJson(res, 200, { ok: true, section: sectionKey, ...saved });
      }

      if (pathname === '/api/cms/draft/discard' && method === 'POST') {
        const auth = await requireAuth(req, res, store, 'content:edit');
        if (!auth) return;
        const saved = await store.discardDraft(auth.user);
        await store.addAuditLog({
          actorUsername: auth.user,
          actorRole: auth.role,
          action: 'content.discard_draft',
          entityType: 'document',
          summary: 'Discarded unpublished draft changes back to live',
          ipAddress: ip,
        });
        return sendJson(res, 200, { ok: true, ...saved });
      }

      // Legacy fallback endpoint compatibility
      if (pathname.startsWith('/api/cms/section/') && (method === 'PATCH' || method === 'PUT')) {
        const sectionKey = decodeURIComponent(pathname.slice('/api/cms/section/'.length));
        const isSeoSection = sectionKey === 'pageSeo' || sectionKey === 'siteSettings';
        const auth = await requireAuth(req, res, store, isSeoSection ? null : 'content:edit');
        if (!auth) return;
        if (isSeoSection && !canUserPerform(auth.role, 'content:edit') && !canUserPerform(auth.role, 'seo:manage')) {
          return sendJson(res, 403, {
            error: `Forbidden. Your role (${auth.role}) does not have permission to edit SEO/plugin settings.`,
          });
        }
        const body = await readJsonBody(req);
        const val = body.value !== undefined ? body.value : body;
        const saved = await store.patchDocumentSection('draft', sectionKey, val, auth.user);
        return sendJson(res, 200, { ok: true, section: sectionKey, ...saved });
      }

      // ----------------------------------------------------
      // 4. PUBLISHING, REVISIONS & SCHEDULES
      // ----------------------------------------------------
      if (pathname === '/api/cms/publish' && method === 'POST') {
        const auth = await requireAuth(req, res, store, 'content:publish');
        if (!auth) return;
        const body = await readJsonBody(req);
        const label = String(body.label || `Published by ${auth.user}`).trim();
        const note = String(body.note || '').trim();

        const { liveDoc, revision } = await store.publishDraft({
          author: auth.user,
          label,
          note,
        });

        await store.addAuditLog({
          actorUsername: auth.user,
          actorRole: auth.role,
          action: 'content.publish',
          entityType: 'revision',
          entityId: revision.id,
          summary: `Published Live: ${label}`,
          metadata: { note, version: liveDoc.version },
          ipAddress: ip,
        });

        // Trigger outbound webhook
        dispatchWebhookEvent(store, 'content.published', {
          author: auth.user,
          revisionId: revision.id,
          label,
          note,
          version: liveDoc.version,
        });

        return sendJson(res, 200, { ok: true, liveDoc, revision });
      }

      if (pathname === '/api/cms/revisions' && method === 'GET') {
        const auth = await requireAuth(req, res, store, 'content:read');
        if (!auth) return;
        const revisions = await store.listRevisions(100);
        return sendJson(res, 200, { ok: true, revisions });
      }

      if (pathname.startsWith('/api/cms/revisions/') && !pathname.endsWith('/rollback') && method === 'GET') {
        const auth = await requireAuth(req, res, store, 'content:read');
        if (!auth) return;
        const revId = pathname.slice('/api/cms/revisions/'.length);
        const rev = await store.getRevision(revId);
        if (!rev) return sendJson(res, 404, { error: 'Revision not found' });
        return sendJson(res, 200, { ok: true, revision: rev });
      }

      if (pathname.startsWith('/api/cms/revisions/') && pathname.endsWith('/rollback') && method === 'POST') {
        const auth = await requireAuth(req, res, store, 'content:rollback');
        if (!auth) return;
        const revId = pathname.replace('/api/cms/revisions/', '').replace('/rollback', '');
        const body = await readJsonBody(req);
        const targetEnv = body.targetEnv === 'live' ? 'live' : 'draft';

        const result = await store.rollbackToRevision(revId, targetEnv, auth.user);

        await store.addAuditLog({
          actorUsername: auth.user,
          actorRole: auth.role,
          action: 'content.rollback',
          entityType: 'revision',
          entityId: revId,
          summary: `Rolled back ${targetEnv} to revision #${result.revision.versionNum}`,
          ipAddress: ip,
        });

        return sendJson(res, 200, { ok: true, ...result });
      }

      if (pathname === '/api/cms/schedules' && method === 'GET') {
        const auth = await requireAuth(req, res, store, 'content:read');
        if (!auth) return;
        const schedules = await store.listSchedules();
        return sendJson(res, 200, { ok: true, schedules });
      }

      if (pathname === '/api/cms/schedules' && method === 'POST') {
        const auth = await requireAuth(req, res, store, 'content:schedule');
        if (!auth) return;
        const body = await readJsonBody(req);
        const title = String(body.title || 'Scheduled Release').trim();
        const note = String(body.note || '').trim();
        const publishAt = body.publishAt;

        if (!publishAt || isNaN(Date.parse(publishAt))) {
          return sendJson(res, 400, { error: 'Valid publishAt date is required.' });
        }

        const draft = await store.getDocument('draft');
        const schedule = await store.createSchedule({
          title,
          note,
          publishAt,
          snapshot: draft.content,
          author: auth.user,
        });

        await store.addAuditLog({
          actorUsername: auth.user,
          actorRole: auth.role,
          action: 'schedule.create',
          entityType: 'schedule',
          entityId: schedule.id,
          summary: `Scheduled release '${title}' for ${publishAt}`,
          ipAddress: ip,
        });

        return sendJson(res, 201, { ok: true, schedule });
      }

      if (pathname.startsWith('/api/cms/schedules/') && method === 'DELETE') {
        const auth = await requireAuth(req, res, store, 'content:schedule');
        if (!auth) return;
        const schedId = pathname.slice('/api/cms/schedules/'.length);
        const ok = await store.cancelSchedule(schedId);
        return sendJson(res, 200, { ok });
      }

      // ----------------------------------------------------
      // 5. DYNAMIC CUSTOM PAGES (PAGE BUILDER)
      // ----------------------------------------------------
      if (pathname === '/api/cms/pages' && method === 'GET') {
        const auth = await requireAuth(req, res, store, 'pages:read');
        if (!auth) return;
        const pages = await store.listPages();
        return sendJson(res, 200, { ok: true, pages });
      }

      if (pathname === '/api/cms/pages' && method === 'POST') {
        const auth = await requireAuth(req, res, store, 'pages:*');
        if (!auth) return;
        const body = await readJsonBody(req);
        if (!body.title || !body.slug) {
          return sendJson(res, 400, { error: 'Title and slug are required.' });
        }
        const page = await store.upsertPage({ ...body, author: auth.user });

        await store.addAuditLog({
          actorUsername: auth.user,
          actorRole: auth.role,
          action: 'page.create',
          entityType: 'page',
          entityId: page.id,
          summary: `Created page '${page.title}' (${page.slug})`,
          ipAddress: ip,
        });

        return sendJson(res, 201, { ok: true, page });
      }

      if (pathname.startsWith('/api/cms/pages/') && (method === 'PUT' || method === 'PATCH')) {
        const auth = await requireAuth(req, res, store, 'pages:*');
        if (!auth) return;
        const pageId = pathname.slice('/api/cms/pages/'.length);
        const body = await readJsonBody(req);
        const page = await store.upsertPage({ ...body, id: pageId, author: auth.user });

        await store.addAuditLog({
          actorUsername: auth.user,
          actorRole: auth.role,
          action: 'page.update',
          entityType: 'page',
          entityId: page.id,
          summary: `Updated page '${page.title}' (${page.slug})`,
          ipAddress: ip,
        });

        return sendJson(res, 200, { ok: true, page });
      }

      if (pathname.startsWith('/api/cms/pages/') && method === 'DELETE') {
        const auth = await requireAuth(req, res, store, 'pages:*');
        if (!auth) return;
        const pageId = pathname.slice('/api/cms/pages/'.length);
        const ok = await store.deletePage(pageId);
        await store.addAuditLog({
          actorUsername: auth.user,
          actorRole: auth.role,
          action: 'page.delete',
          entityType: 'page',
          entityId: pageId,
          summary: `Deleted page ${pageId}`,
          ipAddress: ip,
        });
        return sendJson(res, 200, { ok });
      }

      // ----------------------------------------------------
      // 6. MEDIA LIBRARY & ASSET MANAGER
      // ----------------------------------------------------
      if (pathname === '/api/cms/media' && method === 'GET') {
        const auth = await requireAuth(req, res, store, 'media:read');
        if (!auth) return;
        const search = url.searchParams.get('q') || '';
        const folder = url.searchParams.get('folder') || '';

        const dbMedia = await store.listMedia({ search, folder });
        const stockAssets = folder === 'uploads' ? [] : await listPublicAssets();
        const merged = [...dbMedia, ...stockAssets];

        return sendJson(res, 200, { ok: true, media: merged });
      }

      if ((pathname === '/api/cms/media/upload' || pathname === '/api/cms/upload') && method === 'POST') {
        const auth = await requireAuth(req, res, store, 'media:*');
        if (!auth) return;
        const body = await readJsonBody(req, 15 * 1024 * 1024);
        const dataUrl = String(body.dataUrl || '');
        const filename = String(body.filename || 'upload.png');
        const altText = String(body.altText || '');
        const folder = String(body.folder || 'uploads');

        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/i);
        if (!match) {
          return sendJson(res, 400, { error: 'Invalid file data URL.' });
        }

        const mimeType = match[1].toLowerCase();
        const buffer = Buffer.from(match[2], 'base64');

        const record = await store.saveMedia({
          filename,
          mimeType,
          sizeBytes: buffer.length,
          buffer,
          altText,
          folder,
          author: auth.user,
        });

        await store.addAuditLog({
          actorUsername: auth.user,
          actorRole: auth.role,
          action: 'media.upload',
          entityType: 'media',
          entityId: record.id,
          summary: `Uploaded ${record.filename}`,
          ipAddress: ip,
        });

        return sendJson(res, 200, { ok: true, url: record.url, media: record });
      }

      if (pathname.startsWith('/api/cms/media/') && method === 'PATCH') {
        const auth = await requireAuth(req, res, store, 'media:*');
        if (!auth) return;
        const mediaId = pathname.slice('/api/cms/media/'.length);
        const body = await readJsonBody(req);
        const updated = await store.updateMedia(mediaId, body);
        return sendJson(res, 200, { ok: Boolean(updated), media: updated });
      }

      if (pathname.startsWith('/api/cms/media/') && method === 'DELETE') {
        const auth = await requireAuth(req, res, store, 'media:*');
        if (!auth) return;
        const mediaId = pathname.slice('/api/cms/media/'.length);
        const ok = await store.deleteMedia(mediaId);
        return sendJson(res, 200, { ok });
      }

      // Serve media binaries from DB or disk with proper cache and CSP
      if (pathname.startsWith('/uploads/') && method === 'GET') {
        const filename = path.basename(pathname);
        const buffer = await store.getMediaBinary(filename);
        if (buffer) {
          const ext = path.extname(filename).toLowerCase();
          const mime = MIME_TYPES[ext] || 'application/octet-stream';
          res.setHeader('Content-Type', mime);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          if (ext === '.svg') {
            res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
          }
          res.writeHead(200);
          res.end(buffer);
          return;
        }
        return sendJson(res, 404, { error: 'File not found' });
      }

      // ----------------------------------------------------
      // 7. 301 / 302 REDIRECTS
      // ----------------------------------------------------
      if (pathname === '/api/cms/redirects' && method === 'GET') {
        const auth = await requireAuth(req, res, store, 'redirects:*');
        if (!auth) return;
        const redirects = await store.listRedirects();
        return sendJson(res, 200, { ok: true, redirects });
      }

      if (pathname === '/api/cms/redirects' && method === 'POST') {
        const auth = await requireAuth(req, res, store, 'redirects:*');
        if (!auth) return;
        const body = await readJsonBody(req);
        const item = await store.createRedirect({
          sourcePath: body.sourcePath,
          targetUrl: body.targetUrl,
          statusCode: body.statusCode,
          isActive: body.isActive,
          author: auth.user,
        });
        return sendJson(res, 201, { ok: true, redirect: item });
      }

      if (pathname.startsWith('/api/cms/redirects/') && method === 'PATCH') {
        const auth = await requireAuth(req, res, store, 'redirects:*');
        if (!auth) return;
        const redId = pathname.slice('/api/cms/redirects/'.length);
        const body = await readJsonBody(req);
        const updated = await store.updateRedirect(redId, body);
        return sendJson(res, 200, { ok: Boolean(updated), redirect: updated });
      }

      if (pathname.startsWith('/api/cms/redirects/') && method === 'DELETE') {
        const auth = await requireAuth(req, res, store, 'redirects:*');
        if (!auth) return;
        const redId = pathname.slice('/api/cms/redirects/'.length);
        const ok = await store.deleteRedirect(redId);
        return sendJson(res, 200, { ok });
      }

      // ----------------------------------------------------
      // 8. LEADS INBOX (PUBLIC SUBMISSION + ADMIN MANAGEMENT)
      // ----------------------------------------------------
      if (pathname === '/api/leads' && method === 'POST') {
        const body = await readJsonBody(req);

        // Anti-spam honeypot
        if (body._gotcha || body.website_hp) {
          return sendJson(res, 200, { ok: true, message: 'Received' });
        }

        const lead = await store.createLead({
          formType: body.formType || 'website_enquiry',
          sourcePath: body.sourcePath || '/',
          subject: body.subject || 'Website Enquiry',
          name: body.name || '',
          email: body.email || '',
          company: body.company || '',
          phone: body.phone || '',
          message: body.message || '',
          payload: body,
        });

        dispatchWebhookEvent(store, 'lead.created', lead);

        return sendJson(res, 201, { ok: true, leadId: lead.id, message: 'Enquiry received successfully.' });
      }

      if (pathname === '/api/cms/leads' && method === 'GET') {
        const auth = await requireAuth(req, res, store, 'leads:*');
        if (!auth) return;
        const status = url.searchParams.get('status') || '';
        const search = url.searchParams.get('q') || '';
        const leads = await store.listLeads({ status, search });
        return sendJson(res, 200, { ok: true, leads });
      }

      if (pathname === '/api/cms/leads/export.csv' && method === 'GET') {
        const auth = await requireAuth(req, res, store, 'leads:*', { allowQueryToken: true });
        if (!auth) return;
        const leads = await store.listLeads({});
        const headers = ['ID', 'Date', 'Type', 'Source', 'Subject', 'Name', 'Email', 'Company', 'Phone', 'Status', 'Notes'];
        const rows = leads.map((l) => [
          l.id,
          l.createdAt,
          l.formType,
          l.sourcePath,
          `"${(l.subject || '').replace(/"/g, '""')}"`,
          `"${(l.name || '').replace(/"/g, '""')}"`,
          l.email,
          `"${(l.company || '').replace(/"/g, '""')}"`,
          l.phone,
          l.status,
          `"${(l.notes || '').replace(/"/g, '""')}"`,
        ]);
        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        });
        res.end(csv);
        return;
      }

      if (pathname.startsWith('/api/cms/leads/') && method === 'PATCH') {
        const auth = await requireAuth(req, res, store, 'leads:*');
        if (!auth) return;
        const leadId = pathname.slice('/api/cms/leads/'.length);
        const body = await readJsonBody(req);
        const updated = await store.updateLead(leadId, body);
        return sendJson(res, 200, { ok: Boolean(updated), lead: updated });
      }

      if (pathname.startsWith('/api/cms/leads/') && method === 'DELETE') {
        const auth = await requireAuth(req, res, store, 'leads:*');
        if (!auth) return;
        const leadId = pathname.slice('/api/cms/leads/'.length);
        const ok = await store.deleteLead(leadId);
        return sendJson(res, 200, { ok });
      }

      // ----------------------------------------------------
      // 9. WEBHOOKS & AUDIT LOGS
      // ----------------------------------------------------
      if (pathname === '/api/cms/webhooks' && method === 'GET') {
        const auth = await requireAuth(req, res, store, 'webhooks:*');
        if (!auth) return;
        const webhooks = await store.listWebhooks();
        return sendJson(res, 200, { ok: true, webhooks });
      }

      if (pathname === '/api/cms/webhooks' && method === 'POST') {
        const auth = await requireAuth(req, res, store, 'webhooks:*');
        if (!auth) return;
        const body = await readJsonBody(req);
        const hook = await store.createWebhook(body);
        return sendJson(res, 201, { ok: true, webhook: hook });
      }

      if (pathname.startsWith('/api/cms/webhooks/') && pathname.endsWith('/test') && method === 'POST') {
        const auth = await requireAuth(req, res, store, 'webhooks:*');
        if (!auth) return;
        const hookId = pathname.replace('/api/cms/webhooks/', '').replace('/test', '');
        const webhooks = await store.listWebhooks();
        const hook = webhooks.find((w) => w.id === hookId);
        if (!hook) return sendJson(res, 404, { error: 'Webhook not found' });

        const result = await sendWebhookTestPing(store, hook, auth.user);

        return sendJson(res, 200, {
          ok: result.ok,
          status: result.status,
          message: result.ok ? `Delivered (HTTP ${result.status})` : `Failed (HTTP ${result.status})`,
        });
      }

      if (pathname.startsWith('/api/cms/webhooks/') && method === 'PATCH') {
        const auth = await requireAuth(req, res, store, 'webhooks:*');
        if (!auth) return;
        const hookId = pathname.slice('/api/cms/webhooks/'.length);
        const body = await readJsonBody(req);
        const updated = await store.updateWebhook(hookId, body);
        return sendJson(res, 200, { ok: Boolean(updated), webhook: updated });
      }

      if (pathname.startsWith('/api/cms/webhooks/') && method === 'DELETE') {
        const auth = await requireAuth(req, res, store, 'webhooks:*');
        if (!auth) return;
        const hookId = pathname.slice('/api/cms/webhooks/'.length);
        const ok = await store.deleteWebhook(hookId);
        return sendJson(res, 200, { ok });
      }

      if (pathname === '/api/cms/audit-logs' && method === 'GET') {
        const auth = await requireAuth(req, res, store, 'audit:read');
        if (!auth) return;
        const action = url.searchParams.get('action') || '';
        const actor = url.searchParams.get('actor') || '';
        const limit = Number(url.searchParams.get('limit') || 100);
        const logs = await store.listAuditLogs({ action, actor, limit });
        return sendJson(res, 200, { ok: true, logs });
      }

      // ----------------------------------------------------
      // 10. DYNAMIC /robots.txt & /sitemap.xml
      // ----------------------------------------------------
      if (pathname === '/robots.txt' && method === 'GET') {
        const liveDoc = await store.getDocument('live');
        const customRobots = liveDoc.content?.siteSettings?.customRobotsTxt;

        const robots =
          customRobots && customRobots.trim()
            ? customRobots.trim()
            : [
                'User-agent: *',
                'Allow: /',
                'Disallow: /admin',
                'Disallow: /studio',
                'Disallow: /api/',
                '',
                `Sitemap: ${SITE_URL}/sitemap.xml`,
              ].join('\n');

        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        });
        res.end(robots);
        return;
      }

      if (pathname === '/sitemap.xml' && method === 'GET') {
        const liveDoc = await store.getDocument('live');
        const content = liveDoc.content || {};
        const customPages = await store.listPages({ publishedOnly: true });

        const standardRoutes = [
          '',
          '/products',
          '/solutions',
          '/integrations',
          '/how-it-works',
          '/case-studies',
          '/customers',
          '/resources',
          '/blog',
          '/support',
          '/legal',
          '/get-started',
          '/pricing',
          '/company/about',
          '/company/leadership',
          '/company/careers',
          '/company/partners',
          '/company/technology',
          '/company/news',
          '/company/contact',
        ];

        const productSlugs = [
          'talent-sourcing',
          'candidate-screening',
          'ai-assessments',
          'ai-interviews',
          'recruiter-workspace',
          'candidate-engagement',
          'hiring-offer-management',
          'analytics-reporting',
          'compliance-security',
        ];

        let urls = [...standardRoutes, ...productSlugs.map((s) => `/products/${s}`)];

        // Add custom published pages
        customPages.forEach((p) => {
          if (!p.seo?.noIndex && p.slug) {
            urls.push(p.slug.startsWith('/') ? p.slug : `/${p.slug}`);
          }
        });

        // Add blog posts
        if (Array.isArray(content.resourcesPage?.blogPosts)) {
          content.resourcesPage.blogPosts.forEach((p) => {
            if (p.slug && p.status !== 'draft') {
              urls.push(`/blog/${p.slug}`);
            }
          });
        }

        // Filter out noindex pages
        if (content.pageSeo) {
          urls = urls.filter((u) => !content.pageSeo[u]?.noIndex);
        }

        const today = new Date().toISOString().split('T')[0];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE_URL}${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${u === '' ? '1.0' : u.startsWith('/products') ? '0.9' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

        res.writeHead(200, {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        });
        res.end(xml);
        return;
      }

      // ----------------------------------------------------
      // 11. SERVER-SIDE 301 / 302 REDIRECT RESOLUTION
      // ----------------------------------------------------
      if (method === 'GET' && !pathname.startsWith('/api/') && !pathname.startsWith('/uploads/')) {
        const redirect = await store.findActiveRedirect(pathname);
        if (redirect) {
          await store.incrementRedirectHit(redirect.id);
          const target = redirect.targetUrl.startsWith('/') || redirect.targetUrl.startsWith('http')
            ? redirect.targetUrl
            : `/${redirect.targetUrl}`;
          res.writeHead(redirect.statusCode || 301, { Location: target });
          res.end();
          return;
        }
      }

      // ----------------------------------------------------
      // 12. STATIC FILES & PRODUCTION SSR SPA FALLBACK
      // ----------------------------------------------------
      if (method === 'GET') {
        const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
        const candidate = path.join(DIST_DIR, safePath === '/' ? 'index.html' : safePath);

        // Serve direct assets (bundle js, css, static images)
        if (safePath !== '/' && safePath !== 'index.html' && (await serveFile(res, candidate))) return;

        // SPA HTML with Dynamic SSR Meta Injection
        if (!pathname.startsWith('/api/')) {
          const indexPath = path.join(DIST_DIR, 'index.html');
          try {
            let html = await fs.readFile(indexPath, 'utf-8');
            const liveDoc = await store.getDocument('live');
            const content = liveDoc.content || {};
            const siteSettings = content.siteSettings || {};
            const pageSeo = content.pageSeo || {};

            let pageTitle = 'TalentPool365 — Agentic AI Recruitment Platform | Source, Screen & Hire Faster';
            let pageDesc = 'TalentPool365 sources, screens, assesses and interviews candidates automatically. Cut time-to-hire by 68% without adding headcount.';
            let ogImage = siteSettings.defaultOgImage || `${SITE_URL}/assets/hero-aurevia-bg.png`;
            let noIndex = false;

            const pathKey = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

            if (pageSeo[pathKey]) {
              const meta = pageSeo[pathKey];
              if (meta.metaTitle) pageTitle = meta.metaTitle;
              if (meta.metaDescription) pageDesc = meta.metaDescription;
              if (meta.ogImage) ogImage = meta.ogImage.startsWith('http') ? meta.ogImage : `${SITE_URL}${meta.ogImage}`;
              if (meta.noIndex) noIndex = true;
            } else if (pathKey === '/' && content.home?.seo) {
              if (content.home.seo.metaTitle) pageTitle = content.home.seo.metaTitle;
              if (content.home.seo.metaDescription) pageDesc = content.home.seo.metaDescription;
              if (content.home.seo.noIndex) noIndex = true;
            }

            const fullUrl = `${SITE_URL}${pathname}`;

            html = html.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`);

            const tagsToInject = `
    <!-- Server-Rendered Advanced CMS SEO Tags -->
    <meta name="description" content="${pageDesc.replace(/"/g, '&quot;')}" />
    <meta name="robots" content="${noIndex ? 'noindex, nofollow' : 'index, follow'}" />
    <link rel="canonical" href="${fullUrl}" />
    <meta property="og:title" content="${pageTitle.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${pageDesc.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pageTitle.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${pageDesc.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${ogImage}" />
    ${siteSettings.googleSearchConsole ? `<meta name="google-site-verification" content="${siteSettings.googleSearchConsole}" />` : ''}
    ${siteSettings.customHeaderScript ? `\n    ${siteSettings.customHeaderScript}` : ''}
`;
            html = html.replace('</head>', `${tagsToInject}</head>`);

            if (siteSettings.customFooterScript) {
              html = html.replace('</body>', `${siteSettings.customFooterScript}\n</body>`);
            }

            res.writeHead(200, {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache',
            });
            res.end(html);
            return;
          } catch {
            if (await serveFile(res, indexPath)) return;
          }
        }
      }

      sendJson(res, 404, { error: 'Not Found' });
    } catch (err) {
      console.error('[CMS Server Error]', err);
      sendJson(res, 500, { error: err instanceof Error ? err.message : 'Internal Server Error' });
    }
  });
}

// Background scheduler tick (runs every 30s)
let schedulerInterval = null;

export async function startServer(port = PORT) {
  const store = await getCmsStore();
  const server = createCmsServer(store);

  schedulerInterval = setInterval(async () => {
    try {
      const executed = await store.processDueSchedules();
      if (executed.length > 0) {
        console.log(`[CMS Scheduler] Executed ${executed.length} scheduled release(s).`);
      }
    } catch (err) {
      console.warn('[CMS Scheduler Warning]', err.message);
    }
  }, 30_000);

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`[TalentPool365 CMS Backend] Running on http://localhost:${port}`);
      console.log(`[TalentPool365 CMS Backend] Storage Engine: ${store.getMode().toUpperCase()}`);
      resolve({ server, store, schedulerInterval });
    });
  });
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer().catch((err) => {
    console.error('[CMS Startup Fatal]', err);
    process.exit(1);
  });
}
