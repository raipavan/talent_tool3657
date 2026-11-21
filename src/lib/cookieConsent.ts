export type CookieCategory = 'necessary' | 'analytics' | 'marketing';

export interface CookieConsent {
  status: 'accepted' | 'rejected' | 'custom';
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

const STORAGE_KEY = 'tp365_cookie_consent_v1';
export const CONSENT_EVENT = 'tp365:cookie-consent';
export const OPEN_SETTINGS_EVENT = 'tp365:open-cookie-settings';

export function getCookieConsent(): CookieConsent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (!parsed || typeof parsed.status !== 'string') return null;
    return {
      status:
        parsed.status === 'accepted' || parsed.status === 'rejected' || parsed.status === 'custom'
          ? parsed.status
          : 'rejected',
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveCookieConsent(
  status: CookieConsent['status'],
  prefs: { analytics: boolean; marketing: boolean },
): CookieConsent {
  const consent: CookieConsent = {
    status,
    necessary: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Storage unavailable (e.g. private mode); still notify listeners in-memory.
  }
  window.dispatchEvent(new CustomEvent<CookieConsent>(CONSENT_EVENT, { detail: consent }));
  return consent;
}

export function hasCookieConsent(category: CookieCategory): boolean {
  if (category === 'necessary') return true;
  const consent = getCookieConsent();
  if (!consent) return false;
  return Boolean(consent[category]);
}

export function openCookieSettings(): void {
  window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT));
}
