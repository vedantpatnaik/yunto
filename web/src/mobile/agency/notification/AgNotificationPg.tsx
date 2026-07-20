import {
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Mail,
  Briefcase,
  TrendingUp,
} from "lucide-react";

/**
 * Agency — Notifications screen.
 * Pixel-exact reproduction of Figma node 7696:11834 (375x876).
 * All nodes absolutely positioned with frame-relative coordinates.
 */
export default function AgNotificationPg() {
  const radialOverlay =
    "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6), rgba(255,255,255,0))";

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
      {/* ============ Header ============ */}
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
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 25.9,
          top: 31.9,
          width: 16.2,
          height: 16.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronLeft size={15} color="#FAF7F2" strokeWidth={1.35} />
      </div>

      {/* Heading */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 28,
          width: 192,
          height: 24,
          color: "#141311",
          fontFamily: "Geist, sans-serif",
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Notifications
      </div>

      {/* ============ Smart Filter Segment ============ */}
      {/* All */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 116,
          width: 55.5,
          height: 35,
          background: "#D4DCFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 125,
          width: 17.5,
          height: 17,
          color: "#2B2240",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        All
      </div>
      {/* Priority */}
      <div
        style={{
          position: "absolute",
          left: 85.5,
          top: 116,
          width: 87.7,
          height: 35,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 104.5,
          top: 125,
          width: 49.7,
          height: 17,
          color: "#666666",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Priority
      </div>
      {/* Campaigns */}
      <div
        style={{
          position: "absolute",
          left: 183.2,
          top: 116,
          width: 114.6,
          height: 35,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 202.2,
          top: 125,
          width: 76.6,
          height: 17,
          color: "#666666",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Campaigns
      </div>
      {/* Payments */}
      <div
        style={{
          position: "absolute",
          left: 307.7,
          top: 116,
          width: 104.9,
          height: 35,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 326.7,
          top: 125,
          width: 66.9,
          height: 17,
          color: "#666666",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Payments
      </div>

      {/* ============ Priority Section ============ */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 197,
          width: 335,
          height: 16,
          color: "#999999",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "15.7px",
          letterSpacing: 0.5,
        }}
      >
        NEEDS YOUR ATTENTION
      </div>

      {/* --- Priority Card 1 --- */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 227,
          width: 335,
          height: 78,
          background: "#E2EBE2",
          border: "1px solid #E8E2D9",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 21,
          top: 228,
          width: 333,
          height: 76,
          background: radialOverlay,
          borderRadius: 19,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 244,
          width: 44,
          height: 44,
          background: "#FFFFFF",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Clock size={22} color="#1E1E1E" strokeWidth={1.83} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 95,
          top: 247,
          width: 209,
          height: 18,
          color: "#3E2723",
          fontWeight: 700,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        3 leads need response
      </div>
      <div
        style={{
          position: "absolute",
          left: 95,
          top: 269,
          width: 209,
          height: 16,
          color: "#000000",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Tap to review
      </div>
      <div
        style={{
          position: "absolute",
          left: 318,
          top: 256,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronRight size={16} color="#1E1E1E" strokeWidth={1.67} />
      </div>

      {/* --- Priority Card 2 --- */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 317,
          width: 335,
          height: 90,
          background: "#FFEBEE",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 21,
          top: 318,
          width: 333,
          height: 88,
          background: radialOverlay,
          borderRadius: 19,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 340,
          width: 44,
          height: 44,
          background: "#FFFFFF",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Clock size={22} color="#333333" strokeWidth={1.83} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 95,
          top: 334,
          width: 209,
          height: 36,
          color: "#3E2723",
          fontWeight: 700,
          fontSize: 15,
          lineHeight: "18.2px",
          whiteSpace: "pre-line",
        }}
      >
        {"Campaign deadline in 2\ndays"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 95,
          top: 374,
          width: 209,
          height: 16,
          color: "#737773",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Urban Tech SS24
      </div>
      <div
        style={{
          position: "absolute",
          left: 318,
          top: 352,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronRight size={16} color="#333333" strokeWidth={1.67} />
      </div>

      {/* --- Priority Card 3 --- */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 419,
          width: 335,
          height: 78,
          background: "#FFF3E0",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 21,
          top: 420,
          width: 333,
          height: 76,
          background: radialOverlay,
          borderRadius: 19,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 436,
          width: 44,
          height: 44,
          background: "#FFFFFF",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DollarSign size={20} color="#333333" strokeWidth={1.83} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 95,
          top: 439,
          width: 209,
          height: 18,
          color: "#3E2723",
          fontWeight: 700,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        Payment pending from Nike
      </div>
      <div
        style={{
          position: "absolute",
          left: 95,
          top: 461,
          width: 209,
          height: 16,
          color: "#000000",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Tap to review
      </div>
      <div
        style={{
          position: "absolute",
          left: 318,
          top: 448,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronRight size={16} color="#333333" strokeWidth={1.67} />
      </div>

      {/* ============ Grouped Notifications: Today ============ */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 547,
          width: 335,
          height: 19,
          color: "#1A1A1A",
          fontWeight: 700,
          fontSize: 16,
          lineHeight: "19.4px",
        }}
      >
        Today
      </div>

      {/* --- Today Card A --- */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 580,
          width: 335,
          height: 76,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 597,
          width: 40,
          height: 40,
          background: "#9C27B0",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Mail size={20} color="#FFFFFF" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 91,
          top: 597,
          width: 186.7,
          height: 20,
          color: "#1A1A1A",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "19.5px",
        }}
      >
        Adidas sent an offer
      </div>
      <div
        style={{
          position: "absolute",
          left: 91,
          top: 620,
          width: 186.7,
          height: 19,
          color: "#777777",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "18.2px",
        }}
      >
        Campaign: Summer Glow
      </div>
      <div
        style={{
          position: "absolute",
          left: 291.7,
          top: 597,
          width: 46.3,
          height: 16,
          color: "#AAAAAA",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        2m ago
      </div>
      <div
        style={{
          position: "absolute",
          left: 330,
          top: 621,
          width: 8,
          height: 8,
          background: "#9C27B0",
          borderRadius: 4,
        }}
      />

      {/* --- Today Card B --- */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 666,
          width: 335,
          height: 94.1,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 683,
          width: 40,
          height: 40,
          background: "#F57C00",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Briefcase size={20} color="#FFFFFF" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 91,
          top: 683,
          width: 193,
          height: 20,
          color: "#1A1A1A",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "19.5px",
        }}
      >
        New campaign brief
      </div>
      <div
        style={{
          position: "absolute",
          left: 91,
          top: 706.1,
          width: 193,
          height: 37,
          color: "#777777",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "18.2px",
          whiteSpace: "pre-line",
        }}
      >
        {"Baseskincare updated their\nrequirements"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 298,
          top: 683,
          width: 40,
          height: 16,
          color: "#AAAAAA",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        1h ago
      </div>
      <div
        style={{
          position: "absolute",
          left: 330,
          top: 707,
          width: 8,
          height: 8,
          background: "#F57C00",
          borderRadius: 4,
        }}
      />

      {/* ============ Yesterday ============ */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 788.1,
          width: 335,
          height: 19,
          color: "#1A1A1A",
          fontWeight: 700,
          fontSize: 16,
          lineHeight: "19.4px",
        }}
      >
        Yesterday
      </div>

      {/* --- Yesterday Card C --- */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 821.1,
          width: 335,
          height: 76.1,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 838.1,
          width: 40,
          height: 40,
          background: "#388E3C",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DollarSign size={20} color="#FFFFFF" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 91,
          top: 838.1,
          width: 171,
          height: 20,
          color: "#1A1A1A",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "19.5px",
        }}
      >
        Payment followup
      </div>
      <div
        style={{
          position: "absolute",
          left: 91,
          top: 861.2,
          width: 171,
          height: 19,
          color: "#777777",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "18.2px",
        }}
      >
        {" Nykaa payment followup"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 276,
          top: 838.1,
          width: 62,
          height: 16,
          color: "#AAAAAA",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Yesterday
      </div>

      {/* --- Yesterday Card D --- */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 907.2,
          width: 335,
          height: 94.1,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 924.2,
          width: 40,
          height: 40,
          background: "#1976D2",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TrendingUp size={20} color="#FFFFFF" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 91,
          top: 924.2,
          width: 171,
          height: 20,
          color: "#1A1A1A",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "19.5px",
        }}
      >
        Profile milestone
      </div>
      <div
        style={{
          position: "absolute",
          left: 91,
          top: 947.3,
          width: 171,
          height: 37,
          color: "#777777",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "18.2px",
          whiteSpace: "pre-line",
        }}
      >
        {"You hit 50K page views\nthis month!"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 276,
          top: 924.2,
          width: 62,
          height: 16,
          color: "#AAAAAA",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Yesterday
      </div>
    </div>
  );
}
