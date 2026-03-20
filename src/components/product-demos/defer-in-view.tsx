"use client";

import { useEffect, useRef, useState } from "react";

type DeferInViewProps = {
  children: React.ReactNode;
  /** Extra viewport margin so chunks start loading shortly before scroll (default ~1 panel). */
  rootMargin?: string;
  fallback: React.ReactNode;
};

/**
 * Renders `fallback` until the sentinel intersects the viewport, then mounts `children`.
 * Use with `next/dynamic` so below-the-fold demo code splits and loads on demand.
 */
export function DeferInView({ children, rootMargin = "240px 0px", fallback }: DeferInViewProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const root = sentinelRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={sentinelRef} style={{ width: "100%", minWidth: 0 }}>
      {active ? children : fallback}
    </div>
  );
}
