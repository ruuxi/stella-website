"use client";

import { ArrowRight } from "lucide-react";

const DOWNLOADS = {
  mac: "https://github.com/ruuxi/stella/releases/latest/download/StellaSetup-darwin-arm64.dmg",
  windows: "https://github.com/ruuxi/stella/releases/latest/download/StellaSetup-win-x64.exe",
} as const;

type Platform = "mac" | "windows";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  return "windows";
}

const labels: Record<Platform, string> = {
  mac: "Download for Mac",
  windows: "Download for Windows",
};

export function DownloadButton() {
  const platform = detectPlatform();
  const resolved = platform;

  return (
    <a
      className="button button--primary"
      href={DOWNLOADS[resolved]}
    >
      {labels[resolved]}
      <ArrowRight size={18} />
    </a>
  );
}
