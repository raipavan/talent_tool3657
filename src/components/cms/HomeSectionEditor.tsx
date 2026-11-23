import { useCms } from '../../cms/CmsProvider';
import {
  CmsAccordion,
  CmsImageInput,
  CmsListEditor,
  CmsStringListEditor,
  CmsTextArea,
  CmsTextInput,
} from './CmsFieldEditors';

export function HomeSectionEditor() {
  const { draftSite: site, updateHome, updateSiteSection } = useCms();
  const home = site.home;
  const banners = site.globalBanners;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setHomeField = (key: string, value: any) => {
    updateHome({ ...home, [key]: value });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setNested = (section: string, field: string, value: any) => {
    updateHome({
      ...home,
      [section]: { ...(home[section] || {}), [field]: value },
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
          Homepage Content Editor (All 16 Sections)
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
          Expand any section below to edit headlines, descriptions, rotating words, cards, metrics, FAQs, and buttons. Changes update live and auto-sync to your CMS backend.
        </p>
      </div>

      {/* 1. HERO */}
      <CmsAccordion title="1. Hero Banner" badge="Top Fold" defaultOpen>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <CmsTextInput
            label="Headline Line 1"
            value={home.hero?.headlinePrefix || ''}
            onChange={(v) => setNested('hero', 'headlinePrefix', v)}
          />
          <CmsTextInput
            label="Headline Line 2 (before rotating word)"
            value={home.hero?.headlineSecondLine || ''}
            onChange={(v) => setNested('hero', 'headlineSecondLine', v)}
          />
        </div>
        <CmsStringListEditor
          label="Rotating Accent Words (e.g. talent, engineers, nurses)"
          items={home.heroRoles || []}
          onChange={(v) => setHomeField('heroRoles', v)}
        />
        <CmsTextArea
          label="Hero Subheadline / Description"
          value={home.hero?.subheadline || ''}
          onChange={(v) => setNested('hero', 'subheadline', v)}
          rows={2}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <CmsTextInput
            label="Primary Button Text"
            value={home.hero?.ctaPrimary || ''}
            onChange={(v) => setNested('hero', 'ctaPrimary', v)}
          />
          <CmsTextInput
            label="Primary Button URL"
            value={home.hero?.ctaPrimaryHref || ''}
            onChange={(v) => setNested('hero', 'ctaPrimaryHref', v)}
          />
          <CmsTextInput
            label="Secondary Button Text"
            value={home.hero?.ctaSecondary || ''}
            onChange={(v) => setNested('hero', 'ctaSecondary', v)}
          />
          <CmsTextInput
            label="Secondary Button URL"
            value={home.hero?.ctaSecondaryHref || ''}
            onChange={(v) => setNested('hero', 'ctaSecondaryHref', v)}
          />
        </div>
        <CmsImageInput
          label="Hero Background Image URL"
          value={home.hero?.bgImage || ''}
          onChange={(v) => setNested('hero', 'bgImage', v)}
        />
      </CmsAccordion>

      {/* 2. LOGO MARQUEE */}
      <CmsAccordion title="2. Trusted Companies Logo Bar" badge={`${(home.companyLogos || []).length} logos`}>
        <CmsTextInput
          label="Section Label"
          value={home.logosLabel || ''}
          onChange={(v) => setHomeField('logosLabel', v)}
        />
        <CmsListEditor
          title="Company Logos"
          items={home.companyLogos || []}
          onChange={(v) => setHomeField('companyLogos', v)}
          createNew={() => ({ name: 'New Company', style: 'logo--sans' })}
          addLabel="+ Add Company"
          renderItem={(item: { name: string; style: string }, _, update) => (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
              <CmsTextInput label="Company Name" value={item.name} onChange={(v) => update({ name: v })} />
              <CmsTextInput label="CSS Style Class" value={item.style} onChange={(v) => update({ style: v })} />
            </div>
          )}
        />
      </CmsAccordion>

      {/* 3. FIVE AI AGENTS */}
      <CmsAccordion title="3. Five AI Agents Pipeline" badge={`${(home.agents || []).length} agents`}>
        <CmsTextInput
          label="Section Title (wrap accent phrase in *asterisks*)"
          value={home.agentsSection?.title || ''}
          onChange={(v) => setNested('agentsSection', 'title', v)}
        />
        <CmsTextArea
          label="Section Subtitle"
          value={home.agentsSection?.subtitle || ''}
          onChange={(v) => setNested('agentsSection', 'subtitle', v)}
          rows={2}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <CmsTextInput
            label="Talent Pool Caption"
            value={home.agentsSection?.poolLabel || ''}
            onChange={(v) => setNested('agentsSection', 'poolLabel', v)}
          />
          <CmsTextInput
            label="Scroll Hint Text"
            value={home.agentsSection?.scrollHint || ''}
            onChange={(v) => setNested('agentsSection', 'scrollHint', v)}
          />
        </div>
        <CmsListEditor
          title="AI Agents"
          items={home.agents || []}
          onChange={(v) => setHomeField('agents', v)}
          createNew={() => ({ station: 'Stage', name: 'New Agent', body: '', count: 50, countLabel: 'candidates' })}
          renderItem={(item: { station: string; name: string; body: string; count: number; countLabel: string }, _, update) => (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                <CmsTextInput label="Station Label" value={item.station} onChange={(v) => update({ station: v })} />
                <CmsTextInput label="Agent Name" value={item.name} onChange={(v) => update({ name: v })} />
                <CmsTextInput
                  label="Count"
                  type="number"
                  value={String(item.count)}
                  onChange={(v) => update({ count: Number(v) || 0 })}
                />
                <CmsTextInput label="Count Label" value={item.countLabel} onChange={(v) => update({ countLabel: v })} />
              </div>
              <CmsTextArea label="Description" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
            </>
          )}
        />
      </CmsAccordion>

      {/* 4. PRODUCTS SHOWCASE */}
      <CmsAccordion title="4. Products Interactive Showcase" badge={`${(home.products || []).length} tabs`}>
        <CmsTextInput
          label="Section Title"
          value={home.productsSection?.title || ''}
          onChange={(v) => setNested('productsSection', 'title', v)}
        />
        <CmsTextArea
          label="Section Body"
          value={home.productsSection?.body || ''}
          onChange={(v) => setNested('productsSection', 'body', v)}
          rows={2}
        />
        <CmsListEditor
          title="Showcase Product Tabs"
          items={home.products || []}
          onChange={(v) => setHomeField('products', v)}
          createNew={() => ({ icon: 'layers', href: '/products', title: 'New Product', body: '', points: ['Key feature'] })}
          renderItem={(item: { icon: string; href: string; title: string; body: string; points: string[] }, _, update) => (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <CmsTextInput label="Product Title" value={item.title} onChange={(v) => update({ title: v })} />
                <CmsTextInput label="Link URL" value={item.href} onChange={(v) => update({ href: v })} />
              </div>
              <CmsTextArea label="Summary" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
              <CmsStringListEditor label="Bullet Points" items={item.points || []} onChange={(v) => update({ points: v })} />
            </>
          )}
        />
      </CmsAccordion>

      {/* 5. INTERVIEW SPLIT & DEMO VIDEO */}
      <CmsAccordion title="5. Inside AI Interviews & Demo Video">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <CmsTextInput
            label="Eyebrow"
            value={home.interviewSplit?.eyebrow || ''}
            onChange={(v) => setNested('interviewSplit', 'eyebrow', v)}
          />
          <CmsTextInput
            label="CTA Button Text"
            value={home.interviewSplit?.cta || ''}
            onChange={(v) => setNested('interviewSplit', 'cta', v)}
          />
        </div>
        <CmsTextInput
          label="Section Title"
          value={home.interviewSplit?.title || ''}
          onChange={(v) => setNested('interviewSplit', 'title', v)}
        />
        <CmsTextArea
          label="Body Text"
          value={home.interviewSplit?.body || ''}
          onChange={(v) => setNested('interviewSplit', 'body', v)}
          rows={2}
        />
        <CmsStringListEditor
          label="Checklist Points"
          items={home.interviewSplit?.points || []}
          onChange={(v) => setNested('interviewSplit', 'points', v)}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
          <CmsTextInput
            label="Demo Video URL (.mp4, YouTube, or Vimeo)"
            value={home.demoVideo?.src || ''}
            onChange={(v) => setNested('demoVideo', 'src', v)}
          />
          <CmsTextInput
            label="Video Title"
            value={home.demoVideo?.title || ''}
            onChange={(v) => setNested('demoVideo', 'title', v)}
          />
          <CmsImageInput
            label="Video Poster Image"
            value={home.demoVideo?.poster || ''}
            onChange={(v) => setNested('demoVideo', 'poster', v)}
          />
          <CmsTextInput
            label="Video Length Tag"
            value={home.demoVideo?.length || ''}
            onChange={(v) => setNested('demoVideo', 'length', v)}
          />
        </div>
      </CmsAccordion>

      {/* 6. SOLUTIONS BY INDUSTRY */}
      <CmsAccordion title="6. Solutions by Industry Rail" badge={`${(home.industries || []).length} sectors`}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
          <CmsTextInput
            label="Eyebrow"
            value={home.solutionsSection?.eyebrow || ''}
            onChange={(v) => setNested('solutionsSection', 'eyebrow', v)}
          />
          <CmsTextInput
            label="Title"
            value={home.solutionsSection?.title || ''}
            onChange={(v) => setNested('solutionsSection', 'title', v)}
          />
        </div>
        <CmsTextArea
          label="Body"
          value={home.solutionsSection?.body || ''}
          onChange={(v) => setNested('solutionsSection', 'body', v)}
          rows={2}
        />
        <CmsListEditor
          title="Industry Cards"
          items={home.industries || []}
          onChange={(v) => setHomeField('industries', v)}
          createNew={() => ({ icon: 'building', title: 'New Industry', body: '', statValue: '50%', statLabel: 'faster' })}
          renderItem={(item: { title: string; body: string; statValue: string; statLabel: string }, _, update) => (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 8 }}>
                <CmsTextInput label="Industry Title" value={item.title} onChange={(v) => update({ title: v })} />
                <CmsTextInput label="Stat Value" value={item.statValue} onChange={(v) => update({ statValue: v })} />
                <CmsTextInput label="Stat Label" value={item.statLabel} onChange={(v) => update({ statLabel: v })} />
              </div>
              <CmsTextArea label="Description" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
            </>
          )}
        />
      </CmsAccordion>

      {/* 7. HOW IT WORKS */}
      <CmsAccordion title="7. How It Works (Six Moves)" badge={`${(home.steps || []).length} steps`}>
        <CmsTextInput
          label="Section Title"
          value={home.howItWorksSection?.title || ''}
          onChange={(v) => setNested('howItWorksSection', 'title', v)}
        />
        <CmsTextArea
          label="Section Body"
          value={home.howItWorksSection?.body || ''}
          onChange={(v) => setNested('howItWorksSection', 'body', v)}
          rows={2}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <CmsTextInput
            label="Button Label"
            value={home.howItWorksSection?.ctaLabel || ''}
            onChange={(v) => setNested('howItWorksSection', 'ctaLabel', v)}
          />
          <CmsTextInput
            label="Button URL"
            value={home.howItWorksSection?.ctaHref || ''}
            onChange={(v) => setNested('howItWorksSection', 'ctaHref', v)}
          />
        </div>
        <CmsListEditor
          title="Steps"
          items={home.steps || []}
          onChange={(v) => setHomeField('steps', v)}
          createNew={() => ({ title: 'New Step', body: '' })}
          renderItem={(item: { title: string; body: string }, _, update) => (
            <>
              <CmsTextInput label="Step Title" value={item.title} onChange={(v) => update({ title: v })} />
              <CmsTextArea label="Step Description" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
            </>
          )}
        />
      </CmsAccordion>

      {/* 8. PROVEN IMPACT METRICS */}
      <CmsAccordion title="8. Proven Impact Metrics" badge={`${(home.metrics || []).length} stats`}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
          <CmsTextInput
            label="Eyebrow"
            value={home.metricsSection?.eyebrow || ''}
            onChange={(v) => setNested('metricsSection', 'eyebrow', v)}
          />
          <CmsTextInput
            label="Section Title"
            value={home.metricsSection?.title || ''}
            onChange={(v) => setNested('metricsSection', 'title', v)}
          />
        </div>
        <CmsListEditor
          title="Impact Metrics"
          items={home.metrics || []}
          onChange={(v) => setHomeField('metrics', v)}
          createNew={() => ({ value: 50, suffix: '%', label: 'Faster hiring', decimals: 0 })}
          renderItem={(item: { value: number; suffix: string; label: string; decimals?: number }, _, update) => (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: 8 }}>
              <CmsTextInput
                label="Numeric Value"
                type="number"
                value={String(item.value)}
                onChange={(v) => update({ value: Number(v) || 0 })}
              />
              <CmsTextInput label="Suffix (%, x, etc.)" value={item.suffix} onChange={(v) => update({ suffix: v })} />
              <CmsTextInput
                label="Decimals"
                type="number"
                value={String(item.decimals ?? 0)}
                onChange={(v) => update({ decimals: Number(v) || 0 })}
              />
              <CmsTextInput label="Label" value={item.label} onChange={(v) => update({ label: v })} />
            </div>
          )}
        />
      </CmsAccordion>

      {/* 9. WHY SWITCH */}
      <CmsAccordion title="9. Why TalentPool365 (Handoffs)" badge={`${(home.switchRows || []).length} cards`}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <CmsTextInput label="Eyebrow" value={home.whySwitchSection?.eyebrow || ''} onChange={(v) => setNested('whySwitchSection', 'eyebrow', v)} />
          <CmsTextInput label="Top Link Label" value={home.whySwitchSection?.linkLabel || ''} onChange={(v) => setNested('whySwitchSection', 'linkLabel', v)} />
          <CmsTextInput label="Top Link URL" value={home.whySwitchSection?.linkHref || ''} onChange={(v) => setNested('whySwitchSection', 'linkHref', v)} />
        </div>
        <CmsTextInput label="Title" value={home.whySwitchSection?.title || ''} onChange={(v) => setNested('whySwitchSection', 'title', v)} />
        <CmsTextArea label="Lede Paragraph" value={home.whySwitchSection?.lede || ''} onChange={(v) => setNested('whySwitchSection', 'lede', v)} rows={2} />
        <CmsListEditor
          title="Why Switch Cards"
          items={home.switchRows || []}
          onChange={(v) => setHomeField('switchRows', v)}
          createNew={() => ({ eyebrow: 'Advantage', title: 'New Reason', body: '', points: [], visual: 'search' })}
          renderItem={(item: { title: string; body: string }, _, update) => (
            <>
              <CmsTextInput label="Card Title" value={item.title} onChange={(v) => update({ title: v })} />
              <CmsTextArea label="Card Description" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
            </>
          )}
        />
      </CmsAccordion>

      {/* 10. INTEGRATIONS */}
      <CmsAccordion title="10. Integrations Orbit & Grid" badge={`${(home.integrations || []).length} tiles`}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
          <CmsTextInput label="Eyebrow" value={home.integrationsSection?.eyebrow || ''} onChange={(v) => setNested('integrationsSection', 'eyebrow', v)} />
          <CmsTextInput label="Title" value={home.integrationsSection?.title || ''} onChange={(v) => setNested('integrationsSection', 'title', v)} />
        </div>
        <CmsTextArea label="Body" value={home.integrationsSection?.body || ''} onChange={(v) => setNested('integrationsSection', 'body', v)} rows={2} />
        <CmsTextArea label="Bottom API Note" value={home.integrationsSection?.footerNote || ''} onChange={(v) => setNested('integrationsSection', 'footerNote', v)} rows={2} />
        <CmsListEditor
          title="Integration Tiles"
          items={home.integrations || []}
          onChange={(v) => setHomeField('integrations', v)}
          createNew={() => ({ mark: 'NEW', label: 'New Platform' })}
          renderItem={(item: { mark: string; label: string }, _, update) => (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 10 }}>
              <CmsTextInput label="Short Mark" value={item.mark} onChange={(v) => update({ mark: v })} />
              <CmsTextInput label="Platform Name" value={item.label} onChange={(v) => update({ label: v })} />
            </div>
          )}
        />
      </CmsAccordion>

      {/* 11. FEATURED CASE STUDIES */}
      <CmsAccordion title="11. Featured Case Studies (Homepage)" badge={`${(home.caseStudies || []).length} cards`}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
          <CmsTextInput label="Eyebrow" value={home.caseStudiesSection?.eyebrow || ''} onChange={(v) => setNested('caseStudiesSection', 'eyebrow', v)} />
          <CmsTextInput label="Title" value={home.caseStudiesSection?.title || ''} onChange={(v) => setNested('caseStudiesSection', 'title', v)} />
        </div>
        <CmsTextArea label="Body" value={home.caseStudiesSection?.body || ''} onChange={(v) => setNested('caseStudiesSection', 'body', v)} rows={2} />
        <CmsListEditor
          title="Case Study Cards"
          items={home.caseStudies || []}
          onChange={(v) => setHomeField('caseStudies', v)}
          createNew={() => ({ company: 'New Company', industry: 'Tech', stat: '50%', statLabel: 'faster', challenge: '', approach: '', results: [] as string[] })}
          renderItem={(item: { company: string; industry: string; stat: string; statLabel: string; challenge: string; approach: string; results: string[] }, _, update) => (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                <CmsTextInput label="Company" value={item.company} onChange={(v) => update({ company: v })} />
                <CmsTextInput label="Industry" value={item.industry} onChange={(v) => update({ industry: v })} />
                <CmsTextInput label="Headline Stat" value={item.stat} onChange={(v) => update({ stat: v })} />
                <CmsTextInput label="Stat Label" value={item.statLabel} onChange={(v) => update({ statLabel: v })} />
              </div>
              <CmsTextArea label="Challenge" value={item.challenge} onChange={(v) => update({ challenge: v })} rows={2} />
              <CmsTextArea label="What Changed" value={item.approach} onChange={(v) => update({ approach: v })} rows={2} />
              <CmsStringListEditor label="Key Results" items={item.results || []} onChange={(v) => update({ results: v })} />
            </>
          )}
        />
      </CmsAccordion>

      {/* 12. ABOUT, TIMELINE, VALUES & HIRES */}
      <CmsAccordion title="12. About, Timeline, Values & People Hired">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
          <CmsTextInput label="Eyebrow" value={home.aboutSection?.eyebrow || ''} onChange={(v) => setNested('aboutSection', 'eyebrow', v)} />
          <CmsTextInput label="Title" value={home.aboutSection?.title || ''} onChange={(v) => setNested('aboutSection', 'title', v)} />
        </div>
        <CmsTextArea label="Story Paragraph 1" value={home.aboutSection?.paragraph1 || ''} onChange={(v) => setNested('aboutSection', 'paragraph1', v)} rows={3} />
        <CmsTextArea label="Story Paragraph 2" value={home.aboutSection?.paragraph2 || ''} onChange={(v) => setNested('aboutSection', 'paragraph2', v)} rows={3} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <CmsTextInput label="CTA Label" value={home.aboutSection?.ctaLabel || ''} onChange={(v) => setNested('aboutSection', 'ctaLabel', v)} />
          <CmsTextInput label="CTA URL" value={home.aboutSection?.ctaHref || ''} onChange={(v) => setNested('aboutSection', 'ctaHref', v)} />
        </div>
        <CmsListEditor
          title="Company Timeline"
          items={home.timeline || []}
          onChange={(v) => setHomeField('timeline', v)}
          createNew={() => ({ year: '2026', title: 'Milestone', body: '' })}
          renderItem={(item: { year: string; title: string; body: string }, _, update) => (
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 2fr', gap: 8 }}>
              <CmsTextInput label="Year" value={item.year} onChange={(v) => update({ year: v })} />
              <CmsTextInput label="Title" value={item.title} onChange={(v) => update({ title: v })} />
              <CmsTextInput label="Detail" value={item.body} onChange={(v) => update({ body: v })} />
            </div>
          )}
        />
        <CmsListEditor
          title="Four Commitments / Values"
          items={home.values || []}
          onChange={(v) => setHomeField('values', v)}
          createNew={() => ({ title: 'Value', body: '' })}
          renderItem={(item: { title: string; body: string }, _, update) => (
            <>
              <CmsTextInput label="Title" value={item.title} onChange={(v) => update({ title: v })} />
              <CmsTextArea label="Body" value={item.body} onChange={(v) => update({ body: v })} rows={2} />
            </>
          )}
        />
        <CmsListEditor
          title="People Hired Cards"
          items={home.hires || []}
          onChange={(v) => setHomeField('hires', v)}
          createNew={() => ({ initials: 'AB', name: 'Alex Brown', role: 'Engineer', company: 'Acme Corp', detail: '' })}
          renderItem={(item: { initials: string; name: string; role: string; company: string; detail: string }, _, update) => (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', gap: 8 }}>
                <CmsTextInput label="Initials" value={item.initials} onChange={(v) => update({ initials: v })} />
                <CmsTextInput label="Name" value={item.name} onChange={(v) => update({ name: v })} />
                <CmsTextInput label="Role" value={item.role} onChange={(v) => update({ role: v })} />
                <CmsTextInput label="Company" value={item.company} onChange={(v) => update({ company: v })} />
              </div>
              <CmsTextArea label="Hire Story" value={item.detail} onChange={(v) => update({ detail: v })} rows={2} />
            </>
          )}
        />
      </CmsAccordion>

      {/* 13. HOMEPAGE FAQS */}
      <CmsAccordion title="13. Homepage FAQs" badge={`${(home.faqs || []).length} questions`}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
          <CmsTextInput label="Eyebrow" value={home.faqSection?.eyebrow || ''} onChange={(v) => setNested('faqSection', 'eyebrow', v)} />
          <CmsTextInput label="Title" value={home.faqSection?.title || ''} onChange={(v) => setNested('faqSection', 'title', v)} />
        </div>
        <CmsTextArea label="Intro Text" value={home.faqSection?.body || ''} onChange={(v) => setNested('faqSection', 'body', v)} rows={2} />
        <CmsListEditor
          title="FAQ Items"
          items={home.faqs || []}
          onChange={(v) => setHomeField('faqs', v)}
          createNew={() => ({ question: 'New question?', answer: '' })}
          renderItem={(item: { question: string; answer: string }, _, update) => (
            <>
              <CmsTextInput label="Question" value={item.question} onChange={(v) => update({ question: v })} />
              <CmsTextArea label="Answer" value={item.answer} onChange={(v) => update({ answer: v })} rows={2} />
            </>
          )}
        />
      </CmsAccordion>

      {/* 14. BOTTOM CTA BAND */}
      <CmsAccordion title="14. Dark Bottom CTA Band">
        <CmsTextInput label="Title" value={home.ctaBand?.title || ''} onChange={(v) => setNested('ctaBand', 'title', v)} />
        <CmsTextArea label="Body" value={home.ctaBand?.body || ''} onChange={(v) => setNested('ctaBand', 'body', v)} rows={2} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <CmsTextInput label="Primary CTA Text" value={home.ctaBand?.primaryLabel || ''} onChange={(v) => setNested('ctaBand', 'primaryLabel', v)} />
          <CmsTextInput label="Primary CTA URL" value={home.ctaBand?.primaryHref || ''} onChange={(v) => setNested('ctaBand', 'primaryHref', v)} />
          <CmsTextInput label="Secondary CTA Text" value={home.ctaBand?.secondaryLabel || ''} onChange={(v) => setNested('ctaBand', 'secondaryLabel', v)} />
          <CmsTextInput label="Secondary CTA URL" value={home.ctaBand?.secondaryHref || ''} onChange={(v) => setNested('ctaBand', 'secondaryHref', v)} />
        </div>
      </CmsAccordion>

      {/* 15. CONTACT SECTION */}
      <CmsAccordion title="15. Contact Form Section">
        <CmsTextInput label="Title" value={home.contactSection?.title || ''} onChange={(v) => setNested('contactSection', 'title', v)} />
        <CmsTextArea label="Description" value={home.contactSection?.body || ''} onChange={(v) => setNested('contactSection', 'body', v)} rows={2} />
        <CmsStringListEditor label="Highlights Checklist" items={home.contactSection?.points || []} onChange={(v) => setNested('contactSection', 'points', v)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <CmsTextInput label="Email Label" value={home.contactSection?.emailPrompt || ''} onChange={(v) => setNested('contactSection', 'emailPrompt', v)} />
          <CmsTextInput label="Contact Email" value={home.contactSection?.email || ''} onChange={(v) => setNested('contactSection', 'email', v)} />
          <CmsTextInput label="Submit Button Label" value={home.contactSection?.submitLabel || ''} onChange={(v) => setNested('contactSection', 'submitLabel', v)} />
        </div>
      </CmsAccordion>

      {/* 16. GLOBAL SHARED BANNERS */}
      <CmsAccordion title="16. Shared Inner-Page CTA Banner & Logo Strip" badge="Global">
        <CmsTextInput
          label="Inner Page Logo Marquee Label"
          value={banners.marqueeLabel}
          onChange={(v) => updateSiteSection('globalBanners', { ...banners, marqueeLabel: v })}
        />
        <CmsStringListEditor
          label="Inner Page Marquee Company Names"
          items={banners.marqueeLogos}
          onChange={(v) => updateSiteSection('globalBanners', { ...banners, marqueeLogos: v })}
        />
        <CmsTextInput
          label="Shared CTA Banner Title"
          value={banners.ctaTitle}
          onChange={(v) => updateSiteSection('globalBanners', { ...banners, ctaTitle: v })}
        />
        <CmsTextArea
          label="Shared CTA Banner Subtitle"
          value={banners.ctaSubtitle}
          onChange={(v) => updateSiteSection('globalBanners', { ...banners, ctaSubtitle: v })}
          rows={2}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <CmsTextInput
            label="Primary Button Text"
            value={banners.ctaPrimaryLabel}
            onChange={(v) => updateSiteSection('globalBanners', { ...banners, ctaPrimaryLabel: v })}
          />
          <CmsTextInput
            label="Primary Button URL"
            value={banners.ctaPrimaryHref}
            onChange={(v) => updateSiteSection('globalBanners', { ...banners, ctaPrimaryHref: v })}
          />
          <CmsTextInput
            label="Secondary Button Text"
            value={banners.ctaSecondaryLabel}
            onChange={(v) => updateSiteSection('globalBanners', { ...banners, ctaSecondaryLabel: v })}
          />
          <CmsTextInput
            label="Secondary Button URL"
            value={banners.ctaSecondaryHref}
            onChange={(v) => updateSiteSection('globalBanners', { ...banners, ctaSecondaryHref: v })}
          />
        </div>
      </CmsAccordion>
    </div>
  );
}
