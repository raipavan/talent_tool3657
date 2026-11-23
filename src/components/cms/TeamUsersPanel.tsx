import { useState, useEffect, type CSSProperties, type FormEvent } from 'react';
import {
  listTeamUsers,
  createTeamUser,
  updateTeamUser,
  deleteTeamUser,
} from '../../cms/api';
import { ROLE_DETAILS, type CmsRole, type CmsUser } from '../../cms/permissions';

interface TeamUsersPanelProps {
  currentUser?: CmsUser | null;
}

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

export function TeamUsersPanel({ currentUser }: TeamUsersPanelProps) {
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<CmsUser | null>(null);

  const [formUsername, setFormUsername] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<CmsRole>('editor');
  const [formIsActive, setFormIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CmsUser | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listTeamUsers();
      setUsers(list);
    } catch {
      setError('Failed to fetch team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setFormUsername('');
    setFormDisplayName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('editor');
    setFormIsActive(true);
    setShowPassword(false);
    setEditingUser(null);
    setShowAddModal(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: CmsUser) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormDisplayName(user.displayName || '');
    setFormEmail(user.email || '');
    setFormPassword('');
    setFormRole(user.role);
    setFormIsActive(user.isActive !== false);
    setShowPassword(false);
  };

  const handleSaveUser = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingUser) {
        const patch: {
          email?: string;
          displayName?: string;
          role?: CmsRole;
          isActive?: boolean;
          password?: string;
        } = {
          email: formEmail,
          displayName: formDisplayName,
          role: formRole,
          isActive: formIsActive,
        };
        if (formPassword.trim()) {
          if (formPassword.trim().length < 8) {
            setError('New password must be at least 8 characters long.');
            setSaving(false);
            return;
          }
          patch.password = formPassword.trim();
        }
        const res = await updateTeamUser(editingUser.id, patch);
        if (!res.ok) {
          setError(res.error || 'Failed to update user.');
          setSaving(false);
          return;
        }
        setSuccess(`Updated team member "@${editingUser.username}".`);
        resetForm();
        loadUsers();
      } else {
        if (!formUsername.trim() || formUsername.trim().length < 3) {
          setError('Username must be at least 3 characters.');
          setSaving(false);
          return;
        }
        if (!formPassword.trim() || formPassword.trim().length < 8) {
          setError('Password must be at least 8 characters.');
          setSaving(false);
          return;
        }
        const res = await createTeamUser({
          username: formUsername.trim(),
          password: formPassword.trim(),
          email: formEmail.trim(),
          displayName: formDisplayName.trim(),
          role: formRole,
        });
        if (!res.ok) {
          setError(res.error || 'Failed to create user.');
          setSaving(false);
          return;
        }
        setSuccess(`Created team member "@${formUsername.trim()}".`);
        resetForm();
        loadUsers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const ok = await deleteTeamUser(deleteTarget.id);
    setSaving(false);
    setDeleteTarget(null);
    if (ok) {
      setSuccess(`Deleted user "@${deleteTarget.username}".`);
      loadUsers();
    } else {
      setError('Failed to delete user.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.username.toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

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
            👥 Team Members &amp; Access Control (RBAC)
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Manage administrative accounts, assign granular role permissions, and control workspace security.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={loadUsers}
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
            + Add Member
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#b91c1c' }}
          >
            ✕
          </button>
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>✅ {success}</span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#065f46' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Role Legend Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {(Object.keys(ROLE_DETAILS) as CmsRole[]).map((roleKey) => {
          const def = ROLE_DETAILS[roleKey];
          return (
            <div
              key={roleKey}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>{def.label}</strong>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    color: '#fff',
                    background: def.badgeColor,
                  }}
                >
                  {roleKey}
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{def.description}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <input
          type="text"
          placeholder="🔍 Search by username, display name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 360 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ ...inputStyle, width: 180 }}
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="editor">Editor</option>
            <option value="seo_manager">SEO Manager</option>
            <option value="reviewer">Reviewer</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Member</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Last Login / Created</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    No team members match the current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id || currentUser?.username === u.username;
                  const roleMeta = ROLE_DETAILS[u.role];
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              background: '#e0e7ff',
                              color: '#3730a3',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                            }}
                          >
                            {(u.displayName || u.username).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{u.displayName || u.username}</span>
                              {isCurrent && (
                                <span style={{ fontSize: '0.68rem', padding: '1px 6px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, color: '#475569' }}>
                                  You
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                              @{u.username}
                              {u.email ? ` · ${u.email}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 999,
                            background: roleMeta?.badgeColor || '#475569',
                            color: '#fff',
                          }}
                        >
                          {roleMeta?.label || u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.isActive !== false ? (
                          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#065f46', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 9px', borderRadius: 999 }}>
                            ● Active
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '3px 9px', borderRadius: 999 }}>
                            ○ Suspended
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#64748b' }}>
                        {u.lastLoginAt
                          ? `Login: ${new Date(u.lastLoginAt).toLocaleDateString()}`
                          : u.createdAt
                          ? `Added: ${new Date(u.createdAt).toLocaleDateString()}`
                          : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              background: '#fff',
                              color: '#334155',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            ✏️ Edit
                          </button>
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(u)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 6,
                                border: '1px solid #fecaca',
                                background: '#fef2f2',
                                color: '#dc2626',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingUser) && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {editingUser ? `Edit Member: @${editingUser.username}` : 'Add New Team Member'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Username *</label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingUser)}
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="e.g. sarah_editor"
                  style={{ ...inputStyle, background: editingUser ? '#f1f5f9' : '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Display Name</label>
                  <input
                    type="text"
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    placeholder="Sarah Connor"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={labelStyle}>
                    {editingUser ? 'Reset Password (optional, min 8 chars)' : 'Password * (min 8 chars)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-secondary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!editingUser}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editingUser ? 'Leave blank to keep existing password' : 'Minimum 8 characters'}
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Role &amp; Permissions *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as CmsRole)}
                  style={inputStyle}
                >
                  {(Object.keys(ROLE_DETAILS) as CmsRole[]).map((roleKey) => (
                    <option key={roleKey} value={roleKey}>
                      {ROLE_DETAILS[roleKey].label} ({roleKey})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 4 }}>
                  {ROLE_DETAILS[formRole]?.description}
                </div>
              </div>

              {editingUser && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    disabled={currentUser?.id === editingUser.id || currentUser?.username === editingUser.username}
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                  />
                  Account active (uncheck to suspend login)
                </label>
              )}

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
                  {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
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
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 380, width: '100%', padding: 24, textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, color: '#dc2626' }}>
              Delete User @{deleteTarget.username}?
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: 20 }}>
              This permanently revokes access and removes this account.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {saving ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
