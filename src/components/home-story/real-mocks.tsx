"use client";

/**
 * Auto-cycling wrappers around the existing high-fidelity Stella mocks
 * used elsewhere on the site. Each wrapper renders the mock as-is (so
 * the visual remains faithful to the real desktop / mobile app) and
 * adds a timer to advance whatever state the mock would normally rely
 * on user input for. The wrappers take an `isActive` prop so the
 * driving timers only run while the scroll-driven stage has the mock
 * on screen — keeps the page calm and saves CPU when off-screen.
 */

import { useEffect, useState } from "react";
import { MiniWindowMock } from "@/components/product-demos/single-chat-section";
import {
  ActionsMock,
  VoiceMock,
} from "@/components/product-demos/onboarding-derived-sections";
import { StellaAppMock } from "@/components/product-demos/stella-app-mock";
import type {
  SectionKey,
  SectionToggles,
} from "@/components/product-demos/stella-app-mock-types";
import { EMPTY_SECTION_TOGGLES } from "@/components/product-demos/stella-app-mock-types";
import {
  MobilePhoneVisual,
  PLATFORMS,
  PLATFORM_LABELS,
  type Platform,
} from "@/components/product-demos/mobile-showcase";
import type { MockProps } from "./sections";

/* ── 1. Chat — single floating mini-window ───────────────────────── */

/** The mini-window already replays its scripted conversation
 *  (`SCRIPT`) every few seconds — no extra driver needed. We just
 *  render it inside a centered slot. */
export function MockChat() {
  return (
    <div className="story-mock story-mock--mini-window">
      <MiniWindowMock />
    </div>
  );
}

/* ── 2. Customize — full Stella desktop app shape-shifting ──────── */

/** Per-step toggle map. Index matches the order of `customize.steps`
 *  in `sections.tsx`. Step 0 is "intro" (clean app, no toggles); each
 *  subsequent step adds one transformation that matches the request
 *  the user types in the right-side copy. The mock keeps a single
 *  `StellaAppMock` mounted across steps so toggling animates
 *  in-place via the mock's own CSS transitions rather than cross-
 *  fading between mounts. */
/* Step order matches `customize.steps` in `sections.tsx`. `composer`
 * is the cozy/Mochi theme (dark warm surface, cat illustration);
 * `createApp` is the freshly-built-by-Stella mini-app. */
const CUSTOMIZE_STEP_TOGGLES: ReadonlyArray<SectionKey | null> = [
  null,
  "header",
  "messages",
  "createApp",
  "composer",
];

export function MockCustomize({ step }: MockProps) {
  const stepIndex = clampStep(step ?? 0, CUSTOMIZE_STEP_TOGGLES.length);
  const active = CUSTOMIZE_STEP_TOGGLES[stepIndex] ?? null;
  const toggles: SectionToggles = {
    ...EMPTY_SECTION_TOGGLES,
    /* Dashboard is a full surface: tabs up top, icon rail on the left,
     * dense cards in the body. Header + messages fire together for
     * that step so the mock reads as one coherent transformation. */
    ...(active === "messages"
      ? { header: true, messages: true }
      : active
        ? { [active]: true }
        : {}),
  };

  return (
    <div className="story-mock story-mock--app">
      <StellaAppMock toggles={toggles} />
    </div>
  );
}

function clampStep(value: number, length: number) {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value >= length) return length - 1;
  return value;
}

/* ── 3. Memory — twin mini-window panes (no sidebar) ────────────── */
/* Mirrors the chat mini-window shape (titlebar + chat + composer)
 * but with the sidebar collapsed and a different theme on each pane
 * so the two read as "two different states of the same app", not as
 * a duplicate widget:
 *
 * - "Without memory" uses Stella's `pearl` theme — clean white,
 *   neutral grays. The conversation is short and frustrating: the
 *   user references the past, Stella has no past to draw on.
 * - "With memory" uses a soft `bloom` theme — warm cream surface
 *   with coral/blush accents, mirroring the pink family in Stella's
 *   real `crimson`/`sage` palettes. The thread is longer; Stella
 *   draws on remembered facts and pins a small "Stella remembers"
 *   strip under the chat showing what she's holding onto.
 */

type MemoryTurn = {
  role: "user" | "stella";
  text: string;
};

const MEMORY_LEFT: ReadonlyArray<MemoryTurn> = [
  { role: "user", text: "Book the usual hotel for next Friday." },
  {
    role: "stella",
    text: "I don't have a record of a previous booking. Which hotel, and which city?",
  },
  { role: "user", text: "Lisbon. Same one as last trip." },
  {
    role: "stella",
    text: "I don't have anything about a previous Lisbon trip. Could you share the hotel name and your check-in dates?",
  },
];

const MEMORY_RIGHT: ReadonlyArray<MemoryTurn> = [
  { role: "user", text: "Book the usual hotel for next Friday." },
  {
    role: "stella",
    text: "Booking Casa do Príncipe in Alfama — Fri 14 → Sun 16, top-floor room with the river view. Added it to your trip notes.",
  },
  { role: "user", text: "Quiet table somewhere for dinner Friday?" },
  {
    role: "stella",
    text: "Reserving Taberna do Mar for 8pm — outdoor seats, lighter menu, the spot you liked in March. Skipping the others you said were too loud.",
  },
];

/* Small persistent strip below the "With memory" chat that summarises
 * the kind of stuff Stella holds onto across conversations. Mirrors
 * the desktop "What Stella remembers" panel — short, factual lines,
 * grouped by category. Helps the mock read as "she really does
 * remember things", not just "she replies more confidently". */
const MEMORY_FACTS: ReadonlyArray<{ label: string; items: string }> = [
  { label: "Places", items: "Casa do Príncipe · Taberna do Mar · Alfama" },
  { label: "People", items: "Maya (partner) · Tomás (host) · Alex (work)" },
  { label: "Habits", items: "Quiet tables · top-floor rooms · no scallops" },
  { label: "Travel", items: "Fri out, Sun back · carry-on only · TAP Star" },
];

export function MockMemory() {
  return (
    <div className="story-mock story-mock--memory-panes">
      <MemoryPane theme="pearl" label="Without memory" turns={MEMORY_LEFT} />
      <MemoryPane
        theme="bloom"
        label="With memory"
        turns={MEMORY_RIGHT}
        facts={MEMORY_FACTS}
      />
    </div>
  );
}

function MemoryPane({
  theme,
  label,
  turns,
  facts,
}: {
  theme: "pearl" | "bloom";
  label: string;
  turns: ReadonlyArray<MemoryTurn>;
  facts?: ReadonlyArray<{ label: string; items: string }>;
}) {
  return (
    <div
      className="mini-window mini-window--no-sidebar"
      data-theme={theme}
      role="group"
      aria-label={label}
    >
      <div className="mini-window__titlebar">
        <div className="mini-window__traffic" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="mini-window__pane-label">{label}</span>
        <div className="mini-window__title-spacer" aria-hidden="true" />
      </div>

      <div className="mini-window__body mini-window__body--no-sidebar">
        <div className="mini-window__main">
          <div className="mini-window__chat">
            <ul className="mini-chat" role="log" aria-live="polite">
              {turns.map((turn, i) => (
                <li
                  key={i}
                  className={`mini-chat__row mini-chat__row--${turn.role}`}
                >
                  <div
                    className={`mini-chat__bubble mini-chat__bubble--${turn.role}`}
                  >
                    {turn.text}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {facts ? (
            <div className="memory-facts" aria-label="Stella remembers">
              <span className="memory-facts__title">Stella remembers</span>
              <dl className="memory-facts__list">
                {facts.map((f) => (
                  <div key={f.label} className="memory-facts__row">
                    <dt className="memory-facts__key">{f.label}</dt>
                    <dd className="memory-facts__val">{f.items}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── 4. Actions — OpenTable form with Stella cursor (CSS-only) ───── */

export function MockActions() {
  return (
    <div className="story-mock story-mock--actions">
      <ActionsMock />
    </div>
  );
}

/* ── 5. Voice — Mail draft + dictation bar (CSS-only) ───────────── */

export function MockVoice() {
  return (
    <div className="story-mock story-mock--voice">
      <VoiceMock />
    </div>
  );
}

/* ── 6. Anywhere — cycling phone with each chat app surface ──────── */

const PHONE_CYCLE_MS = 3200;

export function MockAnywhere({ isActive }: MockProps) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % PLATFORMS.length);
    }, PHONE_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [isActive]);

  const platform: Platform = PLATFORMS[index] ?? "stella";

  return (
    <div className="story-mock story-mock--phone">
      {/* Reuse `.mobile-phone-single` — same wrapper the standalone
          mobile section uses, which already constrains the phone to
          ~280px wide with a fixed height and applies the right
          per-platform overrides. Keying on platform restarts the
          swap-in animation each cycle. */}
      <div className="mobile-phone-single">
        <div className="mobile-phone-swap">
          <MobilePhoneVisual
            key={platform}
            activeConvo={0}
            platform={platform}
          />
        </div>
        <span className="story-mock__phone-label">
          {PLATFORM_LABELS[platform]}
        </span>
      </div>
    </div>
  );
}

/* ── 7. Models — the desktop composer model picker ──────────────── */
/* Mirrors `ComposerModelMenuItem` from the Stella desktop app:
 * engine segment, dropdown rows, reasoning segment, and the advanced
 * "Use your own provider or key" row. The point is fidelity to the
 * menu users actually open from the composer, not a settings-card
 * interpretation of model choice.
 */

type ModelRow = {
  id: string;
  name: string;
  tier: string;
};

const MODEL_ROWS: ReadonlyArray<ModelRow> = [
  { id: "default", name: "Default", tier: "Standard" },
  { id: "opus-47", name: "Claude Opus 4.7", tier: "Pro" },
  { id: "gpt-55", name: "GPT-5.5", tier: "Standard" },
  { id: "gemini-35", name: "Gemini 3.5 Pro", tier: "Standard" },
  { id: "llama-41", name: "Llama 4.1 70B", tier: "Local" },
];

const REASONING_ROWS = [
  { id: "default", label: "Auto" },
  { id: "minimal", label: "Min" },
  { id: "low", label: "Low" },
  { id: "medium", label: "Med" },
  { id: "high", label: "High" },
  { id: "xhigh", label: "Max" },
] as const;

type ProviderLogo = {
  id: string;
  label: string;
  viewBox: string;
  path: string;
};

/* Brand marks sourced from official/simple-icons SVGs. Keep these as
 * real logos instead of invented glyphs: the row is small, but users
 * recognize these shapes immediately.
 */
const PROVIDERS: ReadonlyArray<ProviderLogo> = [
  {
    id: "anthropic",
    label: "Anthropic",
    viewBox: "0 0 24 24",
    path: "M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z",
  },
  {
    id: "openai",
    label: "OpenAI",
    viewBox: "0 0 323 320",
    path: "M123.2 118.3V85c0-2.2.6-3.8 2.9-5.1L187.9 44c8.3-4.8 18.9-7 29.2-7 39.1 0 63.8 30.1 63.8 62.5 0 2.6 0 6.1-.6 9l-64.7-37.8c-3.2-1.9-6.7-2.2-10.6 0l-81.8 47.6Zm142.9 118.3v-74c0-4.2-1.6-7-5.4-9.3l-82-47.7 28.8-16.7c1.6-1 4.2-1 5.8 0l62.2 35.9c17.6 10.3 29.8 32.7 29.8 54.1-.1 25.3-15.5 48.7-39.2 57.7ZM106.2 172.8l-28.5-17c-2.2-1.3-2.9-2.9-2.9-5.1V79.3c0-34.9 26.6-61.2 62.8-61.2 14.1 0 27.6 4.8 38.4 13.5L111.7 69c-3.8 2.2-5.4 5.1-5.4 9.3v94.5Zm55.8 32.1-38.8-21.8V137l38.8-21.8 38.4 21.8v46.1L162 204.9Zm24 97c-14.1 0-27.6-4.8-38.4-13.5L212 251c3.8-2.2 5.4-5.1 5.4-9.3v-94.5l28.8 17c2.2 1.3 2.9 2.9 2.9 5.1v71.5c0 34.9-26.9 61.1-63.1 61.1Zm-75.6-70.8-62.2-35.9c-17.6-10.3-29.8-32.7-29.8-54.1 0-25.6 15.7-48.7 39.4-57.7v74.3c0 4.2 1.6 7 5.4 9.3l81.7 47.4-28.8 16.7c-1.5 1-4.1 1-5.7 0ZM106.5 283c-36.8 0-63.8-27.6-63.8-61.8 0-3.2.3-6.4.6-9.3l64.4 37.2c3.8 2.2 7 2.2 10.9 0l81.7-47.4V235c0 2.2-.6 3.8-2.9 5.1L135.7 276c-8.3 4.8-18.9 7-29.2 7Zm79.5 36.2c38.4 0 70.5-27.6 77.5-64.1 35.9-9 59-42.3 59-76.3 0-22.4-9.6-43.9-27.2-59.6 1.6-6.7 2.9-13.8 2.9-20.5 0-45.2-36.8-79.1-79.1-79.1-8.7 0-17.3 1.6-25.6 4.5C179 9.7 159.4.8 137.6.8 99.2.8 67.1 28.4 60.1 64.9c-35.9 9-59 42.3-59 76.3 0 22.4 9.6 43.9 27.2 59.6-1.6 6.7-2.9 13.8-2.9 20.5 0 45.2 36.8 79.1 79.1 79.1 8.7 0 17.3-1.6 25.6-4.5 14.6 14.4 34.1 23.3 55.9 23.3Z",
  },
  {
    id: "gemini",
    label: "Google Gemini",
    viewBox: "0 0 24 24",
    path: "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81",
  },
  {
    id: "meta",
    label: "Meta",
    viewBox: "0 0 24 24",
    path: "M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973.07.302.159.59.265.86.106.271.23.525.371.761.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325.183.3 2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843.325-.273.595-.6.81-.973.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98l.211-.327c1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533.35-.189.712-.285 1.088-.285Z",
  },
  {
    id: "mistral",
    label: "Mistral AI",
    viewBox: "0 0 24 24",
    path: "M17.143 3.429v3.428h-3.429v3.429h-3.428V6.857H6.857V3.43H3.43v13.714H0v3.428h10.286v-3.428H6.857v-3.429h3.429v3.429h3.429v-3.429h3.428v3.429h-3.428v3.428H24v-3.428h-3.43V3.429z",
  },
  {
    id: "ollama",
    label: "Ollama (local)",
    viewBox: "0 0 24 24",
    path: "M16.361 10.26a.894.894 0 0 0-.558.47l-.072.148.001.207c0 .193.004.217.059.353.076.193.152.312.291.448.24.238.51.3.872.205a.86.86 0 0 0 .517-.436.752.752 0 0 0 .08-.498c-.064-.453-.33-.782-.724-.897a1.06 1.06 0 0 0-.466 0zm-9.203.005c-.305.096-.533.32-.65.639a1.187 1.187 0 0 0-.06.52c.057.309.31.59.598.667.362.095.632.033.872-.205.14-.136.215-.255.291-.448.055-.136.059-.16.059-.353l.001-.207-.072-.148a.894.894 0 0 0-.565-.472 1.02 1.02 0 0 0-.474.007Zm4.184 2c-.131.071-.223.25-.195.383.031.143.157.288.353.407.105.063.112.072.117.136.004.038-.01.146-.029.243-.02.094-.036.194-.036.222.002.074.07.195.143.253.064.052.076.054.255.059.164.005.198.001.264-.03.169-.082.212-.234.15-.525-.052-.243-.042-.28.087-.355.137-.08.281-.219.324-.314a.365.365 0 0 0-.175-.48.394.394 0 0 0-.181-.033c-.126 0-.207.03-.355.124l-.085.053-.053-.032c-.219-.13-.259-.145-.391-.143a.396.396 0 0 0-.193.032zm.39-2.195c-.373.036-.475.05-.654.086-.291.06-.68.195-.951.328-.94.46-1.589 1.226-1.787 2.114-.04.176-.045.234-.045.53 0 .294.005.357.043.524.264 1.16 1.332 2.017 2.714 2.173.3.033 1.596.033 1.896 0 1.11-.125 2.064-.727 2.493-1.571.114-.226.169-.372.22-.602.039-.167.044-.23.044-.523 0-.297-.005-.355-.045-.531-.288-1.29-1.539-2.304-3.072-2.497a6.873 6.873 0 0 0-.855-.031zm.645.937a3.283 3.283 0 0 1 1.44.514c.223.148.537.458.671.662.166.251.26.508.303.82.02.143.01.251-.043.482-.08.345-.332.705-.672.957a3.115 3.115 0 0 1-.689.348c-.382.122-.632.144-1.525.138-.582-.006-.686-.01-.853-.042-.57-.107-1.022-.334-1.35-.68-.264-.28-.385-.535-.45-.946-.03-.192.025-.509.137-.776.136-.326.488-.73.836-.963.403-.269.934-.46 1.422-.512.187-.02.586-.02.773-.002z",
  },
  {
    id: "x",
    label: "xAI",
    viewBox: "0 0 24 24",
    path: "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    viewBox: "0 0 24 24",
    path: "M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615zm1.001-6.44a.306.306 0 0 1 .415-.287.3.3 0 0 1 .113.074.3.3 0 0 1 .086.214c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45",
  },
];

const MODELS_HOLD_MS = 1700;

export function MockModels({ isActive }: MockProps) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const id = window.setInterval(() => {
      setSelected((i) => (i + 1) % MODEL_ROWS.length);
    }, MODELS_HOLD_MS);
    return () => window.clearInterval(id);
  }, [isActive]);

  return (
    <div className="story-mock story-mock--models">
      <div className="model-picker-mock__menus" aria-hidden="true">
        <div
          className="model-picker-parent composer-add-menu"
          data-component="dropdown-menu-content"
          data-state="open"
          role="menu"
        >
          <div data-slot="dropdown-menu-item" role="menuitem">
            <span data-slot="dropdown-menu-item-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Attach files…
          </div>
          <div data-slot="dropdown-menu-item" role="menuitem">
            <span data-slot="dropdown-menu-item-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="13"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
              </svg>
            </span>
            Capture
          </div>
          <div data-slot="dropdown-menu-item" role="menuitem">
            <span data-slot="dropdown-menu-item-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7V5a1 1 0 0 1 1-1h2m10 0h2a1 1 0 0 1 1 1v2M4 17v2a1 1 0 0 0 1 1h2m10 0h2a1 1 0 0 0 1-1v-2M8 12h8"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Select area
          </div>
          <div data-slot="dropdown-menu-separator" />
          <div
            data-slot="dropdown-menu-sub-trigger"
            data-state="open"
            role="menuitem"
          >
            <span data-slot="dropdown-menu-item-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <path
                  d="M9 9h6v6H9zM9 1v3m6-3v3M9 20v3m6-3v3M1 9h3m-3 6h3m16-6h3m-3 6h3"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>Model</span>
            <span data-slot="dropdown-menu-trailing">
              <span>Opus 4.7</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="m9 18 6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <div data-slot="dropdown-menu-separator" />
          <div data-slot="dropdown-menu-item" role="menuitem">
            <span data-slot="dropdown-menu-item-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 5 6 9H2v6h4l5 4V5Zm8.07 4.93a5 5 0 0 1 0 4.14M22 7a9 9 0 0 1 0 10"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Read replies aloud
          </div>
        </div>

        {/* Floating submenu styled to match `.composer-model-submenu`. */}
      <div
        className="model-picker-mock composer-model-submenu"
        data-component="dropdown-menu-content"
        data-state="open"
        role="menu"
        aria-label="Model"
      >
        <div className="composer-model-submenu__engine">
          <span className="composer-model-submenu__engine-label">Engine</span>
          <div
            className="composer-model-submenu__engine-segment"
            role="radiogroup"
            aria-label="Agent engine"
          >
            <button
              type="button"
              role="radio"
              aria-checked
              data-selected
              className="composer-model-submenu__engine-btn"
              tabIndex={-1}
            >
              Stella
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={false}
              className="composer-model-submenu__engine-btn"
              tabIndex={-1}
            >
              Claude Code
            </button>
          </div>
        </div>

        <div data-slot="dropdown-menu-separator" aria-hidden="true" />

        <div className="model-picker-mock__list" role="none">
          {MODEL_ROWS.map((row, i) => {
            const active = i === selected;
            return (
              <div
                key={row.id}
                role="menuitemradio"
                aria-checked={active}
                className="model-picker-mock__row composer-model-submenu__row"
                data-slot="dropdown-menu-item"
                data-selected={active || undefined}
              >
                <span data-slot="dropdown-menu-item-icon" aria-hidden="true">
                  {active ? (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M20 6 9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
                <span className="composer-model-submenu__name">{row.name}</span>
                <span className="composer-model-submenu__trail">{row.tier}</span>
              </div>
            );
          })}
        </div>

        <div data-slot="dropdown-menu-separator" aria-hidden="true" />

        <div className="composer-model-submenu__reasoning">
          <span className="composer-model-submenu__reasoning-label">
            Reasoning
          </span>
          <div
            className="composer-model-submenu__reasoning-segment"
            role="radiogroup"
            aria-label="Reasoning effort"
          >
            {REASONING_ROWS.map((option, i) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={i === 0}
                data-selected={i === 0 || undefined}
                className="composer-model-submenu__reasoning-btn"
                tabIndex={-1}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div data-slot="dropdown-menu-separator" aria-hidden="true" />

        <div
          className="model-picker-mock__advanced"
          data-slot="dropdown-menu-item"
          role="menuitem"
        >
          <span data-slot="dropdown-menu-item-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 8h4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>Use your own provider or key</span>
        </div>
      </div>
      </div>

      {/* Providers strip — the families Stella plugs into. Mirrors the
          "Bring any model" promise in the right-hand copy. */}
      <div className="model-providers" aria-label="Supported providers">
        <span className="model-providers__title">Works with</span>
        <ul className="model-providers__list">
          {PROVIDERS.map((p) => (
            <li
              key={p.id}
              className="model-providers__item"
              title={p.label}
            >
              <svg
                viewBox={p.viewBox}
                width="18"
                height="18"
                aria-hidden="true"
                focusable="false"
              >
                <path d={p.path} fill="currentColor" />
              </svg>
              <span className="model-providers__label">{p.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── 8. Private — real Stella settings card (no green checkmarks) ── */
/* Mirrors `.settings-card` + `.settings-row` from the desktop Settings
 * pane. Each row is `label + helper text` on the left and a soft
 * status pill on the right — same shape as the real Local / Telemetry
 * toggles. The "Data folder" row at the bottom matches the way the
 * desktop surfaces `~/Library/Application Support/Stella`. */

const PRIVACY_ROWS: ReadonlyArray<{
  label: string;
  desc: string;
  status: string;
}> = [
  {
    label: "Local storage",
    desc: "Chats, files, and memory stay on this computer.",
    status: "On",
  },
  {
    label: "Cloud sync",
    desc: "Nothing leaves your machine unless you turn this on.",
    status: "Off",
  },
  {
    label: "Telemetry",
    desc: "No analytics, no usage pings, no shadow logs.",
    status: "Off",
  },
];

export function MockPrivate() {
  return (
    <div className="story-mock story-mock--settings story-mock--private">
      <div className="settings-mock">
        <header className="settings-mock__header">
          <h3 className="settings-mock__title">Privacy</h3>
          <p className="settings-mock__desc">
            Stella runs on your computer. Every line of it is open source —
            read it, fork it, change it.
          </p>
        </header>

        <ul className="settings-mock__rows">
          {PRIVACY_ROWS.map((row) => (
            <li key={row.label} className="settings-mock__row">
              <div className="settings-mock__row-info">
                <span className="settings-mock__row-label">{row.label}</span>
                <span className="settings-mock__row-desc">{row.desc}</span>
              </div>
              <span
                className="settings-mock__row-status"
                data-on={row.status === "On" || undefined}
              >
                {row.status}
              </span>
            </li>
          ))}
        </ul>

        <div className="settings-mock__path">
          <span className="settings-mock__path-key">Data folder</span>
          <span className="settings-mock__path-value">
            ~/Library/Application Support/Stella
          </span>
        </div>
      </div>
    </div>
  );
}
