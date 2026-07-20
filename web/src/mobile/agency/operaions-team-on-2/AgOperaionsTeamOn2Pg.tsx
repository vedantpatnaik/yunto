import { ArrowLeft, Users, Sparkles, MoreVertical, Wifi } from "lucide-react";

/**
 * Agency mobile screen — "Operaions team - ON" (Figma node 4101:65656, 375x931).
 * Rebuilt pixel-exact from the outline: absolute-positioned nodes, frame-relative
 * coordinates, exact fills / strokes / radii / text from the ground-truth tree.
 */

const clash = "'Clash Display', sans-serif";
const inter = "Inter, sans-serif";
const urbanist = "Urbanist, sans-serif";

export default function AgOperaionsTeamOn2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 931,
        background: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
        borderRadius: 24,
      }}
    >
      {/* FRAME '2' — page background */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 375, height: 2062, background: "#FDFDFD" }} />

      {/* ---- Decorative gradient blobs ---- */}
      {/* Group 35897 (bottom-left) */}
      <div style={{ position: "absolute", left: 3.8, top: 1891.1, width: 204.3, height: 196.5, background: "#FBB7C6", borderRadius: "50%" }} />
      <div style={{ position: "absolute", left: -4, top: 1798, width: 196.5, height: 191.1, background: "linear-gradient(135deg, #F3D29F, #EE9688)", borderRadius: "50%" }} />
      {/* Group 35897 (middle) */}
      <div style={{ position: "absolute", left: 66.6, top: 612, width: 493.7, height: 488.6, background: "#FF90A9", borderRadius: "50%" }} />
      <div style={{ position: "absolute", left: 135.2, top: 457.6, width: 476.7, height: 473.2, background: "linear-gradient(135deg, #8673B3, #A79AC6)", borderRadius: "50%" }} />
      {/* Group 35898 (top-left) */}
      <div style={{ position: "absolute", left: -16.4, top: 167.5, width: 163.4, height: 157.1, background: "#CCF5FD", borderRadius: "50%" }} />
      <div style={{ position: "absolute", left: -25, top: 93, width: 157.1, height: 152.8, background: "linear-gradient(135deg, rgba(70,181,252,0.7), rgba(143,190,255,0.7))", borderRadius: "50%" }} />

      {/* RECTANGLE 'Rectangle' fill=IMAGE — frosted-glass placeholder overlay */}
      <div
        style={{
          position: "absolute",
          left: -13,
          top: 0,
          width: 402,
          height: 2045,
          background: "linear-gradient(135deg, rgba(233,228,240,0.5), rgba(217,207,234,0.5))",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
        }}
      />

      {/* ---- Header Container ---- */}
      <div style={{ position: "absolute", left: 0, top: 70, width: 375, height: 54, background: "#FFFFFF", border: "1px solid #717171" }} />
      {/* meteor-icons:arrow-up (back nav) */}
      <div style={{ position: "absolute", left: 16, top: 85, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ArrowLeft size={20} color="#000000" strokeWidth={2} />
      </div>
      <div style={{ position: "absolute", left: 44, top: 82, width: 298, height: 30, color: "#1B1B1C", fontFamily: clash, fontWeight: 500, fontSize: 20, lineHeight: "37px", textAlign: "left" }}>
        Team
      </div>

      {/* ---- Main card ',manager view]' ---- */}
      <div style={{ position: "absolute", left: 20, top: 136, width: 336, height: 525, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 8 }} />

      {/* Top row: avatar + name + toggle button */}
      {/* avatar image (operations) */}
      <div style={{ position: "absolute", left: 37, top: 151.5, width: 42, height: 42, background: "#ECC5F5", border: "1px solid #373636", borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Users size={19} color="#000000" />
      </div>
      <div style={{ position: "absolute", left: 86, top: 154.5, width: 172, height: 20, color: "#242220", fontFamily: clash, fontWeight: 500, fontSize: 14, lineHeight: "20px", textAlign: "left" }}>
        Operations
      </div>
      {/* ph:users-fill */}
      <div style={{ position: "absolute", left: 86, top: 175, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Users size={15} color="#000000" />
      </div>
      <div style={{ position: "absolute", left: 107, top: 172.5, width: 110, height: 21, color: "#000000", fontFamily: clash, fontWeight: 400, fontSize: 10, lineHeight: "24px", textAlign: "left" }}>
        10 Members
      </div>

      {/* button — sparkle + toggle (ON) */}
      <div style={{ position: "absolute", left: 271, top: 158.5, width: 71, height: 27, background: "#FFFFFF", border: "0.586px solid #22CC30", borderRadius: 14.07 }} />
      <div style={{ position: "absolute", left: 276.9, top: 164, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Sparkles size={14} color="#000000" />
      </div>
      {/* toggle track */}
      <div style={{ position: "absolute", left: 300.9, top: 163, width: 36, height: 18, background: "#212020", borderRadius: 15.5 }} />
      {/* toggle knob (right = ON) */}
      <div style={{ position: "absolute", left: 318.9, top: 164.5, width: 16, height: 15, background: "#FFFFFF", borderRadius: 13.5 }} />

      {/* ---- Campaigns stats card (Group 1171275284) ---- */}
      <div style={{ position: "absolute", left: 34, top: 210, width: 308, height: 75, background: "#DAFDB0", border: "1px solid #000000", borderRadius: 8 }} />
      {/* header strip radii top only */}
      <div style={{ position: "absolute", left: 35, top: 211, width: 306, height: 48, background: "#DAFDB0", border: "1px solid #000000", borderTopLeftRadius: 7, borderTopRightRadius: 7 }} />

      {/* stat cell 1 — 20 / All (Frame 1171275520) */}
      <div style={{ position: "absolute", left: 35, top: 211, width: 75, height: 48, background: "#FEFFFC", border: "1px solid #000000", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 66, top: 217, width: 17, height: 15, color: "#000000", fontFamily: clash, fontWeight: 600, fontSize: 12, lineHeight: "15px", textAlign: "center" }}>20</div>
      <div style={{ position: "absolute", left: 66, top: 235, width: 17, height: 9, background: "#DAFDB0", borderRadius: 5 }} />
      <div style={{ position: "absolute", left: 70, top: 235, width: 8, height: 9, color: "#000000", fontFamily: clash, fontWeight: 400, fontSize: 6.92, lineHeight: "8.7px", textAlign: "center" }}>All</div>
      <div style={{ position: "absolute", left: 48, top: 244, width: 55, height: 13, color: "#000000", fontFamily: clash, fontWeight: 400, fontSize: 10, lineHeight: "12.5px", textAlign: "center" }}>Completion</div>

      {/* stat cell 2 — 10 / 20% (Frame 1171275533 @110) */}
      <div style={{ position: "absolute", left: 110, top: 211, width: 75, height: 48, background: "#FEFFFC", border: "1px solid #000000", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 121.5, top: 217, width: 52, height: 15, color: "#000000", fontFamily: clash, fontWeight: 600, fontSize: 12, lineHeight: "15px", textAlign: "center" }}>10</div>
      <div style={{ position: "absolute", left: 139, top: 235, width: 19, height: 9, background: "#DAFDB0", borderRadius: 5 }} />
      <div style={{ position: "absolute", left: 141, top: 235, width: 15, height: 9, color: "#000000", fontFamily: clash, fontWeight: 400, fontSize: 6.92, lineHeight: "8.7px", textAlign: "center" }}>20%</div>
      <div style={{ position: "absolute", left: 122, top: 243, width: 55, height: 13, color: "#000000", fontFamily: clash, fontWeight: 400, fontSize: 10, lineHeight: "12.5px", textAlign: "center" }}>Completion</div>

      {/* stat cell 3 — 7 / 50% (Frame 1171275533 @185) */}
      <div style={{ position: "absolute", left: 185, top: 211, width: 78, height: 48, background: "#FEFFFC", border: "1px solid #000000", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 220, top: 217, width: 8, height: 15, color: "#000000", fontFamily: clash, fontWeight: 600, fontSize: 12, lineHeight: "15px", textAlign: "center" }}>7</div>
      <div style={{ position: "absolute", left: 214, top: 235, width: 19, height: 9, background: "#DAFDB0", borderRadius: 5 }} />
      <div style={{ position: "absolute", left: 216, top: 235, width: 15, height: 9, color: "#000000", fontFamily: clash, fontWeight: 400, fontSize: 6.92, lineHeight: "8.7px", textAlign: "center" }}>50%</div>
      <div style={{ position: "absolute", left: 196, top: 243, width: 55, height: 13, color: "#000000", fontFamily: clash, fontWeight: 400, fontSize: 10, lineHeight: "12.5px", textAlign: "center" }}>Completion</div>

      {/* stat cell 4 — 3 / 90% (Frame 1171275533 @263) */}
      <div style={{ position: "absolute", left: 263, top: 211, width: 78, height: 48, background: "#FEFFFC", border: "1px solid #000000", borderRadius: 7 }} />
      <div style={{ position: "absolute", left: 298, top: 217, width: 9, height: 15, color: "#000000", fontFamily: clash, fontWeight: 600, fontSize: 12, lineHeight: "15px", textAlign: "center" }}>3</div>
      <div style={{ position: "absolute", left: 293, top: 235, width: 19, height: 9, background: "#DAFDB0", borderRadius: 5 }} />
      <div style={{ position: "absolute", left: 295, top: 235, width: 15, height: 9, color: "#000000", fontFamily: clash, fontWeight: 400, fontSize: 6.92, lineHeight: "8.7px", textAlign: "center" }}>90%</div>
      <div style={{ position: "absolute", left: 275, top: 244, width: 55, height: 13, color: "#000000", fontFamily: clash, fontWeight: 400, fontSize: 10, lineHeight: "12.5px", textAlign: "center" }}>Completion</div>

      {/* Campaigns label + underline chip */}
      <div style={{ position: "absolute", left: 160, top: 267, width: 41, height: 9, background: "#FEFFFC", borderRadius: 5 }} />
      <div style={{ position: "absolute", left: 159, top: 262, width: 59, height: 20, color: "#242220", fontFamily: clash, fontWeight: 500, fontSize: 10, lineHeight: "20px", textAlign: "center" }}>Campaigns</div>

      {/* ---- Members section ---- */}
      <div style={{ position: "absolute", left: 37, top: 300, width: 303, height: 18, color: "#000000", fontFamily: clash, fontWeight: 500, fontSize: 14, lineHeight: "17.5px", textAlign: "left" }}>
        Members
      </div>

      {/* Member 1 — Riya Verma */}
      <div style={{ position: "absolute", left: 37, top: 328, width: 303, height: 62, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 47, top: 336, width: 42, height: 42, background: "#F4C1C1", border: "1px solid #373636", borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#B93636", fontFamily: clash, fontWeight: 500, fontSize: 15, lineHeight: "24px" }}>R</span>
      </div>
      <div style={{ position: "absolute", left: 102, top: 336, width: 110, height: 24, color: "#000000", fontFamily: clash, fontWeight: 500, fontSize: 15, lineHeight: "24px", textAlign: "left" }}>Riya Verma</div>
      <div style={{ position: "absolute", left: 102, top: 355, width: 99, height: 23, color: "#000000", fontFamily: inter, fontWeight: 400, fontSize: 10, lineHeight: "24px", textAlign: "left" }}>Operations</div>
      <div style={{ position: "absolute", left: 313, top: 335, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MoreVertical size={16} color="#000000" />
      </div>
      <div style={{ position: "absolute", left: 222, top: 338, width: 53, height: 20, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#4CCC16", fontFamily: inter, fontWeight: 500, fontSize: 8, lineHeight: "16px", textAlign: "center" }}>Active</span>
      </div>

      {/* Member 2 — Lisa Rai */}
      <div style={{ position: "absolute", left: 37, top: 396, width: 303, height: 62, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 47, top: 404, width: 42, height: 42, background: "#FFC2F0", border: "1px solid #373636", borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#BB389A", fontFamily: clash, fontWeight: 500, fontSize: 15, lineHeight: "24px" }}>L</span>
      </div>
      <div style={{ position: "absolute", left: 102, top: 404, width: 110, height: 24, color: "#000000", fontFamily: clash, fontWeight: 500, fontSize: 15, lineHeight: "24px", textAlign: "left" }}>Lisa Rai</div>
      <div style={{ position: "absolute", left: 102, top: 423, width: 99, height: 23, color: "#000000", fontFamily: inter, fontWeight: 400, fontSize: 10, lineHeight: "24px", textAlign: "left" }}>Operations</div>
      <div style={{ position: "absolute", left: 313, top: 403, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MoreVertical size={16} color="#000000" />
      </div>
      <div style={{ position: "absolute", left: 222, top: 406, width: 53, height: 20, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#4CCC16", fontFamily: inter, fontWeight: 500, fontSize: 8, lineHeight: "16px", textAlign: "center" }}>Active</span>
      </div>

      {/* ---- Status bar ---- */}
      <div style={{ position: "absolute", left: 19, top: 31, width: 54, height: 18, color: "#000000", fontFamily: urbanist, fontWeight: 600, fontSize: 15, lineHeight: "18px", textAlign: "center" }}>
        19:56
      </div>
      {/* Cellular Connection — ascending bars */}
      <div style={{ position: "absolute", left: 292, top: 41.3, width: 3, height: 4, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 296.7, top: 39.3, width: 3, height: 6, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 301.3, top: 37, width: 3, height: 8.3, background: "#000000", borderRadius: 1 }} />
      <div style={{ position: "absolute", left: 306, top: 34.7, width: 3, height: 10.7, background: "#000000", borderRadius: 1 }} />
      {/* Wifi */}
      <div style={{ position: "absolute", left: 314, top: 34.3, width: 15.3, height: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Wifi size={15} color="#000000" />
      </div>
      {/* Battery */}
      <div style={{ position: "absolute", left: 334.3, top: 34.3, width: 22, height: 11.3, border: "1px solid #000000", borderRadius: 2.67, opacity: 0.7 }} />
      <div style={{ position: "absolute", left: 336.3, top: 36.3, width: 18, height: 7.3, background: "#000000", borderRadius: 1.33 }} />
      <div style={{ position: "absolute", left: 357.3, top: 38, width: 1.3, height: 4, background: "#000000", borderRadius: 1 }} />
    </div>
  );
}
