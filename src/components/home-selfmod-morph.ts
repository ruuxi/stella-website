/**
 * Self-mod blur/glimm morph — a standalone web port of Stella desktop's
 * `MorphTransition` (desktop/src/shell/overlay/MorphTransition.tsx).
 *
 * Same current desktop look: the old capture frosts, then a left-to-right
 * glimm band sweeps across the surface, revealing the sharp new capture behind
 * it. The desktop uses live screenshots before/after HMR; here we use the
 * already-available persona composites as those two textures.
 */

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
uniform float u_strength;
uniform float u_reveal;
uniform float u_time;
uniform float u_aspect;
varying vec2 v_uv;

const int BLUR_TAPS = 48;
const float TWO_PI = 6.28318530718;
const float GOLDEN_ANGLE = 2.39996323;
const float BAND_WIDTH = 16.0;
const float WAVE_AMOUNT = 1.0;
const float SWELL_AMOUNT = 0.8;
const float SAT_BOOST = 1.8;

float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

vec3 frostedSample(sampler2D tex, vec2 uv, float radius, float rot) {
  if (radius < 0.0006) {
    return texture2D(tex, uv).rgb;
  }
  vec3 acc = vec3(0.0);
  float wsum = 0.0;
  for (int i = 0; i < BLUR_TAPS; i++) {
    float fi = float(i) + 0.5;
    float t = fi / float(BLUR_TAPS);
    float r = sqrt(t) * radius;
    float a = fi * GOLDEN_ANGLE + rot;
    vec2 off = vec2(cos(a) / u_aspect, sin(a)) * r;
    float w = exp(-2.2 * t);
    acc += texture2D(tex, clamp(uv + off, 0.0, 1.0)).rgb * w;
    wsum += w;
  }
  return acc / wsum;
}

void main() {
  float rot = ign(gl_FragCoord.xy) * TWO_PI;
  vec3 frostedOld = frostedSample(u_tex, v_uv, u_strength * 0.04, rot);
  vec3 sharpNew = texture2D(u_tex2, v_uv).rgb;

  float axis = v_uv.x;
  float crossAxis = v_uv.y;
  float pos = mix(-0.2, 1.2, u_reveal);

  float feather = 0.05;
  float revealed = 1.0 - smoothstep(pos - feather, pos + feather, axis);
  vec3 base = mix(frostedOld, sharpNew, revealed);

  float tw = u_time;
  float waveX =
      sin(crossAxis * 6.0 + tw * 1.3) * 0.020
    + sin(crossAxis * 13.0 - tw * 0.9 + 1.4) * 0.012
    + sin(crossAxis * 21.0 + tw * 1.7 + 2.6) * 0.006;
  waveX *= WAVE_AMOUNT;

  float bandTight = 140.0 / BAND_WIDTH;
  float d = (axis - pos) - waveX;
  float band = exp(-d * d * bandTight);

  float dhDaxis = -2.0 * d * bandTight * band;
  vec3 N = normalize(vec3(-dhDaxis * 0.18, 0.0, 1.0));

  float trail = clamp(0.5 - d * 1.3, 0.0, 1.0);
  trail = pow(trail, 2.5) * 0.24;
  float lensBand = pow(band, 0.7);
  float intensity = max(lensBand * 0.55, trail);

  float vfade =
    smoothstep(0.0, 0.015, crossAxis) * smoothstep(1.0, 0.985, crossAxis);

  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 L = normalize(vec3(0.35, 0.55, 0.9));
  vec3 H = normalize(L + V);
  float NdotH = clamp(dot(N, H), 0.0, 1.0);
  float NdotV = clamp(dot(N, V), 0.0, 1.0);
  float fresnel = pow(1.0 - NdotV, 3.0);
  float spec = pow(NdotH, 80.0);

  float entryFade = mix(0.2, 1.0, 4.0 * u_reveal * (1.0 - u_reveal));
  float gate = smoothstep(0.0, 0.04, u_reveal) * smoothstep(1.0, 0.96, u_reveal);

  float lensMix = clamp(intensity * vfade * entryFade * gate, 0.0, 1.0);
  float luma = dot(base, vec3(0.299, 0.587, 0.114));
  vec3 vivid = clamp(mix(vec3(luma), base, SAT_BOOST), 0.0, 1.0);
  vivid = clamp((vivid - 0.5) * 1.06 + 0.5, 0.0, 1.0);
  vivid *= (1.0 + 0.05 * intensity);
  vec3 outRGB = mix(base, vivid, lensMix);

  float highMask = band * vfade * entryFade * gate * SWELL_AMOUNT;
  outRGB += (vec3(spec) * 0.9 + vivid * fresnel * 0.25) * highMask;
  outRGB = clamp(outRGB, 0.0, 1.0);

  gl_FragColor = vec4(outRGB, 1.0);
}`;

const STEADY_STRENGTH = 0.65;
const COVER_RAMP_MS = 320;
const HANDOFF_FADE_MS = 1100;

type EaseFn = (t: number) => number;

const easeInOutCosine: EaseFn = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
const easeOutCubic: EaseFn = (t) => 1 - Math.pow(1 - t, 3);

// CSS-style cubic-bezier(P1,P2), ported from desktop MorphTransition.
const cubicBezier = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): EaseFn => {
  const bezX = (t: number) =>
    3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
  const bezY = (t: number) =>
    3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  const bezXd = (t: number) =>
    3 * (1 - 4 * t + 3 * t * t) * x1 +
    3 * (2 * t - 3 * t * t) * x2 +
    3 * t * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = bezX(t) - x;
      if (Math.abs(dx) < 1e-6) break;
      const d = bezXd(t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    return bezY(t);
  };
};

// glimm's "snap" sweep curve: holds at the start, then whips forward.
const bandSweepEase: EaseFn = cubicBezier(1, 0, 0.35, 0.95);

function compile(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return sh;
}

function makeTexture(gl: WebGLRenderingContext): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

export type MorphEngine = {
  /** Upload a composite as the current (idle) view and paint it. */
  show: (img: TexImageSource) => void;
  /** Frost + glimm-sweep from the current view to `next`. */
  morphTo: (next: TexImageSource, reducedMotion: boolean) => Promise<void>;
  dispose: () => void;
};

export function createMorphEngine(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): MorphEngine | null {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    premultipliedAlpha: false,
    antialias: false,
  });
  if (!gl) return null;

  canvas.width = width;
  canvas.height = height;
  gl.viewport(0, 0, width, height);

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const posLoc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  const tex0 = makeTexture(gl);
  gl.activeTexture(gl.TEXTURE1);
  const tex1 = makeTexture(gl);

  const uTex = gl.getUniformLocation(prog, "u_tex");
  const uTex2 = gl.getUniformLocation(prog, "u_tex2");
  const uStrength = gl.getUniformLocation(prog, "u_strength");
  const uReveal = gl.getUniformLocation(prog, "u_reveal");
  const uTime = gl.getUniformLocation(prog, "u_time");
  const uAspect = gl.getUniformLocation(prog, "u_aspect");

  gl.uniform1i(uTex, 0);
  gl.uniform1i(uTex2, 1);
  gl.uniform1f(uAspect, width / height);
  gl.uniform1f(uStrength, 0);
  gl.uniform1f(uReveal, 0);
  gl.uniform1f(uTime, 0);

  const upload = (unit: number, tex: WebGLTexture, img: TexImageSource) => {
    gl.activeTexture(unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  };

  let strength = 0;
  let reveal = 0;
  let time = 0;
  let disposed = false;

  const draw = () => {
    gl.uniform1f(uStrength, strength);
    gl.uniform1f(uReveal, reveal);
    gl.uniform1f(uTime, time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const tween = (
    set: (v: number) => void,
    from: number,
    to: number,
    durationMs: number,
    onFrame: () => void,
    ease: EaseFn = easeInOutCosine,
  ): Promise<void> =>
    new Promise((resolve) => {
      const start = performance.now();
      const step = () => {
        if (disposed) return resolve();
        const t = Math.min((performance.now() - start) / durationMs, 1);
        set(from + (to - from) * ease(t));
        onFrame();
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

  const show: MorphEngine["show"] = (img) => {
    if (disposed) return;
    upload(gl.TEXTURE0, tex0, img);
    strength = 0;
    reveal = 0;
    time = 0;
    draw();
  };

  const morphTo: MorphEngine["morphTo"] = async (next, reducedMotion) => {
    if (disposed) return;
    upload(gl.TEXTURE1, tex1, next);
    reveal = 0;
    time = 0;

    if (reducedMotion) {
      // No frost or glimm. A quick reveal avoids motion-heavy shimmer.
      strength = 0;
      await tween((v) => (reveal = v), 0, 1, 420, draw);
    } else {
      // The phase clock animates the glimm band's subtle edge wave.
      let last = performance.now();
      const advanceTime = () => {
        const now = performance.now();
        const dt = Math.max(0, (now - last) / 1000);
        last = now;
        time += dt * Math.min(1, strength / STEADY_STRENGTH);
      };

      const ramp = (
        set: (v: number) => void,
        from: number,
        to: number,
        ms: number,
        ease?: EaseFn,
      ) =>
        tween(set, from, to, ms, () => {
          advanceTime();
          draw();
        }, ease);

      // Cover: old texture frosts and holds while the app "changes".
      await ramp(
        (v) => (strength = v),
        0,
        STEADY_STRENGTH,
        COVER_RAMP_MS,
        easeOutCubic,
      );
      // Handoff: glimm's left→right band reveals the sharp new texture.
      await ramp((v) => (reveal = v), 0, 1, HANDOFF_FADE_MS, bandSweepEase);
    }

    if (disposed) return;
    // Settle: promote the new texture to the base and reset to a clean frame.
    upload(gl.TEXTURE0, tex0, next);
    strength = 0;
    reveal = 0;
    time = 0;
    draw();
  };

  const dispose = () => {
    disposed = true;
    gl.deleteTexture(tex0);
    gl.deleteTexture(tex1);
    gl.deleteBuffer(buf);
    gl.deleteProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
  };

  return { show, morphTo, dispose };
}

/**
 * Composite a persona screenshot into a uniform 16:9 frame so the morph
 * operates on same-sized textures. Landscape shots fill (cover); portrait
 * shots sit centered over a soft blurred fill of themselves — matching the
 * CSS presentation used before the WebGL morph.
 */
export function compositePersona(
  img: HTMLImageElement,
  width: number,
  height: number,
  portrait: boolean,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const drawScaled = (scale: number) => {
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
  };

  const coverScale = Math.max(width / iw, height / ih);

  if (portrait) {
    // Blurred backdrop fill, scaled up so the blur's soft edges fall offscreen.
    ctx.save();
    ctx.filter = "blur(30px) saturate(1.3) brightness(0.9)";
    drawScaled(coverScale * 1.18);
    ctx.restore();
    // Contained window, centered.
    drawScaled(Math.min(width / iw, height / ih));
  } else {
    drawScaled(coverScale);
  }

  return c;
}
