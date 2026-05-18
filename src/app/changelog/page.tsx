import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FooterLegalLinks } from "@/components/footer-legal-links";
import { SiteNav } from "@/components/site-nav";
import "./changelog.css";

export const metadata: Metadata = {
  title: "What's New",
  description:
    "A running log of what's changed in Stella — new features, fixes, and polish, in plain English.",
  alternates: { canonical: "/changelog" },
};

const footerGroups: {
  title: string;
  items: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    title: "Product",
    items: [
      { label: "Get Started", href: "/" },
      { label: "Sign In", href: "/sign-in" },
      { label: "Download", href: "/" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "What's New", href: "/changelog" },
      { label: "Help Center", href: "#" },
      { label: "Podcast", href: "#" },
      { label: "Press Kit", href: "#" },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Getting Started Guide", href: "#" },
      { label: "Tips & Tricks", href: "#" },
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
      { label: "X @stella", href: "#" },
      { label: "YouTube", href: "#" },
    ],
  },
];

type Entry = {
  date: string; // e.g. "April 28, 2026"
  tags?: string[];
  features?: string[];
  fixes?: string[];
  items?: string[]; // legacy single-bucket entries
};

const entries: Entry[] = [
  {
    date: "May 17, 2026",
    tags: ["New", "Polish"],
    features: [
      "Connectors expansion — Store integrations and Google Workspace now route through Stella Connect, with connector media and delivery targets carried end-to-end through the runtime.",
      "Radial Add and Capture chips now stack on top of each other instead of replacing the previous window — keep multiple captures in flight.",
      "Launch splash surfaces rescue buttons if startup stalls for more than 8 seconds, so a hung boot is no longer a dead end.",
      "Stella-provider calls route through pi-mono adapters at relay base URLs.",
      "Better Fireworks streaming — Kimi K2P6 deltas arriving before output_item.added now stream, and prior assistant text replays as input_text on the Responses API.",
    ],
    fixes: [
      "Orchestrator nudges its formatting when you switch between desktop and connector contexts.",
      "Activity row right-side labels stay visible when the display sidebar is narrow.",
      "Stella-alias Anthropic routing honors adaptive thinking on Opus 4.7.",
      "Fixed provider error toast search typing.",
      "Fixed hidden orchestrator follow-up rendering.",
      "Replaced hand-rolled fetch-on-mount effects with a shared resource cache for fewer redundant requests.",
      "Reverted the short-lived Composio OAuth integrations experiment — connectors stay on the stella-connect import-mcp path.",
      "Native connector enable/disable now returns its tool count.",
    ],
  },
  {
    date: "May 16, 2026",
    tags: ["New", "Polish"],
    features: [
      "Sidebar chat now loads older messages when you scroll to the top.",
      "Stella browser skill filled in with the missing CLI surface.",
      "Improved connector OAuth MCP flow.",
      "Animated SVG illustrations for display sidebar empty states.",
    ],
    fixes: [
      "Dropped the preset connector catalog — Stella keeps the stella-connect import-mcp path.",
      "Shrunk Media tab mode labels and flipped the submit icon upward.",
      "Up next copy softened, and display:readFile handles missing files gracefully.",
      "Retry once when the model returns nothing actionable.",
      "Connector replies keep flowing for the whole conversation instead of stalling mid-thread.",
      "Chat surfaces retired the legacy event feed; file history, agent activity, and the chat timeline each got their own dedicated stream (with the grown activity window seeded from the smaller loaded snapshot).",
      "Dropped the visible-messages window mode and split out a display-message overlay.",
      "send_input interrupt knob removed — Stella always interrupts.",
      "Fixed failing vitest suites.",
    ],
  },
  {
    date: "May 15, 2026",
    tags: ["New", "Polish"],
    features: [
      "Chat home overview redesigned around an Activity layout, with a paginated, virtualized \"See all\" history dialog.",
      "Inline artifact cards get an Open-with menu and a category · format subtitle that swaps to an Open-preview affordance on hover.",
      "A \"Reconnecting to Stella\" toast appears while the orchestrator retries, so silent stalls are visible.",
      "New unresponsive-renderer watchdog — if the chat window hangs for 10 seconds, Stella loads a recovery page instead of staying frozen.",
    ],
    fixes: [
      "Schedule details dialog restyled to match the Connect dialog aesthetic.",
      "Store side panel typography and empty-state copy polished; Canvas and Media empty-state text nudged up; Media tab drops the \"Make something\" hero copy.",
      "Dictation now routes into the Store composer while its textarea is focused.",
      "Slowed the task progress summary cadence to 30s (with a 10s kickoff) so it stops chattering.",
      "Tighter chat home overview activity list and hidden scrollbars.",
      "Chat links open directly instead of through Streamdown's confirmation modal.",
      "Restored Streamdown GFM and fixed chat markdown rendering for headings and tables.",
      "Fixed canvas artifact rendering (timing, thumbnails, recent files, background).",
      "Dictation routing works when Stella isn't the active app.",
      "Radial dial and mini window now behave on macOS fullscreen Spaces.",
      "Surface Stella provider rate-limit errors faster.",
      "Reduced chat resize work and reused artifact cards for HTML; paused the social empty-state illustration when offscreen and dropped the cursor shadows.",
      "Chat no longer pins to the absolute bottom during resize bursts.",
      "Clarified send-input follow-up intent.",
    ],
  },
  {
    date: "May 14, 2026",
    tags: ["Polish"],
    features: [
      "Model picker opens instantly, with restricted picks now gated by the backend rather than the client.",
    ],
    fixes: [
      "Auth-error toast routes to the sign-in dialog instead of dumping you on billing.",
      "Fixed the composer's shape after sending and dictation overlapping with already-typed text.",
      "Fixed dropped fast Stella stream chunks.",
    ],
  },
  {
    date: "May 13, 2026",
    tags: ["New", "Polish"],
    features: [
      "Inline undo for self-mod commits, with thread-aware reminders so you can roll back a change Stella just made.",
      "Developer file previews collapse into a single \"Code changes\" tab instead of stacking up per file.",
      "Update pill swaps its spinner for a traveling-border loader.",
      "Install-update agent now verifies the git merge before bumping the manifest, and reconciles a stale manifest after the restart.",
    ],
    fixes: [
      "Transient Stella provider errors retry at the adapter layer.",
      "Home sidebar hint dismisses on the first right-click.",
      "Hard cap on rendered task progress phrases so they stop piling up.",
      "Lyria prompts and task progress summaries now flow through the BYOK runtime path.",
      "Chronicle (screen memory) summaries inject on file change instead of every turn.",
      "Worker callers see live disk through the Vite self-mod overlay.",
    ],
  },
  {
    date: "May 12, 2026",
    tags: ["New", "Polish"],
    features: [
      "Read aloud — Stella can speak her replies, with a play button on each message and a menu toggle for auto-play.",
      "Multi-provider realtime voice — pick which voice model handles your live sessions.",
      "OpenRouter models now show up in the Stella picker.",
      "Settings got a global search bar and a layout/typography pass.",
      "Subscription upgrades pop a small celebratory dialog.",
    ],
    fixes: [
      "Radial dial dropdown trimmed to the actions that don't interrupt what you're doing.",
      "Pet bubble shrinks to fit short messages.",
      "Dev startup splash polish; Stella is now Apache 2.0 licensed with a public README.",
    ],
  },
  {
    date: "May 11, 2026",
    tags: ["New", "Billing"],
    features: [
      "Buy extra usage credit on the billing page when you run low — no need to wait for the monthly reset.",
      "Connect your own provider keys (OpenAI, Anthropic, OpenRouter, etc.) through a polished provider-connect dialog with branded OAuth callbacks.",
      "Dictation sound controls in settings.",
      "Launcher shows a recovery view when desktop fails to start, plus an option to revert a bad Stella update.",
    ],
    fixes: [
      "Chronicle (screen memory) is now a paid feature.",
      "Seedance replaces the older video generation models.",
      "Paid media (image, voice, video) is gated to subscribers, with a built-in escape hatch to switch to your own keys from the upsell toast.",
      "Default theme in light mode is now Midnight.",
      "Install-update agent locked down to a small git-only command allowlist.",
      "Windows builds: native helpers built per-platform on CI and shipped via R2.",
      "Tighter free and anonymous tier limits, with all plan limits now configurable from the backend (no more hardcoded defaults).",
      "Dropped Teams and Google Chat connector tiles; fixed the Discord install link.",
    ],
  },
  {
    date: "May 10, 2026",
    tags: ["Polish", "Under the hood"],
    fixes: [
      "Store side panel and Publish dialog got a UX pass.",
      "Self-mod applies now route through Vite's native HMR pipeline — fewer dev restarts, less flash.",
      "Dev Stella stops prompting for macOS Keychain access on every restart.",
      "Sidebar registry and route tree have HMR boundaries, so dev edits hot-reload instead of restarting.",
      "OpenRouter requests now identify as Stella.",
      "Effect-TS dependencies and migration plan landed.",
    ],
  },
  {
    date: "May 9, 2026",
    tags: ["New", "Billing"],
    features: [
      "Billing moved to a Stripe-hosted Checkout with managed payments, and the screen was redesigned to match the Stella aesthetic.",
      "Local model providers (Ollama and friends) are now first-class — pick them in settings alongside managed and BYOK options.",
      "Dedicated voice provider and agent model settings.",
    ],
    fixes: [
      "Plan tiers now describe usage in plain language (e.g. \"a few hours a day\") instead of opaque dollar allotments.",
      "Default reasoning effort is now routed automatically per request.",
      "Mini window: sidebar hidden, traffic-light placement tuned, and embedded web views fade behind a glass mask.",
      "Bulk model actions in settings, refined model picker layout.",
      "Removed global social chat while moderation matures; managed token-per-minute limits removed.",
      "Onboarding fog overlay removed.",
    ],
  },
  {
    date: "May 8, 2026",
    tags: ["New", "Polish"],
    features: [
      "Canvas tab — the orchestrator can now answer with a richer-than-markdown HTML canvas when a chart, layout, or interactive view fits better than text.",
      "Composer can pull in the area you have selected on screen as context for your next message.",
      "Orchestrator can spawn custom agent types, with the subagent roster injected into its context.",
    ],
    fixes: [
      "Model picker now collapses to a small set of Stella presets and expands on demand.",
      "Image generation defaults to fast/low settings (you can still crank it).",
      "Desktop updates moved from a Settings row to a top-bar pill, and the install-update agent runs through the same self-mod hot-reload pipeline.",
      "Display sidebar performance and memory tightened; expanded panel hides the rest of the chat instead of bleeding through.",
      "Tool-result images are now sent back as a follow-up user message so the model actually sees them.",
      "Local image provider selection and Claude Code runtime across all agents.",
      "Switched the desktop build to TypeScript 7's native compiler.",
    ],
  },
  {
    date: "May 7, 2026",
    tags: ["New", "Polish"],
    features: [
      "Connect integrations got a new connector CLI, replacing the old MCP agent surface in chat.",
      "Cron / scheduled tasks now have three tiers of payload and fire native OS notifications when they're done.",
      "Stella Computer on Windows is now powered by a native helper instead of the old runtime.",
      "Realtime voice moved to the GA model, with a British accent option and a refreshed prompt.",
    ],
    fixes: [
      "Runtime sessions are long-lived, with a hook-driven lifecycle so personality, self-mod, reminders, and memory injection all plug in cleanly.",
      "Smoother chat scroll and working indicator in the suggestion row.",
      "Vite upgraded to 8.0.11 with full-bundle dev mode.",
    ],
  },
  {
    date: "May 6, 2026",
    tags: ["Under the hood", "Polish"],
    features: [
      "Hosted Store now runs embedded in the desktop, replacing the legacy native Store UI.",
    ],
    fixes: [
      "Chat timeline and social chat virtualized with Legend List — long threads stay snappy.",
      "Electron upgraded to 42.",
      "Sign-in storage isolated in the main process; protected storage moved into the launcher.",
      "Native OS selects swapped for the Stella menu styling everywhere.",
      "Fixes: non-mac onboarding phase skips, local Parakeet dictation startup, display URL protocol restrictions, capture-source restoration on cancel.",
    ],
  },
  {
    date: "May 5, 2026",
    tags: ["New", "Polish"],
    features: [
      "Silero-gated wake-word listener — far fewer false triggers when you're not saying \"Hey Stella\".",
      "Image generation now runs in the background and shows up in a unified gallery in the display sidebar.",
      "Generated media (images, music, etc.) live in their own sidebar workspace, and previews open in an in-app dialog.",
      "Queued steering messages render inline in the chat while a turn is in progress.",
      "Pi-style orchestrator steering for smoother mid-turn course corrections.",
    ],
    fixes: [
      "Provider reasoning is hidden from the chat UI by default; direct model reasoning control still available in settings.",
      "Store, Pets, and Emoji dialogs aligned with the Connect dialog aesthetic.",
      "Working indicator fades faster when work is done.",
    ],
  },
  {
    date: "May 4, 2026",
    tags: ["Polish"],
    features: [
      "Music generation added to the managed media gateway.",
    ],
    fixes: [
      "Working indicator now sits inline below the latest reply instead of in a separate footer.",
      "Cold mini-window summon and splash readiness fixes.",
      "Launcher reinstall now preserves your existing state, and dictation setup re-runs after a reinstall.",
      "Capture overlay no longer fights with radial dictation.",
    ],
  },
  {
    date: "May 3, 2026",
    tags: ["New", "Polish"],
    features: [
      "Wake-word voice activation is back — say \"Hey Stella\" to start a voice session, with a bundled prebuilt listener for macOS and Windows. (Off by default; turn it on in settings.)",
      "AI-generated emoji packs in the Store, alongside new user-created pet packs (UI + backend + renderer).",
      "Sidebar Models picker — choose your orchestrator and general agent models without leaving chat. Routing is now done by model ID, no separate provider picker.",
      "Stella's voice is dynamic now, seeded from your personality.md.",
      "Display canvas is now inline, with refreshed working-indicator copy.",
    ],
    fixes: [
      "Replaced the four blue themes with Sage, Crimson, Slate, and Cocoa, and made Pearl and Noir standardized single-mode themes.",
      "Dictation: transcripts always paste straight into the focused app, in-app composer flow polished, OS-wide overlay layout cleaned up, on-device toggle hidden on Intel Macs.",
      "Apple-style elevation polish on dropdowns and popovers; toast and display \"+\" menu match the glass aesthetic.",
      "Pet polish: smoother action arc, click-through outside visible pixels, open preference syncs across windows, default pet renamed to Stella.",
      "Faster chat-send responsiveness; pre-bundled common packages for self-mod runs.",
      "Onboarding: smoother discovery transitions, fixed phase navigation restore, fixed creation continue click; city/postal/country now seeded into core-memory.md.",
      "Live Memory now requires sign-in; Store catalog filters blocked tags and defers asset loading until install.",
    ],
  },
  {
    date: "May 2, 2026",
    tags: ["New"],
    features: [
      "Floating pet companion in its own window — hatch one with the new pet skill. The pet drives voice mode (replacing the old voice creature overlay) and surfaces status updates.",
      "Pets are now part of the Store catalog with a dedicated backend.",
      "ChatHomeOverview: time-ordered Activity strip with an UP NEXT schedule peek.",
      "HomeIdeasFooter: category pills with a drop-up of suggestions.",
      "Post-onboarding hints for Connect and Store.",
      "New native dictation_bridge helper for macOS and Windows; push-to-talk dictation refresh.",
    ],
    fixes: [
      "Schedule agent returns structured tool results and shows an inline receipt chip.",
      "Utility actions moved into the sidebar.",
      "Orchestrator turns now queue without interrupting work-in-progress, with a deferred interrupt for queued turns until tools finish.",
      "Store releases now ship as behaviour spec + reference diffs.",
      "File-edit tools are picked per model.",
      "Removed the experimental Snake sidebar app and route.",
    ],
  },
  {
    date: "May 1, 2026",
    tags: ["New", "Onboarding"],
    features: [
      "Personalized app recommendations during onboarding (with badges prefixed \"Stella may:\").",
      "Stella localization foundation laid down, with a language picker on the start screen.",
      "Install-update agent flow — Stella can track and apply upstream desktop releases.",
      "Canvas artifacts show up in chat.",
      "Snake game added to the sidebar (and made bigger and easier to play).",
    ],
    fixes: [
      "Store agent moved to local runtime; Convex now only validates publishes. Add-on installs require explicit confirmation, and uninstalls fall back to a local agent.",
      "Reworked Store security review around network egress.",
      "New skills: create-Stella-app, stella-media (managed gateway media generation), runtime extension and MCP skills.",
      "Computer-use tools now sit behind MCP and computer-use sessions are pruned daily.",
      "Smoother streamed chat text, plus optimistic updates for social and fashion.",
      "Voice now receives screen captures directly, with explicit completion signals; local chat context syncs into voice sessions.",
      "Replaced \"Explore ideas\" with skill suggestions; flatter app suggestions dialog rows.",
      "Home hint mouse icon, welcome opens the workspace, badge polish.",
      "Sharper agent prompts that frame Stella as a personal assistant; general agent prompt streamlined and details deferred to skills.",
      "Image generation removed from the general agent (now lives in the stella-media skill).",
      "Settings content centered within the panel.",
    ],
  },
  {
    date: "April 30, 2026",
    tags: ["New", "Polish"],
    features: [
      "Click-to-update launcher — Stella can now check for and install updates on demand, with a manual update check, reinstall option, and a native uninstall confirmation.",
      "Chat home overview now shows your task history with progress summaries.",
      "In-app dictation bar gets a send arrow.",
    ],
    fixes: [
      "Launcher UI polish and an R2 public-URL fix for downloads.",
      "Store integrations now render as App Store-style rows.",
      "Sent user messages animate into the full chat surface.",
      "Display sidebar drops the heavy blur and preserves the active tab when you reopen the panel.",
      "Computer-use: webview apps now wake the CEF accessibility broker and accept single x/y clicks.",
      "Stella now prefers a desktop app over the browser for named consumer services (e.g. Spotify, Slack).",
      "Managed OpenAI and Anthropic models route direct, with normalized Anthropic model IDs.",
      "Clarified orchestrator/general prompt contract and delegation style.",
      "Fixes: onboarding completion handoff, store display tab routing, first chat-send home bounce, remote connector desktop routing, and several working-indicator copy/lifecycle bugs.",
      "Global social chat is disabled while moderation tooling matures.",
    ],
  },
  {
    date: "April 29, 2026",
    tags: ["New", "Polish"],
    features: [
      "Universal macOS desktop builds — one download works on both Apple Silicon and Intel Macs.",
      "Local Parakeet dictation is now on by default.",
      "Social: unread badges on the Social tab and Friends button; rooms are marked read correctly; global chat excluded from unread counts.",
      "Store: reworked around threaded creator pages and a feature roster, with new visibility tiers, share-with-friends, and chat embeds.",
    ],
    fixes: [
      "Sign-in dialog redesigned as a single grow-in form with quick links to your inbox.",
      "Modernized dialog styling across the app.",
      "Launch splash stays up until startup is fully ready (no more flash of an empty window).",
      "Mini window: double-tap toggle reliability fixes, focus behavior fixes, and the keybind now routes through the radial chat action.",
      "Display sidebar tab polish and an explicit '+' picker.",
      "Store tabs are centered over the visible area and no longer lag during resize.",
      "Magic-link polling stays alive after you close the auth dialog, so the link still completes sign-in.",
      "Display font now used for the startup branding.",
      "Auth-aware Convex queries — pages no longer flash errors during sign-in transitions.",
      "Many launcher fixes (Windows process control & tray icon, Intel macOS install lockfile, dock visibility, uninstall retry, Tauri plugin pinning).",
      "Stella cleanly tears down child processes on quit.",
    ],
  },
  {
    date: "April 28, 2026",
    tags: ["New", "Polish"],
    features: [
      "New setting to keep Stella awake so background work isn't interrupted.",
      "New sound-notification setting, plus an anonymous feedback prompt that can show up once a day.",
      "Fashion shopping: try-on flow you can trigger by dropping a photo into the composer.",
      "Deleted items now appear in a trash view inside the side panel.",
    ],
    fixes: [
      "Onboarding got a big polish pass — snappier transitions, friendlier copy, clearer steps.",
      "Store: navigation redesign, tighter Fashion agent, and a confirmation step before adding new connectors.",
      "Onboarding now skips the macOS permissions step on Windows and Linux.",
      "Lots of fixes: radial overlay stays on the active macOS Space, Connect dialog layering, askQuestion routing, and self-mod visuals during agent runs.",
    ],
  },
  {
    date: "April 27, 2026",
    tags: ["New"],
    features: [
      "Voice and dictation are now part of the onboarding tour.",
      "Chrome extension install step added to onboarding.",
      "Stella's sidebar got a (briefly) playable 3D Snake game.",
      "Country-code dropdown for the Text Stella phone setup.",
    ],
    fixes: [
      "Better screen-recording permission detection on macOS, plus a per-permission reset.",
      "Spinner now shows while uninstalling Stella, and the launcher checks for updates without blocking.",
      "Smoother Store publishing review flow.",
    ],
  },
  {
    date: "April 26, 2026",
    tags: ["New", "Windows"],
    features: [
      "Stella Connect: connect external services through MCP integrations.",
      "Computer-use comes to Windows — Stella can now click and type on your screen on Windows machines.",
      'New "+" menu in the chat composer to attach files, capture your screen, or grab recents.',
      "Markdown and developer-file previews in the side panel.",
      "Shortcuts settings tab.",
      "Cloud backups are now part of the paid plan.",
    ],
    fixes: [
      "Removed the Git Bash dependency on Windows.",
      "Onboarding shows a capabilities walkthrough, and capture chips have a unified look.",
    ],
  },
  {
    date: "April 25, 2026",
    tags: ["New"],
    features: [
      "Local Parakeet dictation — fast, private, runs on your device.",
      "Local OAuth controls for routing to your own LLMs.",
      "New Fashion tab redesigned as a full-bleed snap feed.",
      "Top-bar chat sidebar toggle and a unified scroll between sidebar chat and full chat.",
      "Stella notifies you when a long-running agent finishes its work.",
    ],
    fixes: [
      "Long chats are now much faster (stable rows + virtualization).",
      "Onboarding: faster fog, snappier disclosure cascade, friendlier hit targets.",
    ],
  },
  {
    date: "April 24, 2026",
    tags: ["New", "Polish"],
    features: [
      "File-artifact previews in the display sidebar (Codex-style chrome).",
      "Stella now detects files created by tools running outside her — they show up automatically.",
    ],
    fixes: [
      "Transparent topbar in the desktop shell.",
      "Mini window: smoother chrome, wider composer, lazier voice startup.",
      "Chat scroll holds its position when you resize the layout.",
    ],
  },
  {
    date: "April 23, 2026",
    tags: ["New", "Polish"],
    features: [
      'New "Ask Stella" pill that appears above text you select — works in Stella and across other apps.',
      "Display panel is now resizable and can expand to fill the window, even taking over the mini window.",
      "Radial dial restored, replacing the cmd+right-click native menu.",
      "New Inworld dictation option in the composer.",
      "Configurable OS-wide dictation.",
      "New Ideas tab on the display sidebar plus a smoother sidebar slide.",
    ],
    fixes: [
      "Web search wired to Exa for better results.",
      "Time-of-day greetings on the home screen with the occasional fun variant.",
      "Save and copy actions on the display sidebar.",
    ],
  },
  {
    date: "April 22, 2026",
    tags: ["New"],
    features: [
      "Agents can now ask you a question inline in chat (askQuestion).",
      "Live Memory dialog and a customizable creature face — toggle eyes and mouth.",
      "Twitch emotes render in chat.",
      "Double-tap Option to summon the mini window.",
    ],
    fixes: [
      "Big computer-use reliability pass: clicks now actually deliver to backgrounded apps, with overlay continuity fixed.",
      'Show more / show less for long user messages.',
      "Settings and Theme moved to the sidebar title bar.",
      "Backend now rate-limits every public mutation, action, and HTTP route.",
    ],
  },
  {
    date: "April 21, 2026",
    tags: ["New"],
    features: [
      "Auto-display generated images in the display sidebar.",
      "Live Memory phase added to onboarding (with sign-in resume).",
      'New "Cozy" theme.',
    ],
    fixes: [
      "Shell migrated to TanStack Router with sidebar app discovery.",
      "Onboarding mocks now mirror the real Stella surface.",
    ],
  },
  {
    date: "April 20, 2026",
    tags: ["Under the hood"],
    fixes: [
      "Major runtime change: agents now run on an Exec-first runtime, with isolated V8 contexts.",
      "Orchestrator and general agent prompts restructured for clearer behavior.",
      "Launcher reliability: macOS screen-permission build, Windows registry args, fewer first-run dependencies.",
    ],
  },
  {
    date: "April 19, 2026",
    tags: ["New"],
    features: [
      "Display sidebar now renders Word, Excel, PowerPoint, PDF, and HTML files.",
    ],
  },
  {
    date: "April 18, 2026",
    tags: ["New"],
    features: [
      "Suggestion chips above the full chat composer.",
      "Categories overlay back on home.",
      "New macOS native session service powering computer-use, with overlay motion aligned to action timing.",
    ],
  },
  {
    date: "April 17, 2026",
    tags: ["New"],
    features: [
      "Cmd+right-click context menu replaces the radial gesture overlay.",
      "Action overlay with a breathing lens and software cursor when Stella controls your computer.",
    ],
    fixes: [
      'Onboarding creation mock rebuilt with section-transformation pills.',
    ],
  },
  {
    date: "April 16, 2026",
    tags: ["New"],
    features: [
      "macOS desktop automation engine with auto-attached screenshots.",
      "The active-window screenshot is automatically attached to your message as an image.",
      "Display sidebar can be opened from the right-click menu in chat.",
    ],
    fixes: [
      "Range-based thread compaction for long chats.",
    ],
  },
  {
    date: "April 15, 2026",
    features: [
      "Write and Edit tools added to the General agent.",
    ],
    fixes: [
      "Onboarding reveals theme options in steps.",
      'Refreshed emote bundle.',
      'Pause self-mod hot reload while shell or code-mode writes are happening (less flicker).',
    ],
  },
  {
    date: "April 14, 2026",
    tags: ["New"],
    features: [
      "Stella streams reasoning summaries while she thinks, so you can see what she's working on.",
      "Twitch emote rendering in orchestrator markdown.",
    ],
    fixes: [
      "Native Stella runtime streaming and a refactor toward Pi extension model.",
    ],
  },
  {
    date: "April 13, 2026",
    fixes: [
      "Smoother assistant text streaming, especially across resumed and hidden runs.",
      "Exponential backoff retry for OpenAI completions.",
      "Reasoning is preserved across Stella completions.",
    ],
  },
  {
    date: "April 12, 2026",
    tags: ["New"],
    features: [
      "New ExecuteTypescript tool — typed code-mode for the General agent.",
    ],
    fixes: [
      "Wake-word pipeline removed (Stella moved away from always-listening).",
      "Bundled Stella browser binary refreshed.",
      "Local chat now pages by visible messages for performance.",
    ],
  },
  {
    date: "April 11, 2026",
    tags: ["New", "Polish"],
    features: [
      'Radial dial redesign — the "Full" wedge becomes "Add", and chat persists across workspaces.',
      "Display overlay replaced with a sidebar on the home page.",
    ],
    fixes: [
      "Launcher reliability fixes for macOS permission flows (TCC prompts, mic, etc.).",
      "Launcher hides its window when desktop starts and restores it on exit.",
    ],
  },
  {
    date: "April 10, 2026",
    tags: ["New", "Polish"],
    features: [
      "ChatGPT-style turn-anchored scrolling in chat.",
      "macOS screen and microphone permission onboarding screen.",
      "Subagent ticker and streaming events show up in chat.",
      "In-app permission recovery flows.",
    ],
    fixes: [
      "Stella branding on launcher icons and release artifacts.",
      "Many launcher and CI improvements (Windows/macOS).",
    ],
  },
  {
    date: "April 9, 2026",
    tags: ["New"],
    features: [
      "Mini chat split into its own dedicated window.",
      "Vision-based window content capture with column detection.",
    ],
  },
  {
    date: "April 8, 2026",
    tags: ["New"],
    features: [
      "Cloud backups (R2-backed) with settings integration.",
      "Self-mod history is now auto-tracked.",
    ],
    fixes: [
      "Faster SQLite via node:sqlite.",
      "Refreshed Stella brand assets across desktop, launcher, and mobile.",
      "iOS privacy manifest for the mobile app.",
    ],
  },
  {
    date: "April 7, 2026",
    tags: ["New", "Mobile"],
    features: [
      "Mobile app: dark mode, 17 themes, haptics, voice input, and push notifications.",
      'Voice "look at screen" tool — Stella can highlight things in real time.',
      "Vision screenshots, screen-guide overlay, and capture IPC.",
      "Compact mode replaces the overlay mini shell.",
      "Suggestion chips in chat with shared screenshot preview.",
      "New Claude Code orchestrator option.",
    ],
    fixes: [
      "One-time welcome dialog after onboarding.",
    ],
  },
  {
    date: "April 6, 2026",
    tags: ["New"],
    features: [
      "Inline previews for Word, Excel, and PowerPoint files.",
      "Stella Office is now vendored into Stella.",
    ],
    fixes: [
      "Connect dialog redesigned, and the Text Stella flow reversed for clarity.",
      "Permissions onboarding screen on macOS, plus a fix for relaunching from the DMG.",
      "Magic-link sign-in fix on mobile.",
    ],
  },
  {
    date: "April 5, 2026",
    tags: ["New"],
    features: [
      'Home merged into chat, with a shifting gradient on the mini shell.',
      'Radial dial reworked to four wedges with opt-in window context.',
      'New "View messages" button on home when you have chat history.',
    ],
    fixes: [
      "File-system-based skill environment replaces LoadTools/ActivateSkill.",
      "Cloud device sync now requires a real (non-anonymous) account.",
    ],
  },
  {
    date: "April 4, 2026",
    tags: ["Polish"],
    fixes: [
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
    features: [
      "Right-click chat sidebar replaces the floating orb and context menu.",
      "Programmatic send opens the sidebar chat directly.",
    ],
    fixes: [
      "Launcher auto-closes once Stella is confirmed running.",
      "Window controls moved into the sidebar header.",
      "Onboarding can complete without the canvas morph handoff.",
    ],
  },
  {
    date: "April 2, 2026",
    tags: ["New", "macOS"],
    features: [
      "Custom DMG installer with a mesh-gradient background and icon layout.",
      "Stella requests all macOS permissions upfront, with start/stop launcher controls.",
      "Single General agent with dynamic tool loading and reactive HMR.",
    ],
    fixes: [
      "Stella branding for Electron app icons.",
    ],
  },
  {
    date: "April 1, 2026",
    fixes: [
      "Smoother floating chat indicator (prewarmed animation).",
      "Frame-rate-independent Stella animation using real delta time.",
      "Overlay origin now syncs from actual window bounds on macOS.",
    ],
  },
  {
    date: "March 30, 2026",
    tags: ["New"],
    features: [
      "Multi-desktop per account: device-scoped registration, bridge, and phone pairing.",
    ],
    fixes: [
      "Daily cron to purge stale anonymous user data.",
      "MCP removed from the desktop app (replaced by Connect integrations).",
    ],
  },
  {
    date: "March 28, 2026",
    tags: ["New", "Mobile"],
    features: [
      "Phone pairing.",
      "Mobile: offline chat persistence, image support, and friendlier errors.",
      "New Home surface, with thread context that persists across runs.",
    ],
    fixes: [
      "macOS code signing and notarization for the launcher.",
      "Cloud data is purged on account delete.",
    ],
  },
  {
    date: "March 26, 2026",
    tags: ["New"],
    features: [
      'Linq remote-turn execution: Stella routes messages to your desktop and falls back to an offline responder.',
    ],
    fixes: [
      "Polling-based magic-link auth, deep-link protocol fix, and migration to cloud.stella.sh.",
      "Smoother chat streaming with a deferred WebGL init on the first message.",
      "Region capture fixes.",
      'Message timestamps reformatted as system reminders, with timezone correctness and 10-min dedup.',
    ],
  },
  {
    date: "March 25, 2026",
    tags: ["New"],
    features: [
      "Music generation switched to Lyria 3 (proxied through the backend).",
      "Home Canvas: LLM generation pipeline, selectable guide, music bar.",
    ],
    fixes: [
      "Improved wake-word handoff and voice echo gating.",
      "Auth callbacks now route through stella.sh.",
    ],
  },
  {
    date: "March 24, 2026",
    tags: ["New"],
    features: [
      "New voice model.",
      "macOS native build of the Stella browser.",
    ],
    fixes: [
      "Mobile: refreshed chat, desktop bridge, and account screens.",
      "Simpler MorphTransition shader (less heavy on GPU).",
    ],
  },
  {
    date: "March 23, 2026",
    tags: ["New"],
    features: [
      "New Media Studio app.",
      "Personalized Home Canvas replaces the home dashboard.",
      "Notification panel on the floating orb.",
      "Display Overlay for the agent Display tool.",
    ],
    fixes: [
      "Dark-mode gradient banding fixed (oklch interpolation + dithering).",
      "Cormorant Garamond added as a display font.",
    ],
  },
  {
    date: "March 22, 2026",
    tags: ["New"],
    features: [
      "Drag-and-drop file attachments across all three composers.",
      "New Pearl and Noir themes.",
      "Terms of Service, Privacy Policy, and in-app legal notices.",
    ],
    fixes: [
      "Lightweight CSS radial gradients replace the heavier blob gradient (faster, cleaner).",
      "Open / close animation for the mini shell.",
    ],
  },
  {
    date: "March 21, 2026",
    tags: ["Under the hood"],
    fixes: [
      "Sidecar runtime architecture — the agent runtime now runs in its own process.",
      "Chat UI: thinking row, shimmer, message typography refresh.",
    ],
  },
  {
    date: "March 20, 2026",
    features: [
      "Devtool initial release (hard reset clears storage, simplified UI).",
    ],
    fixes: [
      "Backend migrated off the AI SDK.",
      "Faster boot.",
    ],
  },
  {
    date: "March 19, 2026",
    fixes: [
      "Switched to Manrope as the default font.",
      "Mobile bridge backend wired up.",
    ],
  },
  {
    date: "March 18, 2026",
    tags: ["New", "Mobile"],
    features: [
      "Mobile app initial commit.",
    ],
    fixes: [
      "Onboarding: Next/Previous step controls, animation and layout polish.",
      "Cross-platform launcher CI workflow (Windows + macOS).",
    ],
  },
  {
    date: "March 17, 2026",
    tags: ["Under the hood"],
    features: [
      "Initial monorepo — desktop, mobile, backend, and launcher merged into one repo.",
      "Ultra tier added to billing.",
    ],
    fixes: [
      "Discovery page generation fix.",
    ],
  },
  {
    date: "March 16, 2026",
    tags: ["New"],
    features: [
      "Tier-aware managed model routing.",
      "Realtime transcription.",
      'Friend v1 — first cut of the social layer.',
    ],
    fixes: [
      "Realtime voice usage now reported for billing.",
    ],
  },
  {
    date: "March 15, 2026",
    features: [
      "Launcher's first commit.",
    ],
    fixes: [
      "Big runtime composition refactor — clearer routing seams.",
      "Self-mod morph is now readiness-driven (less flash).",
    ],
  },
  {
    date: "March 14, 2026",
    tags: ["New"],
    features: [
      "Multiplayer skill (game).",
      "Schedule tool.",
    ],
    fixes: [
      "Bundled Stella defaults moved into resources.",
    ],
  },
  {
    date: "March 13, 2026",
    tags: ["New"],
    features: [
      "Blueprint-based Store self-mod flow (v1).",
      "Stella browser ported to native Rust.",
    ],
    fixes: [
      "Voice: hard VAD gate, adaptive noise floor, echo handling on speakers.",
      "Stripe billing fixes.",
      'Floating orb, chat panel, and input bar now scale with viewport.',
    ],
  },
  {
    date: "March 12, 2026",
    tags: ["New"],
    features: [
      "Floating orb v1 chat.",
      "Self-mod and General agent split with concurrency support.",
    ],
    fixes: [
      "Header items moved to the sidebar.",
    ],
  },
  {
    date: "March 11, 2026",
    tags: ["New"],
    features: [
      "New wake-word model (fp16) and voice handoff.",
      "First-class Stella provider endpoints — desktop runtime now uses Stella provider models by default.",
    ],
    fixes: [
      'Clearer "connected account" vs "logged in" semantics.',
    ],
  },
  {
    date: "March 10, 2026",
    features: [
      "You can now keep messaging while a task runs in the background.",
    ],
    fixes: [
      "Backend route consolidation and SQL improvements.",
    ],
  },
  {
    date: "March 9, 2026",
    features: [
      "Audio ducking — music and other sounds dim while Stella speaks.",
    ],
    fixes: [
      "Unified renderer mic across wake word and voice.",
      "Many small reliability fixes (chat re-renders, double-cache charges, capture leaks, web search failures).",
    ],
  },
  {
    date: "March 8, 2026",
    tags: ["New"],
    features: [
      "Extension system: auto-discoverable tools, hooks, providers, and prompts.",
      'Native text selection inside Stella.',
      'New "auto" radial dial feature.',
      "Search canvas (and the news side trimmed down).",
    ],
    fixes: [
      "Faster web search and HTML rendering.",
    ],
  },
  {
    date: "March 7, 2026",
    tags: ["New"],
    features: [
      "Synthesis onboarding flow.",
      "Dashboard display and news rendering.",
      "Web search and news generation support added.",
    ],
    fixes: [
      "Bootstrap quiet window delayed by 2.5s for smoother launch.",
    ],
  },
  {
    date: "March 6, 2026",
    fixes: [
      "Edit tool fix and orchestrator local scheduling improvements.",
      "Home view and music adjustments.",
    ],
  },
  {
    date: "March 1–5, 2026",
    fixes: [
      "Ongoing polish and refactors: cleaner runtime composition, fewer barrels, sharper IPC.",
      "Search canvas iteration, animation polish on streaming pills, dashboard fixes.",
    ],
  },
  {
    date: "February 2026",
    tags: ["Foundation"],
    features: [
      'Stella renamed and reorganized — new agent / subagent / tools / skills layout.',
      "Discovery rewrite: selectable categories, signal collection, and seeded ephemeral memories.",
      "App Store / blueprints groundwork — first cut of how Stella publishes apps.",
      'Connect dialog initial setup; opens links in your browser instead of a tiny Electron window.',
      "Slack, Teams, Signal, Telegram, and Discord channel work.",
      "Multi-monitor and Windows native window-title detection.",
      "Cron tool, heartbeat handling, and improved interrupt / queue control in the UI.",
    ],
    fixes: [
      "Better Auth integration and hardened secrets handling.",
      "Drag-friendly mini shell, radial dial polish, and many capture/dial flicker fixes.",
    ],
  },
  {
    date: "January 2026",
    tags: ["Genesis"],
    features: [
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
        <SiteNav />
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
                  <div className="cl-entry__body">
                    {entry.features && entry.features.length > 0 && (
                      <div className="cl-group">
                        <h3 className="cl-group__label">New</h3>
                        <ul className="cl-entry__items">
                          {entry.features.map((item, idx) => (
                            <li key={`f-${idx}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {entry.fixes && entry.fixes.length > 0 && (
                      <div className="cl-group">
                        <h3 className="cl-group__label">Fixes &amp; polish</h3>
                        <ul className="cl-entry__items">
                          {entry.fixes.map((item, idx) => (
                            <li key={`x-${idx}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {entry.items && entry.items.length > 0 && (
                      <ul className="cl-entry__items">
                        {entry.items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
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
