/**
 * Screenshots every screen at its design height, for side-by-side comparison
 * against the Figma reference in .figma-cache/refs/.
 *
 * The render gate captures a 390x844 viewport, which crops any screen taller
 * than the phone — so a discrepancy below the fold is invisible to it. Here the
 * viewport is set to each screen's own design height so the whole frame is in
 * one image, which is what a reviewer needs to compare against the design.
 *
 *   node scripts/shoot.mjs           # all screens -> .shots/
 *   node scripts/shoot.mjs leads     # only routes containing "leads"
 */
import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { staticRoutes } from "./routes.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = "/tmp/yunto-rnweb-shots";
const SHOTS = path.join(ROOT, ".shots");
const PORT = 8111;
const API = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001/api";
const filter = process.argv[2];

/** route -> design height, read from the <Screen height={...}> the screen declares. */
function designHeights() {
  const map = new Map();
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.name.endsWith(".tsx") || e.name.startsWith("_")) continue;
      const rel = path.relative(path.join(ROOT, "app"), p).replace(/\.tsx$/, "");
      const url = "/" + rel.split(path.sep).filter((s) => !(s.startsWith("(") && s.endsWith(")"))).join("/");
      const src = fs.readFileSync(p, "utf8");
      const m = src.match(/height=\{(\d{3,4})\}/) ?? src.match(/FRAME_H\s*=\s*(\d{3,4})/);
      map.set(url.replace(/\/index$/, "") || "/", m ? Number(m[1]) : 875);
    }
  };
  walk(path.join(ROOT, "app"));
  return map;
}

const heights = designHeights();
let list = staticRoutes(path.join(ROOT, "app")).filter((u) => u !== "/login");
if (filter) list = list.filter((u) => u.includes(filter));
console.log(`shooting ${list.length} screens…`);

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
if (!token) console.warn("! no session — screens will render empty");

fs.mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch();
let done = 0;
for (const route of list) {
  // Cap the viewport: some frames are 1500pt+, and a taller window than the
  // device would never exist is not a fair comparison.
  const h = Math.min(Math.max(heights.get(route) ?? 875, 700), 1600);
  const ctx = await browser.newContext({ viewport: { width: 390, height: Math.round(h * (390 / 375)) } });
  await ctx.addInitScript((t) => { if (t) localStorage.setItem("yunto_token", t); }, token);
  const page = await ctx.newPage();
  try {
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(SHOTS, route.slice(1).replace(/\//g, "__") + ".png") });
    done++;
  } catch (e) {
    console.log(`FAIL ${route}: ${String(e).slice(0, 60)}`);
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(`captured ${done}/${list.length} -> ${path.relative(ROOT, SHOTS)}/`);
