"use client";

import { Monitor } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useSceneLoop } from "@/lib/use-scene-loop";
import styles from "./home-computer-use.module.css";

const MAIL_LINE =
  "Saturday's all set — I booked the 7:30 table at Luna Cucina and added it to the calendar. I'll bring the tickets.";

const notes = [
  {
    title: "Saturday plan",
    snippet: "Dinner, school form, groceries",
    time: "1:18 PM",
  },
  {
    title: "Groceries",
    snippet: "Compare Aldi vs Market Lane",
    time: "12:02 PM",
  },
  {
    title: "Trip ideas",
    snippet: "Lisbon — flights + hotel",
    time: "Yesterday",
  },
  { title: "Reading list", snippet: "Neural nets primer (PDF)", time: "Tue" },
];

const checklist = [
  { label: "Book dinner — 7:30 PM", done: true },
  { label: "Add reservation to Calendar", done: true },
  { label: "Text Mom the plan", done: false },
  { label: "Print the school form", done: false },
];

/* The story, step by step:
   0 — idle desktop
   1 — Stella types the reply into Mail
   2 — Stella's cursor glides to Send
   3 — click
   4 — sent: title flips, sign-off lands
   5 — your cursor glides up and checks off "Text Mom the plan"
   6 — your cursor returns; scene holds */
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function Pointer({ className }: { className: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="24"
      viewBox="0 0 22 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 2.2 L3 18.4 L7.1 14.4 L9.9 20.9 L12.7 19.7 L9.9 13.3 L15.4 13.1 Z"
        fill="currentColor"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeComputerUse() {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState<Step>(0);
  const [mailTyped, setMailTyped] = useState("");
  const [momChecked, setMomChecked] = useState(false);

  const reset = useCallback(() => {
    setStep(0);
    setMailTyped("");
    setMomChecked(false);
  }, []);

  const { reduced } = useSceneLoop(
    sectionRef,
    async ({ sleep, type }) => {
      setStep(1);
      await sleep(350);
      await type(MAIL_LINE, setMailTyped, 13);
      await sleep(300);
      setStep(2);
      await sleep(850);
      setStep(3);
      await sleep(620);
      setStep(4);
      await sleep(1100);
      setStep(5);
      await sleep(820);
      setMomChecked(true);
      await sleep(750);
      setStep(6);
      await sleep(2600);
    },
    reset,
  );

  const shownStep: Step = reduced ? 6 : step;
  const shownTyped = reduced ? MAIL_LINE : mailTyped;
  const shownChecked = reduced ? true : momChecked;
  const sent = shownStep >= 4;

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
        <h2>Stella can drive your computer.</h2>
      </div>

      <div className="home-atlas-scene">
        <div
          className={`home-atlas-media home-atlas-media--left home-atlas-fade ${styles.media}`}
          data-reveal-child
          style={{ ["--reveal-index" as string]: 1 }}
          aria-hidden="true"
        >
          <div className={styles.display}>
            <div className={styles.screen}>
              <div className={styles.wallpaper} />

              <div className={styles.desktop} data-step={shownStep}>
                {/* Calendar peeking behind for depth */}
                <div className={`${styles.window} ${styles.calendarWindow}`}>
                  <div className={styles.titlebar}>
                    <span className={styles.lights}>
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className={styles.title}>Calendar</span>
                  </div>
                  <div className={styles.calBody}>
                    <div className={styles.calCol}>
                      <span>6 PM</span>
                      <span>7 PM</span>
                      <span>8 PM</span>
                    </div>
                    <div className={styles.calGrid}>
                      <div className={styles.calEvent}>
                        <strong>Dinner — Luna Cucina</strong>
                        <span>7:30 – 9:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mail compose — Stella is driving this window */}
                <div className={`${styles.window} ${styles.mailWindow}`}>
                  <div className={styles.titlebar}>
                    <span className={styles.lights}>
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className={styles.title} data-sent={sent || undefined}>
                      {sent ? "Message sent" : "New Message"}
                    </span>
                  </div>
                  <div className={styles.mailToolbar}>
                    <button
                      type="button"
                      className={styles.sendButton}
                      data-pressed={shownStep === 3 || undefined}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M3 11.5 21 3l-8.5 18-2.4-7.1Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <span className={styles.toolDivider} />
                    <span className={styles.toolGhost} />
                    <span className={styles.toolGhost} />
                    <span className={styles.toolGhost} />
                  </div>
                  <div className={styles.mailFields}>
                    <div className={styles.mailField}>
                      <span>To:</span>
                      <b className={styles.recipient}>Maya Lin</b>
                    </div>
                    <div className={styles.mailField}>
                      <span>Subject:</span>
                      <b>Saturday — we&apos;re all set</b>
                    </div>
                  </div>
                  <div className={styles.mailComposeBody}>
                    <p>Hi Maya,</p>
                    <p>
                      {shownTyped}
                      {shownStep === 1 ? (
                        <span className={styles.typingCaret} />
                      ) : null}
                    </p>
                    <p className={styles.signoff} data-shown={sent || undefined}>
                      See you then!
                    </p>
                  </div>
                </div>

                {/* Notes — you are working here in front */}
                <div className={`${styles.window} ${styles.notesWindow}`}>
                  <div className={styles.notesTitlebar}>
                    <span className={styles.lights}>
                      <i />
                      <i />
                      <i />
                    </span>
                    <div className={styles.notesToolbar}>
                      <span className={styles.toolGhost} />
                      <span className={styles.toolGhost} />
                      <span className={styles.toolGhost} />
                      <div className={styles.notesSearch}>Search</div>
                    </div>
                  </div>
                  <div className={styles.notesBody}>
                    <aside className={styles.notesList}>
                      {notes.map((note, index) => (
                        <div
                          className={styles.noteRow}
                          data-active={index === 0 || undefined}
                          key={note.title}
                        >
                          <strong>{note.title}</strong>
                          <span>
                            <em>{note.time}</em> {note.snippet}
                          </span>
                        </div>
                      ))}
                    </aside>
                    <div className={styles.noteEditor}>
                      <h4>Saturday plan</h4>
                      <span className={styles.noteDate}>Today, 1:18 PM</span>
                      <ul className={styles.noteChecklist}>
                        {checklist.map((item) => {
                          const animated = item.label === "Text Mom the plan";
                          const done =
                            item.done || (animated && shownChecked);
                          return (
                            <li
                              key={item.label}
                              data-done={done || undefined}
                              data-anim={animated || undefined}
                            >
                              <span className={styles.checkbox}>
                                <svg viewBox="0 0 12 12" aria-hidden="true">
                                  <path
                                    d="M2.5 6.2 5 8.6 9.5 3.6"
                                    fill="none"
                                    stroke="#fff"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                              <span className={styles.checkLabel}>
                                {item.label}
                              </span>
                              {animated ? (
                                <div
                                  className={`${styles.cursor} ${styles.cursorYou}`}
                                  data-step={shownStep}
                                >
                                  <Pointer className={styles.pointer} />
                                  <span className={styles.cursorLabel}>You</span>
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                      <p className={styles.noteText}>
                        Tickets are in the top drawer. Leave by 7:00 to make the
                        table.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live automation indicator */}
                <div className={styles.automation}>
                  <span className={styles.automationMark}>
                    <Image
                      src="/stella-logo.svg"
                      alt=""
                      width={13}
                      height={13}
                    />
                  </span>
                  <strong>stella-computer</strong>
                  <span className={styles.automationStep}>
                    <b data-on={shownStep === 1 || undefined}>
                      Filling the reply
                    </b>
                    <b data-on={shownStep === 2 || shownStep === 3 || undefined}>
                      Moving to Send
                    </b>
                    <b data-on={shownStep >= 4 || undefined}>Message sent</b>
                  </span>
                </div>

                {/* Stella's cursor */}
                <div className={`${styles.cursor} ${styles.cursorStella}`}>
                  <Pointer className={styles.pointer} />
                  <span
                    className={styles.clickRing}
                    data-click={shownStep === 3 || undefined}
                  />
                  <span className={styles.cursorLabel}>
                    <span className={styles.cursorLabelMark}>
                      <Image
                        src="/stella-logo.svg"
                        alt=""
                        width={9}
                        height={9}
                      />
                    </span>
                    Stella
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="home-atlas-copy home-atlas-copy--right"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 2 }}
        >
          <span className="home-atlas-kicker">
            <Monitor size={15} strokeWidth={1.9} aria-hidden="true" />
            Computer use
          </span>
          <p>
            Keep working in one window while Stella moves through another,
            clicking, typing, and finishing real tasks in your actual apps.
          </p>
        </div>
      </div>
    </section>
  );
}
