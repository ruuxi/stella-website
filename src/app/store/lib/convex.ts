import { makeFunctionReference } from "convex/server";
import type {
  EmojiPack,
  EmojiPackUploadUrl,
  EmojiPackVisibility,
  MediaJobSnapshot,
  NativeIntegration,
  PublicPet,
  StoreCategory,
  StorePackage,
  StoreRelease,
  UserPetRecord,
  UserPetUploadUrl,
  UserPetVisibility,
} from "./types";

export const listPublicPackages = makeFunctionReference<
  "query",
  {
    category?: StoreCategory;
    paginationOpts: { numItems: number; cursor: string | null };
  },
  { page: StorePackage[]; isDone: boolean; continueCursor: string }
>("data/store_packages:listPublicPackages");

export const listStoreIntegrations = makeFunctionReference<
  "query",
  Record<string, never>,
  NativeIntegration[]
>("data/integrations:listStoreIntegrations");

export const searchPublicPackages = makeFunctionReference<
  "query",
  { query: string; category?: StoreCategory },
  StorePackage[]
>("data/store_packages:searchPublicPackages");

export const getPublicPackage = makeFunctionReference<
  "query",
  { packageId: string },
  StorePackage | null
>("data/store_packages:getPublicPackage");

export const listPublicReleases = makeFunctionReference<
  "query",
  { packageId: string },
  StoreRelease[]
>("data/store_packages:listPublicReleases");

export const getReleaseDiff = makeFunctionReference<
  "action",
  { packageId: string; releaseNumber: number },
  string | null
>("data/store_git_artifacts:getReleaseDiff");

export const recordPackageInstall = makeFunctionReference<
  "mutation",
  { packageId: string },
  null
>("data/store_packages:recordPackageInstall");

export const listPublicPets = makeFunctionReference<
  "query",
  {
    paginationOpts: { numItems: number; cursor: string | null };
    sort: "downloads" | "name";
    tag?: string;
    search?: string;
  },
  { page: PublicPet[]; isDone: boolean; continueCursor: string }
>("data/pets:listPublicPage");

export const listPetTagFacets = makeFunctionReference<
  "query",
  Record<string, never>,
  Array<{ tag: string; count: number }>
>("data/pets:listTagFacets");

export const incrementPetDownloads = makeFunctionReference<
  "mutation",
  { id: string },
  null
>("data/pets:incrementDownloads");

export const listMyUserPets = makeFunctionReference<
  "query",
  Record<string, never>,
  UserPetRecord[]
>("data/user_pets:listMine");

export const listPublicUserPets = makeFunctionReference<
  "query",
  {
    paginationOpts: { numItems: number; cursor: string | null };
    search?: string;
  },
  { page: UserPetRecord[]; isDone: boolean; continueCursor: string }
>("data/user_pets:listPublicPage");

export const createUserPet = makeFunctionReference<
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

export const recordUserPetInstall = makeFunctionReference<
  "mutation",
  { petId: string },
  null
>("data/user_pets:recordInstall");

export const createUserPetUploadUrl = makeFunctionReference<
  "action",
  {
    petId: string;
    spritesheetSha256: string;
    previewSha256?: string;
    contentType?: string;
  },
  UserPetUploadUrl
>("data/user_pet_uploads:createUploadUrl");

export const generateUserPet = makeFunctionReference<
  "action",
  { prompt: string; visibility: UserPetVisibility },
  UserPetRecord
>("data/user_pet_generation:generatePet");

export const getMediaJobByJobId = makeFunctionReference<
  "query",
  { jobId: string },
  MediaJobSnapshot | null
>("media_jobs:getByJobId");

export const listPublicEmojiPacks = makeFunctionReference<
  "query",
  {
    paginationOpts: { numItems: number; cursor: string | null };
    sort?: "installs" | "name";
    tag?: string;
    search?: string;
  },
  { page: EmojiPack[]; isDone: boolean; continueCursor: string }
>("data/emoji_packs:listPublicPage");

export const listEmojiPackTagFacets = makeFunctionReference<
  "query",
  Record<string, never>,
  Array<{ tag: string; count: number }>
>("data/emoji_packs:listTagFacets");

export const recordEmojiInstall = makeFunctionReference<
  "mutation",
  { packId: string },
  null
>("data/emoji_packs:recordInstall");

export const listMyEmojiPacks = makeFunctionReference<
  "query",
  Record<string, never>,
  EmojiPack[]
>("data/emoji_packs:listMine");

export const createEmojiPack = makeFunctionReference<
  "mutation",
  {
    packId: string;
    displayName: string;
    description?: string;
    prompt?: string;
    coverEmoji: string;
    coverUrl?: string;
    sheetUrls: string[];
    visibility: EmojiPackVisibility;
  },
  EmojiPack
>("data/emoji_packs:createPack");

export const createEmojiPackUploadUrl = makeFunctionReference<
  "action",
  {
    packId: string;
    sheetSha256s: string[];
    contentType?: string;
  },
  EmojiPackUploadUrl
>("data/emoji_pack_uploads:createUploadUrl");

export const generateEmojiPack = makeFunctionReference<
  "action",
  { prompt: string; visibility: EmojiPackVisibility },
  EmojiPack
>("data/emoji_pack_generation:generatePack");
