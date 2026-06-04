import type { StoreCategory } from "./types";

export const DISCOVER_FILTERS: Array<{ id: StoreCategory | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "apps-games", label: "Apps & games" },
  { id: "productivity", label: "Productivity" },
  { id: "customization", label: "Customization" },
  { id: "skills-agents", label: "Skills & agents" },
  { id: "integrations", label: "Integrations" },
  { id: "other", label: "Other" },
];

export const storeTabs = [
  { key: "discover", label: "Discover" },
  { key: "pets", label: "Pets" },
  { key: "emojis", label: "Emojis" },
  { key: "library", label: "Library" },
] as const;

export type HostedStoreTab = (typeof storeTabs)[number]["key"];
export type PetSort = "downloads" | "name";
export type EmojiPackSort = "installs" | "name";

export const PAGE_SIZE = 24;
/** Discover package grid loads a smaller first page than the 24-card
 *  pets/emojis grids — the mosaic cards are larger, so 12 fills the first
 *  viewport without rendering a tall offscreen grid on open. */
export const PACKAGE_PAGE_SIZE = 12;
export const SEARCH_DEBOUNCE_MS = 200;
export const ALL_TAG = "all" as const;
export const PET_SORT_LABELS: Record<PetSort, string> = {
  downloads: "Most selected",
  name: "Alphabetical",
};
export const EMOJI_SORT_LABELS: Record<EmojiPackSort, string> = {
  installs: "Most used",
  name: "Alphabetical",
};
