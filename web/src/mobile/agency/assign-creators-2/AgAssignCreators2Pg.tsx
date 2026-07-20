import { ChevronLeft, ClipboardCheck } from "lucide-react";

export default function AgAssignCreators2Pg() {
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
            "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(233,228,240,0.35) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Decorative bottom-right gradient blob */}
      <div
        style={{
          position: "absolute",
          left: 112.5,
          top: 525.6,
          width: 262.5,
          height: 350.4,
          background:
            "radial-gradient(circle at 70% 40%, rgba(217,207,234,0.55) 0%, rgba(248,245,239,0) 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
      {/* Decorative blurred overlay circle */}
      <div
        style={{
          position: "absolute",
          left: -37.5,
          top: 481.8,
          width: 168.8,
          height: 245.3,
          borderRadius: 9999,
          background:
            "linear-gradient(135deg, rgba(233,228,240,0.6), rgba(217,207,234,0.35))",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(31,26,23,0.18)",
          }}
        >
          <ChevronLeft size={16} color="#FAF7F2" strokeWidth={1.5} />
        </div>

        {/* Title */}
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

      {/* Main card */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 104.5,
          width: 335,
          height: 289,
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 28,
          boxShadow: "0 12px 32px rgba(17,17,17,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Card header row: icon + title (positions frame-relative, offset by card origin) */}
        {/* Green icon background */}
        <div
          style={{
            position: "absolute",
            left: 41 - 20,
            top: 121.5 - 104.5,
            width: 48,
            height: 48,
            background: "#D1FAE5",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ClipboardCheck size={24} color="#059669" strokeWidth={2} />
        </div>

        {/* "Assign Creators" title */}
        <div
          style={{
            position: "absolute",
            left: 101 - 20,
            top: 133.5 - 104.5,
            width: 135,
            height: 23,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 15,
              lineHeight: "22.5px",
              color: "#111111",
            }}
          >
            Assign Creators
          </span>
        </div>

        {/* Divider under header row */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 186.5 - 104.5,
            width: 335,
            height: 1,
            background: "rgba(0,0,0,0.06)",
          }}
        />

        {/* Total Creators block */}
        <div
          style={{
            position: "absolute",
            left: 41 - 20,
            top: 202.5 - 104.5,
            width: 113,
            height: 17,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              lineHeight: "16.5px",
              color: "#AAAAAA",
            }}
          >
            Total Creators
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 41 - 20,
            top: 225.5 - 104.5,
            width: 37,
            height: 28,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 28,
              lineHeight: "28px",
              color: "#111111",
            }}
          >
            90
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 41 - 20,
            top: 257.5 - 104.5,
            width: 50,
            height: 18,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 12,
              lineHeight: "18px",
              color: "#888888",
            }}
          >
            Creators
          </span>
        </div>

        {/* Divider above three-column stats */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 292.5 - 104.5,
            width: 335,
            height: 1,
            background: "rgba(0,0,0,0.06)",
          }}
        />
        {/* Vertical dividers between columns */}
        <div
          style={{
            position: "absolute",
            left: 122 - 20,
            top: 292.5 - 104.5,
            width: 1,
            height: 99,
            background: "rgba(0,0,0,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 239 - 20,
            top: 292.5 - 104.5,
            width: 1,
            height: 99,
            background: "rgba(0,0,0,0.06)",
          }}
        />

        {/* Column 1: Assigned Creators */}
        <div
          style={{
            position: "absolute",
            left: 34 - 20,
            top: 308.5 - 104.5,
            width: 74,
            height: 33,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              lineHeight: "16.5px",
              color: "#AAAAAA",
            }}
          >
            Assigned Creators
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 55 - 20,
            top: 349.5 - 104.5,
            width: 32,
            height: 26,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 26,
              lineHeight: "26px",
              color: "#111111",
            }}
          >
            70
          </span>
        </div>

        {/* Column 2: Unassigned Creators */}
        <div
          style={{
            position: "absolute",
            left: 136.5 - 20,
            top: 308.5 - 104.5,
            width: 87,
            height: 33,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              lineHeight: "16.5px",
              color: "#AAAAAA",
            }}
          >
            Unassigned Creators
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 163.5 - 20,
            top: 349.5 - 104.5,
            width: 33,
            height: 26,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 26,
              lineHeight: "26px",
              color: "#3A7DE8",
            }}
          >
            20
          </span>
        </div>

        {/* Column 3: Pending Approvals */}
        <div
          style={{
            position: "absolute",
            left: 252.5 - 20,
            top: 308.5 - 104.5,
            width: 87,
            height: 33,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              lineHeight: "16.5px",
              color: "#AAAAAA",
            }}
          >
            Pending Approvals
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 287.5 - 20,
            top: 349.5 - 104.5,
            width: 17,
            height: 26,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 26,
              lineHeight: "26px",
              color: "#4ACD6D",
            }}
          >
            5
          </span>
        </div>
      </div>
    </div>
  );
}
