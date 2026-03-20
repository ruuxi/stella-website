import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const r = size.width / 2;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(145deg, #7aa2f7 0%, #bb9af7 32%, #7dcfff 62%, #9ece6a 100%)",
          borderRadius: r,
        }}
      />
    ),
    { ...size },
  );
}
