import { useEffect, useState } from 'react';
import {
  listLeads,
  updateLeadStatus,
  deleteLead,
  getLeadsCsvDownloadUrl,
  type LeadItem,
} from '../../cms/api';

export function LeadsInboxPanel() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    const items = await listLeads(statusFilter, search);
    setLeads(items);
    setLoading(false);
  };

  useEffect(() => {
    loadLeads();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (id: string, status: LeadItem['status']) => {
    const ok = await updateLeadStatus(id, { status });
    if (ok) {
      if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status });
      setNotification(`Status updated to '${status}'.`);
      setTimeout(() => setNotification(null), 3000);
      loadLeads();
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    const ok = await updateLeadStatus(selectedLead.id, { notes: notesDraft });
    if (ok) {
      setSelectedLead({ ...selectedLead, notes: notesDraft });
      setNotification('Notes saved.');
      setTimeout(() => setNotification(null), 3000);
      loadLeads();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this enquiry?')) return;
    const ok = await deleteLead(id);
    if (ok) {
      if (selectedLead?.id === id) setSelectedLead(null);
      setNotification('Lead deleted.');
      setTimeout(() => setNotification(null), 3000);
      loadLeads();
    }
  };

  const statusColors: Record<LeadItem['status'], { bg: string; text: string }> = {
    new: { bg: '#FEF3C7', text: '#92400E' },
    contacted: { bg: '#E0F2FE', text: '#0369A1' },
    qualified: { bg: '#DCFCE7', text: '#166534' },
    archived: { bg: '#F1F5F9', text: '#64748B' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 6px' }}>
            📬 Website Lead Submissions &amp; CRM Inbox
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Every enquiry submitted through demo requests, contact forms, pricing quotes, and custom landing pages is captured here in real-time.
          </p>
        </div>

        <a
          href={getLeadsCsvDownloadUrl()}
          download
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            background: '#059669',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.88rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          📥 Export All Leads (CSV)
        </a>
      </div>

      {notification && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontWeight: 700,
            fontSize: '0.88rem',
            marginBottom: 16,
          }}
        >
          ✅ {notification}
        </div>
      )}

      {/* Filter Toolbar */}
      <div
        style={{
          background: '#fff',
          padding: '12px 18px',
          borderRadius: 10,
          border: '1px solid var(--color-border)',
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search leads by name, email, company, or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 260,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            fontSize: '0.88rem',
          }}
        />

        <div style={{ display: 'flex', gap: 6 }}>
          {['', 'new', 'contacted', 'qualified', 'archived'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: statusFilter === st ? '1px solid var(--color-primary)' : '1px solid #cbd5e1',
                background: statusFilter === st ? 'var(--color-primary)' : '#fff',
                color: statusFilter === st ? '#fff' : '#334155',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {st === '' ? 'All Leads' : st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Split: Table + Detail Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* Leads Table */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading submissions...</div>
          ) : leads.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
              No lead submissions match your search.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Name &amp; Contact</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Company</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Subject / Page</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => {
                    const isSelected = selectedLead?.id === l.id;
                    return (
                      <tr
                        key={l.id}
                        onClick={() => {
                          setSelectedLead(l);
                          setNotesDraft(l.notes || '');
                        }}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isSelected ? '#f0f9ff' : '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(l.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <strong style={{ display: 'block', color: 'var(--color-primary)' }}>{l.name || 'Anonymous'}</strong>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{l.email}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>{l.company || '–'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{l.subject}</span>
                          <code style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8' }}>{l.sourcePath}</code>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: statusColors[l.status]?.bg || '#f1f5f9',
                              color: statusColors[l.status]?.text || '#334155',
                            }}
                          >
                            {l.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(l);
                              setNotesDraft(l.notes || '');
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 4,
                              border: '1px solid #cbd5e1',
                              background: '#fff',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lead Detail Drawer */}
        {selectedLead && (
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
              <strong style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>Enquiry Details</strong>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {/* Status Pipeline Buttons */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                Update Pipeline Status:
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['new', 'contacted', 'qualified', 'archived'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(selectedLead.id, st)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: selectedLead.status === st ? '2px solid #0f172a' : '1px solid #cbd5e1',
                      background: statusColors[st].bg,
                      color: statusColors[st].text,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {st.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Fields */}
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16, fontSize: '0.85rem' }}>
              <div style={{ marginBottom: 6 }}><strong>Name:</strong> {selectedLead.name}</div>
              <div style={{ marginBottom: 6 }}>
                <strong>Email:</strong> <a href={`mailto:${selectedLead.email}`}>{selectedLead.email}</a>
              </div>
              {selectedLead.company && <div style={{ marginBottom: 6 }}><strong>Company:</strong> {selectedLead.company}</div>}
              {selectedLead.phone && <div style={{ marginBottom: 6 }}><strong>Phone:</strong> {selectedLead.phone}</div>}
              <div style={{ marginBottom: 6 }}><strong>Subject:</strong> {selectedLead.subject}</div>
              <div><strong>Source URL:</strong> <code>{selectedLead.sourcePath}</code></div>
              <div style={{ marginTop: 6, color: '#94a3b8', fontSize: '0.74rem' }}>
                Submitted: {new Date(selectedLead.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Message Body */}
            {selectedLead.message && (
              <div style={{ marginBottom: 16 }}>
                <strong style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: 4 }}>
                  Message Content:
                </strong>
                <div
                  style={{
                    background: '#fff',
                    padding: 12,
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                  }}
                >
                  {selectedLead.message}
                </div>
              </div>
            )}

            {/* Internal Notes */}
            <div style={{ marginBottom: 16 }}>
              <strong style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: 4 }}>
                Internal Team Notes:
              </strong>
              <textarea
                rows={3}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Log internal follow-up notes, call logs, or assignments..."
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                style={{
                  marginTop: 6,
                  padding: '6px 14px',
                  borderRadius: 6,
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Save Notes
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(selectedLead.id)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 6,
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🗑️ Delete Enquiry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
