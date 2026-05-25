"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Package, Smile, Sparkles } from "lucide-react";
import {
  listMyEmojiPacks,
  listMyUserPets,
} from "../lib/convex";
import { userPetToPublicPet } from "../lib/pet-media";
import type {
  PublicPet,
  StoreInstall,
  StorePackage,
} from "../lib/types";
import { EmptyState, StoreLoadingSpinner } from "../components/shared";
import { isStoreUpdateAvailable } from "../lib/format";
import { useEmojiBridge, usePetBridge } from "../lib/use-store-bridge";
import { PetCard, PetDetailsDialog } from "../pets/pets-tab";
import { EmojiPackCard } from "../emojis/emojis-tab";
import { PackageCard } from "../discover/discover-ui";

type LibraryTabProps = {
  installedMods: StoreInstall[];
  browsePackages: StorePackage[] | undefined;
  installingId: string | null;
  onSelectPackage: (packageId: string) => void;
  onInstallPackage: (pkg: StorePackage) => void;
};

/**
 * One-stop "Library" surface: everything the user has on this account
 * — installed mods, pets they own or created, and emoji packs they
 * own. Replaces the per-tab "My pets" / "My emojis" toggles so there's
 * one place normal users expect to find what's theirs.
 */
export function LibraryTab({
  installedMods,
  browsePackages,
  installingId,
  onSelectPackage,
  onInstallPackage,
}: LibraryTabProps) {
  const myUserPets = useQuery(listMyUserPets, {});
  const myPacks = useQuery(listMyEmojiPacks, {});

  const userPetIds = useMemo(() => {
    const ids = new Set<string>();
    for (const pet of myUserPets ?? []) ids.add(pet.petId);
    return ids;
  }, [myUserPets]);

  const pets = usePetBridge(userPetIds);
  const emojis = useEmojiBridge();

  const myPetCards = useMemo<PublicPet[]>(
    () => (myUserPets ?? []).map(userPetToPublicPet),
    [myUserPets],
  );

  const installedPackageMap = useMemo(() => {
    const map = new Map<string, StorePackage>();
    for (const pkg of browsePackages ?? []) map.set(pkg.packageId, pkg);
    return map;
  }, [browsePackages]);

  const installedModMap = useMemo(() => {
    const map = new Map<string, StoreInstall>();
    for (const mod of installedMods) map.set(mod.packageId, mod);
    return map;
  }, [installedMods]);

  const installedPackages = useMemo(() => {
    return installedMods
      .map((mod) => installedPackageMap.get(mod.packageId))
      .filter((pkg): pkg is StorePackage => Boolean(pkg));
  }, [installedMods, installedPackageMap]);

  const [detailsPet, setDetailsPet] = useState<PublicPet | null>(null);

  const myEmojiPacks = myPacks ?? [];

  const loadingPets = myUserPets === undefined;
  const loadingPacks = myPacks === undefined;

  const totalCount =
    installedPackages.length + myPetCards.length + myEmojiPacks.length;

  if (!loadingPets && !loadingPacks && totalCount === 0) {
    return (
      <main className="library-page">
        <header className="library-page-header">
          <h1 className="library-page-title">Library</h1>
          <p className="library-page-subtitle">
            Everything you&apos;ve added or created lives here — mods, pets,
            and emoji packs.
          </p>
        </header>
        <EmptyState
          icon={<Package size={32} />}
          title="Your library is empty"
          description="Get a mod, create a pet, or generate an emoji pack to see it here."
        />
      </main>
    );
  }

  return (
    <main className="library-page">
      <header className="library-page-header">
        <div className="library-page-heading">
          <h1 className="library-page-title">Library</h1>
          <span className="library-page-count">{totalCount} items</span>
        </div>
        <p className="library-page-subtitle">
          Everything you&apos;ve added or created. Mods you&apos;ve installed,
          pets you own, and emoji packs you&apos;ve made.
        </p>
      </header>

      {pets.actionError ? (
        <div className="store-status" data-variant="error">
          {pets.actionError}
        </div>
      ) : null}
      {emojis.actionError ? (
        <div className="store-status" data-variant="error">
          {emojis.actionError}
        </div>
      ) : null}

      <LibrarySection
        icon={<Package size={16} aria-hidden />}
        title="Mods"
        count={installedPackages.length}
        empty="No mods installed yet."
      >
        {installedPackages.length > 0 ? (
          <div className="store-grid">
                        {installedPackages.map((pkg) => (
                          <PackageCard
                            key={pkg.packageId}
                            pkg={pkg}
                            installed
                            updateAvailable={isStoreUpdateAvailable(
                              pkg,
                              installedModMap.get(pkg.packageId),
                            )}
                            installing={installingId === pkg.packageId}
                            onOpen={() => onSelectPackage(pkg.packageId)}
                            onInstall={() => onInstallPackage(pkg)}
                          />
                        ))}
          </div>
        ) : null}
      </LibrarySection>

      <LibrarySection
        icon={<Sparkles size={16} aria-hidden />}
        title="Pets"
        count={myPetCards.length}
        loading={loadingPets}
        empty="No pets yet — open the Pets tab to create one."
      >
        {myPetCards.length > 0 ? (
          <div className="pets-grid">
            {myPetCards.map((pet) => {
              const selected = pets.petState.selectedPetId === pet.id;
              const working = pets.workingPetId === pet.id;
              return (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  installed
                  selected={selected}
                  working={working}
                  onOpen={() => setDetailsPet(pet)}
                  onGet={() => void pets.installPet(pet)}
                  onSelect={() => pets.selectPet(pet.id)}
                  onRemove={() => pets.removePet(pet.id)}
                />
              );
            })}
          </div>
        ) : null}
      </LibrarySection>

      <LibrarySection
        icon={<Smile size={16} aria-hidden />}
        title="Emoji packs"
        count={myEmojiPacks.length}
        loading={loadingPacks}
        empty="No emoji packs yet — open the Emojis tab to create one."
      >
        {myEmojiPacks.length > 0 ? (
          <div className="emoji-pack-grid">
            {myEmojiPacks.map((pack) => {
              const active = emojis.activePackId === pack.packId;
              return (
                <EmojiPackCard
                  key={pack._id ?? pack.packId}
                  pack={pack}
                  active={active}
                  onOpen={() => {
                    if (active) {
                      void emojis.clearEmojiPack(pack.packId);
                    } else {
                      void emojis.installEmojiPack(pack);
                    }
                  }}
                />
              );
            })}
          </div>
        ) : null}
      </LibrarySection>

      {detailsPet ? (
        <PetDetailsDialog
          key={detailsPet.id}
          pet={detailsPet}
          installed={pets.installedPetIds.has(detailsPet.id)}
          selected={pets.petState.selectedPetId === detailsPet.id}
          working={pets.workingPetId === detailsPet.id}
          onGet={() => pets.installPet(detailsPet)}
          onSelect={() => pets.selectPet(detailsPet.id)}
          onRemove={() => pets.removePet(detailsPet.id)}
          onClose={() => setDetailsPet(null)}
        />
      ) : null}
    </main>
  );
}

function LibrarySection({
  icon,
  title,
  count,
  loading = false,
  empty,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  loading?: boolean;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <section className="library-section">
      <div className="library-section-header">
        <span className="library-section-icon">{icon}</span>
        <span className="library-section-title">{title}</span>
        <span className="library-section-count">{count}</span>
      </div>
      {loading ? (
        <StoreLoadingSpinner compact />
      ) : count === 0 ? (
        <div className="library-section-empty">{empty}</div>
      ) : (
        children
      )}
    </section>
  );
}
