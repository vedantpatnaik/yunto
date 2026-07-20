import { ArrowLeft, Pencil, ChevronDown, Wifi } from "lucide-react";

const CLASH = "'Clash Display', sans-serif";
const INTER = "Inter, sans-serif";
const URBANIST = "Urbanist, sans-serif";

// One editable field: label heading + bordered input value
function Field({
  top,
  label,
  value,
}: {
  top: number;
  label: string;
  value: string;
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 32,
          top: top + 1,
          width: 99,
          height: 22,
          fontFamily: INTER,
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "24px",
          color: "#040404",
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          left: 32,
          top: top + 28,
          width: 313,
          height: 38,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 44,
          top: top + 35,
          width: 265,
          height: 24,
          fontFamily: INTER,
          fontWeight: 400,
          fontSize: 13,
          lineHeight: "24px",
          color: "#000000",
        }}
      >
        {value}
      </div>
    </>
  );
}

// Section header row (edit pencil + title + chevron) used in card + agency button
function SectionHeader({ top, title }: { top: number; title: string }) {
  return (
    <>
      <div style={{ position: "absolute", left: 40, top, width: 20, height: 20 }}>
        <Pencil size={16} strokeWidth={1.5} color="#000000" style={{ marginLeft: 2, marginTop: 2 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 76,
          top,
          width: 234,
          height: 20,
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "20px",
          color: "#242220",
        }}
      >
        {title}
      </div>
      <div style={{ position: "absolute", left: 319, top: top + 4, width: 24, height: 12 }}>
        <ChevronDown size={16} strokeWidth={2} color="#000000" style={{ marginLeft: 4 }} />
      </div>
    </>
  );
}

export default function AgProfileInfo2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 931, background: "#FFFFFF", fontFamily: INTER }}
    >
      {/* Inner background frame */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 375,
          height: 2062,
          background: "#FDFDFD",
        }}
      />

      {/* Decorative blobs */}
      {/* bottom-left */}
      <div style={{ position: "absolute", left: 3.8, top: 1891.1, width: 204.3, height: 196.5, borderRadius: "50%", background: "#FBB7C6" }} />
      <div style={{ position: "absolute", left: -4, top: 1798, width: 196.5, height: 191.1, borderRadius: "50%", background: "linear-gradient(135deg, #F3D29F, #EE9688)" }} />
      {/* center-right large */}
      <div style={{ position: "absolute", left: 66.6, top: 612, width: 493.7, height: 488.6, borderRadius: "50%", background: "#FF90A9" }} />
      <div style={{ position: "absolute", left: 135.2, top: 457.6, width: 476.7, height: 473.2, borderRadius: "50%", background: "linear-gradient(135deg, #8673B3, #A79AC6)" }} />
      {/* top-left */}
      <div style={{ position: "absolute", left: -16.4, top: 167.5, width: 163.4, height: 157.1, borderRadius: "50%", background: "#CCF5FD" }} />
      <div style={{ position: "absolute", left: -25, top: 93, width: 157.1, height: 152.8, borderRadius: "50%", background: "linear-gradient(135deg, rgba(70,181,252,0.7), rgba(143,190,255,0.7))" }} />

      {/* Full-bleed image (frosted glass overlay placeholder) */}
      <div
        style={{
          position: "absolute",
          left: -13,
          top: 0,
          width: 402,
          height: 2045,
          background: "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(233,228,240,0.55))",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
        }}
      />

      {/* Header container */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 70,
          width: 375,
          height: 54,
          background: "#FFFFFF",
          borderBottom: "1px solid #717171",
        }}
      />
      <div style={{ position: "absolute", left: 16, top: 85, width: 24, height: 24 }}>
        <ArrowLeft size={16} strokeWidth={2} color="#000000" style={{ marginLeft: 5, marginTop: 5 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 82,
          width: 298,
          height: 30,
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "37px",
          color: "#1B1B1C",
        }}
      >
        Edit Profile &amp; Brand Info
      </div>

      {/* Main profile card */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 136,
          width: 336,
          height: 546,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 8,
        }}
      />

      {/* Card header: Profile Info */}
      <SectionHeader top={152} title="Profile Info" />

      {/* Profile picture */}
      <div
        style={{
          position: "absolute",
          left: 158.5,
          top: 189,
          width: 60,
          height: 60,
          borderRadius: 9999,
          background: "linear-gradient(135deg, #E9E4F0, #D9CFEA)",
          border: "1px solid #000000",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 123,
          top: 256,
          width: 131,
          height: 20,
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 11,
          lineHeight: "20px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Change profile picture
      </div>

      {/* Fields */}
      <Field top={288} label="Full Name" value="Vinay" />
      <Field top={366} label="Email Address" value="vinay77@gmail.com" />
      <Field top={444} label="Assign as" value="Influencer Marketing" />
      <Field top={522} label="Birth Date" value="09/11/2003" />
      <Field top={600} label="Gender" value="Male" />

      {/* Agency Info button */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 692,
          width: 336,
          height: 52,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 8,
        }}
      />
      <SectionHeader top={708} title="Agency Info" />

      {/* Status bar */}
      <div
        style={{
          position: "absolute",
          left: 19,
          top: 31,
          width: 54,
          height: 18,
          fontFamily: URBANIST,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "18px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        19:56
      </div>

      {/* Cellular signal bars */}
      <div style={{ position: "absolute", left: 292, top: 41.3, width: 3, height: 4, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 296.7, top: 39.3, width: 3, height: 6, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 301.3, top: 37, width: 3, height: 8.3, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 306, top: 34.7, width: 3, height: 10.7, background: "#000000", borderRadius: 1 }} />

      {/* Wifi */}
      <div style={{ position: "absolute", left: 314, top: 33, width: 16, height: 12 }}>
        <Wifi size={15} strokeWidth={2} color="#000000" />
      </div>

      {/* Battery */}
      <div
        style={{
          position: "absolute",
          left: 334.3,
          top: 34.3,
          width: 22,
          height: 11.3,
          border: "1px solid #000000",
          borderRadius: 2.67,
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 336.3,
          top: 36.3,
          width: 18,
          height: 7.3,
          background: "#000000",
          borderRadius: 1.33,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 357.3,
          top: 38,
          width: 1.3,
          height: 4,
          background: "#000000",
          borderRadius: 1,
          opacity: 0.4,
        }}
      />
    </div>
  );
}
