"use client";

import Image from "next/image";
import { ArrowUpRight, FileText, Mic, Plus } from "lucide-react";
import { StellaAnimation } from "@/components/stella-animation/stella-animation";
import styles from "./home-hero-product-shot.module.css";

const contextChips = [
  { label: "Mail", iconSrc: "/mock-app-icons/mail.png" },
  { label: "Maps", iconSrc: "/mock-app-icons/maps.png" },
  { label: "Notes", iconSrc: "/mock-app-icons/notes.png" },
];

const tasks = [
  "Summarize the school PDF",
  "Compare flights",
  "Draft the reply",
];

const artifacts = [
  ["DOCX", "Weekend plan.docx"],
  ["XLSX", "Receipt totals.xlsx"],
  ["PDF", "school-form.pdf"],
];

export function HomeHeroProductShot() {
  return (
    <div className={styles.heroProductShot} aria-label="Stella desktop product preview">
      <div className={styles.desktopWindow}>
        <div className={styles.windowTopBar}>
          <div className={styles.trafficLights} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <nav aria-label="Mock Stella sections">
            <span data-active="true">Home</span>
            <span>Store</span>
            <span>Social</span>
            <span>Apps</span>
          </nav>
        </div>

        <div className={styles.windowBody}>
          <main className={styles.chatPane}>
            <div className={styles.messageStack}>
              <div className={styles.userBubble}>
                Plan Saturday and keep everything in one place.
              </div>
              <div className={styles.assistantBlock}>
                <span>I can handle errands, messages, files, and reminders from this same chat.</span>
                <span>I will keep the active work visible while the other tasks run.</span>
              </div>
              <div className={styles.workingIndicator}>
                <span className={styles.workingStella} aria-hidden="true">
                  <StellaAnimation
                    width={20}
                    height={20}
                    maxDpr={1}
                    frameSkip={2}
                    initialBirthProgress={1}
                  />
                </span>
                <strong>Reading the PDF</strong>
              </div>
            </div>

            <div className={styles.composerArea}>
              <div className={styles.contextRow}>
                <div className={styles.contextWorking}>
                  <span aria-hidden="true">
                    <StellaAnimation
                      width={18}
                      height={9}
                      maxDpr={1}
                      frameSkip={1}
                      initialBirthProgress={1}
                    />
                  </span>
                  <b>Working</b>
                </div>
                <div className={styles.contextLanes}>
                  {contextChips.map((chip) => (
                    <span className={styles.contextChip} key={chip.label}>
                      <b aria-hidden="true">+</b>
                      <Image
                        src={chip.iconSrc}
                        alt=""
                        aria-hidden="true"
                        width={16}
                        height={16}
                        draggable={false}
                      />
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.composerShell}>
                <span className={styles.composerButton} aria-hidden="true">
                  <Plus size={15} strokeWidth={2.1} />
                </span>
                <span className={styles.composerPlaceholder}>Ask me anything...</span>
                <span className={styles.composerButton} aria-hidden="true">
                  <Mic size={14} strokeWidth={1.9} />
                </span>
                <span className={styles.composerSubmit} aria-hidden="true">
                  <ArrowUpRight size={15} strokeWidth={2.1} />
                </span>
              </div>
            </div>
          </main>

          <aside className={styles.workspacePane}>
            <div className={styles.workspaceHeader}>
              <span>Workspace</span>
              <strong>Running now</strong>
            </div>
            <div className={styles.taskList}>
              {tasks.map((task, index) => (
                <span key={task} style={{ ["--task-index" as string]: index }}>
                  {task}
                </span>
              ))}
            </div>
            <div className={styles.artifactList}>
              {artifacts.map(([kind, title]) => (
                <div className={styles.artifact} key={title}>
                  <FileText size={14} strokeWidth={1.8} aria-hidden="true" />
                  <div>
                    <b>{kind}</b>
                    <span>{title}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <div className={styles.phoneCard} aria-hidden="true">
        <div className={styles.phoneNotch} />
        <div className={styles.phoneHeader}>Stella</div>
        <div className={styles.phoneBubble}>Text Stella from your phone.</div>
        <div className={styles.phoneReply}>Routed to desktop</div>
      </div>
    </div>
  );
}
