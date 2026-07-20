import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Film,
  Clock,
  Star,
  Flame,
  Signal,
  Wifi,
  BatteryFull,
  LayoutGrid,
  Users,
  Megaphone,
  MessageCircle,
  UserRound,
} from "lucide-react";

/**
 * Agency app — Editors roster (Figma frame 7778:18001, "editor", 375×876 in
 * Figma, normalised to the 390px MobileFrame). The plural-list sibling of
 * "Videographers" (7778:17881) and detailed by "editors details" (7778:18262);
 * it lists the agency's internal video editors the way the verified Creators
 * screen lists talent.
 *
 * NOTE: For the whole build window the Figma REST API returned HTTP 429 with
 * `retry-after: 390295` (~4.5 days) and the Figma MCP server was over its
 * Starter-plan tool-call budget, so exact node geometry for THIS frame could not
 * be pulled. It is reconstructed pixel-faithfully from the REAL, verified sibling
 * that shares this exact design system and card idiom — the Creators list
 * (node 7786:21624) — whose 2× render was measured directly:
 *   • chrome: 390-wide frame, #F4F2F8 field under an #E7DFFA→#F4F2F8 banner,
 *     status bar, white 40px back button @(18,60), black 40px + button @(332,60),
 *     centred title, search bar @(20,116,280×46) + filter square @(324,116,46×46),
 *     pill row @y178, and the 5-tab bottom nav (Home / Creators / Campaigns /
 *     Chat / Profile) with the talent tab active.
 *   • card: 350×80 white rounded-[20px] rows, 46px gradient avatar (gold ring +
 *     flame badge) @(12,17), name+specialty @(72,18), stat row @(72,44), and a
 *     32px light-grey open-arrow @(right 14, centre).
 * Re-run against node 7778:18001 to pin any pixel deltas once the API budget resets.
 */

/* --------------------------------- data ---------------------------------- */
type Editor = {
  name: string;
  specialty: string;
  edits: string;
  tat: string;
  rating: string;
  grad: string;
  top?: boolean;
};

const EDITORS: Editor[] = [
  { name: "Aditya Rao", specialty: "Reels & Shorts", edits: "128", tat: "24h", rating: "4.9", grad: "from-[#F3F0C9] to-[#C9B8EE]", top: true },
  { name: "Meera Iyer", specialty: "Long-form", edits: "96", tat: "36h", rating: "4.7", grad: "from-[#C9D6FF] to-[#B9A7EC]", top: true },
  { name: "Karan Malhotra", specialty: "Color & VFX", edits: "74", tat: "48h", rating: "4.5", grad: "from-[#F6D2E6] to-[#C9B3ED]" },
  { name: "Sana Sheikh", specialty: "Reels Editor", edits: "112", tat: "20h", rating: "4.8", grad: "from-[#C7E3F5] to-[#BBA7EC]", top: true },
  { name: "Rohan Das", specialty: "Motion GFX", edits: "63", tat: "30h", rating: "4.4", grad: "from-[#F7DFC7] to-[#C9B3ED]" },
  { name: "Nisha Verma", specialty: "Podcast & YT", edits: "88", tat: "40h", rating: "4.6", grad: "from-[#D7C9F0] to-[#EFE6FB]" },
];

/* ------------------------------- primitives ------------------------------ */
function Stat({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="flex items-center gap-[4px] text-[11.5px] font-light leading-none text-ink/55">
      <Icon className="h-[13px] w-[13px] text-ink/45" strokeWidth={1.7} />
      {children}
    </span>
  );
}

function Pill({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={`flex h-[30px] shrink-0 items-center rounded-full px-[11px] text-[12.5px] leading-none ${
        active ? "bg-ink font-medium text-white" : "bg-white font-normal text-ink/60"
      }`}
    >
      {children}
    </span>
  );
}

function EditorCard({ e }: { e: Editor }) {
  return (
    <div className="relative h-[80px] w-[350px] rounded-[20px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
      {/* avatar with gold ring + flame badge */}
      <div className="absolute left-[12px] top-[17px] h-[46px] w-[46px] rounded-full bg-gradient-to-b from-[#F6E7A6] to-[#EBD98F] p-[1.5px]">
        <div className={`h-full w-full rounded-full bg-gradient-to-br ${e.grad}`} />
        {e.top && (
          <span className="absolute -bottom-[2px] -right-[2px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
            <Flame className="h-[9px] w-[9px] text-[#FF7A1A]" fill="#FF7A1A" strokeWidth={1} />
          </span>
        )}
      </div>

      {/* name + specialty */}
      <div className="absolute left-[72px] top-[19px] flex items-baseline gap-[6px]">
        <span className="text-[15px] font-medium leading-none text-ink/90">{e.name}</span>
        <span className="text-[11px] font-light leading-none text-ink/45">{e.specialty}</span>
      </div>

      {/* stat row */}
      <div className="absolute left-[72px] top-[44px] flex items-center gap-[14px]">
        <Stat icon={Film}>{e.edits} edits</Stat>
        <Stat icon={Clock}>{e.tat}</Stat>
        <Stat icon={Star}>{e.rating}</Stat>
      </div>

      {/* open arrow */}
      <span className="absolute right-[14px] top-[24px] flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F2F1F3]">
        <ArrowUpRight className="h-[16px] w-[16px] text-ink/80" strokeWidth={1.9} />
      </span>
    </div>
  );
}

function NavItem({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-[5px]">
      <Icon className={`h-[22px] w-[22px] ${active ? "text-ink" : "text-ink/40"}`} strokeWidth={active ? 2 : 1.7} />
      <span className={`text-[10px] leading-none ${active ? "font-medium text-ink" : "font-light text-ink/45"}`}>
        {label}
      </span>
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgEditorPg() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-[#F4F2F8] font-sans text-ink" style={{ height: 876 }}>
      {/* soft brand banner behind the header */}
      <div className="absolute inset-x-0 top-0 h-[210px] bg-gradient-to-b from-[#E7DFFA] to-[#F4F2F8]" />

      {/* status bar */}
      <span className="absolute left-[26px] top-[17px] text-[15px] font-medium leading-none text-ink">9:41</span>
      <div className="absolute right-[22px] top-[18px] flex items-center gap-[6px]">
        <Signal className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
        <Wifi className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
        <BatteryFull className="h-[18px] w-[18px] text-ink" strokeWidth={1.6} />
      </div>

      {/* header */}
      <button className="absolute left-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>
      <h1 className="absolute inset-x-0 top-[70px] text-center text-[18px] font-medium leading-none text-ink">Editors</h1>
      <button className="absolute right-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-ink shadow-[0_4px_12px_rgba(90,60,160,0.28)]">
        <Plus className="h-[20px] w-[20px] text-white" strokeWidth={2} />
      </button>

      {/* search + filter */}
      <div className="absolute left-[20px] top-[116px] flex h-[46px] w-[280px] items-center gap-[10px] rounded-[14px] bg-white px-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <Search className="h-[18px] w-[18px] text-ink/40" strokeWidth={1.8} />
        <span className="text-[13px] font-light text-ink/40">Search editors</span>
      </div>
      <button className="absolute right-[20px] top-[116px] flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <SlidersHorizontal className="h-[19px] w-[19px] text-ink/70" strokeWidth={1.8} />
      </button>

      {/* filter pills */}
      <div className="absolute left-[20px] top-[178px] flex items-center gap-[8px]">
        <Pill active>All</Pill>
        <Pill>Available</Pill>
        <Pill>Reels</Pill>
        <Pill>Shorts</Pill>
        <Pill>Top</Pill>
      </div>

      {/* editor cards */}
      <div className="absolute left-[20px] top-[224px] flex w-[350px] flex-col gap-[12px]">
        {EDITORS.map((e) => (
          <EditorCard key={e.name} e={e} />
        ))}
      </div>

      {/* bottom nav */}
      <div className="absolute inset-x-0 bottom-0 flex h-[86px] items-start bg-white px-[14px] pt-[16px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavItem icon={LayoutGrid} label="Home" />
        <NavItem icon={Users} label="Creators" active />
        <NavItem icon={Megaphone} label="Campaigns" />
        <NavItem icon={MessageCircle} label="Chat" />
        <NavItem icon={UserRound} label="Profile" />
      </div>
    </div>
  );
}
