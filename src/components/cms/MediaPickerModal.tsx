import { useEffect, useState } from 'react';
import { listMediaAssets, uploadCmsMedia, type MediaAsset } from '../../cms/api';

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, altText?: string) => void;
}) {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadAssets();
  }, [isOpen, search, folder]);

  const loadAssets = async () => {
    setLoading(true);
    const items = await listMediaAssets(search, folder);
    setMediaList(items);
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      const res = await uploadCmsMedia(file.name, dataUrl, '', 'uploads');
      setUploading(false);
      if (res.ok && res.url) {
        onSelect(res.url, res.media?.altText);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          maxWidth: 880,
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          fontFamily: 'var(--font-body)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              🖼️ Select or Upload Media
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Choose an existing asset from the library or upload a new file.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.4rem',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div
          style={{
            padding: '12px 22px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 260 }}>
            <input
              type="text"
              placeholder="🔍 Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
              }}
            />
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <option value="">All Folders</option>
              <option value="uploads">Uploads</option>
              <option value="builtin">Built-in Assets</option>
            </select>
          </div>

          <label
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              background: 'var(--color-primary)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {uploading ? 'Uploading...' : '☁️ Upload New File'}
            <input
              type="file"
              accept="image/*,video/mp4"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Media Grid */}
        <div
          style={{
            padding: 22,
            overflowY: 'auto',
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 14,
          }}
        >
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#64748b' }}>
              Loading media library...
            </div>
          ) : mediaList.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#64748b' }}>
              No media found. Click &ldquo;Upload New File&rdquo; to add assets.
            </div>
          ) : (
            mediaList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item.url, item.altText);
                  onClose();
                }}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: '#fff',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div
                  style={{
                    height: 100,
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {item.mimeType.startsWith('video/') ? (
                    <span style={{ fontSize: '2rem' }}>🎥</span>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.altText || item.filename}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  )}
                </div>
                <div style={{ padding: '6px 8px' }}>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={item.filename}
                  >
                    {item.filename}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{item.folder}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
