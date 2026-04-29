import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "./how-it-works.css";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how Stella works — a personal AI assistant that runs on your computer, keeps your data private, and handles anything you need.",
  alternates: { canonical: "/how-it-works" },
};

const navItems = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "What's New", href: "/changelog" },
];

const footerGroups = [
  {
    title: "Product",
    items: ["Get Started", "Sign In", "Download", "Pricing"],
  },
  {
    title: "Resources",
    items: ["What's New", "Help Center", "Podcast", "Press Kit"],
  },
  {
    title: "Learn",
    items: ["Getting Started Guide", "Tips & Tricks"],
  },
  {
    title: "Community",
    items: ["X @stella", "Stella Community", "YouTube"],
  },
];

export default function HowItWorks() {
  return (
    <div className="stella-page">
      {/* ── Header ─────────────────────────────────── */}
      <header className="grid-shell grid-shell--dense site-header">
        <div className="brand-wrap">
          <Link className="brand-mark" href="/">
            <span className="brand-mark__logo">
              <Image
                className="brand-mark__logo-img"
                src="/stella-logo.svg"
                alt=""
                width={64}
                height={64}
                priority
              />
            </span>
            <span className="brand-text">Stella</span>
          </Link>
        </div>
        <nav className="site-nav" aria-label="Primary">
          {navItems.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────── */}
        <section className="grid-shell hiw-section section-border">
          <div className="hiw-article">
            <h1 className="hiw-title reveal">
              <span>How</span> Stella Works
            </h1>
            <p className="hiw-subtitle reveal reveal-delay-1">
              Stella is a personal AI assistant that lives on your computer —
              not in the cloud. This page walks you through how she thinks, what
              she can do, and why your data never has to leave your machine.
            </p>
          </div>
        </section>

        {/* ── Starts on Your Computer ──────────────── */}
        <section className="grid-shell hiw-section section-border">
          <div className="hiw-article">
            <span className="hiw-eyebrow">The basics</span>
            <h2>It starts on your computer</h2>
            <div className="hiw-prose">
              <p>
                Most AI assistants live on a remote server. You send your
                question over the internet, it gets processed somewhere else, and
                a response comes back. Stella is different. She runs directly on
                your machine, with access to your files, your apps, and your
                browser.
              </p>
              <p>
                This means Stella can do things that cloud-based assistants
                can&apos;t — read a document on your desktop, open a
                spreadsheet, navigate a website, or organize your downloads
                folder. She works with what&apos;s actually on your screen, not
                just what you type into a chat box.
              </p>
              <p>
                Because everything runs locally, your conversations, files, and
                personal data stay on your computer. Nothing is uploaded unless
                you explicitly choose to sync.
              </p>
            </div>
          </div>
        </section>

        {/* ── From Question to Answer ──────────────── */}
        <section className="grid-shell hiw-section section-border">
          <div className="hiw-article">
            <span className="hiw-eyebrow">The flow</span>
            <h2>From question to answer</h2>
            <p className="hiw-intro">
              When you ask Stella something, here&apos;s what happens behind the
              scenes.
            </p>

            <ol className="hiw-timeline">
              <li className="hiw-timeline__step">
                <span className="hiw-timeline__number">01</span>
                <div className="hiw-timeline__content">
                  <h3>You ask</h3>
                  <p>
                    You can talk to Stella by typing in her chat window, speaking
                    out loud, or messaging her from your phone or apps like Slack
                    and Discord. However you reach her, the experience is the
                    same — just say what you need in plain English.
                  </p>
                </div>
              </li>

              <li className="hiw-timeline__step">
                <span className="hiw-timeline__number">02</span>
                <div className="hiw-timeline__content">
                  <h3>Stella understands</h3>
                  <p>
                    Stella reads your request and figures out what needs to
                    happen. If it&apos;s a simple question, she answers directly.
                    If it&apos;s something more involved — like &ldquo;plan my
                    week and email me the summary&rdquo; — she breaks it into
                    steps and decides which skills to use.
                  </p>
                </div>
              </li>

              <li className="hiw-timeline__step">
                <span className="hiw-timeline__number">03</span>
                <div className="hiw-timeline__content">
                  <h3>The right skills activate</h3>
                  <p>
                    Stella has a set of specialized skills she can call on. She
                    might browse a website, edit a file, check your calendar, or
                    draft an email — often doing several things at the same time
                    to get your answer faster.
                  </p>
                  <div className="hiw-branches">
                    <span>Browse the web</span>
                    <span>Read &amp; write files</span>
                    <span>Email &amp; calendar</span>
                    <span>Run commands</span>
                    <span>Search &amp; research</span>
                  </div>
                </div>
              </li>

              <li className="hiw-timeline__step">
                <span className="hiw-timeline__number">04</span>
                <div className="hiw-timeline__content">
                  <h3>Everything comes back to you</h3>
                  <p>
                    When the work is done, results appear in your conversation.
                    You can review what Stella did, ask follow-up questions, or
                    just move on. If she modified a file or scheduled something,
                    she&apos;ll tell you exactly what changed.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* ── What Stella Can Do ───────────────────── */}
        <section className="grid-shell hiw-section section-border">
          <div className="hiw-article hiw-article--wide">
            <span className="hiw-eyebrow">Skills</span>
            <h2>What Stella can do</h2>
            <p className="hiw-intro">
              Stella&apos;s skills cover the things people do on a computer
              every day.
            </p>

            <div className="hiw-groups">
              <div className="hiw-group">
                <span className="hiw-group__label">Your computer</span>
                <h3>Files, apps, and your desktop</h3>
                <p>
                  Stella can read, write, and organize files anywhere on your
                  computer. She can navigate desktop applications like Slack, VS
                  Code, or your browser — clicking buttons, filling forms, and
                  pulling information from what&apos;s on your screen. It&apos;s
                  like having someone sit at your desk and help.
                </p>
              </div>

              <div className="hiw-group">
                <span className="hiw-group__label">The web</span>
                <h3>Browsing, searching, and fetching</h3>
                <p>
                  Stella can open websites, search for information, read
                  articles, fill out forms, and pull data from web pages. She
                  uses a real browser, so she sees pages the same way you do —
                  not a simplified version.
                </p>
              </div>

              <div className="hiw-group">
                <span className="hiw-group__label">Your accounts</span>
                <h3>Gmail, Calendar, and Google Drive</h3>
                <p>
                  Connect your Google account and Stella can search your email,
                  draft messages, check your calendar, schedule events, find
                  files in Drive, and work with Google Docs. She uses the same
                  tools you already know.
                </p>
              </div>

              <div className="hiw-group">
                <span className="hiw-group__label">Your routine</span>
                <h3>Schedules, reminders, and automations</h3>
                <p>
                  Tell Stella to check in with you every morning, remind you
                  about something next Tuesday, or run a weekly report. She
                  handles recurring tasks in plain English — no apps or settings
                  to configure.
                </p>
              </div>

              <div className="hiw-group">
                <span className="hiw-group__label">Creative work</span>
                <h3>Apps, images, music, and games</h3>
                <p>
                  Ask Stella to create an image, generate a song, build a small
                  app, or design a game. She works with media generation tools
                  and can even build and deploy interactive projects you can
                  share with others.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Five Ways to Reach Stella ─────────────── */}
        <section className="grid-shell hiw-section section-border">
          <div className="hiw-article">
            <span className="hiw-eyebrow">Access</span>
            <h2>Five ways to reach Stella</h2>
            <p className="hiw-intro">
              Stella is designed to be available however you prefer to work —
              whether you&apos;re at your desk, on your couch, or on the go.
            </p>

            <div className="hiw-methods">
              <div className="hiw-method">
                <div className="hiw-method__header">
                  <h3>The full window</h3>
                  <span className="hiw-method__badge">Desktop app</span>
                </div>
                <p>
                  Open Stella like any other app on your computer. The full
                  window gives you the complete experience — chat, settings,
                  conversation history, and all of Stella&apos;s features in one
                  place.
                </p>
              </div>

              <div className="hiw-method">
                <div className="hiw-method__header">
                  <h3>Quick access anywhere</h3>
                  <span className="hiw-method__badge">⌘/Ctrl + right-click</span>
                </div>
                <p>
                  Hold ⌘ (or Ctrl on Windows) and right-click anywhere on your
                  screen. A small menu appears with options to chat, capture
                  what&apos;s on screen, start voice mode, or get a quick
                  answer — without leaving whatever you&apos;re working on.
                </p>
              </div>

              <div className="hiw-method">
                <div className="hiw-method__header">
                  <h3>Just say her name</h3>
                  <span className="hiw-method__badge">Voice</span>
                </div>
                <p>
                  Say &ldquo;Stella&rdquo; and start talking. She&apos;s always
                  listening for her name, and once activated you can have a full
                  voice conversation. No need to click anything or switch
                  windows.
                </p>
              </div>

              <div className="hiw-method">
                <div className="hiw-method__header">
                  <h3>From your phone</h3>
                  <span className="hiw-method__badge">Mobile</span>
                </div>
                <p>
                  Stella can connect to your phone so you can text her from
                  anywhere. She still runs on your desktop — your phone is just
                  another way to reach her.
                </p>
              </div>

              <div className="hiw-method">
                <div className="hiw-method__header">
                  <h3>From your favorite apps</h3>
                  <span className="hiw-method__badge">
                    Slack, Discord, Telegram, Teams
                  </span>
                </div>
                <p>
                  Message Stella directly in the chat apps you already use. She
                  shows up as a contact you can message, and responds with the
                  same capabilities as the desktop app.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Private by Design ────────────────────── */}
        <section className="grid-shell hiw-section section-border">
          <div className="hiw-article">
            <span className="hiw-eyebrow">Trust</span>
            <h2>Private by design</h2>
            <div className="hiw-prose">
              <p>
                Stella runs on your machine. Your conversations are stored in a
                local database on your computer, not on a remote server. Your
                files are read directly from disk — they&apos;re never uploaded
                anywhere.
              </p>
              <p>
                When Stella needs to call an AI model to think through your
                request, that communication goes through a secure proxy. But the
                proxy doesn&apos;t store your messages — it routes them and
                forgets. Your credentials are encrypted using your operating
                system&apos;s built-in secure storage.
              </p>
              <p>
                Cloud sync is available if you want your conversations to follow
                you across devices, but it&apos;s entirely optional. Stella
                works fully offline for everything that doesn&apos;t require an
                internet connection. Your data is never used to train AI models.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────── */}
        <section className="grid-shell hiw-cta-section">
          <div className="hiw-article hiw-cta reveal">
            <h2>Ready to try Stella?</h2>
            <p>
              Download Stella and see what your computer can really do for you.
            </p>
            <a className="button button--primary" href="#">
              Get Started
              <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="grid-shell site-footer section-border">
        <div className="footer-brand">
          <Link className="brand-mark brand-mark--footer" href="/">
            <Image
              src="/stella-logo.svg"
              alt="Stella"
              width={42}
              height={42}
            />
            <span className="brand-text">Stella</span>
          </Link>
          <ul className="legal-links">
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms">Terms of Service</a>
            </li>
          </ul>
        </div>
        <div className="footer-columns">
          {footerGroups.map((group) => (
            <div key={group.title} className="footer-column">
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>
                    <a href="#">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
