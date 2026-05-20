"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  StoreWebHeader,
  useIsEmbeddedWebsite,
} from "../components/shared";
import { pickFeaturedPackage, sortPackagesForYou } from "../lib/discover-ranking";
import {
  Detail,
  FeaturedCard,
  NativeIntegrationCard,
  PackageCard,
} from "./discover-ui";
import { InstallConfirmDialog } from "./install-confirm-dialog";
import { PetsTab } from "../pets/pets-tab";
import { EmojisTab } from "../emojis/emojis-tab";
import { LibraryTab } from "../library/library-tab";

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
  const [pendingInstall, setPendingInstall] = useState<StorePackage | null>(
    null,
  );
  const [localNativeIntegrations, setLocalNativeIntegrations] = useState<
    NativeIntegration[]
  >([]);
  const searchParams = useSearchParams();
  const activeTab = normalizeHostedStoreTab(
    searchParams.get("tab") ?? "discover",
  );
  const [initialPackageId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("package");
  });

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
    return (storeIntegrations ?? []).map((integration) => ({
      ...integration,
      enabled: false,
    }));
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
  /**
   * Surfaces the in-app blueprint confirmation dialog. The actual
   * install call only fires after the user clicks Install in
   * `InstallConfirmDialog` → `confirmInstall` below. We still gate on
   * the desktop bridge / auth here so non-desktop visitors get
   * redirected to sign-in like before.
   */
  const installPackage = async (pkg: StorePackage) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.requestPackageInstall) {
      await redirectToStoreSignIn();
      return;
    }
    if (!(await ensureStoreAuth())) return;
    setPendingInstall(pkg);
  };

  const confirmInstall = async (pkg: StorePackage) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.requestPackageInstall) return;
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
      setPendingInstall(null);
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

  // Lazy-mount Pets/Emojis on first visit, then keep them mounted so their
  // Convex subscriptions and scroll state persist across tab switches. Without
  // this, returning to a tab tears down its queries and re-renders skeletons.
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(
    () => new Set([activeTab]),
  );
  useEffect(() => {
    setMountedTabs((previous) => {
      if (previous.has(activeTab)) return previous;
      const next = new Set(previous);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  const showHeaderSearch = activeTab === "discover" && !selectedPackage;
  const searchSlot = showHeaderSearch ? (
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
  ) : null;

  return (
    <main className="store-root" data-tab={activeTab}>
      <div className="store-web-shell" data-embedded={isEmbedded || undefined}>
        <StoreWebHeader
          activeTab={activeTab}
          showUpload={activeTab === "discover" && !selectedPackage}
          onUpload={handleUploadToStore}
          searchSlot={searchSlot}
        />
      </div>
      {mountedTabs.has("pets") ? (
        <div hidden={activeTab !== "pets"}>
          <PetsTab />
        </div>
      ) : null}
      {mountedTabs.has("emojis") ? (
        <div hidden={activeTab !== "emojis"}>
          <EmojisTab />
        </div>
      ) : null}
      {mountedTabs.has("library") ? (
        <div hidden={activeTab !== "library"}>
          <LibraryTab
            installedMods={installedMods}
            browsePackages={browse?.page}
            installingId={installingId}
            onSelectPackage={setSelectedPackageId}
            onInstallPackage={(pkg) => void installPackage(pkg)}
          />
        </div>
      ) : null}
      <div className="store-scroll" hidden={activeTab !== "discover"}>
        {selectedPackage ? (
          <Detail
            pkg={selectedPackage}
            releases={selectedReleases ?? []}
            releasesLoading={selectedReleases === undefined}
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
            <div className="store-toolbar" role="tablist" aria-label="Filter">
              {DISCOVER_FILTERS.map((entry) => (
                <button
                  key={entry.id}
                  className="store-filter-pill"
                  data-active={filter === entry.id || undefined}
                  onClick={() => setFilter(entry.id)}
                  type="button"
                  role="tab"
                  aria-selected={filter === entry.id}
                >
                  {entry.label}
                </button>
              ))}
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
                <div className="store-grid store-grid--mosaic">
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
          </>
        )}
      </div>
      {pendingInstall ? (
        <InstallConfirmDialog
          pkg={pendingInstall}
          isUpdate={isStoreUpdateAvailable(
            pendingInstall,
            installedMap.get(pendingInstall.packageId),
          )}
          installing={installingId === pendingInstall.packageId}
          onCancel={() => setPendingInstall(null)}
          onConfirm={() => void confirmInstall(pendingInstall)}
        />
      ) : null}
    </main>
  );
}
