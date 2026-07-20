import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, UsersRound, Navigation, Calendar, AlertCircle, Check, X } from "lucide-react";
import instagram from "@/assets/icons/creators-find_instagram.svg";
import youtube from "@/assets/icons/creators-find_youtube.svg";
import { useCreators } from "@/api/hooks";

/**
 * Super Admin — Creators / Find.
 * Exact reconstruction of Figma frame 5077:68034 ("Super Admin- Creators find"), 1440×1024.
 * Built CLEAN: the captured frame had the TopBar profile dropdown + dim scrim open —
 * those sibling nodes (5077:68357+) are intentionally omitted; the underlying page is at full opacity.
 */

/* ------------------------------ primitives ----------------------------- */
function Chip({
  left,
  top,
  width,
  height,
  className = "",
  onClick,
  children,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      style={{ position: "absolute", left, top, width, height }}
      className={`flex items-center justify-center gap-[6px] rounded-full ${className}${onClick ? " cursor-pointer" : ""}`}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  labelTop,
  inputTop,
  inputH = 44,
  leftPad,
  placeholder,
  phClassName,
  children,
}: {
  label: string;
  labelTop: number;
  inputTop: number;
  inputH?: number;
  leftPad: number;
  placeholder: string;
  phClassName: string;
  children?: ReactNode;
}) {
  return (
    <>
      <span
        style={{ position: "absolute", left: 418, top: labelTop }}
        className="text-[14px] font-normal leading-[16px] text-black/70"
      >
        {label}
      </span>
      <div
        style={{ position: "absolute", left: 418, top: inputTop, width: 352, height: inputH }}
        className="flex items-center rounded-full border border-black/[0.06] bg-[#FEFCFF]"
      >
        <span style={{ paddingLeft: leftPad }} className={`text-[16px] ${phClassName}`}>
          {placeholder}
        </span>
        {children}
      </div>
    </>
  );
}

function RoundBtn({ left, top, children }: { left: number; top: number; children: ReactNode }) {
  return (
    <span
      style={{ position: "absolute", left, top, width: 25, height: 25 }}
      className="flex items-center justify-center rounded-full bg-[#181717]"
    >
      {children}
    </span>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CreatorsFindPage() {
  const navigate = useNavigate();
  const { data } = useCreators();
  const creators = data ?? [];
  const total = creators.length;
  const listedCount = creators.filter((c) => c.listed).length;

  const [creatorFilter, setCreatorFilter] = useState<"all" | "listed">("all");
  const [listed, setListed] = useState(false);
  const [campaignType, setCampaignType] = useState<"paid" | "barter" | "mix">("paid");
  const [niches, setNiches] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [urgent, setUrgent] = useState(true);

  const toggleFrom = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  return (
    <>
      {/* full-bleed frame gradient (paints behind AppShell sidebar/topbar) —
          Figma frame 5077:68034 fill overrides the global body gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, #EAEAEA 0%, #EDF9FF 36%, rgba(201,218,227,0.9) 70%, #A4C5D9 100%)",
        }}
      />

      {/* CREATORS — 238,162 · Outfit 400 36px */}
      <h1
        style={{ position: "absolute", left: 238, top: 162 }}
        className="text-[36px] font-normal leading-[45px] text-black"
      >
        CREATORS
      </h1>

      {/* Creator + pill — 505,158 */}
      <div
        onClick={() => navigate("/leads/add-creator")}
        style={{ position: "absolute", left: 505, top: 158, width: 124, height: 45 }}
        className="flex items-center justify-center gap-[10px] rounded-[28px] bg-black/90 cursor-pointer"
      >
        <span className="text-[14px] font-light text-white/[0.99]">Creator</span>
        <Plus className="h-[13px] w-[13px] text-white" strokeWidth={2} />
      </div>

      {/* header buttons — search / All 92,000 / people / listed */}
      <div
        onClick={() => navigate("/search")}
        style={{ position: "absolute", left: 654, top: 159.5, width: 45, height: 45 }}
        className="flex items-center justify-center rounded-full bg-white cursor-pointer"
      >
        <Search className="h-[22px] w-[22px] text-black" strokeWidth={1.7} />
      </div>

      <div
        onClick={() => setCreatorFilter("all")}
        style={{ position: "absolute", left: 707, top: 158, width: 146, height: 48 }}
        className={`flex items-center justify-center rounded-[24px] text-[20px] font-extralight cursor-pointer ${
          creatorFilter === "all" ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        All {total.toLocaleString()}
      </div>

      <div
        onClick={() => setCreatorFilter("listed")}
        style={{ position: "absolute", left: 861, top: 158, width: 72, height: 48 }}
        className={`flex items-center gap-[6px] rounded-[24px] pl-[12px] cursor-pointer ${
          creatorFilter === "listed" ? "bg-black" : "bg-white"
        }`}
      >
        <UsersRound
          className={`h-[20px] w-[24px] ${creatorFilter === "listed" ? "text-white" : "text-black"}`}
          strokeWidth={1.7}
        />
        <span className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#20A271] text-[10px] font-normal text-white">
          {listedCount}
        </span>
      </div>

      <div
        style={{ position: "absolute", left: 941, top: 158, width: 162, height: 48 }}
        className="rounded-[24px] bg-white"
      >
        <span
          style={{ position: "absolute", left: 13.5, top: 11.5 }}
          className="text-[20px] font-extralight text-black"
        >
          listed
        </span>
        <div
          onClick={() => setListed((v) => !v)}
          style={{ position: "absolute", left: 84.5, top: 10, width: 64, height: 28 }}
          className={`rounded-full cursor-pointer ${listed ? "bg-[#20A271]" : "bg-[#78787833]"}`}
        >
          <div
            style={{ position: "absolute", left: listed ? 23 : 2, top: 2, width: 39, height: 24 }}
            className="rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
          />
        </div>
      </div>

      {/* form heading — 397,247 · Outfit 400 28px */}
      <h2
        style={{ position: "absolute", left: 397, top: 250 }}
        className="text-[28px] font-normal leading-[40px] text-[#101010]"
      >
        Fill your requirements here
      </h2>

      {/* form card — 397,300 · 645×1415 */}
      <div
        style={{ position: "absolute", left: 397, top: 300, width: 645, height: 1415 }}
        className="rounded-[16px] bg-white"
      />

      {/* ---------- Target Niche ---------- */}
      <span
        style={{ position: "absolute", left: 418, top: 319 }}
        className="text-[14px] font-normal leading-[16px] text-black/70"
      >
        Target Niche
      </span>
      <Chip left={418} top={356} width={90} height={47} className="gap-[4px] border border-black/[0.06] bg-[#FEFCFF]">
        <Plus className="h-[19px] w-[19px] text-black" strokeWidth={1.2} />
        <span className="text-[16px] font-normal text-black">Add</span>
      </Chip>
      <Chip
        left={522.8}
        top={356}
        width={127}
        height={47}
        onClick={() => setNiches((prev) => toggleFrom(prev, "Fashion"))}
        className={niches.includes("Fashion") ? "bg-black/90" : "border border-black/[0.06] bg-white"}
      >
        <span className={`text-[16px] font-light ${niches.includes("Fashion") ? "text-white/[0.99]" : "text-black"}`}>
          Fashion
        </span>
      </Chip>
      <Chip
        left={664.6}
        top={356}
        width={127}
        height={47}
        onClick={() => setNiches((prev) => toggleFrom(prev, "Beauty"))}
        className={niches.includes("Beauty") ? "bg-black/90" : "border border-black/[0.06] bg-white"}
      >
        <span className={`text-[16px] font-light ${niches.includes("Beauty") ? "text-white/[0.99]" : "text-black"}`}>
          Beauty
        </span>
      </Chip>

      {/* ---------- Select your campaign type ---------- */}
      <span
        style={{ position: "absolute", left: 418, top: 421 }}
        className="text-[14px] font-normal leading-[16px] text-black/70"
      >
        Select your campaign type
      </span>
      <Chip
        left={418}
        top={454}
        width={100}
        height={44}
        onClick={() => setCampaignType("paid")}
        className={campaignType === "paid" ? "bg-black/90" : "border border-black/[0.06] bg-white/90"}
      >
        <span className={`text-[16px] font-light ${campaignType === "paid" ? "text-white/[0.99]" : "text-black/60"}`}>
          Paid
        </span>
      </Chip>
      <Chip
        left={525}
        top={454}
        width={100}
        height={44}
        onClick={() => setCampaignType("barter")}
        className={campaignType === "barter" ? "bg-black/90" : "border border-black/[0.06] bg-white/90"}
      >
        <span className={`text-[16px] font-light ${campaignType === "barter" ? "text-white/[0.99]" : "text-black/60"}`}>
          Barter
        </span>
      </Chip>
      <Chip
        left={632}
        top={454}
        width={100}
        height={44}
        onClick={() => setCampaignType("mix")}
        className={campaignType === "mix" ? "bg-black/90" : "border border-black/[0.06] bg-white/90"}
      >
        <span className={`text-[16px] font-light ${campaignType === "mix" ? "text-white/[0.99]" : "text-black/60"}`}>
          Mix
        </span>
      </Chip>

      {/* ---------- Platform to run this campaign on ---------- */}
      <span
        style={{ position: "absolute", left: 418, top: 516 }}
        className="text-[14px] font-normal leading-[16px] text-black/70"
      >
        Platform to run this campaign on
      </span>
      <Chip left={418} top={549} width={90} height={44} className="gap-[4px] border border-black/[0.06] bg-[#FEFCFF]">
        <Plus className="h-[19px] w-[19px] text-black" strokeWidth={1.2} />
        <span className="text-[16px] font-normal text-black/70">Add</span>
      </Chip>
      <Chip
        left={522.8}
        top={549}
        width={137}
        height={44}
        onClick={() => setPlatforms((prev) => toggleFrom(prev, "Instagram"))}
        className={`gap-[5px] ${platforms.includes("Instagram") ? "bg-black/90" : "border border-black/[0.06] bg-white"}`}
      >
        <img src={instagram} alt="Instagram" className="h-[16px] w-[16px]" />
        <span className={`text-[16px] font-light ${platforms.includes("Instagram") ? "text-white/[0.99]" : "text-black"}`}>
          Instagram
        </span>
      </Chip>
      <Chip
        left={674.6}
        top={549}
        width={132}
        height={44}
        onClick={() => setPlatforms((prev) => toggleFrom(prev, "Youtube"))}
        className={`gap-[5px] ${platforms.includes("Youtube") ? "bg-black/90" : "border border-black/[0.06] bg-white"}`}
      >
        <img src={youtube} alt="Youtube" className="h-[16px] w-[23px]" />
        <span className={`text-[16px] font-light ${platforms.includes("Youtube") ? "text-white/[0.99]" : "text-black"}`}>
          Youtube
        </span>
      </Chip>

      {/* ---------- Brand Name ---------- */}
      <Field
        label="Brand Name"
        labelTop={611}
        inputTop={632.5}
        inputH={47}
        leftPad={20}
        placeholder="name"
        phClassName="font-light text-black/60"
      />

      {/* ---------- Brand's Website ---------- */}
      <span
        style={{ position: "absolute", left: 418, top: 696 }}
        className="text-[14px] font-normal leading-[16px] text-black/70"
      >
        Brand’s Website
      </span>
      <div
        style={{ position: "absolute", left: 418, top: 719, width: 352, height: 44 }}
        className="rounded-full border border-black/[0.06] bg-white"
      >
        <span style={{ position: "absolute", left: 14, top: 10 }} className="text-[16px] font-light leading-[24px] text-black">
          http://
        </span>
        <div style={{ position: "absolute", left: 71, top: 0, width: 1, height: 44 }} className="bg-black/[0.08]" />
        <span
          style={{ position: "absolute", left: 85, top: 10 }}
          className="text-[16px] font-light leading-[24px] text-[#7F7E7F]"
        >
          www.website.com
        </span>
        <AlertCircle
          style={{ position: "absolute", left: 288, top: 14 }}
          className="h-[16px] w-[16px] text-black/25"
          strokeWidth={1.5}
        />
      </div>

      {/* ---------- No. of creators ---------- */}
      <Field
        label="No. of creators"
        labelTop={781}
        inputTop={802.5}
        inputH={47}
        leftPad={20}
        placeholder="Number of creators"
        phClassName="font-light text-black/50"
      />

      {/* ---------- Campaign budget ---------- */}
      <Field
        label="Campaign budget"
        labelTop={866}
        inputTop={889}
        leftPad={26}
        placeholder="₹  e.g. 5000"
        phClassName="font-normal text-black/70"
      />

      {/* ---------- Target Location ---------- */}
      <span
        style={{ position: "absolute", left: 418, top: 951 }}
        className="text-[14px] font-normal leading-[16px] text-black/70"
      >
        Target Location
      </span>
      <Chip left={418} top={974} width={129} height={44} className="gap-[6px] border border-black/[0.06] bg-[#FEFCFF]">
        <Navigation className="h-[18px] w-[18px] text-black" strokeWidth={1.5} />
        <span className="text-[16px] font-light text-black">Location</span>
      </Chip>
      <div
        style={{ position: "absolute", left: 561.8, top: 974, width: 112, height: 44 }}
        className="flex items-center justify-between rounded-full border border-black/[0.06] bg-white pl-[13px] pr-[15px]"
      >
        <span className="font-inter text-[16px] font-light text-black/60">India</span>
        <X className="h-[14px] w-[14px] text-black/55" strokeWidth={1.6} />
      </div>

      {/* ---------- No of Creators ---------- */}
      <Field
        label="No of Creators"
        labelTop={1036}
        inputTop={1058}
        leftPad={17}
        placeholder="Number of creators"
        phClassName="font-light text-black/60"
      />

      {/* ---------- Deliverables per creator ---------- */}
      <Field
        label="Deliverables per creator"
        labelTop={1120}
        inputTop={1143}
        leftPad={20}
        placeholder="e.g., 2 Reels, 1 Story"
        phClassName="font-light text-black/60"
      />
      <RoundBtn left={735} top={1152}>
        <Plus className="h-[15px] w-[15px] text-white/90" strokeWidth={2.4} />
      </RoundBtn>

      {/* ---------- Follower range ---------- */}
      <Field
        label="Follower range"
        labelTop={1205}
        inputTop={1231}
        leftPad={17}
        placeholder="range"
        phClassName="font-light text-black/60"
      />

      {/* ---------- Visit Include ---------- */}
      <Field
        label="Visit Include"
        labelTop={1293}
        inputTop={1316}
        leftPad={17}
        placeholder="no"
        phClassName="font-light text-black/60"
      />

      {/* ---------- Event Date & Time ---------- */}
      <Field
        label="Event Date & Time"
        labelTop={1378}
        inputTop={1405}
        leftPad={14}
        placeholder="Date"
        phClassName="font-light text-black/60"
      />
      <RoundBtn left={735} top={1416}>
        <Calendar className="h-[13px] w-[13px] text-white" strokeWidth={1.8} />
      </RoundBtn>

      {/* ---------- Schedule call back ---------- */}
      <Field
        label="Schedule call back"
        labelTop={1467}
        inputTop={1494}
        leftPad={14}
        placeholder="Time"
        phClassName="font-light text-black/60"
      />
      <RoundBtn left={735} top={1505}>
        <Calendar className="h-[13px] w-[13px] text-white" strokeWidth={1.8} />
      </RoundBtn>

      {/* ---------- Description ---------- */}
      <Field
        label="Description"
        labelTop={1556}
        inputTop={1579}
        leftPad={17}
        placeholder="Enter a description of your requirement"
        phClassName="font-light text-black/60"
      />

      {/* ---------- Mark as urgent ---------- */}
      <span
        onClick={() => setUrgent((v) => !v)}
        style={{ position: "absolute", left: 418, top: 1664, width: 26, height: 26 }}
        className="flex items-center justify-center rounded-[8.67px] border border-black/[0.12] bg-white cursor-pointer"
      >
        {urgent && <Check className="h-[16px] w-[16px] text-black" strokeWidth={2.2} />}
      </span>
      <span
        onClick={() => setUrgent((v) => !v)}
        style={{ position: "absolute", left: 450, top: 1665 }}
        className="text-[20px] font-light leading-[25px] text-black cursor-pointer"
      >
        Mark as urgent
      </span>
    </>
  );
}
