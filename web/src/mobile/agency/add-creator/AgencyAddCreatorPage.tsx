import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Camera,
  User,
  AtSign,
  Instagram,
  Youtube,
  Users,
  Eye,
  Tag,
  MapPin,
  Phone,
  UserPlus,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

/**
 * Agency app — Add Creator (Figma frame 827:4782, "add creator", 375×955),
 * rendered inside the 390px MobileFrame. Self-contained: it carries its own
 * status bar; being a form sub-page reached from the Creators "+" button it has
 * no bottom nav — the extra height (955 vs the 876 list screens) is taken up by
 * the field stack and the pinned primary action.
 *
 * NOTE: The Figma REST API was hard rate-limited for this build window
 * (HTTP 429, Retry-After ≈ 394,415s ≈ 4.6 days, Starter cost budget) and the
 * Figma MCP tool-call quota was exhausted, so exact node geometry for 827:4782
 * could not be pulled. This screen is reconstructed from the shared mobile
 * design system and the sibling AgencyProfilePage / AgencyCreatorsPage idiom
 * (same #F4F2F8 canvas, brand banner, status bar, white rounded cards, ink
 * tokens, Outfit via font-sans). Re-run against node 827:4782 to pin
 * pixel-exact coordinates once the Figma API budget resets.
 */

/* ------------------------------- primitives ------------------------------ */
function Field({
  label,
  icon: Icon,
  placeholder,
  className = "",
}: {
  label: string;
  icon: LucideIcon;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-[8px] ${className}`}>
      <span className="pl-[2px] text-[13px] font-light leading-none text-ink/60">
        {label}
      </span>
      <div className="flex h-[52px] items-center gap-[10px] rounded-[14px] bg-white px-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <Icon className="h-[18px] w-[18px] shrink-0 text-ink/35" strokeWidth={1.7} />
        <span className="truncate text-[14px] font-light text-ink/40">
          {placeholder}
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgencyAddCreatorPage() {
  return (
    <div
      className="relative w-[390px] overflow-hidden bg-[#F4F2F8] font-sans text-ink"
      style={{ height: 955 }}
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
        Add Creator
      </h1>

      {/* photo upload */}
      <div className="absolute left-1/2 top-[116px] -translate-x-1/2">
        <div className="h-[92px] w-[92px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED] ring-[4px] ring-white shadow-[0_6px_20px_rgba(90,60,160,0.20)]" />
        <span className="absolute bottom-[0px] right-[0px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-ink ring-[3px] ring-[#F4F2F8]">
          <Camera className="h-[14px] w-[14px] text-white" strokeWidth={1.7} />
        </span>
      </div>
      <p className="absolute inset-x-0 top-[220px] text-center text-[12px] font-light leading-none text-ink/50">
        Add creator photo
      </p>

      {/* form */}
      <div className="absolute left-[20px] top-[250px] flex w-[350px] flex-col gap-[14px]">
        <Field label="Full Name" icon={User} placeholder="Enter full name" />
        <Field label="Username" icon={AtSign} placeholder="@username" />

        {/* platform segmented control */}
        <div className="flex flex-col gap-[8px]">
          <span className="pl-[2px] text-[13px] font-light leading-none text-ink/60">
            Platform
          </span>
          <div className="flex h-[46px] items-center gap-[6px] rounded-[14px] bg-white p-[5px] shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <button className="flex h-full flex-1 items-center justify-center gap-[7px] rounded-[10px] bg-ink text-[13px] font-medium text-white">
              <Instagram className="h-[16px] w-[16px]" strokeWidth={1.8} />
              Instagram
            </button>
            <button className="flex h-full flex-1 items-center justify-center gap-[7px] rounded-[10px] text-[13px] font-normal text-ink/55">
              <Youtube className="h-[16px] w-[16px]" strokeWidth={1.8} />
              YouTube
            </button>
          </div>
        </div>

        {/* followers + avg views */}
        <div className="flex gap-[12px]">
          <Field className="flex-1" label="Followers" icon={Users} placeholder="e.g. 1.2M" />
          <Field className="flex-1" label="Avg Views" icon={Eye} placeholder="e.g. 900k" />
        </div>

        <Field label="Niche" icon={Tag} placeholder="e.g. Fashion, Beauty" />
        <Field label="Location" icon={MapPin} placeholder="City, Country" />
        <Field label="Phone Number" icon={Phone} placeholder="+91 00000 00000" />
      </div>

      {/* primary action */}
      <button className="absolute bottom-[34px] left-[20px] flex h-[54px] w-[350px] items-center justify-center gap-[9px] rounded-[16px] bg-ink text-[15px] font-medium text-white shadow-[0_8px_24px_rgba(20,10,50,0.28)]">
        <UserPlus className="h-[19px] w-[19px]" strokeWidth={1.9} />
        Add Creator
      </button>
    </div>
  );
}
