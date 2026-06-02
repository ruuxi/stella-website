/* Shared hero intro timing so the desktop-mock entrance can fire in lockstep
 * with the hero CTA ("The only app that reshapes itself around you." +
 * Download Stella). Keep these in sync with home-hero.tsx. */
export const REVEAL_DUR_MS = 900;
export const L1_START = 350;
export const L1_STEP = 115;
export const L1 = ["There", "are", "many", "assistants,"];
export const L1_LAST_START = L1_START + (L1.length - 1) * L1_STEP;
export const L2_PAUSE = 750;
export const L2_START = L1_LAST_START + L2_PAUSE;
export const L2 = ["but", "this", "one", "is"];

/* Gap before each bottom-row word, in order: the row starts quick then
   slows into the accent word. Gaps apply between consecutive items where
   item index L2.length is the accent word "yours":
   but → this → one → is → yours. */
const L2_GAPS = [175, 175, 400, 400];

/* Cumulative start offset (from L2_START) for word index `i` of the bottom
   row, where index L2.length is the accent word "yours". */
export function l2Delay(i: number): number {
  let delay = L2_START;
  for (let n = 0; n < i; n++) {
    delay += L2_GAPS[n] ?? L2_GAPS[L2_GAPS.length - 1];
  }
  return delay;
}

export const ACCENT_DELAY = l2Delay(L2.length);
/* The lede, download CTA, and desktop mock reveal in lockstep with the
   accent word "yours" rather than after it settles. */
export const CTA_DELAY = ACCENT_DELAY;
