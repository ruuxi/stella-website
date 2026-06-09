"use client";

import { ArrowUp, Mic, Plus } from "lucide-react";
import Image from "next/image";
import styles from "./home-desktop-mock.module.css";

const CONTEXT_CHIPS = [
  { label: "Mail", iconSrc: "/mock-app-icons/mail.png" },
  { label: "Maps", iconSrc: "/mock-app-icons/maps.png" },
  { label: "Notes", iconSrc: "/mock-app-icons/notes.png" },
];

export function Composer({
  showContext = true,
  typed = "",
  className,
}: {
  showContext?: boolean;
  typed?: string;
  className?: string;
}) {
  return (
    <div
      className={
        className ? `${styles.composerWrap} ${className}` : styles.composerWrap
      }
    >
      {showContext ? (
        <div className={styles.contextStrip}>
          {CONTEXT_CHIPS.map(({ label, iconSrc }) => (
            <button
              key={label}
              type="button"
              className={styles.contextChip}
              title={`Add ${label} as context`}
            >
              <span className={styles.contextPlus} aria-hidden="true">
                +
              </span>
              <Image
                className={styles.contextIcon}
                src={iconSrc}
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
                draggable={false}
              />
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.composer}>
        <div className={styles.composerForm} data-zoom-anchor>
          <button
            type="button"
            className={styles.composerButton}
            aria-label="Add context"
          >
            <Plus size={16} strokeWidth={2.25} />
          </button>
          {typed ? (
            <span className={styles.typedText}>
              {typed}
              <span className={styles.typedCaret} aria-hidden="true" />
            </span>
          ) : (
            <span className={styles.placeholder}>Ask me anything...</span>
          )}
          <button
            type="button"
            className={styles.micButton}
            aria-label="Start dictation"
          >
            <Mic size={15} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            className={styles.submitButton}
            data-armed={typed ? "true" : undefined}
            aria-label="Send"
          >
            <ArrowUp size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
