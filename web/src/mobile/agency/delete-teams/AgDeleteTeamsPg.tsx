import {
  ChevronLeft,
  Search,
  Trash2,
  Check,
  AlertTriangle,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

/**
 * Agency app — Delete Team (Figma frame 7751:7845, "delete teams", 375×875),
 * rendered inside the 390px MobileFrame. Self-contained: it carries its own
 * status bar. This is the team-management "remove members" flow that pairs with
 * the sibling Add-Member screen (node 5279:21945) — a roster of team members,
 * each selectable, with a destructive footer action and a confirmation sheet.
 *
 * REAL geometry pinned from the cached full-document tree for THIS node: the
 * frame is 375×875 at origin (-8323, 19380) under the "Agency ui" section. The
 * cached dump is depth-2, so this frame resolves with its own box but ZERO child
 * geometry.
 *
 * NOTE: For the entire build window the Figma REST geometry endpoints returned
 * HTTP 429 ("Rate limit exceeded", Starter-plan cost budget — /me still 200s so
 * the token is valid; only the cost-based /nodes and /images endpoints are
 * throttled) and the Figma MCP bridge returned the "Starter plan tool call
 * limit" paywall. Child layout is therefore reconstructed from the shared design
 * system (tailwind.config.ts tokens) and the verified sibling idioms:
 *   • AddMemberPage (node 5279:21945) — the team/settings chrome: lavender brand
 *     banner, white circular back button, centered 18px title, role vocabulary
 *     (Sales / Operations / Manager / Product), 20px side margins, ink primary.
 *   • AgencyCreatorsPage / AgAllRequestsPg — the list-row idiom: gradient avatar,
 *     name + secondary line, white cards on a 12px rhythm, search field.
 * Re-run against node 7751:7845 to pin pixel-exact coordinates once the Figma
 * API budget resets.
 */

/* --------------------------------- data ---------------------------------- */
type Role = "Sales" | "Operations" | "Manager" | "Product";

type Member = {
  name: string;
  email: string;
  role: Role;
  grad: string;
  selected?: boolean;
};

const MEMBERS: Member[] = [
  { name: "Ananya Rao", email: "ananya@yunto.co", role: "Manager", grad: "from-[#F1FFC3] to-[#C8B3ED]" },
  { name: "Karan Mehta", email: "karan@yunto.co", role: "Sales", grad: "from-[#C8DBFF] to-[#B7A6EC]", selected: true },
  { name: "Priya Nair", email: "priya@yunto.co", role: "Operations", grad: "from-[#FFD3E8] to-[#C8B3ED]" },
  { name: "Rahul Verma", email: "rahul@yunto.co", role: "Product", grad: "from-[#C8F5E4] to-[#9FB8F0]", selected: true },
  { name: "Sneha Kapoor", email: "sneha@yunto.co", role: "Sales", grad: "from-[#FFE3C0] to-[#D8B3ED]" },
  { name: "Arjun Das", email: "arjun@yunto.co", role: "Operations", grad: "from-[#D5E7FF] to-[#C8B3ED]" },
];

const SELECTED = MEMBERS.filter((m) => m.selected).length;

const ROLE_STYLE: Record<Role, string> = {
  Sales: "bg-[#E6F0FF] text-[#3B6FE0]",
  Operations: "bg-[#E4F6E9] text-[#2F9A5D]",
  Manager: "bg-[#EFEBF9] text-[#6B4FD8]",
  Product: "bg-[#FBEFD9] text-[#C07A17]",
};

/* ------------------------------- primitives ------------------------------ */
function Checkbox({ on }: { on?: boolean }) {
  return (
    <span
      className={`flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
        on ? "border-[#D14343] bg-[#D14343]" : "border-line bg-white"
      }`}
    >
      {on && <Check className="h-[14px] w-[14px] text-white" strokeWidth={2.6} />}
    </span>
  );
}

function MemberCard({ m }: { m: Member }) {
  return (
    <div
      className={`flex h-[74px] w-full items-center rounded-[16px] px-[12px] transition-colors ${
        m.selected
          ? "bg-[#FDF1F1] shadow-[0_4px_14px_rgba(209,67,67,0.08)] ring-[1.5px] ring-[#F3C9C9]"
          : "bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)]"
      }`}
    >
      <span className={`h-[46px] w-[46px] shrink-0 rounded-full border-[2px] border-white bg-gradient-to-br ${m.grad}`} />
      <div className="ml-[12px] flex min-w-0 flex-1 flex-col gap-[6px]">
        <div className="flex items-center gap-[7px]">
          <span className="truncate text-[14.5px] font-medium leading-none text-ink/90">{m.name}</span>
          <span
            className={`flex h-[19px] shrink-0 items-center rounded-full px-[8px] text-[10px] font-medium leading-none ${ROLE_STYLE[m.role]}`}
          >
            {m.role}
          </span>
        </div>
        <span className="truncate text-[11.5px] font-light leading-none text-ink/50">{m.email}</span>
      </div>
      <Checkbox on={m.selected} />
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgDeleteTeamsPg() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-[#F4F2F8] font-sans text-ink" style={{ height: 875 }}>
      {/* soft brand banner behind the header */}
      <div className="absolute inset-x-0 top-0 h-[188px] bg-gradient-to-b from-[#E7DFFA] to-[#F4F2F8]" />

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
        Delete Team
      </h1>
      <span className="absolute inset-x-0 top-[88px] text-center text-[11px] font-light leading-none text-ink/45">
        {MEMBERS.length} members
      </span>

      {/* warning banner */}
      <div className="absolute left-[20px] top-[120px] flex w-[350px] items-start gap-[10px] rounded-[14px] bg-[#FBE9E9] px-[13px] py-[11px]">
        <AlertTriangle className="mt-[1px] h-[16px] w-[16px] shrink-0 text-[#D14343]" strokeWidth={1.9} />
        <span className="text-[11.5px] font-light leading-[1.35] text-[#B23B3B]">
          Removing members revokes their access immediately. This action can’t be undone.
        </span>
      </div>

      {/* search */}
      <div className="absolute left-[20px] top-[184px] flex h-[46px] w-[350px] items-center gap-[10px] rounded-[14px] bg-white px-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <Search className="h-[18px] w-[18px] text-ink/40" strokeWidth={1.8} />
        <span className="text-[13px] font-light text-ink/40">Search members</span>
      </div>

      {/* select-all row */}
      <div className="absolute left-[20px] top-[244px] flex w-[350px] items-center justify-between">
        <span className="text-[12.5px] font-medium leading-none text-ink/70">Team members</span>
        <span className="text-[12px] font-normal leading-none text-[#D14343]">Select all</span>
      </div>

      {/* member list */}
      <div className="absolute left-[20px] top-[276px] flex w-[350px] flex-col gap-[10px]">
        {MEMBERS.map((m) => (
          <MemberCard key={m.email} m={m} />
        ))}
      </div>

      {/* destructive footer */}
      <div className="absolute inset-x-0 bottom-0 h-[92px] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <button
          className={`absolute left-[20px] top-[16px] flex h-[54px] w-[350px] items-center justify-center gap-[9px] rounded-[16px] transition-colors ${
            SELECTED > 0
              ? "bg-[#D14343] shadow-[0_8px_24px_rgba(209,67,67,0.30)]"
              : "bg-[#E7E4EC]"
          }`}
        >
          <Trash2
            className={`h-[18px] w-[18px] ${SELECTED > 0 ? "text-white" : "text-ink/35"}`}
            strokeWidth={1.9}
          />
          <span
            className={`text-[15px] font-medium leading-none ${SELECTED > 0 ? "text-white" : "text-ink/35"}`}
          >
            {SELECTED > 0 ? `Remove ${SELECTED} members` : "Remove members"}
          </span>
        </button>
      </div>
    </div>
  );
}
