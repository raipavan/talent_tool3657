import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DATA_DIR = path.resolve(process.env.CMS_DATA_DIR || path.join(ROOT_DIR, 'data'));
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const CONTENT_FILE = path.join(DATA_DIR, 'cms-content.json');
const AUTH_FILE = path.join(DATA_DIR, 'cms-auth.json');

const PORT = Number(process.env.PORT || 4050);
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
};

/* ---------------- Storage & Auth Helpers ---------------- */

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, s, 64).toString('hex');
  return { salt: s, hash };
}

function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function getAuthStore() {
  await ensureDirs();
  try {
    const raw = await fs.readFile(AUTH_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    const defaultUser = process.env.CMS_ADMIN_USER || 'admin';
    const defaultPass = process.env.CMS_ADMIN_PASSWORD || 'admin';
    const secret = process.env.CMS_JWT_SECRET || crypto.randomBytes(32).toString('hex');
    const { salt, hash } = hashPassword(defaultPass);
    const store = {
      username: defaultUser,
      salt,
      hash,
      secret,
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(AUTH_FILE, JSON.stringify(store, null, 2), 'utf-8');
    return store;
  }
}

async function saveAuthStore(store) {
  await ensureDirs();
  await fs.writeFile(AUTH_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function signToken(username, secret) {
  const payload = Buffer.from(
    JSON.stringify({ sub: username, iat: Date.now(), exp: Date.now() + TOKEN_TTL_MS }),
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!data.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

async function getContentStore() {
  await ensureDirs();
  try {
    const raw = await fs.readFile(CONTENT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { content: {}, updatedAt: null, version: 1 };
  }
}

async function saveContentStore(content) {
  await ensureDirs();
  const payload = {
    content,
    updatedAt: new Date().toISOString(),
    version: 1,
  };
  const tmpFile = `${CONTENT_FILE}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(payload, null, 2), 'utf-8');
  await fs.rename(tmpFile, CONTENT_FILE);
  return payload;
}

/* ---------------- HTTP Helpers ---------------- */

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

async function requireAuth(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const authStore = await getAuthStore();
  const decoded = verifyToken(token, authStore.secret);
  if (!decoded) {
    sendJson(res, 401, { error: 'Unauthorized. Please sign in to the CMS.' });
    return null;
  }
  return { user: decoded.sub, authStore };
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

/* ---------------- Request Router ---------------- */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method || 'GET';

  if (method === 'OPTIONS') {
    setCors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // 1. Health Check
    if (pathname === '/api/cms/health' && method === 'GET') {
      const store = await getContentStore();
      return sendJson(res, 200, {
        ok: true,
        service: 'TalentPool365 Self-Hosted CMS API',
        updatedAt: store.updatedAt,
        hasCustomContent: Object.keys(store.content || {}).length > 0,
      });
    }

    // 2. Auth: Login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await readJsonBody(req);
      const username = String(body.username || '').trim();
      const password = String(body.password || '');
      const authStore = await getAuthStore();

      const validUser = username.toLowerCase() === authStore.username.toLowerCase();
      const validPass = verifyPassword(password, authStore.salt, authStore.hash);

      if (!validUser || !validPass) {
        return sendJson(res, 401, { error: 'Invalid username or password.' });
      }

      const token = signToken(authStore.username, authStore.secret);
      return sendJson(res, 200, {
        ok: true,
        token,
        username: authStore.username,
      });
    }

    // 3. Auth: Me
    if (pathname === '/api/auth/me' && method === 'GET') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      return sendJson(res, 200, { ok: true, username: auth.user });
    }

    // 4. Auth: Change Password
    if (pathname === '/api/auth/change-password' && method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const body = await readJsonBody(req);
      const currentPassword = String(body.currentPassword || '');
      const newPassword = String(body.newPassword || '');
      const newUsername = String(body.newUsername || auth.authStore.username).trim();

      if (!verifyPassword(currentPassword, auth.authStore.salt, auth.authStore.hash)) {
        return sendJson(res, 400, { error: 'Current password is incorrect.' });
      }
      if (newPassword.length < 4) {
        return sendJson(res, 400, { error: 'New password must be at least 4 characters.' });
      }

      const { salt, hash } = hashPassword(newPassword);
      const nextStore = {
        ...auth.authStore,
        username: newUsername || auth.authStore.username,
        salt,
        hash,
        updatedAt: new Date().toISOString(),
      };
      await saveAuthStore(nextStore);
      const token = signToken(nextStore.username, nextStore.secret);
      return sendJson(res, 200, { ok: true, token, username: nextStore.username });
    }

    // 5. CMS: Get Full Site Content (Public - read by all visitors!)
    if (pathname === '/api/cms/content' && method === 'GET') {
      const store = await getContentStore();
      return sendJson(res, 200, store);
    }

    // 6. CMS: Save Full Site Content (Admin Auth Required)
    if (pathname === '/api/cms/content' && method === 'PUT') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const body = await readJsonBody(req);
      const nextContent = body.content ?? body;
      const saved = await saveContentStore(nextContent);
      return sendJson(res, 200, { ok: true, ...saved });
    }

    // 7. CMS: Update Single Section (Admin Auth Required)
    if (pathname.startsWith('/api/cms/section/') && (method === 'PATCH' || method === 'PUT')) {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const sectionKey = decodeURIComponent(pathname.slice('/api/cms/section/'.length));
      if (!sectionKey) {
        return sendJson(res, 400, { error: 'Missing section key.' });
      }
      const body = await readJsonBody(req);
      const store = await getContentStore();
      const nextContent = {
        ...(store.content || {}),
        [sectionKey]: body.value !== undefined ? body.value : body,
      };
      const saved = await saveContentStore(nextContent);
      return sendJson(res, 200, { ok: true, section: sectionKey, updatedAt: saved.updatedAt });
    }

    // 8. CMS: Reset Content (Admin Auth Required)
    if (pathname === '/api/cms/reset' && method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const body = await readJsonBody(req);
      const sectionKey = body.section;
      if (sectionKey) {
        const store = await getContentStore();
        const nextContent = { ...(store.content || {}) };
        delete nextContent[sectionKey];
        const saved = await saveContentStore(nextContent);
        return sendJson(res, 200, { ok: true, reset: sectionKey, updatedAt: saved.updatedAt });
      }
      const saved = await saveContentStore({});
      return sendJson(res, 200, { ok: true, reset: 'all', updatedAt: saved.updatedAt });
    }

    // 9. CMS: Image Upload (Admin Auth Required)
    if (pathname === '/api/cms/upload' && method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const body = await readJsonBody(req, 10 * 1024 * 1024);
      const dataUrl = String(body.dataUrl || '');
      const match = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp|gif|svg\+xml));base64,(.+)$/i);
      if (!match) {
        return sendJson(res, 400, { error: 'Invalid image data URL.' });
      }
      const extMap = {
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/webp': '.webp',
        'image/gif': '.gif',
        'image/svg+xml': '.svg',
      };
      const ext = extMap[match[1].toLowerCase()] || '.png';
      const safeBase = String(body.filename || 'upload')
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-z0-9-_]/gi, '-')
        .slice(0, 48);
      const finalName = `${safeBase}-${Date.now()}${ext}`;
      const buffer = Buffer.from(match[3], 'base64');
      await ensureDirs();
      await fs.writeFile(path.join(UPLOADS_DIR, finalName), buffer);
      return sendJson(res, 200, { ok: true, url: `/uploads/${finalName}` });
    }

    // 10. Serve Uploaded Media
    if (pathname.startsWith('/uploads/') && method === 'GET') {
      const fileName = path.basename(pathname);
      const served = await serveFile(res, path.join(UPLOADS_DIR, fileName));
      if (served) return;
      return sendJson(res, 404, { error: 'Uploaded file not found.' });
    }

    // 11. Serve Built Frontend (Production Mode on Render / Self-Hosted)
    if (method === 'GET') {
      const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
      const candidate = path.join(DIST_DIR, safePath === '/' ? 'index.html' : safePath);
      if (await serveFile(res, candidate)) return;

      // SPA Fallback: serve dist/index.html for all client routes (/studio, /pricing, /products/*, etc.)
      if (!pathname.startsWith('/api/')) {
        if (await serveFile(res, path.join(DIST_DIR, 'index.html'))) return;
      }
    }

    sendJson(res, 404, { error: 'Not Found' });
  } catch (err) {
    console.error('[CMS API Error]', err);
    sendJson(res, 500, { error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

ensureDirs().then(async () => {
  await getAuthStore();
  server.listen(PORT, () => {
    console.log(`[TalentPool365 CMS Backend] Running on http://localhost:${PORT}`);
    console.log(`[TalentPool365 CMS Backend] Data directory: ${DATA_DIR}`);
  });
});
