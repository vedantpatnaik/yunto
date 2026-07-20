/**
 * Agency — Sales Home  (Figma frame 7756:8845, "Sales- Home", 375×2504).
 *
 * ⚠️ PLACEHOLDER — NOT the pixel-perfect reproduction.
 *
 * The exact geometry for this screen could not be reconstructed: at build time
 * every channel to the Figma design was exhausted and returned no interior data.
 *   • REST /v1/files/.../nodes   → HTTP 429, retry-after ≈ 397305s (~4.6 days),
 *                                  x-figma-rate-limit-type: low (Starter plan
 *                                  cost budget exhausted on the shared token;
 *                                  /v1/me still 200s, so the token is valid —
 *                                  only the metered node/image endpoints fail).
 *   • REST /v1/images            → HTTP 429, same shared budget / retry window.
 *   • Figma MCP (get_metadata /  → hard-blocked: "reached the Figma MCP tool
 *     get_screenshot)               call limit on the Starter plan".
 *   • Cached depth-2 file dump    → this frame appears only as a childless leaf
 *                                  (id 7756:8845, bbox 375×2504); every visible
 *                                  element lives in children never fetched, and
 *                                  no rendered PNG of it exists on disk.
 *
 * Per the hard rule ("real geometry from the Figma REST API — never eyeballed"),
 * this screen must NOT be invented. It is stubbed at the correct dimensions
 * (390px wide, 2504px tall) so routing can be wired, and must be rebuilt once
 * the Figma REST budget resets or the file is fetched with a paid token. This
 * mirrors the sibling AdminHomePage stub, which hit the identical blocker.
 *
 * The only real data used below is the frame size and the design-system page
 * background token (`bg-page-grad`, the canonical yunto-dashboard backdrop).
 */
export default function SalesHomePage() {
  return (
    <div className="relative w-[390px] bg-page-grad" style={{ height: 2504 }}>
      <div className="absolute inset-x-0 top-[300px] flex flex-col items-center gap-[10px] px-[32px] text-center font-sans">
        <span className="text-[18px] font-medium text-ink">Sales Home</span>
        <span className="text-[13px] font-light leading-[18px] text-ink-70">
          Figma frame 7756:8845 · 375×2504
        </span>
        <span className="text-[12px] font-light leading-[17px] text-ink-60">
          Awaiting Figma design data — the REST and MCP endpoints were
          rate-limited at build time, so the exact layout could not be
          reproduced. Rebuild this screen once the Figma budget resets.
        </span>
      </div>
    </div>
  );
}
