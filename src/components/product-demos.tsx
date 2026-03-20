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

const RADIAL_RAIL_DETAILS: Record<RadialWedgeId, string> = {
  capture: "Pull in any part of the screen and start asking questions immediately.",
  chat: "Start a conversation with the current page, app, and task already in view.",
  full: "Expand into the full workspace when you want the whole dashboard in front of you.",
  voice: "Dictate, brainstorm, or steer the next step without touching the keyboard.",
  auto: "Get the gist, key takeaways, and suggested next steps in one move.",
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
    heading: "Grab what's on your screen",
    detail:
      "Capture whatever you're looking at — a webpage, a document, anything — and Stella instantly understands it.",
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    heading: "Chat that already knows what you're doing",
    detail:
      "Stella sees what app or page you're on and picks up the conversation from there. No need to explain the context.",
  },
  {
    id: "full",
    label: "Full",
    icon: Maximize2,
    heading: "Open the full Stella window",
    detail:
      "Switch to the full view with your dashboard, apps, and everything in one place — without losing your conversation.",
  },
  {
    id: "voice",
    label: "Voice",
    icon: Mic,
    heading: "Just talk to Stella",
    detail:
      "Speak naturally and Stella listens. Dictate notes, ask questions, or give instructions — hands-free, from anywhere.",
  },
  {
    id: "auto",
    label: "Auto",
    icon: Sparkles,
    heading: "Instant page summary",
    detail:
      "Stella reads what's on screen and gives you a quick summary with the key points and suggested next steps.",
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
    { role: "user", text: "Make my messages blue." },
  ],
  medium: [
    { role: "user", text: "Make the app feel more modern." },
  ],
  high: [
    { role: "user", text: "Turn this into a cozy cat-themed shell." },
  ],
};

const CANVAS_CONCEPTS: CanvasConcept[] = [
  {
    id: "launch",
    label: "Plan",
    title: "Stella maps out your request visually",
    blurb:
      "Ask Stella something complex and it breaks the work into connected steps — while the sidebar tracks what's happening right now.",
    nodes: [
      { id: "capture", x: 34, y: 46, width: 158, height: 68, title: "Gather information", meta: "from your screen", tone: "blue" },
      { id: "chat", x: 236, y: 32, width: 170, height: 72, title: "Understand request", meta: "what you need", tone: "cyan" },
      { id: "auto", x: 454, y: 44, width: 172, height: 70, title: "Quick summary", meta: "key points", tone: "mint" },
      { id: "plan", x: 136, y: 176, width: 198, height: 88, title: "Make a plan", meta: "steps and priorities", tone: "slate" },
      { id: "shell", x: 398, y: 186, width: 216, height: 86, title: "Get it done", meta: "execute the plan", tone: "blue" },
    ],
    links: [
      { from: "capture", to: "plan" },
      { from: "chat", to: "plan" },
      { from: "auto", to: "shell" },
      { from: "plan", to: "shell" },
    ],
    activity: [
      { id: "a", name: "Trip research", meta: "working on it", status: "running", preview: "Looking up flights, hotels, and activities for your weekend trip." },
      { id: "b", name: "Budget summary", meta: "up next", status: "scheduled", preview: "Will compare prices and put together a cost breakdown." },
      { id: "c", name: "Restaurant list", meta: "done", status: "ok", preview: "Found 5 highly-rated spots near your hotel with outdoor seating." },
    ],
  },
  {
    id: "agents",
    label: "Teamwork",
    title: "Stella handles multiple things at once",
    blurb:
      "When you ask for something big, Stella splits the work up and tackles different parts at the same time — then brings it all together.",
    nodes: [
      { id: "thread", x: 28, y: 48, width: 170, height: 74, title: "Your request", meta: "what you asked for", tone: "slate" },
      { id: "worker-a", x: 248, y: 34, width: 166, height: 72, title: "Research", meta: "finding information", tone: "blue" },
      { id: "worker-b", x: 456, y: 42, width: 166, height: 72, title: "Create", meta: "building the result", tone: "cyan" },
      { id: "review", x: 140, y: 180, width: 190, height: 86, title: "Check quality", meta: "make sure it's right", tone: "mint" },
      { id: "ship", x: 396, y: 190, width: 214, height: 84, title: "Deliver", meta: "ready for you", tone: "blue" },
    ],
    links: [
      { from: "thread", to: "worker-a" },
      { from: "thread", to: "worker-b" },
      { from: "worker-a", to: "review" },
      { from: "worker-b", to: "review" },
      { from: "review", to: "ship" },
    ],
    activity: [
      { id: "d", name: "Email draft", meta: "working on it", status: "running", preview: "Writing a friendly follow-up based on your notes from the meeting." },
      { id: "e", name: "Calendar check", meta: "up next", status: "scheduled", preview: "Looking at your schedule to suggest the best time for a follow-up." },
      { id: "f", name: "Contact lookup", meta: "done", status: "ok", preview: "Found their email and LinkedIn — added to your draft." },
    ],
  },
  {
    id: "timeline",
    label: "Flow",
    title: "From idea to done, step by step",
    blurb:
      "Stella turns your rough ideas into a clear plan and shows you the progress as each piece comes together.",
    nodes: [
      { id: "hero", x: 34, y: 46, width: 152, height: 68, title: "Your idea", meta: "starting point", tone: "slate" },
      { id: "demo", x: 236, y: 34, width: 186, height: 76, title: "Break it down", meta: "steps and pieces", tone: "blue" },
      { id: "assets", x: 470, y: 44, width: 150, height: 70, title: "Gather what's needed", meta: "info and files", tone: "cyan" },
      { id: "verify", x: 138, y: 182, width: 194, height: 86, title: "Review", meta: "check everything", tone: "mint" },
      { id: "ship", x: 404, y: 192, width: 198, height: 82, title: "Finish", meta: "all done", tone: "blue" },
    ],
    links: [
      { from: "hero", to: "demo" },
      { from: "assets", to: "demo" },
      { from: "demo", to: "verify" },
      { from: "verify", to: "ship" },
    ],
    activity: [
      { id: "g", name: "Party planning", meta: "working on it", status: "running", preview: "Putting together a guest list, menu ideas, and a playlist." },
      { id: "h", name: "Invitations", meta: "up next", status: "scheduled", preview: "Will draft and send invites once the details are set." },
      { id: "i", name: "Venue options", meta: "done", status: "ok", preview: "Found 3 great venues within your budget — details saved." },
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
const SELFMOD_MORPH_SWAP_MS = 250;
const SELFMOD_MORPH_TOTAL_MS = 500;

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
      <div
        className={`selfmod-canvas${cssMorphing ? " selfmod-canvas--morphing" : ""}`}
      >
        <div className="selfmod-canvas__capture">
          <div className="selfmod-shell" data-stage={activeStage.id}>
            {/* Cat ears on the title bar — only visible in high stage */}
            <svg className="selfmod-cat-ears" viewBox="0 0 140 40" aria-hidden="true">
              {/* Left ear */}
              <path d="M10 40 L18 8 Q22 0 30 6 L38 40Z" fill="currentColor" />
              <path d="M16 40 L21 16 Q23 10 28 14 L33 40Z" className="selfmod-cat-ear-inner" />
              {/* Right ear */}
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

                {/* Cat sleeping on the sidebar — only visible in high stage */}
                <svg className="selfmod-cat-sleeping" viewBox="0 0 80 50" aria-hidden="true">
                  {/* Shadow */}
                  <ellipse cx="36" cy="44" rx="28" ry="5" fill="currentColor" opacity="0.1" />
                  {/* Curled body */}
                  <ellipse cx="36" cy="36" rx="24" ry="12" fill="currentColor" opacity="0.85" />
                  {/* Head */}
                  <circle cx="16" cy="28" r="10" fill="currentColor" />
                  {/* Left ear */}
                  <path d="M8 22 L6 12 L14 18Z" fill="currentColor" />
                  <path d="M9 21 L8 15 L13 19Z" className="selfmod-cat-ear-inner" />
                  {/* Right ear */}
                  <path d="M24 22 L26 12 L18 18Z" fill="currentColor" />
                  <path d="M23 21 L24 15 L19 19Z" className="selfmod-cat-ear-inner" />
                  {/* Closed eyes — curved lines */}
                  <path d="M11 28 Q13 26 15 28" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3" />
                  <path d="M17 28 Q19 26 21 28" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3" />
                  {/* Nose */}
                  <ellipse cx="16" cy="31" rx="1.2" ry="0.8" fill="currentColor" opacity="0.25" />
                  {/* Tail curling up from behind */}
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
                      <div className="selfmod-preview-bubble selfmod-preview-bubble--stella">
                        Done ✓
                      </div>
                    </div>

                    {/* Cat paw reaching down from top — only visible in high stage */}
                    <svg className="selfmod-cat-paw" viewBox="0 0 32 56" aria-hidden="true">
                      {/* Arm */}
                      <path d="M10 0 L10 32 Q10 38 16 38 Q22 38 22 32 L22 0Z" fill="currentColor" opacity="0.85" />
                      {/* Paw pad — wide round bottom */}
                      <ellipse cx="16" cy="40" rx="10" ry="7" fill="currentColor" />
                      {/* Three toes */}
                      <ellipse cx="8" cy="46" rx="4" ry="5" fill="currentColor" />
                      <ellipse cx="16" cy="48" rx="4" ry="5" fill="currentColor" />
                      <ellipse cx="24" cy="46" rx="4" ry="5" fill="currentColor" />
                      {/* Toe beans */}
                      <ellipse cx="8" cy="47" rx="2" ry="2.5" fill="currentColor" opacity="0.2" />
                      <ellipse cx="16" cy="49" rx="2" ry="2.5" fill="currentColor" opacity="0.2" />
                      <ellipse cx="24" cy="47" rx="2" ry="2.5" fill="currentColor" opacity="0.2" />
                      {/* Main pad bean */}
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

/**
 * Radial dial showcase — unified desktop mock.
 *
 * Phases per wedge (total ~4.5s):
 *   0–800ms   dial visible, wedge highlights
 *   800ms     dial fades, result appears
 *   800–3800ms result holds
 *   3800ms    result fades, dial reappears with next wedge
 */
const RADIAL_DIAL_PHASE_MS = 1800;
const RADIAL_RESULT_HOLD_MS = 4000;
const RADIAL_CYCLE_MS = RADIAL_DIAL_PHASE_MS + RADIAL_RESULT_HOLD_MS + 800;

function RadialDialShowcase() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [phase, setPhase] = useState<"dial" | "result">("dial");
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedIdxRef = useRef(selectedIndex);
  const colorsRef = useRef<BlobColors>(createBlobColors(selectedIndex));

  useEffect(() => {
    let cancelled = false;

    const cycle = () => {
      if (cancelled) return;

      // Phase 1: show dial
      setPhase("dial");

      // Phase 2: after delay, show result
      window.setTimeout(() => {
        if (cancelled) return;
        setPhase("result");
      }, RADIAL_DIAL_PHASE_MS);

      // Phase 3: after result holds, advance and restart
      window.setTimeout(() => {
        if (cancelled) return;
        setSelectedIndex((current) => (current + 1) % RADIAL_WEDGES.length);
        cycle();
      }, RADIAL_CYCLE_MS);
    };

    cycle();
    return () => { cancelled = true; };
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
  const showDial = phase === "dial";
  const showResult = phase === "result";

  return (
    <div className="radial-demo radial-demo--unified">
      {/* Description */}
      <div className="radial-demo__description">
        <div className="radial-demo__feature-rail" aria-label="Quick actions">
          {RADIAL_WEDGES.map((wedge, index) => {
            const Icon = wedge.icon;
            const isActive = selectedIndex === index;

            return (
              <article
                key={wedge.id}
                className="radial-demo__feature-card"
                data-active={isActive || undefined}
              >
                <span className="radial-demo__feature-icon" aria-hidden="true">
                  <Icon width={17} height={17} />
                </span>
                <div className="radial-demo__feature-main">
                  <strong>{wedge.label}</strong>
                  <p>{RADIAL_RAIL_DETAILS[wedge.id]}</p>
                </div>
              </article>
            );
          })}
        </div>

      </div>

      {/* Unified desktop mock — scene changes per mode */}
      <div className="radial-desktop-mock">
        <div className="radial-desktop-mock__titlebar">
          <div className="radial-desktop-mock__traffic"><span /><span /><span /></div>
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

          {/* ── Per-mode desktop scenes ──────────────────────────── */}

          {/* Capture: design tool with multiple panels */}
          {activeWedge.id === "capture" && (
            <div className="radial-scene radial-scene--capture">
              <div className="radial-scene__taskbar">
                <span className="radial-scene__taskbar-dot" />
                <span>Figma</span>
                <span>Chrome</span>
                <span>Slack</span>
              </div>
              <div className="radial-scene__window radial-scene__window--main">
                <div className="radial-scene__window-bar"><span /><span /><span /><strong>Figma — Homepage redesign</strong></div>
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

          {/* Chat: recipe blog */}
          {activeWedge.id === "chat" && (
            <div className="radial-scene radial-scene--chat">
              <div className="radial-scene__taskbar">
                <span className="radial-scene__taskbar-dot" />
                <span>Safari</span>
                <span>Notes</span>
              </div>
              <div className="radial-scene__window radial-scene__window--main">
                <div className="radial-scene__window-bar"><span /><span /><span /><strong>allrecipes.com — Thai basil chicken</strong></div>
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

          {/* Full: desktop with scattered windows */}
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
                <div className="radial-scene__window-bar"><span /><span /><span /><strong>VS Code</strong></div>
                <div className="radial-scene__window-body"><div className="radial-scene__code-lines"><div /><div /><div /><div /><div /></div></div>
              </div>
              <div className="radial-scene__window radial-scene__window--bg2">
                <div className="radial-scene__window-bar"><span /><span /><span /><strong>Spotify</strong></div>
                <div className="radial-scene__window-body"><div className="radial-scene__placeholder" /></div>
              </div>
            </div>
          )}

          {/* Voice: notes app */}
          {activeWedge.id === "voice" && (
            <div className="radial-scene radial-scene--voice">
              <div className="radial-scene__taskbar">
                <span className="radial-scene__taskbar-dot" />
                <span>Notes</span>
                <span>Calendar</span>
              </div>
              <div className="radial-scene__window radial-scene__window--main">
                <div className="radial-scene__window-bar"><span /><span /><span /><strong>Notes — Meeting prep</strong></div>
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

          {/* Auto: research article */}
          {activeWedge.id === "auto" && (
            <div className="radial-scene radial-scene--auto">
              <div className="radial-scene__taskbar">
                <span className="radial-scene__taskbar-dot" />
                <span>Chrome</span>
                <span>Notion</span>
              </div>
              <div className="radial-scene__window radial-scene__window--main">
                <div className="radial-scene__window-bar"><span /><span /><span /><strong>nytimes.com — The future of remote work</strong></div>
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

          {/* ── Radial dial overlay ─────────────────────────────── */}
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
                    <StellaAnimation width={20} height={20} initialBirthProgress={1} maxDpr={1} frameSkip={1} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Result overlays ──────────────────────────────────── */}
          <div className={`radial-desktop-mock__result${showResult ? " radial-desktop-mock__result--visible" : ""}`}>

            {/* Capture: vacuum canvas + mini shell with image */}
            {activeWedge.id === "capture" && (
              <>
                <canvas key={`vacuum-${selectedIndex}`} className="radial-result-vacuum" ref={(el) => {
                  if (!el) return;
                  void runVacuumEffect(el, makeCaptureThumbnail(), 0.5, 0.5);
                }} />
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

            {/* Chat: mini shell with recipe context */}
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

            {/* Full: Stella scales up from center */}
            {activeWedge.id === "full" && (
              <div className="radial-result-fullshell radial-result-fullshell--animate">
                <div className="radial-result-fullshell__titlebar">
                  <span /><strong>Stella</strong><em />
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
                      <div /><div /><div /><div />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Voice: waveform + mini shell with transcript */}
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

            {/* Auto: panel slides in from right */}
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
          <div className="shell-preview__search">Search anything...</div>
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
              <strong>Weekend trip planning</strong>
              <p>Researching flights, hotels, and restaurants for your upcoming getaway.</p>
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
            <span>Customization</span>
            <h3>Make Stella look however you want.</h3>
          </div>
          <p className="demo-panel__lede">
            Just tell Stella to change its appearance — from small tweaks like colors to a complete visual makeover. It redesigns itself while you keep chatting.
          </p>
        </div>
        <SelfModificationShowcase />
      </article>

      <article className="demo-panel demo-panel--full">
        <div className="demo-panel__header demo-panel__header--tight">
          <div className="section-kicker section-kicker--compact">
            <span>Quick access</span>
            <h3>Everything you need, one gesture away.</h3>
          </div>
          <p className="demo-panel__lede">
            The radial dial pops up wherever you are. Capture your screen, start a chat, dictate with your voice, or get an instant summary — all without switching windows.
          </p>
        </div>
        <RadialDialShowcase />
      </article>

      <article className="demo-panel demo-panel--full">
        <div className="demo-panel__header">
          <div className="section-kicker section-kicker--compact">
            <span>Your workspace</span>
            <h3>See everything Stella is working on at a glance.</h3>
          </div>
          <p className="demo-panel__lede">
            The full Stella window shows your dashboard, active tasks, and upcoming follow-ups — all in one clean, organized view.
          </p>
        </div>
        <CanvasShowcase />
      </article>
    </div>
  );
}
