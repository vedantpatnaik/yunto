import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { crudRouter } from "../lib/crud";
import { authRouter } from "./auth.routes";
import { statsRouter } from "./stats.routes";
import { usersRouter } from "./users.routes";
import { detailRouter } from "./detail.routes";

export const router = Router();

router.use("/auth", authRouter);
router.use("/stats", statsRouter);
router.use("/users", usersRouter);
router.use("/", detailRouter);

// Permissive create/update validation for scaffolded resources — Prisma enforces
// the column types; tighten these per-resource as the product hardens.
const body = z.object({}).passthrough();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resources: [string, any][] = [
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

for (const [path, model] of resources) {
  router.use(`/${path}`, crudRouter(model, body, body));
}
