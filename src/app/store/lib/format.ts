import type { StoreBadge, StoreInstall, StorePackage, StoreRelease } from "./types";

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimeAgo(ms: number): string {
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

export function formatInstallCount(count: number | undefined): string | null {
  const n = count ?? 0;
  if (n <= 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M installs`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K installs`;
  return `${n} install${n === 1 ? "" : "s"}`;
}

export function getReleaseFileCount(release: StoreRelease): number {
  const files = release.manifest?.files ?? release.manifest?.changedFiles;
  return Array.isArray(files) ? files.length : 0;
}

export function getReleaseNotes(release: StoreRelease): string | undefined {
  const notes =
    release.releaseNotes ??
    release.manifest?.releaseNotes ??
    release.manifest?.summary;
  return typeof notes === "string" && notes.trim() ? notes.trim() : undefined;
}

export function isStoreUpdateAvailable(
  pkg: StorePackage,
  installed?: StoreInstall,
): boolean {
  return typeof installed?.releaseNumber === "number"
    ? installed.releaseNumber < pkg.latestReleaseNumber
    : false;
}

/** Normalize author line for cards — strip leading @, default Stella → verified. */
export function resolveStoreAuthorDisplay(
  username?: string,
  badge?: StoreBadge,
): { username?: string; badge?: StoreBadge } {
  if (!username?.trim()) return {};
  const normalized = username.trim().replace(/^@+/, "");
  if (!normalized) return {};
  const resolvedBadge =
    badge ?? (normalized.toLowerCase() === "stella" ? "verified" : undefined);
  return { username: normalized, badge: resolvedBadge };
}
