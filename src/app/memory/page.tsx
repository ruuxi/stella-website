import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  FileText,
  ListChecks,
  MessageCircle,
  Monitor,
  MoonStar,
  Pin,
  Search,
  Sparkles,
} from "lucide-react";
import { DownloadButton } from "@/components/download-button";
import { FooterLegalLinks } from "@/components/footer-legal-links";
import { homeFooterGroups } from "@/components/site-footer-groups";
import { SiteHeader } from "@/components/site-header";
import styles from "./memory.module.css";

export const metadata: Metadata = {
  title: "Memory",
  description:
    "How Stella remembers: a few things it always keeps in mind, notes it tidies up on its own time, and recall that speaks up only when it helps — all as plain files on your computer.",
  alternates: { canonical: "/memory" },
};

export default function MemoryPage() {
  return (
    <div className={`stella-page ${styles.page}`}>
      <SiteHeader />

      <main>
        <section className={`grid-shell ${styles.heroSection}`}>
          <div className={styles.hero}>
            <span className={styles.eyebrow}>
              <Brain size={15} strokeWidth={1.9} aria-hidden="true" />
              Memory
            </span>
            <h1>Stella remembers, the way a good friend would.</h1>
            <p>
              It holds on to the things that matter to you, sets the rest aside,
              and brings something up only when it actually helps. No setup, no
              digging.
            </p>
          </div>
        </section>

        {/* Lane 1 — Core memory */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={styles.row}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Pin size={14} strokeWidth={1.9} aria-hidden="true" />
                Always in mind
              </span>
              <h2>A few things it never forgets.</h2>
              <p>
                The essentials — who you are and how you like to work — stay
                pinned. Every conversation starts already knowing the basics, so
                you never have to reintroduce yourself.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.card}>
                  <span className={styles.cardIcon}>
                    <Pin size={18} />
                  </span>
                  <strong>the basics about you</strong>
                  <em>kept pinned</em>
                </div>
                <span className={styles.down} />
                <div className={styles.pile}>
                  <Sparkles size={13} aria-hidden="true" />
                  added to every conversation
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lane 2 — Dream pipeline */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={`${styles.row} ${styles["row--flip"]}`}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <MoonStar size={14} strokeWidth={1.9} aria-hidden="true" />
                Sleeps on it
              </span>
              <h2>It jots things down now, and tidies up later.</h2>
              <p>
                While you work, Stella quietly drops little notes into a pile.
                On its own time it goes back through them and folds everything
                into a clean, lasting memory — the way you make sense of a busy
                day after sleeping on it.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.inputs}>
                  <div className={styles.input}>
                    <MessageCircle size={15} />
                    your conversations
                  </div>
                  <div className={styles.input}>
                    <ListChecks size={15} />
                    finished work
                  </div>
                  <div className={styles.input}>
                    <Monitor size={15} />
                    what&apos;s on screen
                    <span className={styles.optTag}>optional</span>
                  </div>
                </div>
                <span className={styles.down} />
                <div className={styles.pile}>
                  <FileText size={13} aria-hidden="true" />
                  a pile of quick notes
                </div>
                <span className={styles.down} />
                <div className={styles.dream}>
                  <span className={styles.dreamIcon}>
                    <MoonStar size={22} />
                  </span>
                  <strong>Tidy up</strong>
                  <em>on its own time</em>
                </div>
                <span className={styles.down} />
                <div className={styles.files}>
                  <div className={styles.file}>
                    <FileText size={14} />
                    what you&apos;re working on
                  </div>
                  <div className={styles.file}>
                    <FileText size={14} />
                    the longer story
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lane 3 — Chronicle */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={styles.row}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Monitor size={14} strokeWidth={1.9} aria-hidden="true" />
                Optional
              </span>
              <h2>It can keep light notes on what&apos;s in front of you.</h2>
              <p>
                This one is off by default. If you choose to turn it on, Stella
                keeps a short, rolling note of what you&apos;ve been looking at
                — so &ldquo;that thing from earlier&rdquo; isn&apos;t a mystery.
                It stays on your computer, and you can switch it off any time.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.screen}>
                  <div className={styles.screenBar}>
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className={styles.screenBody}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <span className={styles.down} />
                <div className={styles.snippet}>
                  <span>earlier today</span>
                  <strong>reading about weekend trip ideas</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lane 4 — Recall */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={`${styles.row} ${styles["row--flip"]}`}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Search size={14} strokeWidth={1.9} aria-hidden="true" />
                Right when you need it
              </span>
              <h2>It speaks up only when a memory helps.</h2>
              <p>
                Stella doesn&apos;t pour everything it knows into every reply.
                When you say &ldquo;that&rdquo; or &ldquo;yesterday,&rdquo; it
                quietly looks up the one thing that fits and works it into the
                answer.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.bubble}>
                  <MessageCircle size={15} />
                  &ldquo;What was that thing from yesterday?&rdquo;
                </div>
                <span className={styles.down} />
                <div className={styles.memList}>
                  <div className={styles.memRow}>
                    <span className={styles.memDot} />
                    grocery list
                  </div>
                  <div className={`${styles.memRow} ${styles["memRow--hit"]}`}>
                    <Search size={13} />
                    the cabin you saved
                  </div>
                  <div className={styles.memRow}>
                    <span className={styles.memDot} />
                    flight prices
                  </div>
                </div>
                <span className={styles.down} />
                <div className={`${styles.bubble} ${styles["bubble--reply"]}`}>
                  <CheckCircle2 size={15} />
                  &ldquo;The lakeside cabin — want me to pull it back up?&rdquo;
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className={`grid-shell section-border ${styles.closingSection}`}>
          <div className={styles.closing}>
            <span className={styles.eyebrow}>
              <FileText size={14} strokeWidth={1.9} aria-hidden="true" />
              Yours, on your machine
            </span>
            <h2>It&apos;s just plain files on your computer.</h2>
            <p>
              No cloud memory, no mystery database, nothing kept on our servers.
              Your memory is a folder of text you can open, read, and delete
              whenever you want.
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
