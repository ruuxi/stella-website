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
    <section className={`grid-shell section-border ${styles.section}`}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>
          <FileText size={15} strokeWidth={1.9} aria-hidden="true" />
          5.0 Documents
        </span>
        <h2>Word, Excel, PowerPoint, and PDFs are first-class work.</h2>
        <p>
          Ask in plain language and Stella produces real, editable files —
          formatted reports, working spreadsheets, full slide decks, and
          polished PDFs, ready to open in the apps you already use.
        </p>
      </div>

      <div className={styles.stage}>
        <div className={styles.documentShell}>
          {DOCS.map((doc) => (
            <figure
              className={`${styles.docPreview} ${styles[`docPreview_${doc.kind}`]}`}
              key={doc.kind}
            >
              <span className={styles.chip} data-kind={doc.kind}>
                {doc.label}
              </span>
              <Image
                src={doc.src}
                alt={`${doc.label} document created by Stella`}
                width={1400}
                height={933}
                loading="eager"
                className={styles.shotImg}
                sizes="(max-width: 860px) 92vw, 48rem"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
