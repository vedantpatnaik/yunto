import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

/** Generic list hook for any backend resource (/api/<resource>). */
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

// ---- typed convenience hooks for the core entities ----
export interface Creator { id: string; name: string; handle: string; followers: number; avgViews: number; engagementRate: number; stars: number; cpv: number; leadsCount?: number; matchPct?: number; listed?: boolean; niche?: string; location?: string; agencyId?: string; }
export interface Agency { id: string; name: string; description?: string; creatorsCount: number; earnings: number; campaignsCount: number; }
export interface Lead { id: string; brandName: string; contactPerson?: string; personRole?: string; money?: string; engagementRate?: string; peopleCount: number; status: string; intent: string; }
export interface Campaign { id: string; name: string; brandName: string; status: string; progress: number; budget: number; engagementRate?: string; contactPerson?: string; peopleCount?: number; website?: string; timeline?: string; agencyId?: string; }
export interface Invoice { id: string; number: string; brandName: string; budget: number; agencyFee: number; payout: number; status: string; }
export interface CampaignFull extends Campaign {
  agency?: Agency;
  creatorList: { id: string; name: string; handle: string; followers: number; avgViews: number; engagementRate: number; stars: number; cpv: number; location?: string; rating?: number; done?: boolean }[];
  invoice?: Invoice | null;
}
export const useCampaignFull = (id: string | null) =>
  useQuery({ queryKey: ["campaign-full", id], queryFn: () => api<CampaignFull>(`/campaigns/${id}/full`), enabled: !!id });

export const useCreators = () => useList<Creator>("creators");
export const useAgencies = () => useList<Agency>("agencies");
export const useLeads = () => useList<Lead>("leads");
export const useCampaigns = () => useList<Campaign>("campaigns");
export const useInvoices = () => useList<Invoice>("invoices");
export interface Contact { id: string; name: string; company?: string; email?: string; phone?: string; budget?: number; source?: string; role?: string; }
export interface Message { id: string; channelId: string; authorName?: string; body: string; createdAt: string; }
export const useMessages = (channelId: string | null) =>
  useQuery({ queryKey: ["messages", channelId], queryFn: () => api<Message[]>(`/channels/${channelId}/messages`), enabled: !!channelId });
export interface Contract { id: string; kind: string; title: string; amount?: number; status: string; campaignId?: string; }
export interface Reminder { id: string; title: string; dueAt: string; done: boolean; }
export interface Poll { id: string; kind: string; question: string; options: string[]; results?: number[]; }
export interface Leave { id: string; userId: string; type: string; from: string; to: string; reason?: string; status: string; }
export interface User { id: string; name: string; email: string; phone?: string; role: string; avatarUrl?: string; targetMonthly?: number; targetYearly?: number; team?: { id: string; name: string; kind: string }; }
export interface Channel { id: string; name: string; kind: string; }
export interface CalendarItem { id: string; creatorId: string; title: string; scheduledAt: string; status: string; }

export const useContacts = () => useList<Contact>("contacts");
export const useReminders = () => useList<Reminder>("reminders");
export const useContracts = () => useList<Contract>("contracts");
export const usePolls = () => useList<Poll>("polls");
export const useLeaves = () => useList<Leave>("leaves");
export const useUsers = () => useList<User>("users");
/** The currently authenticated user (GET /auth/me) — for owner/user-scoped actions + greeting. */
export const useMe = () => useQuery({ queryKey: ["me"], queryFn: () => api<User>("/auth/me"), staleTime: 300_000 });
export const useChannels = () => useList<Channel>("channels");
export const useCalendar = () => useList<CalendarItem>("calendar");
export const useAgency = () => useList<Agency>("agencies"); // alias

/** Generic update + delete mutations for any resource (/api/<resource>/:id). */
export function useUpdate<T = Record<string, unknown>>(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
      api<T>(`/${resource}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}
/** Convert a lead into a campaign (POST /leads/:id/convert). Invalidates leads + campaigns. */
export function useConvertLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (leadId: string) => api<{ campaign: Campaign; leadId: string }>(`/leads/${leadId}/convert`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}
export function useRemove(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/${resource}/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

// ---- dashboard aggregate stats (live from /stats/dashboard) ----
export interface DashboardStats {
  overview: { activeAgencies: number; activeCreators: number; monthlyRevenue: number; activeLeads: number; activeCampaigns: number; pendingPayouts: number };
  topCreators: { name: string; handle: string; followers: number; avgViews: number; leadsCount: number }[];
  topAgencies: { name: string; description: string; creatorsCount: number; earnings: number; campaignsCount: number }[];
  agenciesTotal: number;
  revenue: { month: string; value: number }[];
  leadProgress: { total: number; new: number; contacted: number; converted: number };
  campaignProgress: { total: number; active: number; completed: number; draft: number };
  topPerforming: { name: string; earnings: number }[];
}
export const useDashboard = () =>
  useQuery({ queryKey: ["dashboard"], queryFn: () => api<DashboardStats>("/stats/dashboard"), staleTime: 30_000 });
