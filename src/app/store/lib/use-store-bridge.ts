"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import {
  incrementPetDownloads,
  recordEmojiInstall,
  recordUserPetInstall,
} from "./convex";
import {
  ensureStoreAuth,
  getDesktopStoreBridge,
  isEmojiBridgeState,
  normalizePetBridgeState,
  redirectToStoreSignIn,
} from "./bridge";
import type {
  EmojiBridgeState,
  EmojiPack,
  PetBridgeState,
  PublicPet,
} from "./types";

/**
 * Shared pet bridge state + actions. Used by PetsTab and LibraryTab so
 * "Select" / "Remove" / "Show pet" stay consistent across both surfaces.
 *
 * `userPetIds` is the set of petIds that resolve to user-authored pets
 * (vs first-party catalog pets) so install records hit the right table.
 */
export function usePetBridge(userPetIds: Set<string>) {
  const [petState, setPetState] = useState<PetBridgeState>({
    installedPetIds: [],
    selectedPetId: null,
    petOpen: false,
  });
  const [workingPetId, setWorkingPetId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const incrementDownloads = useMutation(incrementPetDownloads);
  const recordUserInstall = useMutation(recordUserPetInstall);

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

  const installedPetIds = useMemo(
    () => new Set(petState.installedPetIds),
    [petState.installedPetIds],
  );

  const applyResult = (result: unknown, fallback: PetBridgeState) => {
    setPetState(normalizePetBridgeState(result) ?? fallback);
  };

  const recordOneInstall = useCallback(
    async (petId: string) => {
      if (userPetIds.has(petId)) {
        await recordUserInstall({ petId });
      } else {
        await incrementDownloads({ id: petId });
      }
    },
    [incrementDownloads, recordUserInstall, userPetIds],
  );

  const installPet = useCallback(
    async (pet: PublicPet) => {
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
        applyResult(result, {
          installedPetIds: Array.from(
            new Set([...petState.installedPetIds, pet.id]),
          ),
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
    },
    [petState.installedPetIds, recordOneInstall],
  );

  const selectPet = useCallback(
    async (petId: string) => {
      const bridge = getDesktopStoreBridge();
      if (!bridge?.selectPet) {
        await redirectToStoreSignIn();
        return;
      }
      setActionError(null);
      setWorkingPetId(petId);
      try {
        const result = await bridge.selectPet({ petId });
        applyResult(result, {
          installedPetIds: petState.installedPetIds,
          selectedPetId: petId,
          petOpen: true,
        });
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Couldn't select pet",
        );
      } finally {
        setWorkingPetId(null);
      }
    },
    [petState.installedPetIds],
  );

  const removePet = useCallback(
    async (petId: string) => {
      const bridge = getDesktopStoreBridge();
      if (!bridge?.removePet) return;
      setActionError(null);
      setWorkingPetId(petId);
      try {
        const result = await bridge.removePet({ petId });
        applyResult(result, {
          installedPetIds: petState.installedPetIds.filter((id) => id !== petId),
          selectedPetId:
            petState.selectedPetId === petId ? null : petState.selectedPetId,
          petOpen: petState.petOpen,
        });
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Couldn't remove pet",
        );
      } finally {
        setWorkingPetId(null);
      }
    },
    [petState],
  );

  const setPetOpen = useCallback(
    async (open: boolean) => {
      const bridge = getDesktopStoreBridge();
      if (!bridge?.setPetOpen) return;
      setActionError(null);
      try {
        const result = await bridge.setPetOpen({ open });
        applyResult(result, { ...petState, petOpen: open });
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "Couldn't update pet visibility",
        );
      }
    },
    [petState],
  );

  return {
    petState,
    installedPetIds,
    workingPetId,
    actionError,
    installPet,
    selectPet,
    removePet,
    setPetOpen,
  };
}

/** Shared emoji bridge state + actions. */
export function useEmojiBridge() {
  const [emojiState, setEmojiState] = useState<EmojiBridgeState>({
    activePack: null,
  });
  const [workingPackId, setWorkingPackId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const recordInstall = useMutation(recordEmojiInstall);

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

  const applyResult = (result: unknown, fallback: EmojiBridgeState) => {
    setEmojiState(isEmojiBridgeState(result) ? result : fallback);
  };

  const installEmojiPack = useCallback(
    async (pack: EmojiPack) => {
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
        applyResult(result, {
          activePack: { packId: pack.packId, sheetUrls: pack.sheetUrls },
        });
        void recordInstall({ packId: pack.packId }).catch((error) => {
          console.error("Failed to record emoji pack install", error);
        });
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Couldn't use emoji pack",
        );
      } finally {
        setWorkingPackId(null);
      }
    },
    [recordInstall],
  );

  const clearEmojiPack = useCallback(async (packId: string) => {
    const bridge = getDesktopStoreBridge();
    if (!bridge?.clearEmojiPack) return;
    setActionError(null);
    setWorkingPackId(packId);
    try {
      const result = await bridge.clearEmojiPack({ packId });
      applyResult(result, { activePack: null });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Couldn't stop using pack",
      );
    } finally {
      setWorkingPackId(null);
    }
  }, []);

  return {
    emojiState,
    activePackId: emojiState.activePack?.packId ?? null,
    workingPackId,
    actionError,
    installEmojiPack,
    clearEmojiPack,
  };
}
