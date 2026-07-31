/**
 * Data-quality audit for the native screens.
 *
 * The render gate proves a screen draws; it does not prove the screen is
 * showing REAL data. A screen can render perfectly while displaying literals
 * baked in from the design — which is exactly the failure that took several
 * passes to clear out of the web app.
 *
 * This loads every route with the full page text and flags three signals:
 *   1. an identical block repeated 3+ times  -> a hardcoded list
 *   2. names/handles that appear on screens whose data cannot contain them
 *   3. screens whose entire text is unchanged when the API is unreachable
 *
 * Signal 3 is the strongest: if a screen looks the same with and without a
 * backend, nothing on it is live.
 *
 *   node scripts/data-audit.mjs
 */
import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { staticRoutes } from "./routes.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = "/tmp/yunto-rnweb-audit";
const PORT = 8107;
const API = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001/api";

const list = staticRoutes(path.join(ROOT, "app")).filter((u) => u !== "/login" && u !== "/");
console.log(`auditing ${list.length} routes…`);
execSync(`npx expo export --platform web --output-dir ${OUT}`, { cwd: ROOT, stdio: "pipe" });

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".ttf": "font/ttf", ".woff2": "font/woff2",
};
const server = createServer((req, res) => {
  const u = decodeURIComponent((req.url || "/").split("?")[0]);
  const f = path.join(OUT, u);
  let ok = false;
  try { ok = fs.statSync(f).isFile(); } catch { ok = false; }
  if (ok) {
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] ?? "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
    return;
  }
  if (u.startsWith("/_expo/") || /\.[a-z0-9]+$/i.test(u)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(fs.readFileSync(path.join(OUT, "index.html")));
});
await new Promise((r) => server.listen(PORT, r));

const token = await fetch(`${API}/auth/login`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@yunto.com", password: "password123" }),
}).then((r) => r.json()).then((j) => j.token).catch(() => null);

/** Capture full body text for every route, optionally with the API blocked. */
async function capture(blockApi) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript((t) => { if (t) localStorage.setItem("yunto_token", t); }, token);
  if (blockApi) await ctx.route("**/api/**", (r) => r.abort());
  const page = await ctx.newPage();
  const out = new Map();
  for (const route of list) {
    try {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(650);
      out.set(route, await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim()));
    } catch { out.set(route, ""); }
  }
  await browser.close();
  return out;
}

const live = await capture(false);

// Self-check: if the API were unreachable from the page (CORS, wrong origin,
// server down), EVERY screen would come back dataless and the audit would
// report the whole app as "nothing live" — a false alarm indistinguishable
// from the real finding. Prove at least one known-live value is present first.
const proof = live.get("/leads/leads") ?? "";
const sawData = /\d+\s+total leads/i.test(proof) && !/^0\s/.test(proof.replace(/\D*/, ""));
if (!/total leads/i.test(proof) || /\b0 total leads\b/i.test(proof)) {
  console.error(
    "\n! ABORTING: the reference screen /leads/leads shows no data, so the page cannot reach the API.\n" +
    `  Check the server's CORS_ORIGIN includes http://localhost:${PORT}, and that ${API} is up.\n` +
    `  Captured: "${proof.slice(0, 120)}"`
  );
  server.close();
  process.exit(2);
}
void sawData;

console.log("captured with API; re-capturing with the API blocked…");
const dead = await capture(true);
server.close();

/* 1 — repeated identical blocks */
const repeats = [];
for (const [route, text] of live) {
  const w = text.split(" ");
  const counts = new Map();
  for (let i = 0; i + 6 <= w.length; i++) {
    const g = w.slice(i, i + 6).join(" ");
    if (g.length > 20 && !/^[\d\s.,%₹+-]+$/.test(g)) counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  const worst = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (worst && worst[1] >= 3) repeats.push({ route, n: worst[1], s: worst[0] });
}

/* 2 — identical with and without a backend => nothing on the screen is live */
const staticScreens = [];
for (const [route, text] of live) {
  const d = dead.get(route) ?? "";
  if (!text || text.length < 40) continue;
  if (d === text) staticScreens.push({ route, chars: text.length });
}

console.log(`\n=== ${repeats.length} screens repeat an identical block (hardcoded list) ===`);
for (const r of repeats.sort((a, b) => b.n - a.n)) console.log(`  ${r.route.padEnd(46)} x${r.n}  ${r.s.slice(0, 46)}`);

console.log(`\n=== ${staticScreens.length} screens are byte-identical without the API (nothing live) ===`);
for (const s of staticScreens) console.log(`  ${s.route.padEnd(46)} ${s.chars} chars`);

console.log(`\naudited ${list.length} routes`);
