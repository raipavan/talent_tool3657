import { accent } from '../lib/accent';
import { useHomeContent } from '../cms/CmsProvider';
import { BotBuddy } from './BotBuddy';
import { Reveal } from './Reveal';

export function CtaBand() {
  const home = useHomeContent();
  const copy = home?.ctaBand || {};

  return (
    <section className="cta-band on-dark">
      <span className="cta-bg" aria-hidden="true" />
      <span className="grain" aria-hidden="true" />
      <div className="container cta-inner">
        <Reveal>
          <h2>{accent(copy.title || 'See it on *your own requisitions*')}</h2>
          <p>
            {copy.body ||
              "Bring one live role to the demo. We'll run it through sourcing, screening and interview scoring — live, in 30 minutes."}
          </p>
        </Reveal>
        <BotBuddy />
        <Reveal className="cta-actions" delay={1}>
          <a className="btn btn-primary" href={copy.primaryHref || '/get-started#request-demo'}>
            {copy.primaryLabel || 'Book a live demo'}
          </a>
          <a className="btn btn-outline" href={copy.secondaryHref || '/get-started#start-free-trial'}>
            {copy.secondaryLabel || 'Start free trial'}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
