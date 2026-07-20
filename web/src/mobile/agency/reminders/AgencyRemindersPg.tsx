/**
 * Agency app — Reminders screen.
 * Exact reconstruction of Figma frame 7711:22526 ("Reminders"), 375×876.
 * Coordinates/sizes/colors/text traced from the Figma node tree (REST API).
 * Palette: cream #F8F5EF bg, dark #1F1A17 controls; fonts Geist (title) + Inter.
 */
import { ChevronLeft, Clock, Plus } from "lucide-react";

type Card = {
  top: number;
  time: string;         // white pill: clock + time
  label: string;        // gradient pill: HIGH/MEDIUM/LOW
  labelColor: string;   // priority label text color
  prColor: string;      // gradient badge bg (priority accent)
  eta: string;
  title: string;
  desc: string;
};

const CARDS: Card[] = [
  {
    top: 205,
    time: "10:00 AM",
    label: "HIGH",
    labelColor: "#993333",
    prColor: "linear-gradient(135deg, rgba(255,220,215,0.8), rgba(255,200,195,0.8))",
    eta: "in 2 hrs",
    title: "Campaign shoot review",
    desc: "Review the final cuts from the Base Skincare campaign and approve the deliverables before noon.",
  },
  {
    top: 416,
    time: "2:00 PM",
    label: "MEDIUM",
    labelColor: "#995511",
    prColor: "linear-gradient(135deg, rgba(255,235,210,0.8), rgba(255,220,180,0.8))",
    eta: "in 6 hrs",
    title: "Send invoice to Sephora",
    desc: "Draft and send the Q2 collaboration invoice to the Sephora PR team for the latest product launch.",
  },
  {
    top: 627,
    time: "4:30 PM",
    label: "LOW",
    labelColor: "#224499",
    prColor: "linear-gradient(135deg, rgba(225,240,255,0.8), rgba(200,225,255,0.8))",
    eta: "in 8 hrs",
    title: "Approve creator content",
    desc: "Check the draft reels submitted by Karan for the upcoming summer drop and provide feedback.",
  },
];

const TABS = [
  { x: 20, w: 118.2, label: "Today", count: "3", active: true },
  { x: 149.9, w: 146.6, label: "Schedule", count: "12", active: false },
  { x: 308.5, w: 100.3, label: "All", count: "24", active: false },
];

export default function AgencyRemindersPg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 876, background: "#F8F5EF", fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <button
        className="absolute grid place-items-center"
        style={{ left: 16, top: 22, width: 36, height: 36, background: "#1F1A17", borderRadius: 999, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
      >
        <ChevronLeft size={16} strokeWidth={1.35} color="#FAF7F2" />
      </button>
      <div
        className="absolute"
        style={{ left: 72, top: 28, width: 222, height: 24, color: "#141311", fontFamily: "Geist, Inter, sans-serif", fontWeight: 500, fontSize: 20, lineHeight: "24px" }}
      >
        Reminders
      </div>

      {/* Tabs */}
      {TABS.map((t) => (
        <div
          key={t.label}
          className="absolute flex items-center"
          style={{
            left: t.x,
            top: 118,
            width: t.w,
            height: 45,
            borderRadius: 28,
            border: "1px solid #FFFFFF",
            paddingLeft: 21,
            gap: 8,
            background: t.active
              ? "linear-gradient(135deg, rgba(200,240,215,0.85), rgba(180,230,200,0.85))"
              : "#FFFFFF",
          }}
        >
          <span style={{ color: t.active ? "#1F4D33" : "#6B627A", fontWeight: 600, fontSize: 15, lineHeight: "18.1px" }}>
            {t.label}
          </span>
          <span
            className="grid place-items-center"
            style={{ minWidth: 24, height: 19, background: "#FFFFFF", borderRadius: 12, padding: "0 6px", color: t.active ? "#1F4D33" : "#6B627A", fontWeight: 700, fontSize: 12 }}
          >
            {t.count}
          </span>
        </div>
      ))}

      {/* Reminder cards */}
      {CARDS.map((c) => (
        <div
          key={c.title}
          className="absolute overflow-hidden"
          style={{ left: 20, top: c.top, width: 335, height: 195, background: "#FFFFFF", border: "1px solid #FFFFFF", borderRadius: 32, boxShadow: "0 8px 24px rgba(30,26,43,0.06)" }}
        >
          {/* top row: time pill + priority label + eta */}
          <div className="absolute flex items-center" style={{ left: 25, top: 25, height: 30, gap: 8 }}>
            <span className="flex items-center" style={{ height: 30, background: "#FFFFFF", border: "1px solid #FFFFFF", borderRadius: 16, padding: "0 12px", gap: 4, boxShadow: "0 1px 3px rgba(30,26,43,0.06)" }}>
              <Clock size={14} color="#4A3A6B" strokeWidth={2.2} />
              <span style={{ color: "#4A3A6B", fontWeight: 700, fontSize: 13, lineHeight: "15.7px" }}>{c.time}</span>
            </span>
            <span className="grid place-items-center" style={{ height: 29, borderRadius: 16, border: "1px solid #FFFFFF", background: c.prColor, padding: "0 13px", color: c.labelColor, fontWeight: 700, fontSize: 12, lineHeight: "14.5px" }}>
              {c.label}
            </span>
          </div>
          <div
            className="absolute flex items-center"
            style={{ right: 25, top: 25, height: 29, background: "#F0EBFA", border: "1px solid #FFFFFF", borderRadius: 16, padding: "0 12px", gap: 6 }}
          >
            <Clock size={14} color="#7B6D9C" strokeWidth={2} />
            <span style={{ color: "#7B6D9C", fontWeight: 600, fontSize: 12, lineHeight: "14.5px" }}>{c.eta}</span>
          </div>

          {/* heading + description */}
          <div className="absolute" style={{ left: 25, top: 71, width: 285, color: "#1E1A2B", fontWeight: 600, fontSize: 20, lineHeight: "26px" }}>
            {c.title}
          </div>
          <div className="absolute" style={{ left: 25, top: 102, width: 285, color: "#6B627A", fontWeight: 400, fontSize: 15, lineHeight: "22.5px" }}>
            {c.desc}
          </div>
        </div>
      ))}

      {/* Floating CTA */}
      <button
        className="absolute flex items-center justify-center"
        style={{ left: 71, top: 791, width: 232, height: 56, background: "#312B28", borderRadius: 36, gap: 8, boxShadow: "0 10px 24px rgba(49,43,40,0.28)" }}
      >
        <Plus size={20} color="#FFFEFE" strokeWidth={1.67} />
        <span style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 16, lineHeight: "19.4px" }}>Add Reminder</span>
      </button>
    </div>
  );
}
