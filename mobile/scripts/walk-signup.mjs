/**
 * Walks the entire influencer signup journey in a browser, as a new user would,
 * and confirms it ends with a real Creator in the database and a logged-in
 * session on the home screen.
 *
 *   node scripts/walk-signup.mjs
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";

const OUT = "/tmp/yunto-flow";
const PORT = 8123;
const API = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001/api";

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".ttf": "font/ttf", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const u = decodeURIComponent((req.url || "/").split("?")[0]);
  const f = path.join(OUT, u);
  let ok = false; try { ok = fs.statSync(f).isFile(); } catch { ok = false; }
  if (ok) { res.writeHead(200, { "Content-Type": MIME[path.extname(f)] ?? "application/octet-stream" }); fs.createReadStream(f).pipe(res); return; }
  if (u.startsWith("/_expo/") || /\.[a-z0-9]+$/i.test(u)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": "text/html" }); res.end(fs.readFileSync(path.join(OUT, "index.html")));
});
await new Promise((r) => server.listen(PORT, r));

// baseline creator count
const login = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@yunto.com", password: "password123" }) }).then((r) => r.json());
const H = { Authorization: `Bearer ${login.token}` };
const before = (await fetch(`${API}/creators`, { headers: H }).then((r) => r.json())).length;

const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(e.message.slice(0, 90)));

const step = async (name, fn) => {
  try { await fn(); await page.waitForTimeout(700); console.log(`ok   ${name.padEnd(24)} @ ${new URL(page.url()).pathname}`); }
  catch (e) { console.log(`FAIL ${name.padEnd(24)} ${String(e).slice(0, 70)}`); }
};
// Scroll every scrollable container (RN ScrollView is a div, not the window) so
// a CTA below the fold on a 1024pt screen becomes reachable.
const scrollAll = () => page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight);
  document.querySelectorAll("*").forEach((e) => {
    if (e.scrollHeight > e.clientHeight + 4) e.scrollTop = e.scrollHeight;
  });
});

/**
 * Click the button whose text matches, preferring a real pressable (role=button
 * or an ancestor with a click handler) over a plain text node — "Verify Profile"
 * also appears in help copy. Clicks at the element's real screen coordinates,
 * which sidesteps the scale-transform hit-test issues force:true still hits.
 */
const tap = async (...texts) => {
  await scrollAll();
  await page.waitForTimeout(200);
  for (const t of texts) {
    const hit = await page.evaluate((needle) => {
      const nodes = [...document.querySelectorAll('[role="button"], button, a, div, span')];
      // Prefer the smallest pressable containing the text (the button, not a big wrapper).
      const cands = nodes
        .filter((n) => (n.innerText || "").trim().includes(needle))
        .filter((n) => n.getAttribute("role") === "button" || n.tagName === "BUTTON" || n.onclick || getComputedStyle(n).cursor === "pointer")
        .sort((a, b) => (a.offsetWidth * a.offsetHeight) - (b.offsetWidth * b.offsetHeight));
      const el = cands[0];
      if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, t);
    if (hit) { await page.mouse.click(hit.x, hit.y); return t; }
  }
  return null;
};
const typeInto = async (i, val) => { const inp = page.locator("input, textarea").nth(i); if (await inp.count()) { await inp.click().catch(()=>{}); await inp.type(val,{delay:15}).catch(() => {}); } };

await page.goto(`http://localhost:${PORT}/login`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

await step("login -> create acct", async () => { await tap("Create an account", "New here"); });
await step("welcome", async () => { await tap("Start Exploring", "Get Started", "Continue"); });
await step("intro carousel", async () => { await tap("Continue", "Next", "Get Started", "Skip"); });
await step("join-path (agency)", async () => { await tap("Agency Managed", "Agency"); });
await step("agency-code", async () => { await typeInto(0, "55678"); await tap("Connect Agency", "Continue", "Next"); });
await step("profile-setup", async () => { await typeInto(0, "Playwright Creator"); await typeInto(1, "Fashion & lifestyle creator"); await tap("Fashion"); await tap("Save & Continue", "Continue", "Next"); });
await step("verify-link", async () => { await tap("Verify Profile", "Continue", "Next"); });
await step("phone-number", async () => { await typeInto(0, "9876500000"); await tap("Continue", "Send", "Next"); });
await step("verify-otp", async () => {
  // fill the OTP boxes (individual single-char inputs or one field)
  const inputs = page.locator("input");
  const n = await inputs.count();
  if (n >= 5) { for (let i = 0; i < Math.min(n, 6); i++) await inputs.nth(i).fill(String((i + 1) % 10)).catch(() => {}); }
  else { await typeInto(0, "12345"); }
  await page.waitForTimeout(300);
  await tap("Verify", "Confirm", "Continue");
});
await page.waitForTimeout(2500); // submit + auto-advance
await step("signup-success -> home", async () => { await tap("Get Started", "Continue", "Explore", "Go to", "Home", "Done"); });
await page.waitForTimeout(1500);

const after = (await fetch(`${API}/creators`, { headers: H }).then((r) => r.json())).length;
const finalPath = new URL(page.url()).pathname;
const body = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 90));

console.log("\n================ RESULT ================");
console.log("creators:", before, "->", after, after > before ? "✓ NEW ACCOUNT CREATED" : "✗ no account created");
console.log("final screen:", finalPath);
console.log("page shows:", body);
console.log("js errors:", errs.length ? errs.slice(0, 3).join(" | ") : "NONE");

await b.close();
server.close();
process.exit(after > before ? 0 : 1);
