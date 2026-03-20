"use client";

import { StellaAnimation } from "@/components/stella-animation/stella-animation";
import { useViewportActivity } from "@/components/use-viewport-activity";

export function HeroStellaOrb() {
  const { ref, isActive } = useViewportActivity<HTMLDivElement>({
    rootMargin: "160px 0px",
  });

  return (
    <div ref={ref} className="hero-orb-wrap reveal reveal-delay-1" aria-hidden="true">
      <div className="hero-orb-rings-outer" />
      <div className="hero-orb-rings" />
      <div className="hero-stella-orb">
        <StellaAnimation width={40} height={30} paused={!isActive} maxDpr={1.5} frameSkip={1} />
      </div>
    </div>
  );
}
