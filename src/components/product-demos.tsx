"use client";

import {
  AppWindow,
  ArrowUp,
  Camera,
  Maximize2,
  MessageSquare,
  Mic,
  PanelRightOpen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { StellaAnimation } from "@/components/stella-animation/stella-animation";
import {
  cancelAnimation,
  destroyBlob,
  initBlob,
  startAmbientLoop,
  startOpen,
  type BlobColors,
} from "@/components/stella-demos/radial-blob";

type RadialWedgeId = "capture" | "chat" | "full" | "voice" | "auto";
type SelfModLevel = "low" | "medium" | "high";
type WorkspaceStageId = "plan" | "review" | "ship";

type RadialWedge = {
  id: RadialWedgeId;
  label: string;
  icon: LucideIcon;
  detail: string;
};

type SelfModStage = {
  id: SelfModLevel;
  title: string;
  prompt: string;
  summary: string;
  changes: string[];
};

type WorkspaceStage = {
  id: WorkspaceStageId;
  label: string;
  title: string;
  summary: string;
  bullets: string[];
  suggestions: { title: string; category: string; detail: string }[];
  activity: {
    id: string;
    kind: string;
    name: string;
    time: string;
    status: "ok" | "running" | "canceled";
    preview: string;
  }[];
};

const RADIAL_SIZE = 280;
const RADIAL_CENTER = RADIAL_SIZE / 2;
const INNER_RADIUS = 40;
const OUTER_RADIUS = 125;
const WEDGE_ANGLE = 72;
const CENTER_BG_RADIUS = INNER_RADIUS - 5;

const RADIAL_WEDGES: RadialWedge[] = [
  { id: "capture", label: "Capture", icon: Camera, detail: "Grab any region and turn it into context." },
  { id: "chat", label: "Chat", icon: MessageSquare, detail: "Jump into a thread without losing the page." },
  { id: "full", label: "Full", icon: Maximize2, detail: "Open the whole workspace when you need room." },
  { id: "voice", label: "Voice", icon: Mic, detail: "Dictate instructions from anywhere on your desktop." },
  { id: "auto", label: "Auto", icon: Sparkles, detail: "Hand work off and let Stella keep moving." },
];

const RADIAL_VECTOR_PALETTE = {
  base: [0.93, 0.96, 1] as [number, number, number],
  selected: [0.17, 0.48, 0.95] as [number, number, number],
  center: [0.95, 0.97, 1] as [number, number, number],
  stroke: [0.64, 0.73, 0.9] as [number, number, number],
};

const SELF_MOD_STAGES: SelfModStage[] = [
  {
    id: "low",
    title: "Low",
    prompt: 'Make my messages blue',
    summary: "Small, local edits happen in place without disturbing the rest of the app.",
    changes: ["chat bubbles update", "composer action recolors", "existing layout stays put"],
  },
  {
    id: "medium",
    title: "Medium",
    prompt: "Make the chat feel more modern",
    summary: "Stella can reshape spacing, depth, and rhythm while the conversation keeps flowing.",
    changes: ["glass card shell", "message spacing loosens", "composer rounds and lifts"],
  },
  {
    id: "high",
    title: "High",
    prompt: "Give everything a cozy cat theme",
    summary: "Full-surface transformations can ripple through the interface, including navigation and chrome.",
    changes: ["theme tokens rewrite", "bottom bar appears", "chat surface morphs into a themed app"],
  },
];

const SELF_MOD_MESSAGES: Record<SelfModLevel, { role: "stella" | "user"; text: string }[]> = {
  low: [
    { role: "stella", text: "I can change the interface live while we talk." },
    { role: "user", text: "Make my messages blue." },
    { role: "stella", text: "Done. This stays intentionally local so your workflow does not jump around." },
  ],
  medium: [
    { role: "stella", text: "I can make bigger UI changes without pulling you out of context." },
    { role: "user", text: "Make the chat feel more modern." },
    { role: "stella", text: "Updating the shell, spacing, and composer so the whole surface feels newer." },
  ],
  high: [
    { role: "stella", text: "If you want, I can rework the whole app theme live." },
    { role: "user", text: "Give everything a cozy cat theme." },
    { role: "stella", text: "Applying a full visual pass, including the conversation shell and bottom navigation." },
  ],
};

const WORKSPACE_STAGES: WorkspaceStage[] = [
  {
    id: "plan",
    label: "Canvas",
    title: "Map the radial dial launch with live planning",
    summary: "Stella turns rough prompts into a working canvas with scoped tasks, UX notes, and the next concrete move.",
    bullets: ["Break out wedge behavior", "Carry over the desktop motion system", "Keep layout parity with the landing page"],
    suggestions: [
      { title: "Draft launch notes", category: "chronicle", detail: "Summarize the dial decisions for the team." },
      { title: "Generate a test matrix", category: "review", detail: "Cover desktop sizing, mobile fallback, and motion." },
      { title: "Open the animation files", category: "ui", detail: "Jump straight to the orb and radial sources." },
    ],
    activity: [
      {
        id: "a",
        kind: "Task",
        name: "Scope the marketing demo section",
        time: "2m ago",
        status: "ok",
        preview: "Structured the new demos section around three product surfaces.",
      },
      {
        id: "b",
        kind: "Scheduled",
        name: "Re-run layout snapshot checks",
        time: "in 8m",
        status: "running",
        preview: "Watching desktop breakpoints while the new demos land.",
      },
      {
        id: "c",
        kind: "Task",
        name: "Review hero spacing constraints",
        time: "12m ago",
        status: "canceled",
        preview: "No spacing regressions found. Keeping the orb fully background-only.",
      },
    ],
  },
  {
    id: "review",
    label: "Chronicle",
    title: "Watch changes collect into a readable review surface",
    summary: "The canvas stays legible while Stella records decisions, gathers implementation notes, and keeps the active thread clean.",
    bullets: ["Group findings by risk", "Track files and prompts", "Leave a handoff another person can actually use"],
    suggestions: [
      { title: "Open last session summary", category: "chronicle", detail: "Bring forward the latest rationale and changes." },
      { title: "Review self-mod diffs", category: "review", detail: "Compare the medium and high transformation passes." },
      { title: "Write QA checklist", category: "ui", detail: "Turn the review into a release-ready signoff list." },
    ],
    activity: [
      {
        id: "d",
        kind: "Task",
        name: "Compile self-mod findings",
        time: "1m ago",
        status: "running",
        preview: "Collecting visual regressions and motion notes into one review thread.",
      },
      {
        id: "e",
        kind: "Monitoring",
        name: "Ultra-wide layout watcher",
        time: "in 16m",
        status: "ok",
        preview: "No drift across the 1600px to 2560px range after the latest pass.",
      },
      {
        id: "f",
        kind: "Task",
        name: "Prepare launch copy",
        time: "24m ago",
        status: "ok",
        preview: "Updated the homepage language to stay Stella-specific instead of Amp-like.",
      },
    ],
  },
  {
    id: "ship",
    label: "Activity",
    title: "Keep the whole workspace moving while Stella executes",
    summary: "Suggestions, active tasks, and the main canvas stay synchronized so execution feels visible instead of opaque.",
    bullets: ["Parallel work stays readable", "Next actions remain attached to context", "The app feels alive without feeling noisy"],
    suggestions: [
      { title: "Ship the demo refresh", category: "release", detail: "Bundle the new demos section and validate production." },
      { title: "Snapshot the hero + demos", category: "qa", detail: "Capture desktop and mobile approval views." },
      { title: "Open outstanding tasks", category: "activity", detail: "Move straight from the feed into the working thread." },
    ],
    activity: [
      {
        id: "g",
        kind: "Task",
        name: "Build production bundle",
        time: "just now",
        status: "running",
        preview: "Running the final Next.js build with the new interactive demos.",
      },
      {
        id: "h",
        kind: "Task",
        name: "Lint the marketing surfaces",
        time: "5m ago",
        status: "ok",
        preview: "All new showcase components passed static checks.",
      },
      {
        id: "i",
        kind: "Scheduled",
        name: "Post-release demo capture",
        time: "in 23m",
        status: "ok",
        preview: "Queued a final screenshot pass for the homepage gallery.",
      },
    ],
  },
];

function createWedgePath(startAngle: number, endAngle: number): string {
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  const x1 = RADIAL_CENTER + INNER_RADIUS * Math.cos(startRad);
  const y1 = RADIAL_CENTER + INNER_RADIUS * Math.sin(startRad);
  const x2 = RADIAL_CENTER + OUTER_RADIUS * Math.cos(startRad);
  const y2 = RADIAL_CENTER + OUTER_RADIUS * Math.sin(startRad);
  const x3 = RADIAL_CENTER + OUTER_RADIUS * Math.cos(endRad);
  const y3 = RADIAL_CENTER + OUTER_RADIUS * Math.sin(endRad);
  const x4 = RADIAL_CENTER + INNER_RADIUS * Math.cos(endRad);
  const y4 = RADIAL_CENTER + INNER_RADIUS * Math.sin(endRad);

  return `
    M ${x1} ${y1}
    L ${x2} ${y2}
    A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${x3} ${y3}
    L ${x4} ${y4}
    A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${x1} ${y1}
    Z
  `;
}

function getContentPosition(index: number) {
  const midAngle = (index * WEDGE_ANGLE + WEDGE_ANGLE / 2 - 90) * (Math.PI / 180);
  const contentRadius = (INNER_RADIUS + OUTER_RADIUS) / 2;
  return {
    x: RADIAL_CENTER + contentRadius * Math.cos(midAngle),
    y: RADIAL_CENTER + contentRadius * Math.sin(midAngle),
  };
}

const RADIAL_LAYOUT = RADIAL_WEDGES.map((wedge, index) => ({
  ...wedge,
  path: createWedgePath(index * WEDGE_ANGLE, (index + 1) * WEDGE_ANGLE),
  position: getContentPosition(index),
}));

function DashboardCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <span className="dashboard-card-label">{label}</span>
      </div>
      <div className="dashboard-card-body">{children}</div>
    </div>
  );
}

function createBlobColors(selectedIndex: number): BlobColors {
  return {
    fills: RADIAL_WEDGES.map((_, index) =>
      index === selectedIndex ? RADIAL_VECTOR_PALETTE.selected : RADIAL_VECTOR_PALETTE.base,
    ),
    selectedFill: RADIAL_VECTOR_PALETTE.selected,
    centerBg: RADIAL_VECTOR_PALETTE.center,
    stroke: RADIAL_VECTOR_PALETTE.stroke,
  };
}

function RadialDialShowcase() {
  const [selectedIndex, setSelectedIndex] = useState(4);
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedIdxRef = useRef(selectedIndex);
  const colorsRef = useRef<BlobColors>(createBlobColors(selectedIndex));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSelectedIndex((current) => (current + 1) % RADIAL_WEDGES.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    selectedIdxRef.current = selectedIndex;
    colorsRef.current = createBlobColors(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
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
      cancelAnimation();
      destroyBlob();
    };
  }, []);

  const activeWedge = RADIAL_WEDGES[selectedIndex];

  return (
    <div className="radial-demo">
      <div className="radial-demo__surface">
        <div className="radial-shell">
          <div className="radial-dial-container">
            <canvas
              ref={canvasRef}
              className="radial-blob-canvas"
              style={{ width: RADIAL_SIZE, height: RADIAL_SIZE }}
            />

            <div
              className={`radial-dial-frame${isVisible ? " radial-dial-frame--visible" : ""}`}
              aria-hidden="true"
            >
              <svg width={RADIAL_SIZE} height={RADIAL_SIZE} viewBox={`0 0 ${RADIAL_SIZE} ${RADIAL_SIZE}`} className="radial-dial">
                {RADIAL_LAYOUT.map((wedge, index) => {
                  const isSelected = selectedIndex === index;

                  return (
                    <path
                      key={wedge.id}
                      d={wedge.path}
                      fill={isSelected ? "rgba(29, 120, 242, 0.9)" : "rgba(250, 252, 255, 0.72)"}
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
                <StellaAnimation width={20} height={20} initialBirthProgress={1} maxDpr={1} frameSkip={1} />
              </div>
            </div>
          </div>
        </div>

        <div className="radial-demo__halo radial-demo__halo--one" />
        <div className="radial-demo__halo radial-demo__halo--two" />
      </div>

      <div className="radial-demo__meta">
        <div className="demo-eyebrow">Desktop overlay</div>
        <h3>Radial dial, exactly where you need it</h3>
        <p>{activeWedge.detail}</p>

        <ul className="demo-chip-list">
          {RADIAL_WEDGES.map((wedge, index) => (
            <li key={wedge.id} data-active={selectedIndex === index || undefined}>
              {wedge.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SelfModificationShowcase() {
  const [index, setIndex] = useState(0);
  const [isMorphing, setIsMorphing] = useState(false);
  const morphTimeoutRef = useRef<number | null>(null);
  const activeStage = SELF_MOD_STAGES[index];
  const messages = SELF_MOD_MESSAGES[activeStage.id];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsMorphing(true);
      if (morphTimeoutRef.current !== null) {
        window.clearTimeout(morphTimeoutRef.current);
      }
      morphTimeoutRef.current = window.setTimeout(() => {
        setIsMorphing(false);
        morphTimeoutRef.current = null;
      }, 320);
      setIndex((current) => (current + 1) % SELF_MOD_STAGES.length);
    }, 2800);
    return () => {
      window.clearInterval(timer);
      if (morphTimeoutRef.current !== null) {
        window.clearTimeout(morphTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="selfmod-layout">
      <div
        className="onboarding-dialogue selfmod-dialogue"
        data-selfmod-demo={activeStage.id}
        data-selfmod-fading={isMorphing || undefined}
      >
        <div className="onboarding-mock-app">
          <div className="onboarding-mock-main">
            <div className="onboarding-chat-messages">
              {messages.map((message, messageIndex) => (
                <div
                  key={`${activeStage.id}-${messageIndex}`}
                  className={`onboarding-chat-msg onboarding-chat-msg--${message.role}`}
                >
                  <span className="onboarding-chat-bubble">{message.text}</span>
                </div>
              ))}

              <div className="onboarding-chat-msg onboarding-chat-msg--stella">
                <span className="onboarding-chat-typing">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>

            <div className="onboarding-chat-composer">
              <span className="onboarding-chat-input">{activeStage.prompt}</span>
              <button className="onboarding-chat-send" type="button" aria-label="Apply self-modification">
                <ArrowUp size={14} strokeWidth={2.5} />
              </button>
            </div>

            {activeStage.id === "high" && (
              <nav className="onboarding-bottom-bar" aria-hidden="true">
                <div className="onboarding-bottom-bar-item">
                  <AppWindow size={18} strokeWidth={1.8} />
                  <span>Apps</span>
                </div>
                <div className="onboarding-bottom-bar-item onboarding-bottom-bar-item--active">
                  <MessageSquare size={18} strokeWidth={1.8} />
                  <span>Chat</span>
                </div>
                <div className="onboarding-bottom-bar-item">
                  <PanelRightOpen size={18} strokeWidth={1.8} />
                  <span>Connect</span>
                </div>
                <div className="onboarding-bottom-bar-item">
                  <Sparkles size={18} strokeWidth={1.8} />
                  <span>Theme</span>
                </div>
              </nav>
            )}
          </div>
        </div>
      </div>

      <div className="selfmod-meta">
        <div className="demo-eyebrow">Live self-modification</div>
        <h3>Morph the product while it is running</h3>
        <p>{activeStage.summary}</p>

        <div className="selfmod-stage-list" role="tablist" aria-label="Self-modification levels">
          {SELF_MOD_STAGES.map((stage, stageIndex) => (
            <div
              key={stage.id}
              className="selfmod-stage-card"
              data-active={stageIndex === index || undefined}
            >
              <span>{stage.title}</span>
              <strong>{stage.prompt}</strong>
            </div>
          ))}
        </div>

        <div className="selfmod-stream">
          <div className="selfmod-stream__header">
            <span>Live patch</span>
            <span>{activeStage.id}.theme</span>
          </div>
          {activeStage.changes.map((change) => (
            <div key={change} className="selfmod-stream__row">
              <span>apply</span>
              <p>{change}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkspaceShowcase() {
  const [index, setIndex] = useState(0);
  const stage = WORKSPACE_STAGES[index];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % WORKSPACE_STAGES.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const stageTabs = useMemo(
    () =>
      WORKSPACE_STAGES.map((entry, stageIndex) => (
        <button
          key={entry.id}
          type="button"
          className="workspace-stage-tab"
          data-active={stageIndex === index || undefined}
          onClick={() => setIndex(stageIndex)}
        >
          {entry.label}
        </button>
      )),
    [index],
  );

  return (
    <div className="home-root workspace-preview" data-stella-view="home" data-stella-label="Home Dashboard">
      <div className="home-dashboard">
        <div className="home-zone-canvas">
          <DashboardCard label="Canvas">
            <div className="workspace-canvas">
              <div className="workspace-stage-tabs">{stageTabs}</div>

              <div className="canvas-display workspace-document">
                <h1>{stage.title}</h1>
                <p>{stage.summary}</p>

                <div className="workspace-document__grid">
                  <div className="workspace-document__card">
                    <h3>Current pass</h3>
                    <ul>
                      {stage.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="workspace-document__card workspace-document__card--accent">
                    <h3>Why this matters</h3>
                    <p>
                      Stella keeps the plan, the active work, and the surrounding context
                      in one place so progress is visible at a glance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        <div className="home-zone-sidebar">
          <DashboardCard label="Suggestions">
            <div className="workspace-suggestions">
              {stage.suggestions.map((suggestion) => (
                <div key={suggestion.title} className="workspace-suggestion-card">
                  <div className="workspace-suggestion-card__header">
                    <span>{suggestion.title}</span>
                    <em>{suggestion.category}</em>
                  </div>
                  <p>{suggestion.detail}</p>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard label="Activity">
            <div className="activity-feed-list">
              {stage.activity.map((item) => (
                <div key={item.id} className="activity-feed-item" data-status={item.status}>
                  <div className="activity-feed-header">
                    <span className="activity-feed-name">{item.name}</span>
                    <span className="activity-feed-time">{item.time}</span>
                  </div>
                  <div className="activity-feed-meta">
                    <span className="activity-feed-kind">{item.kind}</span>
                  </div>
                  <div className="activity-feed-preview">{item.preview}</div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

export function ProductDemos() {
  return (
    <div className="demo-showcase-grid">
      <article className="demo-panel demo-panel--wide reveal">
        <div className="demo-panel__header">
          <div className="section-kicker section-kicker--compact">
            <span>Demos</span>
            <h3>Self-modification that keeps up with you</h3>
          </div>
          <p className="demo-panel__lede">
            Stella can reshape its own interface in real time, from small local edits to full-surface theme changes.
          </p>
        </div>
        <SelfModificationShowcase />
      </article>

      <article className="demo-panel reveal reveal-delay-1">
        <div className="demo-panel__header demo-panel__header--tight">
          <div className="section-kicker section-kicker--compact">
            <span>Overlay</span>
            <h3>Radial dial showcase</h3>
          </div>
        </div>
        <RadialDialShowcase />
      </article>

      <article className="demo-panel demo-panel--full reveal reveal-delay-2">
        <div className="demo-panel__header">
          <div className="section-kicker section-kicker--compact">
            <span>Workspace</span>
            <h3>Canvas, suggestions, and activity in one surface</h3>
          </div>
          <p className="demo-panel__lede">
            Another important Stella trait is that execution does not disappear behind a spinner. The workspace stays alive while it plans, reviews, and ships.
          </p>
        </div>
        <WorkspaceShowcase />
      </article>
    </div>
  );
}
