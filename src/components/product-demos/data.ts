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
    id: "spreadsheet",
    label: "Build a sheet",
    title: "Ask once. Watch it appear.",
    blurb:
      "Ask Stella for one thing — a spreadsheet, a doc, a chart. The chat stays in the middle; the work opens beside it the moment it's ready.",
    display: "spreadsheet",
    chat: [
      {
        id: "u1",
        role: "user",
        text: "Pull our Q1 numbers into a sheet, broken down by channel.",
      },
      {
        id: "s1",
        role: "stella",
        text: "On it — opening the sheet on the right as I fill it in.",
      },
    ],
  },
  {
    id: "app",
    label: "Build an app",
    title: "Describe an app. Use it.",
    blurb:
      "Tell Stella the tool you wish existed and she builds it on the spot — opening the running app beside you, ready to use.",
    display: "app",
    chat: [
      {
        id: "u2",
        role: "user",
        text: "Build me a focus timer — 25-minute rounds with short breaks.",
      },
      {
        id: "s2",
        role: "stella",
        text: "Done. It's open on the right — press start whenever you're ready.",
      },
    ],
  },
  {
    id: "multitask",
    label: "All at once",
    title: "Many asks. All in motion.",
    blurb:
      "Send one ask, send another while the first is still going — Stella spins up a fresh agent for each, all working in parallel right inside the conversation.",
    display: "multitask",
    chat: [],
  },
];
