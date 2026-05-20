"use client";

import { useQuery } from "convex/react";
import { listPublicReleases } from "../lib/convex";
import { PackageArtwork, StoreModal } from "../components/shared";
import { StoreMarkdown } from "../components/store-markdown";
import type { StorePackage } from "../lib/types";

type InstallConfirmDialogProps = {
  pkg: StorePackage;
  /** True when the user already has an older version installed. */
  isUpdate: boolean;
  installing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Replaces the OS install-confirmation dialog with an in-app modal
 * that renders the package blueprint as proper markdown. Used for
 * every Store package install/update entry point (cards, featured,
 * detail page, Library).
 */
export function InstallConfirmDialog({
  pkg,
  isUpdate,
  installing,
  onCancel,
  onConfirm,
}: InstallConfirmDialogProps) {
  const releases = useQuery(listPublicReleases, { packageId: pkg.packageId });
  const latestRelease = releases?.[0];
  const blueprint = latestRelease?.blueprintMarkdown?.trim();
  const loading = releases === undefined;
  const confirmLabel = installing
    ? isUpdate
      ? "Updating…"
      : "Installing…"
    : isUpdate
      ? `Update to v${pkg.latestReleaseNumber}`
      : "Install";
  return (
    <StoreModal onClose={installing ? () => undefined : onCancel}>
      <div className="store-install-dialog">
        <header className="store-install-dialog-header">
          <PackageArtwork
            iconUrl={pkg.iconUrl}
            name={pkg.displayName}
            className="store-install-dialog-icon"
            letterClassName="store-install-dialog-icon-letter"
          />
          <div className="store-install-dialog-heading">
            <div className="store-install-dialog-title">
              {isUpdate ? "Update" : "Install"} {pkg.displayName}?
            </div>
            <div className="store-install-dialog-sub">
              Review the blueprint Stella will apply to your desktop app.
              Version {pkg.latestReleaseNumber}
              {pkg.authorUsername ? ` · @${pkg.authorUsername}` : ""}
            </div>
          </div>
        </header>
        <div className="store-install-dialog-viewer">
          {loading ? (
            <div className="store-install-dialog-loading" aria-busy="true">
              Loading blueprint…
            </div>
          ) : blueprint ? (
            <StoreMarkdown text={blueprint} />
          ) : (
            <div className="store-install-dialog-loading">
              This package has no blueprint content to display.
            </div>
          )}
        </div>
        <div className="store-install-dialog-actions">
          <button
            type="button"
            className="store-action-btn"
            data-variant="added"
            onClick={onCancel}
            disabled={installing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="store-action-btn"
            data-variant={installing ? "working" : "get"}
            onClick={onConfirm}
            disabled={installing || loading || !blueprint}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </StoreModal>
  );
}
