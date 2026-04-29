import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import "./changelog.css";

export const metadata: Metadata = {
  title: "What's New",
  description:
    "A running log of what's changed in Stella — new features, fixes, and polish, in plain English.",
  alternates: { canonical: "/changelog" },
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

type Entry = {
  date: string; // e.g. "April 28, 2026"
  tags?: string[];
  items: string[];
};

const entries: Entry[] = [
  {
    date: "April 28, 2026",
    tags: ["New", "Polish"],
    items: [
      "Onboarding got a big polish pass — snappier transitions, friendlier copy, clearer steps.",
      "New setting to keep Stella awake so background work isn't interrupted.",
      "New sound-notification setting, plus an anonymous feedback prompt that can show up once a day.",
      "Fashion shopping: try-on flow you can trigger by dropping a photo into the composer.",
      "Store: navigation redesign, tighter Fashion agent, and a confirmation step before adding new connectors.",
      "Deleted items now appear in a trash view inside the side panel.",
      "Onboarding now skips the macOS permissions step on Windows and Linux.",
      "Lots of fixes: radial overlay stays on the active macOS Space, Connect dialog layering, askQuestion routing, and self-mod visuals during agent runs.",
    ],
  },
  {
    date: "April 27, 2026",
    tags: ["New"],
    items: [
      "Voice and dictation are now part of the onboarding tour.",
      "Chrome extension install step added to onboarding.",
      "Stella's sidebar got a (briefly) playable 3D Snake game.",
      "Country-code dropdown for the Text Stella phone setup.",
      "Better screen-recording permission detection on macOS, plus a per-permission reset.",
      "Spinner now shows while uninstalling Stella, and the launcher checks for updates without blocking.",
      "Smoother Store publishing review flow.",
    ],
  },
  {
    date: "April 26, 2026",
    tags: ["New", "Windows"],
    items: [
      "Stella Connect: connect external services through MCP integrations.",
      "Computer-use comes to Windows — Stella can now click and type on your screen on Windows machines.",
      "Removed the Git Bash dependency on Windows.",
      'New "+" menu in the chat composer to attach files, capture your screen, or grab recents.',
      "Markdown and developer-file previews in the side panel.",
      "Shortcuts settings tab.",
      "Cloud backups are now part of the paid plan.",
      "Onboarding shows a capabilities walkthrough, and capture chips have a unified look.",
    ],
  },
  {
    date: "April 25, 2026",
    tags: ["New"],
    items: [
      "Local Parakeet dictation — fast, private, runs on your device.",
      "Local OAuth controls for routing to your own LLMs.",
      "New Fashion tab redesigned as a full-bleed snap feed.",
      "Top-bar chat sidebar toggle and a unified scroll between sidebar chat and full chat.",
      "Long chats are now much faster (stable rows + virtualization).",
      "Stella notifies you when a long-running agent finishes its work.",
      "Onboarding: faster fog, snappier disclosure cascade, friendlier hit targets.",
    ],
  },
  {
    date: "April 24, 2026",
    tags: ["New", "Polish"],
    items: [
      "File-artifact previews in the display sidebar (Codex-style chrome).",
      "Stella now detects files created by tools running outside her — they show up automatically.",
      "Transparent topbar in the desktop shell.",
      "Mini window: smoother chrome, wider composer, lazier voice startup.",
      "Chat scroll holds its position when you resize the layout.",
    ],
  },
  {
    date: "April 23, 2026",
    tags: ["New", "Polish"],
    items: [
      'New "Ask Stella" pill that appears above text you select — works in Stella and across other apps.',
      "Display panel is now resizable and can expand to fill the window, even taking over the mini window.",
      "Radial dial restored, replacing the cmd+right-click native menu.",
      "New Inworld dictation option in the composer.",
      "Web search wired to Exa for better results.",
      "Time-of-day greetings on the home screen with the occasional fun variant.",
      "Configurable OS-wide dictation.",
      "Save and copy actions on the display sidebar.",
      "New Ideas tab on the display sidebar plus a smoother sidebar slide.",
    ],
  },
  {
    date: "April 22, 2026",
    tags: ["New"],
    items: [
      "Agents can now ask you a question inline in chat (askQuestion).",
      "Live Memory dialog and a customizable creature face — toggle eyes and mouth.",
      "Big computer-use reliability pass: clicks now actually deliver to backgrounded apps, with overlay continuity fixed.",
      'Show more / show less for long user messages.',
      "Twitch emotes render in chat.",
      "Settings and Theme moved to the sidebar title bar.",
      "Double-tap Option to summon the mini window.",
      "Backend now rate-limits every public mutation, action, and HTTP route.",
    ],
  },
  {
    date: "April 21, 2026",
    tags: ["New"],
    items: [
      "Auto-display generated images in the display sidebar.",
      "Shell migrated to TanStack Router with sidebar app discovery.",
      "Live Memory phase added to onboarding (with sign-in resume).",
      "Onboarding mocks now mirror the real Stella surface.",
      'New "Cozy" theme.',
    ],
  },
  {
    date: "April 20, 2026",
    tags: ["Under the hood"],
    items: [
      "Major runtime change: agents now run on an Exec-first runtime, with isolated V8 contexts.",
      "Orchestrator and general agent prompts restructured for clearer behavior.",
      "Launcher reliability: macOS screen-permission build, Windows registry args, fewer first-run dependencies.",
    ],
  },
  {
    date: "April 19, 2026",
    tags: ["New"],
    items: [
      "Display sidebar now renders Word, Excel, PowerPoint, PDF, and HTML files.",
    ],
  },
  {
    date: "April 18, 2026",
    tags: ["New"],
    items: [
      "Suggestion chips above the full chat composer.",
      "Categories overlay back on home.",
      "New macOS native session service powering computer-use, with overlay motion aligned to action timing.",
    ],
  },
  {
    date: "April 17, 2026",
    tags: ["New"],
    items: [
      "Cmd+right-click context menu replaces the radial gesture overlay.",
      "Action overlay with a breathing lens and software cursor when Stella controls your computer.",
      'Onboarding creation mock rebuilt with section-transformation pills.',
    ],
  },
  {
    date: "April 16, 2026",
    tags: ["New"],
    items: [
      "macOS desktop automation engine with auto-attached screenshots.",
      "The active-window screenshot is automatically attached to your message as an image.",
      "Display sidebar can be opened from the right-click menu in chat.",
      "Range-based thread compaction for long chats.",
    ],
  },
  {
    date: "April 15, 2026",
    items: [
      "Onboarding reveals theme options in steps.",
      'Refreshed emote bundle.',
      'Pause self-mod hot reload while shell or code-mode writes are happening (less flicker).',
      "Write and Edit tools added to the General agent.",
    ],
  },
  {
    date: "April 14, 2026",
    tags: ["New"],
    items: [
      "Stella streams reasoning summaries while she thinks, so you can see what she's working on.",
      "Native Stella runtime streaming and a refactor toward Pi extension model.",
      "Twitch emote rendering in orchestrator markdown.",
    ],
  },
  {
    date: "April 13, 2026",
    items: [
      "Smoother assistant text streaming, especially across resumed and hidden runs.",
      "Exponential backoff retry for OpenAI completions.",
      "Reasoning is preserved across Stella completions.",
    ],
  },
  {
    date: "April 12, 2026",
    tags: ["New"],
    items: [
      "New ExecuteTypescript tool — typed code-mode for the General agent.",
      "Wake-word pipeline removed (Stella moved away from always-listening).",
      "Bundled Stella browser binary refreshed.",
      "Local chat now pages by visible messages for performance.",
    ],
  },
  {
    date: "April 11, 2026",
    tags: ["New", "Polish"],
    items: [
      'Radial dial redesign — the "Full" wedge becomes "Add", and chat persists across workspaces.',
      "Display overlay replaced with a sidebar on the home page.",
      "Launcher reliability fixes for macOS permission flows (TCC prompts, mic, etc.).",
      "Launcher hides its window when desktop starts and restores it on exit.",
    ],
  },
  {
    date: "April 10, 2026",
    tags: ["New", "Polish"],
    items: [
      "ChatGPT-style turn-anchored scrolling in chat.",
      "macOS screen and microphone permission onboarding screen.",
      "Subagent ticker and streaming events show up in chat.",
      "Stella branding on launcher icons and release artifacts.",
      "In-app permission recovery flows.",
      "Many launcher and CI improvements (Windows/macOS).",
    ],
  },
  {
    date: "April 9, 2026",
    tags: ["New"],
    items: [
      "Mini chat split into its own dedicated window.",
      "Vision-based window content capture with column detection.",
    ],
  },
  {
    date: "April 8, 2026",
    tags: ["New"],
    items: [
      "Cloud backups (R2-backed) with settings integration.",
      "Self-mod history is now auto-tracked.",
      "Faster SQLite via node:sqlite.",
      "Refreshed Stella brand assets across desktop, launcher, and mobile.",
      "iOS privacy manifest for the mobile app.",
    ],
  },
  {
    date: "April 7, 2026",
    tags: ["New", "Mobile"],
    items: [
      "One-time welcome dialog after onboarding.",
      "Mobile app: dark mode, 17 themes, haptics, voice input, and push notifications.",
      'Voice "look at screen" tool — Stella can highlight things in real time.',
      "Vision screenshots, screen-guide overlay, and capture IPC.",
      "Compact mode replaces the overlay mini shell.",
      "Suggestion chips in chat with shared screenshot preview.",
      "New Claude Code orchestrator option.",
    ],
  },
  {
    date: "April 6, 2026",
    tags: ["New"],
    items: [
      "Connect dialog redesigned, and the Text Stella flow reversed for clarity.",
      "Permissions onboarding screen on macOS, plus a fix for relaunching from the DMG.",
      "Inline previews for Word, Excel, and PowerPoint files.",
      "Stella Office is now vendored into Stella.",
      "Magic-link sign-in fix on mobile.",
    ],
  },
  {
    date: "April 5, 2026",
    tags: ["New"],
    items: [
      'Home merged into chat, with a shifting gradient on the mini shell.',
      'Radial dial reworked to four wedges with opt-in window context.',
      "File-system-based skill environment replaces LoadTools/ActivateSkill.",
      'New "View messages" button on home when you have chat history.',
      "Cloud device sync now requires a real (non-anonymous) account.",
    ],
  },
  {
    date: "April 4, 2026",
    tags: ["Polish"],
    items: [
      "Onboarding UX polish: better button visibility, top-down layout, gradient settings fixes.",
      "Live task status in the thinking footer while streaming.",
      "Faster chat transcript persistence (append-only JSONL).",
      "Restored the blob gradient theme and frosted shell chrome.",
      "Overlay stays on the active macOS Space.",
    ],
  },
  {
    date: "April 3, 2026",
    tags: ["New"],
    items: [
      "Right-click chat sidebar replaces the floating orb and context menu.",
      "Programmatic send opens the sidebar chat directly.",
      "Launcher auto-closes once Stella is confirmed running.",
      "Window controls moved into the sidebar header.",
      "Onboarding can complete without the canvas morph handoff.",
    ],
  },
  {
    date: "April 2, 2026",
    tags: ["New", "macOS"],
    items: [
      "Custom DMG installer with a mesh-gradient background and icon layout.",
      "Stella requests all macOS permissions upfront, with start/stop launcher controls.",
      "Single General agent with dynamic tool loading and reactive HMR.",
      "Stella branding for Electron app icons.",
    ],
  },
  {
    date: "April 1, 2026",
    items: [
      "Smoother floating chat indicator (prewarmed animation).",
      "Frame-rate-independent Stella animation using real delta time.",
      "Overlay origin now syncs from actual window bounds on macOS.",
    ],
  },
  {
    date: "March 30, 2026",
    tags: ["New"],
    items: [
      "Multi-desktop per account: device-scoped registration, bridge, and phone pairing.",
      "Daily cron to purge stale anonymous user data.",
      "MCP removed from the desktop app (replaced by Connect integrations).",
    ],
  },
  {
    date: "March 28, 2026",
    tags: ["New", "Mobile"],
    items: [
      "macOS code signing and notarization for the launcher.",
      "Phone pairing.",
      "Mobile: offline chat persistence, image support, and friendlier errors.",
      "Cloud data is purged on account delete.",
      "New Home surface, with thread context that persists across runs.",
    ],
  },
  {
    date: "March 26, 2026",
    tags: ["New"],
    items: [
      "Polling-based magic-link auth, deep-link protocol fix, and migration to cloud.stella.sh.",
      'Linq remote-turn execution: Stella routes messages to your desktop and falls back to an offline responder.',
      "Smoother chat streaming with a deferred WebGL init on the first message.",
      "Region capture fixes.",
      'Message timestamps reformatted as system reminders, with timezone correctness and 10-min dedup.',
    ],
  },
  {
    date: "March 25, 2026",
    tags: ["New"],
    items: [
      "Music generation switched to Lyria 3 (proxied through the backend).",
      "Home Canvas: LLM generation pipeline, selectable guide, music bar.",
      "Improved wake-word handoff and voice echo gating.",
      "Auth callbacks now route through stella.sh.",
    ],
  },
  {
    date: "March 24, 2026",
    tags: ["New"],
    items: [
      "New voice model.",
      "macOS native build of the Stella browser.",
      "Mobile: refreshed chat, desktop bridge, and account screens.",
      "Simpler MorphTransition shader (less heavy on GPU).",
    ],
  },
  {
    date: "March 23, 2026",
    tags: ["New"],
    items: [
      "New Media Studio app.",
      "Personalized Home Canvas replaces the home dashboard.",
      "Notification panel on the floating orb.",
      "Display Overlay for the agent Display tool.",
      "Dark-mode gradient banding fixed (oklch interpolation + dithering).",
      "Cormorant Garamond added as a display font.",
    ],
  },
  {
    date: "March 22, 2026",
    tags: ["New"],
    items: [
      "Drag-and-drop file attachments across all three composers.",
      "New Pearl and Noir themes.",
      "Lightweight CSS radial gradients replace the heavier blob gradient (faster, cleaner).",
      "Terms of Service, Privacy Policy, and in-app legal notices.",
      "Open / close animation for the mini shell.",
    ],
  },
  {
    date: "March 21, 2026",
    tags: ["Under the hood"],
    items: [
      "Sidecar runtime architecture — the agent runtime now runs in its own process.",
      "Chat UI: thinking row, shimmer, message typography refresh.",
    ],
  },
  {
    date: "March 20, 2026",
    items: [
      "Devtool initial release (hard reset clears storage, simplified UI).",
      "Backend migrated off the AI SDK.",
      "Faster boot.",
    ],
  },
  {
    date: "March 19, 2026",
    items: [
      "Switched to Manrope as the default font.",
      "Mobile bridge backend wired up.",
    ],
  },
  {
    date: "March 18, 2026",
    tags: ["New", "Mobile"],
    items: [
      "Mobile app initial commit.",
      "Onboarding: Next/Previous step controls, animation and layout polish.",
      "Cross-platform launcher CI workflow (Windows + macOS).",
    ],
  },
  {
    date: "March 17, 2026",
    tags: ["Under the hood"],
    items: [
      "Initial monorepo — desktop, mobile, backend, and launcher merged into one repo.",
      "Ultra tier added to billing.",
      "Discovery page generation fix.",
    ],
  },
  {
    date: "March 16, 2026",
    tags: ["New"],
    items: [
      "Tier-aware managed model routing.",
      "Realtime transcription.",
      "Realtime voice usage now reported for billing.",
      'Friend v1 — first cut of the social layer.',
    ],
  },
  {
    date: "March 15, 2026",
    items: [
      "Big runtime composition refactor — clearer routing seams.",
      "Launcher's first commit.",
      "Self-mod morph is now readiness-driven (less flash).",
    ],
  },
  {
    date: "March 14, 2026",
    tags: ["New"],
    items: [
      "Multiplayer skill (game).",
      "Schedule tool.",
      "Bundled Stella defaults moved into resources.",
    ],
  },
  {
    date: "March 13, 2026",
    tags: ["New"],
    items: [
      "Blueprint-based Store self-mod flow (v1).",
      "Stella browser ported to native Rust.",
      "Voice: hard VAD gate, adaptive noise floor, echo handling on speakers.",
      "Stripe billing fixes.",
      'Floating orb, chat panel, and input bar now scale with viewport.',
    ],
  },
  {
    date: "March 12, 2026",
    tags: ["New"],
    items: [
      "Floating orb v1 chat.",
      "Self-mod and General agent split with concurrency support.",
      "Header items moved to the sidebar.",
    ],
  },
  {
    date: "March 11, 2026",
    tags: ["New"],
    items: [
      "New wake-word model (fp16) and voice handoff.",
      "First-class Stella provider endpoints — desktop runtime now uses Stella provider models by default.",
      'Clearer "connected account" vs "logged in" semantics.',
    ],
  },
  {
    date: "March 10, 2026",
    items: [
      "You can now keep messaging while a task runs in the background.",
      "Backend route consolidation and SQL improvements.",
    ],
  },
  {
    date: "March 9, 2026",
    items: [
      "Audio ducking — music and other sounds dim while Stella speaks.",
      "Unified renderer mic across wake word and voice.",
      "Many small reliability fixes (chat re-renders, double-cache charges, capture leaks, web search failures).",
    ],
  },
  {
    date: "March 8, 2026",
    tags: ["New"],
    items: [
      "Extension system: auto-discoverable tools, hooks, providers, and prompts.",
      'Native text selection inside Stella.',
      'New "auto" radial dial feature.',
      "Faster web search and HTML rendering.",
      "Search canvas (and the news side trimmed down).",
    ],
  },
  {
    date: "March 7, 2026",
    tags: ["New"],
    items: [
      "Synthesis onboarding flow.",
      "Dashboard display and news rendering.",
      "Web search and news generation support added.",
      "Bootstrap quiet window delayed by 2.5s for smoother launch.",
    ],
  },
  {
    date: "March 6, 2026",
    items: [
      "Edit tool fix and orchestrator local scheduling improvements.",
      "Home view and music adjustments.",
    ],
  },
  {
    date: "March 1–5, 2026",
    items: [
      "Ongoing polish and refactors: cleaner runtime composition, fewer barrels, sharper IPC.",
      "Search canvas iteration, animation polish on streaming pills, dashboard fixes.",
    ],
  },
  {
    date: "February 2026",
    tags: ["Foundation"],
    items: [
      'Stella renamed and reorganized — new agent / subagent / tools / skills layout.',
      "Discovery rewrite: selectable categories, signal collection, and seeded ephemeral memories.",
      "App Store / blueprints groundwork — first cut of how Stella publishes apps.",
      'Connect dialog initial setup; opens links in your browser instead of a tiny Electron window.',
      "Slack, Teams, Signal, Telegram, and Discord channel work.",
      "Multi-monitor and Windows native window-title detection.",
      "Cron tool, heartbeat handling, and improved interrupt / queue control in the UI.",
      "Better Auth integration and hardened secrets handling.",
      "Drag-friendly mini shell, radial dial polish, and many capture/dial flicker fixes.",
    ],
  },
  {
    date: "January 2026",
    tags: ["Genesis"],
    items: [
      "First commits — shadcn UI scaffolding and the floating Stella surface.",
      "Initial agent / subagent / tools / skills wiring with markdown-driven plugins.",
      "Working indicator, streaming responses, conversation history, and reasoning components.",
      "Markdown colors, grain/noise/blur theming, and the original radial menu theme.",
      "Embeddings and retrieval initial pass; Convex schema + validators.",
      "Wake-up of the discovery + onboarding flow.",
    ],
  },
];

export default function Changelog() {
  return (
    <div className="stella-page">
      {/* ── Header ─────────────────────────────────── */}
      <header className="grid-shell grid-shell--dense site-header">
        <div className="brand-wrap">
          <a className="brand-mark" href="/">
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
          </a>
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
        <section className="grid-shell cl-section cl-section--hero section-border">
          <div className="cl-article">
            <h1 className="cl-title reveal">
              <span>What&apos;s</span> new
            </h1>
            <p className="cl-subtitle reveal reveal-delay-1">
              A running log of what&apos;s changed in Stella — new features,
              fixes, and polish — written in plain English. Newest at the top.
            </p>
          </div>
        </section>

        {/* ── Entries ──────────────────────────────── */}
        <section className="grid-shell cl-section section-border">
          <div className="cl-article cl-article--wide">
            <ol className="cl-log">
              {entries.map((entry) => (
                <li key={entry.date} className="cl-entry">
                  <div className="cl-entry__meta">
                    <span className="cl-entry__date">{entry.date}</span>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="cl-entry__tags">
                        {entry.tags.map((tag) => (
                          <span key={tag} className="cl-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ul className="cl-entry__items">
                    {entry.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────── */}
        <section className="grid-shell cl-cta-section">
          <div className="cl-article cl-cta reveal">
            <h2>Try the latest Stella</h2>
            <p>
              Download Stella and see what&apos;s new for yourself.
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
          <a className="brand-mark brand-mark--footer" href="/">
            <Image
              src="/stella-logo.svg"
              alt="Stella"
              width={42}
              height={42}
            />
            <span className="brand-text">Stella</span>
          </a>
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
