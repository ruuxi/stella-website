import { GitBranch, Github, KeyRound, Lock, ShieldCheck } from "lucide-react";
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
    <section
      className={`grid-shell section-border home-atlas-section ${styles.section}`}
      data-reveal
    >
      <div
        className="home-atlas-heading"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 0 }}
      >
        <h2>Private and open source.</h2>
      </div>

      <div className={styles.center}>
        <div
          className={styles.intro}
          data-reveal-child
          style={{ ["--reveal-index" as string]: 1 }}
        >
          <span className="home-atlas-kicker">
            <ShieldCheck size={15} strokeWidth={1.9} aria-hidden="true" />
            Open &amp; private
          </span>
          <p className={styles.lede}>
            Stella runs locally, stays open source, and works with your agents,
            providers, keys, and models.
          </p>
          <a
            className={styles.githubLink}
            href="https://github.com/ruuxi/stella"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={16} strokeWidth={1.9} aria-hidden="true" />
            View Stella on GitHub
          </a>
        </div>

        <div
          className={styles.panel}
          data-reveal-child
          style={{ ["--reveal-index" as string]: 2 }}
        >
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

        <div
          className={styles.wall}
          data-reveal-child
          style={{ ["--reveal-index" as string]: 3 }}
        >
          <LogoRow title="Agents & harnesses" brands={HARNESSES} />
          <LogoRow title="Models & providers" brands={PROVIDERS} />
        </div>
      </div>
    </section>
  );
}
