export function DemoVideoSection() {
  return (
    <section className="section demo-video-only" id="demo-video" aria-label="Product demo video">
      <div className="container">
        <div className="demo-video-only__frame">
          <video
            className="demo-video-only__player"
            src="/assets/demo_video.mp4"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
          />
        </div>
      </div>
    </section>
  );
}
