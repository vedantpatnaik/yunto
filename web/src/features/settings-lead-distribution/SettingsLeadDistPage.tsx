import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Loader, AlignJustify, Waypoints } from "lucide-react";
import { useUsers } from "@/api/hooks";

/**
 * Super Admin — Settings / Lead Distribution.
 * Exact reconstruction of Figma frame 5717:57784 ("Super Admin-settings"),
 * 1440×1024. Built CLEAN (profile popup + dim scrim omitted).
 */

type Tab = { icon: LucideIcon; label: string; left: number; width: number; to: string; active?: boolean };

const TABS: Tab[] = [
  { icon: Loader, label: "Team Management", left: 241, width: 180, to: "/settings" },
  { icon: AlignJustify, label: "Lead Distribution", left: 429, width: 165, to: "/settings/lead-distribution", active: true },
  { icon: Waypoints, label: "Integration", left: 602, width: 139, to: "/settings/integration" },
  { icon: Waypoints, label: "Collabs", left: 749, width: 114, to: "/settings/collab" },
];

type Option = { title: string; desc: string; top: number; selected?: boolean };

const OPTIONS: Option[] = [
  { title: "Random", desc: "Distributes leads to any available person randomly.", top: 361 },
  { title: "All (Broadcast)", desc: "Send leads to all team members. First to respond gets it.", top: 476 },
  { title: "Round by Round", desc: "Distributes leads one-by-one in a loop among team members.", top: 591, selected: true },
];

/* vertical positions for the assignment-order rows (design shows 3) */
const ORDER_TOPS = [749, 802, 855];

/* stepped card outline: rounded rect with a notch cut for the tab row (top-left) */
const CARD_PATH =
  "M 0 84 A 24 24 0 0 1 24 60 L 617 60 A 20 20 0 0 0 637 40 L 637 20 A 20 20 0 0 1 657 0 L 731 0 A 24 24 0 0 1 755 24 L 755 682 A 24 24 0 0 1 731 706 L 24 706 A 24 24 0 0 1 0 682 Z";

/* ------------------------------ primitives ----------------------------- */
function DragHandle() {
  return (
    <span className="flex h-[24px] w-[24px] flex-col items-center justify-center gap-[4px]">
      <span className="h-[1.6px] w-[16px] rounded-full bg-ink/60" />
      <span className="h-[1.6px] w-[16px] rounded-full bg-ink/60" />
    </span>
  );
}

function Radio({ selected }: { selected?: boolean }) {
  if (selected) {
    return (
      <span className="flex h-[24px] w-[24px] items-center justify-center">
        <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 border-[#1D1B20]">
          <span className="h-[10px] w-[10px] rounded-full bg-[#1D1B20]" />
        </span>
      </span>
    );
  }
  return (
    <span className="flex h-[24px] w-[24px] items-center justify-center">
      <span className="h-[20px] w-[20px] rounded-full border-2 border-[#49454F]" />
    </span>
  );
}

/* -------------------------------- page --------------------------------- */
export default function SettingsLeadDistPage() {
  const navigate = useNavigate();
  const { data: users } = useUsers();
  const order = (users ?? []).slice(0, ORDER_TOPS.length);
  const [selectedOption, setSelectedOption] = useState(
    () => OPTIONS.find((o) => o.selected)?.title ?? OPTIONS[0].title,
  );
  return (
    <>
      {/* SETTINGS — 261,158 · Outfit 400 40px */}
      <h1 className="absolute left-[261px] top-[158px] text-[40px] font-normal leading-[50.4px] text-ink">
        SETTINGS
      </h1>

      {/* stepped content-card outline */}
      <svg
        className="absolute left-[241px] top-[222px]"
        width={755}
        height={706}
        viewBox="0 0 755 706"
        fill="none"
      >
        <path d={CARD_PATH} stroke="#D4D4D4" strokeWidth={1} />
      </svg>

      {/* tabs */}
      {TABS.map((t) => (
        <div
          key={t.label}
          onClick={() => navigate(t.to)}
          style={{ left: t.left, width: t.width }}
          className={`absolute top-[225px] flex h-[48px] cursor-pointer items-center gap-[8px] rounded-[24px] px-[12px] ${
            t.active ? "bg-black" : "bg-white"
          }`}
        >
          <t.icon
            className={`h-[20px] w-[20px] shrink-0 ${t.active ? "text-white" : "text-black"}`}
            strokeWidth={1.6}
          />
          <span
            className={`whitespace-nowrap text-[14px] font-light leading-[24px] ${
              t.active ? "text-white" : "text-black"
            }`}
          >
            {t.label}
          </span>
        </div>
      ))}

      {/* intro line */}
      <p className="absolute left-[258px] top-[312px] whitespace-nowrap text-[20px] font-normal leading-[24px] text-ink/70">
        Choose how you’d like leads to be distributed among your team members.
      </p>

      {/* distribution options */}
      {OPTIONS.map((o) => {
        const selected = selectedOption === o.title;
        return (
        <div
          key={o.title}
          onClick={() => setSelectedOption(o.title)}
          style={{ top: o.top }}
          className={`absolute left-[258px] h-[98px] w-[647px] cursor-pointer rounded-[24px] border ${
            selected ? "border-black" : "border-[#D4D4D4]"
          }`}
        >
          <span className="absolute left-[20px] top-[24px]">
            <Radio selected={selected} />
          </span>
          <span className="absolute left-[54px] top-[24px] whitespace-nowrap text-[20px] font-medium leading-[24px] text-ink">
            {o.title}
          </span>
          <span className="absolute left-[54px] top-[50px] whitespace-nowrap text-[12px] font-normal leading-[24px] text-ink/70">
            {o.desc}
          </span>
        </div>
        );
      })}

      {/* assignment order */}
      <h2 className="absolute left-[258px] top-[713px] text-[20px] font-normal leading-[24px] text-ink">
        Assignment Order
      </h2>
      {order.map((u, i) => (
        <div
          key={u.id}
          style={{ top: ORDER_TOPS[i] }}
          className="absolute left-[258px] flex h-[45px] w-[647px] items-center rounded-[8px] border border-[#E5E7EB] bg-white"
        >
          <span className="pl-[11px] font-inter text-[13px] font-medium leading-[24px] text-ink/70">
            {u.name}
          </span>
          <span className="absolute right-[23px]">
            <DragHandle />
          </span>
        </div>
      ))}
    </>
  );
}
