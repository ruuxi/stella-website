"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const DOWNLOADS = {
  mac: "https://github.com/ruuxi/stella/releases/latest/download/stella-desktop-darwin-arm64.tar.zst",
  windows: "https://github.com/ruuxi/stella/releases/latest/download/stella-desktop-win-x64.tar.zst",
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
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const resolved = platform ?? "windows";

  return (
    <a
      className="button button--primary"
      href={DOWNLOADS[resolved]}
    >
      {platform ? labels[resolved] : "Download Stella"}
      <ArrowRight size={18} />
    </a>
  );
}
