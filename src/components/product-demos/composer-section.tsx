"use client";

/**
 * Composer demo section.
 *
 * Stand-alone interactive replica of Stella's real chat composer.
 * Visual styling is a 1:1 port of `desktop/src/app/chat/full-shell.composer.css`,
 * `composer-primitives.css`, `composer-context.css`, and
 * `composer-add-menu.css`. Behaviour the mock supports end-to-end:
 *
 *   - Type into the textarea — composer morphs from pill → expanded
 *     rounded rectangle exactly like the real app.
 *   - Click the + button — popover menu (Attach / Capture / Select area
 *     / Read aloud / Recent files) opens above the button.
 *   - Hover a suggestion chip — floating preview card shows the
 *     captured screenshot of that app/tab.
 *   - Click a suggestion chip — chip lifts out of the row and lands
 *     in the attached strip inside the shell, complete with its
 *     thumbnail; clicking the attached chip removes it.
 *   - Click the mic — composer swaps to the live dictation bar
 *     (animated waveform + running timer + cancel/check/send controls).
 *
 * Nothing here depends on Stella's runtime — the goal is just a
 * pixel-faithful, fully interactive showcase that can sit on the
 * marketing site without any Electron/IPC/Convex coupling.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type SuggestionKind = "app" | "tab";

type SuggestionChip = {
  id: string;
  kind: SuggestionKind;
  /** Display name (app name, e.g. "Linear", or browser e.g. "Chrome"). */
  name: string;
  /** Secondary line shown on tab chips (e.g. the page title). */
  detail?: string;
  /** Small leading icon URL (logo). */
  iconUrl: string;
  /** Background tint behind the leading icon. */
  iconTint: string;
  /** Big preview image used in the hover card and as the chip thumbnail
   *  after the user clicks to attach. */
  previewUrl: string;
};

/* The five suggestion chips. Logos come from simpleicons (no API key, no
 * download) and the larger preview images are stable Unsplash URLs that
 * read as the right kind of UI for each app. */
const SUGGESTIONS: ReadonlyArray<SuggestionChip> = [
  {
    id: "linear",
    kind: "app",
    name: "Linear",
    detail: "STE-241 · composer overhaul",
    iconUrl: "https://cdn.simpleicons.org/linear/5E6AD2",
    iconTint: "#eef0ff",
    previewUrl:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=900&q=80&auto=format&fit=crop",
  },
  {
    id: "figma",
    kind: "app",
    name: "Figma",
    detail: "Composer states · v3",
    iconUrl: "https://cdn.simpleicons.org/figma/F24E1E",
    iconTint: "#fff1ec",
    previewUrl:
      "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=900&q=80&auto=format&fit=crop",
  },
  {
    id: "github",
    kind: "tab",
    name: "Chrome",
    detail: "github.com/ruuxi/stella/pull/214",
    iconUrl: "https://cdn.simpleicons.org/github/181717",
    iconTint: "#f2f2f4",
    previewUrl:
      "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=900&q=80&auto=format&fit=crop",
  },
  {
    id: "notion",
    kind: "app",
    name: "Notion",
    detail: "Sprint 14 planning",
    iconUrl: "https://cdn.simpleicons.org/notion/000000",
    iconTint: "#f4f4f4",
    previewUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80&auto=format&fit=crop",
  },
  {
    id: "slack",
    kind: "app",
    name: "Slack",
    detail: "#design · daily",
    iconUrl: "https://cdn.simpleicons.org/slack/4A154B",
    iconTint: "#f5edf6",
    previewUrl:
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=80&auto=format&fit=crop",
  },
];

export function ComposerSection() {
  return (
    <section
      className="composer-hero codex-section"
      data-reveal
      suppressHydrationWarning
    >
      <div className="codex-stage">
        <header
          className="composer-hero__copy codex-stage__copy"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 0 }}
        >
          <span className="composer-hero__eyebrow">Compose</span>
          <h2 className="composer-hero__title">One place to start anything.</h2>
          <p className="composer-hero__lede">
            Type, talk, attach a file, or grab whatever&apos;s on your screen
            — Stella picks up the apps and tabs you&apos;re in so you never
            re-explain context. Try the composer below; everything is real.
          </p>
        </header>

        <div
          className="codex-stage__mock"
          data-reveal-child
          style={{ ["--reveal-index" as string]: 1 }}
        >
          <div className="codex-frame">
            <ComposerMock />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   The mock itself
   ────────────────────────────────────────────────────────────────── */

function ComposerMock() {
  const [message, setMessage] = useState("");
  const [attached, setAttached] = useState<SuggestionChip[]>([]);
  const [hovered, setHovered] = useState<{
    chip: SuggestionChip;
    rect: DOMRect;
  } | null>(null);
  // Add menu anchor: when set, the menu portals itself to body and
  // positions above the anchor button's bounding rect. Null = closed.
  const [addMenuAnchor, setAddMenuAnchor] = useState<DOMRect | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceElapsedMs, setVoiceElapsedMs] = useState(0);
  const [voiceLevels, setVoiceLevels] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const addMenuOpen = addMenuAnchor !== null;

  const toggleAddMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setAddMenuAnchor((prev) => (prev ? null : rect));
    },
    [],
  );

  // Auto-grow the textarea — match the real composer's pill→expanded
  // morph behavior (driven by content rather than a manual toggle).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(200, el.scrollHeight)}px`;
  }, [message]);

  // Voice mode: tick the timer + push a fresh "audio level" sample
  // every 80ms. The mock can't read a real mic, so the levels follow
  // a synthesised speech-shaped envelope:
  //
  //   * a slow "breath" envelope (~0.25 Hz) gives the bar a clear
  //     phrase rhythm with brief quiet gaps between phrases;
  //   * a faster "syllable" carrier (~4 Hz) gives within-phrase peaks;
  //   * a small jitter term breaks up the perfectly regular look.
  //
  // The product is shaped so quiet sections still show a visible noise
  // floor (~0.08) and loud sections spike to ~0.95, matching what real
  // microphone data tends to look like at this bar count.
  useEffect(() => {
    if (!voiceActive) {
      setVoiceElapsedMs(0);
      setVoiceLevels([]);
      return;
    }
    const start = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      const tSec = (now - start) / 1000;
      setVoiceElapsedMs(now - start);
      // Slow breath in/out: a phrase + brief quiet gap.
      const breath = Math.max(0, Math.sin(tSec * 2 * Math.PI * 0.25));
      const breathShaped = Math.pow(breath, 0.7);
      // Syllable carrier — roughly the rate of spoken syllables.
      const syllable = 0.55 + 0.45 * Math.sin(tSec * 2 * Math.PI * 4);
      // A slower modulator stops the syllable curve from looking
      // perfectly periodic.
      const wander = 0.85 + 0.15 * Math.sin(tSec * 2 * Math.PI * 0.7 + 1.3);
      const noise = (Math.random() - 0.5) * 0.12;
      const next = Math.max(
        0.06,
        Math.min(0.96, breathShaped * syllable * wander + noise),
      );
      setVoiceLevels((prev) => {
        const updated = [...prev, next];
        return updated.length > 96
          ? updated.slice(updated.length - 96)
          : updated;
      });
    }, 80);
    return () => window.clearInterval(interval);
  }, [voiceActive]);

  // Close the add menu on outside click — the menu is portaled to body
  // so we have to check against both the composer wrap AND the portaled
  // menu element (looked up by data attribute).
  useEffect(() => {
    if (!addMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (wrapRef.current?.contains(target)) return;
      const portaledMenu = document.querySelector("[data-cmock-menu='true']");
      if (portaledMenu?.contains(target)) return;
      setAddMenuAnchor(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAddMenuAnchor(null);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [addMenuOpen]);

  const attachedIds = useMemo(
    () => new Set(attached.map((c) => c.id)),
    [attached],
  );

  const handleAttach = useCallback((chip: SuggestionChip) => {
    setAttached((prev) =>
      prev.some((c) => c.id === chip.id) ? prev : [...prev, chip],
    );
    setHovered(null);
  }, []);

  const handleDetach = useCallback((id: string) => {
    setAttached((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleSend = useCallback(() => {
    setMessage("");
    setAttached([]);
    setVoiceActive(false);
  }, []);

  const handleSuggestionHover = useCallback(
    (chip: SuggestionChip, event: React.SyntheticEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setHovered({ chip, rect });
    },
    [],
  );

  // Mirror the real composer's mode selection (Composer.tsx). Voice with
  // no text replaces the textarea+toolbar inline — keeps the pill the
  // same size. Voice WITH text leaves the textarea+toolbar in place and
  // adds the dictation row below; the form is expanded in that mode.
  const hasText = message.trim().length > 0;
  const dictationBelow = voiceActive && hasText;
  const dictationInline = voiceActive && !hasText;
  const canSend = hasText || attached.length > 0;
  // The composer expands when the textarea has content, when chips are
  // attached, or when voice is active with text (so the dictation row
  // can render below the toolbar). It does NOT expand for voice-only —
  // that stays pill-shaped like the real desktop app.
  const expanded = hasText || attached.length > 0 || dictationBelow;

  return (
    <div className="cmock" ref={wrapRef}>
      {/* ── Action zero: suggestion chips row above the shell ── */}
      <div className="cmock__suggestions" role="list">
        {SUGGESTIONS.map((chip) => {
          if (attachedIds.has(chip.id)) return null;
          const isHovered = hovered?.chip.id === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              role="listitem"
              className="cmock__suggestion"
              data-hovered={isHovered || undefined}
              onMouseEnter={(event) => handleSuggestionHover(chip, event)}
              onMouseLeave={() =>
                setHovered((current) =>
                  current?.chip.id === chip.id ? null : current,
                )
              }
              onFocus={(event) => handleSuggestionHover(chip, event)}
              onBlur={() =>
                setHovered((current) =>
                  current?.chip.id === chip.id ? null : current,
                )
              }
              onClick={() => handleAttach(chip)}
              title={`Add ${chip.name} as context`}
            >
              <span className="cmock__suggestion-plus" aria-hidden="true">
                +
              </span>
              <span
                className="cmock__suggestion-icon"
                style={{ background: chip.iconTint }}
                aria-hidden="true"
              >
                <img src={chip.iconUrl} alt="" width={12} height={12} />
              </span>
              <span className="cmock__suggestion-label">{chip.name}</span>
              {chip.detail ? (
                <span className="cmock__suggestion-meta">{chip.detail}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Hover preview — portaled to body so the codex-frame's clip can't
          crop it. Positioned via the hovered chip's bounding rect. */}
      {hovered ? (
        <SuggestionHoverCardPortal chip={hovered.chip} anchorRect={hovered.rect} />
      ) : null}

      {/* ── The shell ── */}
      <div className="cmock__shell" data-expanded={expanded || undefined}>
        {attached.length > 0 && (
          <div className="cmock__attached-strip">
            {attached.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className="cmock__attached"
                title={`Remove ${chip.name}`}
                onClick={() => handleDetach(chip.id)}
              >
                <img
                  className="cmock__attached-thumb"
                  src={chip.previewUrl}
                  alt=""
                />
                <span className="cmock__attached-text">
                  <strong>{chip.name}</strong>
                  {chip.detail ? <span>{chip.detail}</span> : null}
                </span>
                <span className="cmock__attached-remove" aria-hidden="true">
                  ×
                </span>
              </button>
            ))}
          </div>
        )}

        <form
          className={`cmock__form${expanded ? " cmock__form--expanded" : ""}`}
          onSubmit={(event) => {
            event.preventDefault();
            if (canSend) handleSend();
          }}
        >
          {/* Pill-mode add button — sits inline to the left of the input.
              In expanded mode this is hidden via CSS and the toolbar one
              takes over (just like the real composer). */}
          <PlusButton
            className="cmock__add-button"
            onClick={toggleAddMenu}
            isOpen={addMenuOpen}
          />

          {dictationInline ? (
            /* Voice ON, no text — the dictation bar REPLACES the
               textarea + toolbar inline. Form stays in pill shape. */
            <DictationBar
              levels={voiceLevels}
              elapsedMs={voiceElapsedMs}
              onCancel={() => setVoiceActive(false)}
              onConfirm={() => {
                setMessage("Let's wrap this up.");
                setVoiceActive(false);
              }}
              onSend={() => {
                setVoiceActive(false);
                handleSend();
              }}
            />
          ) : (
            <>
              <textarea
                ref={textareaRef}
                className="cmock__input"
                placeholder="Ask Stella anything…"
                value={message}
                rows={1}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (canSend) handleSend();
                  }
                }}
              />

              <div className="cmock__toolbar">
                <div className="cmock__toolbar-left">
                  <PlusButton
                    className="cmock__add-button cmock__add-button--toolbar"
                    onClick={toggleAddMenu}
                    isOpen={addMenuOpen}
                  />
                </div>
                <div className="cmock__toolbar-right">
                  <button
                    type="button"
                    className={`cmock__icon-btn cmock__mic${
                      voiceActive ? " cmock__mic--active" : ""
                    }`}
                    title={voiceActive ? "Stop dictation" : "Start dictation"}
                    aria-label={
                      voiceActive ? "Stop dictation" : "Start dictation"
                    }
                    onClick={() => setVoiceActive((v) => !v)}
                  >
                    <MicIcon />
                  </button>
                  <button
                    type="submit"
                    className="cmock__icon-btn cmock__submit"
                    disabled={!canSend}
                    aria-label="Send"
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>

              {/* Voice WITH text — dictation bar sits BELOW the toolbar
                  as its own row inside the expanded composer. */}
              {dictationBelow && (
                <div className="cmock__dictation-row">
                  <DictationBar
                    levels={voiceLevels}
                    elapsedMs={voiceElapsedMs}
                    onCancel={() => setVoiceActive(false)}
                    onConfirm={() => {
                      setMessage(
                        (m) => `${m}${m ? " " : ""}Let's wrap this up.`,
                      );
                      setVoiceActive(false);
                    }}
                    onSend={() => {
                      setVoiceActive(false);
                      handleSend();
                    }}
                  />
                </div>
              )}
            </>
          )}
        </form>

      </div>

      {/* Add menu — portaled so the codex-frame can't crop it. */}
      {addMenuAnchor ? (
        <AddMenu
          anchorRect={addMenuAnchor}
          onClose={() => setAddMenuAnchor(null)}
        />
      ) : null}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────────────────────────── */

function PlusButton({
  className,
  onClick,
  isOpen,
}: {
  className?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isOpen: boolean;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-label="Add"
      title="Add"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      >
        <line x1="12" y1="6" x2="12" y2="18" />
        <line x1="6" y1="12" x2="18" y2="12" />
      </svg>
    </button>
  );
}

function MicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

/**
 * Hover preview rendered into a body-level portal so the codex-frame's
 * clipping can't crop it. The card pins itself just above the hovered
 * suggestion chip via the anchor's bounding rect.
 *
 * Window dimensions are read once on mount and any time the chip rect
 * changes; the card is then placed with `position: fixed` in viewport
 * coordinates and clamped to stay within an 8px viewport margin.
 */
const HOVER_CARD_WIDTH = 280;
const HOVER_CARD_HEIGHT = 215;
const HOVER_CARD_GAP = 12;
const HOVER_CARD_MARGIN = 12;

function SuggestionHoverCardPortal({
  chip,
  anchorRect,
}: {
  chip: SuggestionChip;
  anchorRect: DOMRect;
}) {
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  // Default placement: above the chip. If there isn't room, flip below.
  const desiredTopAbove = anchorRect.top - HOVER_CARD_HEIGHT - HOVER_CARD_GAP;
  const desiredTopBelow = anchorRect.bottom + HOVER_CARD_GAP;
  const top =
    desiredTopAbove < HOVER_CARD_MARGIN ? desiredTopBelow : desiredTopAbove;
  const centeredLeft =
    anchorRect.left + anchorRect.width / 2 - HOVER_CARD_WIDTH / 2;
  const left = Math.max(
    HOVER_CARD_MARGIN,
    Math.min(viewportW - HOVER_CARD_WIDTH - HOVER_CARD_MARGIN, centeredLeft),
  );
  const clampedTop = Math.max(
    HOVER_CARD_MARGIN,
    Math.min(viewportH - HOVER_CARD_HEIGHT - HOVER_CARD_MARGIN, top),
  );

  return createPortal(
    <div
      className="cmock__hover-card"
      role="tooltip"
      style={{
        position: "fixed",
        top: clampedTop,
        left,
        width: HOVER_CARD_WIDTH,
      }}
    >
      <div className="cmock__hover-card-image">
        <img src={chip.previewUrl} alt="" />
      </div>
      <div className="cmock__hover-card-meta">
        <span
          className="cmock__hover-card-icon"
          style={{ background: chip.iconTint }}
        >
          <img src={chip.iconUrl} alt="" width={14} height={14} />
        </span>
        <span className="cmock__hover-card-text">
          <strong>{chip.name}</strong>
          {chip.detail ? <span>{chip.detail}</span> : null}
        </span>
      </div>
    </div>,
    document.body,
  );
}

const formatElapsed = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

function DictationBar({
  levels,
  elapsedMs,
  onCancel,
  onConfirm,
  onSend,
}: {
  levels: number[];
  elapsedMs: number;
  onCancel: () => void;
  onConfirm: () => void;
  onSend: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Same right-aligned scrolling waveform render as the real
  // DictationRecordingBar — port of `DictationWaveform` in
  // `desktop/src/features/dictation/components/DictationRecordingBar.tsx`.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    ctx.clearRect(0, 0, targetW, targetH);
    const barW = 2 * dpr;
    const gap = 1 * dpr;
    const stride = barW + gap;
    const visibleCount = Math.min(
      levels.length,
      Math.max(1, Math.floor(targetW / stride)),
    );
    const startIndex = levels.length - visibleCount;
    const minH = 1 * dpr;
    const maxH = targetH;
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    const startX = targetW - visibleCount * stride + gap / 2;
    for (let i = 0; i < visibleCount; i += 1) {
      const level = levels[startIndex + i]!;
      const h = Math.max(minH, Math.min(maxH, level * maxH));
      const x = startX + i * stride;
      const y = targetH / 2 - h / 2;
      ctx.fillRect(x, y, barW, h);
    }
  }, [levels]);

  return (
    <>
      <canvas ref={canvasRef} className="cmock__waveform" aria-hidden="true" />
      <span className="cmock__waveform-timer" aria-live="polite">
        {formatElapsed(elapsedMs)}
      </span>
      <button
        type="button"
        className="cmock__icon-btn cmock__waveform-btn"
        onClick={onCancel}
        title="Cancel dictation"
        aria-label="Cancel dictation"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
      </button>
      <button
        type="button"
        className="cmock__icon-btn cmock__waveform-btn cmock__waveform-btn--confirm"
        onClick={onConfirm}
        title="Stop and transcribe"
        aria-label="Stop and transcribe"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="5 12 10 17 19 7" />
        </svg>
      </button>
      <button
        type="button"
        className="cmock__icon-btn cmock__waveform-btn cmock__waveform-btn--send"
        onClick={onSend}
        title="Send"
        aria-label="Send"
      >
        <SendIcon />
      </button>
    </>
  );
}

const ADD_MENU_WIDTH = 252;
const ADD_MENU_GAP = 8;
const ADD_MENU_MARGIN = 12;
/** Approximate menu height — used to decide whether to open above or
 *  below the + button. Slightly over-estimated so the flip is reliable
 *  before the menu has had a chance to measure itself. */
const ADD_MENU_HEIGHT_GUESS = 268;

function AddMenu({
  anchorRect,
  onClose,
}: {
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => setMounted(true), []);
  // Items mirror `ComposerAddMenu.tsx`: Attach files / Capture / Select
  // area / Read aloud, then a "Recent" section with the last few files.
  const items: ReadonlyArray<{
    label: string;
    icon: React.ReactNode;
    /** Optional faded right-side hint, like the real menu's kbd hints. */
    hint?: string;
  }> = [
    {
      label: "Attach files…",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      ),
    },
    {
      label: "Capture",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
    },
    {
      label: "Select area",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <path d="M8 12h8" />
        </svg>
      ),
    },
    {
      label: "Read replies aloud",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ),
    },
  ];

  const recents = [
    "Q4-roadmap-final.pdf",
    "billing-empty-state.png",
    "kickoff-notes.md",
  ];

  if (!mounted) return null;

  // Place above the + button by default; flip below when the menu
  // would clip past the top of the viewport. Centered horizontally on
  // the button, clamped to a 12px viewport margin.
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const topAbove = anchorRect.top - ADD_MENU_HEIGHT_GUESS - ADD_MENU_GAP;
  const topBelow = anchorRect.bottom + ADD_MENU_GAP;
  const top =
    topAbove < ADD_MENU_MARGIN ? topBelow : topAbove;
  const desiredLeft =
    anchorRect.left + anchorRect.width / 2 - ADD_MENU_WIDTH / 2;
  const left = Math.max(
    ADD_MENU_MARGIN,
    Math.min(viewportW - ADD_MENU_WIDTH - ADD_MENU_MARGIN, desiredLeft),
  );
  const clampedTop = Math.max(
    ADD_MENU_MARGIN,
    Math.min(viewportH - ADD_MENU_HEIGHT_GUESS - ADD_MENU_MARGIN, top),
  );

  return createPortal(
    <div
      className="cmock__menu"
      data-cmock-menu="true"
      role="menu"
      style={{
        position: "fixed",
        top: clampedTop,
        left,
        width: ADD_MENU_WIDTH,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          className="cmock__menu-item"
          onClick={onClose}
        >
          <span className="cmock__menu-icon">{item.icon}</span>
          <span className="cmock__menu-label">{item.label}</span>
          {item.hint ? (
            <span className="cmock__menu-hint">{item.hint}</span>
          ) : null}
        </button>
      ))}

      <div className="cmock__menu-separator" role="separator" />
      <div className="cmock__menu-section">Recent</div>
      {recents.map((name) => (
        <button
          key={name}
          type="button"
          role="menuitem"
          className="cmock__menu-item cmock__menu-item--recent"
          onClick={onClose}
        >
          <span className="cmock__menu-icon">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <polyline points="14 3 14 8 19 8" />
            </svg>
          </span>
          <span className="cmock__menu-label">{name}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
}
