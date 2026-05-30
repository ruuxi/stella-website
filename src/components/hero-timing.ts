/* Shared hero intro timing so the desktop-mock entrance can fire in lockstep
 * with the hero CTA ("The only app that reshapes itself around you." +
 * Download Stella). Keep these in sync with home-hero.tsx. */
export const REVEAL_DUR_MS = 900;
export const L1_START = 350;
export const L1_STEP = 145;
export const L1 = ["There", "are", "many", "assistants,"];
export const L1_LAST_START = L1_START + (L1.length - 1) * L1_STEP;
export const L2_PAUSE = 750;
export const L2_START = L1_LAST_START + L2_PAUSE;
export const L2_STEP = 200;
export const L2 = ["but", "this", "one", "is"];
export const ACCENT_DELAY = L2_START + L2.length * L2_STEP;
export const CTA_DELAY = ACCENT_DELAY + REVEAL_DUR_MS + 160;
