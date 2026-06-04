"use client";

import { Fragment } from "react";
import Image from "next/image";
import { DownloadButton } from "@/components/download-button";
/* Apple-style word-by-word blur reveal. Line 1 reads as a calm statement;
 * after a beat, line 2 lands with weight on the accent word "yours." When it
 * finishes, the headline lifts and the brand lockup drops in above it.
 * Timing lives in hero-timing.ts so the desktop-mock entrance can sync. */
import {
  ACCENT_DELAY,
  CTA_DELAY,
  L1,
  L1_START,
  L1_STEP,
  L2,
  l2Delay,
  SETTLE_DELAY,
} from "./hero-timing";
import styles from "./home-hero.module.css";

function RevealWords({
  words,
  delayFor,
}: {
  words: string[];
  delayFor: (i: number) => number;
}) {
  return words.map((word, i) => (
    <Fragment key={word + i}>
      {i > 0 ? " " : null}
      <span
        className={styles.word}
        style={{ animationDelay: `${delayFor(i)}ms` }}
      >
        {word}
      </span>
    </Fragment>
  ));
}

export function HomeHero() {
  return (
    <section className={styles.hero}>
      <div
        className={styles.brand}
        style={{ animationDelay: `${SETTLE_DELAY}ms` }}
      >
        <Image
          className={styles.brandLogo}
          src="/stella-logo.svg"
          alt=""
          width={48}
          height={48}
          priority
        />
        <span className={styles.brandText}>Stella</span>
      </div>

      <h1
        className={styles.title}
        style={{ animationDelay: `${SETTLE_DELAY}ms` }}
        aria-label="There are many assistants, but this one is yours."
      >
        <span className={styles.line} aria-hidden="true">
          <RevealWords words={L1} delayFor={(i) => L1_START + i * L1_STEP} />
        </span>
        {" "}
        <span className={styles.line} aria-hidden="true">
          <RevealWords words={L2} delayFor={l2Delay} />{" "}
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
