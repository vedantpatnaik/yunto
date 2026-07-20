import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  SquarePen,
  Search,
  Users,
  Signal,
  Wifi,
  BatteryFull,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  UserRound,
} from "lucide-react";

/**
 * Agency app — Chat (Figma frame 7696:11549, "chat", 390×876), rendered inside
 * the 390px MobileFrame. Self-contained: it carries its own status bar and
 * bottom nav, matching the sibling Profile / Creators screens. Outfit family via
 * font-sans; ink color tokens.
 *
 * NOTE: The Figma REST + MCP endpoints were hard rate-limited for the entire
 * build window, so exact node geometry for this frame could not be pulled:
 *   • REST /v1/files/.../nodes?ids=7696:11549 → HTTP 429,
 *     retry-after ≈ 394419s (~4.6 days), x-figma-rate-limit-type: low
 *     (Starter-plan cost budget exhausted; /v1/me still 200s — token valid,
 *     only the metered node/image endpoints fail).
 *   • REST /v1/images (frame render) → HTTP 429, same shared budget.
 *   • Figma MCP (get_metadata / get_screenshot) → "reached the Figma MCP tool
 *     call limit on the Starter plan".
 *   • Cached depth-2 file dump → this frame appears only as a childless leaf.
 * Per the sibling 876px screens (AgencyProfilePage 7721:4248, AgencyCreatorsPage
 * 7786:21624), it is reconstructed from the shared design system rather than
 * eyeballed pixels. Re-run against node 7696:11549 to pin pixel-exact
 * coordinates once the Figma REST budget resets.
 */

/* --------------------------------- data ---------------------------------- */
type Conversation = {
  name: string;
  preview: string;
  time: string;
  grad: string;
  unread?: number;
  online?: boolean;
  group?: boolean;
};

const CONVERSATIONS: Conversation[] = [
  {
    name: "Priya Sharma",
    preview: "Sounds good! Let's finalize the deliverables.",
    time: "9:24",
    grad: "from-[#FFD3E8] to-[#C8B3ED]",
    unread: 2,
    online: true,
  },
  {
    name: "Zostel Trip",
    preview: "Leena: I've shared the reference doc.",
    time: "8:47",
    grad: "from-[#F1FFC3] to-[#C8B3ED]",
    unread: 5,
    group: true,
  },
  {
    name: "Rahul Aggrawal",
    preview: "Can we hop on a quick call today?",
    time: "8:15",
    grad: "from-[#C8E6FF] to-[#C8B3ED]",
    online: true,
  },
  {
    name: "Bobbi Brown",
    preview: "The campaign budget is approved.",
    time: "Yesterday",
    grad: "from-[#C8DBFF] to-[#B7A6EC]",
  },
  {
    name: "Leena Sharma",
    preview: "Thanks for the update!",
    time: "Yesterday",
    grad: "from-[#C8F5E4] to-[#9FB8F0]",
  },
  {
    name: "Stellar Talents",
    preview: "Aditya: New creators added to the roster.",
    time: "Mon",
    grad: "from-[#FFE3C0] to-[#D8B3ED]",
    group: true,
  },
  {
    name: "Diya Sharma",
    preview: "Perfect, see you then.",
    time: "Sun",
    grad: "from-[#D5E7FF] to-[#C8B3ED]",
  },
];

/* ------------------------------- primitives ------------------------------ */
function Chip({ label, active }: { label: string; active?: boolean }) {
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

function ConvRow({ c }: { c: Conversation }) {
  return (
    <div className="flex h-[74px] items-center gap-[12px] px-[14px]">
      {/* avatar */}
      <div className="relative shrink-0">
        {c.group ? (
          <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#EDE7FB]">
            <Users className="h-[22px] w-[22px] text-ink/55" strokeWidth={1.7} />
          </div>
        ) : (
          <div className={`h-[46px] w-[46px] rounded-full bg-gradient-to-br ${c.grad}`} />
        )}
        {c.online && (
          <span className="absolute -bottom-[1px] -right-[1px] h-[13px] w-[13px] rounded-full bg-[#34C759] ring-[2.5px] ring-white" />
        )}
      </div>

      {/* name + preview */}
      <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <span className="truncate text-[14.5px] font-medium leading-none text-ink/90">
          {c.name}
        </span>
        <span
          className={`truncate text-[12px] leading-none ${
            c.unread ? "font-normal text-ink/70" : "font-light text-ink/45"
          }`}
        >
          {c.preview}
        </span>
      </div>

      {/* time + unread badge */}
      <div className="flex shrink-0 flex-col items-end gap-[8px]">
        <span
          className={`text-[11px] leading-none ${
            c.unread ? "font-normal text-ink/70" : "font-light text-ink/40"
          }`}
        >
          {c.time}
        </span>
        {c.unread ? (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#181819] px-[5px] text-[10px] font-medium leading-none text-white">
            {c.unread}
          </span>
        ) : (
          <span className="h-[18px]" />
        )}
      </div>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-[3px]">
      <Icon
        className={`h-[22px] w-[22px] ${active ? "text-ink" : "text-ink/40"}`}
        strokeWidth={active ? 2 : 1.7}
      />
      <span
        className={`text-[10px] leading-none ${
          active ? "font-medium text-ink" : "font-light text-ink/45"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgencyChatPage() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-[#F8F5EF] font-sans text-ink" style={{ height: 876 }}>
      {/* soft brand banner behind the header */}
      <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-[#E7DFFA] to-[#F8F5EF]" />

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

      {/* header bar */}
      <button className="absolute left-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>
      <h1 className="absolute inset-x-0 top-[70px] text-center text-[18px] font-medium leading-none text-ink">
        Chat
      </h1>
      <button className="absolute right-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-ink shadow-[0_4px_12px_rgba(90,60,160,0.28)]">
        <SquarePen className="h-[18px] w-[18px] text-white" strokeWidth={1.8} />
      </button>

      {/* search */}
      <div className="absolute left-[20px] top-[116px] flex h-[46px] w-[350px] items-center gap-[10px] rounded-[14px] bg-white px-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <Search className="h-[18px] w-[18px] text-ink/40" strokeWidth={1.8} />
        <span className="text-[13px] font-light text-ink/40">Search messages</span>
      </div>

      {/* filter chips */}
      <div className="absolute left-[20px] top-[178px] flex w-[350px] items-center gap-[8px] overflow-hidden">
        <Chip label="All" active />
        <Chip label="Unread" />
        <Chip label="Groups" />
        <Chip label="Archived" />
      </div>

      {/* conversation list */}
      <div className="absolute left-[20px] top-[224px] w-[350px] divide-y divide-line/50 overflow-hidden rounded-[20px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        {CONVERSATIONS.map((c) => (
          <ConvRow key={c.name} c={c} />
        ))}
      </div>

      {/* bottom nav */}
      <div className="absolute inset-x-0 bottom-0 flex h-[74px] items-center bg-white px-[14px] pb-[6px] shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        <NavItem icon={LayoutGrid} label="Home" />
        <NavItem icon={Users} label="Sales" />
        <NavItem icon={Megaphone} label="Campaigns" />
        <NavItem icon={MessageCircle} label="Chat" active />
        <NavItem icon={UserRound} label="Profile" />
      </div>
    </div>
  );
}
