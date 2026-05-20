"use client";

import { useEffect, useState } from "react";
import { Package, X } from "lucide-react";
import type { StoreBadge } from "../lib/types";
import { getGradient, getInitial } from "../lib/artwork";
import { storeTabs, type HostedStoreTab } from "../lib/constants";

export function EmojiCellPreview({
  sheetUrl,
  cell,
  size = 36,
  gridSize = 8,
}: {
  sheetUrl: string;
  cell: number;
  size?: number;
  gridSize?: number;
}) {
  const row = Math.floor(cell / gridSize);
  const col = cell % gridSize;
  const last = Math.max(1, gridSize - 1);
  return (
    <span
      className="emoji-cell-preview"
      style={{
        width: size,
        height: size,
        backgroundImage: `url("${sheetUrl}")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        backgroundPosition: `${(col / last) * 100}% ${(row / last) * 100}%`,
      }}
    />
  );
}

export function StoreModal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="store-web-dialog-backdrop" onClick={onClose}>
      <div className="store-web-dialog" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="store-web-dialog-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function PackageArtwork({
  iconUrl,
  name,
  className,
  letterClassName,
  zoomArtwork = false,
}: {
  iconUrl?: string;
  name: string;
  className: string;
  letterClassName: string;
  /** Crop in on generated icons that ship with extra canvas padding. */
  zoomArtwork?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(iconUrl) && !failed;
  return (
    <div
      className={`store-artwork ${className}${zoomArtwork ? " store-artwork--zoom" : ""}`}
      style={{ background: getGradient(name) }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="store-artwork-img"
          src={iconUrl}
          onError={() => setFailed(true)}
          draggable={false}
          loading="lazy"
        />
      ) : (
        <span className={letterClassName}>{getInitial(name)}</span>
      )}
    </div>
  );
}

export function BadgeMark({
  badge,
  size = 12,
}: {
  badge?: StoreBadge;
  size?: number;
}) {
  if (!badge) return null;
  // Partner = filled checkmark in a starburst (enterprise/brand);
  // verified = filled checkmark in a circle (active paid plan).
  // Tooltip via native title — keeps it lightweight; we can move to a
  // shared tooltip primitive when more surfaces need it.
  const title =
    badge === "partner"
      ? "Stella partner"
      : "Verified Stella subscriber";
  const className = `store-badge-mark store-badge-mark--${badge}`;
  if (badge === "partner") {
    return (
      <svg
        aria-label={title}
        className={className}
        height={size}
        role="img"
        viewBox="0 0 24 24"
        width={size}
      >
        <title>{title}</title>
        <path
          d="M12 1.6l2.4 2.6 3.5-.6.6 3.5L21 9.6l-1.7 3.1 1.7 3.1-2.5 2.5-.6 3.5-3.5-.6L12 23.4l-2.4-2.8-3.5.6-.6-3.5L3 16l1.7-3.1L3 9.6l2.5-2.5.6-3.5 3.5.6L12 1.6z"
          fill="currentColor"
        />
        <path
          d="M8.2 12.1l2.7 2.7 4.9-5"
          fill="none"
          stroke="#fff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  return (
    <svg
      aria-label={title}
      className={className}
      height={size}
      role="img"
      viewBox="0 0 24 24"
      width={size}
    >
      <title>{title}</title>
      <circle cx="12" cy="12" fill="currentColor" r="10" />
      <path
        d="M7.8 12.4l2.7 2.7 5.7-5.8"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.1"
      />
    </svg>
  );
}

export function AuthorChip({
  username,
  badge,
  variant = "card",
}: {
  username?: string;
  badge?: StoreBadge;
  variant?: "card" | "featured" | "detail";
}) {
  if (!username) return null;
  const displayed = `@${username}`;
  const initial = getInitial(username);
  const className =
    variant === "featured"
      ? "store-featured-author"
      : variant === "detail"
        ? "store-detail-author"
        : "store-card-author";
  const avatarClassName =
    variant === "featured"
      ? "store-featured-author-avatar"
      : variant === "detail"
        ? "store-detail-author-avatar"
        : "store-card-author-avatar";
  const badgeSize = variant === "card" ? 11 : variant === "featured" ? 13 : 14;
  return (
    <div className={className}>
      <span className={avatarClassName}>{initial}</span>
      <span>by {displayed}</span>
      <BadgeMark badge={badge} size={badgeSize} />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="store-empty">
      <div className="store-empty-icon">{icon}</div>
      <div className="store-empty-title">{title}</div>
      <div className="store-empty-desc">{description}</div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="store-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="store-skeleton-card">
          <div className="store-skeleton-image" />
          <div className="store-skeleton-body">
            <div className="store-skeleton-line" />
            <div className="store-skeleton-line store-skeleton-line--short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function useIsEmbeddedWebsite() {
  const [embedded, setEmbedded] = useState(false);
  useEffect(() => {
    setEmbedded(
      document.documentElement.getAttribute("data-embedded") === "true",
    );
  }, []);
  return embedded;
}

export function StoreWebTabs({ activeTab }: { activeTab: HostedStoreTab }) {
  return (
    <nav className="store-web-tabs" aria-label="Store sections">
      {storeTabs.map((tab) => (
        <a
          className="store-web-tab"
          data-active={activeTab === tab.key ? "true" : undefined}
          href={`/store?tab=${tab.key}`}
          key={tab.key}
        >
          {tab.label}
        </a>
      ))}
    </nav>
  );
}

export function StoreWebHero({ onUpload }: { onUpload: () => void }) {
  return (
    <header className="store-web-hero">
      <p className="store-web-eyebrow">Store</p>
      <div className="store-web-hero-title-row">
        <h1 className="store-web-title">Add-ons for Stella</h1>
        <button
          className="store-web-upload-cta"
          type="button"
          onClick={() => onUpload()}
        >
          Upload to Store
        </button>
      </div>
      <p className="store-web-lead">
        Browse mods, integrations, pets, and emoji packs. Install them in the
        desktop app when you are signed in.
      </p>
    </header>
  );
}
