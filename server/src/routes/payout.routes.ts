import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { payoutDetailWriteSchema } from "../lib/schemas";

export const payoutRouter = Router();
payoutRouter.use(requireAuth);

/**
 * Payout / billing details — deliberately NOT the generic crudRouter.
 *
 * PayoutDetail stores a bank account number, so there must be no way to list
 * every user's row and no `/:id` lookup to guess at. The resource is therefore
 * a singleton mounted at /payout-details, and every query below filters on the
 * caller's own `req.user.sub` — the same owner-scoping notifications.routes.ts
 * uses. A user can only ever read or write their own record.
 *
 * The row is created on first write (upsert), because the two screens that fill
 * it in — Bank Details and the invoice "Your Details" form — each supply half
 * the fields and either may go first.
 */

/** Masked tail of the account number, for the read-only Bank Details card. */
function maskAccount(accountNumber: string | null): string | null {
  if (!accountNumber) return null;
  const digits = accountNumber.replace(/\s/g, "");
  return digits.length <= 4 ? digits : `•••• •••• •••• ${digits.slice(-4)}`;
}

/** The row as the owner sees it: the stored columns plus the masked helper. */
function present(row: { accountNumber: string | null } & Record<string, unknown>) {
  return { ...row, accountNumberMasked: maskAccount(row.accountNumber) };
}

/** The caller's own payout details, or null when they have not saved any yet. */
payoutRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const row = await prisma.payoutDetail.findUnique({ where: { userId: req.user!.sub } });
    res.json(row ? present(row) : null);
  })
);

/** Create or update the caller's own payout details. PUT and PATCH behave the
 *  same way — both merge the supplied keys into the caller's single row. */
const save = asyncHandler(async (req: AuthedRequest, res) => {
  const data = payoutDetailWriteSchema.parse(req.body) as Record<string, unknown>;
  // The shared `obj()` helper in lib/schemas.ts is .passthrough(), so any extra
  // key in the body reaches Prisma. `userId` and `id` are identity, not payload:
  // left in, a caller could re-point their own row at another user, handing that
  // user their bank account number (and losing their own row). Ownership comes
  // from the JWT subject below and from nothing the client can send.
  delete data.userId;
  delete data.id;
  const userId = req.user!.sub;
  const row = await prisma.payoutDetail.upsert({
    where: { userId },
    update: data,
    create: { ...data, userId },
  });
  res.json(present(row));
});

payoutRouter.put("/", save);
payoutRouter.patch("/", save);
payoutRouter.post("/", save);

/** Remove the caller's own payout details. */
payoutRouter.delete(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.payoutDetail.deleteMany({ where: { userId: req.user!.sub } });
    res.status(204).end();
  })
);
