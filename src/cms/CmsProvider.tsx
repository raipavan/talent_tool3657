import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  defaultSiteContent,
  type SiteContentModel,
  type PricingContentModel,
  type PageContentOverride,
} from './siteDefaults';
import {
  checkCmsHealth,
  fetchCmsContent,
  saveCmsContentBackend,
  saveCmsSectionBackend,
  resetCmsBackend,
  getCmsApiBaseUrl,
  setCmsApiBaseUrl,
  getAuthToken,
} from './api';

export * from './siteDefaults';

const STORAGE_KEY_FULL = 'tp365_cms_site_v3';

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return Boolean(val && typeof val === 'object' && !Array.isArray(val));
}

/** Deep-merge saved partial overrides over defaults. Arrays replace cleanly. */
function deepMerge<T>(defaults: T, overrides: unknown): T {
  if (overrides === undefined || overrides === null) return defaults;
  if (Array.isArray(defaults)) {
    return (Array.isArray(overrides) ? overrides : defaults) as T;
  }
  if (isPlainObject(defaults) && isPlainObject(overrides)) {
    const out: Record<string, unknown> = { ...defaults };
    for (const key of Object.keys(overrides)) {
      const ov = overrides[key];
      if (ov === undefined) continue;
      if (key in defaults && isPlainObject(defaults[key]) && isPlainObject(ov)) {
        out[key] = deepMerge(defaults[key], ov);
      } else {
        out[key] = ov;
      }
    }
    return out as T;
  }
  return overrides as T;
}

export interface CmsContextType {
  site: SiteContentModel;
  // Backwards-compatible aliases
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  home: any;
  pricing: PricingContentModel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  pageOverrides: Record<string, PageContentOverride>;

  // Backend status
  isBackendLive: boolean;
  isSanityLive: boolean; // alias for compatibility
  sanityConfig: { projectId: string; dataset: string; apiVersion: string; token?: string };
  updateSanityConfig: (cfg: { projectId: string; dataset: string; apiVersion: string; token?: string }) => void;
  pushToSanity: () => Promise<{ success: boolean; message: string }>;
  lastSyncedAt: string | null;
  hasUnsavedChanges: boolean;
  cmsApiUrl: string;
  setBackendUrl: (url: string) => Promise<void>;
  refreshFromBackend: () => Promise<boolean>;

  // Section updaters
  updateSiteSection: <K extends keyof SiteContentModel>(section: K, value: SiteContentModel[K]) => void;
  updatePricing: (newPricing: PricingContentModel) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateHome: (newHome: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateNavigation: (newNav: any) => void;
  updatePageOverride: (pageKey: string, override: Partial<PageContentOverride>) => void;

  // Backend Publishing & Backup
  publishAllToBackend: () => Promise<{ success: boolean; message: string }>;
  resetSection: <K extends keyof SiteContentModel>(section: K) => Promise<void>;
  resetDefaults: () => Promise<void>;
  exportSiteJson: () => string;
  importSiteJson: (raw: string) => { success: boolean; message: string };
}

const noop = () => {};
const noopAsync = async () => {};

const CmsContext = createContext<CmsContextType>({
  site: defaultSiteContent,
  home: defaultSiteContent.home,
  pricing: defaultSiteContent.pricing,
  navigation: defaultSiteContent.navigation,
  pageOverrides: defaultSiteContent.pageOverrides,
  isBackendLive: false,
  isSanityLive: false,
  sanityConfig: { projectId: '', dataset: 'production', apiVersion: '2024-03-01', token: '' },
  updateSanityConfig: noop,
  pushToSanity: async () => ({ success: false, message: 'Not initialized' }),
  lastSyncedAt: null,
  hasUnsavedChanges: false,
  cmsApiUrl: '',
  setBackendUrl: noopAsync,
  refreshFromBackend: async () => false,
  updateSiteSection: noop,
  updatePricing: noop,
  updateHome: noop,
  updateNavigation: noop,
  updatePageOverride: noop,
  publishAllToBackend: async () => ({ success: false, message: 'Not initialized' }),
  resetSection: noopAsync,
  resetDefaults: noopAsync,
  exportSiteJson: () => JSON.stringify(defaultSiteContent, null, 2),
  importSiteJson: () => ({ success: false, message: 'Not initialized' }),
});

function loadLocalCache(): SiteContentModel {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FULL);
    if (saved) {
      return deepMerge(defaultSiteContent, JSON.parse(saved));
    }
    // Migrate legacy v1 localStorage keys if present
    const legacyHome = localStorage.getItem('tp365_cms_home');
    const legacyNav = localStorage.getItem('tp365_cms_nav');
    const legacyPricing = localStorage.getItem('tp365_cms_pricing');
    const legacyOverrides = localStorage.getItem('tp365_cms_page_overrides');
    if (legacyHome || legacyNav || legacyPricing || legacyOverrides) {
      return deepMerge(defaultSiteContent, {
        home: legacyHome ? JSON.parse(legacyHome) : undefined,
        navigation: legacyNav ? JSON.parse(legacyNav) : undefined,
        pricing: legacyPricing ? JSON.parse(legacyPricing) : undefined,
        pageOverrides: legacyOverrides ? JSON.parse(legacyOverrides) : undefined,
      });
    }
  } catch {
    // ignore parse errors
  }
  return defaultSiteContent;
}

function saveLocalCache(next: SiteContentModel): void {
  try {
    localStorage.setItem(STORAGE_KEY_FULL, JSON.stringify(next));
  } catch {
    // ignore quota errors
  }
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteContentModel>(() => loadLocalCache());
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [cmsApiUrl, setCmsApiUrlState] = useState(() => getCmsApiBaseUrl());

  const refreshFromBackend = useCallback(async (): Promise<boolean> => {
    const health = await checkCmsHealth();
    if (!health.ok) {
      setIsBackendLive(false);
      return false;
    }
    setIsBackendLive(true);
    const remote = await fetchCmsContent();
    if (remote) {
      setLastSyncedAt(remote.updatedAt);
      if (remote.content && Object.keys(remote.content).length > 0) {
        const merged = deepMerge(defaultSiteContent, remote.content);
        setSite(merged);
        saveLocalCache(merged);
        setHasUnsavedChanges(false);
      }
    }
    return true;
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  const setBackendUrl = async (url: string) => {
    setCmsApiBaseUrl(url);
    setCmsApiUrlState(getCmsApiBaseUrl());
    await refreshFromBackend();
  };

  const updateSiteSection = useCallback(
    <K extends keyof SiteContentModel>(section: K, value: SiteContentModel[K]) => {
      setSite((prev) => {
        const next = { ...prev, [section]: value };
        saveLocalCache(next);
        return next;
      });
      setHasUnsavedChanges(true);

      // Auto-sync to backend in background if admin has an active backend token
      if (getAuthToken()) {
        saveCmsSectionBackend(String(section), value).then((res) => {
          if (res.ok) {
            setIsBackendLive(true);
            if (res.updatedAt) setLastSyncedAt(res.updatedAt);
            setHasUnsavedChanges(false);
          }
        });
      }
    },
    [],
  );

  const updatePricing = useCallback(
    (newPricing: PricingContentModel) => updateSiteSection('pricing', newPricing),
    [updateSiteSection],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateHome = useCallback((newHome: any) => updateSiteSection('home', newHome), [updateSiteSection]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateNavigation = useCallback(
    (newNav: any) => updateSiteSection('navigation', newNav),
    [updateSiteSection],
  );

  const updatePageOverride = useCallback(
    (pageKey: string, override: Partial<PageContentOverride>) => {
      setSite((prev) => {
        const nextOverrides = {
          ...prev.pageOverrides,
          [pageKey]: { ...(prev.pageOverrides[pageKey] || {}), ...override },
        };
        const next = { ...prev, pageOverrides: nextOverrides };
        saveLocalCache(next);
        if (getAuthToken()) {
          saveCmsSectionBackend('pageOverrides', nextOverrides).then((res) => {
            if (res.ok && res.updatedAt) {
              setLastSyncedAt(res.updatedAt);
              setHasUnsavedChanges(false);
            }
          });
        }
        return next;
      });
      setHasUnsavedChanges(true);
    },
    [],
  );

  const publishAllToBackend = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    const res = await saveCmsContentBackend(site);
    if (res.ok) {
      setIsBackendLive(true);
      if (res.updatedAt) setLastSyncedAt(res.updatedAt);
      setHasUnsavedChanges(false);
      return { success: true, message: 'Published all website content live to your CMS backend!' };
    }
    return {
      success: false,
      message: res.error || 'Could not reach the CMS backend API. Make sure the Node server is running or sign in again.',
    };
  }, [site]);

  const resetSection = useCallback(async <K extends keyof SiteContentModel>(section: K) => {
    setSite((prev) => {
      const next = { ...prev, [section]: defaultSiteContent[section] };
      saveLocalCache(next);
      return next;
    });
    if (getAuthToken()) {
      await resetCmsBackend(String(section));
    }
  }, []);

  const resetDefaults = useCallback(async () => {
    setSite(defaultSiteContent);
    try {
      localStorage.removeItem(STORAGE_KEY_FULL);
      localStorage.removeItem('tp365_cms_home');
      localStorage.removeItem('tp365_cms_nav');
      localStorage.removeItem('tp365_cms_pricing');
      localStorage.removeItem('tp365_cms_page_overrides');
    } catch {
      // ignore
    }
    if (getAuthToken()) {
      await resetCmsBackend();
    }
    setHasUnsavedChanges(false);
  }, []);

  const exportSiteJson = useCallback(() => JSON.stringify(site, null, 2), [site]);

  const importSiteJson = useCallback((raw: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(raw);
      if (!isPlainObject(parsed)) {
        return { success: false, message: 'JSON root must be an object.' };
      }
      const merged = deepMerge(defaultSiteContent, parsed);
      setSite(merged);
      saveLocalCache(merged);
      setHasUnsavedChanges(true);
      if (getAuthToken()) {
        saveCmsContentBackend(merged).then((res) => {
          if (res.ok) {
            if (res.updatedAt) setLastSyncedAt(res.updatedAt);
            setHasUnsavedChanges(false);
          }
        });
      }
      return { success: true, message: 'Successfully imported full website content!' };
    } catch (err) {
      return {
        success: false,
        message: `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }, []);

  return (
    <CmsContext.Provider
      value={{
        site,
        home: site.home,
        pricing: site.pricing,
        navigation: site.navigation,
        pageOverrides: site.pageOverrides,
        isBackendLive,
        isSanityLive: isBackendLive,
        sanityConfig: { projectId: '', dataset: 'production', apiVersion: '2024-03-01', token: '' },
        updateSanityConfig: noop,
        pushToSanity: publishAllToBackend,
        lastSyncedAt,
        hasUnsavedChanges,
        cmsApiUrl,
        setBackendUrl,
        refreshFromBackend,
        updateSiteSection,
        updatePricing,
        updateHome,
        updateNavigation,
        updatePageOverride,
        publishAllToBackend,
        resetSection,
        resetDefaults,
        exportSiteJson,
        importSiteJson,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

/* ---------------- Typed Selector Hooks ---------------- */

export function useCms() {
  return useContext(CmsContext);
}

export function useSanityContent() {
  return useContext(CmsContext);
}

export function useHomeContent() {
  return useContext(CmsContext).site.home;
}

export function usePricingContent() {
  return useContext(CmsContext).site.pricing;
}

export function useNavigationContent() {
  return useContext(CmsContext).site.navigation;
}

export function useProductsContent() {
  return useContext(CmsContext).site.products;
}

export function useProductsOverviewContent() {
  return useContext(CmsContext).site.productsOverview;
}

export function useSolutionsContent() {
  return useContext(CmsContext).site.solutions;
}

export function useHowItWorksContent() {
  return useContext(CmsContext).site.howItWorksPage;
}

export function useCaseStudiesContent() {
  return useContext(CmsContext).site.caseStudiesPage;
}

export function useCustomersContent() {
  return useContext(CmsContext).site.customersPage;
}

export function useIntegrationsContent() {
  return useContext(CmsContext).site.integrationsPage;
}

export function useResourcesContent() {
  return useContext(CmsContext).site.resourcesPage;
}

export function useCompanyContent() {
  return useContext(CmsContext).site.company;
}

export function useGetStartedContent() {
  return useContext(CmsContext).site.getStartedPage;
}

export function useSupportContent() {
  return useContext(CmsContext).site.supportPage;
}

export function useLegalContent() {
  return useContext(CmsContext).site.legalPage;
}

export function useGlobalBannersContent() {
  return useContext(CmsContext).site.globalBanners;
}

export function usePageOverride(pageKey: string): PageContentOverride | undefined {
  return useContext(CmsContext).site.pageOverrides[pageKey];
}
