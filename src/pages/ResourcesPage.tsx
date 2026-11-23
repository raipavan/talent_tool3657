import { useEffect, useState } from 'react';
import { scrollToHash, useHash } from '../lib/router';
import { CinematicCard } from '../components/CinematicMotion';
import { DemoVideo } from '../components/DemoVideo';
import { Faq } from '../components/Faq';
import { Icon } from '../components/Icon';
import { SectionHead } from '../components/SectionHead';
import { SkCtaBanner, SkHero, SkVectorArt } from '../components/SeekOutUI';
import { usePageOverride, useResourcesContent, type BlogPost } from '../cms/CmsProvider';

export function ResourcesPage() {
  const { resources, glossary } = useResourcesContent();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All resources');
  const hash = useHash();

  useEffect(() => {
    if (!resources.some((item) => `#${item.id}` === hash)) return;
    setQuery('');
    setCategory('All resources');
    const frame = requestAnimationFrame(() => scrollToHash(hash));
    return () => cancelAnimationFrame(frame);
  }, [hash, resources]);

  const categories = ['All resources', 'Guide', 'White paper brief', 'Report framework', 'E-book checklist', 'Workshop outline'];
  const shown = resources.filter(
    (item) =>
      (category === categories[0] || item.type === category) &&
      `${item.title} ${item.intro} ${item.type}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const override = usePageOverride('/resources');
  const title = (override?.headline || override?.title || 'TalentPool365 Resource Hub').replace(/\*/g, '');
  const subtitle = override?.lede || 'Practical Agentic AI recruitment playbooks, evaluation frameworks, checklists, and plain-language guides — open to read with zero gated forms.';
  const eyebrow = override?.eyebrow || 'RESOURCES';

  return (
    <main className="sk-page">
      <SkHero
        centered
        eyebrow={eyebrow}
        eyebrowIcon="file-check"
        title={title}
        subtitle={subtitle}
      >
        <div className="sk-hero-search-wrap">
          <span className="sk-hero-search-icon" aria-hidden="true">
            <Icon name="search" />
          </span>
          <label htmlFor="resource-search" className="sr-only">
            Search resources
          </label>
          <input
            id="resource-search"
            type="search"
            className="sk-hero-search-input"
            value={query}
            placeholder="Search resources (interviews, scoring, sourcing...)"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="sk-hero-filters" role="group" aria-label="Resource types">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`sk-filter-pill${category === item ? ' is-active' : ''}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </SkHero>

      <section className="sk-band sk-band--white" id="guides">
        <div className="container">
          <p className="result-count" role="status" style={{ marginBottom: 24 }}>
            Showing {shown.length} practical resource{shown.length === 1 ? '' : 's'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {shown.map((item, idx) => (
              <CinematicCard className="sk-card sk-res-horizontal-card" variant="left" delay={idx % 3} tilt={0.45} id={item.id} key={item.id}>
                <div className="sk-res-media">
                  <SkVectorArt kind={idx % 3 === 0 ? 'cover-1' : idx % 3 === 1 ? 'cover-2' : 'cover-3'} />
                </div>
                <div className="sk-cover-card-body">
                  <span className="sk-pill-tag" style={{ width: 'fit-content', marginBottom: 2 }}>
                    {item.type}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.intro}</p>
                  <details className="resource-details" style={{ marginTop: 'auto', paddingTop: 8 }}>
                    <summary>
                      Read full brief <span className="sr-only">: {item.title}</span>
                    </summary>
                    <div>
                      {item.paragraphs.map((text) => (
                        <p key={text}>{text}</p>
                      ))}
                    </div>
                  </details>
                </div>
              </CinematicCard>
            ))}
          </div>

          {!shown.length && (
            <div className="empty-state">
              <h3>No resources match your search</h3>
              <p>Try searching for a different term or clear the filter.</p>
              <button
                type="button"
                className="sk-btn-green"
                onClick={() => {
                  setQuery('');
                  setCategory(categories[0]);
                }}
              >
                Clear Search &amp; Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="sk-band sk-band--cream" id="product-videos">
        <div className="container split">
          <div className="split-copy">
            <span className="sk-pill-tag">PRODUCT WALKTHROUGH</span>
            <h2 className="sk-serif-h2">See the platform. Follow the work.</h2>
            <p className="sk-section-sub">
              A guided walkthrough of the TalentPool365 workflow: from automated Agentic AI sourcing and semantic
              screening to proctored assessments, video interviews, and digital offers.
            </p>
            <a className="sk-card-link" style={{ marginTop: 14 }} href="/how-it-works">
              Explore all nine hiring steps <Icon name="arrow-right" />
            </a>
          </div>
          <DemoVideo />
        </div>
      </section>

      <Faq contactHref="/company/contact" />

      <section className="sk-band sk-band--cream" id="glossary">
        <div className="container">
          <SectionHead
            eyebrow="Terminology"
            title="Hiring terms, *in plain language*"
            body="Clear explanations of modern talent acquisition and recruitment Agentic AI concepts."
          />
          <dl className="glossary-grid">
            {glossary.map((entry, idx) => (
              <div key={`${entry.term}-${idx}`}>
                <dt>{entry.term}</dt>
                <dd>{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <SkCtaBanner />
    </main>
  );
}

export function BlogPage() {
  const { blogPosts: documentBlogPosts } = useResourcesContent();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);

  const blogCategories = [
    'All',
    'Talent Sourcing',
    'Candidate Screening',
    'Agentic AI in Recruitment',
    'Interviews & Assessments',
    'Candidate Experience',
    'Hiring Strategy',
    'Recruitment Analytics',
  ];

  const featured = documentBlogPosts[0];

  const filteredPosts = documentBlogPosts.filter((post) => {
    if (post.status === 'draft') return false;
    const matchCat = selectedCategory === 'All' || post.category === selectedCategory;
    const matchSearch =
      `${post.title} ${post.tagline} ${post.summary} ${post.category}`
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
    return matchCat && matchSearch;
  });

  const override = usePageOverride('/blog');
  const title = (override?.headline || override?.title || 'Insights, guides and ideas for smarter hiring').replace(/\*/g, '');
  const subtitle = override?.lede || 'Practical advice for recruiters, HR leaders, and hiring managers. Learn how to source better, screen faster, interview fairly, and make Agentic AI work for your team.';
  const eyebrow = override?.eyebrow || 'RECRUITMENT BLOG';

  return (
    <main className="sk-page">
      <SkHero
        centered
        eyebrow={eyebrow}
        eyebrowIcon="megaphone"
        title={title}
        subtitle={subtitle}
      >
        <div className="sk-hero-search-wrap">
          <span className="sk-hero-search-icon" aria-hidden="true">
            <Icon name="search" />
          </span>
          <label htmlFor="blog-search" className="sr-only">
            Search articles
          </label>
          <input
            id="blog-search"
            type="search"
            className="sk-hero-search-input"
            placeholder="Search articles by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="sk-hero-filters" role="group" aria-label="Blog categories">
          {blogCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`sk-filter-pill${selectedCategory === cat ? ' is-active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </SkHero>

      {/* Featured Editorial Story */}
      <section className="sk-band sk-band--cream" id="featured-article">
        <div className="container">
          <div className="sk-card sk-card--top-accent" style={{ padding: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span className="sk-pill-tag" style={{ marginBottom: 0 }}>
                FEATURED · {featured.category}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                {featured.readTime} · {featured.date}
              </span>
            </div>
            <h2 className="sk-serif-h2" style={{ marginTop: 8 }}>{featured.title}</h2>
            <p style={{ fontSize: '1.05rem', color: '#146E63', fontWeight: 600 }}>{featured.tagline}</p>
            <p>{featured.summary}</p>
            <div>
              <button
                type="button"
                className="sk-btn-orange"
                onClick={() => setReadingPost(featured)}
              >
                Read Full Article →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2-Column Article Grid */}
      <section className="sk-band sk-band--white" id="articles-feed">
        <div className="container">
          <p className="result-count" role="status" style={{ marginBottom: 24 }}>
            Showing {filteredPosts.length} article{filteredPosts.length === 1 ? '' : 's'}
          </p>

          <div className="sk-grid-2">
            {filteredPosts.map((post, idx) => (
              <CinematicCard key={post.id} variant="up" delay={idx % 2} className="sk-blog-editorial-card">
                <div className="sk-blog-masthead">
                  <span>{post.category}</span>
                  <span>{post.readTime} · {post.date}</span>
                </div>
                <h3>{post.title}</h3>
                <p className="sk-blog-quote-lead">{post.tagline}</p>
                <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0 }}>{post.summary}</p>
                <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{post.author}</span>
                  <button
                    type="button"
                    className="sk-card-link"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginTop: 0 }}
                    onClick={() => setReadingPost(post)}
                  >
                    Read article <Icon name="arrow-right" />
                  </button>
                </div>
              </CinematicCard>
            ))}
          </div>

          {!filteredPosts.length && (
            <div className="empty-state">
              <h3>No articles found</h3>
              <p>Try searching for a different keyword or resetting your category filter.</p>
              <button
                type="button"
                className="sk-btn-green"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Article Reader Modal */}
      {readingPost && (
        <div className="modal-backdrop" onClick={() => setReadingPost(null)}>
          <div
            className="modal-container blog-article-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="article-reader-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setReadingPost(null)}
              aria-label="Close article"
            >
              ×
            </button>

            <div className="modal-content-scroll">
              <div className="article-reader-head">
                <span className="badge-tag">{readingPost.category}</span>
                <span className="badge-meta">{readingPost.readTime} · {readingPost.date}</span>
                <h1 id="article-reader-title" className="article-reader-title">
                  {readingPost.title}
                </h1>
                <p className="article-reader-tagline">{readingPost.tagline}</p>
                <div className="article-author-byline">
                  <Icon name="users" />
                  <span>By {readingPost.author}</span>
                </div>
              </div>

              <div className="article-reader-body">
                {readingPost.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="modal-footer-cta">
                <a className="btn btn-primary" href="/get-started#book-meeting">
                  Explore TalentPool365 for your team
                </a>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setReadingPost(null)}
                >
                  Close article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SkCtaBanner />
    </main>
  );
}