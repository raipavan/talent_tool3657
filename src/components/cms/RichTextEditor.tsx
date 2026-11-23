import { useState, useRef } from 'react';
import { RichTextRenderer } from '../RichTextRenderer';
import { MediaPickerModal } from './MediaPickerModal';

export function RichTextEditor({
  value,
  onChange,
  label = 'Content (Markdown & Rich Text)',
  rows = 10,
  placeholder = 'Write content here (Markdown supported)...',
}: {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  rows?: number;
  placeholder?: string;
}) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const next = value.substring(0, start) + replacement + value.substring(end);
    onChange(next);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 0);
  };

  const handleMediaSelected = (url: string, altText?: string) => {
    const md = `\n![${altText || 'Image'}](${url})\n`;
    insertFormatting('', md);
  };

  const wordCount = (value || '').trim() ? (value || '').trim().split(/\s+/).length : 0;

  return (
    <div style={{ marginBottom: 16 }}>
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelected}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>{label}</label>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            style={{
              padding: '3px 10px',
              borderRadius: 4,
              border: 'none',
              background: activeTab === 'write' ? 'var(--color-primary)' : '#f1f5f9',
              color: activeTab === 'write' ? '#fff' : '#475569',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✏️ Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            style={{
              padding: '3px 10px',
              borderRadius: 4,
              border: 'none',
              background: activeTab === 'preview' ? 'var(--color-primary)' : '#f1f5f9',
              color: activeTab === 'preview' ? '#fff' : '#475569',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            👁️ Preview
          </button>
        </div>
      </div>

      <div
        style={{
          border: '1px solid #cbd5e1',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        {activeTab === 'write' && (
          <>
            {/* Formatting Toolbar */}
            <div
              style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '6px 10px',
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => insertFormatting('## ')}
                style={toolbarBtnStyle}
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('### ')}
                style={toolbarBtnStyle}
                title="Heading 3"
              >
                H3
              </button>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                style={toolbarBtnStyle}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                style={toolbarBtnStyle}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[', '](https://)')}
                style={toolbarBtnStyle}
                title="Link"
              >
                🔗 Link
              </button>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <button
                type="button"
                onClick={() => insertFormatting('- ')}
                style={toolbarBtnStyle}
                title="Bulleted List"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('1. ')}
                style={toolbarBtnStyle}
                title="Numbered List"
              >
                1. List
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('> ')}
                style={toolbarBtnStyle}
                title="Quote"
              >
                ❝ Quote
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('`', '`')}
                style={toolbarBtnStyle}
                title="Code"
              >
                &lt;/&gt; Code
              </button>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                style={{ ...toolbarBtnStyle, background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}
                title="Insert Image from Media Library"
              >
                🖼️ Insert Image...
              </button>
            </div>

            <textarea
              ref={textareaRef}
              rows={rows}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '0.92rem',
                lineHeight: 1.6,
                resize: 'vertical',
                boxSizing: 'border-box',
                minHeight: 180,
              }}
            />
          </>
        )}

        {activeTab === 'preview' && (
          <div style={{ padding: '20px 24px', minHeight: 200, background: '#fff' }}>
            {value ? (
              <RichTextRenderer content={value} />
            ) : (
              <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nothing to preview yet.</div>
            )}
          </div>
        )}

        <div
          style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '5px 12px',
            fontSize: '0.72rem',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Markdown format supported</span>
          <span>
            {wordCount} words · {(value || '').length} characters
          </span>
        </div>
      </div>
    </div>
  );
}

const toolbarBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: 4,
  border: '1px solid #e2e8f0',
  background: '#fff',
  color: '#334155',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
};
