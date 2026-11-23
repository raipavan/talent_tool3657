import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { JsonCmsStore } from '../db/jsonStore.js';
import { createCmsServer } from '../index.js';

describe('TalentPool365 Enterprise CMS API', () => {
  let tmpDir;
  let store;
  let cmsServer;
  let baseUrl;

  let webhookServer;
  let webhookUrl;
  const webhookDeliveries = [];

  let superAdminToken;
  let editorToken;
  let seoToken;
  let reviewerToken;

  let firstRevisionId;
  let createdPageId;
  let createdMediaId;
  let createdMediaFilename;
  let createdRedirectId;
  let createdLeadId;
  let createdWebhookId;

  async function api(pathname, { method = 'GET', token = '', body = undefined, redirect = 'follow' } = {}) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const res = await fetch(`${baseUrl}${pathname}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      redirect,
    });
    const contentType = res.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else if (contentType.startsWith('text/') || contentType.includes('xml')) {
      data = await res.text();
    } else {
      data = Buffer.from(await res.arrayBuffer());
    }
    return { status: res.status, headers: res.headers, data };
  }

  before(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tp365-cms-test-'));
    store = new JsonCmsStore(tmpDir);
    await store.init();

    cmsServer = createCmsServer(store);
    await new Promise((resolve) => {
      cmsServer.listen(0, '127.0.0.1', () => {
        const addr = cmsServer.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });

    webhookServer = http.createServer((req, res) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        webhookDeliveries.push({
          headers: req.headers,
          rawBody: raw,
          json: JSON.parse(raw || '{}'),
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: true }));
      });
    });

    await new Promise((resolve) => {
      webhookServer.listen(0, '127.0.0.1', () => {
        const addr = webhookServer.address();
        webhookUrl = `http://127.0.0.1:${addr.port}/hook`;
        resolve();
      });
    });
  });

  after(async () => {
    if (cmsServer) await new Promise((r) => cmsServer.close(r));
    if (webhookServer) await new Promise((r) => webhookServer.close(r));
    if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('1. First-time setup & authentication (no default passwords)', async () => {
    const status0 = await api('/api/auth/setup-status');
    assert.equal(status0.status, 200);
    assert.equal(status0.data.needsSetup, true);

    const setupRes = await api('/api/auth/setup', {
      method: 'POST',
      body: {
        username: 'founder_admin',
        password: 'StrongPass#2026!',
        email: 'founder@talentpool365.com',
        displayName: 'Founder Admin',
      },
    });
    assert.equal(setupRes.status, 201);
    assert.equal(setupRes.data.ok, true);
    assert.ok(setupRes.data.token);
    superAdminToken = setupRes.data.token;

    // Setup cannot run twice
    const secondSetup = await api('/api/auth/setup', {
      method: 'POST',
      body: { username: 'hacker', password: 'Password123' },
    });
    assert.equal(secondSetup.status, 400);

    const status1 = await api('/api/auth/setup-status');
    assert.equal(status1.data.needsSetup, false);

    // Bad login rejected
    const badLogin = await api('/api/auth/login', {
      method: 'POST',
      body: { username: 'founder_admin', password: 'wrong-password' },
    });
    assert.equal(badLogin.status, 401);

    // Valid login succeeds
    const goodLogin = await api('/api/auth/login', {
      method: 'POST',
      body: { username: 'founder_admin', password: 'StrongPass#2026!' },
    });
    assert.equal(goodLogin.status, 200);
    assert.equal(goodLogin.data.role, 'super_admin');

    // /api/auth/me omits passwordHash
    const meRes = await api('/api/auth/me', { token: superAdminToken });
    assert.equal(meRes.status, 200);
    assert.equal(meRes.data.user.username, 'founder_admin');
    assert.equal(meRes.data.user.passwordHash, undefined);
  });

  it('2. Multi-user RBAC creation & permission enforcement', async () => {
    const createUser = async (username, role) => {
      const res = await api('/api/cms/users', {
        method: 'POST',
        token: superAdminToken,
        body: { username, password: 'UserPass#2026', role, displayName: username },
      });
      assert.equal(res.status, 201);
      const login = await api('/api/auth/login', {
        method: 'POST',
        body: { username, password: 'UserPass#2026' },
      });
      assert.equal(login.status, 200);
      return login.data.token;
    };

    editorToken = await createUser('alice_editor', 'editor');
    seoToken = await createUser('bob_seo', 'seo_manager');
    reviewerToken = await createUser('carol_reviewer', 'reviewer');

    // Reviewer cannot edit draft or publish
    const revEdit = await api('/api/cms/draft/section/home', {
      method: 'PATCH',
      token: reviewerToken,
      body: { value: { headline: 'Unauthorized' } },
    });
    assert.equal(revEdit.status, 403);

    const revPub = await api('/api/cms/publish', { method: 'POST', token: reviewerToken, body: {} });
    assert.equal(revPub.status, 403);

    // SEO Manager can update pageSeo and create redirects, but cannot publish or manage users
    const seoPatch = await api('/api/cms/draft/section/pageSeo', {
      method: 'PATCH',
      token: seoToken,
      body: { value: { '/pricing': { metaTitle: 'SEO Pricing' }, '/hidden-page': { noIndex: true } } },
    });
    assert.equal(seoPatch.status, 200);

    const seoPub = await api('/api/cms/publish', { method: 'POST', token: seoToken, body: {} });
    assert.equal(seoPub.status, 403);

    const seoUsers = await api('/api/cms/users', { token: seoToken });
    assert.equal(seoUsers.status, 403);

    // Editor cannot manage users
    const editorUsers = await api('/api/cms/users', { token: editorToken });
    assert.equal(editorUsers.status, 403);
  });

  it('3. Draft / Publish / Revisions / Rollback / Discard workflow', async () => {
    // Editor patches home section in draft
    const patch1 = await api('/api/cms/draft/section/home', {
      method: 'PATCH',
      token: editorToken,
      body: { value: { hero: { headlinePrefix: 'DraftHeadlineV1' } } },
    });
    assert.equal(patch1.status, 200);

    // Public live content should NOT show DraftHeadlineV1 yet
    const publicBefore = await api('/api/cms/content');
    assert.equal(publicBefore.status, 200);
    assert.notEqual(publicBefore.data.content?.home?.hero?.headlinePrefix, 'DraftHeadlineV1');

    // Draft endpoint DOES show DraftHeadlineV1
    const draftRes = await api('/api/cms/content?env=draft', { token: editorToken });
    assert.equal(draftRes.data.content.home.hero.headlinePrefix, 'DraftHeadlineV1');

    // Publish live -> creates revision 1
    const pub1 = await api('/api/cms/publish', {
      method: 'POST',
      token: editorToken,
      body: { label: 'Release v1', note: 'First live hero' },
    });
    assert.equal(pub1.status, 200);
    firstRevisionId = pub1.data.revision.id;

    const publicAfter = await api('/api/cms/content');
    assert.equal(publicAfter.data.content.home.hero.headlinePrefix, 'DraftHeadlineV1');

    // Make a second draft edit, then discard
    await api('/api/cms/draft/section/home', {
      method: 'PATCH',
      token: editorToken,
      body: { value: { hero: { headlinePrefix: 'MistakeDraft' } } },
    });
    const discardRes = await api('/api/cms/draft/discard', { method: 'POST', token: editorToken });
    assert.equal(discardRes.status, 200);

    const draftAfterDiscard = await api('/api/cms/content?env=draft', { token: editorToken });
    assert.equal(draftAfterDiscard.data.content.home.hero.headlinePrefix, 'DraftHeadlineV1');

    // Make & publish a second revision, then rollback live to v1
    await api('/api/cms/draft/section/home', {
      method: 'PATCH',
      token: editorToken,
      body: { value: { hero: { headlinePrefix: 'LiveHeadlineV2' } } },
    });
    await api('/api/cms/publish', {
      method: 'POST',
      token: editorToken,
      body: { label: 'Release v2' },
    });

    const rb = await api(`/api/cms/revisions/${firstRevisionId}/rollback`, {
      method: 'POST',
      token: editorToken,
      body: { targetEnv: 'live' },
    });
    assert.equal(rb.status, 200);

    const publicRolledBack = await api('/api/cms/content');
    assert.equal(publicRolledBack.data.content.home.hero.headlinePrefix, 'DraftHeadlineV1');
  });

  it('4. Scheduled releases publish automatically when due', async () => {
    await api('/api/cms/draft/section/home', {
      method: 'PATCH',
      token: editorToken,
      body: { value: { hero: { headlinePrefix: 'ScheduledReleaseHero' } } },
    });

    const pastIso = new Date(Date.now() - 60_000).toISOString();
    const schedRes = await api('/api/cms/schedules', {
      method: 'POST',
      token: editorToken,
      body: { title: 'Auto Campaign Launch', publishAt: pastIso, note: 'Test schedule' },
    });
    assert.equal(schedRes.status, 201);
    assert.equal(schedRes.data.schedule.status, 'pending');

    const executed = await store.processDueSchedules();
    assert.equal(executed.length, 1);

    const publicAfterSched = await api('/api/cms/content');
    assert.equal(publicAfterSched.data.content.home.hero.headlinePrefix, 'ScheduledReleaseHero');
  });

  it('5. Dynamic Custom Pages (Page Builder) CRUD & visibility', async () => {
    const pubPage = await api('/api/cms/pages', {
      method: 'POST',
      token: editorToken,
      body: {
        title: 'AI Promo Landing',
        slug: '/promo-test',
        status: 'published',
        blocks: [{ id: 'b1', type: 'hero', title: 'Promo Title' }],
      },
    });
    assert.equal(pubPage.status, 201);
    createdPageId = pubPage.data.page.id;

    const draftPage = await api('/api/cms/pages', {
      method: 'POST',
      token: editorToken,
      body: { title: 'Hidden Draft Page', slug: '/secret-draft', status: 'draft', blocks: [] },
    });
    assert.equal(draftPage.status, 201);

    // Public live fetch includes /promo-test and excludes /secret-draft
    const liveContent = await api('/api/cms/content');
    const slugs = liveContent.data.customPages.map((p) => p.slug);
    assert.ok(slugs.includes('/promo-test'));
    assert.ok(!slugs.includes('/secret-draft'));

    // Update page title
    const upd = await api(`/api/cms/pages/${createdPageId}`, {
      method: 'PUT',
      token: editorToken,
      body: { title: 'Updated Promo Landing', slug: '/promo-test', status: 'published' },
    });
    assert.equal(upd.status, 200);
    assert.equal(upd.data.page.title, 'Updated Promo Landing');

    // Clean up draft page so sitemap test still checks /promo-test
    const delDraft = await api(`/api/cms/pages/${draftPage.data.page.id}`, {
      method: 'DELETE',
      token: editorToken,
    });
    assert.equal(delDraft.status, 200);
  });

  it('6. Media Library upload, binary serving, metadata update & delete', async () => {
    // 1x1 transparent PNG base64
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const uploadRes = await api('/api/cms/media/upload', {
      method: 'POST',
      token: editorToken,
      body: {
        filename: 'pixel-test.png',
        dataUrl: `data:image/png;base64,${pngBase64}`,
        altText: 'Tiny pixel',
        folder: 'blog',
      },
    });
    assert.equal(uploadRes.status, 200);
    assert.equal(uploadRes.data.ok, true);
    createdMediaId = uploadRes.data.media.id;
    createdMediaFilename = uploadRes.data.media.filename;

    // Fetch served binary
    const binRes = await api(`/uploads/${createdMediaFilename}`);
    assert.equal(binRes.status, 200);
    assert.equal(binRes.headers.get('content-type'), 'image/png');
    assert.deepEqual(binRes.data, Buffer.from(pngBase64, 'base64'));

    // Update alt text
    const patchRes = await api(`/api/cms/media/${createdMediaId}`, {
      method: 'PATCH',
      token: editorToken,
      body: { altText: 'Updated Alt Text' },
    });
    assert.equal(patchRes.status, 200);
    assert.equal(patchRes.data.media.altText, 'Updated Alt Text');

    // Delete asset
    const delRes = await api(`/api/cms/media/${createdMediaId}`, {
      method: 'DELETE',
      token: editorToken,
    });
    assert.equal(delRes.status, 200);
  });

  it('7. Server-side 301/302 Redirects resolution', async () => {
    const createRes = await api('/api/cms/redirects', {
      method: 'POST',
      token: seoToken,
      body: { sourcePath: '/legacy-url', targetUrl: '/pricing', statusCode: 301, isActive: true },
    });
    assert.equal(createRes.status, 201);
    createdRedirectId = createRes.data.redirect.id;

    const hitRes = await api('/legacy-url', { redirect: 'manual' });
    assert.equal(hitRes.status, 301);
    assert.equal(hitRes.headers.get('location'), '/pricing');

    const delRes = await api(`/api/cms/redirects/${createdRedirectId}`, {
      method: 'DELETE',
      token: seoToken,
    });
    assert.equal(delRes.status, 200);
  });

  it('8. Leads Inbox submission, honeypot spam protection, status update & CSV export', async () => {
    const leadRes = await api('/api/leads', {
      method: 'POST',
      body: {
        formType: 'demo_request',
        sourcePath: '/get-started',
        subject: 'Enterprise Demo',
        name: 'Jane Recruiter',
        email: 'jane@acme.example',
        company: 'Acme Recruiting',
        message: 'Interested in 50 roles/yr.',
      },
    });
    assert.equal(leadRes.status, 201);
    createdLeadId = leadRes.data.leadId;

    // Honeypot ignored quietly
    const spamRes = await api('/api/leads', {
      method: 'POST',
      body: { email: 'bot@spam.example', _gotcha: 'filled-by-bot' },
    });
    assert.equal(spamRes.status, 200);

    const listRes = await api('/api/cms/leads', { token: editorToken });
    assert.equal(listRes.status, 200);
    assert.equal(listRes.data.leads.length, 1);
    assert.equal(listRes.data.leads[0].email, 'jane@acme.example');

    const updRes = await api(`/api/cms/leads/${createdLeadId}`, {
      method: 'PATCH',
      token: editorToken,
      body: { status: 'qualified', notes: 'Booked call' },
    });
    assert.equal(updRes.status, 200);
    assert.equal(updRes.data.lead.status, 'qualified');

    // CSV export using query token
    const csvRes = await api(`/api/cms/leads/export.csv?token=${encodeURIComponent(editorToken)}`);
    assert.equal(csvRes.status, 200);
    assert.ok(csvRes.headers.get('content-type').includes('text/csv'));
    assert.ok(csvRes.data.includes('jane@acme.example'));
  });

  it('9. Outbound Webhooks + HMAC-SHA256 verification', async () => {
    const hookSecret = 'super-webhook-secret-42';
    const hookRes = await api('/api/cms/webhooks', {
      method: 'POST',
      token: superAdminToken,
      body: {
        name: 'Test Receiver',
        url: webhookUrl,
        events: ['content.published', 'lead.created'],
        secret: hookSecret,
        isActive: true,
      },
    });
    assert.equal(hookRes.status, 201);
    createdWebhookId = hookRes.data.webhook.id;

    const testRes = await api(`/api/cms/webhooks/${createdWebhookId}/test`, {
      method: 'POST',
      token: superAdminToken,
    });
    assert.equal(testRes.status, 200);
    assert.equal(testRes.data.ok, true);
    assert.equal(testRes.data.status, 200);

    assert.equal(webhookDeliveries.length, 1);
    const delivery = webhookDeliveries[0];
    assert.equal(delivery.json.event, 'test.ping');

    const expectedSig =
      'sha256=' + crypto.createHmac('sha256', hookSecret).update(delivery.rawBody).digest('hex');
    assert.equal(delivery.headers['x-tp365-signature'], expectedSig);
  });

  it('10. Dynamic Sitemap XML, Robots.txt & Audit Trail', async () => {
    const robotsRes = await api('/robots.txt');
    assert.equal(robotsRes.status, 200);
    assert.ok(robotsRes.data.includes('Disallow: /admin'));
    assert.ok(robotsRes.data.includes('Sitemap:'));

    const sitemapRes = await api('/sitemap.xml');
    assert.equal(sitemapRes.status, 200);
    assert.ok(sitemapRes.data.includes('/pricing'));
    assert.ok(sitemapRes.data.includes('/products/talent-sourcing'));
    assert.ok(sitemapRes.data.includes('/promo-test'));
    assert.ok(!sitemapRes.data.includes('/products/ai-sourcing')); // old mismatched slug removed

    const auditRes = await api('/api/cms/audit-logs', { token: superAdminToken });
    assert.equal(auditRes.status, 200);
    const actions = auditRes.data.logs.map((l) => l.action);
    assert.ok(actions.includes('user.setup'));
    assert.ok(actions.includes('content.publish'));
    assert.ok(actions.includes('media.upload'));
  });
});
