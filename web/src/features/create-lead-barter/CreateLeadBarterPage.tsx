import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreate } from "@/api/hooks";
import { X, Plus, Navigation, Calendar } from "lucide-react";
import igIcon from "@/assets/icons/create-lead-barter_instagram.svg";
import ytIcon from "@/assets/icons/create-lead-barter_youtube.svg";

/**
 * Super Admin — Create Lead (barter) modal.
 * Exact reconstruction of Figma frame 4868:26082 ("Super Admin- Create lead barter"), 1440×1024.
 *
 * The frame captures the leads/schedule workspace dimmed behind the real "Create a Lead" modal
 * (this screen's purpose) over a rgba(79,79,79,0.76) scrim. The scrim + modal sit at z-[60]/z-[70]
 * — above the AppShell TopBar (z-10) and Sidebar (z-20) — so that AppShell chrome shows through the
 * scrim, dimmed, matching the frame. The underlying workspace page is a separate screen and is not
 * re-rendered here. No profile popup is present, so nothing is skipped there.
 *
 * All modal content is positioned relative to the modal card origin (frame 129,78); overflow is
 * clipped so the "Beauty" niche chip trims at the card's right edge exactly as in the frame.
 */

const INK7 = "rgba(0,0,0,0.7)";
const INK5 = "rgba(0,0,0,0.5)";
const FIELD_BG = "#FEFCFF";
const FIELD_BORDER = "1px solid #E8E6EC";

/* ------------------------------- primitives ------------------------------ */
function Label({ l, t, children }: { l: number; t: number; children: ReactNode }) {
  return (
    <div
      className="absolute whitespace-nowrap text-[18px] font-light leading-none"
      style={{ left: l, top: t, color: INK7 }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ l, t, children }: { l: number; t: number; children: ReactNode }) {
  return (
    <div
      className="absolute whitespace-nowrap text-[20px] font-normal leading-none"
      style={{ left: l, top: t, color: INK7 }}
    >
      {children}
    </div>
  );
}

/** pill text input (placeholder-style). w defaults to a single-field width. */
function Field({
  l,
  t,
  w = 237,
  pl = 20,
  color = INK7,
  children,
}: {
  l: number;
  t: number;
  w?: number;
  pl?: number;
  color?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute flex items-center rounded-[24px]"
      style={{ left: l, top: t, width: w, height: 47, background: FIELD_BG, border: FIELD_BORDER, paddingLeft: pl }}
    >
      <span className="whitespace-nowrap text-[18px] font-normal leading-none" style={{ color }}>
        {children}
      </span>
    </div>
  );
}

/** controlled variant of Field: same pill wrapper, transparent input, same placeholder. */
function FieldInput({
  l,
  t,
  w = 237,
  pl = 20,
  color = INK7,
  value,
  onChange,
  placeholder,
}: {
  l: number;
  t: number;
  w?: number;
  pl?: number;
  color?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div
      className="absolute flex items-center rounded-[24px]"
      style={{ left: l, top: t, width: w, height: 47, background: FIELD_BG, border: FIELD_BORDER, paddingLeft: pl }}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none whitespace-nowrap text-[18px] font-normal leading-none"
        style={{ color }}
      />
    </div>
  );
}

/** white outlined selectable chip (Instagram / Youtube / Fashion / Beauty). */
function Chip({ l, t, w, children }: { l: number; t: number; w: number; children: ReactNode }) {
  return (
    <div
      className="absolute flex items-center justify-center gap-[6px] rounded-[24px] text-[20px] font-light text-black"
      style={{ left: l, top: t, width: w, height: 47, background: "#FFFFFF", border: FIELD_BORDER }}
    >
      {children}
    </div>
  );
}

/** "+ Add" pill (Platform / Target Niche). */
function AddChip({ l, t }: { l: number; t: number }) {
  return (
    <div
      className="absolute flex items-center justify-center gap-[6px] rounded-[24px]"
      style={{ left: l, top: t, width: 90, height: 47, background: FIELD_BG, border: FIELD_BORDER }}
    >
      <Plus className="h-[22px] w-[22px]" strokeWidth={1.5} style={{ color: INK7 }} />
      <span className="text-[18px] font-normal leading-none" style={{ color: INK7 }}>
        Add
      </span>
    </div>
  );
}

/** black round action button inside a field (creators +, date calendar). */
function RoundBtn({ l, t, children }: { l: number; t: number; children: ReactNode }) {
  return (
    <div
      className="absolute flex items-center justify-center rounded-full"
      style={{ left: l, top: t, width: 25, height: 25, background: "#181717" }}
    >
      {children}
    </div>
  );
}

/** short divider that trails a section title. */
function Divider({ l, t, w }: { l: number; t: number; w: number }) {
  return <div className="absolute" style={{ left: l, top: t, width: w, height: 1, background: "#E4E4E4" }} />;
}

/* -------------------------------- page --------------------------------- */
export default function CreateLeadBarterPage() {
  const navigate = useNavigate();
  const create = useCreate("leads");
  const [campaignType, setCampaignType] = useState<"paid" | "barter" | "mix">("barter");
  const [showLocation, setShowLocation] = useState(true);
  const [brandName, setBrandName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [money, setMoney] = useState("");

  const handleAdd = async () => {
    await create.mutateAsync({
      brandName,
      contactPerson,
      money,
      dealType: "BARTER",
      status: "NEW",
      intent: "MEDIUM",
    });
    navigate("/leads");
  };

  const modalStyle: CSSProperties = {
    left: 129,
    top: 78,
    width: 1182,
    height: 869,
    borderRadius: 24,
    background: "#FFFFFF",
    overflow: "hidden",
    boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
  };

  return (
    <>
      {/* ===================== dim scrim (dims AppShell chrome too) ===================== */}
      <div className="absolute z-[60]" style={{ left: 0, top: 0, width: 1440, height: 1025, background: "rgba(79,79,79,0.76)" }} />

      {/* ============================== modal card ============================== */}
      <div className="absolute z-[70]" style={modalStyle}>
        {/* ------------------------------- header ------------------------------- */}
        <div className="absolute whitespace-nowrap text-[24px] font-medium leading-none text-black" style={{ left: 29, top: 41 }}>
          Create a Lead
        </div>
        {/* Add Lead */}
        <div
          onClick={() => void handleAdd()}
          className="absolute flex cursor-pointer items-center justify-center rounded-[24px] text-[20px] font-normal text-white"
          style={{ left: 963, top: 30.5, width: 122, height: 47, background: "rgba(0,0,0,0.95)" }}
        >
          Add Lead
        </div>
        {/* close */}
        <div
          onClick={() => navigate(-1)}
          className="absolute flex cursor-pointer items-center justify-center rounded-full bg-white"
          style={{ left: 1105, top: 30, width: 48, height: 48, border: "1px solid #E7E7E7" }}
        >
          <X className="h-[20px] w-[20px] text-black" strokeWidth={1.8} />
        </div>

        {/* =============== row 1: campaign type / platform / niche =============== */}
        {/* campaign type */}
        <Label l={28} t={112}>Select your campaign type</Label>
        <div
          onClick={() => setCampaignType("paid")}
          className={`absolute flex cursor-pointer items-center justify-center rounded-[28px] text-[20px] font-light${campaignType === "paid" ? " text-white" : ""}`}
          style={
            campaignType === "paid"
              ? { left: 28, top: 149, width: 100, height: 47, background: "rgba(0,0,0,0.9)" }
              : { left: 28, top: 149, width: 100, height: 47, background: "rgba(255,255,255,0.9)", border: FIELD_BORDER, color: "rgba(0,0,0,0.99)" }
          }
        >
          Paid
        </div>
        <div
          onClick={() => setCampaignType("barter")}
          className={`absolute flex cursor-pointer items-center justify-center rounded-[28px] text-[20px] font-light${campaignType === "barter" ? " text-white" : ""}`}
          style={
            campaignType === "barter"
              ? { left: 135, top: 149, width: 100, height: 47, background: "rgba(0,0,0,0.9)" }
              : { left: 135, top: 149, width: 100, height: 47, background: "rgba(255,255,255,0.9)", border: FIELD_BORDER, color: "rgba(0,0,0,0.99)" }
          }
        >
          Barter
        </div>
        <div
          onClick={() => setCampaignType("mix")}
          className={`absolute flex cursor-pointer items-center justify-center rounded-[28px] text-[20px] font-light${campaignType === "mix" ? " text-white" : ""}`}
          style={
            campaignType === "mix"
              ? { left: 242, top: 149, width: 100, height: 47, background: "rgba(0,0,0,0.9)" }
              : { left: 242, top: 149, width: 100, height: 47, background: "rgba(255,255,255,0.9)", border: FIELD_BORDER, color: "rgba(0,0,0,0.99)" }
          }
        >
          Mix
        </div>

        {/* platform */}
        <Label l={384} t={112}>Platform to run this campaign on</Label>
        <AddChip l={384} t={149} />
        <Chip l={488.8} t={149} w={148}>
          <img src={igIcon} alt="" className="h-[16px] w-[16px]" />
          Instagram
        </Chip>
        <Chip l={651.6} t={149} w={148}>
          <img src={ytIcon} alt="" className="h-[16px] w-[23px]" />
          Youtube
        </Chip>

        {/* target niche */}
        <Label l={837} t={112}>Target Niche</Label>
        <AddChip l={837} t={149} />
        <Chip l={941.8} t={149} w={127}>Fashion</Chip>
        <Chip l={1083.6} t={149} w={127}>Beauty</Chip>

        {/* ================= row 2: brand / website / email / contact ============ */}
        <Label l={28} t={230}>Brand Name</Label>
        <FieldInput l={28} t={267} value={brandName} onChange={setBrandName} placeholder="Enter brand name" />
        <Label l={291} t={230}>Brand Website</Label>
        <Field l={291} t={267}>www.brandname.com</Field>
        <Label l={554} t={230}>Email Address</Label>
        <Field l={554} t={267}>yourbrand@gmail.com</Field>
        <Label l={817} t={230}>Contact person</Label>
        <FieldInput l={817} t={267} value={contactPerson} onChange={setContactPerson} placeholder="Enter name" />

        {/* ============ row 3: phone / barter value / agency fee / location ======= */}
        <Label l={28} t={326}>Phone number</Label>
        <Field l={28} t={363}>8449034518</Field>
        <Label l={291} t={326}>Barter Value</Label>
        <FieldInput l={291} t={363} value={money} onChange={setMoney} placeholder={"₹  e.g. 5000"} />
        <Label l={554} t={326}>Agency Fee</Label>
        <Field l={554} t={363}>₹&nbsp;&nbsp;e.g. 5000</Field>
        <Label l={817} t={326}>Target Location</Label>
        {/* Location button */}
        <div
          className="absolute flex items-center rounded-[24px]"
          style={{ left: 817, top: 363, width: 129, height: 47, background: FIELD_BG, border: FIELD_BORDER, paddingLeft: 12 }}
        >
          <Navigation className="h-[19px] w-[19px]" strokeWidth={1.5} style={{ color: INK7 }} />
          <span className="ml-[8px] text-[18px] font-normal leading-none" style={{ color: INK7 }}>Location</span>
        </div>
        {/* Delhi chip */}
        {showLocation && (
          <div
            className="absolute flex items-center justify-between rounded-[24px]"
            style={{ left: 960.8, top: 363, width: 112, height: 47, background: "#FFFFFF", border: FIELD_BORDER, paddingLeft: 14, paddingRight: 12 }}
          >
            <span className="text-[20px] font-light leading-none text-black">Delhi</span>
            <X
              onClick={() => setShowLocation(false)}
              className="h-[16px] w-[16px] cursor-pointer text-black"
              strokeWidth={1.8}
            />
          </div>
        )}

        {/* ==================== Influencer Information ==================== */}
        <SectionTitle l={28} t={444}>Influencer Information</SectionTitle>
        <Divider l={262} t={462.5} w={348.5} />

        <Label l={28} t={493}>No of Creators</Label>
        <Field l={28} t={530} color={INK5}>Number of creators</Field>
        <Label l={291} t={493}>Deliverables per creator</Label>
        <Field l={291} t={530}>e.g., 2 Reels, 1 Story</Field>
        <RoundBtn l={490} t={541}>
          <Plus className="h-[16px] w-[16px]" strokeWidth={2.2} style={{ color: "rgba(255,255,255,0.9)" }} />
        </RoundBtn>
        <Label l={554} t={493}>Gender</Label>
        <Field l={554} t={530} color={INK5}>Female</Field>
        <Label l={817} t={493}>Language</Label>
        <Field l={817} t={530} color={INK5}>Enter language</Field>

        <Label l={28} t={589}>Age Range</Label>
        <Field l={28} t={626} color={INK5}>e.g., 18–25</Field>

        {/* ==================== Priority + Due Date ==================== */}
        <SectionTitle l={28} t={707}>Priority + Due Date</SectionTitle>
        <Divider l={242} t={725.5} w={348.5} />

        <Label l={28} t={760.5}>Priority</Label>
        <div
          className="absolute flex items-center justify-center rounded-[24px] text-[18px] font-normal leading-none"
          style={{ left: 28, top: 789.5, width: 90, height: 47, background: FIELD_BG, border: "1px solid #0078FD", color: "#0078FD" }}
        >
          Low
        </div>
        <div
          className="absolute flex items-center justify-center rounded-[24px] text-[18px] font-normal leading-none"
          style={{ left: 122, top: 789.5, width: 90, height: 47, background: FIELD_BG, border: "1px solid #F2964E", color: "#F2964E" }}
        >
          Medium
        </div>
        <div
          className="absolute flex items-center justify-center rounded-[24px] text-[18px] font-normal leading-none"
          style={{ left: 216, top: 789.5, width: 90, height: 47, background: FIELD_BG, border: "1px solid #E84D3A", color: "#E84D3A" }}
        >
          High
        </div>

        <Label l={332} t={756}>Select Due Date</Label>
        <Field l={332} t={793} color={INK5}>Date</Field>
        <RoundBtn l={534} t={804}>
          <Calendar className="h-[15px] w-[15px]" strokeWidth={1.9} style={{ color: "rgba(255,255,255,0.9)" }} />
        </RoundBtn>
      </div>
    </>
  );
}
