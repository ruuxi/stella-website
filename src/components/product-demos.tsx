"use client";

import Image from "next/image";
import {
  Camera,
  FolderGit2,
  House,
  LayoutGrid,
  Maximize2,
  MessageSquare,
  Mic,
  Search,
  Send,
  Settings2,
  Sparkles,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { isWebglMorphSupported, runSelfmodWebglMorph } from "@/lib/selfmod-webgl-morph";
import { StellaAnimation } from "@/components/stella-animation/stella-animation";
import {
  cancelAnimation,
  destroyBlob,
  initBlob,
  startAmbientLoop,
  startOpen,
  type BlobColors,
} from "@/components/stella-demos/radial-blob";
import { runVacuumEffect } from "@/components/stella-demos/region-capture-vacuum";

type RadialWedgeId = "capture" | "chat" | "full" | "voice" | "auto";
type SelfModLevel = "low" | "medium" | "high";

type RadialWedge = {
  id: RadialWedgeId;
  label: string;
  icon: LucideIcon;
  heading: string;
  detail: string;
};

type SelfModStage = {
  id: SelfModLevel;
  title: string;
  prompt: string;
};

type CanvasConcept = {
  id: string;
  label: string;
  title: string;
  blurb: string;
  nodes: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    meta: string;
    tone: "blue" | "cyan" | "mint" | "slate";
  }[];
  links: { from: string; to: string }[];
  activity: {
    id: string;
    name: string;
    meta: string;
    status: "running" | "ok" | "scheduled";
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
  {
    id: "capture",
    label: "Capture",
    icon: Camera,
    heading: "Capture the active window with one motion",
    detail:
      "Capture should feel like Stella reaches into the exact surface under your cursor, lifts it out, and turns it into context without an extra setup step.",
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    heading: "Open chat that already knows what you are on",
    detail:
      "The mini shell should badge the current app or page, so Stella starts from the right window instead of asking you to restate your context.",
  },
  {
    id: "full",
    label: "Full",
    icon: Maximize2,
    heading: "Expand the overlay into the full Stella shell",
    detail:
      "Full mode should feel like the same session growing into the complete application, with the workspace, sidebar, and tasks ready in place.",
  },
  {
    id: "voice",
    label: "Voice",
    icon: Mic,
    heading: "Dictate directly into the work surface",
    detail:
      "Voice is instant input anywhere. Stella listens, transcribes cleanly, and lands the text where you are already working without mode friction.",
  },
  {
    id: "auto",
    label: "Auto",
    icon: Sparkles,
    heading: "Summarize and explain the page instantly",
    detail:
      "Auto should appear like a smart edge panel that has already read the screen and pulled out the decisions, risks, and next actions that matter.",
  },
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
    prompt: "Make my messages blue.",
  },
  {
    id: "medium",
    title: "Medium",
    prompt: "Make the app feel more modern.",
  },
  {
    id: "high",
    title: "High",
    prompt: "Turn this into a cozy cat-themed shell.",
  },
];

const SELF_MOD_MESSAGES: Record<SelfModLevel, { role: "stella" | "user"; text: string }[]> = {
  low: [
    { role: "stella", text: "I can update the interface while we keep working." },
    { role: "user", text: "Make my messages blue." },
    { role: "stella", text: "Done. The change stays intentionally focused on the conversation layer." },
  ],
  medium: [
    { role: "stella", text: "I can change the whole shell language, not just one control." },
    { role: "user", text: "Make the app feel more modern." },
    { role: "stella", text: "Refreshing spacing, borders, and glass treatment across the active workspace." },
  ],
  high: [
    { role: "stella", text: "I can take bigger creative swings if you want the whole app to transform." },
    { role: "user", text: "Turn this into a cozy cat-themed shell." },
    {
      role: "stella",
      text: "Done — warm cream surfaces, toasted-orange accents, and soft paw-pad corners on bubbles and chrome.",
    },
  ],
};

const CANVAS_CONCEPTS: CanvasConcept[] = [
  {
    id: "launch",
    label: "Dial",
    title: "Generative canvas mapping the radial launch flow",
    blurb:
      "The canvas should turn the product ask into a connected system map while the shell keeps active tasks and scheduled follow-ups visible beside it.",
    nodes: [
      { id: "capture", x: 34, y: 46, width: 158, height: 68, title: "Capture source window", meta: "ingest live context", tone: "blue" },
      { id: "chat", x: 236, y: 32, width: 170, height: 72, title: "Mini shell handoff", meta: "window-aware prompts", tone: "cyan" },
      { id: "auto", x: 454, y: 44, width: 172, height: 70, title: "Auto side panel", meta: "summaries and actions", tone: "mint" },
      { id: "plan", x: 136, y: 176, width: 198, height: 88, title: "Demo sequencing", meta: "copy and layout decisions", tone: "slate" },
      { id: "shell", x: 398, y: 186, width: 216, height: 86, title: "Full-shell expansion", meta: "workspace transition", tone: "blue" },
    ],
    links: [
      { from: "capture", to: "plan" },
      { from: "chat", to: "plan" },
      { from: "auto", to: "shell" },
      { from: "plan", to: "shell" },
    ],
    activity: [
      { id: "a", name: "Radial showcase", meta: "running now", status: "running", preview: "Cycling through Capture, Chat, Full, Voice, and Auto states." },
      { id: "b", name: "Wide-screen pass", meta: "scheduled in 12m", status: "scheduled", preview: "Re-check the stacked demo balance at 1440px and 2560px widths." },
      { id: "c", name: "Homepage copy", meta: "completed", status: "ok", preview: "Product language is aligned to Stella instead of carrying over Amp-specific terms." },
    ],
  },
  {
    id: "agents",
    label: "Agents",
    title: "Canvas showing how Stella spreads work across the shell",
    blurb:
      "This view is about coordinated execution: the diagram explains the system, while the right rail shows what is running right now and what is queued next.",
    nodes: [
      { id: "thread", x: 28, y: 48, width: 170, height: 74, title: "Conversation thread", meta: "core instruction flow", tone: "slate" },
      { id: "worker-a", x: 248, y: 34, width: 166, height: 72, title: "Worker A", meta: "radial interaction states", tone: "blue" },
      { id: "worker-b", x: 456, y: 42, width: 166, height: 72, title: "Worker B", meta: "shell and canvas polish", tone: "cyan" },
      { id: "review", x: 140, y: 180, width: 190, height: 86, title: "Review surface", meta: "group issues by risk", tone: "mint" },
      { id: "ship", x: 396, y: 190, width: 214, height: 84, title: "Build and ship", meta: "verify, stage, commit", tone: "blue" },
    ],
    links: [
      { from: "thread", to: "worker-a" },
      { from: "thread", to: "worker-b" },
      { from: "worker-a", to: "review" },
      { from: "worker-b", to: "review" },
      { from: "review", to: "ship" },
    ],
    activity: [
      { id: "d", name: "Implementation summary", meta: "running now", status: "running", preview: "Keeping the code changes understandable while UI work lands." },
      { id: "e", name: "Shell visual audit", meta: "scheduled in 7m", status: "scheduled", preview: "Inspect sidebar contrast, chrome spacing, and motion pacing." },
      { id: "f", name: "Task grouping", meta: "completed", status: "ok", preview: "Activity rail now favors current work and scheduled follow-ups over extra noise." },
    ],
  },
  {
    id: "timeline",
    label: "Flow",
    title: "Canvas turning rough asks into a structured execution map",
    blurb:
      "The shell should make Stella feel active and generative at the same time: concepts appear on the canvas while the task rail tracks what is in progress or already planned.",
    nodes: [
      { id: "hero", x: 34, y: 46, width: 152, height: 68, title: "Theme direction", meta: "liquid glass palette", tone: "slate" },
      { id: "demo", x: 236, y: 34, width: 186, height: 76, title: "Demo stack", meta: "self-mod, radial, shell", tone: "blue" },
      { id: "assets", x: 470, y: 44, width: 150, height: 70, title: "Desktop assets", meta: "orb, capture, shell", tone: "cyan" },
      { id: "verify", x: 138, y: 182, width: 194, height: 86, title: "Verification", meta: "lint, build, screenshots", tone: "mint" },
      { id: "ship", x: 404, y: 192, width: 198, height: 82, title: "Release", meta: "scope and polish", tone: "blue" },
    ],
    links: [
      { from: "hero", to: "demo" },
      { from: "assets", to: "demo" },
      { from: "demo", to: "verify" },
      { from: "verify", to: "ship" },
    ],
    activity: [
      { id: "g", name: "Production build", meta: "running now", status: "running", preview: "Compiling the landing page with the new stacked demo surfaces." },
      { id: "h", name: "Final spacing pass", meta: "scheduled in 18m", status: "scheduled", preview: "Tune the shell proportions on desktop and wider screens." },
      { id: "i", name: "Scoped changes", meta: "completed", status: "ok", preview: "Reference material and scratch files stayed outside the product changes." },
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

function WindowFrame({
  kind,
  title,
  meta,
  children,
}: {
  kind: "browser" | "app";
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <div className={`mode-window mode-window--${kind}`}>
      <div className="mode-window__titlebar">
        <div className="mode-window__traffic">
          <span />
          <span />
          <span />
        </div>
        <div className="mode-window__chrome">
          <strong>{title}</strong>
          <span>{meta}</span>
        </div>
      </div>
      <div className="mode-window__body">{children}</div>
    </div>
  );
}

function AutoModePreview() {
  return (
    <WindowFrame kind="browser" title="docs.stripe.com" meta="Pricing migration guide">
      <div className="mock-browser-page">
        <div className="mock-browser-page__nav">
          <span>Billing</span>
          <span>Pricing</span>
          <span>Metered usage</span>
        </div>
        <div className="mock-browser-page__hero">
          <div className="mock-browser-page__eyebrow">Migration</div>
          <h4>Usage-based billing rollout</h4>
          <p>Metered prices can now be updated without rebuilding the subscription from scratch.</p>
        </div>
        <div className="mock-browser-page__section">
          <span>Highlights</span>
          <p>Proration rules changed, usage event ingestion moved earlier, and the customer portal inherits the new prices automatically.</p>
        </div>
      </div>

      <div className="auto-panel-preview">
        <div className="auto-panel-preview__header">
          <span>Auto</span>
          <span>Stripe Billing</span>
        </div>
        <div className="auto-panel-preview__content">
          <h4>What Stella sees on this page</h4>
          <p>The guide explains how to move existing plans to metered usage and where proration behavior now changes customer invoices.</p>
          <div className="auto-panel-preview__rule" />
          <h5>Suggested next actions</h5>
          <ul>
            <li>Summarize the rollout impact for product and finance.</li>
            <li>Extract the code example for usage record ingestion.</li>
            <li>Draft a safe migration checklist for production.</li>
          </ul>
        </div>
      </div>
    </WindowFrame>
  );
}

function VoiceModePreview() {
  return (
    <WindowFrame kind="app" title="Stella Voice" meta="Global dictation">
      <div className="voice-preview">
        <div className="voice-preview__document">
          <span className="voice-preview__label">Current note</span>
          <h4>Homepage demo polish</h4>
          <p>Keep the radial dial separate, widen self modification, and make each mode feel like a real product surface.</p>
        </div>

        <div className="voice-preview__bar">
          <div className="voice-preview__orb">
            <StellaAnimation width={14} height={14} initialBirthProgress={1} maxDpr={1} frameSkip={1} />
          </div>
          <div className="voice-preview__transcript">
            &ldquo;move the radial dial below self modification and add the capture vacuum preview&rdquo;
          </div>
          <button type="button" className="voice-preview__send" aria-label="Send dictation">
            <Send size={13} />
          </button>
        </div>
      </div>
    </WindowFrame>
  );
}

function FullModePreview() {
  return (
    <div className="full-mode-preview">
      <div className="mini-shell-preview">
        <div className="mini-shell-preview__badge">Current window: `demo-shell.tsx`</div>
        <div className="mini-shell-preview__input">
          <SquareTerminal size={15} />
          <span>Open Stella full</span>
        </div>
      </div>

      <div className="full-shell-preview-card">
        <div className="full-shell-preview-card__titlebar">
          <span />
          <strong>Stella</strong>
          <em>full shell</em>
        </div>
        <div className="full-shell-preview-card__body">
          <aside className="full-shell-preview-card__sidebar">
            <div className="full-shell-preview-card__brand">
              <Image src="/stella-logo.svg" alt="" width={20} height={20} />
              <span>STELLA</span>
            </div>
            <div className="full-shell-preview-card__nav">
              <button type="button" data-active>
                <House size={15} />
                <span>Home</span>
              </button>
              <button type="button">
                <MessageSquare size={15} />
                <span>Chat</span>
              </button>
              <button type="button">
                <LayoutGrid size={15} />
                <span>Apps</span>
              </button>
            </div>
          </aside>
          <div className="full-shell-preview-card__workspace">
            <div className="full-shell-preview-card__canvas">
              <div className="full-shell-preview-card__status">Session expands straight into the full shell.</div>
              <div className="full-shell-preview-card__grid">
                <div />
                <div />
                <div />
                <div />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatModePreview() {
  return (
    <WindowFrame kind="app" title="Mini shell" meta="window-aware chat">
      <div className="mini-chat-preview">
        <div className="mini-chat-preview__badge">Window: Stripe Dashboard</div>
        <div className="mini-chat-preview__bubble mini-chat-preview__bubble--stella">
          I already know you are on the subscription pricing page.
        </div>
        <div className="mini-chat-preview__bubble mini-chat-preview__bubble--user">
          Explain the proration change in plain English.
        </div>
        <div className="mini-chat-preview__composer">
          <Search size={14} />
          <span>Ask Stella about this page...</span>
        </div>
      </div>
    </WindowFrame>
  );
}

function makeCaptureThumbnail(): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="620" height="390" viewBox="0 0 620 390">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#eef5ff"/>
          <stop offset="100%" stop-color="#dbe9fb"/>
        </linearGradient>
      </defs>
      <rect width="620" height="390" rx="26" fill="#f7fbff"/>
      <rect x="0" y="0" width="620" height="56" rx="26" fill="#edf4ff"/>
      <circle cx="34" cy="28" r="8" fill="#f59e0b"/>
      <circle cx="58" cy="28" r="8" fill="#60a5fa"/>
      <circle cx="82" cy="28" r="8" fill="#34d399"/>
      <rect x="122" y="16" width="366" height="24" rx="12" fill="#ffffff"/>
      <rect x="32" y="84" width="556" height="274" rx="22" fill="url(#bg)"/>
      <rect x="56" y="112" width="198" height="154" rx="18" fill="#ffffff"/>
      <rect x="278" y="112" width="286" height="66" rx="18" fill="#ffffff"/>
      <rect x="278" y="198" width="286" height="134" rx="18" fill="#ffffff"/>
      <rect x="78" y="134" width="104" height="12" rx="6" fill="#bfd6fb"/>
      <rect x="78" y="156" width="138" height="10" rx="5" fill="#d8e7fd"/>
      <rect x="78" y="176" width="122" height="10" rx="5" fill="#d8e7fd"/>
      <rect x="78" y="204" width="86" height="38" rx="12" fill="#8eb7ff"/>
      <rect x="300" y="134" width="110" height="12" rx="6" fill="#bfd6fb"/>
      <rect x="300" y="156" width="224" height="10" rx="5" fill="#d8e7fd"/>
      <rect x="300" y="220" width="200" height="12" rx="6" fill="#bfd6fb"/>
      <rect x="300" y="244" width="232" height="10" rx="5" fill="#d8e7fd"/>
      <rect x="300" y="266" width="212" height="10" rx="5" fill="#d8e7fd"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function CaptureModePreview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    void runVacuumEffect(canvas, makeCaptureThumbnail(), 0.72, 0.34).then(() => {
      if (cancelled) return;
      window.setTimeout(() => {
        if (!cancelled && canvas) {
          const context = canvas.getContext("2d");
          context?.clearRect(0, 0, canvas.width, canvas.height);
        }
      }, 120);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <WindowFrame kind="browser" title="app.vercel.com" meta="capture overlay">
      <div className="capture-preview">
        <div className="capture-preview__hint">Click to capture window</div>
        <div className="capture-preview__window">
          <div className="capture-preview__toolbar" />
          <div className="capture-preview__thumb" />
          <canvas ref={canvasRef} className="capture-preview__vacuum" />
        </div>
      </div>
    </WindowFrame>
  );
}

function RadialModePreview({ mode }: { mode: RadialWedgeId }) {
  switch (mode) {
    case "auto":
      return <AutoModePreview />;
    case "voice":
      return <VoiceModePreview />;
    case "full":
      return <FullModePreview />;
    case "chat":
      return <ChatModePreview />;
    case "capture":
      return <CaptureModePreview />;
  }
}

/** CSS-only fallback when WebGL / snapshot fails — desktop `Onboarding.css` `demoMorph`. */
const SELFMOD_MORPH_SWAP_MS = 200;
const SELFMOD_MORPH_TOTAL_MS = 450;

function SelfModificationShowcase() {
  const [stageIndex, setStageIndex] = useState(1);
  const [cssMorphing, setCssMorphing] = useState(false);
  const morphCaptureRef = useRef<HTMLDivElement | null>(null);
  const morphGlRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;

    const advanceStage = () => {
      setStageIndex((current) => (current + 1) % SELF_MOD_STAGES.length);
    };

    const runCssFallbackMorph = () => {
      setCssMorphing(true);
      window.setTimeout(() => {
        if (cancelled) return;
        flushSync(() => {
          advanceStage();
        });
      }, SELFMOD_MORPH_SWAP_MS);
      window.setTimeout(() => {
        if (!cancelled) setCssMorphing(false);
      }, SELFMOD_MORPH_TOTAL_MS);
    };

    const schedule = () => {
      timeoutId = window.setTimeout(async () => {
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
      }, 3200);
    };

    schedule();
    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  const activeStage = SELF_MOD_STAGES[stageIndex];
  const activeMessages = SELF_MOD_MESSAGES[activeStage.id];

  return (
    <div className="selfmod-layout">
      <div className="selfmod-stage-list">
        {SELF_MOD_STAGES.map((stage, index) => (
          <article
            key={stage.id}
            className="selfmod-stage-card"
            data-active={stageIndex === index || undefined}
          >
            <span>{stage.title}</span>
            <strong>{stage.prompt}</strong>
          </article>
        ))}
      </div>

      <div
        className={`selfmod-canvas${cssMorphing ? " selfmod-canvas--morphing" : ""}`}
      >
        <div className="selfmod-canvas__capture">
          <div className="selfmod-shell" data-stage={activeStage.id}>
            <div ref={morphCaptureRef} className="selfmod-shell__frame">
            <div className="selfmod-shell__titlebar">
              <div className="selfmod-shell__traffic">
                <span />
                <span />
                <span />
              </div>
              <div className="selfmod-shell__path">Stella / Self modification / Live workspace</div>
            </div>

            <div className="selfmod-shell__body">
              <aside className="selfmod-shell__sidebar">
                <div className="selfmod-shell__brand">
                  <Image src="/stella-logo.svg" alt="" width={22} height={22} />
                  <span>STELLA</span>
                </div>

                <div className="selfmod-shell__nav">
                  <button type="button" data-active>
                    <MessageSquare size={15} />
                    <span>Chat</span>
                  </button>
                  <button type="button">
                    <LayoutGrid size={15} />
                    <span>Canvas</span>
                  </button>
                  <button type="button">
                    <Settings2 size={15} />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="selfmod-shell__sidebar-card">
                  <span>Current request</span>
                  <strong>{activeStage.prompt}</strong>
                </div>
              </aside>

              <div className="selfmod-shell__workspace">
                <div className="selfmod-shell__content">
                  <section className="selfmod-conversation">
                    {activeMessages.map((message, index) => (
                      <div
                        key={`${activeStage.id}-${index}`}
                        className={`selfmod-conversation__message selfmod-conversation__message--${message.role}`}
                      >
                        {message.text}
                      </div>
                    ))}

                    <div className="selfmod-conversation__composer">
                      <span>Describe how you want Stella to change itself...</span>
                      <button type="button" aria-label="Send request">
                        <Send size={14} />
                      </button>
                    </div>
                  </section>
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

function RadialDialShowcase() {
  const [selectedIndex, setSelectedIndex] = useState(4);
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedIdxRef = useRef(selectedIndex);
  const colorsRef = useRef<BlobColors>(createBlobColors(selectedIndex));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSelectedIndex((current) => (current + 1) % RADIAL_WEDGES.length);
    }, 2400);
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
      <div className="radial-demo__dock">
        <div className="radial-demo__surface">
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

        <ul className="demo-chip-list">
          {RADIAL_WEDGES.map((wedge, index) => (
            <li key={wedge.id} data-active={selectedIndex === index || undefined}>
              {wedge.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="radial-demo__preview">
        <div className="demo-eyebrow">Desktop overlay</div>
        <h3>{activeWedge.heading}</h3>
        <p>{activeWedge.detail}</p>
        <div className="radial-demo__mode-window">
          <div className="radial-demo__mode-window-slot">
            <RadialModePreview mode={activeWedge.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasDiagram({ concept }: { concept: CanvasConcept }) {
  const nodeMap = useMemo(
    () => new Map(concept.nodes.map((node) => [node.id, node])),
    [concept.nodes],
  );

  return (
    <svg
      className="shell-diagram"
      viewBox="0 0 660 300"
      role="img"
      aria-label={concept.title}
      preserveAspectRatio="xMidYMid meet"
    >
      {concept.links.map((link) => {
        const from = nodeMap.get(link.from);
        const to = nodeMap.get(link.to);

        if (!from || !to) {
          return null;
        }

        const startX = from.x + from.width / 2;
        const startY = from.y + from.height / 2;
        const endX = to.x + to.width / 2;
        const endY = to.y + to.height / 2;
        const curve = `M ${startX} ${startY} C ${startX + 60} ${startY}, ${endX - 60} ${endY}, ${endX} ${endY}`;

        return <path key={`${link.from}-${link.to}`} d={curve} className="shell-diagram__link" />;
      })}

      {concept.nodes.map((node) => (
        <g key={node.id} className={`shell-diagram__node shell-diagram__node--${node.tone}`}>
          <rect x={node.x} y={node.y} width={node.width} height={node.height} rx={22} />
          <text x={node.x + 20} y={node.y + 28} className="shell-diagram__title">
            {node.title}
          </text>
          <text x={node.x + 20} y={node.y + 49} className="shell-diagram__meta">
            {node.meta}
          </text>
        </g>
      ))}
    </svg>
  );
}

function CanvasShowcase() {
  const [conceptIndex, setConceptIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setConceptIndex((current) => (current + 1) % CANVAS_CONCEPTS.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, []);

  const activeConcept = CANVAS_CONCEPTS[conceptIndex];

  return (
    <div className="canvas-showcase">
      <div className="canvas-showcase__meta">
        <div className="demo-eyebrow">Full shell</div>
        <h3>{activeConcept.title}</h3>
        <p>{activeConcept.blurb}</p>

        <div className="canvas-showcase__tabs">
          {CANVAS_CONCEPTS.map((concept, index) => (
            <button
              key={concept.id}
              type="button"
              className="canvas-showcase__tab"
              data-active={conceptIndex === index || undefined}
              onClick={() => setConceptIndex(index)}
            >
              {concept.label}
            </button>
          ))}
        </div>
      </div>

      <div className="shell-preview">
        <div className="shell-preview__titlebar">
          <div className="shell-preview__traffic">
            <span />
            <span />
            <span />
          </div>
          <div className="shell-preview__title">Stella shell</div>
          <div className="shell-preview__search">Search commands, tasks, and canvases</div>
        </div>

        <div className="shell-preview__body">
          <aside className="shell-sidebar">
            <div className="shell-sidebar__brand">
              <Image src="/stella-logo.svg" alt="" width={24} height={24} />
              <div>
                <strong>Stella</strong>
                <span>desktop shell</span>
              </div>
            </div>

            <nav className="shell-sidebar__nav" aria-label="Shell navigation">
              <button type="button" data-active>
                <LayoutGrid size={16} />
                <span>Canvas</span>
              </button>
              <button type="button">
                <MessageSquare size={16} />
                <span>Threads</span>
              </button>
              <button type="button">
                <SquareTerminal size={16} />
                <span>Tasks</span>
              </button>
              <button type="button">
                <FolderGit2 size={16} />
                <span>Projects</span>
              </button>
            </nav>

            <div className="shell-sidebar__focus">
              <span>Focus</span>
              <strong>Homepage product demos</strong>
              <p>Three distinct surfaces: self modification, radial modes, and the full shell canvas.</p>
            </div>
          </aside>

          <div className="shell-workspace">
            <div className="shell-workspace__header">
              <div>
                <span className="demo-eyebrow">Generative canvas</span>
                <h4>{activeConcept.title}</h4>
              </div>
              <div className="shell-workspace__badges">
                <span>Live map</span>
                <span>Context-aware</span>
              </div>
            </div>

            <div className="shell-workspace__canvas">
              <CanvasDiagram concept={activeConcept} />
            </div>
          </div>

          <aside className="shell-activity">
            <div className="shell-activity__header">
              <strong>Activity</strong>
              <span>{activeConcept.activity.length} items</span>
            </div>

            <div className="shell-activity__list">
              {activeConcept.activity.map((entry) => (
                <article key={entry.id} className="shell-activity__item">
                  <div className="shell-activity__top">
                    <span className={`shell-activity__status shell-activity__status--${entry.status}`} />
                    <strong>{entry.name}</strong>
                  </div>
                  <em>{entry.meta}</em>
                  <p>{entry.preview}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function ProductDemos() {
  return (
    <div className="demo-showcase-grid">
      <article className="demo-panel demo-panel--full">
        <div className="demo-panel__header">
          <div className="section-kicker section-kicker--compact">
            <span>Self modification</span>
            <h3>Watch Stella reshape itself live.</h3>
          </div>
          <p className="demo-panel__lede">
            Stella should feel editable as a product surface, not fixed chrome. These states show the interface morphing from focused tweaks to full thematic shifts without interrupting the session.
          </p>
        </div>
        <SelfModificationShowcase />
      </article>

      <article className="demo-panel demo-panel--full">
        <div className="demo-panel__header demo-panel__header--tight">
          <div className="section-kicker section-kicker--compact">
            <span>Radial dial</span>
            <h3>The overlay should explain itself through each mode.</h3>
          </div>
          <p className="demo-panel__lede">
            The dial stays on the left. The selected action opens a product-real mock on the right so the user immediately understands what Auto, Voice, Full, Chat, and Capture actually do.
          </p>
        </div>
        <RadialDialShowcase />
      </article>

      <article className="demo-panel demo-panel--full">
        <div className="demo-panel__header">
          <div className="section-kicker section-kicker--compact">
            <span>Canvas shell</span>
            <h3>The full Stella workspace should feel alive, generative, and operational.</h3>
          </div>
          <p className="demo-panel__lede">
            This shell view focuses on what matters: a concept-rich canvas in the main area and an activity rail that makes active work and scheduled follow-ups visible at a glance.
          </p>
        </div>
        <CanvasShowcase />
      </article>
    </div>
  );
}
