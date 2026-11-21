export const pricingSchema = {
  name: 'pricing',
  title: 'Pricing Page',
  type: 'document',
  fields: [
    { name: 'heroTitle', title: 'Banner Headline', type: 'string' },
    { name: 'heroSubtitle', title: 'Banner Subtitle', type: 'text' },
    {
      name: 'plans',
      title: 'Pricing Plans',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Plan Name (e.g. Starter)', type: 'string' },
            { name: 'badge', title: 'Badge Label (e.g. Starter Plan)', type: 'string' },
            { name: 'target', title: 'Target Description', type: 'string' },
            { name: 'priceMonthly', title: 'Monthly Price ($)', type: 'string' },
            { name: 'priceAnnual', title: 'Annual Price ($/mo)', type: 'string' },
            { name: 'trialNote', title: 'Trial / Billing Note', type: 'string' },
            { name: 'isPopular', title: 'Is Most Popular?', type: 'boolean' },
            { name: 'featureTitle', title: 'Feature List Title', type: 'string' },
            { name: 'features', title: 'Features List', type: 'array', of: [{ type: 'string' }] },
            { name: 'ctaText', title: 'CTA Button Text', type: 'string' },
            { name: 'ctaHref', title: 'CTA Button Link', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'comparisonFeatures',
      title: 'Comparison Table Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'feature', title: 'Feature Name', type: 'string' },
            { name: 'starter', title: 'Starter Tier Value', type: 'string' },
            { name: 'pro', title: 'Professional Tier Value', type: 'string' },
            { name: 'ent', title: 'Enterprise Tier Value', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'faqs',
      title: 'Pricing FAQs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'q', title: 'Question', type: 'string' },
            { name: 'a', title: 'Answer', type: 'text' },
          ],
        },
      ],
    },
  ],
};
