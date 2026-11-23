import { useEffect, useState } from 'react';
import { usePath } from '../lib/router';
import { routes } from '../routes';
import { useCms } from '../cms/CmsProvider';

export function SeoHead() {
  const path = usePath();
  const cms = useCms();
  const currentRoute = routes[path] || routes['/'];

  const [, setMetadata] = useState<{
    title: string;
    description: string;
    ogImage?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    structuredDataType?: string;
  }>({
    title: currentRoute?.title || 'TalentPool365',
    description: currentRoute?.description || '',
  });

  useEffect(() => {
    // Check if site has per-page custom SEO
    const siteSettings = (cms.site as any)?.siteSettings;
    const pageSeoMeta = cms.site.pageSeo?.[path];
    const homeSeo = (cms.site as any)?.home?.seo;
    const pricingSeo = (cms.site as any)?.pricing?.seo;
    const pageOverrides = cms.site?.pageOverrides?.[path] as any;
    const genericPageSeo = pageOverrides?.seo;

    let title = currentRoute?.title || 'TalentPool365';
    let description = currentRoute?.description || '';
    let ogImage = siteSettings?.defaultOgImage || '/assets/hero-aurevia-bg.png';
    let canonicalUrl = '';
    let noIndex = false;
    let structuredDataType = 'WebPage';

    // 1. Check custom pageSeo from Advanced CMS SEO Manager
    if (pageSeoMeta) {
      if (pageSeoMeta.metaTitle) title = pageSeoMeta.metaTitle;
      if (pageSeoMeta.metaDescription) description = pageSeoMeta.metaDescription;
      if (pageSeoMeta.ogImage) ogImage = pageSeoMeta.ogImage;
      if (pageSeoMeta.canonicalUrl) canonicalUrl = pageSeoMeta.canonicalUrl;
      if (pageSeoMeta.noIndex !== undefined) noIndex = pageSeoMeta.noIndex;
      if (pageSeoMeta.structuredDataType) structuredDataType = pageSeoMeta.structuredDataType;
    } else if (path === '/' && homeSeo) {
      if (homeSeo.metaTitle) title = homeSeo.metaTitle;
      if (homeSeo.metaDescription) description = homeSeo.metaDescription;
      if (homeSeo.ogImage) ogImage = typeof homeSeo.ogImage === 'string' ? homeSeo.ogImage : ogImage;
      if (homeSeo.canonicalUrl) canonicalUrl = homeSeo.canonicalUrl;
      if (homeSeo.noIndex !== undefined) noIndex = homeSeo.noIndex;
      if (homeSeo.structuredDataType) structuredDataType = homeSeo.structuredDataType;
    } else if (path === '/pricing' && pricingSeo) {
      if (pricingSeo.metaTitle) title = pricingSeo.metaTitle;
      if (pricingSeo.metaDescription) description = pricingSeo.metaDescription;
      if (pricingSeo.canonicalUrl) canonicalUrl = pricingSeo.canonicalUrl;
      if (pricingSeo.noIndex !== undefined) noIndex = pricingSeo.noIndex;
    } else if (genericPageSeo) {
      if (genericPageSeo.metaTitle) title = genericPageSeo.metaTitle;
      if (genericPageSeo.metaDescription) description = genericPageSeo.metaDescription;
      if (genericPageSeo.canonicalUrl) canonicalUrl = genericPageSeo.canonicalUrl;
      if (genericPageSeo.noIndex !== undefined) noIndex = genericPageSeo.noIndex;
    }

    // 2. Dynamic Custom Pages & Blog Posts
    const customPage = (cms.customPages || []).find((p) => {
      const pSlug = p.slug.startsWith('/') ? p.slug : `/${p.slug}`;
      return pSlug === path;
    });
    if (customPage) {
      title = customPage.seo?.metaTitle || customPage.title;
      if (customPage.seo?.metaDescription) description = customPage.seo.metaDescription;
      if (customPage.seo?.ogImage) ogImage = customPage.seo.ogImage;
      if (customPage.seo?.noIndex !== undefined) noIndex = customPage.seo.noIndex;
    } else if (path.startsWith('/blog/')) {
      const slug = path.slice('/blog/'.length);
      const post = (cms.site.resourcesPage?.blogPosts || []).find(
        (p) => p.slug === slug || p.id === slug,
      );
      if (post) {
        title = post.seo?.metaTitle || post.title;
        description = post.seo?.metaDescription || post.summary || post.tagline;
        if (post.coverImage) ogImage = post.coverImage;
        structuredDataType = 'Article';
      }
    }

    setMetadata({
      title,
      description,
      ogImage,
      canonicalUrl,
      noIndex,
      structuredDataType,
    });

    // 1. Update Document Title
    document.title = title.includes('TalentPool365') ? title : `${title} | TalentPool365`;

    // 2. Helper to set/create <meta> tags
    const setMetaTag = (attribute: string, attrVal: string, content: string) => {
      let tag = document.querySelector(`meta[${attribute}="${attrVal}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, attrVal);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // 3. Helper to set/create <link> tags (e.g. canonical)
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Standard Meta
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Google Search Console if provided in CMS siteSettings
    if (siteSettings?.googleSearchConsole) {
      setMetaTag('name', 'google-site-verification', siteSettings.googleSearchConsole);
    }

    // Open Graph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', 'website');
    const fullOgImage = ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`;
    setMetaTag('property', 'og:image', fullOgImage);
    setMetaTag('property', 'og:url', canonicalUrl || window.location.href);
    setMetaTag('property', 'og:site_name', siteSettings?.siteName || 'TalentPool365');

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', fullOgImage);

    // Canonical
    if (canonicalUrl || window.location.origin) {
      setLinkTag('canonical', canonicalUrl || window.location.href.split('?')[0]);
    }

    // JSON-LD Structured Data
    let jsonLdScript = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'seo-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': structuredDataType || 'WebPage',
      name: title,
      description: description,
      url: canonicalUrl || window.location.href,
      publisher: {
        '@type': 'Organization',
        name: 'TalentPool365',
        url: window.location.origin,
        logo: `${window.location.origin}/assets/talentpool365-logo.png`,
      },
    };

    jsonLdScript.text = JSON.stringify(structuredData);
  }, [path, currentRoute, cms.site]);

  return null;
}
