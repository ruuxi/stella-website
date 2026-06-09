"use client";

import {
  CalendarCheck,
  Check,
  FileSpreadsheet,
  Loader,
  MessageCircle,
  Send,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useSceneLoop } from "@/lib/use-scene-loop";
import { HomeMiniChatMock } from "./home-desktop-mock";
import mock from "./home-desktop-mock.module.css";
import { Composer } from "./home-mock-composer";
import styles from "./home-single-chat.module.css";

type Exchange = {
  icon: typeof Send;
  label: string;
  top: number;
  user: string;
  reply: string;
};

// Each request chip fires its own exchange into the one chat.
const EXCHANGES: Exchange[] = [
  {
    icon: CalendarCheck,
    label: "Plan the weekend",
    top: 8,
    user: "Plan Saturday around dinner and the school form.",
    reply:
      "Booked 7:30 at Luna Cucina and the form is due Friday — both are on your calendar.",
  },
  {
    icon: Send,
    label: "Text the team",
    top: 30,
    user: "Text the group that we're on for 7:30.",
    reply: "Sent. Maya and Ben are in — Maya's bringing dessert.",
  },
  {
    icon: FileSpreadsheet,
    label: "Build a spreadsheet",
    top: 52,
    user: "Turn these receipts into a budget sheet.",
    reply: "Done — totals by store, with the cheaper one highlighted.",
  },
  {
    icon: Loader,
    label: "Run in the background",
    top: 74,
    user: "Watch flight prices to Lisbon for me.",
    reply: "Watching daily. I'll flag anything under $250.",
  },
];

type Message = { role: "user" | "assistant"; text: string };

export function HomeSingleChat() {
  const sectionRef = useRef<HTMLElement>(null);
  // Chips: < activeIndex are done, === activeIndex is firing, > are idle.
  const [activeIndex, setActiveIndex] = useState(-1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [composerTyped, setComposerTyped] = useState("");
  const [clearing, setClearing] = useState(false);

  const reset = useCallback(() => {
    setActiveIndex(-1);
    setMessages([]);
    setComposerTyped("");
    setClearing(false);
  }, []);

  const { reduced } = useSceneLoop(
    sectionRef,
    async ({ sleep, type }) => {
      for (let k = 0; k < EXCHANGES.length; k += 1) {
        const exchange = EXCHANGES[k];
        setActiveIndex(k);
        await sleep(420);
        await type(exchange.user, setComposerTyped, 22);
        await sleep(240);
        setComposerTyped("");
        setMessages((prev) => [
          ...prev,
          { role: "user", text: exchange.user },
        ]);
        await sleep(380);
        // The reply streams into one stable node: it mounts empty (showing
        // the thinking dots), then fills word by word — never remounted, so
        // its entry animation only ever runs once.
        setMessages((prev) => [...prev, { role: "assistant", text: "" }]);
        await sleep(820);
        const words = exchange.reply.split(" ");
        for (let w = 1; w <= words.length; w += 1) {
          const text = words.slice(0, w).join(" ");
          setMessages((prev) => {
            const next = prev.slice();
            next[next.length - 1] = { role: "assistant", text };
            return next;
          });
          await sleep(34);
        }
        await sleep(420);
      }
      setActiveIndex(EXCHANGES.length);
      await sleep(3200);
      // Fade the conversation out before the loop resets it, so the
      // restart reads as a deliberate beat instead of a snap.
      setClearing(true);
      await sleep(450);
    },
    reset,
  );

  // Reduced motion: settled frame — all chips done, full conversation.
  const shownMessages = reduced
    ? EXCHANGES.flatMap((exchange): Message[] => [
        { role: "user", text: exchange.user },
        { role: "assistant", text: exchange.reply },
      ])
    : messages;
  const shownIndex = reduced ? EXCHANGES.length : activeIndex;

  return (
    <section
      className={`grid-shell section-border home-atlas-section ${styles.section}`}
      data-reveal
      ref={sectionRef}
    >
      <div
        className="home-atlas-heading"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 0 }}
      >
        <h2>One chat for everything.</h2>
      </div>

      <div className="home-atlas-scene home-atlas-scene--reverse">
        <div
          className="home-atlas-copy"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 2 }}
        >
          <span className="home-atlas-kicker">
            <MessageCircle size={15} strokeWidth={1.9} aria-hidden="true" />
            One chat
          </span>
          <p>
            No more juggling threads. Fire off a plan, a file, a message, and a
            background task at once — they all flow into the same conversation
            and come back together.
          </p>
        </div>

        <div
          className={`home-atlas-media home-atlas-media--right ${styles.media}`}
          data-reveal-child
          style={{ ["--reveal-index" as string]: 1 }}
          aria-hidden="true"
        >
          <div className={styles.diagram}>
            <div className={styles.inputs}>
              {EXCHANGES.map((exchange, i) => {
                const state =
                  i < shownIndex ? "done" : i === shownIndex ? "firing" : "idle";
                return (
                  <div
                    className={styles.node}
                    key={exchange.label}
                    data-state={state}
                    style={{ ["--top" as string]: `${exchange.top}%` }}
                  >
                    <span className={styles.nodeIcon}>
                      {state === "done" ? (
                        <Check size={14} strokeWidth={2.2} aria-hidden="true" />
                      ) : (
                        <exchange.icon
                          size={15}
                          strokeWidth={1.9}
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className={styles.nodeLabel}>{exchange.label}</span>
                  </div>
                );
              })}
            </div>

            <svg
              className={styles.connectors}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="oneChatFlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="rgba(82, 104, 134, 0.18)" />
                  <stop offset="1" stopColor="rgba(37, 99, 235, 0.6)" />
                </linearGradient>
              </defs>
              {EXCHANGES.map((exchange, i) => (
                <path
                  key={exchange.label}
                  data-firing={i === shownIndex || undefined}
                  d={`M0 ${exchange.top} C 58 ${exchange.top}, 42 50, 100 50`}
                />
              ))}
            </svg>

            <div className={`home-atlas-fade ${styles.frame}`}>
              <span className={styles.merge} aria-hidden="true" />
              <HomeMiniChatMock className={styles.miniWindow} themeId="sage">
                <div className={styles.liveChat}>
                  <div
                    className={styles.liveTranscript}
                    data-clearing={clearing || undefined}
                  >
                    {shownMessages.map((message, i) => (
                      <div key={i} className={styles.entry}>
                        <div className={styles.entryInner}>
                          {message.role === "user" ? (
                            <div className={mock.userMessage}>
                              {message.text}
                            </div>
                          ) : (
                            <div className={mock.assistantRow}>
                              {message.text ? (
                                <p className={mock.assistantMessage}>
                                  {message.text}
                                </p>
                              ) : (
                                <span className={styles.thinking}>
                                  <i />
                                  <i />
                                  <i />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Composer
                    showContext={false}
                    typed={composerTyped}
                    className={mock.chatComposerWrap}
                  />
                </div>
              </HomeMiniChatMock>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
