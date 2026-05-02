"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { StellaAppMock } from "./stella-app-mock";
import { MobileSelfModMock } from "./self-mod-hero-mobile";
import {
  EMPTY_SECTION_TOGGLES,
  type SectionKey,
  type SectionToggles,
} from "./stella-app-mock-types";

function useIsNarrow(breakpoint = 640) {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const subscribe = useCallback(
    (notify: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    [query],
  );
  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/**
 * "Make it yours" — full-bleed section outside the page grid.
 *
 * Uses the interactive `StellaAppMock` with floating transformation pills
 * (Workspace rail, Tabs, Dashboard, Create an app, Cozy mode) — same
 * affordance as the marketing mock, with single-select: only one
 * transformation active at a time.
 */
export function SelfModHero() {
  const [active, setActive] = useState<SectionKey | null>(null);
  const isNarrow = useIsNarrow();

  const handleToggle = useCallback((section: SectionKey) => {
    setActive((prev) => (prev === section ? null : section));
  }, []);

  const toggles: SectionToggles = {
    ...EMPTY_SECTION_TOGGLES,
    ...(active ? { [active]: true } : {}),
  };

  return (
    <section className="self-mod-hero" data-reveal suppressHydrationWarning>
      <header
        className="self-mod-hero__copy"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 0 }}
      >
        <span className="self-mod-hero__eyebrow">Yours</span>
        <h2 className="self-mod-hero__title">An app that becomes you.</h2>
        <p className="self-mod-hero__lede">
          Ask, and Stella reshapes itself in front of you. The sidebar, the
          surface, the whole feel of the app — every part is yours to redraw.
        </p>
      </header>

      <div
        className="self-mod-hero__stage"
        data-reveal-child
        style={{ ["--reveal-index" as string]: 1 }}
      >
        {isNarrow ? (
          <MobileSelfModMock />
        ) : (
          <div className="codex-frame self-mod-hero__frame">
            <div className="self-mod-hero__stage-inner">
              <StellaAppMock
                interactive
                toggles={toggles}
                onToggleSection={handleToggle}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
