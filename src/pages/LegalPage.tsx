import { useState } from 'react';
import { Icon } from '../components/Icon';
import { SkCtaBanner, SkHero } from '../components/SeekOutUI';
import { useLegalContent, usePageOverride } from '../cms/CmsProvider';

export function LegalPage() {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'gdpr'>('privacy');
  const legal = useLegalContent();
  const override = usePageOverride('/legal');
  const title = (override?.headline || override?.title || 'Security and Trust at TalentPool365').replace(/\*/g, '');
  const subtitle = override?.lede || "Explore TalentPool365's complete Privacy Policy, Terms of Service, and GDPR compliance framework. We protect candidate and corporate data with enterprise rigor.";
  const eyebrow = override?.eyebrow || 'SECURITY & COMPLIANCE';
  const primaryCta = override?.primaryCtaText
    ? { label: override.primaryCtaText, href: override.primaryCtaHref || '/company/contact' }
    : { label: 'Contact Trust Team →', href: '/company/contact' };
  const secondaryCta = override?.secondaryCtaText
    ? { label: override.secondaryCtaText, href: override.secondaryCtaHref || '#legal-docs' }
    : { label: 'Read Privacy Policy', href: '#legal-docs' };

  return (
    <main className="sk-page">
      <SkHero
        eyebrow={eyebrow}
        eyebrowIcon="shield"
        title={title}
        subtitle={subtitle}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        image="/assets/pages/hero-security.jpg"
        imageAlt="TalentPool365 security and compliance illustration"
      />

      <section className="sk-band sk-band--cream" id="legal-docs">
        <div className="container legal-layout-new">
          <aside className="legal-sidebar-menu">
            <div className="legal-sidebar-box">
              <h3>Legal Navigation</h3>
              <ul className="legal-nav-pills">
                <li>
                  <button
                    type="button"
                    className={activeTab === 'privacy' ? 'is-active' : ''}
                    onClick={() => setActiveTab('privacy')}
                  >
                    <Icon name="shield" /> Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={activeTab === 'terms' ? 'is-active' : ''}
                    onClick={() => setActiveTab('terms')}
                  >
                    <Icon name="file-check" /> Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={activeTab === 'gdpr' ? 'is-active' : ''}
                    onClick={() => setActiveTab('gdpr')}
                  >
                    <Icon name="clipboard-check" /> GDPR Compliance &amp; DPA
                  </button>
                </li>
              </ul>

              <div className="legal-contact-card">
                <h4>{legal.dpoTitle}</h4>
                <p>{legal.dpoBody}</p>
                <a className="more-link" href={`mailto:${legal.dpoEmail}`}>
                  {legal.dpoEmail}
                </a>
              </div>
            </div>
          </aside>

          <main className="legal-body-container">
            {activeTab === 'privacy' && (
              <div className="legal-document-view">
                <div className="document-intro-banner">
                  <span className="badge-tag">Official Policy</span>
                  <h2>{legal.privacyTitle}</h2>
                  <p className="doc-date">{legal.privacyEffectiveDate}</p>
                </div>

                <div className="legal-sections-flow">
                  {legal.privacySections.map((sec, idx) => (
                    <article key={`${sec.num}-${idx}`} className="legal-policy-clause">
                      <h3>
                        <span className="clause-num">{sec.num}.</span> {sec.title}
                      </h3>
                      <div className="clause-text">
                        {sec.content.split('\n\n').map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="legal-document-view">
                <div className="document-intro-banner">
                  <span className="badge-tag">Subscription Terms</span>
                  <h2>{legal.termsTitle}</h2>
                  <p className="doc-date">{legal.termsEffectiveDate}</p>
                </div>

                <div className="legal-sections-flow">
                  {legal.termsSections.map((sec, idx) => (
                    <article key={`${sec.num}-${idx}`} className="legal-policy-clause">
                      <h3>
                        <span className="clause-num">{sec.num}.</span> {sec.title}
                      </h3>
                      <div className="clause-text">
                        {sec.content.split('\n\n').map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'gdpr' && (
              <div className="legal-document-view">
                <div className="document-intro-banner">
                  <span className="badge-tag">Data Protection Agreement</span>
                  <h2>{legal.gdprTitle}</h2>
                  <p className="doc-date">{legal.gdprSubtitle}</p>
                </div>

                <div className="gdpr-cards-grid">
                  {legal.gdprCards.map((card, idx) => (
                    <div className="card gdpr-box" key={`${card.title}-${idx}`}>
                      <h3>{card.title}</h3>
                      <p>{card.body}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 32 }}>
                  <a className="btn btn-primary" href={legal.dpaCtaHref || '/company/contact'}>
                    {legal.dpaCtaLabel}
                  </a>
                </div>
              </div>
            )}
          </main>
        </div>
      </section>

      <SkCtaBanner
        title="Need a Security Review or executable DPA?"
        subtitle="Our Data Protection Officer and security architects are ready to support your compliance review."
        primary={{ label: 'Contact Trust Team →', href: '/company/contact' }}
      />
    </main>
  );
}
