import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';
import { SkCtaBanner, SkHero, SkVectorArt } from '../components/SeekOutUI';
import { useHowItWorksContent, usePageOverride } from '../cms/CmsProvider';

export function HowItWorksPage() {
  const { workflow } = useHowItWorksContent();
  const override = usePageOverride('/how-it-works');
  const title = (override?.headline || override?.title || 'From an open role to a first day').replace(/\*/g, '');
  const subtitle = override?.lede || 'One connected workflow, nine clear steps. Agentic AI handles the repetitive busywork while your recruiting team and hiring managers own every human decision.';
  const eyebrow = override?.eyebrow || 'NINE-STEP WORKFLOW';
  const primaryCta = override?.primaryCtaText
    ? { label: override.primaryCtaText, href: override.primaryCtaHref || '/get-started' }
    : { label: 'Walk through your process →', href: '/get-started' };
  const secondaryCta = override?.secondaryCtaText
    ? { label: override.secondaryCtaText, href: override.secondaryCtaHref || '/products' }
    : { label: 'Explore products', href: '/products' };

  return (
    <main className="sk-page">
      <SkHero
        eyebrow={eyebrow}
        eyebrowIcon="sliders"
        title={title}
        subtitle={subtitle}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        aside={<SkVectorArt kind="how-it-works" />}
      />

      <section className="sk-band sk-band--cream">
        <div className="container">
          <ol className="workflow-list">
            {workflow.map((step, index) => (
              <Reveal
                as="li"
                className="workflow-step"
                variant={index % 2 ? 'right' : 'left'}
                key={step.title}
              >
                <span className="workflow-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="workflow-copy">
                  <span className="sk-pill-tag" style={{ marginBottom: 8 }}>{step.owner}</span>
                  <h2>{step.title}</h2>
                  <p>{step.body}</p>
                  <div className="workflow-output">
                    <Icon name="file-check" />
                    <span>{step.output}</span>
                  </div>
                  <a className="sk-card-link" href={step.href}>
                    Explore the product <span className="sr-only">for {step.title}</span>
                    <Icon name="arrow-right" />
                  </a>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <SkCtaBanner />
    </main>
  );
}
