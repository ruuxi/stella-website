"use client";

import { Fragment } from "react";
import { CANVAS_CONCEPTS } from "./data";
import { StellaSidebar } from "./stella-shell";
import type { CanvasDisplayKind } from "./types";

/* ──────────────────────────────────────────────────────────────────
   Display surfaces

   Render directly on the right-hand display panel — no eyebrow chips,
   no status pills, no badge chrome. Mirrors what the real Stella
   `DisplaySidebar` shows: an artefact viewer drawn on the glass panel.
   ────────────────────────────────────────────────────────────────── */

function SpreadsheetArtifact() {
  const cols = ["A", "B", "C", "D"];
  const rows: { label: string; cells: string[] }[] = [
    { label: "1", cells: ["Channel", "Revenue", "Growth", "Share"] },
    { label: "2", cells: ["Direct", "$48,200", "+31%", "53%"] },
    { label: "3", cells: ["Referral", "$22,800", "+18%", "25%"] },
    { label: "4", cells: ["Organic", "$16,400", "+12%", "18%"] },
    { label: "5", cells: ["Paid", "$3,400", "+4%", "4%"] },
    { label: "6", cells: ["Total", "$90,800", "+22%", "100%"] },
  ];

  return (
    <article className="display-surface display-surface--sheet">
      <div className="sheet-formula">
        <span className="sheet-formula__cell">B6</span>
        <span className="sheet-formula__eq">=SUM(B2:B5)</span>
      </div>
      <div className="sheet-grid" role="presentation">
        <div className="sheet-grid__corner" />
        {cols.map((c) => (
          <div key={c} className="sheet-grid__col-head">{c}</div>
        ))}
        {rows.map((row, ri) => (
          <Fragment key={row.label}>
            <div className="sheet-grid__row-head">{row.label}</div>
            {row.cells.map((cell, ci) => (
              <div
                key={ci}
                className={`sheet-grid__cell${ri === 0 ? " sheet-grid__cell--head" : ""}${ri === rows.length - 1 ? " sheet-grid__cell--total" : ""}${ci === 2 && ri > 0 && ri < rows.length - 1 ? " sheet-grid__cell--up" : ""}`}
              >
                {cell}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
      <footer className="sheet-tabs">
        <span className="sheet-tabs__tab is-active">Q1</span>
        <span className="sheet-tabs__tab">Q2</span>
        <span className="sheet-tabs__tab">By channel</span>
      </footer>
    </article>
  );
}

/* "Build an app" — focus-timer mini-app. Visually distinct from a
   spreadsheet: a single big circular ring, stat chips, controls. It's
   what the chat just asked for, running. */

function AppArtifact() {
  // r=78 → circumference = 2πr ≈ 490
  const circumference = 2 * Math.PI * 78;
  const progress = 0.62;
  const dashOffset = circumference * (1 - progress);

  return (
    <article className="display-surface display-surface--app">
      <div className="focus-app__chrome">
        <span className="focus-app__name">Focus Timer</span>
        <span className="focus-app__round">Round 2 · of 4</span>
      </div>

      <div className="focus-app__ring">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle
            cx="100"
            cy="100"
            r="78"
            className="focus-app__ring-track"
          />
          <circle
            cx="100"
            cy="100"
            r="78"
            className="focus-app__ring-progress"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="focus-app__readout">
          <strong>09:24</strong>
          <span>focus</span>
        </div>
      </div>

      <div className="focus-app__stats">
        <div>
          <strong>2</strong>
          <span>rounds done</span>
        </div>
        <div>
          <strong>0:50</strong>
          <span>total focus</span>
        </div>
        <div>
          <strong>5m</strong>
          <span>break next</span>
        </div>
      </div>

      <div className="focus-app__controls">
        <button type="button" className="focus-app__btn focus-app__btn--ghost">
          Reset
        </button>
        <button type="button" className="focus-app__btn focus-app__btn--primary">
          Pause
        </button>
        <button type="button" className="focus-app__btn focus-app__btn--ghost">
          Skip
        </button>
      </div>
    </article>
  );
}

const DISPLAY_MAP: Record<CanvasDisplayKind, React.FC | null> = {
  spreadsheet: SpreadsheetArtifact,
  app: AppArtifact,
  multitask: null,
};

/* ──────────────────────────────────────────────────────────────────
   Multitask conversation

   The user is talking to one assistant — Stella. Many things in
   motion is communicated by the running tasks list above the
   composer, not by exposing parallel "agents" inside the chat.
   ────────────────────────────────────────────────────────────────── */

type MultitaskTurn = {
  id: string;
  ask: string;
  reply: string;
};

const MULTITASK_TURNS: MultitaskTurn[] = [
  {
    id: "t1",
    ask: "Plan a San Diego weekend trip for next month.",
    reply:
      "On it — pulling together flights, hotels near the marina, and a dinner shortlist.",
  },
  {
    id: "t2",
    ask: "While that runs, draft the Q1 update email for the team.",
    reply:
      "Started. Aiming for four short paragraphs — strong quarter, channel breakdown, what's next, ask.",
  },
  {
    id: "t3",
    ask: "Also price three laptops for design work.",
    reply:
      "Comparing the MacBook Air M3, XPS 14, and X1 Carbon — specs, current prices, and warranty.",
  },
];

const RUNNING_TASKS = [
  "Planning your San Diego trip",
  "Drafting the Q1 team update",
  "Pricing three laptops",
];

function MultitaskChat() {
  return (
    <div className="shell-chat shell-chat--wide">
      <div className="shell-chat__messages" key="multitask">
        {MULTITASK_TURNS.map((turn) => (
          <Fragment key={turn.id}>
            <div className="shell-event-item shell-event-item--user">
              {turn.ask}
            </div>
            <div className="shell-event-item shell-event-item--stella">
              {turn.reply}
            </div>
          </Fragment>
        ))}
      </div>

      <div className="shell-tasks" aria-label="Tasks in progress">
        {RUNNING_TASKS.map((task) => (
          <div key={task} className="shell-tasks__item">
            <span className="shell-tasks__orb" aria-hidden="true" />
            <span className="shell-tasks__label">{task}</span>
            <span className="shell-tasks__state">in progress</span>
          </div>
        ))}
      </div>

      <div className="shell-composer" aria-hidden="true">
        <span className="shell-composer__placeholder">
          Ask Stella anything…
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Centre chat (single-task concepts)
   ────────────────────────────────────────────────────────────────── */

function CenterChat({ conceptId }: { conceptId: string }) {
  const concept = CANVAS_CONCEPTS.find((c) => c.id === conceptId);
  if (!concept) return null;

  return (
    <div className="shell-chat">
      <div className="shell-chat__messages" key={concept.id}>
        {concept.chat.map((msg) => (
          <div
            key={msg.id}
            className={`shell-event-item shell-event-item--${msg.role}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="shell-composer" aria-hidden="true">
        <span className="shell-composer__placeholder">
          Ask Stella anything…
        </span>
      </div>
    </div>
  );
}

export function CanvasVisual({
  conceptIndex,
}: {
  conceptIndex: number;
  isActive: boolean;
}) {
  const activeConcept = CANVAS_CONCEPTS[conceptIndex];
  const DisplayComponent = DISPLAY_MAP[activeConcept.display];
  const isMultitask = activeConcept.display === "multitask";

  return (
    <div className="canvas-showcase canvas-showcase--visual-only">
      <div className="shell-preview shell-preview--chat">
        <div className="shell-preview__titlebar">
          <div className="shell-preview__traffic">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div
          className={`shell-preview__body shell-preview__body--chat${
            isMultitask ? " shell-preview__body--multitask" : ""
          }`}
        >
          <StellaSidebar className="shell-preview__sidebar" />

          {isMultitask ? (
            <MultitaskChat />
          ) : (
            <CenterChat conceptId={activeConcept.id} />
          )}

          {!isMultitask && DisplayComponent ? (
            <aside className="shell-display" key={activeConcept.id}>
              <DisplayComponent />
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
