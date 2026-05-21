"use client";

/* ──────────────────────────────────────────────────────────────────
   Real product screenshots, cross-faded.

   Each screenshot is 2560x1566 (matching aspect 1.634:1). All three
   stack absolutely so swapping between them is a pure opacity
   transition — no layout shift, no decoding flash on tab switch.
   The aspect-ratio container preserves the same canvas size across
   the entire fade, regardless of which image is active.
   ────────────────────────────────────────────────────────────────── */

type ScreenshotSpec = {
  id: string;
  /** Lossless fallback for browsers without WebP. */
  src: string;
  /** Primary delivery — ~10× smaller than PNG at the same visual quality. */
  webpSrc: string;
  webpSrc1280: string;
  alt: string;
};

const SCREENSHOTS: ReadonlyArray<ScreenshotSpec> = [
  {
    id: "spreadsheet",
    src: "/demos/canvas-sheet.png",
    webpSrc: "/demos/canvas-sheet.webp",
    webpSrc1280: "/demos/canvas-sheet-1280.webp",
    alt: "Stella opening a full-year revenue spreadsheet beside the chat.",
  },
  {
    id: "app",
    src: "/demos/canvas-app.png",
    webpSrc: "/demos/canvas-app.webp",
    webpSrc1280: "/demos/canvas-app-1280.webp",
    alt: "Stella building a personal plant-care app and pinning it to the sidebar.",
  },
  {
    id: "multitask",
    src: "/demos/canvas-multitask.png",
    webpSrc: "/demos/canvas-multitask.webp",
    webpSrc1280: "/demos/canvas-multitask-1280.webp",
    alt: "Stella running three asks in parallel with their progress in the Activity panel.",
  },
];

const SCREENSHOT_SIZES = "(max-width: 1240px) 100vw, 1240px";

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
            <picture key={shot.id}>
              <source
                type="image/webp"
                srcSet={`${shot.webpSrc1280} 1280w, ${shot.webpSrc} 2560w`}
                sizes={SCREENSHOT_SIZES}
              />
              <img
                src={shot.src}
                alt={shot.alt}
                width={2560}
                height={1566}
                sizes={SCREENSHOT_SIZES}
                className="canvas-screenshot"
                data-active={isShown || undefined}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                aria-hidden={!isShown}
              />
            </picture>
          );
        })}
      </div>
    </div>
  );
}
