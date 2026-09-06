import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { AnimationEvent, MouseEvent } from 'react';
import { ids } from '../content/data';

function hashId(hash: string) {
  try {
    const id = decodeURIComponent(hash.slice(1));
    return !id || id === 'main' || id === 'top' || ids.includes(id) ? id : null;
  } catch {
    return null;
  }
}

export function useDisplay() {
  const [selected, setSelected] = useState(hashId(location.hash) || '');
  const seen = useRef(new Set<string>());
  const navigating = useRef(false);
  const finishAnimation = useCallback((event: AnimationEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) delete event.currentTarget.dataset.animated;
  }, []);
  const navigate = useCallback((event: MouseEvent<HTMLElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = (event.target as Element).closest('a');
    const href = link?.getAttribute('href');
    if (
      !href?.startsWith('#') ||
      link?.hasAttribute('download') ||
      (link?.target && link.target !== '_self')
    )
      return;
    const id = hashId(href);
    if (id === null) return;
    event.preventDefault();
    if (location.hash !== href) history.pushState(null, '', href);
    const target = document.getElementById(id || 'top');
    navigating.current = true;
    target?.focus({ preventScroll: true });
    navigating.current = false;
    target?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    });
  }, []);

  useLayoutEffect(() => {
    const id = hashId(location.hash);
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
  }, []);

  useEffect(() => {
    const headings = ids.map((id) => document.getElementById(id)!);
    let scrollFrame = 0;

    const updateSelection = () => {
      scrollFrame = 0;
      const readingLine = Math.min(200, innerHeight * 0.25);
      let currentId = '';

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= readingLine) currentId = heading.id;
      }

      // The last section may be too short to reach the reading line.
      if (scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 2) {
        currentId = ids.at(-1) || '';
      }

      setSelected(currentId);
    };

    const scheduleSelection = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateSelection);
    };

    updateSelection();
    window.addEventListener('scroll', scheduleSelection, { passive: true });
    window.addEventListener('resize', scheduleSelection);

    return () => {
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener('scroll', scheduleSelection);
      window.removeEventListener('resize', scheduleSelection);
    };
  }, []);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const reveal = (element: HTMLElement, animate: boolean) => {
      const id = element.dataset.contentId!;
      if (!seen.current.has(id)) {
        seen.current.add(id);
        element.dataset.seen = 'true';
        if (animate && !media.matches) element.dataset.animated = 'true';
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement, true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0,
        rootMargin:
          '0px 0px -' + Math.min(200, Math.round(innerHeight * 0.25)) + 'px 0px',
      },
    );
    document
      .querySelectorAll('[data-content-id]')
      .forEach((element) => observer.observe(element));
    const revealAll = () => {
      document.querySelectorAll<HTMLElement>('[data-content-id]').forEach((element) => {
        reveal(element, false);
        delete element.dataset.animated;
      });
    };
    const focus = (event: FocusEvent) => {
      if (navigating.current) return;
      const element = (event.target as Element).closest<HTMLElement>('[data-content-id]');
      if (element) {
        reveal(element, false);
        delete element.dataset.animated;
      }
    };
    const search = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f')
        revealAll();
    };
    const motion = () => {
      if (media.matches) revealAll();
    };
    motion();
    const historyMove = () => {
      const id = hashId(location.hash);
      if (id === null) return;
      document.getElementById(id || 'top')?.scrollIntoView({ behavior: 'instant' });
    };
    window.addEventListener('popstate', historyMove);
    window.addEventListener('hashchange', historyMove);
    window.addEventListener('beforeprint', revealAll);
    document.addEventListener('focusin', focus);
    window.addEventListener('keydown', search);
    media.addEventListener('change', motion);
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', historyMove);
      window.removeEventListener('hashchange', historyMove);
      window.removeEventListener('beforeprint', revealAll);
      document.removeEventListener('focusin', focus);
      window.removeEventListener('keydown', search);
      media.removeEventListener('change', motion);
    };
  }, []);
  return { selected, navigate, finishAnimation };
}
