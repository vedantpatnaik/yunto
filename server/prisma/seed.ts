import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const rc = <T,>(a: T[], i: number) => a[i % a.length];
const daysAgo = (d: number) => new Date(Date.now() - d * 864e5);
const daysAhead = (d: number) => new Date(Date.now() + d * 864e5);

async function main() {
  // wipe (children first for FK safety)
  await prisma.landingLink.deleteMany();
  await prisma.landingPage.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.leadDeliverable.deleteMany();
  await prisma.campaignBrief.deleteMany();
  await prisma.rateCard.deleteMany();
  await prisma.payoutDetail.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatChannel.deleteMany();
  await prisma.calendarContent.deleteMany();
  await prisma.campaignCreator.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.creator.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // --- teams ---
  const sales = await prisma.team.create({ data: { name: "Sales", kind: "SALES" } });
  const ops = await prisma.team.create({ data: { name: "Operations", kind: "OPERATIONS" } });

  // --- users (admin + employees) ---
  const admin = await prisma.user.create({
    data: { email: "admin@yunto.com", passwordHash, name: "Shubham", role: "SUPER_ADMIN", agencyCode: "55678" },
  });
  const empDefs = [
    ["priya@yunto.com", "Priya Sharma", "SALES_MANAGER", sales.id, 800_000, 620_000],
    ["rohan@yunto.com", "Rohan Mehta", "SALES_EMPLOYEE", sales.id, 400_000, 310_000],
    ["ananya@yunto.com", "Ananya Roy", "SALES_EMPLOYEE", sales.id, 400_000, 280_000],
    ["kabir@yunto.com", "Kabir Singh", "OPS_MANAGER", ops.id, 700_000, 540_000],
    ["neha@yunto.com", "Neha Verma", "OPS_EMPLOYEE", ops.id, 350_000, 300_000],
    ["arjun@yunto.com", "Arjun Nair", "OPS_EMPLOYEE", ops.id, 350_000, 190_000],
    ["sana@yunto.com", "Sana Iyer", "SALES_EMPLOYEE", sales.id, 400_000, 360_000],
  ] as const;
  const employees = [];
  for (const [email, name, role, teamId, ty, ta] of empDefs) {
    employees.push(await prisma.user.create({
      data: { email, passwordHash, name, role: role as never, teamId, targetYearly: ty, targetMonthly: Math.round(ty / 12), agencyCode: "55678" },
    }));
  }
  const allUsers = [admin, ...employees];

  // --- agencies (20) ---
  const agencyData = [
    ["Stellar Talents", "Influencer Management"], ["Luna Communications", "Performance Marketing"],
    ["VividWaves Media", "Content Creation"], ["Firefly Creators", "Influencer & Brand Partnerships"],
    ["Nova Reach", "Creator Economy"], ["Pulse Collective", "Social Strategy"],
    ["Bloom Media House", "Brand Storytelling"], ["Apex Influence", "Talent Management"],
    ["Zenith Digital", "Digital Marketing"], ["Cascade Creators", "UGC & Reels"],
    ["Halo Talent", "Celebrity Partnerships"], ["Orbit Media", "Growth Marketing"],
    ["Verve Agency", "Lifestyle & Fashion"], ["Kite Collective", "Youth Marketing"],
    ["Amber Studios", "Video Production"], ["Riverstone Media", "Regional Creators"],
    ["Quantum Reach", "Data-driven Campaigns"], ["Lush Collective", "Beauty & Wellness"],
    ["Momentum Talent", "Sports & Gaming"], ["Ivory Media", "Premium Brands"],
  ];
  const agencies = await Promise.all(agencyData.map(([name, description], i) =>
    prisma.agency.create({ data: {
      id: name, name, description,
      creatorsCount: 120 + ((i * 37) % 130), earnings: 350_000 + ((i * 91_000) % 700_000), campaignsCount: 120 + ((i * 23) % 90),
    } })
  ));

  // --- creators (40) ---
  const firstNames = ["Leena", "Diya", "Aditya", "Karan", "Priya", "Rhea", "Arjun", "Sana", "Ishaan", "Neha",
    "Vikram", "Ananya", "Rohan", "Meera", "Kabir", "Tara", "Dev", "Nisha", "Aryan", "Kiara",
    "Sahil", "Zoya", "Manav", "Aisha", "Yash", "Riya", "Nikhil", "Pooja", "Rahul", "Simran",
    "Aman", "Naina", "Varun", "Kritika", "Sameer", "Anjali", "Harsh", "Divya", "Raj", "Sneha"];
  const lastNames = ["Sharma", "Singh", "Verma", "Kapoor", "Mehta", "Gupta", "Nair", "Reddy", "Iyer", "Bose"];
  const niches = ["Fashion", "Beauty", "Fitness", "Food", "Travel", "Tech", "Lifestyle", "Comedy", "Dance", "Gaming"];
  const cities = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Chennai", "Jaipur", "Kolkata"];
  const genders = ["Female", "Male", "Female", "Male"];
  const creators = [];
  for (let i = 0; i < 40; i++) {
    const name = `${rc(firstNames, i)} ${rc(lastNames, i * 3)}`;
    const handle = `@${rc(firstNames, i).toLowerCase()}${rc(lastNames, i * 3).toLowerCase().slice(0, 4)}${(i % 9) + 1}`;
    creators.push({
      id: `cr_${i}_${handle}`, name, handle,
      followers: 400_000 + ((i * 137_000) % 1_800_000), avgViews: 120_000 + ((i * 71_000) % 900_000),
      engagementRate: Math.round((2.4 + ((i * 7) % 40) / 10) * 10) / 10, stars: 4.0 + ((i * 3) % 10) / 10,
      cpv: Math.round((0.18 + (i % 12) / 100) * 100) / 100, leadsCount: 120 + ((i * 47) % 380),
      matchPct: 60 + ((i * 7) % 40), location: rc(cities, i), gender: rc(genders, i), niche: rc(niches, i),
      listed: i % 3 === 0, blacklisted: i % 13 === 0, agencyId: agencies[i % agencies.length].id,
    });
  }
  creators[0] = { ...creators[0], name: "Leena Sharma", handle: "@leenabliss", followers: 1_200_000, avgViews: 900_000, leadsCount: 489, stars: 4.8, agencyId: "Stellar Talents" };
  creators[1] = { ...creators[1], name: "Diya Sharma", handle: "@diya444", followers: 1_100_000, avgViews: 800_000, leadsCount: 450, stars: 4.7, agencyId: "Stellar Talents" };
  creators[2] = { ...creators[2], name: "Aditya Singh", handle: "@adityasingh", followers: 1_500_000, avgViews: 850_000, leadsCount: 498, stars: 4.9, agencyId: "Stellar Talents" };
  await prisma.creator.createMany({ data: creators });

  // --- leads (22) ---
  const brands = ["Nykaa", "Nike Diwali", "Zostel Trip", "Puma", "Mamaearth", "boAt", "Sugar Cosmetics",
    "Myntra", "Swiggy Instamart", "CRED", "Zomato Gold", "Lenskart", "Wow Skin", "Noise", "Amazon Prime",
    "Realme", "Coca-Cola", "Sephora", "H&M India", "Decathlon", "Bewakoof", "The Souled Store"];
  const lstatus = ["NEW", "CONTACTED", "CONNECTED", "CONVERTED", "DEAD"] as const;
  const intents = ["HIGH", "MEDIUM", "LOW"] as const;
  const leadRows = [];
  for (let i = 0; i < brands.length; i++) {
    leadRows.push(await prisma.lead.create({ data: {
      brandName: brands[i], agencyId: agencies[i % agencies.length].id,
      contactPerson: rc(employees, i).name, personRole: i % 2 ? "sales" : "ops",
      money: `${300 + ((i * 70) % 700)}k`, engagementRate: `${(2 + (i % 4)).toFixed(1)}% ER`,
      peopleCount: 20 + ((i * 5) % 60), status: lstatus[i % lstatus.length], intent: intents[i % 3],
      dealType: i % 3 ? "PAID" : "BARTER", ownerId: rc(employees, i).id,
    } }));
  }

  // --- campaigns (16) + creator links ---
  const camps = ["Miniso X Launch", "End of Year Rush Puma", "Women Fitness X Wellness", "Diwali Dhamaka Nykaa",
    "Summer Drop boAt", "Monsoon Skincare Mamaearth", "Festive Fashion Myntra", "Gadget Fest Realme",
    "Wellness Week CRED", "Travel Diaries Zostel", "Glow Up Sugar", "Fit India Decathlon",
    "New Year Noise", "Style Edit H&M", "Snack Attack Swiggy", "Prime Day Amazon"];
  const cstatus = ["ACTIVE", "ACTIVE", "ACTIVE", "DONE", "DRAFT"] as const;
  const campaigns = [];
  for (let i = 0; i < camps.length; i++) {
    const c = await prisma.campaign.create({ data: {
      name: camps[i], brandName: camps[i].split(" ").pop()!, agencyId: agencies[i % agencies.length].id,
      status: cstatus[i % cstatus.length], progress: (i * 17) % 100, budget: 400_000 + ((i * 90_000) % 900_000),
      engagementRate: `${(3.2 + ((i * 3) % 25) / 10).toFixed(1)}%`,
      contactPerson: rc(employees, i).name, peopleCount: 8 + ((i * 3) % 30),
      website: `www.${camps[i].split(" ").pop()!.toLowerCase()}.com`,
      timeline: `${10 + (i % 15)} Jul - ${20 + (i % 8)} Jul`,
    } });
    campaigns.push(c);
    for (let j = 0; j < 3; j++) {
      await prisma.campaignCreator.create({ data: {
        campaignId: c.id, creatorId: creators[(i * 3 + j) % creators.length].id,
        rating: 3.5 + ((i + j) % 3) * 0.5, done: (i + j) % 2 === 0,
      } });
    }
  }

  // --- contacts (12) ---
  const companies = ["Nykaa", "Puma India", "boAt Lifestyle", "Mamaearth", "CRED", "Swiggy", "Myntra", "Realme", "Sugar", "Lenskart", "Noise", "Sephora"];
  const sources = ["Instagram DM", "LinkedIn", "Referral", "Website form", "Cold email", "Event", "WhatsApp"];
  for (let i = 0; i < 12; i++) {
    await prisma.contact.create({ data: {
      name: `${rc(firstNames, i + 5)} ${rc(lastNames, i)}`, company: companies[i], role: rc(["Marketing Head", "Brand Manager", "Founder", "PR Lead"], i),
      email: `contact${i}@${companies[i].toLowerCase().replace(/\s/g, "")}.com`, phone: `+91 9${(800000000 + i * 111111).toString()}`,
      budget: 100_000 + ((i * 55_000) % 450_000), source: rc(sources, i),
    } });
  }

  // --- invoices (12) ---
  const ipay = ["PAID", "UNPAID", "UNPAID", "PAID", "OVERDUE"] as const;
  for (let i = 0; i < 12; i++) {
    // The UI renders these three under "Sub Total" / "GST" / "Total Amount",
    // so they must actually reconcile. GST is the standard Indian 18%.
    const budget = 150_000 + ((i * 40_000) % 400_000);
    const agencyFee = Math.round(budget * 0.18);
    await prisma.invoice.create({ data: {
      number: `INV-2025-${(45 + i).toString().padStart(3, "0")}`, brandName: rc(brands, i),
      campaignId: rc(campaigns, i).id, budget,
      agencyFee, payout: budget + agencyFee,
      dealType: i % 3 ? "PAID" : "BARTER", status: ipay[i % ipay.length],
    } });
  }

  // --- contracts (8) ---
  for (let i = 0; i < 8; i++) {
    await prisma.contract.create({ data: {
      kind: i % 2 ? "CREATOR" : "CAMPAIGN", title: `${rc(camps, i)} — Agreement`,
      campaignId: rc(campaigns, i).id, amount: 200_000 + ((i * 60_000) % 500_000),
      status: rc(["draft", "sent", "signed", "signed"], i),
    } });
  }

  // --- polls (4) ---
  const pollQs = [
    ["Which brand should we prioritize next quarter?", ["Nykaa", "Puma", "boAt"]],
    ["Best performing content format?", ["Reels", "Stories", "YouTube"]],
    ["Preferred payout cycle?", ["Weekly", "Bi-weekly", "Monthly"]],
    ["Next city for a creator meetup?", ["Mumbai", "Delhi", "Bengaluru"]],
  ] as const;
  for (const [question, options] of pollQs) {
    await prisma.poll.create({ data: { question, kind: "GENERAL", options: options as never, results: options.map((_, i) => 10 + i * 7) as never } });
  }

  // --- reminders (8) ---
  const rem = ["Campaign shoot review", "Send invoice to Sephora", "Approve creator content", "Follow up with Nykaa",
    "Sign Puma contract", "Prep monthly targets", "Payout batch to creators", "Review blacklist requests"];
  for (let i = 0; i < rem.length; i++) {
    await prisma.reminder.create({ data: { title: rem[i], dueAt: daysAhead(i - 1), ownerId: rc(allUsers, i).id, done: i % 4 === 0 } });
  }

  // --- leaves (6) + attendance ---
  const lstat = ["PENDING", "APPROVED", "REJECTED", "APPROVED"] as const;
  for (let i = 0; i < 6; i++) {
    await prisma.leave.create({ data: {
      userId: rc(employees, i).id, type: rc(["Casual", "Sick", "Earned"], i),
      from: daysAhead(i + 1), to: daysAhead(i + 2), reason: "Personal", status: lstat[i % lstat.length],
    } });
  }
  // Attendance is one row per user per DAY (@@unique([userId, date])), so the
  // date column must be the day at midnight. Storing a full timestamp gives
  // every row a distinct instant, which defeats the unique constraint and makes
  // "who was in on day X" impossible to answer — a per-team head count then
  // matches at most one row.
  const midnight = (d: number) => {
    const t = daysAgo(d);
    return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()));
  };
  for (const u of employees) {
    for (let d = 1; d <= 5; d++) {
      const present = d % 4 !== 0;
      await prisma.attendance.create({
        data: { userId: u.id, date: midnight(d), present, loginAt: present ? daysAgo(d) : null },
      });
    }
  }

  // --- channels (5) + messages ---
  const chans = [["Sales Team", "TEAM"], ["Ops Team", "TEAM"], ["Leena Sharma", "INFLUENCER"], ["Nykaa Brand", "BRAND"], ["Miniso Campaign", "CAMPAIGN"]] as const;
  for (let i = 0; i < chans.length; i++) {
    const ch = await prisma.chatChannel.create({ data: { name: chans[i][0], kind: chans[i][1] as never } });
    const msgs = ["Hey team, quick update on the campaign.", "Deliverables look great!", "Can we push the deadline by a day?", "Payment processed ✅"];
    for (let m = 0; m < 4; m++) {
      await prisma.message.create({ data: { channelId: ch.id, authorId: rc(allUsers, i + m).id, body: msgs[m], createdAt: daysAgo(1) } });
    }
  }

  // --- calendar (12) ---
  for (let i = 0; i < 12; i++) {
    await prisma.calendarContent.create({ data: {
      creatorId: creators[i].id, title: `${rc(niches, i)} ${rc(["Reel", "Story", "Post"], i)} — ${rc(brands, i)}`,
      scheduledAt: daysAhead(i - 3), status: rc(["scheduled", "submitted", "approved"], i),
    } });
  }

  // ------------------------- payout / billing details ----------------------
  // One row per user. These are only ever served back to their owner
  // (/payout-details is scoped to the caller), so the account numbers below are
  // never listed across users.
  const bankNames = ["HDFC Bank", "ICICI Bank", "Axis Bank", "State Bank of India", "Kotak Mahindra"];
  const stateNames = ["Maharashtra", "Delhi", "Karnataka", "Telangana", "West Bengal"];
  for (let i = 0; i < allUsers.length; i++) {
    const u = allUsers[i];
    const handle = u.name.split(" ")[0].toLowerCase();
    await prisma.payoutDetail.create({ data: {
      userId: u.id,
      accountHolderName: u.name, bankName: rc(bankNames, i),
      accountNumber: `${50100000000000 + i * 731}`, ifsc: `HDFC000${1234 + i}`,
      upiId: `${handle}@okhdfc`, verified: i % 4 !== 0,
      legalName: u.name, tradeName: `${u.name.split(" ")[0]} Creations`,
      gstNumber: `2${7 + (i % 3)}AAAAA${1000 + i}A1Z${i % 10}`,
      mobile: `+91 9${(800000000 + i * 111111).toString()}`,
      pincode: `${400001 + i * 11}`, state: rc(stateNames, i),
    } });
  }

  // ------------------------------- rate cards ------------------------------
  // Priced off the creator's own economics (cpv x avg views), rounded to ₹500 —
  // the same derivation the Commercials screen shows, so the two never drift.
  const r500 = (n: number) => Math.max(500, Math.round(n / 500) * 500);
  for (let i = 0; i < creators.length; i++) {
    const c = creators[i];
    const base = r500(c.cpv * c.avgViews);
    const barter = i % 3 === 0;
    await prisma.rateCard.create({ data: {
      creatorId: c.id,
      reelRate: base, postRate: r500(base * 0.7), storyRate: r500(base * 0.4),
      integratedRate: r500(base * 2), dedicatedRate: r500(base * 2.5), shortRate: r500(base * 0.6),
      acceptsBarter: barter, barterValue: barter ? r500(base * 1.2) : null,
      barterFormats: (barter ? ["REEL", "STORY", "UGC"] : []) as never,
    } });
  }

  // ----------------------------- campaign briefs ---------------------------
  const briefAudiences = [
    "Gen Z & young millennial women looking for minimal, effective skincare.",
    "Urban millennials who shop online for value-first fashion.",
    "Fitness-first 25-34s in metro cities.",
    "Students and first-jobbers hunting for everyday tech.",
  ];
  for (let i = 0; i < campaigns.length; i++) {
    const c = campaigns[i];
    await prisma.campaignBrief.create({ data: {
      campaignId: c.id,
      keyMessage: `Celebrate what ${c.brandName} already does well — show it in an ordinary day, not a studio.`,
      targetAudience: rc(briefAudiences, i),
      guidelines: [
        "Shoot in natural light, morning routine",
        "Use the product naturally, no scripted demo",
        "Mention the hydration benefits once",
      ],
      deliverables: ["Duration: 20–40 sec", "Format: Instagram Reel (9:16)", "One story frame with the link sticker"],
      notes: ["Avoid beauty filters", "Keep the tone authentic and conversational"],
    } });
  }

  // ---------------------------- lead deliverables --------------------------
  const dKinds = ["REEL", "STORY", "POST", "INTEGRATED_VIDEO", "DEDICATED_VIDEO", "SHORT"] as const;
  const dNotes = ["Needs script", "Pending shoot", "Awaiting brand approval", "Ready to post"];
  for (let i = 0; i < leadRows.length; i++) {
    for (let j = 0; j < 2; j++) {
      const kind = dKinds[(i + j * 2) % dKinds.length];
      await prisma.leadDeliverable.create({ data: {
        leadId: leadRows[i].id,
        platform: kind === "INTEGRATED_VIDEO" || kind === "DEDICATED_VIDEO" || kind === "SHORT" ? "YOUTUBE" : "INSTAGRAM",
        kind, quantity: 1 + ((i + j) % 3), visits: 1 + (i % 2),
        note: rc(dNotes, i + j),
        link: (i + j) % 3 === 0 ? `https://instagram.com/p/${leadRows[i].id.slice(-8)}${j}` : null,
      } });
    }
  }

  // -------------------------------- bookings -------------------------------
  // Videographer slots are hourly; editor jobs are quoted per batch of videos.
  const projectTypes = ["Instagram Reels", "Brand Shoot", "YouTube Vlog"];
  const shootCities = ["Hauz Khas Village, Delhi", "Bandra West, Mumbai", "Indiranagar, Bengaluru", "Koregaon Park, Pune"];
  for (let i = 0; i < 10; i++) {
    const isEditor = i % 2 === 1;
    const hours = isEditor ? 0 : 2 + (i % 3);
    const total = isEditor ? 1500 * (2 + (i % 4)) : 5000 * (1 + (i % 2)) + 1500;
    await prisma.booking.create({ data: {
      creatorId: creators[(i * 4) % creators.length].id,
      bookedById: rc(allUsers, i).id,
      service: isEditor ? "EDITOR" : "VIDEOGRAPHER",
      scheduledAt: daysAhead(i - 2), hours, total,
      projectType: rc(projectTypes, i),
      location: isEditor ? null : rc(shootCities, i),
      brief: isEditor
        ? "Fast pacing, trending audio, keep the bloopers out."
        : "Golden-hour exteriors plus two interior setups.",
      addons: (isEditor ? ["subtitles", "fast"] : ["editor", "raw"]) as never,
      status: rc(["pending", "confirmed", "confirmed", "done"], i),
    } });
  }

  // ----------------------- landing pages (+ link rows) ---------------------
  const themeNames = ["MODERN", "DARK", "CLEAN"] as const;
  const layoutNames = ["CENTERED", "LEFT"] as const;
  for (let i = 0; i < 8; i++) {
    const c = creators[i];
    const page = await prisma.landingPage.create({ data: {
      creatorId: c.id,
      slug: c.handle.replace(/^@/, "").replace(/\s+/g, "").toLowerCase(),
      headline: `${c.niche} creator, ${c.location}`,
      bio: `Hi! I'm ${c.name.split(" ")[0]}, a ${(c.niche ?? "lifestyle").toLowerCase()} creator. I love making aesthetic vlogs and UGC for brands I truly believe in. Let's create something beautiful together! ✨`,
      theme: themeNames[i % themeNames.length],
      layout: layoutNames[i % layoutNames.length],
      fontStyle: "Inter / Modern Sans",
      contactTime: "10:00 AM - 2:00 PM IST",
      services: ["UGC Videos", "Paid Campaigns", "Barter Campaigns", "Tutorials"] as never,
      hideInsights: i % 3 === 0, published: i % 4 !== 0,
    } });
    const links = [
      ["Instagram", `https://instagram.com/${page.slug}`],
      ["YouTube", `https://youtube.com/@${page.slug}`],
      ["Media kit", `https://socy.io/${page.slug}/kit`],
    ];
    for (let j = 0; j < links.length; j++) {
      await prisma.landingLink.create({
        data: { pageId: page.id, label: links[j][0], url: links[j][1], sortOrder: j },
      });
    }
  }

  // --------------------------- subscription plans -------------------------
  // The revenue screen renders a plan name and price per agency; these are the
  // catalogue rows behind it (prices in USD/interval, matching the design).
  const planSpecs = [
    { name: "FREE", price: 0 }, { name: "LITE", price: 60 }, { name: "PRO", price: 180 },
    { name: "ULTIMATE", price: 360 }, { name: "CUSTOM", price: 600 },
  ] as const;
  const plans = [];
  for (const p of planSpecs) {
    plans.push(await prisma.subscriptionPlan.upsert({
      where: { name: p.name },
      update: { price: p.price },
      create: { name: p.name, price: p.price, interval: "YEARLY" },
    }));
  }
  // Bigger agencies skew to richer plans, but not perfectly: real accounts lag
  // their usage before upgrading, so a couple of high earners sit a tier low.
  const ranked = await prisma.agency.findMany({ orderBy: { earnings: "desc" } });
  const LAG = [0, 1, 0, 2, 0, 0, 1, 0]; // deterministic downgrade offset by rank
  for (let i = 0; i < ranked.length; i++) {
    const base = Math.min(plans.length - 1, Math.floor((i * plans.length) / Math.max(1, ranked.length)));
    const idx = Math.min(plans.length - 1, base + LAG[i % LAG.length]);
    await prisma.agency.update({
      where: { id: ranked[i].id },
      data: {
        planId: plans[plans.length - 1 - idx].id,
        website: `www.${ranked[i].name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      },
    });
  }

  // Rate-card discount the managing agency offers — the "-45% OFF" badge.
  const managed = await prisma.creator.findMany({ where: { agencyId: { not: null } } });
  for (let i = 0; i < managed.length; i++) {
    await prisma.creator.update({
      where: { id: managed[i].id },
      data: { discountPct: [45, 30, 25, 40, 15, 35, 20, 50][i % 8] },
    });
  }

  // ------------------------- spread creation dates -------------------------
  // Everything above is inserted in one burst, so every row lands on the same
  // timestamp. That makes each "created" date render identically (six leads all
  // reading "31 July"), and it makes period-over-period trends meaningless —
  // the previous window is always empty, so every delta is +100%.
  //
  // Deterministic so reseeding is reproducible, and applied here rather than in
  // a one-off script so it survives the next reseed.
  const spread = (seed: string, days: number) => {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return new Date(Date.now() - (((h >>> 0) % days) + 1) * 864e5);
  };
  for (const [name, model, days] of [
    ["agency", prisma.agency, 75], ["creator", prisma.creator, 75],
    ["lead", prisma.lead, 45], ["campaign", prisma.campaign, 60],
    ["invoice", prisma.invoice, 60], ["contact", prisma.contact, 45],
    ["contract", prisma.contract, 60], ["note", prisma.note, 20],
  ] as const) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: { id: string }[] = await (model as any).findMany({ select: { id: true } });
    for (const r of rows) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (model as any).update({ where: { id: r.id }, data: { createdAt: spread(name + r.id, days) } });
    }
  }

  // `updatedAt` is @updatedAt, so Prisma stamps it to now on the writes above —
  // which made every lead card read "just now" no matter how old it was. Raw SQL
  // is the only way to set it, since the client always overrides it. Last touch
  // lands between the row's creation and today.
  for (const [table, days] of [["Lead", 45], ["User", 60]] as const) {
    await prisma.$executeRawUnsafe(
      // LEAST(..., now()) matters: without it a row created recently gets a
      // "last touched" date in the future, and every relative label reads
      // "in 4 days".
      `UPDATE "${table}"
          SET "updatedAt" = LEAST("createdAt" + (random() * ($1 || ' days')::interval), now())
        WHERE "updatedAt" > now() - interval '1 hour'`,
      String(days)
    );
  }

  // Leave a few leads unowned. Every screen that surfaces "unattended" or
  // "needs response" showed zero because the seed assigned an owner to all of
  // them, so the feature looked broken rather than empty.
  const unowned = await prisma.lead.findMany({ where: { status: "NEW" }, take: 4, select: { id: true } });
  for (const l of unowned) await prisma.lead.update({ where: { id: l.id }, data: { ownerId: null } });

  const counts = {
    plans: await prisma.subscriptionPlan.count(),
    users: await prisma.user.count(), agencies: await prisma.agency.count(), creators: await prisma.creator.count(),
    leads: await prisma.lead.count(), campaigns: await prisma.campaign.count(), invoices: await prisma.invoice.count(),
    contacts: await prisma.contact.count(), contracts: await prisma.contract.count(), reminders: await prisma.reminder.count(),
    polls: await prisma.poll.count(), leaves: await prisma.leave.count(), channels: await prisma.chatChannel.count(), calendar: await prisma.calendarContent.count(),
    payoutDetails: await prisma.payoutDetail.count(), rateCards: await prisma.rateCard.count(),
    campaignBriefs: await prisma.campaignBrief.count(), leadDeliverables: await prisma.leadDeliverable.count(),
    bookings: await prisma.booking.count(), landingPages: await prisma.landingPage.count(),
    landingLinks: await prisma.landingLink.count(),
  };
  // eslint-disable-next-line no-console
  console.log("Seed complete:", counts);
}

main().finally(() => prisma.$disconnect());
