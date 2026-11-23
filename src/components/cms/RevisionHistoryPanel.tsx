import { useEffect, useState } from 'react';
import {
  listRevisions,
  getRevisionDetail,
  rollbackToRevision,
  listSchedules,
  createSchedule,
  cancelSchedule,
  type RevisionItem,
  type ScheduleItem,
} from '../../cms/api';
import { useCms } from '../../cms/CmsProvider';

export function RevisionHistoryPanel() {
  const { liveSite, refreshFromBackend } = useCms();
  const [activeTab, setActiveTab] = useState<'revisions' | 'schedules'>('revisions');
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<RevisionItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Schedule form state
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleNote, setScheduleNote] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [revs, scheds] = await Promise.all([listRevisions(), listSchedules()]);
    setRevisions(revs);
    setSchedules(scheds);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInspectRevision = async (rev: RevisionItem) => {
    const detail = await getRevisionDetail(rev.id);
    setSelectedRevision(detail || rev);
  };

  const handleRollback = async (targetEnv: 'draft' | 'live') => {
    if (!selectedRevision) return;
    const confirmMsg =
      targetEnv === 'live'
        ? `⚠️ ROLLBACK LIVE SITE: Are you sure you want to revert the live production website back to Revision #${selectedRevision.versionNum}?`
        : `Restore Revision #${selectedRevision.versionNum} into your draft workspace for editing?`;

    if (!confirm(confirmMsg)) return;

    setBusy(true);
    const res = await rollbackToRevision(selectedRevision.id, targetEnv);
    setBusy(false);

    if (res.ok) {
      setNotification(`✅ Successfully rolled back to Revision #${selectedRevision.versionNum}!`);
      setTimeout(() => setNotification(null), 3500);
      await refreshFromBackend();
      loadData();
    } else {
      alert(`Rollback failed: ${res.error}`);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate || !scheduleTime) {
      alert('Please select both a date and time.');
      return;
    }
    const combinedDate = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    setBusy(true);
    const res = await createSchedule(scheduleTitle || 'Scheduled Release', combinedDate, scheduleNote);
    setBusy(false);

    if (res.ok) {
      setNotification('✅ Release scheduled successfully!');
      setTimeout(() => setNotification(null), 3500);
      setScheduleTitle('');
      setScheduleDate('');
      setScheduleTime('');
      setScheduleNote('');
      loadData();
    } else {
      alert(`Failed to schedule release: ${res.error}`);
    }
  };

  const handleCancelSchedule = async (id: string) => {
    if (!confirm('Cancel this scheduled release?')) return;
    const ok = await cancelSchedule(id);
    if (ok) {
      setNotification('Scheduled release cancelled.');
      setTimeout(() => setNotification(null), 3000);
      loadData();
    }
  };

  // Compute diff sections between selected revision and live
  const diffSections = selectedRevision?.content
    ? Object.keys(liveSite).filter((key) => {
        return (
          JSON.stringify((selectedRevision.content as any)[key]) !==
          JSON.stringify((liveSite as any)[key])
        );
      })
    : [];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 6px' }}>
          ⏱️ Version History, Rollback & Scheduled Releases
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Every time content is published, a permanent revision snapshot is created. Inspect previous versions, compare diffs, roll back with 1-click, or queue timed releases.
        </p>
      </div>

      {notification && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 8,
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontWeight: 700,
            fontSize: '0.9rem',
            marginBottom: 20,
          }}
        >
          {notification}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #e2e8f0', marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setActiveTab('revisions')}
          style={{
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'revisions' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'revisions' ? 'var(--color-primary)' : '#64748b',
            cursor: 'pointer',
          }}
        >
          📜 Published Revisions ({revisions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          style={{
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'schedules' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'schedules' ? 'var(--color-primary)' : '#64748b',
            cursor: 'pointer',
          }}
        >
          ⏰ Scheduled Releases ({schedules.filter((s) => s.status === 'pending').length} pending)
        </button>
      </div>

      {/* REVISIONS TAB */}
      {activeTab === 'revisions' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedRevision ? '1fr 420px' : '1fr', gap: 24 }}>
          {/* Timeline List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>Loading revisions...</div>
            ) : revisions.length === 0 ? (
              <div
                style={{
                  padding: 30,
                  textAlign: 'center',
                  background: '#fff',
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  color: '#64748b',
                }}
              >
                No revisions recorded yet. When you click &ldquo;Publish Live&rdquo; in Studio, your first snapshot will appear here.
              </div>
            ) : (
              revisions.map((rev) => {
                const isSelected = selectedRevision?.id === rev.id;
                return (
                  <div
                    key={rev.id}
                    onClick={() => handleInspectRevision(rev)}
                    style={{
                      background: '#fff',
                      borderRadius: 10,
                      border: isSelected ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span
                          style={{
                            background: '#e0f2fe',
                            color: '#0369a1',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 999,
                          }}
                        >
                          v{rev.versionNum}
                        </span>
                        <strong style={{ fontSize: '0.98rem', color: 'var(--color-primary)' }}>
                          {rev.label}
                        </strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                        {rev.note ? `Note: ${rev.note} · ` : ''}By {rev.authorUsername} on{' '}
                        {new Date(rev.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInspectRevision(rev);
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Inspect Diff →
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Diff & Rollback Inspector */}
          {selectedRevision && (
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                padding: 22,
                boxShadow: 'var(--shadow-sm)',
                height: 'fit-content',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284c7' }}>
                    REVISION #{selectedRevision.versionNum}
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '1.15rem', color: 'var(--color-primary)' }}>
                    {selectedRevision.label}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRevision(null)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 16 }}>
                <div><strong>Author:</strong> {selectedRevision.authorUsername}</div>
                <div><strong>Timestamp:</strong> {new Date(selectedRevision.createdAt).toLocaleString()}</div>
                {selectedRevision.note && <div><strong>Note:</strong> {selectedRevision.note}</div>}
              </div>

              {/* Diff summary vs Current Live */}
              <div style={{ marginBottom: 20 }}>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: 8 }}>
                  Diff vs Current Live Site:
                </strong>
                {diffSections.length === 0 ? (
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: '#f8fafc', fontSize: '0.8rem', color: '#64748b' }}>
                    Identical to current live content (0 differences).
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700 }}>
                      ⚠️ {diffSections.length} section(s) differ from live:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {diffSections.map((sec) => (
                        <span
                          key={sec}
                          style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 4,
                          }}
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rollback Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleRollback('draft')}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 6,
                    border: '1px solid #0284c7',
                    background: '#f0f9ff',
                    color: '#0369a1',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  📥 Restore Revision to Draft Workspace
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleRollback('live')}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#dc2626',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Rollback LIVE Production Site Immediately
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCHEDULES TAB */}
      {activeTab === 'schedules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {/* New Schedule Creator */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', margin: '0 0 10px', fontWeight: 800 }}>
              ⏰ Schedule Future Release
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 18 }}>
              Take a snapshot of your current draft and queue it to auto-publish live at an exact future date & time.
            </p>

            <form onSubmit={handleCreateSchedule}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                  Release Campaign Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Pricing Update / Winter Launch"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                  Release Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Internal notes about what is being launched..."
                  value={scheduleNote}
                  onChange={(e) => setScheduleNote(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                style={{
                  width: '100%',
                  padding: '10px 18px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                {busy ? 'Scheduling...' : 'Queue Scheduled Release'}
              </button>
            </form>
          </div>

          {/* Scheduled Releases Queue */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: '0 0 6px', fontWeight: 700 }}>
              Upcoming & Past Scheduled Releases
            </h3>

            {schedules.length === 0 ? (
              <div style={{ padding: 30, background: '#fff', borderRadius: 10, border: '1px solid var(--color-border)', color: '#64748b', textAlign: 'center' }}>
                No scheduled releases in queue.
              </div>
            ) : (
              schedules.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    borderRadius: 10,
                    border: '1px solid var(--color-border)',
                    padding: 16,
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background:
                            item.status === 'published'
                              ? '#dcfce7'
                              : item.status === 'pending'
                                ? '#fef3c7'
                                : '#fee2e2',
                          color:
                            item.status === 'published'
                              ? '#166534'
                              : item.status === 'pending'
                                ? '#92400e'
                                : '#991b1b',
                        }}
                      >
                        {item.status.toUpperCase()}
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                        {item.title}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Publish at: <strong>{new Date(item.publishAt).toLocaleString()}</strong> by {item.createdBy}
                    </div>
                    {item.note && <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>{item.note}</div>}
                  </div>

                  {item.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleCancelSchedule(item.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #fecaca',
                        background: '#fef2f2',
                        color: '#dc2626',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
