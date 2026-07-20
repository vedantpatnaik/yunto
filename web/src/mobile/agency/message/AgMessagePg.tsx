import {
  ChevronLeft,
  Lock,
  Sparkles,
  Users,
  ListChecks,
  Video,
  Info,
  Send,
  Menu,
  X,
  Megaphone,
  Flag,
} from "lucide-react";

const IMG_PLACEHOLDER =
  "linear-gradient(135deg, #E9E4F0, #D9CFEA)";

export default function AgMessagePg() {
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
      {/* ===== Top Nav ===== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 375,
          height: 80,
          background: "#FDFDF6",
        }}
      />
      {/* Back button */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 22,
          width: 36,
          height: 36,
          background: "#1F1A17",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronLeft size={16} color="#FAF7F2" strokeWidth={1.35} />
      </div>
      {/* Heading 1: lock icon + Baseskincare */}
      <div
        style={{
          position: "absolute",
          left: 122,
          top: 32,
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Lock size={14} color="#888888" strokeWidth={1.33} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 142,
          top: 30,
          width: 108.4,
          height: 20,
          color: "#1A1A1A",
          fontWeight: 700,
          fontSize: 17,
          lineHeight: "20.6px",
          textAlign: "left",
        }}
      >
        Baseskincare
      </div>

      {/* ===== Main → Brief Message Card ===== */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 106,
          width: 335,
          height: 663,
          background:
            "linear-gradient(135deg, rgba(255,248,242,0.95), rgba(255,252,248,0.95))",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      />

      {/* Card Header: avatar + Dev + time */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 131,
          width: 44,
          height: 44,
          background: IMG_PLACEHOLDER,
          border: "2px solid #FFFFFF",
          borderRadius: 22,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 101,
          top: 134.5,
          width: 30.4,
          height: 20,
          color: "#1A1A1A",
          fontWeight: 700,
          fontSize: 16,
          lineHeight: "19.4px",
        }}
      >
        Dev
      </div>
      <div
        style={{
          position: "absolute",
          left: 101,
          top: 156.5,
          width: 50.7,
          height: 15,
          color: "#888888",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        11:55 AM
      </div>

      {/* Participant avatars */}
      <div
        style={{
          position: "absolute",
          left: 254,
          top: 131,
          width: 32,
          height: 32,
          background: IMG_PLACEHOLDER,
          border: "2px solid #FFFFFF",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 276,
          top: 131,
          width: 32,
          height: 32,
          background: IMG_PLACEHOLDER,
          border: "2px solid #FFFFFF",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 298,
          top: 131,
          width: 32,
          height: 32,
          background: "#FFFFFF",
          border: "2px solid #FFFFFF",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#555555",
            fontWeight: 700,
            fontSize: 11,
            lineHeight: "13.3px",
          }}
        >
          +2
        </span>
      </div>

      {/* ===== Key Message Section ===== */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 203,
          width: 135.2,
          height: 30,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 14,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 211,
          width: 14,
          height: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sparkles size={14} color="#F57C00" strokeWidth={1.17} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 210,
          width: 85.2,
          height: 16,
          color: "#333333",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Key Message
      </div>
      <div
        style={{
          position: "absolute",
          left: 49,
          top: 245,
          width: 281,
          height: 48,
          color: "#444444",
          fontWeight: 400,
          fontSize: 15,
          lineHeight: "24px",
          whiteSpace: "pre-line",
        }}
      >
        {"Celebrating your natural glow and how\nour serum enhances it effortlessly."}
      </div>

      {/* ===== Target Audience Section ===== */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 317,
          width: 154.8,
          height: 30,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 14,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 325,
          width: 14,
          height: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Users size={14} color="#1976D2" strokeWidth={1.17} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 324,
          width: 104.8,
          height: 16,
          color: "#333333",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Target Audience
      </div>
      <div
        style={{
          position: "absolute",
          left: 49,
          top: 359,
          width: 281,
          height: 48,
          color: "#444444",
          fontWeight: 400,
          fontSize: 15,
          lineHeight: "24px",
          whiteSpace: "pre-line",
        }}
      >
        {"Gen Z & young millennial women\nlooking for minimal, effective skincare."}
      </div>

      {/* ===== Guidelines Section ===== */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 431,
          width: 117.5,
          height: 30,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 14,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 439,
          width: 14,
          height: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ListChecks size={14} color="#388E3C" strokeWidth={1.17} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 438,
          width: 67.5,
          height: 16,
          color: "#333333",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Guidelines
      </div>
      <div
        style={{
          position: "absolute",
          left: 67,
          top: 473,
          width: 176.8,
          height: 24,
          color: "#444444",
          fontWeight: 400,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        Morning skincare routine
      </div>
      <div
        style={{
          position: "absolute",
          left: 67,
          top: 503,
          width: 204.9,
          height: 48,
          color: "#444444",
          fontWeight: 400,
          fontSize: 15,
          lineHeight: "24px",
          whiteSpace: "pre-line",
        }}
      >
        {"Use product naturally in your\nbathroom"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 67,
          top: 557.5,
          width: 216.6,
          height: 24,
          color: "#444444",
          fontWeight: 400,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        Mention the hydration benefits
      </div>

      {/* ===== Deliverables Section ===== */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 606,
          width: 128.9,
          height: 30,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 14,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 614,
          width: 14,
          height: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Video size={14} color="#7B1FA2" strokeWidth={1.17} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 613,
          width: 78.9,
          height: 16,
          color: "#333333",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Deliverables
      </div>
      <div
        style={{
          position: "absolute",
          left: 67,
          top: 648,
          width: 143.4,
          height: 24,
          color: "#444444",
          fontWeight: 400,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        Duration: 20–40 sec
      </div>
      <div
        style={{
          position: "absolute",
          left: 67,
          top: 678.5,
          width: 207.7,
          height: 24,
          color: "#444444",
          fontWeight: 400,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        Format: Instagram Reel (9:16)
      </div>

      {/* ===== Notes Section ===== */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 727,
          width: 87.6,
          height: 30,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 14,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 735,
          width: 14,
          height: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Info size={14} color="#D32F2F" strokeWidth={1.17} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 734,
          width: 37.5,
          height: 16,
          color: "#333333",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Notes
      </div>
      <div
        style={{
          position: "absolute",
          left: 67,
          top: 769,
          width: 179.5,
          height: 24,
          color: "#444444",
          fontWeight: 400,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        Avoid using beauty filters
      </div>
      <div
        style={{
          position: "absolute",
          left: 67,
          top: 799,
          width: 172.4,
          height: 48,
          color: "#444444",
          fontWeight: 400,
          fontSize: 15,
          lineHeight: "24px",
          whiteSpace: "pre-line",
        }}
      >
        {"Keep tone authentic and\nconversational"}
      </div>

      {/* ===== Input Area ===== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 770,
          width: 375,
          height: 106,
          background:
            "linear-gradient(180deg, #FDFDF6, rgba(253,253,246,0))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 786,
          width: 335,
          height: 58,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 32,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 806,
          width: 255,
          height: 18,
          color: "#999999",
          fontWeight: 400,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        Message #Baseskincare
      </div>
      <div
        style={{
          position: "absolute",
          left: 304,
          top: 793,
          width: 44,
          height: 44,
          background:
            "linear-gradient(135deg, rgba(255,229,164,0.82), rgba(255,245,228,0.92), rgba(244,211,238,0.88), rgba(202,217,255,0.76))",
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Send size={15} color="#3A3A3A" strokeWidth={1.5} />
      </div>

      {/* ===== Sidebar Overlay (Frame 2147223240) ===== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 375,
          height: 875,
          background: "#B5B4B9",
        }}
      />

      {/* Aside - Sidebar Panel */}
      <div
        style={{
          position: "absolute",
          left: 65,
          top: 0,
          width: 310,
          height: 875,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(253,253,246,0.98))",
          border: "1px solid #FFFFFF",
          borderRadius: "32px 0px 0px 32px",
        }}
      />

      {/* Sidebar Header */}
      <div
        style={{
          position: "absolute",
          left: 66,
          top: 0,
          width: 309,
          height: 101,
          borderBottom: "1px solid #000000",
        }}
      />
      {/* Logo box */}
      <div
        style={{
          position: "absolute",
          left: 86,
          top: 32,
          width: 44,
          height: 44,
          background: "linear-gradient(135deg, #A2B5F5, #8DC49D)",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Menu size={22} color="#FFFFFF" strokeWidth={1.83} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 144,
          top: 33.5,
          width: 161,
          height: 23,
          color: "#1A1A1A",
          fontWeight: 700,
          fontSize: 19,
          lineHeight: "23px",
        }}
      >
        Socyio
      </div>
      <div
        style={{
          position: "absolute",
          left: 144,
          top: 58.5,
          width: 161,
          height: 16,
          color: "#888888",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Workspace
      </div>
      {/* Close button */}
      <div
        style={{
          position: "absolute",
          left: 319,
          top: 36,
          width: 36,
          height: 36,
          background: "#000000",
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={20} color="#666666" strokeWidth={1.67} />
      </div>

      {/* ===== Sidebar Content: Agency Notifications ===== */}
      <div
        style={{
          position: "absolute",
          left: 83.2,
          top: 125,
          width: 164.3,
          height: 15,
          color: "#999999",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        AGENCY NOTIFICATIONS
      </div>
      <div
        style={{
          position: "absolute",
          left: 78,
          top: 152,
          width: 285,
          height: 52,
          borderRadius: 18,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 168,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Megaphone size={20} color="#FF8A65" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 132,
          top: 169,
          width: 209,
          height: 18,
          color: "#1A1A1A",
          fontWeight: 700,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        Announcements
      </div>
      <div
        style={{
          position: "absolute",
          left: 341,
          top: 174,
          width: 8,
          height: 8,
          background: "#FF8A65",
          borderRadius: 4,
        }}
      />

      {/* ===== Sidebar Content: Campaigns ===== */}
      <div
        style={{
          position: "absolute",
          left: 83.2,
          top: 232,
          width: 81,
          height: 15,
          color: "#999999",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        CAMPAIGNS
      </div>
      <div
        style={{
          position: "absolute",
          left: 78,
          top: 251,
          width: 285,
          height: 60,
          borderRadius: 18,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 275,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Flag size={20} color="#90CAF9" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 132,
          top: 276,
          width: 217,
          height: 18,
          color: "#555555",
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        Nike X Socyio
      </div>
      {/* Active campaign: Baseskincare */}
      <div
        style={{
          position: "absolute",
          left: 78,
          top: 315,
          width: 285,
          height: 52,
          background:
            "linear-gradient(135deg, rgba(235,228,255,0.7), rgba(255,235,242,0.7))",
          borderRadius: 18,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 331,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Flag size={20} color="#BA68C8" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 132,
          top: 332,
          width: 189.2,
          height: 18,
          color: "#2B2240",
          fontWeight: 700,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        Baseskincare
      </div>
      <div
        style={{
          position: "absolute",
          left: 321.2,
          top: 329.5,
          width: 27.8,
          height: 23,
          background: "#FFFFFF",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#9C27B0",
            fontWeight: 700,
            fontSize: 12,
            lineHeight: "14.5px",
          }}
        >
          3
        </span>
      </div>

      {/* ===== Sidebar Content: Direct Messages ===== */}
      <div
        style={{
          position: "absolute",
          left: 83.2,
          top: 395,
          width: 125.6,
          height: 15,
          color: "#999999",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        DIRECT MESSAGES
      </div>
      {/* Dev Singh */}
      <div
        style={{
          position: "absolute",
          left: 78,
          top: 414,
          width: 285,
          height: 64,
          borderRadius: 18,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 434,
          width: 32,
          height: 32,
          background: IMG_PLACEHOLDER,
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 116,
          top: 458,
          width: 10,
          height: 10,
          background: "#4CAF50",
          border: "2px solid #FFFFFF",
          borderRadius: 5,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 136,
          top: 441,
          width: 213,
          height: 18,
          color: "#555555",
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        Dev Singh
      </div>
      {/* Sanjay Sharma */}
      <div
        style={{
          position: "absolute",
          left: 78,
          top: 482,
          width: 285,
          height: 56,
          borderRadius: 18,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 494,
          width: 32,
          height: 32,
          background: IMG_PLACEHOLDER,
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 136,
          top: 501,
          width: 213,
          height: 18,
          color: "#555555",
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        Sanjay Sharma
      </div>
      {/* Pooja Singh */}
      <div
        style={{
          position: "absolute",
          left: 78,
          top: 542,
          width: 285,
          height: 56,
          borderRadius: 18,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 554,
          width: 32,
          height: 32,
          background: IMG_PLACEHOLDER,
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 116,
          top: 578,
          width: 10,
          height: 10,
          background: "#4CAF50",
          border: "2px solid #FFFFFF",
          borderRadius: 5,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 136,
          top: 560.5,
          width: 86.4,
          height: 19,
          color: "#1A1A1A",
          fontWeight: 700,
          fontSize: 15,
          lineHeight: "18.1px",
        }}
      >
        Pooja Singh
      </div>
      <div
        style={{
          position: "absolute",
          left: 349.8,
          top: 566,
          width: 8,
          height: 8,
          background: "#4DB6AC",
          borderRadius: 4,
        }}
      />

      {/* ===== Sidebar Footer / User Profile ===== */}
      <div
        style={{
          position: "absolute",
          left: 86,
          top: 767,
          width: 269,
          height: 76,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 102,
          top: 783,
          width: 44,
          height: 44,
          background: IMG_PLACEHOLDER,
          border: "1px solid #F0F0F0",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 161,
          top: 787,
          width: 179,
          height: 18,
          color: "#1A1A1A",
          fontWeight: 700,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        Rohit Kumar
      </div>
      <div
        style={{
          position: "absolute",
          left: 161,
          top: 807,
          width: 179,
          height: 16,
          color: "#888888",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Manager
      </div>
    </div>
  );
}
