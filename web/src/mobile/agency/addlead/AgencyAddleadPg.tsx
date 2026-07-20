import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Signal,
  Wifi,
  BatteryFull,
  Building2,
  Mail,
  User,
  Phone,
  IndianRupee,
  Instagram,
  Youtube,
  Plus,
} from "lucide-react";

/**
 * Agency app — Add Lead (Figma frame 7695:8012, "addlead", 375×876), rendered
 * inside the 390px MobileFrame. Self-contained: it carries its own status bar
 * and a bottom primary action (this is the mobile "Create a Lead" entry form
 * that hangs off the Leads list's + button, not a tab screen). Frame origin
 * confirmed from the cached document tree at (-9298, 8301), size 375×876, with
 * the frame's own solid background fill #F8F5EF (the warm off-white shared with
 * the sibling Add-Reminders screen).
 *
 * NOTE: The Figma REST + MCP geometry endpoints were hard rate-limited for the
 * entire build window — the `/nodes` and `/images` REST endpoints return HTTP
 * 429 with `retry-after: ~391489` (~4.5 days) on the Starter plan (the `/me`
 * endpoint still returns 200, so the token is valid; only the cost-based
 * geometry endpoints are throttled), and the Figma MCP tools return the
 * Starter-plan "tool call limit" paywall. The cached full-document dump is
 * depth-limited, so this frame resolves to a childless leaf and no per-node
 * render could be pulled. The layout is therefore reconstructed from (a) the
 * confirmed frame facts above, (b) the shared mobile-chrome idiom of the sibling
 * Agency screens that share this exact #F8F5EF shell (Add Reminders / Add
 * Member — status bar, 40px round back button, centered 18px title, white
 * cards, ink primary button, 20px side margins) and (c) the REAL desktop
 * "Create a Lead" form copy pulled from Figma nodes 4868:25026 / 4868:26082
 * (src/features/create-lead-paid/CreateLeadPaidPage.tsx): campaign type
 * (Paid / Barter / Mix), platform (Instagram / Youtube), Brand Name, Email
 * Address, Contact person, Phone number, Campaign budget, Target Niche
 * (Fashion / Beauty), and the Priority selector (Low #0078FD / Medium #F2964E /
 * High #E84D3A). Re-run against node 7695:8012 to pin pixel-exact coordinates
 * once the Figma API budget resets.
 */

/* ------------------------------- primitives ------------------------------ */
function Field({
  left,
  top,
  width = 350,
  icon: Icon,
  label,
  placeholder,
}: {
  left: number;
  top: number;
  width?: number;
  icon: LucideIcon;
  label: string;
  placeholder: string;
}) {
  return (
    <div className="absolute" style={{ left, top, width }}>
      <span className="mb-[9px] ml-[4px] block text-[13px] font-light leading-none text-ink/60">
        {label}
      </span>
      <div className="flex h-[54px] items-center gap-[10px] rounded-[14px] bg-white px-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <Icon className="h-[18px] w-[18px] shrink-0 text-ink/35" strokeWidth={1.7} />
        <span className="truncate text-[14px] font-light text-ink/40">
          {placeholder}
        </span>
      </div>
    </div>
  );
}

function Pill({ active, children }: { active?: boolean; children: ReactNode }) {
  return (
    <span
      className={`flex h-[40px] shrink-0 items-center justify-center gap-[6px] rounded-full px-[18px] text-[13.5px] leading-none ${
        active
          ? "bg-ink font-medium text-white"
          : "border border-line/70 bg-white font-normal text-ink/70"
      }`}
    >
      {children}
    </span>
  );
}

function AddChip() {
  return (
    <span className="flex h-[40px] shrink-0 items-center justify-center gap-[5px] rounded-full border border-line/70 bg-white px-[16px] text-[13.5px] font-normal leading-none text-ink/55">
      <Plus className="h-[15px] w-[15px] text-ink/55" strokeWidth={1.8} />
      Add
    </span>
  );
}

function PriorityPill({
  label,
  color,
  active,
}: {
  label: string;
  color: string;
  active?: boolean;
}) {
  return (
    <span
      className="flex h-[40px] flex-1 items-center justify-center rounded-full border text-[13.5px] leading-none"
      style={{
        borderColor: color,
        color,
        backgroundColor: active ? `${color}1A` : "#FFFFFF",
        fontWeight: active ? 500 : 400,
      }}
    >
      {label}
    </span>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgencyAddleadPg() {
  return (
    <div
      className="relative w-[390px] overflow-hidden bg-[#F8F5EF] font-sans text-ink"
      style={{ height: 876 }}
    >
      {/* soft lavender wash behind the header */}
      <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-[#EFE9FB] to-[#F8F5EF]" />

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
        Add Lead
      </h1>

      {/* campaign type */}
      <span className="absolute left-[24px] top-[118px] text-[13px] font-light leading-none text-ink/60">
        Campaign Type
      </span>
      <div className="absolute left-[20px] top-[140px] flex items-center gap-[8px]">
        <Pill active>Paid</Pill>
        <Pill>Barter</Pill>
        <Pill>Mix</Pill>
      </div>

      {/* platform */}
      <span className="absolute left-[24px] top-[198px] text-[13px] font-light leading-none text-ink/60">
        Platform to run on
      </span>
      <div className="absolute left-[20px] top-[220px] flex items-center gap-[8px]">
        <Pill active>
          <Instagram className="h-[15px] w-[15px] text-white" strokeWidth={1.8} />
          Instagram
        </Pill>
        <Pill>
          <Youtube className="h-[16px] w-[16px] text-ink/70" strokeWidth={1.8} />
          Youtube
        </Pill>
        <AddChip />
      </div>

      {/* brand name */}
      <Field
        left={20}
        top={278}
        icon={Building2}
        label="Brand Name"
        placeholder="Enter brand name"
      />

      {/* email address */}
      <Field
        left={20}
        top={364}
        icon={Mail}
        label="Email Address"
        placeholder="yourbrand@gmail.com"
      />

      {/* contact person + phone number */}
      <Field
        left={20}
        top={450}
        width={169}
        icon={User}
        label="Contact Person"
        placeholder="Enter name"
      />
      <Field
        left={201}
        top={450}
        width={169}
        icon={Phone}
        label="Phone Number"
        placeholder="Phone number"
      />

      {/* campaign budget */}
      <Field
        left={20}
        top={536}
        icon={IndianRupee}
        label="Campaign Budget"
        placeholder="e.g. 5000"
      />

      {/* target niche */}
      <span className="absolute left-[24px] top-[622px] text-[13px] font-light leading-none text-ink/60">
        Target Niche
      </span>
      <div className="absolute left-[20px] top-[644px] flex items-center gap-[8px]">
        <Pill active>Fashion</Pill>
        <Pill>Beauty</Pill>
        <AddChip />
      </div>

      {/* priority */}
      <span className="absolute left-[24px] top-[696px] text-[13px] font-light leading-none text-ink/60">
        Priority
      </span>
      <div className="absolute left-[20px] top-[718px] flex w-[350px] items-center gap-[10px]">
        <PriorityPill label="Low" color="#0078FD" />
        <PriorityPill label="Medium" color="#F2964E" active />
        <PriorityPill label="High" color="#E84D3A" />
      </div>

      {/* add lead */}
      <button className="absolute left-[20px] top-[800px] flex h-[54px] w-[350px] items-center justify-center gap-[9px] rounded-[16px] bg-ink shadow-[0_8px_24px_rgba(20,10,50,0.28)]">
        <Plus className="h-[18px] w-[18px] text-white" strokeWidth={1.9} />
        <span className="text-[16px] font-normal leading-none text-white">
          Add Lead
        </span>
      </button>
    </div>
  );
}
