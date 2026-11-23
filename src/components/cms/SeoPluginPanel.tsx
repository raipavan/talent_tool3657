import { useState, useEffect, type CSSProperties, type FormEvent } from 'react';
import { useCms } from '../../cms/CmsProvider';
import { listRedirects, saveRedirect, deleteRedirect } from '../../cms/api';
import type { PageSeoMeta, RedirectModel, SiteSettingsModel } from '../../cms/siteDefaults';
import { MediaPickerModal } from './MediaPickerModal';

const STATIC_PAGE_OPTIONS = [
  { path: '/', title: 'Home — Platform Overview' },
  { path: '/pricing', title: 'Pricing & Plans' },
  { path: '/products', title: 'Platform Overview' },
  { path: '/solutions', title: 'Solutions Overview' },
  { path: '/integrations', title: 'Integrations Ecosystem' },
  { path: '/how-it-works', title: 'How It Works' },
  { path: '/customers', title: 'Customer Stories' },
  { path: '/case-studies', title: 'Case Studies' },
  { path: '/company/about', title: 'About TalentPool365' },
  { path: '/company/leadership', title: 'Leadership Team' },
  { path: '/company/careers', title: 'Careers & Hiring' },
  { path: '/company/partners', title: 'Partners Program' },
  { path: '/company/technology', title: 'Technology & AI Guardrails' },
  { path: '/company/news', title: 'News & Press Releases' },
  { path: '/company/contact', title: 'Contact Us' },
  { path: '/resources', title: 'Resources & Guides' },
  { path: '/blog', title: 'Recruitment Blog' },
  { path: '/support', title: 'Help & Support' },
  { path: '/legal', title: 'Legal & Privacy Policy' },
  { path: '/get-started', title: 'Get Started & Demo' },
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

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#334155',
  marginBottom: 5,
};

export function SeoPluginPanel() {
  const { draftSite, updateSiteSection, customPages } = useCms();
  const currentSiteSettings: SiteSettingsModel = draftSite.siteSettings || {};
  const pageSeoMap: Record<string, PageSeoMeta> = draftSite.pageSeo || {};

  const [activeSubtab, setActiveSubtab] = useState<'perpage' | 'plugins' | 'scripts' | 'redirects'>('perpage');

  // Per-Page SEO
  const [selectedPath, setSelectedPath] = useState('/');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [structuredDataType, setStructuredDataType] = useState('WebPage');
  const [noIndex, setNoIndex] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Analytics & Plugins
  const [siteName, setSiteName] = useState(currentSiteSettings.siteName || 'TalentPool365');
  const [defaultOgImage, setDefaultOgImage] = useState(currentSiteSettings.defaultOgImage || '/assets/hero-aurevia-bg.png');
  const [googleSearchConsole, setGoogleSearchConsole] = useState(currentSiteSettings.googleSearchConsole || '');
  const [ga4Id, setGa4Id] = useState(currentSiteSettings.ga4MeasurementId || '');
  const [gtmId, setGtmId] = useState(currentSiteSettings.gtmContainerId || '');
  const [metaPixelId, setMetaPixelId] = useState(currentSiteSettings.metaPixelId || '');
  const [linkedInId, setLinkedInId] = useState(currentSiteSettings.linkedInPartnerId || '');
  const [hotjarId, setHotjarId] = useState(currentSiteSettings.hotjarId || '');

  // Custom Scripts & Robots
  const [chatWidgetCode, setChatWidgetCode] = useState(currentSiteSettings.chatWidgetCode || '');
  const [customHeaderScript, setCustomHeaderScript] = useState(currentSiteSettings.customHeaderScript || '');
  const [customFooterScript, setCustomFooterScript] = useState(currentSiteSettings.customFooterScript || '');
  const [customRobotsTxt, setCustomRobotsTxt] = useState(currentSiteSettings.customRobotsTxt || '');

  // Redirects
  const [redirects, setRedirects] = useState<RedirectModel[]>([]);
  const [loadingRedirects, setLoadingRedirects] = useState(false);
  const [newSourcePath, setNewSourcePath] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [newStatusCode, setNewStatusCode] = useState<301 | 302>(301);

  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setSiteName(currentSiteSettings.siteName || 'TalentPool365');
    setDefaultOgImage(currentSiteSettings.defaultOgImage || '/assets/hero-aurevia-bg.png');
    setGoogleSearchConsole(currentSiteSettings.googleSearchConsole || '');
    setGa4Id(currentSiteSettings.ga4MeasurementId || '');
    setGtmId(currentSiteSettings.gtmContainerId || '');
    setMetaPixelId(currentSiteSettings.metaPixelId || '');
    setLinkedInId(currentSiteSettings.linkedInPartnerId || '');
    setHotjarId(currentSiteSettings.hotjarId || '');
    setChatWidgetCode(currentSiteSettings.chatWidgetCode || '');
    setCustomHeaderScript(currentSiteSettings.customHeaderScript || '');
    setCustomFooterScript(currentSiteSettings.customFooterScript || '');
    setCustomRobotsTxt(currentSiteSettings.customRobotsTxt || '');
  }, [draftSite.siteSettings]);

  useEffect(() => {
    const seo = pageSeoMap[selectedPath] || {};
    setMetaTitle(
      seo.metaTitle ||
        (selectedPath === '/' ? 'TalentPool365 — Agentic AI Recruitment Platform | Source, Screen & Hire Faster' : ''),
    );
    setMetaDescription(
      seo.metaDescription ||
        (selectedPath === '/'
          ? 'TalentPool365 sources, screens, assesses and interviews candidates automatically. Cut time-to-hire by 68% without adding headcount.'
          : ''),
    );
    setOgImage(seo.ogImage || currentSiteSettings.defaultOgImage || '/assets/hero-aurevia-bg.png');
    setCanonicalUrl(seo.canonicalUrl || '');
    setStructuredDataType(seo.structuredDataType || 'WebPage');
    setNoIndex(Boolean(seo.noIndex));
  }, [selectedPath, draftSite.pageSeo]);

  const loadRedirects = async () => {
    setLoadingRedirects(true);
    try {
      const list = await listRedirects();
      setRedirects(list);
    } finally {
      setLoadingRedirects(false);
    }
  };

  useEffect(() => {
    if (activeSubtab === 'redirects') {
      loadRedirects();
    }
  }, [activeSubtab]);

  const notify = (msg: string) => {
    setErrorMsg(null);
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSavePerPageSeo = () => {
    const nextMap: Record<string, PageSeoMeta> = {
      ...pageSeoMap,
      [selectedPath]: {
        metaTitle,
        metaDescription,
        ogImage,
        canonicalUrl,
        structuredDataType,
        noIndex,
      },
    };
    updateSiteSection('pageSeo', nextMap);
    notify(`SEO metadata for "${selectedPath}" staged in draft.`);
  };

  const handleSaveGlobalSettings = () => {
    const nextSettings: SiteSettingsModel = {
      ...currentSiteSettings,
      siteName,
      defaultOgImage,
      googleSearchConsole,
      ga4MeasurementId: ga4Id,
      gtmContainerId: gtmId,
      metaPixelId,
      linkedInPartnerId: linkedInId,
      hotjarId,
      chatWidgetCode,
      customHeaderScript,
      customFooterScript,
      customRobotsTxt,
      updatedAt: new Date().toISOString(),
    };
    updateSiteSection('siteSettings', nextSettings);
    notify('SEO settings, external plugins, and custom scripts staged in draft.');
  };

  const handleAddRedirect = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSourcePath.trim() || !newTargetUrl.trim()) return;
    setErrorMsg(null);
    const normalizedSource = newSourcePath.trim().startsWith('/') ? newSourcePath.trim() : `/${newSourcePath.trim()}`;
    const res = await saveRedirect({
      sourcePath: normalizedSource,
      targetUrl: newTargetUrl.trim(),
      statusCode: newStatusCode,
      isActive: true,
    });
    if (res.ok) {
      setNewSourcePath('');
      setNewTargetUrl('');
      await loadRedirects();
      notify(`Active HTTP ${newStatusCode} redirect rule added.`);
    } else {
      setErrorMsg(res.error || 'Failed to add redirect rule.');
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    const ok = await deleteRedirect(id);
    if (ok) {
      setRedirects((prev) => prev.filter((r) => r.id !== id));
      notify('Redirect rule removed.');
    }
  };

  const pageOptions = [
    ...STATIC_PAGE_OPTIONS,
    ...(customPages || []).map((p) => ({
      path: p.slug.startsWith('/') ? p.slug : `/${p.slug}`,
      title: `[Custom] ${p.title}`,
    })),
  ];

  const titleLengthColor =
    metaTitle.length >= 50 && metaTitle.length <= 60
      ? '#059669'
      : metaTitle.length > 60
      ? '#dc2626'
      : '#64748b';
  const descLengthColor =
    metaDescription.length >= 120 && metaDescription.length <= 160
      ? '#059669'
      : metaDescription.length > 160
      ? '#dc2626'
      : '#64748b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => {
          setOgImage(url);
          setShowMediaPicker(false);
        }}
      />

      {/* Header */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 4px' }}>
          🌐 SEO Suite, External Plugins &amp; URL Redirects
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Control per-page search snippets, social sharing cards, GA4/GTM/Meta/LinkedIn/Hotjar plugins, scripts, 301/302 redirects, and robots/sitemap.
        </p>
      </div>

      {notification && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '0.86rem',
            fontWeight: 700,
          }}
        >
          ✅ {notification}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.86rem',
            fontWeight: 700,
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Subtab Bar */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #e2e8f0', overflowX: 'auto' }}>
        {[
          { id: 'perpage', label: '🔍 Per-Page SEO & SERP Preview' },
          { id: 'plugins', label: '📊 Analytics & Pixels' },
          { id: 'scripts', label: '💻 Custom Scripts & Chat' },
          { id: 'redirects', label: '↪️ 301/302 Redirects & Sitemap' },
        ].map((tab) => {
          const active = activeSubtab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubtab(tab.id as typeof activeSubtab)}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderBottom: active ? '3px solid var(--color-primary)' : '3px solid transparent',
                background: active ? '#fff' : 'transparent',
                color: active ? 'var(--color-primary)' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: PER-PAGE SEO & SERP */}
      {activeSubtab === 'perpage' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Target Route</label>
              <select
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                style={{ ...inputStyle, fontWeight: 700 }}
              >
                {pageOptions.map((opt) => (
                  <option key={opt.path} value={opt.path}>
                    {opt.path} — {opt.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={labelStyle}>Meta Title</label>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: titleLengthColor }}>
                  {metaTitle.length}/60 chars (ideal 50–60)
                </span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Page Title | TalentPool365"
                style={inputStyle}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={labelStyle}>Meta Description</label>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: descLengthColor }}>
                  {metaDescription.length}/160 chars (ideal 120–160)
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Compelling search summary displayed below your link on Google..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Canonical URL (optional)</label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder={`https://talentpool365.com${selectedPath === '/' ? '' : selectedPath}`}
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Schema.org Type</label>
                <select
                  value={structuredDataType}
                  onChange={(e) => setStructuredDataType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="WebPage">WebPage</option>
                  <option value="SoftwareApplication">SoftwareApplication</option>
                  <option value="Article">Article</option>
                  <option value="FAQPage">FAQPage</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Open Graph / Social Share Image</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="/assets/..."
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  🖼️ Choose Media
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 600, color: '#b91c1c', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={noIndex}
                onChange={(e) => setNoIndex(e.target.checked)}
              />
              Set `noindex, nofollow` (excludes this route from Google and `/sitemap.xml`)
            </label>

            <div style={{ textAlign: 'right', paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={handleSavePerPageSeo}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                💾 Stage Page SEO
              </button>
            </div>
          </div>

          {/* Right Live Previews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
                Google Search Result (SERP Preview)
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.76rem', color: '#334155', marginBottom: 4 }}>
                  <strong>TalentPool365</strong> · https://talentpool365.com{selectedPath === '/' ? '' : selectedPath}
                </div>
                <div style={{ fontSize: '1.08rem', color: '#1d4ed8', fontWeight: 600, marginBottom: 4 }}>
                  {metaTitle || 'Page Title — TalentPool365'}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
                  {metaDescription || 'Add a meta description to preview how search engines summarize this page.'}
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
                Social Card Preview (LinkedIn / Slack / X)
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                {ogImage ? (
                  <img
                    src={ogImage}
                    alt="Social Share Preview"
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block', background: '#e2e8f0' }}
                  />
                ) : (
                  <div style={{ height: 140, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                    No OG Image Selected
                  </div>
                )}
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    talentpool365.com
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                    {metaTitle || 'Page Title'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                    {metaDescription || 'Meta description snippet...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ANALYTICS & EXTERNAL PLUGINS */}
      {activeSubtab === 'plugins' && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-primary)', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                Site &amp; Google Ecosystem
              </h3>
              <div>
                <label style={labelStyle}>Global Brand / Site Name</label>
                <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Google Search Console Verification Token</label>
                <input
                  type="text"
                  value={googleSearchConsole}
                  onChange={(e) => setGoogleSearchConsole(e.target.value)}
                  placeholder="Verification content value"
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Google Analytics 4 (GA4) Measurement ID</label>
                <input
                  type="text"
                  value={ga4Id}
                  onChange={(e) => setGa4Id(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Google Tag Manager Container ID</label>
                <input
                  type="text"
                  value={gtmId}
                  onChange={(e) => setGtmId(e.target.value)}
                  placeholder="GTM-XXXXXXX"
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-primary)', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                Marketing Pixels, Behavior &amp; Defaults
              </h3>
              <div>
                <label style={labelStyle}>Meta (Facebook) Pixel ID</label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="123456789012345"
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={labelStyle}>LinkedIn Insight Tag Partner ID</label>
                <input
                  type="text"
                  value={linkedInId}
                  onChange={(e) => setLinkedInId(e.target.value)}
                  placeholder="543210"
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Hotjar Site ID</label>
                <input
                  type="text"
                  value={hotjarId}
                  onChange={(e) => setHotjarId(e.target.value)}
                  placeholder="9876543"
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Fallback Default OG Image</label>
                <input
                  type="text"
                  value={defaultOgImage}
                  onChange={(e) => setDefaultOgImage(e.target.value)}
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
            <button
              type="button"
              onClick={handleSaveGlobalSettings}
              style={{
                padding: '9px 20px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              💾 Stage Plugin Settings
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CUSTOM SCRIPTS & CHAT WIDGET */}
      {activeSubtab === 'scripts' && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.82rem' }}>
            <strong>Security Notice:</strong> Only paste scripts from trusted vendors (Intercom, Crisp, HubSpot, Segment, schema JSON-LD). Scripts render for all public site visitors once published live.
          </div>

          <div>
            <label style={labelStyle}>Custom &lt;head&gt; Code Injection</label>
            <textarea
              rows={4}
              value={customHeaderScript}
              onChange={(e) => setCustomHeaderScript(e.target.value)}
              placeholder="<!-- Verification tags, JSON-LD, or analytics head snippets -->"
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem', background: '#f8fafc' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Custom Footer Code (before &lt;/body&gt;)</label>
            <textarea
              rows={4}
              value={customFooterScript}
              onChange={(e) => setCustomFooterScript(e.target.value)}
              placeholder="<script>/* Conversion beacons or third-party integrations */</script>"
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem', background: '#f8fafc' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Live Chat Widget Embed (Crisp / Intercom / Drift)</label>
            <textarea
              rows={3}
              value={chatWidgetCode}
              onChange={(e) => setChatWidgetCode(e.target.value)}
              placeholder="<script>...</script>"
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem', background: '#f8fafc' }}
            />
          </div>

          <div style={{ textAlign: 'right', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
            <button
              type="button"
              onClick={handleSaveGlobalSettings}
              style={{
                padding: '9px 20px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              💾 Stage Custom Scripts
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 4: REDIRECTS & SITEMAP / ROBOTS */}
      {activeSubtab === 'redirects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Endpoints Banner */}
          <div
            style={{
              ...cardStyle,
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                🤖 Dynamic XML Sitemap &amp; Robots.txt
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Auto-updated from live pages, published blog posts, custom Page Builder routes, and `noindex` rules.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '7px 14px',
                  borderRadius: 7,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: 'var(--color-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                📄 Open /sitemap.xml ↗
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '7px 14px',
                  borderRadius: 7,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: 'var(--color-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                🤖 Open /robots.txt ↗
              </a>
            </div>
          </div>

          {/* Custom robots.txt override */}
          <div style={cardStyle}>
            <label style={labelStyle}>Custom robots.txt Override (optional — leave blank for automatic defaults)</label>
            <textarea
              rows={4}
              value={customRobotsTxt}
              onChange={(e) => setCustomRobotsTxt(e.target.value)}
              placeholder={'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /studio'}
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: 10 }}
            />
            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={handleSaveGlobalSettings}
                style={{
                  padding: '7px 16px',
                  borderRadius: 7,
                  border: 'none',
                  background: 'var(--color-secondary)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                💾 Stage robots.txt Override
              </button>
            </div>
          </div>

          {/* Add Redirect Rule */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Add 301 / 302 URL Redirect Rule
            </h3>
            <form
              onSubmit={handleAddRedirect}
              style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: 10, alignItems: 'end' }}
            >
              <div>
                <label style={labelStyle}>Source Path</label>
                <input
                  type="text"
                  required
                  value={newSourcePath}
                  onChange={(e) => setNewSourcePath(e.target.value)}
                  placeholder="/old-promo-page"
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Target URL / Path</label>
                <input
                  type="text"
                  required
                  value={newTargetUrl}
                  onChange={(e) => setNewTargetUrl(e.target.value)}
                  placeholder="/pricing or https://..."
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={labelStyle}>HTTP Code</label>
                <select
                  value={newStatusCode}
                  onChange={(e) => setNewStatusCode(Number(e.target.value) as 301 | 302)}
                  style={inputStyle}
                >
                  <option value={301}>301 Permanent</option>
                  <option value={302}>302 Temporary</option>
                </select>
              </div>
              <button
                type="submit"
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Add Rule
              </button>
            </form>
          </div>

          {/* Redirects Table */}
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
              Active Redirect Rules ({redirects.length})
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 16px' }}>Source Path</th>
                    <th style={{ padding: '10px 16px' }}>Target Destination</th>
                    <th style={{ padding: '10px 16px' }}>HTTP Type</th>
                    <th style={{ padding: '10px 16px' }}>Hits</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRedirects ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 28, textAlign: 'center', color: '#94a3b8' }}>
                        Loading redirect rules...
                      </td>
                    </tr>
                  ) : redirects.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 28, textAlign: 'center', color: '#94a3b8' }}>
                        No redirects configured.
                      </td>
                    </tr>
                  ) : (
                    redirects.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', fontFamily: 'monospace' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 700, color: '#0f172a' }}>{r.sourcePath}</td>
                        <td style={{ padding: '10px 16px', color: 'var(--color-secondary)' }}>{r.targetUrl}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: r.statusCode === 301 ? '#dbeafe' : '#fef3c7',
                              color: r.statusCode === 301 ? '#1e40af' : '#92400e',
                            }}
                          >
                            {r.statusCode}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', color: '#64748b' }}>{r.hits || 0}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteRedirect(r.id)}
                            style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700 }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
