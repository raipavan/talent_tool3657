import { useState, useRef, useEffect } from 'react';
import { useCms } from '../../cms/CmsProvider';

export function LivePreviewDrawer({
  isOpen,
  onClose,
  initialRoute = '/',
}: {
  isOpen: boolean;
  onClose: () => void;
  initialRoute?: string;
}) {
  const { draftSite, customPages } = useCms();
  const [route, setRoute] = useState(initialRoute);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync route if initialRoute prop changes
  useEffect(() => {
    if (initialRoute) setRoute(initialRoute);
  }, [initialRoute]);

  // Sync draft data to iframe via postMessage whenever draftSite changes
  useEffect(() => {
    if (!isOpen || !iframeRef.current) return;
    try {
      iframeRef.current.contentWindow?.postMessage(
        { type: 'tp365:cms:draft-sync', draft: draftSite },
        '*',
      );
    } catch {
      // ignore cross-origin if any
    }
  }, [draftSite, isOpen, route]);

  if (!isOpen) return null;

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '390px',
  };

  const previewUrl = `${route}${route.includes('?') ? '&' : '?'}preview=draft`;

  const standardPages = [
    { label: 'Home Page (/)', path: '/' },
    { label: 'Platform Overview (/products)', path: '/products' },
    { label: 'AI Talent Sourcing', path: '/products/talent-sourcing' },
    { label: 'Candidate Screening', path: '/products/candidate-screening' },
    { label: 'AI Interviews', path: '/products/ai-interviews' },
    { label: 'Recruiter Workspace', path: '/products/recruiter-workspace' },
    { label: 'Solutions (/solutions)', path: '/solutions' },
    { label: 'Integrations (/integrations)', path: '/integrations' },
    { label: 'How It Works (/how-it-works)', path: '/how-it-works' },
    { label: 'Pricing & Plans (/pricing)', path: '/pricing' },
    { label: 'Get Started & Demo (/get-started)', path: '/get-started' },
    { label: 'Case Studies (/case-studies)', path: '/case-studies' },
    { label: 'Resources Hub (/resources)', path: '/resources' },
    { label: 'Recruitment Blog (/blog)', path: '/blog' },
    { label: 'About Us (/company/about)', path: '/company/about' },
    { label: 'Contact Us (/company/contact)', path: '/company/contact' },
    { label: 'Support (/support)', path: '/support' },
    { label: 'Legal & Privacy (/legal)', path: '/legal' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header / Viewport Bar */}
      <div
        style={{
          background: '#0f172a',
          color: '#fff',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong style={{ fontSize: '0.95rem', color: '#38bdf8' }}>
            ⚡ Live Split-Screen Visual Preview
          </strong>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              background: '#f59e0b',
              color: '#000',
              padding: '2px 8px',
              borderRadius: 999,
            }}
          >
            REAL-TIME DRAFT SYNC
          </span>
        </div>

        {/* Route Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Preview Route:</label>
          <select
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <optgroup label="Standard Pages">
              {standardPages.map((p) => (
                <option key={p.path} value={p.path}>
                  {p.label}
                </option>
              ))}
            </optgroup>
            {customPages && customPages.length > 0 && (
              <optgroup label="Custom Dynamic Pages">
                {customPages.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.title} ({p.slug})
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          <button
            type="button"
            onClick={() => {
              if (iframeRef.current) iframeRef.current.src = previewUrl;
            }}
            title="Reload preview iframe"
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              background: '#334155',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            🔄 Reload
          </button>
        </div>

        {/* Viewport Width Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: viewport === 'desktop' ? '#0284c7' : '#1e293b',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🖥️ Desktop (100%)
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: viewport === 'tablet' ? '#0284c7' : '#1e293b',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📱 Tablet (768px)
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: viewport === 'mobile' ? '#0284c7' : '#1e293b',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📱 Mobile (390px)
          </button>

          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              background: '#334155',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            ↗ Open in Tab
          </a>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: '#dc2626',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
              marginLeft: 8,
            }}
          >
            ✕ Close Preview
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div
        style={{
          flex: 1,
          background: '#090d16',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          padding: viewport === 'desktop' ? 0 : '16px 20px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: viewportWidths[viewport],
            maxWidth: '100%',
            height: '100%',
            background: '#fff',
            borderRadius: viewport === 'desktop' ? 0 : 12,
            boxShadow: viewport === 'desktop' ? 'none' : '0 25px 50px -12px rgba(0,0,0,0.7)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.25s ease',
          }}
        >
          <iframe
            ref={iframeRef}
            src={previewUrl}
            title="Live Visual Draft Preview"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
}
