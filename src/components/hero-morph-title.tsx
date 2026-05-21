/* Apple-style word-by-word blur reveal. The sentence is split into
 * individual word spans, each given a stagger index via a CSS custom
 * property. The reveal keyframe lifts them from opacity 0 + blur(8px)
 * + 8px down to opacity 1 + blur(0) + 0, easing out softly.
 *
 * Timing lines up with `hero-stella-orb.tsx`: the orb starts its
 * grow-in at ~280ms and finishes around 1300ms. The first word
 * begins at `--hero-reveal-base` (1.1s) and each subsequent word
 * follows by `--hero-reveal-step` (90ms), so the line lands as the
 * orb settles instead of fighting it for attention.
 *
 * `prefers-reduced-motion: reduce` collapses everything to the final
 * state — no movement, no blur — and is handled in globals.css.
 */
const LINE_ONE = ["There", "are", "many", "assistants,"];
const LINE_TWO_BEFORE = ["but", "this", "one", "is"];
const ACCENT_WORD = "yours";

export function HeroMorphTitle() {
  const totalBefore =
    LINE_ONE.length + LINE_TWO_BEFORE.length; // index where the accent word lands

  return (
    <h1 className="hero-pitch" aria-label="There are many assistants, but this one is yours.">
      <span className="hero-pitch__line" aria-hidden="true">
        {LINE_ONE.map((word, i) => (
          <span
            key={`a-${i}`}
            className="hero-pitch__word"
            style={{ ["--i" as string]: i }}
          >
            {word}
          </span>
        ))}
      </span>
      <span className="hero-pitch__line" aria-hidden="true">
        {LINE_TWO_BEFORE.map((word, i) => (
          <span
            key={`b-${i}`}
            className="hero-pitch__word"
            style={{ ["--i" as string]: LINE_ONE.length + i }}
          >
            {word}
          </span>
        ))}
        <span
          className="hero-pitch__word hero-pitch__accent"
          style={{ ["--i" as string]: totalBefore }}
        >
          {ACCENT_WORD}
        </span>
        <span
          className="hero-pitch__word hero-pitch__word--punct"
          style={{ ["--i" as string]: totalBefore }}
        >
          .
        </span>
      </span>
    </h1>
  );
}
