import {
  hires as staticHires,
  timeline as staticTimeline,
  values as staticValues,
  type Hire,
  type TimelineEntry,
  type Value,
} from '../data/content';
import { accent } from '../lib/accent';
import { useHomeContent } from '../cms/CmsProvider';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

export function About() {
  const home = useHomeContent();
  const timeline = (home?.timeline?.length ? home.timeline : staticTimeline) as TimelineEntry[];
  const values = (home?.values?.length ? home.values : staticValues) as Value[];
  const hires = (home?.hires?.length ? home.hires : staticHires) as Hire[];
  const copy = home?.aboutSection || {};

  return (
    <section className="section section--light" id="about">
      <div className="container">
        <div className="split" style={{ marginBottom: 88 }}>
          <Reveal className="split-copy" variant="left">
            <p className="eyebrow">{copy.eyebrow || 'About TalentPool365'}</p>
            <h2>
              {accent(copy.title || 'Built by recruiters who were *tired of recruiting software*')}
            </h2>
            <p>
              {copy.paragraph1 ||
                'TalentPool365 started in 2019 inside a 40-person agency that was drowning in resumes. The first version was an internal matching tool; it cut their screening workload by half in a month. It became a company when their clients refused to give it back.'}
            </p>
            <p>
              {copy.paragraph2 ||
                'Today the platform processes over two million interviews a year across 40 countries. The rule from day one still stands: Agentic AI does the busywork, recruiters make the decisions, and every score can be explained to a candidate, a client or a regulator.'}
            </p>
            <a className="btn btn-dark" href={copy.ctaHref || '/company/careers'}>
              {copy.ctaLabel || "Work with us — we're hiring"}
            </a>
          </Reveal>

          <Reveal className="split-media" variant="right" delay={1}>
            <ol className="timeline">
              {timeline.map((entry, idx) => (
                <li key={`${entry.year}-${idx}`}>
                  <span className="year">{entry.year}</span>
                  <p>
                    <strong>{entry.title}</strong> {entry.body}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <SectionHead
          eyebrow={copy.valuesEyebrow || 'What we optimize for'}
          title={copy.valuesTitle || 'Four commitments we *hire and ship by*'}
        />

        <div className="grid grid-4 value-grid">
          {values.map((value, index) => (
            <Reveal as="article" key={`${value.title}-${index}`} className="card" delay={index}>
              <h4>{value.title}</h4>
              <p>{value.body}</p>
            </Reveal>
          ))}
        </div>

        <SectionHead
          eyebrow={copy.hiresEyebrow || 'People hired'}
          title={copy.hiresTitle || 'The people *hired* through TalentPool365'}
          style={{ marginTop: 88 }}
        />

        <div className="grid team-grid" id="people-hired">
          {hires.map((hire, index) => (
            <Reveal as="article" key={`${hire.name}-${index}`} className="card team-card" tabIndex={0} delay={index}>
              <span className="team-avatar" aria-hidden="true">
                {hire.initials}
              </span>
              <h4>{hire.name}</h4>
              <span className="team-role">{hire.role}</span>
              <div className="team-details">
                <div>
                  <span className="role">{hire.company}</span>
                  <p>{hire.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
