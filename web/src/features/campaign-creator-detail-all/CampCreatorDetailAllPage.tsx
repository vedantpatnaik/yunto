import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Phone,
  Users,
  Eye,
  Star,
  Heart,
  LoaderCircle,
  ChevronDown,
  Video,
  Image as ImageIcon,
  Plus,
  Clock,
  Calendar,
  Home,
  Link2,
  Info,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";
import { useCreators } from "@/api/hooks";

/**
 * Super Admin — Campaigns creator detail (all creator).
 * Exact reconstruction of Figma frame 5063:59822, 1440×1024.
 * Clean underlying page — profile popup + dim scrim (5063:61080+) intentionally omitted.
 */

/* ------------------------------ primitives ----------------------------- */
function pos(left: number, top: number, extra?: CSSProperties): CSSProperties {
  return { position: "absolute", left, top, ...extra };
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

function CornerBtn({ left, top, size = 28, onClick }: { left: number; top: number; size?: number; onClick?: () => void }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]${onClick ? " cursor-pointer" : ""}`}
      style={pos(left, top, { width: size, height: size })}
      onClick={onClick}
    >
      <ArrowUpRight className="h-[13px] w-[13px] text-black" strokeWidth={1.8} />
    </div>
  );
}

function CallBtn({ left, top, size = 28 }: { left: number; top: number; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.10)]"
      style={pos(left, top, { width: size, height: size })}
    >
      <Phone className="text-black" strokeWidth={1.6} style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}

function Tag({ left, top, w, children, weight = "font-light", size = 12 }: { left: number; top: number; w: number; children: ReactNode; weight?: string; size?: number }) {
  return (
    <div
      className={`flex h-[30px] items-center justify-center rounded-full bg-white text-[#121212] ${weight}`}
      style={pos(left, top, { width: w, fontSize: size })}
    >
      {children}
    </div>
  );
}

function StatCol({ left, icon: Icon, color, value, label }: { left: number; icon: LucideIcon; color: string; value: string; label: string }) {
  return (
    <>
      <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[24px] border border-[#E8E8E8] bg-white" style={pos(left, 463)}>
        <Icon className="h-[24px] w-[24px]" strokeWidth={1.7} style={{ color }} />
      </div>
      <span className="text-[12px] leading-[12px] text-[#A0AEC0]" style={pos(left, 519)}>{label}</span>
      <span className="text-[15px] font-semibold leading-[21px] text-[#101010]" style={pos(left, 531)}>{value}</span>
    </>
  );
}

/* ------------------------------ timeline ------------------------------- */
function DayLabel({ top, lineLeft, children }: { top: number; lineLeft: number; children: ReactNode }) {
  return (
    <>
      <span className="text-[12px] leading-[16px] text-black/70" style={pos(1004, top)}>{children}</span>
      <div className="h-px bg-black/10" style={pos(lineLeft, top + 9.5, { width: 92 })} />
    </>
  );
}

function TimelineRow({ top, dd, dow, title, time, active }: { top: number; dd: string; dow: string; title: string; time: string; active?: boolean }) {
  return (
    <>
      <div
        className={`flex flex-col items-center justify-center rounded-[18px] ${active ? "bg-[#D8DDFF]" : "bg-[#EFEFF0]"}`}
        style={pos(1004, top, { width: 36, height: 52 })}
      >
        <span className="text-[13px] font-light leading-[16px] text-black">{dd}</span>
        <span className="text-[13px] font-light leading-[16px] text-black">{dow}</span>
      </div>
      <span className="text-[16px] leading-[16px] text-black" style={pos(1046, top + 1.5)}>{title}</span>
      <div className="flex h-[24px] items-center gap-[4px] rounded-[18px] bg-white px-[8px]" style={pos(1046, top + 26, { width: 74 })}>
        <Clock className="h-[12px] w-[12px] text-black/60" strokeWidth={1.6} />
        <span className="text-[10.2px] leading-[16px] text-black/60">{time}</span>
      </div>
    </>
  );
}

/* --------------------------- addon creator card ------------------------ */
function AddonCard({ x, name, role, service, onOpen }: { x: number; name: string; role: string; service: string; onOpen?: () => void }) {
  return (
    <>
      <div className="rounded-[12px] bg-[#F5F5F5]" style={pos(x, 664, { width: 266, height: 190 })} />
      <CornerBtn left={x + 234} top={663} onClick={onOpen} />
      <CallBtn left={x + 198} top={672} size={21.9} />
      {/* avatar + name */}
      <div className="rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" style={pos(x + 8, 670, { width: 38, height: 38 })} />
      <span className="text-[12px] leading-[15px] text-black/90" style={pos(x + 51, 674.5)}>{name}</span>
      <span className="text-[8px] leading-[13px] text-black/70" style={pos(x + 51, 690.5)}>{role}</span>
      {/* service */}
      <span className="text-[9.3px] leading-[15px] text-black/90" style={pos(x + 19, 716)}>Service</span>
      <div className="flex items-center gap-[4px] rounded-[12px] bg-white" style={pos(x + 10, 734, { width: 224, height: 48 })}>
        <div className="ml-[8px] rounded-[6px] bg-[#C4C4C4]" style={{ width: 28, height: 36 }} />
        <span className="text-[10.2px] leading-[24px] text-black/90">{service}</span>
      </div>
      {/* shoot date */}
      <span className="text-[9.3px] leading-[15px] text-black/90" style={pos(x + 10, 791)}>Shoot Date</span>
      <div className="flex items-center rounded-[18px] bg-white" style={pos(x + 10, 808.9, { width: 117, height: 32 })}>
        <div className="ml-[3px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <Calendar className="h-[14px] w-[14px] text-black" strokeWidth={1.5} />
        </div>
        <span className="ml-[7px] text-[12px] font-light text-black/90">20 June 2025</span>
      </div>
      {/* deliver date */}
      <span className="text-[9.3px] leading-[15px] text-black/90" style={pos(x + 139, 791)}>Deliver Date</span>
      <div className="flex items-center rounded-[18px] bg-white" style={pos(x + 139, 808.9, { width: 117, height: 32 })}>
        <div className="ml-[3px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <Calendar className="h-[14px] w-[14px] text-black" strokeWidth={1.5} />
        </div>
        <span className="ml-[7px] text-[12px] font-light text-black/90">22 June 2025</span>
      </div>
    </>
  );
}

/* --------------------------- deliverable row --------------------------- */
function DeliverRow({ top, tag, status, statusColor, info }: { top: number; tag: string; status: string; statusColor: string; info?: string }) {
  return (
    <>
      <div className="rounded-[12px] bg-white" style={pos(294, top, { width: 289, height: 48 })} />
      <div className="rounded-[6px] bg-[#C4C4C4]" style={pos(300, top + 6, { width: 28, height: 36 })} />
      <span className="text-[10.2px] leading-[24px] text-black/90" style={pos(332, top + 15)}>Nike’s Diwali Reel Shoot</span>
      {/* tag pill */}
      <div className="flex h-[23px] items-center justify-center rounded-[27.6px] bg-white" style={pos(460, top + 14, { width: 52 })}>
        <span className="text-[9.2px] font-light text-[#121212]">{tag}</span>
      </div>
      {/* link circle */}
      <div className="flex items-center justify-center rounded-full bg-black" style={pos(541, top + 12, { width: 23, height: 23 })}>
        <Link2 className="h-[12px] w-[12px] text-white" strokeWidth={1.6} />
      </div>
      {/* status pill */}
      <div className="flex h-[18px] items-center justify-center rounded-[9px] bg-white" style={pos(596, top + (info ? 9 : 15), { width: 52 })}>
        <span className="text-[7.6px]" style={{ color: statusColor }}>{status}</span>
      </div>
      {info && (
        <div className="flex items-center gap-[2.5px]" style={pos(590, top + 30)}>
          <Info className="h-[11px] w-[11px] text-black/70" strokeWidth={1.6} />
          <span className="text-[7.4px] font-light text-black/70">{info}</span>
        </div>
      )}
    </>
  );
}

function TaxNote({ left, top }: { left: number; top: number }) {
  return <span className="text-[5px] leading-[7px] text-black/50" style={pos(left, top)}>(tax inc.)</span>;
}

/* -------------------------------- page --------------------------------- */
export default function CampCreatorDetailAllPage() {
  const navigate = useNavigate();
  const { data } = useCreators();
  const creators = data ?? [];
  const primary = creators[0];
  const addons = creators.slice(1, 3);
  return (
    <>
      {/* content-panel border / notch (Subtract 5063:59850) */}
      <div className="bg-gradient-to-r from-black/20 via-black/[0.06] to-transparent" style={pos(261, 301, { width: 702, height: 1 })} />
      <div className="bg-black/[0.07]" style={pos(261, 301, { width: 1, height: 723 })} />
      <div className="bg-black/[0.07]" style={pos(963, 242, { width: 1, height: 59 })} />
      <div className="bg-black/[0.07]" style={pos(963, 242, { width: 351, height: 1 })} />
      <div className="bg-black/[0.07]" style={pos(1313, 242, { width: 1, height: 782 })} />

      {/* back button */}
      <div className="flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-[22.5px] bg-black" style={pos(235, 153)} onClick={() => navigate(-1)}>
        <ArrowLeft className="h-[20px] w-[20px] text-white" strokeWidth={2} />
      </div>

      {/* title */}
      <h1 className="text-[34px] font-normal leading-[43px] text-black" style={pos(269, 231)}>Nike’s Diwali</h1>
      <div className="bg-black/10" style={pos(261, 280, { width: 259, height: 1 })} />

      {/* View Calendar / Mark Done */}
      <div className="flex h-[45px] cursor-pointer items-center justify-center rounded-[24px] border-[0.5px] border-black/10 bg-white" style={pos(609, 246, { width: 193 })} onClick={() => navigate("/calendar")}>
        <span className="text-[20px] font-extralight text-black">View Calendar</span>
      </div>
      <div className="flex h-[45px] cursor-pointer items-center justify-center rounded-[24px] border-[0.5px] border-black/10 bg-white" style={pos(810, 246, { width: 144 })} onClick={() => navigate("/campaigns/creator-list")}>
        <span className="text-[20px] font-extralight text-black">Mark Done</span>
      </div>

      {/* ============================ TEAM CONTAINER ============================ */}
      <div className="rounded-[24px] border-[0.9px] border-[#F6F6F6] bg-[#F3F3F3]/[0.13]" style={pos(277, 311, { width: 691, height: 285 })} />

      {/* tags */}
      <Tag left={284} top={325} w={68}>Beauty</Tag>
      <Tag left={360} top={325} w={72}>Lifestyle</Tag>
      <div className="flex h-[30px] items-center justify-center gap-[2px] rounded-full bg-white" style={pos(440, 325, { width: 58 })}>
        <span className="text-[10.2px] leading-none">📍</span>
        <span className="text-[10.2px] text-black">{primary?.location ?? ""}</span>
      </div>

      {/* status button */}
      <div className="flex h-[45px] items-center rounded-[24px] border-[0.5px] border-black/10 bg-white" style={pos(754, 321, { width: 185 })}>
        <LoaderCircle className="ml-[9px] h-[22px] w-[22px] text-[#79B282]" strokeWidth={2} />
        <span className="ml-[3px] text-[14px] font-light text-black">Waiting for shoot</span>
        <ChevronDown className="ml-[6px] h-[15px] w-[15px] text-black" strokeWidth={2} />
      </div>

      {/* creator avatar + name + fire badge */}
      <div className="rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" style={pos(284, 388, { width: 45, height: 45 })} />
      <span className="text-[18px] leading-none" style={pos(316, 411)}>🔥</span>
      <span className="text-[17.4px] leading-[21.6px] text-black/90" style={pos(341, 389)}>{primary?.name ?? ""}</span>
      <span className="text-[11.6px] leading-[18.8px] text-black/70" style={pos(341, 412)}>{primary?.handle ?? ""}</span>

      {/* agency pill */}
      <div className="flex h-[40px] items-center rounded-[24px] border-[0.5px] border-black/10 bg-white" style={pos(710, 390, { width: 229 })}>
        <div className="ml-[6px] h-[28px] w-[28px] rounded-full bg-gradient-to-br from-[#F1FFC3] to-[#C8B3ED]" />
        <span className="ml-[5px] text-[12.1px] text-black/90">Stellar Talents</span>
        <img src={whatsapp} alt="WhatsApp" className="ml-[15px] h-[28px] w-[28px]" />
        <div className="ml-[9px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
          <Phone className="h-[14px] w-[14px] text-black" strokeWidth={1.6} />
        </div>
      </div>

      {/* stats card */}
      <div className="rounded-[24px] bg-white" style={pos(299, 451, { width: 640, height: 115 })} />
      <StatCol left={338} icon={Users} color="#4880D4" value={primary ? compact(primary.followers) : ""} label="Followers" />
      <StatCol left={499} icon={Eye} color="#2CC37F" value={primary ? `${primary.engagementRate.toFixed(1)} %` : ""} label="Engagement Rate" />
      <StatCol left={660} icon={Star} color="#FDD835" value={primary ? `${primary.stars.toFixed(1)} Stars` : ""} label="Rating" />
      <StatCol left={821} icon={Heart} color="#EC4E7B" value={primary ? compact(primary.avgViews) : ""} label="Avg. Views" />

      {/* ============================== ACTIVITY =============================== */}
      <div className="rounded-[12px] bg-white/60" style={pos(988, 253, { width: 298, height: 441 })} />
      <span className="text-[14px] leading-[24px] text-black" style={pos(998, 259)}>Activity</span>
      <CornerBtn left={1258} top={253} onClick={() => navigate("/calendar")} />
      <div className="rounded-[12px] bg-white" style={pos(998, 294, { width: 277, height: 377 })} />

      <DayLabel top={300} lineLeft={1066}>Day 1</DayLabel>
      <TimelineRow top={325} dd="20" dow="Fri" title="Campaign Shared" time="02:00 pm" active />
      <DayLabel top={387} lineLeft={1047}>Day 2</DayLabel>
      <TimelineRow top={416} dd="21" dow="Sat" title="Campaign briefed" time="01:00 pm" />
      <DayLabel top={478} lineLeft={1047}>Day 3</DayLabel>
      <TimelineRow top={507} dd="23" dow="Sat" title="Shoot completed" time="01:00 pm" />
      <DayLabel top={569} lineLeft={1047}>Day 4</DayLabel>
      <TimelineRow top={598} dd="25" dow="Sat" title="Expected editing delivery" time="01:00 pm" />

      {/* ============================== ADD-ONS =============================== */}
      <div className="rounded-[12px] bg-white/60" style={pos(988, 701, { width: 298, height: 492 })} />
      <span className="text-[14px] leading-[24px] text-black" style={pos(998, 712)}>Add -Ons</span>
      <CornerBtn left={1262} top={703} onClick={() => navigate("/creators/add-ons")} />
      <div className="rounded-[12px] bg-white" style={pos(998, 745, { width: 275, height: 452 })} />

      {/* addon row 1 */}
      <div className="rounded-[12px] bg-white/90" style={pos(1007, 757, { width: 255, height: 61 })} />
      <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]" style={pos(1015, 768)}>
        <Video className="h-[13px] w-[13px] text-black" strokeWidth={1.5} />
      </div>
      <span className="text-[14px] font-light leading-[17.6px] text-black" style={pos(1045, 768)}>Videographer</span>
      <div className="flex items-center" style={pos(1045, 791)}>
        <span className="text-[11px] leading-[16px] text-[#443A4D]">On-site shoot</span>
        <span className="mx-[4px] text-[10.2px] leading-[16px] text-[#443A4D]">•</span>
        <span className="text-[12px] font-semibold leading-[16px] text-[#3DBB6C]">₹5,000</span>
      </div>
      <Plus className="cursor-pointer text-black/30" strokeWidth={2} style={pos(1090, 772, { width: 12, height: 12 })} onClick={() => navigate("/creators/add-ons")} />
      <CallBtn left={1224} top={774} />

      {/* addon row 2 */}
      <div className="rounded-[12px] bg-white/90" style={pos(1007, 829, { width: 255, height: 61 })} />
      <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]" style={pos(1015, 840)}>
        <ImageIcon className="h-[13px] w-[13px] text-black" strokeWidth={1.5} />
      </div>
      <span className="text-[14px] font-light leading-[17.6px] text-black" style={pos(1045, 840)}>Editor</span>
      <div className="flex items-center" style={pos(1045, 863)}>
        <span className="text-[11px] leading-[16px] text-[#443A4D]">Minimal Style</span>
        <span className="mx-[4px] text-[10.2px] leading-[16px] text-[#443A4D]">•</span>
        <span className="text-[12px] font-semibold leading-[16px] text-[#3DBB6C]">₹2,000</span>
      </div>
      <Plus className="cursor-pointer text-black/30" strokeWidth={2} style={pos(1090, 844, { width: 12, height: 12 })} onClick={() => navigate("/creators/add-ons")} />
      <CallBtn left={1224} top={846} />

      {/* deliverables token */}
      <div className="rounded-[8px] border border-dashed border-black/20 bg-white/70" style={pos(1007, 908, { width: 255, height: 52 })} />
      <span className="rounded bg-white px-[3px] text-[9px] font-medium leading-[11.9px] text-black" style={pos(1094, 902, { fontFamily: "ui-monospace, monospace" })}>Deliverables</span>
      <span className="text-[12px] leading-[10.8px] text-black" style={pos(1021, 924)}>1 Reel</span>
      <span className="text-[12px] font-medium leading-[20px] text-black/50" style={pos(1185, 918)}>₹60,000</span>
      <TaxNote left={1235} top={928} />
      <span className="text-[12px] leading-[10.8px] text-black" style={pos(1021, 945)}>1 Post</span>
      <span className="text-[12px] font-medium leading-[20px] text-black/50" style={pos(1187, 939)}>₹10,000</span>
      <TaxNote left={1235} top={950} />

      {/* budget breakdown */}
      <span className="text-[13px] font-medium leading-[20px] text-black" style={pos(1007, 982)}>Brand Budget</span>
      <span className="text-[12px] font-medium leading-[20px] text-black/50" style={pos(1189, 982)}>₹1,00,000</span>
      <TaxNote left={1246} top={991} />

      <span className="text-[12px] leading-[20px] text-black/50" style={pos(1007, 1010)}>{primary?.name ?? ""}</span>
      <span className="text-[12px] leading-[20px] text-[#E44E26]" style={pos(1197, 1010)}>₹70,000</span>
      <TaxNote left={1246} top={1018} />

      <span className="text-[12px] leading-[20px] text-black/50" style={pos(1007, 1038)}>Videographer</span>
      <span className="text-[12px] leading-[20px] text-[#E44E26]" style={pos(1204, 1038)}>₹5,000</span>

      <span className="text-[12px] leading-[20px] text-black/50" style={pos(1007, 1066)}>Editor</span>
      <span className="text-[12px] leading-[20px] text-[#E44E26]" style={pos(1203, 1066)}>₹2,000</span>

      <span className="text-[12px] leading-[20px] text-black/50" style={pos(1007, 1094)}>Creator’s GST (18%)</span>
      <span className="text-[12px] leading-[20px] text-[#E44E26]" style={pos(1199, 1094)}>₹12,600</span>

      {/* ============================== ADDONS SECTION ========================= */}
      <h2 className="text-[24px] font-normal leading-[24px] text-[#111827]" style={pos(278, 620)}>Addons</h2>
      <AddonCard x={278} name={addons[0]?.name ?? ""} role="Videographer" service="On - Site Shoot" onOpen={() => navigate("/creators/detail")} />
      <AddonCard x={554} name={addons[1]?.name ?? ""} role="Editor" service="Minimal -Style Editor Pack" onOpen={() => navigate("/creators/detail")} />

      {/* ============================== DELIVERABLES =========================== */}
      <h2 className="text-[24px] font-normal leading-[24px] text-[#111827]" style={pos(277, 878)}>Deliverables</h2>
      <div className="rounded-[24px] bg-white" style={pos(277, 922, { width: 395, height: 285 })} />
      <span className="text-[14px] leading-[24px] text-black" style={pos(294, 938)}>Add links to submit your deliverables</span>

      {/* add-link input */}
      <div className="rounded-[12px] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.05)]" style={pos(294, 980, { width: 289, height: 33 })} />
      <span className="text-[10.2px] font-light leading-[24px] text-black/70" style={pos(302, 986)}>Add your link</span>
      <div className="flex items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]" style={pos(498, 985, { width: 23, height: 23 })}>
        <Plus className="h-[13px] w-[13px] text-black" strokeWidth={1.8} />
      </div>
      <div className="flex h-[23px] items-center justify-center rounded-[27.6px] border-[0.5px] border-black/10 bg-white" style={pos(525, 985, { width: 52 })}>
        <span className="text-[9.2px] font-light text-[#121212]">Submit</span>
      </div>

      <DeliverRow top={1023} tag="Reel" status="Approved" statusColor="#00C16A" />
      <DeliverRow top={1081} tag="Story" status="Disapprove" statusColor="#62748E" info="script not good" />

      {/* ============================== ADDRESS =============================== */}
      <h2 className="text-[24px] font-normal leading-[24px] text-[#111827]" style={pos(686, 878)}>Address</h2>
      <div className="rounded-[24px] bg-white" style={pos(686, 919, { width: 280, height: 285 })} />
      <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[24px] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)]" style={pos(705, 933)}>
        <Home className="h-[22px] w-[22px] text-black" strokeWidth={1.6} />
      </div>
      <span className="text-[12px] leading-[12px] text-[#A0AEC0]" style={pos(705, 989)}>Home Address</span>
      <p className="whitespace-pre-line text-[14px] font-medium leading-[24px] text-black" style={pos(705, 1013, { width: 189 })}>
        {"D- 601\nAnjara Apartments\nSector 78 , Noida"}
      </p>
      <div className="flex h-[31px] items-center rounded-[18px] bg-white shadow-[0_1px_5px_rgba(0,0,0,0.06)]" style={pos(813, 940, { width: 114 })}>
        <div className="ml-[6px] h-[17px] w-[17px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <span className="ml-[3px] text-[12.4px] text-black/90">{primary?.name ?? ""}</span>
      </div>
    </>
  );
}
