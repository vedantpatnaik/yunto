import type { ReactNode } from "react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreate } from "@/api/hooks";
import {
  Search,
  ChevronDown,
  Users,
  Eye,
  Heart,
  Star,
  Sparkles,
  Activity,
  IndianRupee,
  ArrowUpRight,
  Check,
  RotateCcw,
  Plus,
  Instagram,
  MapPin,
  X,
} from "lucide-react";

/**
 * Super Admin — Add Creator (creator-selection sub-flow of a lead/campaign).
 * Exact reconstruction of Figma frame 5055:43604 ("add creator"), 1440×1024.
 *
 * CLEAN build: the captured frame carried the TopBar profile popup + 50%-opacity
 * dim scrim — those sibling nodes are intentionally skipped and the underlying page
 * is rebuilt at full opacity. TopBar + Sidebar are provided by AppShell, so this
 * returns page content only.
 *
 * This is the "select creators to add" variant of the Creators screen: a large
 * CREATORS title + "My Creators" dropdown, a Recommended/All creator grid inside a
 * rounded panel, the shared filter sidebar, and a floating bottom selection bar.
 */

/* ------------------------------ primitives ----------------------------- */
function Stat({ icon: Icon, iconClass, children }: { icon: LucideIcon; iconClass: string; children: ReactNode }) {
  return (
    <span className="flex h-[24px] items-center gap-[3px] whitespace-nowrap rounded-[12px] bg-white px-[6px] text-[10px] text-ink/80">
      <Icon className={`h-[13px] w-[13px] ${iconClass}`} strokeWidth={1.7} />
      {children}
    </span>
  );
}

function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`flex h-[28px] items-center justify-center gap-[4px] whitespace-nowrap rounded-[20px] px-[8px] text-[12px] ${className}`}>
      {children}
    </span>
  );
}

function CheckBox({ on }: { on?: boolean }) {
  return (
    <span className="flex h-[16px] w-[16px] items-center justify-center rounded-[3px] border border-[#3A3A3A]">
      {on && <Check className="h-[11px] w-[11px] text-black" strokeWidth={2.6} />}
    </span>
  );
}

function CreatorCard({ listed }: { listed: boolean }) {
  return (
    <div
      className="relative h-[193px] w-[266px] rounded-[12px]"
      style={{
        backgroundImage:
          "linear-gradient(#F5F5F5,#F5F5F5),linear-gradient(135deg,#BC9733,#EFDB74,#F7EF8A,#D1AB46,#E4BE58)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        border: "1px solid transparent",
      }}
    >
      {/* avatar + fire */}
      <div className="absolute left-[8px] top-[6px] h-[36px] w-[36px] rounded-full bg-[linear-gradient(135deg,#F6C99A_0%,#B26AD6_100%)] ring-2 ring-[#E4BE58]" />
      <span className="absolute left-[30px] top-[29px] text-[13px] leading-none">🔥</span>

      {/* name + handle */}
      <div className="absolute left-[51px] top-[10px] text-[12px] leading-[15px] text-ink/90">Leena Sharma</div>
      <div className="absolute left-[51px] top-[26px] text-[8px] leading-[13px] text-ink/70">@leenabliss</div>

      {/* Delhi pill */}
      <div className="absolute left-[163px] top-[8px] flex h-[24px] items-center gap-[2px] rounded-[12px] bg-white px-[5px]">
        <span className="text-[10px] leading-none">📍</span>
        <span className="text-[10px] text-ink">Delhi</span>
      </div>

      {/* arrow button */}
      <div className="absolute left-[234px] top-0 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </div>

      {/* stat row 1 */}
      <div className="absolute left-[10px] top-[51px] flex gap-[3px]">
        <Stat icon={Users} iconClass="text-ink">1.2M</Stat>
        <Stat icon={Eye} iconClass="text-[#2CC37F]">900k Avg. views</Stat>
        <Stat icon={Heart} iconClass="text-[#EC4899]">4.5% ER</Stat>
      </div>

      {/* stat row 2 */}
      <div className="absolute left-[10px] top-[82px] flex gap-[3px]">
        <Stat icon={Star} iconClass="fill-[#FDD835] text-[#FDD835]">4.8 Stars</Stat>
        <Stat icon={Eye} iconClass="text-[#2CC37F]">0.23p CPV</Stat>
        <Stat icon={Sparkles} iconClass="fill-[#603CFF] text-[#603CFF]">0% Match</Stat>
      </div>

      {/* performance */}
      <span className="absolute left-[8px] top-[112px] text-[9px] text-ink/70">Performance</span>
      <div
        className="absolute left-[8px] top-[130px] flex h-[32px] w-[242px] items-center rounded-[18px] px-[12px]"
        style={{
          backgroundImage:
            "linear-gradient(#fff,#fff),linear-gradient(90deg,#FF4B55 0%,#B94BC9 55%,#603CFF 100%)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          border: "1px solid transparent",
        }}
      >
        <Activity className="h-[13px] w-[13px] text-[#FF4B55]" strokeWidth={2} />
        <span className="ml-[3px] text-[10px] font-medium text-ink">+35% above avg</span>
        <IndianRupee className="ml-[10px] h-[12px] w-[12px] text-[#FF4B55]" strokeWidth={2} />
        <span className="ml-[4px] text-[10px] font-medium text-ink">Suggestion:</span>
        <span className="ml-[3px] text-[10px] font-medium text-[#FF4B55]">Increase</span>
      </div>

      {/* footer: listed state + checkbox */}
      <div className="absolute left-[8px] top-[167px] flex items-center gap-[3px]">
        <span className={`h-[8px] w-[8px] rounded-full ${listed ? "bg-[#34C759]" : "bg-[#868686]"}`} />
        <span className="text-[12px] font-light text-ink/70">{listed ? "Listed" : "Unlisted"}</span>
      </div>
      <div className="absolute left-[240px] top-[167px] flex h-[15px] w-[15px] items-center justify-center rounded-[5px] border border-[#C9C9C9] bg-white">
        <Check className="h-[10px] w-[10px] text-black" strokeWidth={2.6} />
      </div>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
const REC_CARDS: boolean[] = [false, true, true];
const ALL_CARDS: boolean[] = [false, true, true];

/** Parse counts like "1.2M" / "900k" / "500" / "0 - 500" into a number. */
function parseCount(v: string): number {
  const m = v.trim().toLowerCase().match(/^([\d.]+)\s*([mk])?/);
  if (!m) return 0;
  const num = parseFloat(m[1]);
  if (Number.isNaN(num)) return 0;
  const mult = m[2] === "m" ? 1e6 : m[2] === "k" ? 1e3 : 1;
  return Math.round(num * mult);
}

export default function AddCreatorPage() {
  const navigate = useNavigate();
  const create = useCreate("creators");

  const [followers, setFollowers] = useState("");
  const [location, setLocation] = useState("");
  const [niche, setNiche] = useState("");
  const [avgViews, setAvgViews] = useState("");

  async function handleAdd() {
    try {
      await create.mutateAsync({
        name: niche.trim() || "New Creator",
        handle: "",
        followers: parseCount(followers),
        avgViews: parseCount(avgViews),
        location,
        niche,
        listed: false,
        engagementRate: 0,
        stars: 0,
        cpv: 0,
      });
      navigate("/creators");
    } catch {
      // swallow: keep the button responsive even if the request fails
    }
  }

  return (
    <>
      {/* ------------------------- background panels ------------------------- */}
      {/* Filters panel */}
      <div
        className="absolute left-[1090px] top-[247px] h-[1005px] w-[343px] rounded-[24px] border border-[#D6D6D6]"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.51) 0%, rgba(209,189,245,0.51) 100%)" }}
      />
      {/* Cards panel outline */}
      <div className="absolute left-[260px] top-[300px] h-[747px] w-[826px] rounded-[24px] border border-[#D9D9D9]" />

      {/* ------------------------------ title area ------------------------------ */}
      <h1 className="absolute left-[272px] top-[160px] text-[40px] font-normal leading-none tracking-[0.5px] text-ink">
        CREATORS
      </h1>
      {/* My Creators dropdown */}
      <div className="absolute left-[278px] top-[238px] flex w-[258px] items-center border-b border-[#CDCDCD] pb-[11px]">
        <span className="text-[34px] font-normal leading-none text-ink">My Creators</span>
        <ChevronDown className="ml-auto h-[24px] w-[24px] text-ink" strokeWidth={2} />
      </div>

      {/* --------------------------- top toolbar (right) --------------------------- */}
      {/* search circle */}
      <div className="absolute left-[686px] top-[158px] flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#F2F0F7]">
        <Search className="h-[22px] w-[22px] text-ink" strokeWidth={1.8} />
      </div>
      {/* All 92,000 */}
      <div className="absolute left-[742px] top-[158px] flex h-[48px] w-[150px] items-center justify-center rounded-[24px] bg-black">
        <span className="text-[20px] font-extralight text-white">All 92,000</span>
      </div>
      {/* selected count */}
      <div className="absolute left-[900px] top-[158px] flex h-[48px] w-[72px] items-center justify-center gap-[4px] rounded-[24px] bg-white">
        <Users className="h-[22px] w-[22px] text-ink" strokeWidth={1.7} />
        <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#20A271] text-[10px] font-normal text-white">4</span>
      </div>
      {/* listed toggle */}
      <div className="absolute left-[983px] top-[158px] flex h-[48px] w-[162px] items-center rounded-[24px] bg-white pl-[14px] pr-[12px]">
        <span className="text-[20px] font-extralight text-ink">listed</span>
        <div className="relative ml-auto h-[28px] w-[64px] rounded-full bg-[rgba(120,120,120,0.2)]">
          <div className="absolute left-[2px] top-[2px] h-[24px] w-[24px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
        </div>
      </div>
      {/* filters reset button (far right) */}
      <div className="absolute left-[1385px] top-[247px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white">
        <RotateCcw className="h-[16px] w-[16px] text-ink" strokeWidth={1.6} />
      </div>

      {/* --------------------- TAT / Estimate / selected row --------------------- */}
      {/* TAT Estimate box */}
      <div className="absolute left-[606px] top-[240px] h-[58px] w-[130px] rounded-[16px] bg-[#F2F1F6] px-[16px] pt-[12px]">
        <div className="text-[12px] font-light leading-none text-ink/55">TAT Estimate</div>
        <div className="mt-[7px] text-[18px] font-semibold leading-none text-ink">1 Day</div>
      </div>
      {/* Estimate Cost box */}
      <div className="absolute left-[745px] top-[240px] h-[58px] w-[135px] rounded-[16px] bg-[#F2F1F6] px-[16px] pt-[12px]">
        <div className="text-[12px] font-light leading-none text-ink/55">Estimate Cost</div>
        <div className="mt-[7px] text-[18px] font-semibold leading-none text-[#1E9E5A]">₹2,50,000</div>
      </div>
      {/* 1 selected */}
      <div className="absolute left-[898px] top-[249px] flex h-[36px] items-center gap-[7px]">
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border border-[#C9C9C9] bg-white">
          <Check className="h-[11px] w-[11px] text-black" strokeWidth={2.6} />
        </span>
        <span className="text-[14px] font-light text-ink">1 selected</span>
      </div>

      {/* --------------------------- creator grid --------------------------- */}
      <h2 className="absolute left-[286px] top-[322px] text-[24px] font-normal leading-none text-ink">
        Recommended Creators
      </h2>
      <div className="absolute left-[276px] top-[354px] flex gap-x-[5px]">
        {REC_CARDS.map((listed, i) => (
          <CreatorCard key={i} listed={listed} />
        ))}
      </div>

      <h2 className="absolute left-[286px] top-[566px] text-[36px] font-normal leading-none text-ink">
        All Creators
      </h2>
      <div className="absolute left-[276px] top-[620px] flex gap-x-[5px]">
        {ALL_CARDS.map((listed, i) => (
          <CreatorCard key={i} listed={listed} />
        ))}
      </div>

      {/* ---------------------------- filters panel ---------------------------- */}
      {/* Filters title */}
      <div className="absolute left-[1102px] top-[443px] text-[24px] font-normal text-slate900">Filters</div>

      {/* Choose Service */}
      <div className="absolute left-[1101px] top-[480px] text-[14px] font-normal text-ink/70">Choose Service</div>
      <div className="absolute left-[1101px] top-[507px] flex gap-[9px]">
        <Tag className="w-[70px] bg-[#FEFCFF] text-ink/70">Barter</Tag>
        <Tag className="w-[70px] bg-black text-white">Paid</Tag>
      </div>

      {/* Platform */}
      <div className="absolute left-[1101px] top-[548px] text-[14px] font-normal text-ink/70">Platform</div>
      <div className="absolute left-[1101px] top-[575px] flex gap-[9px]">
        <Tag className="w-[70px] bg-[#FEFCFF] text-ink/70">
          <Plus className="h-[13px] w-[13px]" strokeWidth={1.8} />
          Add
        </Tag>
        <Tag className="w-[103px] bg-[#FEFCFF] font-light text-ink/70">
          <Instagram className="h-[15px] w-[15px] text-[#E4405F]" strokeWidth={1.8} />
          Instagram
        </Tag>
      </div>

      {/* Deliverables */}
      <div className="absolute left-[1101px] top-[616px] text-[14px] font-normal text-ink/70">Deliverables</div>
      <div className="absolute left-[1101px] top-[643px] flex gap-[9px]">
        <Tag className="w-[70px] bg-[#FEFCFF] text-black">
          <Plus className="h-[13px] w-[13px]" strokeWidth={1.8} />
          <span className="underline decoration-1 underline-offset-2">1 Reel</span>
        </Tag>
        <Tag className="w-[70px] bg-[#FEFCFF] text-ink/70">
          <Plus className="h-[13px] w-[13px]" strokeWidth={1.8} />
          Story
        </Tag>
        <Tag className="w-[70px] bg-[#FEFCFF] text-black">
          <Plus className="h-[13px] w-[13px]" strokeWidth={1.8} />
          <span className="underline decoration-1 underline-offset-2">1 Post</span>
        </Tag>
      </div>

      {/* Niche */}
      <div className="absolute left-[1101px] top-[684px] text-[14px] font-normal text-ink/70">Niche</div>
      <div className="absolute left-[1101px] top-[711px] flex gap-[9px]">
        <Tag className="w-[70px] bg-[#FEFCFF] text-ink/70">
          <Plus className="h-[13px] w-[13px]" strokeWidth={1.8} />
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Add"
            className="w-full bg-transparent text-[12px] text-ink/70 outline-none placeholder:text-ink/70"
          />
        </Tag>
        <Tag className="w-[35px] bg-black font-light text-white">All</Tag>
      </div>

      {/* Follower Range */}
      <div className="absolute left-[1101px] top-[752px] text-[14px] font-normal text-ink/70">Follower Range</div>
      <input
        value={followers}
        onChange={(e) => setFollowers(e.target.value)}
        placeholder="0 - 500"
        className="absolute left-[1101px] top-[780px] w-[312px] bg-transparent text-right text-[12px] font-medium text-ink/70 outline-none placeholder:text-ink/70"
      />
      <div className="absolute left-[1101px] top-[802px] h-[9px] w-[312px] rounded-full bg-white">
        <div className="h-[9px] w-[47px] rounded-full bg-[#2E2E2E]" />
      </div>
      <div className="absolute left-[1139px] top-[797px] h-[18px] w-[18px] rounded-full bg-black" />

      {/* Location */}
      <div className="absolute left-[1101px] top-[824px] text-[14px] font-normal text-ink/70">Location</div>
      <div className="absolute left-[1101px] top-[849px] flex gap-[9px]">
        <Tag className="w-[87px] bg-[#FEFCFF] text-ink/70">
          <MapPin className="h-[14px] w-[14px]" strokeWidth={1.6} />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="location"
            className="w-full bg-transparent text-[12px] text-ink/70 outline-none placeholder:text-ink/70"
          />
        </Tag>
        <Tag className="w-[76px] bg-white font-light text-black">
          Delhi
          <X className="h-[12px] w-[12px]" strokeWidth={1.8} />
        </Tag>
      </div>

      {/* Gender */}
      <div className="absolute left-[1101px] top-[890px] text-[14px] font-normal text-ink/70">Gender</div>
      <div className="absolute left-[1101px] top-[918px] flex items-center gap-[15px]">
        <span className="flex items-center gap-[3px]">
          <CheckBox on />
          <span className="text-[12px] text-ink">Female</span>
        </span>
        <span className="flex items-center gap-[3px]">
          <CheckBox />
          <span className="text-[12px] font-light text-ink/70">Male</span>
        </span>
        <span className="flex items-center gap-[3px]">
          <CheckBox />
          <span className="text-[12px] font-light text-ink/70">Others</span>
        </span>
      </div>

      {/* Average Views */}
      <div className="absolute left-[1101px] top-[948px] text-[14px] font-normal text-ink/70">Average Views</div>
      <div className="absolute left-[1101px] top-[972px] flex gap-[9px]">
        <Tag className="w-[70px] bg-[#FEFCFF] text-ink/70">
          <Eye className="h-[14px] w-[14px]" strokeWidth={1.6} />
          <input
            value={avgViews}
            onChange={(e) => setAvgViews(e.target.value)}
            placeholder="Add"
            className="w-full bg-transparent text-[12px] text-ink/70 outline-none placeholder:text-ink/70"
          />
        </Tag>
        <Tag className="w-[76px] bg-white font-light text-black">
          500k
          <X className="h-[12px] w-[12px]" strokeWidth={1.8} />
        </Tag>
      </div>

      {/* By Age */}
      <div className="absolute left-[1101px] top-[1014px] text-[14px] font-normal text-ink/70">By Age</div>

      {/* --------------------------- bottom selection bar --------------------------- */}
      <div className="absolute left-[417px] top-[862px] h-[66px] w-[512px] rounded-full bg-black">
        {/* checkbox */}
        <span className="absolute left-[15px] top-[20px] flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-white/95">
          <Check className="h-[15px] w-[15px] text-black" strokeWidth={2.6} />
        </span>
        {/* 4 selected */}
        <span className="absolute left-[48px] top-[23px] whitespace-nowrap text-[20px] leading-none text-white/70">
          <span className="font-semibold text-white">4</span> selected
        </span>
        {/* TAT */}
        <div className="absolute left-[143px] top-[17px]">
          <div className="text-[11px] font-light leading-none text-white/50">TAT Estimate</div>
          <div className="mt-[6px] text-[16px] font-semibold leading-none text-white">1 Day</div>
        </div>
        {/* Estimate */}
        <div className="absolute left-[275px] top-[17px]">
          <div className="text-[11px] font-light leading-none text-white/50">Estimate Cost</div>
          <div className="mt-[6px] text-[16px] font-semibold leading-none text-[#3BD07C]">₹2,50,000</div>
        </div>
        {/* Done */}
        <button
          onClick={handleAdd}
          disabled={create.isPending}
          className="absolute right-[9px] top-[10px] flex h-[46px] w-[100px] items-center justify-center rounded-full bg-[#C4C4C4]"
        >
          <span className="text-[22px] font-normal text-ink">Done</span>
        </button>
      </div>
    </>
  );
}
