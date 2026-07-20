import {
  Sparkles,
  Building2,
  MapPin,
  List,
  ChevronDown,
  Key,
  Lock,
} from "lucide-react";

export default function AgOnboarding2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 1030,
        background: "#F8F5EF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Top gradient wash */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 375,
          height: 256,
          background:
            "linear-gradient(135deg, rgba(249,228,232,0.2), rgba(249,228,232,0.0))",
        }}
      />

      {/* Icon badge */}
      <div
        style={{
          position: "absolute",
          left: 155.5,
          top: 106,
          width: 64,
          height: 64,
          background:
            "linear-gradient(135deg, rgba(129,140,248,0.25), rgba(196,181,253,0.18))",
          border: "1px solid #818CF8",
          borderRadius: 40,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 155.5,
          top: 106,
          width: 64,
          height: 64,
          background: "#FFFFFF",
          borderRadius: 40,
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 173.5,
          top: 124,
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sparkles size={28} color="#6366F1" strokeWidth={2} />
      </div>

      {/* Heading */}
      <div
        style={{
          position: "absolute",
          left: 58,
          top: 182,
          width: 259,
          height: 32,
          fontWeight: 600,
          fontSize: 24,
          lineHeight: "32px",
          color: "#111111",
          textAlign: "center",
        }}
      >
        Generate Agency Code
      </div>
      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          left: 47.5,
          top: 218,
          width: 280,
          height: 20,
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "20px",
          color: "#64748B",
          textAlign: "center",
        }}
      >
        Set up your agency workspace in seconds
      </div>

      {/* Card */}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 270,
          width: 327,
          height: 370,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 28,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      />

      {/* Field 1 — Agency Name */}
      <div
        style={{
          position: "absolute",
          left: 49,
          top: 295,
          width: 277,
          height: 16,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: "16px",
          color: "#64748B",
          textAlign: "left",
        }}
      >
        Agency Name
      </div>
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 317,
          width: 285,
          height: 50,
          background: "#FFFFFF",
          border: "1px solid #818CF8",
          borderRadius: 40,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 62,
          top: 334,
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Building2 size={16} color="#64748B" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 332,
          width: 178,
          height: 20,
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "20px",
          color: "#64748B",
          textAlign: "left",
        }}
      >
        e.g. Stellar Creator Agency
      </div>

      {/* Field 2 — Location */}
      <div
        style={{
          position: "absolute",
          left: 49,
          top: 383,
          width: 277,
          height: 16,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: "16px",
          color: "#64748B",
          textAlign: "left",
        }}
      >
        Location
      </div>
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 405,
          width: 285,
          height: 50,
          background: "#FFFFFF",
          border: "1px solid #818CF8",
          borderRadius: 40,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 62,
          top: 422,
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MapPin size={16} color="#64748B" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 420,
          width: 87,
          height: 20,
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "20px",
          color: "#64748B",
          textAlign: "left",
        }}
      >
        City, Country
      </div>

      {/* Field 3 — Agency Type */}
      <div
        style={{
          position: "absolute",
          left: 49,
          top: 471,
          width: 277,
          height: 16,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: "16px",
          color: "#64748B",
          textAlign: "left",
        }}
      >
        Agency Type
      </div>
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 493,
          width: 285,
          height: 50,
          background: "#FFFFFF",
          border: "1px solid #818CF8",
          borderRadius: 40,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 62,
          top: 510,
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <List size={16} color="#64748B" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 508,
          width: 183,
          height: 20,
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "20px",
          color: "#64748B",
          textAlign: "left",
        }}
      >
        Creator / Influencer Agency
      </div>
      <div
        style={{
          position: "absolute",
          left: 298,
          top: 510.5,
          width: 15,
          height: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronDown size={15} color="#64748B" strokeWidth={2} />
      </div>

      {/* Generate Code button */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 563,
          width: 285,
          height: 52,
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          borderRadius: 40,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 124,
          top: 581,
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sparkles size={16} color="#FFFFFF" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 148,
          top: 579,
          width: 103,
          height: 20,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "20px",
          color: "#FFFFFF",
          textAlign: "center",
        }}
      >
        Generate Code
      </div>

      {/* OR divider */}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 679.5,
          width: 135,
          height: 1,
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.0), rgba(0,0,0,0.1))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 179,
          top: 672,
          width: 17,
          height: 16,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "16px",
          color: "#64748B",
          textAlign: "left",
        }}
      >
        OR
      </div>
      <div
        style={{
          position: "absolute",
          left: 216,
          top: 679.5,
          width: 135,
          height: 1,
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.0))",
        }}
      />

      {/* Secondary button — Already Have Agency Code */}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 720,
          width: 327,
          height: 54,
          background: "#FFFFFF",
          border: "1px solid #6366F1",
          borderRadius: 40,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 83.5,
          top: 739.5,
          width: 15,
          height: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Key size={15} color="#6366F1" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 106.5,
          top: 737,
          width: 185,
          height: 20,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "20px",
          color: "#6366F1",
          textAlign: "center",
        }}
      >
        Already Have Agency Code
      </div>

      {/* Privacy note */}
      <div
        style={{
          position: "absolute",
          left: 84.5,
          top: 787.5,
          width: 13,
          height: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Lock size={13} color="#64748B" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 105.5,
          top: 786,
          width: 185,
          height: 16,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "16px",
          color: "#64748B",
          textAlign: "left",
        }}
      >
        Your code is private &amp; encrypted
      </div>
    </div>
  );
}
