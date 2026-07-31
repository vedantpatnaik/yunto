import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { asyncHandler, HttpError } from "../middleware/error";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

export const authRouter = Router();

function sanitize(u: User) {
  const { passwordHash, ...rest } = u;
  return rest;
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
});

authRouter.post("/register", asyncHandler(async (req, res) => {
  const { email, password, name, phone } = registerSchema.parse(req.body);
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new HttpError(409, "Email already registered");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, name, phone } });
  res.status(201).json({ token: signToken({ sub: user.id, role: user.role }), user: sanitize(user) });
}));

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

authRouter.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, "Invalid credentials");
  }
  res.json({ token: signToken({ sub: user.id, role: user.role }), user: sanitize(user) });
}));

authRouter.get("/me", requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) throw new HttpError(404, "Not found");
  res.json(sanitize(user));
}));

/**
 * The only fields a user may change about themselves. Deliberately a whitelist,
 * not `.partial()` of the User model: role, email, teamId and passwordHash must
 * stay unreachable from a self-service PATCH.
 */
const updateMeSchema = z.object({
  targetMonthly: z.number().int().nonnegative().nullable().optional(),
  targetYearly: z.number().int().nonnegative().nullable().optional(),
});

/**
 * Update the caller's own profile — the revenue target set from the mobile
 * home sheet. Self-scoped exactly like GET /me: the row is chosen by the token
 * subject and never by anything in the body, so one user can never write
 * another's. Mounted under /auth, which carries no RBAC policy entry, so an
 * employee can set their own target without manager rights on /users.
 *
 * Returns the same sanitized user shape GET /auth/me returns.
 */
authRouter.patch("/me", requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  const data = updateMeSchema.parse(req.body);
  const user = await prisma.user.update({ where: { id: req.user!.sub }, data });
  res.json(sanitize(user));
}));
