import {
  ArrowLeft,
  Pencil,
  ChevronRight,
  Users,
  MoreVertical,
  Wifi,
  Signal,
} from "lucide-react";

const CLASH = "'Clash Display', sans-serif";
const INTER = "Inter, sans-serif";
const URBANIST = "Urbanist, sans-serif";

export default function AgTeamsPeople2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 946,
        background: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* FRAME '2' background */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 375,
          height: 2062,
          background: "#FDFDFD",
        }}
      />

      {/* Decorative blobs (behind background image) */}
      <div style={{ position: "absolute", left: 3.8, top: 1891.1, width: 204.3, height: 196.5, background: "#FBB7C6", borderRadius: 9999 }} />
      <div style={{ position: "absolute", left: -4, top: 1798, width: 196.5, height: 191.1, background: "linear-gradient(135deg, #F3D29F, #EE9688)", borderRadius: 9999 }} />
      <div style={{ position: "absolute", left: 66.6, top: 612, width: 493.7, height: 488.6, background: "#FF90A9", borderRadius: 9999 }} />
      <div style={{ position: "absolute", left: 135.2, top: 457.6, width: 476.7, height: 473.2, background: "linear-gradient(135deg, #8673B3, #A79AC6)", borderRadius: 9999 }} />
      <div style={{ position: "absolute", left: -16.4, top: 167.5, width: 163.4, height: 157.1, background: "#CCF5FD", borderRadius: 9999 }} />
      <div style={{ position: "absolute", left: -25, top: 93, width: 157.1, height: 152.8, background: "linear-gradient(135deg, rgba(70,181,252,0.7), rgba(143,190,255,0.7))", borderRadius: 9999 }} />

      {/* RECTANGLE 'Rectangle' fill=IMAGE placeholder */}
      <div
        style={{
          position: "absolute",
          left: -13,
          top: 0,
          width: 402,
          height: 2045,
          background: "linear-gradient(135deg, #E9E4F0, #D9CFEA)",
        }}
      />

      {/* Header Container */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 70,
          width: 375,
          height: 54,
          background: "#FFFFFF",
          border: "1px solid #717171",
          boxSizing: "border-box",
        }}
      />
      <ArrowLeft style={{ position: "absolute", left: 16, top: 85, width: 24, height: 24 }} size={24} strokeWidth={2} color="#000000" />
      <div style={{ position: "absolute", left: 44, top: 82, width: 298, height: 30, color: "#1B1B1C", fontFamily: CLASH, fontWeight: 500, fontSize: 20, lineHeight: "37px", textAlign: "left" }}>
        Team &amp; Roles
      </div>

      {/* Card ',manager view]' */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 136,
          width: 336,
          height: 795,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 8,
          boxSizing: "border-box",
        }}
      />

      {/* Row: edit + Teams & Roles + arrow */}
      <Pencil style={{ position: "absolute", left: 40, top: 152.5, width: 18, height: 18 }} size={18} strokeWidth={1.5} color="#000000" />
      <div style={{ position: "absolute", left: 76, top: 152.5, width: 234, height: 20, color: "#242220", fontFamily: CLASH, fontWeight: 500, fontSize: 14, lineHeight: "20px", textAlign: "left" }}>
        Teams &amp; Roles
      </div>
      <ChevronRight style={{ position: "absolute", left: 319, top: 152.5, width: 20, height: 20 }} size={20} strokeWidth={2} color="#000000" />

      {/* Input container (big) */}
      <div
        style={{
          position: "absolute",
          left: 34,
          top: 198,
          width: 303,
          height: 725,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          boxSizing: "border-box",
        }}
      />

      {/* Operations heading */}
      <div style={{ position: "absolute", left: 99, top: 205, width: 110, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "24px", textAlign: "left" }}>
        Operations
      </div>

      {/* Operations avatar */}
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 206,
          width: 42,
          height: 42,
          background: "#ECC5F5",
          border: "1px solid #373636",
          borderRadius: 9999,
          boxSizing: "border-box",
        }}
      />
      <Users style={{ position: "absolute", left: 53, top: 215, width: 22, height: 22 }} size={22} strokeWidth={2} color="#000000" />

      {/* 15 Members */}
      <Users style={{ position: "absolute", left: 99, top: 228.5, width: 15, height: 15 }} size={15} strokeWidth={2} color="#000000" />
      <div style={{ position: "absolute", left: 120, top: 226, width: 110, height: 21, color: "#000000", fontFamily: CLASH, fontWeight: 400, fontSize: 10, lineHeight: "24px", textAlign: "left" }}>
        15 Members
      </div>

      {/* 10 Active pill */}
      <div
        style={{
          position: "absolute",
          left: 266,
          top: 206,
          width: 61,
          height: 20,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 24,
          boxSizing: "border-box",
        }}
      />
      <div style={{ position: "absolute", left: 273.1, top: 212.6, width: 7.7, height: 7.7, background: "#4CCC16", borderRadius: 9999 }} />
      <div style={{ position: "absolute", left: 282.5, top: 210, width: 40, height: 12, color: "#222222", fontFamily: INTER, fontWeight: 500, fontSize: 8, lineHeight: "16px", textAlign: "center" }}>
        &nbsp;10 Active
      </div>

      {/* Member row: Vishal Sharma */}
      <div
        style={{
          position: "absolute",
          left: 41,
          top: 266,
          width: 286,
          height: 62,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          boxSizing: "border-box",
        }}
      />
      <div style={{ position: "absolute", left: 106, top: 274, width: 110, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "24px", textAlign: "left" }}>
        Vishal Sharma
      </div>
      <div
        style={{
          position: "absolute",
          left: 51,
          top: 274,
          width: 42,
          height: 42,
          background: "#C6A6DF",
          border: "1px solid #373636",
          borderRadius: 9999,
          boxSizing: "border-box",
        }}
      />
      <div style={{ position: "absolute", left: 66, top: 283, width: 11, height: 24, color: "#6000AA", fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "24px", textAlign: "center" }}>
        V
      </div>
      <MoreVertical style={{ position: "absolute", left: 304, top: 273, width: 20, height: 20 }} size={20} strokeWidth={2} color="#000000" />
      <div style={{ position: "absolute", left: 106, top: 293, width: 99, height: 23, color: "#000000", fontFamily: INTER, fontWeight: 400, fontSize: 10, lineHeight: "24px", textAlign: "left" }}>
        Manager
      </div>
      <div
        style={{
          position: "absolute",
          left: 226,
          top: 276,
          width: 53,
          height: 20,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 24,
          boxSizing: "border-box",
        }}
      />
      <div style={{ position: "absolute", left: 232, top: 280, width: 41, height: 12, color: "#4CCC16", fontFamily: INTER, fontWeight: 500, fontSize: 8, lineHeight: "16px", textAlign: "center" }}>
        Active
      </div>

      {/* Attendance & Leaves row ('36') */}
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 343,
          width: 283,
          height: 38,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 8,
          boxSizing: "border-box",
        }}
      />
      <div style={{ position: "absolute", left: 56, top: 352, width: 234, height: 20, color: "#242220", fontFamily: CLASH, fontWeight: 500, fontSize: 14, lineHeight: "20px", textAlign: "left" }}>
        Attendance &amp; Leaves
      </div>
      <ChevronRight style={{ position: "absolute", left: 300, top: 350, width: 20, height: 24 }} size={20} strokeWidth={2} color="#000000" />

      {/* Detailed Information heading + Add Information button */}
      <div style={{ position: "absolute", left: 44, top: 399, width: 149, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 13, lineHeight: "20px", textAlign: "left" }}>
        Detailed Information
      </div>
      <div
        style={{
          position: "absolute",
          left: 224,
          top: 400,
          width: 101,
          height: 23,
          background: "#212020",
          border: "1px solid #131414",
          borderRadius: 8,
          boxSizing: "border-box",
        }}
      />
      <div style={{ position: "absolute", left: 232, top: 400, width: 85, height: 23, color: "#FFFDFD", fontFamily: CLASH, fontWeight: 500, fontSize: 10, lineHeight: "24px", textAlign: "center" }}>
        Add Information
      </div>

      {/* Detail rows box (Frame 177) */}
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 437,
          width: 281,
          height: 328,
          border: "1px solid #E8E8E8",
          boxSizing: "border-box",
        }}
      />

      {/* Detail rows */}
      {[
        { top: 437, ltop: 438, label: "Full Name", value: "Vishal Sharma", lh: "24px" },
        { top: 479, ltop: 480, label: "Join Date", value: "07/02/2025", lh: "24px" },
        { top: 521, ltop: 522, label: "Contact Number", value: "+91 8886543210", lh: "24px" },
        { top: 563, ltop: 564, label: "Email Address", value: "rohit@gmail.com", lh: "24px" },
        { top: 605, ltop: 605, label: "Employment Type", value: "Full Time", lh: "16px" },
        { top: 647, ltop: 647, label: "Assign As", value: "Manager", lh: "16px" },
        { top: 689, ltop: 689, label: "Reporting Manager", value: "Aryan Yadav", lh: "16px" },
        { top: 731, ltop: 731, label: "Birth Date", value: "22/05/1998", lh: "16px" },
      ].map((r) => (
        <div key={r.label}>
          <div style={{ position: "absolute", left: 44, top: r.ltop, width: 122, height: 24, color: "#040404", fontFamily: INTER, fontWeight: 500, fontSize: 13, lineHeight: r.lh, textAlign: "left" }}>
            {r.label}
          </div>
          <div style={{ position: "absolute", left: 196, top: r.top, width: 127, height: 24, color: "#000000", fontFamily: INTER, fontWeight: 400, fontSize: 14, lineHeight: "24px", textAlign: "left" }}>
            {r.value}
          </div>
        </div>
      ))}

      {/* Access Permission heading + Add Permissions button */}
      <div style={{ position: "absolute", left: 44, top: 780, width: 149, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 13, lineHeight: "20px", textAlign: "left" }}>
        Access Permission
      </div>
      <div
        style={{
          position: "absolute",
          left: 224,
          top: 781,
          width: 101,
          height: 23,
          background: "#212020",
          border: "1px solid #131414",
          borderRadius: 8,
          boxSizing: "border-box",
        }}
      />
      <div style={{ position: "absolute", left: 232, top: 781, width: 85, height: 23, color: "#FFFDFD", fontFamily: CLASH, fontWeight: 500, fontSize: 10, lineHeight: "24px", textAlign: "center" }}>
        Add Permissions
      </div>

      {/* Permission toggle rows */}
      {[
        { top: 818, label: "Assign leads/Campaigns", width: 163, knobLeft: 289.4, knobTop: 819.9, knobW: 32.9, knobH: 20.2 },
        { top: 852, label: "Reallocate campaigns & leads", width: 214, knobLeft: 287.4, knobTop: 853.3, knobW: 34.8, knobH: 21.4 },
        { top: 886, label: "Approve leaves", width: 224, knobLeft: 289.4, knobTop: 887.9, knobW: 32.9, knobH: 20.2 },
      ].map((t) => (
        <div key={t.label}>
          <div style={{ position: "absolute", left: 44, top: t.top, width: t.width, height: 24, color: "#000000", fontFamily: INTER, fontWeight: 400, fontSize: 14, lineHeight: "24px", textAlign: "left" }}>
            {t.label}
          </div>
          <div style={{ position: "absolute", left: 270, top: t.top, width: 54, height: 24, background: "#34C759", borderRadius: 9999 }} />
          <div style={{ position: "absolute", left: t.knobLeft, top: t.knobTop, width: t.knobW, height: t.knobH, background: "#FFFFFF", borderRadius: 9999 }} />
        </div>
      ))}

      {/* Status bar */}
      <div style={{ position: "absolute", left: 21, top: 19, width: 54, height: 18, color: "#000000", fontFamily: URBANIST, fontWeight: 600, fontSize: 15, lineHeight: "18px", textAlign: "center" }}>
        19:56
      </div>
      <Signal style={{ position: "absolute", left: 294, top: 22, width: 17, height: 11 }} size={17} strokeWidth={2} color="#000000" />
      <Wifi style={{ position: "absolute", left: 316, top: 22, width: 15, height: 11 }} size={15} strokeWidth={2} color="#000000" />
      {/* Battery */}
      <div style={{ position: "absolute", left: 336.3, top: 22.3, width: 22, height: 11.3, border: "1px solid #000000", borderRadius: 2.67, boxSizing: "border-box", opacity: 0.35 }} />
      <div style={{ position: "absolute", left: 359.3, top: 26, width: 1.3, height: 4, background: "#000000", borderRadius: 1, opacity: 0.4 }} />
      <div style={{ position: "absolute", left: 338.3, top: 24.3, width: 18, height: 7.3, background: "#000000", borderRadius: 1.33 }} />
    </div>
  );
}
