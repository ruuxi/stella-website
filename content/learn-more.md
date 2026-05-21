# Learn More

This document is the source copy for the public Stella Learn More page. It replaces the old How It Works page and folds the old What's New page into one docs-style page.

## Verification Goal

Every public claim on this page should be checked against the current Stella repos, not memory alone.

- Verified website scope: `/Users/rahulnanda/projects/stella-website`
- Verified desktop/runtime scope: `/Users/rahulnanda/projects/stella`
- Verified backend scope: `/Users/rahulnanda/projects/stella-backend`
- Verified launcher scope: `/Users/rahulnanda/projects/stella-launcher`
- Verified mobile scope: `/Users/rahulnanda/projects/stella-mobile`

## Verified Facts

- Stella is a desktop app for macOS and Windows. The public launcher is a small installed app that sets up and starts the local desktop runtime.
- The launcher downloads the current desktop release archive and native helpers, writes the local environment file and launch script, installs what is needed, initializes the local repo state, and starts the desktop with `bun run electron:dev`.
- Stella is intentionally not a sealed black-box app. The installed desktop is a local repo-style runtime that can be inspected, edited, updated, and repaired.
- Stella has a single main chat surface. The orchestrator keeps the conversation going and delegates work to specialized agents instead of making the user manage many threads.
- Stella can use the computer, browser, files, Office-style documents, PDFs, spreadsheets, generated media, schedules, voice, dictation, connected apps, and local or managed models.
- Stella can change its own UI and behavior when the user asks. Renderer changes go through Vite HMR where possible, with a morph cover over visible refreshes. Deeper changes may require a reload or relaunch.
- Stella stores the normal desktop chat, files, memory, and runtime state locally on the user's computer.
- Stella's managed model provider routes prompts and responses through Stella infrastructure in transit, but does not persistently store prompt or response text for that provider path. It does keep usage metadata for billing, limits, and abuse prevention.
- BYOK and local model paths avoid the Stella managed model proxy for those model calls. Local credentials are stored locally in encrypted form.
- Anonymous managed-model usage is limited server-side with a salted hash of a device or client identifier plus request counts. Current retention for that anonymous usage row is seven days from last use.
- Phone chat to a paired desktop is not identical to local-only desktop chat. A signed-in phone sends the message through Stella's backend so the desktop can pick it up. The backend stores delivery state and request text needed to route, cancel, recover, and complete the remote turn. The desktop reply row used by the mobile app is short-lived, deleted after the phone acknowledges it, and otherwise expires after about two minutes.
- Messaging connectors such as Discord, Telegram, Slack, Teams, and Linq use pairing or connection rows. Link codes are short-lived and hashed. Some connector delivery rows are transient, and relayed media is scheduled for deletion after delivery windows.
- Optional cloud-backed features necessarily store the data they are built around. Examples: billing profiles, Stripe IDs, usage credit records, connected app metadata, public Store catalog data, installed Store state, cloud backups if enabled, mobile pairing records, device presence, and push tokens.

## Public Page Copy

### Hero

# Learn More

Stella is a private, open-source desktop app that gives you one ongoing chat for your computer. Ask once, keep talking, and Stella figures out which agent, app, file, browser, model, or tool should handle the work.

The unusual part is not just that Stella can use your computer. It is that the desktop app itself can change. Stella can learn your preferences, adjust the interface, add workflows, and turn the app into something closer to your own operating space.

### What Stella Is

Stella is a desktop assistant for macOS and Windows. It lives with your files, apps, browser, and local state, so it can help with the real work on your machine instead of only answering questions in a web tab.

You can use Stella for normal assistant work: research, writing, spreadsheets, PDFs, Word documents, browser tasks, computer control, image generation, video and 3D workflows, media prompts, scheduling, reminders, dictation, realtime voice, and connected apps. Those capabilities are table stakes now. Stella's bigger bet is that all of this belongs in one personal desktop app, one chat, and one interface that can keep adapting.

### One Chat, Many Agents

Most agent products make you choose a mode, start a new thread, pick a specialist, then remember where everything went. Stella is built around one continuous chat. You keep talking in the same place.

Behind the scenes, Stella can split work into smaller jobs, run specialized agents, keep track of active threads, and bring the result back into the conversation. The point is simple: you should not have to become a project manager for your assistant.

### What Stella Can Do

**Use your computer.** Stella can inspect your screen, click, type, open apps, navigate windows, and work with what is actually in front of you.

**Use the web.** Stella can browse, search, read pages, fill forms, and use browser context when it helps.

**Work with files.** Stella can read, write, organize, summarize, and transform local files, including documents, spreadsheets, PDFs, presentations, images, and generated outputs.

**Create media.** Stella can help make images, videos, audio, 3D assets, small apps, games, mockups, and visual artifacts. Generated work opens in the display sidebar instead of cluttering the chat.

**Listen and speak.** Stella supports in-app dictation, OS-wide dictation, read-aloud, and realtime voice. Wake-word style voice activation is optional, not a requirement.

**Run routines.** Stella can create reminders, recurring check-ins, scheduled work, and local automations from plain English.

**Connect apps.** Stella can connect to services and messaging apps where supported, including mobile, Discord, Telegram, Slack, Teams, Linq, Google Workspace, and Store-backed integrations.

**Use the model you want.** You can use Stella's managed model provider for convenience, bring your own provider keys, use local models, use OpenRouter-style model choices where supported, or select Claude Code as the engine for the assistant runtime.

### Ways To Reach Stella

**Full desktop window.** The main Stella app has chat, display, settings, history, Store, media, files, and everything else in one place.

**Quick access.** Stella has desktop entry points for capture, chat, add-context, and voice so you can bring Stella into the app or page you are already using.

**Mini window.** A smaller Stella surface can stay nearby for quick asks without taking over your screen.

**Voice and dictation.** You can dictate into Stella or, when enabled, into other apps. Realtime voice is for talking to Stella in a live back-and-forth.

**Phone.** The mobile app can pair with your desktop. When paired, your phone is another way to message the Stella running on your computer.

**Messaging apps.** Supported connectors let you message Stella from apps such as Discord, Telegram, Slack, Teams, and Linq. These routes depend on pairing, connection settings, and the desktop being available for full desktop-powered execution.

### Privacy In Plain English

Stella is local-first. Your normal desktop chat history, files, memories, generated local artifacts, and app state live on your computer. We do not keep your desktop conversations or files on our servers by default.

Some features need a backend. Sign-in, billing, plan limits, managed model access, connected app setup, mobile pairing, Store catalog data, push notifications, and optional cloud features all require small server-side records. The important boundary is that Stella does not need a cloud copy of your whole desktop life to work.

### What We Store

**Account and billing records.** We store the account identity needed for sign-in, billing profile state, Stripe customer and subscription references, usage credit records, and invoice or payment metadata needed to run paid plans.

**Usage metadata.** For managed model calls, we store usage records such as owner ID, model, agent type, token counts, duration, success or failure, estimated cost, billing plan, and timestamps. This is for billing, limits, reliability, and abuse prevention.

**Anonymous limit counters.** For unsigned preview usage, we store a salted hash of the device or client identifier, request count, first request time, and last request time. Current retention is seven days after last use.

**Device and pairing metadata.** We store device IDs, device names where provided, platform, presence timestamps, mobile pairing records, pairing secret hashes, mobile push tokens, and bridge registration URLs so a phone can reach the paired desktop.

**Connected app metadata.** We store the minimum connection records needed to know which account is linked to which Stella user and provider. Some connection secrets are encrypted. Short-lived link codes are hashed and expire quickly.

**Remote delivery state.** When you message Stella from a paired phone or messaging connector, the backend may store the request text, delivery metadata, request state, and connector routing information so the desktop can claim the work, cancel it, complete it, and deliver the reply. Mobile desktop replies are short-lived: they are deleted after the phone acknowledges them and otherwise expire after about two minutes.

**Optional cloud content.** If you enable cloud-backed features such as backups, shared Store publishing, social or collaboration surfaces, or other hosted features, those features store the data required to provide them.

### What We Do Not Store By Default

- Your local desktop files.
- Your normal local desktop chat database.
- Your local memory markdown and runtime state.
- Your local provider API keys.
- A persistent copy of managed-model prompts and responses for the Stella Provider path.
- BYOK model traffic, when the model call goes directly from your device to your provider.

### Models And Providers

Stella has two model paths.

The simple path is Stella Provider. It is managed for convenience, so you can install the app and start using strong models without setting up accounts everywhere. Requests pass through Stella's infrastructure in transit so billing and limits can work, but prompt and response text is not persistently stored for that model path.

The private-control path is bring your own provider or local models. You can add your own provider credentials, use local runtimes, and use Claude Code directly as the assistant engine. In those paths, Stella is acting as the desktop app and runtime you control, not as the model vendor.

### The Technical Install Model

Stella ships through a launcher. The launcher is the installed wrapper that handles setup, updates, recovery, and startup.

The desktop app itself is a local runtime. The launcher downloads the platform desktop release archive and native helpers, writes `.env.local`, creates a launch script, installs dependencies as needed, initializes the local Git state, and launches the desktop with `bun run electron:dev`.

That is intentional. Stella is open source, inspectable, and changeable. The app can update itself, but you can also inspect the repo, keep your local changes, and recover from bad self-changes.

### How Self-Change Works

When you ask Stella to change the app, an agent edits the local desktop code. Stella tracks the files involved, pauses or coordinates live updates, then applies the visible change through Vite HMR when possible.

If the change affects normal renderer code, Stella can often update the UI in place. If the change affects routes, shell structure, config, dependencies, native helpers, or deeper runtime code, Stella may need a reload or relaunch.

The morph overlay is the visual cover for this. It captures and covers the app while the new UI settles, then reveals the result so the change feels intentional rather than like a broken refresh.

If a self-change breaks startup, the launcher can show a recovery view and, when the latest commit is an agent-authored self-change, offer an undo path.

### What's New

#### The desktop app feels more like one continuous workspace

Recent updates cleaned up the chat surface, activity history, display sidebar, canvas previews, model picker, settings, Store, and embedded web views. The experience is moving away from scattered panes and toward one continuous desktop workspace.

#### Stella can reach more places

Mobile pairing, push updates, messaging connectors, Google sign-in, Google Workspace connections, native integrations, and Store-backed integrations have all been expanded. The goal is to make Stella reachable from your desktop, phone, and the apps you already use without turning those apps into the source of truth.

#### Voice, dictation, and media got stronger

Stella added read-aloud, realtime voice options, OS-wide dictation polish, generated image galleries, music generation, video/model updates, and better media previews in the display sidebar.

#### The app can change itself with less disruption

Self-mod updates, HMR handling, morph transitions, update checks, launcher recovery, and undo paths have all been tightened so Stella can change without making the app feel fragile.

#### Privacy and billing moved into clearer boundaries

Recent backend work tightened anonymous limits, plan usage checks, paid media gates, BYOK escape hatches, connector storage, mobile delivery cleanup, and cloud backup subscription gating. The app should be honest about what is local, what is routed, what is optional, and what is stored for billing or delivery.

#### Model choice got more practical

Stella now has a simpler composer model picker for normal use, more detailed model settings for advanced users, Stella managed defaults, bring-your-own provider options, local model support, OpenRouter-style inventory where supported, and Claude Code as an engine option.

### Short Positioning

Stella is not just another chat box. It is a private, open-source desktop app that can use your computer, keep one continuous conversation, and reshape its own interface around how you work.
