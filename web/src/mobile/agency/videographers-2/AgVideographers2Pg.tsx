import { ChevronLeft, ChevronDown, MapPin, Camera } from "lucide-react";

const IMG_PLACEHOLDER = "linear-gradient(135deg,#E9E4F0,#D9CFEA)";

export default function AgVideographers2Pg() {
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronLeft size={16} color="#FAF7F2" strokeWidth={1.35} />
      </div>

      {/* Videographers dropdown */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 19.5,
          width: 174,
          height: 41,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 91,
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
      <div
        style={{
          position: "absolute",
          left: 209,
          top: 31,
          width: 18,
          height: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronDown size={14} color="#8A8A8E" strokeWidth={1.5} />
      </div>

      {/* 20 Jun pill */}
      <div
        style={{
          position: "absolute",
          left: 266,
          top: 21,
          width: 73.4,
          height: 38,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 281,
          top: 32,
          width: 43.4,
          height: 16,
          color: "#6E6E73",
          fontWeight: 600,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        20 Jun
      </div>

      {/* ===== Filter chips ===== */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 106,
          width: 106.1,
          height: 40,
          background: "#D4DCFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 117,
          width: 68.1,
          height: 17,
          color: "#1D1D1F",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
          textAlign: "center",
        }}
      >
        ✨ Fashion
      </div>

      <div
        style={{
          position: "absolute",
          left: 138.1,
          top: 106,
          width: 94.2,
          height: 40,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 157.1,
          top: 117,
          width: 56.2,
          height: 17,
          color: "#6E6E73",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
          textAlign: "center",
        }}
      >
        ✈️ Travel
      </div>

      <div
        style={{
          position: "absolute",
          left: 244.3,
          top: 106,
          width: 90.6,
          height: 40,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 263.3,
          top: 117,
          width: 52.6,
          height: 17,
          color: "#6E6E73",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
          textAlign: "center",
        }}
      >
        🎉 Event
      </div>

      <div
        style={{
          position: "absolute",
          left: 346.9,
          top: 106,
          width: 100.2,
          height: 40,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 365.9,
          top: 117,
          width: 62.2,
          height: 17,
          color: "#6E6E73",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
          textAlign: "center",
        }}
      >
        💄 Beauty
      </div>

      {/* ===== Card stack ===== */}
      {/* Card 1 — Aman (back) */}
      <div
        style={{
          position: "absolute",
          left: 30.5,
          top: 266.6,
          width: 314,
          height: 436.7,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 32,
          boxShadow: "0 12px 32px rgba(0,0,0,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64.8,
          top: 283.2,
          width: 263.1,
          height: 201,
          background: IMG_PLACEHOLDER,
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60.8,
          top: 480.4,
          width: 68.7,
          height: 33.6,
          color: "#1D1D1F",
          fontWeight: 800,
          fontSize: 26,
          lineHeight: "31.5px",
        }}
      >
        Aman
      </div>
      <div
        style={{
          position: "absolute",
          left: 47,
          top: 635.1,
          width: 143.1,
          height: 42.8,
          background: "linear-gradient(135deg, #F3EBFF, #EAF5FF)",
          border: "1px solid #FFFFFF",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 61.2,
          top: 644.3,
          width: 114.8,
          height: 24.3,
          color: "#1D1D1F",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        ₹7000 | 4 Hrs Shoot
      </div>

      {/* Card 2 — Priya (middle) */}
      <div
        style={{
          position: "absolute",
          left: 29,
          top: 246.1,
          width: 317,
          height: 451.8,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 32,
          boxShadow: "0 12px 32px rgba(0,0,0,0.07)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 46,
          top: 263.1,
          width: 271.8,
          height: 203.5,
          background: IMG_PLACEHOLDER,
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 56.9,
          top: 482.3,
          width: 62.1,
          height: 32.6,
          color: "#1D1D1F",
          fontWeight: 800,
          fontSize: 26,
          lineHeight: "31.5px",
        }}
      >
        Priya
      </div>
      <div
        style={{
          position: "absolute",
          left: 65.5,
          top: 640.9,
          width: 150.7,
          height: 40.1,
          background: "linear-gradient(135deg, #F3EBFF, #EAF5FF)",
          border: "1px solid #FFFFFF",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 80.1,
          top: 650.1,
          width: 121.4,
          height: 21.5,
          color: "#1D1D1F",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        ₹6000 | 2 Hrs Shoot
      </div>

      {/* Card 3 — Sarthak (front) */}
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 222,
          width: 310,
          height: 460,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 32,
          boxShadow: "0 16px 40px rgba(0,0,0,0.10)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 52,
          top: 237.5,
          width: 276,
          height: 203,
          background: IMG_PLACEHOLDER,
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 52,
          top: 459,
          width: 97.7,
          height: 31,
          color: "#1D1D1F",
          fontWeight: 800,
          fontSize: 26,
          lineHeight: "31.5px",
        }}
      >
        Sarthak
      </div>

      {/* Sarthak location badge */}
      <div
        style={{
          position: "absolute",
          left: 260.2,
          top: 459,
          width: 67.8,
          height: 27,
          background: "#FFFFFF",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 270.2,
          top: 465.5,
          width: 14,
          height: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MapPin size={13} color="#6E6E73" strokeWidth={1.17} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 288.2,
          top: 465,
          width: 29.8,
          height: 15,
          color: "#6E6E73",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        Delhi
      </div>

      {/* Sarthak description */}
      <div
        style={{
          position: "absolute",
          left: 52,
          top: 498,
          width: 276,
          height: 42,
          color: "#6E6E73",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "21px",
          whiteSpace: "pre-line",
        }}
      >
        {"Fashion & Lifestyle Videographer\n5 yrs exp. • Works with Nykaa, H&M"}
      </div>

      {/* Sarthak price badge */}
      <div
        style={{
          position: "absolute",
          left: 52,
          top: 557,
          width: 176.8,
          height: 34,
          background: "linear-gradient(135deg, #F3EBFF, #EAF5FF)",
          border: "1px solid #FFFFFF",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 67,
          top: 567,
          width: 14,
          height: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Camera size={13} color="#1D1D1F" strokeWidth={1.17} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 87,
          top: 566,
          width: 126.8,
          height: 16,
          color: "#1D1D1F",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        ₹5000 | 2 Hrs Shoot
      </div>

      {/* Sarthak View profile button */}
      <div
        style={{
          position: "absolute",
          left: 52,
          top: 613,
          width: 276,
          height: 52,
          background: "#312B28",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 138.5,
          top: 629,
          width: 103,
          height: 20,
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: 16,
          lineHeight: "19.4px",
          textAlign: "center",
        }}
      >
        View profile
      </div>

      {/* ===== Bottom controls ===== */}
      {/* SELECT YOUR SHOOT TYPE */}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 765,
          width: 144,
          height: 26,
          color: "#8A8A8E",
          fontWeight: 700,
          fontSize: 11,
          lineHeight: "13.3px",
        }}
      >
        SELECT YOUR SHOOT TYPE
      </div>

      {/* Fire type button 1 */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 799,
          width: 44,
          height: 44,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          lineHeight: "20px",
        }}
      >
        🔥
      </div>
      {/* Fire type button 2 (selected) */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 799,
          width: 44,
          height: 44,
          background: "linear-gradient(135deg, #1D1D1F, #3A3A3C)",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          lineHeight: "20px",
        }}
      >
        🔥
      </div>
      {/* Fire type button 3 */}
      <div
        style={{
          position: "absolute",
          left: 124,
          top: 799,
          width: 44,
          height: 44,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          lineHeight: "20px",
        }}
      >
        🔥
      </div>

      {/* SELECT CITY */}
      <div
        style={{
          position: "absolute",
          left: 236,
          top: 777,
          width: 77.1,
          height: 14,
          color: "#8A8A8E",
          fontWeight: 700,
          fontSize: 11,
          lineHeight: "13.3px",
        }}
      >
        SELECT CITY
      </div>

      {/* City selector */}
      <div
        style={{
          position: "absolute",
          left: 232.2,
          top: 799,
          width: 122.8,
          height: 44,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 251.2,
          top: 813,
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MapPin size={15} color="#8A8A8E" strokeWidth={1.33} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 275.2,
          top: 812.5,
          width: 34.8,
          height: 17,
          color: "#1D1D1F",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: "16.9px",
          textAlign: "center",
        }}
      >
        Delhi
      </div>
      <div
        style={{
          position: "absolute",
          left: 318,
          top: 812,
          width: 18,
          height: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronDown size={14} color="#8A8A8E" strokeWidth={1.5} />
      </div>
    </div>
  );
}
