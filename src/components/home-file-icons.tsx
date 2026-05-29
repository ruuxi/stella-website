/**
 * File-type glyphs for the documents showcase — clean page silhouettes with
 * a format-specific colored fold and a representative inner motif (text
 * lines, a cell grid, a slide, a PDF tab). Heavily inspired by the Office /
 * Acrobat file icons but redrawn so nothing is a 1:1 copy.
 */

export type FileKind = "docx" | "xlsx" | "pptx" | "pdf";

const ACCENTS: Record<FileKind, string> = {
  docx: "#2563eb",
  xlsx: "#1a8f5e",
  pptx: "#d2622b",
  pdf: "#d2384a",
};

function Page({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden="true"
      role="img"
    >
      <path
        d="M8 3.5h11.2L26 10.2V28a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 6 28V6A2.5 2.5 0 0 1 8 3.5Z"
        fill="#fff"
        stroke="rgba(8,19,38,0.16)"
        strokeWidth="1"
      />
      <path d="M19 3.6V8a2 2 0 0 0 2 2h4.6" fill="rgba(8,19,38,0.06)" />
      <path
        d="M19 3.6V8a2 2 0 0 0 2 2h4.6"
        stroke="rgba(8,19,38,0.16)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <g style={{ color: accent }}>{children}</g>
    </svg>
  );
}

export function FileGlyph({ kind }: { kind: FileKind }) {
  const accent = ACCENTS[kind];
  switch (kind) {
    case "docx":
      return (
        <Page accent={accent}>
          <rect x="10" y="15" width="12" height="1.8" rx="0.9" fill="currentColor" />
          <rect x="10" y="19" width="12" height="1.8" rx="0.9" fill="currentColor" opacity="0.7" />
          <rect x="10" y="23" width="8" height="1.8" rx="0.9" fill="currentColor" opacity="0.45" />
        </Page>
      );
    case "xlsx":
      return (
        <Page accent={accent}>
          <rect x="10" y="15" width="12" height="10" rx="1.2" fill="currentColor" opacity="0.12" />
          <path
            d="M10 19h12M10 22h12M16 15v10"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </Page>
      );
    case "pptx":
      return (
        <Page accent={accent}>
          <rect x="10" y="15" width="12" height="8" rx="1.4" fill="currentColor" opacity="0.14" />
          <path d="M12.5 21v-3M16 21v-4.5M19.5 21v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </Page>
      );
    case "pdf":
      return (
        <Page accent={accent}>
          <rect x="9" y="20" width="16" height="6.4" rx="1.6" fill="currentColor" />
          <path
            d="M11.6 24.6v-3.1h1.2c.6 0 1 .35 1 .9s-.4.9-1 .9h-.6v1.3m2.7 0v-3.1h1c.8 0 1.3.6 1.3 1.55s-.5 1.55-1.3 1.55h-1m3-3.1h1.8m-1.8 0v3.1m0-1.7h1.4"
            stroke="#fff"
            strokeWidth="0.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Page>
      );
  }
}
