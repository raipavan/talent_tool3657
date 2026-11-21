/* Compatibility hook — all content now comes from CmsProvider (self-hosted CMS backend). */
export function useSanityData<T>(_query: string, fallbackData: T, _params?: Record<string, unknown>): { data: T; loading: boolean } {
  return { data: fallbackData, loading: false };
}
