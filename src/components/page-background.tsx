/* Site-wide ambient background:
 *   - a soft blue linear gradient pinned to the top of the viewport that
 *     fades out roughly halfway through the home hero (hero is
 *     `min-height: calc(100svh - 4rem)`), and
 *   - three elongated rounded-triangle blue blurs drifting across the
 *     upper band of the page.
 *
 * Fixed to the viewport, rendered behind everything via `z-index: -1`,
 * and hidden in `html[data-embedded="true"]` so the Stella desktop
 * webview's own theme canvas can show through. */
export function PageBackground() {
  return (
    <div className="page-background" aria-hidden="true">
      <div className="page-background__wash" />
      <svg
        className="page-background__blurs"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMin slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id="page-background-blur"
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
          >
            <feGaussianBlur stdDeviation="55" />
          </filter>
        </defs>
        <g filter="url(#page-background-blur)">
          {/* Upper-left, pointing right toward center. */}
          <polygon
            points="-60,80 540,160 80,380"
            fill="#6ec3f0"
            opacity="0.55"
          />
          {/* Center, pointing down — the darkest of the three so it
              anchors the middle of the band. */}
          <polygon
            points="640,40 1060,90 870,440"
            fill="#2e7fd0"
            opacity="0.45"
          />
          {/* Upper-right, pointing left back toward center. */}
          <polygon
            points="1660,110 1100,180 1520,420"
            fill="#7cc8f2"
            opacity="0.5"
          />
        </g>
      </svg>
    </div>
  );
}
