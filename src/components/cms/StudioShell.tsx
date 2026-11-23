import { useState, useEffect, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { useCms } from '../../cms/CmsProvider';
import {
  checkSetupStatus,
  setupInitialAdmin,
  loginCmsBackend,
  fetchCurrentUser,
  changeCmsPasswordBackend,
  listLeads,
  setAuthToken,
  getAuthToken,
} from '../../cms/api';
import {
  ROLE_DETAILS,
  canEditContent,
  canManageLeads,
  canManageMedia,
  canManageSeo,
  canManageUsers,
  canManageWebhooks,
  canPublish,
  type CmsUser,
} from '../../cms/permissions';
import { LivePreviewDrawer } from './LivePreviewDrawer';

export type StudioTabId =
  | 'dashboard'
  | 'home'
  | 'page_builder'
  | 'inner_pages'
  | 'pricing'
  | 'navigation'
  | 'media'
  | 'revisions'
  | 'leads'
  | 'seo'
  | 'users'
  | 'audit'
  | 'webhooks'
  | 'backend';

interface StudioShellProps {
  activeTab: StudioTabId;
  onTabChange: (tab: StudioTabId) => void;
  onUserChange?: (user: CmsUser | null) => void;
  children: ReactNode;
}

interface NavItem {
  id: StudioTabId;
  label: string;
  icon: string;
  badge?: string;
  visible?: (role?: string) => boolean;
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  fontSize: '0.9rem',
  background: '#ffffff',
  color: '#0f172a',
  boxSizing: 'border-box',
  outline: 'none',
};

export function StudioShell({ activeTab, onTabChange, onUserChange, children }: StudioShellProps) {
  const {
    hasDraftChanges,
    changedSectionKeys,
    storageMode,
    liveVersion,
    publishDraft,
    discardDraft,
    schedulePublish,
    refreshFromBackend,
  } = useCms();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<CmsUser | null>(null);
  const [needsInitialSetup, setNeedsInitialSetup] = useState(false);
  const [unreadLeadsCount, setUnreadLeadsCount] = useState(0);

  // Login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Setup wizard form (no default passwords!)
  const [setupUsername, setSetupUsername] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupDisplayName, setSetupDisplayName] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishLabel, setPublishLabel] = useState('');
  const [publishNote, setPublishNote] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedTitle, setSchedTitle] = useState('');
  const [schedAt, setSchedAt] = useState('');
  const [schedNote, setSchedNote] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const [showLivePreview, setShowLivePreview] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const updateUser = (u: CmsUser | null) => {
    setCurrentUser(u);
    if (onUserChange) onUserChange(u);
  };

  const loadUnreadLeads = async (role?: string) => {
    if (!canManageLeads(role)) return;
    const items = await listLeads('new');
    setUnreadLeadsCount(items.length);
  };

  const initAuth = async () => {
    setCheckingAuth(true);
    try {
      const status = await checkSetupStatus();
      if (status.needsSetup) {
        setNeedsInitialSetup(true);
        setCheckingAuth(false);
        return;
      }
      setNeedsInitialSetup(false);

      const token = getAuthToken();
      if (token) {
        const meRes = await fetchCurrentUser();
        if (meRes.ok && meRes.user) {
          updateUser(meRes.user);
          await loadUnreadLeads(meRes.user.role);
        } else {
          setAuthToken('');
          updateUser(null);
        }
      }
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) return;
    setLoginLoading(true);
    setLoginError(null);

    const res = await loginCmsBackend(loginUsername.trim(), loginPassword);
    setLoginLoading(false);
    if (!res.ok || !res.token) {
      setLoginError(res.error || 'Invalid username or password.');
      return;
    }

    setAuthToken(res.token, true);
    const loggedInUser: CmsUser = {
      id: 'current',
      username: res.username || loginUsername.trim(),
      role: res.role || 'editor',
      displayName: res.displayName || loginUsername.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    updateUser(loggedInUser);
    setLoginPassword('');
    await refreshFromBackend();
    await loadUnreadLeads(loggedInUser.role);
  };

  const handleSetup = async (e: FormEvent) => {
    e.preventDefault();
    if (setupUsername.trim().length < 3 || setupPassword.length < 8) {
      setSetupError('Username must be at least 3 characters and password at least 8 characters.');
      return;
    }
    setSetupLoading(true);
    setSetupError(null);

    const res = await setupInitialAdmin({
      username: setupUsername.trim(),
      password: setupPassword,
      email: setupEmail.trim() || undefined,
      displayName: setupDisplayName.trim() || undefined,
    });
    setSetupLoading(false);
    if (!res.ok || !res.token) {
      setSetupError(res.error || 'Failed to create Super Admin account.');
      return;
    }

    setAuthToken(res.token, true);
    setNeedsInitialSetup(false);
    const createdUser: CmsUser = res.user || {
      id: 'super-admin',
      username: setupUsername.trim(),
      role: 'super_admin',
      displayName: setupDisplayName.trim() || setupUsername.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    updateUser(createdUser);
    setSetupPassword('');
    await refreshFromBackend();
  };

  const handleLogout = async () => {
    setAuthToken('');
    updateUser(null);
    await refreshFromBackend();
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPass.length < 8) {
      setPassError('New password must be at least 8 characters.');
      return;
    }
    setPassError(null);
    setPassSuccess(null);
    const res = await changeCmsPasswordBackend(currentPass, newPass);
    if (res.ok) {
      setPassSuccess('Password updated successfully.');
      setCurrentPass('');
      setNewPass('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPassSuccess(null);
      }, 1500);
    } else {
      setPassError(res.error || 'Failed to update password.');
    }
  };

  const handleConfirmPublish = async (e: FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    const res = await publishDraft(publishLabel || undefined, publishNote || undefined);
    setPublishing(false);
    setShowPublishModal(false);
    setPublishLabel('');
    setPublishNote('');
    showToast(res.success ? `🚀 ${res.message}` : `⚠️ ${res.message}`);
  };

  const handleConfirmSchedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!schedTitle.trim() || !schedAt) return;
    setScheduling(true);
    const res = await schedulePublish(schedTitle.trim(), new Date(schedAt).toISOString(), schedNote.trim() || undefined);
    setScheduling(false);
    setShowScheduleModal(false);
    setSchedTitle('');
    setSchedAt('');
    setSchedNote('');
    showToast(res.success ? `⏰ ${res.message}` : `⚠️ ${res.message}`);
  };

  // 1. Checking Auth
  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0f172a',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <div style={{ fontSize: '1.6rem' }}>⚡</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94a3b8' }}>
          Initializing TalentPool365 Studio...
        </div>
      </div>
    );
  }

  // 2. First-Time Super Admin Setup Wizard
  if (needsInitialSetup) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #070d14 0%, #123F3B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            padding: 32,
            maxWidth: 440,
            width: '100%',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: '#e4f1e9',
                color: 'var(--color-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 900,
                marginBottom: 12,
              }}
            >
              🛡️
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              Create Super Admin Account
            </h1>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', lineHeight: 1.45 }}>
              First-time workspace setup. Choose your own administrator credentials — no default passwords are active.
            </p>
          </div>

          {setupError && (
            <div style={{ padding: 12, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.84rem', fontWeight: 600, marginBottom: 16 }}>
              ⚠️ {setupError}
            </div>
          )}

          <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                Admin Username * (min 3 characters)
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={setupUsername}
                onChange={(e) => setSetupUsername(e.target.value)}
                placeholder="Choose username"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={setupDisplayName}
                  onChange={(e) => setSetupDisplayName(e.target.value)}
                  placeholder="Your Name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={setupEmail}
                  onChange={(e) => setSetupEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                Master Password * (min 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={setupPassword}
                onChange={(e) => setSetupPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                style={{ ...inputStyle, fontFamily: 'monospace' }}
              />
            </div>

            <button
              type="submit"
              disabled={setupLoading}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '12px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              {setupLoading ? 'Creating Account...' : 'Initialize Studio & Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Hardened Login View (No hardcoded credentials or hints)
  if (!currentUser) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            padding: 32,
            maxWidth: 400,
            width: '100%',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'var(--color-primary)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.25rem',
                marginBottom: 12,
              }}
            >
              T
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              TalentPool365 Studio
            </h1>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
              Sign in with your assigned CMS account credentials.
            </p>
          </div>

          {loginError && (
            <div style={{ padding: 12, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.84rem', fontWeight: 600, marginBottom: 16 }}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter your username"
                style={inputStyle}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Password</label>
                <button
                  type="button"
                  onClick={() => setLoginShowPassword(!loginShowPassword)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-secondary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {loginShowPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={loginShowPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ ...inputStyle, fontFamily: 'monospace' }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '11px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.94rem',
                cursor: 'pointer',
              }}
            >
              {loginLoading ? 'Signing In...' : '🔐 Sign In to Studio'}
            </button>
          </form>

          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <a href="/" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
              ← Return to public website
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated Studio Shell
  const userRole = currentUser.role;

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Content & Pages',
      items: [
        { id: 'dashboard', label: 'Dashboard & 29 Pages', icon: '📊' },
        { id: 'home', label: 'Homepage (16 Sections)', icon: '🏠', visible: canEditContent },
        { id: 'page_builder', label: 'Page Builder (Custom)', icon: '🧱', visible: canEditContent },
        { id: 'inner_pages', label: 'Inner Pages & Blog', icon: '📄', visible: canEditContent },
        { id: 'pricing', label: 'Pricing & Plans', icon: '💰', visible: canEditContent },
        { id: 'navigation', label: 'Header & Footer', icon: '🧭', visible: canEditContent },
      ],
    },
    {
      title: 'Assets & Releases',
      items: [
        { id: 'media', label: 'Media Library', icon: '🖼️', visible: canManageMedia },
        { id: 'revisions', label: 'Revisions & Schedules', icon: '🕒' },
      ],
    },
    {
      title: 'Growth & SEO',
      items: [
        {
          id: 'leads',
          label: 'Leads Inbox',
          icon: '📬',
          badge: unreadLeadsCount > 0 ? String(unreadLeadsCount) : undefined,
          visible: canManageLeads,
        },
        { id: 'seo', label: 'SEO, Plugins & Redirects', icon: '🌐', visible: canManageSeo },
      ],
    },
    {
      title: 'Administration',
      items: [
        { id: 'users', label: 'Team & RBAC', icon: '👥', visible: canManageUsers },
        { id: 'audit', label: 'Audit Trail', icon: '📜', visible: canPublish },
        { id: 'webhooks', label: 'Outbound Webhooks', icon: '🔗', visible: canManageWebhooks },
        { id: 'backend', label: 'Backend & Backup', icon: '🗄️' },
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9', fontFamily: 'var(--font-body)' }}>
      {/* Top Sticky Action Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#0f172a',
          color: '#ffffff',
          borderBottom: '1px solid #1e293b',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => setSidebarHidden((v) => !v)}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.86rem',
            }}
            title="Toggle Menu"
          >
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: 'var(--color-secondary)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.85rem',
              }}
            >
              T
            </span>
            <strong style={{ fontSize: '0.94rem', letterSpacing: '-0.01em' }}>TalentPool365 Studio</strong>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                background: storageMode === 'postgresql' ? '#064e3b' : '#1e293b',
                color: storageMode === 'postgresql' ? '#6ee7b7' : '#cbd5e1',
                border: '1px solid #334155',
              }}
            >
              {storageMode === 'postgresql' ? 'PostgreSQL' : 'Local JSON'}
            </span>
          </div>
        </div>

        {/* Draft State Pill */}
        <div>
          {hasDraftChanges ? (
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(245, 158, 11, 0.18)',
                color: '#fcd34d',
                border: '1px solid rgba(245, 158, 11, 0.4)',
              }}
            >
              🟡 Draft ({changedSectionKeys.length} modified section{changedSectionKeys.length === 1 ? '' : 's'})
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(16, 185, 129, 0.16)',
                color: '#6ee7b7',
                border: '1px solid rgba(16, 185, 129, 0.35)',
              }}
            >
              🟢 Live In Sync (v{liveVersion})
            </span>
          )}
        </div>

        {/* Publish & Preview Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowLivePreview(true)}
            style={{
              padding: '6px 12px',
              borderRadius: 7,
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            👁️ Split Preview
          </button>

          {hasDraftChanges && canEditContent(userRole) && (
            <button
              type="button"
              onClick={async () => {
                if (confirm('Discard all unpublished draft edits and revert to live content?')) {
                  const res = await discardDraft();
                  showToast(res.success ? `↩️ ${res.message}` : `⚠️ ${res.message}`);
                }
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 7,
                border: '1px solid #7f1d1d',
                background: 'rgba(220, 38, 38, 0.15)',
                color: '#fca5a5',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Discard Draft
            </button>
          )}

          {canPublish(userRole) && (
            <>
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 7,
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⏰ Schedule
              </button>
              <button
                type="button"
                onClick={() => setShowPublishModal(true)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  border: 'none',
                  background: '#059669',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🚀 Publish Live
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Split Workspace */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left Sidebar */}
        <aside
          style={{
            width: 248,
            flexShrink: 0,
            background: '#0f172a',
            color: '#cbd5e1',
            borderRight: '1px solid #1e293b',
            display: sidebarHidden ? 'none' : 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {navSections.map((sec) => {
              const visibleItems = sec.items.filter((item) => !item.visible || item.visible(userRole));
              if (visibleItems.length === 0) return null;
              return (
                <div key={sec.title}>
                  <div
                    style={{
                      padding: '0 10px 6px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: '#64748b',
                    }}
                  >
                    {sec.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {visibleItems.map((item) => {
                      const selected = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onTabChange(item.id);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: 'none',
                            background: selected ? 'var(--color-secondary)' : 'transparent',
                            color: selected ? '#ffffff' : '#94a3b8',
                            fontWeight: selected ? 700 : 600,
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </span>
                          {item.badge && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '1px 7px',
                                borderRadius: 999,
                                background: '#ef4444',
                                color: '#fff',
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current User Footer */}
          <div style={{ padding: 14, borderTop: '1px solid #1e293b', background: '#0b1120' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.displayName || currentUser.username}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {ROLE_DETAILS[currentUser.role]?.label || currentUser.role}
                </div>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                title="Open Live Site"
                style={{ fontSize: '0.76rem', color: '#94a3b8', textDecoration: 'none', padding: '4px 7px', border: '1px solid #334155', borderRadius: 6 }}
              >
                ↗ Site
              </a>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#cbd5e1',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🔑 Password
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #7f1d1d',
                  background: 'rgba(220, 38, 38, 0.15)',
                  color: '#fca5a5',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Scrollable Content */}
        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', minWidth: 0 }}>
          {toast && (
            <div
              style={{
                marginBottom: 18,
                padding: '12px 18px',
                borderRadius: 10,
                background: 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <span>{toast}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}
              >
                ✕
              </button>
            </div>
          )}
          <div style={{ maxWidth: 1220, margin: '0 auto' }}>{children}</div>
        </main>
      </div>

      {/* Live Preview Drawer */}
      <LivePreviewDrawer isOpen={showLivePreview} onClose={() => setShowLivePreview(false)} />

      {/* Publish Live Modal */}
      {showPublishModal && (
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
          <form
            onSubmit={handleConfirmPublish}
            style={{ background: '#fff', borderRadius: 14, maxWidth: 440, width: '100%', padding: 24, boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              🚀 Publish Draft to Live Website
            </h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
              Creates an immutable revision snapshot and promotes all staged changes to live production immediately.
            </p>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Release Label</label>
              <input
                type="text"
                value={publishLabel}
                onChange={(e) => setPublishLabel(e.target.value)}
                placeholder="e.g. Q4 Pricing & Hero Update"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Release Notes</label>
              <textarea
                rows={2}
                value={publishNote}
                onChange={(e) => setPublishNote(e.target.value)}
                placeholder="Summary for team audit history..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={publishing}
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                {publishing ? 'Publishing...' : 'Confirm & Publish Live'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedule Release Modal */}
      {showScheduleModal && (
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
          <form
            onSubmit={handleConfirmSchedule}
            style={{ background: '#fff', borderRadius: 14, maxWidth: 440, width: '100%', padding: 24, boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              ⏰ Schedule Draft Release
            </h3>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Release Title *</label>
              <input
                type="text"
                required
                value={schedTitle}
                onChange={(e) => setSchedTitle(e.target.value)}
                placeholder="e.g. Monday Campaign Launch"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Publish Date &amp; Time *</label>
              <input
                type="datetime-local"
                required
                value={schedAt}
                onChange={(e) => setSchedAt(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Notes</label>
              <textarea
                rows={2}
                value={schedNote}
                onChange={(e) => setSchedNote(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={scheduling}
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                {scheduling ? 'Scheduling...' : 'Queue Release'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
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
          <form
            onSubmit={handleChangePassword}
            style={{ background: '#fff', borderRadius: 14, maxWidth: 380, width: '100%', padding: 24, boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              🔑 Change Account Password
            </h3>
            {passError && (
              <div style={{ padding: 10, borderRadius: 8, background: '#fef2f2', color: '#b91c1c', fontSize: '0.82rem', fontWeight: 600 }}>
                ⚠️ {passError}
              </div>
            )}
            {passSuccess && (
              <div style={{ padding: 10, borderRadius: 8, background: '#ecfdf5', color: '#065f46', fontSize: '0.82rem', fontWeight: 600 }}>
                ✅ {passSuccess}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Current Password</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                style={{ ...inputStyle, fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>New Password (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                style={{ ...inputStyle, fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
