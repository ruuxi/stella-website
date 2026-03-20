"use client";

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import dynamic from "next/dynamic";
import { DeferInView } from "./defer-in-view";
import { SelfModificationPoster } from "./self-mod-poster";

function DemoChunkPlaceholder() {
  return (
    <div
      className="demo-showcase-chunk-placeholder"
      style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }}
      aria-busy="true"
      aria-label="Loading interactive demo"
    />
  );
}

const RadialDialShowcase = dynamic(
  () => import("./radial-dial-showcase").then((m) => ({ default: m.RadialDialShowcase })),
  { loading: () => <DemoChunkPlaceholder /> },
);

const CanvasShowcase = dynamic(
  () => import("./canvas-showcase").then((m) => ({ default: m.CanvasShowcase })),
  { loading: () => <DemoChunkPlaceholder /> },
);

function DeferredSelfModificationShowcase() {
  const [LoadedShowcase, setLoadedShowcase] = useState<ComponentType | null>(null);
  const loadedRef = useRef<ComponentType | null>(null);
  const loadingRef = useRef(false);
  const activateRef = useRef<() => void>(() => {});

  activateRef.current = () => {
    if (loadedRef.current || loadingRef.current) return;
    loadingRef.current = true;

    void import("./self-mod-showcase").then((mod) => {
      loadedRef.current = mod.SelfModificationShowcase;
      startTransition(() => {
        setLoadedShowcase(() => mod.SelfModificationShowcase);
      });
    });
  };

  useEffect(() => {
    const requestIdle = window.requestIdleCallback?.bind(window);
    const cancelIdle = window.cancelIdleCallback?.bind(window);
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
    let idleId: number | undefined;

    if (requestIdle) {
      idleId = requestIdle(() => {
        activateRef.current();
      }, { timeout: 1800 });
    } else {
      timeoutId = globalThis.setTimeout(() => {
        activateRef.current();
      }, 1200);
    }

    return () => {
      if (idleId !== undefined && cancelIdle) {
        cancelIdle(idleId);
      }
      if (timeoutId !== undefined) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div
      onPointerEnter={() => activateRef.current()}
      onFocusCapture={() => activateRef.current()}
      onTouchStart={() => activateRef.current()}
      onClickCapture={() => activateRef.current()}
    >
      {LoadedShowcase ? <LoadedShowcase /> : <SelfModificationPoster />}
    </div>
  );
}

export function SelfModDemo() {
  return (
    <div className="demo-showcase-grid">
      <article className="demo-panel demo-panel--full">
        <div className="demo-panel__header">
          <p className="demo-panel__lede">
            Just tell Stella to change its appearance — from small tweaks like colors to a complete visual makeover. It redesigns itself while you keep chatting.
          </p>
        </div>
        <DeferredSelfModificationShowcase />
      </article>
    </div>
  );
}

export function RadialDialDemo() {
  return (
    <div className="demo-showcase-grid">
      <article className="demo-panel demo-panel--full">
        <div className="demo-panel__header demo-panel__header--spaced">
          <p className="demo-panel__lede">
            The radial dial pops up wherever you are. Capture your screen, start a chat, dictate with your voice, or get an instant summary — all without switching windows.
          </p>
        </div>
        <DeferInView fallback={<DemoChunkPlaceholder />}>
          <RadialDialShowcase />
        </DeferInView>
      </article>
    </div>
  );
}

export function CanvasDemo() {
  return (
    <div className="demo-showcase-grid">
      <article className="demo-panel demo-panel--full">
        <div className="demo-panel__header">
          <p className="demo-panel__lede">
            The full Stella window shows your dashboard, active tasks, and upcoming follow-ups — all in one clean, organized view.
          </p>
        </div>
        <DeferInView fallback={<DemoChunkPlaceholder />}>
          <CanvasShowcase />
        </DeferInView>
      </article>
    </div>
  );
}

export function ProductDemos() {
  return (
    <>
      <SelfModDemo />
      <RadialDialDemo />
      <CanvasDemo />
    </>
  );
}
