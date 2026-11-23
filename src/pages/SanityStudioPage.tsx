import { useState, type CSSProperties, type FormEvent } from 'react';
import { useCms } from '../cms/CmsProvider';
import type { CmsUser } from '../cms/permissions';
import { StudioShell, type StudioTabId } from '../components/cms/StudioShell';
import { HomeSectionEditor } from '../components/cms/HomeSectionEditor';
import { NavigationEditor } from '../components/cms/NavigationEditor';
import { PagesContentEditor } from '../components/cms/PagesContentEditor';
import { PageBuilderPanel } from '../components/cms/PageBuilderPanel';
import { PricingEditorPanel } from '../components/cms/PricingEditorPanel';
import { MediaLibraryPanel } from '../components/cms/MediaLibraryPanel';
import { RevisionHistoryPanel } from '../components/cms/RevisionHistoryPanel';
import { LeadsInboxPanel } from '../components/cms/LeadsInboxPanel';
import { SeoPluginPanel } from '../components/cms/SeoPluginPanel';
import { TeamUsersPanel } from '../components/cms/TeamUsersPanel';
import { AuditLogPanel } from '../components/cms/AuditLogPanel';
import { WebhooksPanel } from '../components/cms/WebhooksPanel';
import { BackendSettingsPanel } from '../components/cms/BackendSettingsPanel';

export interface PageItem {
  id: string;
  title: string;
  path: string;
  category: 'Core' | 'Products' | 'Company' | 'Solutions' | 'Resources';
  description: string;
  badge?: string;
  editableSection?: 'pricing' | 'home' | 'product' | 'navigation' | 'generic';
}

export const STATIC_ALL_PAGES: PageItem[] = [
  { id: 'home', title: 'Home Page', path: '/', category: 'Core', description: 'Main landing page featuring Agentic AI sourcing, screening, assessments, and interview automation.', badge: 'High Traffic', editableSection: 'home' },
  { id: 'pricing', title: 'Pricing & Plans', path: '/pricing', category: 'Core', description: '14-day free trial, Starter, Professional, and Enterprise plans with comparison matrix and FAQs.', badge: 'Conversion Key', editableSection: 'pricing' },
  { id: 'get-started', title: 'Get Started & Demo', path: '/get-started', category: 'Core', description: 'Interactive demo booking and free trial registration form.', badge: 'Conversion Key', editableSection: 'generic' },
  { id: 'how-it-works', title: 'How It Works', path: '/how-it-works', category: 'Core', description: 'End-to-end recruitment workflow from job requisition intake to interview evaluation.', editableSection: 'generic' },
  { id: 'support', title: 'Support & Help Center', path: '/support', category: 'Core', description: 'Knowledge base, support contact, SLA details, and onboarding documentation.', editableSection: 'generic' },

  { id: 'products-overview', title: 'Platform Overview', path: '/products', category: 'Products', description: 'Interactive overview of all nine hiring products and how they connect.', badge: 'Product Hub', editableSection: 'generic' },
  { id: 'prod-talent-sourcing', title: 'Talent Sourcing', path: '/products/talent-sourcing', category: 'Products', description: 'Agentic AI candidate discovery across ATS, resume databases, and job board pools.', editableSection: 'product' },
  { id: 'prod-candidate-screening', title: 'Candidate Screening', path: '/products/candidate-screening', category: 'Products', description: 'Automated semantic resume parsing, match scoring, and unbiased shortlisting.', editableSection: 'product' },
  { id: 'prod-ai-assessments', title: 'Agentic AI Assessments', path: '/products/ai-assessments', category: 'Products', description: 'Technical, aptitude, and cognitive tests graded autonomously against company bars.', editableSection: 'product' },
  { id: 'prod-ai-interviews', title: 'Agentic AI Interviews', path: '/products/ai-interviews', category: 'Products', description: 'Structured video, voice, and live coding interviews with anti-cheat proctoring.', editableSection: 'product' },
  { id: 'prod-recruiter-workspace', title: 'Recruiter Workspace', path: '/products/recruiter-workspace', category: 'Products', description: 'Collaborative candidate pipelines, hiring team notes, and approval workflows.', editableSection: 'product' },
  { id: 'prod-candidate-engagement', title: 'Candidate Engagement', path: '/products/candidate-engagement', category: 'Products', description: 'WhatsApp, SMS, and email candidate nurturing with instant updates.', editableSection: 'product' },
  { id: 'prod-hiring-offer-management', title: 'Hiring & Offer Management', path: '/products/hiring-offer-management', category: 'Products', description: 'Final interviews, scorecards, automated offer letters, and e-signatures.', editableSection: 'product' },
  { id: 'prod-analytics-reporting', title: 'Analytics & Reporting', path: '/products/analytics-reporting', category: 'Products', description: 'Time-to-hire, funnel drop-off, recruiter productivity KPIs, and diversity metrics.', editableSection: 'product' },
  { id: 'prod-compliance-security', title: 'Enterprise Compliance & Security', path: '/products/compliance-security', category: 'Products', description: 'SOC 2 Type II, ISO 27001, GDPR compliance, audit trails, and role-based access.', editableSection: 'product' },

  { id: 'solutions', title: 'Solutions Overview', path: '/solutions', category: 'Solutions', description: 'Customized recruitment workflows for Technology, Healthcare, Finance, and High-Volume hiring.', editableSection: 'generic' },
  { id: 'integrations', title: 'Integrations Ecosystem', path: '/integrations', category: 'Solutions', description: 'Direct integrations with Workday, Greenhouse, Lever, SAP SuccessFactors, Slack, and calendars.', badge: '40+ Connectors', editableSection: 'generic' },
  { id: 'customers', title: 'Customer Stories', path: '/customers', category: 'Solutions', description: 'Quotes, testimonials, and verified hiring speed results from talent leaders.', editableSection: 'generic' },
  { id: 'case-studies', title: 'Case Studies', path: '/case-studies', category: 'Solutions', description: 'In-depth case studies documenting 68% time-to-hire reduction and 45% cost savings.', badge: 'Proof Data', editableSection: 'generic' },

  { id: 'company-about', title: 'About TalentPool365', path: '/company/about', category: 'Company', description: 'Company mission, founding vision, leadership values, and global operations.', editableSection: 'generic' },
  { id: 'company-leadership', title: 'Leadership Team', path: '/company/leadership', category: 'Company', description: 'Executive profiles, advisory board, and product leadership team.', editableSection: 'generic' },
  { id: 'company-careers', title: 'Careers & Hiring', path: '/company/careers', category: 'Company', description: 'Open engineering, product, and sales positions in Amsterdam, Austin, and Bengaluru.', editableSection: 'generic' },
  { id: 'company-partners', title: 'Partners Program', path: '/company/partners', category: 'Company', description: 'Technology, implementation, and referral partner programs.', editableSection: 'generic' },
  { id: 'company-technology', title: 'Technology & AI Guardrails', path: '/company/technology', category: 'Company', description: 'Explainable AI scoring, zero hallucinations, bias mitigation, and algorithm safety.', editableSection: 'generic' },
  { id: 'company-news', title: 'News & Press Releases', path: '/company/news', category: 'Company', description: 'Company announcements, industry awards, and press release archive.', editableSection: 'generic' },
  { id: 'company-contact', title: 'Contact Us', path: '/company/contact', category: 'Company', description: 'Direct sales inquiry forms, press contact, phone numbers, and office addresses.', editableSection: 'generic' },

  { id: 'resources', title: 'Resources & Guides', path: '/resources', category: 'Resources', description: 'E-books, hiring checklists, ROI calculators, and talent acquisition whitepapers.', editableSection: 'generic' },
  { id: 'blog', title: 'Hiring Notes & Blog', path: '/blog', category: 'Resources', description: 'Articles, recruiting benchmarks, and practical guides on Agentic AI hiring.', editableSection: 'generic' },
  { id: 'legal', title: 'Legal & Privacy Policy', path: '/legal', category: 'Resources', description: 'Terms of service, privacy notice, GDPR policy, DPA, and cookies.', editableSection: 'generic' },
];

const cardStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 20,
  boxShadow: 'var(--shadow-sm)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  fontSize: '0.86rem',
  background: '#ffffff',
  color: '#0f172a',
  boxSizing: 'border-box',
  outline: 'none',
};

export function SanityStudioPage() {
  const { draftSite, updatePageOverride, customPages, storageMode, isBackendLive } = useCms();
  const pageOverrides = draftSite.pageOverrides || {};

  const [activeTab, setActiveTab] = useState<StudioTabId>('dashboard');
  const [shellUser, setShellUser] = useState<CmsUser | null>(null);

  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [editFormDraft, setEditFormDraft] = useState({
    title: '',
    eyebrow: '',
    headline: '',
    lede: '',
    primaryCtaText: '',
    primaryCtaHref: '',
    secondaryCtaText: '',
    secondaryCtaHref: '',
  });
  const [notification, setNotification] = useState<string | null>(null);

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

  const handleSavePageOverride = (e: FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    updatePageOverride(editingPage.path, editFormDraft);
    setNotification(`Page copy for "${editingPage.title}" staged in draft.`);
    setEditingPage(null);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredPages = STATIC_ALL_PAGES.filter((page) => {
    const q = pageSearchQuery.toLowerCase();
    const matchesSearch =
      page.title.toLowerCase().includes(q) ||
      page.path.toLowerCase().includes(q) ||
      page.category.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'All' || page.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <StudioShell activeTab={activeTab} onTabChange={setActiveTab} onUserChange={setShellUser}>
      {notification && (
        <div
          style={{
            marginBottom: 18,
            padding: '12px 16px',
            borderRadius: 10,
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '0.88rem',
            fontWeight: 700,
          }}
        >
          ✅ {notification}
        </div>
      )}

      {/* TAB: DASHBOARD & ALL 29 PAGES */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* KPI Summary Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Built-In Pages
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: 4 }}>
                29 Routes
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary)', fontWeight: 600, marginTop: 2 }}>
                Every headline &amp; section editable
              </div>
            </div>

            <div
              onClick={() => setActiveTab('page_builder')}
              style={{ ...cardStyle, cursor: 'pointer' }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Page Builder
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: 4 }}>
                {customPages.length} Custom Page{customPages.length === 1 ? '' : 's'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary)', fontWeight: 600, marginTop: 2 }}>
                9 modular landing blocks →
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Database Engine
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: 4 }}>
                {storageMode === 'postgresql' ? 'PostgreSQL' : 'Local JSON'}
              </div>
              <div style={{ fontSize: '0.78rem', color: isBackendLive ? '#059669' : '#d97706', fontWeight: 600, marginTop: 2 }}>
                {isBackendLive ? '● Backend API Connected' : '○ Offline / Cache Mode'}
              </div>
            </div>

            <div
              onClick={() => setActiveTab('home')}
              style={{ ...cardStyle, cursor: 'pointer' }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Quick Jump
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: 8 }}>
                Edit Homepage (16 Sections) →
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                Hero, products, ROI, FAQ &amp; banners
              </div>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div
            style={{
              ...cardStyle,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Website Pages Directory (29 Pages)
              </h2>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                Edit page hero copy directly or preview live pages.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="🔍 Search title or URL..."
                value={pageSearchQuery}
                onChange={(e) => setPageSearchQuery(e.target.value)}
                style={{ ...inputStyle, width: 220 }}
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ ...inputStyle, width: 160, fontWeight: 600 }}
              >
                <option value="All">All Categories</option>
                <option value="Core">Core Pages</option>
                <option value="Products">9 Products</option>
                <option value="Solutions">Solutions</option>
                <option value="Company">Company</option>
                <option value="Resources">Resources</option>
              </select>
            </div>
          </div>

          {/* Pages Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 14 }}>
            {filteredPages.map((page) => {
              const hasOverride = Boolean(pageOverrides[page.path] || pageOverrides[page.id]);
              return (
                <div
                  key={page.id}
                  style={{
                    ...cardStyle,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: '#f1f5f9',
                          color: '#475569',
                          textTransform: 'uppercase',
                        }}
                      >
                        {page.category}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: hasOverride ? '#ecfdf5' : '#f8fafc',
                          color: hasOverride ? '#065f46' : '#94a3b8',
                          border: `1px solid ${hasOverride ? '#a7f3d0' : '#e2e8f0'}`,
                        }}
                      >
                        {hasOverride ? 'CMS Modified' : 'Default'}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 2px', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      {page.title}
                    </h4>
                    <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--color-secondary)', marginBottom: 8 }}>
                      {page.path}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45 }}>
                      {page.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: 10,
                    }}
                  >
                    <a
                      href={page.path}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', textDecoration: 'none' }}
                    >
                      👁️ View Live
                    </a>
                    <button
                      type="button"
                      onClick={() => openPageEditor(page)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 7,
                        border: 'none',
                        background: '#eef2ff',
                        color: '#3730a3',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      ✏️ Edit Copy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'home' && <HomeSectionEditor />}
      {activeTab === 'page_builder' && <PageBuilderPanel />}
      {activeTab === 'inner_pages' && <PagesContentEditor />}
      {activeTab === 'pricing' && <PricingEditorPanel />}
      {activeTab === 'navigation' && <NavigationEditor />}
      {activeTab === 'media' && <MediaLibraryPanel />}
      {activeTab === 'revisions' && <RevisionHistoryPanel />}
      {activeTab === 'leads' && <LeadsInboxPanel />}
      {activeTab === 'seo' && <SeoPluginPanel />}
      {activeTab === 'users' && <TeamUsersPanel currentUser={shellUser} />}
      {activeTab === 'audit' && <AuditLogPanel />}
      {activeTab === 'webhooks' && <WebhooksPanel />}
      {activeTab === 'backend' && <BackendSettingsPanel />}

      {/* Quick Page Copy Override Modal */}
      {editingPage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 520, width: '100%', padding: 24, boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  Editing Page: {editingPage.title}
                </h3>
                <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--color-secondary)' }}>
                  {editingPage.path}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePageOverride} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Hero Headline</label>
                <input
                  type="text"
                  value={editFormDraft.headline}
                  onChange={(e) => setEditFormDraft({ ...editFormDraft, headline: e.target.value })}
                  style={{ ...inputStyle, fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Eyebrow Tag</label>
                <input
                  type="text"
                  value={editFormDraft.eyebrow}
                  onChange={(e) => setEditFormDraft({ ...editFormDraft, eyebrow: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Hero Lede / Subtitle</label>
                <textarea
                  rows={3}
                  value={editFormDraft.lede}
                  onChange={(e) => setEditFormDraft({ ...editFormDraft, lede: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Primary CTA Text</label>
                  <input
                    type="text"
                    value={editFormDraft.primaryCtaText}
                    onChange={(e) => setEditFormDraft({ ...editFormDraft, primaryCtaText: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Primary CTA Link</label>
                  <input
                    type="text"
                    value={editFormDraft.primaryCtaHref}
                    onChange={(e) => setEditFormDraft({ ...editFormDraft, primaryCtaHref: e.target.value })}
                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Secondary CTA Text</label>
                  <input
                    type="text"
                    value={editFormDraft.secondaryCtaText}
                    onChange={(e) => setEditFormDraft({ ...editFormDraft, secondaryCtaText: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Secondary CTA Link</label>
                  <input
                    type="text"
                    value={editFormDraft.secondaryCtaHref}
                    onChange={(e) => setEditFormDraft({ ...editFormDraft, secondaryCtaHref: e.target.value })}
                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  💾 Stage Page Copy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudioShell>
  );
}

export default SanityStudioPage;
