"use client";

import {
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  FileArchive,
  FileImage,
  FileText,
  LoaderCircle,
  MessageSquarePlus,
  Mic,
  PanelRight,
  Plus,
  Scan,
  Settings,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import styles from "./home-desktop-mock.module.css";

type Rgb = { r: number; g: number; b: number };
type OklchColor = { l: number; c: number; h: number };
type ThemeMode = "light" | "dark";
type ThemeColors = {
  background: string;
  backgroundWeak: string;
  backgroundStrong: string;
  foreground: string;
  foregroundWeak: string;
  foregroundStrong: string;
  primary: string;
  primaryForeground: string;
  success: string;
  warning: string;
  info: string;
  interactive: string;
  border: string;
  borderWeak: string;
  borderStrong: string;
  card: string;
  muted: string;
  accent: string;
  gradientAnchor?: string;
};

type StellaTheme = {
  id: string;
  name: string;
  forcedMode?: ThemeMode;
  light: ThemeColors;
  dark: ThemeColors;
};

type GradientBlob = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: Rgb;
};

const THEMES: StellaTheme[] = [
  {
    id: "pearl",
    name: "Pearl",
    forcedMode: "light",
    light: {
      background: "#ffffff",
      backgroundWeak: "#ffffff",
      backgroundStrong: "#ffffff",
      foreground: "#111111",
      foregroundWeak: "#737373",
      foregroundStrong: "#000000",
      primary: "#2563eb",
      primaryForeground: "#ffffff",
      success: "#16a34a",
      warning: "#a16207",
      info: "#2563eb",
      interactive: "#2563eb",
      border: "#e8e8e8",
      borderWeak: "#f0f0f0",
      borderStrong: "#dcdcdc",
      card: "#fbfbfb",
      muted: "#f6f6f6",
      accent: "#f2f2f2",
      gradientAnchor: "#ffffff",
    },
    dark: {
      background: "#ffffff",
      backgroundWeak: "#ffffff",
      backgroundStrong: "#ffffff",
      foreground: "#111111",
      foregroundWeak: "#737373",
      foregroundStrong: "#000000",
      primary: "#2563eb",
      primaryForeground: "#ffffff",
      success: "#16a34a",
      warning: "#a16207",
      info: "#2563eb",
      interactive: "#2563eb",
      border: "#e8e8e8",
      borderWeak: "#f0f0f0",
      borderStrong: "#dcdcdc",
      card: "#fbfbfb",
      muted: "#f6f6f6",
      accent: "#f2f2f2",
      gradientAnchor: "#ffffff",
    },
  },
  {
    id: "noir",
    name: "Noir",
    forcedMode: "dark",
    light: {
      background: "#0a0a0a",
      backgroundWeak: "#050505",
      backgroundStrong: "#141414",
      foreground: "#f0eee8",
      foregroundWeak: "#9a958c",
      foregroundStrong: "#fbfbf7",
      primary: "#f0eee8",
      primaryForeground: "#0a0a0a",
      success: "#4ade80",
      warning: "#fbbf24",
      info: "#60a5fa",
      interactive: "#f0eee8",
      border: "#242424",
      borderWeak: "#171717",
      borderStrong: "#333333",
      card: "#111111",
      muted: "#181818",
      accent: "#202020",
      gradientAnchor: "#0a0a0a",
    },
    dark: {
      background: "#0a0a0a",
      backgroundWeak: "#050505",
      backgroundStrong: "#141414",
      foreground: "#f0eee8",
      foregroundWeak: "#9a958c",
      foregroundStrong: "#fbfbf7",
      primary: "#f0eee8",
      primaryForeground: "#0a0a0a",
      success: "#4ade80",
      warning: "#fbbf24",
      info: "#60a5fa",
      interactive: "#f0eee8",
      border: "#242424",
      borderWeak: "#171717",
      borderStrong: "#333333",
      card: "#111111",
      muted: "#181818",
      accent: "#202020",
      gradientAnchor: "#0a0a0a",
    },
  },
  theme("oc-1", "Sandstone", {
    light: ["#f8f7f7", "#1c1712", "#034cff", "#4a9c3d", "#c9922a", "#4a8eb5", "#dcde8d", "#f0eeee", "#fcfcfc"],
    dark: ["#1a1614", "#e8e3dc", "#4a7fff", "#6ab85e", "#e0a840", "#8cb8d4", "#fab283", "#1c1717", "#151313"],
  }),
  theme("dracula", "Orchid", {
    light: ["#eee8ff", "#1f1f2f", "#7c6bf5", "#2fbf71", "#f7a14d", "#1d7fc5", "#d16090", "#e2daf8", "#f6f2ff"],
    dark: ["#14151f", "#f8f8f2", "#bd93f9", "#50fa7b", "#ffb86c", "#8be9fd", "#ff79c6", "#181926", "#161722"],
  }),
  theme("catppuccin", "Rosé", {
    light: ["#f5e0dc", "#4c4f69", "#7287fd", "#40a02b", "#df8e1d", "#04a5e5", "#ea76cb", "#f2d8d4", "#f9e8e4"],
    dark: ["#1e1e2e", "#cdd6f4", "#b4befe", "#a6d189", "#f2c97d", "#89dceb", "#f5c2e7", "#211f31", "#1c1c29"],
  }),
  theme("monokai", "Neon", {
    light: ["#eef6e3", "#272822", "#ae81ff", "#7da82a", "#d48b1a", "#66d9ef", "#fd971f", "#e3eed5", "#f6faee"],
    dark: ["#272822", "#f8f8f2", "#ae81ff", "#a6e22e", "#fd971f", "#66d9ef", "#fd971f", "#2d2e27", "#1e1f1c"],
  }),
  theme("solarized", "Solstice", {
    light: ["#fdf6e3", "#4a6068", "#268bd2", "#859900", "#b58900", "#2aa198", "#6c71c4", "#f5efdc", "#fffbf0"],
    dark: ["#002b36", "#93a1a1", "#268bd2", "#859900", "#b58900", "#2aa198", "#6c71c4", "#073642", "#001f27"],
  }),
  theme("shadesofpurple", "Amethyst", {
    light: ["#f5f3ff", "#2d2b55", "#7b6dc8", "#2ab800", "#d88600", "#0090d4", "#fad000", "#ede9ff", "#faf9ff"],
    dark: ["#1e1e3f", "#e7e7ff", "#a599e9", "#3ad900", "#ff9d00", "#00b0ff", "#fad000", "#232350", "#181835"],
  }),
  theme("nightowl", "Midnight", {
    light: ["#e7f1fb", "#403f53", "#4876d6", "#08916a", "#daaa01", "#0c969b", "#c96765", "#dbe8f6", "#f2f8fd"],
    dark: ["#011627", "#d6deeb", "#82aaff", "#22da6e", "#ffeb95", "#7fdbca", "#c792ea", "#021d32", "#00101e"],
  }),
  theme("vesper", "Ember", {
    light: ["#f4ebe1", "#1f1d1b", "#8b5cf6", "#22c55e", "#f59e0b", "#3b82f6", "#fbbf24", "#e9ddd1", "#faf3ec"],
    dark: ["#101010", "#e5e5e5", "#a78bfa", "#4ade80", "#fbbf24", "#60a5fa", "#fbbf24", "#171717", "#0a0a0a"],
  }),
  theme("gruvbox", "Autumn", {
    light: ["#fbf1c7", "#3c3836", "#d65d0e", "#98971a", "#d79921", "#458588", "#b16286", "#f2e5bc", "#fffbeb"],
    dark: ["#282828", "#ebdbb2", "#fe8019", "#b8bb26", "#fabd2f", "#83a598", "#d3869b", "#302e2d", "#1d2021"],
  }),
  theme("ayu", "Amber", {
    light: ["#fafafa", "#575f66", "#ff9940", "#86b300", "#f29718", "#55b4d4", "#a37acc", "#f0f0f0", "#ffffff"],
    dark: ["#0a0e14", "#bfbdb6", "#ffb454", "#aad94c", "#e8815c", "#59c2ff", "#d2a6ff", "#0d1117", "#050709"],
  }),
  theme("aura", "Velvet", {
    light: ["#f5f2ff", "#29263c", "#a277ff", "#2ea88a", "#d4943c", "#3a9bc5", "#d4943c", "#ece8fa", "#faf9ff"],
    dark: ["#15141b", "#edecee", "#a277ff", "#54deb0", "#f0b86a", "#6ecfef", "#ffca85", "#1a1921", "#0e0d12"],
  }),
  theme("sage", "Sage", {
    light: ["#f4f7f1", "#1f2a1f", "#4f7d4f", "#3f8a3f", "#b08a1c", "#4a8a8a", "#cdb98c", "#eaf0e3", "#fafcf7"],
    dark: ["#10180f", "#dbe5d4", "#8fbf8a", "#7fc97f", "#d6b14a", "#7fb8b8", "#d6c69a", "#0a110a", "#1a221a"],
  }),
  theme("crimson", "Crimson", {
    light: ["#fbf3f3", "#2a1010", "#b91c1c", "#3f8a3f", "#b08a1c", "#7c5a5a", "#c97a4a", "#f4e5e5", "#fffafa"],
    dark: ["#170c0c", "#ecd9d9", "#ef4444", "#7fc97f", "#e0b04a", "#c7a4a4", "#e8a87c", "#0e0707", "#1f1010"],
  }),
  theme("slate", "Slate", {
    light: ["#eef0f2", "#1f2530", "#475569", "#3f8a3f", "#a37011", "#3a6e9c", "#7a8694", "#e2e5e8", "#f5f6f8"],
    dark: ["#181b20", "#dde2e8", "#a3aebc", "#7fc97f", "#d6b14a", "#7fa8d6", "#7c8694", "#101317", "#20242a"],
  }),
  theme("cocoa", "Cocoa", {
    light: ["#f5efe6", "#3a2a1e", "#7c4a1f", "#5a8a3f", "#b07a1c", "#5a7a8a", "#a87742", "#ebe2d4", "#fbf6ee"],
    dark: ["#1a1310", "#e8d9c4", "#c8956a", "#8fbf6a", "#d6b14a", "#8aa8b8", "#d6a87a", "#120c0a", "#241a14"],
  }),
];

const BASE_POSITIONS = [
  { x: 0.16, y: 0.14 },
  { x: 0.86, y: 0.16 },
  { x: 0.18, y: 0.88 },
  { x: 0.88, y: 0.88 },
  { x: 0.52, y: 0.54 },
];

const NAV_ITEMS = ["Home", "Store", "Social", "Apps"];
// Curated palette journey used for the scroll-driven theme crossfade.
const SCROLL_THEMES = [
  "pearl",
  "sage",
  "slate",
  "cocoa",
  "crimson",
  "aura",
  "nightowl",
];
const RENDER_SCALE = 0.6;
const CONTEXT_CHIPS = [
  { label: "Mail", iconSrc: "/mock-app-icons/mail.png" },
  { label: "Maps", iconSrc: "/mock-app-icons/maps.png" },
  { label: "Notes", iconSrc: "/mock-app-icons/notes.png" },
];
const WORKSPACE_ACTIONS = [
  { label: "Read replies aloud", icon: VolumeX },
  { label: "New chat", icon: MessageSquarePlus },
  { label: "Select area", icon: Scan },
];
const WORKSPACE_ACTIVITY = [
  { label: "Comparing flight options to Lisbon", icon: LoaderCircle, state: "running" },
  { label: "Summarized the school email", icon: CheckCircle2, state: "done" },
  { label: "Added dinner reservation reminders", icon: CheckCircle2, state: "done" },
  { label: "Grocery list export canceled", icon: Circle, state: "canceled" },
];
const WORKSPACE_FILES = [
  { label: "lisbon-options.md", icon: FileText },
  { label: "receipt-photo.png", icon: FileImage },
  { label: "meal-plan.txt", icon: FileText },
  { label: "tax-documents.zip", icon: FileArchive },
];
const WORKSPACE_SCHEDULE = [
  { label: "Send weekly family update", meta: "Tomorrow" },
  { label: "Check flight prices", meta: "Fri" },
  { label: "Renew library books", meta: "Mon" },
];

function theme(
  id: string,
  name: string,
  swatches: {
    light: [string, string, string, string, string, string, string, string, string];
    dark: [string, string, string, string, string, string, string, string, string];
  },
): StellaTheme {
  return {
    id,
    name,
    light: makeColors(swatches.light),
    dark: makeColors(swatches.dark),
  };
}

function makeColors(
  swatch: [string, string, string, string, string, string, string, string, string],
): ThemeColors {
  const [background, foreground, primary, success, warning, info, accent, weak, strong] =
    swatch;
  return {
    background,
    backgroundWeak: weak,
    backgroundStrong: strong,
    foreground,
    foregroundWeak: mixHex(background, foreground, 0.42),
    foregroundStrong: mixHex(background, foreground, 0.9),
    primary,
    primaryForeground: background,
    success,
    warning,
    info,
    interactive: primary,
    border: mixHex(background, foreground, 0.18),
    borderWeak: mixHex(background, foreground, 0.08),
    borderStrong: mixHex(background, foreground, 0.28),
    card: mixHex(background, "#ffffff", 0.72),
    muted: mixHex(background, foreground, 0.08),
    accent,
  };
}

function parseHex(color: string): Rgb {
  const value = color.replace("#", "").trim();
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const parsed = Number.parseInt(full, 16);
  if (!Number.isFinite(parsed)) return { r: 128, g: 128, b: 128 };
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function toHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function mixRgb(a: Rgb, b: Rgb, amount: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  };
}

function mixHex(a: string, b: string, amount: number): string {
  return toHex(mixRgb(parseHex(a), parseHex(b), amount));
}

function hexToRgb01(hex: string): Rgb {
  const rgb = parseHex(hex);
  return { r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 };
}

function linearToSrgb(channel: number): number {
  if (channel <= 0.0031308) return channel * 12.92;
  return 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

function srgbToLinear(channel: number): number {
  if (channel <= 0.04045) return channel / 12.92;
  return Math.pow((channel + 0.055) / 1.055, 2.4);
}

function rgb01ToOklch({ r, g, b }: Rgb): OklchColor {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bOk = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const chroma = Math.sqrt(a * a + bOk * bOk);
  let hue = Math.atan2(bOk, a) * (180 / Math.PI);
  if (hue < 0) hue += 360;

  return { l: lightness, c: chroma, h: hue };
}

function oklchToRgb01({ l: lightness, c: chroma, h: hue }: OklchColor): Rgb {
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);

  const l = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const m = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const s = lightness - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l * l * l;
  const m3 = m * m * m;
  const s3 = s * s * s;

  const lr = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return {
    r: linearToSrgb(Math.max(0, lr)),
    g: linearToSrgb(Math.max(0, lg)),
    b: linearToSrgb(Math.max(0, lb)),
  };
}

function oklchToHex(oklch: OklchColor): string {
  const rgb = oklchToRgb01(oklch);
  return toHex({ r: rgb.r * 255, g: rgb.g * 255, b: rgb.b * 255 });
}

function generateScale(seedColor: string, isDark: boolean): string[] {
  const base = rgb01ToOklch(hexToRgb01(seedColor));
  const lightSteps = isDark
    ? [0.15, 0.18, 0.22, 0.26, 0.32, 0.38, 0.46, 0.56, base.l, base.l - 0.05, 0.75, 0.93]
    : [0.99, 0.97, 0.94, 0.9, 0.85, 0.79, 0.72, 0.64, base.l, base.l + 0.05, 0.45, 0.25];
  const chromaMultipliers = isDark
    ? [0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1, 1, 0.9, 0.6]
    : [0.1, 0.15, 0.25, 0.35, 0.45, 0.55, 0.7, 0.85, 1, 1, 0.95, 0.85];

  return lightSteps.map((lightness, index) =>
    oklchToHex({
      l: lightness,
      c: base.c * chromaMultipliers[index],
      h: base.h,
    }),
  );
}

function generateGradientTokens(
  colors: ThemeColors,
  isDark: boolean,
): {
  textInteractive: string;
  surfaceBrandBase: string;
} {
  const interactive = generateScale(colors.interactive, isDark);
  const primary = generateScale(colors.primary, isDark);

  return {
    textInteractive: interactive[isDark ? 10 : 8],
    surfaceBrandBase: primary[8],
  };
}

function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function gradientPalette(colors: ThemeColors, isDark: boolean): Rgb[] {
  const bg = parseHex(colors.background);
  const tokens = generateGradientTokens(colors, isDark);
  const brand = parseHex(tokens.surfaceBrandBase);
  const accent = parseHex(tokens.textInteractive);
  const strength = isDark ? 0.55 : 0.85;
  return [
    mixRgb(bg, brand, strength),
    mixRgb(bg, accent, strength),
    mixRgb(bg, brand, strength * 0.85),
    mixRgb(bg, accent, strength * 0.88),
    mixRgb(bg, brand, strength * 0.9),
  ];
}

function buildBlobs(themeId: string, mode: ThemeMode, colors: ThemeColors): GradientBlob[] {
  if (colors.gradientAnchor) return [];
  const random = seeded(`${themeId}:${mode}`);
  const palette = gradientPalette(colors, mode === "dark");
  return BASE_POSITIONS.map((base, index) => ({
    x: base.x - 0.04 + random() * 0.08,
    y: base.y - 0.04 + random() * 0.08,
    radius: (0.7 + random() * 0.25) * 0.65,
    alpha: 0.25 + random() * 0.15,
    color: palette[index % palette.length],
  }));
}

function renderGradient(
  canvas: HTMLCanvasElement,
  colors: ThemeColors,
  blobs: GradientBlob[],
) {
  const parent = canvas.parentElement;
  const width = parent?.clientWidth ?? 0;
  const height = parent?.clientHeight ?? 0;
  if (!width || !height) return;

  const w = Math.round(width * RENDER_SCALE);
  const h = Math.round(height * RENDER_SCALE);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  canvas.width = w;
  canvas.height = h;

  const bg = parseHex(colors.gradientAnchor ?? colors.background);
  const data = ctx.createImageData(w, h);
  const pixels = data.data;
  const maxDim = Math.max(w, h);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let r = bg.r;
      let g = bg.g;
      let b = bg.b;

      for (const blob of blobs) {
        const dx = x / w - blob.x;
        const dy = y / h - blob.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = blob.radius * (maxDim / w);
        if (distance >= radius) continue;
        const t = distance / radius;
        const falloff = 1 - t * t * t * (t * (t * 6 - 15) + 10);
        const strength = falloff * blob.alpha;
        r += (blob.color.r - r) * strength;
        g += (blob.color.g - g) * strength;
        b += (blob.color.b - b) * strength;
      }

      r += (bg.r - r) * 0.25;
      g += (bg.g - g) * 0.25;
      b += (bg.b - b) * 0.25;

      const idx = (y * w + x) * 4;
      const dither = ((((x * 13 + y * 17) % 29) / 29) - 0.5) * 1.5;
      pixels[idx] = Math.max(0, Math.min(255, Math.round(r + dither)));
      pixels[idx + 1] = Math.max(0, Math.min(255, Math.round(g + dither)));
      pixels[idx + 2] = Math.max(0, Math.min(255, Math.round(b + dither)));
      pixels[idx + 3] = 255;
    }
  }

  ctx.putImageData(data, 0, 0);
}

function cssVars(colors: ThemeColors, mode: ThemeMode, themeId: string): CSSProperties {
  const isDark = mode === "dark";
  const isPearl = themeId === "pearl";
  const isNoir = themeId === "noir";
  const panelBgGradient = isPearl
    ? `linear-gradient(to bottom, color-mix(in srgb, ${colors.foreground} 2%, ${colors.background}), color-mix(in srgb, ${colors.foreground} 4%, ${colors.background}))`
    : isNoir
      ? `linear-gradient(to bottom, color-mix(in srgb, ${colors.foreground} 4%, ${colors.background}), color-mix(in srgb, ${colors.foreground} 7%, ${colors.background}))`
      : isDark
        ? `linear-gradient(to bottom, color-mix(in srgb, ${colors.background} 14%, transparent), color-mix(in srgb, ${colors.background} 22%, transparent))`
        : `linear-gradient(to bottom, color-mix(in srgb, ${colors.background} 12%, transparent), color-mix(in srgb, ${colors.background} 18%, transparent))`;
  const panelBorder = isPearl
    ? `color-mix(in srgb, ${colors.foreground} 9%, ${colors.background})`
    : isNoir
      ? `color-mix(in srgb, ${colors.foreground} 13%, ${colors.background})`
      : `color-mix(in srgb, ${colors.foreground} ${isDark ? "13%" : "9%"}, transparent)`;
  const panelHighlight = isPearl
    ? "inset 0 1px 0 color-mix(in srgb, white 70%, transparent)"
    : isNoir
      ? `inset 0 1px 0 color-mix(in srgb, ${colors.foreground} 9%, transparent)`
      : isDark
        ? "inset 0 1px 0 color-mix(in oklch, white 10%, transparent)"
        : "inset 0 1px 0 color-mix(in oklch, white 42%, transparent)";
  return {
    "--mock-background": colors.background,
    "--mock-foreground": colors.foreground,
    "--mock-primary": colors.primary,
    "--mock-primary-foreground": colors.primaryForeground,
    "--mock-accent": colors.accent,
    "--mock-border": colors.border,
    "--mock-border-weak": colors.borderWeak,
    "--mock-text-strong": `color-mix(in srgb, ${colors.foreground} 95%, transparent)`,
    "--mock-text-base": `color-mix(in srgb, ${colors.foreground} ${isDark ? "72%" : "75%"}, transparent)`,
    "--mock-text-weak": `color-mix(in srgb, ${colors.foreground} ${isDark ? "45%" : "50%"}, transparent)`,
    "--mock-text-weaker": `color-mix(in srgb, ${colors.foreground} ${isDark ? "32%" : "35%"}, transparent)`,
    "--mock-panel-bg-gradient": panelBgGradient,
    "--mock-panel-border": panelBorder,
    "--mock-nav-hover": `color-mix(in oklch, ${colors.foreground} 8%, transparent)`,
    "--mock-shadow": isDark
      ? "0 1px 2px rgba(0, 0, 0, 0.28), 0 4px 10px rgba(0, 0, 0, 0.2), 0 12px 28px rgba(0, 0, 0, 0.14)"
      : "0 1px 2px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.04)",
    "--mock-panel-highlight": panelHighlight,
  } as CSSProperties;
}

export function HomeDesktopMock() {
  const [themeId, setThemeId] = useState("pearl");
  const mode: ThemeMode = "light";
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const chatCanvasRef = useRef<HTMLCanvasElement>(null);
  const fadeCanvasRef = useRef<HTMLCanvasElement>(null);
  const miniFadeRef = useRef<HTMLCanvasElement>(null);
  const chatFadeRef = useRef<HTMLCanvasElement>(null);
  const firstPaintRef = useRef(true);
  const selectedTheme = THEMES.find((candidate) => candidate.id === themeId) ?? THEMES[0];
  const resolvedMode = selectedTheme.forcedMode ?? mode;
  const colors = selectedTheme[resolvedMode];
  const vars = useMemo(
    () => cssVars(colors, resolvedMode, selectedTheme.id),
    [colors, resolvedMode, selectedTheme.id],
  );

  const paint = useCallback(() => {
    const blobs = buildBlobs(selectedTheme.id, resolvedMode, colors);
    for (const canvas of [canvasRef.current, miniCanvasRef.current, chatCanvasRef.current]) {
      if (canvas) renderGradient(canvas, colors, blobs);
    }
  }, [colors, resolvedMode, selectedTheme.id]);

  // Repaint on theme change. After the first paint, crossfade between themes:
  // snapshot the outgoing gradient onto an overlay canvas, repaint the base
  // with the new theme, then fade the overlay out (the chrome colors ease via
  // CSS transitions over the same window).
  useEffect(() => {
    const pairs: Array<[HTMLCanvasElement | null, HTMLCanvasElement | null]> = [
      [canvasRef.current, fadeCanvasRef.current],
      [miniCanvasRef.current, miniFadeRef.current],
      [chatCanvasRef.current, chatFadeRef.current],
    ];

    if (firstPaintRef.current) {
      firstPaintRef.current = false;
      paint();
      return;
    }

    for (const [base, fade] of pairs) {
      if (!base || !fade) continue;
      fade.width = base.width;
      fade.height = base.height;
      const ctx = fade.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, fade.width, fade.height);
        ctx.drawImage(base, 0, 0);
      }
      fade.style.transition = "none";
      fade.style.opacity = "1";
    }

    paint();

    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        for (const [, fade] of pairs) {
          if (!fade) continue;
          fade.style.transition = "opacity 620ms ease";
          fade.style.opacity = "0";
        }
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [paint]);

  // Drive the theme from scroll position: as this section travels up through
  // the viewport, step through a curated palette journey. Not pinned — the
  // section scrolls normally; only the theme changes.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const travel = rect.height + vh;
      const p = Math.min(Math.max((vh - rect.top) / travel, 0), 1);
      const idx = Math.min(
        SCROLL_THEMES.length - 1,
        Math.floor(p * SCROLL_THEMES.length),
      );
      const next = SCROLL_THEMES[idx];
      setThemeId((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => paint());
    for (const canvas of [canvasRef.current, miniCanvasRef.current, chatCanvasRef.current]) {
      if (canvas?.parentElement) observer.observe(canvas.parentElement);
    }
    return () => observer.disconnect();
  }, [paint]);

  const renderComposer = (showContext = true, className?: string) => (
    <div className={className ? `${styles.composerWrap} ${className}` : styles.composerWrap}>
      {showContext ? (
        <div className={styles.contextStrip}>
          {CONTEXT_CHIPS.map(({ label, iconSrc }) => (
            <button
              key={label}
              type="button"
              className={styles.contextChip}
              title={`Add ${label} as context`}
            >
              <span className={styles.contextPlus} aria-hidden="true">
                +
              </span>
              <Image
                className={styles.contextIcon}
                src={iconSrc}
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
                draggable={false}
              />
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.composer}>
        <div className={styles.composerForm}>
          <button type="button" className={styles.composerButton} aria-label="Add context">
            <Plus size={16} strokeWidth={2.25} />
          </button>
          <span className={styles.placeholder}>Ask me anything...</span>
          <button type="button" className={styles.micButton} aria-label="Start dictation">
            <Mic size={15} strokeWidth={1.9} />
          </button>
          <button type="button" className={styles.submitButton} aria-label="Send">
            <ArrowUp size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderHomeCenter = (className?: string) => (
    <div className={className ? `${styles.homeContent} ${className}` : styles.homeContent}>
      <h3>Good afternoon</h3>
      {renderComposer()}
      <button type="button" className={styles.backToChat}>
        <span>Back to chat</span>
        <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );

  const renderChatCenter = () => (
    <div className={styles.chatContent}>
      <div className={styles.chatTranscript} aria-label="Stella chat mock conversation">
        <div className={styles.userMessage}>Can you help plan Saturday around the school form and dinner?</div>
        <div className={styles.assistantRow}>
          <p className={styles.assistantMessage}>
            Yes. I found the form deadline, a dinner slot near the theater, and a grocery route that fits.
          </p>
        </div>
        <div className={styles.userMessage}>Text Mom the plan and make a short checklist.</div>
        <div className={styles.assistantRow}>
          <p className={styles.assistantMessage}>
            Drafted the message and made a checklist with tickets, the form, groceries, and the reservation.
          </p>
        </div>
        <div className={styles.userMessage}>Turn the receipt into a spreadsheet too.</div>
        <div className={styles.assistantRow}>
          <p className={styles.assistantMessage}>
            Done. I added item totals and highlighted the cheaper store.
          </p>
        </div>
      </div>
      {renderComposer(true, styles.chatComposerWrap)}
    </div>
  );

  const renderWorkspacePanel = () => (
    <div className={styles.workspacePanelFrame}>
      <aside className={styles.workspacePanel} aria-label="Workspace panel mock">
        <section className={styles.workspaceSection}>
          <header className={styles.workspaceSectionHeader}>
            <span className={styles.workspaceSectionTitle}>Actions</span>
          </header>
          <div className={styles.workspaceActionsBody}>
            <ul className={styles.workspaceList}>
              {WORKSPACE_ACTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <button type="button" className={styles.workspaceActionRow}>
                      <span className={styles.workspaceActionIcon} aria-hidden="true">
                        <Icon size={15} strokeWidth={1.8} />
                      </span>
                      <span className={styles.workspaceActionLabel}>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <div className={styles.workspaceDivider} />

        <section className={styles.workspaceSection}>
          <header className={styles.workspaceSectionHeader}>
            <span className={styles.workspaceSectionTitle}>Activity</span>
          </header>
          <ul className={`${styles.workspaceList} ${styles.workspaceTaskList}`}>
            {WORKSPACE_ACTIVITY.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className={styles.workspaceTaskRow}>
                  <span className={styles.workspaceTaskIconWrap} aria-hidden="true">
                    <Icon
                      size={15}
                      strokeWidth={2}
                      className={styles.workspaceTaskIcon}
                      data-state={item.state}
                    />
                  </span>
                  <span className={styles.workspaceTaskLabel}>{item.label}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <div className={styles.workspaceDivider} />

        <section className={styles.workspaceSection}>
          <header className={styles.workspaceSectionHeader}>
            <span className={styles.workspaceSectionTitle}>Files</span>
          </header>
          <ul className={styles.workspaceList}>
            {WORKSPACE_FILES.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className={styles.workspaceRow}>
                  <button type="button" className={styles.workspaceFileButton}>
                    <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                    <span className={styles.workspaceFileName}>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <div className={styles.workspaceDivider} />

        <section className={styles.workspaceSection}>
          <header className={styles.workspaceSectionHeader}>
            <span className={styles.workspaceSectionTitle}>Schedule</span>
          </header>
          <ul className={styles.workspaceList}>
            {WORKSPACE_SCHEDULE.map((item) => (
              <li key={item.label} className={styles.workspaceRow}>
                <span className={styles.workspaceRowLabel}>{item.label}</span>
                <span className={styles.workspaceRowMeta}>{item.meta}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );

  return (
    <section className="grid-shell section-border" ref={sectionRef}>
      <div className={styles.shell}>
        <div className={styles.showcase}>
          <div
            className={styles.window}
            style={vars}
            data-mode={resolvedMode}
            data-theme={selectedTheme.id}
          >
            <canvas ref={canvasRef} className={styles.gradient} aria-hidden="true" />
            <canvas
              ref={fadeCanvasRef}
              className={`${styles.gradient} ${styles.gradientFade}`}
              aria-hidden="true"
            />
            <header className={styles.topbar}>
              <div className={styles.topbarLeft}>
                <nav className={styles.nav} aria-label="Stella mock apps">
                  {NAV_ITEMS.map((item) => (
                    <span
                      key={item}
                      className={styles.navItem}
                      data-active={item === "Home" ? "true" : undefined}
                    >
                      {item}
                    </span>
                  ))}
                </nav>
              </div>
              <div className={styles.profileCluster}>
                <button type="button" className={styles.accountButton}>
                  <span className={styles.avatar}>A</span>
                  <span>Alex</span>
                  <ChevronDown size={13} strokeWidth={1.8} />
                </button>
                <button type="button" className={styles.iconButton} aria-label="Settings">
                  <Settings size={14} strokeWidth={1.75} />
                </button>
              </div>
              <div className={styles.topbarRight}>
                <button type="button" className={styles.iconButton} aria-label="Open workspace panel">
                  <PanelRight size={15} strokeWidth={1.75} />
                </button>
              </div>
            </header>

            <main className={styles.homeSurface}>
              {renderHomeCenter()}
            </main>
          </div>

          <div className={styles.miniStage}>
            <div
              className={styles.miniWindow}
              style={vars}
              data-mode={resolvedMode}
              data-theme={selectedTheme.id}
            >
              <canvas ref={chatCanvasRef} className={styles.gradient} aria-hidden="true" />
              <canvas
                ref={chatFadeRef}
                className={`${styles.gradient} ${styles.gradientFade}`}
                aria-hidden="true"
              />
              <header className={styles.miniTopbar} aria-label="Stella mini chat window" />
              <main className={styles.chatSurface}>{renderChatCenter()}</main>
            </div>
          </div>

          <div
            className={styles.workspaceStage}
            style={vars}
            data-mode={resolvedMode}
            data-theme={selectedTheme.id}
          >
            {renderWorkspacePanel()}
          </div>
        </div>
      </div>
    </section>
  );
}
