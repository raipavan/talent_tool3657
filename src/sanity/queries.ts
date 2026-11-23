export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings" && _id == "siteSettings"][0]`;

export const HOME_PAGE_QUERY = `*[_type == "home" && _id == "home"][0]`;

export const PRICING_PAGE_QUERY = `*[_type == "pricingPage" && _id == "pricingPage"][0]`;

export const ALL_PRODUCTS_QUERY = `*[_type == "product"] | order(order asc, title asc)`;

export const PRODUCT_BY_SLUG_QUERY = `*[_type == "product" && slug.current == $slug][0]`;

export const ALL_POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc)`;

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

export const ALL_GENERIC_PAGES_QUERY = `*[_type == "genericPage"]`;

export const GENERIC_PAGE_BY_SLUG_QUERY = `*[_type == "genericPage" && slug == $slug][0]`;

export const ALL_SEO_METADATA_QUERY = `{
  "siteSettings": *[_type == "siteSettings" && _id == "siteSettings"][0],
  "home": *[_type == "home" && _id == "home"][0]{ "seo": seo },
  "pricing": *[_type == "pricingPage" && _id == "pricingPage"][0]{ "seo": seo },
  "products": *[_type == "product"]{ "slug": slug.current, title, "seo": seo },
  "posts": *[_type == "post"]{ "slug": slug.current, title, "seo": seo },
  "genericPages": *[_type == "genericPage"]{ slug, title, "seo": seo }
}`;
