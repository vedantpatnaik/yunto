import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Plus,
  Search,
  UserRound,
  Trash2,
  ArrowUpRight,
  Phone,
  Pencil,
  ChevronUp,
  Instagram,
  Video,
  Aperture,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";
import { useLeads, useConvertLead } from "@/api/hooks";

/**
 * Super Admin — New Lead detail.
 * Exact reconstruction of Figma frame 6396:10380 ("Super Admin- detail New leads"), 1440×1024.
 * CLEAN underlying page: the "Edit Lead" modal (6390:36025) and dim scrim (6396:10766) are skipped.
 */

/* ------------------------------ primitives ----------------------------- */
function CircleIcon({
  x,
  y,
  size,
  icon: Icon,
  iconSize,
  bg = "bg-white",
  color = "text-black",
  stroke = 1.6,
  onClick,
}: {
  x: number;
  y: number;
  size: number;
  icon: LucideIcon;
  iconSize: number;
  bg?: string;
  color?: string;
  stroke?: number;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className={`absolute flex items-center justify-center rounded-full ${bg}${
        onClick ? " cursor-pointer" : ""
      }`}
      style={{ left: x, top: y, width: size, height: size }}
    >
      <Icon className={color} style={{ width: iconSize, height: iconSize }} strokeWidth={stroke} />
    </span>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[30px] items-center rounded-full bg-white px-[9px] text-[12px] font-light text-[#121212]">
      {children}
    </span>
  );
}

/** Client Detail / Lead Source contact card. */
function ContactCard({
  x,
  w,
  label,
  name,
  actions,
}: {
  x: number;
  w: number;
  label: string;
  name: string;
  actions: ReactNode;
}) {
  return (
    <>
      <div
        className="absolute rounded-[13px] bg-white"
        style={{ left: x, top: 374, width: w, height: 53 }}
      />
      {/* avatar */}
      <span
        className="absolute rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]"
        style={{ left: x + 5, top: 384, width: 38, height: 38 }}
      />
      <div className="absolute" style={{ left: x + 53, top: 382 }}>
        <div className="text-[12px] leading-[13px] text-black/70">{label}</div>
        <div className="mt-[6px] text-[18px] leading-none text-black/90">{name}</div>
      </div>
      {actions}
    </>
  );
}

/** Message / Deliverables / Add Notes notch card. */
function SectionCard({
  x,
  title,
  addX,
  children,
}: {
  x: number;
  title: string;
  addX: number;
  children: ReactNode;
}) {
  return (
    <>
      <div
        className="absolute rounded-[12px] bg-[#F5F5F5]"
        style={{ left: x, top: 447, width: 258, height: 178 }}
      />
      <span
        className="absolute text-[12px] leading-[24px] text-black"
        style={{ left: x + 12, top: 452 }}
      >
        {title}
      </span>
      <CircleIcon x={addX} y={455} size={24} icon={Plus} iconSize={12} bg="bg-[#FEFCFF]" />
      {children}
    </>
  );
}

/* -------------------------------- page --------------------------------- */
export default function NewLeadDetailPage() {
  const navigate = useNavigate();
  const [statusOpen, setStatusOpen] = useState(true);
  const [sp] = useSearchParams();
  const id = sp.get("id");
  const convert = useConvertLead();
  const { data } = useLeads();
  const leads = data ?? [];
  const newLeads = leads.filter((l) => l.status === "NEW");
  const lead = leads.find((l) => l.id === id) ?? newLeads[0];
  return (
    <>
      {/* ============ card backgrounds ============ */}
      {/* main container */}
      <div className="absolute left-[261px] top-[301px] h-[334px] w-[838px] rounded-[24px] bg-[rgba(243,243,243,0.13)]" />
      {/* Follow Up card */}
      <div className="absolute left-[1109px] top-[301px] h-[234px] w-[295px] rounded-[12px] bg-white/60" />
      {/* Payment Summary card */}
      <div className="absolute left-[1109px] top-[553px] h-[397px] w-[295px] rounded-[12px] bg-[rgba(245,245,245,0.6)]" />
      {/* Creators card */}
      <div className="absolute left-[261px] top-[655px] h-[274px] w-[573px] rounded-[12px] bg-[rgba(245,245,245,0.6)]" />
      {/* Activity card */}
      <div className="absolute left-[863px] top-[656px] h-[275px] w-[236px] rounded-[12px] bg-[rgba(249,249,249,0.7)]" />

      {/* ============ header ============ */}
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black"
      >
        <ChevronLeft className="h-[22px] w-[22px] text-white" strokeWidth={1.8} />
      </span>
      <h1 className="absolute left-[284px] top-[231px] text-[34px] font-normal leading-none text-black">
        New Leads
      </h1>
      <span
        onClick={() => navigate("/leads")}
        className="absolute left-[538px] top-[235px] cursor-pointer text-[24px] font-normal leading-none text-black underline decoration-1 underline-offset-4"
      >
        {newLeads.length} Leads
      </span>

      {/* ============ main container content ============ */}
      {/* Assigned to / Rahul */}
      <span className="absolute left-[279px] top-[378px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-[#F4C1C1] text-[15px] text-[#B93636]">
        R
      </span>
      <div className="absolute left-[332px] top-[379px]">
        <div className="text-[12px] leading-[13px] text-black/70">Assigned to</div>
        <div className="mt-[6px] text-[24px] leading-none text-black/90">Rahul</div>
      </div>
      <span
        onClick={() => navigate("/people/assign-creators")}
        className="absolute left-[434px] top-[392px] flex h-[21.5px] cursor-pointer items-center gap-[5px] rounded-[13px] bg-black/90 px-[8px] text-[6.8px] font-light text-white"
      >
        Add
        <Plus className="h-[8.8px] w-[8.8px] text-white" strokeWidth={2} />
      </span>

      {/* avatar stack (5 tiles) */}
      <div className="absolute left-[777px] top-[314px] flex h-[32px] w-[111px] items-center gap-[4px] rounded-[18px] bg-white px-[12px]">
        {["#C8E6FF", "#FFD6E7", "#DCFF68", "#C8B3ED", "#FFC5BA"].map((c, i) => (
          <span
            key={i}
            className="h-[20px] w-[14px] rounded-[8px]"
            style={{ background: c }}
          />
        ))}
      </div>

      {/* info chips row */}
      <div className="absolute left-[278px] top-[314px] flex items-center gap-[9px]">
        <Chip>12 July</Chip>
        <Chip>{lead ? `${lead.peopleCount} Creators` : ""}</Chip>
        <Chip>{lead?.engagementRate ?? ""}</Chip>
        <Chip>{`Budget ₹${lead?.money ?? ""}`}</Chip>
        <Chip>{lead?.intent ?? ""}</Chip>
      </div>

      {/* Mark Status pill + edit */}
      <span
        onClick={() => setStatusOpen((v) => !v)}
        className="absolute left-[903px] top-[308px] flex h-[45px] w-[133px] cursor-pointer items-center gap-[4px] whitespace-nowrap rounded-[28px] bg-white/90 px-[12px] text-[14px] font-light text-black/[0.99]"
      >
        Mark Status
        <Plus className="h-[12px] w-[12px] text-black" strokeWidth={1.8} />
        <ChevronUp className="h-[12px] w-[12px] text-black" strokeWidth={2} />
      </span>
      <CircleIcon x={1042} y={308} size={45} icon={Pencil} iconSize={17} stroke={1.6} />

      {/* Client Detail card */}
      <ContactCard
        x={555}
        w={239}
        label="Client Detail"
        name={lead?.contactPerson ?? ""}
        actions={
          <>
            <CircleIcon x={733} y={391} size={23.9} icon={Phone} iconSize={15} stroke={1.6} />
            <img
              src={whatsapp}
              alt="WhatsApp"
              className="absolute h-[24px] w-[24px]"
              style={{ left: 762.5, top: 391 }}
            />
          </>
        }
      />

      {/* Lead Source card */}
      <ContactCard
        x={808}
        w={274}
        label="Lead Source"
        name="Leena Sharma"
        actions={
          <>
            <CircleIcon
              x={989}
              y={391}
              size={23.9}
              icon={ArrowUpRight}
              iconSize={14}
              stroke={1.7}
              onClick={() => navigate("/leads/detail")}
            />
            <CircleIcon x={1018.5} y={391} size={23.9} icon={Phone} iconSize={15} stroke={1.6} />
            <img
              src={whatsapp}
              alt="WhatsApp"
              className="absolute h-[24px] w-[24px]"
              style={{ left: 1048, top: 391 }}
            />
          </>
        }
      />

      {/* Message card */}
      <SectionCard x={278} title="Message" addX={502}>
        <div className="absolute left-[290px] top-[480px] h-[130px] w-[236px] rounded-[12px] bg-white" />
        <p className="absolute left-[296px] top-[486px] w-[219px] text-[12px] font-light leading-[20px] text-black/60">
          We are launching a new skincare product
        </p>
      </SectionCard>

      {/* Deliverables card */}
      <SectionCard x={551} title="Deliverables" addX={775}>
        <div className="absolute left-[563px] top-[485px] h-[127px] w-[236px] rounded-[12px] bg-white" />
        {/* deliverable chip */}
        <div className="absolute left-[570px] top-[491px] flex h-[36px] w-[128px] items-center gap-[10px] rounded-[12px] bg-white px-[4px]">
          <Instagram className="h-[16px] w-[16px] text-[#C837AB]" strokeWidth={1.8} />
          <div className="flex flex-col gap-[3px]">
            <span className="flex items-center gap-[5px] text-[12px] font-light leading-[9px] text-black/60">
              <Video className="h-[12px] w-[12px] text-black/70" strokeWidth={1.6} />
              1 Collab Reel
            </span>
            <span className="flex items-center gap-[5px] text-[12px] font-light leading-[9px] text-black/60">
              <Aperture className="h-[12px] w-[12px] text-black/70" strokeWidth={1.6} />
              2 Stories
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Add Notes card */}
      <SectionCard x={824} title="Add Notes" addX={1048}>
        <div className="absolute left-[836px] top-[485px] h-[130px] w-[236px] rounded-[12px] bg-white" />
        <div className="absolute left-[842px] top-[491px] flex w-[146px] items-center gap-[5px]">
          <span className="text-[12px] leading-[16px] text-black/70">Today</span>
          <span className="h-px flex-1 bg-black/15" />
        </div>
        <p className="absolute left-[842px] top-[512px] w-[226px] text-[12px] font-light leading-[20px] text-black/60">
          here comes your note
        </p>
      </SectionCard>

      {/* ============ Follow Up card ============ */}
      <span className="absolute left-[1119px] top-[309px] text-[12px] leading-[24px] text-black">
        Follow Up
      </span>
      <CircleIcon
        x={1376}
        y={301}
        size={28}
        icon={Plus}
        iconSize={16}
        stroke={1.6}
        onClick={() => navigate("/reminders")}
      />
      {/* inner white card */}
      <div className="absolute left-[1119px] top-[340px] h-[184px] w-[272px] rounded-[12px] bg-white" />
      {/* Today header */}
      <div className="absolute left-[1131px] top-[352px] flex w-[146px] items-center gap-[5px]">
        <span className="text-[12px] leading-[16px] text-black/70">Today</span>
        <span className="h-px flex-1 bg-black/15" />
      </div>
      {/* follow-up item */}
      <div
        onClick={() => navigate("/reminders")}
        className="absolute left-[1122px] top-[371px] flex h-[52px] w-[38px] cursor-pointer flex-col items-center justify-center rounded-[18px] bg-[#D8DDFF] text-center text-[15px] font-light leading-[16px] text-black"
      >
        <span>20</span>
        <span>Fri</span>
      </div>
      <div className="absolute left-[1166px] top-[376px] w-[166px]">
        <div className="text-[16px] leading-none text-black">Follow - Up Scheduled</div>
        <div className="mt-[8px] flex items-center gap-[4px]">
          <span className="h-[14px] w-[14px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
          <span className="text-[10.2px] leading-none text-black/90">{lead?.contactPerson ?? ""}</span>
        </div>
      </div>

      {/* ============ Payment Summary card ============ */}
      <span className="absolute left-[1121px] top-[566px] text-[12px] leading-[24px] text-black">
        Payment Summary
      </span>
      <CircleIcon
        x={1376}
        y={553}
        size={28}
        icon={ArrowUpRight}
        iconSize={16}
        stroke={1.7}
        onClick={() => navigate("/payments/paid")}
      />
      {/* inner white card */}
      <div className="absolute left-[1121px] top-[599px] h-[342px] w-[270px] rounded-[12px] bg-white" />
      <span className="absolute left-[1191px] top-[615px] w-[131px] text-center text-[16px] font-medium leading-none text-black">
        {lead?.brandName ?? "Brand Name"}
      </span>
      {/* Invoice coupon */}
      <div
        onClick={() => navigate("/invoices")}
        className="absolute left-[1141px] top-[652px] h-[52px] w-[230px] cursor-pointer rounded-[8px] border border-dashed border-black/25"
      >
        <span className="absolute -top-[6px] left-1/2 -translate-x-1/2 bg-white px-[6px] font-mono text-[9px] text-black">
          Invoice
        </span>
        <span className="absolute left-1/2 top-[19px] -translate-x-1/2 whitespace-nowrap font-mono text-[12.6px] font-bold text-black underline decoration-dashed underline-offset-2">
          Generate invoice
        </span>
      </div>
      {/* divider */}
      <div className="absolute left-[1133px] top-[718px] h-px w-[246px] bg-black/10" />
      {/* Brand Budget */}
      <div className="absolute left-[1133px] top-[732px] flex w-[246px] items-center justify-between">
        <span className="text-[13px] font-medium leading-[20px] text-black">Brand Budget</span>
        <span className="text-[12px] font-medium leading-[20px] text-black/50">₹{lead?.money ?? "-"}</span>
      </div>
      {/* Agency Fee coupon */}
      <div className="absolute left-[1141px] top-[806px] h-[51px] w-[230px] rounded-[8px] border border-dashed border-black/25">
        <span className="absolute -top-[6px] left-1/2 -translate-x-1/2 bg-white px-[6px] font-mono text-[9px] text-black">
          Agency Fee
        </span>
      </div>
      {/* Added + / 00% edit / ₹00.000 */}
      <div className="absolute left-[1148px] top-[825px] flex h-[22px] w-[117px] items-center rounded-[24px] bg-white pl-[7px]">
        <span className="flex h-[13px] w-[13px] items-center justify-center rounded-full bg-[#ECEAEA]">
          <Plus className="h-[7px] w-[7px] text-black" strokeWidth={2} />
        </span>
        <span className="ml-[9px] text-[12px] leading-none text-black">Added</span>
        <span className="ml-[13px] flex h-[22px] items-center gap-[4px] rounded-[24px] bg-white pl-[4px]">
          <span className="text-[12px] leading-none text-black/60">00%</span>
          <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#ECEAEA]">
            <Pencil className="h-[7px] w-[7px] text-black" strokeWidth={1.6} />
          </span>
        </span>
      </div>
      <span className="absolute left-[1313px] top-[826px] text-[12px] font-medium leading-[20px] text-black/50">
        ₹00.000
      </span>
      {/* divider */}
      <div className="absolute left-[1133px] top-[876px] h-px w-[246px] bg-black/10" />
      {/* Estimate Payout */}
      <div className="absolute left-[1133px] top-[892px] flex w-[246px] items-center justify-between">
        <span className="text-[13px] font-medium leading-[20px] text-black">Estimate Payout</span>
        <span className="text-[15px] font-semibold leading-[20px] text-[#76D097]">₹2,70,000</span>
      </div>

      {/* ============ Creators card ============ */}
      <span className="absolute left-[271px] top-[663px] text-[12px] leading-[24px] text-black">
        Creators
      </span>
      <CircleIcon
        x={660}
        y={662}
        size={28}
        icon={Search}
        iconSize={14}
        stroke={1.7}
        onClick={() => navigate("/search")}
      />
      <CircleIcon
        x={696}
        y={662}
        size={28}
        icon={UserRound}
        iconSize={15}
        stroke={1.6}
        onClick={() => navigate("/creators/find")}
      />
      <CircleIcon x={732} y={662} size={28} icon={Trash2} iconSize={15} stroke={1.6} />
      <CircleIcon
        x={769}
        y={662}
        size={28}
        icon={Plus}
        iconSize={14}
        stroke={1.7}
        onClick={() => navigate("/leads/add-creator")}
      />
      <CircleIcon
        x={819}
        y={662}
        size={28}
        icon={ArrowUpRight}
        iconSize={16}
        stroke={1.7}
        onClick={() => navigate("/creators")}
      />

      {/* ============ Activity card ============ */}
      <span className="absolute left-[873px] top-[664px] text-[12px] leading-[24px] text-black">
        Activity
      </span>
      <div className="absolute left-[873px] top-[694px] h-[225px] w-[212px] rounded-[12px] bg-white" />
      <div className="absolute left-[879px] top-[702px] flex w-[146px] items-center gap-[5px]">
        <span className="text-[12px] leading-[16px] text-black/70">Today</span>
        <span className="h-px flex-1 bg-black/15" />
      </div>

      {/* ============ Mark Status dropdown ============ */}
      {statusOpen && (
        <div className="absolute left-[910px] top-[155px] w-[169px] rounded-[10px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
          <div
            onClick={() => navigate("/leads")}
            className="flex h-[39px] cursor-pointer items-center px-[13px] text-[15px] font-light text-black"
          >
            Mark Dead
          </div>
          <div className="h-px bg-black/10" />
          <div
            onClick={() => navigate("/leads")}
            className="flex h-[44px] cursor-pointer items-center px-[13px] text-[15px] font-light text-black"
          >
            Mark Delete
          </div>
          <div className="h-px bg-black/10" />
          <div
            onClick={() => {
              if (id) {
                convert.mutate(id);
              }
              navigate("/leads/connected");
            }}
            className="flex h-[42px] cursor-pointer items-center px-[13px] text-[15px] font-light text-black"
          >
            Mark Converted
          </div>
        </div>
      )}
    </>
  );
}
