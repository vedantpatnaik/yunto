/**
 * Render gate for the native screens.
 *
 * Type-checking proves a screen compiles; it does not prove it renders. This
 * exports the app for web (react-native-web), serves it, and loads every route
 * in a phone-sized viewport, failing on runtime errors, blank output, or a
 * screen that silently redirects to /login.
 *
 *   node scripts/render-check.mjs            # every route in app/
 *   node scripts/render-check.mjs --shots    # also write PNGs to .render/
 */
import { chromium } from "playwright";
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { staticRoutes } from "./routes.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = "/tmp/yunto-rnweb";
const PORT = 8099;
const SHOTS = process.argv.includes("--shots");
const API = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001/api";

// Route discovery is shared with check-links/gen-routes (scripts/routes.mjs).
// Hardcoding group names here meant renaming a group silently halved coverage
// while still reporting a clean pass — the worst kind of green check.
const list = staticRoutes(path.join(ROOT, "app")).filter((u) => u !== "/login");
if (!list.length) {
  console.log("no generated screens yet");
  process.exit(0);
}

console.log(`building web bundle for ${list.length} routes…`);
execSync(`npx expo export --platform web --output-dir ${OUT}`, { cwd: ROOT, stdio: "pipe" });

// A plain static server 404s on deep links, which would force client-side
// pushState navigation — and that proved flaky, occasionally leaving the
// previous screen mounted and silently "passing" the wrong route. Serving an
// SPA fallback lets each route be a real page load, which is deterministic.
const { createServer } = await import("node:http");
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".ttf": "font/ttf", ".woff2": "font/woff2",
};
/** A request for a build artefact, as opposed to an app route. */
const isAsset = (u) => u.startsWith("/_expo/") || /\.[a-z0-9]+$/i.test(u);

const httpServer = createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  const file = path.join(OUT, url);
  let exists = false;
  try { exists = fs.statSync(file).isFile(); } catch { exists = false; }

  if (exists) {
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
    const stream = fs.createReadStream(file);
    stream.on("error", () => { res.destroy(); });
    stream.pipe(res);
    return;
  }

  // A missing asset must 404. Serving the HTML shell in its place makes the
  // browser parse HTML as JavaScript and report "Unexpected token '<'" on every
  // single route — which looks like a mass app failure rather than one stale file.
  if (isAsset(url)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("not found");
    return;
  }

  // App route: serve the shell, re-read so a rebuilt bundle is picked up.
  // Read BEFORE writing headers — writing them first and then failing means the
  // error path tries to write headers twice (ERR_HTTP_HEADERS_SENT).
  let shell;
  try {
    shell = fs.readFileSync(path.join(OUT, "index.html"));
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("index.html missing — the export did not complete");
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(shell);
});
await new Promise((r) => httpServer.listen(PORT, r));
const stop = () => { try { httpServer.close(); } catch {} };
process.on("exit", stop);

const token = await fetch(`${API}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@yunto.com", password: "password123" }),
})
  .then((r) => r.json())
  .then((j) => j.token)
  .catch(() => null);

if (!token) console.warn("! could not log in — screens needing data will look empty");

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript((t) => { if (t) localStorage.setItem("yunto_token", t); }, token);
if (SHOTS) fs.mkdirSync(path.join(ROOT, ".render"), { recursive: true });

const problems = [];
let errors = [];

/** Bound per page, since a crashed page is replaced by a fresh one mid-run. */
function attachListeners(p) {
  p.on("pageerror", (e) => errors.push(`JS: ${e.message.slice(0, 110)}`));
  p.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    // A blocked request is NOT noise to swallow: it means the screen rendered
    // with no data, which looks identical to a screen that renders correctly.
    // The API origin must allow-list this harness (see server CORS_ORIGIN).
    if (/CORS|Access-Control/i.test(t)) {
      errors.push("API blocked by CORS — add this origin to the server allowlist");
      return;
    }
    if (/Failed to load resource|ERR_FAILED/i.test(t)) return;
    errors.push(`console: ${t.slice(0, 110)}`);
  });
}

let page = null;

// Confirm the API is reachable before judging any screen, so an unreachable
// backend is reported once rather than as N misleading "renders fine" passes.
const apiOk = await fetch(`${API}/health`.replace("/api/health", "/health")).then((r) => r.ok).catch(() => false);
if (!apiOk) console.warn(`! API not reachable at ${API} — data-driven screens will look empty`);

/** Chromium can be OOM-killed when the machine is busy; rebuild and continue. */
async function ensurePage() {
  if (page && !page.isClosed()) return page;
  page = await ctx.newPage();
  attachListeners(page);
  return page;
}

for (const route of list) {
  errors = [];
  try {
    page = await ensurePage();
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(900);
  } catch (e) {
    // A closed target means the browser died, not that the screen is broken —
    // retry once on a fresh page before judging the route.
    if (/closed|crashed/i.test(String(e))) {
      page = await ensurePage();
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(900);
    } else {
      problems.push({ route, issues: [`navigation failed: ${String(e).slice(0, 80)}`] });
      console.log(`FAIL ${route.padEnd(46)} navigation failed`);
      continue;
    }
  }

  const info = await page.evaluate(() => ({
    len: document.body.innerText.trim().length,
    path: location.pathname,
    text: document.body.innerText.replace(/\s+/g, " ").slice(0, 60),
  }));

  const issues = [...errors];
  if (info.len < 25) issues.push(`blank (${info.len} chars)`);
  if (info.path.includes("login") && !route.includes("login")) issues.push("redirected to /login");

  if (issues.length) problems.push({ route, issues });
  const mark = issues.length ? "FAIL" : "ok  ";
  console.log(`${mark} ${route.padEnd(46)} ${info.text}`);

  if (SHOTS) {
    await page.screenshot({ path: path.join(ROOT, ".render", route.replace(/\//g, "_").replace(/^_/, "") + ".png") });
  }
}

await browser.close();
stop();

console.log(`\n${list.length} routes | ${problems.length} with problems`);
for (const p of problems) console.log(`  ${p.route}: ${p.issues.slice(0, 2).join(" | ")}`);
process.exit(problems.length ? 1 : 0);
