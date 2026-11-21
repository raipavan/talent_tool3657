export const productSchema = {
  name: 'product',
  title: 'Product Pages',
  type: 'document',
  fields: [
    { name: 'slug', title: 'URL Slug', type: 'string' },
    { name: 'title', title: 'Product Title', type: 'string' },
    { name: 'summary', title: 'Short Summary', type: 'string' },
    { name: 'headline', title: 'Headline', type: 'string' },
    { name: 'lede', title: 'Lede Subtitle', type: 'text' },
    { name: 'icon', title: 'Icon Name', type: 'string' },
    {
      name: 'capabilities',
      title: 'Capabilities / Features',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', title: 'Anchor ID', type: 'string' },
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'tagline', title: 'Tagline', type: 'string' },
            { name: 'body', title: 'Description', type: 'text' },
            { name: 'points', title: 'Bullet Points', type: 'array', of: [{ type: 'string' }] },
          ],
        },
      ],
    },
    {
      name: 'outcomes',
      title: 'Key Outcome Metrics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', title: 'Metric Value (e.g. 68%)', type: 'string' },
            { name: 'label', title: 'Metric Label', type: 'string' },
          ],
        },
      ],
    },
  ],
};
