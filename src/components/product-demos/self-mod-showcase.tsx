"use client";

import Image from "next/image";
import { LayoutGrid, MessageSquare, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { isWebglMorphSupported, runSelfmodWebglMorph } from "@/lib/selfmod-webgl-morph";
import { useViewportActivity } from "@/components/use-viewport-activity";
import { SELF_MOD_STAGES } from "./data";

const ONBOARDING_MORPH_CSS_DURATION_MS = 400;
const ONBOARDING_MORPH_SWAP_MS = Math.round(ONBOARDING_MORPH_CSS_DURATION_MS / 2);

export function SelfModificationShowcase() {
  const [stageIndex, setStageIndex] = useState(1);
  const [cssMorphing, setCssMorphing] = useState(false);
  const { ref, isActive } = useViewportActivity<HTMLDivElement>({
    rootMargin: "240px 0px",
  });
  const morphCaptureRef = useRef<HTMLDivElement | null>(null);
  const morphGlRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;
    const timeoutIds: number[] = [];

    const advanceStage = () => {
      setStageIndex((current) => (current + 1) % SELF_MOD_STAGES.length);
    };

    const runCssFallbackMorph = () => {
      setCssMorphing(true);
      timeoutIds.push(window.setTimeout(() => {
        if (cancelled) return;
        flushSync(() => {
          advanceStage();
        });
      }, ONBOARDING_MORPH_SWAP_MS));
      timeoutIds.push(window.setTimeout(() => {
        if (!cancelled) setCssMorphing(false);
      }, ONBOARDING_MORPH_CSS_DURATION_MS));
    };

    const schedule = () => {
      timeoutIds.push(window.setTimeout(async () => {
        if (cancelled) return;

        const captureEl = morphCaptureRef.current;
        const glCanvas = morphGlRef.current;
        const canWebgl = isWebglMorphSupported() && captureEl && glCanvas;

        if (canWebgl) {
          const ok = await runSelfmodWebglMorph({
            captureEl,
            canvas: glCanvas,
            swap: () => {
              flushSync(() => {
                advanceStage();
              });
            },
          });
          if (!ok && !cancelled) runCssFallbackMorph();
        } else if (!cancelled) {
          runCssFallbackMorph();
        }

        if (!cancelled) schedule();
      }, 3200));
    };

    schedule();
    return () => {
      cancelled = true;
      setCssMorphing(false);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [isActive]);

  const activeStage = SELF_MOD_STAGES[stageIndex];

  return (
    <div ref={ref} className="selfmod-layout">
      <div
        className={`selfmod-canvas${cssMorphing ? " selfmod-canvas--morphing" : ""}`}
        style={
          cssMorphing
            ? { animationDuration: `${ONBOARDING_MORPH_CSS_DURATION_MS}ms` }
            : undefined
        }
      >
        <div className="selfmod-canvas__capture">
          <div className="selfmod-shell" data-stage={activeStage.id}>
            <svg className="selfmod-cat-ears" viewBox="0 0 140 40" aria-hidden="true">
              <path d="M10 40 L18 8 Q22 0 30 6 L38 40Z" fill="currentColor" />
              <path d="M16 40 L21 16 Q23 10 28 14 L33 40Z" className="selfmod-cat-ear-inner" />
              <path d="M130 40 L122 8 Q118 0 110 6 L102 40Z" fill="currentColor" />
              <path d="M124 40 L119 16 Q117 10 112 14 L107 40Z" className="selfmod-cat-ear-inner" />
            </svg>
            <div ref={morphCaptureRef} className="selfmod-shell__frame">
              <div className="selfmod-shell__titlebar">
                <div className="selfmod-shell__traffic">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="selfmod-shell__path">Stella</div>
              </div>

              <div className="selfmod-shell__body">
                <aside className="selfmod-shell__sidebar">
                  <div className="selfmod-shell__brand">
                    <Image src="/stella-logo.svg" alt="" width={22} height={22} />
                    <span className="selfmod-shell__brand-text">STELLA</span>
                  </div>

                  <div className="selfmod-shell__nav">
                    <button type="button" data-active>
                      <MessageSquare size={15} />
                      <span className="selfmod-shell__nav-label">Chat</span>
                    </button>
                    <button type="button">
                      <LayoutGrid size={15} />
                      <span className="selfmod-shell__nav-label">Canvas</span>
                    </button>
                    <button type="button">
                      <Settings2 size={15} />
                      <span className="selfmod-shell__nav-label">Settings</span>
                    </button>
                  </div>

                  <svg className="selfmod-cat-sleeping" viewBox="0 0 80 50" aria-hidden="true">
                    <ellipse cx="36" cy="44" rx="28" ry="5" fill="currentColor" opacity="0.1" />
                    <ellipse cx="36" cy="36" rx="24" ry="12" fill="currentColor" opacity="0.85" />
                    <circle cx="16" cy="28" r="10" fill="currentColor" />
                    <path d="M8 22 L6 12 L14 18Z" fill="currentColor" />
                    <path d="M9 21 L8 15 L13 19Z" className="selfmod-cat-ear-inner" />
                    <path d="M24 22 L26 12 L18 18Z" fill="currentColor" />
                    <path d="M23 21 L24 15 L19 19Z" className="selfmod-cat-ear-inner" />
                    <path d="M11 28 Q13 26 15 28" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3" />
                    <path d="M17 28 Q19 26 21 28" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3" />
                    <ellipse cx="16" cy="31" rx="1.2" ry="0.8" fill="currentColor" opacity="0.25" />
                    <path d="M58 32 Q66 28 68 20 Q69 16 66 16 Q63 16 64 22 Q65 28 58 32" fill="currentColor" opacity="0.8" strokeLinejoin="round" />
                  </svg>
                </aside>

                <div className="selfmod-shell__workspace">
                  <div className="selfmod-shell__content">
                    <div className="selfmod-preview-area">
                      <div className="selfmod-preview-bubbles">
                        <div className="selfmod-preview-bubble selfmod-preview-bubble--stella">
                          Hey! What would you like to change?
                        </div>
                        <div className="selfmod-preview-bubble selfmod-preview-bubble--user">
                          {activeStage.prompt}
                        </div>
                        <div className="selfmod-preview-bubble selfmod-preview-bubble--stella">Done ✓</div>
                      </div>

                      <svg className="selfmod-cat-paw" viewBox="0 0 32 56" aria-hidden="true">
                        <path d="M10 0 L10 32 Q10 38 16 38 Q22 38 22 32 L22 0Z" fill="currentColor" opacity="0.85" />
                        <ellipse cx="16" cy="40" rx="10" ry="7" fill="currentColor" />
                        <ellipse cx="8" cy="46" rx="4" ry="5" fill="currentColor" />
                        <ellipse cx="16" cy="48" rx="4" ry="5" fill="currentColor" />
                        <ellipse cx="24" cy="46" rx="4" ry="5" fill="currentColor" />
                        <ellipse cx="8" cy="47" rx="2" ry="2.5" fill="currentColor" opacity="0.2" />
                        <ellipse cx="16" cy="49" rx="2" ry="2.5" fill="currentColor" opacity="0.2" />
                        <ellipse cx="24" cy="47" rx="2" ry="2.5" fill="currentColor" opacity="0.2" />
                        <ellipse cx="16" cy="40" rx="4.5" ry="3" fill="currentColor" opacity="0.2" />
                      </svg>
                    </div>
                    <div className="selfmod-options">
                      {SELF_MOD_STAGES.map((stage, index) => (
                        <button
                          key={stage.id}
                          type="button"
                          className="selfmod-option"
                          data-active={stageIndex === index || undefined}
                        >
                          <span className="selfmod-option__level">{stage.title}</span>
                          <span className="selfmod-option__prompt">{stage.prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <canvas ref={morphGlRef} className="selfmod-morph-gl" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
