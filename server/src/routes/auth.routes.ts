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
