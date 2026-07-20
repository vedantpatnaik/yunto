/**
 * Agency — Manager App  (Figma frame 507:24003, "Agency/ Manager App",
 * 375×812, rendered inside the 390px MobileFrame).
 *
 * ⚠️ PLACEHOLDER — NOT the pixel-perfect reproduction.
 *
 * The exact geometry for this screen could not be reconstructed: at build time
 * every channel to the Figma design returned no interior data.
 *   • REST /v1/files/.../nodes   → HTTP 429, retry-after ≈ 391328s (~4.5 days),
 *                                  x-figma-plan-tier: starter,
 *                                  x-figma-rate-limit-type: low (shared-token
 *                                  cost budget exhausted). /v1/me still 200s, so
 *                                  the token is valid — only the metered
 *                                  node/image endpoints fail.
 *   • REST /v1/images            → HTTP 429, same shared budget / retry window.
 *   • Figma MCP (get_metadata /  → hard-blocked: "reached the Figma MCP tool
 *     get_screenshot)               call limit on the Starter plan".
 *   • Cached depth-2 file dump    → this frame appears only as a childless leaf
 *                                  (id 507:24003, bbox 375×812); every visible
 *                                  element lives in children never fetched, and
 *                                  no rendered PNG of it exists on disk.
 *
 * Per the hard rule ("real geometry from the Figma REST API — never eyeballed"),
 * this screen must NOT be invented. It is stubbed at the correct dimensions
 * (390px wide, 812px tall) so routing can be wired, and must be rebuilt once the
 * Figma REST budget resets or the file is fetched with a paid token. This
 * mirrors the sibling SalesHomePage / AdminHomePage stubs, which hit the
 * identical blocker.
 *
 * The only real data used below is the frame size (375×812) and the
 * design-system page background token (`bg-page-grad`, the canonical
 * yunto-dashboard backdrop).
 */
export default function AgencyManagerAppPg() {
  return (
    <div className="relative w-[390px] bg-page-grad font-sans" style={{ height: 812 }}>
      <div className="absolute inset-x-0 top-[300px] flex flex-col items-center gap-[10px] px-[32px] text-center">
        <span className="text-[18px] font-medium text-ink">Agency Manager App</span>
        <span className="text-[13px] font-light leading-[18px] text-ink-70">
          Figma frame 507:24003 · 375×812
        </span>
        <span className="text-[12px] font-light leading-[17px] text-ink-60">
          Awaiting Figma design data — the REST and MCP endpoints were
          rate-limited (HTTP 429, ~4.5 day retry window) at build time, so the
          exact layout could not be reproduced. Rebuild this screen once the
          Figma budget resets.
        </span>
      </div>
    </div>
  );
}
