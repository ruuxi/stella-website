"use client";

import Image from "next/image";
import { FolderGit2, LayoutGrid, MessageSquare, SquareTerminal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CANVAS_CONCEPTS } from "./data";
import type { CanvasConcept } from "./types";

function CanvasDiagram({ concept }: { concept: CanvasConcept }) {
  const nodeMap = useMemo(
    () => new Map(concept.nodes.map((node) => [node.id, node])),
    [concept.nodes],
  );

  return (
    <svg
      className="shell-diagram"
      viewBox="0 0 660 300"
      role="img"
      aria-label={concept.title}
      preserveAspectRatio="xMidYMid meet"
    >
      {concept.links.map((link) => {
        const from = nodeMap.get(link.from);
        const to = nodeMap.get(link.to);

        if (!from || !to) {
          return null;
        }

        const startX = from.x + from.width / 2;
        const startY = from.y + from.height / 2;
        const endX = to.x + to.width / 2;
        const endY = to.y + to.height / 2;
        const curve = `M ${startX} ${startY} C ${startX + 60} ${startY}, ${endX - 60} ${endY}, ${endX} ${endY}`;

        return <path key={`${link.from}-${link.to}`} d={curve} className="shell-diagram__link" />;
      })}

      {concept.nodes.map((node) => (
        <g key={node.id} className={`shell-diagram__node shell-diagram__node--${node.tone}`}>
          <rect x={node.x} y={node.y} width={node.width} height={node.height} rx={22} />
          <text x={node.x + 20} y={node.y + 28} className="shell-diagram__title">
            {node.title}
          </text>
          <text x={node.x + 20} y={node.y + 49} className="shell-diagram__meta">
            {node.meta}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function CanvasShowcase() {
  const [conceptIndex, setConceptIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setConceptIndex((current) => (current + 1) % CANVAS_CONCEPTS.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, []);

  const activeConcept = CANVAS_CONCEPTS[conceptIndex];

  return (
    <div className="canvas-showcase">
      <div className="canvas-showcase__meta">
        <div className="demo-eyebrow">Full shell</div>
        <h3>{activeConcept.title}</h3>
        <p>{activeConcept.blurb}</p>

        <div className="canvas-showcase__tabs">
          {CANVAS_CONCEPTS.map((concept, index) => (
            <button
              key={concept.id}
              type="button"
              className="canvas-showcase__tab"
              data-active={conceptIndex === index || undefined}
              onClick={() => setConceptIndex(index)}
            >
              {concept.label}
            </button>
          ))}
        </div>
      </div>

      <div className="shell-preview">
        <div className="shell-preview__titlebar">
          <div className="shell-preview__traffic">
            <span />
            <span />
            <span />
          </div>
          <div className="shell-preview__title">Stella shell</div>
          <div className="shell-preview__search">Search anything...</div>
        </div>

        <div className="shell-preview__body">
          <aside className="shell-sidebar">
            <div className="shell-sidebar__brand">
              <Image src="/stella-logo.svg" alt="" width={24} height={24} />
              <div>
                <strong>Stella</strong>
                <span>desktop shell</span>
              </div>
            </div>

            <nav className="shell-sidebar__nav" aria-label="Shell navigation">
              <button type="button" data-active>
                <LayoutGrid size={16} />
                <span>Canvas</span>
              </button>
              <button type="button">
                <MessageSquare size={16} />
                <span>Threads</span>
              </button>
              <button type="button">
                <SquareTerminal size={16} />
                <span>Tasks</span>
              </button>
              <button type="button">
                <FolderGit2 size={16} />
                <span>Projects</span>
              </button>
            </nav>

            <div className="shell-sidebar__focus">
              <span>Focus</span>
              <strong>Weekend trip planning</strong>
              <p>Researching flights, hotels, and restaurants for your upcoming getaway.</p>
            </div>
          </aside>

          <div className="shell-workspace">
            <div className="shell-workspace__header">
              <div>
                <span className="demo-eyebrow">Generative canvas</span>
                <h4>{activeConcept.title}</h4>
              </div>
              <div className="shell-workspace__badges">
                <span>Live map</span>
                <span>Context-aware</span>
              </div>
            </div>

            <div className="shell-workspace__canvas">
              <CanvasDiagram concept={activeConcept} />
            </div>
          </div>

          <aside className="shell-activity">
            <div className="shell-activity__header">
              <strong>Activity</strong>
              <span>{activeConcept.activity.length} items</span>
            </div>

            <div className="shell-activity__list">
              {activeConcept.activity.map((entry) => (
                <article key={entry.id} className="shell-activity__item">
                  <div className="shell-activity__top">
                    <span className={`shell-activity__status shell-activity__status--${entry.status}`} />
                    <strong>{entry.name}</strong>
                  </div>
                  <em>{entry.meta}</em>
                  <p>{entry.preview}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
