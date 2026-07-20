import {
  ChevronLeft,
  RotateCcw,
  Type,
  AlignLeft,
  Calendar,
  Bell,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

/**
 * Agency app — Add Reminders (Figma frame 7711:22629, "add Reminders", 375×876),
 * rendered inside the 390px MobileFrame. Self-contained: it carries its own
 * status bar and primary action.
 *
 * NOTE: The Figma REST + MCP APIs were hard rate-limited (HTTP 429, Starter-plan
 * cost budget) for the entire build window, so exact node geometry for this frame
 * could not be pulled — the frame resolves to a childless leaf in every cached
 * dump. The ONLY real data recovered for this node is its size (375×876) and its
 * own solid background fill (#F8F5EF), from the depth-2 outline.
 *
 * The layout is therefore reconstructed from (a) the shared mobile-chrome idiom of
 * the sibling Agency screens (Add Member / Profile — status bar, round back
 * button, centered 18px title, white cards, ink primary button) and (b) the REAL
 * "Add Reminder" form copy pulled from the desktop Reminders panel (Figma node
 * 6918:103979 → src/features/reminders/RemindersPage.tsx): field set
 * (Task Title → "Task name", Task Details → "Task details"), the Priority selector
 * (Low #0078FD / Medium #F2964E / High #E84D3A), the Date quick-picks
 * (Today / Tomorrow / Next Week) and the "Select Due Date" calendar input.
 * Re-run against node 7711:22629 to pin pixel-exact coordinates once the Figma
 * API budget resets.
 */

/* ------------------------------- primitives ------------------------------ */
function Priority({
  left,
  label,
  color,
  active,
}: {
  left: number;
  label: string;
  color: string;
  active?: boolean;
}) {
  return (
    <span
      className="absolute top-[416px] flex h-[40px] w-[108px] items-center justify-center rounded-full border text-[13px] leading-none"
      style={{
        left,
        borderColor: color,
        color,
        backgroundColor: active ? `${color}1A` : "#FFFFFF",
        fontWeight: active ? 500 : 400,
      }}
    >
      {label}
    </span>
  );
}

function DateCard({
  left,
  title,
  sub,
  active,
}: {
  left: number;
  title: string;
  sub: string;
  active?: boolean;
}) {
  return (
    <div
      className={`absolute top-[510px] flex h-[80px] w-[110px] flex-col items-center justify-center gap-[6px] rounded-[16px] ${
        active
          ? "bg-ink shadow-[0_6px_18px_rgba(20,10,50,0.22)]"
          : "border border-line/70 bg-white"
      }`}
      style={{ left }}
    >
      <span
        className={`text-[13px] font-medium leading-none ${
          active ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </span>
      <span
        className={`text-[11px] leading-none ${
          active ? "text-white/70" : "text-ink/55"
        }`}
      >
        {sub}
      </span>
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgencyAddRemindersPage() {
  return (
    <div
      className="relative w-[390px] bg-[#F8F5EF] font-sans text-ink"
      style={{ height: 876 }}
    >
      {/* soft lavender wash behind the header (echoes the desktop Add-Reminder panel) */}
      <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-[#EFE9FB] to-[#F8F5EF]" />

      {/* status bar */}
      <div className="absolute inset-x-0 top-0 h-[54px]">
        <span className="absolute left-[26px] top-[17px] text-[15px] font-medium leading-none text-ink">
          9:41
        </span>
        <div className="absolute right-[22px] top-[18px] flex items-center gap-[6px]">
          <Signal className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <Wifi className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <BatteryFull className="h-[18px] w-[18px] text-ink" strokeWidth={1.6} />
        </div>
      </div>

      {/* header bar */}
      <button className="absolute left-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>
      <h1 className="absolute inset-x-0 top-[70px] text-center text-[18px] font-medium leading-none text-ink">
        Add Reminder
      </h1>
      <button className="absolute right-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <RotateCcw className="h-[17px] w-[17px] text-ink" strokeWidth={1.7} />
      </button>

      {/* Task Title */}
      <span className="absolute left-[24px] top-[128px] text-[13px] font-light leading-none text-ink/60">
        Task Title
      </span>
      <div className="absolute left-[20px] top-[150px] flex h-[54px] w-[350px] items-center gap-[10px] rounded-[14px] bg-white px-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <Type className="h-[18px] w-[18px] text-ink/35" strokeWidth={1.7} />
        <span className="text-[14px] font-light text-ink/40">Task name</span>
      </div>

      {/* Task Details */}
      <span className="absolute left-[24px] top-[224px] text-[13px] font-light leading-none text-ink/60">
        Task Details
      </span>
      <div className="absolute left-[20px] top-[246px] flex h-[96px] w-[350px] items-start gap-[10px] rounded-[14px] bg-white px-[14px] pt-[15px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <AlignLeft className="h-[18px] w-[18px] text-ink/35" strokeWidth={1.7} />
        <span className="text-[14px] font-light text-ink/40">Task details</span>
      </div>

      {/* Priority */}
      <span className="absolute left-[24px] top-[390px] text-[13px] font-light leading-none text-ink/60">
        Priority
      </span>
      <Priority left={20} label="Low" color="#0078FD" />
      <Priority left={141} label="Medium" color="#F2964E" active />
      <Priority left={262} label="High" color="#E84D3A" />

      {/* Date */}
      <span className="absolute left-[24px] top-[484px] text-[13px] font-light leading-none text-ink/60">
        Date
      </span>
      <DateCard left={20} title="Today" sub="Sat, Jul 18" active />
      <DateCard left={140} title="Tomorrow" sub="Sun, Jul 19" />
      <DateCard left={260} title="Next Week" sub="Sat, Jul 25" />

      {/* Select Due Date */}
      <span className="absolute left-[24px] top-[616px] text-[13px] font-light leading-none text-ink/60">
        Select Due Date
      </span>
      <div className="absolute left-[20px] top-[638px] flex h-[54px] w-[350px] items-center justify-between rounded-[14px] bg-white pl-[14px] pr-[8px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <span className="text-[14px] font-light text-ink/40">Date</span>
        <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[11px] bg-ink">
          <Calendar className="h-[16px] w-[16px] text-white" strokeWidth={1.8} />
        </span>
      </div>

      {/* Add Reminder */}
      <button className="absolute left-[20px] top-[800px] flex h-[54px] w-[350px] items-center justify-center gap-[9px] rounded-[16px] bg-ink shadow-[0_8px_24px_rgba(20,10,50,0.28)]">
        <Bell className="h-[18px] w-[18px] text-white" strokeWidth={1.9} />
        <span className="text-[16px] font-normal leading-none text-white">
          Add Reminder
        </span>
      </button>
    </div>
  );
}
