"use client";

import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";

/**
 * Story sections for the home-page sticky grid.
 *
 * Each section pairs scrolling copy with a real-Stella mock that's
 * already used elsewhere on the site (composer, mini-window, app
 * shell, memory/actions/voice cards, mobile phone). The mocks are
 * lazy-loaded so the home page doesn't ship every interactive demo
 * in the first chunk.
 */

const MockChat = dynamic(
  () => import("./real-mocks").then((m) => m.MockChat),
  { ssr: false, loading: () => <SlotPlaceholder /> },
);

const MockCustomize = dynamic(
  () => import("./real-mocks").then((m) => m.MockCustomize),
  { ssr: false, loading: () => <SlotPlaceholder /> },
);

const MockMemory = dynamic(
  () => import("./real-mocks").then((m) => m.MockMemory),
  { ssr: false, loading: () => <SlotPlaceholder /> },
);

const MockActions = dynamic(
  () => import("./real-mocks").then((m) => m.MockActions),
  { ssr: false, loading: () => <SlotPlaceholder /> },
);

const MockVoice = dynamic(
  () => import("./real-mocks").then((m) => m.MockVoice),
  { ssr: false, loading: () => <SlotPlaceholder /> },
);

const MockAnywhere = dynamic(
  () => import("./real-mocks").then((m) => m.MockAnywhere),
  { ssr: false, loading: () => <SlotPlaceholder /> },
);

const MockModels = dynamic(
  () => import("./real-mocks").then((m) => m.MockModels),
  { ssr: false, loading: () => <SlotPlaceholder /> },
);

const MockPrivate = dynamic(
  () => import("./real-mocks").then((m) => m.MockPrivate),
  { ssr: false, loading: () => <SlotPlaceholder /> },
);

function SlotPlaceholder() {
  return <div className="story-slot-placeholder" aria-hidden="true" />;
}

export type StorySectionId =
  | "chat"
  | "customize"
  | "memory"
  | "actions"
  | "voice"
  | "anywhere"
  | "models"
  | "private";

/**
 * Some mocks need to react to scroll. Two channels are exposed:
 * - `isActive`: this section (or any of its steps) is the active scroll
 *   target. Off-screen mocks should pause their timers.
 * - `step`: when a section declares `steps`, this is the index of the
 *   step currently in view. Pure-CSS mocks can ignore it.
 *
 * Both are optional so single-step mocks can declare zero-arg
 * signatures without TS variance complaints.
 */
export type MockProps = { isActive?: boolean; step?: number };

/**
 * A single right-side scroll target inside a section. When a section
 * has multiple steps, each step renders its own `<section>` in the
 * copy column with its own eyebrow/title/body, but all steps share a
 * single stage slot — the active step's index is forwarded to the
 * Mock so it can swap in-place rather than cross-fading between
 * mounts.
 */
export type StoryStep = {
  /** Stable id; only used for keys. */
  id: string;
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  /** 3–6 word phrase shown above the mock inside the stage frame for
   *  this step. Used when the section's copy is `sharedCopy: true` so
   *  the per-step request still surfaces — just above the mock instead
   *  of in the copy column. */
  mockTitle?: string;
};

export type StorySection = {
  id: StorySectionId;
  /** Used when the section has no `steps`. */
  eyebrow?: string;
  title?: ReactNode;
  body?: ReactNode;
  footnote?: ReactNode;
  Mock: ComponentType<MockProps>;
  /** Optional multi-step layout. When present, each step gets its own
   *  scroll target in the copy column; the stage shows one shared slot
   *  for the whole section and `step` is passed to the Mock. */
  steps?: ReadonlyArray<StoryStep>;
  /** When true and `steps` is set, the copy column renders the
   *  section's own `eyebrow/title/body` once and pins it (sticky)
   *  while the user scrolls through the step anchors. Each step still
   *  drives the stage via its `mockTitle` and the Mock's `step` prop. */
  sharedCopy?: boolean;
};

export const STORY_SECTIONS: ReadonlyArray<StorySection> = [
  {
    /* Customize is the lede now. It's the most visceral "this is
     * different" moment — Stella visibly rearranging herself in front
     * of you — so it leads the story instead of "one chat". The five
     * steps below progress on scroll: as the right-side copy walks
     * through each request the user makes, the left mock redraws
     * itself to match. */
    id: "customize",
    Mock: MockCustomize,
    /* Each step is its own scrolling section — the right-side copy
     * changes alongside the mock so scrolling actually moves text,
     * not just the active step indicator. The user prompt for the
     * step still surfaces above the mock via `mockTitle`. */
    eyebrow: "Yours",
    title: <>An app that becomes you.</>,
    body: null,
    steps: [
      {
        id: "intro",
        eyebrow: "Yours",
        title: <>An app that becomes you.</>,
        body: (
          <p>
            Make Stella look how you want. Tabs, a dashboard, a whole
            new app — just ask, and she becomes it.
          </p>
        ),
        mockTitle: "Show me what you can do",
      },
      {
        id: "header",
        eyebrow: "Layout",
        title: <>Reshape the chrome.</>,
        body: (
          <p>
            Ask for tabs and they show up. Stella rearranges the window
            to match the way you work.
          </p>
        ),
        mockTitle: "Give me tabs at the top",
      },
      {
        id: "messages",
        eyebrow: "Surfaces",
        title: <>Turn chat into a dashboard.</>,
        body: (
          <p>
            When a conversation outgrows the chat, Stella turns it into
            a workspace — your day, laid out at a glance.
          </p>
        ),
        mockTitle: "Make me a dashboard",
      },
      {
        id: "createApp",
        eyebrow: "New tools",
        title: <>And when she runs out of room, she builds new apps.</>,
        body: (
          <p>
            Need a music studio? A journal? A timer? Stella writes a
            small custom app inside herself, ready to use immediately.
          </p>
        ),
        mockTitle: "Build me a music app",
      },
      {
        id: "cozy",
        eyebrow: "Mood",
        title: <>Or a whole new mood.</>,
        body: (
          <p>
            Stella isn&apos;t just an interface — she&apos;s an
            atmosphere. Ask for cozy, calm, or playful, and she becomes
            it from background to font.
          </p>
        ),
        mockTitle: "Make a cozy home for my cat",
      },
    ],
  },
  {
    id: "chat",
    eyebrow: "Always there",
    title: <>One chat. From anywhere.</>,
    body: (
      <>
        <p>
          No tabs, no new windows for every idea. Stella keeps one running
          conversation — pop her open in a small floating window on top of
          whatever you&apos;re doing, ask for two things at once, and she
          runs them in parallel right inside the same chat.
        </p>
      </>
    ),
    Mock: MockChat,
  },
  {
    id: "memory",
    eyebrow: "Memory",
    title: <>Stella, who remembers.</>,
    body: (
      <>
        <p>
          Most assistants meet you for the first time, every time. Stella
          carries what matters — the people, the places, the way you like
          things — so the next conversation starts where the last one
          ended.
        </p>
      </>
    ),
    Mock: MockMemory,
  },
  {
    id: "actions",
    eyebrow: "Actions",
    title: <>Stella does the clicking.</>,
    body: (
      <>
        <p>
          Reserve the table, fill the form, ship the email. She drives
          your computer the way you would — you just say what you want,
          then watch her do it.
        </p>
      </>
    ),
    Mock: MockActions,
  },
  {
    id: "voice",
    eyebrow: "Voice",
    title: <>Talk. Or dictate anywhere.</>,
    body: (
      <>
        <p>
          Have a real conversation, hands-free. Or pull up a dictation
          bar inside any app — mail, messages, the doc you&apos;re
          writing — and just say the next sentence.
        </p>
      </>
    ),
    Mock: MockVoice,
  },
  {
    id: "anywhere",
    eyebrow: "Anywhere",
    title: <>Text Stella from anywhere.</>,
    body: (
      <>
        <p>
          Message her from iMessage, Slack, Discord, Telegram, Teams, or
          her own app on your phone. She replies from your computer, with
          all your stuff.
        </p>
      </>
    ),
    Mock: MockAnywhere,
  },
  {
    id: "models",
    eyebrow: "Models",
    title: <>Bring any model.</>,
    body: (
      <>
        <p>
          Use GPT, Claude, Gemini, or a model running on your own
          machine. Switch whenever you want — Stella works with all of
          them.
        </p>
      </>
    ),
    Mock: MockModels,
  },
  {
    id: "private",
    eyebrow: "Private",
    title: <>Your stuff stays yours.</>,
    body: (
      <>
        <p>
          Chats and files live on your computer. We don&apos;t keep them,
          and we can&apos;t see them. Every line of Stella&apos;s code is
          on GitHub — read it, fork it, change it.
        </p>
      </>
    ),
    Mock: MockPrivate,
  },
];
