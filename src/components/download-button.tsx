"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Lock, X } from "lucide-react";

const DOWNLOADS = {
  macArm64:
    "https://github.com/ruuxi/stella/releases/latest/download/Stella-darwin-arm64.dmg",
  macX64:
    "https://github.com/ruuxi/stella/releases/latest/download/Stella-darwin-x64.dmg",
  windows: "https://github.com/ruuxi/stella/releases/latest/download/Stella.exe",
} as const;

const DOWNLOAD_PASSWORD = "2326";

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
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setShowModal(true);
    setPassword("");
    setError(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === DOWNLOAD_PASSWORD) {
      setShowModal(false);
      window.location.href = DOWNLOADS[resolvedPlatform];
    } else {
      setError(true);
    }
  }

  return (
    <>
      <button
        className="button button--primary"
        onClick={handleClick}
        type="button"
      >
        {labels[resolvedPlatform]}
        <ArrowRight size={18} />
      </button>

      {showModal && (
        <div className="dl-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="dl-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="dl-modal__close"
              onClick={() => setShowModal(false)}
              type="button"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <div className="dl-modal__icon">
              <Lock size={20} />
            </div>
            <h3 className="dl-modal__title">Enter password to download</h3>
            <p className="dl-modal__desc">
              Stella is in early access. Enter the password to continue.
            </p>
            <form onSubmit={handleSubmit} className="dl-modal__form">
              <input
                ref={inputRef}
                type="password"
                className={`dl-modal__input${error ? " dl-modal__input--error" : ""}`}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
              />
              {error && (
                <span className="dl-modal__error">Incorrect password</span>
              )}
              <button type="submit" className="button button--primary dl-modal__submit">
                Download
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
