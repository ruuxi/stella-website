"use client";

import Image from "next/image";
import {
  House,
  LayoutGrid,
  MessageSquare,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StellaAnimation } from "@/components/stella-animation/stella-animation";
import { useViewportActivity } from "@/components/use-viewport-activity";
import {
  cancelAnimation,
  destroyBlob,
  initBlob,
  startAmbientLoop,
  startOpen,
  type BlobColors,
} from "@/components/stella-demos/radial-blob";
import { runVacuumEffect } from "@/components/stella-demos/region-capture-vacuum";
import { makeCaptureThumbnail } from "./capture-thumbnail";
import { RADIAL_RAIL_DETAILS, RADIAL_WEDGES } from "./data";
import {
  CENTER_BG_RADIUS,
  createBlobColors,
  RADIAL_CENTER,
  RADIAL_LAYOUT,
  RADIAL_SIZE,
} from "./radial-geometry";

const RADIAL_DIAL_PHASE_MS = 1800;
const RADIAL_RESULT_HOLD_MS = 4000;
const RADIAL_CYCLE_MS = RADIAL_DIAL_PHASE_MS + RADIAL_RESULT_HOLD_MS + 800;

function CaptureVacuumCanvas({
  active,
  showResult,
  wedgeKey,
}: {
  active: boolean;
  showResult: boolean;
  wedgeKey: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || !showResult) return;
    const el = canvasRef.current;
    if (!el) return;
    void runVacuumEffect(el, makeCaptureThumbnail(), 0.5, 0.5);
  }, [active, showResult, wedgeKey]);

  return <canvas ref={canvasRef} className="radial-result-vacuum" />;
}

export function RadialDialShowcase() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [phase, setPhase] = useState<"dial" | "result">("dial");
  const [isVisible, setIsVisible] = useState(false);
  const { ref, isActive } = useViewportActivity<HTMLDivElement>({
    rootMargin: "240px 0px",
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedIdxRef = useRef(selectedIndex);
  const colorsRef = useRef<BlobColors>(createBlobColors(selectedIndex));

  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;
    const timeoutIds: number[] = [];

    const cycle = () => {
      if (cancelled) return;

      setPhase("dial");

      timeoutIds.push(window.setTimeout(() => {
        if (cancelled) return;
        setPhase("result");
      }, RADIAL_DIAL_PHASE_MS));

      timeoutIds.push(window.setTimeout(() => {
        if (cancelled) return;
        setSelectedIndex((current) => (current + 1) % RADIAL_WEDGES.length);
        cycle();
      }, RADIAL_CYCLE_MS));
    };

    cycle();
    return () => {
      cancelled = true;
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [isActive]);

  useEffect(() => {
    selectedIdxRef.current = selectedIndex;
    colorsRef.current = createBlobColors(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    canvas.width = RADIAL_SIZE * dpr;
    canvas.height = RADIAL_SIZE * dpr;

    if (!initBlob(canvas)) return;

    startOpen(
      selectedIdxRef,
      colorsRef,
      () => {
        setIsVisible(true);
        startAmbientLoop(selectedIdxRef, colorsRef);
      },
      () => setIsVisible(true),
    );

    return () => {
      setIsVisible(false);
      cancelAnimation();
      destroyBlob();
    };
  }, [isActive]);

  const activeWedge = RADIAL_WEDGES[selectedIndex];
  const showDial = isActive && phase === "dial";
  const showResult = isActive && phase === "result";

  return (
    <div ref={ref} className="radial-demo radial-demo--unified">
      <div className="radial-demo__description">
        <ul className="radial-demo__feature-rail" aria-label="Quick actions">
          {RADIAL_WEDGES.map((wedge, index) => {
            const Icon = wedge.icon;
            const isActive = selectedIndex === index;

            return (
              <li
                key={wedge.id}
                className="radial-demo__feature-item"
                data-active={isActive || undefined}
              >
                <span className="radial-demo__feature-icon" aria-hidden="true">
                  <Icon width={17} height={17} />
                </span>
                <div className="radial-demo__feature-main">
                  <strong>{wedge.label}</strong>
                  <p>{RADIAL_RAIL_DETAILS[wedge.id]}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="radial-desktop-mock">
        <div className="radial-desktop-mock__titlebar">
          <div className="radial-desktop-mock__traffic">
            <span />
            <span />
            <span />
          </div>
          <div className="radial-desktop-mock__chrome">
            <strong>Stella quick gesture</strong>
            <span>Invoke over whatever you are doing</span>
          </div>
        </div>
        <div className="radial-desktop-mock__screen" data-mode={activeWedge.id}>
          <div className="radial-desktop-mock__ambient">
            <div className="radial-desktop-mock__ambient-card">
              <span>Current surface</span>
              <strong>{activeWedge.label}</strong>
            </div>
            <div className="radial-desktop-mock__ambient-card radial-desktop-mock__ambient-card--soft">
              <span>Context follows</span>
              <strong>Screen + conversation + next step</strong>
            </div>
          </div>

          {activeWedge.id === "capture" && (
            <div className="radial-scene radial-scene--capture">
              <div className="radial-scene__taskbar">
                <span className="radial-scene__taskbar-dot" />
                <span>Figma</span>
                <span>Chrome</span>
                <span>Slack</span>
              </div>
              <div className="radial-scene__window radial-scene__window--main">
                <div className="radial-scene__window-bar">
                  <span />
                  <span />
                  <span />
                  <strong>Figma — Homepage redesign</strong>
                </div>
                <div className="radial-scene__window-body radial-scene__design-canvas">
                  <div className="radial-scene__design-sidebar" />
                  <div className="radial-scene__design-artboard">
                    <div className="radial-scene__design-frame" />
                    <div className="radial-scene__design-frame radial-scene__design-frame--small" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeWedge.id === "chat" && (
            <div className="radial-scene radial-scene--chat">
              <div className="radial-scene__taskbar">
                <span className="radial-scene__taskbar-dot" />
                <span>Safari</span>
                <span>Notes</span>
              </div>
              <div className="radial-scene__window radial-scene__window--main">
                <div className="radial-scene__window-bar">
                  <span />
                  <span />
                  <span />
                  <strong>allrecipes.com — Thai basil chicken</strong>
                </div>
                <div className="radial-scene__window-body radial-scene__recipe">
                  <div className="radial-scene__recipe-hero" />
                  <div className="radial-scene__recipe-text">
                    <div className="radial-scene__text-line radial-scene__text-line--title" />
                    <div className="radial-scene__text-line" />
                    <div className="radial-scene__text-line radial-scene__text-line--short" />
                    <div className="radial-scene__text-line" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeWedge.id === "full" && (
            <div className="radial-scene radial-scene--full">
              <div className="radial-scene__taskbar">
                <span className="radial-scene__taskbar-dot" />
                <span>Finder</span>
                <span>VS Code</span>
                <span>Spotify</span>
                <span>Stella</span>
              </div>
              <div className="radial-scene__window radial-scene__window--bg1">
                <div className="radial-scene__window-bar">
                  <span />
                  <span />
                  <span />
                  <strong>VS Code</strong>
                </div>
                <div className="radial-scene__window-body">
                  <div className="radial-scene__code-lines">
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                  </div>
                </div>
              </div>
              <div className="radial-scene__window radial-scene__window--bg2">
                <div className="radial-scene__window-bar">
                  <span />
                  <span />
                  <span />
                  <strong>Spotify</strong>
                </div>
                <div className="radial-scene__window-body">
                  <div className="radial-scene__placeholder" />
                </div>
              </div>
            </div>
          )}

          {activeWedge.id === "voice" && (
            <div className="radial-scene radial-scene--voice">
              <div className="radial-scene__taskbar">
                <span className="radial-scene__taskbar-dot" />
                <span>Notes</span>
                <span>Calendar</span>
              </div>
              <div className="radial-scene__window radial-scene__window--main">
                <div className="radial-scene__window-bar">
                  <span />
                  <span />
                  <span />
                  <strong>Notes — Meeting prep</strong>
                </div>
                <div className="radial-scene__window-body radial-scene__notes">
                  <div className="radial-scene__notes-sidebar">
                    <div className="radial-scene__text-line radial-scene__text-line--short" />
                    <div className="radial-scene__text-line radial-scene__text-line--short" />
                    <div className="radial-scene__text-line radial-scene__text-line--short" />
                  </div>
                  <div className="radial-scene__notes-body">
                    <div className="radial-scene__text-line radial-scene__text-line--title" />
                    <div className="radial-scene__text-line" />
                    <div className="radial-scene__text-line radial-scene__text-line--short" />
                    <div className="radial-scene__text-line" />
                    <div className="radial-scene__text-line radial-scene__text-line--short" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeWedge.id === "auto" && (
            <div className="radial-scene radial-scene--auto">
              <div className="radial-scene__taskbar">
                <span className="radial-scene__taskbar-dot" />
                <span>Chrome</span>
                <span>Notion</span>
              </div>
              <div className="radial-scene__window radial-scene__window--main">
                <div className="radial-scene__window-bar">
                  <span />
                  <span />
                  <span />
                  <strong>nytimes.com — The future of remote work</strong>
                </div>
                <div className="radial-scene__window-body radial-scene__article">
                  <div className="radial-scene__article-hero" />
                  <div className="radial-scene__article-body">
                    <div className="radial-scene__text-line radial-scene__text-line--title" />
                    <div className="radial-scene__text-line" />
                    <div className="radial-scene__text-line" />
                    <div className="radial-scene__text-line radial-scene__text-line--short" />
                    <div className="radial-scene__text-line" />
                    <div className="radial-scene__text-line" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`radial-desktop-mock__dial${showDial ? " radial-desktop-mock__dial--visible" : ""}`}>
            <div className="radial-shell">
              <div className="radial-dial-container">
                <canvas
                  ref={canvasRef}
                  className="radial-blob-canvas"
                  style={{ width: RADIAL_SIZE, height: RADIAL_SIZE }}
                />
                <div className={`radial-dial-frame${isVisible ? " radial-dial-frame--visible" : ""}`} aria-hidden="true">
                  <svg
                    width={RADIAL_SIZE}
                    height={RADIAL_SIZE}
                    viewBox={`0 0 ${RADIAL_SIZE} ${RADIAL_SIZE}`}
                    className="radial-dial"
                  >
                    {RADIAL_LAYOUT.map((wedge, index) => {
                      const isSelected = selectedIndex === index;
                      return (
                        <path
                          key={wedge.id}
                          d={wedge.path}
                          fill={isSelected ? "rgba(29, 120, 242, 0.9)" : "rgba(250, 252, 255, 1)"}
                          stroke={isSelected ? "rgba(102, 220, 255, 0.88)" : "rgba(120, 145, 189, 0.35)"}
                          strokeWidth={1.5}
                          className="wedge-path"
                        />
                      );
                    })}
                    <circle
                      cx={RADIAL_CENTER}
                      cy={RADIAL_CENTER}
                      r={CENTER_BG_RADIUS}
                      fill="rgba(241, 247, 255, 0.96)"
                      stroke="rgba(120, 145, 189, 0.42)"
                      strokeWidth={1}
                    />
                  </svg>

                  {RADIAL_LAYOUT.map((wedge, index) => {
                    const Icon = wedge.icon;
                    const isSelected = selectedIndex === index;
                    return (
                      <div
                        key={`${wedge.id}-content`}
                        className="radial-wedge-content"
                        style={{
                          left: wedge.position.x,
                          top: wedge.position.y,
                          color: isSelected ? "rgba(248, 252, 255, 0.98)" : "rgba(77, 96, 122, 0.84)",
                        }}
                      >
                        <Icon aria-hidden="true" width={16} height={16} />
                        <span className="radial-wedge-label">{wedge.label}</span>
                      </div>
                    );
                  })}

                <div className="radial-center-stella-animation">
                    <StellaAnimation
                      width={20}
                      height={20}
                      initialBirthProgress={1}
                      paused={!isActive || !showDial}
                      maxDpr={1}
                      frameSkip={1}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`radial-desktop-mock__result${showResult ? " radial-desktop-mock__result--visible" : ""}`}>
            {activeWedge.id === "capture" && (
              <>
                <CaptureVacuumCanvas
                  active={isActive}
                  showResult={showResult}
                  wedgeKey={selectedIndex}
                />
                <div className="radial-result-minishell radial-result-minishell--capture">
                  <div className="radial-result-minishell__badge">Captured: Figma — Homepage redesign</div>
                  <div className="radial-result-minishell__capture-thumb" />
                  <div className="radial-result-minishell__composer">
                    <Search size={13} />
                    <span>Ask about this design...</span>
                  </div>
                </div>
              </>
            )}

            {activeWedge.id === "chat" && (
              <div className="radial-result-minishell">
                <div className="radial-result-minishell__badge">allrecipes.com — Thai basil chicken</div>
                <div className="radial-result-minishell__bubble radial-result-minishell__bubble--stella">
                  I can see you&apos;re reading a recipe. Need help with substitutions or measurements?
                </div>
                <div className="radial-result-minishell__composer">
                  <Search size={13} />
                  <span>Ask Stella about this recipe...</span>
                </div>
              </div>
            )}

            {activeWedge.id === "full" && (
              <div className="radial-result-fullshell radial-result-fullshell--animate">
                <div className="radial-result-fullshell__titlebar">
                  <span />
                  <strong>Stella</strong>
                  <em />
                </div>
                <div className="radial-result-fullshell__body">
                  <aside className="radial-result-fullshell__sidebar">
                    <div className="radial-result-fullshell__brand">
                      <Image src="/stella-logo.svg" alt="" width={18} height={18} />
                    </div>
                    <div className="radial-result-fullshell__nav">
                      <House size={14} />
                      <MessageSquare size={14} />
                      <LayoutGrid size={14} />
                    </div>
                  </aside>
                  <div className="radial-result-fullshell__workspace">
                    <div className="radial-result-fullshell__status">Your session continues here.</div>
                    <div className="radial-result-fullshell__grid">
                      <div />
                      <div />
                      <div />
                      <div />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeWedge.id === "voice" && (
              <div className="radial-result-voice">
                <div className="radial-result-voice__wave">
                  <div className="radial-result-voice__bars">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <span key={i} style={{ animationDelay: `${i * 60}ms` }} />
                    ))}
                  </div>
                </div>
                <div className="radial-result-minishell radial-result-minishell--voice">
                  <div className="radial-result-minishell__badge">Voice transcription</div>
                  <div className="radial-result-minishell__bubble radial-result-minishell__bubble--user">
                    &ldquo;Add the quarterly budget numbers to my meeting notes&rdquo;
                  </div>
                  <div className="radial-result-minishell__composer">
                    <Search size={13} />
                    <span>Listening...</span>
                  </div>
                </div>
              </div>
            )}

            {activeWedge.id === "auto" && (
              <div className="radial-result-autopanel">
                <div className="radial-result-autopanel__header">
                  <Sparkles size={13} />
                  <span>Stella Auto</span>
                </div>
                <h4>Article summary</h4>
                <p>This piece examines how companies are rethinking office culture, with data on productivity and employee preferences.</p>
                <div className="radial-result-autopanel__rule" />
                <h5>Key takeaways</h5>
                <ul>
                  <li>Hybrid models outperform full-remote</li>
                  <li>Employee satisfaction up 23% with flexibility</li>
                  <li>Most companies plan permanent changes</li>
                </ul>
              </div>
            )}
          </div>

          <div className="radial-desktop-mock__dock" aria-hidden="true">
            {RADIAL_WEDGES.map((wedge, index) => {
              const Icon = wedge.icon;
              return (
                <span
                  key={`${wedge.id}-dock`}
                  className="radial-desktop-mock__dock-item"
                  data-active={selectedIndex === index || undefined}
                >
                  <Icon size={14} />
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
