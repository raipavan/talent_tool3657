import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  defaultSiteContent,
  type SiteContentModel,
  type PricingContentModel,
  type PageContentOverride,
  type CustomPageModel,
  type RedirectModel,
} from './siteDefaults';
import {
  checkCmsHealth,
  fetchCmsContent,
  saveCmsDraftBackend,
  patchCmsDraftSectionBackend,
  publishCmsDraft,
  discardCmsDraft,
  createSchedule,
  fetchCurrentUser,
  getCmsApiBaseUrl,
  setCmsApiBaseUrl,
  getAuthToken,
} from './api';
import type { CmsUser } from './permissions';

export * from './siteDefaults';
export * from './permissions';

const STORAGE_KEY_FULL = 'tp365_cms_site_v3';
const STORAGE_KEY_DRAFT = 'tp365_cms_draft_v3';

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return Boolean(val && typeof val === 'object' && !Array.isArray(val));
}

/** Deep-merge saved partial overrides over defaults. Arrays replace cleanly. */
export function deepMerge<T>(defaults: T, overrides: unknown): T {
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
  draftSite: SiteContentModel;
  liveSite: SiteContentModel;
  isPreviewMode: boolean;
  hasDraftChanges: boolean;
  changedSectionKeys: string[];
  liveVersion: number;
  draftVersion: number;
  storageMode: 'postgresql' | 'local-json';
  currentUser: CmsUser | null;
  customPages: CustomPageModel[];
  redirects: RedirectModel[];

  // Backwards-compatible aliases
  home: any;
  pricing: PricingContentModel;
  navigation: any;
  pageOverrides: Record<string, PageContentOverride>;

  // Backend status
  isBackendLive: boolean;
  isSanityLive: boolean;
  sanityConfig: { projectId: string; dataset: string; apiVersion: string; token?: string };
  updateSanityConfig: (cfg: { projectId: string; dataset: string; apiVersion: string; token?: string }) => void;
  pushToSanity: () => Promise<{ success: boolean; message: string }>;
  lastSyncedAt: string | null;
  hasUnsavedChanges: boolean;
  cmsApiUrl: string;
  setBackendUrl: (url: string) => Promise<void>;
  refreshFromBackend: () => Promise<boolean>;

  // Section updaters (operate on draft)
  updateSiteSection: <K extends keyof SiteContentModel>(section: K, value: SiteContentModel[K]) => void;
  updatePricing: (newPricing: PricingContentModel) => void;
  updateHome: (newHome: any) => void;
  updateNavigation: (newNav: any) => void;
  updatePageOverride: (pageKey: string, override: Partial<PageContentOverride>) => void;

  // Publishing & Versioning Actions
  publishDraft: (label?: string, note?: string) => Promise<{ success: boolean; message: string }>;
  discardDraft: () => Promise<{ success: boolean; message: string }>;
  schedulePublish: (title: string, publishAt: string, note?: string) => Promise<{ success: boolean; message: string }>;

  // Backup & Reset Actions
  publishAllToBackend: () => Promise<{ success: boolean; message: string }>;
  resetSection: <K extends keyof SiteContentModel>(section: K) => Promise<void>;
  resetDefaults: () => Promise<void>;
  exportSiteJson: () => string;
  importSiteJson: (raw: string) => { success: boolean; message: string };
  reloadCustomPages: () => Promise<void>;
}

const noop = () => {};
const noopAsync = async () => {};

const CmsContext = createContext<CmsContextType>({
  site: defaultSiteContent,
  draftSite: defaultSiteContent,
  liveSite: defaultSiteContent,
  isPreviewMode: false,
  hasDraftChanges: false,
  changedSectionKeys: [],
  liveVersion: 1,
  draftVersion: 1,
  storageMode: 'local-json',
  currentUser: null,
  customPages: [],
  redirects: [],
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
  publishDraft: async () => ({ success: false, message: 'Not initialized' }),
  discardDraft: async () => ({ success: false, message: 'Not initialized' }),
  schedulePublish: async () => ({ success: false, message: 'Not initialized' }),
  publishAllToBackend: async () => ({ success: false, message: 'Not initialized' }),
  resetSection: noopAsync,
  resetDefaults: noopAsync,
  exportSiteJson: () => JSON.stringify(defaultSiteContent, null, 2),
  importSiteJson: () => ({ success: false, message: 'Not initialized' }),
  reloadCustomPages: noopAsync,
});

function loadLocalCache(key: string): SiteContentModel {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return deepMerge(defaultSiteContent, JSON.parse(saved));
  } catch {
    // ignore parse error
  }
  return defaultSiteContent;
}

function saveLocalCache(key: string, data: SiteContentModel): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const isPreviewParam =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('preview') === 'draft';

  const [liveSite, setLiveSite] = useState<SiteContentModel>(() => loadLocalCache(STORAGE_KEY_FULL));
  const [draftSite, setDraftSite] = useState<SiteContentModel>(() => loadLocalCache(STORAGE_KEY_DRAFT));
  const [isPreviewMode, setIsPreviewMode] = useState(isPreviewParam);
  const [liveVersion, setLiveVersion] = useState(1);
  const [draftVersion, setDraftVersion] = useState(1);
  const [storageMode, setStorageMode] = useState<'postgresql' | 'local-json'>('local-json');
  const [currentUser, setCurrentUser] = useState<CmsUser | null>(null);
  const [customPages, setCustomPages] = useState<CustomPageModel[]>([]);
  const [redirects, setRedirects] = useState<RedirectModel[]>([]);
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [cmsApiUrl, setCmsApiUrlState] = useState(() => getCmsApiBaseUrl());

  // Which sections have differences between live and draft
  const changedSectionKeys = Object.keys(defaultSiteContent).filter((key) => {
    return JSON.stringify((draftSite as any)[key]) !== JSON.stringify((liveSite as any)[key]);
  });
  const hasDraftChanges = changedSectionKeys.length > 0;

  // The active site model seen by the current page: in preview mode it sees draft, in normal mode live
  const site = isPreviewMode ? draftSite : liveSite;

  const refreshFromBackend = useCallback(async (): Promise<boolean> => {
    const health = await checkCmsHealth();
    if (!health.ok) {
      setIsBackendLive(false);
      return false;
    }
    setIsBackendLive(true);
    if (health.storageMode) setStorageMode(health.storageMode);
    if (typeof health.liveVersion === 'number') setLiveVersion(health.liveVersion);
    if (typeof health.draftVersion === 'number') setDraftVersion(health.draftVersion);

    // Fetch user info if token exists
    if (getAuthToken()) {
      const meRes = await fetchCurrentUser();
      if (meRes.ok && meRes.user) {
        setCurrentUser(meRes.user);
      } else {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }

    // 1. Fetch live content
    const liveRes = await fetchCmsContent('live');
    if (liveRes && liveRes.content) {
      const mergedLive = deepMerge(defaultSiteContent, liveRes.content);
      setLiveSite(mergedLive);
      saveLocalCache(STORAGE_KEY_FULL, mergedLive);
      if (typeof liveRes.version === 'number') setLiveVersion(liveRes.version);
      if (liveRes.updatedAt) setLastSyncedAt(liveRes.updatedAt);
      if (liveRes.customPages) setCustomPages(liveRes.customPages);
      if (liveRes.redirects) setRedirects(liveRes.redirects);
    }

    // 2. If admin token exists, fetch draft content
    if (getAuthToken()) {
      const draftRes = await fetchCmsContent('draft');
      if (draftRes && draftRes.content) {
        const mergedDraft = deepMerge(defaultSiteContent, draftRes.content);
        setDraftSite(mergedDraft);
        saveLocalCache(STORAGE_KEY_DRAFT, mergedDraft);
        if (typeof draftRes.version === 'number') setDraftVersion(draftRes.version);
      }
    }

    return true;
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  // Listen for real-time draft synchronization via postMessage from Studio split-preview iframe
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'tp365:cms:draft-sync') {
        const incomingDraft = event.data.draft;
        if (incomingDraft) {
          const merged = deepMerge(defaultSiteContent, incomingDraft);
          setDraftSite(merged);
          setIsPreviewMode(true);
        }
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const setBackendUrl = async (url: string) => {
    setCmsApiBaseUrl(url);
    setCmsApiUrlState(getCmsApiBaseUrl());
    await refreshFromBackend();
  };

  const updateSiteSection = useCallback(
    <K extends keyof SiteContentModel>(section: K, value: SiteContentModel[K]) => {
      setDraftSite((prev) => {
        const next = { ...prev, [section]: value };
        saveLocalCache(STORAGE_KEY_DRAFT, next);

        // Broadcast to preview iframes
        if (typeof window !== 'undefined') {
          window.postMessage({ type: 'tp365:cms:draft-sync', draft: next }, '*');
          const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe[src*="preview=draft"]');
          iframes.forEach((ifr) => {
            ifr.contentWindow?.postMessage({ type: 'tp365:cms:draft-sync', draft: next }, '*');
          });
        }
        return next;
      });

      // Persist draft section to backend
      if (getAuthToken()) {
        patchCmsDraftSectionBackend(String(section), value).then((res) => {
          if (res.ok) {
            setIsBackendLive(true);
            if (res.updatedAt) setLastSyncedAt(res.updatedAt);
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

  const updateHome = useCallback(
    (newHome: any) => updateSiteSection('home', newHome),
    [updateSiteSection],
  );

  const updateNavigation = useCallback(
    (newNav: any) => updateSiteSection('navigation', newNav),
    [updateSiteSection],
  );

  const updatePageOverride = useCallback(
    (pageKey: string, override: Partial<PageContentOverride>) => {
      const nextOverrides = {
        ...draftSite.pageOverrides,
        [pageKey]: { ...(draftSite.pageOverrides[pageKey] || {}), ...override },
      };
      updateSiteSection('pageOverrides', nextOverrides);
    },
    [draftSite.pageOverrides, updateSiteSection],
  );

  const publishDraft = useCallback(
    async (label?: string, note?: string): Promise<{ success: boolean; message: string }> => {
      if (getAuthToken()) {
        await saveCmsDraftBackend(draftSite);
      }
      const res = await publishCmsDraft(label, note);
      if (res.ok) {
        setLiveSite(draftSite);
        saveLocalCache(STORAGE_KEY_FULL, draftSite);
        if (typeof res.liveDoc?.version === 'number') setLiveVersion(res.liveDoc.version);
        if (res.liveDoc?.updatedAt) setLastSyncedAt(res.liveDoc.updatedAt);
        return { success: true, message: 'Published all draft changes live to the website!' };
      }
      return { success: false, message: res.error || 'Failed to publish draft.' };
    },
    [draftSite],
  );

  const discardDraftAction = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    const res = await discardCmsDraft();
    if (res.ok) {
      setDraftSite(liveSite);
      saveLocalCache(STORAGE_KEY_DRAFT, liveSite);
      return { success: true, message: 'Draft reverted back to current live website content.' };
    }
    return { success: false, message: res.error || 'Failed to discard draft.' };
  }, [liveSite]);

  const schedulePublishAction = useCallback(
    async (title: string, publishAt: string, note?: string): Promise<{ success: boolean; message: string }> => {
      const res = await createSchedule(title, publishAt, note);
      if (res.ok) {
        return { success: true, message: `Release scheduled for ${new Date(publishAt).toLocaleString()}!` };
      }
      return { success: false, message: res.error || 'Failed to schedule release.' };
    },
    [],
  );

  const reloadCustomPages = useCallback(async () => {
    const env = isPreviewMode ? 'draft' : 'live';
    const res = await fetchCmsContent(env);
    if (res?.customPages) setCustomPages(res.customPages);
    if (res?.redirects) setRedirects(res.redirects);
  }, [isPreviewMode]);

  const resetSection = useCallback(
    async <K extends keyof SiteContentModel>(section: K) => {
      updateSiteSection(section, defaultSiteContent[section]);
    },
    [updateSiteSection],
  );

  const resetDefaults = useCallback(async () => {
    setDraftSite(defaultSiteContent);
    setLiveSite(defaultSiteContent);
    saveLocalCache(STORAGE_KEY_FULL, defaultSiteContent);
    saveLocalCache(STORAGE_KEY_DRAFT, defaultSiteContent);
    if (getAuthToken()) {
      await saveCmsDraftBackend(defaultSiteContent);
      await publishCmsDraft('Factory Reset', 'Restored to defaults');
    }
  }, []);

  const exportSiteJson = useCallback(() => JSON.stringify(site, null, 2), [site]);

  const importSiteJson = useCallback(
    (raw: string): { success: boolean; message: string } => {
      try {
        const parsed = JSON.parse(raw);
        if (!isPlainObject(parsed)) {
          return { success: false, message: 'JSON root must be an object.' };
        }
        const merged = deepMerge(defaultSiteContent, parsed);
        setDraftSite(merged);
        saveLocalCache(STORAGE_KEY_DRAFT, merged);
        if (getAuthToken()) {
          saveCmsDraftBackend(merged);
        }
        return { success: true, message: 'Successfully imported website content into draft!' };
      } catch (err) {
        return { success: false, message: `Invalid JSON: ${err instanceof Error ? err.message : String(err)}` };
      }
    },
    [],
  );

  return (
    <CmsContext.Provider
      value={{
        site,
        draftSite,
        liveSite,
        isPreviewMode,
        hasDraftChanges,
        changedSectionKeys,
        liveVersion,
        draftVersion,
        storageMode,
        currentUser,
        customPages,
        redirects,
        home: site.home,
        pricing: site.pricing,
        navigation: site.navigation,
        pageOverrides: site.pageOverrides,
        isBackendLive,
        isSanityLive: isBackendLive,
        sanityConfig: { projectId: '', dataset: 'production', apiVersion: '2024-03-01', token: '' },
        updateSanityConfig: noop,
        pushToSanity: async () => publishDraft(),
        lastSyncedAt,
        hasUnsavedChanges: hasDraftChanges,
        cmsApiUrl,
        setBackendUrl,
        refreshFromBackend,
        updateSiteSection,
        updatePricing,
        updateHome,
        updateNavigation,
        updatePageOverride,
        publishDraft,
        discardDraft: discardDraftAction,
        schedulePublish: schedulePublishAction,
        publishAllToBackend: async () => publishDraft(),
        resetSection,
        resetDefaults,
        exportSiteJson,
        importSiteJson,
        reloadCustomPages,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

// ---------------- Typed Selector Hooks ----------------

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
