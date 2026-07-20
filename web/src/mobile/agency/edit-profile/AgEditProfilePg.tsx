import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Camera,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  MapPin,
  FileText,
  Check,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

/**
 * Agency app — Edit Profile (Figma frame 4100:65022, "edit profile", rendered
 * inside the 390px MobileFrame at 390×931). Self-contained: it carries its own
 * status bar and a bottom primary action (this is the edit form that hangs off
 * the Profile screen's Settings entry, not a tab screen — so no bottom nav).
 * Outfit family via font-sans; ink color tokens.
 *
 * NOTE: The Figma REST + MCP geometry endpoints were hard rate-limited for the
 * entire build window — the `/nodes` and `/images` REST endpoints return HTTP
 * 429 with `retry-after: ~390417` (~4.5 days) on the Starter plan (only the
 * cost-based geometry endpoints are throttled; the token itself is valid), and
 * the Figma MCP tools return the Starter-plan "tool call limit" paywall. Exact
 * node geometry for this frame could therefore not be pulled. The layout is
 * reconstructed from (a) the shared mobile-chrome idiom of the sibling Agency
 * screens on this exact #F4F2F8 shell (Profile / Add Member — status bar, 40px
 * round back button, centered 18px title, white cards, ink primary button, 20px
 * side margins, avatar-with-camera hero) and (b) the REAL profile values shown
 * on the sibling Profile screen (AgencyProfilePage.tsx — Rahul Aggrawal, Sales
 * Manager, Stellar Talents). Re-run against node 4100:65022 to pin pixel-exact
 * coordinates once the Figma API budget resets.
 */

/* ------------------------------- primitives ------------------------------ */
function Field({
  left,
  top,
  width = 350,
  icon: Icon,
  label,
  value,
  multiline,
}: {
  left: number;
  top: number;
  width?: number;
  icon: LucideIcon;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="absolute" style={{ left, top, width }}>
      <span className="mb-[9px] ml-[4px] block text-[13px] font-light leading-none text-ink/60">
        {label}
      </span>
      <div
        className={`flex gap-[10px] rounded-[14px] bg-white px-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] ${
          multiline ? "h-[88px] items-start py-[14px]" : "h-[54px] items-center"
        }`}
      >
        <Icon
          className={`h-[18px] w-[18px] shrink-0 text-ink/40 ${multiline ? "mt-[1px]" : ""}`}
          strokeWidth={1.7}
        />
        <span
          className={`text-[14px] font-medium text-ink ${
            multiline ? "leading-[19px]" : "truncate"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgEditProfilePg() {
  return (
    <div
      className="relative w-[390px] overflow-hidden bg-[#F4F2F8] font-sans text-ink"
      style={{ height: 931 }}
    >
      {/* soft lavender wash behind the hero */}
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
        Edit Profile
      </h1>

      {/* avatar upload */}
      <div className="absolute left-1/2 top-[112px] -translate-x-1/2">
        <div className="h-[96px] w-[96px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED] ring-[4px] ring-white shadow-[0_6px_20px_rgba(90,60,160,0.20)]" />
        <span className="absolute bottom-[0px] right-[0px] flex h-[30px] w-[30px] items-center justify-center rounded-full bg-ink ring-[3px] ring-[#F4F2F8]">
          <Camera className="h-[15px] w-[15px] text-white" strokeWidth={1.7} />
        </span>
      </div>
      <span className="absolute inset-x-0 top-[218px] text-center text-[13px] font-normal leading-none text-ink/55">
        Change Photo
      </span>

      {/* form fields */}
      <Field
        left={20}
        top={256}
        icon={User}
        label="Full Name"
        value="Rahul Aggrawal"
      />
      <Field
        left={20}
        top={342}
        icon={Mail}
        label="Email Address"
        value="rahul.aggrawal@stellartalents.com"
      />
      <Field
        left={20}
        top={428}
        width={169}
        icon={Phone}
        label="Phone Number"
        value="+91 98765 43210"
      />
      <Field
        left={201}
        top={428}
        width={169}
        icon={Briefcase}
        label="Designation"
        value="Sales Manager"
      />
      <Field
        left={20}
        top={514}
        icon={Building2}
        label="Agency"
        value="Stellar Talents"
      />
      <Field
        left={20}
        top={600}
        icon={MapPin}
        label="Location"
        value="Mumbai, India"
      />
      <Field
        left={20}
        top={686}
        icon={FileText}
        label="Bio"
        value="Driving creator partnerships & brand deals at Stellar Talents."
        multiline
      />

      {/* save changes */}
      <button className="absolute left-[20px] top-[840px] flex h-[54px] w-[350px] items-center justify-center gap-[9px] rounded-[16px] bg-ink shadow-[0_8px_24px_rgba(20,10,50,0.28)]">
        <Check className="h-[19px] w-[19px] text-white" strokeWidth={2.2} />
        <span className="text-[16px] font-normal leading-none text-white">
          Save Changes
        </span>
      </button>
    </div>
  );
}
