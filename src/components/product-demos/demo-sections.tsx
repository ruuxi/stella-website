"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import dynamic from "next/dynamic";
import { useViewportActivity } from "@/components/use-viewport-activity";
import { RADIAL_WEDGES, CANVAS_CONCEPTS } from "./data";
import { DeferInView } from "./defer-in-view";
import { RadialDialInteractive } from "./radial-dial-interactive";
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

/* ── Radial dial section ───────────────────────────── */

const RADIAL_CYCLE_MS = 3200;

export function RadialDialSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const { ref, isActive } = useViewportActivity<HTMLDivElement>({
    rootMargin: "360px 0px",
  });

  useEffect(() => {
    if (!isActive || !autoplay) return;
    const timer = window.setInterval(() => {
      setSelectedIndex((i) => (i + 1) % RADIAL_WEDGES.length);
    }, RADIAL_CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [isActive, autoplay]);

  const handleSelect = useCallback((index: number) => {
    setAutoplay(false);
    setSelectedIndex(index);
  }, []);

  const activeWedge = RADIAL_WEDGES[selectedIndex];

  return (
    <section className="radial-hero codex-section" data-reveal suppressHydrationWarning>
      <div className="codex-stage">
        <header
          className="radial-hero__copy codex-stage__copy"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 0 }}
        >
          <span className="radial-hero__eyebrow">Anywhere</span>
          <h2 className="radial-hero__title">Stella, on call.</h2>
          <p className="radial-hero__lede">
            One gesture summons Stella anywhere on your screen. Flick toward
            an action — no menus, no window switching.
          </p>
        </header>

        <div
          className="codex-stage__mock"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 1 }}
        >
          <div className="codex-frame">
            <div className="radial-hero__stage">
              <div className="radial-hero__dial" aria-label="Stella radial dial">
                <RadialDialInteractive
                  selectedIndex={selectedIndex}
                  onSelect={handleSelect}
                />
                <div className="radial-dial-caption" aria-live="polite">
                  <div key={activeWedge.id} className="radial-dial-caption__inner">
                    <strong>{activeWedge.heading}</strong>
                    <p>{activeWedge.detail}</p>
                  </div>
                </div>
              </div>

              <div ref={ref} className="radial-hero__mock">
                <DeferInView fallback={<DemoChunkPlaceholder />}>
                  <RadialDialVisual
                    selectedIndex={selectedIndex}
                    isActive={isActive}
                  />
                </DeferInView>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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

  return (
    <section className="canvas-hero codex-section" data-reveal suppressHydrationWarning>
      <div className="codex-stage" data-flip="true">
        <header
          className="canvas-hero__copy codex-stage__copy"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 0 }}
        >
          <span className="canvas-hero__eyebrow">Display</span>
          <h2 className="canvas-hero__title">Ask. Watch it appear.</h2>
          <p className="canvas-hero__lede">
            The chat stays in the centre. Whatever Stella is making — a
            sheet, a doc, or a few side quests at once — opens beside it in
            a panel that&apos;s always there.
          </p>
        </header>

        <div
          className="codex-stage__mock"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 1 }}
        >
          <div className="codex-frame">
            <div className="canvas-hero__stage">
              <div
                className="canvas-hero__menu"
                role="tablist"
                aria-label="Display examples"
              >
                {CANVAS_CONCEPTS.map((concept, index) => (
                  <button
                    key={concept.id}
                    type="button"
                    role="tab"
                    aria-selected={conceptIndex === index}
                    className="canvas-hero__menu-item"
                    data-active={conceptIndex === index || undefined}
                    onClick={() => setConceptIndex(index)}
                  >
                    {concept.label}
                  </button>
                ))}
              </div>

              <div ref={ref} className="canvas-hero__mock">
                <DeferInView fallback={<DemoChunkPlaceholder />}>
                  <CanvasVisual
                    conceptIndex={conceptIndex}
                    isActive={isActive}
                  />
                </DeferInView>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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

function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const subscribe = useCallback(
    (notify: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    [query],
  );
  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

const DESKTOP_SLOT_COUNT = 2;

function usePlatformCycle(isMobile: boolean) {
  const [slots, setSlots] = useState<Platform[]>(["imessage", "discord"]);
  const [singleIndex, setSingleIndex] = useState(0);
  const nextSlotRef = useRef(0);

  const cycle = useCallback(() => {
    if (isMobile) {
      setSingleIndex((i) => (i + 1) % ALL_PLATFORMS.length);
    } else {
      setSlots((prev) => {
        const slot = nextSlotRef.current;
        nextSlotRef.current = (slot + 1) % DESKTOP_SLOT_COUNT;

        const available = ALL_PLATFORMS.filter((p) => !prev.includes(p));
        if (available.length === 0) return prev;
        const next = available[Math.floor(Math.random() * available.length)];

        const updated = [...prev];
        updated[slot] = next;
        return updated;
      });
    }
  }, [isMobile]);

  const activePlatform = ALL_PLATFORMS[singleIndex];

  return { slots, cycle, activePlatform };
}

export function MobileSection() {
  const isMobile = useIsMobile();
  const { slots, cycle, activePlatform } = usePlatformCycle(isMobile);
  const { ref, isActive } = useViewportActivity<HTMLDivElement>({
    rootMargin: "360px 0px",
  });

  useEffect(() => {
    if (!isActive) return;
    const timer = window.setInterval(cycle, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [isActive, cycle]);

  return (
    <section className="mobile-hero codex-section" data-reveal suppressHydrationWarning>
      <div className="codex-stage">
        <header
          className="mobile-hero__copy codex-stage__copy"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 0 }}
        >
          <span className="mobile-hero__eyebrow">Anywhere</span>
          <h2 className="mobile-hero__title">
            Control your computer from anywhere
          </h2>
          <p className="mobile-hero__lede">
            Away from your desk? Message Stella from anywhere and she&apos;ll
            take action on your computer in real time.
          </p>
        </header>

        <div
          className="codex-stage__mock"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 1 }}
        >
          <div className="codex-frame">
            <div className="mobile-hero__stage">
              <div className="mobile-hero__channels">
                <MobileChannels />
              </div>

              <div ref={ref} className="mobile-hero__mock">
                <DeferInView fallback={<DemoChunkPlaceholder />}>
                  {isMobile ? (
                    <div className="mobile-phone-single">
                      <div className="mobile-phone-swap">
                        <MobilePhoneVisual
                          key={activePlatform}
                          activeConvo={0}
                          platform={activePlatform}
                        />
                      </div>
                      <span className="mobile-phone-label">
                        {PLATFORM_LABELS[activePlatform]}
                      </span>
                    </div>
                  ) : (
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
                  )}
                </DeferInView>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
