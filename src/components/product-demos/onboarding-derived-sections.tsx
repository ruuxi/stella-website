"use client";

/* Sections derived from the desktop onboarding capability scenes.
 * Designed to sit alongside `.privacy-hero`, `.radial-hero`, `.canvas-hero`,
 * and `.mobile-hero` — same italic display title + eyebrow + lede + stage,
 * same scroll-reveal driver from `globals.css`. The mocks intentionally
 * carry as little chrome as possible: no decorative pills, no fake brand
 * wordmarks. The product is the type and the one thing on stage. */

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

/* ─── primitives ──────────────────────────────────────────────────── */

function MacWindow({
  title,
  children,
  className,
  style,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`mac-window ${className ?? ""}`} style={style}>
      <div className="mac-window__bar">
        <span className="mac-window__dot" data-color="r" />
        <span className="mac-window__dot" data-color="y" />
        <span className="mac-window__dot" data-color="g" />
        {title ? <span className="mac-window__title">{title}</span> : null}
      </div>
      <div className="mac-window__body">{children}</div>
    </div>
  );
}

function Bubble({
  role,
  delay = 0,
  children,
  byline,
}: {
  role: "user" | "assistant" | "friend";
  delay?: number;
  children: ReactNode;
  byline?: string;
}) {
  return (
    <div
      className="ob-bubble"
      data-role={role}
      style={{ animationDelay: `${delay}ms` }}
    >
      {byline ? <span className="ob-bubble__byline">{byline}</span> : null}
      {children}
    </div>
  );
}

/** Labeled cursor used in Actions and Together — same arrow glyph as the
 *  real Stella radial-dial cursor. */
function LabeledCursor({
  label,
  color,
  className,
  style,
}: {
  label: string;
  color: "stella" | "friend";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`ob-cursor ${className ?? ""}`}
      data-color={color}
      style={style}
      aria-hidden="true"
    >
      <svg viewBox="0 0 16 16" width="28" height="28">
        <path
          d="M2 1.5l9 6.5-3.7.8-1.6 3.7L2 1.5z"
          fill="currentColor"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
      </svg>
      <span className="ob-cursor__tag">{label}</span>
    </span>
  );
}

/* ─── Memory ──────────────────────────────────────────────────────── */

export function MemorySection() {
  return (
    <section className="ob-memory codex-section" data-reveal suppressHydrationWarning>
      <div className="codex-stage" data-flip="true">
      <header
        className="ob-memory__copy codex-stage__copy"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 0 }}
      >
        <span className="ob-section-eyebrow">Memory</span>
        <h2 className="ob-section-title">Stella, who remembers.</h2>
        <p className="ob-section-lede">
          Most assistants meet you for the first time every time. Stella
          carries what matters — the people, the places, the way you like
          things — so the next conversation starts where the last one ended.
        </p>
      </header>

      <div
        className="codex-stage__mock"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 1 }}
      >
        <div className="codex-frame">
        <div className="ob-memory__stage">
        <article className="ob-memory__pane" data-variant="off">
          <span className="ob-memory__label">Without memory</span>
          <div className="ob-memory__convo">
            <Bubble role="user" delay={120}>
              Book the usual hotel for next Friday.
            </Bubble>
            <Bubble role="assistant" delay={900}>
              I don&apos;t have a record of a previous booking. Which hotel,
              and which city?
            </Bubble>
            <Bubble role="user" delay={1700}>
              Lisbon. Same one as last trip.
            </Bubble>
            <Bubble role="assistant" delay={2400}>
              Could you share the name of the hotel?
            </Bubble>
          </div>
        </article>

        <article className="ob-memory__pane" data-variant="on">
          <span className="ob-memory__label">With memory</span>
          <div className="ob-memory__convo">
            <Bubble role="user" delay={120}>
              Book the usual hotel for next Friday.
            </Bubble>
            <Bubble role="assistant" delay={900}>
              Booking Casa do Príncipe in Alfama, Fri 14 → Sun 16. Adding it
              to your trip notes.
            </Bubble>
          </div>
          <div
            className="ob-memory__recall"
            style={{ animationDelay: "1500ms" }}
          >
            <span className="ob-memory__recall-label">Remembers</span>
            <ul>
              <li>Hotel in Lisbon · Alfama, top-floor room</li>
              <li>Travel days · Friday out, Sunday back</li>
              <li>Trip notes · linked from your kitchen board</li>
            </ul>
          </div>
        </article>
        </div>
        </div>
      </div>
      </div>
    </section>
  );
}

/* ─── Together ────────────────────────────────────────────────────── */

export function TogetherSection() {
  return (
    <section className="ob-together codex-section" data-reveal suppressHydrationWarning>
      <div className="codex-stage">
      <header
        className="ob-together__copy codex-stage__copy"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 0 }}
      >
        <span className="ob-section-eyebrow">Together</span>
        <h2 className="ob-section-title">Bring a friend in.</h2>
        <p className="ob-section-lede">
          Invite someone into a session and Stella works with both of you,
          live. No new tool to learn, no new account to set up — just a
          shared link.
        </p>
      </header>

      <div
        className="codex-stage__mock"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 1 }}
      >
        <div className="codex-frame">
        <div className="ob-together__stage">
        <MacWindow title="Lisbon · shared">
          <div className="ob-together__convo">
            <Bubble role="user" delay={250} byline="You">
              Plan our trip — flights, a hotel near Alfama, and a list of
              places to eat.
            </Bubble>
            <Bubble role="assistant" delay={1200}>
              Working on it. Pulling flights from your usual carriers and
              shortlisting hotels under €220.
            </Bubble>
            <Bubble role="friend" delay={2200} byline="Maya">
              Add a day trip to Sintra please.
            </Bubble>
            <Bubble role="assistant" delay={3300}>
              Added Sintra on day three. Reservation set at Tascardoso for
              night two.
            </Bubble>
          </div>

          <LabeledCursor
            label="Maya"
            color="friend"
            className="ob-together__cursor"
          />
        </MacWindow>
        </div>
        </div>
      </div>
      </div>
    </section>
  );
}

/* ─── Actions ─────────────────────────────────────────────────────── */

const ACTION_TIME_SLOTS = ["7:00", "7:30", "8:00", "8:30", "9:00"];

export function ActionsSection() {
  return (
    <section className="ob-actions codex-section" data-reveal suppressHydrationWarning>
      <div className="codex-stage">
      <header
        className="ob-actions__copy codex-stage__copy"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 0 }}
      >
        <span className="ob-section-eyebrow">Actions</span>
        <h2 className="ob-section-title">Stella does the clicking.</h2>
        <p className="ob-section-lede">
          Reserve dinner, fill the form, ship the email. Stella drives your
          computer the way you would — you just say what you want, then
          watch her do it.
        </p>
      </header>

      <div
        className="codex-stage__mock"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 1 }}
      >
        <div className="codex-frame">
        <div className="ob-actions__stage">
        <MacWindow title="opentable.com / luna-cucina">
          <div className="ob-actions__rest">
            <div className="ob-actions__rest-name">Luna Cucina</div>
            <div className="ob-actions__rest-meta">
              Italian · West Village · 4.8 ★
            </div>

            <div className="ob-actions__time-row">
              {ACTION_TIME_SLOTS.map((t, i) => (
                <span
                  key={t}
                  className="ob-actions__time"
                  data-active={t === "8:00" || undefined}
                  style={{ animationDelay: `${1100 + i * 70}ms` }}
                >
                  {t}
                </span>
              ))}
            </div>

            <button
              type="button"
              className="ob-actions__confirm"
              style={{ animationDelay: "2100ms" }}
            >
              Reserve · Party of 2
            </button>

            <LabeledCursor
              label="Stella"
              color="stella"
              className="ob-actions__cursor"
            />
          </div>
        </MacWindow>
        </div>
        </div>
      </div>
      </div>
    </section>
  );
}

/* ─── Voice / Dictate anywhere ───────────────────────────────────── */

const VOICE_WAVEFORM_BARS = Array.from({ length: 56 }, (_, i) => {
  const seed = (i * 37) % 100;
  return {
    key: i,
    style: {
      animationDelay: `${(seed % 100) * 12}ms`,
      "--bar-peak": `${30 + ((seed * 7) % 70)}%`,
    } as CSSProperties,
  };
});

export function VoiceSection() {
  return (
    <section className="ob-voice codex-section" data-reveal suppressHydrationWarning>
      <div className="codex-stage" data-flip="true">
      <header
        className="ob-voice__copy codex-stage__copy"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 0 }}
      >
        <span className="ob-section-eyebrow">Voice</span>
        <h2 className="ob-section-title">Talk. Or dictate anywhere.</h2>
        <p className="ob-section-lede">
          Have a real conversation, hands-free. Or pull up a dictation bar
          inside any app — email, messages, the doc you&apos;re writing —
          and just say the next sentence.
        </p>
      </header>

      <div
        className="codex-stage__mock"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 1 }}
      >
        <div className="codex-frame">
        <div className="ob-voice__stage">
        {/* Generic "any app" surface — a Mail draft — to make it clear the
            dictation overlay floats above whatever the user is in. Mirrors
            the layout of `OnboardingVoicePhase`'s dictate card, which in
            turn mirrors `.dictation-overlay` + `DictationRecordingBar`. */}
        <div className="ob-voice-app" aria-hidden="true">
          <div className="ob-voice-app__bar">
            <span />
            <span />
            <span />
            <strong>Mail — New message</strong>
          </div>
          <div className="ob-voice-app__body">
            <div className="ob-voice-app__field">
              <span className="ob-voice-app__label">To</span>
              <span className="ob-voice-app__value">alex@team.com</span>
            </div>
            <div className="ob-voice-app__field">
              <span className="ob-voice-app__label">Subject</span>
              <span className="ob-voice-app__value">Quick update</span>
            </div>
            <div className="ob-voice-app__editor">
              <span className="ob-voice-app__typed">
                Hey Alex — pushing the launch to next Tuesday so we have
                time to polish the deck.
              </span>
              <span className="ob-voice-app__caret" />
            </div>
          </div>

          {/* Faithful mock of `.dictation-overlay` + DictationRecordingBar.
              Static visual replica — no live audio. */}
          <div className="ob-voice-dictation" role="presentation">
            <div className="ob-voice-waveform" aria-hidden="true">
              {VOICE_WAVEFORM_BARS.map((bar) => (
                <span
                  key={bar.key}
                  className="ob-voice-waveform__bar"
                  style={bar.style}
                />
              ))}
            </div>
            <span className="ob-voice-dictation__timer">0:04</span>
            <button
              type="button"
              className="ob-voice-dictation__btn"
              tabIndex={-1}
              aria-label="Cancel dictation"
            >
              <DictateCancelIcon />
            </button>
            <button
              type="button"
              className="ob-voice-dictation__btn ob-voice-dictation__btn--confirm"
              tabIndex={-1}
              aria-label="Stop dictation and transcribe"
            >
              <DictateCheckIcon />
            </button>
          </div>
        </div>
        </div>
        </div>
      </div>
      </div>
    </section>
  );
}

function DictateCancelIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  );
}

function DictateCheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="5 12 10 17 19 7" />
    </svg>
  );
}

/* ─── Browser extension ───────────────────────────────────────────── */

const EXTENSION_BROWSERS = ["Chrome", "Arc", "Brave", "Edge", "Vivaldi"];

export function ExtensionSection() {
  return (
    <section className="ob-extension codex-section" data-reveal suppressHydrationWarning>
      <div className="codex-stage" data-flip="true">
      <header
        className="ob-extension__copy codex-stage__copy"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 0 }}
      >
        <span className="ob-section-eyebrow">Extension</span>
        <h2 className="ob-section-title">A second pair of eyes on the web.</h2>
        <p className="ob-section-lede">
          The Stella extension lets her see the page you&apos;re reading and
          act inside it — fill the form, follow the link, lift the data.
        </p>
      </header>

      <div
        className="codex-stage__mock"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 1 }}
      >
        <div className="codex-frame">
        <div className="ob-extension__stage">
        <div className="ob-extension__card">
          <span className="ob-extension__logo" aria-hidden="true">
            <Image
              src="/stella-logo.svg"
              alt=""
              width={48}
              height={48}
              priority={false}
            />
          </span>
          <div className="ob-extension__meta">
            <span className="ob-extension__name">Stella for the browser</span>
            <span className="ob-extension__sub">
              Works in {EXTENSION_BROWSERS.slice(0, -1).join(", ")} and{" "}
              {EXTENSION_BROWSERS.at(-1)}.
            </span>
          </div>
          <a
            className="ob-extension__cta"
            href="https://chromewebstore.google.com/detail/kfnchfpocpmdblhfgcnpfaaebaioojnl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Add to browser
          </a>
        </div>
        </div>
        </div>
      </div>
      </div>
    </section>
  );
}
