"use client";

import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Clapperboard,
  Feather,
  Image as ImageIcon,
  Languages,
  Moon,
  Music,
  PanelRight,
  Settings,
  Tv,
} from "lucide-react";
import type { CSSProperties, ReactElement } from "react";
import mock from "./home-desktop-mock.module.css";
import { Composer } from "./home-mock-composer";
import skin from "./home-desktop-skins.module.css";

export type SkinId = "minimal" | "cozy" | "terminal" | "sunset" | "sports";

export type DemoSkin = {
  id: SkinId;
  request: string;
  vars: CSSProperties;
};

function makeVars({
  bg,
  fg,
  primary,
  primaryFg,
  dark,
  panel,
  panelBorder,
}: {
  bg: string;
  fg: string;
  primary: string;
  primaryFg: string;
  dark: boolean;
  panel?: string;
  panelBorder?: string;
}): CSSProperties {
  return {
    "--mock-background": bg,
    "--mock-foreground": fg,
    "--mock-primary": primary,
    "--mock-primary-foreground": primaryFg,
    "--mock-border-weak": `color-mix(in srgb, ${fg} 8%, transparent)`,
    "--mock-text-strong": `color-mix(in srgb, ${fg} 95%, transparent)`,
    "--mock-text-base": `color-mix(in srgb, ${fg} ${dark ? "72%" : "75%"}, transparent)`,
    "--mock-text-weak": `color-mix(in srgb, ${fg} ${dark ? "45%" : "50%"}, transparent)`,
    "--mock-text-weaker": `color-mix(in srgb, ${fg} ${dark ? "34%" : "37%"}, transparent)`,
    "--mock-panel-bg-gradient":
      panel ??
      (dark
        ? `linear-gradient(to bottom, color-mix(in srgb, ${bg} 30%, transparent), color-mix(in srgb, ${bg} 44%, transparent))`
        : `linear-gradient(to bottom, color-mix(in srgb, white 36%, transparent), color-mix(in srgb, white 20%, transparent))`),
    "--mock-panel-border":
      panelBorder ??
      `color-mix(in srgb, ${fg} ${dark ? "16%" : "11%"}, transparent)`,
    "--mock-nav-hover": `color-mix(in oklch, ${fg} 8%, transparent)`,
    "--mock-shadow": dark
      ? "0 1px 2px rgba(0, 0, 0, 0.28), 0 4px 10px rgba(0, 0, 0, 0.2), 0 12px 28px rgba(0, 0, 0, 0.14)"
      : "0 1px 2px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.04)",
    "--mock-panel-highlight": dark
      ? "inset 0 1px 0 color-mix(in oklch, white 10%, transparent)"
      : "inset 0 1px 0 color-mix(in oklch, white 42%, transparent)",
  } as CSSProperties;
}

// Loop order tells a story: each request rebuilds the app into something
// unrecognizable, and "Keep it minimal" brings it home before repeating.
export const SKINS: DemoSkin[] = [
  {
    id: "minimal",
    request: "Keep it minimal",
    // Minimal hands the window back to the Pearl scroll theme; vars unused.
    vars: {},
  },
  {
    id: "cozy",
    request: "Make it cozy",
    vars: makeVars({
      bg: "#f7eee3",
      fg: "#5c4332",
      primary: "#b07a5a",
      primaryFg: "#fff8f0",
      dark: false,
      panel:
        "linear-gradient(to bottom, color-mix(in srgb, white 62%, transparent), color-mix(in srgb, white 38%, transparent))",
    }),
  },
  {
    id: "terminal",
    request: "Give me a terminal",
    vars: makeVars({
      bg: "#06120b",
      fg: "#46d883",
      primary: "#22c55e",
      primaryFg: "#03180c",
      dark: true,
    }),
  },
  {
    id: "sunset",
    request: "Anime sunset vibes",
    vars: makeVars({
      bg: "#46315f",
      fg: "#ffe9d8",
      primary: "#e98a63",
      primaryFg: "#341c0d",
      dark: true,
      panel:
        "linear-gradient(to bottom, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.07))",
      panelBorder: "rgba(255, 255, 255, 0.22)",
    }),
  },
  {
    id: "sports",
    request: "Sports mode, please",
    vars: makeVars({
      bg: "#0d1018",
      fg: "#e9e4da",
      primary: "#f97316",
      primaryFg: "#1d0e02",
      dark: true,
    }),
  },
];

/* Pearl tokens for hosts without the scroll-theme system (e.g. the
   "Make Stella yours" card), matching the desktop's default theme. */
export const PEARL_VARS = makeVars({
  bg: "#ffffff",
  fg: "#111111",
  primary: "#2563eb",
  primaryFg: "#ffffff",
  dark: false,
});

/* ------------------------------------------------------------------ */
/* Minimal — the original Stella app: standard topbar, greeting, pill. */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = ["Home", "Store", "Social", "Apps"];

export function MinimalApp({ typed }: { typed: string }) {
  return (
    <>
      <header className={mock.topbar}>
        <div className={mock.topbarLeft}>
          <nav className={mock.nav} aria-label="Stella mock apps">
            {NAV_ITEMS.map((item) => (
              <span
                key={item}
                className={mock.navItem}
                data-active={item === "Home" ? "true" : undefined}
              >
                {item}
              </span>
            ))}
          </nav>
        </div>
        <div className={mock.profileCluster}>
          <button type="button" className={mock.accountButton}>
            <span className={mock.avatar}>A</span>
            <span>Alex</span>
            <ChevronDown size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className={mock.iconButton}
            aria-label="Settings"
          >
            <Settings size={14} strokeWidth={1.75} />
          </button>
        </div>
        <div className={mock.topbarRight}>
          <button
            type="button"
            className={mock.iconButton}
            aria-label="Open workspace panel"
          >
            <PanelRight size={15} strokeWidth={1.75} />
          </button>
        </div>
      </header>
      <div className={skin.minimalBody}>
        <div className={mock.homeContent}>
          <h3 className={skin.minimalGreeting}>Good afternoon</h3>
          <Composer typed={typed} />
          <button type="button" className={mock.backToChat}>
            <span>Back to chat</span>
            <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Cozy — a paper journal. No app chrome at all: ribbon date header,   */
/* bookmark tabs, a lined diary page, and a handwriting-rule input.    */
/* ------------------------------------------------------------------ */

const COZY_TABS = ["Today", "Letters", "Recipes", "Reading"];

function CozySurface({ typed }: { typed: string }) {
  return (
    <div className={skin.cozyRoot}>
      <header className={skin.cozyMasthead} aria-hidden="true">
        <span className={skin.cozyRule} />
        <span className={skin.cozyDate}>Tuesday, June 9th</span>
        <span className={skin.cozyRule} />
      </header>

      <nav className={skin.cozyTabs} aria-hidden="true">
        {COZY_TABS.map((tab, i) => (
          <span
            key={tab}
            className={skin.cozyTab}
            data-active={i === 0 || undefined}
          >
            {tab}
          </span>
        ))}
      </nav>

      <div className={skin.cozyPage}>
        <h3 className={skin.cozyGreeting}>Good afternoon, dear</h3>
        <div className={skin.cozyEntry} aria-hidden="true">
          <p>
            The garden finally bloomed this week — peonies first, then the
            roses all at once.
          </p>
          <p>Tea with June on Sunday. Bring the lemon cake recipe.</p>
        </div>
        <div className={skin.cozyInputRow}>
          <Feather size={15} strokeWidth={1.6} aria-hidden="true" />
          {typed ? (
            <span className={skin.cozyTyped}>
              {typed}
              <span className={skin.inkCaret} aria-hidden="true" />
            </span>
          ) : (
            <span className={skin.cozyPlaceholder}>write anything…</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Terminal — a tmux session. Window tabs, box-drawing panes, command  */
/* history, a bottom prompt, and a status line. Zero GUI chrome.       */
/* ------------------------------------------------------------------ */

const TERM_WINDOWS = ["0:chat", "1:files", "2:agents", "3:logs"];
const TERM_SESSIONS = [
  ["2026-06-08", "trip planning"],
  ["2026-06-07", "code review"],
  ["2026-06-06", "tax documents"],
  ["2026-06-04", "reading notes"],
  ["2026-06-03", "learn rust"],
];

function TerminalSurface({ typed }: { typed: string }) {
  return (
    <div className={skin.termRoot}>
      <header className={skin.termTmux} aria-hidden="true">
        <span className={skin.termSession}>[stella]</span>
        {TERM_WINDOWS.map((w, i) => (
          <span
            key={w}
            className={skin.termWindow}
            data-active={i === 0 || undefined}
          >
            {w}
            {i === 0 ? "*" : ""}
          </span>
        ))}
        <span className={skin.termRight}>14:04 · mem 3.1G</span>
      </header>

      <div className={skin.termPanes}>
        <aside className={skin.termSide} aria-hidden="true">
          <span className={skin.termSideTitle}>┌─ sessions ─────────┐</span>
          {TERM_SESSIONS.map(([date, name]) => (
            <span key={name} className={skin.termLine}>
              │ <span className={skin.termDim}>{date}</span> {name}
            </span>
          ))}
          <span className={skin.termSideTitle}>└────────────────────┘</span>
        </aside>

        <div className={skin.termMain}>
          <pre className={skin.termBanner} aria-hidden="true">
            {"   _____ _______ ______ _      _               \n"}
            {"  / ____|__   __|  ____| |    | |        /\\    \n"}
            {" | (___    | |  | |__  | |    | |       /  \\   \n"}
            {"  \\___ \\   | |  |  __| | |    | |      / /\\ \\  \n"}
            {"  ____) |  | |  | |____| |____| |____ / ____ \\ \n"}
            {" |_____/   |_|  |______|______|______/_/    \\_\\"}
          </pre>
          <div className={skin.termHistory} aria-hidden="true">
            <span>
              <span className={skin.termDim}>$</span> summarize inbox --today
            </span>
            <span className={skin.termDim}>→ done · 3 drafts ready</span>
            <span>
              <span className={skin.termDim}>$</span> schedule dinner --sat
            </span>
            <span className={skin.termDim}>→ reserved 7:30pm · 4 seats</span>
          </div>
        </div>
      </div>

      <div className={skin.termPromptRow}>
        <span className={skin.termDim}>user@stella:~$</span>
        {typed ? (
          <span className={skin.termTyped}>{typed}</span>
        ) : (
          <span className={skin.termPlaceholder}>do anything</span>
        )}
        <span className={skin.termBlock} aria-hidden="true" />
      </div>

      <footer className={skin.termStatus} aria-hidden="true">
        <span>NORMAL</span>
        <span className={skin.termDim}>~/chat</span>
        <span className={skin.termRight}>utf-8 · 0:0 · 100%</span>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sunset — an ambient lock-screen OS: oversized clock, scene layers,  */
/* a vertical glass dock, and one floating glass bar. No nav, no grid. */
/* ------------------------------------------------------------------ */

const SUNSET_DOCK = [Tv, Music, ImageIcon, Languages, Moon];

function SunsetSurface({ typed }: { typed: string }) {
  return (
    <div className={skin.sunsetRoot}>
      <span className={skin.cloud} data-variant="a" aria-hidden="true" />
      <span className={skin.cloud} data-variant="b" aria-hidden="true" />
      <span className={skin.sunDisc} aria-hidden="true" />
      <span className={skin.mountain} data-layer="back" aria-hidden="true" />
      <span className={skin.mountain} data-layer="front" aria-hidden="true" />

      <div className={skin.sunsetClock} aria-hidden="true">
        <span className={skin.sunsetTime}>5:42</span>
        <span className={skin.sunsetDate}>Tuesday, June 9 · golden hour</span>
      </div>

      <nav className={skin.sunsetDock} aria-hidden="true">
        {SUNSET_DOCK.map((Icon, i) => (
          <span
            key={i}
            className={skin.sunsetDockItem}
            data-active={i === 0 || undefined}
          >
            <Icon size={15} strokeWidth={1.7} />
          </span>
        ))}
      </nav>

      <div className={skin.sunsetBar}>
        {typed ? (
          <span className={skin.sunsetTyped}>
            {typed}
            <span className={skin.inkCaret} aria-hidden="true" />
          </span>
        ) : (
          <span className={skin.sunsetPlaceholder}>whisper anything…</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sports — a broadcast dashboard: scoreboard rail across the top,     */
/* standings panel, stat tiles, and a command bar. Built for box       */
/* scores, not conversation.                                           */
/* ------------------------------------------------------------------ */

const SPORTS_GAMES = [
  { teams: "LAL · BOS", score: "102–99", state: "FINAL" },
  { teams: "ARS · MCI", score: "2–1", state: "78’" },
  { teams: "NYY · HOU", score: "4–2", state: "TOP 7" },
  { teams: "SF · DAL", score: "21–17", state: "Q3" },
];
const SPORTS_STANDINGS = [
  ["1", "Arsenal", "74"],
  ["2", "Man City", "71"],
  ["3", "Liverpool", "68"],
  ["4", "Villa", "61"],
];
const SPORTS_TILES = [
  { label: "Next game", value: "Sat 7:30", icon: Clapperboard },
  { label: "Win streak", value: "W4", icon: BarChart3 },
];

function SportsSurface({ typed }: { typed: string }) {
  return (
    <div className={skin.sportsRoot}>
      <header className={skin.scoreRail} aria-hidden="true">
        <span className={skin.scoreBrand}>STELLA SPORTS</span>
        {SPORTS_GAMES.map((game) => (
          <span key={game.teams} className={skin.scoreCard}>
            <span className={skin.scoreTeams}>{game.teams}</span>
            <span className={skin.scoreValue}>{game.score}</span>
            <span className={skin.scoreState}>{game.state}</span>
          </span>
        ))}
      </header>

      <div className={skin.sportsBody}>
        <aside className={skin.standings} aria-hidden="true">
          <span className={skin.standingsTitle}>Standings</span>
          {SPORTS_STANDINGS.map(([pos, team, pts]) => (
            <span key={team} className={skin.standingsRow}>
              <span className={skin.standingsPos}>{pos}</span>
              <span className={skin.standingsTeam}>{team}</span>
              <span className={skin.standingsPts}>{pts}</span>
            </span>
          ))}
        </aside>

        <div className={skin.sportsMain}>
          <h3 className={skin.sportsGreeting}>Good afternoon</h3>
          <div className={skin.tileRow} aria-hidden="true">
            {SPORTS_TILES.map(({ label, value, icon: Icon }) => (
              <span key={label} className={skin.statTile}>
                <Icon size={14} strokeWidth={1.9} />
                <span className={skin.tileValue}>{value}</span>
                <span className={skin.tileLabel}>{label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={skin.sportsBar}>
        <span className={skin.sportsBarTag} aria-hidden="true">
          CMD
        </span>
        {typed ? (
          <span className={skin.sportsTyped}>
            {typed}
            <span className={skin.inkCaret} aria-hidden="true" />
          </span>
        ) : (
          <span className={skin.sportsPlaceholder}>call any play…</span>
        )}
      </div>
    </div>
  );
}

const SURFACES: Record<SkinId, (props: { typed: string }) => ReactElement> = {
  minimal: MinimalApp,
  cozy: CozySurface,
  terminal: TerminalSurface,
  sunset: SunsetSurface,
  sports: SportsSurface,
};

/* The transformation itself: the plain Pearl app you type into, stacked
   under the requested skin. Flipping `revealed` crossfades the whole
   interior from one to the other — used by the "Make Stella yours"
   mosaic tiles. `compact` tightens type and trims chrome for windows
   around half hero width. */
export function MorphScene({
  id,
  typed,
  revealed,
  compact,
}: {
  id: SkinId;
  typed: string;
  revealed: boolean;
  compact?: boolean;
}) {
  const Target = SURFACES[id];
  const vars = SKINS.find((candidate) => candidate.id === id)!.vars;
  return (
    <>
      {id !== "minimal" ? (
        <div
          className={skin.wall}
          data-skin={id}
          data-active={revealed || undefined}
          aria-hidden="true"
        />
      ) : null}
      <div
        className={skin.surface}
        style={PEARL_VARS}
        data-morph-base
        data-active={!revealed || undefined}
        aria-hidden={revealed}
      >
        <MinimalApp typed={typed} />
      </div>
      <div
        className={skin.surface}
        style={vars}
        data-active={revealed || undefined}
        data-compact={compact}
        aria-hidden={!revealed}
      >
        <Target typed="" />
      </div>
    </>
  );
}

/* Full-bleed wallpaper layers, crossfaded under each skin's chrome. The
   minimal skin has no wall so the themed gradient canvas shows through. */
export function SkinWalls({ activeId }: { activeId: SkinId }) {
  return (
    <>
      {SKINS.filter((candidate) => candidate.id !== "minimal").map(
        (candidate) => (
          <div
            key={candidate.id}
            className={skin.wall}
            data-skin={candidate.id}
            data-active={candidate.id === activeId || undefined}
            aria-hidden="true"
          />
        ),
      )}
    </>
  );
}

/* All five apps stay mounted and crossfade, so the shell reads as one
   window whose entire interior keeps being rebuilt. */
export function SkinSurfaceStack({
  activeId,
  typed,
}: {
  activeId: SkinId;
  typed: string;
}) {
  return (
    <>
      {SKINS.map((candidate) => {
        const Surface = SURFACES[candidate.id];
        const isActive = candidate.id === activeId;
        return (
          <div
            key={candidate.id}
            className={skin.surface}
            data-active={isActive || undefined}
            aria-hidden={!isActive}
          >
            <Surface typed={isActive ? typed : ""} />
          </div>
        );
      })}
    </>
  );
}
