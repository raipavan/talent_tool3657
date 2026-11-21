/* Sanity SDK has been replaced by the self-hosted TalentPool365 CMS Backend (src/cms/). */
export const isSanityConfigured = false;
export const sanityClient = null;
export function urlFor(source: unknown): string {
  return typeof source === 'string' ? source : '';
}
