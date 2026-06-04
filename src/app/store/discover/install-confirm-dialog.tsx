"use client";

import { useMemo, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { getReleaseDiff, listPublicReleases } from "../lib/convex";
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
 * Replaces the OS install-confirmation dialog with an in-app modal that renders
 * the source-backed release summary as proper markdown. Used for every Store
 * package install/update entry point (cards, featured, detail page, Library).
 */
export function InstallConfirmDialog({
  pkg,
  isUpdate,
  installing,
  onCancel,
  onConfirm,
}: InstallConfirmDialogProps) {
  const releases = useQuery(listPublicReleases, { packageId: pkg.packageId });
  const loadReleaseDiff = useAction(getReleaseDiff);
  const [activeTab, setActiveTab] = useState<"summary" | "diff">("summary");
  const [loadedDiff, setLoadedDiff] = useState<string | null>(null);
  const [loadedDiffKey, setLoadedDiffKey] = useState<string | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffError, setDiffError] = useState<string | null>(null);
  const latestRelease = releases?.[0];
  const releaseKey = latestRelease
    ? `${latestRelease.packageId}:${latestRelease.releaseNumber}`
    : null;
  const releaseSummary = latestRelease?.blueprintMarkdown?.trim();
  const inlineDiff = latestRelease?.diff?.trim() || null;
  const previewDiff = inlineDiff ?? (loadedDiffKey === releaseKey ? loadedDiff : null);
  const hasDiffPreview = Boolean(previewDiff || latestRelease?.diffRef);
  const loading = releases === undefined;
  const diffPreviewText = useMemo(() => {
    if (!previewDiff) return "";
    const limit = 120_000;
    return previewDiff.length <= limit
      ? previewDiff
      : `${previewDiff.slice(0, limit)}\n\n[Diff preview truncated]`;
  }, [previewDiff]);

  const openDiffPreview = () => {
    setActiveTab("diff");
    if (
      inlineDiff ||
      (loadedDiffKey === releaseKey && loadedDiff) ||
      !latestRelease?.diffRef ||
      !releaseKey ||
      diffLoading
    ) {
      return;
    }
    setDiffLoading(true);
    setDiffError(null);
    void loadReleaseDiff({
      packageId: latestRelease.packageId,
      releaseNumber: latestRelease.releaseNumber,
    })
      .then((diff) => {
        setLoadedDiffKey(releaseKey);
        setLoadedDiff(diff?.trim() || null);
      })
      .catch(() => {
        setDiffError("Could not load the source diff preview.");
      })
      .finally(() => {
        setDiffLoading(false);
      });
  };

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
              Review the source-backed release Stella will import. Version{" "}
              {pkg.latestReleaseNumber}
              {pkg.authorUsername ? ` · @${pkg.authorUsername}` : ""}
            </div>
          </div>
        </header>
        {!loading && hasDiffPreview ? (
          <div className="store-install-dialog-tabs" role="tablist">
            <button
              type="button"
              className="store-install-dialog-tab"
              data-active={activeTab === "summary" ? "true" : "false"}
              onClick={() => setActiveTab("summary")}
            >
              Summary
            </button>
            <button
              type="button"
              className="store-install-dialog-tab"
              data-active={activeTab === "diff" ? "true" : "false"}
              onClick={openDiffPreview}
            >
              Source diff
            </button>
          </div>
        ) : null}
        <div className="store-install-dialog-viewer">
          {loading ? (
            <div className="store-install-dialog-loading" aria-busy="true">
              Loading release…
            </div>
          ) : activeTab === "diff" ? (
            diffLoading ? (
              <div className="store-install-dialog-loading" aria-busy="true">
                Loading source diff…
              </div>
            ) : diffError ? (
              <div className="store-install-dialog-loading">{diffError}</div>
            ) : diffPreviewText ? (
              <pre className="store-install-dialog-diff">{diffPreviewText}</pre>
            ) : (
              <div className="store-install-dialog-loading">
                This release has no source diff preview.
              </div>
            )
          ) : releaseSummary ? (
            <StoreMarkdown text={releaseSummary} />
          ) : (
            <div className="store-install-dialog-loading">
              This package has no release summary to display.
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
            disabled={installing || loading || !releaseSummary}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </StoreModal>
  );
}
