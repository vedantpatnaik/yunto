import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler, HttpError } from "../middleware/error";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

/**
 * Every handler below scopes its `where` by the caller's own userId, so a user can
 * never read or mutate another user's notifications — including by guessing an id.
 * Single-row writes use updateMany/deleteMany (not update/delete) precisely because
 * that lets userId join the filter; a zero count then means "not yours or gone" → 404.
 */

/** Current user's notifications, newest first, plus the unread badge count. */
notificationsRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const userId = req.user!.sub;
    const take = Math.min(Number(req.query.take) || 50, 200);
    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);
    res.json({ items, unreadCount });
  })
);

/** Mark all of the current user's unread notifications read. */
notificationsRouter.post(
  "/read-all",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { count } = await prisma.notification.updateMany({
      where: { userId: req.user!.sub, read: false },
      data: { read: true },
    });
    res.json({ updated: count });
  })
);

/** Mark one notification read; returns the updated row. */
notificationsRouter.patch(
  "/:id/read",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { count } = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.sub },
      data: { read: true },
    });
    if (!count) throw new HttpError(404, "Not found");
    res.json(await prisma.notification.findUnique({ where: { id: req.params.id } }));
  })
);

/** Delete one notification. */
notificationsRouter.delete(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { count } = await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.user!.sub },
    });
    if (!count) throw new HttpError(404, "Not found");
    res.status(204).end();
  })
);
