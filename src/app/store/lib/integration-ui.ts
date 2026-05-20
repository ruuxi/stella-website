import type { NativeIntegration } from "./types";

/** User-facing CTA on integration cards when connect is not available. */
export function nativeIntegrationActionLabel(
  integration: NativeIntegration,
  state: { busy: boolean },
): string {
  const enabled = integration.enabled === true;
  const connectable = integration.connectable !== false;

  if (connectable) {
    if (state.busy) return enabled ? "Removing..." : "Adding...";
    return enabled ? "Added" : "Add";
  }

  if (integration.oauthSetupGroup?.name) return "Coming soon";
  return "Unavailable";
}
