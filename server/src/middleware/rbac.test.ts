/**
 * Unit tests for the RBAC middleware.
 * No test framework is installed, so this uses Node's built-in runner:
 *   npx tsx --test src/middleware/rbac.test.ts
 */
import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./error";
import { can, requirePermission, requireRole } from "./rbac";

type Handler = (req: Request, res: Response, next: NextFunction) => void;

/** Runs a middleware against a fake request; returns the thrown error, or null if next() was called. */
function run(handler: Handler, role: string | undefined, method = "GET"): HttpError | null {
  const req = { method, user: role ? { sub: "u1", role } : undefined } as unknown as Request;
  let called = false;
  try {
    handler(req, {} as Response, (() => {
      called = true;
    }) as NextFunction);
  } catch (err) {
    return err as HttpError;
  }
  assert.ok(called, "middleware neither threw nor called next()");
  return null;
}

test("can(): SUPER_ADMIN passes everything", () => {
  assert.equal(can("SUPER_ADMIN", "write", "invoices"), true);
  assert.equal(can("SUPER_ADMIN", "write", "users"), true);
  assert.equal(can("SUPER_ADMIN", "read", "anything-unlisted"), true);
});

test("can(): reads are open to every authenticated role", () => {
  assert.equal(can("SALES_EMPLOYEE", "read", "invoices"), true);
  assert.equal(can("OPS_EMPLOYEE", "read", "users"), true);
});

test("can(): writes on sensitive resources are restricted", () => {
  assert.equal(can("SALES_EMPLOYEE", "write", "invoices"), false);
  assert.equal(can("OPS_EMPLOYEE", "write", "users"), false);
  assert.equal(can("SALES_MANAGER", "write", "invoices"), true);
  assert.equal(can("OPS_EMPLOYEE", "write", "leads"), false);
  assert.equal(can("SALES_EMPLOYEE", "write", "leads"), true);
});

test("can(): unlisted resources stay open, missing role is denied", () => {
  assert.equal(can("OPS_EMPLOYEE", "write", "notes"), true);
  assert.equal(can(undefined, "read", "notes"), false);
});

test("requireRole(): allows a listed role and SUPER_ADMIN", () => {
  assert.equal(run(requireRole("SALES_MANAGER"), "SALES_MANAGER"), null);
  assert.equal(run(requireRole("SALES_MANAGER"), "SUPER_ADMIN"), null);
});

test("requireRole(): denies an unlisted role with 403", () => {
  const err = run(requireRole("SALES_MANAGER", "OPS_MANAGER"), "OPS_EMPLOYEE");
  assert.ok(err instanceof HttpError);
  assert.equal(err.status, 403);
});

test("requireRole(): unauthenticated defers to 401, not 403", () => {
  const err = run(requireRole("SALES_MANAGER"), undefined);
  assert.ok(err instanceof HttpError);
  assert.equal(err.status, 401);
});

test("requirePermission(): reads allowed, sensitive writes denied", () => {
  assert.equal(run(requirePermission("invoices"), "SALES_EMPLOYEE", "GET"), null);
  const err = run(requirePermission("invoices"), "SALES_EMPLOYEE", "POST");
  assert.ok(err instanceof HttpError);
  assert.equal(err.status, 403);
});

test("requirePermission(): the seeded demo admin is never blocked", () => {
  for (const method of ["GET", "POST", "PATCH", "DELETE"]) {
    for (const resource of ["users", "invoices", "contracts", "leads", "campaigns", "notes"]) {
      assert.equal(run(requirePermission(resource), "SUPER_ADMIN", method), null);
    }
  }
});
