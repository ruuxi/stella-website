/**
 * WebGL blob animation for the radial dial.
 * Adapted from Stella desktop so the marketing demos can use the same motion language.
 */

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 v_uv;

uniform float u_progress;
uniform float u_leadP;
uniform float u_lagP;
uniform float u_morph;
uniform float u_time;
uniform vec3 u_fills[5];
uniform vec3 u_selFill;
uniform vec3 u_centerBg;
uniform vec3 u_stroke;
uniform float u_selIdx;

const float PI = 3.14159265;
const float TAU = 6.28318530;
const float WEDGE_ANG = TAU / 5.0;
const float INNER_R = 40.0 / 280.0;
const float OUTER_R = 125.0 / 280.0;
const float CENTER_R = 35.0 / 280.0;

void main() {
    vec2 p = v_uv - 0.5;
    float dist = length(p);
    float angle = atan(p.y, p.x);
    float topAngle = mod(angle + PI * 0.5, TAU);

    int wi = int(floor(topAngle / WEDGE_ANG));
    float wFrac = fract(topAngle / WEDGE_ANG);

    float wobble = sin(angle * 3.0 + u_time * 1.5) * 0.012
                 + sin(angle * 5.0 - u_time * 2.0) * 0.008
                 + sin(angle * 2.0 + 0.5) * 0.018
                 + sin(angle * 4.0 - 1.3) * 0.006;
    wobble *= (1.0 - u_morph * 0.85);

    float asym = sin(angle * 2.3 + 0.7) * 0.035
               + sin(angle * 1.0 - 0.4) * 0.02;
    asym *= (1.0 - u_morph * 0.9);

    float outerR = u_lagP * OUTER_R * (1.0 + asym) + wobble * u_lagP;

    float innerT = clamp((u_progress - 0.4) / 0.6, 0.0, 1.0);
    float innerR = innerT * INNER_R;

    float centerT = clamp((u_leadP - 0.25) / 0.75, 0.0, 1.0);
    float centerR = centerT * CENTER_R;

    float soft = mix(0.022, 0.004, u_morph);

    float outerMask = smoothstep(outerR + soft, outerR - soft, dist);
    float innerMask = smoothstep(innerR - soft * 0.5, innerR + soft * 0.5, dist);
    float centerMask = smoothstep(centerR + soft * 0.4, centerR - soft * 0.4, dist);

    float ring = outerMask * innerMask;

    vec3 wc;
    if (wi == 0) wc = u_fills[0];
    else if (wi == 1) wc = u_fills[1];
    else if (wi == 2) wc = u_fills[2];
    else if (wi == 3) wc = u_fills[3];
    else wc = u_fills[4];

    if (u_selIdx >= 0.0 && abs(float(wi) - u_selIdx) < 0.5) {
        wc = u_selFill;
    }

    vec3 avg = (u_fills[0] + u_fills[1] + u_fills[2] + u_fills[3] + u_fills[4]) * 0.2;
    vec3 ringColor = mix(avg, wc, u_morph);

    float bDist = min(wFrac, 1.0 - wFrac);
    float bWidth = 0.006 / max(dist * 5.0, 0.01);
    float bLine = smoothstep(0.0, bWidth, bDist);
    ringColor = mix(u_stroke, ringColor, mix(1.0, bLine, u_morph * 0.6));

    vec3 color = ringColor;
    float alpha = ring;
    color = mix(color, u_centerBg, centerMask);
    alpha = max(alpha, centerMask);

    gl_FragColor = vec4(color, alpha);
}
`;

type Vec3 = [number, number, number];

export interface BlobColors {
  fills: Vec3[];
  selectedFill: Vec3;
  centerBg: Vec3;
  stroke: Vec3;
}

interface BlobGL {
  gl: WebGLRenderingContext;
  prog: WebGLProgram;
  locs: Record<string, WebGLUniformLocation | null>;
}

let blobGL: BlobGL | null = null;
let animFrame: number | null = null;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function initBlob(canvas: HTMLCanvasElement): boolean {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
  if (!gl) return false;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return false;

  const prog = gl.createProgram();
  if (!prog) return false;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    return false;
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const loc = (name: string) => gl.getUniformLocation(prog, name);

  blobGL = {
    gl,
    prog,
    locs: {
      u_progress: loc("u_progress"),
      u_leadP: loc("u_leadP"),
      u_lagP: loc("u_lagP"),
      u_morph: loc("u_morph"),
      u_time: loc("u_time"),
      u_fills: loc("u_fills"),
      u_selFill: loc("u_selFill"),
      u_centerBg: loc("u_centerBg"),
      u_stroke: loc("u_stroke"),
      u_selIdx: loc("u_selIdx"),
    },
  };

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  return true;
}

function springEase(t: number): number {
  if (t <= 0) return 0;
  const zeta = 0.58;
  const omega = 28;
  const omegaD = omega * Math.sqrt(1 - zeta * zeta);
  return (
    1 -
    Math.exp(-zeta * omega * t) *
      (Math.cos(omegaD * t) + ((zeta * omega) / omegaD) * Math.sin(omegaD * t))
  );
}

function draw(
  progress: number,
  leadP: number,
  lagP: number,
  morph: number,
  time: number,
  selIdx: number,
  colors: BlobColors,
) {
  if (!blobGL) return;
  const { gl, prog, locs } = blobGL;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(prog);

  gl.uniform1f(locs.u_progress, progress);
  gl.uniform1f(locs.u_leadP, leadP);
  gl.uniform1f(locs.u_lagP, lagP);
  gl.uniform1f(locs.u_morph, morph);
  gl.uniform1f(locs.u_time, time);
  gl.uniform1f(locs.u_selIdx, selIdx);

  const flat = new Float32Array(15);
  for (let i = 0; i < 5; i += 1) {
    const color = colors.fills[i] ?? [0, 0, 0];
    flat[i * 3] = color[0];
    flat[i * 3 + 1] = color[1];
    flat[i * 3 + 2] = color[2];
  }
  gl.uniform3fv(locs.u_fills, flat);
  gl.uniform3fv(locs.u_selFill, new Float32Array(colors.selectedFill));
  gl.uniform3fv(locs.u_centerBg, new Float32Array(colors.centerBg));
  gl.uniform3fv(locs.u_stroke, new Float32Array(colors.stroke));

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

const OPEN_SETTLE = 420;
export const CLOSE_DURATION = 180;

export function startOpen(
  selIdxRef: { current: number },
  colorsRef: { current: BlobColors },
  onComplete: () => void,
  onFadeIn?: () => void,
) {
  if (animFrame !== null) cancelAnimationFrame(animFrame);
  const start = performance.now();
  let hasFadedIn = false;

  const tick = (now: number) => {
    const s = (now - start) / 1000;

    if (!hasFadedIn && s * 1000 >= 180) {
      hasFadedIn = true;
      onFadeIn?.();
    }

    const progress = springEase(s);
    const leadP = springEase(s + 0.035);
    const lagP = springEase(s - 0.02);
    const morphRaw = springEase(s - 0.06);
    const morph = Math.pow(Math.max(0, morphRaw), 1.3);

    draw(progress, leadP, lagP, morph, s, selIdxRef.current, colorsRef.current);

    if (s * 1000 < OPEN_SETTLE) {
      animFrame = requestAnimationFrame(tick);
    } else {
      animFrame = null;
      onComplete();
    }
  };

  animFrame = requestAnimationFrame(tick);
}

export function startAmbientLoop(
  selIdxRef: { current: number },
  colorsRef: { current: BlobColors },
) {
  if (animFrame !== null) cancelAnimationFrame(animFrame);
  const start = performance.now();

  const tick = (now: number) => {
    const time = (now - start) / 1000;
    draw(1, 1, 1, 1, time * 0.65, selIdxRef.current, colorsRef.current);
    animFrame = requestAnimationFrame(tick);
  };

  animFrame = requestAnimationFrame(tick);
}

export function cancelAnimation() {
  if (animFrame !== null) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  clearCanvas();
}

function clearCanvas() {
  if (!blobGL) return;
  const { gl } = blobGL;
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

export function destroyBlob() {
  cancelAnimation();
  if (blobGL) {
    blobGL.gl.deleteProgram(blobGL.prog);
    blobGL = null;
  }
}
