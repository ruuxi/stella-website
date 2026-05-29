import { GitBranch, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { BrandGlyph, type BrandName } from "./home-brand-icons";
import styles from "./home-open-private.module.css";

type Brand = { name: BrandName; label: string };

const HARNESSES: Brand[] = [
  { name: "claudeCode", label: "Claude Code" },
  { name: "codex", label: "Codex" },
  { name: "cursor", label: "Cursor" },
  { name: "openclaw", label: "OpenClaw" },
  { name: "hermes", label: "Hermes Agent" },
];

const PROVIDERS: Brand[] = [
  { name: "openai", label: "OpenAI" },
  { name: "anthropic", label: "Anthropic" },
  { name: "google", label: "Google" },
  { name: "xai", label: "xAI" },
  { name: "deepseek", label: "DeepSeek" },
  { name: "moonshot", label: "Moonshot AI" },
];

const PILLARS = [
  {
    icon: Lock,
    title: "Runs on your machine",
    body: "Your chats and files stay on your device. Nothing is stored on our servers.",
  },
  {
    icon: GitBranch,
    title: "Open source",
    body: "Apache-2.0, end to end. Read every line, fork it, and make it your own.",
  },
  {
    icon: KeyRound,
    title: "Bring your own",
    body: "Your harness, your provider, your keys, your model. No lock-in, ever.",
  },
];

function LogoRow({ title, brands }: { title: string; brands: Brand[] }) {
  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>{title}</span>
      <ul className={styles.logos}>
        {brands.map((brand) => (
          <li className={styles.logo} key={brand.name} data-brand={brand.name}>
            <span className={styles.logoMark}>
              <BrandGlyph name={brand.name} className={styles.glyph} />
            </span>
            <span className={styles.logoName}>{brand.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HomeOpenPrivate() {
  return (
    <section className={`grid-shell section-border ${styles.section}`}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>
          <ShieldCheck size={15} strokeWidth={1.9} aria-hidden="true" />
          Open &amp; private
        </span>
        <h2>Private by default. Open by design.</h2>
        <p>
          Stella runs on your machine and keeps your files local — fully open
          source, and built to work with the agents, providers, and models you
          already use.
        </p>
      </div>

      <div className={styles.panel}>
        {PILLARS.map((pillar) => (
          <div className={styles.pillar} key={pillar.title}>
            <span className={styles.pillarIcon}>
              <pillar.icon size={20} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <strong>{pillar.title}</strong>
            <span>{pillar.body}</span>
          </div>
        ))}
      </div>

      <div className={styles.wall}>
        <LogoRow title="Agents & harnesses" brands={HARNESSES} />
        <LogoRow title="Models & providers" brands={PROVIDERS} />
      </div>
    </section>
  );
}
