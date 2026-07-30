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

/** The authenticated user. Drives greetings and owner-scoped actions. */
export const useMe = () =>
  useQuery({ queryKey: ["me"], queryFn: () => api<User>("/auth/me"), staleTime: 300_000 });

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
