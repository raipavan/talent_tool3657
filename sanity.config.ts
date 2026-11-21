import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemas';

export default defineConfig({
  name: 'default',
  title: 'TalentPool365 Content Studio',

  projectId: process.env.VITE_SANITY_PROJECT_ID || 'your_project_id',
  dataset: process.env.VITE_SANITY_DATASET || 'production',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
});
