import { useSyncExternalStore } from 'react';
import { prefersReducedMotion } from './motion';

/**
 * Minimal client-side router (History API, no dependency).
 *
 * - `usePath()` re-renders on navigation and on back/forward.
 * - `navigate('/pricing')` or `navigate('/solutions#by-use-case')` changes the
 *   page without a reload. Internal `<a href="/...">` links are picked up by
 *   `interceptLinkClicks()` in App, so plain anchors are all a page needs.
 * - Links that are only a hash (`#contact`) are left to the browser.
 */

const listeners = new Set<() => void>();

const normalize = (pathname: string): string =>
  pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

const getPath = (): string => {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has('studio') || params.has('admin') || params.get('p') === 'studio' || params.get('page') === 'studio') {
      return '/studio';
    }
  } catch {}

  const hash = window.location.hash;
  if (hash.startsWith('#/')) {
    const raw = hash.slice(1).split('?')[0].split('#')[0];
    return normalize(raw || '/');
  }
  if (hash === '#studio' || hash === '#admin') {
    return '/studio';
  }
  return normalize(window.location.pathname);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  window.addEventListener('hashchange', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
    window.removeEventListener('hashchange', listener);
  };
};

export function usePath(): string {
  return useSyncExternalStore(subscribe, getPath, () => '/');
}

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => {
    const hash = window.location.hash;
    if (hash.startsWith('#/')) {
      const parts = hash.slice(1).split('#');
      return parts.length > 1 ? '#' + parts.slice(1).join('#') : '';
    }
    return hash;
  }, () => '');
}

/** Scroll to the element a hash names; returns false when it is not on the page. */
export function scrollToHash(hash: string, behavior: ScrollBehavior = 'instant'): boolean {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  const target = id ? document.getElementById(id) : null;
  if (!target) return false;
  target.scrollIntoView({ behavior, block: 'start' });
  return true;
}

export function navigate(to: string): void {
  const url = new URL(to, window.location.origin);
  const samePage = normalize(url.pathname) === getPath();

  if (window.location.hash.startsWith('#/')) {
    const newHash = '#' + url.pathname + (url.search || '');
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
  } else {
    if (url.pathname + url.search + url.hash !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.pushState(null, '', url.pathname + url.search + url.hash);
    }
  }
  listeners.forEach((listener) => listener());

  // The store update above renders synchronously; wait a frame for layout.
  requestAnimationFrame(() => {
    if (samePage) {
      const behavior = prefersReducedMotion() ? 'instant' : 'smooth';
      if (url.hash && scrollToHash(url.hash, behavior)) return;
      window.scrollTo({ top: 0, left: 0, behavior });
      return;
    }
    if (url.hash && scrollToHash(url.hash, 'instant')) {
      // Images and canvases above the target settle after first paint; land again once they have.
      window.setTimeout(() => {
        if (window.location.hash === url.hash) scrollToHash(url.hash, 'instant');
      }, 350);
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
}

/** Turns clicks on internal `<a href="/...">` links into client-side navigation. */
export function interceptLinkClicks(): () => void {
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target instanceof Element ? event.target.closest('a') : null;
    const href = anchor?.getAttribute('href');
    if (!anchor || !href) return;
    if (!href.startsWith('/') || href.startsWith('//')) return;
    // files are real static assets, not client pages
    if (href.startsWith('/assets/')) return;
    if (anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;

    event.preventDefault();
    if (href === '/admin' || href.startsWith('/admin/')) {
      navigate('/studio');
    } else {
      navigate(href);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'A' || event.key === 'a' || event.key === 'S' || event.key === 's')) {
      event.preventDefault();
      navigate('/studio');
    }
  };

  document.addEventListener('click', onClick);
  window.addEventListener('keydown', onKeyDown);
  return () => {
    document.removeEventListener('click', onClick);
    window.removeEventListener('keydown', onKeyDown);
  };
}
