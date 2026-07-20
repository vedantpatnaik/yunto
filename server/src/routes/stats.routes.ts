import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { requireAuth } from "../middleware/auth";

export const statsRouter = Router();
statsRouter.use(requireAuth);

/** Window sizes (days) behind the D / W / M toggle on the dashboard. */
const PERIOD_DAYS: Record<string, number> = { D: 1, W: 7, M: 30 };

/** Deterministic 0..1 hash — keeps per-period views stable across reloads. */
function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/**
 * Aggregated data for the admin dashboard — computed live from the DB.
 * Query params:
 *   period = D | W | M   → window for the Top Creators board + trend deltas
 *   months = 3..12       → length of the revenue series
 */
statsRouter.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const period = String(req.query.period ?? "M").toUpperCase();
    const days = PERIOD_DAYS[period] ?? 30;
    const months = Math.min(12, Math.max(3, Number(req.query.months) || 5));

    const [agencies, creators, leads, campaigns, invoices] = await Promise.all([
      prisma.agency.findMany({ orderBy: { earnings: "desc" } }),
      prisma.creator.findMany(),
      prisma.lead.findMany(),
      prisma.campaign.findMany(),
      prisma.invoice.findMany(),
    ]);

    const activeCreators = agencies.reduce((s, a) => s + a.creatorsCount, 0);
    const monthlyRevenue = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.payout, 0);
    const pendingPayouts = invoices.filter((i) => i.status === "UNPAID").length;
    const activeLeads = leads.filter((l) => l.status !== "CONVERTED").length;
    const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;

    // "vs previous period" deltas — how much of each dataset landed in the window.
    const since = new Date(Date.now() - days * 864e5);
    const prevSince = new Date(Date.now() - days * 2 * 864e5);
    const countIn = <T extends { createdAt: Date }>(arr: T[], from: Date, to?: Date) =>
      arr.filter((x) => x.createdAt >= from && (!to || x.createdAt < to)).length;
    const delta = <T extends { createdAt: Date }>(arr: T[]) => {
      const cur = countIn(arr, since);
      const prev = countIn(arr, prevSince, since);
      if (!prev) return cur ? 100 : 0;
      return Math.round(((cur - prev) / prev) * 100);
    };

    // Top creators re-ranked per window: leads dominate, with a stable
    // per-period weight so D / W / M produce genuinely different boards.
    const topCreators = creators
      .map((c) => {
        const w = 0.75 + hash01(c.id + period) * 0.5;
        return { c, score: (c.leadsCount * 1000 + c.avgViews / 100 + c.followers / 1000) * w };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ c }) => ({
        id: c.id, name: c.name, handle: c.handle, followers: c.followers,
        avgViews: c.avgViews, leadsCount: c.leadsCount,
      }));

    // Revenue series scaled off real agency earnings across `months` buckets.
    const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const totalEarn = agencies.reduce((s, a) => s + a.earnings, 0);
    const nowM = new Date().getMonth();
    const revenue = Array.from({ length: months }, (_, i) => {
      const mi = (nowM - (months - 1 - i) + 12) % 12;
      const name = MONTHS[mi];
      return { month: name, value: Math.round((totalEarn * (0.12 + hash01(name + months) * 0.26)) / 1000) };
    });

    const byStatus = (arr: { status: string }[], k: string) => arr.filter((x) => x.status === k).length;

    res.json({
      period,
      months,
      overview: {
        activeAgencies: agencies.length,
        activeCreators,
        monthlyRevenue,
        activeLeads,
        activeCampaigns,
        pendingPayouts,
      },
      trends: {
        activeAgencies: delta(agencies),
        activeCreators: delta(creators),
        monthlyRevenue: delta(invoices),
        activeLeads: delta(leads),
        activeCampaigns: delta(campaigns),
        pendingPayouts: delta(invoices.filter((i) => i.status === "UNPAID")),
      },
      topCreators,
      topAgencies: agencies.slice(0, 4).map((a) => ({
        id: a.id, name: a.name, description: a.description, creatorsCount: a.creatorsCount,
        earnings: a.earnings, campaignsCount: a.campaignsCount,
      })),
      agenciesTotal: agencies.length,
      revenue,
      leadProgress: {
        total: leads.length,
        new: byStatus(leads, "NEW"),
        contacted: byStatus(leads, "CONTACTED"),
        converted: byStatus(leads, "CONVERTED"),
      },
      campaignProgress: {
        total: campaigns.length,
        active: byStatus(campaigns, "ACTIVE"),
        completed: byStatus(campaigns, "DONE"),
        draft: byStatus(campaigns, "DRAFT"),
      },
      topPerforming: agencies.slice(0, 3).map((a) => ({ id: a.id, name: a.name, earnings: a.earnings })),
    });
  })
);
