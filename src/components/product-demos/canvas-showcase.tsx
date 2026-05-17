"use client";

/* ──────────────────────────────────────────────────────────────────
   Real product screenshots, cross-faded.

   Each screenshot is 1920x1175 (matching aspect 1.634:1). All three
   stack absolutely so swapping between them is a pure opacity
   transition — no layout shift, no decoding flash on tab switch.
   The aspect-ratio container preserves the same canvas size across
   the entire fade, regardless of which image is active.
   ────────────────────────────────────────────────────────────────── */

type ScreenshotSpec = {
  id: string;
  src: string;
  alt: string;
};

const SCREENSHOTS: ReadonlyArray<ScreenshotSpec> = [
  {
    id: "spreadsheet",
    src: "/demos/canvas-sheet.png",
    alt: "Stella opening a full-year revenue spreadsheet beside the chat.",
  },
  {
    id: "app",
    src: "/demos/canvas-app.png",
    alt: "Stella building a personal plant-care app and pinning it to the sidebar.",
  },
  {
    id: "multitask",
    src: "/demos/canvas-multitask.png",
    alt: "Stella running three asks in parallel with their progress in the Activity panel.",
  },
];

export function CanvasVisual({
  conceptIndex,
}: {
  conceptIndex: number;
  isActive: boolean;
}) {
  return (
    <div className="canvas-showcase canvas-showcase--screenshots">
      <div className="canvas-screenshot-stack">
        {SCREENSHOTS.map((shot, index) => {
          const isShown = index === conceptIndex;
          return (
            <img
              key={shot.id}
              src={shot.src}
              alt={shot.alt}
              className="canvas-screenshot"
              data-active={isShown || undefined}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              aria-hidden={!isShown}
            />
          );
        })}
      </div>
    </div>
  );
}
