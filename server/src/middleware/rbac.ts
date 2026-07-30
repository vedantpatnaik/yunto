import type { NextFunction, RequestHandler, Response } from "express";
import type { Role } from "@prisma/client";
import { requireAuth, type AuthedRequest } from "./auth";
import { HttpError } from "./error";

/**
 * Role-based access control.
 *
 * Design notes (this layer was retro-fitted onto a live app, so it is deliberately
 * fail-open at the edges):
 *  - SUPER_ADMIN always passes every check. The seeded demo account
 *    (admin@yunto.com) is SUPER_ADMIN, so no existing screen can be affected.
 *  - Resources absent from POLICY are unrestricted. Adding a route never
 *    silently locks it; you opt in by adding a policy entry.
 *  - Reads are open to every authenticated role. Only writes are gated.
 */

export const SUPER_ADMIN: Role = "SUPER_ADMIN";

export type Action = "read" | "write";

/** Every authenticated role. */
const ALL: readonly Role[] = [
  "SUPER_ADMIN",
  "SALES_MANAGER",
  "SALES_EMPLOYEE",
  "OPS_MANAGER",
  "OPS_EMPLOYEE",
];

/** Anyone with people/budget authority. */
const MANAGERS: readonly Role[] = ["SUPER_ADMIN", "SALES_MANAGER", "OPS_MANAGER"];

/** The sales side of the house. */
const SALES: readonly Role[] = ["SUPER_ADMIN", "SALES_MANAGER", "SALES_EMPLOYEE"];

/** The delivery side of the house. */
const OPS: readonly Role[] = ["SUPER_ADMIN", "SALES_MANAGER", "OPS_MANAGER", "OPS_EMPLOYEE"];

export type Rule = { readonly read: readonly Role[]; readonly write: readonly Role[] };

/**
 * resource -> who may read / write it. Keys match the REST path segment used in
 * routes/index.ts. Anything not listed here is unrestricted for authenticated users.
 */
export const POLICY: Readonly<Record<string, Rule>> = {
  // Org structure, identity and money — managers only.
  agencies: { read: ALL, write: MANAGERS },
  teams: { read: ALL, write: MANAGERS },
  users: { read: ALL, write: MANAGERS },
  contracts: { read: ALL, write: MANAGERS },
  invoices: { read: ALL, write: MANAGERS },
  leaves: { read: ALL, write: MANAGERS },

  // Pipeline — sales owns it.
  leads: { read: ALL, write: SALES },

  // Delivery — ops owns it, sales managers still need to spin campaigns up.
  campaigns: { read: ALL, write: OPS },
  creators: { read: ALL, write: OPS },

  // Everything else (contacts, polls, reminders, channels, calendar, notes) is
  // day-to-day collaboration and stays open to any authenticated user.
};

/** Does `role` have permission to perform `action` on `resource`? */
export function can(role: string | undefined, action: Action, resource: string): boolean {
  if (!role) return false;
  if (role === SUPER_ADMIN) return true;
  const rule = POLICY[resource];
  if (!rule) return true; // unlisted resource => not restricted
  return (rule[action] as readonly string[]).includes(role);
}

/** True for HTTP verbs that only observe state. */
function actionForMethod(method: string): Action {
  return method === "GET" || method === "HEAD" || method === "OPTIONS" ? "read" : "write";
}

/**
 * Express middleware: 403s unless the caller's JWT role is one of `roles`.
 * SUPER_ADMIN always passes. An unauthenticated request is *not* a 403 — it
 * falls through to the existing 401 from requireAuth.
 */
export function requireRole(...roles: Role[]): RequestHandler {
  return ((req: AuthedRequest, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) throw new HttpError(401, "Missing token"); // same 401 requireAuth raises
    if (role === SUPER_ADMIN) return next();
    if (roles.length && !(roles as readonly string[]).includes(role)) {
      throw new HttpError(403, "Forbidden");
    }
    next();
  }) as RequestHandler;
}

/**
 * Express middleware: enforces POLICY[resource] for the request's HTTP verb.
 * Reads pass for any authenticated user; writes consult the policy table.
 */
export function requirePermission(resource: string): RequestHandler {
  return ((req: AuthedRequest, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) throw new HttpError(401, "Missing token"); // same 401 requireAuth raises
    if (!can(role, actionForMethod(req.method), resource)) {
      throw new HttpError(403, "Forbidden");
    }
    next();
  }) as RequestHandler;
}

/**
 * Auth + policy for a resource, ready to spread into `router.use(path, ...guard(x))`.
 * requireAuth is included so the policy check always sees a populated req.user
 * (it is idempotent — downstream routers re-running it is harmless).
 */
export function guard(resource: string): RequestHandler[] {
  return [requireAuth as RequestHandler, requirePermission(resource)];
}
