import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AudioLines,
  CheckCircle2,
  Cloud,
  Ear,
  Keyboard,
  Laptop,
  Mic,
  Type,
  Waves,
} from "lucide-react";
import { DownloadButton } from "@/components/download-button";
import { FooterLegalLinks } from "@/components/footer-legal-links";
import { homeFooterGroups } from "@/components/site-footer-groups";
import { SiteHeader } from "@/components/site-header";
import styles from "./voice.module.css";

export const metadata: Metadata = {
  title: "Voice",
  description:
    "Talk to Stella out loud. Your voice can turn into text right on your computer, and no recording ever leaves your machine. \"Hey Stella\" is fully on-device and off by default.",
  alternates: { canonical: "/voice" },
};

export default function VoicePage() {
  return (
    <div className={`stella-page ${styles.page}`}>
      <SiteHeader />

      <main>
        <section className={`grid-shell ${styles.heroSection}`}>
          <div className={styles.hero}>
            <span className={styles.eyebrow}>
              <AudioLines size={15} strokeWidth={1.9} aria-hidden="true" />
              Voice
            </span>
            <h1>Talk to Stella out loud.</h1>
            <p>
              Speak instead of type, or just say &quot;Hey Stella.&quot; Your
              words turn into text the moment you stop talking — hands-free,
              wherever you are.
            </p>
          </div>
        </section>

        {/* On-device dictation */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={styles.row}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Mic size={14} strokeWidth={1.9} aria-hidden="true" />
                On-device
              </span>
              <h2>Your voice becomes text instantly.</h2>
              <p>
                Press the key and talk. On a modern Mac it all happens right on
                your computer, so your words show up the moment you finish — fast,
                and even when you&apos;re offline.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.node}>
                  <span className={styles.nodeIcon}>
                    <Mic size={18} />
                  </span>
                  <strong>you speak</strong>
                  <em>right into the mic</em>
                </div>
                <span className={styles.down} />
                <div className={styles.wave}>
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <span className={styles.down} />
                <div className={styles.device}>
                  <div className={styles.deviceBar}>
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className={styles.deviceBody}>
                    <span className={styles.deviceIcon}>
                      <Type size={16} />
                    </span>
                    <div className={styles.deviceText}>
                      <strong>becomes text</strong>
                      <em>the moment you stop</em>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dictate anywhere */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={`${styles.row} ${styles["row--flip"]}`}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Keyboard size={14} strokeWidth={1.9} aria-hidden="true" />
                Anywhere
              </span>
              <h2>Talk to type in any app.</h2>
              <p>
                Dictation isn&apos;t just for Stella. Use it in any app on your
                computer and the words drop straight into whatever you&apos;re
                typing — email, notes, chat, anywhere.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.pill}>
                  <div className={styles.miniWave}>
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <span className={styles.timer}>0:07</span>
                </div>
                <span className={styles.toggleHint}>a quiet bar by the dock</span>
                <span className={styles.down} />
                <div className={styles.node}>
                  <span className={styles.nodeIcon}>
                    <Type size={18} />
                  </span>
                  <strong>dropped where you&apos;re typing</strong>
                  <em>into whatever field is focused</em>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cloud fallback */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={styles.row}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Cloud size={14} strokeWidth={1.9} aria-hidden="true" />
                Every computer
              </span>
              <h2>It works on every computer.</h2>
              <p>
                No modern Mac? No problem. On other computers your voice is
                turned into text in the cloud, so dictation feels the same
                everywhere — Windows and Mac alike.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.node}>
                  <span className={styles.nodeIcon}>
                    <Laptop size={18} />
                  </span>
                  <strong>Windows &amp; older Macs</strong>
                  <em>covered too</em>
                </div>
                <span className={styles.down} />
                <div className={styles.bubble}>
                  <Cloud size={15} />
                  turned into text in the cloud
                </div>
                <span className={styles.down} />
                <div className={styles.node}>
                  <span className={styles.nodeIcon}>
                    <Type size={18} />
                  </span>
                  <strong>same dictation, everywhere</strong>
                  <em>Windows and Mac alike</em>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hey Stella wake word */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={`${styles.row} ${styles["row--flip"]}`}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Ear size={14} strokeWidth={1.9} aria-hidden="true" />
                Wake word
              </span>
              <h2>Just say &quot;Hey Stella.&quot;</h2>
              <p>
                Flip on the wake word and start talking with no clicking and no
                keyboard. It listens for &quot;Hey Stella&quot; right on your
                computer, stays off until you turn it on, and steps back the
                moment you say &quot;bye.&quot;
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.toggle}>
                  <span className={styles.toggleLabel}>
                    <Ear size={15} />
                    Hey Stella
                  </span>
                  <span className={styles.switch} data-state="off">
                    <i />
                  </span>
                </div>
                <span className={styles.toggleHint}>off by default</span>
                <span className={styles.down} />
                <div className={styles.node}>
                  <span className={styles.nodeIcon}>
                    <Mic size={18} />
                  </span>
                  <strong>listens on your desktop</strong>
                  <em>ready the moment you call</em>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live voice conversation */}
        <section className={`grid-shell section-border ${styles.section}`}>
          <div className={styles.row}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <Waves size={14} strokeWidth={1.9} aria-hidden="true" />
                Live conversation
              </span>
              <h2>Have a real conversation.</h2>
              <p>
                Talk back and forth like a phone call. Stella hears you in real
                time, answers out loud, and can even take a look at your screen
                when you ask her to.
              </p>
            </div>

            <div className={styles.visual} aria-hidden="true">
              <div className={styles.flow}>
                <div className={styles.tunnel}>
                  <span className={styles.endpoint}>
                    <Mic size={20} />
                    <em>you</em>
                  </span>
                  <span className={styles.tunnelLink}>
                    <Waves size={13} />
                  </span>
                  <span className={styles.endpoint}>
                    <AudioLines size={20} />
                    <em>the voice AI</em>
                  </span>
                </div>
                <span className={styles.down} />
                <div className={styles.pile}>
                  <CheckCircle2 size={13} aria-hidden="true" />
                  real-time, back and forth
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className={`grid-shell section-border ${styles.closingSection}`}>
          <div className={styles.closing}>
            <span className={styles.eyebrow}>
              <Mic size={14} strokeWidth={1.9} aria-hidden="true" />
              Just talk
            </span>
            <h2>Type less. Say more.</h2>
            <p>
              Whether it&apos;s a quick note or a full conversation, Stella&apos;s
              ready the second you start talking — hands-free, on every computer.
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
