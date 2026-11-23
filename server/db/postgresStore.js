import pg from 'pg';
import crypto from 'node:crypto';
import path from 'node:path';
import { runMigrations } from './migrations.js';

const { Pool } = pg;

export class PostgresCmsStore {
  constructor(connectionString) {
    this.connectionString = connectionString;
    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    this.pool = new Pool({
      connectionString,
      ssl: isLocal || process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
      max: 10,
    });
  }

  getMode() {
    return 'postgresql';
  }

  async init() {
    await runMigrations(this.pool);

    // Ensure live and draft document records exist
    const res = await this.pool.query('SELECT env FROM cms_documents');
    const existingEnvs = new Set(res.rows.map((r) => r.env));
    if (!existingEnvs.has('live')) {
      await this.pool.query(
        "INSERT INTO cms_documents (env, content, version, updated_by) VALUES ('live', '{}'::jsonb, 1, 'system')",
      );
    }
    if (!existingEnvs.has('draft')) {
      await this.pool.query(
        "INSERT INTO cms_documents (env, content, version, updated_by) VALUES ('draft', '{}'::jsonb, 1, 'system')",
      );
    }
  }

  async close() {
    await this.pool.end();
  }

  // Meta & Secret
  async getMeta(key, fallback = null) {
    const res = await this.pool.query('SELECT value FROM cms_meta WHERE key = $1', [key]);
    if (res.rows.length === 0) return fallback;
    try {
      return JSON.parse(res.rows[0].value);
    } catch {
      return res.rows[0].value;
    }
  }

  async setMeta(key, value) {
    const valStr = typeof value === 'string' ? value : JSON.stringify(value);
    await this.pool.query(
      `INSERT INTO cms_meta (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, valStr],
    );
  }

  async getJwtSecret() {
    let secret = await this.getMeta('jwt_secret');
    if (!secret) {
      secret = process.env.CMS_JWT_SECRET || crypto.randomBytes(32).toString('hex');
      await this.setMeta('jwt_secret', secret);
    }
    return secret;
  }

  // Documents
  async getDocument(env = 'live') {
    const targetEnv = env === 'draft' ? 'draft' : 'live';
    const res = await this.pool.query('SELECT env, content, version, updated_by, updated_at FROM cms_documents WHERE env = $1', [targetEnv]);
    if (res.rows.length === 0) {
      return { content: {}, version: 1, updatedAt: null, updatedBy: null };
    }
    const r = res.rows[0];
    return {
      content: r.content || {},
      version: r.version,
      updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
      updatedBy: r.updated_by,
    };
  }

  async saveDocument(env, content, updatedBy = 'system') {
    const targetEnv = env === 'draft' ? 'draft' : 'live';
    const res = await this.pool.query(
      `INSERT INTO cms_documents (env, content, version, updated_by, updated_at)
       VALUES ($1, $2, 1, $3, NOW())
       ON CONFLICT (env) DO UPDATE SET
         content = EXCLUDED.content,
         version = cms_documents.version + 1,
         updated_by = EXCLUDED.updated_by,
         updated_at = NOW()
       RETURNING version, updated_at, updated_by`,
      [targetEnv, JSON.stringify(content), updatedBy],
    );
    const r = res.rows[0];
    return {
      content,
      version: r.version,
      updatedAt: r.updated_at.toISOString(),
      updatedBy: r.updated_by,
    };
  }

  async patchDocumentSection(env, sectionKey, value, updatedBy = 'system') {
    const targetEnv = env === 'draft' ? 'draft' : 'live';
    const current = await this.getDocument(targetEnv);
    const nextContent = { ...(current.content || {}), [sectionKey]: value };
    return this.saveDocument(targetEnv, nextContent, updatedBy);
  }

  async publishDraft({ author = 'system', label = 'Published live', note = '' } = {}) {
    const draft = await this.getDocument('draft');
    const liveDoc = await this.saveDocument('live', draft.content, author);
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
    const res = await this.pool.query(
      `SELECT id, version_num, label, note, author_username, created_at
       FROM cms_revisions
       ORDER BY version_num DESC
       LIMIT $1`,
      [limit],
    );
    return res.rows.map((r) => ({
      id: r.id,
      versionNum: r.version_num,
      label: r.label,
      note: r.note,
      authorUsername: r.author_username,
      createdAt: r.created_at.toISOString(),
    }));
  }

  async getRevision(id) {
    const res = await this.pool.query('SELECT * FROM cms_revisions WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      versionNum: r.version_num,
      label: r.label,
      note: r.note,
      content: r.content,
      authorUsername: r.author_username,
      createdAt: r.created_at.toISOString(),
    };
  }

  async createRevision({ label, note = '', content, author }) {
    const id = crypto.randomUUID();
    const res = await this.pool.query(
      `INSERT INTO cms_revisions (id, label, note, content, author_username, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING version_num, created_at`,
      [id, label, note, JSON.stringify(content), author || 'system'],
    );
    return {
      id,
      versionNum: res.rows[0].version_num,
      label,
      note,
      content,
      authorUsername: author || 'system',
      createdAt: res.rows[0].created_at.toISOString(),
    };
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
    const res = await this.pool.query('SELECT * FROM cms_schedules ORDER BY publish_at ASC');
    return res.rows.map((r) => ({
      id: r.id,
      title: r.title,
      note: r.note,
      publishAt: r.publish_at.toISOString(),
      status: r.status,
      createdBy: r.created_by,
      createdAt: r.created_at.toISOString(),
      executedAt: r.executed_at ? r.executed_at.toISOString() : null,
    }));
  }

  async createSchedule({ title, note = '', publishAt, snapshot, author }) {
    const id = crypto.randomUUID();
    const res = await this.pool.query(
      `INSERT INTO cms_schedules (id, title, note, publish_at, snapshot, status, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW())
       RETURNING created_at`,
      [id, title, note, new Date(publishAt).toISOString(), JSON.stringify(snapshot), author || 'system'],
    );
    return {
      id,
      title,
      note,
      publishAt: new Date(publishAt).toISOString(),
      snapshot,
      status: 'pending',
      createdBy: author || 'system',
      createdAt: res.rows[0].created_at.toISOString(),
      executedAt: null,
    };
  }

  async cancelSchedule(id) {
    const res = await this.pool.query("UPDATE cms_schedules SET status = 'cancelled' WHERE id = $1 AND status = 'pending'", [id]);
    return res.rowCount > 0;
  }

  async processDueSchedules() {
    const client = await this.pool.connect();
    const executed = [];
    try {
      await client.query('BEGIN');
      // Lock pending due rows safely across multiple cluster instances!
      const dueRes = await client.query(
        `SELECT * FROM cms_schedules
         WHERE status = 'pending' AND publish_at <= NOW()
         FOR UPDATE SKIP LOCKED`,
      );

      for (const item of dueRes.rows) {
        try {
          await this.saveDocument('live', item.snapshot, `schedule:${item.created_by}`);
          await this.saveDocument('draft', item.snapshot, `schedule:${item.created_by}`);
          await this.createRevision({
            label: `Scheduled Release: ${item.title}`,
            note: item.note || `Auto-published at ${item.publish_at.toISOString()}`,
            content: item.snapshot,
            author: item.created_by,
          });
          await client.query("UPDATE cms_schedules SET status = 'published', executed_at = NOW() WHERE id = $1", [item.id]);
          executed.push({ id: item.id, title: item.title });
        } catch (err) {
          await client.query("UPDATE cms_schedules SET status = 'failed', note = $2 WHERE id = $1", [item.id, `Failed: ${err.message}`]);
        }
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[Postgres Scheduler Error]', err);
    } finally {
      client.release();
    }
    return executed;
  }

  // Users & RBAC
  async countUsers() {
    const res = await this.pool.query('SELECT COUNT(*)::int AS count FROM cms_users');
    return res.rows[0].count;
  }

  async listUsers() {
    const res = await this.pool.query(
      `SELECT id, username, email, display_name, role, is_active, last_login_at, created_at, updated_at
       FROM cms_users
       ORDER BY created_at ASC`,
    );
    return res.rows.map((r) => ({
      id: r.id,
      username: r.username,
      email: r.email,
      displayName: r.display_name,
      role: r.role,
      isActive: r.is_active,
      lastLoginAt: r.last_login_at ? r.last_login_at.toISOString() : null,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    }));
  }

  async findUserByUsername(username) {
    if (!username) return null;
    const res = await this.pool.query('SELECT * FROM cms_users WHERE LOWER(username) = LOWER($1)', [username.trim()]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      username: r.username,
      email: r.email,
      displayName: r.display_name,
      role: r.role,
      passwordSalt: r.password_salt,
      passwordHash: r.password_hash,
      isActive: r.is_active,
      lastLoginAt: r.last_login_at ? r.last_login_at.toISOString() : null,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }

  async findUserById(id) {
    const res = await this.pool.query('SELECT * FROM cms_users WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      username: r.username,
      email: r.email,
      displayName: r.display_name,
      role: r.role,
      passwordSalt: r.password_salt,
      passwordHash: r.password_hash,
      isActive: r.is_active,
      lastLoginAt: r.last_login_at ? r.last_login_at.toISOString() : null,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }

  async createUser({ username, email, displayName, role, passwordSalt, passwordHash }) {
    const id = crypto.randomUUID();
    const res = await this.pool.query(
      `INSERT INTO cms_users (id, username, email, display_name, role, password_salt, password_hash, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, NOW(), NOW())
       RETURNING id, username, email, display_name, role, is_active, created_at, updated_at`,
      [id, username.trim(), (email || '').trim(), (displayName || username).trim(), role || 'editor', passwordSalt, passwordHash],
    );
    const r = res.rows[0];
    return {
      id: r.id,
      username: r.username,
      email: r.email,
      displayName: r.display_name,
      role: r.role,
      isActive: r.is_active,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }

  async updateUser(id, patch) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (patch.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(patch.email);
    }
    if (patch.displayName !== undefined) {
      fields.push(`display_name = $${idx++}`);
      values.push(patch.displayName);
    }
    if (patch.role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(patch.role);
    }
    if (patch.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(patch.isActive);
    }
    if (patch.passwordSalt !== undefined && patch.passwordHash !== undefined) {
      fields.push(`password_salt = $${idx++}`);
      values.push(patch.passwordSalt);
      fields.push(`password_hash = $${idx++}`);
      values.push(patch.passwordHash);
    }

    if (fields.length === 0) return this.findUserById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const res = await this.pool.query(
      `UPDATE cms_users SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, username, email, display_name, role, is_active, last_login_at, created_at, updated_at`,
      values,
    );
    if (res.rows.length === 0) throw new Error('User not found');
    const r = res.rows[0];
    return {
      id: r.id,
      username: r.username,
      email: r.email,
      displayName: r.display_name,
      role: r.role,
      isActive: r.is_active,
      lastLoginAt: r.last_login_at ? r.last_login_at.toISOString() : null,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }

  async deleteUser(id) {
    const res = await this.pool.query('DELETE FROM cms_users WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  async touchUserLogin(id) {
    await this.pool.query('UPDATE cms_users SET last_login_at = NOW() WHERE id = $1', [id]);
  }

  // Media Library
  async listMedia({ search = '', folder = '' } = {}) {
    let q = 'SELECT id, filename, url, mime_type, size_bytes, alt_text, folder, tags, uploaded_by, created_at FROM cms_media';
    const params = [];
    const where = [];

    if (folder) {
      params.push(folder);
      where.push(`folder = $${params.length}`);
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      where.push(`(LOWER(filename) LIKE $${params.length} OR LOWER(alt_text) LIKE $${params.length})`);
    }

    if (where.length > 0) {
      q += ` WHERE ${where.join(' AND ')}`;
    }
    q += ' ORDER BY created_at DESC';

    const res = await this.pool.query(q, params);
    return res.rows.map((r) => ({
      id: r.id,
      filename: r.filename,
      url: r.url,
      mimeType: r.mime_type,
      sizeBytes: r.size_bytes,
      altText: r.alt_text,
      folder: r.folder,
      tags: r.tags || [],
      uploadedBy: r.uploaded_by,
      createdAt: r.created_at.toISOString(),
    }));
  }

  async saveMedia({ filename, mimeType, sizeBytes, buffer, altText = '', folder = 'uploads', tags = [], author = '' }) {
    const id = crypto.randomUUID();
    const safeBase = filename
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9-_]/gi, '-')
      .slice(0, 48);
    const ext = path.extname(filename).toLowerCase() || '.png';
    const finalName = `${safeBase}-${Date.now()}${ext}`;
    const url = `/uploads/${finalName}`;

    await this.pool.query(
      `INSERT INTO cms_media (id, filename, url, mime_type, size_bytes, alt_text, folder, tags, data, uploaded_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [id, finalName, url, mimeType, sizeBytes || buffer.length, altText || '', folder || 'uploads', JSON.stringify(tags || []), buffer, author || 'system'],
    );

    return {
      id,
      filename: finalName,
      url,
      mimeType,
      sizeBytes: sizeBytes || buffer.length,
      altText: altText || '',
      folder: folder || 'uploads',
      tags: tags || [],
      uploadedBy: author || 'system',
      createdAt: new Date().toISOString(),
    };
  }

  async getMediaBinary(filename) {
    const safeName = path.basename(filename);
    const res = await this.pool.query('SELECT data, mime_type FROM cms_media WHERE filename = $1', [safeName]);
    if (res.rows.length === 0 || !res.rows[0].data) return null;
    return res.rows[0].data;
  }

  async updateMedia(id, patch) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (patch.altText !== undefined) {
      fields.push(`alt_text = $${idx++}`);
      values.push(patch.altText);
    }
    if (patch.folder !== undefined) {
      fields.push(`folder = $${idx++}`);
      values.push(patch.folder);
    }
    if (patch.tags !== undefined) {
      fields.push(`tags = $${idx++}`);
      values.push(JSON.stringify(patch.tags));
    }

    if (fields.length === 0) return null;
    values.push(id);

    const res = await this.pool.query(
      `UPDATE cms_media SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, filename, url, mime_type, size_bytes, alt_text, folder, tags, uploaded_by, created_at`,
      values,
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      filename: r.filename,
      url: r.url,
      mimeType: r.mime_type,
      sizeBytes: r.size_bytes,
      altText: r.alt_text,
      folder: r.folder,
      tags: r.tags || [],
      uploadedBy: r.uploaded_by,
      createdAt: r.created_at.toISOString(),
    };
  }

  async deleteMedia(id) {
    const res = await this.pool.query('DELETE FROM cms_media WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  // Dynamic Custom Pages
  async listPages({ publishedOnly = false } = {}) {
    let q = 'SELECT id, slug, title, status, publish_at, blocks, seo, author, created_at, updated_at FROM cms_pages';
    if (publishedOnly) q += " WHERE status = 'published'";
    q += ' ORDER BY updated_at DESC';
    const res = await this.pool.query(q);
    return res.rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      status: r.status,
      publishAt: r.publish_at ? r.publish_at.toISOString() : null,
      blocks: r.blocks || [],
      seo: r.seo || {},
      author: r.author,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    }));
  }

  async getPageBySlug(slug) {
    const normalized = slug.startsWith('/') ? slug : `/${slug}`;
    const res = await this.pool.query('SELECT * FROM cms_pages WHERE slug = $1', [normalized]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      status: r.status,
      publishAt: r.publish_at ? r.publish_at.toISOString() : null,
      blocks: r.blocks || [],
      seo: r.seo || {},
      author: r.author,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }

  async upsertPage(pageData) {
    const id = pageData.id || crypto.randomUUID();
    const normalizedSlug = pageData.slug.startsWith('/') ? pageData.slug : `/${pageData.slug}`;

    const res = await this.pool.query(
      `INSERT INTO cms_pages (id, slug, title, status, publish_at, blocks, seo, author, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         status = EXCLUDED.status,
         publish_at = EXCLUDED.publish_at,
         blocks = EXCLUDED.blocks,
         seo = EXCLUDED.seo,
         author = EXCLUDED.author,
         updated_at = NOW()
       RETURNING *`,
      [
        id,
        normalizedSlug,
        pageData.title || 'Untitled Page',
        pageData.status || 'draft',
        pageData.publishAt ? new Date(pageData.publishAt).toISOString() : null,
        JSON.stringify(pageData.blocks || []),
        JSON.stringify(pageData.seo || {}),
        pageData.author || '',
      ],
    );
    const r = res.rows[0];
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      status: r.status,
      publishAt: r.publish_at ? r.publish_at.toISOString() : null,
      blocks: r.blocks || [],
      seo: r.seo || {},
      author: r.author,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }

  async deletePage(id) {
    const res = await this.pool.query('DELETE FROM cms_pages WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  // Redirects
  async listRedirects() {
    const res = await this.pool.query('SELECT * FROM cms_redirects ORDER BY created_at DESC');
    return res.rows.map((r) => ({
      id: r.id,
      sourcePath: r.source_path,
      targetUrl: r.target_url,
      statusCode: r.status_code,
      isActive: r.is_active,
      hits: r.hits,
      createdBy: r.created_by,
      createdAt: r.created_at.toISOString(),
    }));
  }

  async findActiveRedirect(pathname) {
    const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
    const res = await this.pool.query(
      'SELECT * FROM cms_redirects WHERE is_active = TRUE AND (source_path = $1 OR source_path = $2)',
      [normalized, `${normalized}/`],
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      sourcePath: r.source_path,
      targetUrl: r.target_url,
      statusCode: r.status_code,
      isActive: r.is_active,
      hits: r.hits,
    };
  }

  async incrementRedirectHit(id) {
    await this.pool.query('UPDATE cms_redirects SET hits = hits + 1 WHERE id = $1', [id]);
  }

  async createRedirect({ sourcePath, targetUrl, statusCode = 301, isActive = true, author = '' }) {
    const id = crypto.randomUUID();
    const cleanSource = sourcePath.startsWith('/') ? sourcePath : `/${sourcePath}`;
    const res = await this.pool.query(
      `INSERT INTO cms_redirects (id, source_path, target_url, status_code, is_active, hits, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, 0, $6, NOW())
       RETURNING created_at`,
      [id, cleanSource, targetUrl, Number(statusCode) === 302 ? 302 : 301, Boolean(isActive), author],
    );
    return {
      id,
      sourcePath: cleanSource,
      targetUrl,
      statusCode: Number(statusCode) === 302 ? 302 : 301,
      isActive: Boolean(isActive),
      hits: 0,
      createdBy: author,
      createdAt: res.rows[0].created_at.toISOString(),
    };
  }

  async updateRedirect(id, patch) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (patch.sourcePath !== undefined) {
      fields.push(`source_path = $${idx++}`);
      values.push(patch.sourcePath);
    }
    if (patch.targetUrl !== undefined) {
      fields.push(`target_url = $${idx++}`);
      values.push(patch.targetUrl);
    }
    if (patch.statusCode !== undefined) {
      fields.push(`status_code = $${idx++}`);
      values.push(Number(patch.statusCode));
    }
    if (patch.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(Boolean(patch.isActive));
    }

    if (fields.length === 0) return null;
    values.push(id);

    const res = await this.pool.query(
      `UPDATE cms_redirects SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      sourcePath: r.source_path,
      targetUrl: r.target_url,
      statusCode: r.status_code,
      isActive: r.is_active,
      hits: r.hits,
    };
  }

  async deleteRedirect(id) {
    const res = await this.pool.query('DELETE FROM cms_redirects WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  // Leads
  async listLeads({ status = '', search = '' } = {}) {
    let q = 'SELECT * FROM cms_leads';
    const params = [];
    const where = [];

    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(company) LIKE $${params.length} OR LOWER(message) LIKE $${params.length})`);
    }

    if (where.length > 0) q += ` WHERE ${where.join(' AND ')}`;
    q += ' ORDER BY created_at DESC';

    const res = await this.pool.query(q, params);
    return res.rows.map((r) => ({
      id: r.id,
      formType: r.form_type,
      sourcePath: r.source_path,
      subject: r.subject,
      name: r.name,
      email: r.email,
      company: r.company,
      phone: r.phone,
      message: r.message,
      payload: r.payload || {},
      status: r.status,
      notes: r.notes,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    }));
  }

  async createLead({ formType = 'enquiry', sourcePath = '/', subject = '', name = '', email = '', company = '', phone = '', message = '', payload = {} }) {
    const id = crypto.randomUUID();
    const res = await this.pool.query(
      `INSERT INTO cms_leads (id, form_type, source_path, subject, name, email, company, phone, message, payload, status, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'new', '', NOW(), NOW())
       RETURNING created_at, updated_at`,
      [id, formType, sourcePath, subject, name, email, company, phone, message, JSON.stringify(payload || {})],
    );
    return {
      id,
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
      createdAt: res.rows[0].created_at.toISOString(),
      updatedAt: res.rows[0].updated_at.toISOString(),
    };
  }

  async updateLead(id, patch) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (patch.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(patch.status);
    }
    if (patch.notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(patch.notes);
    }

    if (fields.length === 0) return null;
    fields.push('updated_at = NOW()');
    values.push(id);

    const res = await this.pool.query(`UPDATE cms_leads SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      status: r.status,
      notes: r.notes,
      updatedAt: r.updated_at.toISOString(),
    };
  }

  async deleteLead(id) {
    const res = await this.pool.query('DELETE FROM cms_leads WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  // Webhooks
  async listWebhooks() {
    const res = await this.pool.query('SELECT * FROM cms_webhooks ORDER BY created_at DESC');
    return res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      events: r.events || [],
      secret: r.secret,
      isActive: r.is_active,
      lastStatus: r.last_status,
      lastTriggeredAt: r.last_triggered_at ? r.last_triggered_at.toISOString() : null,
      createdAt: r.created_at.toISOString(),
    }));
  }

  async createWebhook({ name, url, events = [], secret = '', isActive = true }) {
    const id = crypto.randomUUID();
    const res = await this.pool.query(
      `INSERT INTO cms_webhooks (id, name, url, events, secret, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING created_at`,
      [id, name, url, JSON.stringify(events || ['content.published', 'lead.created']), secret || '', Boolean(isActive)],
    );
    return {
      id,
      name,
      url,
      events: events || ['content.published', 'lead.created'],
      secret: secret || '',
      isActive: Boolean(isActive),
      lastStatus: null,
      lastTriggeredAt: null,
      createdAt: res.rows[0].created_at.toISOString(),
    };
  }

  async updateWebhook(id, patch) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (patch.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(patch.name);
    }
    if (patch.url !== undefined) {
      fields.push(`url = $${idx++}`);
      values.push(patch.url);
    }
    if (patch.events !== undefined) {
      fields.push(`events = $${idx++}`);
      values.push(JSON.stringify(patch.events));
    }
    if (patch.secret !== undefined) {
      fields.push(`secret = $${idx++}`);
      values.push(patch.secret);
    }
    if (patch.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(Boolean(patch.isActive));
    }

    if (fields.length === 0) return null;
    values.push(id);

    const res = await this.pool.query(`UPDATE cms_webhooks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      url: r.url,
      events: r.events || [],
      secret: r.secret,
      isActive: r.is_active,
    };
  }

  async deleteWebhook(id) {
    const res = await this.pool.query('DELETE FROM cms_webhooks WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  async recordWebhookResult(id, status) {
    await this.pool.query('UPDATE cms_webhooks SET last_status = $1, last_triggered_at = NOW() WHERE id = $2', [status, id]);
  }

  // Audit Logs
  async addAuditLog({ actorUsername = 'system', actorRole = '', action, entityType, entityId = '', summary, metadata = {}, ipAddress = '' }) {
    const id = crypto.randomUUID();
    const res = await this.pool.query(
      `INSERT INTO cms_audit_logs (id, actor_username, actor_role, action, entity_type, entity_id, summary, metadata, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING created_at`,
      [id, actorUsername, actorRole, action, entityType, entityId, summary, JSON.stringify(metadata || {}), ipAddress],
    );
    return {
      id,
      actorUsername,
      actorRole,
      action,
      entityType,
      entityId,
      summary,
      metadata,
      ipAddress,
      createdAt: res.rows[0].created_at.toISOString(),
    };
  }

  async listAuditLogs({ action = '', actor = '', limit = 100 } = {}) {
    let q = 'SELECT * FROM cms_audit_logs';
    const params = [];
    const where = [];

    if (action) {
      params.push(action);
      where.push(`action = $${params.length}`);
    }
    if (actor) {
      params.push(actor);
      where.push(`actor_username = $${params.length}`);
    }

    if (where.length > 0) q += ` WHERE ${where.join(' AND ')}`;
    params.push(limit);
    q += ` ORDER BY created_at DESC LIMIT $${params.length}`;

    const res = await this.pool.query(q, params);
    return res.rows.map((r) => ({
      id: r.id,
      actorUsername: r.actor_username,
      actorRole: r.actor_role,
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      summary: r.summary,
      metadata: r.metadata || {},
      ipAddress: r.ip_address,
      createdAt: r.created_at.toISOString(),
    }));
  }
}
