"use client";

/**
 * Stella App Mock — onboarding preview that mirrors the real desktop app.
 *
 * The default state reproduces the actual Stella surface: a 170px sidebar
 * (brand + Home/Social/New App + footer icons) and a centered home column
 * with the italic Cormorant Garamond title, category pills, and a pill
 * composer — exactly what users see when they finish onboarding.
 *
 * When `interactive` is true, four floating "transformation" pills hover
 * over each section (sidebar, header, messages, composer). Clicking a pill
 * swaps that section for an alternate paradigm so the user can feel how
 * completely Stella can remake itself.
 */

import { useCallback, useState, type ReactNode } from "react";
import {
  EMPTY_SECTION_TOGGLES,
  type SectionKey,
  type SectionToggles,
} from "./stella-app-mock-types";

type SectionPill = {
  key: SectionKey;
  label: string;
  icon: ReactNode;
};

const ICON_SVG_PROPS = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const SECTION_PILLS: SectionPill[] = [
  {
    key: "sidebar",
    label: "Add a workspace rail",
    icon: (
      <svg {...ICON_SVG_PROPS}>
        <rect x="3" y="3" width="6" height="18" rx="1.5" />
        <path d="M13 7h8M13 12h8M13 17h5" />
      </svg>
    ),
  },
  {
    key: "header",
    label: "Give me tabs",
    icon: (
      <svg {...ICON_SVG_PROPS}>
        <path d="M3 9h6a1 1 0 0 0 1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" />
        <path d="M3 9V8a1 1 0 0 1 1-1h5" />
      </svg>
    ),
  },
  {
    key: "messages",
    label: "Make it a dashboard",
    icon: (
      <svg {...ICON_SVG_PROPS}>
        <rect x="3" y="4" width="18" height="6" rx="1.5" />
        <rect x="3" y="14" width="18" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    key: "composer",
    label: "Make it cozy",
    icon: (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
        <ellipse cx="12" cy="17" rx="4.2" ry="3.6" />
        <ellipse cx="6" cy="11.5" rx="2" ry="2.6" />
        <ellipse cx="18" cy="11.5" rx="2" ry="2.6" />
        <ellipse cx="9" cy="6.5" rx="1.8" ry="2.4" />
        <ellipse cx="15" cy="6.5" rx="1.8" ry="2.4" />
      </svg>
    ),
  },
  {
    key: "createApp",
    label: "Build me an app",
    icon: (
      <svg {...ICON_SVG_PROPS}>
        <path d="M12 3v18M3 12h18" />
      </svg>
    ),
  },
];

/* ──────────────────────────────────────────────────────────────────────
 * Reusable inline icons that match the real `SidebarIcons.tsx` set.
 * Kept inline so the mock is self-contained and renders identically when
 * the onboarding is themed differently from the rest of the app.
 * ────────────────────────────────────────────────────────────────────── */

const stroke = (d: string, extra?: ReactNode) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
    {extra}
  </svg>
);

const ICON_HOUSE = stroke("M3 10l9-7 9 7M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10");
const ICON_USERS = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const ICON_PLUS_SQUARE = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);
const ICON_MUSIC = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);
const ICON_PALETTE = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.6 1.5-1.5 0-.4-.1-.7-.3-1-.2-.2-.3-.5-.3-.8 0-.8.7-1.5 1.5-1.5h1.2c3.2 0 5.8-2.6 5.8-5.8C21.8 6.2 17.4 2 12 2z" />
  </svg>
);
const ICON_SETTINGS = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
const ICON_STORE = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const ICON_DEVICE = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="12" height="18" rx="2" ry="2" />
    <path d="M7 18h4" />
    <path d="M17 8.5a5 5 0 0 1 0 7" />
    <path d="M20 5.5a9 9 0 0 1 0 13" />
  </svg>
);
const ICON_LOGIN = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </svg>
);

/* Send button used inside the pill composer (matches ComposerPrimitives). */
const ICON_SEND = (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
const ICON_PLUS = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/* ──────────────────────────────────────────────────────────────────────
 * Styles. Mirrors the real app's CSS variables and dimensions so the mock
 * picks up whatever theme the user has selected during onboarding.
 * ────────────────────────────────────────────────────────────────────── */

const css = `
  .sam-root {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  /* The horizontal sidebar+main row sits below the top shell bar.
     Explicit opaque background so the codex-frame blue underneath
     the mock can't bleed through (background:inherit on the shorthand
     did not actually re-paint the sam-root fill here). */
  .sam-body-row {
    flex: 1;
    min-height: 0;
    display: flex;
    width: 100%;
    position: relative;
    background: var(--background);
  }
  /* Top shell bar — mirrors the desktop ShellTopBar: macOS traffic
     lights on the left, sidebar/back-forward affordances next to them,
     and a panel toggle on the right. Uses the same opaque surface as
     the rest of the mock so it reads as part of the window chrome. */
  .sam-topbar {
    flex-shrink: 0;
    height: 30px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 12px;
    border-bottom: 1px solid var(--border-base);
    background: var(--background);
    position: relative;
    z-index: 3;
  }
  .sam-traffic {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .sam-traffic-dot {
    width: 11px;
    height: 11px;
    border-radius: 999px;
    background: var(--c, #c1c1c1);
    box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.15);
  }
  .sam-topbar-icon-btn {
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: transparent;
    color: var(--text-weak);
  }
  .sam-topbar-icon-btn svg { width: 13px; height: 13px; }
  .sam-topbar-icon-btn--disabled { opacity: 0.4; }
  .sam-topbar-spacer { flex: 1; }
  .sam-topbar-right {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .sam-fakeroot-keep-pos {
    /* unused placeholder so the file compiles cleanly if referenced */
    display: none;
    font-family: var(--font-family-sans, "Manrope", system-ui, sans-serif);
    color: var(--text-base);
    background: transparent;
    overflow: hidden;
    user-select: none;
    border-radius: 12px;
    border: 1px solid var(--border-base);
    box-shadow: var(--shadow-md);
    /* Mock-local gradient hint so the surface reads as "the real app"
       even when the onboarding background sits behind it. */
    background-image: radial-gradient(
      120% 90% at 80% 0%,
      color-mix(in oklch, var(--primary) 8%, transparent),
      transparent 60%
    ),
    radial-gradient(
      90% 80% at 0% 100%,
      color-mix(in oklch, var(--accent, var(--primary)) 6%, transparent),
      transparent 55%
    );
    background-color: var(--background);
  }
  .sam-root[data-interactive="true"] { overflow: visible; }
  .sam-root * { box-sizing: border-box; }

  /* ──────────────────────────────────────────
     SIDEBAR — default: matches the real 170px
     '.sidebar' with brand + nav + footer.
     ────────────────────────────────────────── */
  .sam-sidebar {
    width: 170px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    overflow: hidden;
    position: relative;
    z-index: 2;
  }

  .sam-sidebar-default {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    width: 100%;
  }
  .sam-sidebar[data-modern="true"] .sam-sidebar-default { display: none; }

  .sam-sidebar-header {
    height: 16px;
    flex-shrink: 0;
  }

  .sam-sidebar-brand {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    /* Logo sits in the same column as the nav icons below
       (nav padding 12px + nav-item padding 14px ≈ 26px), matching
       the real desktop sidebar. */
    padding: 24px 16px 10px 26px;
  }
  .sam-sidebar-brand-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    opacity: 0.55;
  }
  .sam-sidebar-brand-logo img {
    width: 100%;
    height: 100%;
    display: block;
  }
  .sam-sidebar-brand-text {
    color: var(--text-weak);
    font-family: var(--font-display), "Cormorant Garamond", Georgia, serif;
    font-size: 22px;
    font-weight: 450;
    font-style: italic;
    letter-spacing: -0.02em;
    line-height: 1;
    text-transform: none;
  }

  /* Account row at the bottom of the sidebar footer — small initials
     avatar + Upgrade pill, mirrors AccountRow in the real sidebar. */
  .sam-account-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px 4px;
    margin-top: 4px;
  }
  .sam-avatar {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: oklch(0.88 0.06 250);
    color: oklch(0.32 0.05 250);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid oklch(0.78 0.05 250 / 0.5);
    flex-shrink: 0;
  }
  .sam-account-pill {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-weaker);
    padding: 4px 10px;
    border: 1px solid var(--border-strong);
    border-radius: 999px;
  }

  .sam-sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 12px 12px;
    flex: 1;
    min-height: 0;
  }

  .sam-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: var(--radius-md, 6px);
    background: transparent;
    border: none;
    color: var(--text-base);
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    text-align: left;
    width: 100%;
    cursor: default;
  }
  .sam-nav-item.active,
  .sam-root:not([data-create-app]) .sam-nav-item--home,
  .sam-root[data-create-app] .sam-nav-item--studio {
    background: color-mix(in oklch, var(--foreground) 8%, transparent);
    color: var(--text-strong);
  }
  .sam-nav-item.active .sam-nav-icon,
  .sam-root:not([data-create-app]) .sam-nav-item--home .sam-nav-icon,
  .sam-root[data-create-app] .sam-nav-item--studio .sam-nav-icon {
    color: var(--primary);
  }

  /* "Music Studio" rail item — hidden until the user creates the app,
     then slides in with a soft "New" tag to make the addition legible. */
  .sam-nav-item--studio {
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    margin: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    position: relative;
    transition:
      max-height 0.45s cubic-bezier(0.22, 1, 0.36, 1),
      padding 0.45s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.35s ease 0.05s;
  }
  .sam-root[data-create-app] .sam-nav-item--studio {
    max-height: 38px;
    padding-top: 10px;
    padding-bottom: 10px;
    opacity: 1;
    pointer-events: auto;
  }
  .sam-nav-item-tag {
    margin-left: auto;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: 999px;
    background: color-mix(in oklch, var(--primary) 18%, transparent);
    color: var(--primary);
  }

  .sam-nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: var(--text-weak);
  }

  .sam-sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    border-top: 1px solid var(--border-weak);
  }
  .sam-footer-icons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 8px;
    justify-items: center;
    align-items: center;
  }
  .sam-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: var(--text-weak);
    border-radius: var(--radius-md, 6px);
  }

  /* SIDEBAR — modern: dense workspace with project list & badges. */
  .sam-sidebar[data-modern="true"] {
    width: 220px;
    background: linear-gradient(
      180deg,
      color-mix(in oklch, var(--primary) 6%, var(--glass-bg)) 0%,
      var(--glass-bg) 100%
    );
    backdrop-filter: var(--glass-blur);
    border-right: 1px solid color-mix(in oklch, var(--primary) 18%, transparent);
  }
  .sam-sidebar-modern {
    display: none;
    flex-direction: column;
    height: 100%;
    padding: 16px 12px;
    gap: 4px;
    animation: samFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .sam-sidebar[data-modern="true"] .sam-sidebar-modern { display: flex; }

  .sam-modern-search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: var(--radius-md, 6px);
    background: color-mix(in oklch, var(--foreground) 5%, transparent);
    border: 1px solid var(--border-weak);
    font-size: 12px;
    color: var(--text-weak);
    margin-bottom: 8px;
  }
  .sam-modern-search-kbd {
    margin-left: auto;
    padding: 1px 6px;
    font-family: var(--font-family-mono, monospace);
    font-size: 9.5px;
    border-radius: 3px;
    background: color-mix(in oklch, var(--foreground) 8%, transparent);
    color: var(--text-weaker);
  }
  .sam-modern-section {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-weaker);
    padding: 10px 10px 4px;
  }
  .sam-modern-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border-radius: var(--radius-md, 6px);
    font-size: 12.5px;
    color: var(--text-base);
  }
  .sam-modern-item-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: var(--text-weak);
  }
  .sam-modern-item-badge {
    margin-left: auto;
    padding: 1px 6px;
    border-radius: 999px;
    font-size: 9.5px;
    font-weight: 600;
    background: color-mix(in oklch, var(--primary) 18%, transparent);
    color: var(--primary);
  }
  .sam-modern-item.active {
    background: linear-gradient(
      90deg,
      color-mix(in oklch, var(--primary) 16%, transparent),
      color-mix(in oklch, var(--primary) 4%, transparent)
    );
    color: var(--text-strong);
    box-shadow: inset 2px 0 0 var(--primary);
  }
  .sam-modern-item.active .sam-modern-item-icon { color: var(--primary); }
  .sam-modern-spacer { flex: 1; }

  /* ──────────────────────────────────────────
     MAIN COLUMN — wraps header + body + composer
     Matches '.content-area' + '.full-body-main'.
     ────────────────────────────────────────── */
  .sam-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    border-left: 1px solid var(--border-weak);
    border-top: 1px solid var(--border-weak);
    position: relative;
  }

  /* HEADER — default: invisible (real app has no top bar on home). */
  .sam-header {
    height: 0;
    flex-shrink: 0;
    overflow: hidden;
    transition: height 0.3s ease;
  }
  .sam-header[data-modern="true"] {
    height: 38px;
    padding: 0;
    display: flex;
    align-items: stretch;
    background: color-mix(in oklch, var(--foreground) 4%, transparent);
    border-bottom: 1px solid var(--border-weak);
    animation: samFadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    overflow: hidden;
  }
  .sam-tabs {
    display: flex;
    align-items: stretch;
    width: 100%;
    padding: 6px 6px 0;
    gap: 1px;
  }
  .sam-tab {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px 7px 12px;
    font-size: 11.5px;
    font-weight: 500;
    color: var(--text-weak);
    border-radius: 7px 7px 0 0;
    border: 1px solid transparent;
    border-bottom: none;
    position: relative;
    cursor: default;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    background: transparent;
  }
  .sam-tab:not(.active):hover {
    background: color-mix(in oklch, var(--foreground) 4%, transparent);
    color: var(--text-base);
  }
  .sam-tab.active {
    background: var(--background);
    color: var(--text-strong);
    border-color: var(--border-weak);
    font-weight: 600;
    margin-bottom: -1px;
    z-index: 1;
  }
  .sam-tab.active::before {
    content: "";
    position: absolute;
    top: 0;
    left: 8px;
    right: 8px;
    height: 2px;
    background: var(--primary);
    border-radius: 0 0 2px 2px;
  }
  .sam-tab-icon {
    width: 12px;
    height: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--text-weak);
  }
  .sam-tab.active .sam-tab-icon { color: var(--primary); }
  .sam-tab-label {
    text-overflow: ellipsis;
    overflow: hidden;
    letter-spacing: -0.005em;
  }
  .sam-tab-add {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 7px 8px 6px 6px;
    width: 22px;
    height: 22px;
    border-radius: 5px;
    background: transparent;
    border: 1px dashed color-mix(in oklch, var(--foreground) 22%, transparent);
    color: var(--text-weak);
    font-size: 13px;
    font-weight: 500;
    flex-shrink: 0;
    align-self: center;
    line-height: 1;
  }

  /* BODY — default: home content (centered title + category pills). */
  .sam-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 24px 12px;
    min-height: 0;
    overflow: hidden;
  }
  /* Default home column: title + inline composer + plain-text category
     footer pinned to the bottom — mirrors the real home-content
     layout in the desktop app. */
  .sam-body-default {
    display: grid;
    grid-template-rows: 1fr auto 1fr auto;
    align-items: center;
    justify-items: center;
    width: 100%;
    max-width: 540px;
    flex: 1;
    padding: 12px 0;
  }
  .sam-body-default::before,
  .sam-body-default::after {
    content: "";
  }
  /* The {title, chips, composer} cluster sits in the middle auto row,
     visually centered between the two 1fr spacer rows. Footer pills
     occupy the last auto row, pinned to the bottom. */
  .sam-home-cluster {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 100%;
  }
  .sam-home-context {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    max-width: 480px;
    padding: 0 4px;
  }
  .sam-home-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px 3px 7px;
    border-radius: 999px;
    background: color-mix(in oklch, var(--background) 70%, transparent);
    border: 1px dashed color-mix(in oklch, var(--foreground) 22%, transparent);
    color: var(--text-base);
    font-size: 11.5px;
    font-weight: 500;
    line-height: 1;
  }
  .sam-home-chip-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 4px;
    background: color-mix(in oklch, var(--foreground) 8%, transparent);
    color: var(--text-base);
  }
  .sam-home-chip-icon svg { width: 9px; height: 9px; }
  .sam-home-chip-label { font-weight: 600; }
  .sam-home-chip-meta { color: var(--text-weak); font-weight: 400; }
  .sam-home-title {
    font-family: var(--font-display), "Cormorant Garamond", Georgia, serif;
    font-size: clamp(1.4rem, 2.6vw, 2rem);
    font-weight: 450;
    font-style: italic;
    letter-spacing: -0.03em;
    line-height: 1.2;
    color: var(--text-strong);
    text-align: center;
    margin: 0;
    width: 100%;
  }

  /* Inline composer pill — same look as the bottom .sam-composer but
     rendered directly under the home title. */
  .sam-home-composer {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    max-width: 480px;
    min-height: 38px;
    padding: 5px 8px;
    background: var(--background);
    border-radius: 999px;
    box-shadow: var(--shadow-md);
  }

  /* Bottom composer-wrap stays for modern / create-app / cozy stages,
     but on the default stage the composer lives inline (above), so
     hide the floor-anchored one. */
  .sam-root:not([data-create-app]) .sam-main:not(:has(.sam-body[data-modern="true"])) .sam-composer-wrap {
    display: none;
  }

  /* Plain-text category footer pills — no boxy chrome, hover-only
     emphasis. Matches .home-ideas-footer__pill on the desktop. */
  .sam-home-footer-pills {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding-top: 24px;
    width: 100%;
  }
  .sam-home-footer-pill {
    padding: 4px 2px;
    color: var(--text-weak);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0;
  }

  /* BODY — modern: cards-as-tools dashboard */
  .sam-body[data-modern="true"] .sam-body-default { display: none; }
  .sam-cards {
    display: none;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;
    max-width: 540px;
    margin: auto 0;
    animation: samFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .sam-body[data-modern="true"] .sam-cards { display: grid; }

  .sam-card {
    position: relative;
    padding: 12px 14px;
    border-radius: var(--radius-lg, 8px);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--border-strong);
    overflow: hidden;
  }
  .sam-card::before {
    content: "";
    position: absolute;
    top: 0; left: 0;
    width: 32px; height: 2px;
    background: var(--card-accent, var(--primary));
    border-radius: 0 0 2px 0;
  }
  .sam-card-head {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }
  .sam-card-head-icon {
    width: 13px;
    height: 13px;
    color: var(--card-accent, var(--primary));
  }
  .sam-card-head-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--card-accent, var(--primary));
  }
  .sam-card-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-strong);
    line-height: 1.35;
    margin-bottom: 3px;
  }
  .sam-card-meta {
    font-size: 10.5px;
    color: var(--text-weak);
  }
  .sam-card-bar {
    margin-top: 8px;
    height: 4px;
    border-radius: 999px;
    background: color-mix(in oklch, var(--foreground) 6%, transparent);
    overflow: hidden;
  }
  .sam-card-bar-fill {
    height: 100%;
    border-radius: 999px;
    background: var(--card-accent, var(--primary));
    opacity: 0.85;
  }

  /* ══════════════════════════════════════════
     COZY THEME — when [data-cozy="true"] is set on .sam-root, the
     entire mock retints to a warm tuxedo-cat palette and swaps in
     parallel "Mochi" content for the sidebar, body, and composer.
     This is the "personalize the whole app" demo: a single toggle
     drastically transforms every surface, not just one panel.
     ══════════════════════════════════════════ */
  .sam-root[data-cozy="true"] {
    background-color: #fbf2e1;
    background-image:
      radial-gradient(circle at 12% 22%, rgba(139, 105, 75, 0.08) 4px, transparent 5px),
      radial-gradient(circle at 28% 78%, rgba(139, 105, 75, 0.06) 3px, transparent 4px),
      radial-gradient(circle at 78% 28%, rgba(139, 105, 75, 0.07) 5px, transparent 6px),
      radial-gradient(circle at 88% 72%, rgba(139, 105, 75, 0.05) 3px, transparent 4px),
      radial-gradient(circle at 52% 52%, rgba(139, 105, 75, 0.04) 4px, transparent 5px),
      radial-gradient(120% 90% at 80% 0%, rgba(232, 154, 152, 0.18), transparent 60%),
      radial-gradient(90% 80% at 0% 100%, rgba(212, 134, 154, 0.12), transparent 55%),
      linear-gradient(135deg, #fef3e2, #f5e1c4);
    border-color: rgba(139, 105, 75, 0.25);
  }
  .sam-root[data-cozy="true"] .sam-main {
    border-color: rgba(139, 105, 75, 0.2);
  }

  /* SIDEBAR — cozy override. Hides default + workspace-rail, shows
     a warm-cream "Mochi's house" rail with cat-themed nav. */
  .sam-root[data-cozy="true"] .sam-sidebar {
    background: linear-gradient(180deg, #fef3e2 0%, #f4d9b8 100%);
    border-right: 1px solid rgba(139, 105, 75, 0.25);
    width: 184px;
  }
  .sam-root[data-cozy="true"] .sam-sidebar .sam-sidebar-default,
  .sam-root[data-cozy="true"] .sam-sidebar .sam-sidebar-modern { display: none; }
  .sam-sidebar-cozy {
    display: none;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 0;
    color: #5c3d2e;
    animation: samFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .sam-root[data-cozy="true"] .sam-sidebar .sam-sidebar-cozy { display: flex; }

  .sam-cozy-rail-header { height: 16px; flex-shrink: 0; }
  .sam-cozy-rail-brand {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 92px;
    padding: 0 14px;
  }
  .sam-cozy-rail-paw {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(calc(-50% - 38px), -50%);
    width: 36px;
    height: 36px;
    color: #1c1c1c;
    opacity: 0.85;
  }
  .sam-cozy-rail-name {
    color: #8b6240;
    font-family: var(--font-family-display, "Cormorant Garamond", Georgia, serif);
    font-size: 17px;
    font-weight: 600;
    font-style: italic;
    letter-spacing: 0.06em;
    line-height: 1;
  }
  .sam-cozy-rail-nav {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 0 12px 12px;
    flex: 1;
    min-height: 0;
  }
  .sam-cozy-rail-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    color: #5c3d2e;
    font-family: inherit;
    font-size: 13.5px;
    font-weight: 500;
  }
  .sam-cozy-rail-item.active {
    background: rgba(255, 252, 246, 0.6);
    color: #1c1c1c;
    font-weight: 600;
    box-shadow:
      inset 0 0 0 1px rgba(139, 105, 75, 0.2),
      0 1px 2px rgba(139, 105, 75, 0.1);
  }
  .sam-cozy-rail-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: #b8845c;
  }
  .sam-cozy-rail-item.active .sam-cozy-rail-icon { color: #d4869a; }
  .sam-cozy-rail-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-top: 1px solid rgba(139, 105, 75, 0.18);
  }
  .sam-cozy-rail-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1c1c1c;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    box-shadow: 0 0 0 2px rgba(255, 252, 246, 0.7);
  }
  .sam-cozy-rail-avatar svg { width: 100%; height: 100%; }
  .sam-cozy-rail-meta { display: flex; flex-direction: column; min-width: 0; }
  .sam-cozy-rail-meta-name {
    font-size: 12px;
    font-weight: 600;
    color: #1c1c1c;
    line-height: 1.2;
  }
  .sam-cozy-rail-meta-status {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #b8845c;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .sam-cozy-rail-pulse { display: none; }

  /* HEADER — cozy retint when also toggled to "Tabs". */
  .sam-root[data-cozy="true"] .sam-header[data-modern="true"] {
    background: rgba(254, 243, 226, 0.7);
    border-bottom: 1px solid rgba(139, 105, 75, 0.22);
  }
  .sam-root[data-cozy="true"] .sam-tab { color: #8b6240; }
  .sam-root[data-cozy="true"] .sam-tab:not(.active):hover {
    background: rgba(139, 105, 75, 0.06);
    color: #5c3d2e;
  }
  .sam-root[data-cozy="true"] .sam-tab.active {
    background: #fef3e2;
    color: #1c1c1c;
    border-color: rgba(139, 105, 75, 0.28);
  }
  .sam-root[data-cozy="true"] .sam-tab.active::before { background: #d4869a; }
  .sam-root[data-cozy="true"] .sam-tab-icon { color: #b8845c; }
  .sam-root[data-cozy="true"] .sam-tab.active .sam-tab-icon { color: #d4869a; }
  .sam-root[data-cozy="true"] .sam-tab-add {
    border-color: rgba(139, 105, 75, 0.28);
    color: #b8845c;
  }

  /* BODY — cozy override. Hides default home + cards dashboard, shows
     a warm "What can Mochi do for you today?" home. */
  .sam-root[data-cozy="true"] .sam-body .sam-body-default,
  .sam-root[data-cozy="true"] .sam-body .sam-cards { display: none; }
  .sam-body-cozy {
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 22px;
    width: 100%;
    max-width: 540px;
    flex: 1;
    animation: samFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .sam-root[data-cozy="true"] .sam-body .sam-body-cozy { display: flex; }
  .sam-cozy-home-title {
    font-family: var(--font-family-display, "Cormorant Garamond", Georgia, serif);
    font-size: clamp(1.4rem, 2.6vw, 2rem);
    font-weight: 450;
    font-style: italic;
    letter-spacing: -0.03em;
    line-height: 1.2;
    color: #5c3d2e;
    text-align: center;
    margin: 0;
    width: 100%;
  }
  .sam-cozy-home-categories {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .sam-cozy-home-category {
    padding: 6px 22px;
    min-width: 88px;
    text-align: center;
    background: rgba(255, 252, 246, 0.55);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(139, 105, 75, 0.25);
    border-radius: 999px;
    color: #8b6240;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
  }
  .sam-cozy-home-category.active {
    background: #fef3e2;
    color: #1c1c1c;
    border-color: rgba(139, 105, 75, 0.4);
    box-shadow: 0 1px 2px rgba(139, 105, 75, 0.15);
  }
  .sam-cozy-home-suggestions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    width: 100%;
    margin-top: 4px;
    padding: 0 24px;
  }
  .sam-cozy-home-suggestion {
    font-family: var(--font-family-display, "Cormorant Garamond", Georgia, serif);
    font-size: 16px;
    font-style: italic;
    font-weight: 500;
    color: #5c3d2e;
    line-height: 1.4;
    letter-spacing: -0.005em;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .sam-cozy-home-suggestion::before {
    content: "\\2767";
    color: #d4869a;
    font-style: normal;
    font-size: 11px;
    flex-shrink: 0;
    transform: translateY(-1px);
  }

  /* ══════════════════════════════════════════
     MUSIC STUDIO — full-bleed created-app body.

     When the user clicks "Create an app", the entire main column (header
     space, body, composer) becomes the studio app. We hide the composer
     row, drop the body's centered max-width, and let the studio fill
     edge-to-edge so it reads as a real, custom-built app inside Stella —
     not a small card pasted onto the home page.
     ══════════════════════════════════════════ */
  .sam-body[data-create-app="true"] .sam-body-default,
  .sam-body[data-create-app="true"] .sam-cards,
  .sam-body[data-create-app="true"] .sam-body-cozy { display: none; }

  /* Strip the body's centered padding so the studio can fill the whole
     main column; restore tasteful breathing room via the studio itself. */
  .sam-body[data-create-app="true"] {
    padding: 0;
    align-items: stretch;
    justify-content: stretch;
  }
  .sam-main:has(.sam-body[data-create-app="true"]) .sam-composer-wrap {
    display: none;
  }

  .sam-body-create {
    display: none;
    flex: 1;
    min-height: 0;
    width: 100%;
    animation: samFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .sam-body[data-create-app="true"] .sam-body-create { display: flex; }

  .sam-studio {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 0;
    width: 100%;
    background:
      radial-gradient(
        110% 60% at 50% 0%,
        color-mix(in oklch, var(--primary) 5%, transparent),
        transparent 70%
      ),
      var(--background);
    color: var(--text-base);
  }

  /* TOPBAR */
  .sam-studio-topbar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    padding: 22px 28px 18px;
    border-bottom: 1px solid var(--border-weak);
  }
  .sam-studio-identity { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .sam-studio-eyebrow {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--primary);
  }
  .sam-studio-name {
    margin: 0;
    font-family: var(--font-family-display, "Cormorant Garamond", Georgia, serif);
    font-style: italic;
    font-size: 28px;
    font-weight: 500;
    letter-spacing: -0.025em;
    line-height: 1;
    color: var(--text-strong);
  }
  .sam-studio-meta {
    display: flex;
    align-items: stretch;
    gap: 1px;
    background: var(--border-weak);
    border-radius: 10px;
    padding: 1px;
    overflow: hidden;
  }
  .sam-studio-meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
    padding: 7px 14px;
    background: var(--background);
    min-width: 56px;
  }
  .sam-studio-meta-label {
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-weaker);
  }
  .sam-studio-meta-value {
    font-family: var(--font-family-mono, ui-monospace, monospace);
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-strong);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
  }

  /* STAGE — arrange + inspector */
  .sam-studio-stage {
    display: grid;
    grid-template-columns: 1fr 200px;
    min-height: 0;
    overflow: hidden;
  }
  .sam-studio-arrange {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  .sam-studio-ruler {
    position: relative;
    display: flex;
    align-items: stretch;
    height: 26px;
    padding-left: 124px;
    border-bottom: 1px solid var(--border-weak);
    background: color-mix(in oklch, var(--foreground) 2.5%, transparent);
  }
  .sam-studio-ruler::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 124px;
    border-right: 1px solid var(--border-weak);
  }
  .sam-studio-ruler-tick {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    padding-left: 6px;
    border-left: 1px solid var(--border-weak);
    font-family: var(--font-family-mono, ui-monospace, monospace);
    font-size: 9.5px;
    font-weight: 600;
    color: var(--text-weaker);
    letter-spacing: 0.02em;
  }
  .sam-studio-ruler-tick:first-child { border-left: none; }
  .sam-studio-playhead {
    position: absolute;
    left: calc(124px + (100% - 124px) * 0.18);
    top: 0;
    bottom: 0;
    width: 1px;
    background: color-mix(in oklch, var(--primary) 75%, transparent);
    z-index: 3;
    pointer-events: none;
  }
  .sam-studio-playhead::before {
    content: "";
    position: absolute;
    top: 0;
    left: -3.5px;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background: var(--primary);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary) 18%, transparent);
  }

  .sam-studio-tracks {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .sam-studio-track {
    display: grid;
    grid-template-columns: 124px 1fr;
    align-items: stretch;
    border-bottom: 1px solid var(--border-weak);
    min-height: 0;
  }
  .sam-studio-track:last-child { border-bottom: none; }

  .sam-studio-track-head {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    align-items: center;
    column-gap: 8px;
    padding: 10px 12px;
    border-right: 1px solid var(--border-weak);
    background: color-mix(in oklch, var(--foreground) 1.5%, transparent);
  }
  .sam-studio-track-name {
    grid-column: 1;
    grid-row: 1;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-strong);
    letter-spacing: -0.005em;
  }
  .sam-studio-track-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--studio-accent);
    box-shadow: 0 0 0 2px color-mix(in oklch, var(--studio-accent) 22%, transparent);
    flex-shrink: 0;
  }
  .sam-studio-track-instrument {
    grid-column: 1;
    grid-row: 2;
    font-size: 9.5px;
    font-weight: 500;
    color: var(--text-weaker);
    letter-spacing: 0.01em;
  }
  .sam-studio-track-controls {
    grid-column: 2;
    grid-row: 1 / span 2;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .sam-studio-track-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid var(--border-strong);
    background: var(--background);
    font-family: var(--font-family-mono, ui-monospace, monospace);
    font-size: 9px;
    font-weight: 700;
    color: var(--text-weak);
    letter-spacing: 0.02em;
  }

  .sam-studio-lane {
    position: relative;
    min-height: 64px;
    overflow: hidden;
    background:
      linear-gradient(
        90deg,
        color-mix(in oklch, var(--foreground) 1%, transparent),
        transparent 35%
      );
  }
  .sam-studio-grid {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--border-weak);
    opacity: 0.6;
  }
  .sam-studio-region {
    position: absolute;
    top: 8px;
    bottom: 8px;
    border-radius: 6px;
    background: linear-gradient(
      180deg,
      color-mix(in oklch, var(--studio-accent) 22%, transparent),
      color-mix(in oklch, var(--studio-accent) 14%, transparent)
    );
    border: 1px solid color-mix(in oklch, var(--studio-accent) 38%, transparent);
    box-shadow:
      0 1px 0 color-mix(in oklch, white 22%, transparent) inset,
      0 4px 12px -8px color-mix(in oklch, var(--studio-accent) 50%, transparent);
    color: var(--studio-accent);
    overflow: hidden;
    transform-origin: left center;
    animation: samStudioRegion 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: var(--region-delay);
  }
  .sam-studio-region-wave {
    width: 100%;
    height: 100%;
    display: block;
  }

  /* INSPECTOR */
  .sam-studio-inspector {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 18px 18px 18px 16px;
    border-left: 1px solid var(--border-weak);
    background: color-mix(in oklch, var(--foreground) 2%, transparent);
    overflow: hidden;
  }
  .sam-studio-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--background);
    border: 1px solid var(--border-strong);
    box-shadow: var(--shadow-md);
  }
  .sam-studio-card-eyebrow {
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--primary);
  }
  .sam-studio-card-title {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-strong);
    line-height: 1.35;
    letter-spacing: -0.005em;
  }
  .sam-studio-card-prompt {
    font-family: var(--font-family-display, "Cormorant Garamond", Georgia, serif);
    font-style: italic;
    font-size: 13px;
    color: var(--text-weak);
    line-height: 1.35;
    letter-spacing: -0.005em;
  }

  .sam-studio-knobs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .sam-studio-knob {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .sam-studio-knob-dial {
    position: relative;
    width: 44px;
    height: 44px;
    color: var(--primary);
  }
  .sam-studio-knob-dial svg { width: 100%; height: 100%; display: block; }
  .sam-studio-knob-readout {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-family-mono, ui-monospace, monospace);
    font-size: 11px;
    font-weight: 600;
    color: var(--text-strong);
    font-variant-numeric: tabular-nums;
  }
  .sam-studio-knob-label {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-weak);
  }

  /* TRANSPORT */
  .sam-studio-transport {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 14px 28px;
    border-top: 1px solid var(--border-weak);
    background: color-mix(in oklch, var(--foreground) 2%, transparent);
  }
  .sam-studio-transport-controls {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .sam-studio-tx {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid var(--border-strong);
    background: var(--background);
    color: var(--text-base);
  }
  .sam-studio-tx--play {
    width: 40px;
    height: 40px;
    background: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
    box-shadow: 0 6px 18px color-mix(in oklch, var(--primary) 38%, transparent);
  }
  .sam-studio-time {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    font-family: var(--font-family-mono, ui-monospace, monospace);
    font-variant-numeric: tabular-nums;
    color: var(--text-strong);
    letter-spacing: -0.01em;
  }
  .sam-studio-time-now { font-size: 14px; font-weight: 600; }
  .sam-studio-time-sep { font-size: 12px; color: var(--text-weaker); }
  .sam-studio-time-total { font-size: 12px; font-weight: 500; color: var(--text-weak); }

  .sam-studio-meter {
    margin-left: auto;
    display: inline-flex;
    align-items: flex-end;
    gap: 2px;
    height: 22px;
    padding: 4px 8px;
    border-radius: 6px;
    background: color-mix(in oklch, var(--foreground) 4%, transparent);
    border: 1px solid var(--border-weak);
  }
  .sam-studio-meter-bar {
    width: 3px;
    height: var(--meter-h);
    border-radius: 1px;
    background: linear-gradient(
      0deg,
      color-mix(in oklch, var(--primary) 70%, transparent),
      color-mix(in oklch, var(--primary) 95%, transparent)
    );
    animation: samStudioMeter 1.4s ease-in-out infinite alternate;
  }
  .sam-studio-meter-bar:nth-child(2) { animation-delay: 0.08s; }
  .sam-studio-meter-bar:nth-child(3) { animation-delay: 0.16s; }
  .sam-studio-meter-bar:nth-child(4) { animation-delay: 0.24s; }
  .sam-studio-meter-bar:nth-child(5) { animation-delay: 0.32s; }
  .sam-studio-meter-bar:nth-child(6) { animation-delay: 0.40s; }
  .sam-studio-meter-bar:nth-child(7) { animation-delay: 0.48s; }
  .sam-studio-meter-bar:nth-child(8) { animation-delay: 0.56s; }

  @keyframes samStudioRegion {
    from { transform: scaleX(0.6); opacity: 0; }
    to   { transform: scaleX(1);   opacity: 1; }
  }
  @keyframes samStudioMeter {
    0%   { transform: scaleY(0.45); transform-origin: bottom; }
    100% { transform: scaleY(1);    transform-origin: bottom; }
  }

  @media (prefers-reduced-motion: reduce) {
    .sam-studio-region,
    .sam-studio-meter-bar { animation: none; }
  }

  /* All pills share the same blue-gradient styling for visual
     consistency — see the unified .sam-pill block further down. */

  /* ──────────────────────────────────────────
     COMPOSER — default: pill input mirroring
     '.composer-shell' (border-radius: 999px).
     ────────────────────────────────────────── */
  .sam-composer-wrap {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    padding: 8px 24px 16px;
    width: 100%;
  }
  .sam-composer {
    width: 100%;
    max-width: 480px;
    background: var(--background);
    border-radius: 999px;
    box-shadow: var(--shadow-md);
    transition: border-radius 0.3s ease;
    overflow: hidden;
  }
  .sam-composer-form {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    min-height: 50px;
    padding: 8px 10px;
  }
  .sam-composer-add {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid color-mix(in oklch, var(--text-base) 28%, transparent);
    background: color-mix(in oklch, var(--foreground) 4%, transparent);
    color: var(--text-base);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .sam-composer-input {
    flex: 1;
    padding: 4px 4px;
    font-family: inherit;
    font-size: 13.5px;
    color: var(--text-strong);
  }
  .sam-composer-input-placeholder {
    color: var(--text-weaker);
    opacity: 0.85;
  }
  .sam-composer-submit {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--primary);
    color: var(--primary-foreground);
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    opacity: 0.45;
  }

  /* ══════════════════════════════════════════
     COZY MODE — a single contemplative scene.

     When the user picks the cozy pill, Stella drops the chat shell
     entirely. No header, no chips, no compose bar, no cards. The
     window becomes a late-afternoon room: warm dusk wash, slow rain
     across the glass, a tuxedo cat asleep in a pool of lamp light.
     The transformation IS the demo — it should look nothing like the
     rest of the app, and nothing like a dashboard.
     ══════════════════════════════════════════ */
  .sam-mochi {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: none;
    overflow: hidden;
    border-radius: 12px;
    color: #f1f2f5;
    font-family: var(--font-family-sans, system-ui);
    background:
      radial-gradient(95% 70% at 78% 105%, rgba(255, 255, 255, 0.08), transparent 60%),
      radial-gradient(70% 60% at 12% -10%, rgba(255, 255, 255, 0.05), transparent 65%),
      linear-gradient(168deg, #2a2c33 0%, #1b1d22 55%, #0c0d10 100%);
  }
  .sam-root[data-cozy="true"] .sam-mochi {
    display: block;
    animation: samMochiIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  /* When cozy is on, hide the chat shell so the transformation reads
     as "different app", not "same app retinted." */
  .sam-root[data-cozy="true"] .sam-body-row > .sam-sidebar,
  .sam-root[data-cozy="true"] .sam-body-row > .sam-main {
    visibility: hidden;
  }

  /* LAMP — cool silver pool of moonlight behind the cat. */
  .sam-mochi__lamp {
    position: absolute;
    right: -10%;
    bottom: -22%;
    width: 78%;
    aspect-ratio: 1;
    pointer-events: none;
    background: radial-gradient(
      circle at center,
      rgba(240, 244, 252, 0.22) 0%,
      rgba(200, 210, 225, 0.1) 32%,
      transparent 60%
    );
    filter: blur(2px);
  }

  /* RAIN — slow cool streaks down the window. */
  .sam-mochi__rain {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.45;
  }
  .sam-mochi__drop {
    position: absolute;
    top: -12%;
    left: calc(6% + var(--drop-i) * 6.6%);
    width: 1px;
    height: 32px;
    background: linear-gradient(
      180deg,
      transparent,
      rgba(232, 238, 248, 0.6)
    );
    border-radius: 1px;
    animation: samMochiRain 5.4s linear infinite;
    animation-delay: calc(var(--drop-i) * -0.31s);
  }

  /* HEADER — brand left, minimalist text nav top-right. No chrome. */
  .sam-mochi__header {
    position: absolute;
    top: 22px;
    left: 32px;
    right: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    z-index: 3;
  }
  .sam-mochi__brand {
    font-family: var(--font-family-display, "Cormorant Garamond", Georgia, serif);
    font-style: italic;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #f5f6f9;
  }
  .sam-mochi__nav {
    display: inline-flex;
    align-items: center;
    gap: 22px;
  }
  .sam-mochi__nav-item {
    font-size: 12.5px;
    font-weight: 500;
    letter-spacing: -0.005em;
    color: rgba(245, 246, 249, 0.55);
    transition: color 120ms ease;
  }
  .sam-mochi__nav-item.is-active {
    color: #f5f6f9;
    font-weight: 600;
  }

  /* COPY — oversized italic headline anchored mid-left. */
  .sam-mochi__copy {
    position: absolute;
    left: 40px;
    bottom: 130px;
    max-width: min(58%, 520px);
    display: flex;
    flex-direction: column;
    gap: 18px;
    z-index: 2;
  }
  .sam-mochi__headline {
    margin: 0;
    font-family: var(--font-family-display, "Cormorant Garamond", Georgia, serif);
    font-style: italic;
    font-weight: 300;
    font-size: clamp(2.6rem, 5.4vw, 4.4rem);
    line-height: 0.95;
    letter-spacing: -0.035em;
    color: #f5f6f9;
    display: flex;
    flex-direction: column;
  }
  .sam-mochi__headline-em {
    color: rgba(245, 246, 249, 0.62);
  }
  .sam-mochi__sub {
    margin: 0;
    font-size: 14px;
    line-height: 1.55;
    color: rgba(245, 246, 249, 0.62);
    max-width: 32ch;
  }

  /* CAT — anchored bottom-right inside the silver pool. */
  .sam-mochi__cat {
    position: absolute;
    right: -2%;
    bottom: 70px;
    width: 46%;
    max-width: 540px;
    pointer-events: none;
    z-index: 1;
    filter: drop-shadow(0 24px 22px rgba(0, 0, 0, 0.5));
  }
  .sam-mochi__cat svg {
    width: 100%;
    height: auto;
    display: block;
  }

  /* COMPOSE — ChatGPT-style centered input with attach + send. */
  .sam-mochi__compose {
    position: absolute;
    left: 50%;
    bottom: 22px;
    transform: translateX(-50%);
    width: min(640px, calc(100% - 64px));
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 8px 8px 12px;
    border-radius: 24px;
    background: rgba(28, 30, 36, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.06) inset,
      0 14px 36px -20px rgba(0, 0, 0, 0.7),
      0 2px 6px -2px rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(14px) saturate(140%);
    z-index: 3;
  }
  .sam-mochi__compose-attach {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: transparent;
    color: rgba(245, 246, 249, 0.7);
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 400;
    line-height: 1;
    cursor: default;
  }
  .sam-mochi__compose-input {
    flex: 1;
    padding: 6px 6px 6px 4px;
    font-family: var(--font-family-sans, system-ui);
    font-size: 14px;
    color: #f5f6f9;
  }
  .sam-mochi__compose-placeholder { color: rgba(245, 246, 249, 0.45); }
  .sam-mochi__compose-send {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #f5f6f9;
    color: #0a0a0a;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.6);
  }

  @keyframes samMochiIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes samMochiRain {
    0%   { transform: translateY(0); opacity: 0; }
    8%   { opacity: 1; }
    92%  { opacity: 1; }
    100% { transform: translateY(120vh); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .sam-mochi,
    .sam-mochi__drop { animation: none; }
  }

  /* ══════════════════════════════════════════
     PILL OVERLAY (interactive mode)
     ══════════════════════════════════════════ */
  /* Pills share the codex-frame blue so they read as "click me"
     affordances, but the surface stays flat — no inset highlight, no
     radial sheen, no chunky drop shadow. Active state is a slightly
     darker fill plus a soft outer ring. */
  .sam-pill {
    position: absolute;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.45);
    background: #2d7fd6;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    user-select: none;
    z-index: 30;
    box-shadow:
      0 4px 14px rgba(18, 70, 150, 0.22),
      0 1px 2px rgba(18, 70, 150, 0.16);
    animation: samPillIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    transition:
      background 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.18s ease;
  }
  .sam-pill:hover {
    background: #2070c4;
    border-color: rgba(255, 255, 255, 0.7);
    transform: translateY(-1px);
  }
  .sam-pill[data-active="true"] {
    background: #1a5fb0;
    border-color: rgba(255, 255, 255, 0.85);
    box-shadow:
      0 4px 16px rgba(18, 70, 150, 0.28),
      0 0 0 3px rgba(45, 127, 214, 0.22);
  }
  .sam-pill-icon { display: inline-flex; color: rgba(255, 255, 255, 0.92); }
  .sam-pill[data-active="true"] .sam-pill-icon { color: #fff; }
  .sam-pill-label { line-height: 1; white-space: nowrap; }
  .sam-pill-check {
    display: inline-flex;
    width: 0;
    overflow: hidden;
    transition: width 0.25s ease, margin 0.25s ease;
  }
  .sam-pill[data-active="true"] .sam-pill-check {
    width: 14px;
    margin-left: 2px;
  }

  /* Pill positions */
  .sam-pill[data-section="sidebar"]    { top: 12px; left: 184px;  animation-delay: 0.05s; }
  .sam-pill[data-section="header"]     { top: 12px; right: 16px;  animation-delay: 0.12s; }
  .sam-pill[data-section="messages"]   { top: calc(50% - 16px); right: 18px; animation-delay: 0.18s; }
  .sam-pill[data-section="createApp"]  { top: calc(50% - 16px); left: 184px; animation-delay: 0.22s; }
  .sam-pill[data-section="composer"]   { bottom: 24px; left: 30%; animation-delay: 0.28s; }

  /* No repeat attention pulse on the first pill (samPillAttention removed). */

  /* ══════════════════════════════════════════
     ANIMATIONS
     ══════════════════════════════════════════ */
  @keyframes samFadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes samPillIn {
    from { opacity: 0; transform: translateY(-4px) scale(0.92); }
    to   { opacity: 0.95; transform: translateY(0) scale(1); }
  }
  /* Cat breathe + tail-sway, scoped to the cozy takeover. */
  .sam-mochi__cat .sam-cozy-cat-body {
    transform-origin: 90px 100px;
    animation: samCozyBreathe 3.6s ease-in-out infinite;
  }
  .sam-mochi__cat .sam-cozy-cat-tail {
    transform-origin: 140px 100px;
    animation: samCozyTail 3.6s ease-in-out infinite;
  }
  @keyframes samCozyTail {
    0%, 100% { transform: rotate(0deg); }
    50%      { transform: rotate(-3deg); }
  }
  @keyframes samCozyBreathe {
    0%, 100% { transform: scaleY(1); }
    50%      { transform: scaleY(1.04); }
  }

  @media (prefers-reduced-motion: reduce) {
    .sam-mochi__cat .sam-cozy-cat-body,
    .sam-mochi__cat .sam-cozy-cat-tail { animation: none; }
    .sam-pill,
    .sam-cards,
    .sam-sidebar-modern { animation: none; }
  }
`;

/* Default suggestions (rendered when `messages` toggle is OFF). Mirror the
 * `Stella` category from `HomeContent.DEFAULT_CATEGORIES`. */
const HOME_SUGGESTIONS: string[] = [
  "Add a music player to home",
  "Change my theme to dark",
  "Build me a budget tracker app",
  "Make me sound more casual",
];

/* Cards rendered when `messages` toggle is ON. */
const CARDS = [
  {
    label: "Inbox",
    title: "3 unread, 1 needs reply",
    meta: "Alex \u00b7 design review moved",
    accent: "var(--primary)",
    progress: 0.4,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v16H4z" />
        <path d="M4 4l8 8 8-8" />
      </svg>
    ),
  },
  {
    label: "Calendar",
    title: "Design review \u00b7 Thu 2pm",
    meta: "in 2 days \u00b7 4 attendees",
    accent: "oklch(0.65 0.18 200)",
    progress: 0.7,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    label: "Tasks",
    title: "Ship onboarding rework",
    meta: "due today \u00b7 67% done",
    accent: "oklch(0.65 0.16 150)",
    progress: 0.67,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    label: "Focus",
    title: "Deep work \u00b7 22:14 left",
    meta: "session 2 of 4",
    accent: "oklch(0.7 0.18 60)",
    progress: 0.55,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l3 2" />
      </svg>
    ),
  },
] as const;

const CHECK_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* Stella brand glyph — small inline mark so the sidebar reads as Stella
 * even when running outside the bundled assets pipeline. */
const STELLA_GLYPH = (
  <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none">
    <path
      d="M16 2 L19 13 L30 16 L19 19 L16 30 L13 19 L2 16 L13 13 Z"
      fill="currentColor"
      opacity="0.85"
    />
  </svg>
);

const HOME_CATEGORIES = ["Stella", "Task", "Explore", "Schedule"] as const;

/* Tabs rendered when the `header` toggle is ON. Reads as a multi-context
 * workspace where Stella keeps several conversations/apps alive at once. */
const TAB_ICON = (d: string) => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);
const TABS: { label: string; icon: ReactNode; active?: boolean }[] = [
  {
    label: "Home",
    active: true,
    icon: TAB_ICON("M3 10l9-7 9 7M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10"),
  },
  {
    label: "Trip plan",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 16l20-7-7 13-3-6-10-0z" />
      </svg>
    ),
  },
  {
    label: "Now playing",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    label: "Budget",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 15l4-5 3 3 5-7" />
      </svg>
    ),
  },
];

/* ──────────────────────────────────────────────────────────────────────
 * Cozy theme content. When the user clicks the "Cozy mode" pill, the
 * ENTIRE mock retints into a tuxedo-cat themed personalization — to
 * showcase that Stella can transform the whole app, not just one panel.
 * The data below drives the cozy sidebar (cat-themed nav) and the cozy
 * home content. The composer's sleeping cat scene is defined separately.
 * ────────────────────────────────────────────────────────────────────── */
const cozyIconStroke = (children: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);
const COZY_ICON_PAW = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="17" rx="4.2" ry="3.6" />
    <ellipse cx="6" cy="11.5" rx="2" ry="2.6" />
    <ellipse cx="18" cy="11.5" rx="2" ry="2.6" />
    <ellipse cx="9" cy="6.5" rx="1.8" ry="2.4" />
    <ellipse cx="15" cy="6.5" rx="1.8" ry="2.4" />
  </svg>
);
const COZY_ICON_MOON = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const COZY_ICON_FISH = cozyIconStroke(
  <>
    <circle cx="6" cy="12" r="2" />
    <path d="M8 12 L18 12" />
    <path d="M11 9.5 L11 14.5 M14 9.5 L14 14.5 M17 10.5 L17 13.5" />
    <path d="M18 12 L21 9 M18 12 L21 15" />
  </>,
);
const COZY_ICON_YARN = cozyIconStroke(
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M5 9c4 4 10 4 14 0M5 15c4-4 10-4 14 0M9 5c4 4 4 10 0 14M15 5c-4 4-4 10 0 14" />
  </>,
);
const COZY_ICON_HEART = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21l-1.4-1.3C5.4 15.4 2 12.3 2 8.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 10 3.5c0 3.8-3.4 6.9-8.6 11.2L12 21z" />
  </svg>
);

const COZY_NAV: { label: string; icon: ReactNode; active?: boolean }[] = [
  { label: "Home", icon: COZY_ICON_PAW, active: true },
  { label: "Naps", icon: COZY_ICON_MOON },
  { label: "Treats", icon: COZY_ICON_FISH },
  { label: "Play", icon: COZY_ICON_YARN },
  { label: "Cuddles", icon: COZY_ICON_HEART },
];

const COZY_HOME_CATEGORIES = ["Mochi", "Calm", "Cozy", "Cute"] as const;

/* "Music Studio" — created-app body. The waveform points are deterministic
 * so re-renders settle on the same shape; this lets the surface read as a
 * finished track instead of random noise. Each track has multiple regions
 * arranged along an 8-bar timeline, drawn as filled clips with a SVG
 * waveform inside — same vocabulary as Logic / Ableton / GarageBand. */
type StudioRegion = { start: number; length: number; points: number[] };
type StudioTrack = {
  label: string;
  instrument: string;
  color: string;
  regions: StudioRegion[];
};

const STUDIO_TRACKS: StudioTrack[] = [
  {
    label: "Drums",
    instrument: "Kit · Analog",
    color: "#0f62fe",
    regions: [
      { start: 0, length: 4, points: [50, 80, 30, 90, 45, 85, 35, 95, 50, 80, 30, 88, 42, 90, 35, 92] },
      { start: 4, length: 4, points: [55, 82, 32, 88, 48, 86, 38, 94, 52, 78, 34, 90, 44, 92, 38, 95] },
    ],
  },
  {
    label: "Bass",
    instrument: "Sub · Mono",
    color: "#9c5bff",
    regions: [
      { start: 0, length: 6, points: [55, 60, 65, 70, 60, 55, 50, 60, 70, 75, 65, 55, 50, 60, 70, 65] },
    ],
  },
  {
    label: "Pads",
    instrument: "Strings · Soft",
    color: "#37c2a4",
    regions: [
      { start: 1, length: 3, points: [40, 45, 50, 55, 60, 58, 55, 52, 50, 48, 50, 55, 58, 60, 55, 50] },
      { start: 4, length: 4, points: [45, 50, 55, 60, 65, 62, 58, 55, 52, 50, 52, 55, 58, 60, 58, 55] },
    ],
  },
  {
    label: "Lead",
    instrument: "Synth · Lyrical",
    color: "#ff8a4c",
    regions: [
      { start: 2, length: 2, points: [30, 60, 80, 70, 50, 70, 85, 60, 40, 65, 80, 70, 50, 60, 75, 55] },
      { start: 5, length: 3, points: [40, 70, 85, 75, 55, 65, 80, 70, 45, 60, 75, 80, 60, 50, 70, 65] },
    ],
  },
];

const STUDIO_BARS = 8;

const COZY_HOME_SUGGESTIONS: string[] = [
  "Set a quiet hour while Mochi naps",
  "Schedule Mochi's next vet visit",
  "Play soft rainfall sounds tonight",
  "Remind me to refill Mochi's water",
];

/* Tiny cat avatar used in the cozy sidebar footer — a simple tuxedo
 * face so the rail clearly belongs to a single, beloved cat. */
const COZY_AVATAR = (
  <svg viewBox="0 0 32 32" fill="#1c1c1c">
    <ellipse cx="16" cy="20" rx="11" ry="9" />
    <path d="M9 12 L7 4 L14 11 Z" />
    <path d="M23 12 L25 4 L18 11 Z" />
    <ellipse cx="16" cy="22" rx="6" ry="4.5" fill="white" />
    <path d="M11 18 Q12 16 13 18" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" />
    <path d="M19 18 Q20 16 21 18" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" />
    <path d="M14.5 21 L17.5 21 L16 22.5 Z" fill="#e89a98" />
  </svg>
);

/* Sleeping tuxedo cat illustration shown in cozy mode. Hand-drawn so the
 * mock feels personal and "drastic" — a true vibe shift from the default
 * pill composer rather than another utilitarian variation. */
const COZY_CAT_SVG = (
  <svg viewBox="0 0 180 140" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="samCatBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2E303F" />
        <stop offset="100%" stopColor="#14151B" />
      </linearGradient>
      <linearGradient id="samCatBelly" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F5F6F9" />
      </linearGradient>
      <linearGradient id="samCatInner" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F4D3D2" />
        <stop offset="100%" stopColor="#E2A6A4" />
      </linearGradient>
      <filter id="samCatShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="3"
          stdDeviation="4"
          floodColor="#0D0E12"
          floodOpacity="0.15"
        />
      </filter>
    </defs>

    <g className="sam-cozy-cat-tail">
      {/* Sleek wrapping tail */}
      <path
        d="M 135 98 C 158 98 168 114 154 124 C 142 129 116 129 96 129 L 65 129"
        stroke="url(#samCatBody)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Subtle tail tip highlight */}
      <path
        d="M 75 129 L 60 129"
        stroke="url(#samCatBelly)"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
    </g>

    <g className="sam-cozy-cat-body">
      {/* Sleek, flowing body silhouette */}
      <path
        d="M 52 116 C 36 98 42 78 68 70 C 88 64 112 60 132 72 C 148 82 152 102 142 118 C 134 124 115 124 95 123 C 75 122 58 121 52 116 Z"
        fill="url(#samCatBody)"
      />

      {/* Elegant cream chest patch */}
      <path
        d="M 52 110 C 48 95 58 85 75 85 C 88 85 92 98 92 110 C 92 118 78 119 65 118 C 56 117 53 113 52 110 Z"
        fill="url(#samCatBelly)"
      />

      {/* Tucked minimal paws */}
      <rect
        x="50"
        y="112"
        width="14"
        height="8"
        rx="4"
        fill="url(#samCatBelly)"
      />
      <rect
        x="70"
        y="112"
        width="14"
        height="8"
        rx="4"
        fill="url(#samCatBelly)"
      />

      {/* Head Group with sleek ears & face */}
      <g transform="translate(17.5, 23) scale(0.75)">
        {/* Sleek ears */}
        <path d="M 42 53 C 38 20 48 18 58 42 Z" fill="url(#samCatBody)" />
        <path d="M 45 49 C 42 25 49 23 55 39 Z" fill="url(#samCatInner)" />

        <path d="M 98 53 C 102 20 92 18 82 42 Z" fill="url(#samCatBody)" />
        <path d="M 95 49 C 98 25 91 23 85 39 Z" fill="url(#samCatInner)" />

        {/* Head Base with Soft Shadow */}
        <g filter="url(#samCatShadow)">
          <circle cx="70" cy="65" r="31" fill="url(#samCatBody)" />

          {/* Minimal cream mask */}
          <path
            d="M 70 48 C 62 60 52 70 44 76 C 54 90 86 90 96 76 C 88 70 78 60 70 48 Z"
            fill="url(#samCatBelly)"
          />

          {/* Serene sleeping eyes (ultra-fine lines) */}
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

          {/* Tiny clean nose */}
          <path d="M 68 78 L 72 78 L 70 81 Z" fill="url(#samCatInner)" />

          {/* Soft elegant whiskers (fine, high transparency) */}
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

export function StellaAppMock({
  interactive = false,
  toggles: controlledToggles,
  onToggleSection,
}: {
  interactive?: boolean;
  /** When provided, the component runs as a controlled component. */
  toggles?: SectionToggles;
  /** Required when `toggles` is controlled; otherwise internal state is used. */
  onToggleSection?: (section: SectionKey) => void;
}) {
  const [internalToggles, setInternalToggles] =
    useState<SectionToggles>(EMPTY_SECTION_TOGGLES);

  const isControlled = controlledToggles !== undefined;
  const toggles = controlledToggles ?? internalToggles;

  const toggleSection = useCallback(
    (section: SectionKey) => {
      if (isControlled) {
        onToggleSection?.(section);
        return;
      }
      setInternalToggles((prev) => ({ ...prev, [section]: !prev[section] }));
    },
    [isControlled, onToggleSection],
  );

  const anyActive = Object.values(toggles).some(Boolean);

  return (
    <>
      <style>{css}</style>
      <div
        className="sam-root"
        data-interactive={interactive || undefined}
        data-any-active={interactive ? String(anyActive) : undefined}
        data-cozy={toggles.composer || undefined}
        data-create-app={toggles.createApp || undefined}
      >
        {/* TOP SHELL BAR — traffic lights + sidebar/back/forward
            (left) and panel toggle (right), same chrome as the real
            desktop app's ShellTopBar. */}
        <div className="sam-topbar" aria-hidden="true">
          <span className="sam-traffic">
            <span className="sam-traffic-dot" style={{ ["--c" as string]: "#ff5f57" }} />
            <span className="sam-traffic-dot" style={{ ["--c" as string]: "#febc2e" }} />
            <span className="sam-traffic-dot" style={{ ["--c" as string]: "#28c840" }} />
          </span>
          <span className="sam-topbar-icon-btn" title="Toggle sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16" />
            </svg>
          </span>
          <span className="sam-topbar-icon-btn sam-topbar-icon-btn--disabled">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </span>
          <span className="sam-topbar-icon-btn sam-topbar-icon-btn--disabled">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
          <span className="sam-topbar-spacer" />
          <span className="sam-topbar-right">
            <span className="sam-topbar-icon-btn" title="Toggle panel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M15 4v16" />
              </svg>
            </span>
          </span>
        </div>

        <div className="sam-body-row">
        {/* SIDEBAR ─────────────────────────────────────────────── */}
        <aside
          className="sam-sidebar"
          data-modern={toggles.sidebar || undefined}
        >
          <div className="sam-sidebar-default">
            <div className="sam-sidebar-header" />
            {/* Brand: small logo on the left + italic "Stella" wordmark,
                matching `desktop/src/shell/sidebar/sidebar.css`. */}
            <div className="sam-sidebar-brand">
              <span className="sam-sidebar-brand-logo" aria-hidden="true">
                <img src="/stella-logo.svg" alt="" />
              </span>
              <span className="sam-sidebar-brand-text">Stella</span>
            </div>
            <nav className="sam-sidebar-nav">
              <button type="button" className="sam-nav-item sam-nav-item--home">
                <span className="sam-nav-icon">{ICON_HOUSE}</span>
                <span>Home</span>
              </button>
              <button type="button" className="sam-nav-item">
                <span className="sam-nav-icon">{ICON_USERS}</span>
                <span>Social</span>
              </button>
              <button type="button" className="sam-nav-item sam-nav-item--studio">
                <span className="sam-nav-icon">{ICON_MUSIC}</span>
                <span>Music</span>
                <span className="sam-nav-item-tag" aria-hidden="true">New</span>
              </button>
            </nav>
            <div className="sam-sidebar-footer">
              <button type="button" className="sam-nav-item">
                <span className="sam-nav-icon">{ICON_STORE}</span>
                <span>Store</span>
              </button>
              <button type="button" className="sam-nav-item">
                <span className="sam-nav-icon">{ICON_SETTINGS}</span>
                <span>Settings</span>
              </button>
              <div className="sam-account-row">
                <span className="sam-avatar" aria-hidden="true">A</span>
                <span className="sam-account-pill">Upgrade</span>
              </div>
            </div>
          </div>

          <div className="sam-sidebar-modern">
            <div className="sam-modern-search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <span>Search anything</span>
              <span className="sam-modern-search-kbd">{"\u2318K"}</span>
            </div>
            <div className="sam-modern-section">Workspace</div>
            <div className="sam-modern-item active">
              <svg className="sam-modern-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10l9-7 9 7M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" />
              </svg>
              <span>Home</span>
              <span className="sam-modern-item-badge">3</span>
            </div>
            <div className="sam-modern-item">
              <svg className="sam-modern-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <span>Projects</span>
            </div>
            <div className="sam-modern-item">
              <svg className="sam-modern-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 9h18M8 3v4M16 3v4" />
              </svg>
              <span>Calendar</span>
            </div>
            <div className="sam-modern-section">Memory</div>
            <div className="sam-modern-item">
              <svg className="sam-modern-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>Recent</span>
            </div>
            <div className="sam-modern-item">
              <svg className="sam-modern-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21l-1.4-1.3C5.4 15.4 2 12.3 2 8.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 10 3.5c0 3.8-3.4 6.9-8.6 11.2L12 21z" />
              </svg>
              <span>Pinned</span>
            </div>
            <div className="sam-modern-spacer" />
            <div className="sam-modern-item">
              <svg className="sam-modern-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008 19.4l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 005.6 15a1.65 1.65 0 00-1.51-1H4a2 2 0 010-4h.09A1.65 1.65 0 005.6 9 1.65 1.65 0 005.27 7.18l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6 1.65 1.65 0 0010 3.09V3a2 2 0 014 0v.09c0 .67.39 1.27 1 1.51.6.25 1.31.11 1.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.25.6.85 1 1.51 1H21a2 2 0 010 4h-.09c-.67 0-1.27.39-1.51 1z" />
              </svg>
              <span>Settings</span>
            </div>
          </div>

          <div className="sam-sidebar-cozy">
            <div className="sam-cozy-rail-header" />
            <div className="sam-cozy-rail-brand">
              <span className="sam-cozy-rail-paw" aria-hidden="true">
                {COZY_ICON_PAW}
              </span>
              <span className="sam-cozy-rail-name">Mochi</span>
            </div>
            <nav className="sam-cozy-rail-nav">
              {COZY_NAV.map((item) => (
                <div
                  key={item.label}
                  className={`sam-cozy-rail-item${item.active ? " active" : ""}`}
                >
                  <span className="sam-cozy-rail-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </nav>
            <div className="sam-cozy-rail-footer">
              <span className="sam-cozy-rail-avatar" aria-hidden="true">
                {COZY_AVATAR}
              </span>
              <div className="sam-cozy-rail-meta">
                <div className="sam-cozy-rail-meta-name">Mochi</div>
                <div className="sam-cozy-rail-meta-status">
                  <span className="sam-cozy-rail-pulse" />
                  Purring
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN COLUMN ─────────────────────────────────────────── */}
        <div className="sam-main">
          {/* HEADER (only visible when modern) */}
          <div
            className="sam-header"
            data-modern={toggles.header || undefined}
          >
            <div className="sam-tabs">
              {TABS.map((tab) => (
                <div
                  key={tab.label}
                  className={`sam-tab${tab.active ? " active" : ""}`}
                >
                  <span className="sam-tab-icon">{tab.icon}</span>
                  <span className="sam-tab-label">{tab.label}</span>
                </div>
              ))}
              <button
                type="button"
                className="sam-tab-add"
                aria-label="New tab"
              >
                +
              </button>
            </div>
          </div>

          {/* BODY */}
          <div
            className="sam-body"
            data-modern={toggles.messages || undefined}
            data-create-app={toggles.createApp || undefined}
          >
            <div className="sam-body-default">
              {/* {title, context chips, composer} are clustered and
                  vertically centered in the column. The footer pills
                  remain pinned to the bottom via their own margin. */}
              <div className="sam-home-cluster">
                <h1 className="sam-home-title">
                  What can I do for you today?
                </h1>

                {/* Auto-detected context chips (active window / tab)
                    sit directly above the composer, matching the real
                    home content's `ComposerContextRow`. */}
                <div className="sam-home-context" aria-hidden="true">
                  <span className="sam-home-chip">
                    <span className="sam-home-chip-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="14" rx="2" />
                        <path d="M3 9h18" />
                      </svg>
                    </span>
                    <span className="sam-home-chip-label">Chrome</span>
                    <span className="sam-home-chip-meta">Pricing — Linear</span>
                  </span>
                  <span className="sam-home-chip">
                    <span className="sam-home-chip-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="3" width="16" height="18" rx="2" />
                        <path d="M8 7h8M8 11h8M8 15h5" />
                      </svg>
                    </span>
                    <span className="sam-home-chip-label">Notion</span>
                    <span className="sam-home-chip-meta">Q3 launch plan</span>
                  </span>
                </div>

                <div className="sam-home-composer">
                  <span className="sam-composer-add" aria-hidden="true">
                    {ICON_PLUS}
                  </span>
                  <span className="sam-composer-input">
                    <span className="sam-composer-input-placeholder">
                      Ask me anything...
                    </span>
                  </span>
                  <span className="sam-composer-submit" aria-hidden="true">
                    {ICON_SEND}
                  </span>
                </div>
              </div>

              {/* Plain-text category footer pills — no boxy chrome, no
                  inline suggestion list, matches `home-ideas-footer`. */}
              <div className="sam-home-footer-pills">
                {HOME_CATEGORIES.map((label) => (
                  <span key={label} className="sam-home-footer-pill">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="sam-cards">
              {CARDS.map((card) => (
                <div
                  key={card.label}
                  className="sam-card"
                  style={{ ["--card-accent" as string]: card.accent }}
                >
                  <div className="sam-card-head">
                    <span className="sam-card-head-icon">{card.icon}</span>
                    <span className="sam-card-head-label">{card.label}</span>
                  </div>
                  <div className="sam-card-title">{card.title}</div>
                  <div className="sam-card-meta">{card.meta}</div>
                  <div className="sam-card-bar">
                    <div
                      className="sam-card-bar-fill"
                      style={{ width: `${Math.round(card.progress * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="sam-body-create" aria-hidden={!toggles.createApp}>
              <div className="sam-studio">
                {/* TOPBAR — project identity, transport-adjacent meta. */}
                <div className="sam-studio-topbar">
                  <div className="sam-studio-identity">
                    <span className="sam-studio-eyebrow">Built just now</span>
                    <h2 className="sam-studio-name">Untitled Track</h2>
                  </div>
                  <div className="sam-studio-meta">
                    <div className="sam-studio-meta-item">
                      <span className="sam-studio-meta-label">Tempo</span>
                      <span className="sam-studio-meta-value">120</span>
                    </div>
                    <div className="sam-studio-meta-item">
                      <span className="sam-studio-meta-label">Sig</span>
                      <span className="sam-studio-meta-value">4 / 4</span>
                    </div>
                    <div className="sam-studio-meta-item">
                      <span className="sam-studio-meta-label">Key</span>
                      <span className="sam-studio-meta-value">C maj</span>
                    </div>
                  </div>
                </div>

                {/* TIMELINE + INSPECTOR */}
                <div className="sam-studio-stage">
                  <div className="sam-studio-arrange">
                    <span className="sam-studio-playhead" aria-hidden="true" />
                    {/* Bar ruler */}
                    <div className="sam-studio-ruler">
                      {Array.from({ length: STUDIO_BARS }).map((_, i) => (
                        <span key={i} className="sam-studio-ruler-tick">
                          <span>{i + 1}</span>
                        </span>
                      ))}
                    </div>

                    {/* Tracks */}
                    <div className="sam-studio-tracks">
                      {STUDIO_TRACKS.map((track, trackIdx) => (
                        <div
                          key={track.label}
                          className="sam-studio-track"
                          style={{ ["--studio-accent" as string]: track.color }}
                        >
                          <div className="sam-studio-track-head">
                            <span className="sam-studio-track-name">
                              <span className="sam-studio-track-dot" />
                              {track.label}
                            </span>
                            <span className="sam-studio-track-instrument">
                              {track.instrument}
                            </span>
                            <div className="sam-studio-track-controls" aria-hidden="true">
                              <span className="sam-studio-track-chip">M</span>
                              <span className="sam-studio-track-chip">S</span>
                            </div>
                          </div>
                          <div className="sam-studio-lane">
                            {Array.from({ length: STUDIO_BARS - 1 }).map((_, i) => (
                              <span
                                key={i}
                                className="sam-studio-grid"
                                style={{ left: `${((i + 1) / STUDIO_BARS) * 100}%` }}
                              />
                            ))}
                            {track.regions.map((region, regionIdx) => (
                              <span
                                key={regionIdx}
                                className="sam-studio-region"
                                style={{
                                  left: `${(region.start / STUDIO_BARS) * 100}%`,
                                  width: `${(region.length / STUDIO_BARS) * 100}%`,
                                  ["--region-delay" as string]: `${
                                    trackIdx * 80 + regionIdx * 90
                                  }ms`,
                                }}
                              >
                                <svg
                                  className="sam-studio-region-wave"
                                  viewBox={`0 0 ${region.points.length - 1} 100`}
                                  preserveAspectRatio="none"
                                  aria-hidden="true"
                                >
                                  <path
                                    d={`M0 50 ${region.points
                                      .map(
                                        (p, i) =>
                                          `L${i} ${50 - (p - 50) * 0.9}`,
                                      )
                                      .join(" ")} L${region.points.length - 1} 50 Z`}
                                    fill="currentColor"
                                    opacity="0.85"
                                  />
                                  <path
                                    d={`M0 50 ${region.points
                                      .map(
                                        (p, i) =>
                                          `L${i} ${50 + (p - 50) * 0.9}`,
                                      )
                                      .join(" ")} L${region.points.length - 1} 50 Z`}
                                    fill="currentColor"
                                    opacity="0.55"
                                  />
                                </svg>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* INSPECTOR */}
                  <aside className="sam-studio-inspector">
                    <div className="sam-studio-card">
                      <div className="sam-studio-card-eyebrow">Generated by Stella</div>
                      <div className="sam-studio-card-title">
                        Late-night drive · lo-fi keys, soft kick
                      </div>
                      <div className="sam-studio-card-prompt">
                        &ldquo;something I can write to&rdquo;
                      </div>
                    </div>

                    <div className="sam-studio-knobs">
                      {[
                        { label: "Warmth", value: 0.72 },
                        { label: "Air", value: 0.46 },
                        { label: "Reverb", value: 0.58 },
                      ].map((knob) => (
                        <div key={knob.label} className="sam-studio-knob">
                          <div className="sam-studio-knob-dial">
                            <svg viewBox="0 0 36 36">
                              <circle
                                cx="18"
                                cy="18"
                                r="14"
                                fill="none"
                                stroke="currentColor"
                                strokeOpacity="0.12"
                                strokeWidth="2.5"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeDasharray={`${knob.value * 88} 88`}
                                transform="rotate(-220 18 18)"
                              />
                            </svg>
                            <span className="sam-studio-knob-readout">
                              {Math.round(knob.value * 100)}
                            </span>
                          </div>
                          <span className="sam-studio-knob-label">{knob.label}</span>
                        </div>
                      ))}
                    </div>
                  </aside>
                </div>

                {/* TRANSPORT */}
                <div className="sam-studio-transport">
                  <div className="sam-studio-transport-controls">
                    <button type="button" className="sam-studio-tx" aria-label="Rewind">
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11 5l-7 7 7 7V5zm9 0l-7 7 7 7V5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="sam-studio-tx sam-studio-tx--play"
                      aria-label="Play"
                    >
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <button type="button" className="sam-studio-tx" aria-label="Forward">
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 5l7 7-7 7V5zm-9 0l7 7-7 7V5z" />
                      </svg>
                    </button>
                  </div>
                  <span className="sam-studio-time">
                    <span className="sam-studio-time-now">00:14</span>
                    <span className="sam-studio-time-sep">/</span>
                    <span className="sam-studio-time-total">02:08</span>
                  </span>
                  <div className="sam-studio-meter" aria-hidden="true">
                    {[6, 7, 8, 7, 6, 5, 4, 3].map((level, i) => (
                      <span
                        key={i}
                        className="sam-studio-meter-bar"
                        style={{ ["--meter-h" as string]: `${level * 10}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="sam-body-cozy">
              <h1 className="sam-cozy-home-title">
                What can Mochi do for you today?
              </h1>
              <div className="sam-cozy-home-categories">
                {COZY_HOME_CATEGORIES.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className={`sam-cozy-home-category${index === 0 ? " active" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="sam-cozy-home-suggestions">
                {COZY_HOME_SUGGESTIONS.map((text) => (
                  <span key={text} className="sam-cozy-home-suggestion">
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* COMPOSER */}
          <div className="sam-composer-wrap">
            <div
              className="sam-composer"
              data-modern={toggles.composer || undefined}
            >
              <div className="sam-composer-form">
                <span className="sam-composer-add" aria-hidden="true">
                  {ICON_PLUS}
                </span>
                <span className="sam-composer-input">
                  <span className="sam-composer-input-placeholder">
                    Ask me anything...
                  </span>
                </span>
                <span className="sam-composer-submit" aria-hidden="true">
                  {ICON_SEND}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* COZY MODE — when the user picks the cozy pill, Stella drops
            the chat shell entirely and becomes a single contemplative
            scene: late-afternoon light, soft rain on the window, the
            cat asleep in a pool of lamp glow. No chrome, no chat, no
            cards — the transformation IS the demo. */}
        <div className="sam-mochi" aria-hidden={!toggles.composer}>
          <div className="sam-mochi__lamp" aria-hidden="true" />
          <div className="sam-mochi__rain" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="sam-mochi__drop"
                style={{ ["--drop-i" as string]: i }}
              />
            ))}
          </div>

          <header className="sam-mochi__header">
            <span className="sam-mochi__brand">Mochi</span>
            <nav className="sam-mochi__nav" aria-label="Mochi sections">
              <span className="sam-mochi__nav-item is-active">Home</span>
              <span className="sam-mochi__nav-item">Store</span>
              <span className="sam-mochi__nav-item">Social</span>
              <span className="sam-mochi__nav-item">Memories</span>
            </nav>
          </header>

          <div className="sam-mochi__copy">
            <h1 className="sam-mochi__headline">
              <span>She&rsquo;s asleep</span>
              <span className="sam-mochi__headline-em">by the window.</span>
            </h1>
            <p className="sam-mochi__sub">
              Soft rain. The radiator hums. Don&rsquo;t wake her.
            </p>
          </div>

          <div className="sam-mochi__cat" aria-hidden="true">
            {COZY_CAT_SVG}
          </div>

          <footer className="sam-mochi__compose">
            <button
              type="button"
              className="sam-mochi__compose-attach"
              aria-label="Attach"
            >
              <span aria-hidden="true">{"\u002B"}</span>
            </button>
            <span className="sam-mochi__compose-input">
              <span className="sam-mochi__compose-placeholder">
                Message Mochi&hellip;
              </span>
            </span>
            <button
              type="button"
              className="sam-mochi__compose-send"
              aria-label="Send"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            </button>
          </footer>
        </div>
        </div>

        {/* TRANSFORMATION PILLS (only when interactive) */}
        {interactive
          ? SECTION_PILLS.map((pill) => {
              const active = toggles[pill.key];
              return (
                <button
                  key={pill.key}
                  type="button"
                  className="sam-pill"
                  data-section={pill.key}
                  data-active={active || undefined}
                  aria-pressed={active}
                  onClick={() => toggleSection(pill.key)}
                >
                  <span className="sam-pill-icon">{pill.icon}</span>
                  <span className="sam-pill-label">{pill.label}</span>
                  <span className="sam-pill-check" aria-hidden="true">
                    {CHECK_ICON}
                  </span>
                </button>
              );
            })
          : null}
      </div>
    </>
  );
}
