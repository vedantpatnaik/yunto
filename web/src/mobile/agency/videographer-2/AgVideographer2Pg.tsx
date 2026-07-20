import {
  ArrowUp,
  ChevronUp,
  X,
  Heart,
  Flame,
  Calendar,
} from "lucide-react";

/**
 * Agency — Videographer (node 4731:15388), pixel-exact to Figma outline.
 * All nodes are absolutely positioned with frame-relative coordinates.
 */
export default function AgVideographer2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 812,
        background: "#E9FFB6",
        borderRadius: 24,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Off-canvas tab labels (from outline) */}
      <div
        style={{
          position: "absolute",
          left: 33,
          top: 1113,
          width: 148,
          height: 21,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#FFFFFF",
          fontFamily: "'League Spartan', sans-serif",
          fontWeight: 500,
          fontSize: 24,
          lineHeight: "22px",
        }}
      >
        UGC Creation
      </div>
      <div
        style={{
          position: "absolute",
          left: 211,
          top: 1113,
          width: 148,
          height: 21,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#FFFFFF",
          fontFamily: "'League Spartan', sans-serif",
          fontWeight: 500,
          fontSize: 24,
          lineHeight: "22px",
        }}
      >
        Brand Collab
      </div>

      {/* ---- Stacked card backdrop ---- */}
      {/* purple parent card */}
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 151,
          width: 304.3,
          height: 446.5,
          background: "#BDA2DC",
          borderRadius: 9.942,
        }}
      />
      {/* pink card */}
      <div
        style={{
          position: "absolute",
          left: 44.1,
          top: 156,
          width: 287.2,
          height: 436.1,
          background: "#FFCDC3",
          borderRadius: 9.942,
        }}
      />
      {/* blue front card */}
      <div
        style={{
          position: "absolute",
          left: 20.1,
          top: 141.9,
          width: 333.9,
          height: 463.5,
          background: "#C3CFFF",
          borderRadius: 9.942,
        }}
      />

      {/* Card image (placeholder) */}
      <div
        style={{
          position: "absolute",
          left: 30.3,
          top: 151.4,
          width: 284.8,
          height: 247.7,
          background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)",
          border: "0.83px solid #000000",
          borderRadius: 6.628,
        }}
      />

      {/* Name row */}
      <div
        style={{
          position: "absolute",
          left: 134.6,
          top: 388.7,
          width: 70,
          height: 28.6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#111827",
          fontFamily: "'Urbanist', sans-serif",
          fontWeight: 600,
          fontSize: 16.57,
          lineHeight: "23.2px",
        }}
      >
        Sarthak
      </div>
      <div
        style={{
          position: "absolute",
          left: 201.8,
          top: 387.3,
          width: 11.8,
          height: 20.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 8.45,
          lineHeight: "13.3px",
        }}
      >
        📍
      </div>
      <div
        style={{
          position: "absolute",
          left: 210.8,
          top: 382.6,
          width: 35.5,
          height: 23.6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#4B5563",
          fontFamily: "'Urbanist', sans-serif",
          fontWeight: 500,
          fontSize: 10.77,
          lineHeight: "23.2px",
        }}
      >
        Delhi
      </div>

      {/* Sub title */}
      <div
        style={{
          position: "absolute",
          left: 63.8,
          top: 392.2,
          width: 260.2,
          height: 56.3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 9.942,
          lineHeight: "23.2px",
        }}
      >
        Fashion &amp; Lifestyle Videographer | 6 Yrs Exp.
      </div>

      {/* Rates pill */}
      <div
        style={{
          position: "absolute",
          left: 67.4,
          top: 422.5,
          width: 264.1,
          height: 77.8,
          background: "#FAFFB8",
          border: "0.83px solid #000000",
          borderRadius: 13.256,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 68.3,
          top: 423.5,
          width: 262.2,
          height: 75.9,
          background: "#FFFFFF",
          borderRadius: 11.599,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 122.4,
          top: 442.5,
          width: 154,
          height: 37.9,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#333333",
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
          fontSize: 12.428,
          lineHeight: "15.7px",
        }}
      >
        Rates ₹5000 | 2 Hrs Shoot
      </div>

      {/* View work */}
      <div
        style={{
          position: "absolute",
          left: 167.5,
          top: 501.3,
          width: 59.4,
          height: 22.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 11.599,
          lineHeight: "14.5px",
        }}
      >
        View work
      </div>
      <div
        style={{
          position: "absolute",
          left: 228,
          top: 497.2,
          width: 18.8,
          height: 18.8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronUp size={16} color="#000000" strokeWidth={2} />
      </div>

      {/* Cancel circle */}
      <div
        style={{
          position: "absolute",
          left: 95,
          top: 540.6,
          width: 47,
          height: 47,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 107.2,
          top: 552.8,
          width: 22.5,
          height: 22.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={18} color="#000000" strokeWidth={3.3} />
      </div>

      {/* Heart circle */}
      <div
        style={{
          position: "absolute",
          left: 283.6,
          top: 513.1,
          width: 47,
          height: 47,
          background: "#FFE9F4",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 290,
          top: 520.4,
          width: 30.7,
          height: 30.7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Heart size={24} color="#F472C9" fill="#F472C9" strokeWidth={2} />
      </div>

      {/* ---- Bottom: shoot type ---- */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 642,
          width: 144,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#111827",
          fontFamily: "'Urbanist', sans-serif",
          fontWeight: 600,
          fontSize: 14.348,
          lineHeight: "20.1px",
        }}
      >
        Select your shoot type
      </div>

      {/* Normal */}
      <div
        style={{
          position: "absolute",
          left: 19,
          top: 671,
          width: 42,
          height: 42,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 26,
          top: 678,
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Flame size={26} color="#F1B31C" fill="#FCEA2B" strokeWidth={1.5} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 721,
          width: 48,
          height: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 9.058,
          lineHeight: "11.3px",
        }}
      >
        Normal
      </div>

      {/* Medium */}
      <div
        style={{
          position: "absolute",
          left: 82,
          top: 671,
          width: 42,
          height: 42,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 89,
          top: 678,
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Flame size={26} color="#F44336" fill="#FF6D00" strokeWidth={1.5} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 79,
          top: 721,
          width: 48,
          height: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 9.058,
          lineHeight: "11.3px",
        }}
      >
        Medium
      </div>

      {/* High-end */}
      <div
        style={{
          position: "absolute",
          left: 145,
          top: 671,
          width: 42,
          height: 42,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 152,
          top: 678,
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Flame size={26} color="#D7812D" fill="#FF5141" strokeWidth={1.5} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 142,
          top: 721,
          width: 48,
          height: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 9.058,
          lineHeight: "11.3px",
        }}
      >
        High-end
      </div>

      {/* ---- Bottom: select city ---- */}
      <div
        style={{
          position: "absolute",
          left: 255,
          top: 642,
          width: 71,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          textAlign: "right",
          color: "#111827",
          fontFamily: "'Urbanist', sans-serif",
          fontWeight: 600,
          fontSize: 14.348,
          lineHeight: "20.1px",
        }}
      >
        Select city
      </div>
      <div
        style={{
          position: "absolute",
          left: 241,
          top: 673,
          width: 108,
          height: 42,
          background: "#FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 252,
          top: 680,
          width: 28,
          height: 28,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 10.2,
          lineHeight: "16px",
        }}
      >
        📍
      </div>
      <div
        style={{
          position: "absolute",
          left: 295,
          top: 686.5,
          width: 43,
          height: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          color: "#333333",
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "15.1px",
        }}
      >
        Delhi
      </div>

      {/* ---- Top nav ---- */}
      {/* back circle */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 67,
          width: 32,
          height: 32,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 22,
          top: 73,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowUp size={18} color="#000000" strokeWidth={2} />
      </div>

      {/* Videographers pill */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 62,
          width: 165,
          height: 42,
          background: "#FFFFFF",
          border: "1px solid #333333",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 70.5,
          top: 75,
          width: 116,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#000000",
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
          fontSize: 16,
          lineHeight: "16px",
        }}
      >
        Videographers
      </div>
      <div
        style={{
          position: "absolute",
          left: 194.5,
          top: 73,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronUp size={16} color="#000000" strokeWidth={2.5} />
      </div>

      {/* Date pill */}
      <div
        style={{
          position: "absolute",
          left: 249,
          top: 62,
          width: 108,
          height: 42,
          background: "#FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 257,
          top: 68,
          width: 30,
          height: 30,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Calendar size={18} color="#000000" strokeWidth={1.5} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 299,
          top: 75.5,
          width: 46,
          height: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          color: "#333333",
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "15.1px",
        }}
      >
        20 Jun
      </div>
    </div>
  );
}
