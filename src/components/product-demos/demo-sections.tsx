"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useViewportActivity } from "@/components/use-viewport-activity";
import { RADIAL_RAIL_DETAILS, RADIAL_WEDGES, CANVAS_CONCEPTS } from "./data";
import { DeferInView } from "./defer-in-view";
import type { Platform } from "./mobile-showcase";

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

const RadialDialVisual = dynamic(
  () =>
    import("./radial-dial-showcase").then((m) => ({
      default: m.RadialDialVisual,
    })),
  { loading: () => <DemoChunkPlaceholder /> },
);

const CanvasVisual = dynamic(
  () =>
    import("./canvas-showcase").then((m) => ({
      default: m.CanvasVisual,
    })),
  { loading: () => <DemoChunkPlaceholder /> },
);

const MobilePhoneVisual = dynamic(
  () =>
    import("./mobile-showcase").then((m) => ({
      default: m.MobilePhoneVisual,
    })),
  { loading: () => <DemoChunkPlaceholder /> },
);

// Lazy-load channels so SVG icons aren't in the initial bundle
const MobileChannels = dynamic(
  () =>
    import("./mobile-showcase").then((m) => ({
      default: function Channels() {
        return (
          <div className="mobile-channels" style={{ marginTop: "0.5rem" }}>
            <span className="mobile-channels__label">Message Stella from</span>
            <div className="mobile-channels__list">
              {m.channels.map(
                (ch: { name: string; icon: React.ReactNode }) => (
                  <div key={ch.name} className="mobile-channel">
                    <span className="mobile-channel__icon">{ch.icon}</span>
                    <span className="mobile-channel__name">{ch.name}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        );
      },
    })),
  { ssr: false },
);

/* ── Radial Dial section ──────────────────────────── */

const RADIAL_CYCLE_MS = 1800 + 4000 + 800;

export function RadialDialSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { ref, isActive } = useViewportActivity<HTMLDivElement>({
    rootMargin: "360px 0px",
  });

  useEffect(() => {
    if (!isActive) return;
    const timer = window.setInterval(() => {
      setSelectedIndex((i) => (i + 1) % RADIAL_WEDGES.length);
    }, RADIAL_CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [isActive]);

  return (
    <div ref={ref} style={{ display: "contents" }}>
      <div className="section-kicker">
        <h2>Access Stella from anywhere</h2>
        <p className="section-kicker__desc">
          The radial dial pops up wherever you are. Capture your screen, start a
          chat, dictate with your voice, or get an instant summary — all without
          switching windows.
        </p>
        <ul className="radial-demo__feature-rail radial-demo__feature-rail--kicker" aria-label="Quick actions">
          {RADIAL_WEDGES.map((wedge, index) => {
            const Icon = wedge.icon;
            return (
              <li
                key={wedge.id}
                className="radial-demo__feature-item"
                data-active={selectedIndex === index || undefined}
                onClick={() => setSelectedIndex(index)}
                style={{ cursor: "pointer" }}
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
      <div className="product-demos-slot">
        <div className="demo-showcase-grid">
          <article className="demo-panel demo-panel--full">
            <DeferInView fallback={<DemoChunkPlaceholder />}>
              <RadialDialVisual
                selectedIndex={selectedIndex}
                isActive={isActive}
              />
            </DeferInView>
          </article>
        </div>
      </div>
    </div>
  );
}

/* ── Canvas section ───────────────────────────────── */

export function CanvasSection() {
  const [conceptIndex, setConceptIndex] = useState(0);
  const { ref, isActive } = useViewportActivity<HTMLDivElement>({
    rootMargin: "360px 0px",
  });

  useEffect(() => {
    if (!isActive) return;
    const timer = window.setInterval(() => {
      setConceptIndex((i) => (i + 1) % CANVAS_CONCEPTS.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [isActive]);

  const activeConcept = CANVAS_CONCEPTS[conceptIndex];

  return (
    <div ref={ref} style={{ display: "contents" }}>
      <div className="section-kicker">
        <h2>Everything in one place</h2>
        <p className="section-kicker__desc">
          The full Stella window shows your dashboard, active tasks, and
          upcoming follow-ups — all in one clean, organized view.
        </p>
        <div className="canvas-showcase__tabs canvas-showcase__tabs--kicker">
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
        <div className="section-kicker__concept-meta">
          <h3>{activeConcept.title}</h3>
          <p className="section-kicker__desc">{activeConcept.blurb}</p>
        </div>
      </div>
      <div className="product-demos-slot">
        <div className="demo-showcase-grid">
          <article className="demo-panel demo-panel--full">
            <DeferInView fallback={<DemoChunkPlaceholder />}>
              <CanvasVisual
                conceptIndex={conceptIndex}
                isActive={isActive}
              />
            </DeferInView>
          </article>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile section ───────────────────────────────── */

const ALL_PLATFORMS: Platform[] = ["stella", "imessage", "discord", "slack", "telegram", "teams"];
const PLATFORM_LABELS: Record<Platform, string> = {
  stella: "Stella App",
  imessage: "iMessage",
  discord: "Discord",
  slack: "Slack",
  telegram: "Telegram",
  teams: "Teams",
};
const CYCLE_MS = 4000;

function usePlatformCycle() {
  const [slots, setSlots] = useState<Platform[]>(["imessage", "discord", "slack"]);
  const nextSlotRef = useRef(0);

  const cycle = useCallback(() => {
    setSlots((prev) => {
      const slot = nextSlotRef.current;
      nextSlotRef.current = (slot + 1) % 3;

      const available = ALL_PLATFORMS.filter((p) => !prev.includes(p));
      if (available.length === 0) return prev;
      const next = available[Math.floor(Math.random() * available.length)];

      const updated = [...prev];
      updated[slot] = next;
      return updated;
    });
  }, []);

  return { slots, cycle };
}

export function MobileSection() {
  const { slots, cycle } = usePlatformCycle();
  const { ref, isActive } = useViewportActivity<HTMLDivElement>({
    rootMargin: "360px 0px",
  });

  useEffect(() => {
    if (!isActive) return;
    const timer = window.setInterval(cycle, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [isActive, cycle]);

  return (
    <div style={{ display: "contents" }}>
      <div className="section-kicker">
        <h2>Control your computer from anywhere</h2>
        <p className="section-kicker__desc">
          Away from your desk? Message Stella from anywhere and she&apos;ll take
          action on your computer in real time.
        </p>
        <MobileChannels />
      </div>
      <div ref={ref} className="product-demos-slot">
        <div className="demo-showcase-grid">
          <article className="demo-panel demo-panel--portrait">
            <DeferInView fallback={<DemoChunkPlaceholder />}>
              <div className="mobile-phone-row">
                {slots.map((platform, i) => (
                  <div key={i} className="mobile-phone-col">
                    <div className="mobile-phone-swap">
                      <MobilePhoneVisual
                        key={platform}
                        activeConvo={i}
                        platform={platform}
                      />
                    </div>
                    <span className="mobile-phone-label">
                      {PLATFORM_LABELS[platform]}
                    </span>
                  </div>
                ))}
              </div>
            </DeferInView>
          </article>
        </div>
      </div>
    </div>
  );
}
