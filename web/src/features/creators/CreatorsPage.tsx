import { useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreators, type Creator } from "@/api/hooks";

const compactN = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  : n >= 1_000 ? `${Math.round(n / 1_000)}k` : `${n}`;
import {
  ChevronLeft,
  Search,
  Users,
  Link2,
  FileSpreadsheet,
  ArrowUpRight,
  Eye,
  Heart,
  Star,
  Sparkles,
  Activity,
  IndianRupee,
  Check,
  RotateCcw,
  Plus,
  Instagram,
  MapPin,
  X,
  ChevronsUpDown,
} from "lucide-react";

/**
 * Super Admin — Creators / Stellar Talents screen.
 * Exact reconstruction of Figma frame 5953:50262 ("yunto creators"), 1440×1024.
 * Renders inside the AppShell (TopBar + Sidebar already present) — page content only.
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

function Tag({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <span onClick={onClick} className={`flex h-[28px] items-center justify-center gap-[4px] whitespace-nowrap rounded-[20px] px-[8px] text-[12px] ${className}`}>
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

function CreatorCard({ c }: { c: Creator }) {
  const navigate = useNavigate();
  const listed = c.listed ?? false;
  return (
    <div
      onClick={() => navigate(`/creators/detail?id=${c.id}`)}
      className="relative h-[193px] w-[266px] cursor-pointer rounded-[12px]"
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
      <div className="absolute left-[51px] top-[10px] max-w-[105px] truncate text-[12px] leading-[15px] text-ink/90">{c.name}</div>
      <div className="absolute left-[51px] top-[26px] text-[8px] leading-[13px] text-ink/70">{c.handle}</div>

      {/* location pill */}
      <div className="absolute left-[163px] top-[8px] flex h-[24px] items-center gap-[2px] rounded-[12px] bg-white px-[5px]">
        <span className="text-[10px] leading-none">📍</span>
        <span className="text-[10px] text-ink">{c.location ?? "India"}</span>
      </div>

      {/* arrow button */}
      <div className="absolute left-[234px] top-0 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </div>

      {/* stat row 1 */}
      <div className="absolute left-[10px] top-[51px] flex gap-[3px]">
        <Stat icon={Users} iconClass="text-ink">{compactN(c.followers)}</Stat>
        <Stat icon={Eye} iconClass="text-[#2CC37F]">{compactN(c.avgViews)} Avg. views</Stat>
        <Stat icon={Heart} iconClass="text-[#EC4899]">{c.engagementRate.toFixed(1)}% ER</Stat>
      </div>

      {/* stat row 2 */}
      <div className="absolute left-[10px] top-[82px] flex gap-[3px]">
        <Stat icon={Star} iconClass="fill-[#FDD835] text-[#FDD835]">{c.stars} Stars</Stat>
        <Stat icon={Eye} iconClass="text-[#2CC37F]">{c.cpv.toFixed(2)}p CPV</Stat>
        <Stat icon={Sparkles} iconClass="fill-[#603CFF] text-[#603CFF]">{c.matchPct}% Match</Stat>
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
      <div
        className={`absolute left-[240px] top-[167px] flex h-[15px] w-[15px] items-center justify-center rounded-[5px] ${
          listed ? "border border-[#C9C9C9] bg-white" : "bg-black"
        }`}
      >
        {!listed && <Check className="h-[10px] w-[10px] text-white" strokeWidth={2.6} />}
      </div>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CreatorsPage() {
  const navigate = useNavigate();
  const { data: creators } = useCreators();
  const cards = (creators ?? []).slice(0, 9);
  const [service, setService] = useState<"Barter" | "Paid">("Paid");
  const [listedOn, setListedOn] = useState(false);
  const [genders, setGenders] = useState<{ Female: boolean; Male: boolean; Others: boolean }>({
    Female: true,
    Male: false,
    Others: false,
  });
  const resetFilters = () => {
    setService("Paid");
    setListedOn(false);
    setGenders({ Female: true, Male: false, Others: false });
  };
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

      {/* --------------------------- top toolbar --------------------------- */}
      {/* back */}
      <button onClick={() => navigate(-1)} className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-black">
        <ChevronLeft className="h-[24px] w-[24px] text-white" strokeWidth={2} />
      </button>

      {/* search */}
      <div onClick={() => navigate("/search")} className="absolute left-[288px] top-[158px] flex h-[48px] w-[311px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white px-[12px]">
        <Search className="h-[22px] w-[22px] text-ink" strokeWidth={1.8} />
        <span className="text-[15px] font-light text-ink/70">Search in Creators</span>
      </div>

      {/* All 920 */}
      <div className="absolute left-[607px] top-[158px] flex h-[48px] w-[146px] items-center justify-center rounded-[24px] bg-black">
        <span className="text-[20px] font-extralight text-white">All {creators?.length ?? 0}</span>
      </div>

      {/* selected count */}
      <div className="absolute left-[761px] top-[158px] flex h-[48px] w-[72px] items-center justify-center gap-[3px] rounded-[24px] bg-white">
        <Users className="h-[22px] w-[22px] text-ink" strokeWidth={1.7} />
        <span className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#20A271] text-[10px] font-normal text-white">4</span>
      </div>

      {/* listed toggle */}
      <div onClick={() => setListedOn((v) => !v)} className="absolute left-[841px] top-[158px] flex h-[48px] w-[162px] cursor-pointer items-center rounded-[24px] bg-white pl-[13px] pr-[12px]">
        <span className="text-[20px] font-extralight text-ink">listed</span>
        <div className={`relative ml-auto h-[28px] w-[64px] rounded-full ${listedOn ? "bg-black" : "bg-[rgba(120,120,120,0.2)]"}`}>
          <div className={`absolute ${listedOn ? "left-[38px]" : "left-[2px]"} top-[2px] h-[24px] w-[24px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]`} />
        </div>
      </div>

      {/* share link */}
      <div onClick={() => navigate("/creators/share-link-list")} className="absolute left-[1011px] top-[158px] flex h-[48px] w-[131px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white px-[16px]">
        <Link2 className="h-[19px] w-[19px] text-ink" strokeWidth={1.8} />
        <span className="text-[14px] font-light text-ink">Share link</span>
      </div>

      {/* download */}
      <div onClick={() => navigate("/leads/download")} className="absolute left-[1150px] top-[158px] flex h-[48px] w-[127px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white px-[16px]">
        <FileSpreadsheet className="h-[19px] w-[19px] text-[#107C41]" strokeWidth={1.7} />
        <span className="text-[14px] font-light text-ink">Download</span>
      </div>

      {/* ---------------------------- title area ---------------------------- */}
      <h1 className="absolute left-[285px] top-[228px] text-[34px] font-normal leading-none text-ink">Stellar Talents</h1>

      {/* 1 selected tab */}
      <div className="absolute left-[866px] top-[253px] flex h-[46px] w-[220px] items-center gap-[7px] rounded-[24px] border border-[#D9D9D9] bg-[#F3F2F7] px-[27px]">
        <span className="flex h-[15px] w-[15px] items-center justify-center rounded-[5px] border border-[#C9C9C9] bg-white">
          <Check className="h-[10px] w-[10px] text-black" strokeWidth={2.6} />
        </span>
        <span className="text-[12px] font-light text-ink">1 selected</span>
      </div>

      {/* --------------------------- top creators --------------------------- */}
      <h2 className="absolute left-[276px] top-[310px] text-[20px] font-normal text-ink">Top Creators</h2>
      <div className="absolute left-[276px] top-[355px] grid grid-cols-3 gap-x-[5px] gap-y-[10px]">
        {cards.map((c) => (
          <CreatorCard key={c.id} c={c} />
        ))}
      </div>

      {/* All Creators heading */}
      <h2 className="absolute left-[276px] top-[964px] text-[24px] font-normal text-ink">All Creators</h2>

      {/* ---------------------------- filters panel ---------------------------- */}
      {/* Filters title */}
      <div className="absolute left-[1102px] top-[263px] text-[24px] font-normal text-slate900">Filters</div>
      {/* reset button */}
      <div onClick={resetFilters} className="absolute left-[1385px] top-[247px] flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-white">
        <RotateCcw className="h-[16px] w-[16px] text-ink" strokeWidth={1.6} />
      </div>

      {/* Choose Service */}
      <div className="absolute left-[1101px] top-[300px] text-[14px] font-normal text-ink/70">Choose Service</div>
      <div className="absolute left-[1101px] top-[327px] flex gap-[9px]">
        <Tag onClick={() => setService("Barter")} className={`w-[70px] cursor-pointer ${service === "Barter" ? "bg-black text-white" : "bg-[#FEFCFF] text-ink/70"}`}>Barter</Tag>
        <Tag onClick={() => setService("Paid")} className={`w-[70px] cursor-pointer ${service === "Paid" ? "bg-black text-white" : "bg-[#FEFCFF] text-ink/70"}`}>Paid</Tag>
      </div>

      {/* Platform */}
      <div className="absolute left-[1101px] top-[368px] text-[14px] font-normal text-ink/70">Platform</div>
      <div className="absolute left-[1101px] top-[395px] flex gap-[9px]">
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
      <div className="absolute left-[1101px] top-[436px] text-[14px] font-normal text-ink/70">Deliverables</div>
      <div className="absolute left-[1101px] top-[463px] flex gap-[9px]">
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
      <div className="absolute left-[1101px] top-[504px] text-[14px] font-normal text-ink/70">Niche</div>
      <div className="absolute left-[1101px] top-[531px] flex gap-[9px]">
        <Tag className="w-[70px] bg-[#FEFCFF] text-ink/70">
          <Plus className="h-[13px] w-[13px]" strokeWidth={1.8} />
          Add
        </Tag>
        <Tag className="w-[35px] bg-black font-light text-white">All</Tag>
      </div>

      {/* Follower Range */}
      <div className="absolute left-[1101px] top-[572px] text-[14px] font-normal text-ink/70">Follower Range</div>
      <div className="absolute left-[1101px] top-[600px] w-[312px] text-right text-[12px] font-medium text-ink/70">0 - 500</div>
      <div className="absolute left-[1101px] top-[622px] h-[9px] w-[312px] rounded-full bg-white">
        <div className="h-[9px] w-[47px] rounded-full bg-[#2E2E2E]" />
      </div>
      <div className="absolute left-[1139px] top-[617px] h-[18px] w-[18px] rounded-full bg-black" />

      {/* Location */}
      <div className="absolute left-[1101px] top-[644px] text-[14px] font-normal text-ink/70">Location</div>
      <div className="absolute left-[1101px] top-[669px] flex gap-[9px]">
        <Tag className="w-[87px] bg-[#FEFCFF] text-ink/70">
          <MapPin className="h-[14px] w-[14px]" strokeWidth={1.6} />
          location
        </Tag>
        <Tag className="w-[76px] bg-white font-light text-black">
          Delhi
          <X className="h-[12px] w-[12px]" strokeWidth={1.8} />
        </Tag>
      </div>

      {/* Gender */}
      <div className="absolute left-[1101px] top-[710px] text-[14px] font-normal text-ink/70">Gender</div>
      <div className="absolute left-[1101px] top-[738px] flex items-center gap-[15px]">
        <span onClick={() => setGenders((g) => ({ ...g, Female: !g.Female }))} className="flex cursor-pointer items-center gap-[3px]">
          <CheckBox on={genders.Female} />
          <span className={genders.Female ? "text-[12px] text-ink" : "text-[12px] font-light text-ink/70"}>Female</span>
        </span>
        <span onClick={() => setGenders((g) => ({ ...g, Male: !g.Male }))} className="flex cursor-pointer items-center gap-[3px]">
          <CheckBox on={genders.Male} />
          <span className={genders.Male ? "text-[12px] text-ink" : "text-[12px] font-light text-ink/70"}>Male</span>
        </span>
        <span onClick={() => setGenders((g) => ({ ...g, Others: !g.Others }))} className="flex cursor-pointer items-center gap-[3px]">
          <CheckBox on={genders.Others} />
          <span className={genders.Others ? "text-[12px] text-ink" : "text-[12px] font-light text-ink/70"}>Others</span>
        </span>
      </div>

      {/* Average Views */}
      <div className="absolute left-[1101px] top-[768px] text-[14px] font-normal text-ink/70">Average Views</div>
      <div className="absolute left-[1101px] top-[792px] flex gap-[9px]">
        <Tag className="w-[70px] bg-[#FEFCFF] text-ink/70">
          <Eye className="h-[14px] w-[14px]" strokeWidth={1.6} />
          Add
        </Tag>
        <Tag className="w-[76px] bg-white font-light text-black">
          500k
          <X className="h-[12px] w-[12px]" strokeWidth={1.8} />
        </Tag>
      </div>

      {/* By Age */}
      <div className="absolute left-[1101px] top-[834px] text-[14px] font-normal text-ink/70">By Age</div>
      <div className="absolute left-[1101px] top-[862px] flex h-[34px] w-[316px] items-center justify-between rounded-[20px] bg-[#FAFAFA] px-[10px]">
        <span className="text-[12px] font-light text-ink">19 - 25</span>
        <ChevronsUpDown className="h-[16px] w-[16px] text-ink" strokeWidth={1.4} />
      </div>

      {/* Language */}
      <div className="absolute left-[1101px] top-[900px] text-[14px] font-normal text-ink/70">Language</div>
      <div className="absolute left-[1101px] top-[928px] flex h-[34px] w-[316px] items-center justify-between rounded-[20px] bg-[#FAFAFA] px-[10px]">
        <span className="text-[12px] font-light text-ink">English</span>
        <ChevronsUpDown className="h-[16px] w-[16px] text-ink" strokeWidth={1.4} />
      </div>
    </>
  );
}
