"use client";

import {
  ArrowUpRight,
  Bot,
  Check,
  FileText,
  Mic,
  Monitor,
  MousePointer2,
  Search,
  Smartphone,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import {
  MobilePhoneVisual,
  type Platform,
} from "@/components/product-demos/mobile-showcase";
import { DownloadButton } from "@/components/download-button";
import { HomeChatMock } from "@/components/home-chat-mock";
import { FileGlyph, type FileKind } from "@/components/home-file-icons";
import { StellaAnimation } from "@/components/stella-animation/stella-animation";
import styles from "./home-stripe-sections.module.css";

const browserRows = [
  ["Luna Cucina", "7:30 PM", "4.8"],
  ["June Table", "7:45 PM", "4.6"],
  ["Bar Mira", "8:00 PM", "4.7"],
];

const computerActions = [
  ["snapshot", "Mail", "@e12 Reply"],
  ["click", "Mail", "@e12"],
  ["inserttext", "Mail", "draft"],
  ["snapshot", "Calendar", "@e4"],
];

const browserCommands = [
  ["open", "opentable.com/r/luna-cucina"],
  ["snapshot -i", "@e14 7:30 PM"],
  ["click", "@e14"],
  ["wait", "Reservation held"],
];

const mailMessages = [
  ["Dinner confirmation", "Saturday, 7:30 PM"],
  ["School newsletter", "Field trip form attached"],
  ["Receipt from Market Lane", "Total: $82.14"],
];

const dictationWaveBars = Array.from({ length: 22 }, (_, index) => index);
const compactWaveBars = Array.from({ length: 16 }, (_, index) => index);

const documentArtifacts: { kind: FileKind; title: string; meta: string }[] = [
  { kind: "xlsx", title: "Grocery compare.xlsx", meta: "Spreadsheet · 3 stores" },
  { kind: "docx", title: "Weekend plan.docx", meta: "Document · 1 page" },
  { kind: "pptx", title: "Family recap.pptx", meta: "Slides · 6 slides" },
  { kind: "pdf", title: "school-form.pdf", meta: "PDF · 3 pages" },
];

const spreadsheetRows = [
  ["Market Lane", "$82", "18 min"],
  ["Aldi", "$74", "22 min"],
  ["Target", "$89", "12 min"],
];

const phoneSurfaces: {
  platform: Platform;
  label: string;
  route: string;
  convoIndex: number;
}[] = [
  {
    platform: "imessage",
    label: "iMessage",
    route: "Text message",
    convoIndex: 0,
  },
  {
    platform: "telegram",
    label: "Telegram",
    route: "Telegram bot",
    convoIndex: 2,
  },
  {
    platform: "discord",
    label: "Discord",
    route: "Discord bot",
    convoIndex: 1,
  },
  {
    platform: "stella",
    label: "Stella app",
    route: "Computer tab",
    convoIndex: 0,
  },
];

const phoneRelaySteps = [
  "phone message",
  "remote turn",
  "paired desktop",
  "reply delivered",
];

const runtimePillars = [
  {
    value: "Local",
    label: "Files, conversations, and memory stay on the computer.",
  },
  {
    value: "Open",
    label: "Runtime, prompts, skills, and UI are editable.",
  },
  {
    value: "One",
    label: "Every surface routes back to the same ongoing Stella.",
  },
  {
    value: "Any",
    label: "Chat, browser, phone, voice, files, and computer use connect.",
  },
];

const runtimeLayers = [
  ["Memory", "Markdown notes, skills, and durable preferences"],
  ["Agents", "Background work, Dream, Chronicle, and scheduled tasks"],
  ["Tools", "Computer use, browser use, Office, media, and voice"],
  ["Surfaces", "Desktop, mini window, phone, Discord, and Telegram"],
];

const integrationPaths = [
  {
    title: "Open and ask",
    body: "Zero setup for normal use. Start with the desktop app and keep one ongoing conversation.",
    href: "/learn-more",
  },
  {
    title: "Bring your stack",
    body: "Use managed access, your own provider keys, local models, or Claude Code where supported.",
    href: "/pricing",
  },
  {
    title: "Install what others build",
    body: "Store-backed integrations and shared add-ons can extend Stella without changing the core app by hand.",
    href: "/store",
  },
  {
    title: "Change the app itself",
    body: "Runtime, prompts, skills, UI, and workflows are editable because Stella is open source.",
    href: "https://github.com/ruuxi/stella",
    external: true,
  },
];

const workflowStories = [
  {
    title: "A parent clearing the Saturday pileup.",
    body: "Compare groceries, read the school PDF, hold a dinner reservation, and text the plan from the same thread.",
    surfaces: ["Chat", "Browser", "PDF", "Phone"],
  },
  {
    title: "A freelancer turning receipts into admin.",
    body: "Stella reads mail, builds a spreadsheet, drafts the follow-up, and schedules a reminder before the deadline.",
    surfaces: ["Computer use", "Excel", "Dictation", "Reminders"],
  },
  {
    title: "A student turning research into a deck.",
    body: "Open the downloaded PDF, summarize the useful pages, make slides, and keep the sources in the workspace panel.",
    surfaces: ["Browser", "PDF", "PowerPoint", "Workspace"],
  },
  {
    title: "A creator assembling a weekly drop.",
    body: "Use voice notes, generated media, Store add-ons, and background agents without losing the main conversation.",
    surfaces: ["Voice", "Media", "Store", "Agents"],
  },
];

const updateCards = [
  {
    kind: "phone",
    topic: "Mobile and connectors",
    title: "Phone messages can reach the Stella running on your desktop.",
    body: "iMessage, Telegram, Discord, and the mobile app route work back to the paired computer when it is online.",
    href: "/learn-more",
  },
  {
    kind: "files",
    topic: "Files and previews",
    title: "Word, Excel, PowerPoint, PDFs, and generated outputs stay visible.",
    body: "Stella can create, summarize, transform, and reopen artifacts in chat or the workspace panel.",
    href: "/docs/media",
  },
  {
    kind: "voice",
    topic: "Voice and scheduling",
    title: "Dictation, realtime voice, reminders, and recurring tasks are built in.",
    body: "Use Stella by speaking, typing, or scheduling work for later without leaving the ongoing conversation.",
    href: "/learn-more/whats-new",
  },
  {
    kind: "selfmod",
    topic: "Self-modifying app",
    title: "The interface, skills, prompts, and workflows can change.",
    body: "Ask for a new sidebar app, shortcut, look, or workflow, and Stella can build it into itself.",
    href: "https://github.com/ruuxi/stella",
    external: true,
  },
];

export function HomeStripeSections() {
  return (
    <section className={`grid-shell section-border ${styles.solutions}`}>
      <div className={styles.sectionIntro}>
        <p className={styles.kicker}>Modular personal software</p>
        <h2>Every Stella surface, working as one system.</h2>
        <p>
          One assistant reaches your chat, browser, files, voice, phone, and
          desktop. Each surface stays familiar, but the work flows through the
          same Stella running on your computer.
        </p>
      </div>

      <div className={styles.productGrid}>
        <article className={`${styles.productCard} ${styles.chatCard}`}>
          <div className={styles.cardCopy}>
            <span className={styles.productEyebrow}>
              <Bot size={15} strokeWidth={1.8} aria-hidden="true" />
              Conversation
            </span>
            <h3>One chat can run several jobs at once.</h3>
            <p>
              Replies stream in while background work stays visible. Stella keeps
              moving through independent tasks in the same ongoing chat.
            </p>
          </div>
          <HomeChatMock />
        </article>

        <article className={`${styles.productCard} ${styles.computerCard}`}>
          <div className={styles.cardCopy}>
            <span className={styles.productEyebrow}>
              <Monitor size={15} strokeWidth={1.8} aria-hidden="true" />
              Computer use
            </span>
            <h3>Stella can drive your Mac in the background.</h3>
            <p>
              Let Stella move through real app windows while you keep working,
              from calendars and mail to the files already on your machine.
            </p>
          </div>
          <div className={styles.computerMock} aria-hidden="true">
            <div className={styles.menuBar}>
              <span className={styles.menuApple} />
              <b>Mail</b>
              <span>File</span>
              <span>Edit</span>
              <span>View</span>
              <span>Message</span>
              <span className={styles.menuTime}>10:42 AM</span>
            </div>
            <div className={styles.desktopBody}>
              <div className={`${styles.appWindow} ${styles.mailWindow}`}>
                <div className={styles.windowChrome}>
                  <span>Mail — Inbox</span>
                </div>
                <div className={styles.mailSidebar}>
                  <span data-active="true">Inbox</span>
                  <span>Travel</span>
                  <span>Receipts</span>
                  <span>Family</span>
                </div>
                <div className={styles.mailList}>
                  {mailMessages.map(([title, detail], index) => (
                    <div
                      className={styles.mailRow}
                      data-active={index === 0 || undefined}
                      key={title}
                    >
                      <strong>{title}</strong>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.mailPreview}>
                  <strong>Reservation confirmed</strong>
                  <span>Table for two at Luna Cucina, Saturday 7:30 PM.</span>
                  <button type="button" data-ref="@e12">
                    Reply
                  </button>
                </div>
              </div>

              <div className={styles.computerHud}>
                <div className={styles.computerHudHead}>
                  <span className={styles.computerHudDot} />
                  <strong>stella-computer</strong>
                  <em>isolated session</em>
                </div>
                <ol className={styles.computerHudSteps}>
                  {computerActions.map(([action, target, detail], index) => (
                    <li
                      key={`${action}-${target}-${detail}`}
                      data-current={index === computerActions.length - 1 || undefined}
                    >
                      <b>{action}</b>
                      <span>
                        {target} <em>{detail}</em>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className={styles.dock}>
                <span data-app="finder" />
                <span data-app="mail" />
                <span data-app="calendar" />
                <span data-app="browser" />
                <span data-app="notes" />
                <span data-app="files" />
              </div>
              <MousePointer2 className={styles.computerCursor} size={20} />
            </div>
          </div>
        </article>

        <article className={`${styles.productCard} ${styles.browserCard}`}>
          <div className={styles.cardCopy}>
            <span className={styles.productEyebrow}>
              <Search size={15} strokeWidth={1.8} aria-hidden="true" />
              Browser use
            </span>
            <h3>Research happens inside a full browser context.</h3>
            <p>
              Stella can compare pages, read tables, and carry the result back
              into the same conversation.
            </p>
          </div>
          <div className={styles.browserMock} aria-hidden="true">
            <div className={styles.browserTop}>
              <span className={styles.browserTraffic} />
              <div className={styles.browserTabs}>
                <span data-active="true">OpenTable</span>
                <span>Maps</span>
                <span>Reviews</span>
              </div>
              <div className={styles.browserAddress}>opentable.com/r/luna-cucina</div>
              <span className={styles.browserExtensionIcon} />
            </div>
            <div className={styles.browserContent}>
              <main>
                <div className={styles.restaurantNav}>
                  <span>OpenTable</span>
                  <span>Restaurants</span>
                  <span>Experiences</span>
                  <span>Rewards</span>
                </div>
                <div className={styles.restaurantHero}>
                  <span>Italian · West Village</span>
                  <strong>Luna Cucina</strong>
                  <em>4.8 rating · near the theater</em>
                </div>
                <div className={styles.browserSearchBar}>
                  <span>Party of 2</span>
                  <span>Saturday</span>
                  <span>After 7 PM</span>
                </div>
                {browserRows.map(([name, time, rating]) => (
                  <div
                    className={styles.flightRow}
                    data-ref={time === "7:30 PM" ? "@e14" : undefined}
                    key={name}
                  >
                    <span>{name}</span>
                    <strong>{time}</strong>
                    <em>{rating}</em>
                  </div>
                ))}
              </main>
              <aside className={styles.browserBookingPanel}>
                <strong>Reserve a table</strong>
                <span>Party of 2</span>
                <span>Saturday</span>
                <button type="button">Find a time</button>
              </aside>
              <div className={styles.browserAutomationConsole}>
                <strong>stella-browser</strong>
                {browserCommands.map(([command, detail], index) => (
                  <span
                    key={`${command}-${detail}`}
                    style={{ ["--command-index" as string]: index }}
                  >
                    <b>{command}</b>
                    <em>{detail}</em>
                  </span>
                ))}
              </div>
              <MousePointer2 className={styles.browserCursor} size={21} />
            </div>
          </div>
        </article>

        <article className={`${styles.productCard} ${styles.dictationCard}`}>
          <div className={styles.cardCopy}>
            <span className={styles.productEyebrow}>
              <Volume2 size={15} strokeWidth={1.8} aria-hidden="true" />
              Voice and dictation
            </span>
            <h3>Talk to Stella, or dictate into any app.</h3>
            <p>
              Speak naturally, or drop a compact dictation bar over the message,
              note, or document you are already writing.
            </p>
          </div>
          <div className={styles.dictationMock} aria-hidden="true">
            <div className={styles.voiceModeRail}>
              <span data-active="true">Dictation</span>
              <span>Voice agent</span>
            </div>
            <div className={styles.dictationApp}>
              <div className={styles.dictationAppBar}>
                <i />
                <i />
                <i />
                <strong>Mail - New message</strong>
              </div>
              <div className={styles.dictationAppBody}>
                <div className={styles.dictationField}>
                  <span>To</span>
                  <strong>maya@example.com</strong>
                </div>
                <div className={styles.dictationField}>
                  <span>Subject</span>
                  <strong>Saturday plans</strong>
                </div>
                <p className={styles.dictationTyped}>
                  Saturday still works. Stella found a table near the theater,
                  and I can bring the tickets.
                </p>
                <em className={styles.dictationCaret} />
              </div>
              <div className={styles.dictationOverlay}>
                <Mic size={15} strokeWidth={2} />
                <span className={styles.dictationWaveform}>
                  {dictationWaveBars.map((index) => (
                    <i
                      key={index}
                      style={{ ["--wave-index" as string]: index }}
                    />
                  ))}
                </span>
                <strong>0:04</strong>
                <button type="button" aria-label="Cancel dictation">
                  <X size={13} strokeWidth={2.2} />
                </button>
                <button type="button" aria-label="Stop dictation and transcribe">
                  <Check size={13} strokeWidth={2.2} />
                </button>
              </div>
            </div>
            <div className={styles.inAppDictationRow}>
              <Mic size={13} strokeWidth={2} />
              <span className={styles.compactWaveform}>
                {compactWaveBars.map((index) => (
                  <i
                    key={index}
                    style={{ ["--wave-index" as string]: index }}
                  />
                ))}
              </span>
              <strong>0:09</strong>
              <button type="button" aria-label="Send dictated message">
                <ArrowUpRight size={13} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </article>

        <article className={`${styles.productCard} ${styles.docsCard}`}>
          <div className={styles.cardCopy}>
            <span className={styles.productEyebrow}>
              <FileText size={15} strokeWidth={1.8} aria-hidden="true" />
              Documents
            </span>
            <h3>Word, Excel, PowerPoint, and PDFs are first-class work.</h3>
            <p>
              Stella can produce files, summarize them, and show the result in
              the workspace panel or chat artifact surface.
            </p>
          </div>
          <div className={styles.documentMock} aria-hidden="true">
            <div className={styles.officeArtifactPanel}>
              <aside className={styles.officeArtifactList}>
                {documentArtifacts.map((artifact, index) => (
                  <div
                    className={styles.officeArtifactRow}
                    data-active={index === 0 || undefined}
                    key={artifact.title}
                  >
                    <span className={styles.officeArtifactIcon}>
                      <FileGlyph kind={artifact.kind} />
                    </span>
                    <div>
                      <strong>{artifact.title}</strong>
                      <em>{artifact.meta}</em>
                    </div>
                  </div>
                ))}
              </aside>
              <div className={styles.officePreviewPanel}>
                <div className={styles.officePreviewToolbar}>
                  <span className={styles.officePreviewIcon}>
                    <FileGlyph kind="xlsx" />
                  </span>
                  <div>
                    <strong>Grocery compare.xlsx</strong>
                    <em>Updated just now</em>
                  </div>
                  <button type="button" aria-label="Save to files">
                    <Check size={13} strokeWidth={2.2} />
                  </button>
                </div>
                <div className={styles.sheetPreview}>
                  <div className={styles.sheetFormula}>
                    <b>fx</b>
                    <span>=MIN(B2:B4) → cheapest is Aldi at $74</span>
                  </div>
                  <div className={styles.sheetGrid}>
                    <div className={styles.sheetColHeader}>
                      <i />
                      <span>A</span>
                      <span>B</span>
                      <span>C</span>
                    </div>
                    <div className={styles.sheetHeaderRow}>
                      <i>1</i>
                      <span>Store</span>
                      <span>Total</span>
                      <span>Drive</span>
                    </div>
                    {spreadsheetRows.map((row, rowIndex) => (
                      <div
                        className={styles.sheetRow}
                        data-best={rowIndex === 1 || undefined}
                        key={row[0]}
                      >
                        <i>{rowIndex + 2}</i>
                        {row.map((cell, cellIndex) => (
                          <span key={`${row[0]}-${cellIndex}`}>{cell}</span>
                        ))}
                      </div>
                    ))}
                    {[5, 6, 7].map((rowNumber) => (
                      <div className={styles.sheetRow} key={rowNumber}>
                        <i>{rowNumber}</i>
                        <span />
                        <span />
                        <span />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className={`${styles.productCard} ${styles.phoneCard}`}>
          <div className={styles.cardCopy}>
            <span className={styles.productEyebrow}>
              <Smartphone size={15} strokeWidth={1.8} aria-hidden="true" />
              Phone and connectors
            </span>
            <h3>Your phone reaches the same Stella on your computer.</h3>
            <p>
              iMessage, Telegram, Discord, and the Stella app can all route to
              your paired desktop when it is online.
            </p>
          </div>
          <div className={styles.phoneMock} aria-hidden="true">
            <div className={styles.phoneRelayHeader}>
              <div>
                <strong>Phone access</strong>
                <span>Same Stella, routed to the paired desktop.</span>
              </div>
              <div className={styles.phoneRelayStatus}>
                <span aria-hidden="true">
                  <StellaAnimation
                    width={16}
                    height={8}
                    maxDpr={1}
                    frameSkip={1}
                    initialBirthProgress={1}
                  />
                </span>
                <b>Desktop online</b>
              </div>
            </div>

            <div className={styles.phoneSurfaceGrid}>
              {phoneSurfaces.map((surface, index) => (
                <div
                  className={styles.phoneSurface}
                  data-platform={surface.platform}
                  key={surface.platform}
                  style={{ ["--phone-index" as string]: index }}
                >
                  <MobilePhoneVisual
                    activeConvo={surface.convoIndex}
                    platform={surface.platform}
                  />
                  <div className={styles.phoneSurfaceLabel}>
                    <strong>{surface.label}</strong>
                    <span>{surface.route}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.phoneRelayStrip}>
              {phoneRelaySteps.map((step, index) => (
                <span
                  key={step}
                  style={{ ["--relay-index" as string]: index }}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>

      <section className={styles.workflowSection}>
        <div className={styles.sectionIntro}>
          <p className={styles.kicker}>For ordinary workflows</p>
          <h2>Built for work that does not fit one app.</h2>
          <p>
            Stella earns its place when a task crosses messages, files,
            websites, reminders, voice, and the desktop itself.
          </p>
        </div>
        <div className={styles.workflowGrid}>
          {workflowStories.map((story) => (
            <article className={styles.workflowCard} key={story.title}>
              <h3>{story.title}</h3>
              <p>{story.body}</p>
              <span className={styles.workflowSurfaces}>
                {story.surfaces.join("  ·  ")}
              </span>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.customIntro}>
        <p className={styles.kicker}>Self-modifying interface</p>
        <h2>Stella can stop looking like Stella.</h2>
        <p>
          These are not skins on the same chat window. They are different app
          shapes Stella could build around a person&apos;s taste and workflow,
          while keeping the same memory, tools, and local desktop runtime.
        </p>
      </div>

      <div className={styles.customGrid}>
        <article
          className={`${styles.customCard} ${styles.musicLayout}`}
          data-reference="Apple Music-inspired library"
        >
          <div className={styles.customCopy}>
            <span>Apple Music-inspired library</span>
            <h3>For playlist-minded planners who group life into mixes.</h3>
          </div>
          <div className={styles.customWindow}>
            <div className={styles.customChrome} />
            <div className={styles.musicShell}>
              <aside>
                <strong>Stella</strong>
                <span data-active="true">Listen Now</span>
                <span>Routines</span>
                <span>People</span>
                <span>Automations</span>
              </aside>
              <main>
                <div className={styles.musicHero}>
                  <span>Stella mix</span>
                  <strong>Saturday, sequenced</strong>
                  <em>Groceries, dinner, ride home</em>
                  <b>Run queue</b>
                </div>
                <div className={styles.musicShelf}>
                  <strong>Recently arranged</strong>
                  <span>Receipts</span>
                  <span>Trip ideas</span>
                  <span>Family plan</span>
                </div>
                <div className={styles.musicTiles}>
                  <span>Errands</span>
                  <span>Meals</span>
                  <span>Calls</span>
                </div>
              </main>
              <footer>
                <b />
                <span />
                <i />
              </footer>
            </div>
          </div>
        </article>

        <article
          className={`${styles.customCard} ${styles.gameLayout}`}
          data-reference="Xbox-inspired home"
        >
          <div className={styles.customCopy}>
            <span>Xbox-inspired home</span>
            <h3>
              For achievement-driven people who want tasks to feel like quests.
            </h3>
          </div>
          <div className={styles.customWindow}>
            <div className={styles.customChrome} />
            <div className={styles.gameShell}>
              <nav>
                <strong>Home</strong>
                <span>Missions</span>
                <span>Friends</span>
                <span>Library</span>
              </nav>
              <div className={styles.gameProfile}>
                <span>You</span>
                <b>Stella online</b>
              </div>
              <section>
                <div className={styles.gameHero}>
                  <span>Active mission</span>
                  <strong>Plan the weekend</strong>
                  <p>3 objectives running</p>
                </div>
                <div className={styles.gameTiles}>
                  <span>Flight prices</span>
                  <span>Dinner</span>
                  <span>Gift ideas</span>
                </div>
              </section>
            </div>
          </div>
        </article>

        <article
          className={`${styles.customCard} ${styles.docsLayout}`}
          data-reference="Notion-inspired database"
        >
          <div className={styles.customCopy}>
            <span>Notion-inspired database</span>
            <h3>
              For notebook people who think in pages, tables, and checklists.
            </h3>
          </div>
          <div className={styles.customWindow}>
            <div className={styles.customChrome} />
            <div className={styles.docsShell}>
              <aside>
                <span>Home wiki</span>
                <span>Travel</span>
                <span>Meal plan</span>
                <span>Receipts</span>
              </aside>
              <main>
                <div className={styles.docsToolbar}>
                  <h4>Lisbon planning</h4>
                  <span>Table</span>
                  <span>Timeline</span>
                </div>
                <div className={styles.docsTable}>
                  <span>Task</span>
                  <span>Status</span>
                  <span>Owner</span>
                  <b>Book hotel</b>
                  <i>Review</i>
                  <em>Stella</em>
                  <b>Check passport</b>
                  <i>Done</i>
                  <em>You</em>
                  <b>Find restaurants</b>
                  <i>Running</i>
                  <em>Stella</em>
                </div>
              </main>
            </div>
          </div>
        </article>

        <article
          className={`${styles.customCard} ${styles.linearLayout}`}
          data-reference="Linear-inspired queue"
        >
          <div className={styles.customCopy}>
            <span>Linear-inspired queue</span>
            <h3>For operators who want crisp queues and almost no decoration.</h3>
          </div>
          <div className={styles.customWindow}>
            <div className={styles.customChrome} />
            <div className={styles.linearShell}>
              <aside>
                <strong>Cycles</strong>
                <span>Inbox</span>
                <span>Active</span>
                <span>Backlog</span>
              </aside>
              <main>
                <div className={styles.linearHeader}>
                  <span>Personal ops</span>
                  <strong>12 tasks</strong>
                </div>
                <div className={styles.linearCommand}>
                  Ask Stella to triage the queue
                </div>
                {[
                  "Renew insurance",
                  "Send invoice",
                  "Compare flights",
                  "Archive receipts",
                ].map((item, index) => (
                  <div className={styles.linearIssue} key={item}>
                    <span>ST-{index + 12}</span>
                    <strong>{item}</strong>
                    <i />
                  </div>
                ))}
              </main>
            </div>
          </div>
        </article>

        <article
          className={`${styles.customCard} ${styles.studioLayout}`}
          data-reference="Ableton-inspired timeline"
        >
          <div className={styles.customCopy}>
            <span>Ableton-inspired timeline</span>
            <h3>For makers who see routines as tracks, clips, and levels.</h3>
          </div>
          <div className={styles.customWindow}>
            <div className={styles.customChrome} />
            <div className={styles.studioShell}>
              <aside>
                <span>Voice notes</span>
                <span>Meetings</span>
                <span>Tasks</span>
              </aside>
              <main>
                <div className={styles.studioTransport}>
                  <span>Voice take 03</span>
                  <b />
                  <b />
                  <b />
                </div>
                <div className={styles.studioTimeline}>
                  {Array.from({ length: 20 }).map((_, index) => (
                    <span key={index} data-long={index % 5 === 0 || undefined} />
                  ))}
                </div>
                <div className={styles.studioMixer}>
                  <b />
                  <b />
                  <b />
                  <b />
                </div>
              </main>
            </div>
          </div>
        </article>
      </div>

      <section className={styles.runtimeBackbone}>
        <div className={styles.runtimeCopy}>
          <p className={styles.kicker}>Local runtime</p>
          <h2>The backbone is the computer you already use.</h2>
          <p>
            Stella is not a separate SaaS workspace. The desktop runtime keeps
            memory, tools, generated files, phone routes, and background agents
            tied to the same local Stella.
          </p>
        </div>

        <div className={styles.runtimeStats}>
          {runtimePillars.map((pillar) => (
            <div className={styles.runtimeStat} key={pillar.value}>
              <strong>{pillar.value}</strong>
              <span>{pillar.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.runtimeMap} aria-hidden="true">
          <div className={styles.runtimeCore}>
            <span>
              <StellaAnimation
                width={34}
                height={18}
                maxDpr={1}
                frameSkip={1}
                initialBirthProgress={1}
              />
            </span>
            <strong>Stella desktop runtime</strong>
            <em>open source, local-first, self-modifying</em>
          </div>
          <div className={styles.runtimeLayerGrid}>
            {runtimeLayers.map(([title, description], index) => (
              <div
                className={styles.runtimeLayer}
                key={title}
                style={{ ["--runtime-index" as string]: index }}
              >
                <b>{title}</b>
                <span>{description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.extensibilitySection}>
        <div className={styles.extensibilityCopy}>
          <p className={styles.kicker}>Extensible by design</p>
          <h2>Use Stella as-is, connect more, or change the app itself.</h2>
          <p>
            Start with the desktop app, bring your own model stack when you
            need it, install Store-backed extensions, or ask Stella to edit the
            repo-level app.
          </p>
          <div className={styles.extensibilityLinks}>
            <a href="/learn-more">
              Learn more
              <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
            </a>
            <a
              href="https://github.com/ruuxi/stella"
              rel="noopener noreferrer"
              target="_blank"
            >
              View GitHub
              <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.extensibilityPanel}>
          <div className={styles.extensibilityTerminal}>
            <div>
              <span />
              <span />
              <span />
              <em>ask Stella to edit herself</em>
            </div>
            <code>
              <b>~/.stella/memories</b> — markdown memory and skills
            </code>
            <code>
              <b>runtime/home-seed/skills</b> — bundled capabilities
            </code>
            <code>
              <b>desktop/src/app</b> — the UI you are looking at
            </code>
            <code>
              <b>Store add-ons</b> — install what others build
            </code>
          </div>
          <div className={styles.extensibilityPaths}>
            {integrationPaths.map((path, index) => (
              <a
                className={styles.extensibilityPath}
                href={path.href}
                key={path.title}
                rel={path.external ? "noopener noreferrer" : undefined}
                style={{ ["--path-index" as string]: index }}
                target={path.external ? "_blank" : undefined}
              >
                <span>{`0${index + 1}`}</span>
                <strong>{path.title}</strong>
                <p>{path.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.updatesSection}>
        <div className={styles.updatesIntro}>
          <p className={styles.kicker}>What&apos;s happening</p>
          <h2>Stella is becoming a whole personal operating layer.</h2>
          <p>
            The public feature set already spans chat, documents, media, voice,
            scheduling, mobile routing, Store installs, social surfaces, and
            self-modification.
          </p>
        </div>

        <div className={styles.updateGrid}>
          {updateCards.map((card, index) => (
            <a
              className={styles.updateCard}
              data-featured={index === 0 || undefined}
              data-kind={card.kind}
              href={card.href}
              key={card.title}
              rel={card.external ? "noopener noreferrer" : undefined}
              target={card.external ? "_blank" : undefined}
            >
              <span className={styles.updateIcon} aria-hidden="true">
                {card.kind === "phone" ? (
                  <Smartphone size={18} strokeWidth={1.7} />
                ) : card.kind === "files" ? (
                  <FileText size={18} strokeWidth={1.7} />
                ) : card.kind === "voice" ? (
                  <Volume2 size={18} strokeWidth={1.7} />
                ) : (
                  <Sparkles size={18} strokeWidth={1.7} />
                )}
              </span>
              <span className={styles.updateTopic}>{card.topic}</span>
              <strong>{card.title}</strong>
              <p>{card.body}</p>
              <b>
                Learn more
                <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
              </b>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.readySection}>
        <div>
          <p className={styles.kicker}>Ready to get started?</p>
          <h2>Download Stella and give it your first real task.</h2>
          <p>
            Stella runs on macOS and Windows, with Windows still experimental.
            Your files, memory, and conversations stay on your computer by
            default.
          </p>
        </div>
        <div className={styles.readyActions}>
          <DownloadButton />
          <a href="/learn-more">
            See how it works
            <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </section>
    </section>
  );
}
