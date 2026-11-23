import { useCms } from '../../cms/CmsProvider';
import { usePath } from '../../lib/router';
import { getAuthToken } from '../../cms/api';

export function AdminQuickEditBar() {
  const { currentUser, isPreviewMode, hasDraftChanges } = useCms();
  const path = usePath();

  // Only render if user is authenticated and not currently on /admin or /studio
  const token = getAuthToken();
  if (!token || path === '/admin' || path === '/studio') {
    return null;
  }

  // Also do not render inside an iframe preview drawer
  const inIframe = typeof window !== 'undefined' && window.self !== window.top;
  if (inIframe) return null;

  const togglePreview = () => {
    const url = new URL(window.location.href);
    if (isPreviewMode) {
      url.searchParams.delete('preview');
    } else {
      url.searchParams.set('preview', 'draft');
    }
    window.location.href = url.toString();
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        borderRadius: 9999,
        padding: '8px 18px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: 'var(--font-body)',
        fontSize: '0.82rem',
        fontWeight: 600,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isPreviewMode ? '#F59E0B' : '#10B981',
          }}
        />
        <span style={{ color: '#E2E8F0' }}>
          {currentUser ? `${currentUser.username} (${currentUser.role})` : 'CMS Admin'}
        </span>
      </div>

      <span style={{ color: '#475569' }}>|</span>

      <button
        type="button"
        onClick={togglePreview}
        title="Toggle between viewing live published site or draft preview"
        style={{
          background: isPreviewMode ? '#D97706' : '#334155',
          border: 'none',
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {isPreviewMode ? '👁️ Viewing: Draft' : '🌐 Viewing: Live'}
      </button>

      {hasDraftChanges && (
        <span
          style={{
            background: '#EF4444',
            color: '#fff',
            fontSize: '0.7rem',
            padding: '2px 7px',
            borderRadius: 999,
            fontWeight: 800,
          }}
        >
          Draft Changes Pending
        </span>
      )}

      <a
        href={`/studio?tab=products&page=${encodeURIComponent(path)}`}
        style={{
          color: '#38BDF8',
          textDecoration: 'none',
          padding: '4px 8px',
          borderRadius: 4,
        }}
      >
        ✏️ Edit Page
      </a>

      <a
        href={`/studio?tab=seo&route=${encodeURIComponent(path)}`}
        style={{
          color: '#A78BFA',
          textDecoration: 'none',
          padding: '4px 8px',
          borderRadius: 4,
        }}
      >
        🎯 Page SEO
      </a>

      <a
        href="/studio"
        style={{
          background: 'var(--color-primary)',
          color: '#fff',
          textDecoration: 'none',
          padding: '5px 12px',
          borderRadius: 999,
          fontWeight: 700,
        }}
      >
        Studio Hub →
      </a>
    </div>
  );
}
