import { useState, useEffect } from 'react';
import { useCms, type PlanModel, type PricingComparisonFeature } from '../cms/CmsProvider';
import { loginCmsBackend, changeCmsPasswordBackend, setAuthToken } from '../cms/api';
import { HomeSectionEditor } from '../components/cms/HomeSectionEditor';
import { NavigationEditor } from '../components/cms/NavigationEditor';
import { PagesContentEditor } from '../components/cms/PagesContentEditor';
import { BackendSettingsPanel } from '../components/cms/BackendSettingsPanel';

const AUTH_STORAGE_KEY = 'tp365_studio_authenticated';
const PASSWORD_STORAGE_KEY = 'tp365_studio_password';
const USERNAME_STORAGE_KEY = 'tp365_studio_username';

export interface PageItem {
  id: string;
  title: string;
  path: string;
  category: 'Core' | 'Products' | 'Company' | 'Solutions' | 'Resources';
  description: string;
  badge?: string;
  editableSection?: 'pricing' | 'home' | 'product' | 'navigation' | 'generic';
}

const STATIC_ALL_PAGES: PageItem[] = [
  // Core Pages
  {
    id: 'home',
    title: 'Home Page',
    path: '/',
    category: 'Core',
    description: 'Main landing page featuring Agentic AI sourcing, screening, assessments, and interview automation highlights.',
    badge: 'High Traffic',
    editableSection: 'home',
  },
  {
    id: 'pricing',
    title: 'Pricing & Plans',
    path: '/pricing',
    category: 'Core',
    description: '14-day free trial, Starter, Professional, and Enterprise plans with 13-row feature comparison matrix and FAQs.',
    badge: 'Conversion Key',
    editableSection: 'pricing',
  },
  {
    id: 'get-started',
    title: 'Get Started & Demo',
    path: '/get-started',
    category: 'Core',
    description: 'Interactive demo booking and free trial registration with qualification form.',
    badge: 'Conversion Key',
    editableSection: 'generic',
  },
  {
    id: 'how-it-works',
    title: 'How It Works',
    path: '/how-it-works',
    category: 'Core',
    description: 'End-to-end recruitment workflow from job requisition intake to automated interview evaluation.',
    editableSection: 'generic',
  },
  {
    id: 'support',
    title: 'Support & Help Center',
    path: '/support',
    category: 'Core',
    description: 'Knowledge base, customer support contact, SLA details, and onboarding documentation.',
    editableSection: 'generic',
  },

  // Products
  {
    id: 'products-overview',
    title: 'Platform Overview',
    path: '/products',
    category: 'Products',
    description: 'Interactive overview of all nine hiring products and how they connect seamlessly.',
    badge: 'Product Hub',
    editableSection: 'generic',
  },
  {
    id: 'prod-talent-sourcing',
    title: 'Talent Sourcing',
    path: '/products/talent-sourcing',
    category: 'Products',
    description: 'Agentic AI candidate discovery across ATS, resume databases, and job board pools.',
    editableSection: 'product',
  },
  {
    id: 'prod-candidate-screening',
    title: 'Candidate Screening',
    path: '/products/candidate-screening',
    category: 'Products',
    description: 'Automated semantic resume parsing, match scoring, and unbiased shortlisting.',
    editableSection: 'product',
  },
  {
    id: 'prod-ai-assessments',
    title: 'Agentic AI Assessments',
    path: '/products/ai-assessments',
    category: 'Products',
    description: 'Technical, aptitude, and cognitive tests graded autonomously against company hiring bars.',
    editableSection: 'product',
  },
  {
    id: 'prod-ai-interviews',
    title: 'Agentic AI Interviews',
    path: '/products/ai-interviews',
    category: 'Products',
    description: 'Structured video, voice, and live coding interviews with anti-cheat proctoring.',
    editableSection: 'product',
  },
  {
    id: 'prod-recruiter-workspace',
    title: 'Recruiter Workspace',
    path: '/products/recruiter-workspace',
    category: 'Products',
    description: 'Collaborative candidate pipelines, hiring team notes, feedback rubrics, and approval workflows.',
    editableSection: 'product',
  },
  {
    id: 'prod-candidate-engagement',
    title: 'Candidate Engagement',
    path: '/products/candidate-engagement',
    category: 'Products',
    description: 'WhatsApp, SMS, and email candidate nurturing chatbots with instant automated updates.',
    editableSection: 'product',
  },
  {
    id: 'prod-hiring-offer-management',
    title: 'Hiring & Offer Management',
    path: '/products/hiring-offer-management',
    category: 'Products',
    description: 'Final interviews, hiring panel scorecards, automated offer letters, and e-signatures.',
    editableSection: 'product',
  },
  {
    id: 'prod-analytics-reporting',
    title: 'Analytics & Reporting',
    path: '/products/analytics-reporting',
    category: 'Products',
    description: 'Time-to-hire, funnel drop-off, recruiter productivity KPIs, and diversity metrics.',
    editableSection: 'product',
  },
  {
    id: 'prod-compliance-security',
    title: 'Enterprise Compliance & Security',
    path: '/products/compliance-security',
    category: 'Products',
    description: 'SOC 2 Type II, ISO 27001, GDPR compliance, immutable audit trails, and role-based access.',
    editableSection: 'product',
  },

  // Solutions & Proof
  {
    id: 'solutions',
    title: 'Solutions Overview',
    path: '/solutions',
    category: 'Solutions',
    description: 'Customized recruitment workflows designed for Technology, Healthcare, Finance, and High-Volume hiring.',
    editableSection: 'generic',
  },
  {
    id: 'integrations',
    title: 'Integrations Ecosystem',
    path: '/integrations',
    category: 'Solutions',
    description: 'Direct integrations with Workday, Greenhouse, Lever, SAP SuccessFactors, Slack, and calendars.',
    badge: '40+ Connectors',
    editableSection: 'generic',
  },
  {
    id: 'customers',
    title: 'Customer Stories',
    path: '/customers',
    category: 'Solutions',
    description: 'Quotes, testimonials, and verified hiring speed results from talent leaders.',
    editableSection: 'generic',
  },
  {
    id: 'case-studies',
    title: 'Case Studies',
    path: '/case-studies',
    category: 'Solutions',
    description: 'In-depth case studies documenting 68% time-to-hire reduction and 45% recruiting cost savings.',
    badge: 'Proof Data',
    editableSection: 'generic',
  },

  // Company Pages
  {
    id: 'company-about',
    title: 'About TalentPool365',
    path: '/company/about',
    category: 'Company',
    description: 'Company mission, founding vision, leadership values, and global operations.',
    editableSection: 'generic',
  },
  {
    id: 'company-leadership',
    title: 'Leadership Team',
    path: '/company/leadership',
    category: 'Company',
    description: 'Executive profiles, advisory board, and key product leadership team.',
    editableSection: 'generic',
  },
  {
    id: 'company-careers',
    title: 'Careers & Hiring',
    path: '/company/careers',
    category: 'Company',
    description: 'Open engineering, product, and sales positions in Amsterdam, Austin, and Bengaluru.',
    editableSection: 'generic',
  },
  {
    id: 'company-partners',
    title: 'Partners Program',
    path: '/company/partners',
    category: 'Company',
    description: 'Technology partner, implementation, and referral partner programs.',
    editableSection: 'generic',
  },
  {
    id: 'company-technology',
    title: 'Technology & AI Guardrails',
    path: '/company/technology',
    category: 'Company',
    description: 'Explainable AI scoring, zero hallucinations, bias mitigation, and algorithm safety.',
    editableSection: 'generic',
  },
  {
    id: 'company-news',
    title: 'News & Press Releases',
    path: '/company/news',
    category: 'Company',
    description: 'Company announcements, industry awards, and press release archive.',
    editableSection: 'generic',
  },
  {
    id: 'company-contact',
    title: 'Contact Us',
    path: '/company/contact',
    category: 'Company',
    description: 'Direct sales inquiry forms, press contact, phone numbers, and physical office addresses.',
    editableSection: 'generic',
  },

  // Resources & Legal
  {
    id: 'resources',
    title: 'Resources & Guides',
    path: '/resources',
    category: 'Resources',
    description: 'E-books, hiring checklists, ROI calculators, and talent acquisition whitepapers.',
    editableSection: 'generic',
  },
  {
    id: 'blog',
    title: 'Hiring Notes & Blog',
    path: '/blog',
    category: 'Resources',
    description: 'Articles, recruiting benchmarks, and practical guides on Agentic AI hiring.',
    editableSection: 'generic',
  },
  {
    id: 'legal',
    title: 'Legal & Privacy Policy',
    path: '/legal',
    category: 'Resources',
    description: 'Terms of service, privacy notice, GDPR policy, data processing agreement, and cookies.',
    editableSection: 'generic',
  },
];

export function SanityStudioPage() {
  const {
    pricing,
    pageOverrides,
    isBackendLive,
    updatePricing,
    updatePageOverride,
    resetDefaults,
  } = useCms();
  const isSanityLive = isBackendLive;

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(AUTH_STORAGE_KEY) === 'true' ||
        sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true'
      );
    } catch {
      return false;
    }
  });

  const [usernameInput, setUsernameInput] = useState(() => {
    return localStorage.getItem(USERNAME_STORAGE_KEY) || 'admin';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Change Password Modal & Settings
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Studio Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pricing' | 'home' | 'products' | 'navigation' | 'sanity' | 'security'>('dashboard');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Dashboard Filters & Search
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Quick Edit Page Modal
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [editFormDraft, setEditFormDraft] = useState<{
    title: string;
    eyebrow: string;
    headline: string;
    lede: string;
    primaryCtaText: string;
    primaryCtaHref: string;
    secondaryCtaText: string;
    secondaryCtaHref: string;
  }>({
    title: '',
    eyebrow: '',
    headline: '',
    lede: '',
    primaryCtaText: '',
    primaryCtaHref: '',
    secondaryCtaText: '',
    secondaryCtaHref: '',
  });

  // Local drafts
  const [pricingDraft, setPricingDraft] = useState(pricing);

  useEffect(() => {
    setPricingDraft(pricing);
  }, [pricing]);

  const notify = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 4000);
  };

  // Helper: get current stored password
  const getStoredPassword = () => {
    return localStorage.getItem(PASSWORD_STORAGE_KEY) || 'admin';
  };

  // Login handler (authenticates against our self-hosted Node CMS Backend first, with local fallback)
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const user = usernameInput.trim();
    const pass = passwordInput.trim();
    if (!user) {
      setAuthError('Please enter a username or email.');
      return;
    }

    const backendRes = await loginCmsBackend(user, pass);
    if (backendRes.ok && backendRes.token) {
      setAuthToken(backendRes.token, rememberMe);
      try {
        localStorage.setItem(USERNAME_STORAGE_KEY, backendRes.username || user);
        if (rememberMe) localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        else sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
      return;
    }

    if (!backendRes.offline) {
      setAuthError(backendRes.error || 'Incorrect username or password. Default: admin / admin');
      return;
    }

    const storedPass = localStorage.getItem(PASSWORD_STORAGE_KEY);
    const validPasswords = storedPass ? [storedPass] : ['admin', 'admin123', 'talentpool365'];
    if (validPasswords.includes(pass)) {
      try {
        localStorage.setItem(USERNAME_STORAGE_KEY, user);
        if (rememberMe) localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        else sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
    } else {
      setAuthError('Incorrect password. Default passwords: "admin" or "admin123".');
    }
  };

  // Quick 1-click test login
  const handleQuickLogin = async () => {
    const backendRes = await loginCmsBackend('admin', 'admin');
    if (backendRes.ok && backendRes.token) {
      setAuthToken(backendRes.token, true);
    }
    try {
      localStorage.setItem(USERNAME_STORAGE_KEY, 'admin');
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    setIsAuthenticated(true);
    setAuthError(null);
  };

  // Logout handler
  const handleLogout = () => {
    setAuthToken('');
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setPasswordInput('');
    setIsPasswordModalOpen(false);
    notify('🚪 You have successfully signed out of Studio.');
  };

  // Change password handler (updates server auth store + local fallback)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);

    if (newPassword.length < 4) {
      setSecurityMessage({ text: 'New password must be at least 4 characters long.', success: false });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityMessage({ text: 'New password and confirmation do not match.', success: false });
      return;
    }

    const currentPass = currentPasswordInput || getStoredPassword();
    const backendRes = await changeCmsPasswordBackend(currentPass, newPassword);
    if (backendRes.ok) {
      if (backendRes.token) setAuthToken(backendRes.token, true);
      try {
        localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
      } catch {
        // ignore
      }
      setSecurityMessage({ text: '✅ Password successfully updated on your CMS Backend!', success: true });
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      notify('🔑 CMS Backend password updated!');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setSecurityMessage(null);
      }, 2000);
      return;
    }

    if (!backendRes.offline) {
      setSecurityMessage({ text: backendRes.error || 'Current password does not match.', success: false });
      return;
    }

    try {
      localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
      setSecurityMessage({ text: '✅ Password saved locally (backend offline).', success: true });
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      notify('🔑 Studio password successfully changed!');
    } catch {
      setSecurityMessage({ text: 'Could not save new password.', success: false });
    }
  };

  const handleResetPasswordDefault = () => {
    localStorage.removeItem(PASSWORD_STORAGE_KEY);
    setSecurityMessage({ text: 'Password reset back to factory default: "admin"', success: true });
    notify('Password reset to default ("admin")');
  };

  // Open End-to-End Edit for any Page
  const openPageEditor = (page: PageItem) => {
    const currentSaved = pageOverrides[page.path] || pageOverrides[page.id] || {};
    setEditFormDraft({
      title: currentSaved.title || page.title,
      eyebrow: currentSaved.eyebrow || (page.category === 'Core' ? 'TALENTPOOL365' : page.category.toUpperCase()),
      headline: currentSaved.headline || page.title,
      lede: currentSaved.lede || page.description,
      primaryCtaText: currentSaved.primaryCtaText || 'Book a demo →',
      primaryCtaHref: currentSaved.primaryCtaHref || '/get-started#book-meeting',
      secondaryCtaText: currentSaved.secondaryCtaText || 'Explore platform',
      secondaryCtaHref: currentSaved.secondaryCtaHref || '/products',
    });
    setEditingPage(page);
  };

  const handleSavePageOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    updatePageOverride(editingPage.path, editFormDraft);
    updatePageOverride(editingPage.id, editFormDraft);
    notify(`✅ Content for "${editingPage.title}" saved and live!`);
  };

  const handleResetCurrentPage = () => {
    if (!editingPage) return;
    updatePageOverride(editingPage.path, {
      title: undefined,
      eyebrow: undefined,
      headline: undefined,
      lede: undefined,
      primaryCtaText: undefined,
      primaryCtaHref: undefined,
      secondaryCtaText: undefined,
      secondaryCtaHref: undefined,
    });
    updatePageOverride(editingPage.id, {
      title: undefined,
      eyebrow: undefined,
      headline: undefined,
      lede: undefined,
      primaryCtaText: undefined,
      primaryCtaHref: undefined,
      secondaryCtaText: undefined,
      secondaryCtaHref: undefined,
    });
    setEditFormDraft({
      title: editingPage.title,
      eyebrow: '',
      headline: editingPage.title,
      lede: editingPage.description,
      primaryCtaText: 'Book a demo →',
      primaryCtaHref: '/get-started#book-meeting',
      secondaryCtaText: 'Explore platform',
      secondaryCtaHref: '/products',
    });
    notify(`Content for "${editingPage.title}" reset to original factory text.`);
  };

  const handleSavePricing = () => {
    updatePricing(pricingDraft);
    notify('✅ Pricing changes saved! The whole website is updated immediately.');
  };

  // Plan editing helper
  const updatePlan = (index: number, field: keyof PlanModel, value: unknown) => {
    setPricingDraft((prev) => {
      const nextPlans = [...prev.plans];
      nextPlans[index] = { ...nextPlans[index], [field]: value };
      return { ...prev, plans: nextPlans };
    });
  };

  const updateFeatureBullet = (planIdx: number, featureIdx: number, val: string) => {
    setPricingDraft((prev) => {
      const nextPlans = [...prev.plans];
      const nextFeatures = [...nextPlans[planIdx].features];
      nextFeatures[featureIdx] = val;
      nextPlans[planIdx] = { ...nextPlans[planIdx], features: nextFeatures };
      return { ...prev, plans: nextPlans };
    });
  };

  const addFeatureBullet = (planIdx: number) => {
    setPricingDraft((prev) => {
      const nextPlans = [...prev.plans];
      nextPlans[planIdx] = {
        ...nextPlans[planIdx],
        features: [...nextPlans[planIdx].features, 'New capability feature...'],
      };
      return { ...prev, plans: nextPlans };
    });
  };

  const removeFeatureBullet = (planIdx: number, featureIdx: number) => {
    setPricingDraft((prev) => {
      const nextPlans = [...prev.plans];
      const nextFeatures = nextPlans[planIdx].features.filter((_, idx) => idx !== featureIdx);
      nextPlans[planIdx] = { ...nextPlans[planIdx], features: nextFeatures };
      return { ...prev, plans: nextPlans };
    });
  };

  // Comparison Matrix helper
  const updateComparisonRow = (idx: number, field: keyof PricingComparisonFeature, val: string) => {
    setPricingDraft((prev) => {
      const nextRows = [...prev.comparisonFeatures];
      nextRows[idx] = { ...nextRows[idx], [field]: val };
      return { ...prev, comparisonFeatures: nextRows };
    });
  };

  const addComparisonRow = () => {
    setPricingDraft((prev) => ({
      ...prev,
      comparisonFeatures: [
        ...prev.comparisonFeatures,
        { feature: 'New Comparison Feature', starter: '–', pro: '✓', ent: '✓' },
      ],
    }));
  };

  const removeComparisonRow = (idx: number) => {
    setPricingDraft((prev) => ({
      ...prev,
      comparisonFeatures: prev.comparisonFeatures.filter((_, i) => i !== idx),
    }));
  };

  // FAQ helper
  const updateFaq = (idx: number, field: 'q' | 'a', val: string) => {
    setPricingDraft((prev) => {
      const nextFaqs = [...prev.faqs];
      nextFaqs[idx] = { ...nextFaqs[idx], [field]: val };
      return { ...prev, faqs: nextFaqs };
    });
  };

  const addFaq = () => {
    setPricingDraft((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { q: 'New question here?', a: 'Answer explaining details here.' }],
    }));
  };

  const removeFaq = (idx: number) => {
    setPricingDraft((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== idx),
    }));
  };

  // Filtered pages for Dashboard directory
  const filteredPages = STATIC_ALL_PAGES.filter((page) => {
    const matchesCategory = selectedCategory === 'All' || page.category === selectedCategory;
    const matchesSearch =
      page.title.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
      page.path.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(pageSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ==========================================
  // 1. IF NOT AUTHENTICATED: SHOW SIGN IN FORM
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-light) 100%)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div
          style={{
            maxWidth: 460,
            width: '100%',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 25px 50px -12px rgba(18, 63, 59, 0.2), 0 0 1px 1px rgba(18, 63, 59, 0.08)',
            padding: '40px 36px',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Logo / Shield Icon */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'var(--color-outline-fill)',
                color: 'var(--color-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                boxShadow: '0 4px 12px rgba(18, 63, 59, 0.1)',
              }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
              Studio Sign In
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: 6, lineHeight: 1.4 }}>
              Sign in with your credentials to manage TalentPool365 pricing, content, and Sanity CMS synchronization.
            </p>
          </div>

          {/* Feedback messages */}
          {authError && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '0.88rem',
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              ⚠️ {authError}
            </div>
          )}

          {authSuccess && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontSize: '0.88rem',
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              {authSuccess}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Username / Email
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.8rem',
                    color: 'var(--color-secondary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me on this browser
              </label>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 'var(--radius)',
                background: 'var(--color-primary)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '1.02rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(18, 63, 59, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Sign In to Studio</span>
            </button>
          </form>

          {/* Quick Demo Login Option & Forgot Password Reset */}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'var(--color-bg-light)',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)',
                marginBottom: 12,
              }}
            >
              Default login: <strong>admin</strong> / password: <strong>admin</strong>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleQuickLogin}
                style={{
                  background: 'var(--color-outline-fill)',
                  border: '1px solid var(--color-secondary)',
                  color: 'var(--color-primary)',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⚡ 1-Click Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(PASSWORD_STORAGE_KEY);
                  setAuthSuccess('Password reset back to default: "admin"');
                  setAuthError(null);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  padding: '8px 14px',
                  borderRadius: 6,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset Password to Default
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. AUTHENTICATED: RENDER FULL STUDIO & CMS DASHBOARD
  // ==========================================
  const currentUser = localStorage.getItem(USERNAME_STORAGE_KEY) || 'admin';

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px', fontFamily: 'var(--font-body)' }}>
      {/* CHANGE PASSWORD POPUP MODAL */}
      {isPasswordModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(18, 63, 59, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              maxWidth: 460,
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '32px 28px',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.4rem' }}>🔑</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                  Change Studio Password
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setSecurityMessage(null);
                }}
                style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', color: '#9CA3AF', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
              Update the password required to access this Studio and edit website contents.
            </p>

            {securityMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: securityMessage.success ? '#DCFCE7' : '#FEF2F2',
                  border: `1px solid ${securityMessage.success ? '#86EFAC' : '#FECACA'}`,
                  color: securityMessage.success ? '#166534' : '#DC2626',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                {securityMessage.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleResetPasswordDefault}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 6,
                    background: '#F3F4F6',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#4B5563',
                    cursor: 'pointer',
                  }}
                >
                  Reset to "admin"
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 6,
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: 6,
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* END-TO-END PAGE CONTENT EDIT MODAL */}
      {editingPage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(18, 63, 59, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              background: '#fff',
              maxWidth: 680,
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '32px 30px',
              border: '1px solid var(--color-border)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header & Quick Page Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: 'var(--color-outline-fill)', color: 'var(--color-primary)' }}>
                    {editingPage.category}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    Route: <code>{editingPage.path}</code>
                  </span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                  Editing: {editingPage.title}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <a
                  href={editingPage.path}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  👁️ View Live
                </a>
                <button
                  onClick={() => setEditingPage(null)}
                  style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', color: '#9CA3AF', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Quick Switch Page Dropdown */}
            <div style={{ background: 'var(--color-bg-light)', padding: '10px 14px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                Switch Page:
              </span>
              <select
                value={editingPage.id}
                onChange={(e) => {
                  const targetPage = STATIC_ALL_PAGES.find((p) => p.id === e.target.value);
                  if (targetPage) openPageEditor(targetPage);
                }}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                  background: '#fff',
                }}
              >
                {STATIC_ALL_PAGES.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.category}] {p.title} ({p.path})
                  </option>
                ))}
              </select>
            </div>

            {/* Content Form */}
            <form onSubmit={handleSavePageOverride}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                    Page / SEO Title
                  </label>
                  <input
                    type="text"
                    value={editFormDraft.title}
                    onChange={(e) => setEditFormDraft({ ...editFormDraft, title: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                    Hero Eyebrow Tag
                  </label>
                  <input
                    type="text"
                    value={editFormDraft.eyebrow}
                    onChange={(e) => setEditFormDraft({ ...editFormDraft, eyebrow: e.target.value })}
                    placeholder="e.g. AGENTIC AI RECRUITMENT"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={editFormDraft.headline}
                  onChange={(e) => setEditFormDraft({ ...editFormDraft, headline: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.92rem', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  Summary Lede / Body Description
                </label>
                <textarea
                  rows={3}
                  value={editFormDraft.lede}
                  onChange={(e) => setEditFormDraft({ ...editFormDraft, lede: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid var(--color-border)', marginBottom: 20 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', display: 'block', marginBottom: 10 }}>
                  Call-to-Action Buttons
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>Primary CTA Text</label>
                    <input
                      type="text"
                      value={editFormDraft.primaryCtaText}
                      onChange={(e) => setEditFormDraft({ ...editFormDraft, primaryCtaText: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>Primary CTA Link</label>
                    <input
                      type="text"
                      value={editFormDraft.primaryCtaHref}
                      onChange={(e) => setEditFormDraft({ ...editFormDraft, primaryCtaHref: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>Secondary CTA Text</label>
                    <input
                      type="text"
                      value={editFormDraft.secondaryCtaText}
                      onChange={(e) => setEditFormDraft({ ...editFormDraft, secondaryCtaText: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>Secondary CTA Link</label>
                    <input
                      type="text"
                      value={editFormDraft.secondaryCtaHref}
                      onChange={(e) => setEditFormDraft({ ...editFormDraft, secondaryCtaHref: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleResetCurrentPage}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 6,
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🔄 Reset This Page
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingPage(null)}
                    style={{ padding: '9px 16px', borderRadius: 6, background: '#fff', border: '1px solid var(--color-border)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Done / Close
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '9px 24px',
                      borderRadius: 6,
                      background: 'var(--color-primary)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(18, 63, 59, 0.2)',
                    }}
                  >
                    💾 Save & Apply To Page Immediately
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOP HEADER: TITLE, BADGES & USER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
              TalentPool365 CMS Dashboard
            </span>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
                background: isSanityLive ? '#DCFCE7' : '#FEF3C7',
                color: isSanityLive ? '#166534' : '#92400E',
                border: `1px solid ${isSanityLive ? '#86EFAC' : '#FCD34D'}`,
              }}
            >
              {isSanityLive ? '● Sanity Cloud Connected' : '● Live Dual-Sync Active'}
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
            Central content hub managing all 29 website pages, products, pricing tiers, and global content.
          </p>
        </div>

        {/* TOP ACTION BAR: USER, CHANGE PASSWORD & SIGN OUT */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: 'var(--radius)',
              padding: '7px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#065F46',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></span>
            <span>Admin: {currentUser}</span>
          </div>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            title="Change Studio Admin Password"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: '#fff',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            🔑 Change Password
          </button>

          <button
            onClick={handleLogout}
            title="Sign out and lock Studio"
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius)',
              border: '1px solid #FECACA',
              background: '#FEF2F2',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#DC2626',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>

          <a
            href="/pricing"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: '#fff',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              textDecoration: 'none',
            }}
          >
            👁️ Preview Pricing
          </a>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: '#fff',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              textDecoration: 'none',
            }}
          >
            👁️ Preview Home
          </a>
          <button
            onClick={() => {
              if (confirm('Reset all website content back to factory defaults?')) {
                resetDefaults();
                setPricingDraft(pricing);
                notify('Content reset to factory defaults.');
              }
            }}
            title="Reset pricing and content back to defaults"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid #FECACA',
              background: '#FEF2F2',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#DC2626',
              cursor: 'pointer',
            }}
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {saveNotification && (
        <div
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 'var(--radius)',
            marginBottom: 20,
            boxShadow: 'var(--shadow-md)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{saveNotification}</span>
          <button
            onClick={() => setSaveNotification(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ×
          </button>
        </div>
      )}

      {/* TOP KPI DASHBOARD CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {/* Card 1 */}
        <div
          onClick={() => setActiveTab('dashboard')}
          style={{
            background: '#ffffff',
            padding: '20px 22px',
            borderRadius: 'var(--radius)',
            border: activeTab === 'dashboard' ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Total Website Pages
            </span>
            <span style={{ fontSize: '1.3rem' }}>📄</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {STATIC_ALL_PAGES.length} Pages
          </div>
          <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
            ● 100% Live & Navigable
          </span>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => setActiveTab('products')}
          style={{
            background: '#ffffff',
            padding: '20px 22px',
            borderRadius: 'var(--radius)',
            border: activeTab === 'products' ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Product Engines
            </span>
            <span style={{ fontSize: '1.3rem' }}>🚀</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            9 Products
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
            Sourcing to Compliance
          </span>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => setActiveTab('pricing')}
          style={{
            background: '#ffffff',
            padding: '20px 22px',
            borderRadius: 'var(--radius)',
            border: activeTab === 'pricing' ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Subscription Plans
            </span>
            <span style={{ fontSize: '1.3rem' }}>💳</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            3 Plans
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
            Starter, Pro & Enterprise
          </span>
        </div>

        {/* Card 4 */}
        <div
          onClick={() => setActiveTab('sanity')}
          style={{
            background: '#ffffff',
            padding: '20px 22px',
            borderRadius: 'var(--radius)',
            border: activeTab === 'sanity' ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              CMS Sync Engine
            </span>
            <span style={{ fontSize: '1.3rem' }}>⚡</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: 4 }}>
            Dual-Mode Active
          </div>
          <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
            Self-Hosted CMS Backend
          </span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid var(--color-border)', marginBottom: 28, overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'dashboard' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'dashboard' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          📊 Dashboard & All 29 Pages
        </button>
        <button
          onClick={() => setActiveTab('home')}
          style={{
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'home' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'home' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          🏠 Homepage (16 Sections)
        </button>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'products' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'products' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          📄 All Inner Pages
        </button>
        <button
          onClick={() => setActiveTab('navigation')}
          style={{
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'navigation' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'navigation' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          🧭 Header & Footer
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          style={{
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pricing' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'pricing' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          💰 Pricing & Plans
        </button>
        <button
          onClick={() => setActiveTab('sanity')}
          style={{
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'sanity' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'sanity' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          🚀 Backend & Backup
        </button>
        <button
          onClick={() => setActiveTab('security')}
          style={{
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'security' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'security' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          🔐 Studio Security & Password
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 0: COMPLETE CMS DASHBOARD & ALL 29 PAGES DIRECTORY */}
      {/* ==================================================== */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Header & Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Website Pages Directory (29 Pages)
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Manage, edit content, and inspect live preview links for every page in the platform.
              </p>
            </div>

            {/* Search Input */}
            <div style={{ minWidth: 280 }}>
              <input
                type="text"
                placeholder="🔍 Search pages by title, slug, or category..."
                value={pageSearchQuery}
                onChange={(e) => setPageSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['All', 'Core', 'Products', 'Solutions', 'Company', 'Resources'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: selectedCategory === cat ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: selectedCategory === cat ? 'var(--color-primary)' : '#fff',
                  color: selectedCategory === cat ? '#fff' : 'var(--color-text)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {cat} {cat === 'All' ? `(${STATIC_ALL_PAGES.length})` : `(${STATIC_ALL_PAGES.filter((p) => p.category === cat).length})`}
              </button>
            ))}
          </div>

          {/* Pages Table */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-light)', borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-primary)' }}>Page Title & Path</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-primary)', width: 140 }}>Category</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-primary)' }}>Content Summary</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-primary)', width: 110, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-primary)', width: 220, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page, idx) => {
                  const hasOverride = Boolean(pageOverrides[page.id]);
                  return (
                    <tr
                      key={page.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        background: idx % 2 === 0 ? '#ffffff' : '#FAFCF9',
                      }}
                    >
                      {/* Title & Path */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.95rem' }}>
                            {hasOverride && pageOverrides[page.id]?.title ? pageOverrides[page.id].title : page.title}
                          </span>
                          {page.badge && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: '#FEF3C7',
                                color: '#92400E',
                                fontWeight: 700,
                              }}
                            >
                              {page.badge}
                            </span>
                          )}
                          {hasOverride && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: '#DCFCE7',
                                color: '#166534',
                                fontWeight: 700,
                              }}
                            >
                              Customized
                            </span>
                          )}
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <code style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', background: 'var(--color-outline-fill)', padding: '2px 6px', borderRadius: 4 }}>
                            {page.path}
                          </code>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 6,
                            background:
                              page.category === 'Core'
                                ? '#E0E7FF'
                                : page.category === 'Products'
                                ? '#E0F2FE'
                                : page.category === 'Solutions'
                                ? '#F3E8FF'
                                : page.category === 'Company'
                                ? '#FEF3C7'
                                : '#F1F5F9',
                            color:
                              page.category === 'Core'
                                ? '#3730A3'
                                : page.category === 'Products'
                                ? '#0369A1'
                                : page.category === 'Solutions'
                                ? '#6B21A8'
                                : page.category === 'Company'
                                ? '#92400E'
                                : '#475569',
                          }}
                        >
                          {page.category}
                        </span>
                      </td>

                      {/* Description */}
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-muted)', fontSize: '0.86rem', maxWidth: 360 }}>
                        {hasOverride && pageOverrides[page.id]?.lede ? pageOverrides[page.id].lede : page.description}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#15803D',
                            background: '#DCFCE7',
                            padding: '3px 8px',
                            borderRadius: 999,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#15803D' }}></span>
                          Live
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            onClick={() => openPageEditor(page)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              background: 'var(--color-primary)',
                              color: '#fff',
                              border: 'none',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <a
                            href={page.path}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              background: '#fff',
                              border: '1px solid var(--color-border)',
                              color: 'var(--color-primary)',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'inline-block',
                            }}
                          >
                            👁️ View
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 1: PRICING & PLANS */}
      {/* ==================================================== */}
      {activeTab === 'pricing' && (
        <div>
          {/* Header & Save Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Pricing Plans, Comparison & FAQs
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Changes here immediately change the Pricing Page (`/pricing`) and Homepage Pricing section.
              </p>
            </div>
            <button
              onClick={handleSavePricing}
              style={{
                padding: '12px 28px',
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: 'var(--radius)',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              💾 Save & Publish Pricing
            </button>
          </div>

          {/* Page Hero Titles */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Pricing Hero Headers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Hero Headline</label>
                <input
                  type="text"
                  value={pricingDraft.heroTitle || ''}
                  onChange={(e) => setPricingDraft({ ...pricingDraft, heroTitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Hero Subtitle</label>
                <input
                  type="text"
                  value={pricingDraft.heroSubtitle || ''}
                  onChange={(e) => setPricingDraft({ ...pricingDraft, heroSubtitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* 3 Plan Cards */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Subscription Plans</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 36 }}>
            {pricingDraft.plans.map((plan, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff',
                  border: plan.isPopular ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  boxShadow: plan.isPopular ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  position: 'relative',
                }}
              >
                {plan.isPopular && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'var(--color-secondary)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 999,
                      textTransform: 'uppercase',
                    }}
                  >
                    Most Popular
                  </span>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Plan Name</label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => updatePlan(idx, 'name', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontWeight: 700, fontSize: '1.1rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Badge</label>
                  <input
                    type="text"
                    value={plan.badge}
                    onChange={(e) => updatePlan(idx, 'badge', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Monthly Price</label>
                    <input
                      type="text"
                      value={plan.priceMonthly}
                      onChange={(e) => updatePlan(idx, 'priceMonthly', e.target.value)}
                      placeholder="$99 or Custom"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontWeight: 700, fontSize: '1.1rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Annual Price</label>
                    <input
                      type="text"
                      value={plan.priceAnnual}
                      onChange={(e) => updatePlan(idx, 'priceAnnual', e.target.value)}
                      placeholder="$79 or Custom"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontWeight: 700, fontSize: '1.1rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Target Audience / Description</label>
                  <textarea
                    rows={2}
                    value={plan.target}
                    onChange={(e) => updatePlan(idx, 'target', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Trial Note</label>
                  <input
                    type="text"
                    value={plan.trialNote}
                    onChange={(e) => updatePlan(idx, 'trialNote', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>CTA Button Text</label>
                    <input
                      type="text"
                      value={plan.ctaText}
                      onChange={(e) => updatePlan(idx, 'ctaText', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>CTA Link URL</label>
                    <input
                      type="text"
                      value={plan.ctaHref}
                      onChange={(e) => updatePlan(idx, 'ctaHref', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Features list */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>Included Features</span>
                    <button
                      onClick={() => addFeatureBullet(idx)}
                      style={{ background: 'var(--color-outline-fill)', border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Add Feature
                    </button>
                  </div>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => updateFeatureBullet(idx, fIdx, e.target.value)}
                        style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid var(--color-border)', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                      <button
                        onClick={() => removeFeatureBullet(idx, fIdx)}
                        style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', borderRadius: 4, padding: '0 8px', cursor: 'pointer', fontSize: '0.85rem' }}
                        title="Remove feature"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Matrix */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Comparison Matrix Rows</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>Feature breakdown across Starter, Professional, and Enterprise.</p>
              </div>
              <button
                onClick={addComparisonRow}
                style={{ padding: '8px 16px', background: 'var(--color-secondary)', color: '#fff', borderRadius: 6, border: 'none', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                + Add Comparison Row
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-light)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid var(--color-border)' }}>Capability / Feature</th>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid var(--color-border)', width: 140 }}>Starter</th>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid var(--color-border)', width: 140 }}>Professional</th>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid var(--color-border)', width: 160 }}>Enterprise</th>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid var(--color-border)', width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pricingDraft.comparisonFeatures.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={row.feature}
                          onChange={(e) => updateComparisonRow(idx, 'feature', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={row.starter}
                          onChange={(e) => updateComparisonRow(idx, 'starter', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={row.pro}
                          onChange={(e) => updateComparisonRow(idx, 'pro', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={row.ent}
                          onChange={(e) => updateComparisonRow(idx, 'ent', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => removeComparisonRow(idx)}
                          style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing FAQs */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Pricing FAQs</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>Frequently asked questions on the pricing page.</p>
              </div>
              <button
                onClick={addFaq}
                style={{ padding: '8px 16px', background: 'var(--color-secondary)', color: '#fff', borderRadius: 6, border: 'none', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                + Add FAQ
              </button>
            </div>

            {pricingDraft.faqs.map((faq, idx) => (
              <div key={idx} style={{ background: 'var(--color-bg-light)', padding: 16, borderRadius: 8, marginBottom: 12, position: 'relative' }}>
                <button
                  onClick={() => removeFaq(idx)}
                  style={{ position: 'absolute', top: 12, right: 12, background: '#FEE2E2', border: 'none', color: '#DC2626', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                >
                  × Remove
                </button>
                <div style={{ marginBottom: 8, paddingRight: 80 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Question</label>
                  <input
                    type="text"
                    value={faq.q}
                    onChange={(e) => updateFaq(idx, 'q', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontWeight: 600, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Answer</label>
                  <textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) => updateFaq(idx, 'a', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'right' }}>
            <button
              onClick={handleSavePricing}
              style={{
                padding: '14px 36px',
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: 'var(--radius)',
                border: 'none',
                fontWeight: 700,
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              💾 Save & Publish All Pricing Changes
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: HOMEPAGE (ALL 16 SECTIONS) */}
      {/* ==================================================== */}
      {activeTab === 'home' && (
        <div style={{ background: '#fff', padding: 28, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <HomeSectionEditor />
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: ALL INNER PAGES FULL CONTENT */}
      {/* ==================================================== */}
      {activeTab === 'products' && (
        <div style={{ background: '#fff', padding: 28, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <PagesContentEditor />
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: HEADER & FOOTER */}
      {/* ==================================================== */}
      {activeTab === 'navigation' && (
        <div style={{ background: '#fff', padding: 28, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <NavigationEditor />
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: SELF-HOSTED CMS BACKEND & BACKUP */}
      {/* ==================================================== */}
      {activeTab === 'sanity' && <BackendSettingsPanel />}

      {/* ==================================================== */}
      {/* TAB 6: STUDIO SECURITY */}
      {/* ==================================================== */}
      {activeTab === 'security' && (
        <div style={{ background: '#fff', padding: 28, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Studio Security & Password Management
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Control authentication credentials to protect your Content Studio and website pricing.
              </p>
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius)',
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              🔑 Open Password Change Dialog
            </button>
          </div>

          <div style={{ maxWidth: 520, background: 'var(--color-bg-light)', padding: 24, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', marginTop: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Set New Admin Password</h3>

            {securityMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: securityMessage.success ? '#DCFCE7' : '#FEF2F2',
                  border: `1px solid ${securityMessage.success ? '#86EFAC' : '#FECACA'}`,
                  color: securityMessage.success ? '#166534' : '#DC2626',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                {securityMessage.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 4 characters)"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: 6,
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Save New Password
                </button>
                <button
                  type="button"
                  onClick={handleResetPasswordDefault}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 6,
                    background: '#fff',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset to Default ("admin")
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
