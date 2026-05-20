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
  Compass,
  Copy,
  Download,
  Layers,
  Package,
  Plus,
  Search,
  Share2,
  User,
  X,
} from "lucide-react";
import { getConvexToken } from "@/lib/auth-token";
import { isConvexConfigured, readConvexSiteUrl } from "@/lib/convex-urls";
import { openSignInDialog } from "@/components/auth/sign-in-dialog";

type StoreCategory =
  | "apps-games"
  | "productivity"
  | "customization"
  | "skills-agents"
  | "integrations"
  | "other";

type StoreBadge = "verified" | "partner";

type StorePackage = {
  _id: string;
  packageId: string;
  displayName: string;
  description: string;
  category?: StoreCategory;
  latestReleaseNumber: number;
  installCount?: number;
  iconUrl?: string;
  authorUsername?: string;
  authorBadge?: StoreBadge;
  featured?: boolean;
  promoted?: boolean;
  promotedAt?: number;
  promotedUntil?: number;
  createdAt: number;
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

type NativeIntegration = {
  id: string;
  name: string;
  category: string;
  auth: string[];
  catalogToolCount: number;
  availability?: "ready";
  provider?: "google-workspace" | "oauth-catalog";
  sourceUrl?: string;
  iconUrl?: string;
  description: string;
  connectable?: boolean;
  oauthSetupStatus?:
    | "ready"
    | "missing_oauth_app"
    | "missing_backend_exchange"
    | "missing_callback_bridge";
  oauthSetupMessage?: string;
  oauthSetupGroup?: {
    id: string;
    name: string;
  };
  oauthProviderTemplate?: boolean;
  enabled?: boolean;
  toolCount?: number;
  actionCount?: number;
};

type StoreInstall = {
  packageId: string;
  displayName?: string;
  releaseNumber?: number;
  installedAt?: number;
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

type UserPetVisibility = "public" | "unlisted" | "private";

type UserPetRecord = {
  _id: string;
  _creationTime?: number;
  ownerId: string;
  petId: string;
  displayName: string;
  description: string;
  tags?: string[];
  prompt?: string;
  spritesheetUrl: string;
  previewUrl?: string;
  visibility: UserPetVisibility;
  searchText?: string;
  authorUsername?: string;
  installCount?: number;
  createdAt: number;
  updatedAt: number;
};

type UserPetUploadTarget = {
  key: string;
  publicUrl: string;
  putUrl: string;
  headers: Record<string, string>;
};

type UserPetUploadUrl = {
  uploadId: string;
  spritesheet: UserPetUploadTarget;
  preview?: UserPetUploadTarget;
};

type MediaJobSnapshot = {
  status?: string;
  output?: unknown;
  error?: { message?: string };
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
  authorUsername?: string;
  installCount?: number;
};

type EmojiPackVisibility = "public" | "unlisted" | "private";

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
  openSignIn?: () => Promise<unknown>;
  listNativeIntegrations?: () => Promise<NativeIntegration[]>;
  connectNativeIntegration?: (payload: {
    id: string;
  }) => Promise<NativeIntegration>;
  disconnectNativeIntegration?: (payload: {
    id: string;
  }) => Promise<NativeIntegration>;
  requestPackageInstall?: (payload: {
    packageId: string;
    releaseNumber: number;
  }) => Promise<StoreInstall | null>;
  listInstalledMods: () => Promise<StoreInstall[]>;
  uninstallPackage?: (packageId: string) => Promise<unknown>;
  installPet?: (payload: { pet: PublicPet }) => Promise<unknown>;
  selectPet?: (payload: { petId: string }) => Promise<unknown>;
  removePet?: (payload: { petId: string }) => Promise<unknown>;
  getPetState?: () => Promise<{
    installedPetIds: string[];
    selectedPetId: string | null;
    petOpen?: boolean;
  }>;
  setPetOpen?: (payload: { open: boolean }) => Promise<unknown>;
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
  petOpen: boolean;
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

const listNewPublicPackages = makeFunctionReference<
  "query",
  { limit?: number },
  StorePackage[]
>("data/store_packages:listNewPublicPackages");

const listStoreIntegrations = makeFunctionReference<
  "query",
  {},
  NativeIntegration[]
>("data/integrations:listStoreIntegrations");

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

const listMyUserPets = makeFunctionReference<
  "query",
  Record<string, never>,
  UserPetRecord[]
>("data/user_pets:listMine");

const listPublicUserPets = makeFunctionReference<
  "query",
  {
    paginationOpts: { numItems: number; cursor: string | null };
    search?: string;
  },
  { page: UserPetRecord[]; isDone: boolean; continueCursor: string }
>("data/user_pets:listPublicPage");

const createUserPet = makeFunctionReference<
  "mutation",
  {
    petId: string;
    displayName: string;
    description: string;
    prompt?: string;
    spritesheetUrl: string;
    previewUrl?: string;
    visibility: UserPetVisibility;
  },
  UserPetRecord
>("data/user_pets:createPet");

const recordUserPetInstall = makeFunctionReference<
  "mutation",
  { petId: string },
  null
>("data/user_pets:recordInstall");

const createUserPetUploadUrl = makeFunctionReference<
  "action",
  {
    petId: string;
    spritesheetSha256: string;
    previewSha256?: string;
    contentType?: string;
  },
  UserPetUploadUrl
>("data/user_pet_uploads:createUploadUrl");

const getMediaJobByJobId = makeFunctionReference<
  "query",
  { jobId: string },
  MediaJobSnapshot | null
>("media_jobs:getByJobId");

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

const listMyEmojiPacks = makeFunctionReference<
  "query",
  Record<string, never>,
  EmojiPack[]
>("data/emoji_packs:listMine");

const generateEmojiPack = makeFunctionReference<
  "action",
  { prompt: string; visibility: EmojiPackVisibility },
  EmojiPack
>("data/emoji_pack_generation:generatePack");

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
  { id: "other", label: "Other" },
];

const storeTabs = [
  { key: "discover", label: "Discover" },
  { key: "pets", label: "Pets" },
  { key: "emojis", label: "Emojis" },
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

const mergeNativeIntegrationUpdate = (
  previous: NativeIntegration[],
  next: NativeIntegration,
): NativeIntegration[] => {
  let matched = false;
  const updated = previous.map((entry) => {
    if (entry.id !== next.id) return entry;
    matched = true;
    return next;
  });
  return matched ? updated : [next, ...updated];
};

const isNativeIntegrationUserCancel = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return /could not connect\b[\s\S]*:\s*cancelled\b/i.test(message);
};

const getNativeIntegrationErrorMessage = (
  error: unknown,
  integration: NativeIntegration,
): string => {
  const message = error instanceof Error ? error.message : String(error);
  if (/client_secret is missing/i.test(message)) {
    return `${integration.name} is not ready to connect yet. Stella needs to finish the secure Google connection setup.`;
  }
  if (/not trusted|unverified|access blocked/i.test(message)) {
    return `${integration.name} is not ready to connect yet. Google has not approved this connection screen.`;
  }
  return message || `Couldn't add ${integration.name}.`;
};

const redirectToStoreSignIn = async () => {
  const bridge = getDesktopStoreBridge();
  if (bridge?.openSignIn) {
    await bridge.openSignIn().catch(() => undefined);
    return;
  }
  openSignInDialog();
};

const getStoreAuthToken = async (): Promise<string | null> =>
  (await getDesktopStoreBridge()?.getAuthToken?.().catch(() => null)) ??
  (await getConvexToken().catch(() => null));

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const encoded = token.split(".")[1];
  if (!encoded) return null;
  try {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const isConnectedStoreToken = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  return payload !== null && payload.isAnonymous !== true;
};

const ensureStoreAuth = async (): Promise<boolean> => {
  const token = await getStoreAuthToken();
  if (token && isConnectedStoreToken(token)) return true;
  await redirectToStoreSignIn();
  return false;
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

const normalizePetBridgeState = (value: unknown): PetBridgeState | null => {
  if (!isPetBridgeState(value)) return null;
  return {
    installedPetIds: value.installedPetIds,
    selectedPetId: value.selectedPetId,
    petOpen:
      typeof (value as { petOpen?: unknown }).petOpen === "boolean"
        ? Boolean((value as { petOpen?: unknown }).petOpen)
        : false,
  };
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

type UserPetSpritesheetBlob = {
  blob: Blob;
  sha256: string;
  objectUrl: string;
  warnings: string[];
  preview: UserPetPreviewBlob | null;
};

type UserPetPreviewBlob = {
  blob: Blob;
  sha256: string;
  objectUrl: string;
};

const USER_PET_ATLAS = {
  width: 2560,
  height: 3240,
  columns: 8,
  rows: 9,
  cellWidth: 320,
  cellHeight: 360,
  chroma: "#00ff00",
} as const;

const PREVIEW_STRIP = {
  width: 640,
  height: 90,
} as const;

const PET_GENERATION_ROWS = [
  {
    state: "idle",
    intent:
      "ambient breathing loop spread across all eight cells. Subtle chest/head movement only; no walking or waving.",
  },
  {
    state: "running-right",
    intent:
      "facing right, scampering across all eight cells. Body and limbs in motion; no speed lines, dust, or shadows.",
  },
  {
    state: "running-left",
    intent:
      "facing left, scampering across all eight cells, mirrored from running-right when symmetric. No speed lines, dust, or shadows.",
  },
  {
    state: "waving",
    intent:
      "warm greeting paw wave spread across all eight cells. Convey through paw pose only; no wave marks, motion arcs, sparkles, or symbols.",
  },
  {
    state: "jumping",
    intent:
      "vertical hop arc spread across all eight cells. Convey through body position only; no shadows, dust, landing marks, or impact bursts.",
  },
  {
    state: "failed",
    intent:
      "dizzy, shocked, or shaken reaction across all eight cells. Attached opaque tears, stars, or smoke puffs may overlap the silhouette; no detached symbols.",
  },
  {
    state: "waiting",
    intent:
      "polite needs-input loop across all eight cells. Looking up, tapping, or glancing; no question marks or thought bubbles.",
  },
  {
    state: "success",
    intent:
      "happy celebratory loop across all eight cells. Use pose and face only; no confetti, sparkles, floating hearts, or detached props.",
  },
  {
    state: "review",
    intent:
      "focused review loop across all eight cells. Lean, blink, eye direction, head tilt, or paw position; no papers, code, UI, or punctuation.",
  },
] as const;

const buildUserPetAtlasPrompt = (description: string): string => {
  const rowsTable = PET_GENERATION_ROWS.map(
    (row, index) => `| ${index} | ${row.state.padEnd(13)} | ${row.intent}`,
  ).join("\n");
  return `# Stella pet sprite atlas - Custom Pet

Generate a single ${USER_PET_ATLAS.width} x ${USER_PET_ATLAS.height} sprite sheet of the same pet performing nine animation states.

## Layout

- The image is exactly ${USER_PET_ATLAS.width} x ${USER_PET_ATLAS.height} pixels.
- ${USER_PET_ATLAS.rows} rows x ${USER_PET_ATLAS.columns} columns of ${USER_PET_ATLAS.cellWidth} x ${USER_PET_ATLAS.cellHeight} cells.
- Every row contains exactly ${USER_PET_ATLAS.columns} frames. Frames within each row read left to right.
- Each pet silhouette fits fully inside its single cell with breathing room on all sides. No silhouette crosses into a neighboring cell.

## Rows

| row | state         | animation intent
| --- | ------------- | ----------------
${rowsTable}

## Pet identity

${description.trim() || "A friendly Stella mascot pet."}

Identity must stay consistent across every cell: same head shape, face, markings, palette, prop, outline weight, and body proportions.

## Style

Small pixel-art-adjacent mascot. Chunky readable silhouette. Thick dark 1-2 px outline. Visible stepped pixel edges. Limited palette. Flat cel shading. Simple expressive face. Tiny limbs.

## Background

Background everywhere outside the pet silhouette is a single flat ${USER_PET_ATLAS.chroma} (true RGB, no gradient, no noise, no other green tones in the pet). The same ${USER_PET_ATLAS.chroma} fills the gutters between cells.

## Forbidden

- No detached effects, shadows, labels, frame numbers, captions, speech bubbles, thought bubbles, UI, code, punctuation marks, watermarks, or grid guidelines.
- No chroma-key-adjacent colors inside the pet, prop, or any allowed attached effect.
- No silhouette crossing into a neighboring cell. Scale the silhouette down when needed.`;
};

const getServiceAuthHeaders = async (headers: Record<string, string>) => {
  const token = await getStoreAuthToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};

const submitUserPetAtlasJob = async (
  description: string,
): Promise<{ jobId: string }> => {
  const endpoint = new URL(
    "/api/media/v1/generate",
    readConvexSiteUrl(),
  ).toString();
  const headers = await getServiceAuthHeaders({
    "Content-Type": "application/json",
  });
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      capability: "text_to_image",
      profile: "best",
      prompt: buildUserPetAtlasPrompt(description),
      input: {
        image_size: {
          width: USER_PET_ATLAS.width,
          height: USER_PET_ATLAS.height,
        },
        quality: "medium",
        output_format: "png",
      },
    }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Generation failed (${response.status})${text ? `: ${text}` : ""}`,
    );
  }
  const json = (await response.json()) as { jobId?: string };
  if (!json.jobId) throw new Error("Generation response missing jobId");
  return { jobId: json.jobId };
};

const extractFirstImageUrl = (output: unknown): string | null => {
  if (!output || typeof output !== "object") return null;
  const images = (output as { images?: Array<{ url?: string }> }).images;
  if (!Array.isArray(images)) return null;
  for (const entry of images) {
    if (entry?.url) return entry.url;
  }
  return null;
};

const blobToWebP = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob returned null"))),
      "image/webp",
      0.92,
    );
  });

const sha256Hex = async (blob: Blob): Promise<string> => {
  const buffer = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const keyChromaToAlpha = (imageData: ImageData): void => {
  const pixels = imageData.data;
  const key = { r: 0, g: 255, b: 0 };
  for (let i = 0; i < pixels.length; i += 4) {
    const dr = pixels[i]! - key.r;
    const dg = pixels[i + 1]! - key.g;
    const db = pixels[i + 2]! - key.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist <= 80) {
      pixels[i + 3] = 0;
    } else if (dist <= 130) {
      pixels[i + 3] = Math.round(255 * ((dist - 80) / 50));
    }
  }
};

const buildIdlePreviewStrip = async (
  atlasCanvas: HTMLCanvasElement,
): Promise<UserPetPreviewBlob> => {
  const previewCanvas = document.createElement("canvas");
  previewCanvas.width = PREVIEW_STRIP.width;
  previewCanvas.height = PREVIEW_STRIP.height;
  const ctx = previewCanvas.getContext("2d");
  if (!ctx) throw new Error("Canvas2D unavailable for preview");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    atlasCanvas,
    0,
    0,
    USER_PET_ATLAS.cellWidth * USER_PET_ATLAS.columns,
    USER_PET_ATLAS.cellHeight,
    0,
    0,
    PREVIEW_STRIP.width,
    PREVIEW_STRIP.height,
  );
  const blob = await blobToWebP(previewCanvas);
  return {
    blob,
    sha256: await sha256Hex(blob),
    objectUrl: URL.createObjectURL(blob),
  };
};

const processUserPetAtlasImage = async (
  imageUrl: string,
): Promise<UserPetSpritesheetBlob> => {
  const warnings: string[] = [];
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Image download failed (${response.status})`);
  const bitmap = await createImageBitmap(await response.blob());
  if (
    bitmap.width !== USER_PET_ATLAS.width ||
    bitmap.height !== USER_PET_ATLAS.height
  ) {
    warnings.push(
      `Generated atlas was ${bitmap.width}x${bitmap.height}; resized to ${USER_PET_ATLAS.width}x${USER_PET_ATLAS.height}.`,
    );
  }
  const canvas = document.createElement("canvas");
  canvas.width = USER_PET_ATLAS.width;
  canvas.height = USER_PET_ATLAS.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas2D unavailable");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  keyChromaToAlpha(imageData);
  ctx.putImageData(imageData, 0, 0);
  const blob = await blobToWebP(canvas);
  return {
    blob,
    sha256: await sha256Hex(blob),
    objectUrl: URL.createObjectURL(blob),
    warnings,
    preview: await buildIdlePreviewStrip(canvas).catch(() => null),
  };
};

const uploadUserPetSpritesheetToR2 = async (
  blob: Blob,
  target: UserPetUploadTarget,
): Promise<void> => {
  const response = await fetch(target.putUrl, {
    method: "PUT",
    headers: target.headers,
    body: blob,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Pet upload failed (${response.status})${text ? `: ${text}` : ""}`,
    );
  }
};

const buildUserPetId = (): string =>
  `pet-${Date.now().toString(36).slice(-6)}`;

const userPetToPublicPet = (pet: UserPetRecord): PublicPet => ({
  id: pet.petId,
  displayName: pet.displayName,
  description: pet.description,
  kind: "custom",
  tags: pet.tags ?? ["custom"],
  ownerName: pet.authorUsername ? `@${pet.authorUsername}` : null,
  spritesheetUrl: pet.spritesheetUrl,
  ...(pet.previewUrl ? { previewUrl: pet.previewUrl } : {}),
  downloads: pet.installCount ?? 0,
});

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

function BadgeMark({
  badge,
  size = 12,
}: {
  badge?: StoreBadge;
  size?: number;
}) {
  if (!badge) return null;
  // Partner = filled checkmark in a starburst (enterprise/brand);
  // verified = filled checkmark in a circle (active paid plan).
  // Tooltip via native title — keeps it lightweight; we can move to a
  // shared tooltip primitive when more surfaces need it.
  const title =
    badge === "partner"
      ? "Stella partner"
      : "Verified Stella subscriber";
  const className = `store-badge-mark store-badge-mark--${badge}`;
  if (badge === "partner") {
    return (
      <svg
        aria-label={title}
        className={className}
        height={size}
        role="img"
        viewBox="0 0 24 24"
        width={size}
      >
        <title>{title}</title>
        <path
          d="M12 1.6l2.4 2.6 3.5-.6.6 3.5L21 9.6l-1.7 3.1 1.7 3.1-2.5 2.5-.6 3.5-3.5-.6L12 23.4l-2.4-2.8-3.5.6-.6-3.5L3 16l1.7-3.1L3 9.6l2.5-2.5.6-3.5 3.5.6L12 1.6z"
          fill="currentColor"
        />
        <path
          d="M8.2 12.1l2.7 2.7 4.9-5"
          fill="none"
          stroke="#fff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  return (
    <svg
      aria-label={title}
      className={className}
      height={size}
      role="img"
      viewBox="0 0 24 24"
      width={size}
    >
      <title>{title}</title>
      <circle cx="12" cy="12" fill="currentColor" r="10" />
      <path
        d="M7.8 12.4l2.7 2.7 5.7-5.8"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.1"
      />
    </svg>
  );
}

function AuthorChip({
  username,
  badge,
  variant = "card",
}: {
  username?: string;
  badge?: StoreBadge;
  variant?: "card" | "featured" | "detail";
}) {
  if (!username) return null;
  const displayed = `@${username}`;
  const initial = getInitial(username);
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
  const badgeSize = variant === "card" ? 11 : variant === "featured" ? 13 : 14;
  return (
    <div className={className}>
      <span className={avatarClassName}>{initial}</span>
      <span>by {displayed}</span>
      <BadgeMark badge={badge} size={badgeSize} />
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
          <AuthorChip
            username={pkg.authorUsername}
            badge={pkg.authorBadge}
          />
          <span className="store-card-installs">
            {formatInstallCount(pkg.installCount)}
          </span>
        </div>
      </div>
    </div>
  );
}

function NativeIntegrationCard({
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
  const statusLabel = enabled
    ? "Added"
    : connectable
      ? "Ready"
      : integration.oauthSetupGroup
        ? `${integration.oauthSetupGroup.name} setup`
        : integration.oauthProviderTemplate
          ? "App setup"
          : "Needs setup";
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
      <PackageArtwork
        iconUrl={integration.iconUrl}
        name={integration.name}
        className="store-card-image"
        letterClassName="store-card-image-letter"
      />
      <div className="store-card-body">
        <div className="store-card-top">
          <span className="store-card-name">{integration.name}</span>
          <div className="store-card-actions">
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
        <div className="store-card-desc">
          {connectable
            ? integration.description
            : integration.oauthSetupMessage || integration.description}
        </div>
        <div className="store-card-footer">
          <AuthorChip username="Stella" badge="verified" />
          <div className="store-card-meta-group">
            <span
              className="store-card-status-chip"
              data-state={enabled ? "added" : connectable ? "ready" : "setup"}
            >
              {statusLabel}
            </span>
            <span className="store-card-installs">{`${actionCount} actions`}</span>
          </div>
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

// "For You" ranking weight. Higher = surfaces earlier. Promotion and
// partner badges outrank organic listings; verified gets a smaller
// nudge so it doesn't drown out fresh organic content. Recency is
// the tiebreaker so the feed still cycles.
const FOR_YOU_BUCKET_WEIGHT: Record<string, number> = {
  promoted: 1000,
  partner: 100,
  verified: 10,
  organic: 0,
};

const getForYouBucket = (pkg: StorePackage): keyof typeof FOR_YOU_BUCKET_WEIGHT => {
  const promotedActive =
    pkg.promoted === true &&
    (pkg.promotedUntil === undefined || pkg.promotedUntil >= Date.now());
  if (promotedActive) return "promoted";
  if (pkg.authorBadge === "partner") return "partner";
  if (pkg.authorBadge === "verified") return "verified";
  return "organic";
};

const sortPackagesForYou = (packages: StorePackage[]): StorePackage[] =>
  packages.slice().sort((a, b) => {
    const aw = FOR_YOU_BUCKET_WEIGHT[getForYouBucket(a)] ?? 0;
    const bw = FOR_YOU_BUCKET_WEIGHT[getForYouBucket(b)] ?? 0;
    if (aw !== bw) return bw - aw;
    return b.updatedAt - a.updatedAt;
  });

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

function buildShareLink(authorUsername: string, packageId: string): string {
  return `stella://store/${authorUsername.trim().toLowerCase()}/${packageId.trim().toLowerCase()}`;
}

function ShareDialog({
  pkg,
  onClose,
}: {
  pkg: StorePackage;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const link = pkg.authorUsername
    ? buildShareLink(pkg.authorUsername, pkg.packageId)
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

function CreatePetDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (pet: UserPetRecord) => void;
}) {
  const createUploadUrl = useAction(createUserPetUploadUrl);
  const createPet = useMutation(createUserPet);
  const [prompt, setPrompt] = useState("");
  const [visibility, setVisibility] = useState<UserPetVisibility>("private");
  const [jobId, setJobId] = useState<string | null>(null);
  const [blob, setBlob] = useState<UserPetSpritesheetBlob | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<PetAnimationState>("idle");
  const objectUrlsRef = useRef<string[]>([]);
  const processedJobsRef = useRef<Set<string>>(new Set());
  const job = useQuery(getMediaJobByJobId, jobId ? { jobId } : "skip");

  const revokeObjectUrls = useCallback(() => {
    for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
    objectUrlsRef.current = [];
  }, []);

  useEffect(() => revokeObjectUrls, [revokeObjectUrls]);

  useEffect(() => {
    if (!blob) return;
    const id = window.setInterval(() => {
      setPreviewState((current) => {
        const states: PetAnimationState[] = [
          "idle",
          "running-right",
          "waving",
          "jumping",
        ];
        const index = states.indexOf(current);
        return states[(index + 1) % states.length] ?? "idle";
      });
    }, 3500);
    return () => window.clearInterval(id);
  }, [blob]);

  useEffect(() => {
    if (!jobId || !job) return;
    if (job.status === "succeeded") {
      if (processedJobsRef.current.has(jobId)) return;
      processedJobsRef.current.add(jobId);
      const url = extractFirstImageUrl(job.output);
      if (!url) {
        Promise.resolve().then(() => {
          setBusy(false);
          setError("Generation finished without an image.");
        });
        return;
      }
      void (async () => {
        try {
          const processed = await processUserPetAtlasImage(url);
          revokeObjectUrls();
          objectUrlsRef.current = [processed.objectUrl];
          if (processed.preview) objectUrlsRef.current.push(processed.preview.objectUrl);
          setBlob(processed);
          setBusy(false);
          setError(null);
        } catch (err) {
          setBusy(false);
          setError(
            err instanceof Error ? err.message : "Couldn't process pet atlas.",
          );
        }
      })();
    } else if (job.status === "failed" || job.status === "canceled") {
      Promise.resolve().then(() => {
        setBusy(false);
        setError(job.error?.message ?? "Generation failed.");
      });
    }
  }, [job, jobId, revokeObjectUrls]);

  const handleGenerate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || busy) return;
    if (!(await ensureStoreAuth())) return;
    revokeObjectUrls();
    processedJobsRef.current = new Set();
    setBlob(null);
    setError(null);
    setBusy(true);
    try {
      const result = await submitUserPetAtlasJob(trimmed);
      setJobId(result.jobId);
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Couldn't start generation.");
    }
  }, [busy, prompt, revokeObjectUrls]);

  const handleSave = useCallback(async () => {
    if (!blob || saving) return;
    if (!(await ensureStoreAuth())) return;
    const trimmed = prompt.trim() || "A custom Stella pet.";
    setSaving(true);
    try {
      const petId = buildUserPetId();
      const upload = await createUploadUrl({
        petId,
        spritesheetSha256: blob.sha256,
        ...(blob.preview ? { previewSha256: blob.preview.sha256 } : {}),
        contentType: "image/webp",
      });
      const uploads = [
        uploadUserPetSpritesheetToR2(blob.blob, upload.spritesheet),
      ];
      if (blob.preview && upload.preview) {
        uploads.push(uploadUserPetSpritesheetToR2(blob.preview.blob, upload.preview));
      }
      await Promise.all(uploads);
      const created = await createPet({
        petId,
        displayName: "Stella pet",
        description: trimmed,
        prompt: trimmed,
        spritesheetUrl: upload.spritesheet.publicUrl,
        ...(upload.preview ? { previewUrl: upload.preview.publicUrl } : {}),
        visibility,
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save pet.");
    } finally {
      setSaving(false);
    }
  }, [blob, createPet, createUploadUrl, onClose, onCreated, prompt, saving, visibility]);

  return (
    <StoreModal onClose={saving ? () => undefined : onClose}>
      <div className="user-pet-create-dialog">
        <div className="user-pet-create-header">
          <div className="user-pet-create-title">Create a pet</div>
          <p className="user-pet-create-caption">
            Describe your pet - Stella draws a full animated spritesheet and
            names it for you.
          </p>
        </div>
        <div className="user-pet-create-body">
          <section
            className="user-pet-create-stage"
            data-state={blob ? "ready" : busy ? "busy" : error ? "error" : "empty"}
          >
            {blob ? (
              <PetSprite
                spritesheetUrl={blob.objectUrl}
                state={previewState}
                size={180}
              />
            ) : (
              <div className="user-pet-create-empty">
                <Package size={22} aria-hidden />
                <span className="user-pet-create-empty-text">
                  {busy
                    ? "Drawing your pet..."
                    : error
                      ? error
                      : "Your animated pet appears here"}
                </span>
              </div>
            )}
          </section>
          {blob ? (
            <div className="user-pet-create-state-row" aria-label="Preview state">
              {(["idle", "running-right", "waving", "jumping"] as PetAnimationState[]).map(
                (state) => (
                  <button
                    key={state}
                    type="button"
                    className="user-pet-create-state-pill"
                    data-active={previewState === state || undefined}
                    onClick={() => setPreviewState(state)}
                  >
                    {state.replace("-", " ")}
                  </button>
                ),
              )}
            </div>
          ) : null}
          {blob?.warnings.length ? (
            <p className="user-pet-create-warning">
              {blob.warnings.slice(0, 2).join(" ")}
            </p>
          ) : null}
          <form
            className="user-pet-create-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleGenerate();
            }}
          >
            <label className="user-pet-create-field">
              <span className="user-pet-create-field-label">Describe the pet</span>
              <textarea
                className="user-pet-create-textarea"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Tiny moon fox, sleepy desk dragon, glassy pixel jelly..."
                rows={3}
                maxLength={2000}
                autoFocus
              />
            </label>
            <div className="user-pet-create-field">
              <span className="user-pet-create-field-label">Visibility</span>
              <div className="user-pet-create-visibility">
                {(["public", "unlisted", "private"] as UserPetVisibility[]).map(
                  (option) => (
                    <button
                      type="button"
                      key={option}
                      className="user-pet-create-visibility-pill"
                      data-active={visibility === option || undefined}
                      onClick={() => setVisibility(option)}
                      disabled={saving}
                    >
                      <span className="user-pet-create-visibility-title">
                        {option[0]!.toUpperCase() + option.slice(1)}
                      </span>
                      <span className="user-pet-create-visibility-sub">
                        {option === "public"
                          ? "Listed on the Store"
                          : option === "unlisted"
                            ? "Anyone with the link"
                            : "Only you"}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="user-pet-create-actions">
              <button
                type="button"
                className="store-action-btn user-pet-create-discard"
                data-variant="subtle"
                onClick={onClose}
                disabled={saving}
              >
                Discard
              </button>
              <button
                type="submit"
                className="store-action-btn store-action-btn--lg"
                data-variant={busy ? "working" : "get"}
                disabled={busy || prompt.trim().length === 0}
              >
                {busy ? "Generating..." : blob ? "Regenerate" : "Generate"}
              </button>
              <button
                type="button"
                className="store-action-btn store-action-btn--lg"
                data-variant={saving ? "working" : "get"}
                disabled={!blob || saving}
                onClick={() => void handleSave()}
              >
                {saving ? "Saving..." : "Save pet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </StoreModal>
  );
}

function CreateEmojiPackDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (pack: EmojiPack) => void;
}) {
  const generatePack = useAction(generateEmojiPack);
  const [prompt, setPrompt] = useState("");
  const [visibility, setVisibility] = useState<EmojiPackVisibility>("private");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || submitting) return;
    if (!(await ensureStoreAuth())) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await generatePack({ prompt: trimmed, visibility });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create pack.");
    } finally {
      setSubmitting(false);
    }
  }, [generatePack, onClose, onCreated, prompt, submitting, visibility]);

  return (
    <StoreModal onClose={submitting ? () => undefined : onClose}>
      <div className="emoji-create-dialog">
        <div className="emoji-create-header">
          <div className="emoji-create-title">Create emoji pack</div>
          <p className="emoji-create-caption">
            Describe the vibe - Stella paints custom emojis across sheets and
            names the pack for you.
          </p>
        </div>
        <div className="emoji-create-body">
          <section className="emoji-create-stage" aria-label="Generated emoji preview">
            <div
              className="emoji-create-empty"
              data-state={submitting ? "busy" : error ? "error" : "empty"}
            >
              <Package size={22} aria-hidden />
              <span className="emoji-create-empty-text">
                {submitting
                  ? "Painting your pack..."
                  : error
                    ? error
                    : "Stella's emojis appear after save"}
              </span>
            </div>
          </section>
          <form
            className="emoji-create-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <label className="emoji-create-field">
              <span className="emoji-create-field-label">
                How should the pack feel?
              </span>
              <textarea
                className="emoji-create-textarea"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Neon synthwave, soft pastel, claymation..."
                rows={3}
                maxLength={2000}
                autoFocus
              />
            </label>
            <div className="emoji-create-field">
              <span className="emoji-create-field-label">Visibility</span>
              <div className="emoji-create-visibility">
                {(["public", "unlisted", "private"] as EmojiPackVisibility[]).map(
                  (option) => (
                    <button
                      type="button"
                      key={option}
                      className="emoji-create-visibility-pill"
                      data-active={visibility === option || undefined}
                      onClick={() => setVisibility(option)}
                      disabled={submitting}
                    >
                      <span className="emoji-create-visibility-title">
                        {option[0]!.toUpperCase() + option.slice(1)}
                      </span>
                      <span className="emoji-create-visibility-sub">
                        {option === "public"
                          ? "Listed on the Store"
                          : option === "unlisted"
                            ? "Anyone with the link"
                            : "Only you"}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="emoji-create-actions">
              <button
                type="button"
                className="store-action-btn emoji-create-discard"
                data-variant="subtle"
                onClick={onClose}
                disabled={submitting}
              >
                Discard
              </button>
              <button
                type="submit"
                className="store-action-btn store-action-btn--lg"
                data-variant={submitting ? "working" : "get"}
                disabled={submitting || prompt.trim().length === 0}
              >
                {submitting ? "Saving..." : "Save pack"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </StoreModal>
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

function PetCard({
  pet,
  installed,
  selected,
  working,
  onOpen,
  onGet,
  onSelect,
  onRemove,
}: {
  pet: PublicPet;
  installed: boolean;
  selected: boolean;
  working: boolean;
  onOpen: () => void;
  onGet: () => void;
  onSelect: () => Promise<void> | void;
  onRemove: () => Promise<void> | void;
}) {
  return (
    <article
      className="pets-card pets-card-wrapper"
      data-selected={selected ? "true" : "false"}
      data-pet-state={selected ? "selected" : installed ? "installed" : "uninstalled"}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="pets-card-sprite">
        <PetSprite spritesheetUrl={pet.spritesheetUrl} state="idle" size={84} />
      </div>
      <div className="pets-card-name-row">
        <span className="pets-card-name">{pet.displayName}</span>
      </div>
      <div className="pets-card-meta">
        <span className="pets-card-creator">by {pet.ownerName || "Stella"}</span>
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
            onClick={onGet}
            type="button"
          >
            {working ? "Getting..." : "Get"}
          </button>
        ) : (
          <>
            <button
              className="store-action-btn"
              data-variant={selected ? "added" : working ? "working" : "get"}
              disabled={selected || working}
              onClick={() => void onSelect()}
              type="button"
            >
              {selected ? "Selected" : working ? "Selecting..." : "Select"}
            </button>
            <button
              className="store-action-btn"
              data-variant={working ? "working" : "remove"}
              disabled={working}
              onClick={() => void onRemove()}
              type="button"
            >
              {working ? "Removing..." : "Remove"}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function PetsTab() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>(ALL_TAG);
  const [sort, setSort] = useState<PetSort>("downloads");
  const [viewMode, setViewMode] = useState<"discover" | "mine">("discover");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsPet, setDetailsPet] = useState<PublicPet | null>(null);
  const [petState, setPetState] = useState<PetBridgeState>({
    installedPetIds: [],
    selectedPetId: null,
    petOpen: false,
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
  const {
    results: publicUserPets,
    status: publicUserPetStatus,
    loadMore: loadMorePublicUserPets,
  } = usePaginatedQuery(
    listPublicUserPets,
    trimmedSearch ? { search: trimmedSearch } : {},
    { initialNumItems: PAGE_SIZE },
  ) as {
    results: UserPetRecord[];
    status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
    loadMore: (numItems: number) => void;
  };
  const myUserPets = useQuery(listMyUserPets, {});
  const tagFacets = useQuery(listPetTagFacets, {});
  const incrementDownloads = useMutation(incrementPetDownloads);
  const recordUserInstall = useMutation(recordUserPetInstall);
  const installedPetIds = useMemo(
    () => new Set(petState.installedPetIds),
    [petState.installedPetIds],
  );
  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";
  const isLoadingFirstPage = status === "LoadingFirstPage";
  const canLoadMoreUserPets = publicUserPetStatus === "CanLoadMore";
  const isLoadingMoreUserPets = publicUserPetStatus === "LoadingMore";
  const tagOptions = useMemo(() => (tagFacets ?? []).map((facet) => facet.tag), [
    tagFacets,
  ]);
  const ownedUserPetIds = useMemo(() => {
    const ids = new Set<string>();
    for (const pet of myUserPets ?? []) ids.add(pet.petId);
    return ids;
  }, [myUserPets]);
  const userPetIds = useMemo(() => {
    const ids = new Set<string>();
    for (const pet of publicUserPets) ids.add(pet.petId);
    for (const pet of myUserPets ?? []) ids.add(pet.petId);
    return ids;
  }, [myUserPets, publicUserPets]);
  const publicUserPetCards = useMemo(
    () =>
      publicUserPets
        .filter((pet) => !ownedUserPetIds.has(pet.petId))
        .map(userPetToPublicPet),
    [ownedUserPetIds, publicUserPets],
  );
  const discoverPets = useMemo(() => {
    const seen = new Set(pets.map((pet) => pet.id));
    return [
      ...pets,
      ...publicUserPetCards.filter((pet) => {
        if (seen.has(pet.id)) return false;
        if (activeTag !== ALL_TAG && !pet.tags.includes(activeTag)) return false;
        return true;
      }),
    ];
  }, [activeTag, pets, publicUserPetCards]);
  const myPetCards = useMemo(
    () => (myUserPets ?? []).map(userPetToPublicPet),
    [myUserPets],
  );
  const visiblePets = viewMode === "mine" ? myPetCards : discoverPets;
  const visibleCountSuffix =
    viewMode === "discover" && (canLoadMore || canLoadMoreUserPets) ? "+" : "";

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
        const next = normalizePetBridgeState(state);
        if (next) setPetState(next);
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

  useEffect(() => {
    if (!canLoadMoreUserPets) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMorePublicUserPets(PAGE_SIZE);
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMoreUserPets, loadMorePublicUserPets]);

  const applyPetStateResult = (result: unknown, fallback: PetBridgeState) => {
    setPetState(normalizePetBridgeState(result) ?? fallback);
  };

  const recordOneInstall = async (petId: string) => {
    if (userPetIds.has(petId)) {
      await recordUserInstall({ petId });
    } else {
      await incrementDownloads({ id: petId });
    }
  };

  const installPet = async (pet: PublicPet) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.installPet) {
      await redirectToStoreSignIn();
      return;
    }
    if (!(await ensureStoreAuth())) return;
    setActionError(null);
    setWorkingPetId(pet.id);
    try {
      const result = await bridge.installPet({ pet });
      applyPetStateResult(result, {
        installedPetIds: Array.from(new Set([...petState.installedPetIds, pet.id])),
        selectedPetId: pet.id,
        petOpen: true,
      });
      void recordOneInstall(pet.id).catch((error) => {
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
      await redirectToStoreSignIn();
      return;
    }
    setActionError(null);
    setWorkingPetId(petId);
    try {
      const result = await bridge.selectPet({ petId });
      applyPetStateResult(result, {
        installedPetIds: petState.installedPetIds,
        selectedPetId: petId,
        petOpen: true,
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
        petOpen: petState.petOpen,
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Couldn't remove pet");
    } finally {
      setWorkingPetId(null);
    }
  };

  const setPetOpen = async (open: boolean) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.setPetOpen) return;
    setActionError(null);
    try {
      const result = await bridge.setPetOpen({ open });
      applyPetStateResult(result, {
        ...petState,
        petOpen: open,
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Couldn't update pet visibility",
      );
    }
  };

  const handleCreatedPet = (pet: UserPetRecord) => {
    setCreateOpen(false);
    const publicPet = userPetToPublicPet(pet);
    void installPet(publicPet);
  };

  return (
    <main className="pets-page">
      <header className="pets-page-header">
        <div className="pets-page-heading">
          <h1 className="pets-page-title">Pets</h1>
          <span className="pets-page-count">
            {visiblePets.length}
            {visibleCountSuffix} loaded
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
        <div className="pets-toolbar-actions">
          <button
            type="button"
            className="store-action-btn store-action-btn--lg"
            data-variant="subtle"
            onClick={() =>
              setViewMode((current) => (current === "mine" ? "discover" : "mine"))
            }
          >
            {viewMode === "mine" ? (
              <>
                <Compass size={14} aria-hidden />
                Discover
              </>
            ) : (
              <>
                <User size={14} aria-hidden />
                My pets
              </>
            )}
          </button>
          <button
            type="button"
            className="store-action-btn store-action-btn--lg"
            data-variant="get"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={14} aria-hidden />
            Create pet
          </button>
          <button
            type="button"
            className="store-action-btn store-action-btn--lg"
            data-variant={petState.petOpen ? "subtle" : "get"}
            onClick={() => void setPetOpen(!petState.petOpen)}
          >
            {petState.petOpen ? "Hide pet" : "Show pet"}
          </button>
        </div>
      </div>
      {viewMode === "discover" ? (
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
      ) : null}
      {actionError ? (
        <div className="store-status" data-variant="error">
          {actionError}
        </div>
      ) : null}
      {viewMode === "discover" && myUserPets && myUserPets.length > 0 ? (
        <section className="pets-your-section">
          <div className="pets-your-header">
            <span className="pets-your-title">Your pets</span>
            <span className="pets-your-count">{myUserPets.length}</span>
          </div>
          <div className="pets-grid">
            {myPetCards.map((pet) => {
              const selected = petState.selectedPetId === pet.id;
              const working = workingPetId === pet.id;
              return (
                <PetCard
                  key={`mine-${pet.id}`}
                  pet={pet}
                  installed
                  selected={selected}
                  working={working}
                  onOpen={() => setDetailsPet(pet)}
                  onGet={() => installPet(pet)}
                  onSelect={() => selectPet(pet.id)}
                  onRemove={() => removePet(pet.id)}
                />
              );
            })}
          </div>
        </section>
      ) : null}
      {isLoadingFirstPage && viewMode === "discover" ? (
        <div className="store-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="store-skeleton-card" key={index} />
          ))}
        </div>
      ) : viewMode === "mine" && myUserPets === undefined ? (
        <div className="pets-empty">Loading...</div>
      ) : visiblePets.length === 0 ? (
        <div className="pets-empty">
          {viewMode === "mine"
            ? "You haven't created any pets yet."
            : "No pets match that filter. Try a different tag or clear the search."}
        </div>
      ) : (
        <>
          <div className="pets-grid">
            {visiblePets.map((pet) => {
              const installed = installedPetIds.has(pet.id);
              const selected = petState.selectedPetId === pet.id;
              const working = workingPetId === pet.id;
              return (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  installed={installed}
                  selected={selected}
                  working={working}
                  onOpen={() => setDetailsPet(pet)}
                  onGet={() => setDetailsPet(pet)}
                  onSelect={() => selectPet(pet.id)}
                  onRemove={() => removePet(pet.id)}
                />
              );
            })}
          </div>
          {viewMode === "discover" &&
          (canLoadMore || isLoadingMore || canLoadMoreUserPets || isLoadingMoreUserPets) ? (
            <div
              ref={sentinelRef}
              className="pets-grid-sentinel"
              data-loading={
                isLoadingMore || isLoadingMoreUserPets ? "true" : "false"
              }
              aria-hidden="true"
            >
              {isLoadingMore || isLoadingMoreUserPets ? "Loading more..." : ""}
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
      {createOpen ? (
        <CreatePetDialog
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreatedPet}
        />
      ) : null}
    </main>
  );
}

function EmojiPackCard({
  pack,
  active,
  onOpen,
}: {
  pack: EmojiPack;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <article className="emoji-pack-card" data-active={active || undefined}>
      <button
        type="button"
        className="emoji-pack-cover"
        aria-label={`Open ${pack.displayName}`}
        onClick={onOpen}
      >
        {pack.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="emoji-pack-cover-img" src={pack.coverUrl} />
        ) : (
          <span className="emoji-pack-cover-glyph" aria-hidden>
            {pack.coverEmoji}
          </span>
        )}
      </button>
      <div className="emoji-pack-body">
        <div className="emoji-pack-name-row">
          <span className="emoji-pack-name">{pack.displayName}</span>
          {pack.visibility && pack.visibility !== "public" ? (
            <span
              className="emoji-pack-visibility-badge"
              data-tier={pack.visibility}
            >
              {pack.visibility === "private" ? "Private" : "Unlisted"}
            </span>
          ) : null}
        </div>
        {pack.description ? (
          <span className="emoji-pack-desc">{pack.description}</span>
        ) : null}
        <div className="emoji-pack-meta">
          <span className="emoji-pack-author">
            by {pack.authorUsername ? `@${pack.authorUsername}` : "Stella"}
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
          onClick={onOpen}
          type="button"
        >
          {active ? "Active" : "Get"}
        </button>
      </div>
    </article>
  );
}

function EmojisTab() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>(ALL_TAG);
  const [sort, setSort] = useState<EmojiPackSort>("installs");
  const [viewMode, setViewMode] = useState<"discover" | "mine">("discover");
  const [createOpen, setCreateOpen] = useState(false);
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
  const myPacks = useQuery(listMyEmojiPacks, {});
  const recordInstall = useMutation(recordEmojiInstall);
  const activePackId = emojiState.activePack?.packId ?? null;
  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";
  const isLoadingFirstPage = status === "LoadingFirstPage";
  const tagOptions = useMemo(() => (tagFacets ?? []).map((facet) => facet.tag), [
    tagFacets,
  ]);
  const ownedPackIds = useMemo(() => {
    const ids = new Set<string>();
    for (const pack of myPacks ?? []) ids.add(pack.packId);
    return ids;
  }, [myPacks]);
  const visiblePublicPacks = useMemo(
    () => packs.filter((pack) => !ownedPackIds.has(pack.packId)),
    [ownedPackIds, packs],
  );
  const visiblePacks = viewMode === "mine" ? (myPacks ?? []) : visiblePublicPacks;

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
      await redirectToStoreSignIn();
      return;
    }
    if (!(await ensureStoreAuth())) return;
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

  const handleCreatedPack = (pack: EmojiPack) => {
    setCreateOpen(false);
    void installEmojiPack(pack);
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
        <div className="emoji-page-toolbar-actions">
          <button
            type="button"
            className="store-action-btn store-action-btn--lg"
            data-variant="subtle"
            onClick={() =>
              setViewMode((current) => (current === "mine" ? "discover" : "mine"))
            }
          >
            {viewMode === "mine" ? (
              <>
                <Compass size={14} aria-hidden />
                Discover
              </>
            ) : (
              <>
                <User size={14} aria-hidden />
                My emojis
              </>
            )}
          </button>
          <button
            type="button"
            className="store-action-btn store-action-btn--lg"
            data-variant="get"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={14} aria-hidden />
            Create pack
          </button>
        </div>
      </div>
      {viewMode === "discover" ? (
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
      ) : null}
      {actionError ? (
        <div className="store-status" data-variant="error">
          {actionError}
        </div>
      ) : null}
      {viewMode === "discover" && myPacks && myPacks.length > 0 ? (
        <section className="emoji-page-section">
          <div className="emoji-page-section-header">
            <span className="emoji-page-section-title">Your packs</span>
            <span className="emoji-page-section-count">{myPacks.length}</span>
          </div>
          <div className="emoji-pack-grid">
            {myPacks.map((pack) => {
              const active = activePackId === pack.packId;
              return (
                <EmojiPackCard
                  key={`mine-${pack.packId}`}
                  pack={pack}
                  active={active}
                  onOpen={() => {
                    setPreviewSheet(0);
                    setDetailsPack(pack);
                  }}
                />
              );
            })}
          </div>
        </section>
      ) : null}
      {isLoadingFirstPage && viewMode === "discover" ? (
        <div className="emoji-pack-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="store-skeleton-card" key={index} />
          ))}
        </div>
      ) : viewMode === "mine" && myPacks === undefined ? (
        <div className="emoji-page-empty">Loading...</div>
      ) : visiblePacks.length === 0 ? (
        <div className="emoji-page-empty">
          {viewMode === "mine"
            ? "You haven't created any emoji packs yet."
            : trimmedSearch
              ? "No packs match that search."
              : "No community packs yet."}
        </div>
      ) : (
        <section className="emoji-page-section">
          <div className="emoji-page-section-header">
            <span className="emoji-page-section-title">
              {viewMode === "mine" ? "My emojis" : "Discover"}
            </span>
            <span className="emoji-page-section-count">
              {visiblePacks.length}
              {viewMode === "discover" && canLoadMore ? "+" : ""}
            </span>
          </div>
          <div className="emoji-pack-grid">
            {visiblePacks.map((pack) => {
              const active = activePackId === pack.packId;
              return (
                <EmojiPackCard
                  key={pack._id}
                  pack={pack}
                  active={active}
                  onOpen={() => {
                    setPreviewSheet(0);
                    setDetailsPack(pack);
                  }}
                />
              );
            })}
          </div>
          {viewMode === "discover" && (canLoadMore || isLoadingMore) ? (
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
                  `Pack by ${detailsPack.authorUsername ? `@${detailsPack.authorUsername}` : "Stella"}`}
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
                      {detailsPack.authorUsername
                        ? `@${detailsPack.authorUsername}`
                        : "Stella"}
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
      {createOpen ? (
        <CreateEmojiPackDialog
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreatedPack}
        />
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
  const [connectingIntegrationId, setConnectingIntegrationId] = useState<
    string | null
  >(null);
  const [nativeIntegrationError, setNativeIntegrationError] = useState<
    string | null
  >(null);
  const [sharePkg, setSharePkg] = useState<StorePackage | null>(null);
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
  const newPackages = useQuery(listNewPublicPackages, { limit: 12 });
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
  // Hide the New section when it overlaps significantly with what the
  // main grid would already show — surfacing the same package twice
  // (Featured + New + All) feels redundant. We keep it when there's
  // enough fresh content to justify a separate row.
  const newPackagesFiltered = (newPackages ?? []).filter((pkg) => {
    if (showFeatured && featured && pkg.packageId === featured.packageId) {
      return false;
    }
    return true;
  });
  const showNewSection =
    isForYouSurface && newPackagesFiltered.length >= 3 && allPackages !== undefined;
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
              if (!opened) void redirectToStoreSignIn();
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
            onInstall={() => void installPackage(selectedPackage)}
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
            {showNewSection ? (
              <div className="store-section">
                <div className="store-section-header">
                  <span className="store-section-title">New on the Store</span>
                  <span className="store-section-count">
                    {newPackagesFiltered.length}
                  </span>
                </div>
                <div className="store-grid">
                  {newPackagesFiltered.map((pkg) => (
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
                      onShare={() => setSharePkg(pkg)}
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
                      onShare={() => setSharePkg(pkg)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {sharePkg ? (
        <ShareDialog pkg={sharePkg} onClose={() => setSharePkg(null)} />
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
