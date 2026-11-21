import { interviewSplit as staticInterviewSplit } from '../data/content';
import { accent } from '../lib/accent';
import { DemoVideo } from './DemoVideo';
import { Reveal } from './Reveal';
import { useHomeContent } from '../sanity/SanityProvider';

export function InterviewSplit() {
  const home = useHomeContent();
  const split = home?.interviewSplit ?? staticInterviewSplit;

  return (
    <section className="section section--dark section--video on-dark">
      <span className="grain" aria-hidden="true" />
      <div className="container">
        <div className="split split--video">
          <Reveal className="split-media" variant="left">
            <DemoVideo />
          </Reveal>
          <Reveal className="split-copy" variant="right" delay={1}>
            <p className="eyebrow">{split.eyebrow}</p>
            <h2>{accent(split.title)}</h2>
            <p>{split.body}</p>
            <ul className="ticks">
              {split.points?.map((point: string) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <a className="btn btn-accent" href="#contact">
              {split.cta}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
