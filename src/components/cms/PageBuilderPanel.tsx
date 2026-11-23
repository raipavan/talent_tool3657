import { useState, useEffect } from 'react';
import {
  listCustomPages,
  saveCustomPage,
  deleteCustomPage,
} from '../../cms/api';
import type { CustomPageModel, PageBlock, PageBlockType } from '../../cms/siteDefaults';
import { CmsTextInput, CmsTextArea, CmsImageInput, CmsStringListEditor } from './CmsFieldEditors';
import { RichTextEditor } from './RichTextEditor';
import { useCms } from '../../cms/CmsProvider';

const AVAILABLE_BLOCKS: { type: PageBlockType; label: string; icon: string; desc: string }[] = [
  { type: 'hero', label: 'Hero Banner', icon: '🚀', desc: 'Top-fold headline, lede, dual CTA buttons, and illustration' },
  { type: 'rich_text', label: 'Rich Text / Markdown', icon: '📝', desc: 'Formatted prose, lists, links, images, and long-form copy' },
  { type: 'feature_grid', label: 'Feature Grid (2–4 cols)', icon: '✨', desc: 'Cards with icons, titles, descriptions, and links' },
  { type: 'media_split', label: 'Media Split with Points', icon: '🖼️', desc: 'Image beside key bullet points and section narrative' },
  { type: 'metrics_band', label: 'Metrics & Stats Band', icon: '📊', desc: 'Big bold metrics cards (e.g. 68% Faster, 10x Pipeline)' },
  { type: 'faq', label: 'FAQ Accordion', icon: '❓', desc: 'Expandable Q&A accordion with automated FAQPage schema' },
  { type: 'testimonials', label: 'Customer Testimonials', icon: '💬', desc: 'Quote cards with recruiter avatar, role, and company' },
  { type: 'cta_banner', label: 'Call-to-Action Banner', icon: '🎯', desc: 'High-contrast conversion band with demo & trial buttons' },
  { type: 'lead_form', label: 'Lead Capture Form', icon: '📬', desc: 'Direct enquiry form submitting straight into your CMS Leads Inbox' },
];

export function PageBuilderPanel() {
  const { reloadCustomPages } = useCms();
  const [pages, setPages] = useState<CustomPageModel[]>([]);
  const [selectedPage, setSelectedPage] = useState<CustomPageModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [seoExpanded, setSeoExpanded] = useState(false);

  const loadPages = async () => {
    setLoading(true);
    const list = await listCustomPages();
    setPages(list);
    setLoading(false);
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleCreateNew = () => {
    const newPage: CustomPageModel = {
      id: '',
      slug: `/landing/new-page-${Date.now().toString().slice(-4)}`,
      title: 'New Landing Page',
      status: 'draft',
      blocks: [
        {
          id: `hero-${Date.now()}`,
          type: 'hero',
          title: 'Transform your recruitment with Agentic AI',
          subtitle: 'Discover, assess, and interview qualified candidates autonomously.',
          primaryCtaText: 'Book a demo →',
          primaryCtaHref: '/get-started#book-meeting',
          secondaryCtaText: 'View Pricing',
          secondaryCtaHref: '/pricing',
        },
      ],
      seo: {
        metaTitle: 'New Landing Page | TalentPool365',
        metaDescription: 'Custom landing page powered by TalentPool365 Agentic AI recruitment platform.',
      },
    };
    setSelectedPage(newPage);
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;
    if (!selectedPage.title || !selectedPage.slug) {
      alert('Please provide both a Title and a URL Slug.');
      return;
    }
    setSaving(true);
    const res = await saveCustomPage(selectedPage);
    setSaving(false);

    if (res.ok && res.page) {
      setSelectedPage(res.page);
      setNotification(`✅ Page '${res.page.title}' saved successfully!`);
      setTimeout(() => setNotification(null), 3500);
      await loadPages();
      await reloadCustomPages();
    } else {
      alert(`Failed to save page: ${res.error}`);
    }
  };

  const handleDeletePage = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete page '${title}'?`)) return;
    const ok = await deleteCustomPage(id);
    if (ok) {
      if (selectedPage?.id === id) setSelectedPage(null);
      setNotification(`Deleted page '${title}'.`);
      setTimeout(() => setNotification(null), 3000);
      await loadPages();
      await reloadCustomPages();
    }
  };

  const handleAddBlock = (type: PageBlockType) => {
    if (!selectedPage) return;
    const id = `block-${Date.now()}`;
    let newBlock: PageBlock;

    switch (type) {
      case 'hero':
        newBlock = { id, type: 'hero', title: 'New Hero Headline', subtitle: 'Hero subheadline description' };
        break;
      case 'rich_text':
        newBlock = { id, type: 'rich_text', title: 'Section Title', contentMarkdown: '## Write section prose here\n\nAdd markdown bullet points or paragraphs.' };
        break;
      case 'feature_grid':
        newBlock = {
          id,
          type: 'feature_grid',
          title: 'Key Capabilities',
          columns: 3,
          items: [
            { icon: '⚡', title: 'Instant Sourcing', description: 'Search across 850M+ candidate profiles.' },
            { icon: '🎯', title: 'Autonomous Scoring', description: 'Semantic resume match ranking.' },
            { icon: '🛡️', title: 'Anti-Cheat Proctoring', description: 'AI video, audio, and coding proctoring.' },
          ],
        };
        break;
      case 'media_split':
        newBlock = {
          id,
          type: 'media_split',
          title: 'Deep Workflow Automation',
          subtitle: 'Coordinate hiring panels with automated rubrics and calendars.',
          image: '/assets/workspace-analytics.jpg',
          imagePosition: 'right',
          points: ['Zero recruiter manual data entry', 'Instant WhatsApp and calendar sync', 'SOC 2 and GDPR compliant audit trails'],
        };
        break;
      case 'metrics_band':
        newBlock = {
          id,
          type: 'metrics_band',
          title: 'Proven Hiring ROI',
          metrics: [
            { value: '68%', label: 'Reduction in time-to-hire' },
            { value: '4.8x', label: 'More candidate shortlists' },
            { value: '100%', label: 'Explainable AI scoring' },
          ],
        };
        break;
      case 'faq':
        newBlock = {
          id,
          type: 'faq',
          title: 'Frequently Asked Questions',
          items: [
            { question: 'How quickly does implementation take?', answer: 'Most teams are up and running within 24 hours with zero engineering required.' },
          ],
        };
        break;
      case 'testimonials':
        newBlock = {
          id,
          type: 'testimonials',
          title: 'What Hiring Leaders Say',
          items: [
            { quote: 'TalentPool365 transformed our tech hiring pipeline within two weeks.', author: 'Sarah Lin', role: 'VP of People', company: 'CloudScale' },
          ],
        };
        break;
      case 'cta_banner':
        newBlock = {
          id,
          type: 'cta_banner',
          title: 'Ready to modernize recruitment?',
          subtitle: 'Schedule a personalized demo on your active open roles.',
          primaryCtaText: 'Request Demo →',
          primaryCtaHref: '/get-started#book-meeting',
        };
        break;
      case 'lead_form':
        newBlock = {
          id,
          type: 'lead_form',
          title: 'Get in Touch with Our Team',
          subtitle: 'Fill out this form and a recruitment specialist will reply within one business day.',
          formSubject: 'Custom Landing Page Lead',
          submitButtonText: 'Submit Enquiry',
        };
        break;
    }

    setSelectedPage({
      ...selectedPage,
      blocks: [...selectedPage.blocks, newBlock],
    });
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    if (!selectedPage) return;
    const target = idx + dir;
    if (target < 0 || target >= selectedPage.blocks.length) return;
    const nextBlocks = [...selectedPage.blocks];
    [nextBlocks[idx], nextBlocks[target]] = [nextBlocks[target], nextBlocks[idx]];
    setSelectedPage({ ...selectedPage, blocks: nextBlocks });
  };

  const removeBlock = (idx: number) => {
    if (!selectedPage) return;
    setSelectedPage({
      ...selectedPage,
      blocks: selectedPage.blocks.filter((_, i) => i !== idx),
    });
  };

  const updateBlock = (idx: number, patch: Partial<PageBlock>) => {
    if (!selectedPage) return;
    const nextBlocks = [...selectedPage.blocks];
    nextBlocks[idx] = { ...nextBlocks[idx], ...patch } as PageBlock;
    setSelectedPage({ ...selectedPage, blocks: nextBlocks });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 6px' }}>
            🛠️ Dynamic Custom Page Builder (Modular Blocks)
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Create unlimited new landing pages, campaign URLs, and custom layouts using TalentPool365&apos;s modular block design system.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            background: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ➕ Create New Page
        </button>
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
          {notification}
        </div>
      )}

      {/* Main Split: Pages List vs Block Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedPage ? '300px 1fr' : '1fr', gap: 20 }}>
        {/* Left: Pages Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <strong style={{ fontSize: '0.88rem', color: '#64748b' }}>Custom Pages Directory ({pages.length})</strong>

          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>Loading pages...</div>
          ) : pages.length === 0 ? (
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, border: '1px solid var(--color-border)', color: '#64748b', fontSize: '0.85rem' }}>
              No custom pages yet. Click &ldquo;+ Create New Page&rdquo; above!
            </div>
          ) : (
            pages.map((p) => {
              const isSelected = selectedPage?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPage(p)}
                  style={{
                    background: '#fff',
                    borderRadius: 8,
                    border: isSelected ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--color-primary)' }}>{p.title}</strong>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: p.status === 'published' ? '#dcfce7' : '#fef3c7',
                        color: p.status === 'published' ? '#166534' : '#92400e',
                      }}
                    >
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    <code>{p.slug}</code> · {p.blocks.length} blocks
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Active Page Editor */}
        {selectedPage && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Page Header Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #e2e8f0', paddingBottom: 14 }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
                  EDITING CUSTOM PAGE
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                  {selectedPage.title}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {selectedPage.status === 'published' && (
                  <a
                    href={selectedPage.slug}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '7px 12px',
                      borderRadius: 6,
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    👁️ View Live Page
                  </a>
                )}
                {selectedPage.id && (
                  <button
                    type="button"
                    onClick={() => handleDeletePage(selectedPage.id, selectedPage.title)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 6,
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Delete Page
                  </button>
                )}
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSavePage}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 6,
                    background: 'var(--color-primary)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : '💾 Save Page'}
                </button>
              </div>
            </div>

            {/* Page Settings Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 12, marginBottom: 18 }}>
              <CmsTextInput
                label="Page Title"
                value={selectedPage.title}
                onChange={(v) => setSelectedPage({ ...selectedPage, title: v })}
              />
              <CmsTextInput
                label="URL Slug (e.g. /lp/ai-sourcing)"
                value={selectedPage.slug}
                onChange={(v) => setSelectedPage({ ...selectedPage, slug: v })}
              />
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Status
                </label>
                <select
                  value={selectedPage.status}
                  onChange={(e) => setSelectedPage({ ...selectedPage, status: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    background: selectedPage.status === 'published' ? '#dcfce7' : '#fff',
                  }}
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Live)</option>
                </select>
              </div>
            </div>

            {/* Per-Page SEO Accordion */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 24, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setSeoExpanded(!seoExpanded)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--color-primary)',
                }}
              >
                <span>🎯 Per-Page SEO & Social Metadata ({selectedPage.title})</span>
                <span>{seoExpanded ? '▲' : '▼'}</span>
              </button>

              {seoExpanded && (
                <div style={{ padding: 16, background: '#fff' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <CmsTextInput
                      label="Meta Title (Search snippet)"
                      value={selectedPage.seo?.metaTitle || ''}
                      onChange={(v) =>
                        setSelectedPage({
                          ...selectedPage,
                          seo: { ...(selectedPage.seo || {}), metaTitle: v },
                        })
                      }
                    />
                    <CmsImageInput
                      label="OG Share Image URL"
                      value={selectedPage.seo?.ogImage || ''}
                      onChange={(v) =>
                        setSelectedPage({
                          ...selectedPage,
                          seo: { ...(selectedPage.seo || {}), ogImage: v },
                        })
                      }
                    />
                  </div>
                  <CmsTextArea
                    label="Meta Description"
                    rows={2}
                    value={selectedPage.seo?.metaDescription || ''}
                    onChange={(v) =>
                      setSelectedPage({
                        ...selectedPage,
                        seo: { ...(selectedPage.seo || {}), metaDescription: v },
                      })
                    }
                  />
                </div>
              )}
            </div>

            {/* Blocks Layout Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                Page Blocks Layout ({selectedPage.blocks.length} blocks)
              </strong>
            </div>

            {/* Rendered Block Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {selectedPage.blocks.map((block, idx) => (
                <div
                  key={block.id}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    background: '#f8fafc',
                    padding: 16,
                  }}
                >
                  {/* Block Header Toolbar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 4 }}>
                        #{idx + 1} {block.type.toUpperCase().replace('_', ' ')}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                        {block.title || '(Untitled Block)'}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveBlock(idx, -1)}
                        style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        ↑ Move Up
                      </button>
                      <button
                        type="button"
                        disabled={idx === selectedPage.blocks.length - 1}
                        onClick={() => moveBlock(idx, 1)}
                        style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        ↓ Move Down
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(idx)}
                        style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Delete Block
                      </button>
                    </div>
                  </div>

                  {/* Block Field Editors */}
                  {block.type === 'hero' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <CmsTextInput label="Hero Title" value={block.title || ''} onChange={(v) => updateBlock(idx, { title: v })} />
                        <CmsTextInput label="Eyebrow Tag" value={block.eyebrow || ''} onChange={(v) => updateBlock(idx, { eyebrow: v })} />
                      </div>
                      <CmsTextArea label="Hero Subtitle" rows={2} value={block.subtitle || ''} onChange={(v) => updateBlock(idx, { subtitle: v })} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                        <CmsTextInput label="Primary CTA Label" value={block.primaryCtaText || ''} onChange={(v) => updateBlock(idx, { primaryCtaText: v })} />
                        <CmsTextInput label="Primary CTA Link" value={block.primaryCtaHref || ''} onChange={(v) => updateBlock(idx, { primaryCtaHref: v })} />
                        <CmsTextInput label="Secondary CTA Label" value={block.secondaryCtaText || ''} onChange={(v) => updateBlock(idx, { secondaryCtaText: v })} />
                        <CmsTextInput label="Secondary CTA Link" value={block.secondaryCtaHref || ''} onChange={(v) => updateBlock(idx, { secondaryCtaHref: v })} />
                      </div>
                      <CmsImageInput label="Hero Illustration Image" value={block.image || ''} onChange={(v) => updateBlock(idx, { image: v })} />
                    </div>
                  )}

                  {block.type === 'rich_text' && (
                    <div>
                      <CmsTextInput label="Section Title (Optional)" value={block.title || ''} onChange={(v) => updateBlock(idx, { title: v })} />
                      <RichTextEditor
                        value={block.contentMarkdown || ''}
                        onChange={(v) => updateBlock(idx, { contentMarkdown: v })}
                        label="Markdown & Prose Content"
                      />
                    </div>
                  )}

                  {block.type === 'feature_grid' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                        <CmsTextInput label="Grid Section Title" value={block.title || ''} onChange={(v) => updateBlock(idx, { title: v })} />
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                            Columns
                          </label>
                          <select
                            value={block.columns || 3}
                            onChange={(e) => updateBlock(idx, { columns: Number(e.target.value) as any })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          >
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                        {(block.items || []).map((item, fIdx) => (
                          <div key={fIdx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 2fr 30px', gap: 8, alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="Icon"
                              value={item.icon || ''}
                              onChange={(e) => {
                                const nextItems = [...block.items];
                                nextItems[fIdx] = { ...nextItems[fIdx], icon: e.target.value };
                                updateBlock(idx, { items: nextItems });
                              }}
                              style={{ padding: '6px', borderRadius: 4, border: '1px solid #cbd5e1', textAlign: 'center' }}
                            />
                            <input
                              type="text"
                              placeholder="Title"
                              value={item.title}
                              onChange={(e) => {
                                const nextItems = [...block.items];
                                nextItems[fIdx] = { ...nextItems[fIdx], title: e.target.value };
                                updateBlock(idx, { items: nextItems });
                              }}
                              style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                            />
                            <input
                              type="text"
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => {
                                const nextItems = [...block.items];
                                nextItems[fIdx] = { ...nextItems[fIdx], description: e.target.value };
                                updateBlock(idx, { items: nextItems });
                              }}
                              style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateBlock(idx, { items: block.items.filter((_, i) => i !== fIdx) });
                              }}
                              style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontWeight: 800 }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            updateBlock(idx, {
                              items: [...(block.items || []), { icon: '✨', title: 'New Feature', description: 'Feature description' }],
                            });
                          }}
                          style={{ padding: '6px 12px', borderRadius: 6, background: '#fff', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', alignSelf: 'flex-start' }}
                        >
                          + Add Feature Card
                        </button>
                      </div>
                    </div>
                  )}

                  {block.type === 'media_split' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                        <CmsTextInput label="Title" value={block.title || ''} onChange={(v) => updateBlock(idx, { title: v })} />
                        <CmsTextInput label="Badge / Tag" value={block.badge || ''} onChange={(v) => updateBlock(idx, { badge: v })} />
                      </div>
                      <CmsTextArea label="Subtitle" rows={2} value={block.subtitle || ''} onChange={(v) => updateBlock(idx, { subtitle: v })} />
                      <CmsImageInput label="Side Image URL" value={block.image || ''} onChange={(v) => updateBlock(idx, { image: v })} />
                      <CmsStringListEditor label="Bullet Points" items={block.points || []} onChange={(v) => updateBlock(idx, { points: v })} />
                    </div>
                  )}

                  {block.type === 'metrics_band' && (
                    <div>
                      <CmsTextInput label="Band Title (Optional)" value={block.title || ''} onChange={(v) => updateBlock(idx, { title: v })} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(block.metrics || []).map((m, mIdx) => (
                          <div key={mIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 30px', gap: 8 }}>
                            <input
                              type="text"
                              placeholder="Value (e.g. 68%)"
                              value={m.value}
                              onChange={(e) => {
                                const nextM = [...block.metrics];
                                nextM[mIdx] = { ...nextM[mIdx], value: e.target.value };
                                updateBlock(idx, { metrics: nextM });
                              }}
                              style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontWeight: 800 }}
                            />
                            <input
                              type="text"
                              placeholder="Label"
                              value={m.label}
                              onChange={(e) => {
                                const nextM = [...block.metrics];
                                nextM[mIdx] = { ...nextM[mIdx], label: e.target.value };
                                updateBlock(idx, { metrics: nextM });
                              }}
                              style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateBlock(idx, { metrics: block.metrics.filter((_, i) => i !== mIdx) });
                              }}
                              style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontWeight: 800 }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            updateBlock(idx, { metrics: [...(block.metrics || []), { value: '100%', label: 'Metric label' }] });
                          }}
                          style={{ padding: '6px 12px', borderRadius: 6, background: '#fff', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', alignSelf: 'flex-start' }}
                        >
                          + Add Metric
                        </button>
                      </div>
                    </div>
                  )}

                  {block.type === 'faq' && (
                    <div>
                      <CmsTextInput label="FAQ Section Title" value={block.title || ''} onChange={(v) => updateBlock(idx, { title: v })} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                        {(block.items || []).map((qItem, qIdx) => (
                          <div key={qIdx} style={{ background: '#fff', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <strong style={{ fontSize: '0.8rem' }}>Question #{qIdx + 1}</strong>
                              <button
                                type="button"
                                onClick={() => updateBlock(idx, { items: block.items.filter((_, i) => i !== qIdx) })}
                                style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontWeight: 800 }}
                              >
                                ×
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Question"
                              value={qItem.question}
                              onChange={(e) => {
                                const nextQ = [...block.items];
                                nextQ[qIdx] = { ...nextQ[qIdx], question: e.target.value };
                                updateBlock(idx, { items: nextQ });
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', marginBottom: 6 }}
                            />
                            <textarea
                              rows={2}
                              placeholder="Answer"
                              value={qItem.answer}
                              onChange={(e) => {
                                const nextQ = [...block.items];
                                nextQ[qIdx] = { ...nextQ[qIdx], answer: e.target.value };
                                updateBlock(idx, { items: nextQ });
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            updateBlock(idx, { items: [...(block.items || []), { question: 'New Question?', answer: 'Answer details here.' }] });
                          }}
                          style={{ padding: '6px 12px', borderRadius: 6, background: '#fff', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', alignSelf: 'flex-start' }}
                        >
                          + Add FAQ Item
                        </button>
                      </div>
                    </div>
                  )}

                  {block.type === 'cta_banner' && (
                    <div>
                      <CmsTextInput label="Banner Headline" value={block.title || ''} onChange={(v) => updateBlock(idx, { title: v })} />
                      <CmsTextArea label="Subtitle" rows={2} value={block.subtitle || ''} onChange={(v) => updateBlock(idx, { subtitle: v })} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <CmsTextInput label="Primary CTA Text" value={block.primaryCtaText || ''} onChange={(v) => updateBlock(idx, { primaryCtaText: v })} />
                        <CmsTextInput label="Primary CTA Link" value={block.primaryCtaHref || ''} onChange={(v) => updateBlock(idx, { primaryCtaHref: v })} />
                      </div>
                    </div>
                  )}

                  {block.type === 'lead_form' && (
                    <div>
                      <CmsTextInput label="Form Title" value={block.title || ''} onChange={(v) => updateBlock(idx, { title: v })} />
                      <CmsTextArea label="Form Subtitle" rows={2} value={block.subtitle || ''} onChange={(v) => updateBlock(idx, { subtitle: v })} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <CmsTextInput label="Lead Subject Tag" value={block.formSubject || ''} onChange={(v) => updateBlock(idx, { formSubject: v })} />
                        <CmsTextInput label="Submit Button Label" value={block.submitButtonText || ''} onChange={(v) => updateBlock(idx, { submitButtonText: v })} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Block Palette */}
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px dashed #cbd5e1' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block', marginBottom: 12 }}>
                ➕ Add a New Block to this Page:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {AVAILABLE_BLOCKS.map((b) => (
                  <button
                    key={b.type}
                    type="button"
                    onClick={() => handleAddBlock(b.type)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                      {b.icon} {b.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{b.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
