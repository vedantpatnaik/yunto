import {
  ArrowLeft,
  ChevronDown,
  SquarePen,
  Users,
  MoreVertical,
  Wifi,
} from "lucide-react";

const CLASH = "'Clash Display', sans-serif";
const INTER = "Inter, sans-serif";
const URBANIST = "Urbanist, sans-serif";
const IMG_PLACEHOLDER = "linear-gradient(135deg,#E9E4F0,#D9CFEA)";

export default function AgTeamDeletePg() {
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
      {/* FRAME '2' — page background */}
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

      {/* Decorative blob — top-left */}
      <div
        style={{
          position: "absolute",
          left: -16.4,
          top: 167.5,
          width: 163.4,
          height: 157.1,
          background: "#CCF5FD",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -25,
          top: 93,
          width: 157.1,
          height: 152.8,
          background:
            "linear-gradient(135deg, rgba(70,181,252,0.7), rgba(143,190,255,0.7))",
          borderRadius: "50%",
        }}
      />

      {/* Decorative blob — center */}
      <div
        style={{
          position: "absolute",
          left: 66.6,
          top: 612,
          width: 493.7,
          height: 488.6,
          background: "#FF90A9",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 135.2,
          top: 457.6,
          width: 476.7,
          height: 473.2,
          background: "linear-gradient(135deg, #8673B3, #A79AC6)",
          borderRadius: "50%",
        }}
      />

      {/* Decorative blob — bottom (mostly off-viewport) */}
      <div
        style={{
          position: "absolute",
          left: 3.8,
          top: 1891.1,
          width: 204.3,
          height: 196.5,
          background: "#FBB7C6",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -4,
          top: 1798,
          width: 196.5,
          height: 191.1,
          background: "linear-gradient(135deg, #F3D29F, #EE9688)",
          borderRadius: "50%",
        }}
      />

      {/* Background image (frosted glass placeholder over blobs) */}
      <div
        style={{
          position: "absolute",
          left: -13,
          top: 0,
          width: 402,
          height: 2045,
          background:
            "linear-gradient(135deg, rgba(233,228,240,0.35), rgba(217,207,234,0.40))",
          backdropFilter: "blur(60px)",
          WebkitBackdropFilter: "blur(60px)",
        }}
      />

      {/* Header container */}
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
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 85,
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowLeft size={14} strokeWidth={2} color="#000000" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 82,
          width: 298,
          height: 30,
          color: "#1B1B1C",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "37px",
          textAlign: "left",
        }}
      >
        Team
      </div>

      {/* ===== Card 1 — Team / Delete Team ===== */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 136,
          width: 336,
          height: 212,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 8,
        }}
      />

      {/* Card 1 header row */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 152.5,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SquarePen size={16} strokeWidth={1.5} color="#000000" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 152.5,
          width: 234,
          height: 20,
          color: "#242220",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "20px",
          textAlign: "left",
        }}
      >
        Team
      </div>
      <div
        style={{
          position: "absolute",
          left: 319,
          top: 156.5,
          width: 24,
          height: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronDown size={16} strokeWidth={2} color="#000000" />
      </div>

      {/* Yellow "Create a team" pill */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 190,
          width: 303,
          height: 44,
          background: "#FFFAD7",
          border: "1px solid #000000",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 151,
          top: 202,
          width: 75,
          height: 20,
          color: "#000000",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 11,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        Create a team
      </div>

      {/* Operations input row */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 264,
          width: 303,
          height: 62,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
        }}
      />
      {/* avatar */}
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 275,
          width: 34,
          height: 34,
          background: "#ECC5F5",
          border: "1px solid #F8F8F8",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Users size={16} strokeWidth={1.5} color="#000000" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 271,
          width: 110,
          height: 24,
          color: "#000000",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Operations
      </div>
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 289,
          width: 110,
          height: 24,
          color: "#000000",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 10,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Stellar Agency
      </div>
      {/* small edit icon (under popup) */}
      <div
        style={{
          position: "absolute",
          left: 189,
          top: 277,
          width: 12,
          height: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SquarePen size={10} strokeWidth={1} color="#000000" />
      </div>
      {/* dots menu */}
      <div
        style={{
          position: "absolute",
          left: 313,
          top: 271,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MoreVertical size={16} strokeWidth={2} color="#000000" />
      </div>

      {/* Delete Team popup (overlaps edit icon) */}
      <div
        style={{
          position: "absolute",
          left: 189,
          top: 271,
          width: 153,
          height: 37,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 201,
          top: 278,
          width: 124,
          height: 24,
          color: "#000000",
          fontFamily: INTER,
          fontWeight: 400,
          fontSize: 13,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Delete Team
      </div>
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 308,
          width: 151,
          height: 1,
          background: "#F0EFF1",
        }}
      />

      {/* ===== Card 2 — Team Members ===== */}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 367,
          width: 336,
          height: 435,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 8,
        }}
      />

      {/* Team Members header (Input, no fill) */}
      <div
        style={{
          position: "absolute",
          left: 41,
          top: 378,
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
          top: 378,
          width: 139,
          height: 24,
          color: "#000000",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Team Members
      </div>
      <div
        style={{
          position: "absolute",
          left: 317,
          top: 385,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MoreVertical size={16} strokeWidth={2} color="#000000" />
      </div>
      {/* 22 Members */}
      <div
        style={{
          position: "absolute",
          left: 41,
          top: 401,
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Users size={15} strokeWidth={1.5} color="#000000" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 62,
          top: 399,
          width: 110,
          height: 20,
          color: "#000000",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 10,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        22 Members
      </div>
      {/* Add Members button */}
      <div
        style={{
          position: "absolute",
          left: 254,
          top: 387,
          width: 86,
          height: 23,
          background: "#212020",
          border: "1px solid #131414",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 262,
          top: 387,
          width: 70,
          height: 24,
          color: "#FFFDFD",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 10,
          lineHeight: "24px",
          textAlign: "center",
        }}
      >
        Add Members
      </div>

      {/* Member row 1 — Sanjay Sharma */}
      <div
        style={{
          position: "absolute",
          left: 41,
          top: 433,
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
          top: 441,
          width: 42,
          height: 42,
          background: IMG_PLACEHOLDER,
          border: "1px solid #373636",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 106,
          top: 441,
          width: 110,
          height: 24,
          color: "#000000",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Sanjay Sharma
      </div>
      <div
        style={{
          position: "absolute",
          left: 106,
          top: 460,
          width: 99,
          height: 23,
          color: "#000000",
          fontFamily: INTER,
          fontWeight: 400,
          fontSize: 10,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Operations
      </div>
      <div
        style={{
          position: "absolute",
          left: 317,
          top: 440,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MoreVertical size={16} strokeWidth={2} color="#000000" />
      </div>
      {/* Active badge */}
      <div
        style={{
          position: "absolute",
          left: 226,
          top: 443,
          width: 53,
          height: 20,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 232,
          top: 447,
          width: 41,
          height: 12,
          color: "#4CCC16",
          fontFamily: INTER,
          fontWeight: 500,
          fontSize: 8,
          lineHeight: "16px",
          textAlign: "center",
        }}
      >
        Active
      </div>

      {/* Member row 2 — Riya Verma */}
      <div
        style={{
          position: "absolute",
          left: 41,
          top: 505,
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
          top: 513,
          width: 42,
          height: 42,
          background: IMG_PLACEHOLDER,
          border: "1px solid #373636",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 106,
          top: 513,
          width: 110,
          height: 24,
          color: "#000000",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Riya Verma
      </div>
      <div
        style={{
          position: "absolute",
          left: 106,
          top: 532,
          width: 99,
          height: 23,
          color: "#000000",
          fontFamily: INTER,
          fontWeight: 400,
          fontSize: 10,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Sales
      </div>
      <div
        style={{
          position: "absolute",
          left: 317,
          top: 512,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MoreVertical size={16} strokeWidth={2} color="#000000" />
      </div>
      {/* Invite Sent badge */}
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 515,
          width: 53,
          height: 20,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 206,
          top: 519,
          width: 41,
          height: 12,
          color: "#1D4ED8",
          fontFamily: INTER,
          fontWeight: 500,
          fontSize: 8,
          lineHeight: "16px",
          textAlign: "center",
        }}
      >
        Invite Sent
      </div>

      {/* ===== Status bar ===== */}
      <div
        style={{
          position: "absolute",
          left: 21,
          top: 19,
          width: 54,
          height: 18,
          color: "#000000",
          fontFamily: URBANIST,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "18px",
          textAlign: "center",
        }}
      >
        19:56
      </div>

      {/* Cellular bars */}
      <div style={{ position: "absolute", left: 294, top: 29.3, width: 3, height: 4, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 298.7, top: 27.3, width: 3, height: 6, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 303.3, top: 25, width: 3, height: 8.3, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 308, top: 22.7, width: 3, height: 10.7, background: "#000000", borderRadius: 1 }} />

      {/* Wifi */}
      <div
        style={{
          position: "absolute",
          left: 316,
          top: 22.3,
          width: 15.3,
          height: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Wifi size={15} strokeWidth={2} color="#000000" fill="#000000" />
      </div>

      {/* Battery */}
      <div
        style={{
          position: "absolute",
          left: 336.3,
          top: 22.3,
          width: 22,
          height: 11.3,
          border: "1px solid #000000",
          borderRadius: 2.67,
          opacity: 0.35,
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
          borderRadius: 1,
          opacity: 0.4,
        }}
      />
    </div>
  );
}
