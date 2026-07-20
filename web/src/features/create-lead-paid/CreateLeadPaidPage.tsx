import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, Navigation, Calendar, Pencil } from "lucide-react";
import { useCreate } from "@/api/hooks";
import instagram from "@/assets/icons/create-lead-paid_instagram.svg";
import youtube from "@/assets/icons/create-lead-paid_youtube.svg";

/**
 * Super Admin — Create Lead (paid).
 * Exact reconstruction of Figma frame 4868:25026 ("Super Admin- Create lead paid"),
 * 1440×1024. Built CLEAN: the "Create a Lead" modal card at full opacity with the
 * dim scrim (rgba(79,79,79,0.76)) omitted. All coordinates are relative to the modal
 * card origin (canvas 129,78).
 */

/* ------------------------------ primitives ----------------------------- */
function Label({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <span
      className="absolute text-[18px] font-light leading-none text-black/70"
      style={{ left: x, top: y + 5 }}
    >
      {children}
    </span>
  );
}

function Field({
  x,
  y,
  w = 237,
  label,
  children,
}: {
  x: number;
  y: number;
  w?: number;
  label: string;
  children?: ReactNode;
}) {
  return (
    <>
      <Label x={x} y={y}>
        {label}
      </Label>
      <div
        className="absolute flex h-[47px] items-center rounded-full border border-[#D6D6D6] bg-[#FEFCFF] px-[20px]"
        style={{ left: x, top: y + 37, width: w }}
      >
        {children}
      </div>
    </>
  );
}

function SectionHeader({
  x,
  y,
  label,
  lineX,
  lineW,
}: {
  x: number;
  y: number;
  label: string;
  lineX: number;
  lineW: number;
}) {
  return (
    <>
      <span
        className="absolute text-[20px] font-normal leading-none text-black/70"
        style={{ left: x, top: y + 9 }}
      >
        {label}
      </span>
      <span
        className="absolute h-px bg-[#D0D0D0]"
        style={{ left: lineX, top: y + 18, width: lineW }}
      />
    </>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CreateLeadPaidPage() {
  const navigate = useNavigate();
  const create = useCreate("leads");
  const [campaignType, setCampaignType] = useState("Paid");
  const [brandName, setBrandName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");

  async function handleAddLead() {
    try {
      await create.mutateAsync({
        brandName,
        contactPerson,
        money: budget,
        dealType: "PAID",
        status: "NEW",
        intent: "MEDIUM",
        peopleCount: 0,
      });
    } finally {
      navigate("/leads");
    }
  }
  return (
    <div
      className="absolute z-50 overflow-hidden rounded-[24px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
      style={{ left: 129, top: 78, width: 1182, height: 869 }}
    >
      {/* ---------- header ---------- */}
      <span
        className="absolute text-[24px] font-medium leading-none text-black"
        style={{ left: 29, top: 42 }}
      >
        Create a Lead
      </span>
      <div
        onClick={handleAddLead}
        className="absolute flex cursor-pointer items-center justify-center rounded-[24px] bg-black/95 shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
        style={{ left: 963, top: 30, width: 122, height: 47 }}
      >
        <span className="text-[20px] font-normal text-white">Add Lead</span>
      </div>
      <div
        onClick={() => navigate(-1)}
        className="absolute flex cursor-pointer items-center justify-center rounded-full border border-black bg-white"
        style={{ left: 1105, top: 30, width: 48, height: 48 }}
      >
        <X className="h-[18px] w-[18px] text-black" strokeWidth={1.6} />
      </div>

      {/* ---------- campaign type / platform / niche ---------- */}
      <Label x={28} y={112}>
        Select your campaign type
      </Label>
      {/* Paid (selected) */}
      <div
        onClick={() => setCampaignType("Paid")}
        className={`absolute flex cursor-pointer items-center justify-center rounded-[28px] border ${
          campaignType === "Paid" ? "border-black bg-black/90" : "border-[#D9D9D9] bg-white/90"
        }`}
        style={{ left: 28, top: 149, width: 100, height: 47 }}
      >
        <span
          className={`text-[20px] font-light ${campaignType === "Paid" ? "text-white" : "text-black"}`}
        >
          Paid
        </span>
      </div>
      <div
        onClick={() => setCampaignType("Barter")}
        className={`absolute flex cursor-pointer items-center justify-center rounded-[28px] border ${
          campaignType === "Barter" ? "border-black bg-black/90" : "border-[#D9D9D9] bg-white/90"
        }`}
        style={{ left: 135, top: 149, width: 100, height: 47 }}
      >
        <span
          className={`text-[20px] font-light ${campaignType === "Barter" ? "text-white" : "text-black"}`}
        >
          Barter
        </span>
      </div>
      <div
        onClick={() => setCampaignType("Mix")}
        className={`absolute flex cursor-pointer items-center justify-center rounded-[28px] border ${
          campaignType === "Mix" ? "border-black bg-black/90" : "border-[#D9D9D9] bg-white/90"
        }`}
        style={{ left: 242, top: 149, width: 100, height: 47 }}
      >
        <span
          className={`text-[20px] font-light ${campaignType === "Mix" ? "text-white" : "text-black"}`}
        >
          Mix
        </span>
      </div>

      <Label x={384} y={112}>
        Platform to run this campaign on
      </Label>
      {/* + Add */}
      <div
        className="absolute flex items-center justify-center gap-[6px] rounded-full border border-[#D6D6D6] bg-[#FEFCFF]"
        style={{ left: 384, top: 149, width: 90, height: 47 }}
      >
        <Plus className="h-[22px] w-[22px] text-black" strokeWidth={1.3} />
        <span className="text-[18px] font-normal text-black/70">Add</span>
      </div>
      {/* Instagram */}
      <div
        className="absolute flex items-center gap-[5px] rounded-full border border-[#D6D6D6] bg-white pl-[16px]"
        style={{ left: 488.8, top: 149, width: 148, height: 47 }}
      >
        <img src={instagram} alt="Instagram" className="h-[16px] w-[16px]" />
        <span className="text-[20px] font-light text-black">Instagram</span>
      </div>
      {/* Youtube */}
      <div
        className="absolute flex items-center gap-[5px] rounded-full border border-[#D6D6D6] bg-white pl-[20px]"
        style={{ left: 651.6, top: 149, width: 148, height: 47 }}
      >
        <img src={youtube} alt="Youtube" className="h-[16px] w-[23px]" />
        <span className="text-[20px] font-light text-black">Youtube</span>
      </div>

      <Label x={837} y={112}>
        Target Niche
      </Label>
      <div
        className="absolute flex items-center justify-center gap-[6px] rounded-full border border-[#D6D6D6] bg-[#FEFCFF]"
        style={{ left: 837, top: 149, width: 90, height: 47 }}
      >
        <Plus className="h-[22px] w-[22px] text-black" strokeWidth={1.3} />
        <span className="text-[18px] font-normal text-black/70">Add</span>
      </div>
      <div
        className="absolute flex items-center justify-center rounded-full border border-[#D6D6D6] bg-white"
        style={{ left: 941.8, top: 149, width: 127, height: 47 }}
      >
        <span className="text-[20px] font-light text-black">Fashion</span>
      </div>
      <div
        className="absolute flex items-center justify-center rounded-full border border-[#D6D6D6] bg-white"
        style={{ left: 1083.6, top: 149, width: 127, height: 47 }}
      >
        <span className="text-[20px] font-light text-black">Beauty</span>
      </div>

      {/* ---------- brand row ---------- */}
      <Field x={28} y={230} label="Brand Name">
        <input
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Enter brand name"
          className="w-full bg-transparent text-[18px] text-black/70 outline-none placeholder:text-black/70"
        />
      </Field>
      <Field x={291} y={230} label="Brand Website">
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="www.brandname.com"
          className="w-full bg-transparent text-[18px] text-black/70 outline-none placeholder:text-black/70"
        />
      </Field>
      <Field x={554} y={230} label="Email Address">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourbrand@gmail.com"
          className="w-full bg-transparent text-[18px] text-black/70 outline-none placeholder:text-black/70"
        />
      </Field>
      <Field x={817} y={230} label="Contact person">
        <input
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          placeholder="Enter name"
          className="w-full bg-transparent text-[18px] text-black/70 outline-none placeholder:text-black/70"
        />
      </Field>

      {/* ---------- phone / budget / location row ---------- */}
      <Field x={28} y={326} label="Phone number">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="8449034518"
          className="w-full bg-transparent text-[18px] text-black/70 outline-none placeholder:text-black/70"
        />
      </Field>
      <Field x={291} y={326} label="Campaign budget">
        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder={"₹  e.g. 5000"}
          className="w-full bg-transparent text-[18px] text-black/70 outline-none placeholder:text-black/70"
        />
      </Field>

      <Label x={554} y={326}>
        Target Location
      </Label>
      {/* Location chip */}
      <div
        className="absolute flex items-center gap-[6px] rounded-full border border-[#D6D6D6] bg-[#FEFCFF] pl-[12px]"
        style={{ left: 554, top: 363, width: 129, height: 47 }}
      >
        <Navigation className="h-[18px] w-[18px] text-black/70" strokeWidth={1.4} />
        <span className="text-[18px] text-black/70">Location</span>
      </div>
      {/* Delhi chip */}
      <div
        className="absolute flex items-center justify-between rounded-full border border-[#D6D6D6] bg-white pl-[14px] pr-[18px]"
        style={{ left: 697.8, top: 363, width: 112, height: 47 }}
      >
        <span className="text-[20px] font-light text-black">Delhi</span>
        <X className="h-[16px] w-[16px] text-black/50" strokeWidth={1.6} />
      </div>

      {/* ---------- Influencer Information ---------- */}
      <SectionHeader x={28} y={444} label="Influencer Information" lineX={262} lineW={348.5} />

      <Field x={28} y={493} label="No of Creators">
        <span className="text-[18px] text-black/50">Number of creators</span>
      </Field>
      <Field x={291} y={493} label="Deliverables per creator">
        <span className="text-[18px] font-light text-black/70">e.g., 2 Reels, 1 Story</span>
      </Field>
      {/* deliverables + button */}
      <div
        className="absolute flex items-center justify-center rounded-full bg-[#181717]"
        style={{ left: 490, top: 541, width: 25, height: 25 }}
      >
        <Plus className="h-[14px] w-[14px] text-white/90" strokeWidth={2} />
      </div>
      <Field x={554} y={493} label="Gender">
        <span className="text-[18px] text-black/50">Female</span>
      </Field>
      <Field x={817} y={493} label="Language">
        <span className="text-[18px] text-black/50">Enter language</span>
      </Field>
      <Field x={28} y={589} label="Age Range">
        <span className="text-[18px] text-black/50">e.g., 18–25</span>
      </Field>

      {/* ---------- Priority + Due Date ---------- */}
      <SectionHeader x={28} y={707} label="Priority + Due Date" lineX={242} lineW={348.5} />

      <span
        className="absolute text-[18px] font-light leading-none text-black/70"
        style={{ left: 28, top: 760.5 }}
      >
        Priority
      </span>
      <div
        className="absolute flex items-center justify-center rounded-[28px] border border-[#0078FD] bg-[#FEFCFF]"
        style={{ left: 28, top: 789.5, width: 90, height: 47 }}
      >
        <span className="text-[18px] text-[#0078FD]">Low</span>
      </div>
      <div
        className="absolute flex items-center justify-center rounded-[28px] border border-[#F2964E] bg-[#FEFCFF]"
        style={{ left: 122, top: 789.5, width: 90, height: 47 }}
      >
        <span className="text-[18px] text-[#F2964E]">Medium</span>
      </div>
      <div
        className="absolute flex items-center justify-center rounded-[28px] border border-[#E84D3A] bg-[#FEFCFF]"
        style={{ left: 216, top: 789.5, width: 90, height: 47 }}
      >
        <span className="text-[18px] text-[#E84D3A]">High</span>
      </div>

      <Field x={332} y={756} label="Select Due Date">
        <span className="text-[18px] text-black/50">Date</span>
      </Field>
      {/* due date calendar button */}
      <div
        className="absolute flex items-center justify-center rounded-full bg-[#181717]"
        style={{ left: 534, top: 804, width: 25, height: 25 }}
      >
        <Calendar className="h-[14px] w-[14px] text-white" strokeWidth={1.6} />
      </div>

      {/* ---------- Agency fee ---------- */}
      <SectionHeader x={698} y={707} label="Agency fee" lineX={851} lineW={229} />
      <Label x={700} y={755}>
        Added Fee
      </Label>
      <div
        className="absolute rounded-full border border-[#D6D6D6] bg-[#FEFCFF]"
        style={{ left: 700, top: 792, width: 266, height: 47 }}
      >
        <div
          className="absolute flex items-center justify-center rounded-full bg-[#ECEAEA]"
          style={{ left: 7, top: 8, width: 32.7, height: 32.7 }}
        >
          <Pencil className="h-[16px] w-[16px] text-black/70" strokeWidth={1.4} />
        </div>
        <span
          className="absolute text-[24.5px] font-medium leading-none text-[#3DBB6C] underline"
          style={{ left: 52, top: 11 }}
        >
          15%
        </span>
        {/* toggle (off) */}
        <div
          className="absolute rounded-full bg-[#787878]/20"
          style={{ left: 194, top: 10, width: 64, height: 28 }}
        >
          <span
            className="absolute rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
            style={{ left: 2, top: 2, width: 39, height: 24 }}
          />
        </div>
      </div>
    </div>
  );
}
