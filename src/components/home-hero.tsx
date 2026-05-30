"use client";

import { Fragment, useEffect, useRef } from "react";
import { DownloadButton } from "@/components/download-button";
import {
  StellaAnimation,
  type StellaAnimationHandle,
} from "@/components/stella-animation/stella-animation";
/* Apple-style word-by-word blur reveal. Line 1 reads as a calm statement;
 * after a beat, line 2 lands with weight on the accent word "yours."
 * Timing lives in hero-timing.ts so the desktop-mock entrance can sync. */
import {
  ACCENT_DELAY,
  CTA_DELAY,
  L1,
  L1_START,
  L1_STEP,
  L2,
  L2_START,
  L2_STEP,
} from "./hero-timing";
import styles from "./home-hero.module.css";

function RevealWords({
  words,
  start,
  step,
}: {
  words: string[];
  start: number;
  step: number;
}) {
  return words.map((word, i) => (
    <Fragment key={word + i}>
      {i > 0 ? " " : null}
      <span
        className={styles.word}
        style={{ animationDelay: `${start + i * step}ms` }}
      >
        {word}
      </span>
    </Fragment>
  ));
}

export function HomeHero() {
  const orbRef = useRef<StellaAnimationHandle | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      orbRef.current?.reset(1);
      return;
    }
    const id = window.setTimeout(() => orbRef.current?.startBirth(), 2000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.orb} aria-hidden="true">
        <StellaAnimation
          ref={orbRef}
          width={26}
          height={17}
          maxDpr={1.5}
          frameSkip={1}
          initialBirthProgress={0.22}
        />
      </div>

      <h1
        className={styles.title}
        aria-label="There are many assistants, but this one is yours."
      >
        <span className={styles.line} aria-hidden="true">
          <RevealWords words={L1} start={L1_START} step={L1_STEP} />
        </span>
        {" "}
        <span className={styles.line} aria-hidden="true">
          <RevealWords words={L2} start={L2_START} step={L2_STEP} />{" "}
          <span
            className={`${styles.word} ${styles.accent}`}
            style={{ animationDelay: `${ACCENT_DELAY}ms` }}
          >
            yours
          </span>
          <span
            className={`${styles.word} ${styles.punct}`}
            style={{ animationDelay: `${ACCENT_DELAY}ms` }}
          >
            .
          </span>
        </span>
      </h1>

      <div className={styles.followUp} style={{ animationDelay: `${CTA_DELAY}ms` }}>
        <p className={styles.lede}>The only app that reshapes itself around you.</p>

        <div className={styles.cta}>
          <DownloadButton />
        </div>
      </div>
    </section>
  );
}
