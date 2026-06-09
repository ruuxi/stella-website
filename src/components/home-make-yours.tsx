"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import mock from "./home-desktop-mock.module.css";
import {
  MorphScene,
  PEARL_VARS,
  SKINS,
  type SkinId,
} from "./home-desktop-skins";
import styles from "./home-make-yours.module.css";

type Tile = {
  id: SkinId;
  request: string;
  vars: CSSProperties;
  /* Grid columns this tile spans — the mosaic mixes narrow and wide. */
  span: 1 | 2;
};

// The four transformations in reading order, each with its own permanent
// spot: narrow + wide on the first row, wide + narrow on the second.
// (The untouched app lives in the hero above — no tile needed.)
const TILES: Tile[] = (
  [
    ["cozy", 1],
    ["terminal", 2],
    ["sports", 2],
    ["sunset", 1],
  ] as Array<[SkinId, 1 | 2]>
).map(([id, span]) => {
  const skin = SKINS.find((candidate) => candidate.id === id)!;
  return { id, request: skin.request, vars: skin.vars, span };
});

const TILE_IN_MS = 420;
const CHAR_MS = 30;
const TYPED_BEAT_MS = 260;
const ALL_REVEALED_HOLD_MS = 3400;
const RESET_GAP_MS = 700;

// Where the input anchor should land inside a typing tile: left of center
// so typed text has room to grow rightward, slightly below middle.
const ANCHOR_TARGET_X = 0.24;
const ANCHOR_TARGET_Y = 0.6;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/* Measure where this tile's input row actually sits and build a zoom
   transform that brings it to the anchor target — clamped so the scaled
   scene always covers the whole tile and nothing typed can be cropped. */
function computeZoom(tile: HTMLElement): string {
  const camera = tile.querySelector<HTMLElement>(`.${styles.camera}`);
  // Typing always happens in the Pearl base app's composer.
  const anchor = tile.querySelector<HTMLElement>(
    "[data-morph-base] [data-zoom-anchor]",
  );
  if (!camera || !anchor) return "scale(1.85)";

  // Read with the camera at rest so an in-flight zoom can't skew the math.
  const prev = camera.style.transform;
  camera.style.transform = "none";
  const tileRect = tile.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  camera.style.transform = prev;

  // Anchor: just inside the input's left edge, vertically centered.
  const fx =
    (anchorRect.left + Math.min(anchorRect.width * 0.1, 22) - tileRect.left) /
    tileRect.width;
  const fy = (anchorRect.top + anchorRect.height / 2 - tileRect.top) /
    tileRect.height;

  const scale = tileRect.width > 480 ? 1.85 : 1.6;
  // |translate| beyond (scale - 1) / 2 would expose the tile background.
  const max = ((scale - 1) / 2) * 100;
  const tx = clamp((ANCHOR_TARGET_X - 0.5 - scale * (fx - 0.5)) * 100, -max, max);
  const ty = clamp((ANCHOR_TARGET_Y - 0.5 - scale * (fy - 0.5)) * 100, -max, max);
  return `translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%) scale(${scale})`;
}

export function HomeMakeYours() {
  const sectionRef = useRef<HTMLElement>(null);
  const tileRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [zooms, setZooms] = useState<string[]>([]);
  // Tiles before `typingIndex` are revealed, the tile at it is typing,
  // tiles after it are pending. TILES.length = everything revealed.
  const [typingIndex, setTypingIndex] = useState(-1);
  const [typed, setTyped] = useState("");
  const [running, setRunning] = useState(false);

  const measure = useCallback(() => {
    setZooms(
      TILES.map((_, i) => {
        const el = tileRefs.current[i];
        return el ? computeZoom(el) : "scale(1.85)";
      }),
    );
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    // Under reduced motion skip the loop and show every tile transformed.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => setTypingIndex(TILES.length));
      return () => cancelAnimationFrame(raf);
    }
    measure();
    // Webfont metrics shift the anchor rows slightly; re-measure once loaded.
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    const io = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      window.removeEventListener("resize", measure);
      io.disconnect();
    };
  }, [measure]);

  // The pipeline: as soon as one tile finishes typing, the next tile starts —
  // the finished tile zooms out into its full design while its neighbor types.
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    (async () => {
      await sleep(500);
      while (!cancelled) {
        for (let k = 0; k < TILES.length; k += 1) {
          setTypingIndex(k);
          setTyped("");
          await sleep(TILE_IN_MS);
          if (cancelled) return;
          const text = TILES[k].request;
          for (let i = 1; i <= text.length; i += 1) {
            setTyped(text.slice(0, i));
            await sleep(CHAR_MS);
            if (cancelled) return;
          }
          await sleep(TYPED_BEAT_MS);
          if (cancelled) return;
        }
        setTypingIndex(TILES.length);
        setTyped("");
        await sleep(ALL_REVEALED_HOLD_MS);
        if (cancelled) return;
        setTypingIndex(-1);
        await sleep(RESET_GAP_MS);
        if (cancelled) return;
      }
    })();

    return () => {
      cancelled = true;
      setTypingIndex(-1);
      setTyped("");
    };
  }, [running]);

  return (
    <section
      className="grid-shell section-border home-atlas-section"
      data-reveal
      aria-label="Make Stella yours"
      ref={sectionRef}
    >
      <div
        className="home-atlas-heading"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 0 }}
      >
        <h2>Make Stella yours.</h2>
      </div>

      <div
        className={styles.mosaic}
        data-reveal-child
        style={{ ["--reveal-index" as string]: 1 }}
      >
        {TILES.map((tile, i) => {
          const state =
            i < typingIndex
              ? "revealed"
              : i === typingIndex
                ? "typing"
                : "pending";
          const revealed = state === "revealed";
          return (
            <div
              key={tile.id}
              ref={(el) => {
                tileRefs.current[i] = el;
              }}
              className={styles.tile}
              style={revealed ? tile.vars : PEARL_VARS}
              data-state={state}
              data-skin={tile.id}
              data-span={tile.span}
            >
              <div
                className={styles.camera}
                style={
                  state === "typing" && zooms[i]
                    ? { transform: zooms[i] }
                    : undefined
                }
              >
                <MorphScene
                  id={tile.id}
                  typed={state === "typing" ? typed : ""}
                  revealed={revealed}
                  compact
                />
              </div>
              <span className={mock.trafficLights} aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
