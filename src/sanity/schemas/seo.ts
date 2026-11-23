export const seoSchema = {
  name: 'seo',
  title: 'SEO & Social Sharing',
  type: 'object',
  fields: [
    {
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Optimal length: 50-60 characters. Appears in browser tabs and search engine snippets.',
      validation: (Rule: any) => Rule.max(70).warning('Titles longer than 60-70 characters may get truncated by Google.'),
    },
    {
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Optimal length: 140-160 characters. Displayed under your title in search results.',
      validation: (Rule: any) => Rule.max(170).warning('Descriptions longer than 160 characters may get truncated by Google.'),
    },
    {
      name: 'ogImage',
      title: 'Open Graph / Social Sharing Image',
      type: 'image',
      description: 'Recommended size: 1200x630px. Shown when shared on LinkedIn, WhatsApp, Twitter/X, Facebook.',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'canonicalUrl',
      title: 'Canonical URL Override',
      type: 'url',
      description: 'Leave blank to use the default URL for this page.',
    },
    {
      name: 'noIndex',
      title: 'Hide from search engines (noindex)',
      type: 'boolean',
      description: 'If turned on, search crawlers (Google, Bing) will be instructed not to index this page.',
      initialValue: false,
    },
    {
      name: 'structuredDataType',
      title: 'Structured Data (Schema.org) Type',
      type: 'string',
      options: {
        list: [
          { title: 'WebPage (Default)', value: 'WebPage' },
          { title: 'SoftwareApplication', value: 'SoftwareApplication' },
          { title: 'Article / BlogPosting', value: 'Article' },
          { title: 'FAQPage', value: 'FAQPage' },
          { title: 'AboutPage', value: 'AboutPage' },
          { title: 'ContactPage', value: 'ContactPage' },
        ],
      },
      initialValue: 'WebPage',
    },
  ],
};
