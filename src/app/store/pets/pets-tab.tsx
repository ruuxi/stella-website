"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
} from "react";
import { useAction, useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { Download, Package, Plus, Search } from "lucide-react";
import {
  createUserPet,
  createUserPetUploadUrl,
  getMediaJobByJobId,
  incrementPetDownloads,
  listMyUserPets,
  listPetTagFacets,
  listPublicPets,
  listPublicUserPets,
  recordUserPetInstall,
} from "../lib/convex";
import {
  ALL_TAG,
  PAGE_SIZE,
  PET_SORT_LABELS,
  type PetSort,
  SEARCH_DEBOUNCE_MS,
} from "../lib/constants";
import {
  ensureStoreAuth,
  getDesktopStoreBridge,
  normalizePetBridgeState,
  redirectToStoreSignIn,
} from "../lib/bridge";
import {
  ANIMATION_STATES,
  formatDownloads,
  type PetAnimationState,
} from "../lib/pet-sprite";
import {
  PetSprite,
  buildUserPetAtlasPrompt,
  buildUserPetId,
  extractFirstImageUrl,
  processUserPetAtlasImage,
  submitUserPetAtlasJob,
  uploadUserPetSpritesheetToR2,
  userPetToPublicPet,
  type UserPetSpritesheetBlob,
} from "../lib/pet-media";
import type {
  PetBridgeState,
  PublicPet,
  UserPetRecord,
  UserPetVisibility,
} from "../lib/types";
import {
  AuthorChip,
  EmptyState,
  PackageArtwork,
  StoreModal,
  StoreSkeletonCard,
} from "../components/shared";

export function CreatePetDialog({
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
                type="submit"
                className="store-action-btn store-action-btn--lg"
                data-variant={saving ? "working" : "get"}
                disabled={!blob || saving}
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

export function PetDetailsDialog({
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

export function PetCard({
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

export function PetsTab() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>(ALL_TAG);
  const [sort, setSort] = useState<PetSort>("downloads");
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
  const visiblePets = discoverPets;
  const visibleCountSuffix = canLoadMore || canLoadMoreUserPets ? "+" : "";

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
        <div className="store-grid" aria-busy="true" aria-live="polite">
          {Array.from({ length: 8 }).map((_, index) => (
            <StoreSkeletonCard key={index} index={index} />
          ))}
        </div>
      ) : visiblePets.length === 0 ? (
        <div className="pets-empty">
          No pets match that filter. Try a different tag or clear the search.
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
          {canLoadMore || isLoadingMore || canLoadMoreUserPets || isLoadingMoreUserPets ? (
            <div
              ref={sentinelRef}
              className="store-grid pets-grid-sentinel"
              data-loading={
                isLoadingMore || isLoadingMoreUserPets ? "true" : "false"
              }
              aria-hidden="true"
            >
              {isLoadingMore || isLoadingMoreUserPets ? (
                <>
                  <StoreSkeletonCard index={0} />
                  <StoreSkeletonCard index={1} />
                </>
              ) : null}
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
