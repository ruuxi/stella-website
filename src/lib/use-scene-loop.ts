"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

class SceneCancel extends Error {}

export type Scene = {
  /* Sleeps, then throws internally if the scene was cancelled while
     sleeping — scripts never run another step after cancellation. */
  sleep: (ms: number) => Promise<void>;
  /* Type `text` through `onChar` at `ms` per character. */
  type: (text: string, onChar: (typed: string) => void, ms?: number) => Promise<void>;
};

/**
 * Runs `script` in a loop while `ref` is on screen, fully unwinding it the
 * moment the section scrolls away. The script receives scene helpers and is
 * expected to set component state as it goes; `reset` is called whenever the
 * loop stops so the section returns to its opening frame.
 *
 * Under `prefers-reduced-motion` the loop never starts and `reduced` is
 * true, so sections can render a settled final frame instead.
 */
export function useSceneLoop(
  ref: RefObject<HTMLElement | null>,
  script: (scene: Scene) => Promise<void>,
  reset: () => void,
  { threshold = 0.3, restartDelayMs = 900 }: { threshold?: number; restartDelayMs?: number } = {},
) {
  const [running, setRunning] = useState(false);
  const [reduced, setReduced] = useState(false);
  const scriptRef = useRef(script);
  const resetRef = useRef(reset);

  useEffect(() => {
    scriptRef.current = script;
    resetRef.current = reset;
  }, [script, reset]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => setReduced(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (cancelled) reject(new SceneCancel());
          else resolve();
        }, ms);
      });

    const type = async (
      text: string,
      onChar: (typed: string) => void,
      ms = 26,
    ) => {
      for (let i = 1; i <= text.length; i += 1) {
        onChar(text.slice(0, i));
        await sleep(ms);
      }
    };

    (async () => {
      await sleep(450);
      while (!cancelled) {
        await scriptRef.current({ sleep, type });
        await sleep(restartDelayMs);
        resetRef.current();
        await sleep(700);
      }
    })().catch((error) => {
      if (!(error instanceof SceneCancel)) throw error;
    });

    return () => {
      cancelled = true;
      resetRef.current();
    };
  }, [running, restartDelayMs]);

  return { reduced };
}
