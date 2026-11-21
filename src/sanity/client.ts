import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || '';
export const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
export const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-03-01';

export const isSanityConfigured = Boolean(projectId && projectId.trim().length > 0);

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;

const imageBuilder = isSanityConfigured && sanityClient ? createImageUrlBuilder(sanityClient) : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  if (!imageBuilder || !source) return '';
  return imageBuilder.image(source).url();
}
