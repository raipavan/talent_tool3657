import { useState } from 'react';
import { AnimatedValue } from '../components/AnimatedValue';
import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';
import { SectionHead } from '../components/SectionHead';
import { SkCtaBanner, SkHero, SkLogoMarquee, SkVectorArt } from '../components/SeekOutUI';
import { useCaseStudiesContent, usePageOverride, type CaseStudyStory } from '../cms/CmsProvider';

const industries = ['All', 'IT & Technology', 'Healthcare', 'BFSI', 'Manufacturing', 'Retail', 'BPO & Contact Centers'];
const useCases = ['All', 'High Volume Hiring', 'Campus Hiring', 'Contract Staffing'];
const companySizes = ['All', 'Mid-Market', 'Large Enterprises', 'Enterprise'];

export function CaseStudiesPage() {
  const { stories: caseStudiesData, heroStats } = useCaseStudiesContent();
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedUseCase, setSelectedUseCase] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [activeStory, setActiveStory] = useState<CaseStudyStory | null>(null);

  const filteredStories = caseStudiesData.filter((story) => {
    const matchInd = selectedIndustry === 'All' || story.industry === selectedIndustry;
    const matchUse = selectedUseCase === 'All' || story.useCase === selectedUseCase;
    const matchSize = selectedSize === 'All' || story.size === selectedSize;
    return matchInd && matchUse && matchSize;
  });

  const override = usePageOverride('/case-studies');
  const title = (override?.headline || override?.title || 'TalentPool365 Customers Delivering Proven Results').replace(/\*/g, '');
  const subtitle = override?.lede || 'Real hiring challenges, real results. Explore how recruiting teams across industries use TalentPool365 to cut time-to-hire, improve candidate quality, and scale without adding headcount.';
  const eyebrow = override?.eyebrow || 'CUSTOMER STORIES';
  const primaryCta = override?.primaryCtaText
    ? { label: override.primaryCtaText, href: override.primaryCtaHref || '/get-started#book-meeting' }
    : { label: 'Book a demo →', href: '/get-started#book-meeting' };
  const secondaryCta = override?.secondaryCtaText
    ? { label: override.secondaryCtaText, href: override.secondaryCtaHref || '#stories-grid' }
    : { label: 'Browse case studies', href: '#stories-grid' };

  return (
    <main className="sk-page">
      <SkHero
        eyebrow={eyebrow}
        eyebrowIcon="trend"
        title={title}
        subtitle={subtitle}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        stats={heroStats}
        aside={<SkVectorArt kind="customers" />}
      />

      <SkLogoMarquee />

      {/* Results at a Glance Section */}
      <section className="section section--light" id="results-at-glance">
        <div className="container">
          <SectionHead
            eyebrow="Results at a glance"
            title="Measurable recruitment impact *backed by customer data*"
            body="Every hire leaves a trail of data. Here is what talent acquisition teams achieve when they automate repetitive manual work."
          />

          <div className="metrics-row-cards">
            <Reveal as="div" className="metric-banner-card" delay={0}>
              <span className="metric-banner-val">
                <AnimatedValue value="68%" />
              </span>
              <strong className="metric-banner-label">Faster time-to-hire</strong>
              <p>Average reduction in days elapsed from requisition opening to signed offer.</p>
            </Reveal>

            <Reveal as="div" className="metric-banner-card" delay={1}>
              <span className="metric-banner-val">
                <AnimatedValue value="14 days" />
              </span>
              <strong className="metric-banner-label">Days saved per hire</strong>
              <p>Recruiter and hiring manager hours returned to high-touch candidate conversations.</p>
            </Reveal>

            <Reveal as="div" className="metric-banner-card" delay={2}>
              <span className="metric-banner-val">
                <AnimatedValue value="250,000+" />
              </span>
              <strong className="metric-banner-label">Candidates screened</strong>
              <p>Applications parsed, semantically matched, and ranked without manual data entry.</p>
            </Reveal>

            <Reveal as="div" className="metric-banner-card" delay={3}>
              <span className="metric-banner-val">
                <AnimatedValue value="75%" />
              </span>
              <strong className="metric-banner-label">Reduction in manual screening effort</strong>
              <p>Eliminating resume sorting, scheduling back-and-forth, and initial phone tag.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured Case Study Section */}
      <section className="section" id="featured-story">
        <div className="container">
          <SectionHead
            eyebrow="Featured customer story"
            title="Spotlight: Scaling high-volume hiring *without scaling headcount*"
          />

          <Reveal as="div" className="featured-case-box">
            <div className="featured-case-head">
              <div>
                <span className="badge-tag">BPO & Contact Centers</span>
                <span className="badge-meta">High Volume Hiring · 1,000+ employees</span>
                <h2 className="featured-case-title">
                  Apex Global BPO: Filling 200 agent roles in 3 weeks with automated voice screening
                </h2>
              </div>
              <div className="featured-case-stat-pill">
                <strong>72%</strong>
                <span>Faster time-to-hire</span>
              </div>
            </div>

            <div className="featured-case-grid">
              <div className="featured-case-col">
                <h3>The Challenge</h3>
                <p>
                  Apex faced 8,500+ applicants for bilingual agent roles across two regional centers.
                  Manual telephone screening created a 38-day backlog and 40% candidate leakage before
                  first interviews could even be scheduled.
                </p>
                <div className="featured-features-used">
                  <strong>Features used:</strong>
                  <div className="tag-chips">
                    <span>Agentic AI Candidate Screening</span>
                    <span>Voice-Based Interviews</span>
                    <span>WhatsApp Integration</span>
                    <span>Smart Shortlisting</span>
                  </div>
                </div>
              </div>

              <div className="featured-case-col">
                <h3>The Solution & Results</h3>
                <ul className="ticks">
                  <li>8,500+ applications parsed and ranked in under 24 hours</li>
                  <li>Asynchronous voice interviews evaluated spoken fluency around the clock</li>
                  <li>Automated WhatsApp nudges kept candidates engaged through offer acceptance</li>
                  <li>Over 600 recruiter hours saved in a single quarter</li>
                </ul>
                <div className="featured-quote">
                  <blockquote>
                    “TalentPool365 turned our highest-stress quarterly hiring drive into a smooth,
                    predictable system. Voice interviews let us evaluate spoken language at scale without
                    our recruiters having to spend all day on repetitive screening calls.”
                  </blockquote>
                  <cite>— Priya Sundaram, Head of Talent Acquisition, Apex Global BPO</cite>
                </div>
              </div>
            </div>

            <div className="featured-case-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveStory(caseStudiesData[0])}
              >
                Read full case study breakdown <Icon name="arrow-right" />
              </button>
              <a className="btn btn-outline" href="/get-started#book-meeting">
                Book a demo for your team
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Case Studies Explorer Section */}
      <section className="section section--light" id="stories-grid">
        <div className="container">
          <SectionHead
            eyebrow="Explore case studies"
            title="Filter by your industry, size *or hiring use case*"
            body="See how teams with your exact recruitment constraints use TalentPool365 to transform their talent pipeline."
          />

          {/* Multi-Dimensional Filter Toolbar */}
          <div className="case-filter-toolbar">
            <div className="filter-group">
              <span className="filter-label">Industry:</span>
              <div className="filter-chips">
                {industries.map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    className={`filter-opt${selectedIndustry === ind ? ' is-active' : ''}`}
                    onClick={() => setSelectedIndustry(ind)}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-subgroups">
              <div className="filter-group">
                <span className="filter-label">Use Case:</span>
                <div className="filter-chips">
                  {useCases.map((uc) => (
                    <button
                      key={uc}
                      type="button"
                      className={`filter-opt${selectedUseCase === uc ? ' is-active' : ''}`}
                      onClick={() => setSelectedUseCase(uc)}
                    >
                      {uc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-label">Company Size:</span>
                <div className="filter-chips">
                  {companySizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={`filter-opt${selectedSize === sz ? ' is-active' : ''}`}
                      onClick={() => setSelectedSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="case-results-count" role="status">
            Showing {filteredStories.length} customer case {filteredStories.length === 1 ? 'study' : 'studies'}
          </p>

          {/* Stories Grid */}
          <div className="stories-cards-grid">
            {filteredStories.map((story, idx) => (
              <Reveal as="article" key={story.id} className="story-card" delay={idx % 3}>
                <div className="story-card-top">
                  <span className="story-industry-tag">{story.industry}</span>
                  <span className="story-size-tag">{story.size}</span>
                </div>

                <h3 className="story-company-name">{story.company}</h3>
                <h4 className="story-card-headline">{story.title}</h4>

                <div className="story-stats-grid">
                  {story.results.slice(0, 2).map((res) => (
                    <div key={res.label} className="story-stat-cell">
                      <strong>{res.stat}</strong>
                      <span>{res.label}</span>
                    </div>
                  ))}
                </div>

                <p className="story-challenge-preview">
                  <strong>Challenge:</strong> {story.challenge}
                </p>

                <div className="story-card-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm story-expand-btn"
                    onClick={() => setActiveStory(story)}
                  >
                    Read Full Case Study <Icon name="arrow-right" />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>

          {!filteredStories.length && (
            <div className="empty-state">
              <h3>No matching case studies found</h3>
              <p>Try resetting your filters to see more stories.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setSelectedIndustry('All');
                  setSelectedUseCase('All');
                  setSelectedSize('All');
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Individual Case Study Modal / Full Story Viewer */}
      {activeStory && (
        <div className="modal-backdrop" onClick={() => setActiveStory(null)}>
          <div
            className="modal-container case-study-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-story-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveStory(null)}
              aria-label="Close case study details"
            >
              ×
            </button>

            <div className="modal-content-scroll">
              <div className="modal-case-header">
                <div className="tag-chips">
                  <span className="badge-tag">{activeStory.industry}</span>
                  <span className="badge-meta">{activeStory.size}</span>
                  <span className="badge-meta">{activeStory.useCase}</span>
                </div>
                <h2 id="modal-story-title" className="modal-case-title">
                  {activeStory.title}
                </h2>
                <div className="modal-snapshot-bar">
                  <div>
                    <span className="snapshot-lbl">Company</span>
                    <strong>{activeStory.company}</strong>
                  </div>
                  <div>
                    <span className="snapshot-lbl">Industry</span>
                    <strong>{activeStory.industry}</strong>
                  </div>
                  <div>
                    <span className="snapshot-lbl">Organization</span>
                    <strong>{activeStory.size}</strong>
                  </div>
                  <div>
                    <span className="snapshot-lbl">Key Solution</span>
                    <strong>{activeStory.useCase}</strong>
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              <div className="modal-results-banner">
                <h3>Key Outcomes Verified</h3>
                <div className="modal-results-cells">
                  {activeStory.results.map((r) => (
                    <div key={r.label} className="modal-stat-box">
                      <strong>{r.stat}</strong>
                      <span>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* The Challenge */}
              <div className="modal-case-section">
                <h3>The Challenge</h3>
                <p>{activeStory.challenge}</p>
              </div>

              {/* The Solution */}
              <div className="modal-case-section">
                <h3>The Solution with TalentPool365</h3>
                <ul className="modal-solution-list">
                  {activeStory.solution.map((step) => (
                    <li key={step}>
                      <Icon name="clipboard-check" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                <div className="features-badge-group">
                  <strong>Platform modules deployed:</strong>
                  <div className="tag-chips">
                    {activeStory.featuresUsed.map((feat) => (
                      <span key={feat} className="feature-pill">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* The Results Detail */}
              <div className="modal-case-section">
                <h3>Verified Business Results</h3>
                <ul className="ticks">
                  {activeStory.bulletResults.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>

              {/* Customer Quote */}
              <div className="modal-quote-box">
                <blockquote>“{activeStory.quote.text}”</blockquote>
                <cite>
                  <strong>{activeStory.quote.author}</strong>
                  <span>{activeStory.quote.role}</span>
                </cite>
              </div>

              {/* What's Next */}
              <div className="modal-case-section">
                <h3>What’s Next</h3>
                <p>{activeStory.whatsNext}</p>
              </div>

              <div className="modal-footer-cta">
                <a className="btn btn-primary" href="/get-started#book-meeting">
                  Book a demo with our team
                </a>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setActiveStory(null)}
                >
                  Close story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Don't see your industry banner */}
      <section className="section custom-industry-band">
        <div className="container split">
          <div className="split-copy">
            <span className="eyebrow">Custom hiring models</span>
            <h2>
              Don’t see your industry? <em className="accent">We can tailor TalentPool365 to fit.</em>
            </h2>
            <p>
              Whether you are hiring specialized maritime engineers, academic researchers, or creative directors,
              our configurable scoring rubrics and assessments adapt to your exact requirements.
            </p>
            <div className="hero-action-buttons" style={{ marginTop: 24 }}>
              <a className="btn btn-primary" href="/company/contact">
                Talk to our hiring team
              </a>
              <a className="btn btn-outline" href="/pricing">
                See pricing options
              </a>
            </div>
          </div>
          <div className="card custom-industry-box">
            <h3>Share your hiring scenario</h3>
            <p>Tell us what is slow or broken in your hiring process, and we’ll show you a tailored workflow walkthrough.</p>
            <ul className="ticks">
              <li>Custom rubric and assessment matching</li>
              <li>Workflow mapping with your existing ATS/HRMS</li>
              <li>Dedicated pilot on your actual candidate data</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Analyst Recognition Strip in Warm Cream Band */}
      <section className="sk-band sk-band--cream">
        <div className="container">
          <div className="sk-section-head sk-section-head--center">
            <span className="sk-pill-tag">ANALYST &amp; PEER RECOGNITION</span>
            <h2 className="sk-serif-h2">Recognized by the teams who use it every day</h2>
          </div>
          <div className="sk-grid-4">
            <article className="sk-card" style={{ textAlign: 'center', alignItems: 'center' }}>
              <span className="sk-pill-tag" style={{ marginBottom: 4 }}>G2 Leader</span>
              <h3>4.8 / 5 Rating</h3>
              <p>Top-rated Enterprise Agentic AI Recruiting &amp; Talent Intelligence suite.</p>
            </article>
            <article className="sk-card" style={{ textAlign: 'center', alignItems: 'center' }}>
              <span className="sk-pill-tag" style={{ marginBottom: 4 }}>TrustRadius</span>
              <h3>Top Rated 2026</h3>
              <p>Verified buyer satisfaction for automated candidate screening.</p>
            </article>
            <article className="sk-card" style={{ textAlign: 'center', alignItems: 'center' }}>
              <span className="sk-pill-tag" style={{ marginBottom: 4 }}>HR Executive</span>
              <h3>Top HR Product</h3>
              <p>Awarded for explainable, fair-hiring Agentic AI evaluation rubrics.</p>
            </article>
            <article className="sk-card" style={{ textAlign: 'center', alignItems: 'center' }}>
              <span className="sk-pill-tag" style={{ marginBottom: 4 }}>SOC 2 Type II</span>
              <h3>Enterprise Trust</h3>
              <p>Audited security, GDPR compliance, and zero model training on client data.</p>
            </article>
          </div>
        </div>
      </section>

      <SkCtaBanner
        title="Ready to join them?"
        subtitle="See how TalentPool365 handles your toughest open requisition with live candidate sourcing, screening, and structured scorecards."
      />
    </main>
  );
}