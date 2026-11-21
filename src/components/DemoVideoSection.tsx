import { accent } from '../lib/accent';
import { Reveal } from './Reveal';

export function DemoVideoSection() {
  return (
    <section className="section section--dark section--video on-dark" id="demo-video">
      <span className="grain" aria-hidden="true" />
      <div className="container">
        <div className="split split--video">
          <Reveal className="split-media" variant="left">
            <div className="demo-video">
              <video
                className="demo-video-only__player"
                src="/assets/demo_video.mp4"
                autoPlay
                muted
                loop
                playsInline
                disablePictureInPicture
                preload="metadata"
              />
            </div>
          </Reveal>
          <Reveal className="split-copy" variant="right" delay={1}>
            <h2>{accent('Experience the Future of *AI Recruitment Tools*')}</h2>
            <p>
              Explore how our AI recruitment software simplifies talent acquisition through automated
              candidate sourcing, intelligent resume screening, AI-powered interviews, and
              data-driven hiring decisions. Find the right talent faster while reducing manual effort
              and improving recruitment efficiency.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
