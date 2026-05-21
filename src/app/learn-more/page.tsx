import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Github } from "lucide-react";
import { DownloadButton } from "@/components/download-button";
import { FooterLegalLinks } from "@/components/footer-legal-links";
import { SiteHeader } from "@/components/site-header";
import "./learn-more.css";

export const metadata: Metadata = {
  title: "Learn More",
  description:
    "Learn what Stella is, how the desktop app works, what stays local, what the backend stores, and what changed recently.",
  alternates: { canonical: "/learn-more" },
};

const navSections = [
  { label: "Overview", href: "#overview" },
  { label: "What Stella is", href: "#what-stella-is" },
  { label: "One chat", href: "#one-chat" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Access", href: "#access" },
  { label: "Privacy", href: "#privacy" },
  { label: "Models", href: "#models" },
  { label: "Technical notes", href: "#technical" },
  { label: "What's new", href: "#whats-new" },
];

const capabilities = [
  {
    title: "Use your computer",
    body: "Inspect the screen, click, type, open apps, navigate windows, and work with what is actually in front of you.",
  },
  {
    title: "Use the web",
    body: "Browse, search, read pages, fill forms, and use browser context when it helps.",
  },
  {
    title: "Work with files",
    body: "Read, write, organize, summarize, and transform documents, spreadsheets, PDFs, presentations, images, and generated outputs.",
  },
  {
    title: "Create media",
    body: "Help make images, video, audio, 3D assets, small apps, games, mockups, and visual artifacts.",
  },
  {
    title: "Listen and speak",
    body: "Use in-app dictation, OS-wide dictation, read-aloud, and realtime voice. Wake-word activation is optional.",
  },
  {
    title: "Run routines",
    body: "Create reminders, recurring check-ins, scheduled work, and local automations from plain English.",
  },
  {
    title: "Connect apps",
    body: "Use supported services and messaging apps, including mobile, Discord, Telegram, Slack, Teams, Linq, Google Workspace, and Store-backed integrations.",
  },
  {
    title: "Choose your model",
    body: "Use Stella's managed provider, bring your own keys, use local models, pick OpenRouter-style options where supported, or select Claude Code as the engine.",
  },
];

const accessMethods = [
  {
    title: "Full desktop window",
    body: "Chat, display, settings, history, Store, media, files, and everything else in one place.",
  },
  {
    title: "Quick access",
    body: "Capture, chat, add context, or start voice from the app or page you are already using.",
  },
  {
    title: "Mini window",
    body: "Keep a smaller Stella surface nearby for fast asks without taking over your screen.",
  },
  {
    title: "Voice and dictation",
    body: "Dictate into Stella, dictate into other apps when enabled, or talk to Stella in realtime.",
  },
  {
    title: "Phone",
    body: "Pair the mobile app with your desktop so your phone can message the Stella running on your computer.",
  },
  {
    title: "Messaging apps",
    body: "Message Stella from supported apps. Full desktop-powered execution depends on pairing, connection settings, and your desktop being available.",
  },
];

const storedItems = [
  {
    title: "Account and billing records",
    body: "Sign-in identity, billing profile state, Stripe customer and subscription references, usage credit records, and payment metadata needed to run paid plans.",
  },
  {
    title: "Usage metadata",
    body: "For managed model calls: owner ID, model, agent type, token counts, duration, success or failure, estimated cost, billing plan, and timestamps.",
  },
  {
    title: "Anonymous limit counters",
    body: "A salted hash of the device or client identifier, request count, first request time, and last request time. Current retention is seven days after last use.",
  },
  {
    title: "Device and pairing metadata",
    body: "Device IDs, device names where provided, platform, presence timestamps, mobile pairing records, pairing secret hashes, push tokens, and bridge registration URLs.",
  },
  {
    title: "Connected app metadata",
    body: "The minimum connection records needed to know which account is linked to which Stella user and provider. Some connection secrets are encrypted.",
  },
  {
    title: "Remote delivery state",
    body: "When you message Stella from a phone or connector, the backend may store request text, delivery metadata, request state, and routing info so the desktop can claim, cancel, complete, and deliver the work.",
  },
  {
    title: "Optional cloud content",
    body: "Cloud backups, Store publishing, social or collaboration surfaces, and other hosted features store the data required to provide those features.",
  },
];

const notStoredItems = [
  "Your local desktop files.",
  "Your normal local desktop chat database.",
  "Your local memory markdown and runtime state.",
  "Your local provider API keys.",
  "A persistent copy of managed-model prompts and responses for the Stella Provider path.",
  "BYOK model traffic when the model call goes directly from your device to your provider.",
];

const whatsNew = [
  {
    title: "The desktop app feels more like one continuous workspace",
    body: "Recent updates cleaned up chat, activity history, display, canvas previews, model controls, settings, Store, and embedded web views.",
  },
  {
    title: "Stella can reach more places",
    body: "Mobile pairing, push updates, messaging connectors, Google sign-in, Google Workspace, native integrations, and Store-backed integrations have all expanded.",
  },
  {
    title: "Voice, dictation, and media got stronger",
    body: "Read-aloud, realtime voice options, OS-wide dictation polish, generated image galleries, music generation, video/model updates, and better media previews landed.",
  },
  {
    title: "The app can change itself with less disruption",
    body: "Self-mod updates, HMR handling, morph transitions, update checks, launcher recovery, and undo paths have been tightened.",
  },
  {
    title: "Privacy and billing moved into clearer boundaries",
    body: "Backend work tightened anonymous limits, plan checks, paid media gates, BYOK escape hatches, connector storage, mobile delivery cleanup, and cloud backup gating.",
  },
  {
    title: "Model choice got more practical",
    body: "Stella now has a simpler composer picker, more detailed advanced settings, managed defaults, BYO provider options, local model support, OpenRouter-style inventory where supported, and Claude Code as an engine option.",
  },
];

const footerGroups: {
  title: string;
  items: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    title: "Product",
    items: [
      { label: "Learn More", href: "/learn-more" },
      { label: "Store", href: "/store" },
      { label: "Pricing", href: "/pricing" },
      { label: "Sign In", href: "/sign-in" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "What's New", href: "/learn-more#whats-new" },
      {
        label: "GitHub",
        href: "https://github.com/ruuxi/stella",
        external: true,
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        label: "Discord",
        href: "https://discord.gg/HXVCCeE542",
        external: true,
      },
    ],
  },
];

function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="learn-section__header">
      <span className="learn-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children ? <div className="learn-section__lede">{children}</div> : null}
    </header>
  );
}

export default function LearnMore() {
  return (
    <div className="stella-page learn-page">
      <SiteHeader />

      <main className="learn-shell">
        <aside className="learn-sidebar" aria-label="Learn More sections">
          <nav>
            <p>Learn More</p>
            {navSections.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <article className="learn-content">
          <section id="overview" className="learn-hero section-border">
            <div className="learn-hero__copy">
              <span className="learn-eyebrow">Learn more</span>
              <h1>
                Stella, <span className="learn-hero__accent">in detail</span>.
              </h1>
              <p>
                A private, open-source desktop app that gives you one ongoing
                chat for your computer. Ask once, keep talking, and Stella
                figures out which agent, app, file, browser, model, or tool
                should handle the work.
              </p>
              <p>
                The unusual part is not just that Stella can use your computer.
                It is that the desktop app itself can change. Stella can learn
                your preferences, adjust the interface, add workflows, and turn
                the app into something closer to your own operating space.
              </p>
              <div className="learn-hero__actions">
                <DownloadButton />
                <a
                  className="button button--ghost"
                  href="https://github.com/ruuxi/stella"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={16} />
                  View source
                </a>
              </div>
            </div>
          </section>

          <section id="what-stella-is" className="learn-section section-border">
            <SectionHeader eyebrow="What Stella is" title="A desktop app, not just a chat box">
              <p>
                Stella lives with your files, apps, browser, and local state, so
                it can help with the real work on your machine instead of only
                answering questions in a web tab.
              </p>
            </SectionHeader>
            <div className="learn-prose">
              <p>
                You can use Stella for research, writing, spreadsheets, PDFs,
                Word documents, browser tasks, computer control, image
                generation, video and 3D workflows, media prompts, scheduling,
                reminders, dictation, realtime voice, and connected apps.
              </p>
              <p>
                Those capabilities are table stakes now. Stella&apos;s bigger
                bet is that all of this belongs in one personal desktop app, one
                chat, and one interface that can keep adapting.
              </p>
            </div>
          </section>

          <section id="one-chat" className="learn-section section-border">
            <SectionHeader eyebrow="One chat" title="You keep talking in the same place">
              <p>
                Most agent products make you choose a mode, start a new thread,
                pick a specialist, then remember where everything went. Stella
                keeps the top-level experience continuous.
              </p>
            </SectionHeader>
            <div className="learn-prose">
              <p>
                Behind the scenes, Stella can split work into smaller jobs, run
                specialized agents, keep track of active threads, and bring the
                result back into the conversation. The point is simple: you
                should not have to become a project manager for your assistant.
              </p>
            </div>
          </section>

          <section id="capabilities" className="learn-section section-border">
            <SectionHeader eyebrow="Capabilities" title="What Stella can do" />
            <div className="learn-grid learn-grid--two">
              {capabilities.map((item) => (
                <section key={item.title} className="learn-tile">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </section>
              ))}
            </div>
          </section>

          <section id="access" className="learn-section section-border">
            <SectionHeader eyebrow="Access" title="Ways to reach Stella" />
            <div className="learn-list">
              {accessMethods.map((item) => (
                <section key={item.title} className="learn-row">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </section>
              ))}
            </div>
          </section>

          <section id="privacy" className="learn-section section-border">
            <SectionHeader eyebrow="Privacy" title="Local-first, with clear exceptions">
              <p>
                Your normal desktop chat history, files, memories, generated
                local artifacts, and app state live on your computer. We do not
                keep your desktop conversations or files on our servers by
                default.
              </p>
            </SectionHeader>

            <div className="learn-callout">
              <p>
                Some features need a backend: sign-in, billing, plan limits,
                managed model access, connected app setup, mobile pairing, Store
                catalog data, push notifications, and optional cloud features.
                The important boundary is that Stella does not need a cloud copy
                of your whole desktop life to work.
              </p>
            </div>

            <h3 className="learn-subheading">What we store</h3>
            <div className="learn-grid learn-grid--storage">
              {storedItems.map((item) => (
                <section key={item.title} className="learn-storage">
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </section>
              ))}
            </div>

            <h3 className="learn-subheading">What we do not store by default</h3>
            <ul className="learn-checklist">
              {notStoredItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section id="models" className="learn-section section-border">
            <SectionHeader eyebrow="Models" title="Use Stella, BYOK, local models, or Claude Code">
              <p>
                Stella has a simple path for convenience and a private-control
                path for people who want to bring their own providers.
              </p>
            </SectionHeader>
            <div className="learn-prose">
              <p>
                Stella Provider lets you install the app and start using strong
                models without setting up accounts everywhere. Requests pass
                through Stella&apos;s infrastructure in transit so billing and
                limits can work, but prompt and response text is not
                persistently stored for that model path.
              </p>
              <p>
                You can also add your own provider credentials, use local
                runtimes, and use Claude Code directly as the assistant engine.
                In those paths, Stella is acting as the desktop app and runtime
                you control, not as the model vendor.
              </p>
            </div>
          </section>

          <section id="technical" className="learn-section section-border">
            <SectionHeader eyebrow="Technical notes" title="The launcher starts a local runtime">
              <p>
                The installed launcher handles setup, updates, recovery, and
                startup. The desktop app itself is a local repo-style runtime.
              </p>
            </SectionHeader>
            <div className="learn-prose">
              <p>
                The launcher downloads the current desktop release archive and
                native helpers, writes the local environment file, creates a
                launch script, installs dependencies as needed, initializes the
                local Git state, and launches the desktop with{" "}
                <code>bun run electron:dev</code>.
              </p>
              <p>
                That is intentional. Stella is open source, inspectable, and
                changeable. The app can update itself, but you can also inspect
                the repo, keep your local changes, and recover from bad
                self-changes.
              </p>
            </div>

            <h3 className="learn-subheading">How self-change works</h3>
            <div className="learn-prose">
              <p>
                When you ask Stella to change the app, an agent edits the local
                desktop code. Stella tracks the files involved, coordinates live
                updates, then applies visible renderer changes through Vite HMR
                when possible.
              </p>
              <p>
                If a change affects routes, shell structure, config,
                dependencies, native helpers, or deeper runtime code, Stella may
                need a reload or relaunch. The morph overlay covers visible
                refreshes so the change feels intentional instead of like a
                broken page reload.
              </p>
              <p>
                If a self-change breaks startup, the launcher can show a
                recovery view and, when the latest commit is an agent-authored
                self-change, offer an undo path.
              </p>
            </div>
          </section>

          <section id="whats-new" className="learn-section learn-section--dark">
            <SectionHeader eyebrow="What's new" title="Recent preview changes">
              <p>
                The old changelog was too commit-shaped. This is the practical
                version: what changed recently, grouped by what users can feel.
              </p>
            </SectionHeader>
            <div className="learn-grid learn-grid--two">
              {whatsNew.map((item) => (
                <section key={item.title} className="learn-news">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </section>
              ))}
            </div>
          </section>

          <section className="learn-cta">
            <h2>Stella is your desktop app.</h2>
            <p>
              Private, open source, one continuous chat, and flexible enough to
              reshape itself around how you work.
            </p>
            <Link className="button button--primary" href="/">
              Get Stella
              <ArrowRight size={16} />
            </Link>
          </section>
        </article>
      </main>

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
          <FooterLegalLinks />
        </div>
        <div className="footer-columns">
          {footerGroups.map((group) => (
            <div key={group.title} className="footer-column">
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <a href={item.href}>{item.label}</a>
                    )}
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
