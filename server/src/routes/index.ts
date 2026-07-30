import { Router } from "express";
import { prisma } from "../lib/prisma";
import { crudRouter, type CrudOptions } from "../lib/crud";
import { schemas, type ResourceName } from "../lib/schemas";
import { authRouter } from "./auth.routes";
import { statsRouter } from "./stats.routes";
import { usersRouter } from "./users.routes";
import { detailRouter } from "./detail.routes";
import { notificationsRouter } from "./notifications.routes";
import { uploadsRouter } from "./uploads.routes";
import { guard } from "../middleware/rbac";

export const router = Router();

router.use("/auth", authRouter);
router.use("/stats", statsRouter);
// Reads stay open to every authenticated user; writes (POST /users creates a
// team member) are gated to managers by the policy table in middleware/rbac.ts.
// SUPER_ADMIN — the seeded demo admin — always passes.
router.use("/users", ...guard("users"), usersRouter);
router.use("/notifications", notificationsRouter);
// Unlisted in POLICY, so guard() is auth-only today — it just keeps the mount
// consistent and lets uploads be locked down later by adding a policy entry.
router.use("/uploads", ...guard("uploads"), uploadsRouter);
router.use("/", detailRouter);

// Create/update bodies are validated per resource by lib/schemas.ts (derived from
// the Prisma models). The schemas coerce numbers/dates, check enum members, and
// still pass unknown keys through to Prisma, so no existing caller is narrowed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resources: [ResourceName, any, CrudOptions?][] = [
  // Plan catalogue is small and sorted by price so the pricing table reads in order.
  ["plans", prisma.subscriptionPlan, { orderBy: { price: "asc" } }],
  // Attendance has no createdAt column — it must sort on `date` or Prisma throws.
  ["attendance", prisma.attendance, { orderBy: { date: "desc" } }],
  ["agencies", prisma.agency],
  ["creators", prisma.creator],
  ["leads", prisma.lead],
  ["campaigns", prisma.campaign],
  ["contacts", prisma.contact],
  ["contracts", prisma.contract],
  ["invoices", prisma.invoice],
  ["polls", prisma.poll],
  ["reminders", prisma.reminder],
  ["teams", prisma.team],
  ["leaves", prisma.leave],
  ["channels", prisma.chatChannel],
  ["calendar", prisma.calendarContent],
  ["notes", prisma.note],
];

// `guard` runs requireAuth then the RBAC policy check. GET/HEAD are always
// permitted for authenticated users, so every existing read path is unchanged;
// only POST/PATCH/DELETE on resources listed in POLICY can now 403.
for (const [path, model, opts] of resources) {
  const { create, update } = schemas[path];
  router.use(`/${path}`, ...guard(path), crudRouter(model, create, update, opts));
}
