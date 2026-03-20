"use client";

import dynamic from "next/dynamic";

export const HeroStellaOrb = dynamic(
  () => import("./hero-stella-orb").then((m) => ({ default: m.HeroStellaOrb })),
  {
    ssr: false,
    loading: () => (
      <div className="hero-orb-wrap reveal reveal-delay-1" aria-hidden="true">
        <div className="hero-orb-rings-outer" />
        <div className="hero-orb-rings" />
        <div className="hero-stella-orb" />
      </div>
    ),
  },
);
