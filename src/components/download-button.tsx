"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight, Lock, X } from "lucide-react";

const DOWNLOADS = {
  mac: "https://github.com/ruuxi/stella/releases/latest/download/Stella-darwin-arm64.dmg",
  windows: "https://github.com/ruuxi/stella/releases/latest/download/Stella.exe",
} as const;

const DOWNLOAD_PASSWORD = "2326";

type Platform = "mac" | "windows";

const labels: Record<Platform, string> = {
  mac: "Download for Mac",
  windows: "Download for Windows",
};

export function DownloadButton() {
  const [platform, setPlatform] = useState<Platform>("mac");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setPlatform(ua.includes("mac") ? "mac" : "windows");
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      window.location.href = DOWNLOADS[platform];
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
        {labels[platform]}
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
