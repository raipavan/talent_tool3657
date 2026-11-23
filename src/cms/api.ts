/* Client for TalentPool365 Enterprise CMS API */

import type { CustomPageModel, RedirectModel } from './siteDefaults';
import type { CmsUser, CmsRole } from './permissions';

export type { CustomPageModel, RedirectModel } from './siteDefaults';
export type { CmsUser, CmsRole } from './permissions';

const STORAGE_KEY_API_URL = 'tp365_cms_api_url';
const STORAGE_KEY_TOKEN = 'tp365_cms_auth_token';

export function getCmsApiBaseUrl(): string {
  try {
    const custom = localStorage.getItem(STORAGE_KEY_API_URL);
    if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');
  } catch {
    // ignore
  }
  const envUrl = import.meta.env.VITE_CMS_API_URL as string | undefined;
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/+$/, '');
  return ''; // Same-origin (/api/*)
}

export function setCmsApiBaseUrl(url: string): void {
  try {
    const cleaned = url.trim().replace(/\/+$/, '');
    if (cleaned) {
      localStorage.setItem(STORAGE_KEY_API_URL, cleaned);
    } else {
      localStorage.removeItem(STORAGE_KEY_API_URL);
    }
  } catch {
    // ignore
  }
}

export function getAuthToken(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_TOKEN) || sessionStorage.getItem(STORAGE_KEY_TOKEN) || '';
  } catch {
    return '';
  }
}

export function setAuthToken(token: string, persist = true): void {
  try {
    if (!token) {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
      return;
    }
    if (persist) {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    } else {
      sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
    }
  } catch {
    // ignore
  }
}

function apiUrl(endpoint: string): string {
  return `${getCmsApiBaseUrl()}${endpoint}`;
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export interface BackendHealth {
  ok: boolean;
  service?: string;
  storageMode?: 'postgresql' | 'local-json';
  updatedAt?: string | null;
  liveVersion?: number;
  draftVersion?: number;
  hasDraftChanges?: boolean;
  pendingSchedulesCount?: number;
}

export async function checkCmsHealth(): Promise<BackendHealth> {
  try {
    const res = await fetch(apiUrl('/api/cms/health'), { cache: 'no-store' });
    if (!res.ok) return { ok: false };
    return (await res.json()) as BackendHealth;
  } catch {
    return { ok: false };
  }
}

export async function checkSetupStatus(): Promise<{ needsSetup: boolean; storageMode?: string }> {
  try {
    const res = await fetch(apiUrl('/api/auth/setup-status'), { cache: 'no-store' });
    if (!res.ok) return { needsSetup: false };
    return await res.json();
  } catch {
    return { needsSetup: false };
  }
}

export async function setupInitialAdmin(data: {
  username: string;
  password: string;
  email?: string;
  displayName?: string;
}): Promise<{ ok: boolean; token?: string; user?: CmsUser; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/auth/setup'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { ok: false, error: result.error || 'Setup failed' };
    return { ok: true, token: result.token, user: result.user };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Server unreachable' };
  }
}

export async function loginCmsBackend(
  username: string,
  password: string,
): Promise<{
  ok: boolean;
  token?: string;
  username?: string;
  role?: CmsRole;
  displayName?: string;
  error?: string;
  offline?: boolean;
}> {
  try {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || 'Invalid credentials' };
    return {
      ok: true,
      token: data.token,
      username: data.username,
      role: data.role,
      displayName: data.displayName,
    };
  } catch {
    return { ok: false, offline: true, error: 'Backend API unreachable' };
  }
}

export async function fetchCurrentUser(): Promise<{ ok: boolean; user?: CmsUser; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/auth/me'), {
      headers: authHeaders(),
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    return { ok: true, user: data.user };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function changeCmsPasswordBackend(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/auth/change-password'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || 'Failed to change password' };
    return { ok: true, message: data.message };
  } catch {
    return { ok: false, error: 'Backend API unreachable' };
  }
}

// ---------------- Content & Draft Management ----------------

export async function fetchCmsContent(
  env: 'live' | 'draft' = 'live',
): Promise<{
  content: Record<string, unknown>;
  updatedAt: string | null;
  version?: number;
  redirects?: RedirectModel[];
  customPages?: CustomPageModel[];
} | null> {
  try {
    const query = env === 'draft' ? '?env=draft' : '';
    const res = await fetch(apiUrl(`/api/cms/content${query}`), {
      headers: env === 'draft' ? authHeaders() : undefined,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data === 'object' && data.content) {
      return {
        content: data.content as Record<string, unknown>,
        updatedAt: data.updatedAt ?? null,
        version: data.version,
        redirects: data.redirects || [],
        customPages: data.customPages || [],
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveCmsDraftBackend(
  content: unknown,
): Promise<{ ok: boolean; version?: number; updatedAt?: string; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/cms/draft'), {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true, version: data.version, updatedAt: data.updatedAt };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Backend unreachable' };
  }
}

export async function patchCmsDraftSectionBackend(
  sectionKey: string,
  value: unknown,
): Promise<{ ok: boolean; version?: number; updatedAt?: string; error?: string }> {
  try {
    const res = await fetch(apiUrl(`/api/cms/draft/section/${encodeURIComponent(sectionKey)}`), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ value }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true, version: data.version, updatedAt: data.updatedAt };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Backend unreachable' };
  }
}

export async function publishCmsDraft(
  label?: string,
  note?: string,
): Promise<{ ok: boolean; liveDoc?: any; revision?: any; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/cms/publish'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ label, note }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || 'Failed to publish' };
    return { ok: true, liveDoc: data.liveDoc, revision: data.revision };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Backend unreachable' };
  }
}

export async function discardCmsDraft(): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/cms/draft/discard'), {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || 'Failed to discard draft' };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Backend unreachable' };
  }
}

// ---------------- Revisions & Rollback ----------------

export interface RevisionItem {
  id: string;
  versionNum: number;
  label: string;
  note: string;
  authorUsername: string;
  createdAt: string;
  content?: Record<string, unknown>;
}

export async function listRevisions(): Promise<RevisionItem[]> {
  try {
    const res = await fetch(apiUrl('/api/cms/revisions'), { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.revisions || [];
  } catch {
    return [];
  }
}

export async function getRevisionDetail(id: string): Promise<RevisionItem | null> {
  try {
    const res = await fetch(apiUrl(`/api/cms/revisions/${id}`), { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.revision || null;
  } catch {
    return null;
  }
}

export async function rollbackToRevision(
  id: string,
  targetEnv: 'live' | 'draft' = 'draft',
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(apiUrl(`/api/cms/revisions/${id}/rollback`), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ targetEnv }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || 'Rollback failed' };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Backend unreachable' };
  }
}

// ---------------- Scheduled Releases ----------------

export interface ScheduleItem {
  id: string;
  title: string;
  note: string;
  publishAt: string;
  status: 'pending' | 'published' | 'cancelled' | 'failed';
  createdBy: string;
  createdAt: string;
  executedAt?: string | null;
}

export async function listSchedules(): Promise<ScheduleItem[]> {
  try {
    const res = await fetch(apiUrl('/api/cms/schedules'), { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.schedules || [];
  } catch {
    return [];
  }
}

export async function createSchedule(
  title: string,
  publishAt: string,
  note = '',
): Promise<{ ok: boolean; schedule?: ScheduleItem; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/cms/schedules'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title, publishAt, note }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || 'Failed to schedule release' };
    return { ok: true, schedule: data.schedule };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Backend unreachable' };
  }
}

export async function cancelSchedule(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/cms/schedules/${id}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

// ---------------- Media Library ----------------

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string;
  folder?: string;
  tags?: string[];
  uploadedBy?: string;
  createdAt: string;
}

export async function listMediaAssets(search = '', folder = ''): Promise<MediaAsset[]> {
  try {
    const query = new URLSearchParams();
    if (search) query.set('q', search);
    if (folder) query.set('folder', folder);
    const res = await fetch(apiUrl(`/api/cms/media?${query.toString()}`), {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.media || [];
  } catch {
    return [];
  }
}

export async function uploadCmsMedia(
  filename: string,
  dataUrl: string,
  altText = '',
  folder = 'uploads',
): Promise<{ ok: boolean; url?: string; media?: MediaAsset; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/cms/media/upload'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ filename, dataUrl, altText, folder }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true, url: data.url, media: data.media };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }
}

export const uploadCmsImage = uploadCmsMedia;

export async function updateMediaAsset(
  id: string,
  patch: Partial<Pick<MediaAsset, 'altText' | 'folder' | 'tags'>>,
): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/cms/media/${id}`), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

export async function deleteMediaAsset(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/cms/media/${id}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

// ---------------- Custom Pages (Page Builder) ----------------

export async function listCustomPages(): Promise<CustomPageModel[]> {
  try {
    const res = await fetch(apiUrl('/api/cms/pages'), { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.pages || [];
  } catch {
    return [];
  }
}

export async function saveCustomPage(
  page: Partial<CustomPageModel>,
): Promise<{ ok: boolean; page?: CustomPageModel; error?: string }> {
  try {
    const isUpdate = Boolean(page.id);
    const endpoint = isUpdate ? `/api/cms/pages/${page.id}` : '/api/cms/pages';
    const res = await fetch(apiUrl(endpoint), {
      method: isUpdate ? 'PUT' : 'POST',
      headers: authHeaders(),
      body: JSON.stringify(page),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || 'Failed to save page' };
    return { ok: true, page: data.page };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function deleteCustomPage(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/cms/pages/${id}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

// ---------------- 301 / 302 Redirects ----------------

export async function listRedirects(): Promise<RedirectModel[]> {
  try {
    const res = await fetch(apiUrl('/api/cms/redirects'), { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.redirects || [];
  } catch {
    return [];
  }
}

export async function saveRedirect(
  redirect: Partial<RedirectModel>,
): Promise<{ ok: boolean; redirect?: RedirectModel; error?: string }> {
  try {
    const isUpdate = Boolean(redirect.id);
    const endpoint = isUpdate ? `/api/cms/redirects/${redirect.id}` : '/api/cms/redirects';
    const res = await fetch(apiUrl(endpoint), {
      method: isUpdate ? 'PATCH' : 'POST',
      headers: authHeaders(),
      body: JSON.stringify(redirect),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || 'Failed to save redirect' };
    return { ok: true, redirect: data.redirect };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function deleteRedirect(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/cms/redirects/${id}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

// ---------------- Leads Inbox ----------------

export interface LeadItem {
  id: string;
  formType: string;
  sourcePath: string;
  subject: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  payload: Record<string, unknown>;
  status: 'new' | 'contacted' | 'qualified' | 'archived';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export async function submitLead(data: Record<string, unknown>): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(apiUrl('/api/leads'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return { ok: res.ok, message: result.message };
  } catch {
    return { ok: false, message: 'Offline' };
  }
}

export async function listLeads(status = '', search = ''): Promise<LeadItem[]> {
  try {
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    if (search) query.set('q', search);
    const res = await fetch(apiUrl(`/api/cms/leads?${query.toString()}`), {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.leads || [];
  } catch {
    return [];
  }
}

export async function updateLeadStatus(
  id: string,
  patch: { status?: LeadItem['status']; notes?: string },
): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/cms/leads/${id}`), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

export async function deleteLead(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/cms/leads/${id}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

export function getLeadsCsvDownloadUrl(): string {
  const token = getAuthToken();
  return `${apiUrl('/api/cms/leads/export.csv')}?token=${encodeURIComponent(token)}`;
}

// ---------------- Team Users (RBAC) ----------------

export async function listTeamUsers(): Promise<CmsUser[]> {
  try {
    const res = await fetch(apiUrl('/api/cms/users'), { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.users || [];
  } catch {
    return [];
  }
}

export async function createTeamUser(data: {
  username: string;
  password: string;
  email?: string;
  displayName?: string;
  role: CmsRole;
}): Promise<{ ok: boolean; user?: CmsUser; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/cms/users'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    const resJson = await res.json();
    if (!res.ok) return { ok: false, error: resJson.error || 'Failed to create user' };
    return { ok: true, user: resJson.user };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function updateTeamUser(
  id: string,
  patch: { email?: string; displayName?: string; role?: CmsRole; isActive?: boolean; password?: string },
): Promise<{ ok: boolean; user?: CmsUser; error?: string }> {
  try {
    const res = await fetch(apiUrl(`/api/cms/users/${id}`), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(patch),
    });
    const resJson = await res.json();
    if (!res.ok) return { ok: false, error: resJson.error || 'Failed to update user' };
    return { ok: true, user: resJson.user };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function deleteTeamUser(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/cms/users/${id}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

// ---------------- Webhooks & Audit Logs ----------------

export interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  lastStatus?: number | null;
  lastTriggeredAt?: string | null;
  createdAt: string;
}

export async function listWebhooks(): Promise<WebhookItem[]> {
  try {
    const res = await fetch(apiUrl('/api/cms/webhooks'), { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.webhooks || [];
  } catch {
    return [];
  }
}

export async function saveWebhook(
  hook: Partial<WebhookItem>,
): Promise<{ ok: boolean; webhook?: WebhookItem; error?: string }> {
  try {
    const isUpdate = Boolean(hook.id);
    const endpoint = isUpdate ? `/api/cms/webhooks/${hook.id}` : '/api/cms/webhooks';
    const res = await fetch(apiUrl(endpoint), {
      method: isUpdate ? 'PATCH' : 'POST',
      headers: authHeaders(),
      body: JSON.stringify(hook),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || 'Failed to save webhook' };
    return { ok: true, webhook: data.webhook };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function deleteWebhook(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/cms/webhooks/${id}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

export async function testWebhook(id: string): Promise<{ ok: boolean; status?: number; message?: string }> {
  try {
    const res = await fetch(apiUrl(`/api/cms/webhooks/${id}/test`), {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    return { ok: Boolean(data.ok), status: data.status, message: data.message };
  } catch {
    return { ok: false, message: 'Network error' };
  }
}

export interface AuditLogEntry {
  id: string;
  actorUsername: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export async function listAuditLogs(action = '', actor = '', limit = 100): Promise<AuditLogEntry[]> {
  try {
    const query = new URLSearchParams();
    if (action) query.set('action', action);
    if (actor) query.set('actor', actor);
    query.set('limit', String(limit));
    const res = await fetch(apiUrl(`/api/cms/audit-logs?${query.toString()}`), {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  } catch {
    return [];
  }
}
