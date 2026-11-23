import { useState } from 'react';
import { useCms } from '../../cms/CmsProvider';

export function BackendSettingsPanel() {
  const {
    isBackendLive,
    storageMode,
    hasDraftChanges,
    lastSyncedAt,
    cmsApiUrl,
    setBackendUrl,
    refreshFromBackend,
    publishAllToBackend,
    exportSiteJson,
    importSiteJson,
    resetDefaults,
  } = useCms();

  const [urlInput, setUrlInput] = useState(cmsApiUrl);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const handlePublish = async () => {
    setBusy(true);
    setStatusMsg(null);
    const res = await publishAllToBackend();
    setBusy(false);
    setStatusMsg({ type: res.success ? 'ok' : 'err', text: res.message });
  };

  const handleSaveUrl = async () => {
    setBusy(true);
    await setBackendUrl(urlInput);
    const ok = await refreshFromBackend();
    setBusy(false);
    setStatusMsg({
      type: ok ? 'ok' : 'err',
      text: ok
        ? 'Connected to your self-hosted CMS Backend API!'
        : 'Saved API URL, but health check did not respond yet. Verify the backend server is running.',
    });
  };

  const handleDownloadJson = () => {
    const json = exportSiteJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talentpool365-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'ok', text: 'Downloaded full website CMS backup JSON!' });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importSiteJson(String(reader.result || ''));
      setStatusMsg({ type: res.success ? 'ok' : 'err', text: res.message });
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ background: '#fff', padding: 28, borderRadius: 12, border: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
        Self-Hosted CMS Backend &amp; Deployment
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20 }}>
        100% independent CMS powered by your own Node.js backend (`server/index.js`) — no Sanity or third-party CMS required.
      </p>

      {/* Live Connection Status Card */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 10,
          marginBottom: 20,
          background: isBackendLive ? '#ecfdf5' : '#fffbeb',
          border: `1px solid ${isBackendLive ? '#6ee7b7' : '#fcd34d'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <strong style={{ color: isBackendLive ? '#065f46' : '#92400e', fontSize: '0.95rem' }}>
            {isBackendLive ? '● Connected to Self-Hosted CMS Backend API' : '○ Local Preview Mode (Backend Offline)'}
          </strong>
          <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: 4 }}>
            Engine: <strong>{storageMode === 'postgresql' ? 'PostgreSQL (Persistent Cloud DB)' : 'Local Atomic JSON'}</strong>
            {' · '}Endpoint: <code>{cmsApiUrl || 'Same-Origin (/api/cms/*)'}</code>
            {hasDraftChanges && ' · Unpublished draft changes pending'}
            {lastSyncedAt && ` · Last saved: ${new Date(lastSyncedAt).toLocaleString()}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => refreshFromBackend()}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#0f172a',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Re-check Health
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handlePublish}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#059669',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {busy ? 'Publishing...' : 'Publish All Live to Backend'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 18,
            background: statusMsg.type === 'ok' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${statusMsg.type === 'ok' ? '#86efac' : '#fecaca'}`,
            color: statusMsg.type === 'ok' ? '#166534' : '#991b1b',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Optional Remote Backend URL */}
      <div style={{ padding: 18, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
          Backend API URL (Optional Override)
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 12px' }}>
          Leave blank when deployed as a single Render Node Web Service (same origin). If you deploy the backend on a separate URL, paste it here (e.g. <code>https://my-cms-api.onrender.com</code>).
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Leave blank for same-origin (/api/cms/*)"
            style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={handleSaveUrl}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#0f172a',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Save &amp; Test
          </button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div style={{ padding: 18, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px' }}>Backup &amp; Restore Full Site</h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 14 }}>
            Export a complete JSON snapshot of all 29 pages, or import a backup anytime.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleDownloadJson}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #0284c7',
                background: '#f0f9ff',
                color: '#0369a1',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Export Full Site JSON
            </button>
            <label
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#0f172a',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Import Site JSON
              <input type="file" accept="application/json" onChange={handleImportFile} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div style={{ padding: 18, borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px', color: '#991b1b' }}>Reset to Factory Defaults</h3>
          <p style={{ fontSize: '0.82rem', color: '#7f1d1d', marginBottom: 14 }}>
            Restore all 29 pages, homepage sections, and navigation back to original defaults.
          </p>
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Reset ALL website content back to defaults?')) {
                await resetDefaults();
                setStatusMsg({ type: 'ok', text: 'All website content restored to defaults.' });
              }
            }}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              background: '#dc2626',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Reset Entire Website
          </button>
        </div>
      </div>
    </div>
  );
}
