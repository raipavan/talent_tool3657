import { useState } from 'react';
import { CinematicCard } from '../components/CinematicMotion';
import { LeadForm, type LeadField } from '../components/LeadForm';
import { SkCtaBanner, SkFaq, SkHero } from '../components/SeekOutUI';
import { usePricingContent } from '../sanity/SanityProvider';

const quoteFields: LeadField[] = [
  { name: 'name', label: 'Full name', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Work email', type: 'email', required: true, autoComplete: 'email' },
  { name: 'company', label: 'Company name', required: true, autoComplete: 'organization' },
  {
    name: 'size',
    label: 'Company size',
    type: 'select',
    options: ['1–50 employees', '51–250 employees', '251–1,000 employees', '1,000+ employees'],
  },
  {
    name: 'volume',
    label: 'Annual hiring volume',
    type: 'select',
    options: ['Under 50 hires/yr', '50–200 hires/yr', '200–1,000 hires/yr', '1,000+ hires/yr'],
  },
  {
    name: 'systems',
    label: 'Systems to integrate (ATS/HRMS)',
    placeholder: 'e.g. Workday, Greenhouse, SAP, Slack...',
    wide: true,
  },
  {
    name: 'compliance',
    label: 'Specific security or compliance needs',
    type: 'textarea',
    placeholder: 'GDPR, SOC2, custom data residency, SSO, custom SLA...',
    wide: true,
  },
];

const comparisonFeatures = [
  { feature: 'Agentic AI Candidate Discovery', starter: '✓', pro: '✓', ent: '✓' },
  { feature: 'Resume Database Search', starter: '✓', pro: '✓', ent: '✓' },
  { feature: 'Resume Parsing & Matching', starter: '✓', pro: '✓', ent: '✓' },
  { feature: 'Candidate Ranking & Shortlisting', starter: 'Basic', pro: 'Advanced', ent: 'Advanced' },
  { feature: 'Agentic AI Assessments (Tech, Aptitude, Cognitive)', starter: 'Basic', pro: 'Full suite', ent: 'Full suite' },
  { feature: 'Agentic AI Interviews (Video, Voice, Coding)', starter: 'Limited', pro: '✓ (Unlimited)', ent: '✓ (Unlimited)' },
  { feature: 'Proctoring & Anti-Cheat Monitoring', starter: '–', pro: '✓', ent: '✓' },
  { feature: 'Recruiter Workspace & Collaboration', starter: 'Basic', pro: '✓', ent: '✓' },
  { feature: 'Approval Workflows & Audit Chains', starter: '–', pro: '✓', ent: 'Custom multi-tier' },
  { feature: 'WhatsApp & Email Automation', starter: 'Email only', pro: '✓ (WhatsApp & Email)', ent: '✓ (WhatsApp & Email)' },
  { feature: 'Analytics & Reporting Dashboards', starter: 'Basic KPIs', pro: '✓ (Full Funnel)', ent: 'Advanced + BI Sync' },
  { feature: 'ATS & HRMS Integrations', starter: '–', pro: '✓ (Certified)', ent: '✓ + Custom Webhooks' },
  { feature: 'Developer REST API Access', starter: '–', pro: '–', ent: '✓ (Full Access)' },
  { feature: 'Audit Trails & Advanced Security', starter: '–', pro: '–', ent: '✓ (Enterprise Vault)' },
  { feature: 'Single Sign-On (SAML / SSO)', starter: '–', pro: '–', ent: '✓' },
  { feature: 'Support & SLAs', starter: 'Email support', pro: 'Priority support', ent: 'Dedicated Account Manager' },
];

const faqs = [
  {
    q: 'Can I change plans later?',
    a: 'Yes. You can upgrade or adjust your plan at any time as your hiring needs expand. Upgrades take effect immediately and are prorated.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! You can explore TalentPool365 on a 14-day free trial without a credit card. Test Agentic AI candidate discovery, resume parsing, and automated interviews on your own roles.',
  },
  {
    q: 'Do you offer discounts for annual billing?',
    a: 'Yes. Organizations choosing annual billing receive a 20% discount across Starter and Professional plans, as well as included onboarding assistance.',
  },
  {
    q: 'Is my candidate data secure and GDPR compliant?',
    a: 'Absolutely. All candidate resumes, test scores, and interview recordings are protected with AES-256 encryption at rest and TLS in transit. We support full GDPR data erasure and right-to-access requests.',
  },
];

export function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const pricingData = usePricingContent();

  const plans = pricingData?.plans || [];
  const comparisonRows = pricingData?.comparisonFeatures || comparisonFeatures;
  const faqItems = pricingData?.faqs || faqs;

  return (
    <main className="sk-page">
      <SkHero
        eyebrow="TRANSPARENT PRICING"
        eyebrowIcon="chart"
        title="Plans that scale with your hiring ambitions"
        subtitle="Whether you are making your first hire or running recruitment across multiple countries, start small, upgrade when you are ready, and only pay for the hiring power you need."
        primaryCta={{ label: 'Start 14-day free trial →', href: '/get-started#start-free-trial' }}
        secondaryCta={{ label: 'Compare plans', href: '#compare-plans' }}
        image="/assets/pages/hero-pricing.jpg"
        imageAlt="Scalable pricing plans illustration"
      />

      {/* SeekOut Soft Mint Trial Banner + Pricing Cards */}
      <section className="sk-band sk-band--white" id="plans">
        <div className="container">
          <div className="sk-promo-banner" style={{ marginBottom: 44 }}>
            <div>
              <h2>{pricingData?.heroTitle || 'Try TalentPool365 free for 14 days'}</h2>
              <p>{pricingData?.heroSubtitle || 'Run Agentic AI sourcing, semantic resume screening, and automated interviews on a live role. No credit card required.'}</p>
            </div>
            <a className="sk-btn-orange" href="/get-started#start-free-trial">
              Get free trial →
            </a>
          </div>

          <div className="pricing-toggle-wrap">
            <span className={!annual ? 'is-selected' : ''}>Monthly Billing</span>
            <button
              type="button"
              className={`pricing-toggle-switch${annual ? ' is-annual' : ''}`}
              onClick={() => setAnnual(!annual)}
              aria-label="Toggle annual or monthly billing"
            >
              <span className="toggle-dot" />
            </button>
            <span className={annual ? 'is-selected' : ''}>
              Annual Billing <em>Save 20%</em>
            </span>
          </div>

          <div className="pricing-plans-grid">
            {plans.map((plan, idx) => (
              <CinematicCard
                key={plan.name}
                className={`pricing-plan-card${plan.isPopular ? ' is-popular' : ''}`}
                variant={plan.isPopular ? 'zoom' : 'up'}
                delay={idx}
              >
                {plan.isPopular && <div className="popular-ribbon">Most Popular</div>}
                <div className="plan-card-header">
                  <span className={`plan-badge${plan.isPopular ? ' plan-badge--popular' : ''}`}>{plan.badge}</span>
                  <h3>{plan.name}</h3>
                  <p className="plan-target">{plan.target}</p>
                  <div className="plan-price">
                    <strong style={plan.priceMonthly === 'Custom' ? { fontSize: '2rem' } : undefined}>
                      {annual ? plan.priceAnnual : plan.priceMonthly}
                    </strong>
                    <span>{plan.priceMonthly === 'Custom' ? 'tailored to volume' : '/ user / month'}</span>
                  </div>
                  <p className="plan-trial-note">{plan.trialNote}</p>
                </div>
                <div className="plan-body">
                  <h4>{plan.featureTitle}</h4>
                  <ul className="ticks">
                    {plan.features.map((feat) => (
                      <li key={feat}>{feat}</li>
                    ))}
                  </ul>
                </div>
                <div className="plan-card-footer">
                  <a
                    className={plan.isPopular ? 'sk-btn-orange' : plan.priceMonthly === 'Custom' ? 'sk-btn-green' : 'sk-btn-outline-dark'}
                    style={{ width: '100%' }}
                    href={plan.ctaHref}
                  >
                    {plan.ctaText}
                  </a>
                </div>
              </CinematicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table in Warm Cream Band */}
      <section className="sk-band sk-band--cream" id="compare-plans">
        <div className="container">
          <div className="sk-section-head">
            <span className="sk-pill-tag">DETAILED BREAKDOWN</span>
            <h2 className="sk-serif-h2">TalentPool365 plans &amp; features</h2>
            <p className="sk-section-sub">
              Review side-by-side capabilities so you select the exact hiring power your team requires.
            </p>
          </div>

          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '40%' }}>Platform Capability</th>
                  <th scope="col" style={{ width: '20%' }}>Starter</th>
                  <th scope="col" style={{ width: '20%' }} className="is-popular-col">Professional</th>
                  <th scope="col" style={{ width: '20%' }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">{row.feature}</th>
                    <td>{row.starter}</td>
                    <td className="is-popular-col"><strong>{row.pro}</strong></td>
                    <td>{row.ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Request Custom Quote Form */}
      <section className="sk-band sk-band--white" id="custom-quote">
        <div className="container">
          <div className="sk-split" style={{ alignItems: 'start' }}>
            <div className="sk-split-copy">
              <span className="sk-pill-tag">ENTERPRISE &amp; HIGH VOLUME</span>
              <h2 className="sk-serif-h2">Need something different? Let’s build a plan around you.</h2>
              <p className="sk-section-sub">
                If you hire at high volumes, need specialized ATS/HRMS integrations, or have strict compliance
                and data residency requirements, our enterprise solutions architects will configure a custom plan.
              </p>
              <ul className="sk-checklist" style={{ marginTop: 20 }}>
                <li>Custom requisition &amp; candidate allowances</li>
                <li>Tailored enterprise onboarding &amp; recruiter training</li>
                <li>Security review &amp; Data Protection Impact Assessment (DPIA) assistance</li>
                <li>Dedicated Customer Success Manager and bespoke SLAs</li>
              </ul>
            </div>

            <div className="sk-card" style={{ padding: 32 }}>
              <h3 style={{ marginBottom: 16 }}>Request a Custom Quote</h3>
              <LeadForm
                fields={quoteFields}
                submitLabel="Request Custom Quote"
                hint="We respond with a structured proposal within one business day."
                subject="Custom Enterprise Quote Request"
              />
            </div>
          </div>
        </div>
      </section>

      <SkFaq
        title="Frequently asked billing questions"
        items={faqItems.map((f) => ({
          q: f.q,
          a: f.a,
        }))}
      />
      <SkCtaBanner />
    </main>
  );
}
