"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { Check, Download, Search, Upload } from "lucide-react";
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
  updatedAt: number;
};

type StoreRelease = {
  packageId: string;
  releaseNumber: number;
  blueprintMarkdown: string;
  commits?: Array<{ hash: string; subject: string; diff: string }>;
  releaseNotes?: string;
};

type StoreInstall = {
  packageId: string;
  displayName?: string;
  installedAt?: number;
};

type DesktopStoreBridge = {
  getAuthToken?: () => Promise<string | null>;
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

const getPublicRelease = makeFunctionReference<
  "query",
  { packageId: string; releaseNumber: number },
  StoreRelease | null
>("data/store_packages:getPublicRelease");

const recordPackageInstall = makeFunctionReference<
  "mutation",
  { packageId: string },
  null
>("data/store_packages:recordPackageInstall");

const categories: Array<{ key: StoreCategory | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "apps-games", label: "Apps" },
  { key: "productivity", label: "Productivity" },
  { key: "customization", label: "Customize" },
  { key: "skills-agents", label: "Skills" },
];

const gradientFor = (id: string) => {
  const hue = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  return `linear-gradient(135deg, hsl(${hue} 74% 52%), hsl(${(hue + 46) % 360} 68% 44%))`;
};

function PackageArtwork({ pkg, size = "card" }: { pkg: StorePackage; size?: "card" | "hero" | "detail" }) {
  const className =
    size === "hero"
      ? "store-featured-icon"
      : size === "detail"
        ? "store-detail-image"
        : "store-card-image";
  const letterClass =
    size === "hero"
      ? "store-featured-icon-letter"
      : size === "detail"
        ? "store-detail-image-letter"
        : "store-card-image-letter";
  return (
    <div className={className} style={{ background: gradientFor(pkg.packageId) }}>
      {pkg.iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="store-artwork-img" src={pkg.iconUrl} />
      ) : (
        <span className={letterClass}>{pkg.displayName.slice(0, 1).toUpperCase()}</span>
      )}
    </div>
  );
}

function Author({ pkg }: { pkg: StorePackage }) {
  const name = pkg.authorDisplayName || pkg.authorHandle || "Stella";
  return (
    <span className="store-card-author">
      <span className="store-card-author-avatar">{name.slice(0, 1).toUpperCase()}</span>
      {name}
    </span>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="store-empty">
      <div className="store-empty-icon">S</div>
      <div className="store-empty-title">{title}</div>
      <div className="store-empty-desc">{description}</div>
    </div>
  );
}

function PackageCard({
  pkg,
  installed,
  installing,
  onOpen,
  onInstall,
}: {
  pkg: StorePackage;
  installed: boolean;
  installing: boolean;
  onOpen: () => void;
  onInstall: () => void;
}) {
  return (
    <article className="store-card" data-clickable="true" onClick={onOpen}>
      <PackageArtwork pkg={pkg} />
      <div className="store-card-body">
        <div className="store-card-top">
          <h3 className="store-card-name">{pkg.displayName}</h3>
          <button
            className="store-action-btn"
            data-variant={installed ? "added" : "get"}
            disabled={installed || installing}
            onClick={(event) => {
              event.stopPropagation();
              onInstall();
            }}
            type="button"
          >
            {installed ? "Added" : installing ? "Adding" : "Get"}
          </button>
        </div>
        <p className="store-card-desc">{pkg.description}</p>
        <Author pkg={pkg} />
        <div className="store-card-footer">
          <span className="store-card-installs">{pkg.installCount ?? 0} installs</span>
          <span className="store-card-meta">v{pkg.latestReleaseNumber}</span>
        </div>
      </div>
    </article>
  );
}

function Featured({
  pkg,
  onOpen,
}: {
  pkg: StorePackage;
  onOpen: () => void;
}) {
  return (
    <section className="store-featured" onClick={onOpen}>
      <div className="store-featured-bg" style={{ background: gradientFor(pkg.packageId) }} />
      <div className="store-featured-overlay" />
      <div className="store-featured-content">
        <PackageArtwork pkg={pkg} size="hero" />
        <div className="store-featured-text">
          <div className="store-featured-label">Featured</div>
          <h2 className="store-featured-name">{pkg.displayName}</h2>
          <p className="store-featured-desc">{pkg.description}</p>
          <span className="store-featured-author">
            {pkg.authorDisplayName || pkg.authorHandle || "Stella"}
          </span>
        </div>
      </div>
    </section>
  );
}

function Detail({
  pkg,
  installed,
  installing,
  onBack,
  onInstall,
}: {
  pkg: StorePackage;
  installed: boolean;
  installing: boolean;
  onBack: () => void;
  onInstall: () => void;
}) {
  return (
    <div className="store-detail">
      <button className="store-detail-back" onClick={onBack} type="button">
        Back
      </button>
      <section className="store-detail-hero">
        <PackageArtwork pkg={pkg} size="detail" />
        <div className="store-detail-info">
          <h1 className="store-detail-name">{pkg.displayName}</h1>
          <p className="store-detail-desc">{pkg.description}</p>
          <div className="store-detail-author">
            <span className="store-detail-author-avatar">
              {(pkg.authorDisplayName || pkg.authorHandle || "S").slice(0, 1).toUpperCase()}
            </span>
            {pkg.authorDisplayName || pkg.authorHandle || "Stella"}
          </div>
          <div className="store-detail-meta store-detail-meta--spaced">
            <span className="store-detail-meta-item">{pkg.installCount ?? 0} installs</span>
            <span className="store-detail-meta-item">Version {pkg.latestReleaseNumber}</span>
          </div>
          <div className="store-detail-actions">
            <button
              className="store-action-btn"
              data-variant={installed ? "added" : "get"}
              disabled={installed || installing}
              onClick={onInstall}
              type="button"
            >
              {installed ? (
                <>
                  <Check size={14} /> Added
                </>
              ) : installing ? (
                "Adding"
              ) : (
                <>
                  <Download size={14} /> Get
                </>
              )}
            </button>
          </div>
        </div>
      </section>
      <section className="store-detail-section">
        <h2 className="store-detail-section-title">About</h2>
        <p className="store-detail-desc">{pkg.description}</p>
      </section>
    </div>
  );
}

function StandaloneTab({ tab }: { tab: string }) {
  const copy =
    tab === "fashion"
      ? "Fashion items are available inside the Stella desktop Store."
      : tab === "pets"
        ? "Pet previews are available inside the Stella desktop Store."
        : "Emoji packs are available inside the Stella desktop Store.";
  return <EmptyState title="Open in Stella" description={copy} />;
}

function StoreClientInner() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<StoreCategory | "all">("all");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [urlState, setUrlState] = useState({ tab: "discover", packageId: null as string | null });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrlState({
      tab: params.get("tab") || "discover",
      packageId: params.get("package"),
    });
  }, []);

  const activeTab = urlState.tab;
  const initialPackageId = urlState.packageId;

  useEffect(() => {
    if (initialPackageId && !selectedPackageId) {
      setSelectedPackageId(initialPackageId);
    }
  }, [initialPackageId, selectedPackageId]);

  const selectedCategory = category === "all" ? undefined : category;
  const browse = useQuery(listPublicPackages, {
    category: selectedCategory,
    paginationOpts: { numItems: 40, cursor: null },
  });
  const search = useQuery(
    searchPublicPackages,
    query.trim() ? { query: query.trim(), category: selectedCategory } : "skip",
  );
  const selectedPackage = useQuery(
    getPublicPackage,
    selectedPackageId ? { packageId: selectedPackageId } : "skip",
  );
  const selectedRelease = useQuery(
    getPublicRelease,
    selectedPackage
      ? {
          packageId: selectedPackage.packageId,
          releaseNumber: selectedPackage.latestReleaseNumber,
        }
      : "skip",
  );
  const recordInstall = useMutation(recordPackageInstall);

  const packages = query.trim() ? search : browse?.page;
  const featured = packages?.[0] ?? null;
  const rest = featured ? packages?.slice(1) : packages;

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
        <div className="store-scroll">
          <StandaloneTab tab={activeTab} />
        </div>
      </main>
    );
  }

  return (
    <main className="store-root" data-tab="discover">
      <button className="store-action-btn store-upload-btn" data-variant="share" type="button">
        <Upload size={14} /> Upload
      </button>
      <div className="store-scroll">
        {selectedPackage ? (
          <Detail
            installed={installedIds.has(selectedPackage.packageId)}
            installing={installingId === selectedPackage.packageId}
            onBack={() => setSelectedPackageId(null)}
            onInstall={() => installPackage(selectedPackage, selectedRelease)}
            pkg={selectedPackage}
          />
        ) : (
          <>
            <div className="store-toolbar">
              <label className="store-search">
                <Search className="store-search-icon" size={15} />
                <input
                  className="store-search-input"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search Store"
                  value={query}
                />
              </label>
              <div className="store-filter">
                {categories.map((item) => (
                  <button
                    className="store-filter-pill"
                    data-active={category === item.key ? "" : undefined}
                    key={item.key}
                    onClick={() => setCategory(item.key)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {featured ? <Featured pkg={featured} onOpen={() => setSelectedPackageId(featured.packageId)} /> : null}
            <section className="store-section">
              <div className="store-section-header">
                <h1 className="store-section-title">Discover</h1>
                <span className="store-section-count">{packages?.length ?? 0}</span>
              </div>
              {!packages ? (
                <div className="store-grid">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div className="store-skeleton-card" key={index}>
                      <div className="store-skeleton-image" />
                      <div className="store-skeleton-body">
                        <div className="store-skeleton-line" />
                        <div className="store-skeleton-line store-skeleton-line--short" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : packages.length === 0 ? (
                <EmptyState title="Nothing here yet" description="Try another search or category." />
              ) : (
                <div className="store-grid">
                  {rest?.map((pkg) => (
                    <PackageCard
                      installed={installedIds.has(pkg.packageId)}
                      installing={installingId === pkg.packageId}
                      key={pkg._id}
                      onInstall={() => installPackage(pkg)}
                      onOpen={() => setSelectedPackageId(pkg.packageId)}
                      pkg={pkg}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export function StoreClient() {
  if (!isConvexConfigured()) {
    return (
      <main className="store-root" data-tab="discover">
        <div className="store-scroll">
          <EmptyState
            title="Store unavailable"
            description="Convex is not configured for this website build."
          />
        </div>
      </main>
    );
  }
  return <StoreClientInner />;
}
