import { useState, useEffect, type CSSProperties, type FormEvent } from 'react';
import {
  listWebhooks,
  saveWebhook,
  deleteWebhook,
  testWebhook,
  type WebhookItem,
} from '../../cms/api';

const AVAILABLE_EVENTS = [
  { id: 'content.published', label: 'Content Published', desc: 'Fires immediately whenever draft content is published live.' },
  { id: 'lead.created', label: 'Lead Submitted', desc: 'Fires when a visitor submits any enquiry, demo, or custom lead form.' },
  { id: '*', label: 'All Webhook Events (*)', desc: 'Subscribe to every system webhook event.' },
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
  fontSize: '0.88rem',
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

export function WebhooksPanel() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingHook, setEditingHook] = useState<WebhookItem | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['content.published', 'lead.created']);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const loadHooks = async () => {
    setLoading(true);
    try {
      const items = await listWebhooks();
      setWebhooks(items);
    } catch {
      setError('Failed to fetch webhooks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHooks();
  }, []);

  const resetForm = () => {
    setName('');
    setUrl('');
    setSecret('');
    setSelectedEvents(['content.published', 'lead.created']);
    setIsActive(true);
    setEditingHook(null);
    setShowModal(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (hook: WebhookItem) => {
    setEditingHook(hook);
    setName(hook.name);
    setUrl(hook.url);
    setSecret(hook.secret || '');
    setSelectedEvents(hook.events || []);
    setIsActive(hook.isActive);
    setShowModal(true);
  };

  const toggleEvent = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      setError('Webhook name and URL are required.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: Partial<WebhookItem> = {
      name: name.trim(),
      url: url.trim(),
      secret: secret.trim() || undefined,
      events: selectedEvents,
      isActive,
    };
    if (editingHook) payload.id = editingHook.id;

    const res = await saveWebhook(payload);
    setSaving(false);
    if (!res.ok) {
      setError(res.error || 'Failed to save webhook.');
      return;
    }

    setSuccess(`Webhook "${payload.name}" saved.`);
    resetForm();
    loadHooks();
  };

  const handleDelete = async (id: string, hookName: string) => {
    if (!confirm(`Delete webhook "${hookName}"?`)) return;
    const ok = await deleteWebhook(id);
    if (ok) {
      setSuccess(`Deleted webhook "${hookName}".`);
      loadHooks();
    } else {
      setError('Failed to delete webhook.');
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await testWebhook(id);
      if (res.ok) {
        setSuccess(res.message || `Test ping delivered (HTTP ${res.status || 200}).`);
      } else {
        setError(res.message || `Test ping failed (HTTP ${res.status || 'Error'}).`);
      }
      loadHooks();
    } finally {
      setTestingId(null);
    }
  };

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
            🔗 Outbound Webhooks &amp; Integrations
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Send HMAC-SHA256 signed HTTP POST notifications (`X-TP365-Signature`) to Zapier, Make, Slack, or external backends.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={loadHooks}
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
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--color-primary)',
              color: '#fff',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Add Webhook
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.86rem',
            fontWeight: 600,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '0.86rem',
            fontWeight: 600,
          }}
        >
          ✅ {success}
        </div>
      )}

      {/* Grid */}
      {loading && webhooks.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#94a3b8', padding: 40 }}>
          Loading webhooks...
        </div>
      ) : webhooks.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#64748b', padding: 48 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>No outbound webhooks configured</div>
          <div style={{ fontSize: '0.84rem' }}>
            Create a webhook to notify your CRM, Slack, or build pipelines automatically when content publishes or leads arrive.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {webhooks.map((hook) => (
            <div
              key={hook.id}
              style={{
                ...cardStyle,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: hook.isActive ? 1 : 0.65,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      {hook.isActive ? '🟢 ' : '⏸️ '}
                      {hook.name}
                    </h3>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: 3 }}>
                      {hook.url}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(hook)}
                      style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.76rem', cursor: 'pointer' }}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(hook.id, hook.name)}
                      style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '0.76rem', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                    Subscribed Events
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {hook.events && hook.events.length > 0 ? (
                      hook.events.map((ev) => (
                        <span
                          key={ev}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: '#eef2ff',
                            color: '#3730a3',
                            border: '1px solid #c7d2fe',
                          }}
                        >
                          {ev}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>No events selected</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: 10,
                    marginBottom: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.76rem',
                    color: '#64748b',
                  }}
                >
                  <span>
                    {hook.lastTriggeredAt
                      ? `Last: ${new Date(hook.lastTriggeredAt).toLocaleString()}`
                      : 'Never triggered'}
                  </span>
                  {hook.lastStatus !== undefined && hook.lastStatus !== null && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: hook.lastStatus >= 200 && hook.lastStatus < 300 ? '#ecfdf5' : '#fef2f2',
                        color: hook.lastStatus >= 200 && hook.lastStatus < 300 ? '#065f46' : '#dc2626',
                      }}
                    >
                      HTTP {hook.lastStatus}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={testingId === hook.id}
                onClick={() => handleTest(hook.id)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {testingId === hook.id ? 'Sending Test Ping...' : '📡 Send Test Ping'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
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
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 480, width: '100%', padding: 24, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {editingHook ? 'Edit Webhook' : 'New Outbound Webhook'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Webhook Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CRM Lead Sync"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Target URL *</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/..."
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Signing Secret (optional, sets X-TP365-Signature)</label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Shared secret key"
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Trigger Events</label>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {AVAILABLE_EVENTS.map((ev) => (
                    <label key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: '0.8rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(ev.id)}
                        onChange={() => toggleEvent(ev.id)}
                        style={{ marginTop: 2 }}
                      />
                      <div>
                        <strong style={{ color: '#0f172a' }}>{ev.label}</strong>
                        <div style={{ fontSize: '0.73rem', color: '#64748b' }}>{ev.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Enable this webhook immediately
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {saving ? 'Saving...' : 'Save Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
