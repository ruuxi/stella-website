"use client";

/**
 * Mobile-only mock for the "An app that becomes you" section.
 *
 * Mirrors the real Stella mini-window 1:1 — same sidebar, chat, context
 * chips, and composer pill as the "One chat. From anywhere." mock.
 * Tapping a transformation pill morphs one specific piece of that real
 * surface:
 *
 *   - workspace rail → sidebar reveals a workspaces stack
 *   - tabs          → tabs strip appears above the chat
 *   - dashboard     → chat is replaced with a small live dashboard
 *   - cozy          → the whole window becomes the Mochi takeover
 */

import { useMemo, useState } from "react";
import { type SectionKey } from "./stella-app-mock-types";
import { resolveMobileSelfModThemeConfig } from "./stella-mock-theme";
import { themeConfigToMiniWindowStyle } from "./stella-mock-theme-tokens";
import {
  STELLA_ICON_HOUSE,
  STELLA_ICON_STORE,
  STELLA_ICON_USERS,
} from "./stella-shell";

type Variant = "default" | "rail" | "tabs" | "dashboard" | "cozy";

const PILLS: { key: SectionKey; label: string; variant: Variant }[] = [
  { key: "sidebar", label: "Add a workspace rail", variant: "rail" },
  { key: "header", label: "Give me tabs", variant: "tabs" },
  { key: "messages", label: "Make it a dashboard", variant: "dashboard" },
  { key: "composer", label: "Make it cozy", variant: "cozy" },
];

const KEY_TO_VARIANT: Partial<Record<SectionKey, Variant>> = {
  sidebar: "rail",
  header: "tabs",
  messages: "dashboard",
  composer: "cozy",
};

export function MobileSelfModMock() {
  const [active, setActive] = useState<SectionKey | null>(null);
  const variant: Variant = (active && KEY_TO_VARIANT[active]) || "default";
  const mockThemeConfig = resolveMobileSelfModThemeConfig(variant);
  const mockThemeStyle = useMemo(
    () =>
      mockThemeConfig ? themeConfigToMiniWindowStyle(mockThemeConfig) : undefined,
    [mockThemeConfig],
  );

  return (
    <div className="smhm">
      <div
        className="mini-window mini-window--self-mod"
        style={mockThemeStyle}
        data-theme={mockThemeConfig?.id}
        data-color-mode={mockThemeConfig?.colorMode}
        data-gradient-mode={mockThemeConfig?.gradientMode}
        data-variant={variant}
      >
        <div className="mini-window__titlebar">
          <div className="mini-window__traffic" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="mini-window__title-spacer" aria-hidden="true" />
        </div>

        <div className="mini-window__body">
          {variant !== "cozy" ? <MiniSidebar variant={variant} /> : null}

          <div className="mini-window__main">
            {variant === "cozy" ? (
              <CozyBody />
            ) : (
              <>
                {variant === "tabs" ? <TabsStrip /> : null}

                <div className="mini-window__chat">
                  {variant === "dashboard" ? (
                    <DashboardBody />
                  ) : (
                    <ChatBody />
                  )}
                </div>

                <div className="mini-window__composer-wrap">
                  <ContextChipBar />
                  <ComposerPill />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className="smhm__pills"
        role="group"
        aria-label="Stella transformations"
      >
        {PILLS.map((pill) => {
          const isActive = active === pill.key;
          return (
            <button
              key={pill.key}
              type="button"
              className="smhm__pill"
              data-active={isActive || undefined}
              onClick={() => setActive(isActive ? null : pill.key)}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Sidebar — same DOM as the single-chat mini-window sidebar.
   ────────────────────────────────────────────────────────────────── */

function MiniSidebar({ variant }: { variant: Variant }) {
  return (
    <aside className="mini-sidebar">
      <div className="mini-sidebar__brand">
        <span className="mini-sidebar__brand-logo" aria-hidden="true">
          <img src="/stella-logo.svg" alt="" />
        </span>
        <span className="mini-sidebar__brand-text">Stella</span>
      </div>

      {variant === "rail" ? (
        <div
          className="mini-sidebar__workspaces"
          aria-label="Workspaces"
        >
          <span
            className="mini-sidebar__workspace mini-sidebar__workspace--active"
            aria-hidden="true"
          />
          <span className="mini-sidebar__workspace" aria-hidden="true" />
          <span className="mini-sidebar__workspace" aria-hidden="true" />
        </div>
      ) : null}

      <nav className="mini-sidebar__nav" aria-label="Apps">
        <SidebarItem icon={STELLA_ICON_HOUSE} label="Home" />
        <SidebarItem icon={STELLA_ICON_STORE} label="Store" />
        <SidebarItem icon={STELLA_ICON_USERS} label="Social" />
      </nav>

      <div className="mini-sidebar__footer">
        <div className="mini-sidebar__account-trigger">
          <span className="mini-sidebar__avatar" aria-hidden="true">
            J
          </span>
          <span className="mini-sidebar__account-label">Jordan</span>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`mini-sidebar__item${active ? " mini-sidebar__item--active" : ""}`}
    >
      <span className="mini-sidebar__item-icon">{icon}</span>
      <span className="mini-sidebar__item-label">{label}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Chat body — sample user/stella exchange (static for the mobile mock).
   ────────────────────────────────────────────────────────────────── */

function ChatBody() {
  return (
    <ul className="mini-chat" role="log">
      <li className="mini-chat__row mini-chat__row--user">
        <div className="mini-chat__bubble mini-chat__bubble--user">
          Pull yesterday&rsquo;s notes into a draft for the team email.
        </div>
      </li>
      <li className="mini-chat__row mini-chat__row--stella">
        <div className="mini-chat__bubble mini-chat__bubble--stella">
          Done — opened it beside your inbox. Want me to add the metrics
          you flagged on Tuesday?
        </div>
      </li>
    </ul>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Tabs strip — appears above the chat in the "tabs" variant.
   ────────────────────────────────────────────────────────────────── */

function TabsStrip() {
  return (
    <div className="smhm-tabs-strip">
      <button type="button" className="smhm-tab" data-active>
        Today
      </button>
      <button type="button" className="smhm-tab">
        Inbox
      </button>
      <button type="button" className="smhm-tab">
        Notes
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Dashboard body — replaces the chat in the "dashboard" variant.
   Clean surface cards, no decorative gradients.
   ────────────────────────────────────────────────────────────────── */

function DashboardBody() {
  return (
    <div className="smhm-dash">
      <div className="smhm-dash__card smhm-dash__card--tall">
        <span className="smhm-dash__eyebrow">Today</span>
        <span className="smhm-dash__figure">14</span>
        <span className="smhm-dash__detail">tasks queued</span>
      </div>
      <div className="smhm-dash__card">
        <span className="smhm-dash__eyebrow">Inbox</span>
        <span className="smhm-dash__figure">3</span>
      </div>
      <div className="smhm-dash__card">
        <span className="smhm-dash__eyebrow">Drafts</span>
        <span className="smhm-dash__figure">7</span>
      </div>
      <div className="smhm-dash__card smhm-dash__card--wide">
        <span className="smhm-dash__eyebrow">Recent</span>
        <span className="smhm-dash__detail">
          Lisbon trip · Q1 email · laptop pricing
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Context-chip bar — two suggestion chips above the composer.
   Same DOM/styling as the real mini-window context bar.
   ────────────────────────────────────────────────────────────────── */

function ContextChipBar() {
  return (
    <div className="mini-context-bar">
      <div className="mini-context-bar__indicator" />
      <div className="mini-context-bar__chips">
        <button type="button" className="mini-context-chip">
          <span className="mini-context-chip__plus" aria-hidden="true">
            +
          </span>
          <span
            className="mini-context-chip__icon"
            style={{ background: "rgba(255, 255, 255, 0.94)" }}
            aria-hidden="true"
          >
            <img
              src="https://cdn.simpleicons.org/googlechrome/4285F4"
              alt=""
              width={12}
              height={12}
            />
          </span>
          <span className="mini-context-chip__label">Chrome</span>
        </button>
        <button type="button" className="mini-context-chip">
          <span className="mini-context-chip__plus" aria-hidden="true">
            +
          </span>
          <span
            className="mini-context-chip__icon"
            style={{ background: "rgba(255, 255, 255, 0.94)" }}
            aria-hidden="true"
          >
            <img
              src="https://cdn.simpleicons.org/notion/000000"
              alt=""
              width={12}
              height={12}
            />
          </span>
          <span className="mini-context-chip__label">Notion</span>
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Composer pill — matches the real mini-window composer 1:1.
   ────────────────────────────────────────────────────────────────── */

function ComposerPill() {
  return (
    <div className="mini-composer">
      <button
        type="button"
        className="mini-composer__btn mini-composer__add"
        aria-label="Add"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="6" x2="12" y2="18" />
          <line x1="6" y1="12" x2="18" y2="12" />
        </svg>
      </button>
      <span className="mini-composer__placeholder">
        Ask Stella anything…
      </span>
      <button
        type="button"
        className="mini-composer__btn mini-composer__mic"
        aria-label="Dictate"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      </button>
      <button
        type="button"
        className="mini-composer__btn mini-composer__send"
        aria-label="Send"
        disabled
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Cozy takeover — rainy-window scene with the tuxedo cat.
   Identical aesthetic to the website desktop cozy mock.
   ────────────────────────────────────────────────────────────────── */

function CozyBody() {
  return (
    <div className="smhm-cozy">
      <div className="smhm-cozy__lamp" aria-hidden />
      <div className="smhm-cozy__rain" aria-hidden>
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="smhm-cozy__drop"
            style={{ ["--drop-i" as string]: i }}
          />
        ))}
      </div>

      <header className="smhm-cozy__header">
        <span className="smhm-cozy__brand">Mochi</span>
        <nav className="smhm-cozy__nav" aria-label="Mochi sections">
          <span className="smhm-cozy__nav-item is-active">Home</span>
          <span className="smhm-cozy__nav-item">Store</span>
          <span className="smhm-cozy__nav-item">Social</span>
        </nav>
      </header>

      <CozyCat />

      <div className="smhm-cozy__text">
        <span className="smhm-cozy__headline">She&rsquo;s asleep</span>
        <span className="smhm-cozy__headline-em">by the window.</span>
      </div>

      <footer className="smhm-cozy__compose">
        <button
          type="button"
          className="smhm-cozy__compose-attach"
          aria-label="Attach"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="6" x2="12" y2="18" />
            <line x1="6" y1="12" x2="18" y2="12" />
          </svg>
        </button>
        <span className="smhm-cozy__compose-input">
          <span className="smhm-cozy__compose-placeholder">
            Message Mochi&hellip;
          </span>
        </span>
        <button
          type="button"
          className="smhm-cozy__compose-send"
          aria-label="Send"
          disabled
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </button>
      </footer>
    </div>
  );
}

/** Tuxedo cat — same illustration used in the website desktop mock. */
function CozyCat() {
  return (
    <svg
      className="smhm-cozy__cat"
      viewBox="0 0 180 140"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="smhmCatBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2E303F" />
          <stop offset="100%" stopColor="#14151B" />
        </linearGradient>
        <linearGradient id="smhmCatBelly" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F5F6F9" />
        </linearGradient>
        <linearGradient id="smhmCatInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F4D3D2" />
          <stop offset="100%" stopColor="#E2A6A4" />
        </linearGradient>
        <filter
          id="smhmCatShadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="4"
            floodColor="#0D0E12"
            floodOpacity="0.15"
          />
        </filter>
      </defs>

      <g>
        <path
          d="M 135 98 C 158 98 168 114 154 124 C 142 129 116 129 96 129 L 65 129"
          stroke="url(#smhmCatBody)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 75 129 L 60 129"
          stroke="url(#smhmCatBelly)"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      <g>
        <path
          d="M 52 116 C 36 98 42 78 68 70 C 88 64 112 60 132 72 C 148 82 152 102 142 118 C 134 124 115 124 95 123 C 75 122 58 121 52 116 Z"
          fill="url(#smhmCatBody)"
        />
        <path
          d="M 52 110 C 48 95 58 85 75 85 C 88 85 92 98 92 110 C 92 118 78 119 65 118 C 56 117 53 113 52 110 Z"
          fill="url(#smhmCatBelly)"
        />
        <rect
          x="50"
          y="112"
          width="14"
          height="8"
          rx="4"
          fill="url(#smhmCatBelly)"
        />
        <rect
          x="70"
          y="112"
          width="14"
          height="8"
          rx="4"
          fill="url(#smhmCatBelly)"
        />

        <g transform="translate(17.5, 23) scale(0.75)">
          <path d="M 42 53 C 38 20 48 18 58 42 Z" fill="url(#smhmCatBody)" />
          <path d="M 45 49 C 42 25 49 23 55 39 Z" fill="url(#smhmCatInner)" />
          <path d="M 98 53 C 102 20 92 18 82 42 Z" fill="url(#smhmCatBody)" />
          <path d="M 95 49 C 98 25 91 23 85 39 Z" fill="url(#smhmCatInner)" />

          <g filter="url(#smhmCatShadow)">
            <circle cx="70" cy="65" r="31" fill="url(#smhmCatBody)" />
            <path
              d="M 70 48 C 62 60 52 70 44 76 C 54 90 86 90 96 76 C 88 70 78 60 70 48 Z"
              fill="url(#smhmCatBelly)"
            />
            <path
              d="M 49 69 Q 55 73 61 69"
              stroke="#14151B"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 79 69 Q 85 73 91 69"
              stroke="#14151B"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M 68 78 L 72 78 L 70 81 Z" fill="url(#smhmCatInner)" />
            <path
              d="M 38 76 L 24 74 M 38 81 L 21 81"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.45"
            />
            <path
              d="M 102 76 L 116 74 M 102 81 L 119 81"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.45"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
