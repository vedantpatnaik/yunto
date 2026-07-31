/**
 * Populates the newer tables from data that already exists, without touching
 * anything else.
 *
 * The seed truncates before inserting, which is right for a dev reset and wrong
 * for a live database — running it against production would delete real rows.
 * This only INSERTS where a row is missing, so it is safe to run on a populated
 * environment and safe to run twice.
 *
 *   npx tsx prisma/backfill.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Round to the nearest ₹500, the granularity the rate screens display. */
const r500 = (n: number) => Math.max(500, Math.round(n / 500) * 500);

async function main() {
  const created: Record<string, number> = {};
  const bump = (k: string, n = 1) => { created[k] = (created[k] ?? 0) + n; };

  // ---- rate cards: priced off each creator's own economics ----
  const creators = await prisma.creator.findMany();
  for (const c of creators) {
    const existing = await prisma.rateCard.findUnique({ where: { creatorId: c.id } });
    if (existing) continue;
    const base = r500((c.cpv * c.avgViews) / 20);
    await prisma.rateCard.create({
      data: {
        creatorId: c.id,
        reelRate: base,
        postRate: r500(base * 0.7),
        storyRate: r500(base * 0.4),
        integratedRate: base,
        dedicatedRate: r500(base * 1.65),
        shortRate: r500(base * 0.8),
        acceptsBarter: c.stars < 4.6,
        barterValue: r500(base * 1.2),
      },
    });
    bump("rateCards");
  }

  // ---- campaign briefs ----
  const campaigns = await prisma.campaign.findMany();
  for (const c of campaigns) {
    if (await prisma.campaignBrief.findUnique({ where: { campaignId: c.id } })) continue;
    await prisma.campaignBrief.create({
      data: {
        campaignId: c.id,
        keyMessage: `Show why ${c.brandName} fits naturally into everyday life.`,
        targetAudience: "Gen Z and young millennials in metro cities",
        guidelines: ["Keep the tone authentic and conversational", "Avoid heavy beauty filters", "Mention the offer once, naturally"],
        deliverables: ["1x Reel (9:16, 20-40s)", "2x Stories with link sticker"],
        notes: ["Deliver drafts 3 days before go-live"],
      },
    });
    bump("briefs");
  }

  // ---- lead deliverables ----
  const leads = await prisma.lead.findMany();
  for (const l of leads) {
    const have = await prisma.leadDeliverable.count({ where: { leadId: l.id } });
    if (have) continue;
    await prisma.leadDeliverable.createMany({
      data: [
        { leadId: l.id, kind: "REEL", quantity: 1, visits: 1 },
        { leadId: l.id, kind: "STORY", quantity: 2, visits: 1 },
      ],
    });
    bump("deliverables", 2);
  }

  // ---- landing pages ----
  const users = await prisma.user.findMany();
  for (const c of creators.slice(0, 8)) {
    if (await prisma.landingPage.findUnique({ where: { creatorId: c.id } })) continue;
    const slug = c.handle.replace(/^@/, "").toLowerCase();
    if (await prisma.landingPage.findUnique({ where: { slug } })) continue;
    const page = await prisma.landingPage.create({
      data: {
        creatorId: c.id, slug,
        headline: `${c.name} — ${c.niche ?? "Creator"}`,
        bio: `${c.niche ?? "Content"} creator based in ${c.location ?? "India"}.`,
        services: ["Brand collaborations", "UGC", "Event coverage"],
        published: true,
      },
    });
    await prisma.landingLink.createMany({
      data: [
        { pageId: page.id, label: "Instagram", url: `https://instagram.com/${slug}`, sortOrder: 0 },
        { pageId: page.id, label: "Media kit", url: `https://yunto.app/${slug}/kit`, sortOrder: 1 },
      ],
    });
    bump("landingPages");
  }

  // ---- payout details: one per user, no account numbers invented ----
  for (const u of users) {
    if (await prisma.payoutDetail.findUnique({ where: { userId: u.id } })) continue;
    await prisma.payoutDetail.create({
      data: { userId: u.id, accountHolderName: u.name, legalName: u.name, mobile: u.phone ?? null },
    });
    bump("payoutDetails");
  }

  // ---- bookings ----
  const bookable = creators.slice(0, 10);
  for (let i = 0; i < bookable.length; i++) {
    const c = bookable[i];
    if (await prisma.booking.count({ where: { creatorId: c.id } })) continue;
    await prisma.booking.create({
      data: {
        creatorId: c.id,
        bookedById: users[i % users.length]?.id ?? null,
        service: i % 2 ? "EDITOR" : "VIDEOGRAPHER",
        scheduledAt: new Date(Date.now() + ((i % 14) + 1) * 864e5),
        hours: i % 2 ? 0 : 2 + (i % 3),
        total: r500(6000 + i * 900),
        status: i % 3 === 0 ? "confirmed" : "pending",
      },
    });
    bump("bookings");
  }

  // eslint-disable-next-line no-console
  console.log("Backfill complete:", created);
}

main().finally(() => prisma.$disconnect());
