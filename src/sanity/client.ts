import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || '';
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-03-01';

export const isSanityConfigured = Boolean(projectId && projectId.trim() !== '' && projectId !== 'your_project_id');

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: 'published',
    })
  : null;

const builder = isSanityConfigured && sanityClient ? createImageUrlBuilder(sanityClient) : null;

export function urlFor(source: any): string {
  if (!source) return '';
  if (typeof source === 'string') return source;
  if (builder && source.asset) {
    try {
      return builder.image(source).auto('format').url();
    } catch {
      return '';
    }
  }
  return '';
}
