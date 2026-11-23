import { useEffect, useState } from 'react';
import {
  listMediaAssets,
  uploadCmsMedia,
  updateMediaAsset,
  deleteMediaAsset,
  type MediaAsset,
} from '../../cms/api';

export function MediaLibraryPanel() {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [editingAlt, setEditingAlt] = useState('');

  const loadMedia = async () => {
    setLoading(true);
    const items = await listMediaAssets(search, folder);
    setMediaList(items);
    setLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, [search, folder]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      const res = await uploadCmsMedia(file.name, dataUrl, '', 'uploads');
      setUploading(false);
      if (res.ok) {
        setNotification(`Uploaded ${file.name} successfully!`);
        setTimeout(() => setNotification(null), 3000);
        loadMedia();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAlt = async () => {
    if (!selectedAsset) return;
    const ok = await updateMediaAsset(selectedAsset.id, { altText: editingAlt });
    if (ok) {
      setSelectedAsset({ ...selectedAsset, altText: editingAlt });
      setNotification('Updated asset alt text.');
      setTimeout(() => setNotification(null), 3000);
      loadMedia();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete '${name}'?`)) return;
    const ok = await deleteMediaAsset(id);
    if (ok) {
      if (selectedAsset?.id === id) setSelectedAsset(null);
      setNotification(`Deleted ${name}.`);
      setTimeout(() => setNotification(null), 3000);
      loadMedia();
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setNotification('Asset URL copied to clipboard!');
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 6px' }}>
            🖼️ Centralized Media Library & Asset Manager
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Upload, organize, inspect, and reuse brand assets, screenshots, and logos across all website pages.
          </p>
        </div>

        <label
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            background: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {uploading ? 'Uploading...' : '☁️ Upload New Asset'}
          <input
            type="file"
            accept="image/*,video/mp4,application/pdf"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
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

      {/* Filter Bar */}
      <div
        style={{
          background: '#fff',
          padding: '14px 18px',
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
          placeholder="🔍 Search by filename or alt text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 260,
            padding: '9px 14px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            fontSize: '0.9rem',
          }}
        />
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          style={{
            padding: '9px 14px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <option value="">All Folders & Built-ins</option>
          <option value="uploads">Uploaded Files</option>
          <option value="builtin">Built-in Assets (/public/assets)</option>
        </select>
        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {mediaList.length} assets found
        </span>
      </div>

      {/* Main Content: Grid + Detail Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedAsset ? '1fr 340px' : '1fr', gap: 20 }}>
        {/* Assets Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16,
          }}
        >
          {loading ? (
            <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: '#64748b' }}>
              Loading assets...
            </div>
          ) : mediaList.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: 40,
                textAlign: 'center',
                background: '#fff',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                color: '#64748b',
              }}
            >
              No media assets match your filters.
            </div>
          ) : (
            mediaList.map((asset) => {
              const isSelected = selectedAsset?.id === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setEditingAlt(asset.altText || '');
                  }}
                  style={{
                    background: '#fff',
                    borderRadius: 10,
                    border: isSelected ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      height: 120,
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {asset.mimeType.startsWith('video/') ? (
                      <span style={{ fontSize: '2.5rem' }}>🎥</span>
                    ) : (
                      <img
                        src={asset.url}
                        alt={asset.altText || asset.filename}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div style={{ padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={asset.filename}
                    >
                      {asset.filename}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
                      <span>{asset.folder}</span>
                      {asset.sizeBytes > 0 && <span>{Math.round(asset.sizeBytes / 1024)} KB</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        {selectedAsset && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              padding: 20,
              boxShadow: 'var(--shadow-sm)',
              height: 'fit-content',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>Asset Details</strong>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                borderRadius: 8,
                background: '#f8fafc',
                overflow: 'hidden',
                maxHeight: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              {selectedAsset.mimeType.startsWith('video/') ? (
                <video src={selectedAsset.url} controls style={{ width: '100%', maxHeight: 180 }} />
              ) : (
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.altText || selectedAsset.filename}
                  style={{ width: '100%', maxHeight: 180, objectFit: 'contain' }}
                />
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
                File URL
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  readOnly
                  value={selectedAsset.url}
                  style={{ flex: 1, padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#f8fafc' }}
                />
                <button
                  type="button"
                  onClick={() => copyUrl(selectedAsset.url)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
                Alt Text (Accessibility & SEO)
              </label>
              <textarea
                rows={2}
                value={editingAlt}
                onChange={(e) => setEditingAlt(e.target.value)}
                placeholder="Descriptive alt text for screen readers and SEO..."
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={handleSaveAlt}
                style={{
                  marginTop: 6,
                  padding: '6px 14px',
                  borderRadius: 6,
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save Alt Text
              </button>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14, fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><strong>Format:</strong> {selectedAsset.mimeType}</div>
              <div><strong>Folder:</strong> {selectedAsset.folder}</div>
              {selectedAsset.sizeBytes > 0 && (
                <div><strong>File size:</strong> {Math.round(selectedAsset.sizeBytes / 1024)} KB</div>
              )}
              <div><strong>Created:</strong> {new Date(selectedAsset.createdAt).toLocaleDateString()}</div>
            </div>

            {selectedAsset.folder !== 'builtin' && (
              <button
                type="button"
                onClick={() => handleDelete(selectedAsset.id, selectedAsset.filename)}
                style={{
                  marginTop: 18,
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
                🗑️ Delete Asset Permanently
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
