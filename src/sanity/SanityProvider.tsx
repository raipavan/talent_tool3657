import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { sanityClient, isSanityConfigured } from './client';
import { homePageQuery, pricingPageQuery, navigationQuery } from './queries';
import homeDefault from '../../content/home.json';
import navigationDefault from '../../content/navigation.json';

export interface PlanModel {
  name: string;
  badge: string;
  target: string;
  priceMonthly: string;
  priceAnnual: string;
  trialNote: string;
  isPopular?: boolean;
  featureTitle: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

export interface PricingComparisonFeature {
  feature: string;
  starter: string;
  pro: string;
  ent: string;
}

export interface PricingFAQ {
  q: string;
  a: string;
}

export interface PricingContentModel {
  heroTitle?: string;
  heroSubtitle?: string;
  plans: PlanModel[];
  comparisonFeatures: PricingComparisonFeature[];
  faqs: PricingFAQ[];
}

export interface PageContentOverride {
  title?: string;
  eyebrow?: string;
  headline?: string;
  lede?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  sectionTitle?: string;
  sectionBody?: string;
  features?: string[];
}

export interface SanityConfigState {
  projectId: string;
  dataset: string;
  apiVersion: string;
  token?: string;
}

const defaultPricingData: PricingContentModel = {
  heroTitle: 'Try TalentPool365 free for 14 days',
  heroSubtitle: 'Run Agentic AI sourcing, semantic resume screening, and automated interviews on a live role. No credit card required.',
  plans: [
    {
      name: 'Starter',
      badge: 'Starter Plan',
      target: 'Best for startups and small teams making their first hires.',
      priceMonthly: '$99',
      priceAnnual: '$79',
      trialNote: 'Free for 14 days, no card required',
      isPopular: false,
      featureTitle: 'Everything you need to move from spreadsheets to smarter hiring:',
      features: [
        'Agentic AI candidate discovery and resume database search',
        'Resume parsing and Agentic AI candidate matching',
        'Basic assessments and automated interviews',
        'Candidate pipeline and email automation',
        'Interview scheduling calendar sync',
        'Up to 5 active jobs and 500 candidates/month',
        'Standard email support',
      ],
      ctaText: 'Start Free Trial',
      ctaHref: '/get-started#start-free-trial',
    },
    {
      name: 'Professional',
      badge: 'Professional Plan',
      target: 'Best for growing and mid-sized companies hiring across teams.',
      priceMonthly: '$249',
      priceAnnual: '$199',
      trialNote: 'Billed annually or monthly',
      isPopular: true,
      featureTitle: 'Everything in Starter, plus more automation & insight:',
      features: [
        'Advanced Agentic AI screening, ranking and smart shortlisting',
        'Full Agentic AI assessments: technical, aptitude, cognitive and behavioral',
        'Agentic AI video, voice and coding interviews with proctoring',
        'WhatsApp integration and automated follow-ups',
        'Team collaboration, feedback scorecards and approval workflows',
        'Analytics and reporting KPI dashboards',
        'ATS, HRMS and video platform integrations',
        'Higher active job and candidate capacity',
        'Priority technical support',
      ],
      ctaText: 'Book a Demo & Trial →',
      ctaHref: '/get-started#book-meeting',
    },
    {
      name: 'Enterprise',
      badge: 'Enterprise Plan',
      target: 'Best for large and global organizations with complex hiring needs.',
      priceMonthly: 'Custom',
      priceAnnual: 'Custom',
      trialNote: 'Volume discounts & custom contracts',
      isPopular: false,
      featureTitle: 'Everything in Professional, plus scale & control:',
      features: [
        'Unlimited high-volume candidate hiring pipeline',
        'Advanced role-based access and custom approval chains',
        'Full immutable audit trails and compliance security controls',
        'Developer REST API access & custom webhooks',
        'Diversity analytics and recruiter productivity leaderboard',
        'Single sign-on (SAML / SSO) and custom data residency',
        'Dedicated account manager & guided rollout',
        'Guaranteed 99.9% uptime SLA',
      ],
      ctaText: 'Contact Enterprise Sales',
      ctaHref: '/company/contact',
    },
  ],
  comparisonFeatures: [
    { feature: 'Agentic AI Candidate Discovery', starter: '✓', pro: '✓', ent: '✓' },
    { feature: 'Resume Database Search', starter: '✓', pro: '✓', ent: '✓' },
    { feature: 'Resume Parsing & Matching', starter: '✓', pro: '✓', ent: '✓' },
    { feature: 'Candidate Ranking & Shortlisting', starter: 'Basic', pro: 'Advanced', ent: 'Advanced' },
    { feature: 'Agentic AI Assessments (Tech, Aptitude, Cognitive)', starter: 'Basic', pro: 'Full suite', ent: 'Full suite' },
    { feature: 'Agentic AI Interviews (Video, Voice, Coding)', starter: 'Limited', pro: '✓ (Unlimited)', ent: '✓ (Unlimited)' },
    { feature: 'Proctoring & Anti-Cheat Monitoring', starter: '–', pro: '✓', ent: '✓' },
    { feature: 'Recruiter Workspace & Collaboration', starter: 'Basic', pro: '✓', ent: '✓' },
    { feature: 'Approval Workflows & Audit Chains', starter: '–', pro: '✓', ent: 'Custom multi-tier' },
    { feature: 'WhatsApp & Email Automation', starter: 'Email only', pro: '✓ (WhatsApp & Email)', ent: '✓ (WhatsApp & Email)' },
    { feature: 'Analytics & Reporting Dashboards', starter: 'Basic KPIs', pro: '✓ (Full Funnel)', ent: 'Advanced + BI Sync' },
    { feature: 'ATS & HRMS Integrations', starter: '–', pro: '✓ (Certified)', ent: '✓ + Custom Webhooks' },
    { feature: 'Developer REST API Access', starter: '–', pro: '–', ent: '✓ (Full Access)' },
  ],
  faqs: [
    {
      q: 'How does per-job pricing work compared to per-seat pricing?',
      a: 'Unlike traditional recruiting software that charges $150+ for every recruiter or hiring manager seat, TalentPool365 gives you unlimited user seats on all plans. You only pay for active job openings being worked in a given billing cycle.',
    },
    {
      q: 'What is considered an "active job"?',
      a: 'An active job is any open requisition currently accepting candidates, running screening assessments, or conducting automated interviews. Once an offer is signed and the requisition closes, that slot becomes free for your next opening.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes! You can explore TalentPool365 on a 14-day free trial without a credit card. Test Agentic AI candidate discovery, resume parsing, and automated interviews on your own roles.',
    },
    {
      q: 'Do you offer discounts for annual billing?',
      a: 'Yes. Organizations choosing annual billing receive a 20% discount across Starter and Professional plans, as well as included onboarding assistance.',
    },
    {
      q: 'Is my candidate data secure and GDPR compliant?',
      a: 'Absolutely. All candidate resumes, test scores, and interview recordings are protected with AES-256 encryption at rest and TLS in transit. We support full GDPR data erasure and right-to-access requests.',
    },
  ],
};

const STORAGE_KEY_PRICING = 'tp365_cms_pricing';
const STORAGE_KEY_HOME = 'tp365_cms_home';
const STORAGE_KEY_NAV = 'tp365_cms_nav';
const STORAGE_KEY_CONFIG = 'tp365_cms_config';
const STORAGE_KEY_OVERRIDES = 'tp365_cms_page_overrides';

interface SanityContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  home: any;
  pricing: PricingContentModel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  pageOverrides: Record<string, PageContentOverride>;
  isSanityLive: boolean;
  sanityConfig: SanityConfigState;
  updatePricing: (newPricing: PricingContentModel) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateHome: (newHome: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateNavigation: (newNav: any) => void;
  updatePageOverride: (pageKey: string, override: Partial<PageContentOverride>) => void;
  updateSanityConfig: (config: SanityConfigState) => void;
  resetDefaults: () => void;
  pushToSanity: () => Promise<{ success: boolean; message: string }>;
}

const SanityContext = createContext<SanityContextType>({
  home: homeDefault,
  pricing: defaultPricingData,
  navigation: navigationDefault,
  pageOverrides: {},
  isSanityLive: false,
  sanityConfig: {
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '',
    dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
    apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2024-03-01',
    token: '',
  },
  updatePricing: () => {},
  updateHome: () => {},
  updateNavigation: () => {},
  updatePageOverride: () => {},
  updateSanityConfig: () => {},
  resetDefaults: () => {},
  pushToSanity: async () => ({ success: false, message: 'Not initialized' }),
});

export function SanityProvider({ children }: { children: ReactNode }) {
  // 1. Initialize from localStorage if present, else defaults
  const [home, setHome] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HOME);
      return saved ? JSON.parse(saved) : homeDefault;
    } catch {
      return homeDefault;
    }
  });

  const [pricing, setPricing] = useState<PricingContentModel>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRICING);
      return saved ? JSON.parse(saved) : defaultPricingData;
    } catch {
      return defaultPricingData;
    }
  });

  const [navigation, setNavigation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NAV);
      return saved ? JSON.parse(saved) : navigationDefault;
    } catch {
      return navigationDefault;
    }
  });

  const [pageOverrides, setPageOverrides] = useState<Record<string, PageContentOverride>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OVERRIDES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [sanityConfig, setSanityConfig] = useState<SanityConfigState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '',
      dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
      apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2024-03-01',
      token: '',
    };
  });

  const [isSanityLive, setIsSanityLive] = useState(false);

  // 2. Fetch live data from Sanity Cloud if configured
  useEffect(() => {
    const activeProjectId = sanityConfig.projectId || (isSanityConfigured ? (import.meta.env.VITE_SANITY_PROJECT_ID as string) : '');
    if (!activeProjectId || !sanityClient) return;

    Promise.allSettled([
      sanityClient.fetch(homePageQuery),
      sanityClient.fetch(pricingPageQuery),
      sanityClient.fetch(navigationQuery),
    ]).then(([homeRes, pricingRes, navRes]) => {
      let live = false;
      if (homeRes.status === 'fulfilled' && homeRes.value) {
        setHome((prev: unknown) => ({ ...(typeof prev === 'object' && prev ? prev : {}), ...homeRes.value }));
        live = true;
      }
      if (pricingRes.status === 'fulfilled' && pricingRes.value) {
        setPricing((prev) => ({ ...prev, ...pricingRes.value }));
        live = true;
      }
      if (navRes.status === 'fulfilled' && navRes.value) {
        setNavigation((prev: unknown) => ({ ...(typeof prev === 'object' && prev ? prev : {}), ...navRes.value }));
        live = true;
      }
      if (live) setIsSanityLive(true);
    });
  }, [sanityConfig.projectId]);

  // Content mutators
  const updatePricing = (newPricing: PricingContentModel) => {
    setPricing(newPricing);
    try {
      localStorage.setItem(STORAGE_KEY_PRICING, JSON.stringify(newPricing));
    } catch {
      // ignore storage errors
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateHome = (newHome: any) => {
    setHome(newHome);
    try {
      localStorage.setItem(STORAGE_KEY_HOME, JSON.stringify(newHome));
    } catch {
      // ignore
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateNavigation = (newNav: any) => {
    setNavigation(newNav);
    try {
      localStorage.setItem(STORAGE_KEY_NAV, JSON.stringify(newNav));
    } catch {
      // ignore
    }
  };

  const updatePageOverride = (pageKey: string, override: Partial<PageContentOverride>) => {
    setPageOverrides((prev) => {
      const next = {
        ...prev,
        [pageKey]: { ...(prev[pageKey] || {}), ...override },
      };
      try {
        localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const updateSanityConfig = (newConfig: SanityConfigState) => {
    setSanityConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
    } catch {
      // ignore
    }
  };

  const resetDefaults = () => {
    setPricing(defaultPricingData);
    setHome(homeDefault);
    setNavigation(navigationDefault);
    setPageOverrides({});
    try {
      localStorage.removeItem(STORAGE_KEY_PRICING);
      localStorage.removeItem(STORAGE_KEY_HOME);
      localStorage.removeItem(STORAGE_KEY_NAV);
      localStorage.removeItem(STORAGE_KEY_OVERRIDES);
    } catch {
      // ignore
    }
  };

  // Direct sync to Sanity Mutate API
  const pushToSanity = async (): Promise<{ success: boolean; message: string }> => {
    const pId = sanityConfig.projectId.trim();
    const token = sanityConfig.token?.trim();
    const dataset = sanityConfig.dataset.trim() || 'production';
    const apiVer = sanityConfig.apiVersion.trim() || '2024-03-01';

    if (!pId) {
      return { success: false, message: 'Please enter your Sanity Project ID first.' };
    }
    if (!token) {
      return {
        success: false,
        message: 'A Sanity Write API token is required to push mutations directly to Sanity Cloud. You can generate one at sanity.io/manage under API > Tokens.'
      };
    }

    try {
      const endpoint = `https://${pId}.api.sanity.io/v${apiVer}/data/mutate/${dataset}`;

      // Build mutations for pricingPage and homePage documents
      const mutations = [
        {
          createOrReplace: {
            _id: 'pricingPage',
            _type: 'pricingPage',
            title: pricing.heroTitle || 'Pricing',
            subtitle: pricing.heroSubtitle || '',
            plans: pricing.plans.map((p, idx) => ({
              _key: `plan_${idx}`,
              name: p.name,
              badge: p.badge,
              target: p.target,
              priceMonthly: p.priceMonthly,
              priceAnnual: p.priceAnnual,
              trialNote: p.trialNote,
              isPopular: Boolean(p.isPopular),
              featureTitle: p.featureTitle,
              features: p.features,
              ctaText: p.ctaText,
              ctaHref: p.ctaHref,
            })),
            comparisonFeatures: pricing.comparisonFeatures.map((c, idx) => ({
              _key: `comp_${idx}`,
              feature: c.feature,
              starter: c.starter,
              pro: c.pro,
              ent: c.ent,
            })),
            faqs: pricing.faqs.map((f, idx) => ({
              _key: `faq_${idx}`,
              question: f.q,
              answer: f.a,
            })),
          },
        },
      ];

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mutations }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, message: `Sanity Cloud API returned error ${res.status}: ${errText}` };
      }

      setIsSanityLive(true);
      return { success: true, message: 'Successfully synced documents to Sanity Cloud dataset!' };
    } catch (err) {
      return { success: false, message: `Failed to push to Sanity Cloud: ${err instanceof Error ? err.message : String(err)}` };
    }
  };

  return (
    <SanityContext.Provider
      value={{
        home,
        pricing,
        navigation,
        pageOverrides,
        isSanityLive,
        sanityConfig,
        updatePricing,
        updateHome,
        updateNavigation,
        updatePageOverride,
        updateSanityConfig,
        resetDefaults,
        pushToSanity,
      }}
    >
      {children}
    </SanityContext.Provider>
  );
}

export function useSanityContent() {
  return useContext(SanityContext);
}

export function usePricingContent() {
  return useContext(SanityContext).pricing;
}

export function useHomeContent() {
  return useContext(SanityContext).home;
}

export function useNavigationContent() {
  return useContext(SanityContext).navigation;
}

export function usePageOverride(pageKey: string): PageContentOverride | null {
  const { pageOverrides } = useContext(SanityContext);
  return pageOverrides[pageKey] || null;
}
