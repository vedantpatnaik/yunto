import { ChevronLeft, ChevronUp, ChevronRight, Users, Pencil } from "lucide-react";

export default function AgTeamManagement3Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 876,
        background: "#F8F5EF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      {/* Back button */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 22,
          width: 36,
          height: 36,
          background: "#1F1A17",
          borderRadius: 9999,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronLeft size={16} color="#FAF7F2" strokeWidth={1.35} />
      </div>

      {/* Heading */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 28,
          width: 222,
          height: 24,
          color: "#141311",
          fontFamily: "Geist, sans-serif",
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Team
      </div>

      {/* Basics (Expanded) card */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 116,
          width: 335,
          height: 682,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 28,
        }}
      />

      {/* Header row: Manage Teams */}
      {/* Background+Shadow badge */}
      <div
        style={{
          position: "absolute",
          left: 33,
          top: 129,
          width: 48,
          height: 48,
          background: "#DBEAFE",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 141,
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Users size={22} color="#2563EB" />
      </div>

      <div
        style={{
          position: "absolute",
          left: 97,
          top: 143.5,
          width: 189,
          height: 19,
          color: "#111827",
          fontWeight: 600,
          fontSize: 16,
          lineHeight: "19.4px",
          textAlign: "left",
        }}
      >
        Manage Teams
      </div>

      {/* Overlay+Shadow chevron button */}
      <div
        style={{
          position: "absolute",
          left: 302,
          top: 135,
          width: 36,
          height: 36,
          background: "#FFFFFF",
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronUp size={20} color="#6B7280" strokeWidth={1.67} />
      </div>

      {/* ============ Card 1: Operations ============ */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 198,
          width: 301,
          height: 76.5,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      />
      {/* Avatar badge */}
      <div
        style={{
          position: "absolute",
          left: 58,
          top: 216.2,
          width: 40,
          height: 40,
          background:
            "linear-gradient(135deg, rgba(200,210,255,0.8), rgba(220,205,255,0.8))",
          border: "1px solid #A0AAFF",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Users size={18} color="#5560CC" strokeWidth={2} />
      </div>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          left: 114,
          top: 214,
          width: 78,
          height: 23,
          color: "#111111",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "22.5px",
          textAlign: "left",
        }}
      >
        Operations
      </div>
      {/* Edit icon */}
      <div
        style={{
          position: "absolute",
          left: 205,
          top: 219.5,
          width: 12,
          height: 12,
        }}
      >
        <Pencil size={12} color="#BCBABA" strokeWidth={1} />
      </div>
      {/* Members */}
      <div
        style={{
          position: "absolute",
          left: 114,
          top: 240,
          width: 69,
          height: 18,
          color: "#999999",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "18px",
          textAlign: "left",
        }}
      >
        11 Members
      </div>
      {/* Active badge */}
      <div
        style={{
          position: "absolute",
          left: 225,
          top: 232,
          width: 68,
          height: 26,
          background: "#F0FDF4",
          border: "1px solid #7BF1A8",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 235,
          top: 242,
          width: 6,
          height: 6,
          background: "#05DF72",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 245,
          top: 237,
          width: 39,
          height: 16,
          color: "#00A63E",
          fontWeight: 500,
          fontSize: 10,
          lineHeight: "16px",
          textAlign: "left",
        }}
      >
        5 Active
      </div>
      {/* Chevron right */}
      <div
        style={{
          position: "absolute",
          left: 301,
          top: 228.2,
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronRight size={16} color="#CCCCCC" strokeWidth={2} />
      </div>

      {/* ============ Card 2: Sales ============ */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 290.5,
          width: 301,
          height: 76.5,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 58,
          top: 308.8,
          width: 40,
          height: 40,
          background:
            "linear-gradient(135deg, rgba(225,94,68,0.28), rgba(225,94,68,0.23))",
          border: "1px solid #FFB5A0",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Users size={18} color="#E15E44" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 114,
          top: 306.5,
          width: 38,
          height: 23,
          color: "#111111",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "22.5px",
          textAlign: "left",
        }}
      >
        Sales
      </div>
      <div
        style={{
          position: "absolute",
          left: 205,
          top: 312,
          width: 12,
          height: 12,
        }}
      >
        <Pencil size={12} color="#BCBABA" strokeWidth={1} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 114,
          top: 332,
          width: 69,
          height: 18,
          color: "#999999",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "18px",
          textAlign: "left",
        }}
      >
        11 Members
      </div>
      <div
        style={{
          position: "absolute",
          left: 225,
          top: 324,
          width: 68,
          height: 26,
          background: "#F0FDF4",
          border: "1px solid #7BF1A8",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 235,
          top: 334,
          width: 6,
          height: 6,
          background: "#05DF72",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 245,
          top: 329,
          width: 39,
          height: 16,
          color: "#00A63E",
          fontWeight: 500,
          fontSize: 10,
          lineHeight: "16px",
          textAlign: "left",
        }}
      >
        5 Active
      </div>
      <div
        style={{
          position: "absolute",
          left: 301,
          top: 320.8,
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronRight size={16} color="#CCCCCC" strokeWidth={2} />
      </div>

      {/* ============ Card 3: Sales + Operation ============ */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 383,
          width: 301,
          height: 76.5,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 58,
          top: 401.2,
          width: 40,
          height: 40,
          background:
            "linear-gradient(135deg, rgba(222,255,200,0.8), #E4F7DB)",
          border: "1px solid #D0FFB7",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Users size={18} color="#79CB4C" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 114,
          top: 399,
          width: 124,
          height: 23,
          color: "#111111",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "22.5px",
          textAlign: "left",
        }}
      >
        Sales + Operation
      </div>
      <div
        style={{
          position: "absolute",
          left: 248,
          top: 405,
          width: 12,
          height: 12,
        }}
      >
        <Pencil size={12} color="#BCBABA" strokeWidth={1} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 114,
          top: 425,
          width: 65,
          height: 18,
          color: "#999999",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "18px",
          textAlign: "left",
        }}
      >
        5 Members
      </div>
      <div
        style={{
          position: "absolute",
          left: 226,
          top: 421,
          width: 68,
          height: 26,
          background: "#F0FDF4",
          border: "1px solid #7BF1A8",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 236,
          top: 431,
          width: 6,
          height: 6,
          background: "#05DF72",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 246,
          top: 426,
          width: 39,
          height: 16,
          color: "#00A63E",
          fontWeight: 500,
          fontSize: 10,
          lineHeight: "16px",
          textAlign: "left",
        }}
      >
        5 Active
      </div>
      <div
        style={{
          position: "absolute",
          left: 301,
          top: 413.2,
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronRight size={16} color="#CCCCCC" strokeWidth={2} />
      </div>

      {/* Create a team button */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 475.5,
          width: 301,
          height: 55,
          background: "#312B28",
          borderRadius: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 16,
            lineHeight: "19.4px",
            textAlign: "center",
          }}
        >
          Create a team
        </div>
      </div>

      {/* Floating CTA (empty container) */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 810,
          width: 234,
          height: 66,
        }}
      />
    </div>
  );
}
