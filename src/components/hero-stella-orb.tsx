"use client";

import { useEffect, useRef } from "react";
import {
  StellaAnimation,
  type StellaAnimationHandle,
} from "@/components/stella-animation/stella-animation";
import { useViewportActivity } from "@/components/use-viewport-activity";

const HATCH_START_PROGRESS = 0.22;
const HATCH_DELAY_MS = 280;

export function HeroStellaOrb() {
  const animationRef = useRef<StellaAnimationHandle | null>(null);
  const { ref, isActive } = useViewportActivity<HTMLDivElement>({
    rootMargin: "160px 0px",
  });

  useEffect(() => {
    const reduce =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
    if (reduce) {
      animationRef.current?.reset(1);
      return;
    }
    const id = window.setTimeout(() => {
      animationRef.current?.startBirth();
    }, HATCH_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div ref={ref} className="hero-orb-wrap" aria-hidden="true">
      <div className="hero-stella-orb">
        <StellaAnimation
          ref={animationRef}
          width={60}
          height={40}
          paused={!isActive}
          maxDpr={1.5}
          frameSkip={1}
          initialBirthProgress={HATCH_START_PROGRESS}
        />
      </div>
    </div>
  );
}
