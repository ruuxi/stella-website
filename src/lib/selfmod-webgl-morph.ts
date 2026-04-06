/**
 * WebGL self-mod morph — mirrors the desktop onboarding morph in
 * `src/shell/overlay/MorphTransition.tsx` when the marketing site cannot use the
 * Electron overlay + IPC path directly.
 */
const ONBOARDING_MORPH_COVER_RAMP_MS = 600;
const ONBOARDING_MORPH_REVERSE_MS = 800;
const ONBOARDING_MORPH_STEADY_STRENGTH = 0.65;

/**
 * Post-swap settle: the website uses CSS transitions (500ms) on stage-change
 * properties, unlike the desktop which swaps entire React components atomically.
 * Wait for those transitions to finish before capturing the "after" screenshot.
 */
const POST_SWAP_SETTLE_MS = 550;

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform sampler2D u_tex;
uniform sampler2D u_tex2;
uniform float u_mix;
uniform float u_strength;
uniform float u_alpha;
uniform float u_time;
uniform float u_aspect;
uniform vec2 u_center;
varying vec2 v_uv;

void main() {
  vec2 d = v_uv - u_center;
  d.x *= u_aspect;
  float dist = length(d);

  // Concentric rings expanding outward from center.
  float phase = dist * 28.0 - u_time * 6.0;
  float ripple = sin(phase);

  // Soft second harmonic for texture — same speed so rings stay concentric.
  ripple += sin(phase * 2.0 + 0.5) * 0.3;

  // Damping: rings lose energy as they travel outward.
  float damping = exp(-dist * 4.0);
  float envelope = smoothstep(0.0, 0.06, dist) * (1.0 - smoothstep(0.7, 1.0, dist));
  ripple *= envelope * damping;

  // Wave slope drives chromatic split direction.
  float dRipple = cos(phase) * 28.0 + cos(phase * 2.0 + 0.5) * 0.3 * 56.0;
  dRipple *= envelope;

  // Gentle UV displacement.
  float displaceAmp = u_strength * 0.002;
  vec2 radial = d / (dist + 0.0001);
  radial.x /= u_aspect;
  vec2 uv = v_uv + radial * ripple * displaceAmp;

  // Chromatic aberration — 3-way split along radial direction.
  float chromAmt = u_strength * 0.011;
  float slopeNorm = sign(dRipple) * min(abs(dRipple) / 30.0, 1.0);
  float chromBase = chromAmt * (0.5 + 0.5 * abs(slopeNorm));

  vec2 rOff = radial * chromBase;
  vec2 bOff = radial * -chromBase;
  vec2 gOff = radial * chromBase * 0.3 * slopeNorm;

  float r1 = texture2D(u_tex, clamp(uv + rOff, 0.0, 1.0)).r;
  float g1 = texture2D(u_tex, clamp(uv + gOff, 0.0, 1.0)).g;
  float b1 = texture2D(u_tex, clamp(uv + bOff, 0.0, 1.0)).b;

  float r2 = texture2D(u_tex2, clamp(uv + rOff, 0.0, 1.0)).r;
  float g2 = texture2D(u_tex2, clamp(uv + gOff, 0.0, 1.0)).g;
  float b2 = texture2D(u_tex2, clamp(uv + bOff, 0.0, 1.0)).b;

  vec3 col = mix(vec3(r1, g1, b1), vec3(r2, g2, b2), u_mix);

  gl_FragColor = vec4(col, u_alpha);
}`;

type GLContext = {
  gl: WebGLRenderingContext;
  prog: WebGLProgram;
  vs: WebGLShader;
  fs: WebGLShader;
  buf: WebGLBuffer;
  tex: WebGLTexture;
  tex2: WebGLTexture;
  strengthLoc: WebGLUniformLocation | null;
  timeLoc: WebGLUniformLocation | null;
  mixLoc: WebGLUniformLocation | null;
  alphaLoc: WebGLUniformLocation | null;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function initGL(canvas: HTMLCanvasElement, img: HTMLImageElement): GLContext | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
  });
  if (!gl) return null;

  canvas.width = img.width;
  canvas.height = img.height;
  gl.viewport(0, 0, img.width, img.height);

  const createShader = (type: number, src: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  };

  const vs = createShader(gl.VERTEX_SHADER, VERT);
  const fs = createShader(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const setupTexture = (unit: number) => {
    const texture = gl.createTexture()!;
    gl.activeTexture(unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return texture;
  };

  const tex = setupTexture(gl.TEXTURE0);
  const tex2 = setupTexture(gl.TEXTURE1);

  gl.uniform1i(gl.getUniformLocation(prog, "u_tex"), 0);
  gl.uniform1i(gl.getUniformLocation(prog, "u_tex2"), 1);
  gl.uniform1f(gl.getUniformLocation(prog, "u_mix"), 0.0);
  gl.uniform1f(gl.getUniformLocation(prog, "u_alpha"), 1.0);
  gl.uniform2f(gl.getUniformLocation(prog, "u_center"), 0.5, 0.5);
  gl.uniform1f(gl.getUniformLocation(prog, "u_aspect"), img.width / img.height);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  return {
    gl,
    prog,
    vs,
    fs,
    buf,
    tex,
    tex2,
    strengthLoc: gl.getUniformLocation(prog, "u_strength"),
    timeLoc: gl.getUniformLocation(prog, "u_time"),
    mixLoc: gl.getUniformLocation(prog, "u_mix"),
    alphaLoc: gl.getUniformLocation(prog, "u_alpha"),
  };
}

function loadSecondTexture(ctx: GLContext, img: HTMLImageElement) {
  const { gl, tex2, prog } = ctx;
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, tex2);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  if (img.width !== gl.canvas.width || img.height !== gl.canvas.height) {
    (gl.canvas as HTMLCanvasElement).width = img.width;
    (gl.canvas as HTMLCanvasElement).height = img.height;
    gl.viewport(0, 0, img.width, img.height);
    gl.uniform1f(gl.getUniformLocation(prog, "u_aspect"), img.width / img.height);
  }
  gl.activeTexture(gl.TEXTURE0);
}

function cleanupGL(ctx: GLContext) {
  const { gl, tex, tex2, buf, prog, vs, fs } = ctx;
  gl.deleteTexture(tex);
  gl.deleteTexture(tex2);
  gl.deleteBuffer(buf);
  gl.deleteProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
}

function startRenderLoop(
  ctx: GLContext,
  strengthRef: { current: number },
  mixRef: { current: number },
  alphaRef: { current: number },
  startTime: number,
  onFirstFrame?: () => void,
): () => void {
  let running = true;
  let firstFramePainted = false;
  const { gl, strengthLoc, timeLoc, mixLoc, alphaLoc } = ctx;

  const frame = (now: number) => {
    if (!running) return;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(strengthLoc, strengthRef.current);
    gl.uniform1f(timeLoc, (now - startTime) / 1000);
    gl.uniform1f(mixLoc, mixRef.current);
    gl.uniform1f(alphaLoc, alphaRef.current);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!firstFramePainted) {
      firstFramePainted = true;
      onFirstFrame?.();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  return () => {
    running = false;
  };
}

function tweenRef(ref: { current: number }, to: number, duration: number): Promise<void> {
  return new Promise((resolve) => {
    const from = ref.current;
    const start = performance.now();
    const step = () => {
      const t = Math.min((performance.now() - start) / duration, 1);
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
      ref.current = from + (to - from) * eased;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

function pngOpts(excludeCanvas: HTMLCanvasElement) {
  return {
    cacheBust: true,
    pixelRatio: typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1,
    filter: (node: Node) => node !== excludeCanvas,
  } as const;
}

export function isWebglMorphSupported(): boolean {
  if (typeof document === "undefined") return false;
  const c = document.createElement("canvas");
  return !!c.getContext("webgl", { alpha: true, premultipliedAlpha: false });
}

/**
 * Ripple + crossfade between two DOM snapshots of `captureEl`, mirroring
 * desktop overlay forward (cover) + reverse (crossfade / calm) phases.
 */
export async function runSelfmodWebglMorph(options: {
  captureEl: HTMLElement;
  canvas: HTMLCanvasElement;
  swap: () => void;
}): Promise<boolean> {
  const { captureEl, canvas, swap } = options;
  let ctx: GLContext | null = null;
  let stopLoop: (() => void) | null = null;
  const strengthRef = { current: 0 };
  const mixRef = { current: 0 };
  const alphaRef = { current: 1 };

  try {
    const rect = captureEl.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return false;

    const { toPng } = await import("html-to-image");

    // Position the canvas over `captureEl` but keep it invisible until the
    // first GL frame paints so there is no black flash.
    Object.assign(canvas.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "100%",
      height: "100%",
      zIndex: "40",
      pointerEvents: "none",
      opacity: "0",
      visibility: "visible",
    });

    const beforeDataUrl = await toPng(captureEl, pngOpts(canvas));
    const imgBefore = await loadImage(beforeDataUrl);

    ctx = initGL(canvas, imgBefore);
    if (!ctx) return false;

    const loopStart = performance.now();
    stopLoop = startRenderLoop(ctx, strengthRef, mixRef, alphaRef, loopStart, () => {
      canvas.style.opacity = "1";
    });

    await tweenRef(
      strengthRef,
      ONBOARDING_MORPH_STEADY_STRENGTH,
      ONBOARDING_MORPH_COVER_RAMP_MS,
    );

    swap();

    // The website uses CSS transitions (500ms) when `data-stage` changes,
    // unlike the desktop which swaps whole components atomically.  Wait for
    // transitions to finish so the "after" capture shows the final state.
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => setTimeout(r, POST_SWAP_SETTLE_MS));

    const afterDataUrl = await toPng(captureEl, pngOpts(canvas));
    const imgAfter = await loadImage(afterDataUrl);

    loadSecondTexture(ctx, imgAfter);
    await Promise.all([
      tweenRef(mixRef, 1.0, ONBOARDING_MORPH_REVERSE_MS),
      tweenRef(strengthRef, 0, ONBOARDING_MORPH_REVERSE_MS),
    ]);
  } catch {
    return false;
  } finally {
    stopLoop?.();
    if (ctx) cleanupGL(ctx);
    canvas.style.cssText = "";
  }

  return true;
}
