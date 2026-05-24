import type { SectionToggles } from "./stella-app-mock-types";

/** Mirrors `desktop/src/shared/theme/themes/types.ts` — light palettes only. */
export type MockThemeColors = {
  background: string;
  backgroundWeak: string;
  backgroundStrong: string;
  foreground: string;
  foregroundWeak: string;
  foregroundStrong: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  border: string;
  borderWeak: string;
  borderStrong: string;
  card: string;
  muted: string;
};

export type StellaMockThemeId =
  | "nightowl"
  | "dracula"
  | "aura"
  | "sage"
  | "catppuccin";

export type MockGradientMode = "soft" | "flat";
export type MockGradientColor = "relative" | "strong";

export type StellaMockThemeConfig = {
  id: StellaMockThemeId;
  colors: MockThemeColors;
  colorMode: "light" | "dark";
  gradientMode: MockGradientMode;
  gradientColor: MockGradientColor;
};

const LIGHT_THEMES: Record<StellaMockThemeId, MockThemeColors> = {
  nightowl: {
    background: "#e7f1fb",
    backgroundWeak: "#dbe8f6",
    backgroundStrong: "#f2f8fd",
    foreground: "#403f53",
    foregroundWeak: "#716f8a",
    foregroundStrong: "#1a1a2e",
    primary: "#4876d6",
    primaryForeground: "#ffffff",
    accent: "#c96765",
    border: "#c9c9c9",
    borderWeak: "#e0e0e0",
    borderStrong: "#9a9a9a",
    card: "rgba(255, 255, 255, 0.9)",
    muted: "#e5e5e5",
  },
  dracula: {
    background: "#eee8ff",
    backgroundWeak: "#e2daf8",
    backgroundStrong: "#f6f2ff",
    foreground: "#1f1f2f",
    foregroundWeak: "#52526b",
    foregroundStrong: "#05040c",
    primary: "#7c6bf5",
    primaryForeground: "#ffffff",
    accent: "#d16090",
    border: "#c4c6ba",
    borderWeak: "#e2e3da",
    borderStrong: "#9fa293",
    card: "rgba(255, 255, 255, 0.85)",
    muted: "#e8e9e0",
  },
  aura: {
    background: "#f5f2ff",
    backgroundWeak: "#ece8fa",
    backgroundStrong: "#faf9ff",
    foreground: "#29263c",
    foregroundWeak: "#605d78",
    foregroundStrong: "#15131f",
    primary: "#a277ff",
    primaryForeground: "#ffffff",
    accent: "#d4943c",
    border: "#c8c3e0",
    borderWeak: "#ddd9f0",
    borderStrong: "#9d98b8",
    card: "rgba(255, 255, 255, 0.9)",
    muted: "#e8e4f5",
  },
  sage: {
    background: "#f4f7f1",
    backgroundWeak: "#eaf0e3",
    backgroundStrong: "#fafcf7",
    foreground: "#1f2a1f",
    foregroundWeak: "#5a6c58",
    foregroundStrong: "#0e150e",
    primary: "#4f7d4f",
    primaryForeground: "#f4f7f1",
    accent: "#cdb98c",
    border: "#d3dfcb",
    borderWeak: "#e3ecdb",
    borderStrong: "#a9bfa1",
    card: "rgba(255, 255, 255, 0.9)",
    muted: "#e6ecde",
  },
  catppuccin: {
    background: "#f5e0dc",
    backgroundWeak: "#f2d8d4",
    backgroundStrong: "#f9e8e4",
    foreground: "#4c4f69",
    foregroundWeak: "#6c6f85",
    foregroundStrong: "#1f1f2a",
    primary: "#7287fd",
    primaryForeground: "#ffffff",
    accent: "#ea76cb",
    border: "#bca6b2",
    borderWeak: "#e0cfd3",
    borderStrong: "#83677f",
    card: "rgba(255, 255, 255, 0.85)",
    muted: "#eed5d0",
  },
};

/** Dark palettes — dashboard (Sage) and create-app (Rosé) demo states. */
const DARK_THEMES: Record<"sage" | "catppuccin", MockThemeColors> = {
  sage: {
    background: "#10180f",
    backgroundWeak: "#0a110a",
    backgroundStrong: "#1a221a",
    foreground: "#dbe5d4",
    foregroundWeak: "#8aa085",
    foregroundStrong: "#f0f5ec",
    primary: "#8fbf8a",
    primaryForeground: "#10180f",
    accent: "#d6c69a",
    border: "#1f2a1f",
    borderWeak: "#161e16",
    borderStrong: "#3a4a38",
    card: "rgba(26, 34, 26, 0.9)",
    muted: "#1a221a",
  },
  catppuccin: {
    background: "#1e1e2e",
    backgroundWeak: "#211f31",
    backgroundStrong: "#1c1c29",
    foreground: "#cdd6f4",
    foregroundWeak: "#a6adc8",
    foregroundStrong: "#f4f2ff",
    primary: "#b4befe",
    primaryForeground: "#1e1e2e",
    accent: "#f5c2e7",
    border: "#4a4763",
    borderWeak: "#35324a",
    borderStrong: "#6e6a8c",
    card: "rgba(48, 46, 72, 0.9)",
    muted: "#313244",
  },
};

const MOCK_THEME_CONFIGS: Record<
  StellaMockThemeId,
  Omit<StellaMockThemeConfig, "id" | "colors" | "colorMode">
> = {
  /* Default idle — Midnight light, soft + relative (Stella defaults). */
  nightowl: { gradientMode: "soft", gradientColor: "relative" },
  /* Workspace rail — Orchid light. */
  dracula: { gradientMode: "soft", gradientColor: "relative" },
  /* Tabs — Velvet light with stronger gradient wash. */
  aura: { gradientMode: "soft", gradientColor: "strong" },
  /* Dashboard — Sage dark, soft + relative gradient. */
  sage: { gradientMode: "soft", gradientColor: "relative" },
  /* Create app — Rosé dark, soft + strong gradient. */
  catppuccin: { gradientMode: "soft", gradientColor: "strong" },
};

const DARK_MODE_THEME_IDS = new Set<StellaMockThemeId>(["sage", "catppuccin"]);

function paletteForTheme(
  id: StellaMockThemeId,
  colorMode: "light" | "dark",
): MockThemeColors {
  if (colorMode === "dark" && (id === "sage" || id === "catppuccin")) {
    return DARK_THEMES[id];
  }
  return LIGHT_THEMES[id];
}

export function resolveStellaMockThemeConfig(
  toggles: SectionToggles,
): StellaMockThemeConfig | null {
  if (toggles.composer) return null;

  let id: StellaMockThemeId = "nightowl";
  if (toggles.createApp) id = "catppuccin";
  else if (toggles.messages) id = "sage";
  else if (toggles.header) id = "aura";
  else if (toggles.sidebar) id = "dracula";

  const preset = MOCK_THEME_CONFIGS[id];
  const colorMode = DARK_MODE_THEME_IDS.has(id) ? "dark" : "light";
  return {
    id,
    colors: paletteForTheme(id, colorMode),
    colorMode,
    ...preset,
  };
}

function buildWindowGradient(config: StellaMockThemeConfig): string {
  if (config.gradientMode === "flat") return "none";

  const isDark = config.colorMode === "dark";
  const primaryStrength =
    config.gradientColor === "strong"
      ? isDark
        ? "22%"
        : "14%"
      : isDark
        ? "10%"
        : "7%";
  const accentStrength =
    config.gradientColor === "strong"
      ? isDark
        ? "16%"
        : "10%"
      : isDark
        ? "8%"
        : "5%";

  return [
    `radial-gradient(120% 90% at 80% 0%, color-mix(in oklch, ${config.colors.primary} ${primaryStrength}, transparent), transparent 60%)`,
    `radial-gradient(90% 80% at 0% 100%, color-mix(in oklch, ${config.colors.accent} ${accentStrength}, transparent), transparent 55%)`,
  ].join(", ");
}

/** CSS custom properties for `.sam-root` — mirrors desktop `index.css` derivations. */
export function themeConfigToSamRootStyle(
  config: StellaMockThemeConfig,
): Record<string, string> {
  const c = config.colors;
  const isDark = config.colorMode === "dark";
  return {
    "--background": c.background,
    "--background-weak": c.backgroundWeak,
    "--background-strong": c.backgroundStrong,
    "--foreground": c.foreground,
    "--primary": c.primary,
    "--primary-foreground": c.primaryForeground,
    "--accent": c.accent,
    "--border": c.border,
    "--card": c.card,
    "--muted": c.muted,
    "--text-strong": `color-mix(in srgb, ${c.foreground} 95%, transparent)`,
    "--text-base": `color-mix(in srgb, ${c.foreground} ${isDark ? "72%" : "75%"}, transparent)`,
    "--text-weak": `color-mix(in srgb, ${c.foreground} ${isDark ? "45%" : "50%"}, transparent)`,
    "--text-weaker": `color-mix(in srgb, ${c.foreground} ${isDark ? "32%" : "35%"}, transparent)`,
    "--border-strong": `color-mix(in srgb, ${c.foreground} 12%, transparent)`,
    "--border-base": `color-mix(in srgb, ${c.foreground} 8%, transparent)`,
    "--border-weak": `color-mix(in srgb, ${c.foreground} 5%, transparent)`,
    "--glass-bg": `color-mix(in srgb, ${c.background} ${isDark ? "55%" : "40%"}, transparent)`,
    "--panel-surface-bg": `color-mix(in srgb, ${c.background} ${isDark ? "62%" : "50%"}, transparent)`,
    "--panel-surface-border": `color-mix(in oklch, ${c.border} 60%, transparent)`,
    "--panel-surface-highlight": isDark
      ? "inset 0 1px 0 color-mix(in oklch, white 10%, transparent)"
      : "inset 0 1px 0 color-mix(in oklch, white 42%, transparent)",
    "--shadow-md": isDark
      ? "0 12px 32px rgba(0, 0, 0, 0.45)"
      : "0 8px 24px rgba(0, 0, 0, 0.08)",
    "--mock-window-gradient": buildWindowGradient(config),
  };
}

/** Mini-window tokens for the mobile self-mod mock. */
export function themeConfigToMiniWindowStyle(
  config: StellaMockThemeConfig,
): Record<string, string> {
  const c = config.colors;
  const isDark = config.colorMode === "dark";
  return {
    "--mini-bg": c.background,
    "--mini-bg-top": c.backgroundStrong,
    "--mini-sidebar-bg": c.backgroundWeak,
    "--mini-surface": c.card,
    "--mini-border": `color-mix(in srgb, ${c.foreground} 8%, transparent)`,
    "--mini-border-strong": `color-mix(in srgb, ${c.foreground} 12%, transparent)`,
    "--mini-text-strong": `color-mix(in srgb, ${c.foreground} 95%, transparent)`,
    "--mini-text-base": `color-mix(in srgb, ${c.foreground} ${isDark ? "72%" : "75%"}, transparent)`,
    "--mini-text-weak": `color-mix(in srgb, ${c.foregroundWeak} ${isDark ? "82%" : "78%"}, transparent)`,
    "--mini-text-weaker": `color-mix(in srgb, ${c.foregroundWeak} ${isDark ? "58%" : "52%"}, transparent)`,
    "--mini-accent": c.primary,
    "--mini-accent-soft": `color-mix(in srgb, ${c.primary} ${isDark ? "18%" : "12%"}, transparent)`,
    "--mini-user-bubble": `color-mix(in srgb, ${c.foreground} ${isDark ? "8%" : "5%"}, transparent)`,
    "--mini-user-bubble-border": `color-mix(in srgb, ${c.foreground} ${isDark ? "14%" : "10%"}, transparent)`,
    "--mock-window-gradient": buildWindowGradient(config),
  };
}
