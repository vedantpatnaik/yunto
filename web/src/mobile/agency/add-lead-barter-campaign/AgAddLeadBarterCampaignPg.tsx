import type { CSSProperties } from "react";
import { ArrowLeft, Plus, Instagram, Youtube, MapPin, X, Wifi } from "lucide-react";

/**
 * Agency app — "Add Lead / Barter Campaign" (Figma node 843:3306, 375×946).
 * Pixel-exact, static reproduction of the Figma outline. Every visual node is
 * absolutely positioned at its frame-relative coordinates. The underlying
 * content frame is 2062px tall (a scroll surface); the root clips it to the
 * 946px viewport with overflow-hidden, so nodes below the fold are cropped
 * exactly as in a screenshot of the top of the screen.
 */

const INTER = "Inter, sans-serif";
const CLASH = "'Clash Display', sans-serif";
const URBANIST = "'Urbanist', sans-serif";

export default function AgAddLeadBarterCampaignPg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 946, background: "#FFFFFF", fontFamily: INTER }}
    >
      {/* FRAME '2' — content surface (2062 tall, clipped) */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 375, height: 2062, background: "#FDFDFD" }} />

      {/* ---- decorative blobs (behind frosted image overlay) ---- */}
      {/* Group 35897 (bottom) */}
      <div style={{ position: "absolute", left: 3.8, top: 1891.1, width: 204.3, height: 196.5, borderRadius: 9999, background: "#FBB7C6" }} />
      <div style={{ position: "absolute", left: -4, top: 1798, width: 196.5, height: 191.1, borderRadius: 9999, background: "linear-gradient(135deg, #F3D29F, #EE9688)" }} />
      {/* Group 35897 (middle) */}
      <div style={{ position: "absolute", left: 66.6, top: 612, width: 493.7, height: 488.6, borderRadius: 9999, background: "#FF90A9" }} />
      <div style={{ position: "absolute", left: 135.2, top: 457.6, width: 476.7, height: 473.2, borderRadius: 9999, background: "linear-gradient(135deg, #8673B3, #A79AC6)" }} />
      {/* Group 35898 (top) */}
      <div style={{ position: "absolute", left: -16.4, top: 167.5, width: 163.4, height: 157.1, borderRadius: 9999, background: "#CCF5FD" }} />
      <div style={{ position: "absolute", left: -25, top: 93, width: 157.1, height: 152.8, borderRadius: 9999, background: "linear-gradient(135deg, rgba(70,181,252,0.7), rgba(143,190,255,0.7))" }} />

      {/* RECTANGLE 'Rectangle' — IMAGE placeholder / frosted overlay */}
      <div
        style={{
          position: "absolute",
          left: -13,
          top: 0,
          width: 402,
          height: 2045,
          background: "linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.28))",
          backdropFilter: "blur(55px)",
          WebkitBackdropFilter: "blur(55px)",
        }}
      />

      {/* ---- Header Container ---- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 70,
          width: 375,
          height: 54,
          background: "#FFFFFF",
          border: "1px solid #717171",
          boxSizing: "border-box",
        }}
      />
      {/* back arrow (meteor-icons:arrow-up used as back nav) */}
      <div style={{ position: "absolute", left: 16, top: 85, width: 24, height: 24 }}>
        <ArrowLeft size={24} color="#000000" strokeWidth={2} />
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
          textAlign: "left",
        }}
      >
        Add Lead
      </div>

      {/* ---- Form Container ---- */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 146,
          width: 343,
          height: 785,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 12,
          boxSizing: "border-box",
        }}
      />

      {/* ===== Campaign Type ===== */}
      <div style={label(28, 160)}>Campaign Type</div>
      <div style={pill(28, 191, 79, "#FFFFFF")} />
      <div style={pillText(39, 200, 57)}>Barter</div>
      <div style={pill(115, 191, 76, "#C1F8E1")} />
      <div style={pillText(129, 200, 54)}>Paid</div>

      {/* ===== Platform ===== */}
      <div style={label(28, 242)}>Platform</div>
      {/* Add */}
      <div style={pill(28, 273, 91, "#FEFCFF")} />
      <div style={{ position: "absolute", left: 37, top: 280, width: 20, height: 20 }}>
        <Plus size={20} color="#1C1B1B" strokeWidth={2.4} />
      </div>
      <div style={pillTextMed(60, 279, 49)}>Add </div>
      {/* Instagram */}
      <div style={pill(127, 273, 107, "#FBFDFF")} />
      <div style={{ position: "absolute", left: 137, top: 281.5, width: 16, height: 16 }}>
        <Instagram size={16} color="#E1306C" strokeWidth={2} />
      </div>
      <div style={pillText(155, 281, 67)}>Instagram</div>
      {/* Youtube */}
      <div style={pill(242, 273, 96, "#F3F3F3")} />
      <div style={{ position: "absolute", left: 249, top: 281.5, width: 23, height: 16 }}>
        <Youtube size={20} color="#FF0000" strokeWidth={2} />
      </div>
      <div style={pillText(274, 281, 61)}>Youtube</div>

      {/* ===== Niche ===== */}
      <div style={label(28, 324)}>Niche</div>
      {/* Add Tag */}
      <div style={pill(28, 355, 91, "#FEFCFF")} />
      <div style={{ position: "absolute", left: 37, top: 362, width: 20, height: 20 }}>
        <Plus size={20} color="#1C1B1B" strokeWidth={2.4} />
      </div>
      <div style={pillTextMed(60, 361, 49)}>Add Tag</div>
      {/* Fashion */}
      <div style={pill(127, 355, 76, "#FFF3D1")} />
      <div style={pillText(141, 364, 54)}>Fashion</div>
      {/* Beauty */}
      <div style={pill(211, 355, 79, "#FFA6C8")} />
      <div style={pillText(222, 364, 57)}>Beauty</div>

      {/* ===== Brand Name ===== */}
      <div style={heading(28, 407)}>Brand Name</div>
      <div style={inputBox(28, 434)} />
      <div style={inputText(40, 441)}>Brand Name</div>

      {/* ===== Brand Website ===== */}
      <div style={heading(28, 485)}>Brand Website</div>
      <div style={inputBox(28, 512)} />
      <div style={inputText(40, 519)}>Website</div>

      {/* ===== Email Address ===== */}
      <div style={heading(28, 563)}>Email Address</div>
      <div style={inputBox(28, 590)} />
      <div style={inputText(40, 597)}>Enter email address</div>

      {/* ===== Contact Person ===== */}
      <div style={heading(28, 641)}>Contact Person </div>
      <div style={inputBox(28, 668)} />
      <div style={inputText(40, 675)}>Enter name</div>

      {/* ===== Phone Number ===== */}
      <div style={heading(28, 719)}>Phone Number</div>
      <div style={inputBox(28, 746)} />
      <div style={inputText(40, 753)}>9888654776</div>

      {/* ===== Barter value ===== */}
      <div style={heading(28, 797)}>Barter value</div>
      <div style={inputBox(28, 824)} />
      <div style={inputText(40, 833)}>₹  e.g. 5000</div>

      {/* ===== Agency fee ===== */}
      <div style={heading(28, 875)}>Agency fee</div>
      <div style={inputBox(28, 902)} />
      <div style={inputText(40, 911)}>₹  e.g. 5000</div>

      {/* ---- divider ---- */}
      <div style={{ position: "absolute", left: 28, top: 952, width: 320, height: 0, borderTop: "1px solid #AEACAF" }} />

      {/* ===== Influencer Information ===== */}
      <div style={label(28, 964)}>Influencer Information</div>

      {/* ===== No of influencers ===== */}
      <div style={heading(28, 995)}>No of influencers</div>
      <div style={inputBox(28, 1022)} />
      <div style={inputText(40, 1029)}>Enter in numbers</div>

      {/* ===== Deliverables per creator ===== */}
      <div style={heading(28, 1073)}>Deliverables per creator</div>
      <div style={inputBox(28, 1100)} />
      <div style={inputText(40.5, 1106.5)}>Enter deliverables</div>
      <div
        style={{
          position: "absolute",
          left: 307.5,
          top: 1106,
          width: 25,
          height: 25,
          background: "#181717",
          border: "1px solid #D4D4D4",
          borderRadius: 9999,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={14} color="#FFFFFF" strokeWidth={2.6} />
      </div>

      {/* ===== Cities ===== */}
      <div style={heading(28, 1151)}>Cities</div>
      {/* Add location */}
      <div style={pill(28, 1183, 121, "#FEFCFF")} />
      <div style={{ position: "absolute", left: 39, top: 1190, width: 20, height: 20 }}>
        <MapPin size={16} color="#000000" strokeWidth={1.5} />
      </div>
      <div style={pillTextMed(62, 1189, 73)}>Add location</div>
      {/* Delhi chip */}
      <div style={pill(157, 1183, 76, "#F5F5F5")} />
      <div style={{ ...pillText(165, 1191, 42), textAlign: "left" }}>Delhi</div>
      <div style={{ position: "absolute", left: 209, top: 1192, width: 16, height: 16 }}>
        <X size={12} color="#000000" strokeWidth={1.5} />
      </div>

      {/* ===== Gender ===== */}
      <div style={heading(28, 1235)}>Gender</div>
      <div style={inputBox(28, 1262)} />
      <div style={inputText(40, 1269)}>Female</div>

      {/* ===== Language ===== */}
      <div style={heading(28, 1313)}>Language</div>
      <div style={inputBox(28, 1340)} />

      {/* ===== Age ===== */}
      <div style={heading(28, 1391)}>Age</div>
      <div style={inputBox(28, 1418)} />
      <div style={inputText(40, 1425)}>Age</div>

      {/* ---- divider ---- */}
      <div style={{ position: "absolute", left: 28, top: 1468, width: 320, height: 0, borderTop: "1px solid #AEACAF" }} />

      {/* ===== Priority ===== */}
      <div style={label(28, 1480)}>Priority </div>
      <div style={priorityPill(28, 97, "#0078FD")} />
      <div style={priorityText(44, 64, "#0078FD")}>Low</div>
      <div style={priorityPill(130, 115, "#F2964E")} />
      <div style={priorityText(146, 81, "#F2964E")}>Medium</div>
      <div style={priorityPill(250, 97, "#E84D3A")} />
      <div style={priorityText(266, 64, "#E84D3A")}>High</div>

      {/* ===== Submition Deadline ===== */}
      <div style={{ ...label(28, 1562), color: "#0D0D0D" }}>Submition Deadline</div>
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 1588,
          width: 320,
          height: 57,
          background: "#373737",
          border: "1px solid #191818",
          borderRadius: 28,
          boxSizing: "border-box",
        }}
      />
      {/* date chips (Frame 1171275383 coords are screen-relative) */}
      <div style={dateChip(2, 1598, 66, 37, "#A8A9A8")} />
      <div style={dateChipText(11, 1605, 49)}>13 jun</div>
      <div style={dateChip(76, 1598, 66, 37, "#A8A9A8")} />
      <div style={dateChipText(85, 1605, 49)}>11 jun</div>
      <div style={dateChip(150, 1593, 75, 47, "#E0D0FF")} />
      <div
        style={{
          position: "absolute",
          left: 163,
          top: 1588,
          width: 49,
          height: 45,
          fontFamily: INTER,
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
      <div style={dateChip(233, 1598, 66, 37, "#A8A9A8")} />
      <div style={dateChipText(242, 1605, 49)}>13 jun</div>
      <div style={dateChip(307, 1598, 66, 37, "#A8A9A8")} />
      <div style={dateChipText(316, 1605, 49)}>13 jun</div>

      {/* ---- Add Lead button ---- */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 1701,
          width: 335,
          height: 48,
          background: "#B7D0EE",
          border: "1px solid #000000",
          borderRadius: 16,
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 102.5,
          top: 1717,
          width: 170,
          height: 16,
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "18.5px",
          color: "#333333",
          textAlign: "center",
        }}
      >
        Add Lead
      </div>

      {/* ================= Status bar ================= */}
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
      {/* Cellular bars */}
      <div style={{ position: "absolute", left: 292, top: 41.3, width: 3, height: 4, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 296.7, top: 39.3, width: 3, height: 6, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 301.3, top: 37, width: 3, height: 8.3, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 306, top: 34.7, width: 3, height: 10.7, background: "#000000", borderRadius: 1 }} />
      {/* Wifi */}
      <div style={{ position: "absolute", left: 313, top: 33, width: 16, height: 16 }}>
        <Wifi size={15} color="#000000" strokeWidth={2} />
      </div>
      {/* Battery */}
      <div
        style={{
          position: "absolute",
          left: 334.3,
          top: 34.3,
          width: 22,
          height: 11.3,
          border: "1px solid rgba(0,0,0,0.35)",
          borderRadius: 2.67,
          boxSizing: "border-box",
        }}
      />
      <div style={{ position: "absolute", left: 336.3, top: 36.3, width: 18, height: 7.3, background: "#000000", borderRadius: 1.33 }} />
      <div style={{ position: "absolute", left: 357.3, top: 38, width: 1.3, height: 4, background: "#000000", borderRadius: 1 }} />
    </div>
  );
}

/* ---------- style helpers ---------- */

function label(left: number, top: number): CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    width: 201,
    height: 16,
    fontFamily: INTER,
    fontWeight: 500,
    fontSize: 13,
    lineHeight: "16.2px",
    color: "#000000",
    textAlign: "left",
  };
}

function heading(left: number, top: number): CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    width: 286,
    height: 22,
    fontFamily: INTER,
    fontWeight: 500,
    fontSize: 13,
    lineHeight: "24px",
    color: "#040404",
    textAlign: "left",
  };
}

function inputBox(left: number, top: number): CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    width: 320,
    height: 38,
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    boxSizing: "border-box",
  };
}

function inputText(left: number, top: number): CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    width: 248,
    height: 24,
    fontFamily: INTER,
    fontWeight: 400,
    fontSize: 13,
    lineHeight: "24px",
    color: "#000000",
    textAlign: "left",
  };
}

function pill(left: number, top: number, width: number, bg: string): CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    width,
    height: 34,
    background: bg,
    border: "1px solid #000000",
    borderRadius: 20,
    boxSizing: "border-box",
  };
}

function pillText(left: number, top: number, width: number): CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    width,
    height: 17,
    fontFamily: INTER,
    fontWeight: 400,
    fontSize: 13.6,
    lineHeight: "24px",
    color: "#000000",
    textAlign: "center",
  };
}

function pillTextMed(left: number, top: number, width: number): CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    width,
    height: 22,
    fontFamily: INTER,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: "24px",
    color: "#000000",
    textAlign: "center",
  };
}

function priorityPill(left: number, width: number, stroke: string): CSSProperties {
  return {
    position: "absolute",
    left,
    top: 1509,
    width,
    height: 38,
    background: "#FFFFFF",
    border: `2px solid ${stroke}`,
    borderRadius: 24,
    boxSizing: "border-box",
  };
}

function priorityText(left: number, width: number, color: string): CSSProperties {
  return {
    position: "absolute",
    left,
    top: 1519,
    width,
    height: 18,
    fontFamily: INTER,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: "17.5px",
    color,
    textAlign: "center",
  };
}

function dateChip(left: number, top: number, width: number, height: number, bg: string): CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    width,
    height,
    background: bg,
    borderRadius: 24,
  };
}

function dateChipText(left: number, top: number, width: number): CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    width,
    height: 23,
    fontFamily: INTER,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: "20px",
    color: "#000000",
    textAlign: "center",
  };
}
