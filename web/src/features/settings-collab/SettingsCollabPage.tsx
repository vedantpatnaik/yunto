import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  AlignJustify,
  GitBranch,
  Check,
  Pencil,
  Plus,
  ChevronsUpDown,
  AlertCircle,
} from "lucide-react";

/**
 * Super Admin — Settings / Collab (Barter Collab Costing).
 * Exact reconstruction of Figma frame 6918:110149 ("Super Admin-SETTINGS- collab"), 1440×1024.
 * Built CLEAN at full opacity — no profile popup / dim scrim (none present in this node tree).
 * TopBar + Sidebar come from AppShell, so this returns page content only.
 */

/* stepped content-card outline — reproduces the Figma boolean Subtract:
   base 755×815 rounded rect minus a 648×65 top-left notch, leaving the tab row
   cut down while the top-right nub (x 637→755) rises to the full top edge. */
const CARD_PATH =
  "M 24 65 L 617 65 A 20 20 0 0 0 637 45 L 637 20 A 20 20 0 0 1 657 0 L 731 0 A 24 24 0 0 1 755 24 L 755 791 A 24 24 0 0 1 731 815 L 24 815 A 24 24 0 0 1 0 791 L 0 89 A 24 24 0 0 1 24 65 Z";

/* ------------------------------ primitives ----------------------------- */
function Tab({
  icon: Icon,
  label,
  left,
  width,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  left: number;
  width: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`absolute top-[218px] flex h-[48px] cursor-pointer items-center gap-[8px] rounded-[24px] px-[12px] ${
        active ? "bg-black" : "border border-[#CCCCCC] bg-white"
      }`}
      style={{ left, width }}
    >
      <Icon
        className={`h-[20px] w-[20px] shrink-0 ${active ? "text-white" : "text-black"}`}
        strokeWidth={1.6}
      />
      <span
        className={`whitespace-nowrap text-[14px] font-light ${
          active ? "text-white" : "text-black"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function OptionChip({
  left,
  top,
  label,
  selected,
  onClick,
}: {
  left: number;
  top: number;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`absolute flex h-[40px] w-[125px] cursor-pointer items-center rounded-[20px] border border-black/20 px-[9px] ${
        selected ? "justify-between bg-black" : "bg-[#FAFAFA]"
      }`}
      style={{ left, top }}
    >
      <span className={`text-[12px] font-light ${selected ? "text-white" : "text-black"}`}>
        {label}
      </span>
      {selected && <Check className="h-[14px] w-[14px] text-white" strokeWidth={2.2} />}
    </div>
  );
}

function FieldLabel({ left, top, children }: { left: number; top: number; children: ReactNode }) {
  return (
    <span
      className="absolute text-[14px] font-normal leading-[24px] text-black/70"
      style={{ left, top }}
    >
      {children}
    </span>
  );
}

function FieldBox({ left, children }: { left: number; children: ReactNode }) {
  return (
    <div
      className="absolute top-[746px] flex h-[40px] w-[175px] items-center justify-between rounded-[20px] border border-black/20 bg-[#FAFAFA] px-[10px]"
      style={{ left }}
    >
      {children}
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function SettingsCollabPage() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState("YouTube");
  const [deliverable, setDeliverable] = useState("Shot");
  return (
    <>
      {/* SETTINGS title — 260,153 · Outfit 400 40px */}
      <h1 className="absolute left-[260px] top-[153px] text-[40px] font-normal text-ink">SETTINGS</h1>

      {/* stepped content-card outline (Subtract) at 242,209 · 755×815, white/15 fill */}
      <svg
        className="absolute left-[242px] top-[209px]"
        width={755}
        height={815}
        viewBox="0 0 755 815"
        fill="none"
      >
        <path d={CARD_PATH} fill="#FFFFFF" fillOpacity={0.15} stroke="#D4D4D4" strokeWidth={1} />
      </svg>

      {/* tabs */}
      <Tab icon={Sparkles} label="Team Management" left={242} width={180} onClick={() => navigate("/settings")} />
      <Tab icon={AlignJustify} label="Lead Distribution" left={432} width={165} onClick={() => navigate("/settings/lead-distribution")} />
      <Tab icon={GitBranch} label="Integration" left={607} width={139} onClick={() => navigate("/settings/integration")} />
      <Tab icon={GitBranch} label="Collabs" left={756} width={114} active onClick={() => navigate("/settings/collab")} />

      {/* section heading + subtitle */}
      <h2 className="absolute left-[259px] top-[287px] text-[20px] font-normal leading-[24px] text-black">
        Barter Collab Costing
      </h2>
      <p className="absolute left-[259px] top-[324px] text-[15px] font-normal leading-[24px] text-black/70">
        Add barter values for your deliverables so we can calculate your campaign’s agency fee.
      </p>

      {/* ---- Row card A: configured Instagram commercial ---- */}
      <div className="absolute left-[258px] top-[367px] h-[52px] w-[592px] rounded-[12px] border border-[#D2D2D2] bg-white" />
      <div className="absolute left-[269px] top-[377px] flex h-[32px] w-[85px] items-center justify-center gap-[3px] rounded-[20px] border border-black bg-[#FDFCFF]">
        <Check className="h-[13px] w-[13px] text-black" strokeWidth={2.2} />
        <span className="text-[12px] text-black">Instagram</span>
      </div>
      <div className="absolute left-[358px] top-[377px] flex h-[32px] w-[216px] items-center rounded-[20px] border border-[#C9C9C9] bg-[#FDFCFF] px-[9px]">
        <span className="text-[12px] font-light text-black/70">Reel | ₹2000 | 1-10 collab | ₹1000 fee</span>
      </div>
      <div className="absolute left-[777px] top-[379px] flex h-[28px] w-[58px] items-center gap-[5px]">
        <span className="flex h-[28px] w-[28px] items-center justify-center rounded-[16px] bg-[#EFEFEF]">
          <Pencil className="h-[13px] w-[13px] text-black" strokeWidth={1.4} />
        </span>
        <span className="text-[12px] text-black">Edit</span>
      </div>

      {/* ---- Row card B: Add Barter Commercials ---- */}
      <div className="absolute left-[258px] top-[431px] h-[52px] w-[592px] rounded-[12px] border border-[#D2D2D2] bg-white" />
      <div className="absolute left-[466px] top-[441px] flex h-[32px] w-[176px] items-center justify-center gap-[6px] rounded-[20px] border border-black/20 bg-[#FDFCFF]">
        <Plus className="h-[14px] w-[14px] text-black" strokeWidth={1.8} />
        <span className="text-[12px] text-black">Add Barter Commercials</span>
      </div>

      {/* ---- Row card C: expanded editor ---- */}
      <div className="absolute left-[258px] top-[495px] h-[417px] w-[592px] rounded-[12px] border border-[#D2D2D2] bg-white" />

      {/* YouTube add pill (centered near top of card C) */}
      <div className="absolute left-[497px] top-[516px] flex h-[32px] w-[113px] items-center justify-center gap-[6px] rounded-[20px] border border-black bg-[#FDFCFF]">
        <Plus className="h-[14px] w-[14px] text-black" strokeWidth={1.8} />
        <span className="text-[12px] text-black">YouTube</span>
      </div>

      {/* Select Platform */}
      <FieldLabel left={286} top={558}>Select Platform</FieldLabel>
      <OptionChip left={286} top={586} label="Instagram" selected={platform === "Instagram"} onClick={() => setPlatform("Instagram")} />
      <OptionChip left={421} top={586} label="YouTube" selected={platform === "YouTube"} onClick={() => setPlatform("YouTube")} />
      <OptionChip left={556} top={586} label="Facebook" selected={platform === "Facebook"} onClick={() => setPlatform("Facebook")} />
      <OptionChip left={691} top={586} label="LinkedIn" selected={platform === "LinkedIn"} onClick={() => setPlatform("LinkedIn")} />

      {/* Add Deliverables */}
      <FieldLabel left={286} top={638}>Add Deliverables</FieldLabel>
      <OptionChip left={286} top={666} label="Dedicated Video" selected={deliverable === "Dedicated Video"} onClick={() => setDeliverable("Dedicated Video")} />
      <OptionChip left={421} top={666} label="Shot" selected={deliverable === "Shot"} onClick={() => setDeliverable("Shot")} />
      <OptionChip left={556} top={666} label="Integrated Video" selected={deliverable === "Integrated Video"} onClick={() => setDeliverable("Integrated Video")} />
      <OptionChip left={691} top={666} label="Post" selected={deliverable === "Post"} onClick={() => setDeliverable("Post")} />

      {/* Value fields */}
      <FieldLabel left={286} top={718}>Set Min. Barter Value</FieldLabel>
      <FieldBox left={286}>
        <span className="text-[12px] font-light text-black">₹2000</span>
        <span className="text-[12px] font-light text-black/70">Per Creator</span>
      </FieldBox>

      <FieldLabel left={471} top={718}>Collabs</FieldLabel>
      <FieldBox left={471}>
        <span className="text-[12px] font-light text-black">1 - 10 Collabs</span>
        <ChevronsUpDown className="h-[16px] w-[16px] text-black" strokeWidth={1.6} />
      </FieldBox>

      <FieldLabel left={656} top={718}>Agency Fee</FieldLabel>
      <FieldBox left={656}>
        <span className="text-[12px] font-light text-black">₹1000</span>
        <span className="text-[12px] font-light text-black/70">Per Collab</span>
      </FieldBox>

      {/* Warning note */}
      <div className="absolute left-[286px] top-[800px] flex h-[20px] w-[545px] items-center gap-[6px]">
        <AlertCircle className="h-[17px] w-[17px] shrink-0 text-black/70" strokeWidth={1.6} />
        <span className="text-[14px] font-light leading-[16px] text-black/70">
          Agency Fee will be auto calculated based on your barter value and collab.
        </span>
      </div>

      {/* Save */}
      <div
        onClick={() => navigate("/settings/collab")}
        className="absolute left-[286px] top-[838px] flex h-[40px] w-[90px] cursor-pointer items-center justify-center rounded-[24px] border border-[#CCCCCC] bg-white"
      >
        <span className="text-[14px] font-light text-black">Save</span>
      </div>
    </>
  );
}
