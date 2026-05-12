"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight } from "lucide-react";

const DOWNLOADS = {
  macArm64:
    "https://pub-a319aaada8144dc9be5a83625033769c.r2.dev/launcher/stable/Stella-darwin-arm64.dmg",
  macX64:
    "https://pub-a319aaada8144dc9be5a83625033769c.r2.dev/launcher/stable/Stella-darwin-x64.dmg",
  windows:
    "https://pub-a319aaada8144dc9be5a83625033769c.r2.dev/launcher/stable/Stella.exe",
} as const;

type Platform = "macArm64" | "macX64" | "windows";

const labels: Record<Platform, string> = {
  macArm64: "Download for Mac",
  macX64: "Download for Mac",
  windows: "Download for Windows",
};

type NavigatorUAData = {
  platform?: string;
  getHighEntropyValues?: (
    hints: string[],
  ) => Promise<{ architecture?: string; platform?: string }>;
};

function subscribeNoop() {
  return () => {};
}

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "macArm64";
  return navigator.userAgent.toLowerCase().includes("mac")
    ? "macArm64"
    : "windows";
}

export function DownloadButton() {
  // Resolve the platform from `navigator` only on the client. Using
  // useSyncExternalStore avoids the cascading re-render that comes from
  // calling setState inside useEffect, while still keeping the SSR
  // markup stable ("Download for Mac").
  const platform = useSyncExternalStore<Platform>(
    subscribeNoop,
    detectPlatform,
    () => "macArm64",
  );

  const [macArchitecture, setMacArchitecture] = useState<"arm64" | "x64">(
    "arm64",
  );
  const resolvedPlatform: Platform =
    platform === "macArm64" && macArchitecture === "x64" ? "macX64" : platform;

  useEffect(() => {
    if (typeof navigator === "undefined" || platform !== "macArm64") {
      return;
    }

    const userAgentData = (navigator as Navigator & { userAgentData?: NavigatorUAData })
      .userAgentData;

    userAgentData
      ?.getHighEntropyValues?.(["architecture", "platform"])
      .then((hints) => {
        const hintPlatform = hints.platform ?? userAgentData.platform ?? "";
        const isMac = hintPlatform.toLowerCase().includes("mac");
        const isIntel = hints.architecture?.toLowerCase() === "x86";

        if (isMac && isIntel) {
          setMacArchitecture("x64");
        }
      })
      .catch(() => {});
  }, [platform]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    window.location.href = DOWNLOADS[resolvedPlatform];
  }

  return (
    <button
      className="button button--primary"
      onClick={handleClick}
      type="button"
    >
      {labels[resolvedPlatform]}
      <ArrowRight size={18} />
    </button>
  );
}
