"use client";

import { useEffect } from "react";

/**
 * Mounts once per page. Adds `html.has-reveal` to opt the page into the
 * scroll-triggered reveal styles, then watches every `[data-reveal]`
 * element with an IntersectionObserver, applying `is-revealed` once the
 * element enters the viewport.
 *
 * Gated behind a class on <html> so server-rendered HTML stays visible
 * for users without JS or with `prefers-reduced-motion: reduce`.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) return;

    root.classList.add("has-reveal");

    const observed = new WeakSet<Element>();

    // We toggle a non-React attribute (`data-revealed`) rather than a
    // className so we never collide with React's hydration of dynamically
    // imported sections. The CSS selector is `[data-reveal][data-revealed]`.
    const reveal = (el: Element) => el.setAttribute("data-revealed", "");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      },
    );

    const observeAll = () => {
      const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
      nodes.forEach((node) => {
        if (observed.has(node)) return;
        observed.add(node);

        // Anything already well into view at mount (e.g. on a deep refresh
        // or a back/forward restore) should reveal immediately, with no
        // transition flash.
        const rect = node.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
        if (inView) {
          reveal(node);
          return;
        }

        observer.observe(node);
      });
    };

    observeAll();

    // Watch for any sections rendered after hydration (dynamic imports, etc).
    const mutation = new MutationObserver(() => observeAll());
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
      root.classList.remove("has-reveal");
    };
  }, []);

  return null;
}
