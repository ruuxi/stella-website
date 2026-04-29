"use client";

/**
 * Mobile-only mock for the "An app that becomes you" section.
 *
 * The desktop StellaAppMock is built around a 170px sidebar + wide
 * content area + floating section pills. None of that translates to a
 * phone viewport, so on mobile we render a purpose-built phone-shaped
 * card whose body morphs between four "looks" Stella can take on:
 *
 *   • Default — home greeting + recent threads
 *   • Tabs    — tabbed surface on top of the chat
 *   • Dashboard — widget grid instead of a chat column
 *   • Cozy    — warm Mochi cat theme
 *
 * The four section keys (sidebar / header / messages / composer)
 * mirror the same transformations the desktop pills toggle, so the
 * story is consistent across breakpoints — only the presentation
 * changes.
 */

import { useState } from "react";
import {
  type SectionKey,
} from "./stella-app-mock-types";

type Variant = "default" | "rail" | "tabs" | "dashboard" | "cozy";

const PILLS: { key: SectionKey; label: string; variant: Variant }[] = [
  { key: "sidebar", label: "Workspace rail", variant: "rail" },
  { key: "header", label: "Tabs", variant: "tabs" },
  { key: "messages", label: "Dashboard", variant: "dashboard" },
  { key: "composer", label: "Cozy mode", variant: "cozy" },
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

  return (
    <div className="smhm">
      <div className="smhm__phone" data-variant={variant}>
        {/* Status bar */}
        <div className="smhm__status">
          <span className="smhm__time">9:41</span>
          <div className="smhm__status-right">
            <span className="smhm__signal" aria-hidden />
            <span className="smhm__battery" aria-hidden />
          </div>
        </div>

        {/* Header */}
        <div className="smhm__header">
          {variant === "rail" ? (
            <div className="smhm__rail" aria-hidden>
              <span className="smhm__rail-dot smhm__rail-dot--active" />
              <span className="smhm__rail-dot" />
              <span className="smhm__rail-dot" />
              <span className="smhm__rail-dot" />
            </div>
          ) : (
            <div className="smhm__brand">
              <span className="smhm__brand-orb" aria-hidden />
              <span className="smhm__brand-name">Stella</span>
            </div>
          )}
          <span className="smhm__header-action" aria-hidden>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
        </div>

        {/* Optional tab bar */}
        {variant === "tabs" && (
          <div className="smhm__tabs">
            <button type="button" className="smhm__tab" data-active>Notes</button>
            <button type="button" className="smhm__tab">Today</button>
            <button type="button" className="smhm__tab">Inbox</button>
          </div>
        )}

        {/* Body — morphs per variant */}
        <div className="smhm__body">
          {variant === "dashboard" ? (
            <DashboardBody />
          ) : variant === "cozy" ? (
            <CozyBody />
          ) : (
            <DefaultBody compact={variant === "tabs" || variant === "rail"} />
          )}
        </div>

        {/* Composer */}
        <div className="smhm__composer" data-cozy={variant === "cozy" || undefined}>
          <span className="smhm__composer-plus" aria-hidden>+</span>
          <span className="smhm__composer-placeholder">
            {variant === "cozy" ? "Tell Mochi anything…" : "Ask Stella anything…"}
          </span>
          <span className="smhm__composer-mic" aria-hidden>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </span>
        </div>
      </div>

      {/* Pill toggle */}
      <div className="smhm__pills" role="group" aria-label="Stella transformations">
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

/* ── Default body (greeting + chips + recent threads) ─────────── */

function DefaultBody({ compact }: { compact?: boolean }) {
  return (
    <div className="smhm__home">
      {!compact && (
        <h3 className="smhm__greeting">
          Hello, <em>friend</em>.
        </h3>
      )}

      <div className="smhm__chips">
        <span className="smhm__chip">Plan my week</span>
        <span className="smhm__chip">Organize files</span>
        <span className="smhm__chip">Draft email</span>
      </div>

      <div className="smhm__threads">
        <div className="smhm__thread">
          <span className="smhm__thread-orb" aria-hidden />
          <div className="smhm__thread-text">
            <span className="smhm__thread-title">San Diego trip</span>
            <span className="smhm__thread-detail">3 flights compared</span>
          </div>
        </div>
        <div className="smhm__thread">
          <span className="smhm__thread-orb" aria-hidden />
          <div className="smhm__thread-text">
            <span className="smhm__thread-title">Q1 update email</span>
            <span className="smhm__thread-detail">Draft ready</span>
          </div>
        </div>
        <div className="smhm__thread">
          <span className="smhm__thread-orb" aria-hidden />
          <div className="smhm__thread-text">
            <span className="smhm__thread-title">Laptop comparison</span>
            <span className="smhm__thread-detail">Pricing 3 options</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard body — widget grid ─────────────────────────────── */

function DashboardBody() {
  return (
    <div className="smhm__dash">
      <div className="smhm__dash-card smhm__dash-card--tall">
        <span className="smhm__dash-eyebrow">Today</span>
        <span className="smhm__dash-figure">14</span>
        <span className="smhm__dash-detail">tasks queued</span>
      </div>
      <div className="smhm__dash-card">
        <span className="smhm__dash-eyebrow">Inbox</span>
        <span className="smhm__dash-figure">3</span>
      </div>
      <div className="smhm__dash-card">
        <span className="smhm__dash-eyebrow">Drafts</span>
        <span className="smhm__dash-figure">7</span>
      </div>
      <div className="smhm__dash-card smhm__dash-card--wide">
        <span className="smhm__dash-eyebrow">Recent</span>
        <span className="smhm__dash-detail">San Diego trip · Q1 email · laptop pricing</span>
      </div>
    </div>
  );
}

/* ── Cozy body — Mochi cat theme ──────────────────────────────── */

function CozyBody() {
  return (
    <div className="smhm__cozy">
      <CozyCat />
      <div className="smhm__cozy-text">
        <span className="smhm__cozy-name">Mochi</span>
        <span className="smhm__cozy-detail">curled up beside you</span>
      </div>
    </div>
  );
}

function CozyCat() {
  return (
    <svg
      className="smhm__cozy-cat"
      viewBox="0 0 200 130"
      fill="none"
      aria-hidden
    >
      {/* body */}
      <ellipse cx="100" cy="92" rx="62" ry="28" fill="#2b2218" />
      {/* head */}
      <ellipse cx="100" cy="60" rx="34" ry="30" fill="#2b2218" />
      {/* ears */}
      <path d="M70 38 L78 18 L88 42 Z" fill="#2b2218" />
      <path d="M130 38 L122 18 L112 42 Z" fill="#2b2218" />
      {/* white chest */}
      <ellipse cx="100" cy="80" rx="14" ry="12" fill="#f5e9d8" />
      {/* eyes (closed, content) */}
      <path d="M86 60 q4 4 8 0" stroke="#f5e9d8" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M106 60 q4 4 8 0" stroke="#f5e9d8" strokeWidth="1.6" strokeLinecap="round" />
      {/* nose */}
      <path d="M99 68 l2 2 l-2 2 l-2 -2 z" fill="#d68a8a" />
      {/* whisker hints */}
      <path d="M82 70 h-8 M82 72 h-10 M118 70 h8 M118 72 h10" stroke="#f5e9d8" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      {/* tail */}
      <path d="M158 92 q22 -6 16 -28 q-2 -10 -10 -8" stroke="#2b2218" strokeWidth="14" strokeLinecap="round" fill="none" />
    </svg>
  );
}
