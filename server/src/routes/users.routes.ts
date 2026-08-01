import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { requireAuth } from "../middleware/auth";

export const usersRouter = Router();
usersRouter.use(requireAuth);

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().optional(),
  teamId: z.string().optional(),
  targetMonthly: z.number().optional(),
  targetYearly: z.number().optional(),
});

/** Create a team member (default password "password123"). */
usersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const passwordHash = await bcrypt.hash("password123", 10);
    const u = await prisma.user.create({
      data: {
        name: data.name, email: data.email, passwordHash,
        role: (data.role as never) ?? "SALES_EMPLOYEE",
        teamId: data.teamId ?? null, targetMonthly: data.targetMonthly, targetYearly: data.targetYearly,
        agencyCode: "55678",
      },
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(201).json(u);
  })
);

/** Fields a member-edit screen may change. Deliberately excludes passwordHash,
 *  email and agencyCode — only safe, editable profile/target columns. */
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  role: z.string().optional(),
  teamId: z.string().nullable().optional(),
  targetMonthly: z.coerce.number().int().optional(),
  targetYearly: z.coerce.number().int().optional(),
  avatarUrl: z.string().nullable().optional(),
  dateOfBirth: z.coerce.date().nullable().optional(),
  address: z.string().nullable().optional(),
});

/** Update a member (set-target, people/team screens). Returns the sanitized row. */
usersRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const u = await prisma.user.update({
      where: { id: req.params.id },
      data: data as never,
      select: {
        id: true, name: true, email: true, phone: true, role: true, avatarUrl: true,
        targetMonthly: true, targetYearly: true,
        team: { select: { id: true, name: true, kind: true } },
      },
    });
    res.json(u);
  })
);

/** Sanitized employee list for People / Team screens (never exposes passwordHash). */
usersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true, name: true, email: true, phone: true, role: true, avatarUrl: true,
        targetMonthly: true, targetYearly: true, createdAt: true,
        team: { select: { id: true, name: true, kind: true } },
      },
    });
    res.json(users);
  })
);
