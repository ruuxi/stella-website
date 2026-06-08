"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAction, useMutation, usePaginatedQuery, useQuery } from "convex/react";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  Search,
} from "lucide-react";
import {
  generateEmojiPack,
  listEmojiPackTagFacets,
  listMyEmojiPacks,
  listPublicEmojiPacks,
  recordEmojiInstall,
} from "../lib/convex";
import {
  ALL_TAG,
  EMOJI_SORT_LABELS,
  PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
  type EmojiPackSort,
} from "../lib/constants";
import {
  ensureStoreAuth,
  getDesktopStoreBridge,
  isEmojiBridgeState,
  redirectToStoreSignIn,
} from "../lib/bridge";
import { formatEmojiUseCount } from "../lib/pet-sprite";
import type { EmojiBridgeState, EmojiPack, EmojiPackVisibility } from "../lib/types";
import {
  AuthorChip,
  EmojiCellPreview,
  EmptyState,
  PackageArtwork,
  StoreModal,
  StoreLoadingSpinner,
} from "../components/shared";

export function CreateEmojiPackDialog({
  onClose,
  onSubmit,
  submitting,
}: {
  onClose: () => void;
  onSubmit: (args: { prompt: string; visibility: EmojiPackVisibility }) => Promise<void>;
  submitting: boolean;
}) {
  const [prompt, setPrompt] = useState("");
  const [visibility, setVisibility] = useState<EmojiPackVisibility>("private");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || submitting) return;
    setError(null);
    try {
      await onSubmit({ prompt: trimmed, visibility });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create pack.");
    }
  }, [onClose, onSubmit, prompt, submitting, visibility]);

  return (
    <StoreModal onClose={onClose}>
      <div className="emoji-create-dialog">
        <div className="emoji-create-header">
          <div className="emoji-create-title">Create emoji pack</div>
          <p className="emoji-create-caption">
            Describe the vibe - Stella paints custom emojis across sheets and
            names the pack for you.
          </p>
        </div>
        <div className="emoji-create-body">
          <>
          <section className="emoji-create-stage" aria-label="Generated emoji preview">
            <div
              className="emoji-create-empty"
              data-state={error ? "error" : "empty"}
            >
              <Package size={22} aria-hidden />
              <span className="emoji-create-empty-text">
                {error ?? "Stella will keep working after this dialog closes"}
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
              <div className="emoji-create-visibility" role="radiogroup">
                {(["public", "unlisted", "private"] as EmojiPackVisibility[]).map(
                  (option) => (
                    <button
                      type="button"
                      key={option}
                      className="emoji-create-visibility-pill"
                      data-active={visibility === option || undefined}
                      role="radio"
                      aria-checked={visibility === option}
                      onClick={() => setVisibility(option)}
                    >
                      {option[0]!.toUpperCase() + option.slice(1)}
                    </button>
                  ),
                )}
              </div>
              <span className="emoji-create-visibility-sub">
                {visibility === "public"
                  ? "Listed on the Store for anyone to find."
                  : visibility === "unlisted"
                    ? "Only people with the link can see it."
                    : "Only you can see it."}
              </span>
            </div>
            <div className="emoji-create-actions">
              <button
                type="button"
                className="store-action-btn emoji-create-discard"
                data-variant="subtle"
                onClick={onClose}
              >
                Discard
              </button>
              <button
                type="submit"
                className="store-action-btn store-action-btn--lg"
                data-variant={submitting ? "working" : "get"}
                disabled={submitting || prompt.trim().length === 0}
              >
                {submitting ? "Starting..." : "Create pack"}
              </button>
            </div>
          </form>
          </>
        </div>
      </div>
    </StoreModal>
  );
}


export function EmojiPackCard({
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
          {formatEmojiUseCount(pack.installCount) ? (
            <span className="emoji-pack-installs">
              {formatEmojiUseCount(pack.installCount)}
            </span>
          ) : null}
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

export function EmojisTab() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>(ALL_TAG);
  const [sort, setSort] = useState<EmojiPackSort>("installs");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsPack, setDetailsPack] = useState<EmojiPack | null>(null);
  const [previewSheet, setPreviewSheet] = useState(0);
  const [emojiState, setEmojiState] = useState<EmojiBridgeState>({
    activePack: null,
  });
  const [workingPackId, setWorkingPackId] = useState<string | null>(null);
  const [creatingPack, setCreatingPack] = useState(false);
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
  const generatePack = useAction(generateEmojiPack);
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
  const visiblePacks = visiblePublicPacks;

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

  const startEmojiPackGeneration = async (args: {
    prompt: string;
    visibility: EmojiPackVisibility;
  }) => {
    if (creatingPack) return;
    if (!(await ensureStoreAuth())) return;
    const bridge = getDesktopStoreBridge();
    setActionError(null);
    setCreatingPack(true);
    void bridge?.showToast?.({
      title: "Creating emoji pack",
      description: "Stella will keep working in the background.",
      variant: "loading",
    });
    void (async () => {
      try {
        const created = await generatePack(args);
        void bridge?.showToast?.({
          title: "Emoji pack ready",
          description: "Stella created the pack and is switching chat to use it.",
          variant: "success",
        });
        await installEmojiPack(created);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Couldn't create pack.";
        setActionError(message);
        void bridge?.showToast?.({
          title: "Emoji pack failed",
          description: message,
          variant: "error",
        });
      } finally {
        setCreatingPack(false);
      }
    })();
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
        <div className="emoji-page-toolbar-actions">
          <button
            type="button"
            className="store-action-btn store-action-btn--lg"
            data-variant={creatingPack ? "working" : "get"}
            disabled={creatingPack}
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={14} aria-hidden />
            {creatingPack ? "Creating..." : "Create pack"}
          </button>
        </div>
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
        <StoreLoadingSpinner />
      ) : visiblePacks.length === 0 ? (
        <div className="emoji-page-empty">
          {trimmedSearch ? "No packs match that search." : "No community packs yet."}
        </div>
      ) : (
        <section className="emoji-page-section">
          <div className="emoji-page-section-header">
            <span className="emoji-page-section-title">Discover</span>
            <span className="emoji-page-section-count">
              {visiblePacks.length}
              {canLoadMore ? "+" : ""}
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
          {canLoadMore || isLoadingMore ? (
            <div
              ref={sentinelRef}
              className="emoji-pack-grid emoji-page-sentinel"
              data-loading={isLoadingMore || undefined}
              aria-hidden="true"
            >
              {isLoadingMore ? <StoreLoadingSpinner compact /> : null}
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
          onSubmit={startEmojiPackGeneration}
          submitting={creatingPack}
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
