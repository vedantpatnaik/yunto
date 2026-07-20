import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ArrowUpRight,
  Clock,
  Droplet,
  Phone,
  RotateCcw,
  Plus,
  Calendar,
} from "lucide-react";
import { useReminders } from "@/api/hooks";

/**
 * Super Admin — Reminders.
 * Exact reconstruction of Figma frame 6918:103979 ("Super Admin-REMINDERS"),
 * 1440×1024. Built CLEAN — the captured profile popup + dim scrim siblings are
 * intentionally omitted. Renders inside AppShell (TopBar + Sidebar already present).
 */

type Priority = { label: string; color: string };
const MEDIUM: Priority = { label: "Medium", color: "#F2964E" };
const HIGH: Priority = { label: "High", color: "#E84D3A" };

/* ------------------------------ reminder card ---------------------------- */
function ReminderCard({
  left,
  priority,
  title,
  dueAt,
  onOpen,
}: {
  left: number;
  priority: Priority;
  title: string;
  dueAt: string;
  onOpen: () => void;
}) {
  return (
    <div
      className="absolute h-[191px] w-[266px] rounded-[12px] bg-[#F5F5F5]"
      style={{ left, top: 326 }}
    >
      {/* arrow button — notch top-right */}
      <span
        onClick={onOpen}
        className="absolute right-[4px] top-[-1px] flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full bg-white"
      >
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.7} />
      </span>

      {/* time chip */}
      <span className="absolute left-[8px] top-[6px] flex h-[24px] items-center gap-[5px] rounded-[12px] border-[0.5px] border-[#D9D9D9] bg-white pl-[6px] pr-[8px]">
        <Clock className="h-[13px] w-[13px] text-ink" strokeWidth={1.6} />
        <span className="font-inter text-[10.2px] leading-none text-ink">48h:10m:09s</span>
      </span>

      {/* priority chip */}
      <span
        className="absolute left-[168px] top-[6px] flex h-[24px] w-[55px] items-center justify-center rounded-[12px] border-[0.5px] bg-white text-[10.2px] leading-none"
        style={{ borderColor: priority.color, color: priority.color }}
      >
        {priority.label}
      </span>

      {/* agency row */}
      <span className="absolute left-[8px] top-[39px] flex h-[33.5px] w-[33.5px] items-center justify-center rounded-full border border-black/[0.14] bg-white">
        <Droplet className="h-[15px] w-[15px] text-ink" strokeWidth={1.5} />
      </span>
      <div className="absolute left-[51px] top-[43.5px]">
        <div className="text-[12px] leading-[15px] text-ink/90">Base Skincare</div>
        <div className="text-[8px] leading-[13px] text-ink/70">Budget ₹1.5L</div>
      </div>

      {/* task row */}
      <span className="absolute left-[8px] top-[85px] flex h-[33.5px] w-[33.5px] items-center justify-center rounded-full border border-black/[0.14] bg-white">
        <Phone className="h-[15px] w-[15px] text-ink" strokeWidth={1.5} />
      </span>
      <div className="absolute left-[48.5px] top-[87.3px]">
        <div className="text-[14px] font-light leading-[16px] text-ink">{title}</div>
        <div className="mt-[3px] text-[8px] font-light leading-none text-ink">{dueAt}</div>
      </div>

      {/* status */}
      <span className="absolute left-[17px] top-[127px] text-[9.3px] leading-none text-ink/90">Status</span>
      <div className="absolute left-[8px] top-[145px] flex h-[37px] w-[142px] items-center gap-[4px] rounded-[20px] border-[0.5px] border-[#D9D9D9] bg-white px-[8px]">
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#8FBDC7] text-[10.2px] leading-none text-white/90">
          TM
        </span>
        <div className="flex flex-col">
          <span className="text-[10.2px] leading-[13px] text-ink/90">Tanisha Mishra</span>
          <span className="text-[8px] leading-[11px] text-ink/70">Call Scheduled</span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- add-panel primitives ------------------------ */
function FieldInput({ top, label, placeholder }: { top: number; label: string; placeholder: string }) {
  return (
    <>
      <span className="absolute left-[1038px] text-[14px] leading-[24px] text-ink/70" style={{ top }}>
        {label}
      </span>
      <div
        className="absolute left-[1038px] flex h-[34px] w-[316px] items-center rounded-[20px] border border-black/20 bg-[#FAFAFA] px-[11px]"
        style={{ top: top + 36 }}
      >
        <span className="text-[12px] font-light leading-none text-ink">{placeholder}</span>
      </div>
    </>
  );
}

function PriorityBtn({
  left,
  label,
  color,
  bg,
  active,
  onClick,
}: {
  left: number;
  label: string;
  color: string;
  bg: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      aria-pressed={active}
      className="absolute top-[499px] flex h-[28px] w-[87px] cursor-pointer items-center justify-center rounded-[20px] border text-[12px] leading-none"
      style={{ left, borderColor: color, color, backgroundColor: bg }}
    >
      {label}
    </span>
  );
}

function DateBtn({
  left,
  title,
  sub,
  strong,
  bordered,
  onClick,
}: {
  left: number;
  title: string;
  sub: string;
  strong?: boolean;
  bordered?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`absolute top-[570px] flex h-[69px] w-[100px] cursor-pointer flex-col items-center justify-center gap-[5px] rounded-[8px] ${
        bordered ? "border border-black/50" : ""
      }`}
      style={{ left }}
    >
      <span className={`text-[12px] leading-[20px] text-ink ${strong ? "font-medium" : "font-normal"}`}>{title}</span>
      <span className="text-[11px] leading-[16px] text-ink/70">{sub}</span>
    </div>
  );
}

/* -------------------------------- page ----------------------------------- */
function Segment({
  dark,
  w,
  children,
  onClick,
}: {
  dark?: boolean;
  w: number;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className={`flex h-[48px] cursor-pointer items-center justify-center rounded-[24px] text-[20px] font-extralight ${
        dark ? "bg-black text-white" : "bg-white text-ink"
      }`}
      style={{ width: w }}
    >
      {children}
    </span>
  );
}

/** ISO date -> "14 July 2025 at 1 pm" (matches the card's date line). */
function formatDue(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "long" });
  const year = d.getFullYear();
  const ampm = d.getHours() >= 12 ? "pm" : "am";
  const hour = d.getHours() % 12 || 12;
  const minutes = d.getMinutes();
  const time = minutes ? `${hour}:${String(minutes).padStart(2, "0")} ${ampm}` : `${hour} ${ampm}`;
  return `${day} ${month} ${year} at ${time}`;
}

/** Fixed card slots the design lays out (position + priority accent). */
const CARD_SLOTS: { left: number; priority: Priority }[] = [
  { left: 277, priority: MEDIUM },
  { left: 558, priority: HIGH },
];

export default function RemindersPage() {
  const navigate = useNavigate();
  const { data } = useReminders();
  const reminders = (data ?? []).slice(0, CARD_SLOTS.length);

  const [tab, setTab] = useState<"all" | "today">("all");
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("Today");

  return (
    <>
      {/* full-bleed frame gradient (paints behind AppShell sidebar/topbar) */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, #EAEAEA 0%, #EDF9FF 36%, rgba(201,218,227,0.9) 70%, #A4C5D9 100%)",
        }}
      />

      {/* REMINDERS title */}
      <h1 className="absolute left-[260px] top-[153px] text-[40px] font-normal leading-none text-ink">REMINDERS</h1>

      {/* top-right controls */}
      <span
        onClick={() => navigate("/search")}
        className="absolute left-[688px] top-[160px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-white"
      >
        <Search className="h-[22px] w-[22px] text-ink" strokeWidth={1.7} />
      </span>
      <div className="absolute left-[741px] top-[158px] flex items-start gap-[8px]">
        <Segment dark={tab === "all"} w={120} onClick={() => setTab("all")}>
          All 50
        </Segment>
        <Segment dark={tab === "today"} w={116} onClick={() => setTab("today")}>
          Today
        </Segment>
      </div>

      {/* Schedule dropdown */}
      <span className="absolute left-[285px] top-[231px] text-[34px] font-normal leading-none text-ink">Schedule</span>
      <ChevronDown className="absolute left-[502px] top-[240px] h-[24px] w-[24px] text-ink" strokeWidth={2} />

      {/* 7 Scheduled */}
      <span className="absolute left-[567px] top-[237px] text-[24px] font-normal leading-none text-ink underline decoration-1 underline-offset-[3px]">
        7 Scheduled
      </span>

      {/* left panel (behind cards) */}
      <div className="absolute left-[260px] top-[253px] h-[712px] w-[749px] rounded-[24px] border border-[#D4D4D4]" />

      {/* reminder cards */}
      {reminders.map((r, i) => (
        <ReminderCard
          key={r.id}
          left={CARD_SLOTS[i].left}
          priority={CARD_SLOTS[i].priority}
          title={r.title}
          dueAt={formatDue(r.dueAt)}
          onOpen={() => navigate(`/leads/detail?id=${r.id}`)}
        />
      ))}

      {/* ------------------------- Add Reminder panel ------------------------ */}
      <div
        className="absolute left-[1021px] top-[252px] h-[727px] w-[375px] rounded-[24px] border border-[#D6D6D6] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        style={{
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #F3EEFC 55%, #D1BDF5 100%)",
        }}
      />

      {/* header */}
      <span className="absolute left-[1037px] top-[266px] text-[24px] font-normal leading-[24px] text-[#111827]">
        Add Reminder
      </span>
      <span
        onClick={() => navigate("/reminders")}
        className="absolute left-[1252px] top-[258px] flex h-[44px] w-[88px] cursor-pointer items-center justify-center gap-[10px] rounded-[28px] bg-black/90"
      >
        <span className="text-[14px] font-light leading-none text-white">Add</span>
        <Plus className="h-[16px] w-[16px] text-white" strokeWidth={2} />
      </span>
      <span
        onClick={() => {
          setSelectedPriority(null);
          setSelectedDate("Today");
        }}
        className="absolute left-[1355px] top-[252px] flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-[24px] bg-white"
      >
        <RotateCcw className="h-[16px] w-[16px] text-ink" strokeWidth={1.7} />
      </span>

      {/* task title / details */}
      <FieldInput top={318} label="Task Title" placeholder="Task name" />
      <FieldInput top={400} label="Task Details" placeholder="Task details" />

      {/* priority */}
      <span className="absolute left-[1036px] top-[475px] text-[14px] leading-[24px] text-ink/70">Priority</span>
      <PriorityBtn
        left={1036}
        label="Low"
        color="#0078FD"
        bg="#FEFCFF"
        active={selectedPriority === "Low"}
        onClick={() => setSelectedPriority("Low")}
      />
      <PriorityBtn
        left={1128}
        label="Medium"
        color="#F2964E"
        bg="#FFFFFF"
        active={selectedPriority === "Medium"}
        onClick={() => setSelectedPriority("Medium")}
      />
      <PriorityBtn
        left={1220}
        label="High"
        color="#E84D3A"
        bg="#FEFCFF"
        active={selectedPriority === "High"}
        onClick={() => setSelectedPriority("High")}
      />

      {/* date */}
      <span className="absolute left-[1036px] top-[540px] text-[14px] leading-[17.5px] text-ink/70">Date</span>
      <DateBtn
        left={1036}
        title="Today"
        sub="Sat, Jun 19"
        strong
        bordered={selectedDate === "Today"}
        onClick={() => setSelectedDate("Today")}
      />
      <DateBtn
        left={1144}
        title="Tomorrow"
        sub="Sun, Jun 20"
        bordered={selectedDate === "Tomorrow"}
        onClick={() => setSelectedDate("Tomorrow")}
      />
      <DateBtn
        left={1252}
        title="Next Week"
        sub="Mon, Jun 26"
        strong
        bordered={selectedDate === "Next Week"}
        onClick={() => setSelectedDate("Next Week")}
      />

      {/* select due date */}
      <span className="absolute left-[1036px] top-[651px] text-[14px] leading-[16px] text-ink/70">Select Due Date</span>
      <div className="absolute left-[1036px] top-[682px] flex h-[34px] w-[316px] items-center justify-between rounded-[20px] border border-black/20 bg-[#FAFAFA] pl-[11px] pr-[7px]">
        <span className="text-[12px] font-light leading-none text-ink">Date</span>
        <span className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#181717]">
          <Calendar className="h-[12px] w-[12px] text-white" strokeWidth={1.8} />
        </span>
      </div>
    </>
  );
}
