import { useState, useEffect, type CSSProperties } from 'react';
import { listAuditLogs, type AuditLogEntry } from '../../cms/api';

const cardStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 20,
  boxShadow: 'var(--shadow-sm)',
};

const inputStyle: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  fontSize: '0.86rem',
  background: '#ffffff',
  color: '#0f172a',
  outline: 'none',
};

function badgeColors(action: string): { bg: string; color: string; border: string } {
  if (action.startsWith('content.publish')) return { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' };
  if (action.startsWith('auth.')) return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  if (action.startsWith('user.')) return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
  if (action.startsWith('media.')) return { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' };
  if (action.startsWith('page.') || action.startsWith('schedule.')) return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
  return { bg: '#f1f5f9', color: '#334155', border: '#e2e8f0' };
}

export function AuditLogPanel() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [inspectEntry, setInspectEntry] = useState<AuditLogEntry | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const items = await listAuditLogs(actionFilter, actorFilter, 150);
      setLogs(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter, actorFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div
        style={{
          ...cardStyle,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 4px' }}>
            📜 Security &amp; Activity Audit Trail
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Tamper-evident record of publishing, rollbacks, user management, media uploads, and login activity.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          disabled={loading}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#fff',
            color: '#334155',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Loading...' : '↻ Refresh Log'}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Filter by actor username..."
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          style={{ ...inputStyle, minWidth: 240, flex: 1, maxWidth: 340 }}
        />

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{ ...inputStyle, minWidth: 220 }}
        >
          <option value="">All Action Types</option>
          <option value="content.publish">content.publish</option>
          <option value="content.rollback">content.rollback</option>
          <option value="content.discard_draft">content.discard_draft</option>
          <option value="schedule.create">schedule.create</option>
          <option value="page.create">page.create</option>
          <option value="page.update">page.update</option>
          <option value="page.delete">page.delete</option>
          <option value="media.upload">media.upload</option>
          <option value="auth.login">auth.login</option>
          <option value="user.setup">user.setup</option>
          <option value="user.create">user.create</option>
          <option value="user.update">user.update</option>
          <option value="user.delete">user.delete</option>
        </select>
      </div>

      {/* Log Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.73rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px' }}>Actor</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
                <th style={{ padding: '12px 16px' }}>Summary</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading audit records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = badgeColors(log.action);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 16px', fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                          {log.actorUsername || 'system'}
                        </div>
                        {log.actorRole && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{log.actorRole}</div>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', color: '#334155', maxWidth: 420 }}>
                        {log.summary || '—'}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setInspectEntry(log)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: '1px solid #c7d2fe',
                            background: '#eef2ff',
                            color: '#4338ca',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Modal */}
      {inspectEntry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 620, width: '100%', padding: 24, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  Audit Event: {inspectEntry.action}
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  {new Date(inspectEntry.createdAt).toUTCString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectEntry(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.8rem', marginBottom: 14 }}>
              <div><strong>Actor:</strong> {inspectEntry.actorUsername} ({inspectEntry.actorRole})</div>
              <div><strong>IP:</strong> <code>{inspectEntry.ipAddress || 'unknown'}</code></div>
              <div><strong>Entity Type:</strong> {inspectEntry.entityType || '—'}</div>
              <div><strong>Entity ID:</strong> <code>{inspectEntry.entityId || '—'}</code></div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Event Metadata JSON
              </div>
              <pre
                style={{
                  background: '#0f172a',
                  color: '#e2e8f0',
                  padding: 14,
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  overflow: 'auto',
                  maxHeight: 240,
                  margin: 0,
                }}
              >
                {JSON.stringify(inspectEntry.metadata || {}, null, 2)}
              </pre>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setInspectEntry(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
