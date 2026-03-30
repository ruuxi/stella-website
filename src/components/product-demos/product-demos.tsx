"use client";

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { SelfModificationPoster } from "./self-mod-poster";

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
  return <DeferredSelfModificationShowcase />;
}

