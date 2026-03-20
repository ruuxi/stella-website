"use client";

import { StellaAnimation } from "@/components/stella-animation/stella-animation";

export function HeroStellaOrb() {
  return (
    <div className="hero-orb-wrap reveal reveal-delay-1" aria-hidden="true">
      <div className="hero-orb-rings-outer" />
      <div className="hero-orb-rings" />
      <div className="hero-stella-orb">
        <StellaAnimation width={40} height={30} />
      </div>
    </div>
  );
}
