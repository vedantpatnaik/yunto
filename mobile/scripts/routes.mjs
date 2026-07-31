/**
 * Shared route discovery for the tooling scripts.
 *
 * expo-router's rule: a path segment wrapped in parentheses is a *route group*
 * — it organises files without appearing in the URL. Everything else is a real
 * segment. So app/(app)/leads/leads.tsx serves /leads/leads, while
 * app/agency/leads/leads.tsx serves /agency/leads/leads.
 *
 * The scripts previously hardcoded the group names, which meant renaming a
 * group made every route look broken. Deriving it from the rule instead keeps
 * them correct as the tree changes.
 */
import fs from "node:fs";
import path from "node:path";

/** Recursively list .tsx files, skipping partials (_layout and friends). */
export function tsxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...tsxFiles(p));
    else if (e.name.endsWith(".tsx") && !e.name.startsWith("_")) out.push(p);
  }
  return out;
}

/** File path under app/ -> the URL it serves. */
export function urlFor(appDir, file) {
  const rel = path.relative(appDir, file).replace(/\.tsx$/, "");
  const segs = rel
    .split(path.sep)
    .filter((s) => !(s.startsWith("(") && s.endsWith(")"))); // route groups
  // An "index" file serves its parent directory.
  if (segs[segs.length - 1] === "index") segs.pop();
  return "/" + segs.join("/");
}

/**
 * All routes in the app, as { url, file, group }.
 * `group` is the owning top-level directory, used to report collisions.
 */
export function allRoutes(appDir) {
  return tsxFiles(appDir).map((file) => {
    const rel = path.relative(appDir, file);
    return { url: urlFor(appDir, file), file, group: rel.split(path.sep)[0] };
  });
}

/** Routes that can be visited directly (no unresolved [param] segments). */
export function staticRoutes(appDir) {
  return allRoutes(appDir)
    .filter((r) => !r.url.includes("["))
    .map((r) => r.url)
    .filter((u, i, a) => a.indexOf(u) === i)
    .sort();
}
