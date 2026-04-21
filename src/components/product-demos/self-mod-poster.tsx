"use client";

import { SelfModShell } from "./self-mod-showcase";

/**
 * Static (non-interactive) version of {@link SelfModificationShowcase}.
 * Rendered above-the-fold while the interactive demo hydrates so the
 * cozy-mode poster is what users see during page settle. The cozy
 * "high" stage is always shown — same drastic transformation Mochi
 * makes in the desktop onboarding.
 */
export function SelfModificationPoster() {
  return (
    <div
      className="selfmod-layout"
      aria-label="Static preview of Stella customization demo"
    >
      <div className="selfmod-canvas">
        <div className="selfmod-canvas__capture">
          <SelfModShell stage="high" />
        </div>
      </div>
    </div>
  );
}
