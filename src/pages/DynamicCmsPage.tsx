import type { CustomPageModel, PageBlock } from '../cms/siteDefaults';
import { SkHero, SkCtaBanner } from '../components/SeekOutUI';
import { Faq } from '../components/Faq';
import { LeadForm } from '../components/LeadForm';
import { RichTextRenderer } from '../components/RichTextRenderer';
import { CinematicCard } from '../components/CinematicMotion';

export function DynamicCmsPage({ page }: { page: CustomPageModel }) {
  const blocks = Array.isArray(page.blocks) ? page.blocks : [];

  return (
    <div className="dynamic-cms-page">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} pageTitle={page.title} />
      ))}
    </div>
  );
}

function BlockRenderer({ block, pageTitle }: { block: PageBlock; pageTitle: string }) {
  switch (block.type) {
    case 'hero':
      return (
        <SkHero
          centered={block.centered}
          eyebrow={block.eyebrow}
          title={block.title || pageTitle}
          subtitle={block.subtitle || ''}
          primaryCta={
            block.primaryCtaText
              ? { label: block.primaryCtaText, href: block.primaryCtaHref || '/get-started' }
              : undefined
          }
          secondaryCta={
            block.secondaryCtaText
              ? { label: block.secondaryCtaText, href: block.secondaryCtaHref || '/pricing' }
              : undefined
          }
          image={block.image}
        />
      );

    case 'rich_text':
      return (
        <section className="sk-band sk-band--white">
          <div className="container" style={{ maxWidth: 860 }}>
            {block.title && (
              <h2 className="sk-serif-h2" style={{ marginBottom: 12 }}>
                {block.title}
              </h2>
            )}
            {block.subtitle && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginBottom: 28 }}>
                {block.subtitle}
              </p>
            )}
            <RichTextRenderer content={block.contentMarkdown} />
          </div>
        </section>
      );

    case 'feature_grid': {
      const cols = block.columns || 3;
      const gridClass = cols === 2 ? 'sk-grid-2' : cols === 4 ? 'sk-grid-4' : 'sk-grid-3';
      return (
        <section className="sk-band sk-band--cream">
          <div className="container">
            {(block.title || block.subtitle) && (
              <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 40px' }}>
                {block.title && <h2 className="sk-serif-h2">{block.title}</h2>}
                {block.subtitle && <p style={{ color: 'var(--color-text-muted)' }}>{block.subtitle}</p>}
              </div>
            )}
            <div className={gridClass}>
              {(block.items || []).map((item, idx) => (
                <CinematicCard key={idx} variant="up" delay={idx % 3} className="sk-card">
                  {item.icon && <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: 12 }}>{item.icon}</span>}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--color-primary)' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                  {item.linkHref && (
                    <a
                      href={item.linkHref}
                      style={{
                        display: 'inline-block',
                        marginTop: 12,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--color-secondary)',
                      }}
                    >
                      Learn more →
                    </a>
                  )}
                </CinematicCard>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'media_split': {
      const isRight = block.imagePosition === 'right';
      return (
        <section className="sk-band sk-band--white">
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 40,
                alignItems: 'center',
              }}
            >
              <div style={{ order: isRight ? 1 : 2 }}>
                {block.badge && (
                  <span className="sk-pill-tag" style={{ width: 'fit-content', marginBottom: 12 }}>
                    {block.badge}
                  </span>
                )}
                {block.title && <h2 className="sk-serif-h2">{block.title}</h2>}
                {block.subtitle && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginBottom: 20 }}>
                    {block.subtitle}
                  </p>
                )}
                {Array.isArray(block.points) && block.points.length > 0 && (
                  <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {block.points.map((pt, i) => (
                      <li key={i} style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>
                        {pt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div style={{ order: isRight ? 2 : 1 }}>
                {block.image && (
                  <img
                    src={block.image}
                    alt={block.title || 'Section illustration'}
                    style={{
                      width: '100%',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-md)',
                      display: 'block',
                      objectFit: 'cover',
                      maxHeight: 460,
                    }}
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case 'metrics_band':
      return (
        <section className="sk-band sk-band--cream">
          <div className="container">
            {(block.title || block.subtitle) && (
              <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 32px' }}>
                {block.title && <h2 className="sk-serif-h2">{block.title}</h2>}
                {block.subtitle && <p style={{ color: 'var(--color-text-muted)' }}>{block.subtitle}</p>}
              </div>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 20,
              }}
            >
              {(block.metrics || []).map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fff',
                    padding: '24px 20px',
                    borderRadius: 12,
                    textAlign: 'center',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>{m.value}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'faq':
      return (
        <Faq
          eyebrow="FREQUENTLY ASKED QUESTIONS"
          title={block.title || 'Frequently Asked Questions'}
          body={block.subtitle || ''}
          items={block.items || []}
        />
      );

    case 'testimonials':
      return (
        <section className="sk-band sk-band--white">
          <div className="container">
            {(block.title || block.subtitle) && (
              <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 36px' }}>
                {block.title && <h2 className="sk-serif-h2">{block.title}</h2>}
                {block.subtitle && <p style={{ color: 'var(--color-text-muted)' }}>{block.subtitle}</p>}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {(block.items || []).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-bg-light)',
                    borderRadius: 12,
                    padding: 28,
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <p style={{ fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.6, color: 'var(--color-text)', margin: '0 0 18px' }}>
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {item.avatar && (
                      <img
                        src={item.avatar}
                        alt={item.author}
                        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--color-primary)' }}>
                        {item.author}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {item.role} {item.company ? `· ${item.company}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'cta_banner':
      return (
        <SkCtaBanner
          title={block.title || 'Ready to accelerate your hiring?'}
          subtitle={block.subtitle || 'See TalentPool365 source, screen, and interview candidates automatically.'}
          primary={{
            label: block.primaryCtaText || 'Book a demo →',
            href: block.primaryCtaHref || '/get-started#book-meeting',
          }}
          secondary={
            block.secondaryCtaText
              ? { label: block.secondaryCtaText, href: block.secondaryCtaHref || '/pricing' }
              : undefined
          }
        />
      );

    case 'lead_form':
      return (
        <section className="sk-band sk-band--cream">
          <div className="container" style={{ maxWidth: 640 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              {block.title && <h2 className="sk-serif-h2">{block.title}</h2>}
              {block.subtitle && <p style={{ color: 'var(--color-text-muted)' }}>{block.subtitle}</p>}
            </div>
            <div
              style={{
                background: '#fff',
                padding: 32,
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <LeadForm
                subject={block.formSubject || block.title || 'Landing Page Enquiry'}
                submitLabel={block.submitButtonText || 'Submit Enquiry'}
                hint="Your enquiry is securely captured in our CRM. We respond within one business day."
                fields={[
                  { name: 'name', label: 'Full name', required: true, autoComplete: 'name' },
                  { name: 'email', label: 'Work email', type: 'email', required: true, autoComplete: 'email' },
                  ...(block.includeCompany
                    ? [{ name: 'company', label: 'Company name', required: true }]
                    : []),
                  ...(block.includePhone
                    ? [{ name: 'phone', label: 'Phone number (optional)', type: 'tel' as const }]
                    : []),
                  { name: 'message', label: 'How can we help?', type: 'textarea', wide: true },
                ]}
              />
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
}
