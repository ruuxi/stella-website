/**
 * Inline script that runs before first paint to:
 *   1. Detect when the page is loaded inside Stella's desktop
 *      `WebContentsView` (URL contains `?embedded=1`).
 *   2. Apply the theme tokens passed via URL params as `--embedded-*`
 *      CSS custom properties on `<html>`.
 *   3. Toggle `data-embedded="true"` so the embedded CSS rules
 *      activate.
 *
 * Lives as a string injected via `dangerouslySetInnerHTML` (rather than
 * a normal client component) so it runs synchronously in the document
 * head — eliminating the flash of the website's default light gradient
 * before React mounts.
 *
 * Live theme updates (when the user changes themes inside Stella) are
 * handled separately by `embedded-theme-bridge.tsx`, which subscribes
 * to the `stellaDesktopStore.onThemeChanged` preload event.
 */
const EMBEDDED_INIT_SCRIPT = /* javascript */ `
(() => {
  try {
    var p = new URLSearchParams(window.location.search);
    if (p.get('embedded') !== '1') return;

    var html = document.documentElement;
    html.setAttribute('data-embedded', 'true');

    var setVar = function (name, value) {
      if (value && value.length > 0) {
        html.style.setProperty(name, value);
      }
    };

    setVar('--embedded-fg', p.get('fg'));
    setVar('--embedded-fg-weak', p.get('fg-weak'));
    setVar('--embedded-border', p.get('border'));
    setVar('--embedded-primary', p.get('primary'));
    setVar('--embedded-surface', p.get('surface'));
    setVar('--embedded-bg', p.get('bg'));

    var mode = p.get('mode');
    if (mode === 'light' || mode === 'dark') {
      html.style.setProperty('color-scheme', mode);
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
