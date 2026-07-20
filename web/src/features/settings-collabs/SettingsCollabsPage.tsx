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
 * Super Admin — Settings / Collabs.
 * Exact reconstruction of Figma frame 5717:58337 ("Super Admin-Settings (Collabs)"), 1440×1024.
 * The captured frame had the TopBar profile dropdown + dim scrim open; that popup/scrim is
 * intentionally omitted — this is the CLEAN underlying page at full opacity.
 */

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
      className={`absolute top-[225px] flex h-[48px] cursor-pointer items-center gap-[8px] rounded-[24px] px-[12px] ${
        active ? "bg-black" : "border border-[#CCCCCC] bg-white"
      }`}
      style={{ left, width }}
    >
      <Icon
        className={`h-[18px] w-[18px] ${active ? "text-white" : "text-black"}`}
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

function FieldBox({
  left,
  width,
  children,
}: {
  left: number;
  width: number;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute top-[759px] flex h-[40px] items-center justify-between rounded-[20px] border border-black/20 bg-[#FAFAFA] px-[10px]"
      style={{ left, width }}
    >
      {children}
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function SettingsCollabsPage() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState("YouTube");
  const [deliverable, setDeliverable] = useState("Shot");
  return (
    <>
      {/* SETTINGS title — 261,158 · Outfit 400 40px */}
      <h1 className="absolute left-[261px] top-[153px] text-[40px] font-normal text-ink">SETTINGS</h1>

      {/* panel background — Figma Subtract: base 241,222 755×780 minus a 648×60 top-left
          notch, so the visible top edge sits below the tab row (~y=282) while the
          right corner wraps up behind the active Collabs tab. */}
      <div className="absolute left-[241px] top-[282px] h-[720px] w-[755px] rounded-[24px] border border-[#D4D4D4] bg-white/15" />
      <div className="absolute left-[869px] top-[222px] h-[80px] w-[127px] rounded-tr-[24px] border-r border-t border-[#D4D4D4] bg-white/15" />

      {/* tabs */}
      <Tab icon={Sparkles} label="Team Management" left={241} width={180} onClick={() => navigate("/settings")} />
      <Tab icon={AlignJustify} label="Lead Distribution" left={431} width={165} onClick={() => navigate("/settings/lead-distribution")} />
      <Tab icon={GitBranch} label="Integration" left={606} width={139} onClick={() => navigate("/settings/integration")} />
      <Tab icon={GitBranch} label="Collabs" left={755} width={114} active onClick={() => navigate("/settings/collab")} />

      {/* section heading + subtitle */}
      <h2 className="absolute left-[258px] top-[300px] text-[20px] font-normal leading-[24px] text-black">
        Barter Collab Costing
      </h2>
      <p className="absolute left-[258px] top-[337px] text-[15px] font-normal leading-[24px] text-black/70">
        Add barter values for your deliverables so we can calculate your campaign’s agency fee.
      </p>

      {/* ---- Row card A: configured Instagram commercial ---- */}
      <div className="absolute left-[257px] top-[380px] h-[52px] w-[592px] rounded-[12px] border border-[#D2D2D2] bg-white" />
      <div className="absolute left-[268px] top-[390px] flex h-[32px] w-[85px] items-center justify-center gap-[3px] rounded-[20px] border border-black bg-[#FDFCFF]">
        <Check className="h-[13px] w-[13px] text-black" strokeWidth={2.2} />
        <span className="text-[12px] text-black">Instagram</span>
      </div>
      <div className="absolute left-[357px] top-[390px] flex h-[32px] w-[216px] items-center rounded-[20px] border border-[#C9C9C9] bg-[#FDFCFF] px-[9px]">
        <span className="text-[12px] font-light text-black/70">Reel | ₹2000 | 1-10 collab | ₹1000 fee</span>
      </div>
      <div className="absolute left-[776px] top-[392px] flex h-[28px] w-[58px] items-center gap-[5px]">
        <span className="flex h-[28px] w-[28px] items-center justify-center rounded-[16px] bg-[#EFEFEF]">
          <Pencil className="h-[13px] w-[13px] text-black" strokeWidth={1.4} />
        </span>
        <span className="text-[12px] text-black">Edit</span>
      </div>

      {/* ---- Row card B: Add Barter Commercials ---- */}
      <div className="absolute left-[257px] top-[444px] h-[52px] w-[592px] rounded-[12px] border border-[#D2D2D2] bg-white" />
      <div className="absolute left-[465px] top-[454px] flex h-[32px] w-[176px] items-center justify-center gap-[6px] rounded-[20px] border border-black/20 bg-[#FDFCFF]">
        <Plus className="h-[14px] w-[14px] text-black" strokeWidth={1.8} />
        <span className="text-[12px] text-black">Add Barter Commercials</span>
      </div>

      {/* ---- Row card C: expanded editor ---- */}
      <div className="absolute left-[257px] top-[508px] h-[417px] w-[592px] rounded-[12px] border border-[#D2D2D2] bg-white" />

      {/* YouTube add pill (centered near top) */}
      <div className="absolute left-[496px] top-[529px] flex h-[32px] w-[113px] items-center justify-center gap-[6px] rounded-[20px] border border-black bg-[#FDFCFF]">
        <Plus className="h-[14px] w-[14px] text-black" strokeWidth={1.8} />
        <span className="text-[12px] text-black">YouTube</span>
      </div>

      {/* Select Platform */}
      <FieldLabel left={285} top={571}>Select Platform</FieldLabel>
      <OptionChip left={285} top={599} label="Instagram" selected={platform === "Instagram"} onClick={() => setPlatform("Instagram")} />
      <OptionChip left={420} top={599} label="YouTube" selected={platform === "YouTube"} onClick={() => setPlatform("YouTube")} />
      <OptionChip left={555} top={599} label="Facebook" selected={platform === "Facebook"} onClick={() => setPlatform("Facebook")} />
      <OptionChip left={690} top={599} label="LinkedIn" selected={platform === "LinkedIn"} onClick={() => setPlatform("LinkedIn")} />

      {/* Add Deliverables */}
      <FieldLabel left={285} top={651}>Add Deliverables</FieldLabel>
      <OptionChip left={285} top={679} label="Dedicated Video" selected={deliverable === "Dedicated Video"} onClick={() => setDeliverable("Dedicated Video")} />
      <OptionChip left={420} top={679} label="Shot" selected={deliverable === "Shot"} onClick={() => setDeliverable("Shot")} />
      <OptionChip left={555} top={679} label="Integrated Video" selected={deliverable === "Integrated Video"} onClick={() => setDeliverable("Integrated Video")} />
      <OptionChip left={690} top={679} label="Post" selected={deliverable === "Post"} onClick={() => setDeliverable("Post")} />

      {/* Value fields */}
      <FieldLabel left={285} top={731}>Set Min. Barter Value</FieldLabel>
      <FieldBox left={285} width={175}>
        <span className="text-[12px] font-light text-black">₹2000</span>
        <span className="text-[12px] font-light text-black/70">Per Creator</span>
      </FieldBox>

      <FieldLabel left={470} top={731}>Collabs</FieldLabel>
      <FieldBox left={470} width={175}>
        <span className="text-[12px] font-light text-black">1 - 10 Collabs</span>
        <ChevronsUpDown className="h-[16px] w-[16px] text-black" strokeWidth={1.6} />
      </FieldBox>

      <FieldLabel left={655} top={731}>Agency Fee</FieldLabel>
      <FieldBox left={655} width={175}>
        <span className="text-[12px] font-light text-black">₹1000</span>
        <span className="text-[12px] font-light text-black/70">Per Collab</span>
      </FieldBox>

      {/* Warning note */}
      <div className="absolute left-[285px] top-[813px] flex h-[20px] w-[545px] items-center gap-[6px]">
        <AlertCircle className="h-[17px] w-[17px] shrink-0 text-black/70" strokeWidth={1.6} />
        <span className="text-[14px] font-light leading-[16px] text-black/70">
          Agency Fee will be auto calculated based on your barter value and collab.
        </span>
      </div>

      {/* Save */}
      <div
        onClick={() => navigate("/settings/collab")}
        className="absolute left-[285px] top-[851px] flex h-[40px] w-[90px] cursor-pointer items-center justify-center rounded-[24px] border border-[#CCCCCC] bg-white"
      >
        <span className="text-[14px] font-light text-black">Save</span>
      </div>
    </>
  );
}
