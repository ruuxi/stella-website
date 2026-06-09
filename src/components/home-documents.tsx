"use client";

import { FileText } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useSceneLoop } from "@/lib/use-scene-loop";
import styles from "./home-documents.module.css";

type Doc = {
  kind: "word" | "excel" | "pptx" | "pdf";
  label: string;
  src: string;
};

const DOCS: Doc[] = [
  { kind: "word", label: "Word", src: "/doc-mocks/word.jpg" },
  { kind: "excel", label: "Excel", src: "/doc-mocks/excel.jpg" },
  { kind: "pptx", label: "PowerPoint", src: "/doc-mocks/pptx.jpg" },
  { kind: "pdf", label: "PDF", src: "/doc-mocks/pdf.jpg" },
];

const REQUEST = "Turn the quarter's notes into a report, deck, and budget.";

export function HomeDocuments() {
  const sectionRef = useRef<HTMLElement>(null);
  const [typed, setTyped] = useState("");
  const [dealt, setDealt] = useState(false);
  const [focus, setFocus] = useState(-1);

  const reset = useCallback(() => {
    setTyped("");
    setDealt(false);
    setFocus(-1);
  }, []);

  const { reduced } = useSceneLoop(
    sectionRef,
    async ({ sleep, type }) => {
      await sleep(250);
      await type(REQUEST, setTyped, 20);
      await sleep(380);
      setDealt(true);
      await sleep(1250);
      for (let k = 0; k < DOCS.length; k += 1) {
        setFocus(k);
        await sleep(1250);
      }
      setFocus(-1);
      await sleep(2400);
    },
    reset,
  );

  const shownTyped = reduced ? REQUEST : typed;
  const shownDealt = reduced ? true : dealt;
  const shownFocus = reduced ? -1 : focus;

  return (
    <section
      className={`grid-shell section-border home-atlas-section ${styles.section}`}
      data-reveal
      ref={sectionRef}
    >
      <div
        className="home-atlas-heading"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 0 }}
      >
        <h2>Files are first-class work.</h2>
      </div>

      <div className="home-atlas-scene">
        <div
          className={`home-atlas-media home-atlas-media--left home-atlas-fade ${styles.stage}`}
          data-reveal-child
          style={{ ["--reveal-index" as string]: 1 }}
        >
          <div
            className={styles.documentShell}
            aria-label="Document examples created by Stella"
          >
            <div className={styles.request} aria-hidden="true">
              <span className={styles.requestMark}>
                <Image src="/stella-logo.svg" alt="" width={13} height={13} />
              </span>
              <span className={styles.requestText}>
                {shownTyped || "Ask for the files you need…"}
                {!reduced && shownTyped && !shownDealt ? (
                  <i className={styles.requestCaret} />
                ) : null}
              </span>
            </div>

            {DOCS.map((doc, index) => (
              <figure
                className={`${styles.docPreview} ${styles[`docPreview_${doc.kind}`]}`}
                key={doc.kind}
                data-dealt={shownDealt || undefined}
                data-focused={shownFocus === index || undefined}
                data-receded={
                  (shownFocus !== -1 && shownFocus !== index) || undefined
                }
                style={{ ["--i" as string]: index }}
              >
                <span className={styles.chip} data-kind={doc.kind}>
                  {doc.label}
                </span>
                <Image
                  src={doc.src}
                  alt={`${doc.label} document created by Stella`}
                  width={1400}
                  height={933}
                  loading="lazy"
                  quality={82}
                  className={styles.shotImg}
                  sizes="(max-width: 860px) 80vw, 29rem"
                />
              </figure>
            ))}
          </div>
        </div>

        <div
          className="home-atlas-copy home-atlas-copy--right"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 2 }}
        >
          <span className="home-atlas-kicker">
            <FileText size={15} strokeWidth={1.9} aria-hidden="true" />
            Documents
          </span>
          <p>
            Ask once. Stella creates editable reports, spreadsheets, decks, and
            PDFs ready for the apps you already use.
          </p>
        </div>
      </div>
    </section>
  );
}
