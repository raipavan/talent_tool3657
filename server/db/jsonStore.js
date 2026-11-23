import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export class JsonCmsStore {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.uploadsDir = path.join(dataDir, 'uploads');
    this.files = {
      meta: path.join(dataDir, 'cms-meta.json'),
      documents: path.join(dataDir, 'cms-documents.json'),
      revisions: path.join(dataDir, 'cms-revisions.json'),
      schedules: path.join(dataDir, 'cms-schedules.json'),
      users: path.join(dataDir, 'cms-users.json'),
      media: path.join(dataDir, 'cms-media.json'),
      pages: path.join(dataDir, 'cms-pages.json'),
      redirects: path.join(dataDir, 'cms-redirects.json'),
      leads: path.join(dataDir, 'cms-leads.json'),
      webhooks: path.join(dataDir, 'cms-webhooks.json'),
      audit: path.join(dataDir, 'cms-audit.json'),
    };
  }

  getMode() {
    return 'local-json';
  }

  async init() {
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.mkdir(this.uploadsDir, { recursive: true });

    // Migrate legacy data/cms-content.json and data/cms-auth.json if present
    await this._migrateLegacy();
  }

  async _readJson(file, fallback) {
    try {
      const raw = await fs.readFile(file, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  async _writeJson(file, data) {
    const tmp = `${file}.tmp-${Date.now()}`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmp, file);
  }

  async _migrateLegacy() {
    const docs = await this._readJson(this.files.documents, null);
    if (!docs) {
      const legacyContentFile = path.join(this.dataDir, 'cms-content.json');
      const legacyAuthFile = path.join(this.dataDir, 'cms-auth.json');
      let initialContent = {};

      try {
        const rawContent = await fs.readFile(legacyContentFile, 'utf-8');
        const parsed = JSON.parse(rawContent);
        if (parsed && typeof parsed.content === 'object') {
          initialContent = parsed.content;
        }
      } catch {
        // no legacy content
      }

      await this._writeJson(this.files.documents, {
        live: { content: initialContent, version: 1, updatedAt: new Date().toISOString(), updatedBy: 'system' },
        draft: { content: initialContent, version: 1, updatedAt: new Date().toISOString(), updatedBy: 'system' },
      });

      // Migrate legacy auth store
      const users = await this._readJson(this.files.users, []);
      if (users.length === 0) {
        try {
          const rawAuth = await fs.readFile(legacyAuthFile, 'utf-8');
          const auth = JSON.parse(rawAuth);
          if (auth && auth.username && auth.salt && auth.hash) {
            users.push({
              id: crypto.randomUUID(),
              username: auth.username,
              email: `${auth.username}@talentpool365.com`,
              displayName: auth.username === 'admin' ? 'Administrator' : auth.username,
              role: 'super_admin',
              passwordSalt: auth.salt,
              passwordHash: auth.hash,
              isActive: true,
              lastLoginAt: null,
              createdAt: auth.updatedAt || new Date().toISOString(),
              updatedAt: auth.updatedAt || new Date().toISOString(),
            });
            await this._writeJson(this.files.users, users);
          }
        } catch {
          // no legacy auth
        }
      }
    }
  }

  // Meta & Secret
  async getMeta(key, fallback = null) {
    const meta = await this._readJson(this.files.meta, {});
    return meta[key] !== undefined ? meta[key] : fallback;
  }

  async setMeta(key, value) {
    const meta = await this._readJson(this.files.meta, {});
    meta[key] = value;
    await this._writeJson(this.files.meta, meta);
  }

  async getJwtSecret() {
    let secret = await this.getMeta('jwt_secret');
    if (!secret) {
      secret = process.env.CMS_JWT_SECRET || crypto.randomBytes(32).toString('hex');
      await this.setMeta('jwt_secret', secret);
    }
    return secret;
  }

  // Documents (live vs draft)
  async getDocument(env = 'live') {
    const docs = await this._readJson(this.files.documents, {
      live: { content: {}, version: 1, updatedAt: null, updatedBy: null },
      draft: { content: {}, version: 1, updatedAt: null, updatedBy: null },
    });
    return docs[env] || docs.live;
  }

  async saveDocument(env, content, updatedBy = 'system') {
    const docs = await this._readJson(this.files.documents, {
      live: { content: {}, version: 1, updatedAt: null, updatedBy: null },
      draft: { content: {}, version: 1, updatedAt: null, updatedBy: null },
    });
    const current = docs[env] || { version: 0 };
    const nextDoc = {
      content,
      version: (current.version || 0) + 1,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
    docs[env] = nextDoc;
    await this._writeJson(this.files.documents, docs);
    return nextDoc;
  }

  async patchDocumentSection(env, sectionKey, value, updatedBy = 'system') {
    const current = await this.getDocument(env);
    const nextContent = { ...(current.content || {}), [sectionKey]: value };
    return this.saveDocument(env, nextContent, updatedBy);
  }

  async publishDraft({ author = 'system', label = 'Published live', note = '' } = {}) {
    const draft = await this.getDocument('draft');
    const liveDoc = await this.saveDocument('live', draft.content, author);

    // Create Revision Snapshot
    const revision = await this.createRevision({
      label,
      note,
      content: draft.content,
      author,
    });

    return { liveDoc, revision };
  }

  async discardDraft(author = 'system') {
    const live = await this.getDocument('live');
    return this.saveDocument('draft', live.content, author);
  }

  // Revisions
  async listRevisions(limit = 50) {
    const revisions = await this._readJson(this.files.revisions, []);
    return revisions.slice(0, limit);
  }

  async getRevision(id) {
    const revisions = await this._readJson(this.files.revisions, []);
    return revisions.find((r) => r.id === id) || null;
  }

  async createRevision({ label, note = '', content, author }) {
    const revisions = await this._readJson(this.files.revisions, []);
    const revision = {
      id: crypto.randomUUID(),
      versionNum: revisions.length + 1,
      label: label || `Revision #${revisions.length + 1}`,
      note: note || '',
      content,
      authorUsername: author || 'system',
      createdAt: new Date().toISOString(),
    };
    revisions.unshift(revision);
    await this._writeJson(this.files.revisions, revisions);
    return revision;
  }

  async rollbackToRevision(id, targetEnv = 'draft', author = 'system') {
    const revision = await this.getRevision(id);
    if (!revision) throw new Error('Revision not found');
    const doc = await this.saveDocument(targetEnv, revision.content, author);
    if (targetEnv === 'live') {
      await this.saveDocument('draft', revision.content, author);
      await this.createRevision({
        label: `Rollback to Revision #${revision.versionNum}`,
        note: `Rolled back to snapshot from ${new Date(revision.createdAt).toLocaleString()}`,
        content: revision.content,
        author,
      });
    }
    return { doc, revision };
  }

  // Schedules
  async listSchedules() {
    const schedules = await this._readJson(this.files.schedules, []);
    return schedules.sort((a, b) => new Date(a.publishAt) - new Date(b.publishAt));
  }

  async createSchedule({ title, note = '', publishAt, snapshot, author }) {
    const schedules = await this._readJson(this.files.schedules, []);
    const item = {
      id: crypto.randomUUID(),
      title: title || 'Scheduled Release',
      note: note || '',
      publishAt: new Date(publishAt).toISOString(),
      snapshot,
      status: 'pending',
      createdBy: author || 'system',
      createdAt: new Date().toISOString(),
      executedAt: null,
    };
    schedules.push(item);
    await this._writeJson(this.files.schedules, schedules);
    return item;
  }

  async cancelSchedule(id) {
    const schedules = await this._readJson(this.files.schedules, []);
    const idx = schedules.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    schedules[idx].status = 'cancelled';
    await this._writeJson(this.files.schedules, schedules);
    return true;
  }

  async processDueSchedules() {
    const schedules = await this._readJson(this.files.schedules, []);
    const now = new Date();
    const executed = [];

    for (const item of schedules) {
      if (item.status === 'pending' && new Date(item.publishAt) <= now) {
        try {
          await this.saveDocument('live', item.snapshot, `schedule:${item.createdBy}`);
          await this.saveDocument('draft', item.snapshot, `schedule:${item.createdBy}`);
          await this.createRevision({
            label: `Scheduled Release: ${item.title}`,
            note: item.note || `Auto-published at ${item.publishAt}`,
            content: item.snapshot,
            author: item.createdBy,
          });
          item.status = 'published';
          item.executedAt = new Date().toISOString();
          executed.push(item);
        } catch (err) {
          item.status = 'failed';
          item.note = `${item.note || ''} (Error: ${err.message})`;
        }
      }
    }

    if (executed.length > 0) {
      await this._writeJson(this.files.schedules, schedules);
    }
    return executed;
  }

  // Users & RBAC
  async countUsers() {
    const users = await this._readJson(this.files.users, []);
    return users.length;
  }

  async listUsers() {
    const users = await this._readJson(this.files.users, []);
    return users.map(({ passwordSalt, passwordHash, ...rest }) => rest);
  }

  async findUserByUsername(username) {
    if (!username) return null;
    const users = await this._readJson(this.files.users, []);
    const match = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    return match || null;
  }

  async findUserById(id) {
    const users = await this._readJson(this.files.users, []);
    return users.find((u) => u.id === id) || null;
  }

  async createUser({ username, email, displayName, role, passwordSalt, passwordHash }) {
    const users = await this._readJson(this.files.users, []);
    if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      throw new Error('Username already exists');
    }
    const user = {
      id: crypto.randomUUID(),
      username: username.trim(),
      email: (email || '').trim(),
      displayName: (displayName || username).trim(),
      role: role || 'editor',
      passwordSalt,
      passwordHash,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(user);
    await this._writeJson(this.files.users, users);
    const { passwordSalt: _, passwordHash: __, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(id, patch) {
    const users = await this._readJson(this.files.users, []);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    const existing = users[idx];
    const updated = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    users[idx] = updated;
    await this._writeJson(this.files.users, users);
    const { passwordSalt, passwordHash, ...safeUser } = updated;
    return safeUser;
  }

  async deleteUser(id) {
    const users = await this._readJson(this.files.users, []);
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    await this._writeJson(this.files.users, filtered);
    return true;
  }

  async touchUserLogin(id) {
    const users = await this._readJson(this.files.users, []);
    const user = users.find((u) => u.id === id);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      await this._writeJson(this.files.users, users);
    }
  }

  // Media Library
  async listMedia({ search = '', folder = '' } = {}) {
    const items = await this._readJson(this.files.media, []);
    let filtered = items;
    if (folder) {
      filtered = filtered.filter((m) => m.folder === folder);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.filename.toLowerCase().includes(q) ||
          (m.altText || '').toLowerCase().includes(q) ||
          (m.tags || []).some((t) => t.toLowerCase().includes(q)),
      );
    }
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async saveMedia({ filename, mimeType, sizeBytes, buffer, altText = '', folder = 'uploads', tags = [], author = '' }) {
    const safeBase = filename
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9-_]/gi, '-')
      .slice(0, 48);
    const ext = path.extname(filename).toLowerCase() || '.png';
    const finalName = `${safeBase}-${Date.now()}${ext}`;
    const filePath = path.join(this.uploadsDir, finalName);
    await fs.writeFile(filePath, buffer);

    const mediaList = await this._readJson(this.files.media, []);
    const record = {
      id: crypto.randomUUID(),
      filename: finalName,
      url: `/uploads/${finalName}`,
      mimeType,
      sizeBytes: sizeBytes || buffer.length,
      altText: altText || '',
      folder: folder || 'uploads',
      tags: tags || [],
      uploadedBy: author || 'system',
      createdAt: new Date().toISOString(),
    };
    mediaList.unshift(record);
    await this._writeJson(this.files.media, mediaList);
    return record;
  }

  async getMediaBinary(filename) {
    const safeName = path.basename(filename);
    const filePath = path.join(this.uploadsDir, safeName);
    try {
      const buffer = await fs.readFile(filePath);
      return buffer;
    } catch {
      return null;
    }
  }

  async updateMedia(id, patch) {
    const mediaList = await this._readJson(this.files.media, []);
    const item = mediaList.find((m) => m.id === id);
    if (!item) return null;
    if (patch.altText !== undefined) item.altText = patch.altText;
    if (patch.folder !== undefined) item.folder = patch.folder;
    if (patch.tags !== undefined) item.tags = patch.tags;
    await this._writeJson(this.files.media, mediaList);
    return item;
  }

  async deleteMedia(id) {
    const mediaList = await this._readJson(this.files.media, []);
    const item = mediaList.find((m) => m.id === id);
    if (!item) return false;
    try {
      await fs.unlink(path.join(this.uploadsDir, item.filename));
    } catch {
      // file might have been deleted from disk
    }
    const filtered = mediaList.filter((m) => m.id !== id);
    await this._writeJson(this.files.media, filtered);
    return true;
  }

  // Dynamic Custom Pages
  async listPages({ publishedOnly = false } = {}) {
    const pages = await this._readJson(this.files.pages, []);
    if (publishedOnly) {
      return pages.filter((p) => p.status === 'published');
    }
    return pages;
  }

  async getPageBySlug(slug) {
    const normalized = slug.startsWith('/') ? slug : `/${slug}`;
    const pages = await this._readJson(this.files.pages, []);
    return pages.find((p) => p.slug === normalized) || null;
  }

  async upsertPage(pageData) {
    const pages = await this._readJson(this.files.pages, []);
    const normalizedSlug = pageData.slug.startsWith('/') ? pageData.slug : `/${pageData.slug}`;
    const existingIdx = pages.findIndex((p) => p.id === pageData.id || p.slug === normalizedSlug);

    const now = new Date().toISOString();
    let page;
    if (existingIdx !== -1) {
      page = {
        ...pages[existingIdx],
        ...pageData,
        slug: normalizedSlug,
        updatedAt: now,
      };
      pages[existingIdx] = page;
    } else {
      page = {
        id: pageData.id || crypto.randomUUID(),
        slug: normalizedSlug,
        title: pageData.title || 'Untitled Page',
        status: pageData.status || 'draft',
        publishAt: pageData.publishAt || null,
        blocks: pageData.blocks || [],
        seo: pageData.seo || {},
        author: pageData.author || '',
        createdAt: now,
        updatedAt: now,
      };
      pages.push(page);
    }
    await this._writeJson(this.files.pages, pages);
    return page;
  }

  async deletePage(id) {
    const pages = await this._readJson(this.files.pages, []);
    const filtered = pages.filter((p) => p.id !== id);
    if (filtered.length === pages.length) return false;
    await this._writeJson(this.files.pages, filtered);
    return true;
  }

  // Redirects
  async listRedirects() {
    const redirects = await this._readJson(this.files.redirects, []);
    return redirects;
  }

  async findActiveRedirect(pathname) {
    const redirects = await this._readJson(this.files.redirects, []);
    const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
    return redirects.find((r) => r.isActive && (r.sourcePath === normalized || r.sourcePath === `${normalized}/`)) || null;
  }

  async incrementRedirectHit(id) {
    const redirects = await this._readJson(this.files.redirects, []);
    const item = redirects.find((r) => r.id === id);
    if (item) {
      item.hits = (item.hits || 0) + 1;
      await this._writeJson(this.files.redirects, redirects);
    }
  }

  async createRedirect({ sourcePath, targetUrl, statusCode = 301, isActive = true, author = '' }) {
    const redirects = await this._readJson(this.files.redirects, []);
    const cleanSource = sourcePath.startsWith('/') ? sourcePath : `/${sourcePath}`;
    if (redirects.some((r) => r.sourcePath === cleanSource)) {
      throw new Error(`Redirect for source path '${cleanSource}' already exists`);
    }
    const item = {
      id: crypto.randomUUID(),
      sourcePath: cleanSource,
      targetUrl,
      statusCode: Number(statusCode) === 302 ? 302 : 301,
      isActive: Boolean(isActive),
      hits: 0,
      createdBy: author,
      createdAt: new Date().toISOString(),
    };
    redirects.unshift(item);
    await this._writeJson(this.files.redirects, redirects);
    return item;
  }

  async updateRedirect(id, patch) {
    const redirects = await this._readJson(this.files.redirects, []);
    const item = redirects.find((r) => r.id === id);
    if (!item) return null;
    if (patch.sourcePath !== undefined) item.sourcePath = patch.sourcePath;
    if (patch.targetUrl !== undefined) item.targetUrl = patch.targetUrl;
    if (patch.statusCode !== undefined) item.statusCode = Number(patch.statusCode);
    if (patch.isActive !== undefined) item.isActive = Boolean(patch.isActive);
    await this._writeJson(this.files.redirects, redirects);
    return item;
  }

  async deleteRedirect(id) {
    const redirects = await this._readJson(this.files.redirects, []);
    const filtered = redirects.filter((r) => r.id !== id);
    if (filtered.length === redirects.length) return false;
    await this._writeJson(this.files.redirects, filtered);
    return true;
  }

  // Leads
  async listLeads({ status = '', search = '' } = {}) {
    const leads = await this._readJson(this.files.leads, []);
    let filtered = leads;
    if (status) {
      filtered = filtered.filter((l) => l.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          (l.name || '').toLowerCase().includes(q) ||
          (l.email || '').toLowerCase().includes(q) ||
          (l.company || '').toLowerCase().includes(q) ||
          (l.message || '').toLowerCase().includes(q),
      );
    }
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async createLead({ formType = 'enquiry', sourcePath = '/', subject = '', name = '', email = '', company = '', phone = '', message = '', payload = {} }) {
    const leads = await this._readJson(this.files.leads, []);
    const lead = {
      id: crypto.randomUUID(),
      formType,
      sourcePath,
      subject,
      name,
      email,
      company,
      phone,
      message,
      payload,
      status: 'new',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leads.unshift(lead);
    await this._writeJson(this.files.leads, leads);
    return lead;
  }

  async updateLead(id, patch) {
    const leads = await this._readJson(this.files.leads, []);
    const item = leads.find((l) => l.id === id);
    if (!item) return null;
    if (patch.status !== undefined) item.status = patch.status;
    if (patch.notes !== undefined) item.notes = patch.notes;
    item.updatedAt = new Date().toISOString();
    await this._writeJson(this.files.leads, leads);
    return item;
  }

  async deleteLead(id) {
    const leads = await this._readJson(this.files.leads, []);
    const filtered = leads.filter((l) => l.id !== id);
    if (filtered.length === leads.length) return false;
    await this._writeJson(this.files.leads, filtered);
    return true;
  }

  // Webhooks
  async listWebhooks() {
    return this._readJson(this.files.webhooks, []);
  }

  async createWebhook({ name, url, events = [], secret = '', isActive = true }) {
    const webhooks = await this._readJson(this.files.webhooks, []);
    const hook = {
      id: crypto.randomUUID(),
      name,
      url,
      events: events || ['content.published', 'lead.created'],
      secret: secret || '',
      isActive: Boolean(isActive),
      lastStatus: null,
      lastTriggeredAt: null,
      createdAt: new Date().toISOString(),
    };
    webhooks.push(hook);
    await this._writeJson(this.files.webhooks, webhooks);
    return hook;
  }

  async updateWebhook(id, patch) {
    const webhooks = await this._readJson(this.files.webhooks, []);
    const item = webhooks.find((h) => h.id === id);
    if (!item) return null;
    Object.assign(item, patch);
    await this._writeJson(this.files.webhooks, webhooks);
    return item;
  }

  async deleteWebhook(id) {
    const webhooks = await this._readJson(this.files.webhooks, []);
    const filtered = webhooks.filter((h) => h.id !== id);
    if (filtered.length === webhooks.length) return false;
    await this._writeJson(this.files.webhooks, filtered);
    return true;
  }

  async recordWebhookResult(id, status) {
    const webhooks = await this._readJson(this.files.webhooks, []);
    const item = webhooks.find((h) => h.id === id);
    if (item) {
      item.lastStatus = status;
      item.lastTriggeredAt = new Date().toISOString();
      await this._writeJson(this.files.webhooks, webhooks);
    }
  }

  // Audit Logs
  async addAuditLog({ actorUsername = 'system', actorRole = '', action, entityType, entityId = '', summary, metadata = {}, ipAddress = '' }) {
    const logs = await this._readJson(this.files.audit, []);
    const entry = {
      id: crypto.randomUUID(),
      actorUsername,
      actorRole,
      action,
      entityType,
      entityId,
      summary,
      metadata: metadata || {},
      ipAddress,
      createdAt: new Date().toISOString(),
    };
    logs.unshift(entry);
    // keep at most 1000 logs in JSON
    if (logs.length > 1000) logs.length = 1000;
    await this._writeJson(this.files.audit, logs);
    return entry;
  }

  async listAuditLogs({ action = '', actor = '', limit = 100 } = {}) {
    const logs = await this._readJson(this.files.audit, []);
    let filtered = logs;
    if (action) filtered = filtered.filter((l) => l.action === action);
    if (actor) filtered = filtered.filter((l) => l.actorUsername === actor);
    return filtered.slice(0, limit);
  }
}
