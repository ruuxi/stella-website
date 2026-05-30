import { readFileSync } from "fs";
import { join } from "path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Stella — the personal AI assistant that reshapes itself around you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logoSrc = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/stella-logo.png"),
).toString("base64")}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          backgroundColor: "#f3f8ff",
          backgroundImage:
            "radial-gradient(circle at 12% 8%, rgba(110,195,240,0.55), transparent 42%), radial-gradient(circle at 88% 18%, rgba(46,127,208,0.30), transparent 46%), radial-gradient(circle at 70% 100%, rgba(143,247,219,0.30), transparent 44%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={132}
          height={132}
          alt=""
          style={{
            borderRadius: 30,
            boxShadow: "0 10px 30px rgba(11,27,51,0.16)",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 132,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            color: "#0b1b33",
            marginTop: 28,
          }}
        >
          Stella
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 46,
            lineHeight: 1.25,
            color: "rgba(11,27,51,0.74)",
            marginTop: 8,
            maxWidth: 900,
          }}
        >
          The personal AI assistant that reshapes itself around you.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#2563eb",
            marginTop: 40,
          }}
        >
          stella.sh · Free for macOS &amp; Windows
        </div>
      </div>
    ),
    { ...size },
  );
}
