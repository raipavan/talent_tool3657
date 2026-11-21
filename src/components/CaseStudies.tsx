import { caseStudies as staticCaseStudies, type CaseStudy } from '../data/content';
import { useHomeContent } from '../cms/CmsProvider';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

export function CaseStudies() {
  const home = useHomeContent();
  const caseStudies = (home?.caseStudies?.length ? home.caseStudies : staticCaseStudies) as CaseStudy[];
  const copy = home?.caseStudiesSection || {};

  return (
    <section className="section section--light" id="case-studies">
      <div className="container">
        <SectionHead
          center
          eyebrow={copy.eyebrow || 'Case studies'}
          title={copy.title || 'Teams that *stopped chasing* candidates'}
          body={copy.body || 'Three hiring teams, the problem each one started with, and what changed.'}
        />

        <div className="grid case-grid">
          {caseStudies.map((study, index) => (
            <Reveal as="article" key={`${study.company}-${index}`} className="case-card" delay={index}>
              <header className="case-head">
                <h3>{study.company}</h3>
                <span className="case-tag">{study.industry}</span>
              </header>
              <p className="case-stat">
                <strong>{study.stat}</strong>
                {study.statLabel}
              </p>
              <dl className="case-body">
                <div>
                  <dt>Challenge</dt>
                  <dd>{study.challenge}</dd>
                </div>
                <div>
                  <dt>What changed</dt>
                  <dd>{study.approach}</dd>
                </div>
              </dl>
              <ul className="ticks case-results">
                {(study.results || []).map((result, i) => (
                  <li key={`${result}-${i}`}>{result}</li>
                ))}
              </ul>
              <a className="case-link" href={copy.linkHref || '/company/contact#contact'}>
                {copy.linkLabel || 'Request the full case study'} <span aria-hidden="true">&rarr;</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
