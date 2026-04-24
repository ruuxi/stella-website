"use client";

import { useCallback, useState } from "react";
import { StellaAppMock } from "./stella-app-mock";
import {
  EMPTY_SECTION_TOGGLES,
  type SectionKey,
  type SectionToggles,
} from "./stella-app-mock-types";

/**
 * "Make it yours" — full-bleed section that sits outside the page grid.
 *
 * The mock is the real onboarding "creation" surface from
 * desktop/src/global/onboarding/panels/StellaAppMock.tsx. We render it
 * as a single-select demo: choosing one pill deselects whatever was
 * active before, so the user always sees one transformation at a time
 * — never a frankenstein of two half-applied styles.
 */
export function SelfModHero() {
  const [active, setActive] = useState<SectionKey | null>(null);

  const handleToggle = useCallback((section: SectionKey) => {
    setActive((prev) => (prev === section ? null : section));
  }, []);

  const toggles: SectionToggles = {
    ...EMPTY_SECTION_TOGGLES,
    ...(active ? { [active]: true } : {}),
  };

  return (
    <section className="self-mod-hero" data-reveal>
      <header className="self-mod-hero__copy" data-reveal-child style={{ ["--reveal-index" as string]: 0 }}>
        <span className="self-mod-hero__eyebrow">Yours</span>
        <h2 className="self-mod-hero__title">An app that becomes you.</h2>
        <p className="self-mod-hero__lede">
          Ask, and Stella reshapes itself in front of you. The sidebar, the
          surface, the whole feel of the app — every part is yours to redraw.
        </p>
      </header>

      <div className="self-mod-hero__stage" data-reveal-child style={{ ["--reveal-index" as string]: 1 }}>
        <div className="self-mod-hero__stage-inner">
          <StellaAppMock
            interactive
            toggles={toggles}
            onToggleSection={handleToggle}
          />
        </div>
      </div>
    </section>
  );
}
