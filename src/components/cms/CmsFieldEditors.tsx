import { useState, type ReactNode } from 'react';
import { uploadCmsMedia } from '../../cms/api';
import { MediaPickerModal } from './MediaPickerModal';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #cbd5e1',
  fontSize: '0.88rem',
  background: '#ffffff',
  color: '#0f172a',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#334155',
  marginBottom: 4,
};

export function CmsTextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  help,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  help?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
      {help && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 3 }}>{help}</div>}
    </div>
  );
}

export function CmsTextArea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  help,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
  help?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      <textarea
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.45 }}
      />
      {help && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 3 }}>{help}</div>}
    </div>
  );
}

export function CmsImageInput({
  label,
  value,
  onChange,
  placeholder = '/assets/...',
  folder = 'uploads',
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [msg, setMsg] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg('');
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      const res = await uploadCmsMedia(file.name, dataUrl, '', folder);
      setUploading(false);
      if (res.ok && res.url) {
        onChange(res.url);
        setMsg('Uploaded to backend!');
      } else {
        onChange(dataUrl);
        setMsg(res.error ? `Saved inline (${res.error})` : 'Saved inline');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setMsg('Selected from Media Library');
        }}
      />
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            background: '#e0f2fe',
            color: '#0369a1',
            border: '1px solid #bae6fd',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          🖼️ Browse Media
        </button>
        <label
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            background: '#0f172a',
            color: '#fff',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </label>
      </div>
      {msg && <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: 4 }}>{msg}</div>}
    </div>
  );
}

export function CmsAccordion({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        marginBottom: 12,
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '13px 16px',
          background: open ? '#f8fafc' : '#fff',
          border: 'none',
          borderBottom: open ? '1px solid #e2e8f0' : 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{title}</span>
          {badge && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#e0f2fe',
                color: '#0369a1',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ padding: 16 }}>{children}</div>}
    </div>
  );
}

export function CmsStringListEditor({
  label,
  items,
  onChange,
  placeholder = 'Add item...',
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>{label}</label>
        <button
          type="button"
          onClick={() => onChange([...list, ''])}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid #0ea5e9',
            background: '#f0f9ff',
            color: '#0369a1',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Add
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {list.map((val, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="text"
              value={val}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...list];
                next[idx] = e.target.value;
                onChange(next);
              }}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={() => onChange(list.filter((_, i) => i !== idx))}
              title="Remove"
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#dc2626',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CmsListEditor<T>({
  title,
  items,
  onChange,
  createNew,
  renderItem,
  addLabel = '+ Add Item',
}: {
  title: string;
  items: T[];
  onChange: (next: T[]) => void;
  createNew: () => T;
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode;
  addLabel?: string;
}) {
  const list = Array.isArray(items) ? items : [];

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
          {title} ({list.length})
        </strong>
        <button
          type="button"
          onClick={() => onChange([...list, createNew()])}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: 'none',
            background: '#0284c7',
            color: '#fff',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {addLabel}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: 14,
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b' }}>Item #{idx + 1}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    cursor: idx === 0 ? 'not-allowed' : 'pointer',
                    opacity: idx === 0 ? 0.4 : 1,
                    fontSize: '0.75rem',
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={idx === list.length - 1}
                  onClick={() => move(idx, 1)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    cursor: idx === list.length - 1 ? 'not-allowed' : 'pointer',
                    opacity: idx === list.length - 1 ? 0.4 : 1,
                    fontSize: '0.75rem',
                  }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onChange(list.filter((_, i) => i !== idx))}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            {renderItem(item, idx, (patch) => {
              const next = [...list];
              next[idx] = { ...next[idx], ...patch };
              onChange(next);
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
