import { accent } from '../lib/accent';
import { Reveal } from './Reveal';
import { useHomeContent } from '../cms/CmsProvider';

export function DemoVideoSection() {
  const home = useHomeContent();
  const demoSection = home?.demoVideoSection || {};

  const title = demoSection.title || 'Experience the Future of *AI Recruitment Tools*';
  const body =
    demoSection.body ||
    'Explore how our AI recruitment software simplifies talent acquisition through automated candidate sourcing, intelligent resume screening, AI-powered interviews, and data-driven hiring decisions. Find the right talent faster while reducing manual effort and improving recruitment efficiency.';
  const videoUrl = demoSection.videoUrl || '/assets/demo_video.mp4';

  return (
    <section className="section section--dark section--video on-dark" id="demo-video">
      <span className="grain" aria-hidden="true" />
      <div className="container">
        <div className="split split--video">
          <Reveal className="split-media" variant="left">
            <div className="demo-video">
              <video
                className="demo-video-only__player"
                src={videoUrl}
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
            <h2>{accent(title)}</h2>
            <p>{body}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
