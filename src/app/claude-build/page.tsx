import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CommandBox } from "./command-box";
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

        <p className="cb-section-label">Run this</p>
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
