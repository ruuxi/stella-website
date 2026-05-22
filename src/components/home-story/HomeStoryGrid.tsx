"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  STORY_SECTIONS,
  type StorySection,
  type StorySectionId,
} from "./sections";

/**
 * Stella's homepage story grid.
 *
 * Mirrors pi.dev's homepage shape: a sticky stage on the left with one
 * shared "demo" slot, and a scrolling column of text sections on the
 * right. As the user scrolls, an IntersectionObserver picks the
 * right-side scroll target whose midpoint sits closest to the viewport
 * midline as the active one. Active section gets full color; inactive
 * sections dim. The stage cross-fades between section mocks; when a
 * section has multiple steps (e.g. customize: intro → tabs → dashboard
 * → cat-app → cozy) the stage keeps the same mock mounted and
 * just forwards `step` so the mock can transition in-place.
 *
 * On narrow viewports (<1024px) the layout collapses to one column: the
 * sticky stage hides, and each section/step renders its mock inline
 * above the copy.
 */

/** A flattened scroll target — either a whole section (no steps) or a
 *  single step within a multi-step section. Generated up-front so the
 *  IntersectionObserver only watches one element class. */
type ScrollTarget = {
  /** Unique id `<sectionId>` or `<sectionId>::<stepId>`. */
  key: string;
  sectionId: StorySectionId;
  stepIndex: number;
  section: StorySection;
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  /** Optional 3–6 word phrase rendered above the mock inside the
   *  stage frame. Only set on per-step targets for sections that opt
   *  into `sharedCopy`. */
  mockTitle?: string;
};

function buildScrollTargets(
  sections: ReadonlyArray<StorySection>,
): ReadonlyArray<ScrollTarget> {
  const out: ScrollTarget[] = [];
  for (const section of sections) {
    if (section.steps && section.steps.length > 0) {
      section.steps.forEach((step, i) => {
        out.push({
          key: `${section.id}::${step.id}`,
          sectionId: section.id,
          stepIndex: i,
          section,
          eyebrow: step.eyebrow,
          title: step.title,
          body: step.body,
          mockTitle: step.mockTitle,
        });
      });
    } else {
      out.push({
        key: section.id,
        sectionId: section.id,
        stepIndex: 0,
        section,
        eyebrow: section.eyebrow ?? "",
        title: section.title ?? null,
        body: section.body ?? null,
      });
    }
  }
  return out;
}

export function HomeStoryGrid() {
  const sections = STORY_SECTIONS;
  const targets = useMemo(() => buildScrollTargets(sections), [sections]);

  const [activeKey, setActiveKey] = useState<string>(targets[0].key);

  const setTargetRef = useTargetRefStore();
  useActiveTargetObserver(targets, setActiveKey, setTargetRef.read);

  const activeTarget =
    targets.find((t) => t.key === activeKey) ?? targets[0];
  const activeSectionId = activeTarget.sectionId;

  /** For each top-level section, what step is in view right now? Used
   *  to drive multi-step mocks via the `step` prop. */
  const activeStepBySection = useMemo(() => {
    const map = new Map<StorySectionId, number>();
    for (const section of sections) {
      map.set(section.id, 0);
    }
    map.set(activeTarget.sectionId, activeTarget.stepIndex);
    return map;
  }, [sections, activeTarget]);

  return (
    <div className="home-story" data-active-section={activeSectionId}>
      {/* ── Sticky demo stage (desktop only) ─────────────────────── */}
      {/* `data-revealed` opts every mock inside the stage into the
          existing onboarding-derived bubble/animation reveal styles
          (`[data-revealed] .ob-bubble`, `.ob-memory__recall`, etc.)
          so we don't end up with empty `MacWindow` shells. The slot
          itself controls cross-fade timing via its own `data-active`. */}
      <aside className="home-story__stage" data-revealed="" aria-hidden="true">
        <div className="story-frame">
          {sections.map((section) => {
            const isActive = section.id === activeSectionId;
            const step = activeStepBySection.get(section.id) ?? 0;
            return (
              <div
                key={section.id}
                className="story-frame__slot"
                data-section={section.id}
                data-active={isActive || undefined}
              >
                <MockSlot section={section} isActive={isActive} step={step} />
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Scrolling copy column ─────────────────────────────────── */}
      <div className="home-story__copy">
        {renderCopyColumn({
          sections,
          targets,
          activeKey,
          setTargetRef,
        })}
      </div>
    </div>
  );
}

/* ── Copy column rendering ─────────────────────────────────────── */

/**
 * Render the right-side copy column. Most sections render one
 * `<section>` per scroll target. Sections that opt into `sharedCopy`
 * collapse all their step targets into a single visible copy block
 * (sticky inside the section group) followed by lightweight scroll
 * anchors — one per step — that the IntersectionObserver still picks
 * up to drive the stage's `step` prop. The right-side text stays put
 * while the user scrolls; only the mock and its in-frame title change.
 */
function renderCopyColumn({
  sections,
  targets,
  activeKey,
  setTargetRef,
}: {
  sections: ReadonlyArray<StorySection>;
  targets: ReadonlyArray<ScrollTarget>;
  activeKey: string;
  setTargetRef: { write: (key: string) => (el: HTMLElement | null) => void };
}): ReactNode {
  const nodes: ReactNode[] = [];

  for (const section of sections) {
    const sectionTargets = targets.filter((t) => t.sectionId === section.id);
    if (sectionTargets.length === 0) continue;

    if (section.sharedCopy && section.steps && section.steps.length > 0) {
      const anyActive = sectionTargets.some((t) => t.key === activeKey);
      nodes.push(
        <div
          key={section.id}
          className="story-section-group"
          data-id={section.id}
          data-active={anyActive || undefined}
        >
          <div className="story-section-group__copy story-section">
            <span className="story-section__eyebrow">{section.eyebrow}</span>
            <h2 className="story-section__title">{section.title}</h2>
            <div className="story-section__body">{section.body}</div>
            {section.footnote ? (
              <p className="story-section__footnote">{section.footnote}</p>
            ) : null}
          </div>

          <div className="story-section-group__anchors" aria-hidden="true">
            {sectionTargets.map((target, index) => {
              const isActive = target.key === activeKey;
              return (
                <div
                  key={target.key}
                  ref={setTargetRef.write(target.key)}
                  className="story-section-group__anchor"
                  data-id={target.sectionId}
                  data-key={target.key}
                  data-step={target.stepIndex}
                  data-active={isActive || undefined}
                  data-index={index}
                >
                  {/* Inline mock — only shows on narrow viewports via CSS. */}
                  <div
                    className="story-section__inline-mock"
                    data-section={target.sectionId}
                    data-revealed=""
                  >
                    <MockSlot
                      section={target.section}
                      isActive={isActive}
                      step={target.stepIndex}
                      mockTitle={target.mockTitle}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>,
      );
      continue;
    }

    for (const target of sectionTargets) {
      const isActive = target.key === activeKey;
      nodes.push(
        <section
          key={target.key}
          ref={setTargetRef.write(target.key)}
          className="story-section"
          data-id={target.sectionId}
          data-key={target.key}
          data-step={target.stepIndex}
          data-active={isActive || undefined}
        >
          <span className="story-section__eyebrow">{target.eyebrow}</span>
          <h2 className="story-section__title">{target.title}</h2>
          <div className="story-section__body">{target.body}</div>

          {/* Inline mock — only shows on narrow viewports via CSS. */}
          <div
            className="story-section__inline-mock"
            data-section={target.sectionId}
            data-revealed=""
            aria-hidden="true"
          >
            <MockSlot
              section={target.section}
              isActive={isActive}
              step={target.stepIndex}
            />
          </div>

          {target.section.footnote ? (
            <p className="story-section__footnote">
              {target.section.footnote}
            </p>
          ) : null}
        </section>,
      );
    }
  }

  return nodes;
}

/* ── Mock rendering ────────────────────────────────────────────── */

function MockSlot({
  section,
  isActive,
  step,
  mockTitle,
}: {
  section: StorySection;
  isActive: boolean;
  step: number;
  mockTitle?: string;
}): ReactNode {
  const Mock = section.Mock;
  const resolvedTitle =
    mockTitle ?? section.steps?.[step]?.mockTitle ?? undefined;

  if (resolvedTitle) {
    return (
      <div className="story-mock-stack">
        <div className="story-mock-stack__title" aria-hidden="true">
          {resolvedTitle}
        </div>
        <div className="story-mock-stack__body">
          <Mock isActive={isActive} step={step} />
        </div>
      </div>
    );
  }

  return <Mock isActive={isActive} step={step} />;
}

/* ── Active target observer ─────────────────────────────────────── */

/**
 * Watch each `.story-section` element with an IntersectionObserver
 * scoped to the middle 30% of the viewport. As the user scrolls,
 * whichever scroll target (section or step) overlaps that band the
 * most becomes active. If no target overlaps (gap between sections),
 * fall back to the target whose midpoint is closest to the viewport
 * midline.
 */
function useActiveTargetObserver(
  targets: ReadonlyArray<ScrollTarget>,
  setActiveKey: (key: string) => void,
  readRef: (key: string) => HTMLElement | null,
) {
  useEffect(() => {
    const ratios = new Map<string, number>();
    let observer: IntersectionObserver | null = null;
    let raf = 0;

    const pickByMidpoint = () => {
      const center = window.innerHeight / 2;
      let bestKey: string | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (const t of targets) {
        const el = readRef(t.key);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const distance = Math.abs(midpoint - center);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestKey = t.key;
        }
      }
      if (bestKey) setActiveKey(bestKey);
    };

    const pickFromObservation = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        const key = (entry.target as HTMLElement).dataset.key;
        if (!key) continue;
        ratios.set(key, entry.intersectionRatio);
      }
      let best: { key: string; ratio: number } | null = null;
      for (const t of targets) {
        const ratio = ratios.get(t.key) ?? 0;
        if (!best || ratio > best.ratio) {
          best = { key: t.key, ratio };
        }
      }
      if (best && best.ratio > 0) {
        setActiveKey(best.key);
      } else {
        pickByMidpoint();
      }
    };

    const attach = () => {
      raf = 0;
      observer?.disconnect();
      observer = new IntersectionObserver(pickFromObservation, {
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      });
      for (const t of targets) {
        const el = readRef(t.key);
        if (el) observer.observe(el);
      }
      pickByMidpoint();
    };

    raf = window.requestAnimationFrame(attach);

    return () => {
      observer?.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [targets, setActiveKey, readRef]);
}

/* ── Target ref store ─────────────────────────────────────────── */

/**
 * Per-key callback refs without re-creating the ref callback on every
 * render — recreating it would force every `<section>` to detach and
 * re-attach its ref every time the active key changed, which kills
 * the IntersectionObserver subscriptions.
 */
function useTargetRefStore() {
  const refs = useRef<Map<string, HTMLElement | null>>(new Map());
  const writeCache = useRef<Map<string, (el: HTMLElement | null) => void>>(
    new Map(),
  );

  const write = useCallback((key: string) => {
    const cached = writeCache.current.get(key);
    if (cached) return cached;
    const setter = (el: HTMLElement | null) => {
      refs.current.set(key, el);
    };
    writeCache.current.set(key, setter);
    return setter;
  }, []);

  const read = useCallback(
    (key: string) => refs.current.get(key) ?? null,
    [],
  );

  return useMemo(() => ({ write, read }), [write, read]);
}
