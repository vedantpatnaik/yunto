import {
  ArrowLeft,
  Plus,
  Instagram,
  Youtube,
  MapPin,
  X,
  Wifi,
  Battery,
  SignalHigh,
} from "lucide-react";

/**
 * Agency — Add Lead (Paid Campaign) — Figma node 827:6626, 375×946.
 * Static, pixel-exact reconstruction from the outline. Every visual node is
 * absolutely positioned with frame-relative coordinates. The scrollable form
 * content extends below the 946px viewport and is clipped by overflow-hidden.
 */
export default function AgAddLeadPaidCampaignPg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 946,
        background: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Frame '2' — tall background container */}
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

      {/* Decorative gradient blobs */}
      {/* Group 35898 — top-left blue */}
      <div
        style={{
          position: "absolute",
          left: -16.4,
          top: 167.5,
          width: 163.4,
          height: 157.1,
          borderRadius: 9999,
          background: "#CCF5FD",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -25,
          top: 93,
          width: 157.1,
          height: 152.8,
          borderRadius: 9999,
          background:
            "linear-gradient(135deg, rgba(70,181,252,0.7), rgba(143,190,255,0.7))",
        }}
      />
      {/* Group 35897 — middle-right purple */}
      <div
        style={{
          position: "absolute",
          left: 66.6,
          top: 612,
          width: 493.7,
          height: 488.6,
          borderRadius: 9999,
          background: "#FF90A9",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 135.2,
          top: 457.6,
          width: 476.7,
          height: 473.2,
          borderRadius: 9999,
          background: "linear-gradient(135deg, #8673B3, #A79AC6)",
        }}
      />
      {/* Group 35897 — bottom pink/peach */}
      <div
        style={{
          position: "absolute",
          left: 3.8,
          top: 1891.1,
          width: 204.3,
          height: 196.5,
          borderRadius: 9999,
          background: "#FBB7C6",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -4,
          top: 1798,
          width: 196.5,
          height: 191.1,
          borderRadius: 9999,
          background: "linear-gradient(135deg, #F3D29F, #EE9688)",
        }}
      />

      {/* Rectangle IMAGE — frosted background overlay (placeholder, translucent so blobs read through) */}
      <div
        style={{
          position: "absolute",
          left: -13,
          top: 0,
          width: 402,
          height: 2045,
          background:
            "linear-gradient(135deg, rgba(253,253,253,0.86), rgba(245,242,250,0.86))",
        }}
      />

      {/* ===== Status bar (system / light) ===== */}
      <div
        style={{
          position: "absolute",
          left: 19,
          top: 31,
          width: 54,
          height: 18,
          textAlign: "center",
          fontFamily: "Urbanist, sans-serif",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "18px",
          color: "#000000",
        }}
      >
        19:56
      </div>
      <SignalHigh
        style={{ position: "absolute", left: 291, top: 33 }}
        width={18}
        height={12}
        color="#000000"
      />
      <Wifi
        style={{ position: "absolute", left: 313, top: 33 }}
        width={16}
        height={12}
        color="#000000"
      />
      <Battery
        style={{ position: "absolute", left: 332, top: 31 }}
        width={26}
        height={14}
        color="#000000"
        fill="#000000"
      />

      {/* ===== Header Container ===== */}
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
      <ArrowLeft
        style={{ position: "absolute", left: 16, top: 85 }}
        width={24}
        height={24}
        color="#000000"
        strokeWidth={2}
      />
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 82,
          width: 298,
          height: 30,
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "37px",
          color: "#1B1B1C",
          textAlign: "left",
        }}
      >
        Add Lead
      </div>

      {/* ===== Form Container ===== */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 146,
          width: 343,
          height: 787,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 12,
        }}
      />

      {/* ---- Campaign Type ---- */}
      <FieldLabel top={160} text="Campaign Type" />
      <Pill
        left={27}
        top={191}
        width={79}
        bg="#BBF8DD"
        textLeft={38}
        textTop={200}
        textWidth={57}
        text="Barter"
      />
      <Pill
        left={114}
        top={191}
        width={76}
        bg="#FFFFFF"
        textLeft={128}
        textTop={200}
        textWidth={54}
        text="Paid"
      />

      {/* ---- Platform ---- */}
      <FieldLabel top={242} text="Platform" />
      {/* Add button */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 273,
          width: 91,
          height: 34,
          background: "#FEFCFF",
          border: "1px solid #000000",
          borderRadius: 20,
        }}
      />
      <Plus
        style={{ position: "absolute", left: 36, top: 280 }}
        width={20}
        height={20}
        color="#1C1B1B"
        strokeWidth={2}
      />
      <div
        style={{
          position: "absolute",
          left: 59,
          top: 279,
          width: 49,
          height: 22,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "24px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Add
      </div>
      {/* Instagram button */}
      <div
        style={{
          position: "absolute",
          left: 126,
          top: 273,
          width: 107,
          height: 34,
          background: "#FBFDFF",
          border: "1px solid #000000",
          borderRadius: 20,
        }}
      />
      <Instagram
        style={{ position: "absolute", left: 136, top: 281.5 }}
        width={16}
        height={16}
        color="#E1306C"
      />
      <div
        style={{
          position: "absolute",
          left: 154,
          top: 281,
          width: 67,
          height: 17,
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 13.6,
          lineHeight: "24px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Instagram
      </div>
      {/* Youtube button */}
      <div
        style={{
          position: "absolute",
          left: 241,
          top: 273,
          width: 96,
          height: 34,
          background: "#F3F3F3",
          border: "1px solid #000000",
          borderRadius: 20,
        }}
      />
      <Youtube
        style={{ position: "absolute", left: 247, top: 281.5 }}
        width={23}
        height={16}
        color="#FF0000"
      />
      <div
        style={{
          position: "absolute",
          left: 273,
          top: 281,
          width: 61,
          height: 17,
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 13.6,
          lineHeight: "24px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Youtube
      </div>

      {/* ---- Niche ---- */}
      <FieldLabel top={324} text="Niche" />
      {/* Add Tag button */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 355,
          width: 91,
          height: 34,
          background: "#FEFCFF",
          border: "1px solid #000000",
          borderRadius: 20,
        }}
      />
      <Plus
        style={{ position: "absolute", left: 36, top: 362 }}
        width={20}
        height={20}
        color="#1C1B1B"
        strokeWidth={2}
      />
      <div
        style={{
          position: "absolute",
          left: 59,
          top: 361,
          width: 49,
          height: 22,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "24px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Add Tag
      </div>
      <Pill
        left={126}
        top={355}
        width={76}
        bg="#FFF3D1"
        textLeft={140}
        textTop={364}
        textWidth={54}
        text="Fashion"
      />
      <Pill
        left={210}
        top={355}
        width={79}
        bg="#FFA6C8"
        textLeft={221}
        textTop={364}
        textWidth={57}
        text="Beauty"
      />

      {/* ---- Brand Name ---- */}
      <Heading top={407} text="Brand Name" />
      <TextInput top={434} placeholder="Brand Name" />

      {/* ---- Brand Website ---- */}
      <Heading top={485} text="Brand Website" />
      <TextInput top={512} placeholder="Website" />

      {/* ---- Email Address ---- */}
      <Heading top={563} text="Email Address" />
      <TextInput top={590} placeholder="Enter email address" />

      {/* ---- Contact Person ---- */}
      <Heading top={641} text="Contact Person " />
      <TextInput top={668} placeholder="Enter name" />

      {/* ---- Phone Number ---- */}
      <Heading top={719} text="Phone Number" />
      <TextInput top={746} placeholder="9888654776" />

      {/* ---- Campaign Budget ---- */}
      <Heading top={797} text="Campaign Budget" />
      <TextInput top={824} placeholder="₹  e.g. 5000" />

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 874,
          width: 320,
          height: 0,
          borderTop: "1px solid #AEACAF",
        }}
      />

      {/* Influencer Information label */}
      <FieldLabel top={886} text="Influencer Information" />

      {/* ---- No of influencers ---- */}
      <Heading top={917} text="No of influencers" />
      <TextInput top={944} placeholder="Enter in numbers" />

      {/* ---- Deliverables per creator ---- */}
      <Heading top={995} text="Deliverables per creator" />
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 1022,
          width: 320,
          height: 38,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 39.5,
          top: 1028.5,
          width: 232,
          height: 24,
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 13,
          lineHeight: "24px",
          color: "#000000",
          textAlign: "left",
        }}
      >
        Enter deliverables
      </div>
      <div
        style={{
          position: "absolute",
          left: 306.5,
          top: 1028,
          width: 25,
          height: 25,
          background: "#181717",
          border: "1px solid #D4D4D4",
          borderRadius: 9999,
        }}
      />
      <Plus
        style={{ position: "absolute", left: 310.5, top: 1032 }}
        width={18}
        height={18}
        color="#FFFFFF"
        strokeWidth={2.5}
      />

      {/* ---- Cities ---- */}
      <Heading top={1073} text="Cities" />
      {/* Add location button */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 1105,
          width: 121,
          height: 34,
          background: "#FEFCFF",
          border: "1px solid #000000",
          borderRadius: 20,
        }}
      />
      <MapPin
        style={{ position: "absolute", left: 38, top: 1112 }}
        width={20}
        height={20}
        color="#000000"
        strokeWidth={1.5}
      />
      <div
        style={{
          position: "absolute",
          left: 61,
          top: 1111,
          width: 73,
          height: 22,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "24px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Add location
      </div>
      {/* Delhi chip */}
      <div
        style={{
          position: "absolute",
          left: 156,
          top: 1105,
          width: 76,
          height: 34,
          background: "#F5F5F5",
          border: "1px solid #000000",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 164,
          top: 1113,
          width: 42,
          height: 17,
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 13.6,
          lineHeight: "24px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Delhi
      </div>
      <X
        style={{ position: "absolute", left: 208, top: 1114 }}
        width={16}
        height={16}
        color="#000000"
        strokeWidth={1}
      />

      {/* ---- Gender ---- */}
      <Heading top={1157} text="Gender" />
      <TextInput top={1184} placeholder="Female" />

      {/* ---- Language ---- */}
      <Heading top={1235} text="Language" />
      <TextInput top={1262} placeholder="" />

      {/* ---- Age ---- */}
      <Heading top={1313} text="Age" />
      <TextInput top={1340} placeholder="Age" />

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 1390,
          width: 320,
          height: 0,
          borderTop: "1px solid #AEACAF",
        }}
      />

      {/* ---- Priority ---- */}
      <FieldLabel top={1402} text="Priority " />
      <PriorityChip left={27} width={97} textLeft={43} textWidth={64} text="Low" color="#0078FD" />
      <PriorityChip left={129} width={115} textLeft={145} textWidth={81} text="Medium" color="#F2964E" />
      <PriorityChip left={249} width={97} textLeft={265} textWidth={64} text="High" color="#E84D3A" />

      {/* ---- Submition Deadline ---- */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 1484,
          width: 121,
          height: 16,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "16.2px",
          color: "#0D0D0D",
          textAlign: "left",
        }}
      >
        Submition Deadline
      </div>
      {/* Deadline track */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 1510,
          width: 320,
          height: 57,
          background: "#373737",
          border: "1px solid #191818",
          borderRadius: 28,
        }}
      />
      <DateChip left={1} top={1520} width={66} height={37} text="13 jun" />
      <DateChip left={75} top={1520} width={66} height={37} text="11 jun" />
      {/* Today chip (highlighted, multiline) */}
      <div
        style={{
          position: "absolute",
          left: 149,
          top: 1515,
          width: 75,
          height: 47,
          background: "#E0D0FF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 162,
          top: 1510,
          width: 49,
          height: 45,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "16px",
          color: "#0D0D0D",
          textAlign: "center",
          whiteSpace: "pre-line",
        }}
      >
        {"12 jun\nToday"}
      </div>
      <DateChip left={232} top={1520} width={66} height={37} text="13 jun" />
      <DateChip left={306} top={1520} width={66} height={37} text="13 jun" />

      {/* ===== Add Lead button ===== */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 1587,
          width: 320,
          height: 48,
          background: "#B7D0EE",
          border: "1px solid #000000",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 102,
          top: 1603,
          width: 170,
          height: 16,
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "18.5px",
          color: "#333333",
          textAlign: "center",
        }}
      >
        Add Lead
      </div>
    </div>
  );
}

/* ---------- small presentational helpers (static) ---------- */

function FieldLabel({ top, text }: { top: number; text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 27,
        top,
        width: 201,
        height: 16,
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: 13,
        lineHeight: "16.2px",
        color: "#000000",
        textAlign: "left",
      }}
    >
      {text}
    </div>
  );
}

function Heading({ top, text }: { top: number; text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 27,
        top,
        width: 286,
        height: 22,
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: 13,
        lineHeight: "24px",
        color: "#040404",
        textAlign: "left",
      }}
    >
      {text}
    </div>
  );
}

function TextInput({ top, placeholder }: { top: number; placeholder: string }) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 27,
          top,
          width: 320,
          height: 38,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
        }}
      />
      {placeholder ? (
        <div
          style={{
            position: "absolute",
            left: 39,
            top: top + 7,
            width: 248,
            height: 24,
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 13,
            lineHeight: "24px",
            color: "#000000",
            textAlign: "left",
          }}
        >
          {placeholder}
        </div>
      ) : null}
    </>
  );
}

function Pill({
  left,
  top,
  width,
  bg,
  textLeft,
  textTop,
  textWidth,
  text,
}: {
  left: number;
  top: number;
  width: number;
  bg: string;
  textLeft: number;
  textTop: number;
  textWidth: number;
  text: string;
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width,
          height: 34,
          background: bg,
          border: "1px solid #000000",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: textLeft,
          top: textTop,
          width: textWidth,
          height: 17,
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 13.6,
          lineHeight: "24px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </>
  );
}

function PriorityChip({
  left,
  width,
  textLeft,
  textWidth,
  text,
  color,
}: {
  left: number;
  width: number;
  textLeft: number;
  textWidth: number;
  text: string;
  color: string;
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left,
          top: 1431,
          width,
          height: 38,
          background: "#FFFFFF",
          border: `2px solid ${color}`,
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: textLeft,
          top: 1441,
          width: textWidth,
          height: 18,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "17.5px",
          color,
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </>
  );
}

function DateChip({
  left,
  top,
  width,
  height,
  text,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width,
          height,
          background: "#A8A9A8",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: left + 9,
          top: top + 7,
          width: 49,
          height: 23,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "20px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </>
  );
}
