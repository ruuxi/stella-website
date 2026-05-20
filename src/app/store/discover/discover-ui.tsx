"use client";

import { useMemo } from "react";
import { ChevronLeft, Clock, Layers } from "lucide-react";
import {
  formatDate,
  formatInstallCount,
  formatTimeAgo,
  getReleaseFileCount,
  getReleaseNotes,
  isStoreUpdateAvailable,
} from "../lib/format";
import type {
  NativeIntegration,
  StoreInstall,
  StorePackage,
  StoreRelease,
} from "../lib/types";
import { getGradient } from "../lib/artwork";
import { AuthorChip, PackageArtwork } from "../components/shared";

export function PackageCard({
  pkg,
  installed,
  updateAvailable = false,
  installing,
  onOpen,
  onInstall,
}: {
  pkg: StorePackage;
  installed: boolean;
  updateAvailable?: boolean;
  installing: boolean;
  onOpen: () => void;
  onInstall: () => void;
}) {
  const actionLabel = installing
    ? updateAvailable
      ? "Updating..."
      : "Adding..."
    : updateAvailable
      ? "Update"
      : installed
        ? "Added"
        : "Get";
  const actionVariant = installing
    ? "working"
    : updateAvailable
      ? "get"
      : installed
        ? "added"
        : "get";
  const installLabel = formatInstallCount(pkg.installCount);
  return (
    <div
      className="store-card"
      data-clickable="true"
      onClick={onOpen}
    >
      <div className="store-card-main">
        <PackageArtwork
          iconUrl={pkg.iconUrl}
          name={pkg.displayName}
          className="store-card-image"
          letterClassName="store-card-image-letter"
          zoomArtwork
        />
        <div className="store-card-body">
          <span className="store-card-name">{pkg.displayName}</span>
          <div className="store-card-desc">{pkg.description}</div>
        </div>
      </div>
      <div className="store-card-footer">
        <div className="store-card-footer-start">
          <AuthorChip
            username={pkg.authorUsername}
            badge={pkg.authorBadge}
          />
          {installLabel ? (
            <span className="store-card-installs">{installLabel}</span>
          ) : null}
        </div>
        <button
          className="store-action-btn"
          data-variant={actionVariant}
          disabled={(installed && !updateAvailable) || installing}
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
  );
}

export function NativeIntegrationCard({
  integration,
  busy,
  onConnect,
  onDisconnect,
}: {
  integration: NativeIntegration;
  busy: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const enabled = integration.enabled === true;
  const connectable = integration.connectable !== false;
  const actionLabel = !connectable
    ? integration.oauthSetupGroup
      ? `${integration.oauthSetupGroup.name} setup`
      : integration.oauthProviderTemplate
        ? "App setup"
        : integration.oauthSetupStatus === "missing_backend_exchange"
          ? "Server setup"
          : integration.oauthSetupStatus === "missing_callback_bridge"
            ? "Callback setup"
            : "OAuth setup"
    : busy
      ? enabled
        ? "Removing..."
        : "Adding..."
      : enabled
        ? "Added"
        : "Add";
  const actionVariant = busy ? "working" : enabled ? "added" : "get";
  const handleAction = () => {
    if (!connectable || busy) return;
    if (enabled) onDisconnect();
    else onConnect();
  };
  const actionCount =
    integration.actionCount ??
    integration.catalogToolCount ??
    integration.toolCount ??
    0;
  return (
    <div
      className="store-card"
      data-clickable={connectable ? "true" : "false"}
      onClick={handleAction}
      onKeyDown={(event) => {
        if (!connectable || busy) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleAction();
        }
      }}
      role={connectable ? "button" : undefined}
      tabIndex={connectable ? 0 : undefined}
    >
      <div className="store-card-main">
        <PackageArtwork
          iconUrl={integration.iconUrl}
          name={integration.name}
          className="store-card-image"
          letterClassName="store-card-image-letter"
          zoomArtwork
        />
        <div className="store-card-body">
          <span className="store-card-name">{integration.name}</span>
          <div className="store-card-desc">
            {connectable
              ? integration.description
              : integration.oauthSetupMessage || integration.description}
          </div>
        </div>
      </div>
      <div className="store-card-footer">
        <div className="store-card-footer-start">
          <AuthorChip username="Stella" badge="verified" />
          <span className="store-card-installs">{`${actionCount} actions`}</span>
        </div>
        <button
          className="store-action-btn"
          data-variant={actionVariant}
          disabled={busy || !connectable}
          onClick={(event) => {
            event.stopPropagation();
            handleAction();
          }}
          type="button"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export function FeaturedCard({
  pkg,
  installed,
  updateAvailable = false,
  installing,
  onAction,
  onClick,
}: {
  pkg: StorePackage;
  installed: boolean;
  updateAvailable?: boolean;
  installing: boolean;
  onAction: () => void;
  onClick: () => void;
}) {
  const label = installing
    ? updateAvailable
      ? "Updating..."
      : "Adding..."
    : updateAvailable
      ? "Update"
      : installed
        ? "Added"
        : "Get";
  const variant = installing
    ? "working"
    : updateAvailable
      ? "get"
      : installed
        ? "added"
        : "get";
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
          zoomArtwork
        />
        <div className="store-featured-text">
          <div className="store-featured-label">Featured</div>
          <div className="store-featured-name">{pkg.displayName}</div>
          <div className="store-featured-desc">{pkg.description}</div>
          <AuthorChip
            username={pkg.authorUsername}
            badge={pkg.authorBadge}
            variant="featured"
          />
        </div>
        <button
          className="store-action-btn store-action-btn--lg"
          data-variant={variant}
          disabled={(installed && !updateAvailable) || installing}
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

export function AddedRow({
  installed,
  packages,
  onSelect,
}: {
  installed: StoreInstall[];
  packages: StorePackage[];
  onSelect: (packageId: string) => void;
}) {
  const pkgMap = useMemo(() => {
    const map = new Map<string, StorePackage>();
    for (const pkg of packages) map.set(pkg.packageId, pkg);
    return map;
  }, [packages]);

  if (installed.length === 0) return null;

  return (
    <div className="store-section">
      <div className="store-section-header">
        <span className="store-section-title">Added to Stella</span>
        <span className="store-section-count">{installed.length}</span>
      </div>
      <div className="store-added-row">
        {installed.map((mod) => {
          const pkg = pkgMap.get(mod.packageId);
          const name = pkg?.displayName ?? mod.displayName ?? "Add-on";
          const updateAvailable = pkg ? isStoreUpdateAvailable(pkg, mod) : false;
          return (
            <div
              key={mod.packageId}
              className="store-added-chip"
              onClick={() => onSelect(mod.packageId)}
            >
              <PackageArtwork
                iconUrl={pkg?.iconUrl}
                name={name}
                className="store-added-chip-icon"
                letterClassName="store-added-chip-letter"
              />
              <span className="store-added-chip-name">{name}</span>
              {updateAvailable ? (
                <span className="store-added-chip-badge">Update</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function Detail({
  pkg,
  releases,
  installedRecord,
  installing,
  onBack,
  onInstall,
  onRemove,
}: {
  pkg: StorePackage;
  releases: StoreRelease[];
  installedRecord?: StoreInstall;
  installing: boolean;
  onBack: () => void;
  onInstall: () => void;
  onRemove: () => void;
}) {
  const latestRelease = releases[0];
  const latestNotes = latestRelease ? getReleaseNotes(latestRelease) : undefined;
  const installed = Boolean(installedRecord);
  const updateAvailable = isStoreUpdateAvailable(pkg, installedRecord);
  const installLabel = formatInstallCount(pkg.installCount);
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
            username={pkg.authorUsername}
            badge={pkg.authorBadge}
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
            {installLabel ? (
              <span className="store-detail-meta-item">{installLabel}</span>
            ) : null}
          </div>
          <div className="store-detail-actions">
            {installed ? (
              <>
                {updateAvailable ? (
                  <button
                    className="store-action-btn store-action-btn--lg"
                    data-variant={installing ? "working" : "get"}
                    disabled={installing}
                    onClick={onInstall}
                    type="button"
                  >
                    {installing ? "Updating..." : "Update"}
                  </button>
                ) : null}
                <button
                  className="store-action-btn store-action-btn--lg"
                  data-variant={installing ? "working" : "remove"}
                  disabled={installing}
                  onClick={onRemove}
                  type="button"
                >
                  {installing ? "Removing..." : "Remove"}
                </button>
              </>
            ) : (
              <button
                className="store-action-btn store-action-btn--lg"
                data-variant={installing ? "working" : "get"}
                disabled={installing}
                onClick={onInstall}
                type="button"
              >
                {installing ? "Adding..." : "Add to Stella"}
              </button>
            )}
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
