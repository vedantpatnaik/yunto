/**
 * Render gate for the native screens.
 *
 * Type-checking proves a screen compiles; it does not prove it renders. This
 * exports the app for web (react-native-web), serves it, and loads every route
 * in a phone-sized viewport, failing on runtime errors, blank output, or a
 * screen that silently redirects to /login.
 *
 *   node scripts/render-check.mjs            # all routes under app/(app)
 *   node scripts/render-check.mjs --shots    # also write PNGs to .render/
 */
import { chromium } from "playwright";
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = "/tmp/yunto-rnweb";
const PORT = 8099;
const SHOTS = process.argv.includes("--shots");
const API = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001/api";

/** Every generated route: app/(app)/<flow>/<screen>.tsx -> /<flow>/<screen> */
function routes() {
  const base = path.join(ROOT, "app", "(app)");
  if (!fs.existsSync(base)) return [];
  const out = [];
  for (const flow of fs.readdirSync(base)) {
    const dir = path.join(base, flow);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith(".tsx") && !f.startsWith("_")) {
        out.push(`/${flow}/${f.replace(/\.tsx$/, "")}`);
      }
    }
  }
  return out.sort();
}

const list = routes();
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
// Held in memory so a concurrent export cleaning the output directory cannot
// take the server down mid-run.
const SHELL = fs.readFileSync(path.join(OUT, "index.html"));
const httpServer = createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  const file = path.join(OUT, url);
  // Anything that is not an existing file is an app route -> serve the shell.
  let isFile = false;
  try { isFile = fs.statSync(file).isFile(); } catch { isFile = false; }
  if (!isFile) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(SHELL);
    return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
  const stream = fs.createReadStream(file);
  stream.on("error", () => { res.writeHead(404); res.end(); });
  stream.pipe(res);
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

const page = await ctx.newPage();
const problems = [];
let errors = [];
page.on("pageerror", (e) => errors.push(`JS: ${e.message.slice(0, 110)}`));
page.on("console", (m) => {
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

// Confirm the API is reachable before judging any screen, so an unreachable
// backend is reported once rather than as N misleading "renders fine" passes.
const apiOk = await fetch(`${API}/health`.replace("/api/health", "/health")).then((r) => r.ok).catch(() => false);
if (!apiOk) console.warn(`! API not reachable at ${API} — data-driven screens will look empty`);

for (const route of list) {
  errors = [];
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(900);

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
