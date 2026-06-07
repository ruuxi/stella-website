/**
 * Inline script that runs before first paint to tag low-power / reduced-motion
 * devices with `data-low-power` on `<html>`. CSS uses this to drop the most
 * expensive continuous work (scroll-reveal blur transitions, infinite
 * marketing-mock animations, heavy backdrop-filters) on machines that can't
 * keep up — eliminating scroll jank without a flash of the full-fat animation
 * before React mounts.
 *
 * The heuristic here mirrors `isLowPowerDevice()` in `lib/device-perf.ts`;
 * keep the two in sync. WebGL capability is probed separately inside the aurora
 * component (creating a GL context here would block paint).
 */
const PERF_INIT_SCRIPT = /* javascript */ `
(() => {
  try {
    var html = document.documentElement;
    var n = navigator;
    var cores = typeof n.hardwareConcurrency === 'number' ? n.hardwareConcurrency : 0;
    var mem = typeof n.deviceMemory === 'number' ? n.deviceMemory : 0;
    var reduce = false;
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {}
    var lowPower = reduce ||
      (cores > 0 && cores <= 4) ||
      (mem > 0 && mem <= 4);
    if (lowPower) html.setAttribute('data-low-power', 'true');
  } catch (e) {}
})();
`;

export function PerfInitScript() {
  return (
    <script
      // Synchronous, blocking inline script so the low-power class is present
      // before the body paints any animated content.
      dangerouslySetInnerHTML={{ __html: PERF_INIT_SCRIPT }}
    />
  );
}
