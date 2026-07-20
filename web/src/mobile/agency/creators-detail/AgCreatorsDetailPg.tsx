import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Flame,
  TrendingUp,
  IndianRupee,
  Star,
  User,
  Globe,
  ArrowUpRight,
  Instagram,
  Youtube,
  ChevronDown,
  SquarePen,
  Wifi,
} from "lucide-react";

/**
 * Agency app — Creators detail (Figma node 862:2642, "creators detail", 375×946).
 * Self-contained, pixel-exact absolute layout reproduced from the outline file.
 * The profile card clips its overflowing content (commercials list) at 621px tall.
 */

const CLASH = "'Clash Display', sans-serif";
const INTER = "Inter, sans-serif";

// Commercials input rows (frame-relative coords from the outline).
const inputRows: {
  label: string;
  labelW: number;
  labelY: number;
  fieldY: number;
  valY: number;
  value: string;
  header?: boolean;
}[] = [
  { label: "Reels", labelW: 36, labelY: 548, fieldY: 572, valY: 578, value: "₹ 1000" },
  { label: "Story", labelW: 36, labelY: 613, fieldY: 637, valY: 643, value: "₹ 1000" },
  { label: "Post", labelW: 30, labelY: 678, fieldY: 702, valY: 708, value: "₹  1000" },
  { label: "Collab", labelW: 42, labelY: 743, fieldY: 767, valY: 773, value: "₹  1000" },
  { label: "Integrated Video", labelW: 111, labelY: 842, fieldY: 866, valY: 872, value: "₹  2000" },
  { label: "Dedicated Video", labelW: 110, labelY: 907, fieldY: 931, valY: 937, value: "₹  3000" },
  { label: "Shot Video", labelW: 73, labelY: 972, fieldY: 996, valY: 1002, value: "₹  3000" },
  { label: "Ad Rights", labelW: 74, labelY: 1037, fieldY: 1063, valY: 1069, value: "₹  2000", header: true },
  { label: "UGC Video", labelW: 82, labelY: 1106, fieldY: 1132, valY: 1138, value: "₹  2000", header: true },
];

// The two social stat rows (Instagram / Youtube).
const socialRows: {
  rowY: number;
  boxColor: string;
  icon: React.ReactNode;
  count: string;
  countX: number;
  countY: number;
  countW: number;
}[] = [
  {
    rowY: 329,
    boxColor: "#FFC9F5",
    icon: (
      <div style={{ position: "absolute", left: 47, top: 337.5, width: 22, height: 22 }}>
        <Instagram size={22} color="#000000" strokeWidth={1.6} />
      </div>
    ),
    count: "1.2 M",
    countX: 45,
    countY: 362.5,
    countW: 27,
  },
  {
    rowY: 398,
    boxColor: "#FFC6C7",
    icon: (
      <div style={{ position: "absolute", left: 46, top: 405.5, width: 24, height: 24 }}>
        <Youtube size={24} color="#000000" strokeWidth={1.6} />
      </div>
    ),
    count: "500K",
    countX: 30,
    countY: 431.5,
    countW: 56,
  },
];

export default function AgCreatorsDetailPg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 946, background: "#FFFFFF", fontFamily: INTER }}
    >
      {/* Frame '2' near-white content backdrop */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 375, height: 946, background: "#FDFDFD" }} />

      {/* Decorative blurred gradient blobs */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 375, height: 946, overflow: "hidden" }}>
        {/* Group 35898 — top-left blue */}
        <div style={{ position: "absolute", left: -25, top: 93, width: 157.1, height: 152.8, borderRadius: 9999, background: "linear-gradient(135deg, rgba(70,181,252,0.7), rgba(143,190,255,0.7))", filter: "blur(38px)" }} />
        <div style={{ position: "absolute", left: -16.4, top: 167.5, width: 163.4, height: 157.1, borderRadius: 9999, background: "#CCF5FD", filter: "blur(38px)" }} />
        {/* Group 35897 — center purple / pink */}
        <div style={{ position: "absolute", left: 135.2, top: 457.6, width: 476.7, height: 473.2, borderRadius: 9999, background: "linear-gradient(135deg, #8673B3, #A79AC6)", filter: "blur(60px)", opacity: 0.85 }} />
        <div style={{ position: "absolute", left: 66.6, top: 612, width: 493.7, height: 488.6, borderRadius: 9999, background: "#FF90A9", filter: "blur(60px)", opacity: 0.7 }} />
      </div>

      {/* Rectangle IMAGE — full background placeholder (subtle wash) */}
      <div style={{ position: "absolute", left: -13, top: 0, width: 402, height: 946, background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)", opacity: 0.28 }} />

      {/* Header container */}
      <div style={{ position: "absolute", left: 0, top: 70, width: 375, height: 54, background: "#FFFFFF", borderBottom: "1px solid #717171", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 16, top: 15, width: 24, height: 24 }}>
          <ArrowLeft size={22} color="#000000" strokeWidth={2} />
        </div>
        <div style={{ position: "absolute", left: 44, top: 12, width: 298, height: 30, fontFamily: CLASH, fontWeight: 500, fontSize: 20, lineHeight: "30px", color: "#1B1B1C", textAlign: "left" }}>
          Creators
        </div>
      </div>

      {/* ===== Profile card (clipped to 621px) ===== */}
      <div style={{ position: "absolute", left: 16, top: 136, width: 343, height: 621, borderRadius: 12, overflow: "hidden" }}>
        {/* inner wrapper restores the root (0,0) coordinate origin */}
        <div style={{ position: "absolute", left: -16, top: -136, width: 375, height: 1210 }}>
          {/* Container background + border */}
          <div style={{ position: "absolute", left: 16, top: 136, width: 343, height: 621, background: "#FBFFFC", border: "1px solid #000000", borderRadius: 12, boxSizing: "border-box" }} />

          {/* Avatar */}
          <div style={{ position: "absolute", left: 23, top: 148, width: 42, height: 42, borderRadius: 9999, background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)" }} />

          {/* Name + handle */}
          <div style={{ position: "absolute", left: 72, top: 148, width: 89, height: 18, fontFamily: CLASH, fontWeight: 500, fontSize: 12, lineHeight: "18px", color: "#000000", textAlign: "left" }}>
            Leena Sharma
          </div>
          <div style={{ position: "absolute", left: 169, top: 150.5, width: 67, height: 13, fontFamily: CLASH, fontWeight: 500, fontSize: 10, lineHeight: "13px", color: "#000000", textAlign: "left" }}>
            @leenabliss
          </div>

          {/* WhatsApp */}
          <div style={{ position: "absolute", left: 290, top: 148, width: 24.8, height: 25, borderRadius: 9999, background: "linear-gradient(135deg,#60D669,#1FAF38)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageCircle size={14} color="#FFFFFF" fill="#FFFFFF" strokeWidth={1.5} />
          </div>

          {/* Call button */}
          <div style={{ position: "absolute", left: 322, top: 148, width: 25, height: 25, borderRadius: 9999, background: "#FFFFFF", border: "1px solid #EAEAEA", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Phone size={12} color="#000000" strokeWidth={1.6} />
          </div>

          {/* Fire emoji */}
          <div style={{ position: "absolute", left: 49, top: 178, width: 16, height: 16 }}>
            <Flame size={16} color="#FF5141" fill="#FF7A3D" strokeWidth={1.5} />
          </div>

          {/* Lifestyle tag */}
          <div style={{ position: "absolute", left: 72, top: 170, width: 60, height: 21, background: "#FFD0D0", border: "1px solid #1B1B1B", borderRadius: 12, boxSizing: "border-box" }}>
            <div style={{ position: "absolute", left: 10, top: 2.5, width: 40, height: 16, fontFamily: INTER, fontWeight: 400, fontSize: 10, lineHeight: "16px", color: "#000000" }}>
              Lifestyle
            </div>
          </div>

          {/* Beauty tag */}
          <div style={{ position: "absolute", left: 136, top: 170, width: 54, height: 21, background: "#ECFFD7", border: "1px solid #1B1B1B", borderRadius: 12, boxSizing: "border-box" }}>
            <div style={{ position: "absolute", left: 10, top: 2.5, width: 34, height: 16, fontFamily: INTER, fontWeight: 400, fontSize: 10.2, lineHeight: "16px", color: "#000000" }}>
              Beauty
            </div>
          </div>

          {/* +35% above avg */}
          <div style={{ position: "absolute", left: 71, top: 203, width: 14, height: 11 }}>
            <TrendingUp size={14} color="#FD564B" strokeWidth={1.6} />
          </div>
          <div style={{ position: "absolute", left: 87, top: 199, width: 83, height: 17, fontFamily: CLASH, fontWeight: 500, fontSize: 10, lineHeight: "17px", color: "#FD564B", textAlign: "center" }}>
            {" +35% above avg  "}
          </div>

          {/* Suggestion: Increase */}
          <div style={{ position: "absolute", left: 180, top: 200, width: 15, height: 15 }}>
            <IndianRupee size={15} color="#FD564B" strokeWidth={1.6} />
          </div>
          <div style={{ position: "absolute", left: 197, top: 199, width: 109, height: 17, fontFamily: CLASH, fontWeight: 500, fontSize: 10, lineHeight: "17px", color: "#FD564B", textAlign: "center" }}>
            {" Suggestion:  Increase"}
          </div>

          {/* Stellartalent link bar */}
          <div style={{ position: "absolute", left: 17, top: 224, width: 341, height: 32, background: "#DAFDB0" }} />
          <div style={{ position: "absolute", left: 75, top: 228, width: 11, height: 11 }}>
            <Star size={11} color="#F4B400" fill="#F4B400" />
          </div>
          <div style={{ position: "absolute", left: 36, top: 232, width: 168, height: 15, fontFamily: CLASH, fontWeight: 500, fontSize: 12, lineHeight: "15px", color: "#1A191A", textAlign: "left" }}>
            Stellartalent.com/sophia-roy
          </div>

          {/* Link to my calendar */}
          <div style={{ position: "absolute", left: 226, top: 229, width: 121, height: 21, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 8, boxSizing: "border-box" }} />
          <div style={{ position: "absolute", left: 235, top: 233, width: 104, height: 13, fontFamily: CLASH, fontWeight: 500, fontSize: 9, lineHeight: "13px", color: "#191919", textAlign: "left" }}>
            Link to  my calendar
          </div>
          <div style={{ position: "absolute", left: 321, top: 232, width: 16.6, height: 16.6 }}>
            <ArrowUpRight size={16} color="#000000" strokeWidth={1.5} />
          </div>

          {/* Stats row */}
          <div style={{ position: "absolute", left: 26, top: 267, width: 322, height: 30, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 8, boxSizing: "border-box" }} />
          <div style={{ position: "absolute", left: 82, top: 274, width: 16, height: 16 }}>
            <User size={16} color="#000000" strokeWidth={1.6} />
          </div>
          <div style={{ position: "absolute", left: 101, top: 274, width: 23, height: 16, fontFamily: CLASH, fontWeight: 500, fontSize: 11, lineHeight: "16px", color: "#000000" }}>
            1.2M
          </div>
          <div style={{ position: "absolute", left: 132, top: 274, width: 16, height: 16 }}>
            <Globe size={16} color="#000000" strokeWidth={1.6} />
          </div>
          <div style={{ position: "absolute", left: 151, top: 274, width: 63, height: 16, fontFamily: CLASH, fontWeight: 500, fontSize: 11, lineHeight: "16px", color: "#000000" }}>
            900k views
          </div>
          <div style={{ position: "absolute", left: 218, top: 274, width: 16, height: 16 }}>
            <Star size={16} color="#000000" strokeWidth={1.6} />
          </div>
          <div style={{ position: "absolute", left: 237, top: 274, width: 53, height: 16, fontFamily: CLASH, fontWeight: 500, fontSize: 11, lineHeight: "16px", color: "#000000" }}>
            489 leads
          </div>

          {/* Divider line */}
          <div style={{ position: "absolute", left: 24, top: 315, width: 325, height: 1, background: "#000000" }} />

          {/* ===== Social stat rows (Instagram / Youtube) ===== */}
          {socialRows.map((row) => {
            const statY = row.rowY + 20;
            return (
              <div key={row.rowY}>
                <div style={{ position: "absolute", left: 27, top: row.rowY, width: 320, height: 57, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 8, boxSizing: "border-box" }} />
                {/* Left colored box */}
                <div style={{ position: "absolute", left: 28, top: row.rowY + 1, width: 60, height: 55, background: row.boxColor, borderRadius: "7px 0 0 7px" }} />
                {row.icon}
                <div style={{ position: "absolute", left: row.countX, top: row.countY, width: row.countW, height: 15, fontFamily: CLASH, fontWeight: 500, fontSize: 12, lineHeight: "15px", color: "#000000", textAlign: "center" }}>
                  {row.count}
                </div>
                {/* Stats group */}
                <div style={{ position: "absolute", left: 117, top: statY, width: 32, height: 15, fontFamily: CLASH, fontWeight: 600, fontSize: 12, lineHeight: "15px", color: "#000000", textAlign: "center" }}>3.9 %</div>
                <div style={{ position: "absolute", left: 99, top: statY + 15.5, width: 67, height: 10, fontFamily: CLASH, fontWeight: 400, fontSize: 8, lineHeight: "10px", color: "#000000", textAlign: "center" }}>Avg. engagement</div>
                <div style={{ position: "absolute", left: 182, top: statY, width: 31, height: 15, fontFamily: CLASH, fontWeight: 600, fontSize: 12, lineHeight: "15px", color: "#000000", textAlign: "center" }}>12.1 K</div>
                <div style={{ position: "absolute", left: 177, top: statY + 15.5, width: 38, height: 10, fontFamily: CLASH, fontWeight: 400, fontSize: 8, lineHeight: "10px", color: "#000000", textAlign: "center" }}>Avg. Likes</div>
                <div style={{ position: "absolute", left: 249, top: statY, width: 26, height: 15, fontFamily: CLASH, fontWeight: 600, fontSize: 12, lineHeight: "15px", color: "#000000", textAlign: "center" }}>900 </div>
                <div style={{ position: "absolute", left: 231, top: statY + 15.5, width: 61, height: 10, fontFamily: CLASH, fontWeight: 400, fontSize: 8, lineHeight: "10px", color: "#000000", textAlign: "center" }}>Avg. Comments</div>
                {/* Expand chevron */}
                <div style={{ position: "absolute", left: 309, top: row.rowY + 23, width: 24, height: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronDown size={16} color="#000000" strokeWidth={1.6} />
                </div>
              </div>
            );
          })}

          {/* ===== Commercials section (Frame '36') ===== */}
          <div style={{ position: "absolute", left: 27, top: 467, width: 320, height: 741, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 8, boxSizing: "border-box" }} />
          <div style={{ position: "absolute", left: 34, top: 483, width: 234, height: 20, fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "20px", color: "#242220" }}>
            Commercials
          </div>

          {/* Instagram sub-header + edit */}
          <div style={{ position: "absolute", left: 34, top: 513, width: 107, height: 20, fontFamily: CLASH, fontWeight: 500, fontSize: 16, lineHeight: "20px", color: "#000000" }}>
            Instagram
          </div>
          <div style={{ position: "absolute", left: 318, top: 514, width: 20, height: 20 }}>
            <SquarePen size={16} color="#000000" strokeWidth={1.5} />
          </div>

          {/* Youtube sub-header + edit */}
          <div style={{ position: "absolute", left: 34, top: 807, width: 100, height: 20, fontFamily: CLASH, fontWeight: 500, fontSize: 16, lineHeight: "20px", color: "#000000" }}>
            Youtube
          </div>
          <div style={{ position: "absolute", left: 318, top: 807, width: 20, height: 20 }}>
            <SquarePen size={16} color="#000000" strokeWidth={1.5} />
          </div>

          {/* Input rows */}
          {inputRows.map((r) => (
            <div key={r.label}>
              <div
                style={{
                  position: "absolute",
                  left: 34,
                  top: r.labelY,
                  width: r.labelW,
                  height: r.header ? 20 : 18,
                  fontFamily: r.header ? CLASH : INTER,
                  fontWeight: r.header ? 500 : 400,
                  fontSize: r.header ? 16 : 14,
                  lineHeight: r.header ? "20px" : "17.5px",
                  color: r.header ? "#000000" : "#7F7F7F",
                }}
              >
                {r.label}
              </div>
              <div style={{ position: "absolute", left: 34, top: r.fieldY, width: 306, height: 32, border: "1px solid #D8DADC", boxSizing: "border-box" }} />
              <div style={{ position: "absolute", left: 50, top: r.valY, width: 274, height: 20, fontFamily: INTER, fontWeight: 400, fontSize: 16, lineHeight: "20px", color: "#000000" }}>
                {r.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Save / Remove buttons ===== */}
      <div style={{ position: "absolute", left: 20, top: 784, width: 335, height: 48, background: "#B7D0EE", border: "1px solid #000000", borderRadius: 16, boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 82.5, top: 16, width: 170, height: 16, fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "16px", color: "#333333", textAlign: "center" }}>
          Save changes
        </div>
      </div>
      <div style={{ position: "absolute", left: 20, top: 846, width: 335, height: 48, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 16, boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 82.5, top: 16, width: 170, height: 16, fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "16px", color: "#333333", textAlign: "center" }}>
          Remove profile
        </div>
      </div>

      {/* ===== Status bar ===== */}
      <div style={{ position: "absolute", left: 0, top: 5, width: 375, height: 44 }}>
        <div style={{ position: "absolute", left: 21, top: 14, width: 54, height: 18, fontFamily: "Urbanist, sans-serif", fontWeight: 600, fontSize: 15, lineHeight: "18px", color: "#000000", textAlign: "center" }}>
          19:56
        </div>
        {/* Cellular */}
        <div style={{ position: "absolute", left: 294, top: 22.7, width: 17, height: 10.7 }}>
          {[
            { x: 0, h: 4 },
            { x: 4.7, h: 6 },
            { x: 9.3, h: 8.3 },
            { x: 14, h: 10.7 },
          ].map((b, i) => (
            <div key={i} style={{ position: "absolute", left: b.x, bottom: 0, width: 3, height: b.h, background: "#000000", borderRadius: 1 }} />
          ))}
        </div>
        {/* Wifi */}
        <div style={{ position: "absolute", left: 316, top: 22.3, width: 15.3, height: 11 }}>
          <Wifi size={15} color="#000000" strokeWidth={2} />
        </div>
        {/* Battery */}
        <div style={{ position: "absolute", left: 336.3, top: 22.3, width: 22, height: 11.3, border: "1px solid #000000", borderRadius: 2.7, boxSizing: "border-box", opacity: 0.9 }} />
        <div style={{ position: "absolute", left: 338.3, top: 24.3, width: 18, height: 7.3, background: "#000000", borderRadius: 1.3 }} />
        <div style={{ position: "absolute", left: 359.3, top: 26, width: 1.6, height: 4, background: "#000000", borderRadius: 1 }} />
      </div>
    </div>
  );
}
