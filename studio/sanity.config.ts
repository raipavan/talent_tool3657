import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from '../src/sanity/schemas';

export default defineConfig({
  name: 'default',
  title: 'TalentPool365 Studio',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'your_project_id',
  dataset: process.env.SANITY_STUDIO_DATASET || process.env.VITE_SANITY_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content & SEO Management')
          .items([
            S.listItem()
              .title('Global Settings & SEO')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.listItem()
              .title('Home Page')
              .id('home')
              .child(S.document().schemaType('home').documentId('home')),
            S.listItem()
              .title('Pricing Page')
              .id('pricingPage')
              .child(S.document().schemaType('pricingPage').documentId('pricingPage')),
            S.divider(),
            S.documentTypeListItem('product').title('Products (9 Modules)'),
            S.documentTypeListItem('post').title('Blog & Resource Articles'),
            S.documentTypeListItem('genericPage').title('Inner Pages & SEO'),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
