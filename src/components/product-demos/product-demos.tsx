"use client";

import dynamic from "next/dynamic";
import { DeferInView } from "./defer-in-view";

function DemoChunkPlaceholder() {
  return (
    <div
      className="demo-showcase-chunk-placeholder"
      style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }}
      aria-busy="true"
      aria-label="Loading interactive demo"
    />
  );
}

const SelfModificationShowcase = dynamic(
  () => import("./self-mod-showcase").then((m) => ({ default: m.SelfModificationShowcase })),
  { loading: () => <DemoChunkPlaceholder /> },
);

const RadialDialShowcase = dynamic(
  () => import("./radial-dial-showcase").then((m) => ({ default: m.RadialDialShowcase })),
  { loading: () => <DemoChunkPlaceholder /> },
);

const CanvasShowcase = dynamic(
  () => import("./canvas-showcase").then((m) => ({ default: m.CanvasShowcase })),
  { loading: () => <DemoChunkPlaceholder /> },
);

export function ProductDemos() {
  return (
    <div className="demo-showcase-grid">
      <article className="demo-panel demo-panel--full">
        <div className="demo-panel__header">
          <div className="section-kicker section-kicker--compact">
            <span>Customization</span>
            <h3>Make Stella look however you want.</h3>
          </div>
          <p className="demo-panel__lede">
            Just tell Stella to change its appearance — from small tweaks like colors to a complete visual makeover. It redesigns itself while you keep chatting.
          </p>
        </div>
        <SelfModificationShowcase />
      </article>

      <article className="demo-panel demo-panel--full">
        <div className="demo-panel__header demo-panel__header--spaced">
          <div className="section-kicker section-kicker--compact">
            <span>Quick access</span>
            <h3>Everything you need, one gesture away.</h3>
          </div>
          <p className="demo-panel__lede">
            The radial dial pops up wherever you are. Capture your screen, start a chat, dictate with your voice, or get an instant summary — all without switching windows.
          </p>
        </div>
        <DeferInView fallback={<DemoChunkPlaceholder />}>
          <RadialDialShowcase />
        </DeferInView>
      </article>

      <article className="demo-panel demo-panel--full">
        <div className="demo-panel__header">
          <div className="section-kicker section-kicker--compact">
            <span>Your workspace</span>
            <h3>See everything Stella is working on at a glance.</h3>
          </div>
          <p className="demo-panel__lede">
            The full Stella window shows your dashboard, active tasks, and upcoming follow-ups — all in one clean, organized view.
          </p>
        </div>
        <DeferInView fallback={<DemoChunkPlaceholder />}>
          <CanvasShowcase />
        </DeferInView>
      </article>
    </div>
  );
}
