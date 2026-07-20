import {
  ChevronLeft,
  Heart,
  Check,
  Info,
  MapPin,
  Star,
  Clock,
  Briefcase,
  Play,
} from "lucide-react";

const IMG = "linear-gradient(135deg,#E9E4F0,#D9CFEA)";

export default function AgVideographersDetails2Pg() {
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
      {/* ===== Header ===== */}
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
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}
      />
      <ChevronLeft
        size={16}
        color="#FAF7F2"
        style={{ position: "absolute", left: 26, top: 32 }}
      />
      {/* Title pill */}
      <div
        style={{
          position: "absolute",
          left: 72.5,
          top: 19.5,
          width: 153,
          height: 41,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 91.5,
          top: 30.5,
          width: 112,
          height: 19,
          color: "#1D1D1F",
          fontWeight: 700,
          fontSize: 15,
          lineHeight: "18.2px",
          textAlign: "center",
        }}
      >
        Videographers
      </div>
      {/* Date pill */}
      <div
        style={{
          position: "absolute",
          left: 246,
          top: 21,
          width: 113,
          height: 38,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 261,
          top: 32,
          width: 94,
          height: 16,
          color: "#6E6E73",
          fontWeight: 600,
          fontSize: 13,
          lineHeight: "15.7px",
          textAlign: "left",
        }}
      >
        20 Jun | Delhi
      </div>

      {/* ===== Main ===== */}
      {/* Hero image / background */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 100,
          width: 335,
          height: 460,
          background: IMG,
          borderRadius: 28,
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        }}
      />
      {/* Hero dark gradient overlay */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 310,
          width: 335,
          height: 250,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.0) 100%)",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      />
      {/* TOP RATED badge (glass) */}
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 390,
          width: 108.6,
          height: 28,
          background: "rgba(255,255,255,0.18)",
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: 14,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />
      <Info
        size={12}
        color="#FFFFFF"
        style={{ position: "absolute", left: 57, top: 398 }}
      />
      <div
        style={{
          position: "absolute",
          left: 73,
          top: 397,
          width: 66.6,
          height: 14,
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: 11,
          lineHeight: "13.3px",
          textAlign: "left",
        }}
      >
        TOP RATED
      </div>
      {/* Name */}
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 430,
          width: 287,
          height: 36,
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: 32,
          lineHeight: "35.2px",
          textAlign: "left",
        }}
      >
        Sarthak
      </div>
      {/* Role */}
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 470,
          width: 287,
          height: 21,
          color: "#FFFFFF",
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "21px",
          textAlign: "left",
        }}
      >
        Fashion &amp; Lifestyle Videographer
      </div>
      {/* Location */}
      <MapPin
        size={14}
        color="#FFFFFF"
        style={{ position: "absolute", left: 44, top: 500 }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 499,
          width: 106.1,
          height: 16,
          color: "#FFFFFF",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
          textAlign: "left",
        }}
      >
        Delhi • 5 yrs exp.
      </div>

      {/* Pricing card overlapping hero */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: 520,
          width: 303,
          height: 55,
          background: "#E4ECF4",
          border: "1px solid #E8E2D9",
          borderRadius: 28,
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 97.1,
          top: 537,
          width: 57.9,
          height: 21,
          color: "#0D86FF",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: "21.8px",
          textAlign: "center",
        }}
      >
        ₹5000
      </div>
      <div
        style={{
          position: "absolute",
          left: 164.8,
          top: 539.5,
          width: 1,
          height: 16,
          background: "#E0E0E0",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 175.5,
          top: 537,
          width: 102.4,
          height: 21,
          color: "#1A1A1A",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: "21.8px",
          textAlign: "center",
        }}
      >
        2 Hrs Shoot
      </div>

      {/* Summary card */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 599,
          width: 335,
          height: 132,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 41,
          top: 619.2,
          width: 293,
          height: 90.8,
          color: "#444444",
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "22.5px",
          textAlign: "left",
          whiteSpace: "pre-line",
        }}
      >
        {'"I turn brand vibes into scroll-stopping\nvisuals. Specializing in high-retention\nedits and aesthetic storytelling for\nlifestyle brands."'}
      </div>

      {/* Expertise heading */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 755,
          width: 335,
          height: 19,
          color: "#1A1A1A",
          fontWeight: 700,
          fontSize: 16,
          lineHeight: "19.4px",
          textAlign: "left",
        }}
      >
        Expertise
      </div>
      {/* Expertise tags */}
      {/* Reels */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 786,
          width: 68.2,
          height: 34,
          background: "#E8F5E9",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 795,
          width: 34.2,
          height: 16,
          color: "#2E7D32",
          fontWeight: 600,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Reels
      </div>
      {/* BTS Shoots */}
      <div
        style={{
          position: "absolute",
          left: 98.2,
          top: 786,
          width: 106,
          height: 34,
          background: "#FFF3E0",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 115.2,
          top: 795,
          width: 72,
          height: 16,
          color: "#E65100",
          fontWeight: 600,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        BTS Shoots
      </div>
      {/* Brand Campaigns */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 830,
          width: 145.5,
          height: 34,
          background: "#F3E5F5",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 839,
          width: 111.5,
          height: 16,
          color: "#6A1B9A",
          fontWeight: 600,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Brand Campaigns
      </div>
      {/* Color Grading */}
      <div
        style={{
          position: "absolute",
          left: 175.5,
          top: 830,
          width: 121.1,
          height: 34,
          background: "#E3F2FD",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 192.5,
          top: 839,
          width: 87.1,
          height: 16,
          color: "#1565C0",
          fontWeight: 600,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Color Grading
      </div>
      {/* Fast Cuts */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 874,
          width: 93,
          height: 34,
          background: "#FCE4EC",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 883,
          width: 59,
          height: 16,
          color: "#C2185B",
          fontWeight: 600,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Fast Cuts
      </div>

      {/* ===== Stats Grid ===== */}
      {/* Rating card */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 932,
          width: 161.5,
          height: 85,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}
      />
      <Star
        size={14}
        color="#F5A623"
        fill="#F5A623"
        style={{ position: "absolute", left: 37, top: 950 }}
      />
      <div
        style={{
          position: "absolute",
          left: 57,
          top: 949,
          width: 39.3,
          height: 16,
          color: "#666666",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Rating
      </div>
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 969,
          width: 33.3,
          height: 21,
          color: "#1A1A1A",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: "21.8px",
        }}
      >
        4.9
      </div>
      <div
        style={{
          position: "absolute",
          left: 70.3,
          top: 973,
          width: 31.3,
          height: 16,
          color: "#888888",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        (124)
      </div>
      {/* Availability card */}
      <div
        style={{
          position: "absolute",
          left: 193.5,
          top: 932,
          width: 161.5,
          height: 85,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}
      />
      <Clock
        size={14}
        color="#666666"
        style={{ position: "absolute", left: 210.5, top: 950 }}
      />
      <div
        style={{
          position: "absolute",
          left: 230.5,
          top: 949,
          width: 83.4,
          height: 16,
          color: "#666666",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        {"Today's Slots"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 210.5,
          top: 973,
          width: 56.7,
          height: 27,
          background: "#E8F5E9",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 222.5,
          top: 979,
          width: 32.7,
          height: 15,
          color: "#2E7D32",
          fontWeight: 600,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        10:00
      </div>
      <div
        style={{
          position: "absolute",
          left: 274.7,
          top: 973,
          width: 56.7,
          height: 27,
          background: "#E8F5E9",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 286.7,
          top: 979,
          width: 32.7,
          height: 15,
          color: "#2E7D32",
          fontWeight: 600,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        14:00
      </div>
      {/* Past Clients card */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 1029,
          width: 335,
          height: 87,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}
      />
      <Briefcase
        size={14}
        color="#666666"
        style={{ position: "absolute", left: 37, top: 1047 }}
      />
      <div
        style={{
          position: "absolute",
          left: 57,
          top: 1046,
          width: 73.4,
          height: 16,
          color: "#666666",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Past Clients
      </div>
      {/* Client chips */}
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 1070,
          width: 63.4,
          height: 29,
          background: "#FFFFFF",
          border: "1px solid #F0F0F0",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 1077,
          width: 37.4,
          height: 15,
          color: "#333333",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        Nykaa
      </div>
      <div
        style={{
          position: "absolute",
          left: 108.4,
          top: 1070,
          width: 93.3,
          height: 29,
          background: "#FFFFFF",
          border: "1px solid #F0F0F0",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 121.4,
          top: 1077,
          width: 67.3,
          height: 15,
          color: "#333333",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        Mamaearth
      </div>
      <div
        style={{
          position: "absolute",
          left: 209.7,
          top: 1070,
          width: 54.2,
          height: 29,
          background: "#FFFFFF",
          border: "1px solid #F0F0F0",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 222.7,
          top: 1077,
          width: 28.2,
          height: 15,
          color: "#333333",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        H&amp;M
      </div>
      <div
        style={{
          position: "absolute",
          left: 272,
          top: 1070,
          width: 46.9,
          height: 29,
          background: "#FFFFFF",
          border: "1px solid #F0F0F0",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 285,
          top: 1077,
          width: 20.9,
          height: 15,
          color: "#888888",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        +12
      </div>

      {/* ===== Past Work Grid ===== */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 1140,
          width: 335,
          height: 19,
          color: "#1A1A1A",
          fontWeight: 700,
          fontSize: 16,
          lineHeight: "19.4px",
        }}
      >
        Past Work
      </div>
      {/* Work 1 */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 1171,
          width: 161.5,
          height: 207.6,
          background: IMG,
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 82.8,
          top: 1256.9,
          width: 36,
          height: 36,
          background: "#000000",
          border: "1px solid #FFFFFF",
          borderRadius: 18,
        }}
      />
      <Play
        size={18}
        color="#FFFFFF"
        fill="#FFFFFF"
        style={{ position: "absolute", left: 91.8, top: 1265.9 }}
      />
      {/* Work 2 */}
      <div
        style={{
          position: "absolute",
          left: 193.5,
          top: 1171,
          width: 161.5,
          height: 201.9,
          background: IMG,
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 256.2,
          top: 1253.9,
          width: 36,
          height: 36,
          background: "#000000",
          border: "1px solid #FFFFFF",
          borderRadius: 18,
        }}
      />
      <Play
        size={18}
        color="#FFFFFF"
        fill="#FFFFFF"
        style={{ position: "absolute", left: 265.2, top: 1262.9 }}
      />
      {/* Work 3 */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 1384.9,
          width: 161.5,
          height: 207.6,
          background: IMG,
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 82.8,
          top: 1470.8,
          width: 36,
          height: 36,
          background: "#000000",
          border: "1px solid #FFFFFF",
          borderRadius: 18,
        }}
      />
      <Play
        size={18}
        color="#FFFFFF"
        fill="#FFFFFF"
        style={{ position: "absolute", left: 91.8, top: 1479.8 }}
      />
      {/* Work 4 */}
      <div
        style={{
          position: "absolute",
          left: 193.5,
          top: 1384.9,
          width: 161.5,
          height: 209.8,
          background: IMG,
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 256.2,
          top: 1471.8,
          width: 36,
          height: 36,
          background: "#000000",
          border: "1px solid #FFFFFF",
          borderRadius: 18,
        }}
      />
      <Play
        size={18}
        color="#FFFFFF"
        fill="#FFFFFF"
        style={{ position: "absolute", left: 265.2, top: 1480.8 }}
      />

      {/* ===== Bottom action bar (on top) ===== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 762,
          width: 375,
          height: 108,
          background:
            "linear-gradient(to top, #FAF9F6 0%, rgba(250,249,246,0.0) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Skip button */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 778,
          width: 128,
          height: 59,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 30,
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 69.5,
          top: 799,
          width: 29,
          height: 17,
          color: "#1A1A1A",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "16.9px",
          textAlign: "center",
        }}
      >
        Skip
      </div>
      {/* Heart button */}
      <div
        style={{
          position: "absolute",
          left: 193,
          top: 778,
          width: 60,
          height: 60,
          background: "#FFFFFF",
          border: "1px solid #EAEAEA",
          borderRadius: 30,
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        }}
      />
      <Heart
        size={28}
        color="#FF5252"
        style={{ position: "absolute", left: 209, top: 794 }}
      />
      {/* Check button */}
      <div
        style={{
          position: "absolute",
          left: 298,
          top: 778,
          width: 60,
          height: 60,
          background: "#312B28",
          border: "1px solid #EAEAEA",
          borderRadius: 30,
          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
        }}
      />
      <Check
        size={28}
        color="#FFFFFF"
        style={{ position: "absolute", left: 314, top: 794 }}
      />
    </div>
  );
}
