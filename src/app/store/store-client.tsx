"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Layers,
  Package,
  Search,
  Share2,
  X,
} from "lucide-react";
import { isConvexConfigured } from "@/lib/convex-urls";

type StoreCategory =
  | "apps-games"
  | "productivity"
  | "customization"
  | "skills-agents"
  | "integrations"
  | "other";

type StorePackage = {
  _id: string;
  packageId: string;
  displayName: string;
  description: string;
  category?: StoreCategory;
  latestReleaseNumber: number;
  installCount?: number;
  iconUrl?: string;
  authorDisplayName?: string;
  authorHandle?: string;
  featured?: boolean;
  updatedAt: number;
};

type StoreReleaseManifest = {
  files?: string[];
  changedFiles?: string[];
  releaseNotes?: string;
  summary?: string;
};

type StoreRelease = {
  packageId: string;
  releaseNumber: number;
  blueprintMarkdown: string;
  commits?: Array<{ hash: string; subject: string; diff: string }>;
  releaseNotes?: string;
  manifest?: StoreReleaseManifest;
  createdAt: number;
};

type StoreInstall = {
  packageId: string;
  displayName?: string;
  installedAt?: number;
};

type PublicPet = {
  id: string;
  displayName: string;
  description: string;
  kind: string;
  tags: string[];
  ownerName: string | null;
  spritesheetUrl: string;
  previewUrl?: string;
  downloads: number;
};

type EmojiPack = {
  _id: string;
  packId: string;
  displayName: string;
  description?: string;
  coverEmoji: string;
  coverUrl?: string;
  sheetUrls: string[];
  visibility?: "public" | "unlisted" | "private";
  authorDisplayName?: string;
  authorHandle?: string;
  installCount?: number;
};

type DesktopStoreBridge = {
  getAuthToken?: () => Promise<string | null>;
  openStorePanel?: () => Promise<unknown>;
  getRelease: (payload: {
    packageId: string;
    releaseNumber: number;
  }) => Promise<StoreRelease | null>;
  installFromBlueprint: (payload: {
    packageId: string;
    releaseNumber: number;
    displayName: string;
    blueprintMarkdown: string;
    commits?: Array<{ hash: string; subject: string; diff: string }>;
  }) => Promise<StoreInstall>;
  listInstalledMods: () => Promise<StoreInstall[]>;
  installPet?: (payload: { pet: PublicPet }) => Promise<unknown>;
  selectPet?: (payload: { petId: string }) => Promise<unknown>;
  removePet?: (payload: { petId: string }) => Promise<unknown>;
  getPetState?: () => Promise<{
    installedPetIds: string[];
    selectedPetId: string | null;
  }>;
  installEmojiPack?: (payload: {
    packId: string;
    sheetUrls: string[];
  }) => Promise<unknown>;
  clearEmojiPack?: (payload?: { packId?: string }) => Promise<unknown>;
  getEmojiPackState?: () => Promise<{
    activePack: { packId: string; sheetUrls: string[] } | null;
  }>;
};

type PetBridgeState = {
  installedPetIds: string[];
  selectedPetId: string | null;
};

type EmojiBridgeState = {
  activePack: { packId: string; sheetUrls: string[] } | null;
};

declare global {
  interface Window {
    stellaDesktopStore?: DesktopStoreBridge;
  }
}

const listPublicPackages = makeFunctionReference<
  "query",
  {
    category?: StoreCategory;
    paginationOpts: { numItems: number; cursor: string | null };
  },
  { page: StorePackage[]; isDone: boolean; continueCursor: string }
>("data/store_packages:listPublicPackages");

const searchPublicPackages = makeFunctionReference<
  "query",
  { query: string; category?: StoreCategory },
  StorePackage[]
>("data/store_packages:searchPublicPackages");

const getPublicPackage = makeFunctionReference<
  "query",
  { packageId: string },
  StorePackage | null
>("data/store_packages:getPublicPackage");

const listPublicReleases = makeFunctionReference<
  "query",
  { packageId: string },
  StoreRelease[]
>("data/store_packages:listPublicReleases");

const recordPackageInstall = makeFunctionReference<
  "mutation",
  { packageId: string },
  null
>("data/store_packages:recordPackageInstall");

const listPublicPets = makeFunctionReference<
  "query",
  {
    paginationOpts: { numItems: number; cursor: string | null };
    sort: "downloads" | "name";
    search?: string;
  },
  { page: PublicPet[]; isDone: boolean; continueCursor: string }
>("data/pets:listPublicPage");

const incrementPetDownloads = makeFunctionReference<
  "mutation",
  { id: string },
  null
>("data/pets:incrementDownloads");

const listPublicEmojiPacks = makeFunctionReference<
  "query",
  {
    paginationOpts: { numItems: number; cursor: string | null };
    sort?: "installs" | "name";
    search?: string;
  },
  { page: EmojiPack[]; isDone: boolean; continueCursor: string }
>("data/emoji_packs:listPublicPage");

const recordEmojiInstall = makeFunctionReference<
  "mutation",
  { packId: string },
  null
>("data/emoji_packs:recordInstall");

const getFashionFeatureStatus = makeFunctionReference<
  "query",
  Record<string, never>,
  { shopifyConfigured: boolean }
>("data/fashion:getFashionFeatureStatus");

const DISCOVER_FILTERS: Array<{ id: StoreCategory | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "apps-games", label: "Apps & games" },
  { id: "productivity", label: "Productivity" },
  { id: "customization", label: "Customization" },
  { id: "skills-agents", label: "Skills & agents" },
  { id: "integrations", label: "Integrations" },
  { id: "other", label: "Other" },
];

const storeTabs = [
  { key: "discover", label: "Discover" },
  { key: "pets", label: "Pets" },
  { key: "emojis", label: "Emojis" },
  { key: "fashion", label: "Fashion" },
] as const;

type HostedStoreTab = (typeof storeTabs)[number]["key"];

const normalizeHostedStoreTab = (value: string | null): HostedStoreTab =>
  storeTabs.some((tab) => tab.key === value)
    ? (value as HostedStoreTab)
    : "discover";

const getDesktopStoreBridge = (): DesktopStoreBridge | undefined =>
  typeof window === "undefined" ? undefined : window.stellaDesktopStore;

const redirectToStoreSignIn = () => {
  if (typeof window === "undefined") return;
  window.location.href = "/sign-in?next=/store";
};

const isPetBridgeState = (value: unknown): value is PetBridgeState => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    Array.isArray(record.installedPetIds) &&
    record.installedPetIds.every((id) => typeof id === "string") &&
    (typeof record.selectedPetId === "string" || record.selectedPetId === null)
  );
};

const isEmojiBridgeState = (value: unknown): value is EmojiBridgeState => {
  if (!value || typeof value !== "object") return false;
  const activePack = (value as Record<string, unknown>).activePack;
  if (activePack === null) return true;
  if (!activePack || typeof activePack !== "object") return false;
  const record = activePack as Record<string, unknown>;
  return (
    typeof record.packId === "string" &&
    Array.isArray(record.sheetUrls) &&
    record.sheetUrls.every((url) => typeof url === "string")
  );
};

const openNativeStorePanel = async (): Promise<boolean> => {
  const bridge = getDesktopStoreBridge();
  if (!bridge?.openStorePanel) return false;
  await bridge.openStorePanel();
  return true;
};

// Deterministic gradient picker — same palette as desktop's StoreView.
const GRADIENTS = [
  "linear-gradient(135deg, oklch(0.72 0.15 25), oklch(0.58 0.20 50))",
  "linear-gradient(135deg, oklch(0.68 0.13 205), oklch(0.52 0.17 230))",
  "linear-gradient(135deg, oklch(0.70 0.15 145), oklch(0.55 0.18 170))",
  "linear-gradient(135deg, oklch(0.68 0.16 280), oklch(0.52 0.20 305))",
  "linear-gradient(135deg, oklch(0.73 0.12 80), oklch(0.60 0.16 55))",
  "linear-gradient(135deg, oklch(0.66 0.17 340), oklch(0.52 0.22 10))",
  "linear-gradient(135deg, oklch(0.66 0.11 215), oklch(0.50 0.15 240))",
  "linear-gradient(135deg, oklch(0.70 0.14 165), oklch(0.54 0.17 190))",
];

function hashString(value: string): number {
  let h = 0;
  for (const ch of value) h = ((h << 5) - h + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function getGradient(name: string): string {
  return GRADIENTS[hashString(name) % GRADIENTS.length]!;
}

function getInitial(name: string): string {
  return (name.trim()[0] ?? "S").toUpperCase();
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeAgo(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(ms);
}

function formatInstallCount(count: number | undefined): string {
  const n = count ?? 0;
  if (n <= 0) return "New";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M installs`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K installs`;
  return `${n} install${n === 1 ? "" : "s"}`;
}

function getReleaseFileCount(release: StoreRelease): number {
  const files = release.manifest?.files ?? release.manifest?.changedFiles;
  return Array.isArray(files) ? files.length : 0;
}

function getReleaseNotes(release: StoreRelease): string | undefined {
  const notes =
    release.releaseNotes ??
    release.manifest?.releaseNotes ??
    release.manifest?.summary;
  return typeof notes === "string" && notes.trim() ? notes.trim() : undefined;
}

const PET_COLUMNS = 8;
const PET_ROWS = 9;
const petIdleFrames = [
  { column: 0, duration: 280 },
  { column: 1, duration: 110 },
  { column: 2, duration: 110 },
  { column: 3, duration: 140 },
  { column: 4, duration: 140 },
  { column: 5, duration: 320 },
];

function PetSpritePreview({
  spritesheetUrl,
  size = 84,
}: {
  spritesheetUrl: string;
  size?: number;
}) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const current = petIdleFrames[frame] ?? petIdleFrames[0]!;
    const timer = window.setTimeout(() => {
      setFrame((value) => (value + 1) % petIdleFrames.length);
    }, current.duration);
    return () => window.clearTimeout(timer);
  }, [frame]);

  const current = petIdleFrames[frame] ?? petIdleFrames[0]!;
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: Math.round(size * (208 / 192)),
        backgroundImage: `url(${spritesheetUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${PET_COLUMNS * 100}% ${PET_ROWS * 100}%`,
        backgroundPosition: `${(current.column / (PET_COLUMNS - 1)) * 100}% 0%`,
        imageRendering: "pixelated",
      }}
    />
  );
}

function EmojiCellPreview({
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

function StoreModal({
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

function PackageArtwork({
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

function AuthorChip({
  name,
  handle,
  variant = "card",
}: {
  name?: string;
  handle?: string;
  variant?: "card" | "featured" | "detail";
}) {
  if (!name && !handle) return null;
  const displayed = name?.trim() || handle!;
  const initial = getInitial(displayed);
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
  return (
    <div className={className}>
      <span className={avatarClassName}>{initial}</span>
      <span>by {displayed}</span>
    </div>
  );
}

function EmptyState({
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

function SkeletonGrid() {
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

function StoreWebTabs({ activeTab }: { activeTab: HostedStoreTab }) {
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

function PackageCard({
  pkg,
  installed,
  installing,
  onOpen,
  onInstall,
  onShare,
}: {
  pkg: StorePackage;
  installed: boolean;
  installing: boolean;
  onOpen: () => void;
  onInstall: () => void;
  onShare: () => void;
}) {
  const actionLabel = installing ? "Adding..." : installed ? "Added" : "Get";
  const actionVariant = installing ? "working" : installed ? "added" : "get";
  return (
    <div
      className="store-card"
      data-clickable="true"
      onClick={onOpen}
    >
      <PackageArtwork
        iconUrl={pkg.iconUrl}
        name={pkg.displayName}
        className="store-card-image"
        letterClassName="store-card-image-letter"
      />
      <div className="store-card-body">
        <div className="store-card-top">
          <span className="store-card-name">{pkg.displayName}</span>
          <div className="store-card-actions">
            <button
              type="button"
              className="store-icon-btn"
              aria-label="Share add-on"
              onClick={(event) => {
                event.stopPropagation();
                onShare();
              }}
            >
              <Share2 size={14} />
            </button>
            <button
              className="store-action-btn"
              data-variant={actionVariant}
              disabled={installed || installing}
              onClick={(event) => {
                event.stopPropagation();
                onInstall();
              }}
              type="button"
            >
              {actionLabel}
            </button>
          </div>
        </div>
        <div className="store-card-desc">{pkg.description}</div>
        <div className="store-card-footer">
          <AuthorChip name={pkg.authorDisplayName} handle={pkg.authorHandle} />
          <span className="store-card-installs">
            {formatInstallCount(pkg.installCount)}
          </span>
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({
  pkg,
  installed,
  installing,
  onAction,
  onClick,
}: {
  pkg: StorePackage;
  installed: boolean;
  installing: boolean;
  onAction: () => void;
  onClick: () => void;
}) {
  const label = installing ? "Adding..." : installed ? "Added" : "Get";
  const variant = installing ? "working" : installed ? "added" : "get";
  return (
    <div className="store-featured" onClick={onClick}>
      <div
        className="store-featured-bg"
        style={{ background: getGradient(pkg.displayName) }}
      />
      <div className="store-featured-overlay" />
      <div className="store-featured-content">
        <PackageArtwork
          iconUrl={pkg.iconUrl}
          name={pkg.displayName}
          className="store-featured-icon"
          letterClassName="store-featured-icon-letter"
        />
        <div className="store-featured-text">
          <div className="store-featured-label">Featured</div>
          <div className="store-featured-name">{pkg.displayName}</div>
          <div className="store-featured-desc">{pkg.description}</div>
          <AuthorChip
            name={pkg.authorDisplayName}
            handle={pkg.authorHandle}
            variant="featured"
          />
        </div>
        <button
          className="store-action-btn store-action-btn--lg"
          data-variant={variant}
          disabled={installed || installing}
          onClick={(event) => {
            event.stopPropagation();
            onAction();
          }}
          type="button"
        >
          {label}
        </button>
      </div>
    </div>
  );
}

function pickFeaturedPackage(packages: StorePackage[]): StorePackage | null {
  if (packages.length === 0) return null;
  const editorial = packages
    .filter((pkg) => pkg.featured === true)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    editorial[0] ??
    packages.slice().sort((a, b) => b.updatedAt - a.updatedAt)[0] ??
    null
  );
}

function Detail({
  pkg,
  releases,
  installed,
  installing,
  onBack,
  onInstall,
  onShare,
}: {
  pkg: StorePackage;
  releases: StoreRelease[];
  installed: boolean;
  installing: boolean;
  onBack: () => void;
  onInstall: () => void;
  onShare: () => void;
}) {
  const latestRelease = releases[0];
  const latestNotes = latestRelease ? getReleaseNotes(latestRelease) : undefined;
  const actionLabel = installing ? "Adding..." : installed ? "Added" : "Add to Stella";
  const actionVariant = installing ? "working" : installed ? "added" : "get";
  return (
    <div className="store-detail">
      <button className="store-detail-back" onClick={onBack} type="button">
        <ChevronLeft size={16} />
        Back
      </button>
      <div className="store-detail-hero">
        <PackageArtwork
          iconUrl={pkg.iconUrl}
          name={pkg.displayName}
          className="store-detail-image"
          letterClassName="store-detail-image-letter"
        />
        <div className="store-detail-info">
          <div className="store-detail-name">{pkg.displayName}</div>
          <div className="store-detail-desc">{pkg.description}</div>
          <AuthorChip
            name={pkg.authorDisplayName}
            handle={pkg.authorHandle}
            variant="detail"
          />
          <div className="store-detail-meta store-detail-meta--spaced">
            <span className="store-detail-meta-item">
              <Layers size={13} />
              Version {pkg.latestReleaseNumber}
            </span>
            <span className="store-detail-meta-item">
              <Clock size={13} />
              Updated {formatTimeAgo(pkg.updatedAt)}
            </span>
            <span className="store-detail-meta-item">
              {formatInstallCount(pkg.installCount)}
            </span>
          </div>
          <div className="store-detail-actions">
            <button
              className="store-action-btn store-action-btn--lg"
              data-variant={actionVariant}
              disabled={installed || installing}
              onClick={onInstall}
              type="button"
            >
              {actionLabel}
            </button>
            <button
              type="button"
              className="store-icon-btn store-icon-btn--lg"
              aria-label="Share add-on"
              onClick={onShare}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {latestNotes ? (
        <div className="store-whats-new">
          <div className="store-whats-new-eyebrow">What&apos;s New</div>
          <div className="store-whats-new-version">
            Version {latestRelease!.releaseNumber}
            {latestRelease ? ` · ${formatDate(latestRelease.createdAt)}` : ""}
          </div>
          <div className="store-whats-new-body">{latestNotes}</div>
        </div>
      ) : null}

      {releases.length > 1 ? (
        <>
          <hr className="store-detail-divider" />
          <div className="store-detail-section">
            <div className="store-detail-section-title">Version History</div>
            <div className="store-version-list">
              {releases.slice(1).map((release) => {
                const notes = getReleaseNotes(release);
                const fileCount = getReleaseFileCount(release);
                return (
                  <div
                    key={release.releaseNumber}
                    className="store-version-item"
                  >
                    <div className="store-version-label">
                      Version {release.releaseNumber}
                    </div>
                    {notes ? (
                      <div className="store-version-notes">{notes}</div>
                    ) : null}
                    <div className="store-version-date">
                      {formatDate(release.createdAt)}
                      {fileCount > 0 ? ` · ${fileCount} items customized` : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function buildShareLink(authorHandle: string, packageId: string): string {
  return `stella://store/${authorHandle.trim().toLowerCase()}/${packageId.trim().toLowerCase()}`;
}

function ShareDialog({
  pkg,
  onClose,
}: {
  pkg: StorePackage;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const link = pkg.authorHandle
    ? buildShareLink(pkg.authorHandle, pkg.packageId)
    : null;

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // best-effort copy
    }
  };

  return (
    <StoreModal onClose={onClose}>
      <div className="share-addon-dialog-intro">
        <div className="share-addon-dialog-title">Share {pkg.displayName}</div>
        <p className="share-addon-dialog-description">
          {!link
            ? "This add-on doesn't have a public author handle yet, so it can't be shared. Claim a handle in Store settings first."
            : "Copy a link to share this add-on anywhere. Pasted into a Stella chat, it embeds as a card."}
        </p>
      </div>
      {link ? (
        <div className="share-addon-link-row">
          <code className="share-addon-link">{link}</code>
          <button
            type="button"
            className="store-action-btn"
            data-variant={copied ? "added" : "get"}
            onClick={() => void handleCopy()}
          >
            {copied ? (
              <>
                <Check size={14} /> Copied
              </>
            ) : (
              <>
                <Copy size={14} /> Copy link
              </>
            )}
          </button>
        </div>
      ) : null}
    </StoreModal>
  );
}

function InstallConfirmDialog({
  pkg,
  release,
  loading,
  onConfirm,
  onCancel,
}: {
  pkg: StorePackage;
  release: StoreRelease | null | undefined;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const blueprint = release?.blueprintMarkdown ?? "";
  return (
    <StoreModal onClose={onCancel}>
      <div className="store-blueprint-dialog-header">
        <div className="store-blueprint-dialog-title">
          Add {pkg.displayName}?
        </div>
      </div>
      <div className="store-blueprint-dialog-viewer">
        {loading ? (
          <div className="store-blueprint-dialog-loading">Loading blueprint…</div>
        ) : blueprint ? (
          <pre className="store-blueprint-dialog-markdown">{blueprint}</pre>
        ) : (
          <div className="store-blueprint-dialog-loading">
            This release doesn&apos;t have a blueprint yet.
          </div>
        )}
      </div>
      <div className="store-install-confirm-copy">
        Stella will implement this blueprint locally and commit the resulting
        changes so you can remove it later.
      </div>
      <div className="store-blueprint-dialog-actions">
        <button
          type="button"
          className="store-action-btn"
          data-variant="subtle"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="store-action-btn"
          data-variant="get"
          onClick={onConfirm}
          disabled={loading || !blueprint}
        >
          Add to Stella
        </button>
      </div>
    </StoreModal>
  );
}

function PetsTab() {
  const [query, setQuery] = useState("");
  const [detailsPet, setDetailsPet] = useState<PublicPet | null>(null);
  const [petState, setPetState] = useState<PetBridgeState>({
    installedPetIds: [],
    selectedPetId: null,
  });
  const [workingPetId, setWorkingPetId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const pets = useQuery(listPublicPets, {
    paginationOpts: { numItems: 48, cursor: null },
    sort: "downloads",
    ...(query.trim() ? { search: query.trim() } : {}),
  });
  const incrementDownloads = useMutation(incrementPetDownloads);
  const installedPetIds = new Set(petState.installedPetIds);

  useEffect(() => {
    const bridge = getDesktopStoreBridge();
    const request = bridge?.getPetState?.();
    if (!request) return;
    void request
      .then((state) => {
        if (isPetBridgeState(state)) setPetState(state);
      })
      .catch((error) => {
        console.error("Failed to read pet state", error);
      });
  }, []);

  const applyPetStateResult = (result: unknown, fallback: PetBridgeState) => {
    setPetState(isPetBridgeState(result) ? result : fallback);
  };

  const installPet = async (pet: PublicPet) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.installPet) {
      redirectToStoreSignIn();
      return;
    }
    setActionError(null);
    setWorkingPetId(pet.id);
    try {
      const result = await bridge.installPet({ pet });
      applyPetStateResult(result, {
        installedPetIds: Array.from(new Set([...petState.installedPetIds, pet.id])),
        selectedPetId: pet.id,
      });
      void incrementDownloads({ id: pet.id }).catch((error) => {
        console.error("Failed to record pet download", error);
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Couldn't get pet");
    } finally {
      setWorkingPetId(null);
    }
  };

  const selectPet = async (petId: string) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.selectPet) {
      redirectToStoreSignIn();
      return;
    }
    setActionError(null);
    setWorkingPetId(petId);
    try {
      const result = await bridge.selectPet({ petId });
      applyPetStateResult(result, {
        installedPetIds: petState.installedPetIds,
        selectedPetId: petId,
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Couldn't select pet");
    } finally {
      setWorkingPetId(null);
    }
  };

  const removePet = async (petId: string) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.removePet) return;
    setActionError(null);
    setWorkingPetId(petId);
    try {
      const result = await bridge.removePet({ petId });
      applyPetStateResult(result, {
        installedPetIds: petState.installedPetIds.filter((id) => id !== petId),
        selectedPetId: petState.selectedPetId === petId ? null : petState.selectedPetId,
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Couldn't remove pet");
    } finally {
      setWorkingPetId(null);
    }
  };

  return (
    <main className="pets-page">
      <header className="pets-page-header">
        <div className="pets-page-heading">
          <h1 className="pets-page-title">Pets</h1>
          <span className="pets-page-count">
            {pets ? `${pets.page.length}` : ""}
          </span>
        </div>
        <p className="pets-page-subtitle">
          Browse animated Stella pets and pick a companion for your desktop.
        </p>
      </header>
      <div className="pets-toolbar">
        <label className="pets-search">
          <Search className="pets-search-icon" size={15} />
          <input
            className="pets-search-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pets"
            value={query}
          />
        </label>
      </div>
      {actionError ? (
        <div className="store-status" data-variant="error">
          {actionError}
        </div>
      ) : null}
      {!pets ? (
        <div className="store-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="store-skeleton-card" key={index} />
          ))}
        </div>
      ) : (
        <div className="pets-grid">
          {pets.page.map((pet) => {
            const installed = installedPetIds.has(pet.id);
            const selected = petState.selectedPetId === pet.id;
            const working = workingPetId === pet.id;
            return (
              <article
                className="pets-card pets-card-wrapper"
                data-selected={selected ? "true" : "false"}
                data-pet-state={
                  selected ? "selected" : installed ? "installed" : "uninstalled"
                }
                key={pet.id}
                onClick={() => setDetailsPet(pet)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setDetailsPet(pet);
                  }
                }}
              >
                <div className="pets-card-sprite">
                  <PetSpritePreview spritesheetUrl={pet.spritesheetUrl} size={84} />
                </div>
                <div className="pets-card-name-row">
                  <span className="pets-card-name">{pet.displayName}</span>
                </div>
                <div className="pets-card-meta">
                  <span className="pets-card-creator">by {pet.ownerName || "Stella"}</span>
                  <span className="pets-card-downloads">{pet.downloads}</span>
                </div>
                <div
                  className="pets-card-actions"
                  onClick={(event) => event.stopPropagation()}
                >
                  {!installed ? (
                    <button
                      className="store-action-btn"
                      data-variant={working ? "working" : "get"}
                      disabled={working}
                      onClick={() => void installPet(pet)}
                      type="button"
                    >
                      {working ? "Getting..." : "Get"}
                    </button>
                  ) : (
                    <>
                      <button
                        className="store-action-btn"
                        data-variant={selected ? "added" : working ? "working" : "get"}
                        disabled={selected || working}
                        onClick={() => void selectPet(pet.id)}
                        type="button"
                      >
                        {selected ? "Selected" : working ? "Selecting..." : "Select"}
                      </button>
                      <button
                        className="store-action-btn"
                        data-variant={working ? "working" : "remove"}
                        disabled={working}
                        onClick={() => void removePet(pet.id)}
                        type="button"
                      >
                        {working ? "Removing..." : "Remove"}
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      {detailsPet ? (
        <StoreModal onClose={() => setDetailsPet(null)}>
          <div className="pet-detail-dialog">
            <div className="pet-detail-title">{detailsPet.displayName}</div>
            <p className="pet-detail-caption">
              by {detailsPet.ownerName || "Stella"} · {detailsPet.downloads} selections
            </p>
            <div className="pet-detail-body">
              <div className="pet-detail-stage">
                <PetSpritePreview spritesheetUrl={detailsPet.spritesheetUrl} size={220} />
              </div>
              <p className="pet-detail-blurb">{detailsPet.description}</p>
              <div className="pet-detail-actions">
                {installedPetIds.has(detailsPet.id) ? (
                  <>
                    <button
                      className="store-action-btn store-action-btn--lg"
                      data-variant={
                        petState.selectedPetId === detailsPet.id ? "added" : "get"
                      }
                      disabled={
                        petState.selectedPetId === detailsPet.id ||
                        workingPetId === detailsPet.id
                      }
                      onClick={() => void selectPet(detailsPet.id)}
                      type="button"
                    >
                      {petState.selectedPetId === detailsPet.id
                        ? "Selected"
                        : workingPetId === detailsPet.id
                          ? "Selecting..."
                          : "Select"}
                    </button>
                    <button
                      className="store-action-btn store-action-btn--lg"
                      data-variant={
                        workingPetId === detailsPet.id ? "working" : "remove"
                      }
                      disabled={workingPetId === detailsPet.id}
                      onClick={() => {
                        void removePet(detailsPet.id).then(() => setDetailsPet(null));
                      }}
                      type="button"
                    >
                      {workingPetId === detailsPet.id ? "Removing..." : "Remove"}
                    </button>
                  </>
                ) : (
                  <button
                    className="store-action-btn store-action-btn--lg"
                    data-variant={workingPetId === detailsPet.id ? "working" : "get"}
                    disabled={workingPetId === detailsPet.id}
                    onClick={() => void installPet(detailsPet)}
                    type="button"
                  >
                    {workingPetId === detailsPet.id ? "Getting..." : "Get"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </StoreModal>
      ) : null}
    </main>
  );
}

function EmojisTab() {
  const [query, setQuery] = useState("");
  const [detailsPack, setDetailsPack] = useState<EmojiPack | null>(null);
  const [previewSheet, setPreviewSheet] = useState(0);
  const [emojiState, setEmojiState] = useState<EmojiBridgeState>({
    activePack: null,
  });
  const [workingPackId, setWorkingPackId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const packs = useQuery(listPublicEmojiPacks, {
    paginationOpts: { numItems: 48, cursor: null },
    sort: "installs",
    ...(query.trim() ? { search: query.trim() } : {}),
  });
  const recordInstall = useMutation(recordEmojiInstall);

  useEffect(() => {
    const bridge = getDesktopStoreBridge();
    const request = bridge?.getEmojiPackState?.();
    if (!request) return;
    void request
      .then((state) => {
        if (isEmojiBridgeState(state)) setEmojiState(state);
      })
      .catch((error) => {
        console.error("Failed to read emoji pack state", error);
      });
  }, []);

  const applyEmojiStateResult = (result: unknown, fallback: EmojiBridgeState) => {
    setEmojiState(isEmojiBridgeState(result) ? result : fallback);
  };

  const installEmojiPack = async (pack: EmojiPack) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.installEmojiPack) {
      redirectToStoreSignIn();
      return;
    }
    setActionError(null);
    setWorkingPackId(pack.packId);
    try {
      const result = await bridge.installEmojiPack({
        packId: pack.packId,
        sheetUrls: pack.sheetUrls,
      });
      applyEmojiStateResult(result, {
        activePack: { packId: pack.packId, sheetUrls: pack.sheetUrls },
      });
      void recordInstall({ packId: pack.packId }).catch((error) => {
        console.error("Failed to record emoji pack install", error);
      });
      setDetailsPack(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Couldn't use emoji pack",
      );
    } finally {
      setWorkingPackId(null);
    }
  };

  const clearEmojiPack = async (packId: string) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.clearEmojiPack) return;
    setActionError(null);
    setWorkingPackId(packId);
    try {
      const result = await bridge.clearEmojiPack({ packId });
      applyEmojiStateResult(result, { activePack: null });
      setDetailsPack(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Couldn't stop using pack",
      );
    } finally {
      setWorkingPackId(null);
    }
  };

  return (
    <main className="emoji-page">
      <header className="emoji-page-header">
        <div className="emoji-page-heading">
          <h1 className="emoji-page-title">Emojis</h1>
        </div>
        <p className="emoji-page-subtitle">
          Browse expressive emoji packs to use in Stella chat.
        </p>
      </header>
      <div className="emoji-page-toolbar">
        <label className="emoji-page-search">
          <Search className="emoji-page-search-icon" size={15} />
          <input
            className="emoji-page-search-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search emoji packs"
            value={query}
          />
        </label>
      </div>
      {actionError ? (
        <div className="store-status" data-variant="error">
          {actionError}
        </div>
      ) : null}
      {!packs ? (
        <div className="emoji-pack-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="store-skeleton-card" key={index} />
          ))}
        </div>
      ) : (
        <div className="emoji-pack-grid">
          {packs.page.map((pack) => {
            const active = emojiState.activePack?.packId === pack.packId;
            return (
              <article
                className="emoji-pack-card"
                data-active={active || undefined}
                key={pack._id}
              >
                <button
                  type="button"
                  className="emoji-pack-cover"
                  onClick={() => {
                    setPreviewSheet(0);
                    setDetailsPack(pack);
                  }}
                >
                  {pack.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="emoji-pack-cover-img" src={pack.coverUrl} />
                  ) : (
                    <span className="emoji-pack-cover-glyph">{pack.coverEmoji}</span>
                  )}
                </button>
                <div className="emoji-pack-body">
                  <div className="emoji-pack-name-row">
                    <span className="emoji-pack-name">{pack.displayName}</span>
                  </div>
                  {pack.description ? (
                    <span className="emoji-pack-desc">{pack.description}</span>
                  ) : null}
                  <div className="emoji-pack-meta">
                    <span className="emoji-pack-author">
                      by {pack.authorDisplayName || pack.authorHandle || "Stella"}
                    </span>
                    <span className="emoji-pack-installs">
                      {(pack.installCount ?? 0) || "New"} uses
                    </span>
                  </div>
                </div>
                <div className="emoji-pack-actions">
                  <button
                    className="store-action-btn"
                    data-variant={active ? "added" : "get"}
                    onClick={() => {
                      setPreviewSheet(0);
                      setDetailsPack(pack);
                    }}
                    type="button"
                  >
                    {active ? "Active" : "Get"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {detailsPack ? (
        <StoreModal onClose={() => setDetailsPack(null)}>
          <div className="emoji-details-dialog">
            <div className="emoji-details-title">{detailsPack.displayName}</div>
            <p className="emoji-details-caption">
              {detailsPack.description ||
                `Pack by ${detailsPack.authorDisplayName || detailsPack.authorHandle || "Stella"}`}
            </p>
            <div className="emoji-details-body">
              <div className="emoji-details-preview">
                <div className="emoji-details-preview-tabs">
                  <button
                    type="button"
                    className="emoji-create-arrow"
                    disabled={previewSheet === 0}
                    onClick={() => setPreviewSheet((sheet) => Math.max(0, sheet - 1))}
                    aria-label="Previous sheet"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="emoji-create-preview-label">
                    Sheet {previewSheet + 1} of {Math.max(1, detailsPack.sheetUrls.length)}
                  </span>
                  <button
                    type="button"
                    className="emoji-create-arrow"
                    disabled={previewSheet >= detailsPack.sheetUrls.length - 1}
                    onClick={() =>
                      setPreviewSheet((sheet) =>
                        Math.min(detailsPack.sheetUrls.length - 1, sheet + 1),
                      )
                    }
                    aria-label="Next sheet"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="emoji-create-grid" data-state="ready">
                  {Array.from({ length: 64 }).map((_, index) => (
                    <div key={index} className="emoji-create-cell">
                      <EmojiCellPreview
                        sheetUrl={
                          detailsPack.sheetUrls[previewSheet] ??
                          detailsPack.sheetUrls[0] ??
                          ""
                        }
                        cell={index}
                        gridSize={8}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="emoji-details-side">
                <div className="emoji-details-meta">
                  <div className="emoji-details-meta-row">
                    <span className="emoji-details-meta-label">Cover</span>
                    <span className="emoji-details-meta-value">
                      {detailsPack.coverEmoji}
                    </span>
                  </div>
                  <div className="emoji-details-meta-row">
                    <span className="emoji-details-meta-label">Author</span>
                    <span className="emoji-details-meta-value">
                      {detailsPack.authorDisplayName ||
                        detailsPack.authorHandle ||
                        "Stella"}
                    </span>
                  </div>
                </div>
                <div className="emoji-details-actions">
                  <button
                    className="store-action-btn store-action-btn--lg"
                    data-variant={
                      workingPackId === detailsPack.packId
                        ? "working"
                        : emojiState.activePack?.packId === detailsPack.packId
                          ? "added"
                          : "get"
                    }
                    disabled={workingPackId === detailsPack.packId}
                    onClick={() => {
                      if (emojiState.activePack?.packId === detailsPack.packId) {
                        void clearEmojiPack(detailsPack.packId);
                        return;
                      }
                      void installEmojiPack(detailsPack);
                    }}
                    type="button"
                  >
                    {workingPackId === detailsPack.packId
                      ? "Working..."
                      : emojiState.activePack?.packId === detailsPack.packId
                        ? "Stop using"
                        : "Get & use pack"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </StoreModal>
      ) : null}
    </main>
  );
}

function FashionTab() {
  const status = useQuery(getFashionFeatureStatus, {});
  const [actionError, setActionError] = useState<string | null>(null);
  return (
    <div className="fashion-root">
      <div className="fashion-blank">
        <div className="fashion-blank-inner">
          <div className="fashion-blank-eyebrow">Fashion</div>
          <div className="fashion-blank-title">
            {status?.shopifyConfigured === false
              ? "Fashion is not set up yet"
              : "Find your next look"}
          </div>
          <div className="fashion-blank-subtitle">
            Generate outfits, save pieces, and check out from Stella.
          </div>
          {actionError ? (
            <div className="store-status" data-variant="error">
              {actionError}
            </div>
          ) : null}
          <button
            className="fashion-blank-cta"
            onClick={() => {
              setActionError(null);
              void openNativeStorePanel().then((opened) => {
                if (!opened) {
                  setActionError("Open Fashion from Stella to start styling.");
                }
              });
            }}
            type="button"
          >
            Start styling
          </button>
        </div>
      </div>
    </div>
  );
}

function StoreClientInner() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StoreCategory | "all">("all");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [sharePkg, setSharePkg] = useState<StorePackage | null>(null);
  const [pendingInstall, setPendingInstall] = useState<StorePackage | null>(null);
  const [urlState, setUrlState] = useState({
    tab: "discover",
    packageId: null as string | null,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrlState({
      tab: params.get("tab") || "discover",
      packageId: params.get("package"),
    });
  }, []);

  const activeTab = normalizeHostedStoreTab(urlState.tab);
  const initialPackageId = urlState.packageId;

  useEffect(() => {
    if (initialPackageId && !selectedPackageId) {
      setSelectedPackageId(initialPackageId);
    }
  }, [initialPackageId, selectedPackageId]);

  const selectedCategory = filter === "all" ? undefined : filter;
  const browse = useQuery(listPublicPackages, {
    paginationOpts: { numItems: 80, cursor: null },
  });
  const search = useQuery(
    searchPublicPackages,
    query.trim() ? { query: query.trim(), category: selectedCategory } : "skip",
  );
  const selectedPackage = useQuery(
    getPublicPackage,
    selectedPackageId ? { packageId: selectedPackageId } : "skip",
  );
  const selectedReleases = useQuery(
    listPublicReleases,
    selectedPackageId ? { packageId: selectedPackageId } : "skip",
  );
  const recordInstall = useMutation(recordPackageInstall);

  const allPackages = query.trim() ? search : browse?.page;
  const filtered = (allPackages ?? []).filter((pkg) => {
    if (filter !== "all") {
      const category = pkg.category ?? "other";
      if (category !== filter) return false;
    }
    return true;
  });
  const featured = pickFeaturedPackage(allPackages ?? []);
  const showFeatured =
    featured !== null && filter === "all" && query.trim() === "";
  const rest = filtered.filter(
    (pkg) => !showFeatured || pkg.packageId !== featured!.packageId,
  );

  const pendingInstallReleases = useQuery(
    listPublicReleases,
    pendingInstall ? { packageId: pendingInstall.packageId } : "skip",
  );
  const pendingInstallRelease =
    pendingInstallReleases?.find(
      (release) =>
        pendingInstall &&
        release.releaseNumber === pendingInstall.latestReleaseNumber,
    ) ?? pendingInstallReleases?.[0];

  const requestInstall = (pkg: StorePackage) => {
    setPendingInstall(pkg);
  };

  const installPackage = async (pkg: StorePackage, release?: StoreRelease | null) => {
    if (!window.stellaDesktopStore) {
      window.location.href = "/sign-in?next=/store";
      return;
    }
    setInstallingId(pkg.packageId);
    try {
      const targetRelease =
        release ??
        (await window.stellaDesktopStore.getRelease({
          packageId: pkg.packageId,
          releaseNumber: pkg.latestReleaseNumber,
        }));
      if (!targetRelease?.blueprintMarkdown) {
        throw new Error("This package is missing its install blueprint.");
      }
      await window.stellaDesktopStore.installFromBlueprint({
        packageId: pkg.packageId,
        releaseNumber: targetRelease.releaseNumber,
        displayName: pkg.displayName,
        blueprintMarkdown: targetRelease.blueprintMarkdown,
        commits: targetRelease.commits,
      });
      await recordInstall({ packageId: pkg.packageId });
      setInstalledIds((previous) => new Set(previous).add(pkg.packageId));
    } finally {
      setInstallingId(null);
    }
  };

  useEffect(() => {
    void window.stellaDesktopStore?.listInstalledMods().then((mods) => {
      setInstalledIds(new Set(mods.map((mod) => mod.packageId)));
    });
  }, []);

  if (activeTab !== "discover") {
    return (
      <main className="store-root" data-tab={activeTab}>
        <StoreWebTabs activeTab={activeTab} />
        {activeTab === "pets" ? (
          <PetsTab />
        ) : activeTab === "emojis" ? (
          <EmojisTab />
        ) : activeTab === "fashion" ? (
          <FashionTab />
        ) : (
          <div className="store-scroll">
            <EmptyState
              icon={<Package size={32} />}
              title="Store unavailable"
              description="Unknown Store tab."
            />
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="store-root" data-tab="discover">
      <StoreWebTabs activeTab="discover" />
      {!selectedPackage ? (
        <button
          className="store-action-btn store-action-btn--lg store-upload-btn"
          data-variant="get"
          type="button"
          onClick={() => {
            void openNativeStorePanel().then((opened) => {
              if (!opened) redirectToStoreSignIn();
            });
          }}
        >
          Upload to Store
        </button>
      ) : null}
      <div className="store-scroll">
        {selectedPackage ? (
          <Detail
            pkg={selectedPackage}
            releases={selectedReleases ?? []}
            installed={installedIds.has(selectedPackage.packageId)}
            installing={installingId === selectedPackage.packageId}
            onBack={() => {
              setSelectedPackageId(null);
              if (initialPackageId) {
                const next = new URL(window.location.href);
                next.searchParams.delete("package");
                window.history.replaceState({}, "", next.toString());
              }
            }}
            onInstall={() => requestInstall(selectedPackage)}
            onShare={() => setSharePkg(selectedPackage)}
          />
        ) : (
          <>
            <div className="store-toolbar">
              <div className="store-search">
                <Search size={14} className="store-search-icon" />
                <input
                  className="store-search-input"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the Store"
                  value={query}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <div className="store-filter">
                {DISCOVER_FILTERS.map((entry) => (
                  <button
                    key={entry.id}
                    className="store-filter-pill"
                    data-active={filter === entry.id || undefined}
                    onClick={() => setFilter(entry.id)}
                    type="button"
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            </div>
            {showFeatured && featured ? (
              <FeaturedCard
                pkg={featured}
                installed={installedIds.has(featured.packageId)}
                installing={installingId === featured.packageId}
                onAction={() => requestInstall(featured)}
                onClick={() => setSelectedPackageId(featured.packageId)}
              />
            ) : null}
            {!allPackages ? (
              <SkeletonGrid />
            ) : rest.length === 0 ? (
              <EmptyState
                icon={
                  query.trim() !== "" || filter !== "all" ? (
                    <Search size={32} />
                  ) : (
                    <Package size={32} />
                  )
                }
                title={
                  query.trim() !== "" || filter !== "all"
                    ? "No matches"
                    : "Nothing here yet"
                }
                description={
                  query.trim() !== "" || filter !== "all"
                    ? "Try a different search or category."
                    : "Add-ons for Stella will appear here as they become available."
                }
              />
            ) : (
              <div className="store-section">
                <div className="store-section-header">
                  <span className="store-section-title">
                    {query.trim() === "" && filter === "all"
                      ? "All Add-ons"
                      : "Results"}
                  </span>
                  <span className="store-section-count">{rest.length}</span>
                </div>
                <div className="store-grid">
                  {rest.map((pkg) => (
                    <PackageCard
                      key={pkg.packageId}
                      pkg={pkg}
                      installed={installedIds.has(pkg.packageId)}
                      installing={installingId === pkg.packageId}
                      onOpen={() => setSelectedPackageId(pkg.packageId)}
                      onInstall={() => requestInstall(pkg)}
                      onShare={() => setSharePkg(pkg)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {sharePkg ? (
        <ShareDialog pkg={sharePkg} onClose={() => setSharePkg(null)} />
      ) : null}
      {pendingInstall ? (
        <InstallConfirmDialog
          pkg={pendingInstall}
          release={pendingInstallRelease ?? null}
          loading={pendingInstallReleases === undefined}
          onCancel={() => setPendingInstall(null)}
          onConfirm={() => {
            const pkg = pendingInstall;
            const release = pendingInstallRelease ?? null;
            setPendingInstall(null);
            void installPackage(pkg, release);
          }}
        />
      ) : null}
    </main>
  );
}

export function StoreClient() {
  if (!isConvexConfigured()) {
    return (
      <main className="store-root" data-tab="discover">
        <div className="store-scroll">
          <EmptyState
            icon={<Package size={32} />}
            title="Store unavailable"
            description="Convex is not configured for this website build."
          />
        </div>
      </main>
    );
  }
  return <StoreClientInner />;
}
