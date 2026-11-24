# TalentPool365 — Website & Self-Hosted Enterprise CMS

Full-stack marketing website and self-hosted Content Management System for **TalentPool365**. Built with React 19, TypeScript, Vite, and an independent Node.js CMS backend supporting **PostgreSQL** (production) and **Local Atomic JSON** storage (zero-config local development).

---

## Features at a Glance

- **29 Editable Website Pages + Dynamic Page Builder**: Every headline, copy block, pricing tier, navigation link, product tab, FAQ, and resource page can be edited in Studio without touching code. Create unlimited custom landing pages at any slug using 9 modular blocks (Hero, Rich Text, Feature Grid, Media Split, Metrics Band, FAQ, Testimonials, CTA Banner, Lead Form).
- **Rich Text & Markdown Blog (`/blog`, `/blog/:slug`)**: Built-in Markdown editor with live preview, draft/published toggle, cover image picker, and JSON-LD `Article` structured data.
- **Draft / Live Publishing, Revisions & Scheduled Releases**: Stage edits in draft without affecting live visitors, inspect immutable revision snapshots, roll back in 1 click, or schedule releases for future deployment.
- **Split-Screen Live Preview & Quick-Edit Bar**: Real-time `postMessage` synchronization across Desktop, Tablet, and Mobile viewports, plus an on-site floating quick-edit bar for signed-in admins.
- **Media Library**: Upload images directly into PostgreSQL (`BYTEA`) or local disk (`./data/uploads/`), browse built-in `/assets/`, filter by folder, and edit alt text.
- **Per-Page SEO Suite, Redirects & External Plugins**: Live Google SERP & Social Open Graph previews, server-side SSR meta tag injection, dynamic `/sitemap.xml` & `/robots.txt`, HTTP 301/302 URL redirects, and no-code plugin fields for GA4, GTM, Meta Pixel, LinkedIn Insight, Hotjar, chat widgets, and custom `<head>` / footer scripts.
- **Multi-User RBAC & Audit Trail**: Four built-in roles (`super_admin`, `editor`, `seo_manager`, `reviewer`), scrypt password hashing, HMAC-signed JWTs, IP login rate limiting, and tamper-evident audit logs.
- **Leads Inbox & Outbound Webhooks**: Captures enquiries with honeypot spam protection, status tracking, internal notes, CSV export, and HMAC-SHA256 signed webhook delivery (`X-TP365-Signature`).

---

## Prerequisites

Install these on your machine before setting up the project:

- **Node.js `>= 22.12.0`** (required by `"engines"` in `package.json` and native `node --test` / `fetch` / `--env-file` support) — check with `node -v`
- **npm** (bundled with Node.js) — check with `npm -v`
- **Git** — check with `git --version`
- **PostgreSQL 14+** *(optional)* — only needed if you want to test or run against PostgreSQL locally instead of the default zero-config Local Atomic JSON store.

---

## Quick Local Setup (Step-by-Step)

### 1. Clone and install dependencies

```bash
git clone https://github.com/raipavan/talent_tool3657.git
cd talent_tool3657
npm install
```

### 2. Configure environment variables (optional for basic local dev)

The app runs out of the box with zero environment configuration using Local Atomic JSON storage in `./data/`. If you want to customize ports, PostgreSQL, or analytics IDs, copy `.env.example` to `.env`:

- **macOS / Linux (bash/zsh):**
  ```bash
  cp .env.example .env
  ```
- **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```

> **Note:** `.env` and `data/` are gitignored so local secrets and test users are never committed. Vite automatically reads `VITE_*` variables from `.env`; for Node backend variables in `.env`, pass them via your shell environment or run Node with `--env-file=.env` (see [Production / Custom Backend](#self-hosted-node-server-vps--cloud-vm)).

### 3. Start the development servers

```bash
npm run dev
```

This runs `server/dev.js`, which starts both servers together:
- **Frontend (Vite):** `http://localhost:5173`
- **CMS Backend API:** `http://localhost:4050` (Vite proxies `/api/*`, `/uploads/*`, `/sitemap.xml`, and `/robots.txt` automatically to port `4050`)

### 4. Complete First-Time Super Admin Setup

There are **no hardcoded default passwords** (`admin/admin` is disabled).

1. Open **`http://localhost:5173/#/studio`** (or **`http://localhost:5173/admin`**).
2. Because the fresh database has zero users, Studio automatically displays the **Create Super Admin Account** setup wizard.
3. Choose your username (minimum 3 characters) and master password (minimum 8 characters), optionally add your display name and email, and submit.
4. You will be signed in immediately as `super_admin` and can invite teammates under **Team & RBAC**.

---

## Storage & Database Configuration

The storage factory (`server/db/index.js`) automatically selects the database engine based on `DATABASE_URL`:

### Option A — Local Atomic JSON Store (Default when `DATABASE_URL` is unset)

Leave `DATABASE_URL` blank for effortless single-machine setup. All CMS documents, revisions, schedules, users, media files, pages, redirects, leads, webhooks, and audit logs are written atomically to `./data/` (or `CMS_DATA_DIR` if set).

### Option B — PostgreSQL (Recommended for Staging / Production)

When `DATABASE_URL` is set, the server connects to PostgreSQL via `pg` Pool, automatically applies schema migrations (`server/db/migrations.js`) on startup, creates all 11 relational tables, and persists uploaded media binaries as `BYTEA` inside PostgreSQL (so uploads survive ephemeral container restarts).

Example connection string:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/talentpool365
```

**SSL behavior (`server/db/postgresStore.js`):**
- Connections to `localhost` or `127.0.0.1` disable SSL automatically.
- Remote host URLs connect over SSL (`rejectUnauthorized: false`) by default. Set `PGSSLMODE=disable` only if connecting to a private/internal Postgres instance without TLS.

**Setting up local PostgreSQL (example):**
```sql
CREATE DATABASE talentpool365;
```
Export `DATABASE_URL` in your terminal before running `npm run dev` or `npm start`:
- **PowerShell:** `$env:DATABASE_URL="postgresql://postgres:password@localhost:5432/talentpool365"; npm run dev`
- **macOS/Linux:** `DATABASE_URL="postgresql://postgres:password@localhost:5432/talentpool365" npm run dev`

---

## Environment Variables Reference

| Variable | Side | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Backend | *(empty → Local JSON)* | PostgreSQL connection URI. Enables persistent SQL storage + `BYTEA` media storage. |
| `PGSSLMODE` | Backend | *(auto)* | Set to `disable` to turn off TLS on non-localhost Postgres connections. |
| `PORT` | Backend | `4050` | HTTP port for the Node server (`server/index.js`). |
| `CMS_DATA_DIR` | Backend | `./data` | Custom directory path for Local JSON storage & local uploads. |
| `CMS_JWT_SECRET` | Backend | *(auto-generated & persisted in DB)* | Secret key used to sign admin session JWTs. Strongly recommended to set explicitly in production. |
| `SITE_URL` | Backend | `https://talent-tool3657.onrender.com` | Canonical public URL used in `/sitemap.xml`, `/robots.txt`, Open Graph tags, and SSR links. |
| `VITE_CMS_API_URL` | Frontend | *(empty → same-origin)* | Base URL of the CMS API if frontend and backend are hosted on different origins. |
| `VITE_GA4_ID` | Frontend | *(empty)* | Fallback Google Analytics 4 ID (`G-XXXXXXXXXX`); can be overridden in Studio SEO settings. |
| `VITE_GTM_ID` | Frontend | *(empty)* | Fallback Google Tag Manager ID (`GTM-XXXXXXX`). |
| `VITE_META_PIXEL_ID` | Frontend | *(empty)* | Fallback Meta Pixel ID. |
| `VITE_LINKEDIN_PARTNER_ID` | Frontend | *(empty)* | Fallback LinkedIn Insight Tag ID. |
| `VITE_HOTJAR_ID` | Frontend | *(empty)* | Fallback Hotjar Site ID. |

---

## Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts both the CMS backend (`:4050`) and Vite dev frontend (`:5173`) in one terminal. |
| `npm run dev:api` | Runs only the Node.js CMS backend (`server/index.js`). |
| `npm run dev:web` | Runs only the Vite React dev server. |
| `npm run typecheck` | Runs TypeScript strict check (`tsc --noEmit`). |
| `npm run test:cms` | Runs the automated CMS backend test suite (`node --test server/tests/cms-api.test.mjs`). |
| `npm run build` | Type-checks and builds the optimized frontend bundle into `dist/`. |
| `npm start` | Starts the unified production server (`node server/index.js`), serving `dist/` + API + SSR meta injection. |
| `npm run preview` | Previews the static `dist/` Vite build without running the CMS API backend. |

---

## Using & Configuring the CMS Studio

### Access URLs
- **Public Website:** `http://localhost:5173/`
- **CMS Studio:** `http://localhost:5173/#/studio` or `http://localhost:5173/admin`

### Role-Based Access Control (RBAC)

Super Admins can add and manage team accounts in **Administration → Team & RBAC**:

| Role | Capabilities |
|---|---|
| `super_admin` | Full control: content editing, publishing, rollbacks, scheduling, pages, media, leads, SEO/plugins, redirects, user management, webhooks, and audit logs. |
| `editor` | Edit content, manage Page Builder pages, upload media, manage leads, configure SEO/redirects, schedule, publish live, roll back, and view audit logs. Cannot manage users or webhooks. |
| `seo_manager` | Read content/pages, manage per-page SEO meta tags, configure analytics/tracking plugins, edit scripts/robots, and manage 301/302 redirects. |
| `reviewer` | Read-only access to inspect content and preview drafts without publishing or editing live settings. |

### Publishing Workflow
1. Edit copy in **Homepage**, **Inner Pages & Blog**, **Pricing & Plans**, **Header & Footer**, or **SEO, Plugins & Redirects**. Edits save automatically to the **draft** document.
2. Click **👁️ Split Preview** in the top bar to inspect unpublished draft changes live across Desktop (`100%`), Tablet (`768px`), and Mobile (`390px`) viewports.
3. Click **🚀 Publish Live** to snapshot an immutable revision and push changes to public visitors, or click **⏰ Schedule** to deploy automatically at a chosen timestamp, or **Discard Draft** to revert draft edits.

### SEO, Plugins & Webhooks
- **SEO & Tracking (`Growth & SEO → SEO, Plugins & Redirects`)**: Configure per-page meta title/description/OG image/canonical/Schema type/`noindex`, connect GA4/GTM/Meta/LinkedIn/Hotjar/live chat without code edits, add HTTP `301`/`302` redirects, and inspect `/sitemap.xml` and `/robots.txt`. (Note: third-party analytics respect the visitor's cookie consent choices via `src/lib/analytics.ts`.)
- **Webhooks (`Administration → Outbound Webhooks`)**: Register webhook URLs for `content.published`, `lead.created`, or `*`. Requests include `X-TP365-Signature: sha256=<hmac>` when a secret is set, and can be verified immediately with **Send Test Ping**.

---

## Production Deployment

### Option 1: Render Blueprint (`render.yaml`)

`render.yaml` provisions both a managed PostgreSQL database (`talentpool365-cms-db`) and a unified Node web service (`talent-tool3657`):

1. Push the repository to GitHub/GitLab.
2. In Render, choose **New → Blueprint** and connect your repository.
3. Render creates `talentpool365-cms-db`, links `DATABASE_URL`, auto-generates `CMS_JWT_SECRET`, runs `npm install && npm run build`, and starts `npm start`.
4. Update `SITE_URL` in Render's Environment tab to match your custom domain (e.g., `https://yourdomain.com`).
5. Visit `https://yourdomain.com/#/studio` once after deployment to create your initial `super_admin` account.

### Option 2: Self-Hosted Node Server (VPS / Docker / Cloud VM)

1. Install Node.js `>= 22.12.0` and PostgreSQL (or keep Local JSON).
2. Clone and build:
   ```bash
   npm ci
   npm run build
   ```
3. Set environment variables (`NODE_ENV=production`, `PORT=4050`, `SITE_URL=https://yourdomain.com`, `CMS_JWT_SECRET=<random-hex>`, and optional `DATABASE_URL`).
   - If storing variables in a `.env` file, run:
     ```bash
     node --env-file=.env server/index.js
     ```
   - Or if variables are already exported in the environment/process manager (`systemd`, `pm2`, Docker):
     ```bash
     npm start
     ```
4. Place a reverse proxy (Nginx, Caddy, Cloudflare) in front of `PORT` to terminate HTTPS and forward requests to Node.

---

## Project Architecture

```text
server/
  index.js              # Unified HTTP API, /uploads binary serving, sitemap/robots, 301s, SSR meta injection
  dev.js                # Local dev runner (Node API :4050 + Vite :5173)
  auth/rbac.js          # Scrypt hashing, HMAC JWT tokens, login rate limiter, role matrix
  db/
    index.js            # Selects PostgreSQL or Local JSON storage automatically
    migrations.js       # 11-table PostgreSQL DDL schema
    postgresStore.js    # PostgreSQL repository (incl. FOR UPDATE SKIP LOCKED schedules)
    jsonStore.js        # Local atomic JSON repository + legacy data migration
  services/webhooks.js  # Non-blocking HMAC-SHA256 webhook dispatcher & test ping
  tests/cms-api.test.mjs# Automated end-to-end backend test suite
src/
  cms/
    api.ts              # Typed REST client for auth, drafts, revisions, media, pages, leads, webhooks
    CmsProvider.tsx     # Live/draft state, postMessage preview sync, section updaters & hooks
    permissions.ts      # Role metadata and permission checks
    siteDefaults.ts     # Default structured content and TypeScript models
  components/cms/       # Studio shell, editors, Page Builder, Rich Text, Media, SEO, RBAC, Leads, Webhooks
  pages/                # 29 built-in routes + DynamicCmsPage, BlogPostDetailPage, SanityStudioPage
  lib/analytics.ts      # Cookie-consent-gated GA4/GTM/Pixel/Hotjar & custom script loader
content/                # Seed JSON defaults imported into siteDefaults.ts
public/assets/          # Built-in images, videos, favicons, and logos
```

---

## Troubleshooting

- **Node version errors (`node --test` or syntax issues):** Verify `node -v` prints `v22.12.0` or higher.
- **Port `4050` or `5173` already in use:** Stop any previous `node server/dev.js` process or override the backend port with `PORT=4051` (note: update `vite.config.ts` proxy target if running Vite dev on a non-4050 backend port).
- **Want to reset the local Super Admin & re-run the Setup Wizard:** Stop the dev server, delete `./data/` (e.g., `rm -rf data` or `Remove-Item -Recurse -Force data` in PowerShell), and restart `npm run dev`.
- **PostgreSQL SSL error on a local or non-TLS private database:** Ensure `DATABASE_URL` points to `localhost`/`127.0.0.1` or set `PGSSLMODE=disable`.
