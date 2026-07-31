/**
 * Verifies every internal navigation target resolves to a real route.
 *
 * expo-router fails silently on a bad path — the tap just does nothing — so a
 * typo or a missing prefix is invisible until someone tries it. Screens are
 * generated in parallel by different agents, which makes this easy to get wrong.
 *
 *   node scripts/check-links.mjs
 *
 * Exits non-zero on a broken link or a URL claimed by two files. Dynamic
 * targets (template literals) are listed separately: they need a [param]
 * route, which is a different kind of missing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { allRoutes, tsxFiles } from "./routes.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, "app");

const routeList = allRoutes(APP);
const routes = new Set(routeList.map((r) => r.url));

// Two files can serve one URL when a route group is stripped, e.g.
// (app)/campaigns/x.tsx and agency/campaigns/x.tsx would both be /campaigns/x.
// expo-router silently picks one, so the other screen is unreachable.
const byUrl = new Map();
for (const r of routeList) byUrl.set(r.url, [...(byUrl.get(r.url) ?? []), r.group]);
const collisions = [...byUrl.entries()].filter(([, gs]) => gs.length > 1);

const NAV = /router\.(?:push|replace|navigate)\(\s*[`"']([^`"')]+)[`"']/g;
const broken = [];
const dynamic = [];

for (const f of tsxFiles(APP)) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(NAV)) {
    const raw = m[1];
    const line = src.slice(0, m.index).split("\n").length;
    const rel = path.relative(APP, f);
    if (raw.includes("${")) { dynamic.push({ rel, line, raw }); continue; }
    const target = raw.split("?")[0].replace(/\/$/, "") || "/";
    if (target.startsWith("/") && !routes.has(target)) broken.push({ rel, line, raw });
  }
}

console.log(
  `${routes.size} routes | ${broken.length} broken | ${dynamic.length} dynamic | ${collisions.length} collisions`
);
if (collisions.length) {
  console.log("\nCOLLISIONS — two files claim one URL (route groups are stripped):");
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
