import { ArrowUp, Wifi, Signal, BatteryFull } from "lucide-react";

/**
 * AgReminder2Pg — "Add Reminder" agency screen, pixel-exact to Figma node 842:7741.
 * Static, no props. All nodes absolute-positioned with frame-relative coordinates.
 */
export default function AgReminder2Pg() {
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
      {/* FRAME '2' — scrollable content background */}
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

      {/* ---- Decorative blurred blobs (rendered behind frosted overlay) ---- */}
      {/* Group 35897 @(-4,1798) */}
      <div
        style={{
          position: "absolute",
          left: 3.8,
          top: 1891.1,
          width: 204.3,
          height: 196.5,
          borderRadius: "50%",
          background: "#FBB7C6",
          filter: "blur(30px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -4,
          top: 1798,
          width: 196.5,
          height: 191.1,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #F3D29F, #EE9688)",
          filter: "blur(30px)",
        }}
      />
      {/* Group 35897 @(47.6,457.6) */}
      <div
        style={{
          position: "absolute",
          left: 66.6,
          top: 612,
          width: 493.7,
          height: 488.6,
          borderRadius: "50%",
          background: "#FF90A9",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 135.2,
          top: 457.6,
          width: 476.7,
          height: 473.2,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #8673B3, #A79AC6)",
          filter: "blur(40px)",
        }}
      />
      {/* Group 35898 @(-25,93) */}
      <div
        style={{
          position: "absolute",
          left: -16.4,
          top: 167.5,
          width: 163.4,
          height: 157.1,
          borderRadius: "50%",
          background: "#CCF5FD",
          filter: "blur(30px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -25,
          top: 93,
          width: 157.1,
          height: 152.8,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(70,181,252,0.7), rgba(143,190,255,0.7))",
          filter: "blur(30px)",
        }}
      />

      {/* RECTANGLE fill=IMAGE @(-13,0) 402x2045 — frosted overlay placeholder */}
      <div
        style={{
          position: "absolute",
          left: -13,
          top: 0,
          width: 402,
          height: 2045,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.4))",
          backdropFilter: "blur(50px)",
          WebkitBackdropFilter: "blur(50px)",
        }}
      />

      {/* ---- Header Container @(0,70) 375x54 ---- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 70,
          width: 375,
          height: 54,
          background: "#FFFFFF",
          borderBottom: "1px solid #717171",
        }}
      />
      {/* meteor-icons:arrow-up @(16,85) 24x24 */}
      <div style={{ position: "absolute", left: 16, top: 85, width: 24, height: 24 }}>
        <ArrowUp size={24} color="#000000" strokeWidth={2} />
      </div>
      {/* TEXT 'Add Reminder' @(44,82) */}
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 82,
          width: 298,
          height: 30,
          color: "#1B1B1C",
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "37px",
          textAlign: "left",
        }}
      >
        Add Reminder
      </div>

      {/* ---- Main card Container @(16,146) 343x750 ---- */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 146,
          width: 343,
          height: 750,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 12,
        }}
      />

      {/* Task Title heading @(28,161) */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 161,
          width: 99,
          height: 22,
          color: "#040404",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Task Title
      </div>
      {/* Task Title input @(28,188) 320x38 */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 188,
          width: 320,
          height: 38,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 195,
          width: 244,
          height: 24,
          color: "#000000",
          fontWeight: 400,
          fontSize: 13,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Task Name
      </div>

      {/* Task Details heading @(28,239) */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 239,
          width: 286,
          height: 22,
          color: "#040404",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Task Details
      </div>
      {/* Task Details input @(28,266) 320x38 */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 266,
          width: 320,
          height: 38,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 273,
          width: 248,
          height: 24,
          color: "#000000",
          fontWeight: 400,
          fontSize: 13,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Task Details
      </div>

      {/* Priority label @(28,316) */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 316,
          width: 45,
          height: 16,
          color: "#000000",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "16.2px",
          textAlign: "left",
        }}
      >
        Priority{" "}
      </div>
      {/* Priority chip — Low @(28,345) 97x38 */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 345,
          width: 97,
          height: 38,
          background: "#FFFFFF",
          border: "2px solid #0078FD",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 355,
          width: 64,
          height: 18,
          color: "#0078FD",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "17.5px",
          textAlign: "center",
        }}
      >
        Low
      </div>
      {/* Priority chip — Medium @(130,345) 115x38 */}
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 345,
          width: 115,
          height: 38,
          background: "#FFFFFF",
          border: "2px solid #F2964E",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 146,
          top: 355,
          width: 81,
          height: 18,
          color: "#F2964E",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "17.5px",
          textAlign: "center",
        }}
      >
        Medium
      </div>
      {/* Priority chip — High @(250,345) 97x38 */}
      <div
        style={{
          position: "absolute",
          left: 250,
          top: 345,
          width: 97,
          height: 38,
          background: "#FFFFFF",
          border: "2px solid #E84D3A",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 266,
          top: 355,
          width: 64,
          height: 18,
          color: "#E84D3A",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "17.5px",
          textAlign: "center",
        }}
      >
        High
      </div>

      {/* Divider Line 28 @(28,398) 320 wide */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 398,
          width: 320,
          height: 0,
          borderTop: "1px solid #AEACAF",
        }}
      />

      {/* Date label @(28,410) */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 410,
          width: 30,
          height: 16,
          color: "#000000",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "16.2px",
          textAlign: "left",
        }}
      >
        Date
      </div>

      {/* Date button — Today @(28,436) 100x69 */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 436,
          width: 100,
          height: 69,
          background: "#000000",
          border: "1px solid #000000",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 59.3,
          top: 450,
          width: 37.6,
          height: 18.7,
          color: "#374151",
          fontWeight: 500,
          fontSize: 11.9,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        Today
      </div>
      <div
        style={{
          position: "absolute",
          left: 48,
          top: 475,
          width: 59.9,
          height: 16,
          color: "#6B7280",
          fontWeight: 400,
          fontSize: 10.2,
          lineHeight: "16px",
          textAlign: "center",
        }}
      >
        Sat, Jun 19
      </div>

      {/* Date button — Tomorrow @(136,435) 100x69 */}
      <div
        style={{
          position: "absolute",
          left: 136,
          top: 435,
          width: 100,
          height: 69,
          background: "#000000",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 154,
          top: 449,
          width: 64.7,
          height: 18.7,
          color: "#374151",
          fontWeight: 500,
          fontSize: 11.9,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        Tomorrow
      </div>
      <div
        style={{
          position: "absolute",
          left: 158,
          top: 473,
          width: 59,
          height: 16,
          color: "#6B7280",
          fontWeight: 400,
          fontSize: 10.2,
          lineHeight: "16px",
          textAlign: "center",
        }}
      >
        Sun, Jun 20
      </div>

      {/* Date button — Next Week @(244,436) 100x69 */}
      <div
        style={{
          position: "absolute",
          left: 244,
          top: 436,
          width: 100,
          height: 69,
          background: "#000000",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 259,
          top: 451,
          width: 69.5,
          height: 18.7,
          color: "#374151",
          fontWeight: 500,
          fontSize: 11.9,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        Next Week
      </div>
      <div
        style={{
          position: "absolute",
          left: 263.2,
          top: 473.7,
          width: 59.9,
          height: 16,
          color: "#6B7280",
          fontWeight: 400,
          fontSize: 10.2,
          lineHeight: "16px",
          textAlign: "center",
        }}
      >
        Mon, Jun 26
      </div>

      {/* Due Date label @(28,517) */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 517,
          width: 58,
          height: 16,
          color: "#0D0D0D",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "16.2px",
          textAlign: "left",
        }}
      >
        Due Date
      </div>

      {/* Due Date pill container @(28,543) 320x57 */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 543,
          width: 320,
          height: 57,
          background: "#373737",
          border: "1px solid #191818",
          borderRadius: 28,
        }}
      />
      {/* Day chip — 13 jun @(2,553) 66x37 */}
      <div
        style={{
          position: "absolute",
          left: 2,
          top: 553,
          width: 66,
          height: 37,
          background: "#A8A9A8",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 11,
          top: 560,
          width: 49,
          height: 23,
          color: "#000000",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        13 jun
      </div>
      {/* Day chip — 11 jun @(76,553) 66x37 */}
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 553,
          width: 66,
          height: 37,
          background: "#A8A9A8",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 85,
          top: 560,
          width: 49,
          height: 23,
          color: "#000000",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        11 jun
      </div>
      {/* Day chip — 12 jun / Today (selected) @(150,548) 75x47 */}
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 548,
          width: 75,
          height: 47,
          background: "#E0D0FF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 163,
          top: 543,
          width: 49,
          height: 45,
          color: "#0D0D0D",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "16px",
          textAlign: "center",
          whiteSpace: "pre-line",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {"12 jun\nToday"}
      </div>
      {/* Day chip — 13 jun @(233,553) 66x37 */}
      <div
        style={{
          position: "absolute",
          left: 233,
          top: 553,
          width: 66,
          height: 37,
          background: "#A8A9A8",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 242,
          top: 560,
          width: 49,
          height: 23,
          color: "#000000",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        13 jun
      </div>
      {/* Day chip — 13 jun @(307,553) 66x37 */}
      <div
        style={{
          position: "absolute",
          left: 307,
          top: 553,
          width: 66,
          height: 37,
          background: "#A8A9A8",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 316,
          top: 560,
          width: 49,
          height: 23,
          color: "#000000",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        13 jun
      </div>

      {/* Create Task button @(19,812) 335x48 */}
      <div
        style={{
          position: "absolute",
          left: 19,
          top: 812,
          width: 335,
          height: 48,
          background: "#B7D0EE",
          border: "1px solid #000000",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 101.5,
          top: 828,
          width: 170,
          height: 16,
          color: "#333333",
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "18.5px",
          textAlign: "center",
        }}
      >
        Create Task
      </div>

      {/* ---- Status bar @(0,5) 375x44 ---- */}
      <div
        style={{
          position: "absolute",
          left: 21,
          top: 19,
          width: 54,
          height: 18,
          color: "#000000",
          fontFamily: "Urbanist, sans-serif",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "18px",
          textAlign: "center",
        }}
      >
        19:56
      </div>
      {/* Cellular @(294,22.7) */}
      <div style={{ position: "absolute", left: 294, top: 22, width: 17, height: 11 }}>
        <Signal size={16} color="#000000" strokeWidth={2} />
      </div>
      {/* Wifi @(316,22.3) */}
      <div style={{ position: "absolute", left: 315, top: 22, width: 16, height: 11 }}>
        <Wifi size={16} color="#000000" strokeWidth={2} />
      </div>
      {/* Battery @(336.3,22.3) */}
      <div style={{ position: "absolute", left: 335, top: 21, width: 25, height: 12 }}>
        <BatteryFull size={22} color="#000000" strokeWidth={2} />
      </div>
    </div>
  );
}
