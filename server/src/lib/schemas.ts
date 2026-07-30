/**
 * Per-resource request validation for the generic CRUD router.
 *
 * These replace the previous `z.object({}).passthrough()` catch-all. The goal is
 * to validate *types* (and coerce the ones browsers stringify) without making the
 * API stricter than the screens that already call it:
 *
 *  - Every schema keeps `.passthrough()`, so an unrecognised key reaches Prisma
 *    exactly as it did before. A column this file forgets can never silently
 *    vanish from a write.
 *  - A field is only required when the Prisma column has no default AND every
 *    caller demonstrably sends it. Everything else is optional.
 *  - Columns Prisma declares nullable (`String?`, `Int?`) are `.nullable()` here —
 *    the assign-creators screen clears an assignment with `{ agencyId: null }`.
 *  - Numbers are coerced (`"1200"` -> `1200`) and dates accept an ISO string.
 *  - Enum values are matched case-insensitively against the real Prisma enums and
 *    normalised to the UPPERCASE member.
 *
 * Update schemas are the create schema with `.partial()`, which preserves the
 * passthrough behaviour.
 */
import { z } from "zod";

/* ------------------------------- primitives ------------------------------ */

/** `String?` — optional and explicitly nullable (clients clear FKs with null). */
const nstr = z.string().nullable().optional();
/** `String @default(...)` — optional, but not nullable (Prisma would reject null). */
const ostr = z.string().optional();
/** `Int @default(...)` — coerced from the strings number inputs produce. */
const oint = z.coerce.number().int().optional();
/** `Int?` — coerced, optional, nullable. */
const nint = z.coerce.number().int().nullable().optional();
/** `Float @default(...)`. */
const ofloat = z.coerce.number().optional();
/** `Boolean @default(...)`. Not coerced: `Boolean("false")` is `true`. */
const obool = z.boolean().optional();
/** `DateTime` — accepts an ISO string (or Date) and yields a Date. */
const date = z.coerce.date();
/** `Json` — the shapes actually stored (poll options / results are arrays). */
const json = z.union([z.array(z.any()), z.record(z.any())]);

/**
 * A Prisma enum column. Input is trimmed and upper-cased before matching, so
 * "paid" and "PAID" both validate and both normalise to the Prisma member.
 */
const enumOf = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (typeof v === "string" ? v.trim().toUpperCase() : v), z.enum(values));

/** Object with unknown keys preserved — see the note at the top of this file. */
const obj = <T extends z.ZodRawShape>(shape: T) => z.object(shape).passthrough();

/* -------------------------- Prisma enum members -------------------------- */
/* Mirrors prisma/schema.prisma. Exported so callers/tests share one source. */

export const TEAM_KIND = ["SALES", "OPERATIONS"] as const;
export const PLATFORM = ["INSTAGRAM", "YOUTUBE", "TIKTOK"] as const;
export const LEAD_STATUS = ["NEW", "CONTACTED", "CONVERTED", "CONNECTED", "DEAD"] as const;
export const LEAD_INTENT = ["HIGH", "MEDIUM", "LOW"] as const;
export const DEAL_TYPE = ["PAID", "BARTER"] as const;
export const CAMPAIGN_STATUS = ["DRAFT", "ACTIVE", "DONE"] as const;
export const CONTRACT_KIND = ["CAMPAIGN", "CREATOR"] as const;
export const PAYMENT_STATUS = ["PAID", "UNPAID", "OVERDUE"] as const;
export const POLL_KIND = ["GENERAL", "CAMPAIGN"] as const;
export const LEAVE_STATUS = ["PENDING", "APPROVED", "REJECTED"] as const;
export const CHANNEL_KIND = ["TEAM", "INFLUENCER", "BRAND", "CAMPAIGN"] as const;

/* -------------------------------- Agency --------------------------------- */

export const agencyCreateSchema = obj({
  name: z.string(),
  description: nstr,
  logoUrl: nstr,
  website: nstr,
  creatorsCount: oint,
  earnings: oint,
  campaignsCount: oint,
  planId: nstr,
});
export const agencyUpdateSchema = agencyCreateSchema.partial();

/* -------------------------------- Creator -------------------------------- */
/* AddCreatorPage posts { name, handle, followers, avgViews, location, niche,
   listed, engagementRate, stars, cpv }; `handle` is sent as "" so no min length.
   Creator.engagementRate is a Float here (Lead/Campaign store it as a String). */

export const creatorCreateSchema = obj({
  name: z.string(),
  handle: z.string(),
  avatarUrl: nstr,
  followers: oint,
  avgViews: oint,
  engagementRate: ofloat,
  stars: ofloat,
  cpv: ofloat,
  leadsCount: oint,
  matchPct: oint,
  location: nstr,
  gender: nstr,
  niche: nstr,
  platform: enumOf(PLATFORM).optional(),
  listed: obool,
  blacklisted: obool,
  agencyId: nstr,
  discountPct: nint,
});
export const creatorUpdateSchema = creatorCreateSchema.partial();

/* --------------------------------- Lead ---------------------------------- */

export const leadCreateSchema = obj({
  brandName: z.string(),
  agencyId: nstr,
  contactPerson: nstr,
  personRole: nstr,
  money: nstr,
  engagementRate: nstr,
  peopleCount: oint,
  status: enumOf(LEAD_STATUS).optional(),
  intent: enumOf(LEAD_INTENT).optional(),
  dealType: enumOf(DEAL_TYPE).optional(),
  channel: nstr,
  source: nstr,
  ownerId: nstr,
});
export const leadUpdateSchema = leadCreateSchema.partial();

/* -------------------------------- Campaign -------------------------------- */

export const campaignCreateSchema = obj({
  name: z.string(),
  brandName: z.string(),
  agencyId: nstr,
  status: enumOf(CAMPAIGN_STATUS).optional(),
  progress: oint,
  budget: oint,
  engagementRate: nstr,
  contactPerson: nstr,
  peopleCount: oint,
  website: nstr,
  timeline: nstr,
});
export const campaignUpdateSchema = campaignCreateSchema.partial();

/* -------------------------------- Contact --------------------------------- */
/* `email` stays a plain string: the column is free-form and a stricter check
   would reject the blank value an untouched form field submits. */

export const contactCreateSchema = obj({
  name: z.string(),
  company: nstr,
  email: nstr,
  phone: nstr,
  budget: nint,
  source: nstr,
  role: nstr,
  avatarUrl: nstr,
});
export const contactUpdateSchema = contactCreateSchema.partial();

/* -------------------------------- Contract -------------------------------- */
/* Contract.status is a free-form String defaulting to "draft" (lowercase) — it
   is deliberately not an enum. */

export const contractCreateSchema = obj({
  kind: enumOf(CONTRACT_KIND),
  title: z.string(),
  campaignId: nstr,
  amount: nint,
  status: ostr,
});
export const contractUpdateSchema = contractCreateSchema.partial();

/* -------------------------------- Invoice --------------------------------- */
/* InvoicesPage patches { status: "PAID" }. */

export const invoiceCreateSchema = obj({
  number: z.string(),
  brandName: z.string(),
  campaignId: nstr,
  budget: oint,
  agencyFee: oint,
  payout: oint,
  dealType: enumOf(DEAL_TYPE).optional(),
  status: enumOf(PAYMENT_STATUS).optional(),
});
export const invoiceUpdateSchema = invoiceCreateSchema.partial();

/* ---------------------------------- Poll ---------------------------------- */

export const pollCreateSchema = obj({
  kind: enumOf(POLL_KIND).optional(),
  question: z.string(),
  options: json,
  results: json.nullable().optional(),
});
export const pollUpdateSchema = pollCreateSchema.partial();

/* -------------------------------- Reminder -------------------------------- */
/* Holidays are stored as reminders; AddHolidaysPage may omit ownerId. */

export const reminderCreateSchema = obj({
  title: z.string(),
  dueAt: date,
  ownerId: nstr,
  done: obool,
});
export const reminderUpdateSchema = reminderCreateSchema.partial();

/* ---------------------------------- Team ---------------------------------- */

export const teamCreateSchema = obj({
  name: z.string(),
  kind: enumOf(TEAM_KIND),
});
export const teamUpdateSchema = teamCreateSchema.partial();

/* ---------------------------------- Leave --------------------------------- */
/* ApplyLeavesPage sends `userId: me?.id`, which JSON.stringify drops while the
   profile is still loading — so userId stays optional and Prisma remains the
   authority on the required relation. Leave.type is free-form ("Casual Leave"). */

export const leaveCreateSchema = obj({
  userId: z.string().optional(),
  type: z.string(),
  from: date,
  to: date,
  reason: nstr,
  status: enumOf(LEAVE_STATUS).optional(),
});
export const leaveUpdateSchema = leaveCreateSchema.partial();

/* ------------------------------- ChatChannel ------------------------------ */

export const channelCreateSchema = obj({
  name: z.string(),
  kind: enumOf(CHANNEL_KIND).optional(),
});
export const channelUpdateSchema = channelCreateSchema.partial();

/* ----------------------------- CalendarContent ---------------------------- */
/* CalendarContent.status is free-form ("scheduled" / "submitted"), not an enum. */

export const calendarCreateSchema = obj({
  creatorId: z.string(),
  title: z.string(),
  scheduledAt: date,
  status: ostr,
});
export const calendarUpdateSchema = calendarCreateSchema.partial();

/* ---------------------------------- Note ---------------------------------- */

export const noteCreateSchema = obj({
  body: z.string(),
  color: ostr,
  pinned: obool,
  ownerId: nstr,
});
export const noteUpdateSchema = noteCreateSchema.partial();

/* -------------------------------- registry -------------------------------- */

/** Keyed by the URL segment each resource is mounted on in routes/index.ts. */
/** Subscription plan catalogue (FREE / LITE / PRO / ULTIMATE / CUSTOM). */
const planCreateSchema = z
  .object({
    name: z.string().min(1),
    price: z.coerce.number().int().min(0).optional(),
    interval: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
  })
  .passthrough();
const planUpdateSchema = planCreateSchema.partial();

/** Daily attendance. Unique on (userId, date), so writes should upsert. */
const attendanceCreateSchema = z
  .object({
    userId: z.string().min(1),
    date: z.coerce.date(),
    present: z.coerce.boolean().optional(),
    loginAt: z.coerce.date().optional(),
  })
  .passthrough();
const attendanceUpdateSchema = attendanceCreateSchema.partial();

export const schemas = {
  plans: { create: planCreateSchema, update: planUpdateSchema },
  attendance: { create: attendanceCreateSchema, update: attendanceUpdateSchema },
  agencies: { create: agencyCreateSchema, update: agencyUpdateSchema },
  creators: { create: creatorCreateSchema, update: creatorUpdateSchema },
  leads: { create: leadCreateSchema, update: leadUpdateSchema },
  campaigns: { create: campaignCreateSchema, update: campaignUpdateSchema },
  contacts: { create: contactCreateSchema, update: contactUpdateSchema },
  contracts: { create: contractCreateSchema, update: contractUpdateSchema },
  invoices: { create: invoiceCreateSchema, update: invoiceUpdateSchema },
  polls: { create: pollCreateSchema, update: pollUpdateSchema },
  reminders: { create: reminderCreateSchema, update: reminderUpdateSchema },
  teams: { create: teamCreateSchema, update: teamUpdateSchema },
  leaves: { create: leaveCreateSchema, update: leaveUpdateSchema },
  channels: { create: channelCreateSchema, update: channelUpdateSchema },
  calendar: { create: calendarCreateSchema, update: calendarUpdateSchema },
  notes: { create: noteCreateSchema, update: noteUpdateSchema },
} satisfies Record<string, { create: z.ZodTypeAny; update: z.ZodTypeAny }>;

/** URL segments the registry covers. */
export type ResourceName = keyof typeof schemas;
