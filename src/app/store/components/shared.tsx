"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { resolveStoreAuthorDisplay } from "../lib/format";
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
}: {
  iconUrl?: string;
  name: string;
  className: string;
  letterClassName: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(iconUrl) && !failed;
  return (
    <div
      className={`store-artwork ${className}`}
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
  return (
    <StoreAuthorHandle username={username} badge={badge} variant={variant} />
  );
}

export function StoreAuthorHandle({
  username,
  badge,
  variant = "card",
}: {
  username?: string;
  badge?: StoreBadge;
  variant?: "card" | "featured" | "detail";
}) {
  const author = resolveStoreAuthorDisplay(username, badge);
  if (!author.username) return null;
  const className =
    variant === "featured"
      ? "store-card-author-handle store-card-author-handle--featured"
      : variant === "detail"
        ? "store-card-author-handle store-card-author-handle--detail"
        : "store-card-author-handle";
  return (
    <span className={className}>
      {author.badge ? <BadgeMark badge={author.badge} size={18} /> : null}
      <span className="store-card-author-handle-name">@{author.username}</span>
    </span>
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

export function StoreLoadingSpinner({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      className={`store-loading${compact ? " store-loading--compact" : ""}`}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="store-loading-spinner" aria-hidden="true" />
    </div>
  );
}

export function useIsEmbeddedWebsite() {
  const [embedded] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.getAttribute("data-embedded") === "true";
  });
  return embedded;
}

export function StoreWebTabs({
  activeTab,
  onSelectTab,
}: {
  activeTab: HostedStoreTab;
  onSelectTab: (tab: HostedStoreTab) => void;
}) {
  return (
    <nav className="store-web-tabs" aria-label="Store sections">
      {storeTabs.map((tab) => (
        <button
          className="store-web-tab"
          data-active={activeTab === tab.key ? "true" : undefined}
          key={tab.key}
          onClick={() => onSelectTab(tab.key)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

/**
 * Single-row page header for both hosted and embedded views: section
 * tabs and optional search sit centered as one group, and the Upload
 * CTA pins to the right. The eyebrow, h1 title, lead paragraph, and
 * separate Upload button that used to stack above the content are all
 * collapsed into this one row — the route + tab already tells the user
 * they're in the Store, so the h1 was just repeating itself.
 */
export function StoreWebHeader({
  activeTab,
  onSelectTab,
  showUpload,
  onUpload,
  searchSlot,
}: {
  activeTab: HostedStoreTab;
  onSelectTab: (tab: HostedStoreTab) => void;
  showUpload: boolean;
  onUpload: () => void;
  searchSlot?: React.ReactNode;
}) {
  return (
    <header className="store-web-header">
      {searchSlot ? (
        <div className="store-web-header-search">{searchSlot}</div>
      ) : null}
      <StoreWebTabs activeTab={activeTab} onSelectTab={onSelectTab} />
      {showUpload ? (
        <button
          className="store-web-upload-cta"
          type="button"
          onClick={() => onUpload()}
        >
          Upload to Store
        </button>
      ) : null}
    </header>
  );
}
