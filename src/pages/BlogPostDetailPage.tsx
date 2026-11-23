import { useEffect } from 'react';
import type { BlogPost } from '../cms/siteDefaults';
import { RichTextRenderer } from '../components/RichTextRenderer';
import { SkCtaBanner } from '../components/SeekOutUI';

export function BlogPostDetailPage({ post }: { post: BlogPost }) {
  useEffect(() => {
    // Add Article structured data
    let script = document.getElementById('blog-article-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'blog-article-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.summary || post.tagline,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      datePublished: post.date,
      publisher: {
        '@type': 'Organization',
        name: 'TalentPool365',
        url: window.location.origin,
      },
    });

    return () => {
      const el = document.getElementById('blog-article-jsonld');
      if (el) el.remove();
    };
  }, [post]);

  return (
    <main className="sk-page blog-post-page">
      <article className="sk-band sk-band--white" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <div className="container" style={{ maxWidth: 840 }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 24 }}>
            <a
              href="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--color-secondary)',
                textDecoration: 'none',
              }}
            >
              <span>←</span> Back to all articles
            </a>
          </div>

          {/* Header Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span className="sk-pill-tag" style={{ margin: 0 }}>
              {post.category}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {post.readTime} · {post.date}
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'Newsreader, Georgia, serif',
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              lineHeight: 1.15,
              color: 'var(--color-primary)',
              margin: '0 0 16px',
            }}
          >
            {post.title}
          </h1>

          {post.tagline && (
            <p
              style={{
                fontSize: '1.2rem',
                lineHeight: 1.5,
                color: '#146E63',
                fontWeight: 600,
                margin: '0 0 24px',
              }}
            >
              {post.tagline}
            </p>
          )}

          {/* Author Byline */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              paddingBottom: 24,
              borderBottom: '1px solid var(--color-border)',
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'var(--color-outline-fill)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              {post.author ? post.author.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                {post.author}
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                TalentPool365 Recruitment Research
              </span>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div style={{ marginBottom: 36 }}>
              <img
                src={post.coverImage}
                alt={post.title}
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-md)',
                  maxHeight: 460,
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          {/* Content: Markdown or Paragraphs */}
          {post.bodyMarkdown ? (
            <RichTextRenderer content={post.bodyMarkdown} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--color-text)' }}>
              {(post.paragraphs || []).map((p, idx) => (
                <p key={idx} style={{ margin: 0 }}>
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>
      </article>

      <SkCtaBanner
        title="Ready to see Agentic AI in action on your hiring pipeline?"
        subtitle="Book a live walkthrough on an open role or explore our interactive candidate screening workflows."
        primary={{ label: 'Book a demo →', href: '/get-started#book-meeting' }}
        secondary={{ label: 'Compare Pricing Plans', href: '/pricing' }}
      />
    </main>
  );
}
