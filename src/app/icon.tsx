import { ImageResponse } from "next/og";

/** Fills the tab; the dot-matrix SVG is illegible at favicon sizes. Colors match `stella-logo.svg`. */
export const runtime = "edge";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(145deg, #7aa2f7 0%, #bb9af7 32%, #7dcfff 62%, #9ece6a 100%)",
          borderRadius: 16,
        }}
      />
    ),
    { ...size },
  );
}
