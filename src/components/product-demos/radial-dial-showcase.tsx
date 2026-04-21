"use client";

import { Search, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { runVacuumEffect } from "@/components/stella-demos/region-capture-vacuum";
import { makeCaptureThumbnail } from "./capture-thumbnail";
import { RADIAL_WEDGES } from "./data";
import { StellaSidebar } from "./stella-shell";

const MENU_PHASE_MS = 1800;

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

export function RadialDialVisual({
  selectedIndex,
  isActive,
}: {
  selectedIndex: number;
  isActive: boolean;
}) {
  const [phase, setPhase] = useState<"menu" | "result">("menu");

  // Reset phase cycle when selectedIndex changes
  useEffect(() => {
    if (!isActive) return;
    setPhase("menu");
    const timer = window.setTimeout(() => {
      setPhase("result");
    }, MENU_PHASE_MS);
    return () => window.clearTimeout(timer);
  }, [selectedIndex, isActive]);

  const activeWedge = RADIAL_WEDGES[selectedIndex];
  const showMenu = isActive && phase === "menu";
  const showResult = isActive && phase === "result";

  return (
    <div className="radial-demo radial-demo--visual-only">
      <div className="radial-desktop-mock">
        <div className="radial-desktop-mock__titlebar">
          <div className="radial-desktop-mock__traffic">
            <span />
            <span />
            <span />
          </div>
          <div className="radial-desktop-mock__chrome">
            <strong>Stella quick menu</strong>
            <span>⌘ / Ctrl + right-click anywhere</span>
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

          <div
            className={`radial-desktop-mock__menu${
              showMenu ? " radial-desktop-mock__menu--visible" : ""
            }`}
            aria-hidden="true"
          >
            <div className="quickmenu" role="menu" aria-label="Stella quick menu">
              <div className="quickmenu__hint">⌘ + right-click</div>
              <ul className="quickmenu__list">
                {RADIAL_WEDGES.map((wedge, index) => {
                  const Icon = wedge.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <li
                      key={wedge.id}
                      className="quickmenu__item"
                      data-selected={isSelected || undefined}
                      role="menuitem"
                    >
                      <Icon size={14} aria-hidden="true" />
                      <span>{wedge.label}</span>
                    </li>
                  );
                })}
              </ul>
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
                  <StellaSidebar className="radial-result-fullshell__sidebar" />
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
