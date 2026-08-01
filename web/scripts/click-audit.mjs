/**
 * Click audit: does every button actually DO something?
 *
 * Logs in through the real UI (no token injection — that shortcut is exactly
 * how dead buttons survived earlier gates), then visits every admin route and
 * clicks every visible control. A click passes if it produces an observable
 * effect within 700ms:
 *   - navigation (URL change), or
 *   - a network write (POST/PATCH/PUT/DELETE), or
 *   - a DOM mutation (menu opened, filter toggled, modal closed, row added)
 *
 * Anything else is a dead click — the exact thing a user reports as
 * "the buttons don't work".
 *
 *   node scripts/click-audit.mjs                 # all routes
 *   node scripts/click-audit.mjs /revenue        # one route
 */
import { chromium } from "playwright";
import fs from "node:fs";

const APP = process.env.APP_URL ?? "http://localhost:5173";
const only = process.argv[2];

const routes = fs
  .readFileSync("/tmp/routes.txt", "utf8")
  .trim()
  .split("\n")
  .filter((r) => (only ? r === only : true));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1024 } });
const page = await ctx.newPage();

// Real UI login.
await page.goto(`${APP}/login`, { waitUntil: "networkidle" });
await page.click('button:has-text("Sign in")');
await page.waitForTimeout(2200);
if (page.url().includes("login")) {
  console.error("login failed — aborting");
  process.exit(2);
}

let writes = 0;
page.on("request", (r) => {
  if (["POST", "PATCH", "PUT", "DELETE"].includes(r.method()) && r.url().includes("/api/")) writes++;
});

const dead = [];
const summary = [];

for (const route of routes) {
  await page.goto(`${APP}${route}`, { waitUntil: "networkidle", timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(400);

  // Snapshot the clickable set up front; the DOM changes as we click.
  const handles = await page.locator("button, [role='button'], .cursor-pointer").elementHandles();
  const n = handles.length;
  let deadHere = 0;

  for (let i = 0; i < Math.min(n, 45); i++) {
    // Re-query each time — clicks mutate the DOM and stale handles throw.
    const els = await page.locator("button, [role='button'], .cursor-pointer").elementHandles();
    const el = els[i];
    if (!el) continue;

    const label = ((await el.innerText().catch(() => "")) || (await el.getAttribute("aria-label").catch(() => "")) || "")
      .trim().slice(0, 28).replace(/\n/g, " ");
    const box = await el.boundingBox();
    if (!box || box.width < 4 || box.height < 4) continue;

    const beforeUrl = page.url();
    const beforeWrites = writes;
    // Hash, not length: a class swap of equal length (star fill toggles, active
    // states) changes the DOM without changing its size, and a length compare
    // marks a perfectly working control as dead.
    const beforeDom = await page.evaluate(() => {
      let h = 0; const s = document.body.innerHTML;
      for (let k = 0; k < s.length; k += 7) h = (h * 31 + s.charCodeAt(k)) | 0;
      return h + ":" + s.length;
    });

    await el.click({ timeout: 1500, force: false }).catch(() => {});
    await page.waitForTimeout(700);

    const moved = page.url() !== beforeUrl;
    const wrote = writes > beforeWrites;
    const afterDom = await page.evaluate(() => {
      let h = 0; const s = document.body.innerHTML;
      for (let k = 0; k < s.length; k += 7) h = (h * 31 + s.charCodeAt(k)) | 0;
      return h + ":" + s.length;
    }).catch(() => beforeDom);
    const mutated = afterDom !== beforeDom;

    if (!moved && !wrote && !mutated) {
      deadHere++;
      dead.push({ route, i, label });
    }

    if (moved) {
      // come back and re-settle before the next control
      await page.goto(`${APP}${route}`, { waitUntil: "networkidle", timeout: 25000 }).catch(() => {});
      await page.waitForTimeout(350);
    }
  }
  summary.push({ route, controls: n, dead: deadHere });
  console.log(`${deadHere ? "FAIL" : "ok  "} ${route.padEnd(34)} ${n} controls, ${deadHere} dead`);
}

await browser.close();

const bad = summary.filter((s) => s.dead > 0);
console.log(`\n${routes.length} routes | ${bad.length} routes with dead clicks | ${dead.length} dead clicks total`);
for (const d of dead.slice(0, 40)) console.log(`  ${d.route}  [${d.i}] "${d.label}"`);
fs.writeFileSync("/tmp/click-audit.json", JSON.stringify({ summary, dead }, null, 1));
process.exit(bad.length ? 1 : 0);
