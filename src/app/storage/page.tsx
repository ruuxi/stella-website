import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Cloud,
  CloudOff,
  FileLock,
  HardDrive,
  Hash,
  Laptop,
  Lock,
  MessageSquare,
  Send,
  ShieldCheck,
  Smartphone,
  Upload,
  Users,
} from "lucide-react";
import { DownloadButton } from "@/components/download-button";
import { FooterLegalLinks } from "@/components/footer-legal-links";
import { homeFooterGroups } from "@/components/site-footer-groups";
import { SiteHeader } from "@/components/site-header";
import styles from "./storage.module.css";

export const metadata: Metadata = {
  title: "Storage",
  description:
    "Where your stuff lives: Stella keeps your conversations in a single file on your own computer, not on our servers. Backups are off by default, and the only things that leave are the ones you choose to send.",
  alternates: { canonical: "/storage" },
};

export default function StoragePage() {
  return (
    <div className={`stella-page ${styles.page}`}>
      <SiteHeader />

      <main>
        <section className={`grid-shell ${styles.heroSection}`}>
          <div className={styles.hero}>
            <span className={styles.eyebrow}>
              <ShieldCheck size={15} strokeWidth={1.9} aria-hidden="true" />
              Storage
            </span>
            <h1>Your stuff stays on your computer.</h1>
            <p>
              Stella keeps your conversations on your own machine, not on our
              servers. The only things that ever leave are the ones you choose
              to send.
            </p>
          </div>
        </section>

        {/* Local-first chat */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={styles.row}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <HardDrive size={14} strokeWidth={1.9} aria-hidden="true" />
                On your device
              </span>
              <h2>Your conversations live on your laptop.</h2>
              <p>
                Every chat is saved in a single file on your computer. We
                can&apos;t read it, because it never reaches us. The only time
                your words go out is to the AI that writes the reply.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.device}>
                  <div className={styles.deviceBar}>
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className={styles.deviceBody}>
                    <span className={styles.deviceIcon}>
                      <FileLock size={16} />
                    </span>
                    <div className={styles.deviceText}>
                      <strong>your chat</strong>
                      <em>one file on this computer</em>
                    </div>
                  </div>
                </div>
                <span className={styles.down} />
                <div className={styles.crossed}>
                  <CloudOff size={14} />
                  nothing on our servers
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Backups */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={`${styles.row} ${styles["row--flip"]}`}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Cloud size={14} strokeWidth={1.9} aria-hidden="true" />
                Backups
              </span>
              <h2>Backups stay off until you ask.</h2>
              <p>
                If you ever want a safety copy, you can turn backups on. They
                get locked tight before they leave your computer, and they come
                with a paid plan — so nothing is ever backed up unless you opt
                in.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.toggle}>
                  <span className={styles.toggleLabel}>
                    <Cloud size={15} />
                    Backups
                  </span>
                  <span className={styles.switch} data-state="off">
                    <i />
                  </span>
                </div>
                <span className={styles.toggleHint}>off until you turn it on</span>
                <span className={styles.down} />
                <div className={styles.node}>
                  <span className={styles.nodeIcon}>
                    <Lock size={18} />
                  </span>
                  <strong>an encrypted copy</strong>
                  <em>scrambled before it leaves · paid, opt-in</em>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Connectors */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={styles.row}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <MessageSquare size={14} strokeWidth={1.9} aria-hidden="true" />
                Texts &amp; chat apps
              </span>
              <h2>Messages run through your own machine.</h2>
              <p>
                Connect Stella to your texts or chat apps and the work happens
                on your computer — it reads the message, does the task, and
                sends the reply. A message only passes through us long enough to
                find your machine, and phone numbers are always scrambled, never
                kept as-is.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.bubble}>
                  <MessageSquare size={15} />
                  a message comes in
                </div>
                <span className={styles.down} />
                <div className={styles.node}>
                  <span className={styles.nodeIcon}>
                    <Laptop size={18} />
                  </span>
                  <strong>handled on your computer</strong>
                  <em>reads it, does the task, replies</em>
                </div>
                <span className={styles.down} />
                <div className={`${styles.bubble} ${styles["bubble--reply"]}`}>
                  <Send size={15} />
                  reply sent straight back out
                </div>
                <div className={styles.hashRow}>
                  <span className={styles.hashRaw}>+1 555 0148</span>
                  <Hash size={12} />
                  <span className={styles.hashOut}>scrambled</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Phone control */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={`${styles.row} ${styles["row--flip"]}`}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Smartphone size={14} strokeWidth={1.9} aria-hidden="true" />
                From your phone
              </span>
              <h2>Your phone talks straight to your desktop.</h2>
              <p>
                Use the app to drive your computer from anywhere. It connects
                right to your desktop through a private tunnel — we only keep
                track of which devices are paired, never what you say.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.tunnel}>
                  <span className={styles.endpoint}>
                    <Smartphone size={20} />
                    <em>your phone</em>
                  </span>
                  <span className={styles.tunnelLink}>
                    <Lock size={12} />
                  </span>
                  <span className={styles.endpoint}>
                    <Laptop size={20} />
                    <em>your desktop</em>
                  </span>
                </div>
                <span className={styles.down} />
                <div className={styles.pile}>
                  <CheckCircle2 size={13} aria-hidden="true" />
                  we keep only which devices are paired
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sharing */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={styles.row}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Send size={14} strokeWidth={1.9} aria-hidden="true" />
                Only when you share
              </span>
              <h2>The only things that leave are the ones you send.</h2>
              <p>
                Publishing an app to the Store or posting in the community are
                the moments you choose to share. When you publish, we get a
                tidied-up app — not your private chats. Posts you make are
                public, like any message board.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.shareGrid}>
                <div className={styles.node}>
                  <span className={styles.nodeIcon}>
                    <Upload size={18} />
                  </span>
                  <strong>an app you publish</strong>
                  <em>tidied up, no private chats</em>
                </div>
                <div className={styles.node}>
                  <span className={styles.nodeIcon}>
                    <Users size={18} />
                  </span>
                  <strong>a post you share</strong>
                  <em>public, on purpose</em>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className={`grid-shell section-border ${styles.closingSection}`}>
          <div className={styles.closing}>
            <span className={styles.eyebrow}>
              <ShieldCheck size={14} strokeWidth={1.9} aria-hidden="true" />
              Yours by default
            </span>
            <h2>Private because it&apos;s on your machine.</h2>
            <p>
              No cloud database of your life, nothing kept on our servers by
              default. Your data is yours — on your computer, where you can open
              it, read it, and delete it whenever you want.
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
