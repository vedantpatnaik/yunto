import { ArrowLeft, MoreVertical, Users, Wifi } from "lucide-react";

/**
 * team-creation-2 (Figma node 968:826)
 * Static, pixel-exact reproduction of the "team creation / Add Creators" agency screen.
 */
export default function AgTeamCreation2Pg() {
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
      {/* ===== Base frame '2' fill ===== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 375,
          height: 946,
          background: "#FDFDFD",
        }}
      />

      {/* ===== Decorative blobs (Group 35898 — top-left) ===== */}
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

      {/* ===== Decorative blobs (Group 35897 — center-right) ===== */}
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

      {/* ===== Background IMAGE rectangle -> frosted overlay placeholder ===== */}
      <div
        style={{
          position: "absolute",
          left: -13,
          top: 0,
          width: 402,
          height: 946,
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
        }}
      />

      {/* ===== Header Container @(0,70) 375x54 ===== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 70,
          width: 375,
          height: 54,
          background: "#FFFFFF",
          border: "1px solid #717171",
        }}
      />
      {/* back arrow (meteor-icons:arrow-up) */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 85,
          width: 24,
          height: 24,
        }}
      >
        <ArrowLeft size={20} strokeWidth={2} color="#000000" />
      </div>
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
        Add Creators
      </div>

      {/* ===== Main card ',manager view]' @(20,145) 336x650 ===== */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 145,
          width: 336,
          height: 650,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 8,
        }}
      />

      {/* --- Header row Input @(37,156) 303x62 --- */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 156,
          width: 303,
          height: 62,
          border: "1px solid #E5E7EB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 156,
          width: 139,
          height: 24,
          color: "#000000",
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        Creators
      </div>
      {/* dots menu (pepicons-pop:dots-y) */}
      <div
        style={{
          position: "absolute",
          left: 313,
          top: 163,
          width: 20,
          height: 20,
        }}
      >
        <MoreVertical size={18} color="#000000" />
      </div>
      {/* users count row */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 179,
          width: 16,
          height: 16,
        }}
      >
        <Users size={16} color="#000000" fill="#000000" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 58,
          top: 177,
          width: 110,
          height: 20,
          color: "#000000",
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 500,
          fontSize: 10,
          lineHeight: "24px",
        }}
      >
        50 Creators
      </div>
      {/* Add Creators pill button */}
      <div
        style={{
          position: "absolute",
          left: 250,
          top: 165,
          width: 86,
          height: 23,
          background: "#212020",
          border: "1px solid #131414",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 8,
            top: 0,
            width: 70,
            height: 24,
            color: "#FFFDFD",
            fontFamily: "'Clash Display', sans-serif",
            fontWeight: 500,
            fontSize: 10,
            lineHeight: "24px",
            textAlign: "center",
          }}
        >
          Add Creators
        </div>
      </div>

      {/* --- Creator row 1: Leena Sharma @(37,211) --- */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 211,
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
          left: 47,
          top: 219,
          width: 42,
          height: 42,
          borderRadius: 9999,
          background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)",
          border: "1px solid #373636",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 102,
          top: 219,
          width: 110,
          height: 24,
          color: "#000000",
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        Leena Sharma
      </div>
      <div
        style={{
          position: "absolute",
          left: 102,
          top: 238,
          width: 99,
          height: 23,
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 10,
          lineHeight: "24px",
        }}
      >
        @leenabliss
      </div>
      <div
        style={{
          position: "absolute",
          left: 313,
          top: 218,
          width: 20,
          height: 20,
        }}
      >
        <MoreVertical size={18} color="#000000" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 222,
          top: 221,
          width: 53,
          height: 20,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 9999,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 6,
            top: 4,
            width: 41,
            height: 12,
            color: "#4CCC16",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 8,
            lineHeight: "16px",
            textAlign: "center",
          }}
        >
          Active
        </div>
      </div>

      {/* --- Creator row 2: Riya Verma @(37,283) --- */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 283,
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
          left: 47,
          top: 291,
          width: 42,
          height: 42,
          borderRadius: 9999,
          background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)",
          border: "1px solid #373636",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 102,
          top: 291,
          width: 110,
          height: 24,
          color: "#000000",
          fontFamily: "'Clash Display', sans-serif",
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
          left: 102,
          top: 310,
          width: 99,
          height: 23,
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 10,
          lineHeight: "24px",
        }}
      >
        @Riyabliss
      </div>
      <div
        style={{
          position: "absolute",
          left: 313,
          top: 290,
          width: 20,
          height: 20,
        }}
      >
        <MoreVertical size={18} color="#000000" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 196,
          top: 293,
          width: 53,
          height: 20,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 9999,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 6,
            top: 4,
            width: 41,
            height: 12,
            color: "#1D4ED8",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 8,
            lineHeight: "16px",
            textAlign: "center",
          }}
        >
          Invite Sent
        </div>
      </div>

      {/* ===== Status bar (system / light / default) @(0,5) 375x44 ===== */}
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

      {/* Cellular connection bars */}
      <div style={{ position: "absolute", left: 294, top: 29.4, width: 3, height: 4, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 298.7, top: 27.4, width: 3, height: 6, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 303.3, top: 25.1, width: 3, height: 8.3, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 308, top: 22.7, width: 3, height: 10.7, background: "#000000", borderRadius: 1 }} />

      {/* Wifi */}
      <div style={{ position: "absolute", left: 316, top: 22, width: 16, height: 12 }}>
        <Wifi size={16} color="#000000" fill="#000000" strokeWidth={0} />
      </div>

      {/* Battery */}
      <div
        style={{
          position: "absolute",
          left: 336.3,
          top: 22.3,
          width: 22,
          height: 11.3,
          border: "1px solid rgba(0,0,0,0.35)",
          borderRadius: 2.67,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 338.3,
          top: 24.3,
          width: 18,
          height: 7.3,
          background: "#000000",
          borderRadius: 1.33,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 359.3,
          top: 26,
          width: 1.3,
          height: 4,
          background: "#000000",
        }}
      />
    </div>
  );
}
