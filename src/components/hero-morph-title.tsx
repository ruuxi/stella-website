"use client";

import { useEffect, useState } from "react";
import { useViewportActivity } from "@/components/use-viewport-activity";

const PHRASES = [
  "changes itself.",
  "plans your week.",
  "becomes a tutor.",
  "edits your photos.",
  "remembers it all.",
] as const;

const HOLD_MS = 3200;

const WIDEST_PHRASE = PHRASES.reduce((a, b) => (b.length > a.length ? b : a));

function getReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HeroMorphTitle() {
  const { ref, isActive } = useViewportActivity<HTMLHeadingElement>({
    rootMargin: "0px",
  });
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(getReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isActive || reducedMotion) return;
    const timer = window.setTimeout(
      () => setIndex((current) => (current + 1) % PHRASES.length),
      HOLD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [index, isActive, reducedMotion]);

  return (
    <h1 ref={ref} aria-label={`An app that ${PHRASES[0]}`}>
      <span aria-hidden="true">
        An app that<br />
        <span className="hero-title__morph">
          <span className="hero-title__ghost">{WIDEST_PHRASE}</span>
          <span key={index} className="hero-title__phrase">
            {PHRASES[index]}
          </span>
        </span>
      </span>
    </h1>
  );
}
