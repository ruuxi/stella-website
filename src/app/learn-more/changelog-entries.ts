export type ChangelogEntry = {
  date: string;
  tags?: string[];
  features?: string[];
  fixes?: string[];
  items?: string[];
};

export const changelogEntries: ChangelogEntry[] = [
  {
    date: "June 6, 2026",
    tags: ["Polish"],
    features: [
      "Connect dialog and integrations list are now left-aligned for easier scanning.",
      "Emoji packs got another asset refresh.",
    ],
    fixes: [
      "Discovery is better at finding the right local context and ignoring stale editor projects.",
      "Onboarding discovery signals are sharper and read your local data live.",
    ],
  },
  {
    date: "June 5, 2026",
    tags: ["New", "Polish"],
    features: [
      "Native meeting capture sidecar added for Granola-style meeting recording.",
      "Finished voice sessions now render as a polished summary pill.",
      "Personality setup now uses editable `PERSONALITY.md` presets and preserves imported personality choices.",
      "Stella can seed and reconcile agent prompts locally, similar to skills.",
    ],
    fixes: [
      "Windows startup and window detection are faster and less prone to hangs.",
      "Settings and onboarding welcome screens start more responsively.",
      "The working indicator now sits below assistant messages.",
      "Stella keeps startup memory in context more reliably.",
      "Voice sessions can use the right runtime abilities.",
      "The radial menu listens for mouse movement only while it is open.",
      "Hidden composer context polling was disabled to reduce background work.",
      "Stella has clearer self-knowledge and service-connection guidance.",
    ],
  },
  {
    date: "June 4, 2026",
    tags: ["New", "Polish"],
    features: [
      "Area annotation composer — select an area on screen and add a note right where the context matters.",
      "Store release diffs are now handled outside the app bundle, making installs and publishes lighter.",
      "New managed skills landed for X, YouTube content, humanizing text, Apple Reminders/Notes, and model help.",
      "Stella can set up service access and accounts more autonomously.",
    ],
    fixes: [
      "Discord DM setup copy is clearer.",
      "Telegram bot links work again.",
      "Mini display sidebar controls are back.",
      "Chat stays mounted behind the Home overlay, so switching in and out feels smoother.",
      "Chat scrolling recovers after toggling Home, and sending a message nudges the layout more smoothly.",
      "Windows startup, taskbar/tray icons, and selected-text capture are more reliable.",
      "Store and Billing webviews load more lazily so they cause less startup lag.",
      "Computer-use state refresh is faster.",
      "Workspace strip auto-collapse is less eager.",
      "Body text is slightly heavier for readability.",
      "Display sidebar uses a simpler divider instead of a heavy shadow.",
      "Stella's personality now stays pinned through long conversations.",
    ],
  },
  {
    date: "June 3, 2026",
    tags: ["New", "Polish"],
    features: [
      "Mini window got a dedicated lean entry point for faster, lighter launches.",
      "On Windows, closing Stella can now minimize it to the system tray instead of fully quitting.",
      "The active conversation now reloads instantly more often.",
    ],
    fixes: [
      "First chat startup is faster.",
      "Mini window stays always-on-top more reliably on Windows.",
      "Toasts can appear over embedded website views.",
      "Release packages no longer include empty placeholder state folders.",
      "Unused preference cleanup keeps settings simpler.",
    ],
  },
  {
    date: "June 2, 2026",
    tags: ["New", "Polish"],
    features: [
      "Custom overlay theme — Stella redesigns can now apply live to a Custom theme.",
      "Local dictation gained Parakeet C++ support.",
      "Grok Composer became a supported external model option.",
    ],
    fixes: [
      "Restored conversations are preserved more reliably on boot.",
      "Stella is better at honoring your exact intent when delegating work.",
      "Theme self-updates reload correctly.",
      "Store installs from code artifacts are more robust.",
      "Image attachments are recognized more reliably.",
      "Upgrade and provider dialogs no longer feel cramped.",
      "Secrets are redacted more thoroughly from memory.",
    ],
  },
  {
    date: "June 1, 2026",
    tags: ["New", "Polish"],
    features: [
      "Managed image generation waits for results and surfaces failures more clearly.",
      "Stella can use a private search fallback when needed.",
      "Voice provider settings got a refinement pass.",
      "Recent apps and window detection are faster.",
    ],
    fixes: [
      "Mobile chat retries are deduped, and mobile developer artifacts stay gated.",
      "Desktop update state is tracked more clearly.",
      "Image generation starts without blocking the chat.",
      "Windows development and app hot paths are lighter.",
      "App context chips gained better accessibility text.",
      "Task status updates after sending input are more accurate.",
    ],
  },
  {
    date: "May 31, 2026",
    tags: ["Polish"],
    features: [
      "Settings are now translated across all supported languages.",
      'The composer placeholder now simply says "Do anything."',
    ],
    fixes: [
      "User-message context chips and chat typography were tightened up.",
      "Reporting schedules are more reliable.",
      "Windows keeps Stella's available actions more reliably after startup.",
      "More app startup code was reorganized for long-term stability.",
      "Mobile bridge readiness checks are more reliable.",
      "Store publish metadata is more private.",
      "Self-update restart indicators and timing are cleaner.",
      "Home display model picker is cleaner without extra selection checkmarks.",
      "Onboarding project discovery improved.",
    ],
  },
  {
    date: "May 30, 2026",
    tags: ["New", "Polish"],
    features: [
      "App creation can now start from the Apps empty state with a prefilled prompt.",
      "Google integrations now use the connected-app catalog.",
      "Cadence reports can be toggled once browser discovery is available.",
      "Store publishing helpers are back.",
    ],
    fixes: [
      "Desktop updates recover and cancel more cleanly when something goes wrong.",
      "Onboarding welcome screens render from Stella's latest content and behave more reliably.",
      "Display tab add menu and home engine controls were restored and polished.",
      "Theme switching no longer flips unexpectedly when closing the picker.",
      "Source imports use one clearer flow.",
      "The app internals were reorganized to make future UI work cleaner.",
    ],
  },
  {
    date: "May 29, 2026",
    tags: ["New", "Polish"],
    features: [
      "Store releases can now be published from selected source changes.",
      "External agent runs can overlap when needed.",
      "Desktop updates now collect better timeout diagnostics.",
      "Self-mod undo notices are preserved even when hidden.",
    ],
    fixes: [
      "macOS permission reset flows work more reliably.",
      "Computer permission requests go through the host app cleanly.",
      "Chat follow-up scrolling is steadier.",
      "Windows mini-window lag and Store handoff bugs were fixed.",
      "The self-change transition is calmer, using a blur and band sweep instead of a ripple.",
      "Stella's development server now stays on a fixed port.",
    ],
  },
  {
    date: "May 28, 2026",
    tags: ["New", "Polish"],
    features: [
      "Mobile can now sync computer-chat artifacts from the desktop.",
      "The mobile bridge exposes model lists and connected providers.",
      "Codex and Claude Code engines gained a thinking-effort control.",
      "Stella now keeps memory in markdown files and drops the older memory store.",
      "Local crash and process-lifecycle logs make troubleshooting easier.",
    ],
    fixes: [
      "Broken desktop installs can self-heal by repairing the desktop binary.",
      "Media history, audio, deletion, and tab selection were cleaned up.",
      "The mini window now opens at Home consistently.",
      "Top-bar controls stay visible at narrow widths.",
      "Chat no longer shakes when the display panel opens after reload.",
      "Mobile chat sync filtering and discovery paths were fixed.",
      "Cursor runner cleanup, recovery, and secure key storage were improved.",
    ],
  },
  {
    date: "May 27, 2026",
    tags: ["New", "Polish"],
    features: [
      "Model controls moved into the display sidebar, with a wider and cleaner engine picker.",
      "Codex engine support reached closer parity with Stella's other engines.",
      "Stella gained a source-pack update flow.",
      "Display surfaces got softer Apple-style depth and lighter shadows.",
    ],
    fixes: [
      "Chat text rendering is steadier during window resizing.",
      "Queued follow-ups clear correctly after failed runs.",
      "Inline artifact selection works better.",
      "Mini Ask Stella selection chips no longer go stale.",
      "Restricted-model toasts and model picks are more reliable.",
      "Native helper refresh and macOS dev permission relaunch flows were fixed.",
      "Crash screens now catch more local app errors.",
    ],
  },
  {
    date: "May 26, 2026",
    tags: ["New", "Polish"],
    features: [
      "Cadence reports now appear as chat artifacts.",
      "Settings moved into the top-bar navigation, and Stella can ask for your nickname.",
      "Reduce Motion setting added.",
      "Workspace actions and reports were reworked into a cleaner flow.",
      "A settings menu now appears next to Sign in when signed out.",
    ],
    fixes: [
      "Chat workspace strip spacing and user-message padding were tightened.",
      "Old chat errors no longer replay unexpectedly.",
      "Store web toasts now bridge into the desktop.",
      "External-agent failures are handled more gracefully.",
      "Display-sidebar right-click toggling and code-block scroll jitter were fixed.",
      "Self-change visuals are skipped when Stella is hidden.",
      "Apps and Social empty states got a polish pass.",
    ],
  },
  {
    date: "May 25, 2026",
    tags: ["New", "Polish"],
    features: [
      "Cursor, Codex, Claude Code, Hermes, and OpenClaw engine/import paths landed.",
      "Claude Code model selection added.",
      "Settings → Models folded into the Engine display tab.",
      "User apps now open under their own `/apps` pages, and the Apps nav dot lights up when Stella scaffolds something new.",
      "Bundled skills reconcile into your local Stella folder on launch.",
    ],
    fixes: [
      "Windows computer automation and native-helper update paths are more reliable.",
      "Engine selection, model assignment, and engine-specific pickers were cleaned up.",
      "Onboarding import and theme steps were polished.",
      "Third-party session and schedule imports were fixed.",
      "Interrupted Claude Code turns resume better.",
      "Self-mod runs survive continuations more reliably.",
    ],
  },
  {
    date: "May 24, 2026",
    tags: ["New", "Polish"],
    features: [
      "Low-resource desktop launch mode added.",
      "Mini window attach mode added.",
      "Stella uses custom Windows chrome and shows Windows app icons in context chips.",
      "Clean desktop updates now have a faster path.",
      "The left sidebar can be collapsed by dragging from its right edge.",
    ],
    fixes: [
      "Windows startup work was reduced, and desktop device-key mismatches can recover.",
      "Duplicate toasts are deduped instead of stacking.",
      "Display panel layout state, sidebar motion, and sidebar spacing were refined.",
      "Desktop release packages now include the hydrated payloads they need.",
      "Low-resource preview loading and desktop build output were fixed.",
      "macOS edit shortcuts work again.",
      "Sidebars and workspace cards regained tasteful glass depth without excess blur.",
    ],
  },
  {
    date: "May 23, 2026",
    tags: ["New", "Polish"],
    features: [
      "Locked computer use — Stella can now keep computer-control work more contained when needed.",
      "General settings now includes a macOS font-smoothing toggle.",
      "Stella state moved into your home folder, making local app data more predictable across installs.",
    ],
    fixes: [
      "Chat now auto-focuses the composer, with softer focus styling.",
      "Sidebar navigation and the account footer were reorganized for a cleaner layout.",
      "The feedback prompt now only appears once.",
      "The workspace strip stays hidden on Home where it does not belong.",
      "Connector cleanup is more reliable after a connected-app session ends.",
      "Windows startup, shutdown, and background worker reliability improved.",
      "Onboarding no longer overflows the viewport, and global shortcuts pause during onboarding demos.",
      "Settings and app startup are faster.",
      "Native helper release publishing and installer launch paths were fixed.",
    ],
  },
  {
    date: "May 22, 2026",
    tags: ["New", "Polish"],
    features: [
      "Composer now has a New Chat action.",
      "The display sidebar can open straight into a launcher from Home.",
      "The phone Connect dialog now starts with a clearer two-step download + pair flow.",
      "Discover is simpler: one compact mixed stream instead of a wall of chips.",
    ],
    fixes: [
      "Chat feels steadier: fewer message flashes, better queued-message cleanup, fewer resize loops, and no double-jump after follow-ups.",
      "Streaming text and emoji rendering are smoother and stay local.",
      "The working indicator no longer gets stuck after resuming.",
      "Onboarding completion now persists correctly.",
      "Updates refresh native helpers and stop chasing personal skill state.",
      "Mobile connector follow-ups work more reliably.",
      "Shell and composer glass surfaces are faster, with lighter tint-only panels.",
      "Composer add menu was reordered and simplified.",
      "Display sidebar delete confirmation is simpler, and fresh Discover reports get a subtle unread dot.",
    ],
  },
  {
    date: "May 21, 2026",
    tags: ["New", "Polish"],
    features: [
      "New Engine onboarding phase for technical users.",
      "The workspace strip got overflow actions and a clearer Open panel for suggestions and discovery.",
      "Pearl is now the default desktop theme for new users, with Pearl made whiter and Noir made blacker.",
      "The \"Hey Stella\" wake word model was updated.",
    ],
    fixes: [
      "Onboarding capabilities, theme, engine, and permissions flows got a broad polish pass.",
      "The Engine onboarding phase now shows Stella correctly and advances without lag.",
      "Chat typography is lighter and more consistent, with tighter message sizing and smoother working indicators.",
      "Radial capture no longer creates duplicate thumbnails, and removed composer capture context was restored.",
      "Desktop Google sign-in uses a more reliable callback flow.",
      "Update install prompts and changed-file inspection are clearer.",
      "Top shell/sidebar spacing, update pill typography, and shell breakpoint animations were tightened.",
      "A window-listener leak was fixed.",
    ],
  },
  {
    date: "May 20, 2026",
    tags: ["New", "Polish"],
    features: [
      "Settings → Models and the composer model picker got a cleaner redesign, with the real model name shown on every Stella tier row.",
      "Fashion is back as a first-class Store tab.",
      "Display tabs now remember their history, so reopening the panel feels less like starting over.",
      "Canvas previews use compact tab-style chips instead of bulky rail thumbnails.",
      "The chat surface is getting a workspace strip, so conversation-specific work can stay easier to find.",
      "Workspace section toggles now live in the Open card header, closer to the work they control.",
      "Media and Canvas tabs got calmer, more useful empty/loading states and cleaner history controls.",
    ],
    fixes: [
      "Stella shuts down and updates more reliably.",
      "Chat text reveals more smoothly word by word, and extra trailing divider lines no longer appear in assistant messages.",
      "The Chat-tab Activity panel is quieter and holds its layout better in narrow sidebars.",
      "Agent activity text is clearer when Stella updates you on progress.",
      "Claude Code replies now persist correctly.",
      "Developer sign-in links and local launch metadata got cleanup.",
      "Settings and model picker polish: no more double-selected Stella tiers, and picking a model no longer makes the submenu flash.",
      "General settings and connected-provider controls got a cleaner layout.",
      "Shell and display-sidebar resizing feel smoother, with a cleaner divider.",
      "The Store side panel layout was fixed.",
      "Streaming chat messages no longer re-fade after they finish.",
      "Media tab errors now show as toasts instead of awkward inline text.",
      "The sidebar footer is cleaner, without the extra divider or sticky selected state on the toggle.",
      "Expanded display-panel chat better matches the main chat width.",
      "The workspace strip stays visible in expanded display-panel chat.",
      "The Store tab inside the display sidebar has a calmer publish flow.",
      "The display sidebar confirmation flow was tidied up.",
    ],
  },
  {
    date: "May 19, 2026",
    tags: ["New", "Polish"],
    features: [
      "Sign in with Google is now available in the desktop app.",
      "Native integrations are now backed by Stella's server catalog, with restored integration icons.",
      "Mobile can receive push updates for Stella's activity, and remote mobile chats now cancel correctly.",
      "Stella can open browser tabs in your existing Chrome windows instead of always making a new window.",
      "When you're scrolled away, Stella can show a small peek of the latest reply above the composer.",
      "Memory and screen context now load on demand, so Stella only pulls that context when it actually helps.",
    ],
    fixes: [
      "Model controls moved into Settings and the composer menu, and the model picker is faster.",
      "Sidebar footer actions were redesigned with larger, easier-to-hit buttons.",
      "Queued composer messages are smaller and sit more naturally in the composer.",
      "Store packages no longer show an extra OS install confirmation.",
      "Top-bar web controls and the sidebar theme picker were cleaned up.",
      "Desktop chat scrolling is steadier while Stella is replying.",
      "Mobile WebView and bridge behavior is more reliable.",
    ],
  },
  {
    date: "May 18, 2026",
    tags: ["Polish"],
    features: [
      "Stella's replies now appear more smoothly as she writes, with less jitter.",
      "When Stella makes several images at once, they now appear together in one tidy filmstrip.",
      "Messages that are still being written look cleaner in the chat.",
      "Phone pairing and connected-app setup are smoother.",
    ],
    fixes: [
      "Replies after Stella takes an action now show up reliably, even after a reload.",
      "Follow-up messages now land in the right place instead of being treated like mid-task instructions.",
      "Chat scrolling is steadier while Stella is working, especially near the bottom of a thread.",
      "The chat is less likely to lose its place when new messages, buttons, or results appear.",
      "Mobile sign-in and chat history work more reliably.",
    ],
  },
  {
    date: "May 17, 2026",
    tags: ["New", "Polish"],
    features: [
      "More integrations now connect through Stella Connect, including Store add-ons and Google Workspace.",
      "When you add multiple things from the radial menu, Stella keeps them stacked instead of replacing the previous one.",
      "If Stella gets stuck while opening, the splash screen now shows rescue buttons after a short wait.",
      "Some model responses now start appearing sooner instead of waiting for the whole reply to be ready.",
    ],
    fixes: [
      "Stella formats replies better when you switch between desktop work and connected apps.",
      "Activity row right-side labels stay visible when the display sidebar is narrow.",
      "Smarter handling for Stella's more advanced thinking models.",
      "Fixed typing inside the model-error search box.",
      "Fixed hidden follow-up messages from Stella.",
      "Fewer duplicate background requests when screens load.",
      "Connectors stay on Stella's built-in connection flow after removing a short-lived experiment.",
      "Connector settings now show a more accurate count of available actions.",
    ],
  },
  {
    date: "May 16, 2026",
    tags: ["New", "Polish"],
    features: [
      "Sidebar chat now loads older messages when you scroll to the top.",
      "Stella's built-in browser controls are more complete.",
      "Connecting apps is smoother.",
      "Animated SVG illustrations for display sidebar empty states.",
    ],
    fixes: [
      "Removed an older connector list so app connections use one clearer flow.",
      "Shrunk Media tab mode labels and flipped the submit icon upward.",
      "Up next copy is softer, and missing files fail gracefully.",
      "Stella automatically retries once when a reply comes back empty.",
      "Connector replies keep flowing for the whole conversation instead of stalling mid-thread.",
      "Chat history, file history, and live activity are now separated so long conversations stay cleaner.",
      "Display messages now use their own overlay instead of piggybacking on the chat view.",
      "Interrupting Stella mid-reply is more predictable.",
      "Fixed failing automated tests.",
    ],
  },
  {
    date: "May 15, 2026",
    tags: ["New", "Polish"],
    features: [
      "Chat home overview redesigned around an Activity layout, with a paginated, virtualized \"See all\" history dialog.",
      "Inline artifact cards get an Open-with menu and a category · format subtitle that swaps to an Open-preview affordance on hover.",
      "A \"Reconnecting to Stella\" toast appears when Stella is trying again, so silent stalls are visible.",
      "If the chat window hangs for 10 seconds, Stella now shows a recovery page instead of staying frozen.",
    ],
    fixes: [
      "Schedule details dialog restyled to match the Connect dialog aesthetic.",
      "Store side panel typography and empty-state copy polished; Canvas and Media empty-state text nudged up; Media tab drops the \"Make something\" hero copy.",
      "Dictation now goes into the Store text box when you're typing there.",
      "Slowed the task progress summary cadence to 30s (with a 10s kickoff) so it stops chattering.",
      "Tighter chat home overview activity list and hidden scrollbars.",
      "Chat links open directly instead of through an extra confirmation dialog.",
      "Headings and tables render correctly in chat again.",
      "Fixed canvas previews, thumbnails, recent files, and backgrounds.",
      "Dictation works better when Stella isn't the active app.",
      "Radial dial and mini window now behave on macOS fullscreen Spaces.",
      "Stella now shows model usage-limit errors faster.",
      "Reduced chat resize work and reused artifact cards for HTML; paused the social empty-state illustration when offscreen and dropped the cursor shadows.",
      "Chat no longer pins to the absolute bottom during resize bursts.",
      "Follow-up messages are handled more clearly.",
    ],
  },
  {
    date: "May 14, 2026",
    tags: ["Polish"],
    features: [
      "Model picker opens instantly, and unavailable choices are checked reliably.",
    ],
    fixes: [
      "Auth-error toast routes to the sign-in dialog instead of dumping you on billing.",
      "Fixed the composer's shape after sending and dictation overlapping with already-typed text.",
      "Fixed missing pieces in fast Stella replies.",
    ],
  },
  {
    date: "May 13, 2026",
    tags: ["New", "Polish"],
    features: [
      "Inline undo for self-mod commits, with thread-aware reminders so you can roll back a change Stella just made.",
      "Developer file previews collapse into a single \"Code changes\" tab instead of stacking up per file.",
      "Update pill swaps its spinner for a traveling-border loader.",
      "Stella now double-checks updates before marking them installed, and fixes stale update info after restart.",
    ],
    fixes: [
      "Temporary model errors retry automatically.",
      "Home sidebar hint dismisses on the first right-click.",
      "Hard cap on rendered task progress phrases so they stop piling up.",
      "Music prompts and progress summaries respect your own connected keys.",
      "Chronicle (screen memory) summaries inject on file change instead of every turn.",
      "Background work now sees Stella's latest files while the app is updating itself.",
    ],
  },
  {
    date: "May 12, 2026",
    tags: ["New", "Polish"],
    features: [
      "Read aloud: Stella can speak her replies, with a play button on each message and a menu toggle for auto-play.",
      "Realtime voice can use more voice options.",
      "More models now show up in Stella's picker.",
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
      "Buy extra usage credit on the billing page when you run low: no need to wait for the monthly reset.",
      "Connect your own AI keys through a polished setup dialog.",
      "Dictation sound controls in settings.",
      "Launcher shows a recovery view when desktop fails to start, plus an option to revert a bad Stella update.",
    ],
    fixes: [
      "Chronicle (screen memory) is now a paid feature.",
      "Seedance replaces the older video generation models.",
      "Paid media (image, voice, video) is gated to subscribers, with a built-in escape hatch to switch to your own keys from the upsell toast.",
      "Default theme in light mode is now Midnight.",
      "The update helper is more tightly locked down.",
      "Windows builds ship with the right native helpers for each platform.",
      "Free and anonymous limits are tighter, and plan limits are easier to adjust.",
      "Dropped Teams and Google Chat connector tiles; fixed the Discord install link.",
    ],
  },
  {
    date: "May 10, 2026",
    tags: ["Polish", "Under the hood"],
    fixes: [
      "Store side panel and Publish dialog got a UX pass.",
      "Stella applies self-changes with fewer restarts and less visual flashing.",
      "Dev Stella stops prompting for macOS Keychain access on every restart.",
      "Sidebar and page changes refresh more smoothly while Stella updates herself.",
      "More model requests identify themselves as Stella.",
      "Internal reliability groundwork landed.",
    ],
  },
  {
    date: "May 9, 2026",
    tags: ["New", "Billing"],
    features: [
      "Billing moved to a Stripe-hosted Checkout with managed payments, and the screen was redesigned to match the Stella aesthetic.",
      "Local models like Ollama are now first-class options in settings.",
      "Voice and agent model choices are easier to configure separately.",
    ],
    fixes: [
      "Plan tiers now describe usage in plain language (e.g. \"a few hours a day\") instead of opaque dollar allotments.",
      "Stella now chooses the right thinking level automatically for each request.",
      "Mini window: sidebar hidden, traffic-light placement tuned, and embedded web views fade behind a glass mask.",
      "Bulk model actions in settings, refined model picker layout.",
      "Global social chat is hidden while safety controls mature; some managed usage limits were simplified.",
      "Onboarding fog overlay removed.",
    ],
  },
  {
    date: "May 8, 2026",
    tags: ["New", "Polish"],
    features: [
      "Canvas tab: Stella can answer with a richer visual view when a chart, layout, or interactive page fits better than plain text.",
      "Composer can pull in the area you have selected on screen as context for your next message.",
      "Stella can spin up more specialized helper agents when a task calls for it.",
    ],
    fixes: [
      "Model picker now collapses to a small set of Stella presets and expands on demand.",
      "Image generation defaults to fast/low settings (you can still crank it).",
      "Desktop updates moved from Settings into a small top-bar pill.",
      "Display sidebar performance and memory tightened; expanded panel hides the rest of the chat instead of bleeding through.",
      "Images created or found during a task are easier for Stella to use in the conversation.",
      "Local image settings now work across agents.",
      "Desktop build system upgraded.",
    ],
  },
  {
    date: "May 7, 2026",
    tags: ["New", "Polish"],
    features: [
      "Connect integrations got a cleaner setup path.",
      "Scheduled tasks are more flexible and can send native OS notifications when they're done.",
      "Stella Computer on Windows is more native and reliable.",
      "Realtime voice moved to the GA model, with a British accent option and a refreshed prompt.",
    ],
    fixes: [
      "Long-running Stella sessions are more reliable, including personality, reminders, and memory.",
      "Smoother chat scroll and working indicator in the suggestion row.",
      "Local updates are smoother when Stella changes herself.",
    ],
  },
  {
    date: "May 6, 2026",
    tags: ["Under the hood", "Polish"],
    features: [
      "Hosted Store now runs embedded in the desktop, replacing the legacy native Store UI.",
    ],
    fixes: [
      "Chat timeline and social chat virtualized with Legend List: long threads stay snappy.",
      "Desktop shell upgraded.",
      "Sign-in storage is more secure and better isolated.",
      "Native dropdowns now match Stella's own menu styling.",
      "Fixes: non-mac onboarding skips, local dictation startup, safer display links, and restoring capture sources after canceling.",
    ],
  },
  {
    date: "May 5, 2026",
    tags: ["New", "Polish"],
    features: [
      "\"Hey Stella\" voice activation has fewer false starts.",
      "Image generation now runs in the background and shows up in a unified gallery in the display sidebar.",
      "Generated media (images, music, etc.) live in their own sidebar workspace, and previews open in an in-app dialog.",
      "Messages you send while Stella is working now appear inline in the chat.",
      "Stella handles mid-task course corrections more smoothly.",
    ],
    fixes: [
      "Behind-the-scenes thinking is hidden by default, with advanced controls still in settings.",
      "Store, Pets, and Emoji dialogs aligned with the Connect dialog aesthetic.",
      "Working indicator fades faster when work is done.",
    ],
  },
  {
    date: "May 4, 2026",
    tags: ["Polish"],
    features: [
      "Music generation added.",
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
      "Wake-word voice activation is back: say \"Hey Stella\" to start a voice session, with a bundled prebuilt listener for macOS and Windows. (Off by default; turn it on in settings.)",
      "AI-generated emoji packs in the Store, alongside user-created pet packs.",
      "Sidebar Models picker: choose Stella's main models without leaving chat.",
      "Stella's voice is dynamic now, seeded from your personality.md.",
      "Display canvas is now inline, with refreshed working-indicator copy.",
    ],
    fixes: [
      "Replaced the four blue themes with Sage, Crimson, Slate, and Cocoa, and made Pearl and Noir standardized single-mode themes.",
      "Dictation: transcripts always paste straight into the focused app, in-app composer flow polished, OS-wide overlay layout cleaned up, on-device toggle hidden on Intel Macs.",
      "Apple-style elevation polish on dropdowns and popovers; toast and display \"+\" menu match the glass aesthetic.",
      "Pet polish: smoother action arc, click-through outside visible pixels, open preference syncs across windows, default pet renamed to Stella.",
      "Sending chat messages feels faster, and self-updates start with more common helpers ready to go.",
      "Onboarding is smoother, with better step navigation and more useful location setup.",
      "Live Memory now requires sign-in, and Store browsing loads faster and more safely.",
    ],
  },
  {
    date: "May 2, 2026",
    tags: ["New"],
    features: [
      "Floating pet companion in its own window: hatch one with the new pet skill. The pet drives voice mode (replacing the old voice creature overlay) and surfaces status updates.",
      "Pets are now part of the Store catalog.",
      "Home now has a time-ordered Activity strip with an Up Next peek.",
      "Home suggestions are grouped into friendly category pills.",
      "Post-onboarding hints for Connect and Store.",
      "New native dictation_bridge helper for macOS and Windows; push-to-talk dictation refresh.",
    ],
    fixes: [
      "Scheduling now shows a neat inline receipt after it runs.",
      "Utility actions moved into the sidebar.",
      "New requests queue more gracefully while Stella is already working.",
      "Store releases are easier to review before installing.",
      "File editing is matched more carefully to the model doing the work.",
      "Removed the experimental Snake sidebar app and route.",
    ],
  },
  {
    date: "May 1, 2026",
    tags: ["New", "Onboarding"],
    features: [
      "Personalized app recommendations during onboarding (with badges prefixed \"Stella may:\").",
      "Stella started laying the groundwork for more languages, with a language picker on the start screen.",
      "Stella can track and apply desktop updates.",
      "Canvas artifacts show up in chat.",
      "Snake game added to the sidebar (and made bigger and easier to play).",
    ],
    fixes: [
      "Store installs now require explicit confirmation, and uninstalls are more reliable.",
      "Store security review got stricter about network access.",
      "New skills for creating Stella apps, generating media, and extending Stella.",
      "Computer-use sessions are cleaned up daily.",
      "Chat text appears more smoothly, and Social/Fashion updates feel faster.",
      "Voice sessions understand your screen and chat context better.",
      "Replaced \"Explore ideas\" with skill suggestions; flatter app suggestions dialog rows.",
      "Home hint mouse icon, welcome opens the workspace, badge polish.",
      "Stella's instructions now frame her more clearly as your personal assistant.",
      "Image generation moved into its own media skill.",
      "Settings content centered within the panel.",
    ],
  },
  {
    date: "April 30, 2026",
    tags: ["New", "Polish"],
    features: [
      "Click-to-update launcher: Stella can now check for and install updates on demand, with a manual update check, reinstall option, and a native uninstall confirmation.",
      "Chat home overview now shows your task history with progress summaries.",
      "In-app dictation bar gets a send arrow.",
    ],
    fixes: [
      "Launcher UI polish and download fixes.",
      "Store integrations now render as App Store-style rows.",
      "Sent user messages animate into the full chat surface.",
      "Display sidebar drops the heavy blur and preserves the active tab when you reopen the panel.",
      "Computer-use works better inside web apps and supports simpler clicks.",
      "Stella now prefers a desktop app over the browser for named consumer services (e.g. Spotify, Slack).",
      "Built-in AI models respond more reliably.",
      "Stella is clearer about when to handle work herself versus delegating.",
      "Fixes: onboarding completion, Store display behavior, first-message bounce, remote connector behavior, and several working-indicator bugs.",
      "Global social chat is disabled while safety controls mature.",
    ],
  },
  {
    date: "April 29, 2026",
    tags: ["New", "Polish"],
    features: [
      "Universal macOS desktop builds: one download works on both Apple Silicon and Intel Macs.",
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
      "Pages no longer flash errors during sign-in transitions.",
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
      "Onboarding got a big polish pass: snappier transitions, friendlier copy, clearer steps.",
      "Store: navigation redesign, tighter Fashion agent, and a confirmation step before adding new connectors.",
      "Onboarding now skips the macOS permissions step on Windows and Linux.",
      "Lots of fixes: radial overlay stays on the active macOS Space, Connect dialog layering, inline questions, and visuals while Stella updates herself.",
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
      "Stella Connect: connect external services to Stella.",
      "Computer-use comes to Windows: Stella can now click and type on your screen on Windows machines.",
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
      "Local Parakeet dictation: fast, private, runs on your device.",
      "Controls for connecting your own AI accounts.",
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
      "Stella now detects files created by outside apps: they show up automatically.",
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
      'New "Ask Stella" pill that appears above text you select: works in Stella and across other apps.',
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
      "Live Memory dialog and a customizable creature face: toggle eyes and mouth.",
      "Twitch emotes render in chat.",
      "Double-tap Option to summon the mini window.",
    ],
    fixes: [
      "Big computer-use reliability pass: clicks now actually deliver to backgrounded apps, with overlay continuity fixed.",
      'Show more / show less for long user messages.',
      "Settings and Theme moved to the sidebar title bar.",
      "Backend protections now cover every public entry point.",
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
      "Sidebar app discovery became more reliable.",
      "Onboarding mocks now mirror the real Stella surface.",
    ],
  },
  {
    date: "April 20, 2026",
    tags: ["Under the hood"],
    fixes: [
      "Major internal reliability upgrade for how agents run.",
      "Stella's instructions were reorganized for clearer behavior.",
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
      "Stella can write and edit files more directly.",
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
      "Stella shows short thinking summaries while she works, so you can see what she's doing.",
      "Twitch emotes render in Stella's messages.",
    ],
    fixes: [
      "Stella's live replies got internal cleanup.",
    ],
  },
  {
    date: "April 13, 2026",
    fixes: [
      "Smoother live replies, especially after resuming hidden work.",
      "Exponential backoff retry for OpenAI completions.",
      "Reasoning is preserved across Stella completions.",
    ],
  },
  {
    date: "April 12, 2026",
    tags: ["New"],
    features: [
      "New deeper coding mode for technical tasks.",
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
      'Radial dial redesign: the "Full" wedge becomes "Add", and chat persists across workspaces.',
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
      "Helper-agent progress now shows up in chat.",
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
      "Cloud backups, with settings integration.",
      "Self-mod history is now auto-tracked.",
    ],
    fixes: [
      "Faster local data storage.",
      "Refreshed Stella brand assets across desktop, launcher, and mobile.",
      "Mobile privacy paperwork added for iOS.",
    ],
  },
  {
    date: "April 7, 2026",
    tags: ["New", "Mobile"],
    features: [
      "Mobile app: dark mode, 17 themes, haptics, voice input, and push notifications.",
      'Voice "look at screen": Stella can highlight things in real time.',
      "Voice screen viewing and guidance overlays improved.",
      "Compact mode replaces the overlay mini shell.",
      "Suggestion chips in chat with shared screenshot preview.",
      "New Claude Code option for coding work.",
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
      "Live task status while Stella is thinking.",
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
      "A simpler main-agent setup that can load extra abilities as needed.",
    ],
    fixes: [
      "Stella branding for desktop app icons.",
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
      "Older connection plumbing removed from the desktop app and replaced by Connect integrations.",
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
      "Smoother first-message replies.",
      "Region capture fixes.",
      'Message timestamps reformatted as system reminders, with timezone correctness and 10-min dedup.',
    ],
  },
  {
    date: "March 25, 2026",
    tags: ["New"],
    features: [
      "Music generation upgraded.",
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
      "New display overlay for showing generated files and results.",
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
      "Stella's agent work now runs in a separate process for better stability.",
      "Chat UI: thinking row, shimmer, message typography refresh.",
    ],
  },
  {
    date: "March 20, 2026",
    features: [
      "First version of Stella's developer tools.",
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
      "Mobile bridge wired up.",
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
      "Desktop, mobile, cloud, and launcher code were brought together into one project.",
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
      "Plans now get the right managed models automatically.",
      "Realtime transcription.",
      'Friend v1: first cut of the social layer.',
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
      "Large internal cleanup for how Stella routes work.",
      "Self-mod morph is now readiness-driven (less flash).",
    ],
  },
  {
    date: "March 14, 2026",
    tags: ["New"],
    features: [
      "Multiplayer skill (game).",
      "Scheduling support.",
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
      "Stella's own model endpoints became the desktop default.",
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
      "Audio ducking: music and other sounds dim while Stella speaks.",
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
      "Extension system: Stella can discover new abilities, model options, and prompts.",
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
      "Editing fixes and local scheduling improvements.",
      "Home view and music adjustments.",
    ],
  },
  {
    date: "March 1–5, 2026",
    fixes: [
      "Ongoing polish and internal cleanup.",
      "Search canvas iteration, animation polish on live reply pills, dashboard fixes.",
    ],
  },
  {
    date: "February 2026",
    tags: ["Foundation"],
    features: [
      'Stella renamed and reorganized around agents, helper agents, actions, and skills.',
      "Discovery rewrite: selectable categories, signal collection, and seeded ephemeral memories.",
      "App Store / blueprints groundwork: first cut of how Stella publishes apps.",
      'Connect dialog initial setup; opens links in your browser instead of a tiny Electron window.',
      "Slack, Teams, Signal, Telegram, and Discord channel work.",
      "Multi-monitor and Windows native window-title detection.",
      "Scheduled-task support, health checks, and better interrupt / queue controls.",
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
      "First commits: shadcn UI scaffolding and the floating Stella surface.",
      "Initial agent, helper-agent, actions, and skills setup.",
      "Working indicator, live replies, conversation history, and thinking UI.",
      "Markdown colors, grain/noise/blur theming, and the original radial menu theme.",
      "First pass at memory search and cloud data structure.",
      "Wake-up of the discovery + onboarding flow.",
    ],
  },
];
