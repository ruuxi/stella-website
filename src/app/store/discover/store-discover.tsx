"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { Package, Search } from "lucide-react";
import {
  getPublicPackage,
  listPublicPackages,
  listPublicReleases,
  listStoreIntegrations,
  recordPackageInstall,
  searchPublicPackages,
} from "../lib/convex";
import { DISCOVER_FILTERS, PACKAGE_PAGE_SIZE, PAGE_SIZE } from "../lib/constants";
import type { HostedStoreTab } from "../lib/constants";
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
import type {
  NativeIntegration,
  StoreCategory,
  StoreInstall,
  StorePackage,
} from "../lib/types";
import {
  EmptyState,
  StoreLoadingSpinner,
  StoreWebHeader,
  useIsEmbeddedWebsite,
} from "../components/shared";
import {
  pickFeaturedPackage,
  sortPackagesForYou,
} from "../lib/discover-ranking";
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
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
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
  // Desktop normally serves integrations from the native bridge, so we skip
  // the (redundant) Convex catalog query while embedded. This flips true if
  // the bridge ever resolves empty or errors, re-enabling Convex as a safety
  // net so the section can never silently blank out.
  const [bridgeIntegrationsUnavailable, setBridgeIntegrationsUnavailable] =
    useState(false);
  const [activeTab, setActiveTab] = useState<HostedStoreTab>(() =>
    getCurrentStoreTab(),
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

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getCurrentStoreTab());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const selectStoreTab = useCallback((tab: HostedStoreTab) => {
    setActiveTab((current) => {
      if (current === tab) return current;
      const next = new URL(window.location.href);
      next.searchParams.set("tab", tab);
      window.history.pushState({}, "", next.toString());
      return tab;
    });
  }, []);

  const selectedCategory = filter === "all" ? undefined : filter;
  const isSearching = query.trim().length > 0;
  // Browse is paginated server-side (recency order, category pushed to the
  // server) so the discover grid only loads a small first page and grows on
  // scroll instead of fetching ~80 packages up front.
  const {
    results: browseResults,
    status: browseStatus,
    loadMore: loadMoreBrowse,
  } = usePaginatedQuery(
    listPublicPackages,
    isSearching ? "skip" : selectedCategory ? { category: selectedCategory } : {},
    { initialNumItems: PACKAGE_PAGE_SIZE },
  ) as {
    results: StorePackage[];
    status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
    loadMore: (numItems: number) => void;
  };
  // On the desktop the integration cards come from the native bridge
  // (`listNativeIntegrations`, which carries connection state), so the Convex
  // catalog query is redundant there — only run it on the hosted web store,
  // where it's the sole source.
  const storeIntegrations = useQuery(
    listStoreIntegrations,
    isEmbedded && !bridgeIntegrationsUnavailable ? "skip" : {},
  );
  const search = useQuery(
    searchPublicPackages,
    isSearching ? { query: query.trim(), category: selectedCategory } : "skip",
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

  const isForYouSurface = filter === "all" && !isSearching;
  // The server already applies the category filter (browse via index, search
  // via its arg), so the loaded set is the working set. For the unfiltered
  // "For You" feed we surface promoted/partner/verified ahead of organic —
  // but only across the FIRST page, so streaming in later pages never
  // reshuffles the cards already on screen.
  const rankedPackages = useMemo(() => {
    if (isSearching) return search ?? [];
    if (!isForYouSurface) return browseResults;
    const head = sortPackagesForYou(browseResults.slice(0, PACKAGE_PAGE_SIZE));
    return [...head, ...browseResults.slice(PACKAGE_PAGE_SIZE)];
  }, [isSearching, isForYouSurface, search, browseResults]);
  // Featured is picked from the first page only so it stays put as more
  // pages stream in.
  const featured = useMemo(
    () =>
      isForYouSurface
        ? pickFeaturedPackage(browseResults.slice(0, PACKAGE_PAGE_SIZE))
        : null,
    [isForYouSurface, browseResults],
  );
  const showFeatured = featured !== null;
  const rest = showFeatured
    ? rankedPackages.filter((pkg) => pkg.packageId !== featured!.packageId)
    : rankedPackages;
  const packagesLoading = isSearching
    ? search === undefined
    : browseStatus === "LoadingFirstPage";
  const canLoadMorePackages = !isSearching && browseStatus === "CanLoadMore";
  const isLoadingMorePackages = browseStatus === "LoadingMore";
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

  // Progressive reveal for integrations. The Convex query returns the full
  // list eagerly, but rendering ~130 cards in one paint pushes the document
  // height up suddenly after the rest of the page has settled, which makes
  // the body gradient visibly re-scale. Slicing the array and growing
  // `integrationsLimit` via an IntersectionObserver matches the pets/emojis
  // pattern and keeps initial layout stable.
  const [integrationsLimit, setIntegrationsLimit] = useState(PAGE_SIZE);
  const integrationsSentinelRef = useRef<HTMLDivElement | null>(null);
  const packagesSentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!canLoadMorePackages) return;
    const node = packagesSentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMoreBrowse(PACKAGE_PAGE_SIZE);
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMorePackages, loadMoreBrowse]);
  useEffect(() => {
    setIntegrationsLimit(PAGE_SIZE);
  }, [filter, query]);
  const totalIntegrations = visibleNativeIntegrations.length;
  const pagedIntegrations = useMemo(
    () => visibleNativeIntegrations.slice(0, integrationsLimit),
    [visibleNativeIntegrations, integrationsLimit],
  );
  const canLoadMoreIntegrations = pagedIntegrations.length < totalIntegrations;
  useEffect(() => {
    if (!canLoadMoreIntegrations) return;
    const node = integrationsSentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIntegrationsLimit((current) => current + PAGE_SIZE);
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMoreIntegrations]);
  /**
   * Surfaces the in-app release confirmation dialog. The actual install call
   * only fires after the user clicks Install in `InstallConfirmDialog` →
   * `confirmInstall` below. We still gate on the desktop bridge / auth here so
   * non-desktop visitors get redirected to sign-in like before.
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
    setPendingInstall(null);
    void bridge.showToast?.({
      title: "Installing",
      description: "Stella is installing in the background.",
      variant: "loading",
    });
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
      void bridge.showToast?.({
        title: "Installed",
        description: `${pkg.displayName} is ready.`,
        variant: "success",
      });
    } catch (error) {
      void bridge.showToast?.({
        title: "Install failed",
        description:
          error instanceof Error
            ? error.message
            : "Stella couldn't install it.",
        variant: "error",
      });
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
      const next = await bridge.connectNativeIntegration({
        id: integration.id,
      });
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

  const disconnectNativeIntegration = async (
    integration: NativeIntegration,
  ) => {
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
    const bridgeList = window.stellaDesktopStore?.listNativeIntegrations?.();
    if (bridgeList) {
      void bridgeList
        .then((items) => {
          setLocalNativeIntegrations(items);
          // Empty result → let the Convex catalog query take over as a
          // fallback instead of leaving the section blank.
          setBridgeIntegrationsUnavailable(items.length === 0);
        })
        .catch(() => setBridgeIntegrationsUnavailable(true));
    }
  }, []);

  const handleUploadToStore = useCallback(() => {
    void openNativeStorePanel().then((opened) => {
      if (!opened) void redirectToStoreSignIn();
    });
  }, []);

  // Lazy-mount Pets/Emojis on first visit, then keep them mounted so their
  // Convex subscriptions and scroll state persist across tab switches. Without
  // this, returning to a tab tears down its queries and re-renders the spinner.
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
          onSelectTab={selectStoreTab}
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
            {packagesLoading ? (
              <StoreLoadingSpinner />
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
                {canLoadMorePackages || isLoadingMorePackages ? (
                  <div
                    ref={packagesSentinelRef}
                    className="store-grid-sentinel"
                    data-loading={isLoadingMorePackages ? "true" : "false"}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            )}
            {totalIntegrations > 0 ? (
              <div className="store-section">
                <div className="store-section-header">
                  <span className="store-section-title">Integrations</span>
                  <span className="store-section-count">
                    {totalIntegrations}
                  </span>
                </div>
                {nativeIntegrationError ? (
                  <div className="store-status" data-variant="error">
                    {nativeIntegrationError}
                  </div>
                ) : null}
                <div className="store-grid">
                  {pagedIntegrations.map((integration) => (
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
                {canLoadMoreIntegrations ? (
                  <div
                    ref={integrationsSentinelRef}
                    className="store-grid-sentinel"
                    aria-hidden="true"
                  />
                ) : null}
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

function getCurrentStoreTab(): HostedStoreTab {
  if (typeof window === "undefined") return "discover";
  return normalizeHostedStoreTab(
    new URLSearchParams(window.location.search).get("tab") ?? "discover",
  );
}
