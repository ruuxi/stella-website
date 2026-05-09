"use client";

import { useEffect } from "react";

/**
 * Listens for live theme updates from the Stella desktop app. When the
 * user changes themes inside Stella, the desktop pushes a fresh set of
 * tokens through the preload bridge (`stellaDesktopStore.onThemeChanged`),
 * and we apply them as `--embedded-*` custom properties on `<html>`
 * without reloading the embedded view.
 *
 * Pairs with `embedded-init-script.tsx`, which handles first paint via
 * the URL query string. Render once near the top of the tree (e.g. in
 * the root layout); the bridge is a no-op when the page isn't loaded
 * inside Stella's desktop `WebContentsView`.
 */
export type EmbeddedTheme = {
  mode?: "light" | "dark";
  foreground?: string;
  foregroundWeak?: string;
  border?: string;
  primary?: string;
  surface?: string;
  background?: string;
};

type StellaDesktopStoreBridge = {
  onThemeChanged?: (
    callback: (theme: EmbeddedTheme) => void,
  ) => (() => void) | void;
};

const applyTheme = (theme: EmbeddedTheme) => {
  const html = document.documentElement;
  const setVar = (name: string, value: string | undefined) => {
    if (value && value.trim().length > 0) {
      html.style.setProperty(name, value);
    }
  };
  setVar("--embedded-fg", theme.foreground);
  setVar("--embedded-fg-weak", theme.foregroundWeak);
  setVar("--embedded-border", theme.border);
  setVar("--embedded-primary", theme.primary);
  setVar("--embedded-surface", theme.surface);
  setVar("--embedded-bg", theme.background);
  if (theme.mode === "light" || theme.mode === "dark") {
    html.style.setProperty("color-scheme", theme.mode);
  }
};

export function EmbeddedThemeBridge() {
  useEffect(() => {
    if (document.documentElement.getAttribute("data-embedded") !== "true") {
      return;
    }
    const bridge = (
      window as Window & { stellaDesktopStore?: StellaDesktopStoreBridge }
    ).stellaDesktopStore;
    if (!bridge?.onThemeChanged) return;
    const unsubscribe = bridge.onThemeChanged((theme) => {
      if (theme && typeof theme === "object") applyTheme(theme);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return null;
}
