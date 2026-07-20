import {
  MessageSquare,
  Mail,
  UserPlus,
  CheckCircle,
  Flag,
} from "lucide-react";

export default function AgTeamPg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 428,
        background: "linear-gradient(135deg, #EEDFFF, #FEFEFE)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Container */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 343,
          height: 428,
          background: "linear-gradient(135deg, #EEDFFF, #FEFEFE)",
          border: "1px solid #000000",
          borderRadius: 24,
        }}
      />

      {/* Title: Leads */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 15,
          width: 142,
          height: 42,
          fontFamily: "Outfit, sans-serif",
          fontWeight: 400,
          fontSize: 24,
          lineHeight: "24px",
          color: "#111827",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
        }}
      >
        Leads
      </div>

      {/* D / W / M toggle circles */}
      <div
        style={{
          position: "absolute",
          left: 238,
          top: 22.3,
          width: 28.5,
          height: 28.5,
          background: "#FFFEFE",
          border: "0.95px solid #000000",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 243.2,
          top: 28.9,
          width: 18,
          height: 15.2,
          fontFamily: "Outfit, sans-serif",
          fontWeight: 500,
          fontSize: 14.24,
          lineHeight: "22.8px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        D
      </div>

      <div
        style={{
          position: "absolute",
          left: 270.3,
          top: 22.3,
          width: 28.5,
          height: 28.5,
          background: "#FFFEFE",
          border: "0.71px solid #DCDCDC",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 275.5,
          top: 28.9,
          width: 18,
          height: 15.2,
          fontFamily: "Outfit, sans-serif",
          fontWeight: 400,
          fontSize: 14.24,
          lineHeight: "22.8px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        W
      </div>

      <div
        style={{
          position: "absolute",
          left: 302.6,
          top: 22.3,
          width: 28.5,
          height: 28.5,
          background: "#FFFEFE",
          border: "0.71px solid #DCDCDC",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 307.8,
          top: 28.9,
          width: 18,
          height: 15.2,
          fontFamily: "Outfit, sans-serif",
          fontWeight: 400,
          fontSize: 14.24,
          lineHeight: "22.8px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        M
      </div>

      {/* Card: 16 Contacted (green) */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 234,
          width: 152,
          height: 173,
          background: "#E9FFE8",
          borderRadius: 12,
        }}
      />
      <div style={{ position: "absolute", left: 30, top: 243 }}>
        <MessageSquare size={24} color="#000000" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 275,
          width: 137,
          height: 31,
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          lineHeight: "28px",
          color: "#000000",
          textAlign: "left",
        }}
      >
        16&nbsp;&nbsp;Contacted
      </div>

      {/* Card: 20 Unattended (yellow) */}
      <div
        style={{
          position: "absolute",
          left: 179,
          top: 85,
          width: 152,
          height: 94,
          background: "#FEFFDF",
          borderRadius: 12,
        }}
      />
      <div style={{ position: "absolute", left: 186, top: 100 }}>
        <Mail size={24} color="#000000" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 186,
          top: 132,
          width: 137,
          height: 31,
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          lineHeight: "28px",
          color: "#000000",
          textAlign: "left",
        }}
      >
        20&nbsp;&nbsp;Unattended
      </div>

      {/* Card: 2 New Lead (purple) */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 85,
          width: 152,
          height: 155,
          background: "#EEDFFF",
          borderRadius: 12,
        }}
      />
      <div style={{ position: "absolute", left: 27, top: 98 }}>
        <UserPlus size={24} color="#000000" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 130,
          width: 137,
          height: 31,
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          lineHeight: "28px",
          color: "#000000",
          textAlign: "left",
        }}
      >
        2 New Lead
      </div>
      {/* Chip: Event meetup */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 176,
          width: 137,
          height: 31,
          background: "#FFFFFF",
          borderRadius: 12,
        }}
      />
      <div style={{ position: "absolute", left: 32, top: 182.5 }}>
        <Mail size={18} color="#5C9AFF" strokeWidth={1} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 35.5,
          top: 183.5,
          width: 117,
          height: 16,
          fontFamily: "Outfit, sans-serif",
          fontWeight: 300,
          fontSize: 12,
          lineHeight: "16px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Event meetup{" "}
      </div>

      {/* Card: 06 Converted (pink) */}
      <div
        style={{
          position: "absolute",
          left: 180,
          top: 168,
          width: 152,
          height: 239,
          background: "#FFE5F3",
          borderRadius: 12,
        }}
      />
      <div style={{ position: "absolute", left: 187, top: 181 }}>
        <CheckCircle size={22} color="#000000" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 187,
          top: 211,
          width: 137,
          height: 31,
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          lineHeight: "28px",
          color: "#000000",
          textAlign: "left",
        }}
      >
        06&nbsp;&nbsp;Converted
      </div>
      {/* Chip: Base Skincare */}
      <div
        style={{
          position: "absolute",
          left: 187,
          top: 282,
          width: 137,
          height: 31,
          background: "#FFFFFF",
          borderRadius: 12,
        }}
      />
      <div style={{ position: "absolute", left: 192, top: 288.5 }}>
        <Flag size={18} color="#5C9AFF" strokeWidth={1} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 195.5,
          top: 289.5,
          width: 117,
          height: 16,
          fontFamily: "Outfit, sans-serif",
          fontWeight: 300,
          fontSize: 12,
          lineHeight: "16px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Base Skincare
      </div>
      {/* Chip: Nike Sneakers */}
      <div
        style={{
          position: "absolute",
          left: 187,
          top: 319,
          width: 137,
          height: 31,
          background: "#FFFFFF",
          borderRadius: 12,
        }}
      />
      <div style={{ position: "absolute", left: 192, top: 325.5 }}>
        <Flag size={18} color="#5C9AFF" strokeWidth={1} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 195.5,
          top: 326.5,
          width: 117,
          height: 16,
          fontFamily: "Outfit, sans-serif",
          fontWeight: 300,
          fontSize: 12,
          lineHeight: "16px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Nike Sneakers
      </div>
    </div>
  );
}
