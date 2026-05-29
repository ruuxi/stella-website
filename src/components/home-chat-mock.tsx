"use client";

import { ArrowUp, Mic, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { StellaAnimation } from "@/components/stella-animation/stella-animation";
import styles from "./home-chat-mock.module.css";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  text: string;
  streaming: boolean;
};

type Frame = {
  messages: Message[];
  /** Status shown in the inline working indicator below the last reply. */
  status: string | null;
};

type Turn =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; tasks: string[] };

// One ongoing conversation where Stella is handed several jobs in a single
// breath, runs them in parallel, and reports back — the multitask story.
const SCRIPT: Turn[] = [
  {
    role: "user",
    text: "Plan my Saturday — compare grocery prices, hold a 7:30 dinner table, and add the school-form deadline to my calendar.",
  },
  {
    role: "assistant",
    text: "On it. I'll run these in parallel and bring each result back to this chat.",
    tasks: [
      "Comparing grocery prices",
      "Holding a 7:30 table at Luna Cucina",
      "Reading the school PDF",
      "Adding the deadline to Calendar",
    ],
  },
  {
    role: "user",
    text: "Text Mom the plan once it's set.",
  },
  {
    role: "assistant",
    text: "Done. Aldi is cheapest at $74, the table is held, the form is due Friday, and Mom has the plan.",
    tasks: ["Drafting Mom's message", "Confirming the reservation"],
  },
];

const CONTEXT_CHIPS = [
  { label: "Mail", iconSrc: "/mock-app-icons/mail.png" },
  { label: "Maps", iconSrc: "/mock-app-icons/maps.png" },
  { label: "Notes", iconSrc: "/mock-app-icons/notes.png" },
];

const WORD_MS = 46;
const USER_HOLD_MS = 1050;
const PRE_STREAM_MS = 620;
const POST_WORK_MS = 1500;
const DONE_HOLD_MS = 1100;
const LOOP_RESET_MS = 2400;

/** Tokenise into word + trailing-space chunks so streaming reveals whole
 * words and the text still wraps naturally (no nowrap clipping). */
function tokenize(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

type Step = { frame: Frame; hold: number };

/** Pre-compute the full timeline as discrete frames. Discrete frames keep
 * message ordering and streaming deterministic — no racing intervals. */
function buildSteps(): Step[] {
  const steps: Step[] = [];
  const committed: Message[] = [];

  SCRIPT.forEach((turn, turnIndex) => {
    if (turn.role === "user") {
      const message: Message = {
        id: `m${turnIndex}`,
        role: "user",
        text: turn.text,
        streaming: false,
      };
      committed.push(message);
      steps.push({
        frame: { messages: committed.slice(), status: null },
        hold: USER_HOLD_MS,
      });
      return;
    }

    const id = `m${turnIndex}`;
    const tokens = tokenize(turn.text);

    // Indicator appears before the first token streams in.
    steps.push({
      frame: {
        messages: committed.concat({ id, role: "assistant", text: "", streaming: true }),
        status: turn.tasks[0],
      },
      hold: PRE_STREAM_MS,
    });

    // Stream word by word, rotating the parallel-task status underneath.
    let partial = "";
    tokens.forEach((token, tokenIndex) => {
      partial += token;
      const status = turn.tasks[Math.floor(tokenIndex / 5) % turn.tasks.length];
      steps.push({
        frame: {
          messages: committed.concat({
            id,
            role: "assistant",
            text: partial,
            streaming: true,
          }),
          status,
        },
        hold: WORD_MS,
      });
    });

    // Hold the indicator while the remaining background jobs wrap up,
    // cycling through each task once more.
    turn.tasks.forEach((task) => {
      steps.push({
        frame: {
          messages: committed.concat({
            id,
            role: "assistant",
            text: turn.text,
            streaming: true,
          }),
          status: task,
        },
        hold: POST_WORK_MS / turn.tasks.length,
      });
    });

    // Commit the finished reply and drop the indicator.
    const done: Message = { id, role: "assistant", text: turn.text, streaming: false };
    committed.push(done);
    steps.push({
      frame: { messages: committed.slice(), status: null },
      hold: DONE_HOLD_MS,
    });
  });

  // Hold the finished conversation, then reset to an empty thread.
  steps.push({ frame: { messages: committed.slice(), status: null }, hold: LOOP_RESET_MS });
  steps.push({ frame: { messages: [], status: null }, hold: 520 });

  return steps;
}

const STEPS = buildSteps();

export function HomeChatMock() {
  const [frame, setFrame] = useState<Frame>(STEPS[STEPS.length - 1].frame);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let index = 0;
    let timer: number | undefined;

    const tick = () => {
      const step = STEPS[index];
      setFrame(step.frame);
      index = (index + 1) % STEPS.length;
      timer = window.setTimeout(tick, step.hold);
    };

    timer = window.setTimeout(tick, 400);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [frame]);

  const working = frame.status !== null;

  return (
    <div className={styles.chat} aria-label="Animated Stella multitask chat">
      <div className={styles.transcript} ref={transcriptRef}>
        <div className={styles.transcriptInner}>
          {frame.messages.map((message) =>
            message.role === "user" ? (
              <div className={styles.userBubble} key={message.id}>
                {message.text}
              </div>
            ) : (
              <p className={styles.assistant} key={message.id}>
                {message.text}
                {message.streaming ? <span className={styles.caret} /> : null}
              </p>
            ),
          )}
          <div
            className={styles.inlineIndicator}
            data-active={working || undefined}
            aria-hidden={!working}
          >
            <span className={styles.indicatorStella}>
              <StellaAnimation
                width={20}
                height={20}
                maxDpr={1}
                frameSkip={2}
                initialBirthProgress={1}
              />
            </span>
            <span className={styles.indicatorStatus}>
              <span key={frame.status ?? "idle"} className={styles.indicatorStatusText}>
                {frame.status ?? ""}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.composer}>
        <div className={styles.contextRow}>
          <div className={styles.workingPill} data-active={working || undefined}>
            <span className={styles.pillStella}>
              <StellaAnimation
                width={18}
                height={18}
                maxDpr={1}
                frameSkip={2}
                initialBirthProgress={1}
              />
            </span>
            <span>Working</span>
          </div>
          <div className={styles.chips} data-shifted={working || undefined}>
            {CONTEXT_CHIPS.map((chip) => (
              <span className={styles.chip} key={chip.label} title={`Add ${chip.label}`}>
                <span className={styles.chipPlus} aria-hidden="true">
                  +
                </span>
                <Image
                  src={chip.iconSrc}
                  alt=""
                  width={16}
                  height={16}
                  draggable={false}
                  aria-hidden="true"
                />
              </span>
            ))}
          </div>
        </div>
        <div className={styles.inputBar}>
          <button type="button" aria-label="Add context">
            <Plus size={15} strokeWidth={2.1} />
          </button>
          <span className={styles.placeholder}>Ask me anything...</span>
          <button type="button" aria-label="Dictate">
            <Mic size={14} strokeWidth={1.9} />
          </button>
          <button type="button" className={styles.send} aria-label="Send">
            <ArrowUp size={14} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
