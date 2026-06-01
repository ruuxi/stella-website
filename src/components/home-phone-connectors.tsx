"use client";

import { Smartphone } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./home-phone-connectors.module.css";

type Bubble = { from: "them" | "you"; text: string };

type Platform = {
  id: "imessage" | "telegram" | "discord" | "stella";
  label: string;
  sub: string;
};

const PLATFORMS: Platform[] = [
  { id: "imessage", label: "iMessage", sub: "Text Stella" },
  { id: "telegram", label: "Telegram", sub: "Telegram bot" },
  { id: "discord", label: "Discord", sub: "Discord bot" },
  { id: "stella", label: "Stella app", sub: "Your phone" },
];

/* ------------------------------------------------------------------ */
/*  Reusable iPhone frame                                             */
/* ------------------------------------------------------------------ */
function PhoneFrame({
  children,
  statusDark,
}: {
  children: ReactNode;
  statusDark?: boolean;
}) {
  return (
    <div className={styles.phone}>
      <div className={styles.phoneEdge}>
        <div className={styles.screen}>
          <div className={styles.statusBar} data-dark={statusDark || undefined}>
            <span className={styles.statusTime}>9:41</span>
            <span className={styles.statusIcons}>
              <svg
                viewBox="0 0 20 12"
                aria-hidden="true"
                className={styles.signal}
              >
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                <rect x="10" y="3" width="3" height="9" rx="1" />
                <rect x="15" y="0.5" width="3" height="11.5" rx="1" />
              </svg>
              <svg
                viewBox="0 0 18 13"
                aria-hidden="true"
                className={styles.wifi}
              >
                <path
                  d="M9 12.2 1 5.6a12 12 0 0 1 16 0Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  opacity="0.4"
                />
                <path
                  d="M9 12.2 4.2 8.2a7 7 0 0 1 9.6 0Z"
                  fill="currentColor"
                />
              </svg>
              <svg
                viewBox="0 0 27 13"
                aria-hidden="true"
                className={styles.battery}
              >
                <rect
                  x="0.6"
                  y="0.6"
                  width="22"
                  height="11.8"
                  rx="3.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.45"
                />
                <rect
                  x="2.2"
                  y="2.2"
                  width="17"
                  height="8.6"
                  rx="1.8"
                  fill="currentColor"
                />
                <rect
                  x="24"
                  y="4"
                  width="1.8"
                  height="5"
                  rx="0.9"
                  fill="currentColor"
                  opacity="0.45"
                />
              </svg>
            </span>
          </div>
          <div className={styles.island} />
          {children}
        </div>
      </div>
      <span className={styles.homeIndicator} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  iMessage skin                                                    */
/* ------------------------------------------------------------------ */
const imessageThread: Bubble[] = [
  { from: "you", text: "Move my 7:30 dinner to 8 and let Maya know." },
  { from: "them", text: "Done — moved it to 8:00 and texted Maya." },
  {
    from: "them",
    text: "She's good with it. Want me to push the reminder back too?",
  },
  { from: "you", text: "Yeah, 30 min before." },
  { from: "them", text: "Set for 7:30. 👍" },
  { from: "you", text: "Perfect, thanks 🙏" },
];

function IMessageSkin() {
  return (
    <PhoneFrame>
      <div className={`${styles.app} ${styles.imessage}`}>
        <header className={styles.imHeader}>
          <span className={styles.imBack}>‹</span>
          <span className={styles.imAvatar}>
            <Image src="/stella-logo.svg" alt="" width={26} height={26} />
          </span>
          <strong>Stella</strong>
        </header>
        <div className={styles.thread}>
          {imessageThread.map((b, i) => (
            <div
              key={i}
              className={`${styles.imBubble} ${b.from === "you" ? styles.imYou : styles.imThem}`}
            >
              {b.text}
            </div>
          ))}
        </div>
        <div className={styles.imComposer}>
          <span>iMessage</span>
          <i className={styles.imSend}>↑</i>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/*  Telegram skin                                                    */
/* ------------------------------------------------------------------ */
const telegramThread: Bubble[] = [
  { from: "you", text: "Find the PDF I downloaded about neural nets." },
  { from: "them", text: 'Found it — "intro_to_neural_nets.pdf" in Downloads.' },
  { from: "you", text: "Summarize the first 10 pages for me." },
  {
    from: "them",
    text: "It's an intro to feed-forward nets, backprop, and a worked MNIST example.",
  },
  { from: "them", text: "Want the 5 key takeaways?" },
];

function TelegramSkin() {
  return (
    <PhoneFrame statusDark>
      <div className={`${styles.app} ${styles.telegram}`}>
        <header className={styles.tgHeader}>
          <span className={styles.tgBack}>‹</span>
          <span className={styles.tgAvatar}>
            <Image src="/stella-logo.svg" alt="" width={24} height={24} />
          </span>
          <div>
            <strong>Stella</strong>
            <span>bot</span>
          </div>
        </header>
        <div className={`${styles.thread} ${styles.tgThread}`}>
          {telegramThread.map((b, i) => (
            <div
              key={i}
              className={`${styles.tgBubble} ${b.from === "you" ? styles.tgYou : styles.tgThem}`}
            >
              {b.text}
              <em className={styles.tgTime}>9:41</em>
            </div>
          ))}
        </div>
        <div className={styles.tgComposer}>
          <span>Message</span>
          <i className={styles.tgSend}>➤</i>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/*  Discord skin                                                     */
/* ------------------------------------------------------------------ */
const discordThread: { author: string; you?: boolean; text: string }[] = [
  {
    author: "you",
    you: true,
    text: "@Stella make a playlist folder on my desktop and add my lo-fi bookmarks",
  },
  {
    author: "Stella",
    text: 'On it — created "lo-fi" on your desktop and saved 12 bookmarks into it.',
  },
  {
    author: "you",
    you: true,
    text: "nice, also close the chrome tabs I left open",
  },
  {
    author: "Stella",
    text: "Closed 14 tabs across 2 windows. Your desktop is clear.",
  },
];

function DiscordSkin() {
  return (
    <PhoneFrame statusDark>
      <div className={`${styles.app} ${styles.discord}`}>
        <header className={styles.dcHeader}>
          <span className={styles.dcHash}>#</span>
          <strong>stella</strong>
        </header>
        <div className={`${styles.thread} ${styles.dcThread}`}>
          <span className={styles.dcDay}>Today</span>
          {discordThread.map((m, i) => (
            <div key={i} className={styles.dcMessage}>
              <span
                className={styles.dcAvatar}
                data-you={m.you || undefined}
                data-bot={!m.you || undefined}
              >
                {m.you ? (
                  "Y"
                ) : (
                  <Image src="/stella-logo.svg" alt="" width={20} height={20} />
                )}
              </span>
              <div>
                <p className={styles.dcAuthor}>
                  {m.you ? "you" : "Stella"}
                  {!m.you ? <b className={styles.dcBot}>APP</b> : null}
                  <em>9:41 AM</em>
                </p>
                <p className={styles.dcText}>{m.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.dcComposer}>
          <span>Message #stella</span>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/*  Stella app skin                                                  */
/* ------------------------------------------------------------------ */
const stellaThread: Bubble[] = [
  { from: "you", text: "What was I working on before lunch?" },
  {
    from: "them",
    text: "You were comparing flights to Lisbon and had the budget spreadsheet open.",
  },
  { from: "them", text: "Want me to pull it back up?" },
  { from: "you", text: "Yes, and book the cheapest morning one." },
  {
    from: "them",
    text: "Booked the 8:05 AM — $214. Added it to your calendar.",
  },
];

function StellaSkin() {
  return (
    <PhoneFrame statusDark>
      <div className={`${styles.app} ${styles.stella}`}>
        <div className={styles.stGradient} />
        <header className={styles.stHeader}>
          <span className={styles.stMenu}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.stBrand}>
            <Image src="/stella-logo.svg" alt="" width={20} height={20} />
            Stella
          </span>
          <span className={styles.stModel}>4.5</span>
        </header>
        <div className={`${styles.thread} ${styles.stThread}`}>
          {stellaThread.map((b, i) =>
            b.from === "you" ? (
              <div key={i} className={styles.stYou}>
                {b.text}
              </div>
            ) : (
              <p key={i} className={styles.stAssistant}>
                {b.text}
              </p>
            ),
          )}
        </div>
        <div className={styles.stComposer}>
          <i className={styles.stPlus}>+</i>
          <span>Do anything…</span>
          <i className={styles.stMic} />
        </div>
      </div>
    </PhoneFrame>
  );
}

const SKINS: Record<Platform["id"], ReactNode> = {
  imessage: <IMessageSkin />,
  telegram: <TelegramSkin />,
  discord: <DiscordSkin />,
  stella: <StellaSkin />,
};

export function HomePhoneConnectors() {
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
        <h2>Text Stella.</h2>
      </div>

      <div className="home-atlas-scene home-atlas-scene--reverse">
        <div
          className="home-atlas-copy"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 2 }}
        >
          <span className="home-atlas-kicker">
            <Smartphone size={15} strokeWidth={1.9} aria-hidden="true" />
            Phone and connectors
          </span>
          <p>
            Text Stella from iMessage, Telegram, Discord, or the mobile app.
            Every message reaches the same assistant on your computer.
          </p>
        </div>

        <div
          className={`home-atlas-media home-atlas-media--right home-atlas-fade ${styles.media}`}
          data-reveal-child
          style={{ ["--reveal-index" as string]: 1 }}
          aria-hidden="true"
        >
          <div className={styles.lineup}>
            {PLATFORMS.map((platform, index) => (
              <div
                className={styles.slot}
                key={platform.id}
                style={{ ["--i" as string]: index }}
              >
                {SKINS[platform.id]}
                <div className={styles.caption}>
                  <strong>{platform.label}</strong>
                  <span>{platform.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
