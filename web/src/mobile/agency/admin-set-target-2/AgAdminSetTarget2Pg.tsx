import type { CSSProperties, ReactNode } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Moon,
  Inbox,
  Mail,
  MailWarning,
  MailCheck,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  Wind,
  Users,
  Flag,
  Phone,
  Target,
  Plus,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

/**
 * Agency · Admin — Set Target (state 2 / "Add Creator" modal open).
 * Figma frame 2013:8405 ("Admin- set target", 375×943), reproduced from the
 * node-tree outline. The frame clips at 943px, so only the header, leads banner,
 * Lead Matrix, Team Glance and Set-Target cards are visible behind the modal
 * overlay. Static, self-contained.
 */

const font = (
  family: string,
  weight: number,
  size: number,
  lh: number,
  color: string,
  align: "left" | "center" | "right" = "left"
): CSSProperties => ({
  fontFamily: `${family}, sans-serif`,
  fontWeight: weight,
  fontSize: size,
  lineHeight: `${lh}px`,
  color,
  textAlign: align,
  margin: 0,
});

const CLASH = "'Clash Display'";

function SegBtn({
  left,
  top,
  label,
  labelFamily = CLASH,
  border,
}: {
  left: number;
  top: number;
  label: string;
  labelFamily?: string;
  border?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 30,
        height: 30,
        borderRadius: 9999,
        background: "#FFFFFF",
        border: border ? `1px solid ${border}` : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={font(labelFamily, 500, 15, 24, "#000000", "center")}>{label}</span>
    </div>
  );
}

function StatusPill({
  left,
  top,
  width,
  dotColor,
  label,
}: {
  left: number;
  top: number;
  width: number;
  dotColor: string;
  label: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height: 20,
        borderRadius: 24,
        background: "#FFFFFF",
        border: "1px solid #000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: 9999, background: dotColor, display: "inline-block" }} />
      <span style={font("Inter", 500, 8, 16, "#222222", "center")}>{label}</span>
    </div>
  );
}

function LeadPill({
  left,
  top,
  width,
  bg,
  icon,
  label,
  labelColor,
}: {
  left: number;
  top: number;
  width: number;
  bg: string;
  icon: ReactNode;
  label: string;
  labelColor: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height: 23,
        borderRadius: 24,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
    >
      {icon}
      <span style={font("Inter", 600, 8, 16, labelColor, "center")}>{label}</span>
    </div>
  );
}

export default function AgAdminSetTarget2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 943, background: "#DBDBDB", fontFamily: "Inter, sans-serif" }}
    >
      {/* ── background frame ── */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 375, height: 943, background: "#FDFDFD" }} />
      {/* background image placeholder (Rectangle, fill=IMAGE) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 375,
          height: 943,
          background: "linear-gradient(160deg,#F6F1F9 0%,#EFE9F5 55%,#F4EAF1 100%)",
        }}
      />

      {/* ── status bar ── */}
      <div style={{ position: "absolute", left: 19, top: 32, width: 54, ...font("Urbanist", 600, 15, 18, "#000000", "left") }}>
        19:56
      </div>
      <div style={{ position: "absolute", left: 292, top: 34, width: 66, height: 12, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
        <Signal size={16} color="#000000" strokeWidth={2.2} />
        <Wifi size={15} color="#000000" strokeWidth={2.2} />
        <BatteryFull size={24} color="#000000" strokeWidth={1.6} />
      </div>

      {/* ── header: avatar + name + toggle ── */}
      <div style={{ position: "absolute", left: 19, top: 71, width: 40, height: 40, borderRadius: 64, background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)" }} />
      <div style={{ position: "absolute", left: 44, top: 105, width: 8, height: 8, borderRadius: 9999, background: "#20A271" }} />
      <div style={{ position: "absolute", left: 71, top: 75, width: 130, ...font(CLASH, 600, 13.6, 24, "#111827") }}>Rohit Kumar</div>
      <div style={{ position: "absolute", left: 71, top: 90, width: 130, ...font("Inter", 400, 10, 24, "#000000") }}>Manager</div>

      {/* header top-right: OFF pill + arrow-up chip + red dot */}
      <div style={{ position: "absolute", left: 348, top: 71, width: 8, height: 8, borderRadius: 9999, background: "#EF4444" }} />
      <div
        style={{
          position: "absolute",
          left: 258,
          top: 80,
          width: 53,
          height: 22,
          borderRadius: 14,
          background: "#FFFFFF",
          border: "0.6px solid #000000",
          display: "flex",
          alignItems: "center",
          gap: 3,
          paddingLeft: 6,
        }}
      >
        <Moon size={14} color="#000000" strokeWidth={1.4} />
        <span style={font("Inter", 500, 11.7, 16, "#4A4C4B")}>OFF</span>
      </div>
      <div style={{ position: "absolute", left: 326, top: 74, width: 36, height: 36, borderRadius: 80, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ArrowUp size={20} color="#000000" strokeWidth={2} />
      </div>

      {/* ── "3 new leads waiting" banner ── */}
      <div style={{ position: "absolute", left: 17, top: 132, width: 341, height: 56, borderRadius: 16, background: "#E5D8F1", border: "1px solid #000000" }} />
      <div style={{ position: "absolute", left: 30, top: 142.5, width: 35.4, height: 35.4, borderRadius: 9999, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Inbox size={19} color="#1D1D1D" strokeWidth={2} />
      </div>
      <div style={{ position: "absolute", left: 77.2, top: 143.5, width: 200, ...font(CLASH, 500, 14.7, 19.7, "#1F1F1F") }}>3 new leads waiting</div>
      <div style={{ position: "absolute", left: 77.2, top: 162.1, width: 160, ...font("Inter", 400, 11.8, 15.7, "#1F1F1F") }}>From your landing page</div>
      <div style={{ position: "absolute", left: 314.6, top: 146.4, width: 27.5, height: 27.5, borderRadius: 9999, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ArrowUpRight size={15} color="#000000" strokeWidth={2.2} />
      </div>

      {/* ── Lead Matrix card ── */}
      <div style={{ position: "absolute", left: 16, top: 205, width: 343, height: 268, borderRadius: 12, background: "#FFFFFF" }} />
      {/* header */}
      <div style={{ position: "absolute", left: 26, top: 220, width: 30, height: 30, borderRadius: 9999, background: "#FFFFFF", border: "1px solid #E8E8E8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TrendingUp size={16} color="#000000" strokeWidth={1.6} />
      </div>
      <div style={{ position: "absolute", left: 62, top: 224, width: 130, ...font(CLASH, 500, 15, 24, "#111827") }}>Lead Matrix</div>
      <SegBtn left={245} top={220} label="D" border="#EFEFEF" />
      <SegBtn left={279} top={220} label="W" />
      <SegBtn left={313} top={220} label="M" />

      {/* tiles row 1 */}
      <div style={{ position: "absolute", left: 26, top: 262, width: 160, height: 94, borderRadius: 16, background: "#EEDFFF", border: "1px solid #000000" }} />
      <div style={{ position: "absolute", left: 26, top: 262, width: 160, height: 94, borderRadius: 15, background: "#FFFFFF" }} />
      <div style={{ position: "absolute", left: 48.5, top: 274.5, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TrendingUp size={22} color="#000000" strokeWidth={2} />
      </div>
      <div style={{ position: "absolute", left: 48.5, top: 312.5, width: 130, ...font("Inter", 700, 20, 28, "#000000") }}>2&nbsp;&nbsp;New Lead</div>

      <div style={{ position: "absolute", left: 193, top: 262, width: 158, height: 94, borderRadius: 16, background: "#FEFFDF", border: "1px solid #000000" }} />
      <div style={{ position: "absolute", left: 193, top: 262, width: 158, height: 94, borderRadius: 15, background: "#FFFFFF" }} />
      <div style={{ position: "absolute", left: 214.5, top: 274.5, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Inbox size={22} color="#000000" strokeWidth={2} />
      </div>
      <div style={{ position: "absolute", left: 214.5, top: 312.5, width: 130, ...font("Inter", 700, 20, 28, "#000000") }}>20&nbsp;&nbsp;Unattended</div>

      {/* tiles row 2 */}
      <div style={{ position: "absolute", left: 26, top: 363, width: 160, height: 94, borderRadius: 16, background: "#E9FFE8", border: "1px solid #000000" }} />
      <div style={{ position: "absolute", left: 26, top: 363, width: 160, height: 94, borderRadius: 15, background: "#FFFFFF" }} />
      <div style={{ position: "absolute", left: 48.5, top: 375.5, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MessageCircle size={22} color="#000000" strokeWidth={2} />
      </div>
      <div style={{ position: "absolute", left: 48.5, top: 413.5, width: 130, ...font("Inter", 700, 20, 28, "#000000") }}>16&nbsp;&nbsp;Contacted</div>

      <div style={{ position: "absolute", left: 193, top: 363, width: 158, height: 94, borderRadius: 16, background: "#FFE5F3", border: "1px solid #000000" }} />
      <div style={{ position: "absolute", left: 193, top: 363, width: 158, height: 94, borderRadius: 15, background: "#FFFFFF" }} />
      <div style={{ position: "absolute", left: 214.5, top: 376.5, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckCircle2 size={20} color="#000000" strokeWidth={2} />
      </div>
      <div style={{ position: "absolute", left: 214.5, top: 412.5, width: 130, ...font("Inter", 700, 20, 28, "#000000") }}>06&nbsp;&nbsp;Converted</div>

      {/* ── Team Glance card ── */}
      <div style={{ position: "absolute", left: 16, top: 490, width: 343, height: 323, borderRadius: 12, background: "#FFFFFF", border: "1px solid #000000" }} />
      {/* header */}
      <div style={{ position: "absolute", left: 25, top: 505, width: 34, height: 34, borderRadius: 9999, background: "#FFFFFF", border: "1px solid #E8E8E8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Wind size={18} color="#000000" strokeWidth={2} />
      </div>
      <div style={{ position: "absolute", left: 63, top: 506, width: 120, ...font(CLASH, 500, 15, 24, "#111827") }}>Team Glance</div>
      <StatusPill left={213} top={510} width={61} dotColor="#4CCC16" label="18 Active" />
      <StatusPill left={280} top={510} width={62} dotColor="#737572" label="4 Absent" />
      <div style={{ position: "absolute", left: 63, top: 523.5, width: 16, height: 16, display: "flex", alignItems: "center" }}>
        <Users size={16} color="#000000" strokeWidth={2} fill="#000000" />
      </div>
      <div style={{ position: "absolute", left: 84, top: 521, width: 120, ...font(CLASH, 400, 10, 24, "#000000") }}>22 Members</div>
      <SegBtn left={248} top={548} label="D" border="#DCDCDC" />
      <SegBtn left={282} top={548} label="W" labelFamily="Urbanist" />
      <SegBtn left={316} top={548} label="M" labelFamily="Urbanist" />

      {/* Sales input row */}
      <div style={{ position: "absolute", left: 29, top: 591, width: 317, height: 83, borderRadius: 8, background: "#FFFFFF", border: "1px solid #E5E7EB" }} />
      <div style={{ position: "absolute", left: 39, top: 599, width: 34, height: 34, borderRadius: 64, background: "#FDFFBC", border: "1px solid #373636", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Users size={20} color="#000000" strokeWidth={1.8} />
      </div>
      <div style={{ position: "absolute", left: 82, top: 596, width: 120, ...font(CLASH, 500, 15, 24, "#000000") }}>Sales</div>
      <div style={{ position: "absolute", left: 82, top: 616.7, width: 11, height: 11, display: "flex", alignItems: "center" }}>
        <Users size={11} color="#000000" strokeWidth={2} fill="#000000" />
      </div>
      <div style={{ position: "absolute", left: 96.3, top: 615, width: 90, ...font(CLASH, 400, 9, 16, "#000000") }}>12 Members</div>
      <StatusPill left={201} top={603} width={61} dotColor="#4CCC16" label="10 Active" />
      <StatusPill left={268} top={603} width={62} dotColor="#737572" label="2 Absent" />
      <LeadPill left={82} top={640} width={80} bg="#5C9AFF" labelColor="#F4F4F4" label="8 Leads" icon={<Mail size={12} color="#FFFFFF" strokeWidth={1.6} />} />
      <LeadPill left={166} top={640} width={77} bg="#FFBF52" labelColor="#FFFFFF" label="4 Leads" icon={<MailWarning size={12} color="#FFFFFF" strokeWidth={1.6} />} />
      <LeadPill
        left={247}
        top={640}
        width={77}
        bg="#52B594"
        labelColor="#FFFFFF"
        label="7 Leads"
        icon={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            <MailCheck size={12} color="#FFFFFF" strokeWidth={1.6} />
            <Phone size={8} color="#FFFFFF" strokeWidth={1.4} />
          </span>
        }
      />

      {/* Operation input row */}
      <div style={{ position: "absolute", left: 29, top: 682, width: 317, height: 83, borderRadius: 8, background: "#FFFFFF", border: "1px solid #E5E7EB" }} />
      <div style={{ position: "absolute", left: 39, top: 690, width: 34, height: 34, borderRadius: 64, background: "#ECC5F5", border: "1px solid #373636", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Users size={20} color="#000000" strokeWidth={1.8} />
      </div>
      <div style={{ position: "absolute", left: 82, top: 687, width: 120, ...font(CLASH, 500, 15, 24, "#000000") }}>Operation</div>
      <div style={{ position: "absolute", left: 82, top: 708.7, width: 11, height: 11, display: "flex", alignItems: "center" }}>
        <Users size={11} color="#000000" strokeWidth={2} fill="#000000" />
      </div>
      <div style={{ position: "absolute", left: 96.3, top: 707, width: 90, ...font(CLASH, 400, 9, 16, "#000000") }}>10 Members</div>
      <StatusPill left={198} top={693} width={61} dotColor="#4CCC16" label="8 Active" />
      <StatusPill left={265} top={693} width={62} dotColor="#737572" label="2 Absent" />
      <LeadPill left={82} top={731} width={84} bg="#5C9AFF" labelColor="#FFFFFF" label="5 Campaign" icon={<Flag size={12} color="#FFFFFF" strokeWidth={1.6} />} />

      {/* Team card corner arrow */}
      <div style={{ position: "absolute", left: 317, top: 773, width: 29, height: 27.9, borderRadius: 27, background: "#FFFFFF", border: "1px solid #EAEAEA", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ArrowUpRight size={17} color="#000000" strokeWidth={1.7} />
      </div>

      {/* ── Set Target card ── */}
      <div style={{ position: "absolute", left: 16, top: 841, width: 341, height: 81, borderRadius: 16, background: "#E1FFA1", border: "1px solid #000000" }} />
      <div style={{ position: "absolute", left: 32, top: 863, width: 36, height: 36, borderRadius: 9999, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Target size={18} color="#101010" strokeWidth={2} />
      </div>
      <div style={{ position: "absolute", left: 79, top: 858, width: 160, ...font("Outfit", 500, 13.3, 17.8, "#1F1F1F") }}>200k your revenue target</div>
      <div style={{ position: "absolute", left: 79, top: 883, width: 143, height: 6, borderRadius: 9999, background: "#FFFFFF" }} />
      <div style={{ position: "absolute", left: 79, top: 883, width: 47, height: 6, borderRadius: 9999, background: "#9CD620" }} />
      <div style={{ position: "absolute", left: 79, top: 890, width: 170, ...font("Inter", 400, 10, 16, "#1F1F1F") }}>You’ve achieved 45% of revenue</div>
      <div style={{ position: "absolute", left: 253, top: 867, width: 86, height: 28, borderRadius: 24, background: "#FFFFFF", display: "flex", alignItems: "center", paddingLeft: 8, gap: 2 }}>
        <span style={font("Outfit", 400, 12, 16, "#000000")}>Set Target</span>
        <ArrowUpRight size={16} color="#000000" strokeWidth={2} />
      </div>

      {/* ── modal overlay (Frame 1171275293): dim scrim + Add Creator card ── */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 375, height: 943, background: "rgba(0,0,0,0.45)" }} />

      {/* Add Creator card */}
      <div style={{ position: "absolute", left: 17, top: 402.5, width: 341, height: 161, borderRadius: 16, background: "#F8EBF2", border: "1px solid #000000" }} />
      <div style={{ position: "absolute", left: 18, top: 403.5, width: 339, height: 160, borderRadius: 15, background: "#FFFFFF" }} />
      <div style={{ position: "absolute", left: 33, top: 422.5, width: 120, ...font("Outfit", 600, 15, 24, "#111827") }}>Add Creator</div>

      {/* Send Invite button */}
      <div style={{ position: "absolute", left: 204, top: 420.5, width: 95, height: 28, borderRadius: 24, background: "#F2C4DD", display: "flex", alignItems: "center", paddingLeft: 8, gap: 3 }}>
        <span style={font("Outfit", 400, 12, 16, "#000000")}>Send Invite</span>
        <ArrowUpRight size={16} color="#000000" strokeWidth={2} />
      </div>
      {/* Plus button */}
      <div style={{ position: "absolute", left: 318, top: 420.5, width: 28, height: 28, borderRadius: 9999, background: "#FFFFFF", border: "1px solid #D4D4D4", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Plus size={17} color="#000000" strokeWidth={2.4} />
      </div>

      {/* input fields */}
      <div style={{ position: "absolute", left: 33, top: 462.5, width: 309, height: 34, borderRadius: 8, background: "#FAFAFA", border: "1px solid #FFFFFF", display: "flex", alignItems: "center", paddingLeft: 6 }}>
        <span style={font("Inter", 400, 12, 16, "#7F7F7F")}>Enter creator’s name</span>
      </div>
      <div style={{ position: "absolute", left: 33, top: 505.5, width: 309, height: 34, borderRadius: 8, background: "#FAFAFA", border: "1px solid #FFFFFF", display: "flex", alignItems: "center", paddingLeft: 6 }}>
        <span style={font("Inter", 400, 12, 16, "#7F7F7F")}>Enter creator’s email address</span>
      </div>
    </div>
  );
}
