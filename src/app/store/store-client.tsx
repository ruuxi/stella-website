"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
} from "react";
import {
  useAction,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import { makeFunctionReference } from "convex/server";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Layers,
  Package,
  Plug,
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
  releaseNumber?: number;
  installedAt?: number;
};

type StellaConnectorSummary = {
  id: string;
  displayName: string;
  description?: string;
  marketplaceKey: string;
  category?: string;
  appIds: string[];
  mcpServers: string[];
  officialSource?: string;
  integrationPath?: string;
  auth?: string;
  requiresCredential?: boolean;
  executable?: boolean;
  configFields?: Array<{
    key: string;
    label: string;
    secret?: boolean;
    placeholder?: string;
  }>;
  status: "local" | "official-mcp" | "official-api" | "implemented";
  installed: boolean;
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
  tags?: string[];
  coverEmoji: string;
  coverUrl?: string;
  sheetUrls: string[];
  visibility?: "public" | "unlisted" | "private";
  authorDisplayName?: string;
  authorHandle?: string;
  installCount?: number;
};

type FashionProfile = {
  _id: string;
  ownerId: string;
  displayName?: string;
  gender?: string;
  sizes?: Record<string, string>;
  stylePreferences?: string;
  hasBodyPhoto: boolean;
  bodyPhotoMimeType?: string;
  bodyPhotoUpdatedAt?: number;
  updatedAt: number;
};

type FashionOutfitProduct = {
  slot: string;
  productId: string;
  variantId: string;
  title: string;
  vendor?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  productUrl?: string;
  checkoutUrl?: string;
  merchantOrigin: string;
};

type FashionOutfit = {
  _id: string;
  _creationTime: number;
  ownerId: string;
  batchId: string;
  ordinal: number;
  status: "generating" | "ready" | "failed";
  themeLabel: string;
  themeDescription?: string;
  stylePrompt?: string;
  products: FashionOutfitProduct[];
  tryOnPrompt?: string;
  tryOnImagePath?: string;
  tryOnImageUrl?: string;
  errorMessage?: string;
  createdAt: number;
  readyAt?: number;
};

type FashionLike = {
  _id: string;
  _creationTime?: number;
  ownerId: string;
  variantId: string;
  productId: string;
  title: string;
  imageUrl?: string;
  productUrl?: string;
  merchantOrigin: string;
  priceCents?: number;
  currency?: string;
  vendor?: string;
  likedAt: number;
};

type FashionCartItem = {
  _id: string;
  _creationTime?: number;
  ownerId: string;
  variantId: string;
  productId: string;
  title: string;
  imageUrl?: string;
  productUrl?: string;
  checkoutUrl?: string;
  merchantOrigin: string;
  priceCents?: number;
  currency?: string;
  vendor?: string;
  quantity: number;
  addedAt: number;
};

type FashionCheckoutResult = {
  checkoutId: string;
  status: string;
  continueUrl?: string;
  cartUrl?: string;
  merchantOrigin: string;
  mcpEndpoint: string;
  usingMcp: boolean;
};

type DesktopStoreFashionBridge = {
  pickAndSaveBodyPhoto?: () => Promise<
    | { canceled: true }
    | {
        canceled: false;
        info: {
          hasBodyPhoto: boolean;
          absolutePath?: string;
          mimeType?: string;
          updatedAt?: number;
        };
      }
  >;
  getBodyPhotoInfo?: () => Promise<{
    hasBodyPhoto: boolean;
    absolutePath?: string;
    mimeType?: string;
    updatedAt?: number;
  }>;
  getBodyPhotoDataUrl?: () => Promise<string | null>;
  getLocalImageDataUrl?: (path: string) => Promise<string>;
  pickTryOnImages?: () => Promise<{ canceled: boolean; paths: string[] }>;
  getDroppedFilePath?: (file: File) => string;
  startOutfitBatch?: (payload: {
    prompt?: string;
    batchId?: string;
    count?: number;
    excludeProductIds?: string[];
    seedHints?: string[];
  }) => Promise<{ threadId?: string; batchId: string }>;
  startTryOn?: (payload: {
    prompt?: string;
    batchId?: string;
    imagePaths?: string[];
    imageUrls?: string[];
  }) => Promise<{
    threadId?: string;
    batchId: string;
    imagePaths: string[];
    imageUrls: string[];
  }>;
};

type DesktopStoreBridge = {
  getAuthToken?: () => Promise<string | null>;
  openStorePanel?: () => Promise<unknown>;
  listConnectors?: () => Promise<StellaConnectorSummary[]>;
  installConnector?: (
    marketplaceKey: string,
    credential?: string,
    config?: Record<string, string>,
  ) => Promise<unknown>;
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
  uninstallPackage?: (packageId: string) => Promise<unknown>;
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
  fashion?: DesktopStoreFashionBridge;
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
    tag?: string;
    search?: string;
  },
  { page: PublicPet[]; isDone: boolean; continueCursor: string }
>("data/pets:listPublicPage");

const listPetTagFacets = makeFunctionReference<
  "query",
  Record<string, never>,
  Array<{ tag: string; count: number }>
>("data/pets:listTagFacets");

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
    tag?: string;
    search?: string;
  },
  { page: EmojiPack[]; isDone: boolean; continueCursor: string }
>("data/emoji_packs:listPublicPage");

const listEmojiPackTagFacets = makeFunctionReference<
  "query",
  Record<string, never>,
  Array<{ tag: string; count: number }>
>("data/emoji_packs:listTagFacets");

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

const getFashionProfile = makeFunctionReference<
  "query",
  Record<string, never>,
  FashionProfile | null
>("data/fashion:getProfile");

const setFashionProfile = makeFunctionReference<
  "mutation",
  { gender?: string; sizes?: Record<string, string>; stylePreferences?: string },
  FashionProfile
>("data/fashion:setProfile");

const setFashionBodyPhotoFlag = makeFunctionReference<
  "mutation",
  { hasBodyPhoto: boolean; bodyPhotoMimeType?: string },
  FashionProfile
>("data/fashion:setBodyPhotoFlag");

const listFashionOutfits = makeFunctionReference<
  "query",
  { limit: number },
  FashionOutfit[]
>("data/fashion:listOutfits");

const listFashionLikes = makeFunctionReference<
  "query",
  { limit: number },
  FashionLike[]
>("data/fashion:listLikes");

const listFashionCart = makeFunctionReference<
  "query",
  Record<string, never>,
  FashionCartItem[]
>("data/fashion:listCart");

const toggleFashionLike = makeFunctionReference<
  "mutation",
  {
    variantId: string;
    productId: string;
    title: string;
    imageUrl?: string;
    productUrl?: string;
    merchantOrigin: string;
    priceCents?: number;
    currency?: string;
    vendor?: string;
  },
  null
>("data/fashion:toggleLike");

const addFashionCartItem = makeFunctionReference<
  "mutation",
  {
    variantId: string;
    productId: string;
    title: string;
    imageUrl?: string;
    productUrl?: string;
    checkoutUrl?: string;
    merchantOrigin: string;
    priceCents?: number;
    currency?: string;
    vendor?: string;
    quantity?: number;
  },
  FashionCartItem
>("data/fashion:addToCart");

const removeFashionCartItem = makeFunctionReference<
  "mutation",
  { cartItemId: string },
  null
>("data/fashion:removeFromCart");

const setFashionCartQuantity = makeFunctionReference<
  "mutation",
  { cartItemId: string; quantity: number },
  FashionCartItem | null
>("data/fashion:setCartQuantity");

const createFashionCheckout = makeFunctionReference<
  "action",
  {
    merchantOrigin: string;
    lines: Array<{ variantId: string; quantity: number }>;
  },
  FashionCheckoutResult
>("agent/local_runtime:shopifyCreateCheckout");

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
type PetSort = "downloads" | "name";
type EmojiPackSort = "installs" | "name";

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 200;
const ALL_TAG = "all" as const;
const PET_SORT_LABELS: Record<PetSort, string> = {
  downloads: "Most selected",
  name: "Alphabetical",
};
const EMOJI_SORT_LABELS: Record<EmojiPackSort, string> = {
  installs: "Most used",
  name: "Alphabetical",
};

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

function isStoreUpdateAvailable(
  pkg: StorePackage,
  installed?: StoreInstall,
): boolean {
  return typeof installed?.releaseNumber === "number"
    ? installed.releaseNumber < pkg.latestReleaseNumber
    : false;
}

const PET_COLUMNS = 8;
const PET_ROWS = 9;

type PetAnimationState =
  | "idle"
  | "running-right"
  | "running-left"
  | "waving"
  | "jumping"
  | "failed"
  | "waiting"
  | "running"
  | "review";

type SpriteFrame = {
  rowIndex: number;
  columnIndex: number;
  frameDurationMs: number;
};

const ANIMATION_STATES: ReadonlyArray<{
  state: PetAnimationState;
  label: string;
}> = [
  { state: "idle", label: "Idle" },
  { state: "running-right", label: "Run right" },
  { state: "running-left", label: "Run left" },
  { state: "waving", label: "Waving" },
  { state: "jumping", label: "Jumping" },
  { state: "failed", label: "Failed" },
  { state: "waiting", label: "Waiting" },
  { state: "running", label: "Running" },
  { state: "review", label: "Review" },
];

const IDLE_BASE: SpriteFrame[] = [
  { rowIndex: 0, columnIndex: 0, frameDurationMs: 280 },
  { rowIndex: 0, columnIndex: 1, frameDurationMs: 110 },
  { rowIndex: 0, columnIndex: 2, frameDurationMs: 110 },
  { rowIndex: 0, columnIndex: 3, frameDurationMs: 140 },
  { rowIndex: 0, columnIndex: 4, frameDurationMs: 140 },
  { rowIndex: 0, columnIndex: 5, frameDurationMs: 320 },
];

const IDLE_REST: SpriteFrame[] = IDLE_BASE.map((frame) => ({
  ...frame,
  frameDurationMs: frame.frameDurationMs * 6,
}));

const buildAnimationRow = (
  rowIndex: number,
  frameCount: number,
  frameDurationMs: number,
  finalFrameDurationMs: number,
): SpriteFrame[] =>
  Array.from({ length: frameCount }, (_unused, columnIndex) => ({
    rowIndex,
    columnIndex,
    frameDurationMs:
      columnIndex === frameCount - 1 ? finalFrameDurationMs : frameDurationMs,
  }));

const PET_ANIMATIONS: Record<PetAnimationState, SpriteFrame[]> = {
  idle: IDLE_BASE,
  jumping: buildAnimationRow(4, 5, 140, 280),
  review: buildAnimationRow(8, 6, 150, 280),
  running: buildAnimationRow(7, 6, 120, 220),
  "running-left": buildAnimationRow(2, 8, 120, 220),
  "running-right": buildAnimationRow(1, 8, 120, 220),
  waving: buildAnimationRow(3, 4, 140, 280),
  waiting: buildAnimationRow(6, 6, 150, 260),
  failed: buildAnimationRow(5, 8, 140, 240),
};

const formatPetFramePosition = (frame: SpriteFrame): string => {
  const x = (frame.columnIndex / (PET_COLUMNS - 1)) * 100;
  const y = (frame.rowIndex / (PET_ROWS - 1)) * 100;
  return `${x}% ${y}%`;
};

const resolvePetAnimation = (
  state: PetAnimationState,
  continuous: boolean,
): { frames: SpriteFrame[]; loopStartIndex: number | null } => {
  if (state === "idle") return { frames: IDLE_REST, loopStartIndex: 0 };
  const baseFrames = PET_ANIMATIONS[state];
  if (continuous) return { frames: baseFrames, loopStartIndex: 0 };
  const reactive = [...baseFrames, ...baseFrames, ...baseFrames];
  return { frames: [...reactive, ...IDLE_REST], loopStartIndex: reactive.length };
};

const downloadCountFormatter = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatDownloads = (value: number): string =>
  downloadCountFormatter.format(Math.max(0, Math.floor(value)));

const formatEmojiUseCount = (count: number | undefined): string => {
  const n = count ?? 0;
  if (n <= 0) return "New";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M uses`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K uses`;
  return `${n} use${n === 1 ? "" : "s"}`;
};

function PetSprite({
  spritesheetUrl,
  size = 84,
  state = "idle",
  continuous = false,
}: {
  spritesheetUrl: string;
  size?: number;
  state?: PetAnimationState;
  continuous?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const { frames, loopStartIndex } = resolvePetAnimation(state, continuous);
    let frameIndex = 0;
    let timer: number | null = null;

    const applyFrame = () => {
      const frame = frames[frameIndex];
      if (!frame) return;
      node.style.backgroundPosition = formatPetFramePosition(frame);
    };

    applyFrame();
    if (frames.length <= 1) return;

    const tick = () => {
      timer = window.setTimeout(() => {
        const next = frameIndex + 1;
        if (next >= frames.length) {
          if (loopStartIndex != null) {
            frameIndex = loopStartIndex;
            applyFrame();
            tick();
          }
          return;
        }
        frameIndex = next;
        applyFrame();
        tick();
      }, frames[frameIndex]?.frameDurationMs ?? 160);
    };

    tick();
    return () => {
      if (timer != null) window.clearTimeout(timer);
    };
  }, [continuous, size, spritesheetUrl, state]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-pet-state={state}
      style={{
        width: size,
        height: Math.round(size * (208 / 192)),
        backgroundImage: `url(${spritesheetUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${PET_COLUMNS * 100}% ${PET_ROWS * 100}%`,
        backgroundPosition: "0% 0%",
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
  updateAvailable = false,
  installing,
  onOpen,
  onInstall,
  onShare,
}: {
  pkg: StorePackage;
  installed: boolean;
  updateAvailable?: boolean;
  installing: boolean;
  onOpen: () => void;
  onInstall: () => void;
  onShare: () => void;
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

function AddedRow({
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
  installedRecord,
  installing,
  onBack,
  onInstall,
  onRemove,
  onShare,
}: {
  pkg: StorePackage;
  releases: StoreRelease[];
  installedRecord?: StoreInstall;
  installing: boolean;
  onBack: () => void;
  onInstall: () => void;
  onRemove: () => void;
  onShare: () => void;
}) {
  const latestRelease = releases[0];
  const latestNotes = latestRelease ? getReleaseNotes(latestRelease) : undefined;
  const installed = Boolean(installedRecord);
  const updateAvailable = isStoreUpdateAvailable(pkg, installedRecord);
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

type ConnectorCredentialPayload = {
  credential?: string;
  config: Record<string, string>;
};

function ConnectorCredentialDialog({
  connector,
  onSubmit,
  onCancel,
}: {
  connector: StellaConnectorSummary;
  onSubmit: (payload: ConnectorCredentialPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [credential, setCredential] = useState("");
  const [config, setConfig] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fields = connector.configFields ?? [];
  const showCredentialField = connector.requiresCredential && fields.length === 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const nextConfig: Record<string, string> = {};
    for (const field of fields) {
      const value = config[field.key]?.trim() ?? "";
      if (!value) {
        setError(`${field.label} is required.`);
        return;
      }
      nextConfig[field.key] = value;
    }
    const nextCredential = credential.trim();
    if (showCredentialField && !nextCredential) {
      setError("API key is required.");
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({
        credential: showCredentialField ? nextCredential : undefined,
        config: nextConfig,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add this connector");
      setSubmitting(false);
    }
  };

  return (
    <StoreModal onClose={onCancel}>
      <form className="credential-modal-content" onSubmit={handleSubmit}>
        <div className="credential-modal-hero">
          <div className="credential-modal-icon">
            <Plug size={20} />
          </div>
          <div className="credential-modal-headline">
            Connect {connector.displayName}
          </div>
          <p className="credential-modal-sub">
            Add the details Stella needs to connect this service.
          </p>
        </div>
        <div className="credential-modal-form">
          {showCredentialField ? (
            <label className="credential-modal-field">
              <span className="credential-modal-label">API key</span>
              <input
                type="password"
                value={credential}
                onChange={(event) => setCredential(event.target.value)}
                placeholder="Paste your key"
                autoFocus
              />
            </label>
          ) : null}
          {fields.map((field, index) => (
            <label className="credential-modal-field" key={field.key}>
              <span className="credential-modal-label">{field.label}</span>
              <input
                type={field.secret ? "password" : "text"}
                value={config[field.key] ?? ""}
                onChange={(event) =>
                  setConfig((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                placeholder={field.placeholder ?? ""}
                autoFocus={index === 0 && !showCredentialField}
              />
            </label>
          ))}
          {error ? <div className="credential-modal-error">{error}</div> : null}
          <div className="credential-modal-actions">
            <button
              type="button"
              className="store-action-btn store-action-btn--lg"
              data-variant="subtle"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="store-action-btn store-action-btn--lg"
              data-variant="get"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add connector"}
            </button>
          </div>
        </div>
      </form>
    </StoreModal>
  );
}

function ConnectorConfirmDialog({
  connector,
  onConfirm,
  onCancel,
}: {
  connector: StellaConnectorSummary;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <StoreModal onClose={onCancel}>
      <div className="store-confirm-dialog">
        <div className="store-confirm-title">Add {connector.displayName}?</div>
        <p className="store-confirm-description">
          Stella will add {connector.displayName} to your connected integrations.
          You can remove it any time.
        </p>
        <div className="store-confirm-actions">
          <button
            type="button"
            className="store-action-btn store-action-btn--lg"
            data-variant="subtle"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="store-action-btn store-action-btn--lg"
            data-variant="get"
            onClick={onConfirm}
          >
            Add
          </button>
        </div>
      </div>
    </StoreModal>
  );
}

function ConnectTab({
  connectors,
  loading,
  error,
  onInstall,
}: {
  connectors: StellaConnectorSummary[];
  loading: boolean;
  error: string | null;
  onInstall: (marketplaceKey: string) => Promise<void>;
}) {
  const [working, setWorking] = useState<string | null>(null);

  const handleInstall = async (marketplaceKey: string) => {
    setWorking(marketplaceKey);
    try {
      await onInstall(marketplaceKey);
    } finally {
      setWorking(null);
    }
  };

  if (loading) return null;
  if (error) {
    return (
      <div className="store-status" data-variant="error">
        {error}
      </div>
    );
  }
  if (connectors.length === 0) return null;

  return (
    <div className="store-section">
      <div className="store-section-header">
        <span className="store-section-title">Integrations</span>
        <span className="store-section-count">{connectors.length}</span>
      </div>
      <div className="store-connector-list">
        {connectors.map((connector) => {
          const ready = connector.executable === true;
          const isWorking = working === connector.marketplaceKey;
          const description =
            connector.description ??
            connector.integrationPath ??
            "Connect this service to Stella.";
          const interactive = ready && !connector.installed && !isWorking;
          const trigger = () => void handleInstall(connector.marketplaceKey);
          const actionLabel = isWorking
            ? "Adding..."
            : connector.installed
              ? "Connected"
              : ready
                ? "Add"
                : "Soon";
          const actionVariant = isWorking
            ? "working"
            : connector.installed
              ? "added"
              : ready
                ? "subtle"
                : "added";
          return (
            <div
              key={connector.id}
              className="store-connector-row"
              data-clickable={interactive ? "true" : undefined}
              onClick={interactive ? trigger : undefined}
            >
              <PackageArtwork
                name={connector.displayName}
                className="store-connector-icon"
                letterClassName="store-connector-icon-letter"
              />
              <div className="store-connector-text">
                <span className="store-connector-name">{connector.displayName}</span>
                <span className="store-connector-desc">{description}</span>
              </div>
              <button
                className="store-action-btn"
                data-variant={actionVariant}
                disabled={connector.installed || isWorking || !ready}
                onClick={(event) => {
                  event.stopPropagation();
                  trigger();
                }}
                type="button"
              >
                {actionLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PetDetailsDialog({
  pet,
  installed,
  selected,
  working,
  onGet,
  onSelect,
  onRemove,
  onClose,
}: {
  pet: PublicPet;
  installed: boolean;
  selected: boolean;
  working: boolean;
  onGet: () => Promise<void> | void;
  onSelect: () => Promise<void> | void;
  onRemove: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [mainState, setMainState] = useState<PetAnimationState>("idle");

  const primaryLabel = selected
    ? "Selected"
    : installed
      ? working
        ? "Selecting..."
        : "Select"
      : working
        ? "Getting..."
        : "Get";

  const handlePrimary = async () => {
    if (selected || working) return;
    if (installed) {
      await onSelect();
      onClose();
      return;
    }
    await onGet();
  };

  return (
    <StoreModal onClose={onClose}>
      <div className="pet-detail-dialog">
        <div className="pet-detail-header">
          <div className="pet-detail-title">{pet.displayName}</div>
          <p className="pet-detail-caption">
            by {pet.ownerName || "Stella"} · {formatDownloads(pet.downloads)} selections
          </p>
        </div>
        <div className="pet-detail-body">
          <div
            className="pet-detail-stage"
            aria-label={`${pet.displayName} preview`}
          >
            <PetSprite
              spritesheetUrl={pet.spritesheetUrl}
              state={mainState}
              size={220}
              continuous
            />
          </div>

          {pet.description ? (
            <p className="pet-detail-blurb">{pet.description}</p>
          ) : null}

          <div className="pet-detail-actions">
            <button
              className="store-action-btn store-action-btn--lg"
              data-variant={selected ? "added" : working ? "working" : "get"}
              disabled={selected || working}
              onClick={() => void handlePrimary()}
              type="button"
            >
              {primaryLabel}
            </button>
            {installed ? (
              <button
                className="store-action-btn store-action-btn--lg"
                data-variant={working ? "working" : "remove"}
                disabled={working}
                onClick={() => {
                  void Promise.resolve(onRemove()).then(onClose);
                }}
                type="button"
              >
                {working ? "Removing..." : "Remove"}
              </button>
            ) : null}
          </div>

          <section className="pet-detail-states-section">
            <span className="pet-detail-states-label">Animations</span>
            <div
              className="pet-detail-states"
              role="tablist"
              aria-label="Animation states"
            >
              {ANIMATION_STATES.map((entry) => (
                <button
                  key={entry.state}
                  type="button"
                  role="tab"
                  aria-selected={mainState === entry.state}
                  aria-label={entry.label}
                  title={entry.label}
                  className="pet-detail-state-thumb"
                  data-active={mainState === entry.state || undefined}
                  onClick={() => setMainState(entry.state)}
                >
                  <PetSprite
                    spritesheetUrl={pet.spritesheetUrl}
                    state={entry.state}
                    size={52}
                    continuous
                  />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </StoreModal>
  );
}

function PetsTab() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>(ALL_TAG);
  const [sort, setSort] = useState<PetSort>("downloads");
  const [detailsPet, setDetailsPet] = useState<PublicPet | null>(null);
  const [petState, setPetState] = useState<PetBridgeState>({
    installedPetIds: [],
    selectedPetId: null,
  });
  const [workingPetId, setWorkingPetId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const trimmedSearch = debouncedQuery.trim();
  const {
    results: pets,
    status,
    loadMore,
  } = usePaginatedQuery(
    listPublicPets,
    {
      sort,
      ...(trimmedSearch ? { search: trimmedSearch } : {}),
      ...(!trimmedSearch && activeTag !== ALL_TAG ? { tag: activeTag } : {}),
    },
    { initialNumItems: PAGE_SIZE },
  ) as {
    results: PublicPet[];
    status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
    loadMore: (numItems: number) => void;
  };
  const tagFacets = useQuery(listPetTagFacets, {});
  const incrementDownloads = useMutation(incrementPetDownloads);
  const installedPetIds = useMemo(
    () => new Set(petState.installedPetIds),
    [petState.installedPetIds],
  );
  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";
  const isLoadingFirstPage = status === "LoadingFirstPage";
  const tagOptions = useMemo(() => (tagFacets ?? []).map((facet) => facet.tag), [
    tagFacets,
  ]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

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

  useEffect(() => {
    if (!canLoadMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore(PAGE_SIZE);
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMore, loadMore]);

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
            {pets.length}
            {canLoadMore ? "+" : ""} loaded
          </span>
        </div>
        <p className="pets-page-subtitle">
          Pick a floating Stella companion to perch above your work. Pets react
          to what Stella is doing - running, waiting on you, or just hanging
          out - and surface their last status without making you switch
          windows. Right-click the pet anywhere on screen to swap or close it.
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
        <label className="pets-sort">
          <span className="pets-sort-label">Sort</span>
          <select
            className="pets-sort-select"
            onChange={(event) => setSort(event.currentTarget.value as PetSort)}
            value={sort}
          >
            {(Object.keys(PET_SORT_LABELS) as PetSort[]).map((option) => (
              <option key={option} value={option}>
                {PET_SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="pets-tags" role="tablist" aria-label="Filter by tag">
        <button
          type="button"
          role="tab"
          className="pets-tag-pill"
          data-active={activeTag === ALL_TAG ? "true" : "false"}
          aria-selected={activeTag === ALL_TAG}
          onClick={() => setActiveTag(ALL_TAG)}
        >
          All
        </button>
        {tagOptions.map((tag) => (
          <button
            key={tag}
            type="button"
            role="tab"
            className="pets-tag-pill"
            data-active={activeTag === tag ? "true" : "false"}
            aria-selected={activeTag === tag}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      {actionError ? (
        <div className="store-status" data-variant="error">
          {actionError}
        </div>
      ) : null}
      {isLoadingFirstPage ? (
        <div className="store-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="store-skeleton-card" key={index} />
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="pets-empty">
          No pets match that filter. Try a different tag or clear the search.
        </div>
      ) : (
        <>
          <div className="pets-grid">
            {pets.map((pet) => {
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
                    <PetSprite
                      spritesheetUrl={pet.spritesheetUrl}
                      state="idle"
                      size={84}
                    />
                  </div>
                  <div className="pets-card-name-row">
                    <span className="pets-card-name">{pet.displayName}</span>
                  </div>
                  <div className="pets-card-meta">
                    <span className="pets-card-creator">
                      by {pet.ownerName || "Stella"}
                    </span>
                    <span
                      className="pets-card-downloads"
                      title={`${pet.downloads.toLocaleString()} selections`}
                    >
                      <Download size={11} aria-hidden="true" />
                      {formatDownloads(pet.downloads)}
                    </span>
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
                        onClick={() => setDetailsPet(pet)}
                        type="button"
                      >
                        {working ? "Getting..." : "Get"}
                      </button>
                    ) : (
                      <>
                        <button
                          className="store-action-btn"
                          data-variant={
                            selected ? "added" : working ? "working" : "get"
                          }
                          disabled={selected || working}
                          onClick={() => void selectPet(pet.id)}
                          type="button"
                        >
                          {selected
                            ? "Selected"
                            : working
                              ? "Selecting..."
                              : "Select"}
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
          {canLoadMore || isLoadingMore ? (
            <div
              ref={sentinelRef}
              className="pets-grid-sentinel"
              data-loading={isLoadingMore ? "true" : "false"}
              aria-hidden="true"
            >
              {isLoadingMore ? "Loading more..." : ""}
            </div>
          ) : null}
        </>
      )}
      {detailsPet ? (
        <PetDetailsDialog
          key={detailsPet.id}
          pet={detailsPet}
          installed={installedPetIds.has(detailsPet.id)}
          selected={petState.selectedPetId === detailsPet.id}
          working={workingPetId === detailsPet.id}
          onGet={() => installPet(detailsPet)}
          onSelect={() => selectPet(detailsPet.id)}
          onRemove={() => removePet(detailsPet.id)}
          onClose={() => setDetailsPet(null)}
        />
      ) : null}
    </main>
  );
}

function EmojisTab() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>(ALL_TAG);
  const [sort, setSort] = useState<EmojiPackSort>("installs");
  const [detailsPack, setDetailsPack] = useState<EmojiPack | null>(null);
  const [previewSheet, setPreviewSheet] = useState(0);
  const [emojiState, setEmojiState] = useState<EmojiBridgeState>({
    activePack: null,
  });
  const [workingPackId, setWorkingPackId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const trimmedSearch = debouncedQuery.trim();
  const {
    results: packs,
    status,
    loadMore,
  } = usePaginatedQuery(
    listPublicEmojiPacks,
    {
      sort,
      ...(trimmedSearch ? { search: trimmedSearch } : {}),
      ...(!trimmedSearch && activeTag !== ALL_TAG ? { tag: activeTag } : {}),
    },
    { initialNumItems: PAGE_SIZE },
  ) as {
    results: EmojiPack[];
    status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
    loadMore: (numItems: number) => void;
  };
  const tagFacets = useQuery(listEmojiPackTagFacets, {});
  const recordInstall = useMutation(recordEmojiInstall);
  const activePackId = emojiState.activePack?.packId ?? null;
  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";
  const isLoadingFirstPage = status === "LoadingFirstPage";
  const tagOptions = useMemo(() => (tagFacets ?? []).map((facet) => facet.tag), [
    tagFacets,
  ]);

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

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (!canLoadMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore(PAGE_SIZE);
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMore, loadMore]);

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
          <h1 className="emoji-page-title">Emoji packs</h1>
          {activePackId ? (
            <span className="emoji-page-active">
              Using{" "}
              <button
                type="button"
                className="emoji-page-active-clear"
                onClick={() => void clearEmojiPack(activePackId)}
              >
                stop
              </button>
            </span>
          ) : null}
        </div>
        <p className="emoji-page-subtitle">
          Describe a vibe - Stella generates custom emojis across sheets. Pick
          a pack to swap the standard emojis in chat. Switch any time.
        </p>
      </header>
      <div className="emoji-page-toolbar">
        <label className="emoji-page-search">
          <Search className="emoji-page-search-icon" size={15} />
          <input
            className="emoji-page-search-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search public packs"
            spellCheck={false}
            value={query}
          />
        </label>
        <label className="emoji-page-sort">
          <span className="emoji-page-sort-label">Sort</span>
          <select
            className="emoji-page-sort-select"
            onChange={(event) =>
              setSort(event.currentTarget.value as EmojiPackSort)
            }
            value={sort}
          >
            {(Object.keys(EMOJI_SORT_LABELS) as EmojiPackSort[]).map((option) => (
              <option key={option} value={option}>
                {EMOJI_SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="emoji-page-tags"
        role="tablist"
        aria-label="Filter emoji packs by tag"
      >
        <button
          type="button"
          role="tab"
          className="emoji-page-tag-pill"
          data-active={activeTag === ALL_TAG ? "true" : "false"}
          aria-selected={activeTag === ALL_TAG}
          onClick={() => setActiveTag(ALL_TAG)}
        >
          All
        </button>
        {tagOptions.map((tag) => (
          <button
            key={tag}
            type="button"
            role="tab"
            className="emoji-page-tag-pill"
            data-active={activeTag === tag ? "true" : "false"}
            aria-selected={activeTag === tag}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      {actionError ? (
        <div className="store-status" data-variant="error">
          {actionError}
        </div>
      ) : null}
      {isLoadingFirstPage ? (
        <div className="emoji-pack-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="store-skeleton-card" key={index} />
          ))}
        </div>
      ) : packs.length === 0 ? (
        <div className="emoji-page-empty">
          {trimmedSearch
            ? "No packs match that search."
            : "No community packs yet."}
        </div>
      ) : (
        <section className="emoji-page-section">
          <div className="emoji-page-section-header">
            <span className="emoji-page-section-title">Discover</span>
            <span className="emoji-page-section-count">
              {packs.length}
              {canLoadMore ? "+" : ""}
            </span>
          </div>
          <div className="emoji-pack-grid">
            {packs.map((pack) => {
              const active = activePackId === pack.packId;
              return (
                <article
                  className="emoji-pack-card"
                  data-active={active || undefined}
                  key={pack._id}
                >
                  <button
                    type="button"
                    className="emoji-pack-cover"
                    aria-label={`Open ${pack.displayName}`}
                    onClick={() => {
                      setPreviewSheet(0);
                      setDetailsPack(pack);
                    }}
                  >
                    {pack.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt=""
                        className="emoji-pack-cover-img"
                        src={pack.coverUrl}
                      />
                    ) : (
                      <span className="emoji-pack-cover-glyph" aria-hidden>
                        {pack.coverEmoji}
                      </span>
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
                        by{" "}
                        {pack.authorDisplayName ||
                          pack.authorHandle ||
                          "Stella"}
                      </span>
                      <span className="emoji-pack-installs">
                        {formatEmojiUseCount(pack.installCount)}
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
          {canLoadMore || isLoadingMore ? (
            <div
              ref={sentinelRef}
              className="emoji-page-sentinel"
              data-loading={isLoadingMore || undefined}
            >
              {isLoadingMore ? "Loading more..." : ""}
            </div>
          ) : null}
        </section>
      )}
      {detailsPack ? (
        <StoreModal onClose={() => setDetailsPack(null)}>
          <div className="emoji-details-dialog">
            <div className="emoji-details-header">
              <div className="emoji-details-title">{detailsPack.displayName}</div>
              <p className="emoji-details-caption">
                {detailsPack.description ||
                  `Pack by ${detailsPack.authorDisplayName || detailsPack.authorHandle || "Stella"}`}
              </p>
            </div>
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
                  <div className="emoji-details-meta-row">
                    <span className="emoji-details-meta-label">Visibility</span>
                    <span className="emoji-details-meta-value">
                      {(detailsPack.visibility ?? "public")
                        .slice(0, 1)
                        .toUpperCase() +
                        (detailsPack.visibility ?? "public").slice(1)}
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

const FASHION_SIZE_FIELDS: Array<{
  key: string;
  label: string;
  placeholder: string;
}> = [
  { key: "top", label: "Top", placeholder: "M" },
  { key: "bottom", label: "Bottom", placeholder: "32" },
  { key: "shoe", label: "Shoes", placeholder: "10" },
  { key: "dress", label: "Dress", placeholder: "S" },
  { key: "outerwear", label: "Outerwear", placeholder: "M" },
  { key: "ring", label: "Ring", placeholder: "8" },
];

const FASHION_GENDER_OPTIONS = [
  { value: "", label: "Select one" },
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "unisex", label: "Unisex / no preference" },
  { value: "nonbinary", label: "Non-binary" },
];

const formatPrice = (
  amount: number | undefined,
  currency: string | undefined,
): string => {
  if (typeof amount !== "number") return "";
  const code = (currency ?? "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
};

const formatPriceCents = (
  cents: number | undefined,
  currency: string | undefined,
): string => {
  if (typeof cents !== "number") return "";
  return formatPrice(cents / 100, currency);
};

function useLocalImageDataUrl(filePath: string | undefined) {
  const directUrl = filePath && /^(https?:|data:)/i.test(filePath) ? filePath : null;
  const localPath = directUrl ? undefined : filePath;
  const [resolved, setResolved] = useState<{
    path: string;
    url: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!localPath) return;
    const api = getDesktopStoreBridge()?.fashion;
    if (!api?.getLocalImageDataUrl) return;
    void api
      .getLocalImageDataUrl(localPath)
      .then((url) => {
        if (!cancelled) setResolved({ path: localPath, url });
      })
      .catch(() => {
        if (!cancelled) setResolved({ path: localPath, url: null });
      });
    return () => {
      cancelled = true;
    };
  }, [localPath]);

  if (directUrl) return directUrl;
  if (!resolved || resolved.path !== localPath) return null;
  return resolved.url;
}

function FashionHeroPlaceholder({
  status,
  errorMessage,
}: {
  status: FashionOutfit["status"];
  errorMessage?: string;
}) {
  if (status === "failed") {
    return (
      <div className="fashion-stage-failed">
        Couldn&apos;t generate this look
        {errorMessage ? (
          <div style={{ marginTop: 6, opacity: 0.7 }}>{errorMessage}</div>
        ) : null}
      </div>
    );
  }
  return <div className="fashion-stage-placeholder">Styling your look…</div>;
}

function FashionProduct({
  product,
  liked,
  inCart,
  onLike,
  onAddToCart,
  onOpen,
}: {
  product: FashionOutfitProduct;
  liked: boolean;
  inCart: boolean;
  onLike: () => void;
  onAddToCart: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="fashion-product">
      <button
        type="button"
        className="fashion-product-thumb"
        onClick={onOpen}
        aria-label={`Open ${product.title}`}
        style={{ border: "none", padding: 0, cursor: "default" }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" />
        ) : (
          <div className="fashion-product-thumb-empty">no image</div>
        )}
      </button>
      <div className="fashion-product-meta">
        <div className="fashion-product-slot">{product.slot}</div>
        <div className="fashion-product-title" title={product.title}>
          {product.title}
        </div>
        {product.vendor ? (
          <div className="fashion-product-vendor">{product.vendor}</div>
        ) : null}
        {typeof product.price === "number" ? (
          <div className="fashion-product-price">
            {formatPrice(product.price, product.currency)}
          </div>
        ) : null}
      </div>
      <div className="fashion-product-actions">
        <button
          type="button"
          className="fashion-icon-btn"
          data-active={liked ? "true" : undefined}
          onClick={onLike}
          aria-label={liked ? "Unlike" : "Like"}
          title={liked ? "Unlike" : "Like"}
        >
          ♥
        </button>
        <button
          type="button"
          className="fashion-icon-btn"
          data-active={inCart ? "true" : undefined}
          onClick={onAddToCart}
          aria-label={inCart ? "In cart" : "Add to cart"}
          title={inCart ? "In cart" : "Add to cart"}
        >
          +
        </button>
      </div>
    </div>
  );
}

function FashionOutfitStage({
  outfit,
  likedVariantIds,
  cartVariantIds,
  onLike,
  onAddToCart,
}: {
  outfit: FashionOutfit;
  likedVariantIds: Set<string>;
  cartVariantIds: Set<string>;
  onLike: (product: FashionOutfitProduct) => void;
  onAddToCart: (product: FashionOutfitProduct) => void;
}) {
  const products = outfit.products ?? [];
  const half = Math.ceil(products.length / 2);
  const left = products.slice(0, half);
  const right = products.slice(half);
  const localTryOnSrc = useLocalImageDataUrl(outfit.tryOnImagePath);
  const tryOnSrc = outfit.tryOnImageUrl ?? localTryOnSrc;

  const handleOpen = useCallback((product: FashionOutfitProduct) => {
    const url = product.productUrl ?? product.checkoutUrl;
    if (!url || typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <section className="fashion-stage">
      <div className="fashion-stage-meta">
        <div>
          <div className="fashion-stage-theme">{outfit.themeLabel}</div>
          {outfit.themeDescription ? (
            <div className="fashion-stage-subtitle">
              {outfit.themeDescription}
            </div>
          ) : null}
        </div>
        <div className="fashion-stage-status" data-state={outfit.status}>
          {outfit.status === "ready"
            ? products.length === 0
              ? "Try-on"
              : `${products.length} pieces`
            : outfit.status === "generating"
              ? "Generating"
              : "Failed"}
        </div>
      </div>

      <div className="fashion-stage-side" data-align="left">
        {left.map((product) => (
          <FashionProduct
            key={`${outfit._id}-${product.variantId}-${product.slot}-l`}
            product={product}
            liked={likedVariantIds.has(product.variantId)}
            inCart={cartVariantIds.has(product.variantId)}
            onLike={() => onLike(product)}
            onAddToCart={() => onAddToCart(product)}
            onOpen={() => handleOpen(product)}
          />
        ))}
      </div>

      <div className="fashion-stage-hero">
        {tryOnSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tryOnSrc} alt="Try-on look" />
        ) : (
          <FashionHeroPlaceholder
            status={outfit.status}
            errorMessage={outfit.errorMessage}
          />
        )}
      </div>

      <div className="fashion-stage-side" data-align="right">
        {right.map((product) => (
          <FashionProduct
            key={`${outfit._id}-${product.variantId}-${product.slot}-r`}
            product={product}
            liked={likedVariantIds.has(product.variantId)}
            inCart={cartVariantIds.has(product.variantId)}
            onLike={() => onLike(product)}
            onAddToCart={() => onAddToCart(product)}
            onOpen={() => handleOpen(product)}
          />
        ))}
      </div>
    </section>
  );
}

function FashionProfileSheet({
  initialGender,
  initialSizes,
  initialPrefs,
  hasBodyPhoto,
  bodyPhotoDataUrl,
  onPickPhoto,
  onSave,
  onClose,
  saving,
}: {
  initialGender: string;
  initialSizes: Record<string, string>;
  initialPrefs: string;
  hasBodyPhoto: boolean;
  bodyPhotoDataUrl: string | null;
  onPickPhoto: () => void;
  onSave: (
    gender: string,
    sizes: Record<string, string>,
    stylePreferences: string,
  ) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [gender, setGender] = useState(initialGender);
  const [sizes, setSizes] = useState<Record<string, string>>(initialSizes);
  const [prefs, setPrefs] = useState(initialPrefs);

  return (
    <div
      className="fashion-sheet-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="fashion-sheet" role="dialog" aria-label="Style profile">
        <div className="fashion-sheet-header">
          <div>
            <div className="fashion-sheet-title">Your style profile</div>
            <div className="fashion-sheet-subtitle">
              One full-body photo powers the try-ons. Gender guides product
              searches, and your photo stays on this Mac.
            </div>
          </div>
          <button
            type="button"
            className="fashion-sheet-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="fashion-sheet-grid">
          <button
            type="button"
            className="fashion-photo-slot"
            onClick={onPickPhoto}
            aria-label="Pick body photo"
          >
            {bodyPhotoDataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bodyPhotoDataUrl} alt="" />
                <div className="fashion-photo-overlay">Replace photo</div>
              </>
            ) : hasBodyPhoto ? (
              <div>Photo saved · click to replace</div>
            ) : (
              <div>Click to pick a full-body photo</div>
            )}
          </button>

          <div className="fashion-fields">
            <div>
              <label className="fashion-field-label">Gender</label>
              <select
                className="fashion-size-input"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
              >
                {FASHION_GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="fashion-field-label">Sizes</label>
              <div className="fashion-size-grid">
                {FASHION_SIZE_FIELDS.map((field) => (
                  <input
                    key={field.key}
                    className="fashion-size-input"
                    placeholder={`${field.label} · ${field.placeholder}`}
                    value={sizes[field.key] ?? ""}
                    onChange={(event) =>
                      setSizes((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="fashion-field-label">Style notes</label>
              <textarea
                className="fashion-prefs-textarea"
                placeholder="What you like, brands, fits to avoid…"
                value={prefs}
                onChange={(event) => setPrefs(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="fashion-sheet-actions">
          <button
            type="button"
            className="fashion-sheet-save"
            onClick={() => {
              const cleaned: Record<string, string> = {};
              for (const [key, value] of Object.entries(sizes)) {
                const trimmed = value.trim();
                if (trimmed) cleaned[key] = trimmed;
              }
              onSave(gender.trim(), cleaned, prefs.trim());
            }}
            disabled={saving || !gender.trim()}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FashionCartDock({
  cart,
  onCheckout,
  busy,
  onSetQuantity,
  onRemove,
}: {
  cart: FashionCartItem[];
  onCheckout: () => void;
  busy: boolean;
  onSetQuantity: (item: FashionCartItem, quantity: number) => void;
  onRemove: (item: FashionCartItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const totalCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );
  const totalLabel = useMemo(() => {
    const pricedItems = cart.filter((item) => typeof item.priceCents === "number");
    if (pricedItems.length === 0) return null;
    const currencies = new Set(
      pricedItems.map((item) => (item.currency ?? "USD").toUpperCase()),
    );
    if (currencies.size !== 1) return null;
    const totalCents = pricedItems.reduce(
      (sum, item) => sum + item.priceCents! * Math.max(item.quantity, 0),
      0,
    );
    if (totalCents <= 0) return null;
    return formatPriceCents(totalCents, currencies.values().next().value);
  }, [cart]);

  if (cart.length === 0) return null;

  return (
    <div className="fashion-cart-dock">
      {open ? (
        <div className="fashion-cart-list">
          {cart.map((item) => (
            <div key={item._id} className="fashion-cart-item">
              <div className="fashion-cart-item-meta">
                <span className="fashion-cart-item-title">{item.title}</span>
                {typeof item.priceCents === "number" ? (
                  <span className="fashion-cart-item-price">
                    {formatPriceCents(item.priceCents, item.currency)}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                className="fashion-cart-qty-btn"
                onClick={() => onSetQuantity(item, Math.max(0, item.quantity - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span style={{ minWidth: 14, textAlign: "center", fontSize: 12 }}>
                {item.quantity}
              </span>
              <button
                type="button"
                className="fashion-cart-qty-btn"
                onClick={() => onSetQuantity(item, item.quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
              <button
                type="button"
                className="fashion-cart-qty-btn"
                onClick={() => onRemove(item)}
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <div className="fashion-cart-pill">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            color: "inherit",
            cursor: "default",
          }}
        >
          {totalCount} item{totalCount === 1 ? "" : "s"}
          {totalLabel ? <span> · {totalLabel}</span> : null}
        </button>
        <button
          type="button"
          className="fashion-cart-checkout"
          onClick={onCheckout}
          disabled={busy}
        >
          {busy ? "Opening…" : "Checkout"}
        </button>
      </div>
    </div>
  );
}

function FashionTab() {
  const featureStatus = useQuery(getFashionFeatureStatus, {});
  const profile = useQuery(getFashionProfile, {});
  const outfits = useQuery(listFashionOutfits, { limit: 60 });
  const likes = useQuery(listFashionLikes, { limit: 100 });
  const cart = useQuery(listFashionCart, {});
  const setProfile = useMutation(setFashionProfile);
  const setBodyPhotoFlag = useMutation(setFashionBodyPhotoFlag);
  const toggleLike = useMutation(toggleFashionLike);
  const addToCart = useMutation(addFashionCartItem);
  const removeFromCart = useMutation(removeFashionCartItem);
  const setCartQuantity = useMutation(setFashionCartQuantity);
  const checkoutAction = useAction(createFashionCheckout);

  const [bodyPhotoDataUrl, setBodyPhotoDataUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [pickingPhoto, setPickingPhoto] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [tryOnImagePaths, setTryOnImagePaths] = useState<string[]>([]);
  const [tryOnImageUrls, setTryOnImageUrls] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [pickingTryOn, setPickingTryOn] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [bodyPhotoPath, setBodyPhotoPath] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const lastPhotoRefresh = useRef<number | null>(null);

  const refreshBodyPhotoPreview = useCallback(async () => {
    const api = getDesktopStoreBridge()?.fashion;
    if (!api?.getBodyPhotoDataUrl) return;
    try {
      const [url, info] = await Promise.all([
        api.getBodyPhotoDataUrl(),
        api.getBodyPhotoInfo?.(),
      ]);
      setBodyPhotoDataUrl(url ?? null);
      setBodyPhotoPath(info?.absolutePath ?? null);
    } catch {
      setBodyPhotoDataUrl(null);
      setBodyPhotoPath(null);
    }
  }, []);

  useEffect(() => {
    if (!profile?.hasBodyPhoto) {
      setBodyPhotoDataUrl(null);
      setBodyPhotoPath(null);
      lastPhotoRefresh.current = null;
      return;
    }
    const updatedAt = profile.bodyPhotoUpdatedAt ?? 0;
    if (updatedAt === lastPhotoRefresh.current) return;
    lastPhotoRefresh.current = updatedAt;
    void refreshBodyPhotoPreview();
  }, [profile?.hasBodyPhoto, profile?.bodyPhotoUpdatedAt, refreshBodyPhotoPreview]);

  const handlePickPhoto = useCallback(async () => {
    const api = getDesktopStoreBridge()?.fashion;
    if (!api?.pickAndSaveBodyPhoto) return;
    setPickingPhoto(true);
    try {
      const result = await api.pickAndSaveBodyPhoto();
      if (result && "canceled" in result && result.canceled === false) {
        setBodyPhotoPath(result.info.absolutePath ?? null);
        await setBodyPhotoFlag({
          hasBodyPhoto: true,
          ...(result.info.mimeType !== undefined
            ? { bodyPhotoMimeType: result.info.mimeType }
            : {}),
        });
        await refreshBodyPhotoPreview();
      }
    } finally {
      setPickingPhoto(false);
    }
  }, [refreshBodyPhotoPreview, setBodyPhotoFlag]);

  const handleSaveProfile = useCallback(
    async (
      gender: string,
      sizes: Record<string, string>,
      stylePreferences: string,
    ) => {
      setSavingProfile(true);
      try {
        const hasSizes = Object.keys(sizes).length > 0;
        await setProfile({
          ...(gender ? { gender } : {}),
          ...(hasSizes ? { sizes } : {}),
          ...(stylePreferences ? { stylePreferences } : {}),
        });
      } finally {
        setSavingProfile(false);
      }
    },
    [setProfile],
  );

  const hasGender = typeof profile?.gender === "string" && profile.gender.length > 0;
  const onboardingComplete = !!profile?.hasBodyPhoto && hasGender;
  const canGenerate = onboardingComplete && !!bodyPhotoPath;

  const extractImageUrlsFromPrompt = useCallback(
    (text: string): { remaining: string; urls: string[] } => {
      const urlRe =
        /https?:\/\/[^\s<>"']+\.(?:png|jpe?g|webp|gif|heic)(?:\?[^\s<>"']*)?/gi;
      const urls = Array.from(new Set(text.match(urlRe) ?? []));
      const remaining = text.replace(urlRe, " ").replace(/\s+/g, " ").trim();
      return { remaining, urls };
    },
    [],
  );

  const handlePickTryOnImages = useCallback(async () => {
    const api = getDesktopStoreBridge()?.fashion;
    if (!api?.pickTryOnImages) return;
    setPickingTryOn(true);
    try {
      const result = await api.pickTryOnImages();
      if (result.canceled || result.paths.length === 0) return;
      setTryOnImagePaths((current) =>
        Array.from(new Set([...current, ...result.paths])),
      );
    } finally {
      setPickingTryOn(false);
    }
  }, []);

  const handleRemoveAttachment = useCallback(
    (kind: "path" | "url", value: string) => {
      if (kind === "path") {
        setTryOnImagePaths((current) => current.filter((entry) => entry !== value));
      } else {
        setTryOnImageUrls((current) => current.filter((entry) => entry !== value));
      }
    },
    [],
  );

  const dragHasFiles = useCallback((event: ReactDragEvent<HTMLElement>) => {
    const items = event.dataTransfer?.items;
    if (!items) return false;
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (!item) continue;
      if (item.kind === "file") return true;
      if (item.kind === "string" && /(uri-list|plain)/i.test(item.type)) {
        return true;
      }
    }
    return false;
  }, []);

  const handleDragEnter = useCallback(
    (event: ReactDragEvent<HTMLElement>) => {
      if (!canGenerate) return;
      if (!dragHasFiles(event)) return;
      event.preventDefault();
      event.stopPropagation();
      dragCounterRef.current += 1;
      if (dragCounterRef.current === 1) setIsDragOver(true);
    },
    [canGenerate, dragHasFiles],
  );

  const handleDragOver = useCallback(
    (event: ReactDragEvent<HTMLElement>) => {
      if (!canGenerate) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    },
    [canGenerate],
  );

  const handleDragLeave = useCallback((event: ReactDragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (event: ReactDragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragOver(false);
      if (!canGenerate) return;

      const getPath = getDesktopStoreBridge()?.fashion?.getDroppedFilePath;
      const droppedFiles = Array.from(event.dataTransfer?.files ?? []);
      const newPaths: string[] = [];
      for (const file of droppedFiles) {
        if (!file.type.startsWith("image/")) continue;
        const filePath = getPath?.(file);
        if (filePath) newPaths.push(filePath);
      }
      if (newPaths.length > 0) {
        setTryOnImagePaths((current) =>
          Array.from(new Set([...current, ...newPaths])),
        );
      }

      const uriListRaw = event.dataTransfer?.getData("text/uri-list") ?? "";
      const plainRaw = event.dataTransfer?.getData("text/plain") ?? "";
      const candidateUrls = `${uriListRaw}\n${plainRaw}`
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /^https?:\/\//i.test(line));
      const imageUrlRe = /\.(?:png|jpe?g|webp|gif|heic)(?:\?[^\s<>"']*)?$/i;
      const newUrls = candidateUrls.filter((url) => imageUrlRe.test(url));
      if (newUrls.length > 0) {
        setTryOnImageUrls((current) =>
          Array.from(new Set([...current, ...newUrls])),
        );
      }
    },
    [canGenerate],
  );

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setCheckoutMessage(null);
    try {
      const api = getDesktopStoreBridge()?.fashion;
      if (!api?.startOutfitBatch || !api?.startTryOn) {
        throw new Error("Fashion runtime is not available.");
      }
      const { remaining, urls: detectedUrls } = extractImageUrlsFromPrompt(prompt);
      const allUrls = Array.from(new Set([...tryOnImageUrls, ...detectedUrls]));
      const useTryOn = tryOnImagePaths.length > 0 || allUrls.length > 0;

      if (useTryOn) {
        const batchId = `tryon-${Date.now().toString(36)}`;
        await api.startTryOn({
          prompt: remaining,
          batchId,
          imagePaths: tryOnImagePaths,
          imageUrls: allUrls,
        });
      } else {
        const batchId = `fashion-${Date.now().toString(36)}`;
        const excludeProductIds = Array.from(
          new Set(
            (outfits ?? []).flatMap((outfit) =>
              outfit.products.map((product) => product.productId),
            ),
          ),
        );
        await api.startOutfitBatch({
          prompt: remaining || "Generate a fresh fashion feed batch.",
          batchId,
          count: 5,
          excludeProductIds,
        });
      }

      setPrompt("");
      setTryOnImagePaths([]);
      setTryOnImageUrls([]);
    } catch (error) {
      setCheckoutMessage(
        error instanceof Error ? error.message : "Couldn't start Fashion.",
      );
    } finally {
      window.setTimeout(() => setGenerating(false), 800);
    }
  }, [
    canGenerate,
    extractImageUrlsFromPrompt,
    outfits,
    prompt,
    tryOnImagePaths,
    tryOnImageUrls,
  ]);

  const likedVariantIds = useMemo(
    () => new Set((likes ?? []).map((like) => like.variantId)),
    [likes],
  );
  const cartVariantIds = useMemo(
    () => new Set((cart ?? []).map((item) => item.variantId)),
    [cart],
  );

  const handleToggleLike = useCallback(
    async (product: FashionOutfitProduct) => {
      await toggleLike({
        variantId: product.variantId,
        productId: product.productId,
        title: product.title,
        merchantOrigin: product.merchantOrigin,
        ...(product.imageUrl !== undefined ? { imageUrl: product.imageUrl } : {}),
        ...(product.productUrl !== undefined ? { productUrl: product.productUrl } : {}),
        ...(typeof product.price === "number"
          ? { priceCents: Math.round(product.price * 100) }
          : {}),
        ...(product.currency !== undefined ? { currency: product.currency } : {}),
        ...(product.vendor !== undefined ? { vendor: product.vendor } : {}),
      });
    },
    [toggleLike],
  );

  const handleAddToCart = useCallback(
    async (product: FashionOutfitProduct) => {
      await addToCart({
        variantId: product.variantId,
        productId: product.productId,
        title: product.title,
        merchantOrigin: product.merchantOrigin,
        ...(product.imageUrl !== undefined ? { imageUrl: product.imageUrl } : {}),
        ...(product.productUrl !== undefined ? { productUrl: product.productUrl } : {}),
        ...(product.checkoutUrl !== undefined
          ? { checkoutUrl: product.checkoutUrl }
          : {}),
        ...(typeof product.price === "number"
          ? { priceCents: Math.round(product.price * 100) }
          : {}),
        ...(product.currency !== undefined ? { currency: product.currency } : {}),
        ...(product.vendor !== undefined ? { vendor: product.vendor } : {}),
        quantity: 1,
      });
    },
    [addToCart],
  );

  const handleSetCartQuantity = useCallback(
    async (item: FashionCartItem, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart({ cartItemId: item._id });
      } else {
        await setCartQuantity({ cartItemId: item._id, quantity });
      }
    },
    [removeFromCart, setCartQuantity],
  );

  const handleRemoveCartItem = useCallback(
    async (item: FashionCartItem) => {
      await removeFromCart({ cartItemId: item._id });
    },
    [removeFromCart],
  );

  const handleCheckout = useCallback(async () => {
    if (!cart || cart.length === 0) return;
    const byMerchant = new Map<string, FashionCartItem[]>();
    for (const item of cart) {
      const existing = byMerchant.get(item.merchantOrigin) ?? [];
      existing.push(item);
      byMerchant.set(item.merchantOrigin, existing);
    }
    setCheckoutBusy(true);
    setCheckoutMessage(null);
    try {
      let openedCount = 0;
      let failedMessage: string | null = null;
      for (const [merchantOrigin, items] of byMerchant) {
        const lines = items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        }));
        try {
          const result = await checkoutAction({ merchantOrigin, lines });
          const url = result.continueUrl ?? result.cartUrl;
          if (url && typeof window !== "undefined") {
            window.open(url, "_blank", "noopener,noreferrer");
            openedCount += 1;
          }
        } catch (error) {
          const fallbackItem = items.find((item) => item.checkoutUrl);
          if (fallbackItem?.checkoutUrl && typeof window !== "undefined") {
            window.open(fallbackItem.checkoutUrl, "_blank", "noopener,noreferrer");
            openedCount += 1;
          } else {
            const message = error instanceof Error ? error.message : String(error);
            failedMessage = `Checkout failed for ${merchantOrigin}: ${message}`;
            setCheckoutMessage(failedMessage);
          }
        }
      }
      if (openedCount === 0 && !failedMessage) {
        setCheckoutMessage("No checkout URL available. Try clicking a product directly.");
      }
    } finally {
      setCheckoutBusy(false);
    }
  }, [cart, checkoutAction]);

  const initialSizes = useMemo(() => profile?.sizes ?? {}, [profile?.sizes]);
  const initialGender = profile?.gender ?? "";
  const initialPrefs = profile?.stylePreferences ?? "";

  if (featureStatus && !featureStatus.shopifyConfigured) {
    return (
      <div className="fashion-root">
        <div className="fashion-blank">
          <div className="fashion-blank-inner">
            <div className="fashion-blank-eyebrow">Fashion</div>
            <div className="fashion-blank-title">Not set up yet</div>
            <div className="fashion-blank-subtitle">
              Add <code>SHOPIFY_UCP_CLIENT_ID</code> and{" "}
              <code>SHOPIFY_UCP_CLIENT_SECRET</code> to your Convex deployment to
              enable Fashion.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showProfileButton = onboardingComplete;
  const hasOutfits = (outfits?.length ?? 0) > 0;

  let body: React.ReactNode;
  if (!onboardingComplete) {
    const needsPhoto = !profile?.hasBodyPhoto;
    body = (
      <div className="fashion-blank">
        <div className="fashion-blank-inner">
          <div className="fashion-blank-eyebrow">Fashion</div>
          <div className="fashion-blank-title">
            {needsPhoto
              ? "Add a body photo to see looks made for you."
              : "Add your style profile to guide searches."}
          </div>
          <div className="fashion-blank-subtitle">
            {needsPhoto
              ? "One full-body photo is all Stella needs. It stays on this Mac."
              : "Choose the department Stella should search so the products match you."}
          </div>
          <button
            type="button"
            className="fashion-blank-cta"
            onClick={() => {
              if (needsPhoto) {
                void handlePickPhoto();
              } else {
                setSheetOpen(true);
              }
            }}
            disabled={needsPhoto && pickingPhoto}
          >
            {needsPhoto ? (pickingPhoto ? "Choosing…" : "Choose photo") : "Open profile"}
          </button>
          {checkoutMessage ? (
            <div className="fashion-blank-error">{checkoutMessage}</div>
          ) : null}
        </div>
      </div>
    );
  } else if (outfits === undefined) {
    body = (
      <div className="fashion-blank">
        <div className="fashion-blank-inner">
          <div className="fashion-stage-placeholder">Loading your looks…</div>
        </div>
      </div>
    );
  } else if (!hasOutfits) {
    body = (
      <div className="fashion-blank">
        <div className="fashion-blank-inner">
          <div className="fashion-blank-eyebrow">Fashion</div>
          <div className="fashion-blank-title">Generate your first looks.</div>
          <div className="fashion-blank-subtitle">
            Describe a vibe, occasion, or style — or just press the button.
          </div>
          <button
            type="button"
            className="fashion-blank-cta"
            onClick={() => void handleGenerate()}
            disabled={!canGenerate || generating}
          >
            {generating ? "Working…" : "Generate looks"}
          </button>
          {checkoutMessage ? (
            <div className="fashion-blank-error">{checkoutMessage}</div>
          ) : null}
        </div>
      </div>
    );
  } else {
    body = (
      <div className="fashion-feed">
        {outfits.map((outfit) => (
          <FashionOutfitStage
            key={outfit._id}
            outfit={outfit}
            likedVariantIds={likedVariantIds}
            cartVariantIds={cartVariantIds}
            onLike={handleToggleLike}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="fashion-root"
      data-drag-over={isDragOver || undefined}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(event) => void handleDrop(event)}
    >
      {body}

      {isDragOver ? (
        <div className="fashion-drop-overlay" aria-hidden>
          <div className="fashion-drop-overlay-inner">
            <div className="fashion-drop-overlay-title">Drop to try it on</div>
            <div className="fashion-drop-overlay-subtitle">
              Images of clothes — files or links from your browser
            </div>
          </div>
        </div>
      ) : null}

      {showProfileButton ? (
        <button
          type="button"
          className="fashion-profile-btn"
          onClick={() => setSheetOpen(true)}
          aria-label="Style profile"
          title="Style profile"
        >
          {bodyPhotoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bodyPhotoDataUrl} alt="" />
          ) : (
            <span className="fashion-profile-btn-fallback">◎</span>
          )}
        </button>
      ) : null}

      {hasOutfits && canGenerate ? (
        <div className="fashion-prompt-dock">
          {tryOnImagePaths.length > 0 || tryOnImageUrls.length > 0 ? (
            <div className="fashion-prompt-attachments">
              {tryOnImageUrls.map((url) => (
                <div
                  key={`url-${url}`}
                  className="fashion-prompt-attachment"
                  title={url}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" />
                  <button
                    type="button"
                    className="fashion-prompt-attachment-x"
                    onClick={() => handleRemoveAttachment("url", url)}
                    aria-label="Remove attachment"
                  >
                    ×
                  </button>
                </div>
              ))}
              {tryOnImagePaths.map((path) => {
                const name = path.split(/[/\\]/).pop() ?? path;
                return (
                  <div
                    key={`path-${path}`}
                    className="fashion-prompt-attachment fashion-prompt-attachment--file"
                    title={path}
                  >
                    <span className="fashion-prompt-attachment-name">{name}</span>
                    <button
                      type="button"
                      className="fashion-prompt-attachment-x"
                      onClick={() => handleRemoveAttachment("path", path)}
                      aria-label="Remove attachment"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}
          <button
            type="button"
            className="fashion-prompt-attach"
            onClick={() => void handlePickTryOnImages()}
            disabled={pickingTryOn}
            aria-label="Attach clothes images"
            title="Attach clothes images to try on"
          >
            +
          </button>
          <input
            className="fashion-prompt-input"
            placeholder={
              tryOnImagePaths.length > 0 || tryOnImageUrls.length > 0
                ? "Try these clothes on — add notes (optional)"
                : "Describe a vibe — or drop / paste a clothes image"
            }
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleGenerate();
              }
            }}
          />
          <button
            type="button"
            className="fashion-prompt-send"
            onClick={() => void handleGenerate()}
            disabled={generating}
          >
            {generating
              ? "…"
              : tryOnImagePaths.length > 0 || tryOnImageUrls.length > 0
                ? "Try on"
                : "Generate"}
          </button>
        </div>
      ) : null}

      <FashionCartDock
        cart={cart ?? []}
        busy={checkoutBusy}
        onCheckout={() => void handleCheckout()}
        onSetQuantity={(item, quantity) => void handleSetCartQuantity(item, quantity)}
        onRemove={(item) => void handleRemoveCartItem(item)}
      />

      {sheetOpen ? (
        <FashionProfileSheet
          key={`${initialGender}:${initialPrefs}:${JSON.stringify(initialSizes)}:${
            profile?.hasBodyPhoto ? "photo" : "no-photo"
          }`}
          initialGender={initialGender}
          initialSizes={initialSizes}
          initialPrefs={initialPrefs}
          hasBodyPhoto={!!profile?.hasBodyPhoto}
          bodyPhotoDataUrl={bodyPhotoDataUrl}
          onPickPhoto={handlePickPhoto}
          onSave={(gender, sizes, prefs) =>
            void handleSaveProfile(gender, sizes, prefs)
          }
          onClose={() => setSheetOpen(false)}
          saving={savingProfile || pickingPhoto}
        />
      ) : null}
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
  const [installedMods, setInstalledMods] = useState<StoreInstall[]>([]);
  const [connectors, setConnectors] = useState<StellaConnectorSummary[]>([]);
  const [connectorsLoading, setConnectorsLoading] = useState(true);
  const [connectorsError, setConnectorsError] = useState<string | null>(null);
  const [credentialConnector, setCredentialConnector] =
    useState<StellaConnectorSummary | null>(null);
  const [confirmConnector, setConfirmConnector] =
    useState<StellaConnectorSummary | null>(null);
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

  const loadConnectors = useCallback(async () => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.listConnectors) {
      setConnectors([]);
      setConnectorsError(null);
      setConnectorsLoading(false);
      return;
    }
    try {
      const result = await bridge.listConnectors();
      setConnectors(result);
      setConnectorsError(null);
    } catch (error) {
      setConnectorsError(
        error instanceof Error ? error.message : "Couldn't load integrations",
      );
    } finally {
      setConnectorsLoading(false);
    }
  }, []);

  const requestInstallConnector = useCallback(
    async (marketplaceKey: string) => {
      const bridge = getDesktopStoreBridge();
      if (!bridge?.installConnector) {
        redirectToStoreSignIn();
        return;
      }
      const connector = connectors.find(
        (entry) => entry.marketplaceKey === marketplaceKey,
      );
      if (!connector) return;
      if (connector.requiresCredential || (connector.configFields?.length ?? 0) > 0) {
        setCredentialConnector(connector);
        return;
      }
      setConfirmConnector(connector);
    },
    [connectors],
  );

  const confirmInstallConnector = useCallback(async () => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.installConnector || !confirmConnector) return;
    const connector = confirmConnector;
    setConfirmConnector(null);
    try {
      await bridge.installConnector(connector.marketplaceKey);
      await loadConnectors();
    } catch (error) {
      setConnectorsError(
        error instanceof Error ? error.message : "Couldn't add this integration",
      );
    }
  }, [confirmConnector, loadConnectors]);

  const submitConnectorCredential = useCallback(
    async ({ credential, config }: ConnectorCredentialPayload) => {
      const bridge = getDesktopStoreBridge();
      if (!bridge?.installConnector || !credentialConnector) return;
      await bridge.installConnector(
        credentialConnector.marketplaceKey,
        credential,
        config,
      );
      setCredentialConnector(null);
      await loadConnectors();
    },
    [credentialConnector, loadConnectors],
  );

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
      setInstalledMods((previous) => [
        ...previous.filter((mod) => mod.packageId !== pkg.packageId),
        {
          packageId: pkg.packageId,
          displayName: pkg.displayName,
          releaseNumber: targetRelease.releaseNumber,
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

  useEffect(() => {
    void window.stellaDesktopStore?.listInstalledMods().then((mods) => {
      setInstalledMods(mods);
      setInstalledIds(new Set(mods.map((mod) => mod.packageId)));
    });
  }, []);

  useEffect(() => {
    void loadConnectors();
  }, [loadConnectors]);

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
            onInstall={() => requestInstall(selectedPackage)}
            onRemove={() => void removePackage(selectedPackage)}
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
                updateAvailable={isStoreUpdateAvailable(
                  featured,
                  installedMap.get(featured.packageId),
                )}
                installing={installingId === featured.packageId}
                onAction={() => requestInstall(featured)}
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
                      updateAvailable={isStoreUpdateAvailable(
                        pkg,
                        installedMap.get(pkg.packageId),
                      )}
                      installing={installingId === pkg.packageId}
                      onOpen={() => setSelectedPackageId(pkg.packageId)}
                      onInstall={() => requestInstall(pkg)}
                      onShare={() => setSharePkg(pkg)}
                    />
                  ))}
                </div>
              </div>
            )}
            {filter === "all" && query.trim() === "" ? (
              <ConnectTab
                connectors={connectors}
                loading={connectorsLoading}
                error={connectorsError}
                onInstall={requestInstallConnector}
              />
            ) : null}
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
      {confirmConnector ? (
        <ConnectorConfirmDialog
          connector={confirmConnector}
          onConfirm={() => void confirmInstallConnector()}
          onCancel={() => setConfirmConnector(null)}
        />
      ) : null}
      {credentialConnector ? (
        <ConnectorCredentialDialog
          key={credentialConnector.marketplaceKey}
          connector={credentialConnector}
          onSubmit={submitConnectorCredential}
          onCancel={() => setCredentialConnector(null)}
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
