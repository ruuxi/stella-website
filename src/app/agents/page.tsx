import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AudioLines,
  Box,
  Cpu,
  Image as ImageIcon,
  KeyRound,
  Layers,
  Mic,
  MessageCircle,
  Music,
  Send,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { DownloadButton } from "@/components/download-button";
import { FooterLegalLinks } from "@/components/footer-legal-links";
import { homeFooterGroups } from "@/components/site-footer-groups";
import { SiteHeader } from "@/components/site-header";
import styles from "./agents.module.css";

export const metadata: Metadata = {
  title: "Agents",
  description:
    "You talk to one Stella. Behind the scenes she hands work to a team of helpers that run in the background, so your chat never freezes. Power her with Stella's own zero-setup models or bring your own.",
  alternates: { canonical: "/agents" },
};

export default function AgentsPage() {
  return (
    <div className={`stella-page ${styles.page}`}>
      <SiteHeader />

      <main>
        <section className={`grid-shell ${styles.heroSection}`}>
          <div className={styles.hero}>
            <span className={styles.eyebrow}>
              <Sparkles size={15} strokeWidth={1.9} aria-hidden="true" />
              Agents
            </span>
            <h1>One Stella. A whole team behind her.</h1>
            <p>
              You talk to one assistant. Behind the scenes, she quietly hands
              work to a team of helpers that run in the background — so you can
              keep going while things get done.
            </p>
          </div>
        </section>

        {/* One Stella */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={styles.row}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <MessageCircle size={14} strokeWidth={1.9} aria-hidden="true" />
                One conversation
              </span>
              <h2>You only ever talk to Stella.</h2>
              <p>
                No juggling a dozen bots. There&apos;s one chat, one assistant.
                Everything you ask goes to Stella, and she figures out who
                should do what — you just see her replies.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={`${styles.bubble} ${styles["bubble--you"]}`}>
                  &ldquo;plan my trip and draft the emails&rdquo;
                </div>
                <span className={styles.down} />
                <div className={styles.stella}>
                  <span className={styles.stellaIcon}>
                    <Sparkles size={18} />
                  </span>
                  <div className={styles.stellaText}>
                    <strong>Stella</strong>
                    <em>your one assistant</em>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Delegation */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={`${styles.row} ${styles["row--flip"]}`}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Users size={14} strokeWidth={1.9} aria-hidden="true" />
                Behind the scenes
              </span>
              <h2>She hands the work to helpers.</h2>
              <p>
                Instead of doing everything herself, Stella spins up little
                helpers for each job and sets them loose. Each one tackles its
                own task, then reports back to her when it&apos;s done.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.stella}>
                  <span className={styles.stellaIcon}>
                    <Sparkles size={18} />
                  </span>
                  <div className={styles.stellaText}>
                    <strong>Stella</strong>
                    <em>splits up the work</em>
                  </div>
                </div>
                <span className={styles.fan} />
                <div className={styles.branchRow}>
                  <span className={styles.helper}>
                    <Users size={14} />
                    research flights
                  </span>
                  <span className={styles.helper}>
                    <Users size={14} />
                    draft emails
                  </span>
                  <span className={styles.helper}>
                    <Users size={14} />
                    book a table
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Parallel / non-blocking */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={styles.row}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Layers size={14} strokeWidth={1.9} aria-hidden="true" />
                No waiting
              </span>
              <h2>Keep chatting while the work runs.</h2>
              <p>
                When Stella sends off a task, she doesn&apos;t sit and wait —
                and neither do you. Lots of jobs can run at the same time, and
                Stella tells you the moment each one is finished.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.runStack}>
                  <span className={styles.runRow}>
                    <span className={styles.runDot} />
                    research flights
                    <em>running</em>
                  </span>
                  <span className={styles.runRow}>
                    <span className={styles.runDot} />
                    draft emails
                    <em>running</em>
                  </span>
                  <span className={styles.runRow} data-done="true">
                    <span className={styles.runDot} />
                    book a table
                    <em>done</em>
                  </span>
                </div>
                <span className={styles.down} />
                <div className={`${styles.bubble} ${styles["bubble--you"]}`}>
                  <Send size={14} />
                  …and you keep typing
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Engines / BYOK / zero setup */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={`${styles.row} ${styles["row--flip"]}`}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Cpu size={14} strokeWidth={1.9} aria-hidden="true" />
                Any brain you like
              </span>
              <h2>Nothing to set up — or bring your own.</h2>
              <p>
                Out of the box, Stella runs on her own models. No keys, no
                accounts, no setup — just open the app and go. Prefer something
                else? Plug in Claude, Codex, Cursor, or your own key and Stella
                runs on that instead.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.engineGrid}>
                <span className={`${styles.engineTile} ${styles["engineTile--lead"]}`}>
                  <Sparkles size={18} />
                  Stella
                  <em>zero setup</em>
                </span>
                <span className={styles.engineTile}>
                  <Cpu size={16} />
                  Claude
                </span>
                <span className={styles.engineTile}>
                  <Cpu size={16} />
                  Codex
                </span>
                <span className={styles.engineTile}>
                  <Cpu size={16} />
                  Cursor
                </span>
                <span className={styles.engineTile}>
                  <KeyRound size={16} />
                  Your own key
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Built-in media */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={styles.row}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <ImageIcon size={14} strokeWidth={1.9} aria-hidden="true" />
                Built in
              </span>
              <h2>Pictures, voice, and more — included.</h2>
              <p>
                Ask Stella to make an image, a video, a song, or read something
                aloud, and she just does it. You can talk to her out loud, too.
                It all works on the house models, with nothing extra to wire up.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.chipCloud}>
                <span className={styles.chip}>
                  <ImageIcon size={14} />
                  Images
                </span>
                <span className={styles.chip}>
                  <Video size={14} />
                  Video
                </span>
                <span className={styles.chip}>
                  <Music size={14} />
                  Music
                </span>
                <span className={styles.chip}>
                  <AudioLines size={14} />
                  Sound
                </span>
                <span className={styles.chip}>
                  <Box size={14} />
                  3D
                </span>
                <span className={styles.chip}>
                  <Mic size={14} />
                  Talk to her
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className={`grid-shell section-border ${styles.closingSection}`}>
          <div className={styles.closing}>
            <span className={styles.eyebrow}>
              <Sparkles size={14} strokeWidth={1.9} aria-hidden="true" />
              One assistant, more done
            </span>
            <h2>Ask once. Let the team handle the rest.</h2>
            <p>
              You get the simplicity of a single assistant with the muscle of a
              whole crew working in the background — on your models or hers.
            </p>
            <div className={styles.closingCta}>
              <DownloadButton />
            </div>
          </div>
        </section>
      </main>

      <footer className="grid-shell site-footer section-border">
        <div className="footer-brand">
          <Link className="brand-mark brand-mark--footer" href="/">
            <Image src="/stella-logo.svg" alt="Stella" width={42} height={42} />
            <span className="brand-text">Stella</span>
          </Link>
          <FooterLegalLinks />
        </div>

        <div className="footer-columns">
          {homeFooterGroups.map((group) => (
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
                      <Link href={item.href}>{item.label}</Link>
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
