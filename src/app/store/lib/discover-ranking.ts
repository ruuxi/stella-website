import type { StorePackage } from "./types";

export function pickFeaturedPackage(packages: StorePackage[]): StorePackage | null {
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
export const FOR_YOU_BUCKET_WEIGHT: Record<string, number> = {
  promoted: 1000,
  partner: 100,
  verified: 10,
  organic: 0,
};

export const getForYouBucket = (pkg: StorePackage): keyof typeof FOR_YOU_BUCKET_WEIGHT => {
  const promotedActive =
    pkg.promoted === true &&
    (pkg.promotedUntil === undefined || pkg.promotedUntil >= Date.now());
  if (promotedActive) return "promoted";
  if (pkg.authorBadge === "partner") return "partner";
  if (pkg.authorBadge === "verified") return "verified";
  return "organic";
};

export const sortPackagesForYou = (packages: StorePackage[]): StorePackage[] =>
  packages.slice().sort((a, b) => {
    const aw = FOR_YOU_BUCKET_WEIGHT[getForYouBucket(a)] ?? 0;
    const bw = FOR_YOU_BUCKET_WEIGHT[getForYouBucket(b)] ?? 0;
    if (aw !== bw) return bw - aw;
    return b.updatedAt - a.updatedAt;
  });
