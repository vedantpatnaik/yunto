import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Sparkles,
  Trash2,
  Phone,
  ArrowUpRight,
  Mail,
  Tag,
  ChevronDown,
  FileText,
  Link,
  Paperclip,
  Users,
  Globe,
  Star,
  Flame,
  Plus,
  Wifi,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";

/**
 * Agency — Campaign / Lead detail (mobile).
 * Exact reconstruction of Figma frame 4100:59321 ("campaign"), 375×1361,
 * rendered inside the 390px MobileFrame. Coordinates are frame-relative
 * (Figma origin subtracted); the lavender card lives at frame (15,136).
 */

/* ------------------------------ primitives ----------------------------- */
function Round({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-center justify-center rounded-full ${className}`}>{children}</div>;
}

function Stat({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-[2px]">
      <Icon className="h-[13px] w-[13px] text-black/80" strokeWidth={1.6} />
      <span className="whitespace-nowrap text-[8.7px] font-medium text-black/80">{label}</span>
    </div>
  );
}

function CreatorRow({ top }: { top: number }) {
  return (
    <div
      className="absolute left-[12px] h-[64px] w-[293px] rounded-[10px] border-[0.85px] border-black bg-[#fbfffc] shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
      style={{ top }}
    >
      {/* avatar */}
      <div className="absolute left-[5px] top-[9px] h-[27px] w-[27px] rounded-full border-[1.7px] border-[#fcfbd2] bg-gradient-to-br from-[#F1FFC3] to-[#C8B3ED]" />
      {/* fire badge */}
      <Flame className="absolute left-[18px] top-[27px] h-[13px] w-[13px] text-[#FB8C00]" strokeWidth={1.5} />
      {/* name */}
      <div className="absolute left-[35px] top-[9px] flex items-baseline gap-[6px]">
        <span className="text-[10.2px] font-medium leading-[15px] text-black/90">Leena Sharma</span>
        <span className="text-[6.8px] tracking-[0.3px] text-black/70">@leenabliss</span>
      </div>
      {/* stats */}
      <div className="absolute left-[35px] top-[27px] h-[14px] w-[180px]">
        <div className="absolute left-0 top-0">
          <Stat icon={Users} label="1.2M" />
        </div>
        <div className="absolute left-[43px] top-0">
          <Stat icon={Globe} label="900k views" />
        </div>
        <div className="absolute left-[116px] top-0">
          <Stat icon={Star} label="89 leads" />
        </div>
      </div>
      {/* progress */}
      <div className="absolute left-[38px] top-[51px] h-[1.7px] w-[166px] rounded-full bg-[#bababa]">
        <div className="h-full w-[40px] rounded-full bg-black" />
      </div>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function AgencyCampaignPage() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-white font-sans" style={{ height: 1361 }}>
      {/* decorative background tints */}
      <div className="absolute left-[-30px] top-[70px] h-[210px] w-[210px] rounded-full bg-[#c9d0ff] opacity-40 blur-[60px]" />
      <div className="absolute left-[6px] top-[30px] h-[180px] w-[180px] rounded-full bg-[#e0e4ff] opacity-30 blur-[55px]" />
      <div className="absolute right-[-50px] top-[600px] h-[320px] w-[320px] rounded-full bg-[#ffd3d0] opacity-40 blur-[75px]" />

      {/* status bar */}
      <div className="absolute left-0 top-[17px] h-[44px] w-[375px]">
        <span className="absolute left-[24px] top-[13px] text-[15px] font-semibold tracking-[-0.3px] text-black">19:56</span>
        <div className="absolute right-[16px] top-[15px] flex items-center gap-[6px]">
          <span className="flex h-[11px] items-end gap-[1.5px]">
            <span className="h-[4px] w-[3px] rounded-[1px] bg-black" />
            <span className="h-[6px] w-[3px] rounded-[1px] bg-black" />
            <span className="h-[8px] w-[3px] rounded-[1px] bg-black" />
            <span className="h-[11px] w-[3px] rounded-[1px] bg-black" />
          </span>
          <Wifi className="h-[15px] w-[15px] text-black" strokeWidth={2} />
          <span className="relative flex h-[11px] w-[22px] items-center rounded-[3px] border border-black/35 px-[1px]">
            <span className="h-[7px] w-[16px] rounded-[1px] bg-black" />
            <span className="absolute -right-[2.5px] h-[4px] w-[1.4px] rounded-r bg-black/40" />
          </span>
        </div>
      </div>

      {/* header */}
      <div className="absolute left-0 top-[70px] h-[54px] w-[375px] border-b border-[#717171]/60">
        <ArrowLeft className="absolute left-[16px] top-[13px] h-[24px] w-[24px] text-[#1b1b1c]" strokeWidth={2} />
        <span className="absolute left-[44px] top-[14px] text-[20px] font-medium text-[#1b1b1c]">Zostel Trip</span>
      </div>

      {/* ============================== card ============================== */}
      <div className="absolute left-[15px] top-[136px] h-[1208px] w-[343px] rounded-[16px] border border-black bg-[#d7dcff] shadow-[2px_2px_0px_#333]">
        {/* --- top tab row --- */}
        <Round className="absolute left-[11px] top-[18px] h-[48px] w-[48px] bg-white">
          <Sparkles className="h-[26px] w-[26px] text-black" strokeWidth={1.4} />
        </Round>
        <div className="absolute left-[67px] top-[27px] flex h-[30px] items-center rounded-[24px] bg-white px-[8px]">
          <span className="text-[12px] font-medium text-black">Barter</span>
        </div>
        <div className="absolute left-[137px] top-[30px] flex h-[27px] items-center rounded-[24px] bg-white px-[8px]">
          <span className="text-[12px] font-medium text-black">Converted</span>
        </div>
        <Round className="absolute left-[297px] top-[27px] h-[30px] w-[30px] bg-white">
          <Trash2 className="h-[18px] w-[18px] text-black" strokeWidth={1.5} />
        </Round>

        {/* --- name block --- */}
        <div className="absolute left-[11px] top-[76px] w-[220px]">
          <div className="text-[20px] font-medium leading-[24px] text-black/90">Priya Sharma</div>
          <div className="mt-[4px] flex items-center gap-[4px] text-[12px] text-black/70">
            <span>Zostel Trip</span>
            <span className="text-[10.2px] text-[#5d5d5d]">•</span>
            <span className="font-semibold">Budget ₹1.2L</span>
          </div>
        </div>

        {/* --- top call / whatsapp --- */}
        <div className="absolute left-[260px] top-[80px] flex items-center gap-[7px]">
          <Round className="h-[30px] w-[30px] bg-white">
            <Phone className="h-[16px] w-[16px] text-black/80" strokeWidth={1.6} />
          </Round>
          <img src={whatsapp} alt="WhatsApp" className="h-[30px] w-[30px]" />
        </div>

        {/* --- email / website chips --- */}
        <div className="absolute left-[11px] top-[130px] h-[32px] w-[320px]">
          <div className="absolute left-0 top-0 flex h-[32px] w-[154px] items-center justify-center gap-[5px] rounded-[14px] bg-[#b0bbff]">
            <Mail className="h-[15px] w-[15px] text-[#121212]" strokeWidth={1.6} />
            <span className="text-[10.2px] text-[#121212]">Sunil@gmail.com</span>
          </div>
          <div className="absolute right-0 top-0 flex h-[32px] w-[159px] items-center justify-center gap-[5px] rounded-[14px] bg-[#b0bbff]">
            <Tag className="h-[15px] w-[15px] text-black" strokeWidth={1.6} />
            <span className="text-[10.2px] text-black">www.bobbibrown.com</span>
          </div>
        </div>

        {/* --- Lead Info / Notes & Activity tabs --- */}
        <div className="absolute left-[11px] top-[179px] flex w-[320px] items-center justify-between">
          <div className="w-[162px] border-b-2 border-white pb-[4px] text-center">
            <span className="text-[15px] text-black">Lead Info</span>
          </div>
          <span className="w-[126px] text-center text-[15px] font-medium text-black">Notes &amp; Activity</span>
        </div>

        {/* --- Lead by bar --- */}
        <div className="absolute left-[11px] top-[222px] h-[52px] w-[320px] rounded-[8px] bg-white">
          <span className="absolute left-[16px] top-[16px] text-[16px] font-medium text-black">Lead by: Leena Sharma</span>
          <Round className="absolute left-[199px] top-[11px] h-[30px] w-[30px] border border-[#eaeaea] bg-[#f2f1f3]">
            <ArrowUpRight className="h-[15px] w-[15px] text-black/80" strokeWidth={1.8} />
          </Round>
          <Round className="absolute left-[239px] top-[11px] h-[30px] w-[30px] border border-[#eaeaea] bg-[#f2f1f3]">
            <Phone className="h-[15px] w-[15px] text-black/80" strokeWidth={1.6} />
          </Round>
          <img src={whatsapp} alt="WhatsApp" className="absolute left-[276px] top-[11px] h-[30px] w-[30px]" />
        </div>

        {/* --- Mark Converted (sits beneath the content stack, matching Figma) --- */}
        <div className="absolute left-[11px] top-[1047px] flex h-[48px] w-[320px] items-center justify-center rounded-[16px] border border-black bg-[#cdeed5] shadow-[3px_3px_0px_#333]">
          <span className="text-[15px] font-semibold text-[#333]">Mark Converted</span>
        </div>

        {/* --- content stack --- */}
        {/* Message */}
        <div className="absolute left-[11px] top-[285px] h-[92px] w-[321px] overflow-hidden rounded-[8px] bg-white">
          <span className="absolute left-[16px] top-[18px] text-[16px] font-medium text-black">Message</span>
          <ChevronDown className="absolute right-[16px] top-[16px] h-[18px] w-[18px] text-black/70" strokeWidth={1.6} />
          <p className="absolute left-[16px] top-[52px] w-[289px] text-[12px] leading-[20px] text-black/70">
            We are launching a new skincare product and...
          </p>
        </div>

        {/* Script */}
        <div className="absolute left-[11px] top-[389px] h-[187px] w-[320px] overflow-hidden rounded-[8px] bg-white">
          <span className="absolute left-[16px] top-[18px] text-[16px] font-medium text-black">Script</span>
          <ChevronDown className="absolute right-[15px] top-[16px] h-[18px] w-[18px] text-black/70" strokeWidth={1.6} />
          <p className="absolute left-[16px] top-[52px] w-[289px] text-[12px] leading-[20px] text-black/70">Here comes the scripts</p>
          <div className="absolute left-[16px] top-[94px] flex h-[33px] w-[289px] items-center gap-[6px] rounded-[12px] border-[0.5px] border-[#d9d9d9] bg-white px-[6px]">
            <FileText className="h-[19px] w-[19px] text-black/70" strokeWidth={1.4} />
            <span className="text-[10.2px] font-light text-black/70">Reference Doc.</span>
          </div>
          <div className="absolute left-[16px] top-[141px] flex h-[30px] w-[202px] items-center rounded-[12px] border-[0.5px] border-[#d9d9d9] bg-white px-[12px]">
            <span className="text-[12px] text-black">Add a comment</span>
          </div>
          <Round className="absolute left-[236px] top-[141px] h-[30px] w-[30px] border-[0.5px] border-[#d9d9d9]">
            <Paperclip className="h-[18px] w-[18px] text-black/70" strokeWidth={1.5} />
          </Round>
          <Round className="absolute left-[275px] top-[141px] h-[30px] w-[30px] border-[0.5px] border-[#d9d9d9]">
            <Link className="h-[16px] w-[16px] text-black/70" strokeWidth={1.5} />
          </Round>
        </div>

        {/* Creators */}
        <div className="absolute left-[11px] top-[588px] h-[283px] w-[321px] overflow-hidden rounded-[8px] bg-white">
          <span className="absolute left-[16px] top-[18px] text-[16px] font-medium text-black">Creators</span>
          <Round className="absolute left-[275px] top-[4px] h-[30px] w-[30px] border border-[#eaeaea] bg-[#f2f1f3]">
            <ArrowUpRight className="h-[15px] w-[15px] text-black/80" strokeWidth={1.8} />
          </Round>
          <CreatorRow top={60} />
          <CreatorRow top={131} />
          <CreatorRow top={202} />
        </div>

        {/* Deliverables */}
        <div className="absolute left-[11px] top-[883px] h-[52px] w-[321px] overflow-hidden rounded-[8px] bg-white">
          <span className="absolute left-[16px] top-[18px] text-[16px] font-medium text-black">Deliverables</span>
          <Round className="absolute left-[275px] top-[11px] h-[30px] w-[30px] border border-[#d4d4d4] bg-white">
            <Plus className="h-[18px] w-[18px] text-black" strokeWidth={2} />
          </Round>
        </div>

        {/* Add-ons */}
        <div className="absolute left-[11px] top-[947px] h-[52px] w-[321px] overflow-hidden rounded-[8px] bg-white">
          <div className="absolute left-[16px] top-[18px] flex items-center text-[16px] font-medium text-black">
            <span>Add - ons</span>
            <span className="px-[6px]">•</span>
            <span className="font-bold text-[#4ba36b]">₹7,000</span>
          </div>
          <ChevronDown className="absolute right-[16px] top-[20px] h-[18px] w-[18px] text-black/70" strokeWidth={1.6} />
        </div>

        {/* Payment Summary */}
        <div className="absolute left-[11px] top-[1011px] h-[102px] w-[321px] overflow-hidden rounded-[8px] bg-white shadow-[2px_2px_0px_#000]">
          <span className="absolute left-[16px] top-[16px] text-[16px] font-medium text-black">Payment Summary</span>
          <ChevronDown className="absolute right-[16px] top-[16px] h-[18px] w-[18px] text-black/70" strokeWidth={1.6} />
          <div className="absolute left-0 top-[50px] flex h-[52px] w-[321px] items-center justify-between bg-[#76d097] px-[11px]">
            <span className="text-[13px] font-medium text-black">Estimate Payout</span>
            <span className="text-[14px] font-bold text-white">₹1,13,000</span>
          </div>
        </div>

        {/* --- Follow Up (drawn last so it stays above the stack) --- */}
        <div className="absolute left-[11px] top-[1131px] flex h-[48px] w-[320px] items-center justify-center rounded-[16px] border border-black bg-[#ffbcb8] shadow-[3px_3px_0px_#333]">
          <span className="text-[15px] font-semibold text-[#333]">Follow Up</span>
        </div>

        {/* glassy inner shadow */}
        <div className="pointer-events-none absolute inset-0 rounded-[16px] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.4)]" />
      </div>
    </div>
  );
}
