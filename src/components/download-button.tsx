"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function AppleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
    >
      <path d="M16.365 12.86c-.023-2.36 1.93-3.49 2.018-3.546-1.099-1.606-2.81-1.826-3.42-1.852-1.456-.148-2.84.86-3.58.86-.74 0-1.881-.838-3.094-.815-1.59.024-3.057.926-3.874 2.351-1.652 2.863-.422 7.094 1.188 9.418.787 1.138 1.724 2.418 2.954 2.373 1.187-.048 1.636-.768 3.07-.768 1.434 0 1.84.768 3.094.744 1.28-.024 2.09-1.16 2.872-2.303.906-1.32 1.279-2.6 1.301-2.667-.029-.013-2.495-.957-2.529-3.795zM14.07 5.638c.655-.793 1.097-1.895.976-2.99-.944.038-2.085.628-2.762 1.42-.607.7-1.139 1.82-.995 2.894 1.052.082 2.126-.534 2.781-1.324z" />
    </svg>
  );
}

function WindowsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
    >
      <path d="M3 5.4 11.2 4.3v7.4H3V5.4zm0 13.2v-6.3h8.2v7.4L3 18.6zm9.2-14.4L21 3v8.7h-8.8V4.2zm0 16.8v-8.4H21V21l-8.8-1.2z" />
    </svg>
  );
}

const DOWNLOADS = {
  macArm64:
    "https://pub-a319aaada8144dc9be5a83625033769c.r2.dev/launcher/stable/Stella-darwin-arm64.dmg",
  macX64:
    "https://pub-a319aaada8144dc9be5a83625033769c.r2.dev/launcher/stable/Stella-darwin-x64.dmg",
  windows:
    "https://pub-a319aaada8144dc9be5a83625033769c.r2.dev/launcher/stable/Stella.exe",
} as const;

type Platform = "macArm64" | "macX64" | "windows";

const ariaLabels: Record<Platform, string> = {
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

  const isMac = resolvedPlatform !== "windows";

  return (
    <button
      className="button button--primary button--download"
      onClick={handleClick}
      type="button"
      aria-label={ariaLabels[resolvedPlatform]}
      title={ariaLabels[resolvedPlatform]}
    >
      Download Stella
      {isMac ? <AppleIcon size={18} /> : <WindowsIcon size={18} />}
    </button>
  );
}
