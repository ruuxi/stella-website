/**
 * Inline script that runs before first paint to:
 *   1. Detect when the page is loaded inside Stella's desktop
 *      `WebContentsView` (`?embedded=1` on first load, persisted to
 *      `sessionStorage` for in-session navigations).
 *   2. Apply the theme tokens passed via URL params or restored from
 *      `sessionStorage` as `--embedded-*` CSS custom properties on
 *      `<html>`.
 *   3. Toggle `data-embedded="true"` so the embedded CSS rules
 *      activate.
 *
 * Lives as a string injected via `dangerouslySetInnerHTML` (rather than
 * a normal client component) so it runs synchronously in the document
 * head — eliminating the flash of the website's default light gradient
 * before React mounts.
 *
 * The sessionStorage step is what lets the Store's `<a href="/store?tab=…">`
 * links keep the embedded look across tab navigations: after the first
 * load tags the session as embedded, every subsequent same-origin
 * navigation in the desktop's WebContentsView restores the same state.
 *
 * Live theme updates (when the user changes themes inside Stella) are
 * handled separately by `embedded-theme-bridge.tsx`, which subscribes
 * to the `stellaDesktopStore.onThemeChanged` preload event and also
 * writes the latest tokens back into `sessionStorage` so this script
 * can restore them on the very next navigation.
 */
const EMBEDDED_INIT_SCRIPT = /* javascript */ `
(() => {
  try {
    var STORAGE_KEY = 'stella-embedded-theme';
    var html = document.documentElement;
    var p = new URLSearchParams(window.location.search);

    var fromUrl = p.get('embedded') === '1';
    var stored = null;
    try {
      var raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch (e) {}

    if (!fromUrl && !stored) return;

    html.setAttribute('data-embedded', 'true');

    var theme = stored && typeof stored === 'object' ? Object.assign({}, stored) : {};
    var pickUrl = function (key) {
      var v = p.get(key);
      return v && v.length > 0 ? v : null;
    };
    var assign = function (target, key, value) {
      if (value && value.length > 0) target[key] = value;
    };
    if (fromUrl) {
      assign(theme, 'fg', pickUrl('fg'));
      assign(theme, 'fgWeak', pickUrl('fg-weak'));
      assign(theme, 'border', pickUrl('border'));
      assign(theme, 'primary', pickUrl('primary'));
      assign(theme, 'surface', pickUrl('surface'));
      assign(theme, 'bg', pickUrl('bg'));
      var modeFromUrl = pickUrl('mode');
      if (modeFromUrl === 'light' || modeFromUrl === 'dark') {
        theme.mode = modeFromUrl;
      }
      try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
      } catch (e) {}
    }

    var setVar = function (name, value) {
      if (value && value.length > 0) html.style.setProperty(name, value);
    };
    setVar('--embedded-fg', theme.fg);
    setVar('--embedded-fg-weak', theme.fgWeak);
    setVar('--embedded-border', theme.border);
    setVar('--embedded-primary', theme.primary);
    setVar('--embedded-surface', theme.surface);
    setVar('--embedded-bg', theme.bg);
    if (theme.mode === 'light' || theme.mode === 'dark') {
      html.style.setProperty('color-scheme', theme.mode);
    }
  } catch (e) {}
})();
`;

export function EmbeddedInitScript() {
  return (
    <script
      // Synchronous, blocking inline script — must run before the body
      // paints so embedded mode never flashes the default gradient.
      dangerouslySetInnerHTML={{ __html: EMBEDDED_INIT_SCRIPT }}
    />
  );
}
