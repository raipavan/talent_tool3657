import type { CSSProperties } from 'react';
import { steps as staticSteps, type Step } from '../data/content';
import { useScrollProgress } from '../lib/useScrollProgress';
import { useHomeContent } from '../cms/CmsProvider';
import { SectionHead } from './SectionHead';

export function HowItWorks() {
  const home = useHomeContent();
  const steps = (home?.steps?.length ? home.steps : staticSteps) as Step[];
  const sectionCopy = home?.howItWorksSection || {};
  const { ref, progress, active } = useScrollProgress<HTMLOListElement>('.step');

  return (
    <section className="section section--light" id="how-it-works">
      <div className="container how-layout">
        <div className="how-intro">
          <SectionHead
            title={sectionCopy.title || 'From requisition to signed offer in *six moves*'}
            body={
              sectionCopy.body ||
              'The same disciplined flow every time — with a human decision at every step that matters.'
            }
          />
          <p className="how-count" aria-hidden="true">
            <b key={active}>{String(Math.min(active + 1, steps.length)).padStart(2, '0')}</b>
            <span>of {String(steps.length).padStart(2, '0')}</span>
          </p>
          <a className="btn btn-outline" href={sectionCopy.ctaHref || '#contact'}>
            {sectionCopy.ctaLabel || 'Walk through it live'}
          </a>
        </div>

        <ol
          className="steps steps--rail"
          ref={ref}
          style={{ '--rail': progress } as CSSProperties}
        >
          {steps.map((step, index) => (
            <li
              key={`${step.title}-${index}`}
              className={`step${index <= active ? ' is-reached' : ''}${index === active ? ' is-current' : ''}`}
            >
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
