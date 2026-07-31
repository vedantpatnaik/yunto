import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

/**
 * Data layer for the native app.
 *
 * Deliberately mirrors web/src/api/hooks.ts one-for-one: same resource names,
 * same query keys, same shapes. Both clients talk to the same Express + Prisma
 * backend, so keeping the surfaces identical means a fix on one side ports
 * verbatim to the other.
 */

export function useList<T = Record<string, unknown>>(resource: string) {
  return useQuery({
    queryKey: [resource],
    queryFn: () => api<T[]>(`/${resource}`),
    staleTime: 30_000,
  });
}

export function useCreate<T = Record<string, unknown>>(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<T>) =>
      api<T>(`/${resource}`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

export function useUpdate<T = Record<string, unknown>>(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
      api<T>(`/${resource}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

export function useRemove(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/${resource}/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

/* ------------------------------ entity types ----------------------------- */
export interface Creator {
  id: string; name: string; handle: string; followers: number; avgViews: number;
  engagementRate: number; stars: number; cpv: number; leadsCount?: number;
  matchPct?: number; listed?: boolean; niche?: string; location?: string;
  gender?: string; platform?: string; agencyId?: string; discountPct?: number;
  avatarUrl?: string;
}
export interface Agency {
  id: string; name: string; description?: string; creatorsCount: number;
  earnings: number; campaignsCount: number; website?: string;
}
export interface Lead {
  id: string; brandName: string; contactPerson?: string; personRole?: string;
  money?: string; engagementRate?: string; peopleCount: number; status: string;
  intent: string; dealType?: string; ownerId?: string; agencyId?: string;
  createdAt?: string; updatedAt?: string;
}
export interface Campaign {
  id: string; name: string; brandName: string; status: string; progress: number;
  budget: number; engagementRate?: string; contactPerson?: string;
  peopleCount?: number; website?: string; timeline?: string; agencyId?: string;
}
export interface Invoice {
  id: string; number: string; brandName: string; budget: number;
  agencyFee: number; payout: number; status: string; campaignId?: string;
  createdAt?: string;
}
export interface CampaignFull extends Campaign {
  agency?: Agency;
  creatorList: {
    id: string; name: string; handle: string; followers: number; avgViews: number;
    engagementRate: number; stars: number; cpv: number; location?: string;
    rating?: number; done?: boolean;
  }[];
  invoice?: Invoice | null;
}
export interface Contact {
  id: string; name: string; company?: string; email?: string; phone?: string;
  budget?: number; source?: string; role?: string;
}
export interface Message {
  id: string; channelId: string; authorName?: string; body: string; createdAt: string;
}
export interface Contract {
  id: string; kind: string; title: string; amount?: number; status: string; campaignId?: string;
}
export interface Reminder { id: string; title: string; dueAt: string; done: boolean }
export interface Poll { id: string; kind: string; question: string; options: string[]; results?: number[] }
export interface Leave {
  id: string; userId: string; type: string; from: string; to: string;
  reason?: string; status: string;
}
export interface User {
  id: string; name: string; email: string; phone?: string; role: string;
  avatarUrl?: string; targetMonthly?: number; targetYearly?: number;
  team?: { id: string; name: string; kind: string };
}
export interface Channel { id: string; name: string; kind: string }
export interface CalendarItem {
  id: string; creatorId: string; title: string; scheduledAt: string; status: string;
}
export interface Note {
  id: string; body: string; color: string; pinned: boolean;
  createdAt: string; updatedAt: string;
}
export interface Notification {
  id: string; kind: string; title: string; body?: string; read: boolean;
  entityType?: string; entityId?: string; createdAt: string;
}
export type LandingTheme = "MODERN" | "DARK" | "CLEAN";
export type LandingLayout = "CENTERED" | "LEFT";
/** A creator's public landing page (socy.io/<slug>) — the landing-page editor. */
export interface LandingPage {
  id: string; creatorId: string; slug: string; headline?: string; bio?: string;
  theme: LandingTheme; layout: LandingLayout; fontStyle?: string;
  contactTime?: string; services: string[]; hideInsights: boolean;
  published: boolean; createdAt?: string; updatedAt?: string;
}
/**
 * The caller's own bank / payout account plus the billing identity stamped on
 * their invoices. Every column is nullable server-side because Bank Details and
 * the invoice "Your Details" form each fill in one half of the row.
 *
 * `accountNumberMasked` is derived by the API and is read-only — write the raw
 * number back through `accountNumber`.
 */
export interface PayoutDetail {
  id: string; userId: string;
  accountHolderName?: string | null; bankName?: string | null;
  accountNumber?: string | null; accountNumberMasked?: string | null;
  ifsc?: string | null; upiId?: string | null; verified?: boolean;
  legalName?: string | null; tradeName?: string | null; gstNumber?: string | null;
  mobile?: string | null; pincode?: string | null; state?: string | null;
}
/** Server enum DeliverableKind — the formats a creator can be booked for. */
export type DeliverableKind =
  | "REEL" | "POST" | "STORY" | "CAROUSEL" | "STATIC_POST" | "COLLAB"
  | "INTEGRATED_VIDEO" | "DEDICATED_VIDEO" | "SHORT" | "UGC" | "EVENT_APPEARANCE";
/** Server enum ServiceKind — which of the two service forms wrote the booking. */
export type ServiceKind = "VIDEOGRAPHER" | "EDITOR";
/**
 * A paid service slot booked with a creator — the videographer and editor
 * "Confirm Booking" forms. `total` is the quoted rupee total the summary shows
 * and `addons` the add-on keys switched on in that form ("subtitles", "fast").
 * Editor jobs are quoted per batch of videos, so their `hours` is 0.
 */
export interface Booking {
  id: string; creatorId: string; bookedById?: string | null;
  service: ServiceKind; scheduledAt: string; hours: number; total: number;
  projectType?: string | null; location?: string | null; brief?: string | null;
  addons: string[]; status: string; createdAt?: string;
}
/**
 * A creator's published rate card — one row per creator (`creatorId` is unique),
 * so Commercials edits the rupee rates and Barter Commercials edits the barter
 * half of the very same record.
 */
export interface RateCard {
  id: string; creatorId: string; reelRate: number; postRate: number;
  storyRate: number; integratedRate: number; dedicatedRate: number;
  shortRate: number; acceptsBarter: boolean; barterValue: number | null;
  barterFormats: DeliverableKind[]; createdAt?: string; updatedAt?: string;
}
/**
 * The structured brief posted into a campaign thread — one row per campaign
 * (`campaignId` is unique server-side), so the brief card create-or-updates the
 * very same record rather than stacking duplicates.
 *
 * `keyMessage` / `targetAudience` are the two paragraphs; the three arrays are
 * the bullet lists, stored in the order the card draws them.
 */
export interface CampaignBrief {
  id: string; campaignId: string;
  keyMessage?: string | null; targetAudience?: string | null;
  guidelines: string[]; deliverables: string[]; notes: string[];
  createdAt?: string; updatedAt?: string;
}
/**
 * Server enum Platform. Named for its use here rather than `Platform` so a
 * screen can still import React Native's `Platform` alongside these types.
 */
export type DeliverablePlatform = "INSTAGRAM" | "YOUTUBE" | "TIKTOK";
/**
 * One deliverable agreed on a lead — a row of the "Select your deliverables"
 * sheet (platform, format, how many, how many visits) plus the link submitted
 * once it ships. Many rows per lead, so filter the list by `leadId`.
 */
export interface LeadDeliverable {
  id: string; leadId: string; platform: DeliverablePlatform; kind: DeliverableKind;
  quantity: number; visits: number; note?: string | null; link?: string | null;
  createdAt?: string;
}

/* -------------------------------- hooks ---------------------------------- */
export const useCreators = () => useList<Creator>("creators");
export const useAgencies = () => useList<Agency>("agencies");
export const useLeads = () => useList<Lead>("leads");
export const useCampaigns = () => useList<Campaign>("campaigns");
export const useInvoices = () => useList<Invoice>("invoices");
export const useContacts = () => useList<Contact>("contacts");
export const useReminders = () => useList<Reminder>("reminders");
export const useContracts = () => useList<Contract>("contracts");
export const usePolls = () => useList<Poll>("polls");
export const useLeaves = () => useList<Leave>("leaves");
export const useUsers = () => useList<User>("users");
export const useChannels = () => useList<Channel>("channels");
export const useCalendar = () => useList<CalendarItem>("calendar");
export const useNotes = () => useList<Note>("notes");
/** Every creator's rate card. Find the caller's by `creatorId`. */
export const useRateCards = () => useList<RateCard>("rate-cards");
/** Every creator's landing page. Find the caller's by `creatorId`. */
export const useLandingPages = () => useList<LandingPage>("landing-pages");
/** Every lead's agreed deliverables, newest first. Find one lead's by `leadId`. */
export const useLeadDeliverables = () => useList<LeadDeliverable>("lead-deliverables");
/** Every campaign brief. Find one campaign's by `campaignId` (unique per campaign). */
export const useCampaignBriefs = () => useList<CampaignBrief>("campaign-briefs");
/**
 * Every service booking, newest slot first (the API orders on `scheduledAt`
 * desc). Filter by `creatorId` / `service` for one creator's videographer or
 * editor slots.
 */
export const useBookings = () => useList<Booking>("bookings");

export const useCampaignFull = (id: string | null) =>
  useQuery({
    queryKey: ["campaign-full", id],
    queryFn: () => api<CampaignFull>(`/campaigns/${id}/full`),
    enabled: !!id,
  });

export const useMessages = (channelId: string | null) =>
  useQuery({
    queryKey: ["messages", channelId],
    queryFn: () => api<Message[]>(`/channels/${channelId}/messages`),
    enabled: !!channelId,
  });

/**
 * Post to a channel. The author is taken from the token server-side, so the
 * client neither sends nor can spoof one. Invalidates that channel's thread.
 */
export function useSendMessage(channelId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      api<Message>(`/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", channelId] }),
  });
}

/** The authenticated user. Drives greetings and owner-scoped actions. */
export const useMe = () =>
  useQuery({ queryKey: ["me"], queryFn: () => api<User>("/auth/me"), staleTime: 300_000 });

/**
 * Payout / billing details — a singleton, not a collection. The API scopes the
 * row to the bearer token (no list, no `/:id`, because it holds a bank account
 * number), so `useList`/`useUpdate` do not fit: there is no id to address it by.
 * Resolves to null until the user has saved something.
 */
export const usePayoutDetail = () =>
  useQuery({
    queryKey: ["payout-details"],
    queryFn: () => api<PayoutDetail | null>("/payout-details"),
    staleTime: 30_000,
  });

/**
 * Create-or-update the caller's payout / billing row. The server upserts, so a
 * first-time save and an edit are the same request, and only the keys sent are
 * touched — the Bank Details half of the row survives a "Your Details" save.
 */
export function useSavePayoutDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PayoutDetail>) =>
      api<PayoutDetail>("/payout-details", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payout-details"] }),
  });
}

/** The subset of the profile a user may change about themselves. */
export type MePatch = Pick<User, "targetMonthly" | "targetYearly">;

/**
 * Write the signed-in user's own profile via PATCH /auth/me. The row is picked
 * server-side from the token, so there is no id to pass and no way to address
 * anyone else's record — which is why this is not `useUpdate("users")`.
 *
 * The response is the fresh user, so it seeds ["me"] directly; ["users"] is
 * invalidated too because the team screens list the same target columns.
 */
export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MePatch>) =>
      api<User>("/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: (user) => {
      qc.setQueryData<User>(["me"], user);
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<{ items: Notification[]; unreadCount: number }>("/notifications"),
    staleTime: 15_000,
  });

/** Convert a lead into a campaign. Invalidates both collections. */
export function useConvertLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (leadId: string) =>
      api<{ campaign: Campaign; leadId: string }>(`/leads/${leadId}/convert`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

/* ------------------------------ formatting -------------------------------- */
export const inr = (n: number) => n.toLocaleString("en-IN");

/** 1_200_000 -> "1.2M", 900_000 -> "900k". Matches the web formatter. */
export const compact = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
    : n >= 1_000
      ? `${Math.round(n / 1_000)}k`
      : `${n}`;
