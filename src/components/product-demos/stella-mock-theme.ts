import type { SectionKey, SectionToggles } from "./stella-app-mock-types";
import {
  resolveStellaMockThemeConfig,
  type StellaMockThemeConfig,
  type StellaMockThemeId,
} from "./stella-mock-theme-tokens";

export type { StellaMockThemeConfig, StellaMockThemeId };

export function resolveStellaMockThemeId(
  toggles: SectionToggles,
): StellaMockThemeId | null {
  return resolveStellaMockThemeConfig(toggles)?.id ?? null;
}

export { resolveStellaMockThemeConfig };

export type MobileSelfModVariant =
  | "default"
  | "rail"
  | "tabs"
  | "dashboard"
  | "cozy";

export function resolveMobileSelfModThemeConfig(
  variant: MobileSelfModVariant,
): StellaMockThemeConfig | null {
  if (variant === "cozy") return null;

  const toggles: SectionToggles = {
    sidebar: variant === "rail",
    header: variant === "tabs",
    messages: variant === "dashboard",
    composer: false,
    createApp: false,
  };
  return resolveStellaMockThemeConfig(toggles);
}

export function resolveMobileSelfModThemeId(
  variant: MobileSelfModVariant,
): StellaMockThemeId | null {
  return resolveMobileSelfModThemeConfig(variant)?.id ?? null;
}

export function resolveStellaMockThemeFromActiveSection(
  active: SectionKey | null,
): StellaMockThemeId | null {
  if (!active) return "nightowl";
  const toggles: SectionToggles = {
    sidebar: false,
    header: false,
    messages: false,
    composer: false,
    createApp: false,
    [active]: true,
  };
  return resolveStellaMockThemeId(toggles);
}
