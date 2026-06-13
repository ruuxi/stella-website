"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Embeds a fixed-size (1200x760) self-contained showcase page and scales it
 * down responsively to fit the column width, preserving the desktop layout.
 */
export function MorphEmbed({
  src,
  width = 1200,
  height = 760,
}: {
  src: string;
  width?: number;
  height?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div
      ref={wrapRef}
      className="cb-morph"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {scale > 0 && (
        <iframe
          src={src}
          width={width}
          height={height}
          loading="lazy"
          title="Claude redesigning itself"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        />
      )}
    </div>
  );
}
