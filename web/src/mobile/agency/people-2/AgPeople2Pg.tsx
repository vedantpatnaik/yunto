import {
  ArrowLeft,
  SquarePen,
  ChevronDown,
  Users,
  MoreVertical,
  Wifi,
} from "lucide-react";

const clash = "'Clash Display', sans-serif";
const inter = "Inter, sans-serif";
const urbanist = "Urbanist, sans-serif";

export default function AgPeople2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 931,
        background: "#FFFFFF",
        borderRadius: 24,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ===== scrollable content frame '2' (2062 tall, clipped) ===== */}
      {/* --- decorative background blobs --- */}
      {/* Group 35898 (blue, top-left) */}
      <div
        style={{
          position: "absolute",
          left: -16.4,
          top: 167.5,
          width: 163.4,
          height: 157.1,
          borderRadius: 9999,
          background: "#CCF5FD",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -25,
          top: 93,
          width: 157.1,
          height: 152.8,
          borderRadius: 9999,
          background:
            "linear-gradient(135deg, rgba(70,181,252,0.7), rgba(143,190,255,0.7))",
        }}
      />
      {/* Group 35897 (purple / pink, mid) */}
      <div
        style={{
          position: "absolute",
          left: 66.6,
          top: 612,
          width: 493.7,
          height: 488.6,
          borderRadius: 9999,
          background: "#FF90A9",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 135.2,
          top: 457.6,
          width: 476.7,
          height: 473.2,
          borderRadius: 9999,
          background: "linear-gradient(135deg, #8673B3, #A79AC6)",
        }}
      />

      {/* Rectangle IMAGE overlay (frosted glass over blobs) */}
      <div
        style={{
          position: "absolute",
          left: -13,
          top: 0,
          width: 402,
          height: 2045,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.32))",
        }}
      />

      {/* ===== Header Container ===== */}
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
      {/* back arrow (meteor-icons:arrow-up ~ nav) */}
      <div style={{ position: "absolute", left: 16, top: 85, width: 24, height: 24 }}>
        <ArrowLeft size={20} strokeWidth={2} color="#000000" style={{ position: "absolute", left: 2, top: 2 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 82,
          width: 298,
          height: 30,
          color: "#1B1B1C",
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "37px",
          textAlign: "left",
        }}
      >
        Team
      </div>

      {/* ===== Card 1 : Team selector ===== */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 136,
          width: 336,
          height: 142,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 8,
        }}
      />
      {/* edit icon */}
      <div style={{ position: "absolute", left: 40, top: 152.5, width: 20, height: 20 }}>
        <SquarePen size={16} strokeWidth={1.5} color="#000000" style={{ position: "absolute", left: 2, top: 2 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 152.5,
          width: 234,
          height: 20,
          color: "#242220",
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "20px",
        }}
      >
        Team
      </div>
      {/* down chevron (weui:arrow-outlined) */}
      <div style={{ position: "absolute", left: 319, top: 156.5, width: 24, height: 12 }}>
        <ChevronDown size={16} strokeWidth={2} color="#000000" style={{ position: "absolute", left: 4, top: -2 }} />
      </div>

      {/* Input row: Operations agency */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 199,
          width: 303,
          height: 62,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
        }}
      />
      {/* agency avatar */}
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 210,
          width: 34,
          height: 34,
          background: "#ECC5F5",
          border: "1px solid #F8F8F8",
          borderRadius: 9999,
        }}
      >
        <Users size={16} strokeWidth={1.6} color="#000000" style={{ position: "absolute", left: 7, top: 7 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 206,
          width: 110,
          height: 24,
          color: "#000000",
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        Operations
      </div>
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 224,
          width: 110,
          height: 24,
          color: "#000000",
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 10,
          lineHeight: "24px",
        }}
      >
        Stellar Agency
      </div>

      {/* ===== Card 2 : Team Members ===== */}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 297,
          width: 336,
          height: 435,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 8,
        }}
      />

      {/* header row: Team Members */}
      <div
        style={{
          position: "absolute",
          left: 41,
          top: 308,
          width: 303,
          height: 62,
          border: "1px solid #E5E7EB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 41,
          top: 308,
          width: 139,
          height: 24,
          color: "#000000",
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        Team Members
      </div>
      <div style={{ position: "absolute", left: 317, top: 315, width: 20, height: 20 }}>
        <MoreVertical size={18} strokeWidth={2} color="#000000" style={{ position: "absolute", left: 1, top: 1 }} />
      </div>
      {/* 22 Members */}
      <div style={{ position: "absolute", left: 41, top: 331, width: 16, height: 16 }}>
        <Users size={16} strokeWidth={1.6} color="#000000" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 62,
          top: 329,
          width: 110,
          height: 20,
          color: "#000000",
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 10,
          lineHeight: "24px",
        }}
      >
        22 Members
      </div>

      {/* member row 1: Sanjay Sharma */}
      <div
        style={{
          position: "absolute",
          left: 41,
          top: 363,
          width: 303,
          height: 62,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 51,
          top: 371,
          width: 42,
          height: 42,
          borderRadius: 9999,
          border: "1px solid #373636",
          background: "linear-gradient(135deg, #E9E4F0, #D9CFEA)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 106,
          top: 371,
          width: 130,
          height: 24,
          color: "#000000",
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        Sanjay Sharma
      </div>
      <div
        style={{
          position: "absolute",
          left: 106,
          top: 390,
          width: 99,
          height: 23,
          color: "#000000",
          fontFamily: inter,
          fontWeight: 400,
          fontSize: 10,
          lineHeight: "24px",
        }}
      >
        Operations
      </div>
      {/* Active badge */}
      <div
        style={{
          position: "absolute",
          left: 226,
          top: 373,
          width: 53,
          height: 20,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#4CCC16",
            fontFamily: inter,
            fontWeight: 500,
            fontSize: 8,
            lineHeight: "16px",
            textAlign: "center",
          }}
        >
          Active
        </span>
      </div>
      <div style={{ position: "absolute", left: 317, top: 370, width: 20, height: 20 }}>
        <MoreVertical size={18} strokeWidth={2} color="#000000" style={{ position: "absolute", left: 1, top: 1 }} />
      </div>

      {/* member row 2: Riya Verma */}
      <div
        style={{
          position: "absolute",
          left: 41,
          top: 435,
          width: 303,
          height: 62,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 51,
          top: 443,
          width: 42,
          height: 42,
          borderRadius: 9999,
          border: "1px solid #373636",
          background: "linear-gradient(135deg, #E9E4F0, #D9CFEA)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 106,
          top: 443,
          width: 110,
          height: 24,
          color: "#000000",
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        Riya Verma
      </div>
      <div
        style={{
          position: "absolute",
          left: 106,
          top: 462,
          width: 99,
          height: 23,
          color: "#000000",
          fontFamily: inter,
          fontWeight: 400,
          fontSize: 10,
          lineHeight: "24px",
        }}
      >
        Sales
      </div>
      <div style={{ position: "absolute", left: 317, top: 442, width: 20, height: 20 }}>
        <MoreVertical size={18} strokeWidth={2} color="#000000" style={{ position: "absolute", left: 1, top: 1 }} />
      </div>

      {/* ===== Status bar (on top) ===== */}
      <div
        style={{
          position: "absolute",
          left: 19,
          top: 31,
          width: 54,
          height: 18,
          color: "#000000",
          fontFamily: urbanist,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "18px",
          textAlign: "center",
        }}
      >
        19:56
      </div>
      {/* Cellular bars */}
      <div style={{ position: "absolute", left: 292, top: 41.3, width: 3, height: 4, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 296.7, top: 39.3, width: 3, height: 6, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 301.3, top: 37, width: 3, height: 8.3, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 306, top: 34.7, width: 3, height: 10.7, background: "#000000", borderRadius: 1 }} />
      {/* Wifi */}
      <Wifi size={15} strokeWidth={2} color="#000000" style={{ position: "absolute", left: 314, top: 34.3 }} />
      {/* Battery */}
      <div
        style={{
          position: "absolute",
          left: 334.3,
          top: 34.3,
          width: 22,
          height: 11.3,
          border: "1px solid rgba(0,0,0,0.35)",
          borderRadius: 2.67,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 336.3,
          top: 36.3,
          width: 18,
          height: 7.3,
          background: "#000000",
          borderRadius: 1.33,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 357.3,
          top: 38,
          width: 1.3,
          height: 4,
          background: "#000000",
        }}
      />
    </div>
  );
}
