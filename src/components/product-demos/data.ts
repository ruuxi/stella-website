import {
  Camera,
  Maximize2,
  MessageSquare,
  Mic,
  Sparkles,
} from "lucide-react";
import type { CanvasConcept, RadialWedge, RadialWedgeId, SelfModStage } from "./types";

export const RADIAL_RAIL_DETAILS: Record<RadialWedgeId, string> = {
  capture: "Pull in any part of the screen and start asking questions immediately.",
  chat: "Start a conversation with the current page, app, and task already in view.",
  full: "Expand into the full workspace when you want the whole dashboard in front of you.",
  voice: "Dictate, brainstorm, or steer the next step without touching the keyboard.",
  auto: "Get the gist, key takeaways, and suggested next steps in one move.",
};

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
    id: "full",
    label: "Full",
    icon: Maximize2,
    heading: "Open the full Stella window",
    detail:
      "Switch to the full view with your dashboard, apps, and everything in one place — without losing your conversation.",
  },
  {
    id: "voice",
    label: "Voice",
    icon: Mic,
    heading: "Just talk to Stella",
    detail:
      "Speak naturally and Stella listens. Dictate notes, ask questions, or give instructions — hands-free, from anywhere.",
  },
  {
    id: "auto",
    label: "Auto",
    icon: Sparkles,
    heading: "Instant page summary",
    detail:
      "Stella reads what's on screen and gives you a quick summary with the key points and suggested next steps.",
  },
];

export const RADIAL_VECTOR_PALETTE = {
  base: [0.93, 0.96, 1] as [number, number, number],
  selected: [0.17, 0.48, 0.95] as [number, number, number],
  center: [0.95, 0.97, 1] as [number, number, number],
  stroke: [0.64, 0.73, 0.9] as [number, number, number],
};

export const SELF_MOD_STAGES: SelfModStage[] = [
  { id: "low", title: "Low", prompt: "Make my messages blue." },
  { id: "medium", title: "Medium", prompt: "Make the app feel more modern." },
  { id: "high", title: "High", prompt: "Turn this into a cozy cat-themed shell." },
];

export const CANVAS_CONCEPTS: CanvasConcept[] = [
  {
    id: "launch",
    label: "Plan",
    title: "Stella maps out your request visually",
    blurb:
      "Ask Stella something complex and it breaks the work into connected steps — while the sidebar tracks what's happening right now.",
    nodes: [
      { id: "capture", x: 34, y: 46, width: 158, height: 68, title: "Gather information", meta: "from your screen", tone: "blue" },
      { id: "chat", x: 236, y: 32, width: 170, height: 72, title: "Understand request", meta: "what you need", tone: "cyan" },
      { id: "auto", x: 454, y: 44, width: 172, height: 70, title: "Quick summary", meta: "key points", tone: "mint" },
      { id: "plan", x: 136, y: 176, width: 198, height: 88, title: "Make a plan", meta: "steps and priorities", tone: "slate" },
      { id: "shell", x: 398, y: 186, width: 216, height: 86, title: "Get it done", meta: "execute the plan", tone: "blue" },
    ],
    links: [
      { from: "capture", to: "plan" },
      { from: "chat", to: "plan" },
      { from: "auto", to: "shell" },
      { from: "plan", to: "shell" },
    ],
    activity: [
      { id: "a", name: "Trip research", meta: "working on it", status: "running", preview: "Looking up flights, hotels, and activities for your weekend trip." },
      { id: "b", name: "Budget summary", meta: "up next", status: "scheduled", preview: "Will compare prices and put together a cost breakdown." },
      { id: "c", name: "Restaurant list", meta: "done", status: "ok", preview: "Found 5 highly-rated spots near your hotel with outdoor seating." },
    ],
  },
  {
    id: "agents",
    label: "Teamwork",
    title: "Stella handles multiple things at once",
    blurb:
      "When you ask for something big, Stella splits the work up and tackles different parts at the same time — then brings it all together.",
    nodes: [
      { id: "thread", x: 28, y: 48, width: 170, height: 74, title: "Your request", meta: "what you asked for", tone: "slate" },
      { id: "worker-a", x: 248, y: 34, width: 166, height: 72, title: "Research", meta: "finding information", tone: "blue" },
      { id: "worker-b", x: 456, y: 42, width: 166, height: 72, title: "Create", meta: "building the result", tone: "cyan" },
      { id: "review", x: 140, y: 180, width: 190, height: 86, title: "Check quality", meta: "make sure it's right", tone: "mint" },
      { id: "ship", x: 396, y: 190, width: 214, height: 84, title: "Deliver", meta: "ready for you", tone: "blue" },
    ],
    links: [
      { from: "thread", to: "worker-a" },
      { from: "thread", to: "worker-b" },
      { from: "worker-a", to: "review" },
      { from: "worker-b", to: "review" },
      { from: "review", to: "ship" },
    ],
    activity: [
      { id: "d", name: "Email draft", meta: "working on it", status: "running", preview: "Writing a friendly follow-up based on your notes from the meeting." },
      { id: "e", name: "Calendar check", meta: "up next", status: "scheduled", preview: "Looking at your schedule to suggest the best time for a follow-up." },
      { id: "f", name: "Contact lookup", meta: "done", status: "ok", preview: "Found their email and LinkedIn — added to your draft." },
    ],
  },
  {
    id: "timeline",
    label: "Flow",
    title: "From idea to done, step by step",
    blurb:
      "Stella turns your rough ideas into a clear plan and shows you the progress as each piece comes together.",
    nodes: [
      { id: "hero", x: 34, y: 46, width: 152, height: 68, title: "Your idea", meta: "starting point", tone: "slate" },
      { id: "demo", x: 236, y: 34, width: 186, height: 76, title: "Break it down", meta: "steps and pieces", tone: "blue" },
      { id: "assets", x: 470, y: 44, width: 150, height: 70, title: "Gather what's needed", meta: "info and files", tone: "cyan" },
      { id: "verify", x: 138, y: 182, width: 194, height: 86, title: "Review", meta: "check everything", tone: "mint" },
      { id: "ship", x: 404, y: 192, width: 198, height: 82, title: "Finish", meta: "all done", tone: "blue" },
    ],
    links: [
      { from: "hero", to: "demo" },
      { from: "assets", to: "demo" },
      { from: "demo", to: "verify" },
      { from: "verify", to: "ship" },
    ],
    activity: [
      { id: "g", name: "Party planning", meta: "working on it", status: "running", preview: "Putting together a guest list, menu ideas, and a playlist." },
      { id: "h", name: "Invitations", meta: "up next", status: "scheduled", preview: "Will draft and send invites once the details are set." },
      { id: "i", name: "Venue options", meta: "done", status: "ok", preview: "Found 3 great venues within your budget — details saved." },
    ],
  },
];
