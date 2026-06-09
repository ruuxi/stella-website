"use client";

import { Smartphone } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./home-phone-connectors.module.css";

type Bubble = { from: "them" | "you"; text: string };

type Platform = {
  id: "imessage" | "telegram" | "discord" | "stella";
  label: string;
  /* Message count drives how long the platform holds the stage. */
  beats: number;
};

const PLATFORMS: Platform[] = [
  { id: "imessage", label: "iMessage", beats: 6 },
  { id: "telegram", label: "Telegram", beats: 5 },
  { id: "discord", label: "Discord", beats: 4 },
  { id: "stella", label: "Stella app", beats: 5 },
];

const BEAT_MS = 420;
const HOLD_MS = 2400;

function platformDuration(platform: Platform) {
  return 300 + platform.beats * BEAT_MS + 460 + HOLD_MS;
}

/* Official brand marks (simple-icons paths); Stella uses its own logo. */
function PlatformMark({ id }: { id: Platform["id"] }) {
  if (id === "stella") {
    return <Image src="/stella-logo.svg" alt="" width={15} height={15} />;
  }
  if (id === "imessage") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" data-brand="imessage">
        <path d="M12 2C6.48 2 2 5.93 2 10.8c0 2.8 1.49 5.29 3.81 6.91-.13 1.17-.6 2.43-1.45 3.49-.14.18.01.44.23.4 1.96-.36 3.49-1.2 4.55-2.04.93.23 1.89.34 2.86.34 5.52 0 10-3.93 10-8.8S17.52 2 12 2Z" />
      </svg>
    );
  }
  if (id === "telegram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" data-brand="telegram">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" data-brand="discord">
      <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286ZM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189Zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

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
              style={{ ["--b" as string]: i }}
              data-beat
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
              style={{ ["--b" as string]: i }}
              data-beat
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
            <div
              key={i}
              className={styles.dcMessage}
              style={{ ["--b" as string]: i }}
              data-beat
            >
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
              <div
                key={i}
                className={styles.stYou}
                style={{ ["--b" as string]: i }}
                data-beat
              >
                {b.text}
              </div>
            ) : (
              <p
                key={i}
                className={styles.stAssistant}
                style={{ ["--b" as string]: i }}
                data-beat
              >
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
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    // Under reduced motion the stage stays on whatever pill was chosen.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-advance once the active thread has fully played out. Clicking a
  // pill jumps immediately — changing `active` restarts this timer.
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(
      () => setActive((current) => (current + 1) % PLATFORMS.length),
      platformDuration(PLATFORMS[active]),
    );
    return () => clearTimeout(timer);
  }, [running, active]);

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
        >
          <div className={styles.stage} aria-hidden="true">
            {PLATFORMS.map((platform, index) => (
              <div
                className={styles.slot}
                key={platform.id}
                data-active={index === active || undefined}
              >
                {SKINS[platform.id]}
              </div>
            ))}
          </div>

          <div className={styles.switcher} role="tablist" aria-label="Ways to text Stella">
            {PLATFORMS.map((platform, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={index === active}
                key={platform.id}
                className={styles.pill}
                data-active={index === active || undefined}
                style={{
                  ["--dur" as string]: `${platformDuration(platform)}ms`,
                }}
                onClick={() => setActive(index)}
              >
                <span className={styles.pillMark}>
                  <PlatformMark id={platform.id} />
                </span>
                {platform.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
