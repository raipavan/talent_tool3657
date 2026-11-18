import { useEffect, useRef, useState } from 'react';
import { heroRoles } from '../data/content';
import { enterDelay, prefersReducedMotion, useSceneDepth } from '../lib/motion';
import { Icon } from './Icon';

/** Swaps the role in the headline every few seconds. Static under reduced motion. */
function useRotatingRole(count: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [count]);

  return index;
}

export function Hero() {
  const role = useRotatingRole(heroRoles.length);
  const sectionRef = useRef<HTMLElement>(null);
  useSceneDepth(sectionRef);

  return (
    <section className="hero hero--centered on-dark" id="home" ref={sectionRef}>
      <div className="container hero-split">
        <div className="hero-centered-copy">
          <h1 className="enter" style={enterDelay(0)}>
            <span className="sr-only">The intelligent platform for modern recruiting teams.</span>
            <span aria-hidden="true">
              The intelligent platform
              <br />
              for hiring{' '}
              <span className="role-swap">
                <span className="accent role-word" key={role}>
                  {heroRoles[role]}
                </span>
              </span>
            </span>
          </h1>

          <p className="hero-centered-lede enter" style={enterDelay(1)}>
            Source candidates, automate screening, and make smarter hiring decisions — all from one
            connected AI platform.
          </p>

          <div className="hero-centered-ctas enter" style={enterDelay(2)}>
            <a className="btn btn-hero-solid" href="/get-started">
              Get Started For Free
            </a>
            <a className="btn btn-hero-glass" href="#demo">
              <Icon name="play" className="icon" />
              Watch 30-sec tour
            </a>
          </div>
        </div>

        <div className="hero-media-frame enter" style={enterDelay(1, 100)}>
          <img
            className="hero-bg"
            src="/assets/hero-aurevia-bg.jpg"
            alt="TalentPool365 intelligent hiring workspace"
            width={2048}
            height={1142}
            decoding="sync"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}
