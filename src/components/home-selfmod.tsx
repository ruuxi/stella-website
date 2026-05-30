"use client";

import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  compositePersona,
  createMorphEngine,
  type MorphEngine,
} from "./home-selfmod-morph";
import styles from "./home-selfmod.module.css";

type Persona = {
  id: string;
  name: string;
  tag: string;
  blurb: string;
  src: string;
  portrait?: boolean;
};

const PERSONAS: Persona[] = [
  {
    id: "travel",
    name: "Trip planner",
    tag: "Travel",
    blurb:
      "A full itinerary on a live map — flights, cars, and stays booked, with the budget tracked as it goes.",
    src: "/app-mocks/travel.jpg",
  },
  {
    id: "streaming",
    name: "Discovery home",
    tag: "Lifestyle",
    blurb:
      "A cinematic launcher that turns everything you ask for into something you can pick up where you left off.",
    src: "/app-mocks/streaming.jpg",
  },
  {
    id: "family",
    name: "Family hub",
    tag: "Household",
    blurb:
      "One shared calendar for the whole house — meals, lists, carpools, and reminders, organized for you.",
    src: "/app-mocks/family.jpg",
  },
  {
    id: "canvas",
    name: "Creative canvas",
    tag: "Studio",
    blurb:
      "A freeform board where Stella drafts directions, pulls references, and generates images as you think.",
    src: "/app-mocks/canvas.jpg",
  },
  {
    id: "dashboard",
    name: "Daily dashboard",
    tag: "Focus",
    blurb:
      "Goals, trends, and routines at a glance — Stella schedules the day and keeps the streak alive.",
    src: "/app-mocks/dashboard.jpg",
  },
  {
    id: "terminal",
    name: "Ops terminal",
    tag: "Power user",
    blurb:
      "A live command center — agents, schedules, and data streaming past, driven entirely from the keyboard.",
    src: "/app-mocks/terminal.jpg",
  },
  {
    id: "studio",
    name: "Music studio",
    tag: "Audio",
    blurb:
      "Stems, samples, and a master pass on a timeline — a producer's workspace that renders while you work.",
    src: "/app-mocks/studio.jpg",
  },
  {
    id: "collage",
    name: "Inspiration board",
    tag: "Creative",
    blurb:
      "A scrapbook home that turns the day's chaos into something worth making — color, ideas, and play.",
    src: "/app-mocks/collage.jpg",
    portrait: true,
  },
  {
    id: "breathe",
    name: "Calm space",
    tag: "Wellness",
    blurb:
      "A quiet breathing screen with a single daily intention — nothing else competing for attention.",
    src: "/app-mocks/breathe.jpg",
    portrait: true,
  },
  {
    id: "cozy",
    name: "Cozy mornings",
    tag: "Cozy",
    blurb:
      "A soft, hand-illustrated little list that makes small joys feel like the whole point of the day.",
    src: "/app-mocks/cozy.jpg",
    portrait: true,
  },
  {
    id: "fitness",
    name: "Training coach",
    tag: "Fitness",
    blurb:
      "A high-energy lift tracker with streaks, PRs, and today's session queued up and ready to go.",
    src: "/app-mocks/fitness.jpg",
    portrait: true,
  },
];

const FRAME_W = 1664;
const FRAME_H = 936;
const HOLD_MS = 4400;
const CAPTION_SWAP_MS = 870;

export function HomeSelfmod() {
  const [selected, setSelected] = useState(0);
  const [captionIdx, setCaptionIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<MorphEngine | null>(null);
  const compositesRef = useRef<HTMLCanvasElement[]>([]);
  const currentRef = useRef(0);
  const busyRef = useRef(false);
  const reducedRef = useRef(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let cancelled = false;
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const load = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    (async () => {
      try {
        const imgs = await Promise.all(PERSONAS.map((p) => load(p.src)));
        if (cancelled) return;
        compositesRef.current = imgs.map((img, i) =>
          compositePersona(img, FRAME_W, FRAME_H, !!PERSONAS[i].portrait),
        );
        const canvas = canvasRef.current;
        if (!canvas) return;
        const engine = createMorphEngine(canvas, FRAME_W, FRAME_H);
        if (!engine) return;
        engineRef.current = engine;
        engine.show(compositesRef.current[0]);
        setReady(true);
      } catch {
        /* fallback image stays visible */
      }
    })();

    return () => {
      cancelled = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const goTo = (target: number) => {
    const engine = engineRef.current;
    if (!engine || busyRef.current || target === currentRef.current) return;
    busyRef.current = true;
    setSelected(target);
    const reduced = reducedRef.current;
    const capTimer = window.setTimeout(
      () => setCaptionIdx(target),
      reduced ? 200 : CAPTION_SWAP_MS,
    );
    engine
      .morphTo(compositesRef.current[target], reduced)
      .then(() => {
        currentRef.current = target;
        busyRef.current = false;
      })
      .catch(() => {
        window.clearTimeout(capTimer);
        busyRef.current = false;
      });
  };

  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => {
      if (pausedRef.current || busyRef.current) return;
      goTo((currentRef.current + 1) % PERSONAS.length);
    }, HOLD_MS);
    return () => window.clearInterval(timer);
  }, [ready]);

  const caption = PERSONAS[captionIdx];

  return (
    <section className={`grid-shell section-border ${styles.section}`}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>
          <Sparkles size={15} strokeWidth={1.9} aria-hidden="true" />
          4.0 Yours
        </span>
        <h2>An app that becomes you.</h2>
        <p>
          Ask, and the whole interface changes. Same Stella underneath — a
          different app on top, shaped around how you actually work.
        </p>
      </div>

      <div
        className={styles.stage}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <aside className={styles.commandPanel} aria-label="Self-mod request examples">
          <span>Self-mod request</span>
          <strong>Turn Stella into a trip planner for Vietnam.</strong>
          <p>
            Stella keeps the same assistant underneath while rebuilding the app
            surface around the job: maps, bookings, budgets, and agents.
          </p>
          <div className={styles.commandMeta}>
            <span>Theme</span>
            <b>{caption.name}</b>
          </div>
          <div className={styles.commandMeta}>
            <span>Agent</span>
            <b>interface-builder</b>
          </div>
        </aside>

        <div className={styles.frame}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            data-ready={ready || undefined}
            aria-hidden="true"
          />
          {!ready && (
            <Image
              src={PERSONAS[selected].src}
              alt={`Stella reshaped into a ${PERSONAS[selected].name.toLowerCase()}`}
              fill
              priority
              unoptimized
              className={styles.fallback}
              sizes="(max-width: 960px) 100vw, 62rem"
            />
          )}

          <div className={styles.caption} key={caption.id}>
            <span className={styles.captionTag}>{caption.tag}</span>
            <div className={styles.captionBody}>
              <strong>{caption.name}</strong>
              <span>{caption.blurb}</span>
            </div>
          </div>
        </div>

        <div className={styles.rail} role="tablist" aria-label="Stella personas">
          {PERSONAS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === selected}
              aria-label={p.name}
              className={`${styles.thumb} ${i === selected ? styles.thumbActive : ""}`}
              onClick={() => goTo(i)}
            >
              <Image
                src={p.src}
                alt=""
                width={480}
                height={270}
                aria-hidden="true"
                unoptimized
                sizes="11rem"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
