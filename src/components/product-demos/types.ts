import type { LucideIcon } from "lucide-react";

export type RadialWedgeId = "capture" | "chat" | "full" | "voice" | "auto";
export type SelfModLevel = "low" | "medium" | "high";

export type RadialWedge = {
  id: RadialWedgeId;
  label: string;
  icon: LucideIcon;
  heading: string;
  detail: string;
};

export type SelfModStage = {
  id: SelfModLevel;
  title: string;
  prompt: string;
};

export type CanvasConcept = {
  id: string;
  label: string;
  title: string;
  blurb: string;
  activity: {
    id: string;
    name: string;
    meta: string;
    preview: string;
  }[];
};
