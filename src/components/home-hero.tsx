"use client";

import { AuroraCanvas } from "./aurora-canvas";
import { DownloadButton } from "./download-button";
import styles from "./home-hero.module.css";

/* Editorial hero ported from the fromyou-ai landing page: a single
 * left-aligned content block (headline, body, download) sitting on an aurora
 * that pours in from the right. The whole block reveals together on landing
 * (a soft blur + rise) in lockstep with the desktop mock below. */
export function HomeHero() {
  return (
    <main className={styles.hero} aria-labelledby="hero-title">
      <AuroraCanvas className={styles.aurora} />
      <AuroraCanvas className={`${styles.aurora} ${styles.auroraReverse}`} />

      <section className={styles.inner}>
        <div className={styles.content}>
          <h1 id="hero-title" className={styles.title}>
            Stella, the app that <span className={styles.accent}>changes.</span>
          </h1>

          <p className={styles.intro}>
            Your system, your computer, your rules. Everything can change to fit
            the way you work, and everything stays private.
          </p>

          <div className={styles.cta}>
            <DownloadButton />
          </div>
        </div>
      </section>
    </main>
  );
}
