/**
 * One-time / idempotent Sanity seed script.
 * Populates your Sanity Cloud project with the existing content from siteDefaults.
 *
 * Usage:
 *   SANITY_PROJECT_ID=your_id SANITY_DATASET=production SANITY_AUTH_TOKEN=your_token node scripts/seed-sanity.mjs
 */

import { createClient } from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const projectId = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production';
const token = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_TOKEN;

if (!projectId || !token) {
  console.error('\n[Error] Missing SANITY_PROJECT_ID or SANITY_AUTH_TOKEN environment variables.');
  console.error('Run: SANITY_PROJECT_ID=xxx SANITY_AUTH_TOKEN=yyy node scripts/seed-sanity.mjs\n');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-03-01',
  useCdn: false,
});

async function seed() {
  console.log(`[Seed] Connecting to Sanity project: ${projectId} (dataset: ${dataset})...`);

  // 1. Seed Site Settings
  console.log('[Seed] Seeding siteSettings...');
  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteName: 'TalentPool365',
    defaultSeo: {
      metaTitle: 'TalentPool365 — Agentic AI Recruitment Platform | Source, Screen & Hire Faster',
      metaDescription: 'TalentPool365 sources, screens, assesses and interviews candidates automatically. Cut time-to-hire by 68% without adding headcount.',
      canonicalUrl: 'https://talentpool365.com',
      noIndex: false,
      structuredDataType: 'SoftwareApplication',
    },
  });

  // 2. Read local home.json if available
  let homeJson = {};
  try {
    const raw = fs.readFileSync(path.join(ROOT, 'content', 'home.json'), 'utf-8');
    homeJson = JSON.parse(raw);
  } catch (e) {
    console.warn('[Seed] Could not read content/home.json:', e.message);
  }

  // 3. Seed Home document
  console.log('[Seed] Seeding home document...');
  await client.createOrReplace({
    _id: 'home',
    _type: 'home',
    seo: {
      metaTitle: 'TalentPool365 — Agentic AI Recruitment Platform | Source, Screen & Hire Faster',
      metaDescription: 'TalentPool365 sources, screens, assesses and interviews candidates automatically. Cut time-to-hire by 68% without adding headcount.',
      noIndex: false,
      structuredDataType: 'WebPage',
    },
    hero: {
      headlinePrefix: 'Agentic AI Recruitment Tool',
      headlineSecondLine: 'The Intelligent Platform for Hiring',
      subheadline: 'Connect talent, automate workflows, and make informed decisions faster with TalentPool365.',
      ctaPrimary: 'Start Free Trial',
      ctaPrimaryHref: '/get-started',
      ctaSecondary: 'Book a Demo',
      ctaSecondaryHref: '#contact',
      bgImage: '/assets/hero-aurevia-bg.png',
    },
    demoVideoSection: {
      title: 'Experience the Future of *AI Recruitment Tools*',
      body: 'Explore how our AI recruitment software simplifies talent acquisition through automated candidate sourcing, intelligent resume screening, AI-powered interviews, and data-driven hiring decisions. Find the right talent faster while reducing manual effort and improving recruitment efficiency.',
      videoUrl: '/assets/demo_video.mp4',
    },
    heroRoles: homeJson.heroRoles || ['operators', 'engineers', 'analysts'],
    heroProof: homeJson.heroProof || ['One connected hiring workflow', 'Human-led decisions', 'Built around your team'],
    metricsSection: {
      eyebrow: 'Proven impact',
      title: 'What changes in the *first quarter*',
    },
  });

  console.log('\n[Seed Success] Content seeded successfully into Sanity Cloud!');
}

seed().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
