"use client";

import type { KeyboardEvent } from "react";
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
import { nativeIntegrationActionLabel } from "../lib/integration-ui";
import { PackageArtwork, StoreAuthorHandle } from "../components/shared";
import { StoreMarkdown } from "../components/store-markdown";

function activateOnEnterOrSpace(
  event: KeyboardEvent,
  action: () => void,
): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

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
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => activateOnEnterOrSpace(event, onOpen)}
    >
      <div className="store-card-main">
        <PackageArtwork
          iconUrl={pkg.iconUrl}
          name={pkg.displayName}
          className="store-card-image"
          letterClassName="store-card-image-letter"
        />
        <div className="store-card-body">
          <span className="store-card-name">{pkg.displayName}</span>
          <div className="store-card-desc">{pkg.description}</div>
        </div>
      </div>
      <div className="store-card-footer">
        <div className="store-card-footer-start">
          <StoreAuthorHandle
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
  const actionLabel = nativeIntegrationActionLabel(integration, { busy });
  const actionVariant = busy ? "working" : enabled ? "added" : "get";
  const handleAction = () => {
    if (!connectable || busy) return;
    if (enabled) onDisconnect();
    else onConnect();
  };
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
          <StoreAuthorHandle username="Stella" badge="verified" />
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
    <div
      className="store-featured"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => activateOnEnterOrSpace(event, onClick)}
    >
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
          <StoreAuthorHandle
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

export function Detail({
  pkg,
  releases,
  releasesLoading = false,
  installedRecord,
  installing,
  onBack,
  onInstall,
  onRemove,
}: {
  pkg: StorePackage;
  releases: StoreRelease[];
  releasesLoading?: boolean;
  installedRecord?: StoreInstall;
  installing: boolean;
  onBack: () => void;
  onInstall: () => void;
  onRemove: () => void;
}) {
  const latestRelease = releases[0];
  const latestReleaseSummary = latestRelease?.blueprintMarkdown?.trim();
  const latestNotes = latestRelease
    ? getReleaseNotes(latestRelease)
    : undefined;
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
          <StoreAuthorHandle
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

      {releasesLoading ? (
        <div className="store-detail-section store-detail-blueprint">
          <div className="store-detail-section-title">Release Summary</div>
          <div
            className="store-detail-blueprint-body store-detail-blueprint-body--loading"
            aria-busy="true"
          >
            Loading release…
          </div>
        </div>
      ) : latestReleaseSummary ? (
        <div className="store-detail-section store-detail-blueprint">
          <div className="store-detail-section-title">Release Summary</div>
          <div className="store-detail-blueprint-body">
            <StoreMarkdown text={latestReleaseSummary} />
          </div>
        </div>
      ) : null}

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
