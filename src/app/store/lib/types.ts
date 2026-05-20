export type StoreCategory =
  | "apps-games"
  | "productivity"
  | "customization"
  | "skills-agents"
  | "integrations"
  | "other";

export type StoreBadge = "verified" | "partner";

export type StorePackage = {
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

export type StoreReleaseManifest = {
  files?: string[];
  changedFiles?: string[];
  releaseNotes?: string;
  summary?: string;
};

export type StoreRelease = {
  packageId: string;
  releaseNumber: number;
  blueprintMarkdown: string;
  commits?: Array<{ hash: string; subject: string; diff: string }>;
  releaseNotes?: string;
  manifest?: StoreReleaseManifest;
  createdAt: number;
};

export type NativeIntegration = {
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

export type StoreInstall = {
  packageId: string;
  displayName?: string;
  releaseNumber?: number;
  installedAt?: number;
};

export type PublicPet = {
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

export type UserPetVisibility = "public" | "unlisted" | "private";

export type UserPetRecord = {
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

export type UserPetUploadTarget = {
  key: string;
  publicUrl: string;
  putUrl: string;
  headers: Record<string, string>;
};

export type UserPetUploadUrl = {
  uploadId: string;
  spritesheet: UserPetUploadTarget;
  preview?: UserPetUploadTarget;
};

export type MediaJobSnapshot = {
  status?: string;
  output?: unknown;
  error?: { message?: string };
};

export type EmojiPack = {
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

export type EmojiPackVisibility = "public" | "unlisted" | "private";

export type FashionProfile = {
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

export type FashionOutfitProduct = {
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

export type FashionOutfit = {
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

export type FashionLike = {
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

export type FashionCartItem = {
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

export type FashionCheckoutResult = {
  checkoutId: string;
  status: string;
  continueUrl?: string;
  cartUrl?: string;
  merchantOrigin: string;
  mcpEndpoint: string;
  usingMcp: boolean;
};

export type DesktopStoreFashionBridge = {
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

export type DesktopStoreBridge = {
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

export type PetBridgeState = {
  installedPetIds: string[];
  selectedPetId: string | null;
  petOpen: boolean;
};

export type EmojiBridgeState = {
  activePack: { packId: string; sheetUrls: string[] } | null;
};

declare global {
  interface Window {
    stellaDesktopStore?: DesktopStoreBridge;
  }
}
