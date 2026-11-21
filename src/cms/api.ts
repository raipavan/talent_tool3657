/* Client for the self-hosted TalentPool365 CMS Backend API (Zero Sanity). */

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
  return ''; // Same-origin (/api/* via Vite proxy in dev or Node server in production)
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
  updatedAt?: string | null;
  hasCustomContent?: boolean;
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

export async function fetchCmsContent(): Promise<{ content: Record<string, unknown>; updatedAt: string | null } | null> {
  try {
    const res = await fetch(apiUrl('/api/cms/content'), { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data === 'object' && data.content) {
      return { content: data.content as Record<string, unknown>, updatedAt: data.updatedAt ?? null };
    }
    return null;
  } catch {
    return null;
  }
}

export async function loginCmsBackend(
  username: string,
  password: string,
): Promise<{ ok: boolean; token?: string; username?: string; error?: string; offline?: boolean }> {
  try {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || 'Invalid credentials' };
    return { ok: true, token: data.token, username: data.username };
  } catch {
    return { ok: false, offline: true, error: 'Backend API unreachable' };
  }
}

export async function changeCmsPasswordBackend(
  currentPassword: string,
  newPassword: string,
  newUsername?: string,
): Promise<{ ok: boolean; token?: string; username?: string; error?: string; offline?: boolean }> {
  try {
    const res = await fetch(apiUrl('/api/auth/change-password'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, newPassword, newUsername }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || 'Failed to change password' };
    return { ok: true, token: data.token, username: data.username };
  } catch {
    return { ok: false, offline: true, error: 'Backend API unreachable' };
  }
}

export async function saveCmsContentBackend(
  content: unknown,
): Promise<{ ok: boolean; updatedAt?: string; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/cms/content'), {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true, updatedAt: data.updatedAt };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Backend unreachable' };
  }
}

export async function saveCmsSectionBackend(
  sectionKey: string,
  value: unknown,
): Promise<{ ok: boolean; updatedAt?: string; error?: string }> {
  try {
    const res = await fetch(apiUrl(`/api/cms/section/${encodeURIComponent(sectionKey)}`), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ value }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true, updatedAt: data.updatedAt };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Backend unreachable' };
  }
}

export async function resetCmsBackend(section?: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/cms/reset'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(section ? { section } : {}),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Backend unreachable' };
  }
}

export async function uploadCmsImage(
  filename: string,
  dataUrl: string,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/cms/upload'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ filename, dataUrl }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true, url: data.url };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }
}
