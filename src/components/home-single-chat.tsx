"use client";

import { MessageCircle } from "lucide-react";
import { HomeMiniChatMock } from "./home-desktop-mock";
import styles from "./home-single-chat.module.css";

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
            Stella keeps everything in one conversation. Ask for a plan, a file,
            a message, and a background task at the same time, then watch it all
            come back to the same chat.
          </p>
        </div>

        <div
          className={`home-atlas-media home-atlas-media--right ${styles.media}`}
          data-reveal-child
          style={{ ["--reveal-index" as string]: 1 }}
          aria-hidden="true"
        >
          <div className={styles.frame}>
            <HomeMiniChatMock className={styles.miniWindow} themeId="sage" />
          </div>
          <div className={styles.callout}>
            <strong>Single surface</strong>
            <span>everything at once</span>
          </div>
        </div>
      </div>
    </section>
  );
}
