export const MIGRATIONS_SQL = `
CREATE TABLE IF NOT EXISTS cms_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_documents (
  env TEXT PRIMARY KEY CHECK (env IN ('live', 'draft')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT NOT NULL DEFAULT 1,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_revisions (
  id UUID PRIMARY KEY,
  version_num SERIAL,
  label TEXT NOT NULL,
  note TEXT DEFAULT '',
  content JSONB NOT NULL,
  author_username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_schedules (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  note TEXT DEFAULT '',
  publish_at TIMESTAMPTZ NOT NULL,
  snapshot JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','published','cancelled','failed')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cms_users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT DEFAULT '',
  display_name TEXT DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('super_admin','editor','seo_manager','reviewer')),
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_media (
  id UUID PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INT NOT NULL DEFAULT 0,
  alt_text TEXT DEFAULT '',
  folder TEXT DEFAULT 'uploads',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  data BYTEA,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled')),
  publish_at TIMESTAMPTZ,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  author TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_redirects (
  id UUID PRIMARY KEY,
  source_path TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  status_code INT NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302)),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  hits INT NOT NULL DEFAULT 0,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_leads (
  id UUID PRIMARY KEY,
  form_type TEXT NOT NULL DEFAULT 'enquiry',
  source_path TEXT DEFAULT '/',
  subject TEXT DEFAULT '',
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  company TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  message TEXT DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','archived')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_webhooks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  secret TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_status INT,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_audit_logs (
  id UUID PRIMARY KEY,
  actor_username TEXT NOT NULL,
  actor_role TEXT DEFAULT '',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT DEFAULT '',
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_revisions_created ON cms_revisions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_schedules_pending ON cms_schedules (publish_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_cms_leads_status ON cms_leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_audit_created ON cms_audit_logs (created_at DESC);
`;

export async function runMigrations(pool) {
  await pool.query(MIGRATIONS_SQL);
}
