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

type WebGLProbe = {
  tier: WebGLTier;
  /**
   * Whether the fragment stage genuinely supports full-precision `highp`
   * float. The aurora's FBM noise hash (`fract(p * 123.34)` style math)
   * needs true 32-bit precision; weaker iGPUs (notably older Intel on
   * Windows) report reduced highp and render the shader garbled/banded.
   */
  reliableHighp: boolean;
};

let cachedProbe: WebGLProbe | undefined;
let cachedLowPower: boolean | undefined;

function probeWebGL(): WebGLProbe {
  if (cachedProbe !== undefined) return cachedProbe;
  if (typeof window === "undefined") {
    return { tier: "none", reliableHighp: false };
  }

  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext(
        "experimental-webgl",
      )) as WebGLRenderingContext | null;
    if (!gl) {
      cachedProbe = { tier: "none", reliableHighp: false };
      return cachedProbe;
    }

    let renderer = "";
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    if (debug) {
      renderer = String(
        gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) || "",
      ).toLowerCase();
    }

    // True IEEE-ish highp reports 23 bits of mantissa precision and a range
    // exponent of 127. Anything less means the noise hash will band/garble.
    const fmt = gl.getShaderPrecisionFormat?.(
      gl.FRAGMENT_SHADER,
      gl.HIGH_FLOAT,
    );
    const reliableHighp =
      !!fmt && fmt.precision >= 23 && fmt.rangeMax >= 127;

    // Release the probe context immediately so we don't hold a GPU/context slot.
    gl.getExtension("WEBGL_lose_context")?.loseContext();

    const isSoftware =
      renderer.length > 0 &&
      (renderer.includes("swiftshader") ||
        renderer.includes("llvmpipe") ||
        renderer.includes("software") ||
        renderer.includes("basic render") ||
        renderer.includes("microsoft basic"));

    cachedProbe = {
      tier: isSoftware ? "software" : "hardware",
      reliableHighp,
    };
    return cachedProbe;
  } catch {
    cachedProbe = { tier: "none", reliableHighp: false };
    return cachedProbe;
  }
}

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
  return probeWebGL().tier;
}

/**
 * Whether the fragment stage can run the aurora's precision-sensitive noise
 * shader without garbling. False on iGPUs with marginal `highp` support.
 */
export function hasReliableHighpFragment(): boolean {
  return probeWebGL().reliableHighp;
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
 * Whether the animated WebGL aurora should run. Requires a real GPU with
 * genuine highp fragment precision (else the noise shader garbles — common on
 * older Intel iGPUs) and a device that isn't memory/CPU starved. Reduced-motion
 * is honored separately by the aurora (it renders a still frame).
 */
export function shouldRunAuroraShader(): boolean {
  return (
    getWebGLTier() === "hardware" &&
    hasReliableHighpFragment() &&
    !isLowPowerDevice()
  );
}
