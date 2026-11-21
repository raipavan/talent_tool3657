import { useState } from 'react';
import { useCms } from '../../cms/CmsProvider';
import {
  CmsAccordion,
  CmsListEditor,
  CmsStringListEditor,
  CmsTextArea,
  CmsTextInput,
} from './CmsFieldEditors';

type PageEditorSection =
  | 'products'
  | 'solutions'
  | 'howItWorks'
  | 'caseStudies'
  | 'customers'
  | 'integrations'
  | 'resources'
  | 'company'
  | 'getStarted'
  | 'support'
  | 'legal';

const SECTIONS: { id: PageEditorSection; label: string }[] = [
  { id: 'products', label: '9 Products + Overview' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'howItWorks', label: 'How It Works' },
  { id: 'caseStudies', label: 'Case Studies' },
  { id: 'customers', label: 'Customers & ROI' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'resources', label: 'Resources & Blog' },
  { id: 'company', label: 'Company (7 Pages)' },
  { id: 'getStarted', label: 'Get Started' },
  { id: 'support', label: 'Support' },
  { id: 'legal', label: 'Legal Policies' },
];

export function PagesContentEditor({ initialSection = 'products' }: { initialSection?: PageEditorSection }) {
  const { site, updateSiteSection } = useCms();
  const [section, setSection] = useState<PageEditorSection>(initialSection);
  const [selectedProductIdx, setSelectedProductIdx] = useState(0);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
          All Inner Pages Full Content Editor
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
          Choose any page group below to edit every section, card, FAQ, case study, job vacancy, integration, article, and legal clause.
        </p>
      </div>

      {/* Sub-navigation pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {SECTIONS.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              style={{
                padding: '7px 14px',
                borderRadius: 999,
                border: active ? '1px solid #0284c7' : '1px solid #cbd5e1',
                background: active ? '#0284c7' : '#fff',
                color: active ? '#fff' : '#334155',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ---------------- PRODUCTS ---------------- */}
      {section === 'products' && (
        <div>
          <CmsAccordion title="Platform Overview Page (/products)" badge="Overview">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
              <CmsTextInput
                label="Stages Pill Tag"
                value={site.productsOverview.stagesTag}
                onChange={(v) => updateSiteSection('productsOverview', { ...site.productsOverview, stagesTag: v })}
              />
              <CmsTextInput
                label="Stages Section Title"
                value={site.productsOverview.stagesTitle}
                onChange={(v) => updateSiteSection('productsOverview', { ...site.productsOverview, stagesTitle: v })}
              />
            </div>
            <CmsTextArea
              label="Stages Subtitle"
              value={site.productsOverview.stagesSubtitle}
              onChange={(v) => updateSiteSection('productsOverview', { ...site.productsOverview, stagesSubtitle: v })}
              rows={2}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
              <CmsTextInput
                label="Layers Pill Tag"
                value={site.productsOverview.layersTag}
                onChange={(v) => updateSiteSection('productsOverview', { ...site.productsOverview, layersTag: v })}
              />
              <CmsTextInput
                label="Layers Section Title"
                value={site.productsOverview.layersTitle}
                onChange={(v) => updateSiteSection('productsOverview', { ...site.productsOverview, layersTitle: v })}
              />
            </div>
            <CmsTextArea
              label="Layers Subtitle"
              value={site.productsOverview.layersSubtitle}
              onChange={(v) => updateSiteSection('productsOverview', { ...site.productsOverview, layersSubtitle: v })}
              rows={2}
            />
            <CmsListEditor
              title="Overview Hero Stats"
              items={site.productsOverview.stats}
              onChange={(stats) => updateSiteSection('productsOverview', { ...site.productsOverview, stats })}
              createNew={() => ({ value: '100%', label: 'Metric' })}
              renderItem={(item, _, update) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                  <CmsTextInput label="Value" value={item.value} onChange={(v) => update({ value: v })} />
                  <CmsTextInput label="Label" value={item.label} onChange={(v) => update({ label: v })} />
                </div>
              )}
            />
          </CmsAccordion>

          <div style={{ marginTop: 14, padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Edit Individual Product Page</strong>
              <select
                value={selectedProductIdx}
                onChange={(e) => setSelectedProductIdx(Number(e.target.value))}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontWeight: 600 }}
              >
                {site.products.map((p, idx) => (
                  <option key={p.slug} value={idx}>
                    {idx + 1}. {p.title} (/products/{p.slug})
                  </option>
                ))}
              </select>
            </div>

            {site.products[selectedProductIdx] && (() => {
              const p = site.products[selectedProductIdx];
              const updateProduct = (patch: Partial<typeof p>) => {
                const next = [...site.products];
                next[selectedProductIdx] = { ...next[selectedProductIdx], ...patch };
                updateSiteSection('products', next);
              };
              return (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <CmsTextInput label="Product Title" value={p.title} onChange={(v) => updateProduct({ title: v })} />
                    <CmsTextInput label="Hero Headline" value={p.headline} onChange={(v) => updateProduct({ headline: v })} />
                  </div>
                  <CmsTextArea label="Short Summary" value={p.summary} onChange={(v) => updateProduct({ summary: v })} rows={2} />
                  <CmsTextArea label="Hero Lede / Subtitle" value={p.lede} onChange={(v) => updateProduct({ lede: v })} rows={2} />

                  <CmsListEditor
                    title="Hero Outcomes / Stats"
                    items={p.outcomes || []}
                    onChange={(outcomes) => updateProduct({ outcomes })}
                    createNew={() => ({ value: '50%', label: 'Faster outcome' })}
                    renderItem={(item, _, update) => (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                        <CmsTextInput label="Value" value={item.value} onChange={(v) => update({ value: v })} />
                        <CmsTextInput label="Label" value={item.label} onChange={(v) => update({ label: v })} />
                      </div>
                    )}
                  />

                  <CmsListEditor
                    title="Product Capabilities"
                    items={p.capabilities || []}
                    onChange={(capabilities) => updateProduct({ capabilities })}
                    createNew={() => ({ id: `cap-${Date.now()}`, title: 'New Capability', tagline: '', body: '', points: [] })}
                    renderItem={(cap, _, update) => (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <CmsTextInput label="Capability Title" value={cap.title} onChange={(v) => update({ title: v })} />
                          <CmsTextInput label="Tagline" value={cap.tagline || ''} onChange={(v) => update({ tagline: v })} />
                        </div>
                        <CmsTextArea label="Description" value={cap.body} onChange={(v) => update({ body: v })} rows={2} />
                        <CmsStringListEditor label="Bullet Points" items={cap.points || []} onChange={(v) => update({ points: v })} />
                      </>
                    )}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ---------------- SOLUTIONS ---------------- */}
      {section === 'solutions' && (
        <div>
          <CmsAccordion title="By Industry Solutions" badge={`${site.solutions.industrySolutions.length} items`} defaultOpen>
            <CmsTextInput
              label="Section Heading"
              value={site.solutions.industryHeading}
              onChange={(v) => updateSiteSection('solutions', { ...site.solutions, industryHeading: v })}
            />
            <CmsTextArea
              label="Section Intro"
              value={site.solutions.industryBody}
              onChange={(v) => updateSiteSection('solutions', { ...site.solutions, industryBody: v })}
              rows={2}
            />
            <CmsListEditor
              title="Industry Cards"
              items={site.solutions.industrySolutions}
              onChange={(industrySolutions) => updateSiteSection('solutions', { ...site.solutions, industrySolutions })}
              createNew={() => ({ id: `ind-${Date.now()}`, icon: 'building', title: 'New Industry', tagline: '', body: '', points: [], statValue: '50%', statLabel: 'faster' })}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderItem={(item: any, _, update) => (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <CmsTextInput label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                    <CmsTextInput label="Stat Value" value={item.statValue} onChange={(v) => update({ statValue: v })} />
                    <CmsTextInput label="Stat Label" value={item.statLabel} onChange={(v) => update({ statLabel: v })} />
                  </div>
                  <CmsTextArea label="Body" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
                  <CmsStringListEditor label="How We Help Points" items={item.points || []} onChange={(v) => update({ points: v })} />
                </>
              )}
            />
          </CmsAccordion>

          <CmsAccordion title="By Company Size Solutions" badge={`${site.solutions.sizeSolutions.length} tiers`}>
            <CmsListEditor
              title="Company Size Columns"
              items={site.solutions.sizeSolutions}
              onChange={(sizeSolutions) => updateSiteSection('solutions', { ...site.solutions, sizeSolutions })}
              createNew={() => ({ id: `size-${Date.now()}`, icon: 'users', title: 'New Tier', profile: '', body: '', points: [], plan: 'Professional' })}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderItem={(item: any, _, update) => (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <CmsTextInput label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                    <CmsTextInput label="Profile" value={item.profile} onChange={(v) => update({ profile: v })} />
                    <CmsTextInput label="Recommended Plan" value={item.plan} onChange={(v) => update({ plan: v })} />
                  </div>
                  <CmsTextArea label="Body" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
                  <CmsStringListEditor label="Points" items={item.points || []} onChange={(v) => update({ points: v })} />
                </>
              )}
            />
          </CmsAccordion>

          <CmsAccordion title="By Use Case Solutions" badge={`${site.solutions.useCaseSolutions.length} use cases`}>
            <CmsListEditor
              title="Use Case Rows"
              items={site.solutions.useCaseSolutions}
              onChange={(useCaseSolutions) => updateSiteSection('solutions', { ...site.solutions, useCaseSolutions })}
              createNew={() => ({ id: `uc-${Date.now()}`, icon: 'rocket', title: 'New Use Case', body: '', points: [], products: ['talent-sourcing'] })}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderItem={(item: any, _, update) => (
                <>
                  <CmsTextInput label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                  <CmsTextArea label="Body" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
                  <CmsStringListEditor label="Points" items={item.points || []} onChange={(v) => update({ points: v })} />
                </>
              )}
            />
          </CmsAccordion>
        </div>
      )}

      {/* ---------------- HOW IT WORKS ---------------- */}
      {section === 'howItWorks' && (
        <CmsAccordion title="Nine-Step Workflow (/how-it-works)" badge={`${site.howItWorksPage.workflow.length} steps`} defaultOpen>
          <CmsListEditor
            title="Workflow Steps"
            items={site.howItWorksPage.workflow}
            onChange={(workflow) => updateSiteSection('howItWorksPage', { workflow })}
            createNew={() => ({ title: 'New Step', owner: 'Your hiring team', body: '', output: '', href: '/products' })}
            renderItem={(item, _, update) => (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <CmsTextInput label="Step Title" value={item.title} onChange={(v) => update({ title: v })} />
                  <CmsTextInput label="Owner Tag" value={item.owner} onChange={(v) => update({ owner: v })} />
                  <CmsTextInput label="Product Link URL" value={item.href} onChange={(v) => update({ href: v })} />
                </div>
                <CmsTextArea label="Step Description" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
                <CmsTextInput label="Step Output / Deliverable" value={item.output} onChange={(v) => update({ output: v })} />
              </>
            )}
          />
        </CmsAccordion>
      )}

      {/* ---------------- CASE STUDIES ---------------- */}
      {section === 'caseStudies' && (
        <div>
          <CmsAccordion title="Case Studies Hero Stats" badge={`${site.caseStudiesPage.heroStats.length} stats`}>
            <CmsListEditor
              title="Hero Stats"
              items={site.caseStudiesPage.heroStats}
              onChange={(heroStats) => updateSiteSection('caseStudiesPage', { ...site.caseStudiesPage, heroStats })}
              createNew={() => ({ value: '50%', label: 'Faster' })}
              renderItem={(item, _, update) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                  <CmsTextInput label="Value" value={item.value} onChange={(v) => update({ value: v })} />
                  <CmsTextInput label="Label" value={item.label} onChange={(v) => update({ label: v })} />
                </div>
              )}
            />
          </CmsAccordion>

          <CmsAccordion title="Full Case Study Stories (/case-studies)" badge={`${site.caseStudiesPage.stories.length} stories`} defaultOpen>
            <CmsListEditor
              title="Case Studies"
              items={site.caseStudiesPage.stories}
              onChange={(stories) => updateSiteSection('caseStudiesPage', { ...site.caseStudiesPage, stories })}
              createNew={() => ({
                id: `cs-${Date.now()}`,
                company: 'New Customer',
                industry: 'IT & Technology',
                size: 'Enterprise',
                useCase: 'High Volume Hiring',
                title: 'Customer success headline',
                challenge: '',
                solution: [],
                featuresUsed: [],
                results: [{ stat: '60%', label: 'Faster hiring' }],
                bulletResults: [],
                quote: { text: '', author: '', role: '' },
                whatsNext: '',
              })}
              addLabel="+ Add Case Study"
              renderItem={(item, _, update) => (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                    <CmsTextInput label="Company" value={item.company} onChange={(v) => update({ company: v })} />
                    <CmsTextInput label="Industry" value={item.industry} onChange={(v) => update({ industry: v })} />
                    <CmsTextInput label="Size" value={item.size} onChange={(v) => update({ size: v })} />
                    <CmsTextInput label="Use Case" value={item.useCase} onChange={(v) => update({ useCase: v })} />
                  </div>
                  <CmsTextInput label="Story Headline" value={item.title} onChange={(v) => update({ title: v })} />
                  <CmsTextArea label="Challenge" value={item.challenge} onChange={(v) => update({ challenge: v })} rows={2} />
                  <CmsStringListEditor label="Solution Steps" items={item.solution} onChange={(v) => update({ solution: v })} />
                  <CmsStringListEditor label="Bullet Results" items={item.bulletResults} onChange={(v) => update({ bulletResults: v })} />
                  <CmsTextArea
                    label="Customer Quote"
                    value={item.quote?.text || ''}
                    onChange={(v) => update({ quote: { ...item.quote, text: v } })}
                    rows={2}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <CmsTextInput
                      label="Quote Author"
                      value={item.quote?.author || ''}
                      onChange={(v) => update({ quote: { ...item.quote, author: v } })}
                    />
                    <CmsTextInput
                      label="Author Role"
                      value={item.quote?.role || ''}
                      onChange={(v) => update({ quote: { ...item.quote, role: v } })}
                    />
                  </div>
                </>
              )}
            />
          </CmsAccordion>
        </div>
      )}

      {/* ---------------- CUSTOMERS ---------------- */}
      {section === 'customers' && (
        <div>
          <CmsAccordion title="Customers Page Settings & ROI Copy (/customers)" defaultOpen>
            <CmsTextArea
              label="Disclaimer Notice Banner"
              value={site.customersPage.notice}
              onChange={(v) => updateSiteSection('customersPage', { ...site.customersPage, notice: v })}
              rows={2}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
              <CmsTextInput
                label="ROI Calculator Title"
                value={site.customersPage.roiTitle}
                onChange={(v) => updateSiteSection('customersPage', { ...site.customersPage, roiTitle: v })}
              />
              <CmsTextInput
                label="ROI Calculator Subtitle"
                value={site.customersPage.roiBody}
                onChange={(v) => updateSiteSection('customersPage', { ...site.customersPage, roiBody: v })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <CmsTextInput
                label="Walkthrough Section Title"
                value={site.customersPage.videoTitle}
                onChange={(v) => updateSiteSection('customersPage', { ...site.customersPage, videoTitle: v })}
              />
              <CmsTextInput
                label="Walkthrough Link Label"
                value={site.customersPage.videoLinkLabel}
                onChange={(v) => updateSiteSection('customersPage', { ...site.customersPage, videoLinkLabel: v })}
              />
            </div>
            <CmsTextArea
              label="Walkthrough Body"
              value={site.customersPage.videoBody}
              onChange={(v) => updateSiteSection('customersPage', { ...site.customersPage, videoBody: v })}
              rows={2}
            />
          </CmsAccordion>

          <CmsAccordion title="Customer Testimonials Carousel" badge={`${site.customersPage.stories.length} testimonials`}>
            <CmsListEditor
              title="Testimonials"
              items={site.customersPage.stories}
              onChange={(stories) => updateSiteSection('customersPage', { ...site.customersPage, stories })}
              createNew={() => ({ stat: '60%', statLabel: 'faster time-to-hire', quote: '', name: 'Customer Name', role: 'VP Talent' })}
              renderItem={(item, _, update) => (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 2fr', gap: 8 }}>
                    <CmsTextInput label="Stat" value={item.stat} onChange={(v) => update({ stat: v })} />
                    <CmsTextInput label="Stat Label" value={item.statLabel} onChange={(v) => update({ statLabel: v })} />
                    <CmsTextInput label="Person Name" value={item.name} onChange={(v) => update({ name: v })} />
                    <CmsTextInput label="Title & Company" value={item.role} onChange={(v) => update({ role: v })} />
                  </div>
                  <CmsTextArea label="Quote" value={item.quote} onChange={(v) => update({ quote: v })} rows={2} />
                </>
              )}
            />
          </CmsAccordion>
        </div>
      )}

      {/* ---------------- INTEGRATIONS ---------------- */}
      {section === 'integrations' && (
        <CmsAccordion title="Integrations Directory (/integrations)" badge={`${site.integrationsPage.items.length} connectors`} defaultOpen>
          <CmsListEditor
            title="Integration Connectors"
            items={site.integrationsPage.items}
            onChange={(items) => updateSiteSection('integrationsPage', { items })}
            createNew={() => ({ name: 'New Connector', category: 'ATS' as const, mark: 'NC', tagline: '', description: '', features: [] })}
            addLabel="+ Add Integration"
            renderItem={(item, _, update) => (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                  <CmsTextInput label="Platform Name" value={item.name} onChange={(v) => update({ name: v })} />
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>Category</label>
                    <select
                      value={item.category}
                      onChange={(e) => update({ category: e.target.value as 'ATS' | 'HRMS' | 'Video' | 'Communication' })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    >
                      <option value="ATS">ATS</option>
                      <option value="HRMS">HRMS</option>
                      <option value="Video">Video</option>
                      <option value="Communication">Communication</option>
                    </select>
                  </div>
                  <CmsTextInput label="Badge Mark" value={item.mark} onChange={(v) => update({ mark: v })} />
                </div>
                <CmsTextInput label="Tagline" value={item.tagline} onChange={(v) => update({ tagline: v })} />
                <CmsTextArea label="Description" value={item.description} onChange={(v) => update({ description: v })} rows={2} />
                <CmsStringListEditor label="Key Features" items={item.features} onChange={(v) => update({ features: v })} />
              </>
            )}
          />
        </CmsAccordion>
      )}

      {/* ---------------- RESOURCES & BLOG ---------------- */}
      {section === 'resources' && (
        <div>
          <CmsAccordion title="Blog Articles (/blog)" badge={`${site.resourcesPage.blogPosts.length} articles`} defaultOpen>
            <CmsListEditor
              title="Blog Posts"
              items={site.resourcesPage.blogPosts}
              onChange={(blogPosts) => updateSiteSection('resourcesPage', { ...site.resourcesPage, blogPosts })}
              createNew={() => ({
                id: `post-${Date.now()}`,
                category: 'Hiring Strategy',
                title: 'New Blog Article',
                tagline: '',
                readTime: '5 min read',
                date: 'November 2026',
                author: 'TalentPool365 Team',
                summary: '',
                paragraphs: ['Write your article paragraph here.'],
              })}
              addLabel="+ Add Blog Post"
              renderItem={(post, _, update) => (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                    <CmsTextInput label="Title" value={post.title} onChange={(v) => update({ title: v })} />
                    <CmsTextInput label="Category" value={post.category} onChange={(v) => update({ category: v })} />
                    <CmsTextInput label="Date" value={post.date} onChange={(v) => update({ date: v })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <CmsTextInput label="Author" value={post.author} onChange={(v) => update({ author: v })} />
                    <CmsTextInput label="Read Time" value={post.readTime} onChange={(v) => update({ readTime: v })} />
                  </div>
                  <CmsTextArea label="Summary" value={post.summary} onChange={(v) => update({ summary: v })} rows={2} />
                  <CmsStringListEditor label="Article Paragraphs" items={post.paragraphs} onChange={(v) => update({ paragraphs: v })} />
                </>
              )}
            />
          </CmsAccordion>

          <CmsAccordion title="Resource Guides & Whitepapers (/resources)" badge={`${site.resourcesPage.resources.length} guides`}>
            <CmsListEditor
              title="Resources"
              items={site.resourcesPage.resources}
              onChange={(resources) => updateSiteSection('resourcesPage', { ...site.resourcesPage, resources })}
              createNew={() => ({ id: `res-${Date.now()}`, type: 'Guide', title: 'New Guide', intro: '', paragraphs: [''] })}
              addLabel="+ Add Resource"
              renderItem={(item, _, update) => (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                    <CmsTextInput label="Type" value={item.type} onChange={(v) => update({ type: v })} />
                    <CmsTextInput label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                  </div>
                  <CmsTextArea label="Intro" value={item.intro} onChange={(v) => update({ intro: v })} rows={2} />
                  <CmsStringListEditor label="Paragraphs" items={item.paragraphs} onChange={(v) => update({ paragraphs: v })} />
                </>
              )}
            />
          </CmsAccordion>

          <CmsAccordion title="Hiring Glossary" badge={`${site.resourcesPage.glossary.length} terms`}>
            <CmsListEditor
              title="Glossary Terms"
              items={site.resourcesPage.glossary}
              onChange={(glossary) => updateSiteSection('resourcesPage', { ...site.resourcesPage, glossary })}
              createNew={() => ({ term: 'New Term', definition: '' })}
              renderItem={(item, _, update) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 8 }}>
                  <CmsTextInput label="Term" value={item.term} onChange={(v) => update({ term: v })} />
                  <CmsTextInput label="Definition" value={item.definition} onChange={(v) => update({ definition: v })} />
                </div>
              )}
            />
          </CmsAccordion>
        </div>
      )}

      {/* ---------------- COMPANY (ALL 7 PAGES) ---------------- */}
      {section === 'company' && (
        <div>
          <CmsAccordion title="Leadership Team (/company/leadership)" badge={`${site.company.leaders.length} leaders`} defaultOpen>
            <CmsListEditor
              title="Leaders"
              items={site.company.leaders}
              onChange={(leaders) => updateSiteSection('company', { ...site.company, leaders })}
              createNew={() => ({ initials: 'NL', name: 'New Leader', title: 'VP', bio: '', owns: '' })}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderItem={(item: any, _, update) => (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', gap: 8 }}>
                    <CmsTextInput label="Initials" value={item.initials} onChange={(v) => update({ initials: v })} />
                    <CmsTextInput label="Name" value={item.name} onChange={(v) => update({ name: v })} />
                    <CmsTextInput label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                    <CmsTextInput label="Answers For" value={item.owns} onChange={(v) => update({ owns: v })} />
                  </div>
                  <CmsTextArea label="Bio" value={item.bio} onChange={(v) => update({ bio: v })} rows={2} />
                </>
              )}
            />
          </CmsAccordion>

          <CmsAccordion title="Careers & Open Roles (/company/careers)" badge={`${site.company.vacancies.length} open roles`}>
            <CmsListEditor
              title="Open Vacancies"
              items={site.company.vacancies}
              onChange={(vacancies) => updateSiteSection('company', { ...site.company, vacancies })}
              createNew={() => ({ title: 'New Role', team: 'Engineering', location: 'Remote', type: 'Full-time' })}
              addLabel="+ Add Open Role"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderItem={(item: any, _, update) => (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8 }}>
                  <CmsTextInput label="Role Title" value={item.title} onChange={(v) => update({ title: v })} />
                  <CmsTextInput label="Team" value={item.team} onChange={(v) => update({ team: v })} />
                  <CmsTextInput label="Location" value={item.location} onChange={(v) => update({ location: v })} />
                  <CmsTextInput label="Type" value={item.type} onChange={(v) => update({ type: v })} />
                </div>
              )}
            />
            <CmsStringListEditor
              label="Employee Benefits"
              items={site.company.benefits}
              onChange={(benefits) => updateSiteSection('company', { ...site.company, benefits })}
            />
          </CmsAccordion>

          <CmsAccordion title="Partners (/company/partners)" badge={`${site.company.partnerPrograms.length} programs`}>
            <CmsListEditor
              title="Partner Programmes"
              items={site.company.partnerPrograms}
              onChange={(partnerPrograms) => updateSiteSection('company', { ...site.company, partnerPrograms })}
              createNew={() => ({ icon: 'handshake', title: 'New Program', who: '', body: '', points: [] })}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderItem={(item: any, _, update) => (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <CmsTextInput label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                    <CmsTextInput label="Audience" value={item.who} onChange={(v) => update({ who: v })} />
                  </div>
                  <CmsTextArea label="Description" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
                  <CmsStringListEditor label="Bullet Points" items={item.points || []} onChange={(v) => update({ points: v })} />
                </>
              )}
            />
          </CmsAccordion>

          <CmsAccordion title="Technology & Innovation (/company/technology)" badge={`${site.company.platformFacts.length} stats`}>
            <CmsListEditor
              title="Platform Facts"
              items={site.company.platformFacts}
              onChange={(platformFacts) => updateSiteSection('company', { ...site.company, platformFacts })}
              createNew={() => ({ value: '99.9%', label: 'Uptime' })}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderItem={(item: any, _, update) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                  <CmsTextInput label="Value" value={item.value} onChange={(v) => update({ value: v })} />
                  <CmsTextInput label="Label" value={item.label} onChange={(v) => update({ label: v })} />
                </div>
              )}
            />
            <CmsListEditor
              title="AI Guardrails"
              items={site.company.guardrails}
              onChange={(guardrails) => updateSiteSection('company', { ...site.company, guardrails })}
              createNew={() => ({ icon: 'shield', title: 'Guardrail', body: '' })}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderItem={(item: any, _, update) => (
                <>
                  <CmsTextInput label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                  <CmsTextArea label="Body" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
                </>
              )}
            />
          </CmsAccordion>

          <CmsAccordion title="News & Press Releases (/company/news)" badge={`${site.company.pressItems.length} releases`}>
            <CmsListEditor
              title="Press Releases"
              items={site.company.pressItems}
              onChange={(pressItems) => updateSiteSection('company', { ...site.company, pressItems })}
              createNew={() => ({ date: 'November 2026', iso: '2026-11-01', tag: 'Announcement', title: 'New Release', summary: '' })}
              addLabel="+ Add Press Release"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderItem={(item: any, _, update) => (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 8 }}>
                    <CmsTextInput label="Date" value={item.date} onChange={(v) => update({ date: v })} />
                    <CmsTextInput label="Tag" value={item.tag} onChange={(v) => update({ tag: v })} />
                    <CmsTextInput label="Headline" value={item.title} onChange={(v) => update({ title: v })} />
                  </div>
                  <CmsTextArea label="Summary" value={item.summary} onChange={(v) => update({ summary: v })} rows={2} />
                </>
              )}
            />
          </CmsAccordion>

          <CmsAccordion title="Contact Channels & Offices (/company/contact)">
            <CmsListEditor
              title="Contact Channels"
              items={site.company.contactChannels}
              onChange={(contactChannels) => updateSiteSection('company', { ...site.company, contactChannels })}
              createNew={() => ({ icon: 'mail', title: 'Team', body: '', email: 'hello@talentpool365.com' })}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderItem={(item: any, _, update) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 8 }}>
                  <CmsTextInput label="Team Name" value={item.title} onChange={(v) => update({ title: v })} />
                  <CmsTextInput label="Email" value={item.email} onChange={(v) => update({ email: v })} />
                  <CmsTextInput label="Description" value={item.body} onChange={(v) => update({ body: v })} />
                </div>
              )}
            />
            <CmsListEditor
              title="Global Offices"
              items={site.company.offices}
              onChange={(offices) => updateSiteSection('company', { ...site.company, offices })}
              createNew={() => ({ city: 'New City', role: 'Regional Office', detail: '', hours: 'Mon-Fri 9-6' })}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderItem={(item: any, _, update) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: 8 }}>
                  <CmsTextInput label="City" value={item.city} onChange={(v) => update({ city: v })} />
                  <CmsTextInput label="Role" value={item.role} onChange={(v) => update({ role: v })} />
                  <CmsTextInput label="Address / Detail" value={item.detail} onChange={(v) => update({ detail: v })} />
                  <CmsTextInput label="Hours" value={item.hours} onChange={(v) => update({ hours: v })} />
                </div>
              )}
            />
          </CmsAccordion>
        </div>
      )}

      {/* ---------------- GET STARTED ---------------- */}
      {section === 'getStarted' && (
        <CmsAccordion title="Get Started & Demo Page (/get-started)" defaultOpen>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <CmsTextInput
              label="Preview Card Name"
              value={site.getStartedPage.previewName}
              onChange={(v) => updateSiteSection('getStartedPage', { ...site.getStartedPage, previewName: v })}
            />
            <CmsTextInput
              label="Preview Match Badge"
              value={site.getStartedPage.previewBadge}
              onChange={(v) => updateSiteSection('getStartedPage', { ...site.getStartedPage, previewBadge: v })}
            />
          </div>
          <CmsTextInput
            label="Preview Card Description"
            value={site.getStartedPage.previewDesc}
            onChange={(v) => updateSiteSection('getStartedPage', { ...site.getStartedPage, previewDesc: v })}
          />
          <CmsStringListEditor
            label="Hero Checklist Items"
            items={site.getStartedPage.checklist}
            onChange={(checklist) => updateSiteSection('getStartedPage', { ...site.getStartedPage, checklist })}
          />
          <CmsListEditor
            title="Hero Trust Stats"
            items={site.getStartedPage.stats}
            onChange={(stats) => updateSiteSection('getStartedPage', { ...site.getStartedPage, stats })}
            createNew={() => ({ value: '100+', label: 'Stat' })}
            renderItem={(item, _, update) => (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                <CmsTextInput label="Value" value={item.value} onChange={(v) => update({ value: v })} />
                <CmsTextInput label="Label" value={item.label} onChange={(v) => update({ label: v })} />
              </div>
            )}
          />
          <CmsListEditor
            title="Form Intent Tabs"
            items={site.getStartedPage.intents}
            onChange={(intents) => updateSiteSection('getStartedPage', { ...site.getStartedPage, intents })}
            createNew={() => ({ id: `intent-${Date.now()}`, label: 'New Tab', title: '', body: '' })}
            renderItem={(item, _, update) => (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                  <CmsTextInput label="Tab Label" value={item.label} onChange={(v) => update({ label: v })} />
                  <CmsTextInput label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                </div>
                <CmsTextArea label="Description" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
              </>
            )}
          />
        </CmsAccordion>
      )}

      {/* ---------------- SUPPORT ---------------- */}
      {section === 'support' && (
        <div>
          <CmsAccordion title="Support Help Center & Ticket Section (/support)" defaultOpen>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
              <CmsTextInput
                label="Help Center Tag"
                value={site.supportPage.helpCenterTag}
                onChange={(v) => updateSiteSection('supportPage', { ...site.supportPage, helpCenterTag: v })}
              />
              <CmsTextInput
                label="Help Center Title"
                value={site.supportPage.helpCenterTitle}
                onChange={(v) => updateSiteSection('supportPage', { ...site.supportPage, helpCenterTitle: v })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <CmsTextInput
                label="Support Email"
                value={site.supportPage.supportEmail}
                onChange={(v) => updateSiteSection('supportPage', { ...site.supportPage, supportEmail: v })}
              />
              <CmsTextInput
                label="Ticket Section Title"
                value={site.supportPage.ticketTitle}
                onChange={(v) => updateSiteSection('supportPage', { ...site.supportPage, ticketTitle: v })}
              />
            </div>
            <CmsTextArea
              label="Ticket Section Description"
              value={site.supportPage.ticketBody}
              onChange={(v) => updateSiteSection('supportPage', { ...site.supportPage, ticketBody: v })}
              rows={2}
            />
            <CmsTextInput
              label="System Status Title"
              value={site.supportPage.statusTitle}
              onChange={(v) => updateSiteSection('supportPage', { ...site.supportPage, statusTitle: v })}
            />
            <CmsTextArea
              label="System Status Body"
              value={site.supportPage.statusBody}
              onChange={(v) => updateSiteSection('supportPage', { ...site.supportPage, statusBody: v })}
              rows={2}
            />
          </CmsAccordion>

          <CmsAccordion title="Support FAQs" badge={`${site.supportPage.faqs.length} FAQs`}>
            <CmsListEditor
              title="Support Questions"
              items={site.supportPage.faqs}
              onChange={(faqs) => updateSiteSection('supportPage', { ...site.supportPage, faqs })}
              createNew={() => ({ question: 'New support question?', answer: '' })}
              renderItem={(item, _, update) => (
                <>
                  <CmsTextInput label="Question" value={item.question} onChange={(v) => update({ question: v })} />
                  <CmsTextArea label="Answer" value={item.answer} onChange={(v) => update({ answer: v })} rows={2} />
                </>
              )}
            />
          </CmsAccordion>
        </div>
      )}

      {/* ---------------- LEGAL ---------------- */}
      {section === 'legal' && (
        <div>
          <CmsAccordion title="Data Protection Officer & Policy Headers (/legal)" defaultOpen>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <CmsTextInput
                label="DPO Title"
                value={site.legalPage.dpoTitle}
                onChange={(v) => updateSiteSection('legalPage', { ...site.legalPage, dpoTitle: v })}
              />
              <CmsTextInput
                label="DPO Email"
                value={site.legalPage.dpoEmail}
                onChange={(v) => updateSiteSection('legalPage', { ...site.legalPage, dpoEmail: v })}
              />
            </div>
            <CmsTextInput
              label="Privacy Effective Date Line"
              value={site.legalPage.privacyEffectiveDate}
              onChange={(v) => updateSiteSection('legalPage', { ...site.legalPage, privacyEffectiveDate: v })}
            />
            <CmsTextInput
              label="Terms Effective Date Line"
              value={site.legalPage.termsEffectiveDate}
              onChange={(v) => updateSiteSection('legalPage', { ...site.legalPage, termsEffectiveDate: v })}
            />
          </CmsAccordion>

          <CmsAccordion title="Privacy Policy Clauses" badge={`${site.legalPage.privacySections.length} clauses`}>
            <CmsListEditor
              title="Privacy Clauses"
              items={site.legalPage.privacySections}
              onChange={(privacySections) => updateSiteSection('legalPage', { ...site.legalPage, privacySections })}
              createNew={() => ({ num: String(site.legalPage.privacySections.length + 1), title: 'New Clause', content: '' })}
              renderItem={(item, _, update) => (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8 }}>
                    <CmsTextInput label="#" value={item.num} onChange={(v) => update({ num: v })} />
                    <CmsTextInput label="Clause Title" value={item.title} onChange={(v) => update({ title: v })} />
                  </div>
                  <CmsTextArea label="Clause Content" value={item.content} onChange={(v) => update({ content: v })} rows={4} />
                </>
              )}
            />
          </CmsAccordion>

          <CmsAccordion title="Terms of Service Clauses" badge={`${site.legalPage.termsSections.length} clauses`}>
            <CmsListEditor
              title="Terms Clauses"
              items={site.legalPage.termsSections}
              onChange={(termsSections) => updateSiteSection('legalPage', { ...site.legalPage, termsSections })}
              createNew={() => ({ num: String(site.legalPage.termsSections.length + 1), title: 'New Clause', content: '' })}
              renderItem={(item, _, update) => (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8 }}>
                    <CmsTextInput label="#" value={item.num} onChange={(v) => update({ num: v })} />
                    <CmsTextInput label="Clause Title" value={item.title} onChange={(v) => update({ title: v })} />
                  </div>
                  <CmsTextArea label="Clause Content" value={item.content} onChange={(v) => update({ content: v })} rows={4} />
                </>
              )}
            />
          </CmsAccordion>

          <CmsAccordion title="GDPR & DPA Compliance Cards" badge={`${site.legalPage.gdprCards.length} cards`}>
            <CmsListEditor
              title="GDPR Cards"
              items={site.legalPage.gdprCards}
              onChange={(gdprCards) => updateSiteSection('legalPage', { ...site.legalPage, gdprCards })}
              createNew={() => ({ title: 'New Compliance Card', body: '' })}
              renderItem={(item, _, update) => (
                <>
                  <CmsTextInput label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                  <CmsTextArea label="Body" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
                </>
              )}
            />
          </CmsAccordion>
        </div>
      )}
    </div>
  );
}
