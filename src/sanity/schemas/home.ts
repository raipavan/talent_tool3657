export const homeSchema = {
  name: 'home',
  title: 'Home Page',
  type: 'document',
  fields: [
    {
      name: 'seo',
      title: 'SEO & Metadata',
      type: 'seo',
    },
    {
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        { name: 'headlinePrefix', title: 'Headline Prefix', type: 'string', initialValue: 'Agentic AI Recruitment Tool' },
        { name: 'headlineSecondLine', title: 'Headline Second Line', type: 'string', initialValue: 'The Intelligent Platform for Hiring' },
        { name: 'subheadline', title: 'Subheadline', type: 'text', rows: 2 },
        { name: 'ctaPrimary', title: 'Primary CTA Text', type: 'string', initialValue: 'Start Free Trial' },
        { name: 'ctaPrimaryHref', title: 'Primary CTA Link', type: 'string', initialValue: '/get-started' },
        { name: 'ctaSecondary', title: 'Secondary CTA Text', type: 'string', initialValue: 'Book a Demo' },
        { name: 'ctaSecondaryHref', title: 'Secondary CTA Link', type: 'string', initialValue: '#contact' },
        { name: 'bgImage', title: 'Background Image Path/URL', type: 'string', initialValue: '/assets/hero-aurevia-bg.png' },
      ],
    },
    {
      name: 'heroRoles',
      title: 'Hero: Rotating Roles',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'demoVideoSection',
      title: 'Demo Video Section (Before Proven Impact)',
      type: 'object',
      fields: [
        { name: 'title', title: 'Headline', type: 'string', initialValue: 'Experience the Future of *AI Recruitment Tools*' },
        { name: 'body', title: 'Description', type: 'text', rows: 3 },
        { name: 'videoUrl', title: 'Video File Path or URL', type: 'string', initialValue: '/assets/demo_video.mp4' },
      ],
    },
    {
      name: 'heroProof',
      title: 'Hero: Proof Points',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'interviewSplit',
      title: 'Inside Interviews Section',
      type: 'object',
      fields: [
        { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'body', title: 'Body', type: 'text' },
        { name: 'points', title: 'Points', type: 'array', of: [{ type: 'string' }] },
        { name: 'cta', title: 'CTA Label', type: 'string' },
      ],
    },
    {
      name: 'metricsSection',
      title: 'Proven Impact (Metrics) Section Head',
      type: 'object',
      fields: [
        { name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'Proven impact' },
        { name: 'title', title: 'Title', type: 'string', initialValue: 'What changes in the *first quarter*' },
      ],
    },
    {
      name: 'metrics',
      title: 'Metrics Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', title: 'Numeric Value', type: 'string' },
            { name: 'suffix', title: 'Suffix (e.g. %, x, hrs)', type: 'string' },
            { name: 'decimals', title: 'Decimal Places', type: 'number', initialValue: 0 },
            { name: 'label', title: 'Label', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'industries',
      title: 'Industries Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'icon', title: 'Icon', type: 'string' },
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'body', title: 'Body', type: 'text' },
            { name: 'statValue', title: 'Stat Value', type: 'string' },
            { name: 'statLabel', title: 'Stat Label', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'faqs',
      title: 'Frequently Asked Questions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'question', title: 'Question', type: 'string' },
            { name: 'answer', title: 'Answer', type: 'text' },
          ],
        },
      ],
    },
  ],
};
