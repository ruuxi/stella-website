"use client";

import { Monitor } from "lucide-react";
import Image from "next/image";
import styles from "./home-computer-use.module.css";

const mailBody = [
  "Hi Maya,",
  "Saturday's all set — I booked the 7:30 table at Luna Cucina and added it to the calendar. I'll bring the tickets.",
  "See you then!",
];

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
  return (
    <section
      className={`grid-shell section-border home-atlas-section ${styles.section}`}
      data-reveal
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

              <div className={styles.desktop}>
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
                    <span className={styles.title}>New Message</span>
                  </div>
                  <div className={styles.mailToolbar}>
                    <button type="button" className={styles.sendButton}>
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
                    {mailBody.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    <span className={styles.typingCaret} />
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
                          return (
                            <li
                              key={item.label}
                              data-done={item.done || undefined}
                              data-anim={animated || undefined}
                            >
                              <span className={styles.checkbox}>
                                {item.done || animated ? (
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
                                ) : null}
                              </span>
                              <span className={styles.checkLabel}>
                                {item.label}
                              </span>
                              {animated ? (
                                <div
                                  className={`${styles.cursor} ${styles.cursorYou}`}
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
                    <b style={{ ["--step" as string]: 0 }}>Filling the reply</b>
                    <b style={{ ["--step" as string]: 1 }}>Moving to Send</b>
                    <b style={{ ["--step" as string]: 2 }}>Message sent</b>
                  </span>
                </div>

                {/* Cursors */}
                <div className={`${styles.cursor} ${styles.cursorStella}`}>
                  <Pointer className={styles.pointer} />
                  <span className={styles.clickRing} />
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
