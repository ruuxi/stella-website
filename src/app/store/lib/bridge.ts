import { openSignInDialog } from "@/components/auth/sign-in-dialog";
import { getConvexToken } from "@/lib/auth-token";
import type {
  DesktopStoreBridge,
  EmojiBridgeState,
  NativeIntegration,
  PetBridgeState,
} from "./types";
import { storeTabs, type HostedStoreTab } from "./constants";

export const normalizeHostedStoreTab = (value: string | null): HostedStoreTab =>
  storeTabs.some((tab) => tab.key === value)
    ? (value as HostedStoreTab)
    : "discover";

export const getDesktopStoreBridge = (): DesktopStoreBridge | undefined =>
  typeof window === "undefined" ? undefined : window.stellaDesktopStore;

export const mergeNativeIntegrationUpdate = (
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

export const isNativeIntegrationUserCancel = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return /could not connect\b[\s\S]*:\s*cancelled\b/i.test(message);
};

export const getNativeIntegrationErrorMessage = (
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

export const redirectToStoreSignIn = async () => {
  const bridge = getDesktopStoreBridge();
  if (bridge?.openSignIn) {
    await bridge.openSignIn().catch(() => undefined);
    return;
  }
  openSignInDialog();
};

export const getStoreAuthToken = async (): Promise<string | null> =>
  (await getDesktopStoreBridge()?.getAuthToken?.().catch(() => null)) ??
  (await getConvexToken().catch(() => null));

export const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
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

export const isConnectedStoreToken = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  return payload !== null && payload.isAnonymous !== true;
};

export const ensureStoreAuth = async (): Promise<boolean> => {
  // Sign-in gate disabled for Build Day demo — judges should be able to
  // install without authenticating.
  return true;
};

export const isPetBridgeState = (value: unknown): value is PetBridgeState => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    Array.isArray(record.installedPetIds) &&
    record.installedPetIds.every((id) => typeof id === "string") &&
    (typeof record.selectedPetId === "string" || record.selectedPetId === null)
  );
};

export const normalizePetBridgeState = (value: unknown): PetBridgeState | null => {
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

export const isEmojiBridgeState = (value: unknown): value is EmojiBridgeState => {
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

export const openNativeStorePanel = async (): Promise<boolean> => {
  const bridge = getDesktopStoreBridge();
  if (!bridge?.openStorePanel) return false;
  await bridge.openStorePanel();
  return true;
};
