"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Package, Search } from "lucide-react";
import {
  getPublicPackage,
  listPublicPackages,
  listPublicReleases,
  listStoreIntegrations,
  recordPackageInstall,
  searchPublicPackages,
} from "../lib/convex";
import { DISCOVER_FILTERS } from "../lib/constants";
import {
  getDesktopStoreBridge,
  mergeNativeIntegrationUpdate,
  isNativeIntegrationUserCancel,
  getNativeIntegrationErrorMessage,
  normalizeHostedStoreTab,
  openNativeStorePanel,
  redirectToStoreSignIn,
  ensureStoreAuth,
} from "../lib/bridge";
import { isStoreUpdateAvailable } from "../lib/format";
import type { NativeIntegration, StoreCategory, StoreInstall, StorePackage } from "../lib/types";
import {
  EmptyState,
  SkeletonGrid,
  StoreWebHero,
  StoreWebTabs,
  useIsEmbeddedWebsite,
} from "../components/shared";
import { pickFeaturedPackage, sortPackagesForYou } from "../lib/discover-ranking";
import {
  AddedRow,
  Detail,
  FeaturedCard,
  NativeIntegrationCard,
  PackageCard,
} from "./discover-ui";
import { PetsTab } from "../pets/pets-tab";
import { EmojisTab } from "../emojis/emojis-tab";
import { FashionTab } from "../fashion/fashion-tab";

export function StoreClientInner() {
  const isEmbedded = useIsEmbeddedWebsite();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StoreCategory | "all">("all");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [connectingIntegrationId, setConnectingIntegrationId] = useState<
    string | null
  >(null);
  const [nativeIntegrationError, setNativeIntegrationError] = useState<
    string | null
  >(null);
  const [installedMods, setInstalledMods] = useState<StoreInstall[]>([]);
  const [localNativeIntegrations, setLocalNativeIntegrations] = useState<
    NativeIntegration[]
  >([]);
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
  const storeIntegrations = useQuery(listStoreIntegrations, {});
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
  const installedMap = useMemo(() => {
    const map = new Map<string, StoreInstall>();
    for (const mod of installedMods) map.set(mod.packageId, mod);
    return map;
  }, [installedMods]);

  const allPackages = query.trim() ? search : browse?.page;
  const filtered = (allPackages ?? []).filter((pkg) => {
    if (filter !== "all") {
      const category = pkg.category ?? "other";
      if (category !== filter) return false;
    }
    return true;
  });
  const featured = pickFeaturedPackage(allPackages ?? []);
  const isForYouSurface = filter === "all" && query.trim() === "";
  const showFeatured = featured !== null && isForYouSurface;
  const restRaw = filtered.filter(
    (pkg) => !showFeatured || pkg.packageId !== featured!.packageId,
  );
  // On the unfiltered For You feed, surface promoted/partner/verified
  // ahead of organic; once the user picks a category or searches we
  // fall back to recency so they get the result they asked for.
  const rest = isForYouSurface ? sortPackagesForYou(restRaw) : restRaw;
  const nativeIntegrations = useMemo(() => {
    if (localNativeIntegrations.length > 0) return localNativeIntegrations;
    return storeIntegrations ?? [];
  }, [localNativeIntegrations, storeIntegrations]);
  const visibleNativeIntegrations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (filter !== "all" && filter !== "integrations") return [];
    return nativeIntegrations
      .filter((integration) => {
        if (!q) return true;
        return [
          integration.name,
          integration.category,
          integration.description,
          integration.oauthSetupMessage,
          integration.oauthSetupGroup?.name,
          integration.oauthSetupStatus,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((left, right) => {
        const rank = (integration: NativeIntegration) => {
          if (integration.enabled) return 0;
          if (integration.connectable !== false) return 1;
          return 2;
        };
        return rank(left) - rank(right) || left.name.localeCompare(right.name);
      });
  }, [filter, nativeIntegrations, query]);
  const installPackage = async (pkg: StorePackage) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.requestPackageInstall) {
      await redirectToStoreSignIn();
      return;
    }
    if (!(await ensureStoreAuth())) return;
    setInstallingId(pkg.packageId);
    try {
      const installRecord = await bridge.requestPackageInstall({
        packageId: pkg.packageId,
        releaseNumber: pkg.latestReleaseNumber,
      });
      if (!installRecord) return;
      await recordInstall({ packageId: pkg.packageId });
      setInstalledIds((previous) => new Set(previous).add(pkg.packageId));
      setInstalledMods((previous) => [
        ...previous.filter((mod) => mod.packageId !== pkg.packageId),
        {
          packageId: pkg.packageId,
          displayName: pkg.displayName,
          releaseNumber: installRecord.releaseNumber,
          installedAt: Date.now(),
        },
      ]);
    } finally {
      setInstallingId(null);
    }
  };

  const removePackage = async (pkg: StorePackage) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.uninstallPackage) return;
    setInstallingId(pkg.packageId);
    try {
      await bridge.uninstallPackage(pkg.packageId);
      setInstalledIds((previous) => {
        const next = new Set(previous);
        next.delete(pkg.packageId);
        return next;
      });
      setInstalledMods((previous) =>
        previous.filter((mod) => mod.packageId !== pkg.packageId),
      );
    } finally {
      setInstallingId(null);
    }
  };

  const connectNativeIntegration = async (integration: NativeIntegration) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.connectNativeIntegration) {
      setNativeIntegrationError("Open Stella to add this integration.");
      return;
    }
    setNativeIntegrationError(null);
    setConnectingIntegrationId(integration.id);
    try {
      const next = await bridge.connectNativeIntegration({ id: integration.id });
      setLocalNativeIntegrations((previous) =>
        mergeNativeIntegrationUpdate(
          previous.length > 0 ? previous : (storeIntegrations ?? []),
          next,
        ),
      );
    } catch (error) {
      if (isNativeIntegrationUserCancel(error)) return;
      setNativeIntegrationError(
        getNativeIntegrationErrorMessage(error, integration),
      );
    } finally {
      setConnectingIntegrationId(null);
    }
  };

  const disconnectNativeIntegration = async (integration: NativeIntegration) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.disconnectNativeIntegration) {
      setNativeIntegrationError("Open Stella to remove this integration.");
      return;
    }
    setNativeIntegrationError(null);
    setConnectingIntegrationId(integration.id);
    try {
      const next = await bridge.disconnectNativeIntegration({
        id: integration.id,
      });
      setLocalNativeIntegrations((previous) =>
        mergeNativeIntegrationUpdate(
          previous.length > 0 ? previous : (storeIntegrations ?? []),
          next,
        ),
      );
    } catch (error) {
      setNativeIntegrationError(
        error instanceof Error
          ? error.message
          : `Couldn't remove ${integration.name}.`,
      );
    } finally {
      setConnectingIntegrationId(null);
    }
  };

  useEffect(() => {
    void window.stellaDesktopStore?.listInstalledMods().then((mods) => {
      setInstalledMods(mods);
      setInstalledIds(new Set(mods.map((mod) => mod.packageId)));
    });
    void window.stellaDesktopStore?.listNativeIntegrations?.().then((items) => {
      setLocalNativeIntegrations(items);
    });
  }, []);

  const handleUploadToStore = useCallback(() => {
    void openNativeStorePanel().then((opened) => {
      if (!opened) void redirectToStoreSignIn();
    });
  }, []);

  if (activeTab !== "discover") {
    return (
      <main className="store-root" data-tab={activeTab}>
        {isEmbedded ? (
          <StoreWebTabs activeTab={activeTab} />
        ) : (
          <div className="store-web-shell">
            <StoreWebTabs activeTab={activeTab} />
          </div>
        )}
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
      {isEmbedded ? (
        <>
          <StoreWebTabs activeTab="discover" />
          {!selectedPackage ? (
            <button
              className="store-action-btn store-action-btn--lg store-upload-btn"
              data-variant="get"
              type="button"
              onClick={handleUploadToStore}
            >
              Upload to Store
            </button>
          ) : null}
        </>
      ) : (
        <div className="store-web-shell">
          <StoreWebTabs activeTab="discover" />
          {!selectedPackage ? (
            <StoreWebHero onUpload={handleUploadToStore} />
          ) : null}
        </div>
      )}
      <div className="store-scroll">
        {selectedPackage ? (
          <Detail
            pkg={selectedPackage}
            releases={selectedReleases ?? []}
            installedRecord={installedMap.get(selectedPackage.packageId)}
            installing={installingId === selectedPackage.packageId}
            onBack={() => {
              setSelectedPackageId(null);
              if (initialPackageId) {
                const next = new URL(window.location.href);
                next.searchParams.delete("package");
                window.history.replaceState({}, "", next.toString());
              }
            }}
            onInstall={() => void installPackage(selectedPackage)}
            onRemove={() => void removePackage(selectedPackage)}
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
                updateAvailable={isStoreUpdateAvailable(
                  featured,
                  installedMap.get(featured.packageId),
                )}
                installing={installingId === featured.packageId}
                onAction={() => void installPackage(featured)}
                onClick={() => setSelectedPackageId(featured.packageId)}
              />
            ) : null}
            {filter === "all" && query.trim() === "" ? (
              <AddedRow
                installed={installedMods}
                packages={allPackages ?? []}
                onSelect={setSelectedPackageId}
              />
            ) : null}
            {visibleNativeIntegrations.length > 0 ? (
              <div className="store-section">
                <div className="store-section-header">
                  <span className="store-section-title">Integrations</span>
                  <span className="store-section-count">
                    {visibleNativeIntegrations.length}
                  </span>
                </div>
                {nativeIntegrationError ? (
                  <div className="store-status" data-variant="error">
                    {nativeIntegrationError}
                  </div>
                ) : null}
                <div className="store-grid">
                  {visibleNativeIntegrations.map((integration) => (
                    <NativeIntegrationCard
                      key={integration.id}
                      integration={integration}
                      busy={connectingIntegrationId === integration.id}
                      onConnect={() =>
                        void connectNativeIntegration(integration)
                      }
                      onDisconnect={() =>
                        void disconnectNativeIntegration(integration)
                      }
                    />
                  ))}
                </div>
              </div>
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
                      ? "For You"
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
                      updateAvailable={isStoreUpdateAvailable(
                        pkg,
                        installedMap.get(pkg.packageId),
                      )}
                      installing={installingId === pkg.packageId}
                      onOpen={() => setSelectedPackageId(pkg.packageId)}
                      onInstall={() => void installPackage(pkg)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
