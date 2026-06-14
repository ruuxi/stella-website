import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CommandBox, CopyBox } from "./command-box";
import { MorphEmbed } from "./morph-embed";
import "./claude-build.css";

export const metadata: Metadata = {
  title: "Claude Build Day",
  description:
    "Set up a local copy of Stella, the desktop app that redesigns itself. One command clones the app and its site, installs everything, and launches both.",
  alternates: { canonical: "/claude-build" },
};

const SETUP_COMMAND =
  "curl -fsSL https://raw.githubusercontent.com/ruuxi/stella/claude-redesign/setup.sh | bash";

const CLAUDE_INSTRUCTIONS = `Set up and run Stella for me, a self-modifying desktop app.

1. Clone into my home folder:
   git clone -b claude-redesign https://github.com/ruuxi/stella ~/stella
   git clone -b master https://github.com/ruuxi/stella-website ~/stella-website

2. Write ~/stella/.env.local:
   CONVEX_DEPLOYMENT=dev:impartial-crab-34
   VITE_CONVEX_URL=https://impartial-crab-34.convex.cloud
   VITE_CONVEX_SITE_URL=https://impartial-crab-34.convex.site
   STELLA_SELF_MOD_HMR_MODE=deferred

3. Write ~/stella/desktop/.env.local:
   VITE_CONVEX_URL=https://impartial-crab-34.convex.cloud
   VITE_CONVEX_SITE_URL=https://impartial-crab-34.convex.site
   VITE_SITE_URL=http://localhost:57314/
   VITE_TWITCH_EMOTE_TWITCH_ID=40934651
   STELLA_STORE_WEB_URL=http://localhost:3000/store

4. Write ~/stella-website/.env.local:
   NEXT_PUBLIC_CONVEX_URL=https://impartial-crab-34.convex.cloud
   NEXT_PUBLIC_CONVEX_SITE_URL=https://impartial-crab-34.convex.site

5. Run \`bun install\` in both ~/stella and ~/stella-website.

6. Start the website in the background: from ~/stella-website run \`bun run dev\` (it serves http://localhost:3000).

7. Launch the desktop app: from ~/stella run \`bun run electron:dev\`, then tell me when the window opens.

Requires macOS, git, and bun (https://bun.sh).`;

export default function ClaudeBuildPage() {
  return (
    <div className="cb-page">
      <main className="cb-main">
        <Link href="/" className="cb-back">
          <ArrowLeft size={15} />
          Back to Stella
        </Link>

        <p className="cb-eyebrow">Claude Build Day</p>
        <h1 className="cb-title">Try Stella locally</h1>
        <p className="cb-lede">
          Stella is a personal desktop app whose interface rewrites itself. Open
          the Store, install a new look or tool, and watch the whole app morph in
          place. One command sets up a local copy so you can try it end to end.
        </p>

        <p className="cb-section-label">See it redesign itself</p>
        <MorphEmbed src="/morph/montage.html" />
        <p className="cb-hint">
          Each clip is the real Claude desktop app rebuilding itself from a
          single request &mdash; new look, new layout, new features.{" "}
          <a href="/morph/index.html" target="_blank" rel="noreferrer">
            Open the full gallery
          </a>
          .
        </p>

        <p className="cb-section-label">Have Claude set it up</p>
        <CopyBox text={CLAUDE_INSTRUCTIONS} />
        <p className="cb-hint">
          Paste this into Claude (Claude Code, or any coding agent) and it will
          clone, configure, and launch everything for you.
        </p>

        <p className="cb-section-label">Or run it yourself</p>
        <CommandBox command={SETUP_COMMAND} />
        <p className="cb-hint">
          Paste it into a terminal. First launch takes a few minutes while it
          installs and builds.
        </p>

        <p className="cb-section-label">What it does</p>
        <ol className="cb-steps">
          <li>
            Clones the Stella desktop app and its website into your home folder.
          </li>
          <li>
            Installs dependencies and writes local config. It points at a shared
            dev backend, so there are no keys or accounts to set up.
          </li>
          <li>
            Starts the website on localhost:3000 and launches the desktop app.
          </li>
        </ol>

        <p className="cb-section-label">Before you run</p>
        <ul className="cb-reqs">
          <li>macOS recommended</li>
          <li>git</li>
          <li>
            <a href="https://bun.sh" target="_blank" rel="noreferrer">
              bun
            </a>
          </li>
        </ul>

        <p className="cb-section-label">Once it opens</p>
        <ul className="cb-try">
          <li>Open the Store from the workspace panel on the right.</li>
          <li>
            Install a redesign, try Classic Mac 1984 or Sunset Drive, and watch
            the app morph into it.
          </li>
          <li>
            Changed your mind? Hover a row under Recents in the sidebar and hit
            Undo to revert it instantly.
          </li>
        </ul>

        <p className="cb-foot">
          Source:{" "}
          <a
            href="https://github.com/ruuxi/stella/tree/claude-redesign"
            target="_blank"
            rel="noreferrer"
          >
            stella
          </a>{" "}
          and{" "}
          <a
            href="https://github.com/ruuxi/stella-website"
            target="_blank"
            rel="noreferrer"
          >
            stella-website
          </a>
          . Everything is open source.
        </p>
      </main>
    </div>
  );
}
