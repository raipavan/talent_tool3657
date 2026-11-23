export const genericPageSchema = {
  name: 'genericPage',
  title: 'Content Pages',
  type: 'document',
  fields: [
    {
      name: 'slug',
      title: 'Page Route / Slug (e.g. solutions, how-it-works, case-studies)',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
    },
    {
      name: 'subtitle',
      title: 'Page Subtitle / Lede',
      type: 'text',
      rows: 2,
    },
    {
      name: 'seo',
      title: 'Page SEO & Meta Settings',
      type: 'seo',
    },
    {
      name: 'pageContent',
      title: 'Page Custom Content / Overrides (JSON string or object)',
      type: 'text',
      description: 'Custom structured JSON content for complex inner page sections.',
    },
  ],
};
