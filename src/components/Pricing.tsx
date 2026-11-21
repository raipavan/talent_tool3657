import { useState } from 'react';
import { compareRows as staticCompareRows, plans as staticPlans, type CompareCell, type Plan } from '../data/content';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { usePricingContent } from '../sanity/SanityProvider';

type BillingMode = 'monthly' | 'annual';

/** A plan without both prices (Enterprise) shows "Custom" and a quote button. */
const hasPrice = (plan: Plan): boolean =>
  typeof plan.price?.monthly === 'number' && typeof plan.price?.annual === 'number';

function CompareValue({ cell, label }: { cell: CompareCell; label: string }) {
  return (
    <td className={cell.included ? 'yes' : 'no'} data-label={label}>
      {cell.text}
    </td>
  );
}

interface PricingProps {
  /** On the pricing page the page hero carries the heading. */
  showHead?: boolean;
  /** Where the trial buttons and the Enterprise quote button lead. */
  trialHref?: string;
  quoteHref?: string;
}

export function Pricing({ showHead = true, trialHref = '#contact', quoteHref = '#contact' }: PricingProps) {
  const [mode, setMode] = useState<BillingMode>('monthly');
  const pricingData = usePricingContent();
  const compareRows = staticCompareRows;

  // If Sanity plans are loaded with custom numbers, adapt them
  const activePlans: Plan[] = pricingData?.plans
    ? pricingData.plans.map((p, idx) => ({
        name: p.name,
        sub: p.target,
        price: p.priceMonthly === 'Custom' ? null : {
          monthly: parseInt(p.priceMonthly.replace(/\D/g, ''), 10) || (staticPlans[idx]?.price?.monthly ?? 99),
          annual: parseInt(p.priceAnnual.replace(/\D/g, ''), 10) || (staticPlans[idx]?.price?.annual ?? 79),
        },
        note: p.trialNote,
        cta: p.ctaText,
        ctaClass: p.isPopular ? 'btn-primary' : p.priceMonthly === 'Custom' ? 'btn-dark' : 'btn-outline',
        featured: Boolean(p.isPopular),
        features: p.features,
      }))
    : staticPlans;

  return (
    <section className="section" id="pricing">
      <div className="container">
        {showHead ? (
          <SectionHead
            center
            eyebrow="Pricing"
            title="Pay *for hires*, not seats of software"
            body="Every plan includes sourcing, screening and the recruiter workspace. Upgrade when you need assessments, interviews and deep integrations."
          />
        ) : null}

        <div style={{ textAlign: 'center' }}>
          <Reveal className="billing-toggle" role="group" aria-label="Billing period">
            <button
              className="opt"
              type="button"
              aria-pressed={mode === 'monthly'}
              onClick={() => setMode('monthly')}
            >
              Monthly
            </button>
            <button
              className="opt"
              type="button"
              aria-pressed={mode === 'annual'}
              onClick={() => setMode('annual')}
            >
              Annual
            </button>
            <span className="save">Save 20%</span>
          </Reveal>
        </div>

        <div className="grid grid-3 price-grid">
          {activePlans.map((plan, index) => (
            <Reveal
              as="article"
              key={plan.name}
              className={`card price-card${plan.featured ? ' price-card--featured' : ''}`}
              delay={index}
            >
              {plan.featured ? <span className="plan-flag">Most popular</span> : null}
              <h3>{plan.name}</h3>
              <p className="plan-sub">{plan.sub}</p>
              {hasPrice(plan) ? (
                <p className="price">
                  $
                  <span className="price-num" key={mode}>
                    {plan.price?.[mode]}
                  </span>
                  <span className="per"> /mo</span>
                </p>
              ) : (
                <p className="price">Custom</p>
              )}
              <p className="caption" style={{ marginTop: 6 }}>
                {hasPrice(plan) ? (mode === 'annual' ? 'billed annually' : 'billed monthly') : plan.note}
              </p>
              <a className={`btn ${plan.ctaClass}`} href={hasPrice(plan) ? trialHref : quoteHref}>
                {plan.cta}
              </a>
              <ul className="ticks">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal style={{ marginTop: 64 }} id="compare-plans">
          <div className="compare-wrap" role="region" aria-label="Plan comparison" tabIndex={0}>
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">Compare plans</th>
                  <th scope="col">Starter</th>
                  <th scope="col">Professional</th>
                  <th scope="col">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.feature}>
                    <td>{row.feature}</td>
                    <CompareValue cell={row.starter} label="Starter" />
                    <CompareValue cell={row.professional} label="Professional" />
                    <CompareValue cell={row.enterprise} label="Enterprise" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
