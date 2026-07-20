import {
  ArrowLeft,
  MoreVertical,
  Users,
  Sparkles,
  Mail,
  Wifi,
  Signal,
} from "lucide-react";

const CLASH = "'Clash Display', sans-serif";
const INTER = "Inter, sans-serif";
const URBANIST = "Urbanist, sans-serif";

type Member = {
  name: string;
  y: number; // input box top
  badgeY: number;
  status: string;
  statusColor: string;
  avatarBg?: string;
  initial?: string;
  initialColor?: string;
};

const members: Member[] = [
  {
    name: "Sanjay Sharma",
    y: 347,
    badgeY: 357,
    status: "Active",
    statusColor: "#4CCC16",
  },
  {
    name: "Rahul Singh",
    y: 415,
    badgeY: 425,
    status: "Active",
    statusColor: "#4CCC16",
    avatarBg: "#C2E9CF",
    initial: "R",
    initialColor: "#2A9A4F",
  },
  {
    name: "Sonal Soni",
    y: 483,
    badgeY: 496,
    status: "Offline",
    statusColor: "#777876",
    avatarBg: "#A1BAE6",
    initial: "S",
    initialColor: "#2158BA",
  },
  {
    name: "Kunal Singh",
    y: 551,
    badgeY: 561,
    status: "Offline",
    statusColor: "#777876",
    avatarBg: "#CFA9DC",
    initial: "K",
    initialColor: "#761D93",
  },
];

export default function AgSalesTeamOnPg() {
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
      {/* Tall inner frame background */}
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

      {/* Decorative gradient blobs */}
      {/* Group 35897 (bottom, off-screen) */}
      <div
        style={{
          position: "absolute",
          left: 3.8,
          top: 1891.1,
          width: 204.3,
          height: 196.5,
          background: "#FBB7C6",
          borderRadius: 9999,
          filter: "blur(35px)",
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
          borderRadius: 9999,
          filter: "blur(35px)",
        }}
      />
      {/* Group 35897 (large center) */}
      <div
        style={{
          position: "absolute",
          left: 66.6,
          top: 612,
          width: 493.7,
          height: 488.6,
          background: "#FF90A9",
          borderRadius: 9999,
          filter: "blur(50px)",
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
          borderRadius: 9999,
          filter: "blur(50px)",
        }}
      />
      {/* Group 35898 (top-left) */}
      <div
        style={{
          position: "absolute",
          left: -16.4,
          top: 167.5,
          width: 163.4,
          height: 157.1,
          background: "#CCF5FD",
          borderRadius: 9999,
          filter: "blur(35px)",
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
          borderRadius: 9999,
          filter: "blur(35px)",
        }}
      />

      {/* Background image placeholder (translucent overlay) */}
      <div
        style={{
          position: "absolute",
          left: -13,
          top: 0,
          width: 402,
          height: 2045,
          background: "linear-gradient(135deg, #E9E4F0, #D9CFEA)",
          opacity: 0.35,
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
          border: "1px solid #717171",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 85,
          width: 24,
          height: 24,
        }}
      >
        <ArrowLeft size={24} color="#000000" strokeWidth={2} />
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

      {/* Main card */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 136,
          width: 336,
          height: 525,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 8,
        }}
      />

      {/* Team header row */}
      {/* Avatar */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 151.5,
          width: 42,
          height: 42,
          background: "#FDFFBC",
          border: "1px solid #373636",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Users size={22} color="#000000" strokeWidth={1.5} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 86,
          top: 154.5,
          width: 172,
          height: 20,
          color: "#242220",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "20px",
          textAlign: "left",
        }}
      >
        Sales
      </div>
      <div
        style={{
          position: "absolute",
          left: 86,
          top: 175,
          width: 16,
          height: 16,
        }}
      >
        <Users size={16} color="#000000" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 107,
          top: 172.5,
          width: 110,
          height: 21,
          color: "#000000",
          fontFamily: CLASH,
          fontWeight: 400,
          fontSize: 10,
          lineHeight: "24px",
          textAlign: "left",
          whiteSpace: "nowrap",
        }}
      >
        10 Members
      </div>

      {/* Sparkle + toggle button */}
      <div
        style={{
          position: "absolute",
          left: 271,
          top: 158.5,
          width: 71,
          height: 27,
          background: "#FFFFFF",
          border: "0.586px solid #22CC30",
          borderRadius: 14.07,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 276.9,
          top: 164,
          width: 16,
          height: 16,
        }}
      >
        <Sparkles size={16} color="#000000" strokeWidth={1.6} />
      </div>
      {/* toggle track */}
      <div
        style={{
          position: "absolute",
          left: 300.9,
          top: 163,
          width: 36,
          height: 18,
          background: "#212020",
          borderRadius: 15.5,
        }}
      />
      {/* toggle knob (ON, right) */}
      <div
        style={{
          position: "absolute",
          left: 318.9,
          top: 164.5,
          width: 16,
          height: 15,
          background: "#FFFFFF",
          borderRadius: 13.5,
        }}
      />

      {/* Leads stats card */}
      <div
        style={{
          position: "absolute",
          left: 34,
          top: 215,
          width: 308,
          height: 64,
          background: "#FCFCFC",
          border: "1px solid #000000",
          borderRadius: 8,
        }}
      />
      {/* Leads box */}
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 216,
          width: 52,
          height: 55,
          background: "#FDFFFB",
          border: "1px solid #000000",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 48,
          top: 222,
          width: 25,
          height: 25,
          background: "#DAFDB0",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Mail size={14} color="#000000" strokeWidth={1.5} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 42,
          top: 247,
          width: 38,
          height: 20,
          color: "#242220",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 10,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        Leads
      </div>

      {/* Stats columns */}
      {[
        { top: "10", topX: 93, topW: 39, bottom: "All", botX: 93, botW: 39 },
        { top: "4", topX: 137, topW: 52, bottom: "Unattended", botX: 132, botW: 61 },
        { top: "4", topX: 225, topW: 9, bottom: "Contacted", botX: 204, botW: 50 },
        { top: "2", topX: 297, topW: 8, bottom: "Converted", botX: 275, botW: 52 },
      ].map((s, i) => (
        <div key={i}>
          <div
            style={{
              position: "absolute",
              left: s.topX,
              top: 232,
              width: s.topW,
              height: 15,
              color: "#000000",
              fontFamily: CLASH,
              fontWeight: 600,
              fontSize: 12,
              lineHeight: "15px",
              textAlign: "center",
            }}
          >
            {s.top}
          </div>
          <div
            style={{
              position: "absolute",
              left: s.botX,
              top: 248,
              width: s.botW,
              height: 13,
              color: "#000000",
              fontFamily: CLASH,
              fontWeight: 400,
              fontSize: 10,
              lineHeight: "12.5px",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {s.bottom}
          </div>
        </div>
      ))}

      {/* Members label */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 303,
          width: 149,
          height: 18,
          color: "#000000",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "17.5px",
          textAlign: "left",
        }}
      >
        Members
      </div>

      {/* Add Members pill */}
      <div
        style={{
          position: "absolute",
          left: 254,
          top: 300,
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
          top: 300,
          width: 70,
          height: 24,
          color: "#FFFDFD",
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 10,
          lineHeight: "24px",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        Add Members
      </div>

      {/* Member rows */}
      {members.map((m) => (
        <div key={m.name}>
          {/* Input box */}
          <div
            style={{
              position: "absolute",
              left: 37,
              top: m.y,
              width: 303,
              height: 62,
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
            }}
          />
          {/* Avatar */}
          {m.avatarBg ? (
            <div
              style={{
                position: "absolute",
                left: 47,
                top: m.y + 8,
                width: 42,
                height: 42,
                background: m.avatarBg,
                border: "1px solid #373636",
                borderRadius: 9999,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  top: 9,
                  width: 12,
                  height: 24,
                  color: m.initialColor,
                  fontFamily: CLASH,
                  fontWeight: 500,
                  fontSize: 15,
                  lineHeight: "24px",
                  textAlign: "center",
                }}
              >
                {m.initial}
              </div>
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                left: 47,
                top: m.y + 8,
                width: 42,
                height: 42,
                background: "linear-gradient(135deg, #E9E4F0, #D9CFEA)",
                border: "1px solid #373636",
                borderRadius: 9999,
              }}
            />
          )}
          {/* Name */}
          <div
            style={{
              position: "absolute",
              left: 102,
              top: m.y + 8,
              width: 130,
              height: 24,
              color: "#000000",
              fontFamily: CLASH,
              fontWeight: 500,
              fontSize: 15,
              lineHeight: "24px",
              textAlign: "left",
              whiteSpace: "nowrap",
            }}
          >
            {m.name}
          </div>
          {/* Role */}
          <div
            style={{
              position: "absolute",
              left: 102,
              top: m.y + 27,
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
          {/* Dots menu */}
          <div
            style={{
              position: "absolute",
              left: 313,
              top: m.y + 7,
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoreVertical size={16} color="#000000" strokeWidth={2} />
          </div>
          {/* Status badge */}
          <div
            style={{
              position: "absolute",
              left: 222,
              top: m.badgeY,
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
              left: 228,
              top: m.badgeY + 4,
              width: 41,
              height: 12,
              color: m.statusColor,
              fontFamily: INTER,
              fontWeight: 500,
              fontSize: 8,
              lineHeight: "16px",
              textAlign: "center",
            }}
          >
            {m.status}
          </div>
        </div>
      ))}

      {/* Status bar */}
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
      {/* Cellular */}
      <div
        style={{
          position: "absolute",
          left: 294,
          top: 21,
          width: 17,
          height: 16,
        }}
      >
        <Signal size={16} color="#000000" strokeWidth={2} />
      </div>
      {/* Wifi */}
      <div
        style={{
          position: "absolute",
          left: 315,
          top: 21,
          width: 16,
          height: 16,
        }}
      >
        <Wifi size={16} color="#000000" strokeWidth={2} />
      </div>
      {/* Battery */}
      <div
        style={{
          position: "absolute",
          left: 336.3,
          top: 22.3,
          width: 22,
          height: 11.3,
          border: "1px solid rgba(0,0,0,0.4)",
          borderRadius: 2.67,
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
    </div>
  );
}
