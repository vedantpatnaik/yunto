import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler, HttpError } from "../middleware/error";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

export const detailRouter = Router();
detailRouter.use(requireAuth);

/** Campaign with its assigned creators (+ creator details) and invoices — for the campaign detail screen. */
detailRouter.get(
  "/campaigns/:id/full",
  asyncHandler(async (req, res) => {
    const c = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        agency: true,
        creators: { include: { creator: true } },
        invoices: true,
        contracts: true,
      },
    });
    if (!c) throw new HttpError(404, "Campaign not found");
    res.json({
      ...c,
      creatorList: c.creators.map((cc) => ({
        id: cc.creator.id, name: cc.creator.name, handle: cc.creator.handle,
        followers: cc.creator.followers, avgViews: cc.creator.avgViews,
        engagementRate: cc.creator.engagementRate, stars: cc.creator.stars,
        cpv: cc.creator.cpv, location: cc.creator.location,
        rating: cc.rating, done: cc.done,
      })),
      invoice: c.invoices[0] ?? null,
    });
  })
);

/** Messages in a channel (+ author name) for the chat screen. */
detailRouter.get(
  "/channels/:id/messages",
  asyncHandler(async (req, res) => {
    const msgs = await prisma.message.findMany({
      where: { channelId: req.params.id },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { name: true } } },
    });
    res.json(msgs.map((m) => ({ id: m.id, channelId: m.channelId, body: m.body, createdAt: m.createdAt, authorName: m.author?.name ?? "Member" })));
  })
);

/**
 * Post a message to a channel. Authored by the caller — the client cannot
 * choose an author, so a message can never be attributed to someone else.
 */
detailRouter.post(
  "/channels/:id/messages",
  asyncHandler(async (req, res) => {
    const body = String((req.body as { body?: unknown })?.body ?? "").trim();
    if (!body) throw new HttpError(400, "Message body is required");

    const channel = await prisma.chatChannel.findUnique({ where: { id: req.params.id } });
    if (!channel) throw new HttpError(404, "Channel not found");

    // The JWT carries the user id in `sub` (see lib/jwt.ts) — not `id`.
    const authorId = (req as AuthedRequest).user?.sub ?? null;
    const msg = await prisma.message.create({
      data: { channelId: channel.id, body, authorId },
      include: { author: { select: { name: true } } },
    });
    res.status(201).json({
      id: msg.id, channelId: msg.channelId, body: msg.body,
      createdAt: msg.createdAt, authorName: msg.author?.name ?? "Member",
    });
  })
);

/** Convert a lead into an active campaign (Lead pipeline → Campaign). */
function parseMoney(s?: string | null): number {
  if (!s) return 0;
  const m = s.replace(/[₹,\s]/g, "");
  const n = parseFloat(m);
  if (Number.isNaN(n)) return 0;
  if (/m/i.test(m)) return Math.round(n * 1_000_000);
  if (/k/i.test(m)) return Math.round(n * 1_000);
  return Math.round(n);
}
detailRouter.post(
  "/leads/:id/convert",
  asyncHandler(async (req, res) => {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) throw new HttpError(404, "Lead not found");
    const campaign = await prisma.campaign.create({
      data: {
        name: `${lead.brandName} Campaign`,
        brandName: lead.brandName,
        agencyId: lead.agencyId,
        status: "ACTIVE",
        progress: 0,
        budget: parseMoney(lead.money),
        engagementRate: lead.engagementRate ?? undefined,
        contactPerson: lead.contactPerson ?? undefined,
        peopleCount: lead.peopleCount,
      },
    });
    await prisma.lead.update({ where: { id: lead.id }, data: { status: "CONVERTED" } });
    res.status(201).json({ campaign, leadId: lead.id });
  })
);
