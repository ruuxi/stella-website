/**
 * Client-side device capability checks, used to scale back GPU/CPU-heavy
 * decorative effects (the hero aurora shader, scroll-reveal blur, infinite
 * marketing-mock animations) on low-end or GPU-less machines.
 *
 * Everything here is memoized and SSR-safe (returns conservative defaults on
 * the server). The cheap heuristics are mirrored by the inline `PerfInitScript`
 * so `<html data-low-power>` is set before first paint; this module is the
 * source of truth for components that need the WebGL tier too.
 */

export type WebGLTier = "hardware" | "software" | "none";

let cachedTier: WebGLTier | undefined;
let cachedLowPower: boolean | undefined;

/**
 * Probe for a usable, hardware-accelerated WebGL context.
 *
 * - `"none"`    — no WebGL at all (context creation failed).
 * - `"software"`— a software rasterizer (SwiftShader / llvmpipe / etc.). These
 *                 technically run, but the aurora's 4-octave FBM shader crawls
 *                 at a few fps, so we treat them like "no GPU".
 * - `"hardware"`— a real GPU, or an unknown renderer (some browsers hide the
 *                 renderer string for privacy — we don't penalize those).
 */
export function getWebGLTier(): WebGLTier {
  if (cachedTier !== undefined) return cachedTier;
  if (typeof window === "undefined") return "none";

  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext(
        "experimental-webgl",
      )) as WebGLRenderingContext | null;
    if (!gl) {
      cachedTier = "none";
      return cachedTier;
    }

    let renderer = "";
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    if (debug) {
      renderer = String(
        gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) || "",
      ).toLowerCase();
    }

    // Release the probe context immediately so we don't hold a GPU/context slot.
    gl.getExtension("WEBGL_lose_context")?.loseContext();

    const isSoftware =
      renderer.length > 0 &&
      (renderer.includes("swiftshader") ||
        renderer.includes("llvmpipe") ||
        renderer.includes("software") ||
        renderer.includes("basic render") ||
        renderer.includes("microsoft basic"));

    cachedTier = isSoftware ? "software" : "hardware";
    return cachedTier;
  } catch {
    cachedTier = "none";
    return cachedTier;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Cheap, allocation-free heuristic for a memory/CPU-constrained device. Kept in
 * sync with the inline `PerfInitScript`. Conservative on purpose: 8-core / 8GB+
 * machines keep the full experience; only genuinely small devices opt out.
 */
export function isLowPowerDevice(): boolean {
  if (cachedLowPower !== undefined) return cachedLowPower;
  if (typeof navigator === "undefined") return false;

  const cores =
    typeof navigator.hardwareConcurrency === "number"
      ? navigator.hardwareConcurrency
      : 0;
  const memory =
    typeof (navigator as { deviceMemory?: number }).deviceMemory === "number"
      ? (navigator as { deviceMemory?: number }).deviceMemory!
      : 0;

  cachedLowPower =
    (cores > 0 && cores <= 4) || (memory > 0 && memory <= 4);
  return cachedLowPower;
}

/**
 * Whether the animated WebGL aurora should run. Requires a real GPU and a
 * device that isn't memory/CPU starved, and respects reduced-motion (which the
 * aurora honors separately by rendering a still frame).
 */
export function shouldRunAuroraShader(): boolean {
  return getWebGLTier() === "hardware" && !isLowPowerDevice();
}
