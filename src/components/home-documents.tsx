"use client";

import { FileText } from "lucide-react";
import Image from "next/image";
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

export function HomeDocuments() {
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
            {DOCS.map((doc, index) => (
              <figure
                className={`${styles.docPreview} ${styles[`docPreview_${doc.kind}`]}`}
                key={doc.kind}
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
