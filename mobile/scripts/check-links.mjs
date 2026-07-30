/**
 * Verifies every internal navigation target resolves to a real route.
 *
 * expo-router fails silently on a bad path — the tap just does nothing — so a
 * typo or a missing flow prefix is invisible until someone taps it. Screens are
 * generated in parallel by different agents, which makes this easy to get wrong.
 *
 *   node scripts/check-links.mjs
 *
 * Exits non-zero when a link points at a route that does not exist. Dynamic
 * targets (template literals) are reported separately: they need a [param]
 * route, which is a different kind of missing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, "app");
const GROUP = path.join(APP, "(app)");

/** Recursively collect .tsx files under a directory. */
function tsxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...tsxFiles(p));
    else if (entry.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

// Route groups — the "(name)" segment is stripped from the URL by expo-router,
// so (app) and (agency) share one namespace and CAN collide.
const GROUPS = ["(app)", "(agency)"];
const routes = new Set(["/", "/login"]);
const owners = new Map(); // url -> [group, …], to catch two files claiming one URL

for (const g of GROUPS) {
  const base = path.join(APP, g);
  for (const f of tsxFiles(base)) {
    const url = "/" + path.relative(base, f).replace(/\.tsx$/, "").split(path.sep).join("/");
    routes.add(url);
    owners.set(url, [...(owners.get(url) ?? []), g]);
  }
}

const collisions = [...owners.entries()].filter(([, gs]) => gs.length > 1);

const NAV = /router\.(?:push|replace|navigate)\(\s*[`"']([^`"')]+)[`"']/g;
const broken = [];
const dynamic = [];

for (const f of tsxFiles(APP)) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(NAV)) {
    const raw = m.group ?? m[1];
    const line = src.slice(0, m.index).split("\n").length;
    const rel = path.relative(APP, f);
    if (raw.includes("${")) { dynamic.push({ rel, line, raw }); continue; }
    const target = raw.split("?")[0].replace(/\/$/, "");
    if (target.startsWith("/") && !routes.has(target)) broken.push({ rel, line, raw });
  }
}

console.log(`${routes.size} routes | ${broken.length} broken | ${dynamic.length} dynamic | ${collisions.length} collisions`);
if (collisions.length) {
  console.log("\nCOLLISIONS — two files claim the same URL (route groups are stripped):");
  for (const [url, gs] of collisions) console.log(`  ${url} <- ${gs.join(", ")}`);
}
if (dynamic.length) {
  console.log("\ndynamic targets (need a [param] route):");
  for (const d of dynamic) console.log(`  ${d.rel}:${d.line} -> ${d.raw}`);
}
if (broken.length) {
  console.log("\nBROKEN — these taps will do nothing:");
  for (const b of broken) console.log(`  ${b.rel}:${b.line} -> ${b.raw}`);
}
process.exit(broken.length || collisions.length ? 1 : 0);
