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
  useMemo,
  useRef,
  useState,
} from "react";

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceElapsedMs, setVoiceElapsedMs] = useState(0);
  const [voiceLevels, setVoiceLevels] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Auto-grow the textarea — match the real composer's pill→expanded
  // morph behavior (driven by content rather than a manual toggle).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(200, el.scrollHeight)}px`;
  }, [message]);

  // Voice mode: tick the timer + push a fresh "audio level" sample every
  // 80ms so the waveform reads as live. Resets on toggle off.
  useEffect(() => {
    if (!voiceActive) {
      setVoiceElapsedMs(0);
      setVoiceLevels([]);
      return;
    }
    const start = performance.now();
    const interval = window.setInterval(() => {
      setVoiceElapsedMs(performance.now() - start);
      setVoiceLevels((prev) => {
        // Bias toward mid-range with occasional peaks so it looks like
        // someone actually speaking, not a uniform noise floor.
        const next = Math.min(
          1,
          Math.max(0.06, Math.pow(Math.random(), 1.5) * 1.05),
        );
        const updated = [...prev, next];
        return updated.length > 96 ? updated.slice(updated.length - 96) : updated;
      });
    }, 80);
    return () => window.clearInterval(interval);
  }, [voiceActive]);

  // Close the add menu on outside click.
  useEffect(() => {
    if (!addMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && wrapRef.current?.contains(target)) return;
      setAddMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAddMenuOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [addMenuOpen]);

  const hovered = useMemo(
    () => SUGGESTIONS.find((s) => s.id === hoveredId) ?? null,
    [hoveredId],
  );

  const attachedIds = useMemo(
    () => new Set(attached.map((c) => c.id)),
    [attached],
  );

  const handleAttach = useCallback((chip: SuggestionChip) => {
    setAttached((prev) =>
      prev.some((c) => c.id === chip.id) ? prev : [...prev, chip],
    );
    setHoveredId(null);
  }, []);

  const handleDetach = useCallback((id: string) => {
    setAttached((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleSend = useCallback(() => {
    setMessage("");
    setAttached([]);
  }, []);

  const canSend = message.trim().length > 0 || attached.length > 0;
  const expanded =
    message.length > 0 || attached.length > 0 || voiceActive;

  return (
    <div className="cmock" ref={wrapRef}>
      {/* ── Action zero: suggestion chips row above the shell ── */}
      <div className="cmock__suggestions" role="list">
        {SUGGESTIONS.map((chip) => {
          if (attachedIds.has(chip.id)) return null;
          const isHovered = hoveredId === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              role="listitem"
              className="cmock__suggestion"
              data-hovered={isHovered || undefined}
              onMouseEnter={() => setHoveredId(chip.id)}
              onMouseLeave={() =>
                setHoveredId((current) => (current === chip.id ? null : current))
              }
              onFocus={() => setHoveredId(chip.id)}
              onBlur={() =>
                setHoveredId((current) => (current === chip.id ? null : current))
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
              {isHovered ? <SuggestionHoverCard chip={chip} /> : null}
            </button>
          );
        })}
      </div>

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
          {/* Pill-mode add button — sits inline to the left of the input. */}
          <PlusButton
            className="cmock__add-button"
            onClick={() => setAddMenuOpen((o) => !o)}
            isOpen={addMenuOpen}
          />

          {voiceActive ? (
            <DictationBar
              levels={voiceLevels}
              elapsedMs={voiceElapsedMs}
              onCancel={() => setVoiceActive(false)}
              onConfirm={() => {
                setMessage((m) =>
                  m
                    ? `${m} Let's wrap this up.`
                    : "Let's wrap this up.",
                );
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
                    onClick={() => setAddMenuOpen((o) => !o)}
                    isOpen={addMenuOpen}
                  />
                </div>
                <div className="cmock__toolbar-right">
                  <button
                    type="button"
                    className="cmock__icon-btn cmock__mic"
                    title="Start dictation"
                    aria-label="Start dictation"
                    onClick={() => setVoiceActive(true)}
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
            </>
          )}
        </form>

        {addMenuOpen && <AddMenu onClose={() => setAddMenuOpen(false)} />}
      </div>
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
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
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

function SuggestionHoverCard({ chip }: { chip: SuggestionChip }) {
  return (
    <div className="cmock__hover-card" role="tooltip">
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
    </div>
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

function AddMenu({ onClose }: { onClose: () => void }) {
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

  return (
    <div className="cmock__menu" role="menu" onClick={(e) => e.stopPropagation()}>
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
    </div>
  );
}
