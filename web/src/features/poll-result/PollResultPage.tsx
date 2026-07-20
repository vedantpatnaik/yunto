import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  X,
  Users,
  Eye,
  Heart,
  ArrowUpRight,
  Hash,
  ChevronDown,
  ChevronRight,
  Plus,
  RotateCw,
  Info,
  BarChart3,
  AtSign,
  Smile,
  Paperclip,
} from "lucide-react";
import { useList, useChannels, useUsers, useCampaigns, useCreators, useMe, type Poll, type Creator } from "@/api/hooks";

const compactN = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  : n >= 1_000 ? `${Math.round(n / 1_000)}k` : `${n}`;

/**
 * Super Admin — Poll Result.
 * Exact reconstruction of Figma frame 4821:13668 ("Super Admin-poll result"),
 * 1440×1024. A chat workspace (dimmed under a 50% scrim) with the "Poll Results"
 * modal floating at full opacity. Every element is placed at exact
 * frame-relative coordinates.
 */

/* ------------------------------ background: channel list ---------------- */
type Bind = "channel" | "user" | "campaign";
type Row = {
  y: number;
  label: string;
  kind: "header" | "hash" | "add" | "dm";
  /** rows whose label comes from live data; the literal below is only a layout placeholder */
  bind?: Bind;
  active?: boolean;
  collapsed?: boolean;
  indent?: boolean;
  badge?: boolean;
  you?: boolean;
};

const ROWS: Row[] = [
  { y: 176, label: "Notifications", kind: "header" },
  { y: 204, label: "", kind: "hash", bind: "channel" },
  { y: 232, label: "", kind: "hash", bind: "channel" },
  { y: 260, label: "Add channels", kind: "add" },
  { y: 288, label: "Groups", kind: "header" },
  { y: 316, label: "", kind: "hash", bind: "channel" },
  { y: 344, label: "", kind: "hash", bind: "channel", active: true },
  { y: 372, label: "", kind: "hash", bind: "channel" },
  { y: 400, label: "", kind: "hash", bind: "channel" },
  { y: 428, label: "", kind: "hash", bind: "channel" },
  { y: 456, label: "Add group", kind: "add" },
  { y: 486, label: "Direct messages", kind: "header", collapsed: true, badge: true },
  { y: 514, label: "", kind: "dm", bind: "user", you: true },
  { y: 542, label: "", kind: "dm", bind: "user", you: true },
  { y: 570, label: "", kind: "dm", bind: "user", you: true },
  { y: 598, label: "Add person", kind: "add" },
  { y: 626, label: "Campaigns", kind: "header" },
  { y: 654, label: "", kind: "header", bind: "user" },
  { y: 682, label: "", kind: "header", bind: "campaign", indent: true },
  { y: 710, label: "Brand + Agencies", kind: "hash", indent: true },
  { y: 738, label: "Only Agencies", kind: "hash", indent: true },
  { y: 766, label: "Add group", kind: "add", indent: true },
  { y: 794, label: "", kind: "header", bind: "user", collapsed: true },
  { y: 822, label: "", kind: "header", bind: "user", collapsed: true },
  { y: 850, label: "", kind: "header", bind: "user", collapsed: true },
];

function ChannelRow({ row, active, badgeCount, onClick }: { row: Row; active: boolean; badgeCount?: number; onClick?: () => void }) {
  const iconLeft = row.indent ? 33 : 12;
  const textLeft = row.indent ? 60 : row.kind === "hash" ? 38 : row.kind === "dm" ? 41 : row.kind === "add" ? 40 : 39;
  return (
    <div
      className={`absolute left-[242px] h-[28px] w-[247px] ${active ? "rounded-[6px] bg-[#656565]" : ""}${onClick ? " cursor-pointer" : ""}`}
      style={{ top: row.y }}
      onClick={onClick}
    >
      {row.kind === "header" &&
        (row.collapsed ? (
          <ChevronRight className="absolute top-[7px] h-[14px] w-[14px] text-white/60" style={{ left: iconLeft }} strokeWidth={2} />
        ) : (
          <ChevronDown className="absolute top-[7px] h-[14px] w-[14px] text-white/60" style={{ left: iconLeft }} strokeWidth={2} />
        ))}
      {row.kind === "hash" && (
        <Hash className="absolute top-[6px] h-[15px] w-[15px] text-white/70" style={{ left: iconLeft }} strokeWidth={1.6} />
      )}
      {row.kind === "add" && (
        <span
          className="absolute top-[4px] flex h-[20px] w-[20px] items-center justify-center rounded-[4px] bg-white/10"
          style={{ left: iconLeft }}
        >
          <Plus className="h-[11px] w-[11px] text-white/70" strokeWidth={2} />
        </span>
      )}
      {row.kind === "dm" && (
        <span
          className="absolute top-[4px] h-[20px] w-[20px] rounded-[6px] bg-gradient-to-br from-[#FFE08A] to-[#F0A0C0]"
          style={{ left: iconLeft }}
        />
      )}
      <span
        className={`absolute top-[6px] text-[15px] leading-[15px] ${
          active ? "text-white" : "text-white/70"
        } ${row.kind === "header" ? "font-medium" : "font-normal"}`}
        style={{ left: textLeft }}
      >
        {row.label}
        {row.you && <span className="ml-[8px] font-normal text-white/70">you</span>}
      </span>
      {row.badge && !!badgeCount && (
        <span className="absolute right-[9px] top-[2px] flex h-[24px] min-w-[24px] items-center justify-center rounded-full bg-[#E64E4E] px-[4px] text-[10px] font-medium text-white">
          {badgeCount}
        </span>
      )}
    </div>
  );
}

/* ------------------------------ background: header chips ---------------- */
function HeaderChip({ icon: Icon, children, left, width }: { icon: LucideIcon; children: ReactNode; left: number; width: number }) {
  return (
    <div
      className="absolute top-[129px] flex h-[32px] items-center gap-[4px] rounded-[16px] bg-white/95 px-[6px]"
      style={{ left, width }}
    >
      <Icon className="h-[15px] w-[15px] text-black/70" strokeWidth={1.6} />
      <span className="text-[12px] font-light text-black/90">{children}</span>
    </div>
  );
}

/* ------------------------------ modal: stat chip ------------------------ */
function StatChip({ icon: Icon, iconClass, children, filled }: { icon: LucideIcon; iconClass: string; children: ReactNode; filled?: boolean }) {
  return (
    <div className={`flex h-[33px] items-center gap-[5px] rounded-[16px] border border-[#D9D9D9] px-[7px] ${filled ? "bg-white" : "bg-white/60"}`}>
      <Icon className={`h-[16px] w-[16px] ${iconClass}`} strokeWidth={1.7} />
      <span className="text-[13.6px] font-normal text-black/80">{children}</span>
    </div>
  );
}

/* ------------------------------ modal: creator card --------------------- */
function CreatorCard({ top, creator }: { top: number; creator: Creator }) {
  const navigate = useNavigate();
  return (
    <div
      className="pointer-events-auto absolute left-[473px] h-[137px] w-[492px] rounded-[15px] border-[1.5px] border-[#E7E8EB] bg-white"
      style={{ top }}
    >
      {/* avatar + fire badge */}
      <div className="absolute left-[13px] top-[12px] h-[44px] w-[44px]">
        <div className="h-[44px] w-[44px] rounded-full bg-gradient-to-br from-[#FFD8A8] to-[#F08FB0]" />
        <span className="absolute -bottom-[1px] -right-[1px] text-[15px] leading-none">🔥</span>
      </div>

      {/* name + handle */}
      <div className="absolute left-[67px] top-[9px] text-[19px] font-medium leading-[30px] text-black/90">{creator.name}</div>
      <div className="absolute left-[67px] top-[35px] font-inter text-[12.6px] font-normal text-black/70">{creator.handle}</div>

      {/* location */}
      <div className="absolute left-[356px] top-[13px] flex h-[29px] items-center gap-[3px] rounded-[17px] border border-[#D9D9D9] bg-white/60 px-[9px] text-[14.7px] font-normal text-black">
        <span className="text-[13px] leading-none">📍</span>
        {creator.location ?? ""}
      </div>

      {/* close */}
      <button type="button" onClick={() => navigate(-1)} className="absolute left-[458px] top-[9px] flex h-[24px] w-[24px] cursor-pointer items-center justify-center text-black/50">
        <X className="h-[15px] w-[15px]" strokeWidth={1.8} />
      </button>

      {/* stats */}
      <div className="absolute left-[13px] top-[81px] flex items-center gap-[6px]">
        <StatChip icon={Users} iconClass="text-black">{compactN(creator.followers)}</StatChip>
        <StatChip icon={Eye} iconClass="text-[#2CC37F]" filled>{compactN(creator.avgViews)} Avg. views</StatChip>
        <StatChip icon={Heart} iconClass="text-[#FF4D8D]">{creator.engagementRate}% ER</StatChip>
      </div>

      {/* open arrow */}
      <button type="button" onClick={() => navigate(`/creators/detail?id=${creator.id}`)} className="absolute left-[442px] top-[83px] flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full border border-[#D9D9D9] bg-white">
        <ArrowUpRight className="h-[16px] w-[16px] text-black" strokeWidth={1.8} />
      </button>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function PollResultPage() {
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState("");
  const { data: polls } = useList<Poll & { createdAt: string }>("polls");
  const { data: channelsData } = useChannels();
  const { data: usersData } = useUsers();
  const { data: campaignsData } = useCampaigns();
  const { data: creatorsData, isLoading: creatorsLoading } = useCreators();
  const { data: me } = useMe();

  const channels = channelsData ?? [];
  const users = usersData ?? [];
  const campaigns = campaignsData ?? [];
  const creators = creatorsData ?? [];

  const poll = (polls ?? [])[0];
  const pollOptions = poll?.options ?? [];
  const pollResults = poll?.results ?? [];
  const totalVotes = pollResults.reduce((sum, n) => sum + n, 0);
  const pollTime = poll?.createdAt
    ? new Date(poll.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    : "";

  /* sidebar rows: bound labels resolve positionally against the live lists */
  const seen: Record<Bind, number> = { channel: 0, user: 0, campaign: 0 };
  const rows = ROWS.map((r) => {
    if (!r.bind) return r;
    const i = seen[r.bind]++;
    const name =
      r.bind === "channel" ? channels[i]?.name : r.bind === "user" ? users[i]?.name : campaigns[i]?.name;
    return { ...r, label: name ?? "" };
  });
  const channelName = activeChannel || rows.find((r) => r.active)?.label || "";

  const firstName = (n?: string) => (n ?? "").split(" ")[0] ?? "";
  const initial = (n?: string) => (n ? n.charAt(0).toUpperCase() : "");
  const shownCreators = creators.slice(0, 3);
  return (
    <>
      {/* =========================== CHAT BACKGROUND ========================= */}
      {/* white panel card */}
      <div className="absolute left-[242px] top-[120px] h-[883px] w-[1118px] rounded-[12px] border border-[#D9D9D9] bg-white" />

      {/* dark channel sidebar */}
      <div className="absolute left-[242px] top-[120px] h-[883px] w-[255px] rounded-l-[12px] bg-[#1B1B1B]">
        {/* workspace switcher */}
        <span className="absolute left-[14px] top-[10px] text-[18px] font-bold leading-[24px] text-white">Yunto</span>
        <ChevronDown className="absolute left-[110px] top-[13px] h-[16px] w-[16px] text-white" strokeWidth={2} />
        {/* bottom user */}
        <span className="absolute left-[12px] top-[828px] h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <span className="absolute left-[55px] top-[832px] text-[12px] leading-[15px] text-white">{firstName(me?.name)}</span>
        <span className="absolute left-[55px] top-[848px] text-[8px] leading-[13px] text-white/70">
          {me?.email ? `@${me.email.split("@")[0]}` : ""}
        </span>
      </div>
      {rows.map((r) => (
        <ChannelRow
          key={`${r.y}`}
          row={r}
          badgeCount={users.length}
          active={r.kind === "hash" || r.kind === "dm" ? (activeChannel ? r.label === activeChannel : !!r.active) : !!r.active}
          onClick={
            r.kind === "add"
              ? () => navigate("/chat/create-channel")
              : r.kind === "hash" || r.kind === "dm"
                ? () => setActiveChannel(r.label)
                : undefined
          }
        />
      ))}

      {/* header: channel title */}
      <span className="absolute left-[511px] top-[134px] text-[16px] font-medium leading-[20px] text-[#1B1B1B]">{channelName ? `#${channelName}` : ""}</span>

      {/* header: chips */}
      <HeaderChip icon={RotateCw} left={1078} width={87}>Refresh</HeaderChip>
      <HeaderChip icon={Info} left={978} width={93}>Poll info</HeaderChip>
      <div className="absolute left-[816px] top-[188px] flex h-[32px] w-[224px] items-center gap-[4px] rounded-[16px] bg-white/95 px-[6px]">
        <BarChart3 className="h-[15px] w-[15px] rotate-90 text-[#5F5F5F]" strokeWidth={1.6} />
        <span className="text-[12px] font-light text-black/90">Campaign Poll created just now</span>
      </div>

      {/* header: member stack + count */}
      <div className="absolute left-[1176px] top-[128px] flex h-[32px] items-center rounded-[18px] border border-[#D9D9D9] bg-white px-[4px]">
        <span className="h-[25px] w-[25px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <span className="-ml-[8px] flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#FFF4AD] text-[15px] text-[#B49C01]">{initial(users[1]?.name)}</span>
        <span className="-ml-[8px] flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#BCD4FD] text-[15px] text-[#1155C8]">{initial(users[2]?.name)}</span>
        <span className="-ml-[8px] flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#EFBEFF] text-[15px] text-[#8701B4]">{initial(users[3]?.name)}</span>
        <span className="-ml-[8px] flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#E5E5E5] text-[8.3px] text-black">+{Math.max(users.length - 4, 0)}</span>
      </div>
      <span className="absolute left-[1274px] top-[137px] text-[11px] font-medium text-[#2E2E2E]">{users.length} Members</span>

      {/* poll message in chat */}
      <span className="absolute left-[511px] top-[235px] h-[32px] w-[32px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <span className="absolute left-[551px] top-[235px] text-[13px] font-extrabold leading-[16px] text-[#1B1B1B]">{firstName(me?.name)}</span>
      <span className="absolute left-[579px] top-[237px] text-[11px] font-medium text-[#2E2E2E]">{pollTime}</span>
      <span className="absolute left-[612px] top-[238px] flex h-[13px] items-center rounded-[3px] bg-[#DFDFDF] px-[4px] text-[9px] font-medium text-[#2E2E2E]">POLL</span>

      {/* poll body */}
      <div className="absolute left-[551px] top-[254px] h-[341px] w-[747px] rounded-[8px] bg-[#FFD44D]/[0.11]">
        <span className="absolute left-0 top-0 h-full w-[3px] rounded-[10px] bg-[#FFD44D]" />
        <p className="absolute left-[15px] top-[14px] w-[700px] whitespace-pre-line font-inter text-[13px] font-medium leading-[15.7px] text-[#131313]">
          {poll?.question ?? ""}
        </p>
        {/* option: yes */}
        <div className="absolute left-[15px] top-[169px] flex h-[42px] w-[682px] items-center gap-[15px] rounded-[12px] bg-white px-[15px]">
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full border-[2px] border-[#FFD44D]">
            <span className="h-[12px] w-[12px] rounded-full bg-[#FFD44D]" />
          </span>
          <span className="text-[18px] font-normal text-[#0D141C]/90">{pollOptions[0] ?? ""}</span>
        </div>
        {/* option: no */}
        <div className="absolute left-[15px] top-[221px] flex h-[42px] w-[682px] items-center gap-[15px] rounded-[12px] bg-white px-[15px]">
          <span className="h-[24px] w-[24px] rounded-full border-[2px] border-[#49454F]/60" />
          <span className="text-[18px] font-normal text-[#0D141C]/90">{pollOptions[1] ?? ""}</span>
        </div>
        {/* footer */}
        <span className="absolute left-[18px] top-[290px] text-[16px] font-normal text-[#1B1B1B]/80">{totalVotes} votes</span>
        <span className="absolute left-[475px] top-[292px] text-[16px] font-normal text-[#1B1B1B]/80">Show Results</span>
        <div className="absolute left-[598px] top-[279px] flex h-[42px] w-[99px] items-center justify-center rounded-[24px] bg-white/95">
          <span className="text-[20px] font-medium text-[#121212]">Vote</span>
        </div>
      </div>

      {/* message input bar */}
      <div className="absolute left-[515px] top-[952px] flex h-[38px] w-[783px] items-center rounded-[4px] border border-[#E5E5E5] bg-white px-[10px]">
        <span className="mr-[8px] h-[20px] w-[1px] bg-[#4C4C4C]" />
        <span className="text-[13px] font-medium text-[#2E2E2E]">{channelName ? `Message #${channelName}` : "Message"}</span>
        <div className="ml-auto flex items-center gap-[14px] text-[#4C4C4C]">
          <AtSign className="h-[14px] w-[14px]" strokeWidth={1.6} />
          <Smile className="h-[14px] w-[14px]" strokeWidth={1.6} />
          <Paperclip className="h-[14px] w-[14px]" strokeWidth={1.6} />
          <BarChart3 className="h-[14px] w-[14px] rotate-90 text-[#5F5F5F]" strokeWidth={1.6} />
        </div>
      </div>

      {/* =========================== POLL RESULTS MODAL ===================== */}
      <div className="absolute left-[433px] top-[123px] z-40 h-[778px] w-[574px] rounded-[24px] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
        {/* title */}
        <span className="absolute left-[20px] top-[34px] text-[24px] font-medium leading-none text-black">Poll Results</span>

        {/* close */}
        <button type="button" onClick={() => navigate(-1)} className="absolute left-[506px] top-[28px] flex h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-full border border-black bg-white">
          <X className="h-[18px] w-[18px] text-black" strokeWidth={1.8} />
        </button>

        {/* subtitle */}
        <span className="absolute left-[20px] top-[98px] text-[24px] font-normal leading-none text-black">Interested Creators</span>

        {/* results container */}
        <div className="absolute left-[20px] top-[140px] h-[540px] w-[534px] rounded-[12px] border border-[#D9D9D9]">
          {/* container header */}
          <span className="absolute left-[20px] top-[19px] text-[20px] font-normal text-[#0D141C]">{totalVotes} Votes</span>
          <button type="button" onClick={() => navigate("/polls/type")} className="absolute left-[327px] top-[22px] cursor-pointer text-[16px] font-normal text-[#176BF4] underline underline-offset-2">Create Poll</button>
          <div className="absolute left-[425px] top-[15px] flex h-[32px] w-[96px] items-center rounded-[18px] border border-[#D9D9D9] bg-white px-[3px]">
            <span className="h-[25px] w-[25px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
            <span className="-ml-[6px] h-[25px] w-[25px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
            <span className="-ml-[6px] h-[25px] w-[25px] rounded-full bg-gradient-to-br from-[#FFE08A] to-[#F0A0C0]" />
            <span className="-ml-[6px] h-[25px] w-[25px] rounded-full bg-gradient-to-br from-[#C8B3ED] to-[#BCD4FD]" />
            <span className="-ml-[6px] flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#E5E5E5] text-[8.3px] text-black">+{Math.max(creators.length - 4, 0)}</span>
          </div>
          {!creatorsLoading && creators.length === 0 && (
            <span className="absolute left-[20px] top-[60px] text-[16px] font-normal text-black/40">No interested creators yet</span>
          )}
        </div>

        {/* creator cards (absolute in modal-canvas coordinates) */}
      </div>

      {/* creator cards — placed on the canvas so their fixed coordinates map 1:1 */}
      <div className="pointer-events-none absolute inset-0 z-40">
        {shownCreators.map((c, i) => (
          <CreatorCard key={c.id} top={[345, 496, 648][i]} creator={c} />
        ))}

        {/* bottom actions */}
        <div onClick={() => navigate("/leads/create-paid")} className="pointer-events-auto absolute left-[521px] top-[825px] flex h-[48px] w-[226px] cursor-pointer items-center justify-center rounded-[24px] border border-[#EAEAEA] bg-white/95">
          <span className="text-[20px] font-normal text-black">Create a Lead</span>
        </div>
        <div onClick={() => navigate("/polls/connect-lead")} className="pointer-events-auto absolute left-[761px] top-[825px] flex h-[48px] w-[226px] cursor-pointer items-center justify-center rounded-[24px] bg-black/95">
          <span className="text-[20px] font-normal text-white">Connect to a lead</span>
        </div>
      </div>
    </>
  );
}
