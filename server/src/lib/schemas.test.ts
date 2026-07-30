/**
 * Validation tests for lib/schemas.ts.
 *
 * Uses the Node built-in test runner so no dev dependency is added:
 *   npx tsx --test src/lib/schemas.test.ts
 *
 * The "valid" payloads are copied verbatim from the screens that send them, so a
 * regression here means a real admin screen would start failing with a 422.
 */
import test from "node:test";
import assert from "node:assert/strict";

import {
  creatorCreateSchema,
  creatorUpdateSchema,
  leadCreateSchema,
  leaveCreateSchema,
  invoiceUpdateSchema,
} from "./schemas";

/* --------------------------------- creators ------------------------------- */

test("creators: accepts the AddCreatorPage payload", () => {
  // src/features/add-creator/AddCreatorPage.tsx
  const parsed = creatorCreateSchema.parse({
    name: "New Creator",
    handle: "", // sent blank by the form — must not be rejected
    followers: 1_200_000,
    avgViews: 90_000,
    location: "",
    niche: "",
    listed: false,
    engagementRate: 0,
    stars: 0,
    cpv: 0,
  });
  assert.equal(parsed.name, "New Creator");
  assert.equal(parsed.handle, "");
  assert.equal(parsed.followers, 1_200_000);
});

test("creators: rejects an unknown platform enum member", () => {
  const r = creatorCreateSchema.safeParse({ name: "A", handle: "a", platform: "FACEBOOK" });
  assert.equal(r.success, false);
});

test("creators: update accepts agencyId: null (assign-creators un-assign)", () => {
  // src/features/people-assign-creators/AssignCreatorsPage.tsx
  const r = creatorUpdateSchema.safeParse({ agencyId: null });
  assert.equal(r.success, true);
  assert.equal(r.success && r.data.agencyId, null);
});

test("creators: coerces numeric strings and normalises enum case", () => {
  const parsed = creatorCreateSchema.parse({
    name: "A",
    handle: "a",
    followers: "1200",
    stars: "4.5",
    platform: "youtube",
  });
  assert.equal(parsed.followers, 1200);
  assert.equal(parsed.stars, 4.5);
  assert.equal(parsed.platform, "YOUTUBE");
});

/* ---------------------------------- leads --------------------------------- */

test("leads: accepts the CreateLeadPaidPage payload", () => {
  // src/features/create-lead-paid/CreateLeadPaidPage.tsx
  const parsed = leadCreateSchema.parse({
    brandName: "Acme",
    contactPerson: "Jane",
    money: "50000",
    dealType: "PAID",
    status: "NEW",
    intent: "MEDIUM",
    peopleCount: 0,
  });
  assert.equal(parsed.brandName, "Acme");
  assert.equal(parsed.dealType, "PAID");
  // Lead.engagementRate is a String column, unlike Creator's Float.
  assert.equal(leadCreateSchema.safeParse({ brandName: "A", engagementRate: "4.2%" }).success, true);
});

test("leads: rejects a status outside the LeadStatus enum", () => {
  const r = leadCreateSchema.safeParse({ brandName: "Acme", status: "ARCHIVED" });
  assert.equal(r.success, false);
});

test("leads: passes unknown keys through untouched", () => {
  const parsed = leadCreateSchema.parse({ brandName: "Acme", somethingNew: "keep me" });
  assert.equal((parsed as Record<string, unknown>).somethingNew, "keep me");
});

/* --------------------------------- leaves --------------------------------- */

test("leaves: accepts the ApplyLeavesPage payload and coerces ISO dates", () => {
  // src/features/apply-leaves/ApplyLeavesPage.tsx
  const parsed = leaveCreateSchema.parse({
    userId: "usr_123",
    type: "Casual Leave",
    from: "2026-07-31T00:00:00.000Z",
    to: "2026-08-01T00:00:00.000Z",
    reason: "",
  });
  assert.ok(parsed.from instanceof Date);
  assert.equal(parsed.from.toISOString(), "2026-07-31T00:00:00.000Z");
  assert.equal(parsed.type, "Casual Leave");
});

test("leaves: rejects an unparseable date", () => {
  const r = leaveCreateSchema.safeParse({ type: "Casual Leave", from: "not-a-date", to: "also-bad" });
  assert.equal(r.success, false);
});

test("leaves: userId stays optional while the profile is still loading", () => {
  // ApplyLeavesPage sends `userId: me?.id`; JSON.stringify drops it when undefined.
  const r = leaveCreateSchema.safeParse({
    type: "Casual Leave",
    from: "2026-07-31T00:00:00.000Z",
    to: "2026-08-01T00:00:00.000Z",
  });
  assert.equal(r.success, true);
});

/* -------------------------------- invoices -------------------------------- */

test("invoices: update accepts { status: 'PAID' } and rejects a bad status", () => {
  // src/features/invoices/InvoicesPage.tsx
  assert.equal(invoiceUpdateSchema.parse({ status: "PAID" }).status, "PAID");
  assert.equal(invoiceUpdateSchema.safeParse({ status: "SETTLED" }).success, false);
});
