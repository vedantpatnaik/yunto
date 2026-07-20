import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Camera,
  User,
  Mail,
  Phone,
  Tag,
  Megaphone,
  MessageCircle,
  LayoutGrid,
  UserPlus,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

/**
 * Agency app — Add Member (Figma frame 5279:21945, "ADD MEMBER", 375×946),
 * rendered inside the 390px MobileFrame. Self-contained: it carries its own
 * status bar and primary action. Outfit family via font-sans; ink color tokens.
 *
 * NOTE: The Figma REST + MCP APIs were hard rate-limited (HTTP 429, Starter-plan
 * cost budget) for the entire build window, so exact node geometry for this frame
 * could not be pulled. It is reconstructed from (a) the shared mobile chrome idiom
 * of the sibling Agency screens (Profile / Creators — status bar, round back
 * button, centered 18px title, white cards, ink primary button) and (b) the REAL
 * desktop "add members" form copy pulled from node 4870:65804: field set
 * (Full Name → "Enter name", Email Address → "Enter email address", Contact
 * Number → "Enter Contact number"), "Assign as" role selector (Sales / Operations
 * / Manager / Product), "Permission" toggle Switches, and the "Send Invite"
 * primary action. Re-run against node 5279:21945 to pin pixel-exact coordinates
 * once the Figma API budget resets.
 */

/* ------------------------------- primitives ------------------------------ */
function Field({
  top,
  icon: Icon,
  label,
  placeholder,
}: {
  top: number;
  icon: LucideIcon;
  label: string;
  placeholder: string;
}) {
  return (
    <div className="absolute left-[20px] w-[350px]" style={{ top }}>
      <span className="mb-[8px] block text-[13px] font-light leading-none text-ink/60">
        {label}
      </span>
      <div className="flex h-[52px] items-center gap-[10px] rounded-[14px] bg-white px-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <Icon className="h-[18px] w-[18px] text-ink/35" strokeWidth={1.7} />
        <span className="text-[14px] font-light text-ink/40">{placeholder}</span>
      </div>
    </div>
  );
}

function RoleChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={`flex h-[32px] shrink-0 items-center rounded-full px-[13px] text-[12px] leading-none ${
        active
          ? "bg-ink font-medium text-white"
          : "border border-line/70 bg-white font-normal text-ink/65"
      }`}
    >
      {label}
    </span>
  );
}

function Toggle({ on }: { on?: boolean }) {
  return (
    <span
      className={`relative h-[24px] w-[42px] shrink-0 rounded-full transition-colors ${
        on ? "bg-ink" : "bg-[#D9D9D9]"
      }`}
    >
      <span
        className={`absolute top-[2.5px] h-[19px] w-[19px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ${
          on ? "right-[2.5px]" : "left-[2.5px]"
        }`}
      />
    </span>
  );
}

function PermissionRow({
  icon: Icon,
  label,
  on,
}: {
  icon: LucideIcon;
  label: string;
  on?: boolean;
}) {
  return (
    <div className="flex h-[52px] items-center gap-[12px] px-[14px]">
      <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[11px] bg-[#F1EEF9]">
        <Icon className="h-[18px] w-[18px] text-ink/75" strokeWidth={1.7} />
      </span>
      <span className="flex-1 text-[14px] font-normal text-ink/85">{label}</span>
      <Toggle on={on} />
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AddMemberPage() {
  return (
    <div
      className="relative w-[390px] bg-[#F4F2F8] font-sans text-ink"
      style={{ height: 946 }}
    >
      {/* soft brand banner behind the header */}
      <div className="absolute inset-x-0 top-0 h-[240px] bg-gradient-to-b from-[#E7DFFA] to-[#F4F2F8]" />

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
        Add Member
      </h1>

      {/* avatar upload */}
      <div className="absolute left-1/2 top-[116px] -translate-x-1/2">
        <div className="h-[92px] w-[92px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED] ring-[4px] ring-white shadow-[0_6px_20px_rgba(90,60,160,0.20)]" />
        <span className="absolute bottom-[0px] right-[0px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-ink ring-[3px] ring-[#F4F2F8]">
          <Camera className="h-[14px] w-[14px] text-white" strokeWidth={1.7} />
        </span>
      </div>
      <span className="absolute inset-x-0 top-[220px] text-center text-[12px] font-light leading-none text-ink/50">
        Add team photo
      </span>

      {/* form fields */}
      <Field top={252} icon={User} label="Full Name" placeholder="Enter name" />
      <Field
        top={344}
        icon={Mail}
        label="Email Address"
        placeholder="Enter email address"
      />
      <Field
        top={436}
        icon={Phone}
        label="Contact Number"
        placeholder="Enter Contact number"
      />

      {/* assign as */}
      <span className="absolute left-[20px] top-[530px] text-[13px] font-light leading-none text-ink/60">
        Assign as
      </span>
      <div className="absolute left-[20px] top-[552px] flex w-[350px] items-center gap-[6px]">
        <RoleChip label="Sales" active />
        <RoleChip label="Operations" />
        <RoleChip label="Manager" />
        <RoleChip label="Product" />
      </div>

      {/* permissions */}
      <span className="absolute left-[20px] top-[608px] text-[13px] font-light leading-none text-ink/60">
        Permission
      </span>
      <div className="absolute left-[20px] top-[630px] w-[350px] divide-y divide-line/60 rounded-[20px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <PermissionRow icon={Tag} label="Leads" on />
        <PermissionRow icon={Megaphone} label="Campaigns" on />
        <PermissionRow icon={MessageCircle} label="Chat" />
        <PermissionRow icon={LayoutGrid} label="Dashboards" />
      </div>

      {/* send invite */}
      <button className="absolute left-[20px] top-[866px] flex h-[54px] w-[350px] items-center justify-center gap-[9px] rounded-[16px] bg-ink shadow-[0_8px_24px_rgba(20,10,50,0.28)]">
        <UserPlus className="h-[19px] w-[19px] text-white" strokeWidth={1.9} />
        <span className="text-[16px] font-normal leading-none text-white">
          Send Invite
        </span>
      </button>
    </div>
  );
}
