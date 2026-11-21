import { useState, useEffect } from 'react';
import { sanityClient, isSanityConfigured } from './client';

export function useSanityData<T>(query: string, fallbackData: T, params?: Record<string, unknown>): { data: T; loading: boolean } {
  const [data, setData] = useState<T>(fallbackData);
  const [loading, setLoading] = useState<boolean>(isSanityConfigured);

  useEffect(() => {
    if (!isSanityConfigured || !sanityClient) {
      setData(fallbackData);
      setLoading(false);
      return;
    }

    let isMounted = true;
    sanityClient
      .fetch<T>(query, params || {})
      .then((result) => {
        if (isMounted && result) {
          setData(result);
        }
      })
      .catch((err) => {
        console.warn('[Sanity] Error fetching content, falling back to local data:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query, JSON.stringify(params)]);

  return { data, loading };
}
