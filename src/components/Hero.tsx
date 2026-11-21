import { useEffect, useRef, useState } from 'react';
import { heroRoles as staticHeroRoles } from '../data/content';
import { enterDelay, prefersReducedMotion, useSceneDepth } from '../lib/motion';
import { Icon } from './Icon';
import { useHomeContent } from '../cms/CmsProvider';

/** Swaps the role in the headline every few seconds. Static under reduced motion. */
function useRotatingRole(count: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion() || count <= 1) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [count]);

  return count > 0 ? index % count : 0;
}

export function Hero() {
  const homeContent = useHomeContent();
  const heroRoles = (homeContent?.heroRoles?.length ? homeContent.heroRoles : staticHeroRoles) as string[];
  const hero = homeContent?.hero || {};
  const role = useRotatingRole(heroRoles.length);
  const sectionRef = useRef<HTMLElement>(null);
  useSceneDepth(sectionRef);

  const headlinePrefix = hero.headlinePrefix || 'Agentic AI Recruitment Tool';
  const headlineSecondLine = hero.headlineSecondLine || 'The Intelligent Platform for Hiring';
  const subheadline =
    hero.subheadline ||
    'Connect talent, automate workflows, and make informed decisions faster with TalentPool365.';
  const ctaPrimary = hero.ctaPrimary || 'Start Free Trial';
  const ctaPrimaryHref = hero.ctaPrimaryHref || '/get-started';
  const ctaSecondary = hero.ctaSecondary || 'Book a Demo';
  const ctaSecondaryHref = hero.ctaSecondaryHref || '#contact';
  const bgImage = hero.bgImage || '/assets/hero-aurevia-bg.png';

  return (
    <section className="hero hero--centered on-dark" id="home" ref={sectionRef}>
      <img
        className="hero-bg"
        src={bgImage}
        alt=""
        width={2752}
        height={1536}
        decoding="sync"
        fetchPriority="high"
        aria-hidden="true"
      />
      <span className="hero-atmosphere" aria-hidden="true" />

      <div className="container">
        <div className="hero-centered-copy">
          <h1 className="enter" style={enterDelay(0)}>
            <span className="sr-only">{headlinePrefix} {headlineSecondLine} {heroRoles[0]}.</span>
            <span aria-hidden="true">
              {headlinePrefix}
              <br />
              {headlineSecondLine}{' '}
              <span className="role-swap">
                <span className="accent role-word" key={role}>
                  {heroRoles[role]}
                </span>
              </span>
            </span>
          </h1>

          <p className="hero-centered-lede enter" style={enterDelay(1)}>
            {subheadline}
          </p>

          <div className="hero-centered-ctas enter" style={enterDelay(2)}>
            <a className="btn btn-hero-solid" href={ctaPrimaryHref}>
              {ctaPrimary}
              <Icon name="arrow-right" className="icon" />
            </a>
            <a className="btn btn-hero-glass" href={ctaSecondaryHref}>
              {ctaSecondary}
              <Icon name="arrow-right" className="icon" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
