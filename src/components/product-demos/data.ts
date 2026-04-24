import { Camera, MessageSquare, Mic, Plus } from "lucide-react";
import type { CanvasConcept, RadialWedge, RadialWedgeId, SelfModStage } from "./types";

export const RADIAL_RAIL_DETAILS: Record<RadialWedgeId, string> = {
  capture: "Pull in any part of the screen and start asking questions immediately.",
  chat: "Start a conversation with the current page, app, and task already in view.",
  add: "Quietly attach what you grabbed to your chat — no window switching.",
  voice: "Dictate, brainstorm, or steer the next step without touching the keyboard.",
};

// Order matches the real Stella radial: top → right → bottom → left.
export const RADIAL_WEDGES: RadialWedge[] = [
  {
    id: "capture",
    label: "Capture",
    icon: Camera,
    heading: "Grab what's on your screen",
    detail:
      "Capture whatever you're looking at — a webpage, a document, anything — and Stella instantly understands it.",
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    heading: "Chat that already knows what you're doing",
    detail:
      "Stella sees what app or page you're on and picks up the conversation from there. No need to explain the context.",
  },
  {
    id: "add",
    label: "Add",
    icon: Plus,
    heading: "Add to your conversation",
    detail:
      "Pin what you grabbed to the current chat as context — no need to leave the app you're in.",
  },
  {
    id: "voice",
    label: "Voice",
    icon: Mic,
    heading: "Just talk to Stella",
    detail:
      "Speak naturally and Stella listens. Dictate notes, ask questions, or give instructions — hands-free, from anywhere.",
  },
];

export const SELF_MOD_STAGES: SelfModStage[] = [
  { id: "low", title: "Low", prompt: "Make my messages blue." },
  { id: "medium", title: "Medium", prompt: "Make the app feel more modern." },
  { id: "high", title: "High", prompt: "Turn this into a cozy cat-themed shell." },
];

export const CANVAS_CONCEPTS: CanvasConcept[] = [
  {
    id: "launch",
    label: "Plan",
    title: "Stella builds visual workspaces, not just text",
    blurb:
      "Ask something complex and Stella generates a rich layout — cards, charts, tables — whatever communicates the answer best.",
    activity: [
      { id: "a", name: "Flight search", meta: "done", preview: "Found direct SFO → SAN on Friday, $124 round trip." },
      { id: "b", name: "Hotel comparison", meta: "done", preview: "Compared 8 beachfront hotels — top pick saved." },
      { id: "c", name: "Restaurant research", meta: "working on it", preview: "Scanning reviews for outdoor spots near the hotel." },
    ],
  },
  {
    id: "agents",
    label: "Compare",
    title: "Side-by-side comparisons, built on the fly",
    blurb:
      "Need to weigh your options? Stella creates structured visual comparisons so you can see differences at a glance.",
    activity: [
      { id: "d", name: "Spec research", meta: "done", preview: "Pulled specs for all three models from official sources." },
      { id: "e", name: "Price tracking", meta: "done", preview: "Checked current prices across 4 retailers." },
      { id: "f", name: "Recommendation", meta: "working on it", preview: "Matching features against your stated priorities." },
    ],
  },
  {
    id: "timeline",
    label: "Analyze",
    title: "From raw data to a polished summary",
    blurb:
      "Stella reads your documents and data, then generates a formatted analysis with key metrics, tables, and next steps.",
    activity: [
      { id: "g", name: "Data collection", meta: "done", preview: "Imported sales data from Q1 spreadsheets." },
      { id: "h", name: "Trend analysis", meta: "done", preview: "Identified growth patterns across all channels." },
      { id: "i", name: "Report generation", meta: "working on it", preview: "Building the summary with charts and recommendations." },
    ],
  },
];
