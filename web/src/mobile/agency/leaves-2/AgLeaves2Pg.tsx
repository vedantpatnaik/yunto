import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function AgLeaves2Pg() {
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
      {/* Decorative full-screen gradient */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 375,
          height: 876,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(248,245,239,0))",
        }}
      />

      {/* Decorative gradient blob (bottom-right) */}
      <div
        style={{
          position: "absolute",
          left: 112.5,
          top: 525.6,
          width: 262.5,
          height: 350.4,
          background: "linear-gradient(135deg, #FDE8D8, #F0E6F5)",
          opacity: 0.5,
        }}
      />

      {/* Overlay + Blur (soft rounded glow, bottom-left) */}
      <div
        style={{
          position: "absolute",
          left: -37.5,
          top: 481.8,
          width: 168.8,
          height: 245.3,
          borderRadius: 9999,
          background: "linear-gradient(135deg, #E9E4F0, #D9CFEA)",
          filter: "blur(60px)",
          opacity: 0.45,
        }}
      />

      {/* Header bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 375,
          height: 80,
        }}
      >
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
            boxShadow: "0 4px 12px rgba(31,26,23,0.18)",
          }}
        >
          <ChevronLeft
            size={16.2}
            color="#FAF7F2"
            strokeWidth={1.35}
            style={{ position: "absolute", left: 9.9, top: 9.9 }}
          />
        </div>

        {/* Heading */}
        <div
          style={{
            position: "absolute",
            left: 72,
            top: 28,
            width: 222,
            height: 24,
          }}
        >
          <span
            style={{
              fontFamily: "Geist, sans-serif",
              fontWeight: 500,
              fontSize: 20,
              lineHeight: "24px",
              color: "#141311",
            }}
          >
            Team Management
          </span>
        </div>
      </div>

      {/* Card container */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 104.5,
          width: 335,
          height: 271,
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 28,
          boxShadow: "0 12px 40px rgba(31,26,23,0.08)",
        }}
      >
        {/* Header row: icon + title */}
        {/* Icon background */}
        <div
          style={{
            position: "absolute",
            left: 21,
            top: 17,
            width: 48,
            height: 48,
            background: "#FFEDD5",
            borderRadius: 20,
          }}
        >
          <Calendar
            size={24.4}
            color="#EA580C"
            strokeWidth={2.04}
            style={{ position: "absolute", left: 11.8, top: 11.8 }}
          />
        </div>

        {/* Title 'Leaves' */}
        <span
          style={{
            position: "absolute",
            left: 81,
            top: 29.5,
            width: 68,
            height: 23,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 15,
            lineHeight: "22.5px",
            color: "#111111",
          }}
        >
          Leaves
        </span>

        {/* leave balance label */}
        <span
          style={{
            position: "absolute",
            left: 21,
            top: 98,
            width: 105,
            height: 17,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 11,
            lineHeight: "16.5px",
            color: "#AAAAAA",
          }}
        >
          leave balance
        </span>

        {/* Casual leave value */}
        <span
          style={{
            position: "absolute",
            left: 21,
            top: 121,
            width: 55,
            height: 28,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 28,
            lineHeight: "28px",
            color: "#111111",
          }}
        >
          2 days
        </span>

        {/* Causal Leave label */}
        <span
          style={{
            position: "absolute",
            left: 21,
            top: 153,
            width: 77,
            height: 18,
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 12,
            lineHeight: "18px",
            color: "#888888",
          }}
        >
          Causal Leave
        </span>

        {/* Paid leave value */}
        <span
          style={{
            position: "absolute",
            left: 207,
            top: 116,
            width: 55,
            height: 28,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 28,
            lineHeight: "28px",
            color: "#111111",
          }}
        >
          2 days
        </span>

        {/* Paid Leave label */}
        <span
          style={{
            position: "absolute",
            left: 207,
            top: 148,
            width: 63,
            height: 18,
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 12,
            lineHeight: "18px",
            color: "#888888",
          }}
        >
          Paid Leave
        </span>

        {/* Apply for leave button */}
        <div
          style={{
            position: "absolute",
            left: 17,
            top: 199,
            width: 301,
            height: 54,
            background: "#FFFFFF",
            border: "1px solid #FFFFFF",
            borderRadius: 40,
            boxShadow: "0 6px 20px rgba(31,26,23,0.08)",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 15.6,
              top: 17,
              width: 100,
              height: 20,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 14,
              lineHeight: "20px",
              color: "#111111",
              textAlign: "center",
            }}
          >
            Apply for leave
          </span>
          <ChevronRight
            size={18}
            color="#64748B"
            strokeWidth={2}
            style={{ position: "absolute", left: 267.4, top: 18 }}
          />
        </div>
      </div>
    </div>
  );
}
