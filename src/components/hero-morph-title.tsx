/* Apple-style word-by-word blur reveal. Each word is its own
 * inline-block span so the reveal keyframe lifts it from
 * opacity 0 + blur(8px) + 8px down to opacity 1 + blur(0) + 0.
 *
 * Pacing (intentional, per design):
 *   • Line 1 ("There are many assistants,") reveals *slowly* with a
 *     long per-word gap — sets the tone that this is a statement.
 *   • A deliberate pause follows the comma.
 *   • Line 2 ("but this one is yours.") reveals a touch quicker than
 *     Line 1 but still slower than a default stagger, so the turn
 *     lands with weight on "yours".
 *
 * Each word receives its own absolute `animation-delay` via inline
 * style so the pacing is explicit rather than computed from an index
 * × constant step.
 *
 * `prefers-reduced-motion: reduce` collapses everything to the final
 * state — handled in globals.css.
 */
import { Fragment, type CSSProperties } from "react";

const REVEAL_DURATION_MS = 900;

type Word = { text: string; delayMs: number; accent?: boolean; punct?: boolean };

// Line 1: brisk stagger. First word starts ~1.1s in (after the orb
// settles); subsequent words land ~140ms apart so the sentence reads
// as one quick phrase rather than a deliberate word-by-word reveal.
const LINE_ONE_START_MS = 1100;
const LINE_ONE_STEP_MS = 140;
const LINE_ONE: Word[] = [
  { text: "There", delayMs: LINE_ONE_START_MS + 0 * LINE_ONE_STEP_MS },
  { text: "are", delayMs: LINE_ONE_START_MS + 1 * LINE_ONE_STEP_MS },
  { text: "many", delayMs: LINE_ONE_START_MS + 2 * LINE_ONE_STEP_MS },
  { text: "assistants,", delayMs: LINE_ONE_START_MS + 3 * LINE_ONE_STEP_MS },
];

// Pause after the comma before the turn lands.
const LINE_ONE_END_MS =
  LINE_ONE_START_MS + 3 * LINE_ONE_STEP_MS + REVEAL_DURATION_MS;
const PAUSE_MS = 600;
const LINE_TWO_START_MS = LINE_ONE_END_MS + PAUSE_MS;

// Line 2: still slow, but tighter than line 1 so the turn picks up
// momentum and the accent word lands cleanly.
const LINE_TWO_STEP_MS = 220;
const LINE_TWO: Word[] = [
  { text: "but", delayMs: LINE_TWO_START_MS + 0 * LINE_TWO_STEP_MS },
  { text: "this", delayMs: LINE_TWO_START_MS + 1 * LINE_TWO_STEP_MS },
  { text: "one", delayMs: LINE_TWO_START_MS + 2 * LINE_TWO_STEP_MS },
  { text: "is", delayMs: LINE_TWO_START_MS + 3 * LINE_TWO_STEP_MS },
  {
    text: "yours",
    delayMs: LINE_TWO_START_MS + 4 * LINE_TWO_STEP_MS,
    accent: true,
  },
  {
    text: ".",
    delayMs: LINE_TWO_START_MS + 4 * LINE_TWO_STEP_MS,
    punct: true,
  },
];

function HeroPitchWords({
  words,
  keyPrefix,
}: {
  words: Word[];
  keyPrefix: string;
}) {
  return words.map((word, i) => {
    const needsLeadingSpace = i > 0 && !word.punct;
    const className = [
      "hero-pitch__word",
      word.accent ? "hero-pitch__accent" : null,
      word.punct ? "hero-pitch__word--punct" : null,
    ]
      .filter(Boolean)
      .join(" ");
    const style: CSSProperties = { animationDelay: `${word.delayMs}ms` };
    return (
      <Fragment key={`${keyPrefix}-${i}`}>
        {needsLeadingSpace ? " " : null}
        <span className={className} style={style}>
          {word.text}
        </span>
      </Fragment>
    );
  });
}

export function HeroMorphTitle() {
  return (
    <h1
      className="hero-pitch"
      aria-label="There are many assistants, but this one is yours."
    >
      <span className="hero-pitch__line" aria-hidden="true">
        <HeroPitchWords words={LINE_ONE} keyPrefix="a" />
      </span>
      <span className="hero-pitch__line" aria-hidden="true">
        <HeroPitchWords words={LINE_TWO} keyPrefix="b" />
      </span>
    </h1>
  );
}
