import { CinematicCard } from '../components/CinematicMotion';
import { Faq } from '../components/Faq';
import { LeadForm } from '../components/LeadForm';
import { SkCtaBanner, SkHero, SkVectorArt } from '../components/SeekOutUI';
import { SubNav } from '../components/SubNav';
import { usePageOverride, useSupportContent } from '../cms/CmsProvider';

export function SupportPage() {
  const support = useSupportContent();
  const override = usePageOverride('/support');
  const title = (override?.headline || override?.title || 'A person on your side').replace(/\*/g, '');
  const subtitle = override?.lede || 'Find practical workflow guidance, prepare a support request, or plan onboarding training for your recruiting team.';
  const eyebrow = override?.eyebrow || 'HELP & SUPPORT';
  const primaryCta = override?.primaryCtaText
    ? { label: override.primaryCtaText, href: override.primaryCtaHref || '#raise-ticket' }
    : { label: 'Prepare a support request →', href: '#raise-ticket' };
  const secondaryCta = override?.secondaryCtaText
    ? { label: override.secondaryCtaText, href: override.secondaryCtaHref || '/how-it-works' }
    : { label: 'Read workflow guide', href: '/how-it-works' };

  return (
    <main className="sk-page">
      <SkHero
        eyebrow={eyebrow}
        eyebrowIcon="headset"
        title={title}
        subtitle={subtitle}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        aside={<SkVectorArt kind="support" />}
      />

      <SubNav
        label="Support sections"
        links={[
          { label: 'Help center', href: '#help-center' },
          { label: 'Documentation', href: '#documentation' },
          { label: 'Training academy', href: '#training-academy' },
          { label: 'Raise a ticket', href: '#raise-ticket' },
          { label: 'SLA & plans', href: '#support-plans' },
          { label: 'System status', href: '#system-status' },
        ]}
      />

      <section className="sk-band sk-band--cream" id="help-center">
        <div className="container">
          <div className="sk-section-head">
            <span className="sk-pill-tag">{support.helpCenterTag}</span>
            <h2 className="sk-serif-h2">{support.helpCenterTitle}</h2>
          </div>

          <div className="sk-grid-3">
            {support.deskCards.map((card, idx) => (
              <CinematicCard className="sup-desk-card" variant="up" delay={idx} id={card.id} key={card.id || idx}>
                <div className="sup-desk-top">
                  <span className="sk-pill-tag" style={{ marginBottom: 0 }}>{card.tag}</span>
                  <span className="sup-desk-num">{card.num}</span>
                </div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                {card.links.map((l, i) => (
                  <a className="sk-card-link" href={l.href} key={`${l.label}-${i}`}>{l.label}</a>
                ))}
              </CinematicCard>
            ))}
          </div>
        </div>
      </section>

      <Faq items={support.faqs} title="Common questions. *Clear next steps.*" body="A few checks before you contact support." contactHref="#raise-ticket" />

      <section className="sk-band sk-band--cream" id="raise-ticket">
        <div className="container split">
          <div className="split-copy">
            <span className="sk-pill-tag">{support.ticketTag}</span>
            <h2 className="sk-serif-h2">{support.ticketTitle}</h2>
            <p className="sk-section-sub">{support.ticketBody}</p>
            <a className="sk-card-link" style={{ marginTop: 14 }} href={`mailto:${support.supportEmail}`}>
              {support.supportEmail} →
            </a>
          </div>
          <LeadForm
            recipient={support.supportEmail}
            subject="Support request"
            fields={[
              { name: 'name', label: 'Full name', required: true, autoComplete: 'name' },
              { name: 'email', label: 'Work email', type: 'email', required: true, autoComplete: 'email' },
              { name: 'company', label: 'Organization', required: true, autoComplete: 'organization' },
              { name: 'topic', label: 'Topic', type: 'select', options: ['Workspace access', 'Candidate interview', 'Integration', 'Data or permissions', 'Billing', 'Other'] },
              { name: 'details', label: 'What happened and what did you expect?', type: 'textarea', required: true, wide: true },
            ]}
            submitLabel="Prepare support email"
            hint="Nothing is sent until you send the email from your mail app."
          />
        </div>
      </section>

      <section className="sk-band sk-band--white" id="system-status">
        <div className="container status-panel">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <span className="sk-pill-tag">{support.statusTag}</span>
            <h2 className="small-heading">{support.statusTitle}</h2>
            <p>{support.statusBody}</p>
            <a className="sk-card-link" href={`mailto:${support.supportEmail}?subject=Service%20status%20request`}>
              Request a service update →
            </a>
          </div>
        </div>
      </section>

      <SkCtaBanner />
    </main>
  );
}
