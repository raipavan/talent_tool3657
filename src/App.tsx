import { useEffect, useMemo, useRef } from 'react';
import { CookieBanner } from './components/CookieBanner';
import { SeoHead } from './components/SeoHead';
import { AnalyticsTracker } from './lib/analytics';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { interceptLinkClicks, navigate, scrollToHash, usePath } from './lib/router';
import { notFound, pageTitle, routes, type Route } from './routes';
import { useCms } from './cms/CmsProvider';
import { DynamicCmsPage } from './pages/DynamicCmsPage';
import { BlogPostDetailPage } from './pages/BlogPostDetailPage';
import { AdminQuickEditBar } from './components/cms/AdminQuickEditBar';

const SPOTLIT = '.card, .int-tile, .case-card, .faq-item, .why-card, .showcase-stage';
const DESCRIPTION = 'meta[name="description"]';

export default function App() {
  const cms = useCms();
  const path = usePath();

  // Cards light up under the pointer
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(SPOTLIT) : null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      target.style.setProperty('--my', `${event.clientY - rect.top}px`);
      target.style.setProperty('--ry', `${((event.clientX - rect.left) / rect.width - 0.5) * 14}deg`);
      target.style.setProperty('--rx', `${(0.5 - (event.clientY - rect.top) / rect.height) * 14}deg`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Internal links change the page without a reload
  useEffect(() => interceptLinkClicks(), []);

  // Check 301/302 redirects defined in CMS
  useEffect(() => {
    if (Array.isArray(cms.redirects) && cms.redirects.length > 0) {
      const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
      const match = cms.redirects.find(
        (r) => r.isActive && (r.sourcePath === normalized || r.sourcePath === `${normalized}/`),
      );
      if (match) {
        navigate(match.targetUrl);
      }
    }
  }, [path, cms.redirects]);

  // Resolve dynamic active route: static routes -> blog detail -> custom CMS page -> 404
  const activeRoute = useMemo((): Route => {
    if (routes[path]) return routes[path];

    // Check Blog post /blog/:slug
    if (path.startsWith('/blog/')) {
      const slug = path.slice('/blog/'.length);
      const posts = cms.site.resourcesPage?.blogPosts || [];
      const post = posts.find((p) => p.slug === slug || p.id === slug);
      if (post) {
        return {
          title: post.title,
          description: post.summary || post.tagline,
          render: () => <BlogPostDetailPage post={post} />,
        };
      }
    }

    // Check Dynamic Custom Pages created via Page Builder
    const customPages = cms.customPages || [];
    const customPage = customPages.find((p) => {
      const pSlug = p.slug.startsWith('/') ? p.slug : `/${p.slug}`;
      return pSlug === path;
    });

    if (customPage) {
      return {
        title: customPage.title,
        description: customPage.seo?.metaDescription || customPage.title,
        render: () => <DynamicCmsPage page={customPage} />,
      };
    }

    return notFound;
  }, [path, cms.site.resourcesPage?.blogPosts, cms.customPages]);

  const mainRef = useRef<HTMLElement>(null);
  const previousRoute = useRef(activeRoute);

  // Document title and focus management
  useEffect(() => {
    document.title = pageTitle(activeRoute);
    document.querySelector(DESCRIPTION)?.setAttribute('content', activeRoute.description);

    if (previousRoute.current === activeRoute) {
      if (window.location.hash) requestAnimationFrame(() => scrollToHash(window.location.hash));
      return;
    }
    previousRoute.current = activeRoute;
    mainRef.current?.focus({ preventScroll: true });
  }, [activeRoute]);

  const isStudio = path === '/admin' || path === '/studio';

  return (
    <>
      <SeoHead />
      <AnalyticsTracker />
      <AdminQuickEditBar />

      {!isStudio && (
        <>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <Header />
        </>
      )}

      <main
        id="main-content"
        className={isStudio ? 'page-studio' : 'page'}
        ref={mainRef}
        tabIndex={-1}
        key={path}
      >
        {activeRoute.render()}
      </main>

      {!isStudio && (
        <>
          <Footer />
          <CookieBanner />
        </>
      )}
    </>
  );
}
