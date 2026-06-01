"use client";

import {
  CalendarCheck,
  FileSpreadsheet,
  Loader,
  MessageCircle,
  Send,
} from "lucide-react";
import { HomeMiniChatMock } from "./home-desktop-mock";
import styles from "./home-single-chat.module.css";

const REQUESTS = [
  { icon: CalendarCheck, label: "Plan the weekend", top: 8 },
  { icon: Send, label: "Text the team", top: 30 },
  { icon: FileSpreadsheet, label: "Build a spreadsheet", top: 52 },
  { icon: Loader, label: "Run in the background", top: 74 },
];

export function HomeSingleChat() {
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
              {REQUESTS.map((req) => (
                <div
                  className={styles.node}
                  key={req.label}
                  style={{ ["--top" as string]: `${req.top}%` }}
                >
                  <span className={styles.nodeIcon}>
                    <req.icon size={15} strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <span className={styles.nodeLabel}>{req.label}</span>
                </div>
              ))}
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
              {REQUESTS.map((req) => (
                <path
                  key={req.label}
                  d={`M0 ${req.top} C 58 ${req.top}, 42 50, 100 50`}
                />
              ))}
            </svg>

            <div className={`home-atlas-fade ${styles.frame}`}>
              <span className={styles.merge} aria-hidden="true" />
              <HomeMiniChatMock className={styles.miniWindow} themeId="sage" />
            </div>

            <div className={styles.callout}>
              <strong>One surface</strong>
              <span>everything at once</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
