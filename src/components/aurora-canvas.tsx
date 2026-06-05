"use client";

import { useEffect, useRef } from "react";
import { Renderer, Triangle, Program, Mesh } from "ogl";

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform float uStrength;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  vec3 auroraPalette(float t) {
    vec3 teal   = vec3(0.04, 0.80, 0.58);
    vec3 cyan   = vec3(0.10, 0.62, 0.96);
    vec3 violet = vec3(0.45, 0.36, 0.96);
    vec3 rose   = vec3(0.95, 0.40, 0.74);
    vec3 c = mix(teal, cyan, smoothstep(0.0, 0.42, t));
    c = mix(c, violet, smoothstep(0.42, 0.74, t));
    c = mix(c, rose, smoothstep(0.74, 1.0, t));
    return c;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.06;

    vec2 p = vec2(uv.x * uAspect, uv.y) * vec2(1.7, 0.66);
    vec2 flow = vec2(-t * 0.55, t * 0.22);

    vec2 q = vec2(
      fbm(p + flow),
      fbm(p + flow + vec2(5.2, 1.3))
    );
    vec2 r = vec2(
      fbm(p + 2.0 * q + vec2(1.7, 9.2) + flow * 0.5),
      fbm(p + 2.0 * q + vec2(8.3, 2.8) - flow * 0.4)
    );
    float f = fbm(p + 2.5 * r);

    float hue = clamp(uv.y * 0.92 + 0.04 + 0.28 * (r.y - 0.5), 0.0, 1.0);
    vec3 col = auroraPalette(hue);

    /* Floor the curtains so the aurora never disappears entirely when the
     * noise field drifts to low values, keeping the band visible across the
     * full animation loop instead of flickering between busy and empty. */
    float curtains = smoothstep(0.30, 0.78, f);
    curtains = pow(curtains, 1.25);
    curtains = max(curtains, 0.22);

    float rightRamp = smoothstep(0.20, 0.95, uv.x);

    float vert = smoothstep(0.05, 0.28, uv.y) * smoothstep(1.05, 0.78, uv.y);

    float alpha = curtains * rightRamp * vert * 1.55 * uStrength;
    alpha = clamp(alpha, 0.0, 0.96);

    gl_FragColor = vec4(col, alpha);
  }
`;

/* Aurora — WebGL noise field rendered to a full-bleed canvas. Ported from
 * fromyou-ai's landing page (src/aurora.js). The CSS fallback gradient on
 * `.aurora-canvas` only shows when WebGL is unavailable; the shader clears
 * it via JS the moment it takes over. */
export function AuroraCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        canvas,
        alpha: true,
        premultipliedAlpha: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.75),
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uStrength: { value: 1 },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    canvas.style.background = "none";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      /* Height is decoupled from the parent so the aurora stays at its
       * intended visual size even when the hero is shorter — ogl's setSize
       * locks canvas.style.height in pixels, so we drive it from the viewport
       * instead of measuring the canvas (which would lock to its own px). */
      const h = window.innerHeight;
      renderer.setSize(w, h);
      canvas.style.height = `${h}px`;
      program.uniforms.uAspect.value = w / Math.max(h, 1);
      program.uniforms.uStrength.value = w < 640 ? 0.72 : 1.0;
      if (reduceMotion.matches) renderer.render({ scene: mesh });
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener("resize", resize);

    let raf = 0;
    const frame = (t: number) => {
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(frame);
    };
    const play = () => {
      if (!raf && !reduceMotion.matches) raf = requestAnimationFrame(frame);
    };
    const pause = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const renderStill = () => {
      program.uniforms.uTime.value = 8.0;
      renderer.render({ scene: mesh });
    };

    if (reduceMotion.matches) renderStill();
    else play();

    const onVisibility = () => {
      if (document.hidden) pause();
      else play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onReduceChange = () => {
      if (reduceMotion.matches) {
        pause();
        renderStill();
      } else {
        play();
      }
    };
    reduceMotion.addEventListener?.("change", onReduceChange);

    return () => {
      pause();
      ro.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener?.("change", onReduceChange);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
