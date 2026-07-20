import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Search,
  SlidersHorizontal,
  Megaphone,
  Users,
  Check,
  X,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

/**
 * Agency app — All requests (Figma frame 7696:11416, "all requests", 375×876),
 * rendered inside the 390px MobileFrame. Self-contained: it carries its own
 * status bar. This is a drill-down "view all" list (like the sibling
 * All-creators, node 7882:13945) — the incoming collaboration requests queue the
 * operations manager approves/declines — so it has no bottom nav.
 *
 * REAL geometry pinned from the cached full-document tree for THIS node: the
 * frame is 375×876 at origin (-6840, 1576) with a single flat solid fill of
 * #F8F5EF (warm off-white, bound to a Figma color variable) — used verbatim as
 * the page background below. That fill places this frame in the same visual
 * family as All-creators (also #F8F5EF), so the mobile chrome is reused verbatim.
 *
 * NOTE: For the entire build window the Figma REST geometry endpoints returned
 * HTTP 429 ("Rate limit exceeded", multi-day retry-after on the Starter plan —
 * /me still 200s, so the token is valid; only the cost-based /nodes and /images
 * endpoints are throttled) and the Figma MCP bridge returned "reached the Figma
 * MCP tool call limit on the Starter plan". The cached document dump is depth-2
 * only, so this frame resolves with its own box + fill but ZERO child geometry.
 * Child layout is therefore reconstructed from the shared design system
 * (tailwind.config.ts tokens) and the verified sibling idioms:
 *   • AgencyAllCreatorsPg (node 7882:13945) — the #F8F5EF drill-down chrome:
 *     status bar, white circular back button, centered title + count subtitle,
 *     search + filter row, filter chips, 20px side margins, 12px card rhythm.
 *   • AgencyActiveCampaignsPg (node 7696:11291) — the campaign card idiom:
 *     avatar + name/@handle, Barter/Paid type pill, stat chips, and the
 *     black-pill primary action.
 * Re-run against node 7696:11416 to pin pixel-exact coordinates once the Figma
 * API budget resets.
 */

/* --------------------------------- data ---------------------------------- */
type Status = "pending" | "approved" | "declined";

type Request = {
  name: string;
  handle: string;
  campaign: string;
  type: "Barter" | "Paid";
  followers: string;
  date: string;
  grad: string;
  status: Status;
};

const REQUESTS: Request[] = [
  { name: "Leena Sharma", handle: "@leenabliss", campaign: "Summer Glow", type: "Barter", followers: "1.2M", date: "2h ago", grad: "from-[#F1FFC3] to-[#C8B3ED]", status: "pending" },
  { name: "Aditya Singh", handle: "@adityasingh", campaign: "Zostel Trip", type: "Paid", followers: "1.5M", date: "5h ago", grad: "from-[#C8DBFF] to-[#B7A6EC]", status: "pending" },
  { name: "Diya Sharma", handle: "@diya444", campaign: "Festive Edit", type: "Barter", followers: "1.1M", date: "1d ago", grad: "from-[#FFD3E8] to-[#C8B3ED]", status: "approved" },
  { name: "Rahul Verma", handle: "@rahulv", campaign: "Nykaa Launch", type: "Paid", followers: "1.3M", date: "1d ago", grad: "from-[#C8F5E4] to-[#9FB8F0]", status: "pending" },
  { name: "Priya Nair", handle: "@priyaglow", campaign: "Summer Glow", type: "Barter", followers: "980k", date: "2d ago", grad: "from-[#FFE3C0] to-[#D8B3ED]", status: "declined" },
];

/* ------------------------------- primitives ------------------------------ */
function Chip({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <span className="flex h-[24px] items-center gap-[5px] rounded-full bg-[#F3F0E9] px-[10px] text-[11.5px] font-normal leading-none text-ink/75">
      {Icon && <Icon className="h-[13px] w-[13px] text-ink/50" strokeWidth={1.7} />}
      {children}
    </span>
  );
}

function TypePill({ type }: { type: Request["type"] }) {
  const barter = type === "Barter";
  return (
    <span
      className={`flex h-[24px] items-center rounded-full px-[11px] text-[11.5px] font-medium leading-none ${
        barter ? "bg-[#EFEBF9] text-[#6B4FD8]" : "bg-[#E6F0FF] text-[#3B6FE0]"
      }`}
    >
      {type}
    </span>
  );
}

function StatusPill({ status }: { status: Exclude<Status, "pending"> }) {
  const approved = status === "approved";
  return (
    <span
      className={`flex h-[28px] items-center gap-[6px] rounded-full px-[12px] text-[12px] font-medium leading-none ${
        approved ? "bg-[#E4F6E9] text-[#2F9A5D]" : "bg-[#FBE7E7] text-[#D14343]"
      }`}
    >
      <span className={`h-[6px] w-[6px] rounded-full ${approved ? "bg-[#2F9A5D]" : "bg-[#D14343]"}`} />
      {approved ? "Approved" : "Declined"}
    </span>
  );
}

function RequestCard({ r }: { r: Request }) {
  return (
    <div className="relative w-full rounded-[18px] bg-white p-[14px] shadow-[0_4px_14px_rgba(0,0,0,0.05)]">
      {/* header */}
      <div className="flex items-start gap-[10px]">
        <span className={`h-[42px] w-[42px] shrink-0 rounded-full bg-gradient-to-br ${r.grad}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-[6px]">
            <span className="truncate text-[14px] font-medium leading-none text-ink/90">{r.name}</span>
            <span className="shrink-0 text-[10.5px] font-light leading-none text-ink/50">{r.handle}</span>
          </div>
          <div className="mt-[6px] flex items-center gap-[6px]">
            <TypePill type={r.type} />
            <Chip icon={Users}>{r.followers}</Chip>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-light leading-none text-ink/45">{r.date}</span>
      </div>

      {/* request context */}
      <div className="mt-[12px] flex items-center gap-[7px] rounded-[12px] bg-[#F7F5F0] px-[11px] py-[9px]">
        <Megaphone className="h-[15px] w-[15px] shrink-0 text-ink/55" strokeWidth={1.7} />
        <span className="truncate text-[12px] font-light leading-none text-ink/65">
          Wants to join <span className="font-medium text-ink/90">{r.campaign}</span>
        </span>
      </div>

      {/* actions / status */}
      {r.status === "pending" ? (
        <div className="mt-[12px] flex items-center gap-[8px]">
          <button className="flex h-[38px] flex-1 items-center justify-center gap-[6px] rounded-full border border-line/70 bg-white text-[13px] font-medium leading-none text-ink/70">
            <X className="h-[15px] w-[15px]" strokeWidth={2} />
            Decline
          </button>
          <button className="flex h-[38px] flex-1 items-center justify-center gap-[6px] rounded-full bg-ink text-[13px] font-medium leading-none text-white">
            <Check className="h-[15px] w-[15px]" strokeWidth={2} />
            Approve
          </button>
        </div>
      ) : (
        <div className="mt-[12px] flex items-center justify-between">
          <StatusPill status={r.status} />
          <span className="text-[11px] font-light leading-none text-ink/40">Reviewed {r.date}</span>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={`flex h-[30px] shrink-0 items-center rounded-full px-[16px] text-[12.5px] leading-none ${
        active
          ? "bg-ink font-medium text-white"
          : "border border-line/70 bg-white font-normal text-ink/70"
      }`}
    >
      {label}
    </span>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgAllRequestsPg() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-[#F8F5EF] font-sans text-ink" style={{ height: 876 }}>
      {/* status bar */}
      <div className="absolute inset-x-0 top-0 h-[54px]">
        <span className="absolute left-[26px] top-[17px] text-[15px] font-medium leading-none text-ink">
          9:41
        </span>
        <div className="absolute right-[22px] top-[18px] flex items-center gap-[6px]">
          <Signal className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <Wifi className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <BatteryFull className="h-[18px] w-[18px] text-ink" strokeWidth={1.6} />
        </div>
      </div>

      {/* header */}
      <button className="absolute left-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>
      <h1 className="absolute inset-x-0 top-[64px] text-center text-[18px] font-medium leading-none text-ink">
        All requests
      </h1>
      <span className="absolute inset-x-0 top-[88px] text-center text-[11px] font-light leading-none text-ink/45">
        18 requests · 3 pending
      </span>

      {/* search + filter */}
      <div className="absolute left-[20px] top-[120px] flex h-[46px] w-[280px] items-center gap-[10px] rounded-[14px] bg-white px-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <Search className="h-[18px] w-[18px] text-ink/40" strokeWidth={1.8} />
        <span className="text-[13px] font-light text-ink/40">Search requests</span>
      </div>
      <button className="absolute right-[20px] top-[120px] flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <SlidersHorizontal className="h-[19px] w-[19px] text-ink/70" strokeWidth={1.8} />
      </button>

      {/* filter chips */}
      <div className="absolute left-[20px] top-[182px] flex w-[350px] items-center gap-[8px] overflow-hidden">
        <FilterChip label="All" active />
        <FilterChip label="Pending" />
        <FilterChip label="Approved" />
        <FilterChip label="Declined" />
      </div>

      {/* request list */}
      <div className="absolute left-[20px] top-[236px] flex w-[350px] flex-col gap-[12px]">
        {REQUESTS.map((r) => (
          <RequestCard key={r.handle} r={r} />
        ))}
      </div>
    </div>
  );
}
