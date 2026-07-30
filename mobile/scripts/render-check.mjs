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

const server = spawn("python3", ["-m", "http.server", String(PORT)], { cwd: OUT, stdio: "ignore" });
const stop = () => { try { server.kill(); } catch {} };
process.on("exit", stop);

// A static server has no SPA fallback, so deep links 404. Load the root once and
// navigate client-side instead, which is also closer to how the app really runs.
await new Promise((r) => setTimeout(r, 1200));

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
  // CORS noise from the static test origin is a harness artifact: a native app
  // does not enforce CORS, and the deployed web origin is allow-listed.
  if (/CORS|Access-Control|ERR_FAILED|Failed to load resource/i.test(t)) return;
  errors.push(`console: ${t.slice(0, 110)}`);
});

await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

for (const route of list) {
  errors = [];
  await page.evaluate((r) => window.history.pushState({}, "", r), route);
  // Nudge the router to pick up the new location.
  await page.evaluate(() => window.dispatchEvent(new PopStateEvent("popstate")));
  await page.waitForTimeout(700);

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
