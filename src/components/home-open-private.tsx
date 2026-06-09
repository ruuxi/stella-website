import { BookOpen, EyeOff, Github, Lock, ShieldCheck } from "lucide-react";
import styles from "./home-open-private.module.css";

const PILLARS = [
  {
    icon: Lock,
    title: "Everything stays on your computer",
    body: "Your chats, files, and memories are saved on your device — nothing is stored on our servers.",
  },
  {
    icon: EyeOff,
    title: "Nothing for anyone to look at",
    body: "There's no cloud account collecting your history. What you do with Stella is simply yours.",
  },
  {
    icon: BookOpen,
    title: "Don't take our word for it",
    body: "Stella's code is public, so anyone in the world can check that it does exactly what we say.",
  },
];

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
        <h2>Private by design.</h2>
      </div>

      <div className={styles.center}>
        <div
          className={styles.intro}
          data-reveal-child
          style={{ ["--reveal-index" as string]: 1 }}
        >
          <span className="home-atlas-kicker">
            <ShieldCheck size={15} strokeWidth={1.9} aria-hidden="true" />
            Privacy
          </span>
          <p className={styles.lede}>
            Stella lives on your computer, not in the cloud. What you say,
            make, and keep stays with you.
          </p>
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

        <a
          className={styles.githubLink}
          data-reveal-child
          style={{ ["--reveal-index" as string]: 3 }}
          href="https://github.com/ruuxi/stella"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github size={16} strokeWidth={1.9} aria-hidden="true" />
          Read the code on GitHub
        </a>
      </div>
    </section>
  );
}
