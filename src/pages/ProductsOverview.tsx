import { CinematicCard } from '../components/CinematicMotion';
import { Icon } from '../components/Icon';
import { ProductMock } from '../components/ProductMock';
import { SkCtaBanner, SkHero, SkLogoMarquee } from '../components/SeekOutUI';
import { productPath } from '../data/products';
import { usePageOverride, useProductsContent, useProductsOverviewContent } from '../cms/CmsProvider';

export function ProductsOverview() {
  const productPages = useProductsContent();
  const overview = useProductsOverviewContent();
  const stages = productPages.filter((product) => product.kind === 'stage');
  const layers = productPages.filter((product) => product.kind === 'layer');
  const override = usePageOverride('/products');
  const title = (override?.headline || override?.title || 'One platform, from requisition to signed offer').replace(/\*/g, '');
  const subtitle = override?.lede || 'Most teams stitch together five disconnected tools to move a candidate from applied to hired. TalentPool365 runs the whole hiring line so the evidence behind every decision travels with the candidate.';
  const eyebrow = override?.eyebrow || 'TALENTPOOL365 PLATFORM';
  const primaryCta = override?.primaryCtaText
    ? { label: override.primaryCtaText, href: override.primaryCtaHref || '/get-started#book-meeting' }
    : { label: 'Book a demo →', href: '/get-started#book-meeting' };
  const secondaryCta = override?.secondaryCtaText
    ? { label: override.secondaryCtaText, href: override.secondaryCtaHref || '/pricing' }
    : { label: 'See pricing', href: '/pricing' };

  return (
    <main className="sk-page">
      <SkHero
        eyebrow={eyebrow}
        eyebrowIcon="layers"
        title={title}
        subtitle={subtitle}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        stats={overview.stats}
        image="/assets/pages/hero-platform.jpg"
        imageAlt="TalentPool365 Agentic AI recruitment platform overview illustration"
      />

      <SkLogoMarquee />

      {/* 7 Cinematic Split Stage Showcase Cards */}
      <section className="sk-band sk-band--cream" id="stages">
        <div className="container">
          <div className="sk-section-head">
            <span className="sk-pill-tag">{overview.stagesTag}</span>
            <h2 className="sk-serif-h2">{overview.stagesTitle}</h2>
            <p className="sk-section-sub">{overview.stagesSubtitle}</p>
          </div>

          {/* Interactive Stage Jump Bar */}
          <nav className="po-stage-nav" aria-label="Jump to hiring stage">
            {stages.map((product, index) => (
              <a key={product.slug} className="po-stage-pill" href={`#stage-${product.slug}`}>
                <b>0{index + 1}</b>
                <span>{product.title}</span>
              </a>
            ))}
          </nav>

          <div className="po-stage-list">
            {stages.map((product, index) => (
              <CinematicCard
                key={product.slug}
                id={`stage-${product.slug}`}
                variant={index % 2 === 0 ? 'left' : 'right'}
                delay={index % 2}
                tilt={0.45}
                className={`po-stage-bento${index % 2 === 1 ? ' po-stage-bento--reverse' : ''}`}
              >
                <div className="po-bento-copy">
                  <div className="po-stage-meta">
                    <span className="po-stage-num">STAGE 0{index + 1}</span>
                    <span className="sk-icon-box" style={{ width: 34, height: 34 }}>
                      <Icon name={product.icon} />
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#146E63', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {product.title}
                    </strong>
                  </div>

                  <h3 className="po-bento-title">{product.headline.replace(/\*/g, '')}</h3>
                  <p className="po-bento-sub">{product.lede}</p>

                  <div className="po-outcomes-strip">
                    {product.outcomes.slice(0, 3).map((outcome) => (
                      <div key={outcome.label} className="po-outcome-box">
                        <strong>{outcome.value}</strong>
                        <span>{outcome.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="po-cap-chips" aria-label={`${product.title} capabilities`}>
                    {product.capabilities.map((cap) => (
                      <a key={cap.id} className="po-cap-chip" href={`${productPath(product)}#${cap.id}`}>
                        {cap.title}
                      </a>
                    ))}
                  </div>

                  <div className="po-bento-actions">
                    <a className="sk-btn-green" href={productPath(product)}>
                      Explore {product.title} <Icon name="arrow-right" />
                    </a>
                    <a className="sk-btn-outline-dark" href="/get-started#book-meeting">
                      See it live
                    </a>
                  </div>
                </div>

                <div className="po-bento-stage">
                  <ProductMock index={product.mock} title={product.title} />
                </div>
              </CinematicCard>
            ))}
          </div>
        </div>
      </section>

      {/* 2 Dark Obsidian-Emerald Command Layer Cards */}
      <section className="sk-band sk-band--white" id="layers">
        <div className="container">
          <div className="sk-section-head">
            <span className="sk-pill-tag">{overview.layersTag}</span>
            <h2 className="sk-serif-h2">{overview.layersTitle}</h2>
            <p className="sk-section-sub">{overview.layersSubtitle}</p>
          </div>

          <div className="sk-grid-2">
            {layers.map((product, idx) => (
              <CinematicCard key={product.slug} variant="zoom" delay={idx} className="po-layer-command">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="sk-pill-tag" style={{ marginBottom: 0 }}>
                    FOUNDATION LAYER
                  </span>
                  <span className="sk-icon-box" style={{ background: 'rgba(190,232,213,0.16)', color: '#6EE7B7' }}>
                    <Icon name={product.icon} />
                  </span>
                </div>

                <h3>{product.title}</h3>
                <p>{product.lede}</p>

                <div className="po-layer-mock-wrap">
                  <ProductMock index={product.mock} title={product.title} />
                </div>

                <ul className="sk-checklist">
                  {product.capabilities.map((cap) => (
                    <li key={cap.id}>{cap.title}</li>
                  ))}
                </ul>

                <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                  <a className="sk-btn-orange" href={productPath(product)}>
                    Explore {product.title} →
                  </a>
                </div>
              </CinematicCard>
            ))}
          </div>
        </div>
      </section>

      <SkCtaBanner />
    </main>
  );
}
