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

/**
 * Influencer onboarding — turns the accumulated signup flow into a real account.
 *
 * The creator app signs up by phone, niche and (optionally) an agency code, not
 * by email/password, so this creates BOTH the auth identity (a User, e-mail
 * synthesized from the handle so login still has a key) AND the Creator profile
 * that shows up in the roster. If an agencyCode matches an agency, the creator
 * is linked to it (agency-managed); otherwise they are solo. Returns a token so
 * the app lands the new user straight on the home screen, logged in.
 */
const onboardSchema = z.object({
  name: z.string().min(1),
  handle: z.string().optional(),
  phone: z.string().optional(),
  niche: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  joinPath: z.enum(["agency", "solo"]).optional(),
  agencyCode: z.string().optional(),
});

authRouter.post("/onboard", asyncHandler(async (req, res) => {
  const data = onboardSchema.parse(req.body);
  const handle = (data.handle || data.name).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "creator";
  // Synthesize a login key; keep it unique if the handle is taken.
  let email = `${handle}@creators.yunto.app`;
  if (await prisma.user.findUnique({ where: { email } })) {
    email = `${handle}.${Date.now().toString(36)}@creators.yunto.app`;
  }
  // Agency-managed if the code matches a real agency's code (seed uses "55678").
  const agency = data.agencyCode
    ? await prisma.agency.findFirst({ where: { OR: [{ id: data.agencyCode }, { name: data.agencyCode }] } })
    : null;

  const passwordHash = await bcrypt.hash(`otp-${handle}`, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name: data.name, phone: data.phone ?? null },
  });
  const creator = await prisma.creator.create({
    data: {
      name: data.name,
      handle: handle.startsWith("@") ? handle : `@${handle}`,
      niche: data.niche ?? null,
      location: data.location ?? null,
      agencyId: agency?.id ?? null,
      listed: true,
    },
  });
  res.status(201).json({
    token: signToken({ sub: user.id, role: user.role }),
    user: sanitize(user),
    creator,
    joinedAgency: agency?.name ?? null,
  });
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
