"use client";

/**
 * Single-chat section.
 *
 * Left column: copy explaining Stella's "one chat" model.
 * Right column: a live replica of the mini-window chat surface running
 * the actual conversation animation — two completed turns followed by
 * a parallel ask, with the inline working indicator showing the live
 * Stella animation orb and a rotating status that swaps between the
 * two in-flight tasks every few seconds.
 *
 * Theme is "dusk" — deep plum surface, rose accent, warm cream text.
 * Distinct from the other dark/light themes already used on the site.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { StellaAnimation } from "@/components/stella-animation/stella-animation";

type ChatMessage =
  | { id: string; role: "user"; text: string; justSent?: boolean }
  | { id: string; role: "stella"; text: string; streaming?: boolean };

/** Two tasks the inline indicator rotates between while parallel work is
 *  in flight. Each maps to one of the two outstanding asks. */
const PARALLEL_TASKS = [
  "Pricing flights to Lisbon for the weekend",
  "Booking a Sunday yoga class near you",
];

/** Conversation transcript the mock plays through. Steps that "stream"
 *  are revealed character by character once they appear. */
type Step =
  | { kind: "user"; id: string; text: string; delay: number }
  | { kind: "stella"; id: string; text: string; delay: number; reveal: number }
  | { kind: "working"; delay: number };

const SCRIPT: Step[] = [
  {
    kind: "user",
    id: "u1",
    text: "Plan a quick trip to Lisbon next weekend.",
    delay: 600,
  },
  {
    kind: "stella",
    id: "s1",
    text:
      "Looking at flights and a couple of marina-side hotels now. I'll surface a shortlist with prices in a second.",
    delay: 800,
    reveal: 22,
  },
  {
    kind: "user",
    id: "u2",
    text: "Also book me a yoga class for Sunday morning while you're at it.",
    delay: 1800,
  },
  {
    kind: "stella",
    id: "s2",
    text:
      "On it — both running in parallel, I'll let you know when each one's set.",
    delay: 700,
    reveal: 22,
  },
  { kind: "working", delay: 600 },
];

export function SingleChatSection() {
  return (
    <section
      className="single-chat-hero codex-section"
      data-reveal
      suppressHydrationWarning
    >
      <div className="codex-stage single-chat-stage">
        <header
          className="single-chat-hero__copy codex-stage__copy"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 0 }}
        >
          <span className="single-chat-hero__eyebrow">Always there</span>
          <h2 className="single-chat-hero__title">
            One chat. From anywhere.
          </h2>
          <p className="single-chat-hero__lede">
            No tabs, no new windows for every idea. Stella keeps one running
            conversation — and you can pop it open in a small floating window
            on top of whatever you&apos;re doing.
          </p>
          <p className="single-chat-hero__lede single-chat-hero__lede--sub">
            Ask for two things at once and Stella runs them in parallel,
            right inside the same chat.
          </p>
        </header>

        <div
          className="single-chat-hero__mock"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 1 }}
        >
          <MiniWindowMock />
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   The mini-window mock
   ────────────────────────────────────────────────────────────────── */

function MiniWindowMock() {
  const [stepIndex, setStepIndex] = useState(0);
  const [revealed, setRevealed] = useState<Record<string, number>>({});
  const [working, setWorking] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);

  // Walk the script: queue the next step, when it lands either insert
  // the message (with optional per-character reveal) or flip on the
  // working indicator. Loops back after a long tail pause so the
  // section feels alive even if the viewer lingers.
  useEffect(() => {
    if (stepIndex >= SCRIPT.length) {
      const restart = window.setTimeout(() => {
        setRevealed({});
        setWorking(false);
        setStepIndex(0);
      }, 9000);
      return () => window.clearTimeout(restart);
    }
    const step = SCRIPT[stepIndex]!;
    const t = window.setTimeout(() => {
      if (step.kind === "working") {
        setWorking(true);
      } else if (step.kind === "stella") {
        // Reveal the assistant text character-by-character.
        let pos = 0;
        const tickMs = step.reveal;
        const advance = () => {
          pos += 2;
          setRevealed((prev) => ({ ...prev, [step.id]: pos }));
          if (pos < step.text.length) {
            window.setTimeout(advance, tickMs);
          } else {
            setStepIndex((i) => i + 1);
          }
        };
        advance();
      } else {
        // user
        setRevealed((prev) => ({ ...prev, [step.id]: step.text.length }));
        setStepIndex((i) => i + 1);
      }
    }, step.delay);
    return () => window.clearTimeout(t);
  }, [stepIndex]);

  // Rotate the working-indicator task every 3s while it's active.
  useEffect(() => {
    if (!working) return;
    const id = window.setInterval(() => {
      setTaskIndex((i) => (i + 1) % PARALLEL_TASKS.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [working]);

  // Project the script into a renderable message list. Messages appear
  // once their step has fired; assistant text is sliced by `revealed`.
  const messages = useMemo<ChatMessage[]>(() => {
    const out: ChatMessage[] = [];
    for (let i = 0; i < SCRIPT.length; i += 1) {
      if (i > stepIndex) break;
      const step = SCRIPT[i]!;
      if (step.kind === "user") {
        const len = revealed[step.id] ?? 0;
        if (len <= 0) continue;
        out.push({
          id: step.id,
          role: "user",
          text: step.text,
          // The last-revealed user message gets the entry animation only
          // on the frame it appeared; once `stepIndex` advances past it
          // the class falls off so re-renders never replay the animation.
          justSent: stepIndex === i + 1 || (stepIndex === i && len < step.text.length),
        });
      } else if (step.kind === "stella") {
        const len = revealed[step.id] ?? 0;
        if (len <= 0) continue;
        out.push({
          id: step.id,
          role: "stella",
          text: step.text.slice(0, len),
          streaming: len < step.text.length,
        });
      }
    }
    return out;
  }, [revealed, stepIndex]);

  const [keypadFocused, setKeypadFocused] = useState(false);

  return (
    <div className="mini-window" data-theme="dusk">
      {/* Title bar with macOS traffic lights and a small sidebar toggle
          icon next to them — matches the mini window's chrome where the
          rail is replaced by a single small toggle button. */}
      <div className="mini-window__titlebar">
        <div className="mini-window__traffic" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <button
          type="button"
          className="mini-window__rail-toggle"
          aria-label="Open sidebar"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="9" y1="4" x2="9" y2="20" />
          </svg>
        </button>
        <div className="mini-window__title">Stella</div>
        <div className="mini-window__title-spacer" aria-hidden="true" />
      </div>

      {/* Chat body */}
      <div className="mini-window__chat">
        <ul className="mini-chat" role="log" aria-live="polite">
          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            return (
              <li
                key={msg.id}
                className={`mini-chat__row mini-chat__row--${msg.role}${
                  msg.role === "user" && msg.justSent
                    ? " mini-chat__row--just-sent"
                    : ""
                }`}
              >
                <div className={`mini-chat__bubble mini-chat__bubble--${msg.role}`}>
                  {msg.text}
                  {msg.role === "stella" && msg.streaming ? (
                    <span className="mini-chat__cursor" aria-hidden="true" />
                  ) : null}
                </div>
                {/* Inline working indicator anchored under the last assistant
                    row, exactly where the real one sits in the desktop app. */}
                {working && isLast && msg.role === "stella" ? (
                  <MiniWorkingIndicator
                    task={PARALLEL_TASKS[taskIndex]!}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Composer */}
      <div className="mini-window__composer-wrap">
        <div
          className={`mini-composer${keypadFocused ? " mini-composer--focus" : ""}`}
        >
          <button
            type="button"
            className="mini-composer__btn mini-composer__add"
            aria-label="Add"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
            >
              <line x1="12" y1="6" x2="12" y2="18" />
              <line x1="6" y1="12" x2="18" y2="12" />
            </svg>
          </button>
          <input
            type="text"
            className="mini-composer__input"
            placeholder="Ask Stella anything…"
            onFocus={() => setKeypadFocused(true)}
            onBlur={() => setKeypadFocused(false)}
            spellCheck={false}
          />
          <button
            type="button"
            className="mini-composer__btn mini-composer__mic"
            aria-label="Dictate"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="3" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </button>
          <button
            type="button"
            className="mini-composer__btn mini-composer__send"
            aria-label="Send"
            disabled
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Inline working indicator — live Stella animation orb + swap-text
   ────────────────────────────────────────────────────────────────── */

function MiniWorkingIndicator({ task }: { task: string }) {
  // Track the previous task so we can crossfade between strings the same
  // way the desktop `SwapText` component does — short slide-up exit on
  // the old label, slide-up enter on the new one.
  const [layers, setLayers] = useState<
    Array<{ id: number; text: string; phase: "in" | "out" }>
  >([{ id: 0, text: task, phase: "in" }]);
  const handleNewTask = useCallback((next: string) => {
    setLayers((prev) => {
      if (prev.length > 0 && prev[prev.length - 1]!.text === next) return prev;
      const outgoing = prev
        .filter((l) => l.phase === "in")
        .map((l) => ({ ...l, phase: "out" as const }));
      return [
        ...outgoing,
        { id: Date.now(), text: next, phase: "in" as const },
      ];
    });
  }, []);
  useEffect(() => {
    handleNewTask(task);
  }, [task, handleNewTask]);
  // Garbage-collect outgoing layers once their exit animation completes.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setLayers((prev) => prev.filter((l) => l.phase === "in"));
    }, 280);
    return () => window.clearTimeout(t);
  }, [layers]);

  return (
    <div className="mini-working" role="status" aria-live="polite">
      <div className="mini-working__orb" aria-hidden="true">
        <StellaAnimation width={20} height={20} maxDpr={1} frameSkip={2} />
      </div>
      <div className="mini-working__status">
        {layers.map((layer) => (
          <span
            key={layer.id}
            className={`mini-working__status-layer mini-working__status-layer--${layer.phase}`}
          >
            {layer.text}
          </span>
        ))}
      </div>
    </div>
  );
}
