import {
  Brain,
  Database,
  FileText,
  GitBranch,
  HardDrive,
  RefreshCw,
  Search,
} from "lucide-react";
import styles from "./home-memory-system.module.css";

const inputLanes = [
  { label: "subagent rollouts", detail: "SQLite queue" },
  { label: "conversation review", detail: "candidate notes" },
  { label: "Chronicle OCR", detail: "live snapshots" },
];

const memoryFiles = ["MEMORY.md", "memory_summary.md", "raw_memories.md"];

export function HomeMemorySystem() {
  return (
    <section className={`grid-shell section-border ${styles.section}`}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>
          <Brain size={15} strokeWidth={1.9} aria-hidden="true" />
          0.1 Memory
        </span>
        <h2>Memory that stays local, durable, and searchable.</h2>
        <p>
          Stella remembers through files, queues, and grep. Capture is separate
          from consolidation, and recall is pulled into the turn only when it is
          useful.
        </p>
      </div>

      <div className={styles.diagram} aria-label="Stella memory system diagram">
        <div className={styles.coreLane}>
          <div className={styles.node}>
            <span className={styles.nodeIcon}>
              <HardDrive size={17} aria-hidden="true" />
            </span>
            <strong>core-memory.md</strong>
            <em>always pinned</em>
          </div>
          <span className={styles.coreArrow} />
          <div className={styles.promptChip}>startup prompt</div>
        </div>

        <div className={styles.pipeline}>
          <div className={styles.inputStack}>
            {inputLanes.map((lane) => (
              <div className={styles.inputNode} key={lane.label}>
                <span>{lane.label}</span>
                <em>{lane.detail}</em>
              </div>
            ))}
          </div>

          <div className={styles.queueRail}>
            <span className={styles.railLabel}>durable inputs</span>
            <i />
            <i />
            <i />
          </div>

          <div className={styles.dreamNode}>
            <span className={styles.dreamIcon}>
              <RefreshCw size={21} aria-hidden="true" />
            </span>
            <strong>Dream</strong>
            <em>token-growth cadence</em>
          </div>

          <div className={styles.fileStack}>
            {memoryFiles.map((file) => (
              <div className={styles.fileNode} key={file}>
                <FileText size={15} aria-hidden="true" />
                <span>{file}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.recallLane}>
          <div className={styles.contextNode}>
            <Search size={17} aria-hidden="true" />
            <strong>Context tool</strong>
            <em>on-demand recall</em>
          </div>
          <div className={styles.grepNode}>
            <GitBranch size={17} aria-hidden="true" />
            <strong>grep matches</strong>
            <em>small prompt brief</em>
          </div>
          <div className={styles.turnNode}>
            <Database size={17} aria-hidden="true" />
            <strong>current turn</strong>
            <em>only what matters</em>
          </div>
        </div>
      </div>
    </section>
  );
}
