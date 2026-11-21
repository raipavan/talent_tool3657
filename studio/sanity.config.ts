import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

export default defineConfig({
  name: 'default',
  title: 'TalentPool365 Studio',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your_project_id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [structureTool()],

  schema: {
    types: [
      {
        name: 'pricingPage',
        title: 'Pricing Page',
        type: 'document',
        fields: [
          { name: 'title', title: 'Page Title', type: 'string' },
          { name: 'subtitle', title: 'Page Subtitle', type: 'text' },
          {
            name: 'plans',
            title: 'Plans',
            type: 'array',
            of: [
              {
                type: 'object',
                fields: [
                  { name: 'name', title: 'Plan Name', type: 'string' },
                  { name: 'badge', title: 'Badge Label', type: 'string' },
                  { name: 'target', title: 'Target Audience', type: 'string' },
                  { name: 'priceMonthly', title: 'Monthly Price', type: 'string' },
                  { name: 'priceAnnual', title: 'Annual Price', type: 'string' },
                  { name: 'trialNote', title: 'Trial Note', type: 'string' },
                  { name: 'isPopular', title: 'Most Popular', type: 'boolean' },
                  { name: 'features', title: 'Included Features', type: 'array', of: [{ type: 'string' }] },
                  { name: 'ctaText', title: 'Button Text', type: 'string' },
                  { name: 'ctaHref', title: 'Button Link', type: 'string' },
                ],
              },
            ],
          },
          {
            name: 'comparisonFeatures',
            title: 'Comparison Features',
            type: 'array',
            of: [
              {
                type: 'object',
                fields: [
                  { name: 'feature', title: 'Feature Name', type: 'string' },
                  { name: 'starter', title: 'Starter Value', type: 'string' },
                  { name: 'pro', title: 'Professional Value', type: 'string' },
                  { name: 'ent', title: 'Enterprise Value', type: 'string' },
                ],
              },
            ],
          },
          {
            name: 'faqs',
            title: 'FAQs',
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
      },
    ],
  },
});
