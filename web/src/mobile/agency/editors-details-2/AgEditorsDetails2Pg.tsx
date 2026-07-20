import {
  ChevronLeft,
  MapPin,
  Star,
  Clock,
  Briefcase,
  Play,
  Check,
  RefreshCw,
  X,
  Send,
} from "lucide-react";

const INTER = "Inter, sans-serif";

type Pkg = {
  x: number;
  active: boolean;
  title: string;
  desc: string;
  items: string[];
  hrs: string;
  revisions: string;
  price: string;
  btnText: string;
  btnWidth: number;
};

const packages: Pkg[] = [
  {
    x: 20,
    active: true,
    title: "Reel Growth Pack",
    desc: "Designed for high retention and viral reach.",
    items: ["Fast cuts & transitions", "Color grading", "Trend-matched music"],
    hrs: "48 hrs",
    revisions: "2 Revisions",
    price: "₹2000 ",
    btnText: "Selected",
    btnWidth: 87.5,
  },
  {
    x: 322,
    active: false,
    title: "Cinematic Story Edit",
    desc: "Premium storytelling with a film-like aesthetic.",
    items: ["Advanced grading", "Sound design & SFX", "Smooth pacing"],
    hrs: "72 hrs",
    revisions: "3 Revisions",
    price: "₹3000 ",
    btnText: "Select Style",
    btnWidth: 107,
  },
  {
    x: 652,
    active: false,
    title: "High-Energy Cuts",
    desc: "Perfect for ads, fitness, and dynamic content.",
    items: ["Rapid pacing", "Kinetic typography", "Upbeat audio mix"],
    hrs: "48 hrs",
    revisions: "2 Revisions",
    price: "₹2500 ",
    btnText: "Select Style",
    btnWidth: 107,
  },
];

export default function AgEditorsDetails2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 876,
        background: "#F8F5EF",
        fontFamily: INTER,
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
        <ChevronLeft size={16} strokeWidth={1.35} color="#FAF7F2" />
      </div>

      {/* Editor pill */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 19.5,
          width: 150,
          height: 41,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 19,
            top: 11,
            width: 112,
            height: 19,
            color: "#1D1D1F",
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 15,
            lineHeight: "18.2px",
            textAlign: "center",
          }}
        >
          Editor
        </div>
      </div>

      {/* Date / location pill */}
      <div
        style={{
          position: "absolute",
          left: 242,
          top: 21,
          width: 113,
          height: 38,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 15,
            top: 11,
            width: 94,
            height: 16,
            color: "#6E6E73",
            fontFamily: INTER,
            fontWeight: 600,
            fontSize: 13,
            lineHeight: "15.7px",
          }}
        >
          20 Jun | Delhi
        </div>
      </div>

      {/* ===== Hero Section ===== */}
      {/* Background + image + overlay + text (clipped) */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 100,
          width: 335,
          height: 460,
          background: "#EAEAEA",
          borderRadius: 28,
          overflow: "hidden",
        }}
      >
        {/* image placeholder */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 335,
            height: 460,
            background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)",
          }}
        />
        {/* dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 210,
            width: 335,
            height: 250,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.4), rgba(0,0,0,0.0))",
          }}
        />
        {/* Karan */}
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 298,
            width: 287,
            height: 36,
            color: "#FFFFFF",
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 32,
            lineHeight: "35.2px",
          }}
        >
          Karan
        </div>
        {/* role */}
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 338,
            width: 287,
            height: 20,
            color: "#FFFFFF",
            fontFamily: INTER,
            fontWeight: 500,
            fontSize: 15,
            lineHeight: "18.2px",
          }}
        >
          Fashion Video Editor • 4 yrs exp.
        </div>
        {/* location row */}
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 367,
            width: 14,
            height: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MapPin size={14} color="#FFFFFF" strokeWidth={1.17} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 366,
            width: 106.1,
            height: 16,
            color: "#FFFFFF",
            fontFamily: INTER,
            fontWeight: 500,
            fontSize: 13,
            lineHeight: "15.7px",
          }}
        >
          Delhi • 5 yrs exp.
        </div>
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
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 100,
            top: 17,
            width: 103,
            height: 21,
            color: "#0D86FF",
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 18,
            lineHeight: "21.8px",
            textAlign: "center",
          }}
        >
          ₹3000
        </div>
      </div>

      {/* ===== Summary ===== */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 599,
          width: 335,
          height: 87,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 21,
            top: 20.2,
            width: 293,
            height: 45,
            color: "#444444",
            fontFamily: INTER,
            fontWeight: 500,
            fontSize: 15,
            lineHeight: "22.5px",
          }}
        >
          &quot;Snappy edits that elevate your reels game.&quot;
        </div>
      </div>

      {/* ===== Expertise Tags ===== */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 710,
          width: 335,
          height: 19,
          color: "#1A1A1A",
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 16,
          lineHeight: "19.4px",
        }}
      >
        Expertise
      </div>

      {/* tags */}
      {(
        [
          { x: 20, y: 741, w: 68.2, tx: 37, ty: 750, tw: 34.2, bg: "#E8F5E9", fg: "#2E7D32", t: "Reels" },
          { x: 98.2, y: 741, w: 106, tx: 115.2, ty: 750, tw: 72, bg: "#FFF3E0", fg: "#E65100", t: "BTS Shoots" },
          { x: 20, y: 785, w: 145.5, tx: 37, ty: 794, tw: 111.5, bg: "#F3E5F5", fg: "#6A1B9A", t: "Brand Campaigns" },
          { x: 175.5, y: 785, w: 121.1, tx: 192.5, ty: 794, tw: 87.1, bg: "#E3F2FD", fg: "#1565C0", t: "Color Grading" },
          { x: 20, y: 829, w: 93, tx: 37, ty: 838, tw: 59, bg: "#FCE4EC", fg: "#C2185B", t: "Fast Cuts" },
        ] as const
      ).map((tag) => (
        <div key={tag.t}>
          <div
            style={{
              position: "absolute",
              left: tag.x,
              top: tag.y,
              width: tag.w,
              height: 34,
              background: tag.bg,
              border: "1px solid #FFFFFF",
              borderRadius: 20,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: tag.tx,
              top: tag.ty,
              width: tag.tw,
              height: 16,
              color: tag.fg,
              fontFamily: INTER,
              fontWeight: 600,
              fontSize: 13,
              lineHeight: "15.7px",
            }}
          >
            {tag.t}
          </div>
        </div>
      ))}

      {/* ===== Stats Grid: Rating ===== */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 887,
          width: 161.5,
          height: 85,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 905,
          width: 14,
          height: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Star size={14} color="#F5A623" fill="#F5A623" strokeWidth={1.17} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 57,
          top: 904,
          width: 39.3,
          height: 16,
          color: "#666666",
          fontFamily: INTER,
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
          top: 924,
          width: 33.3,
          height: 21,
          color: "#1A1A1A",
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 18,
          lineHeight: "21.8px",
        }}
      >
        4.9&nbsp;
      </div>
      <div
        style={{
          position: "absolute",
          left: 70.3,
          top: 928,
          width: 31.3,
          height: 16,
          color: "#888888",
          fontFamily: INTER,
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        (124)
      </div>

      {/* ===== Stats Grid: Availability ===== */}
      <div
        style={{
          position: "absolute",
          left: 193.5,
          top: 887,
          width: 161.5,
          height: 85,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 210.5,
          top: 905,
          width: 14,
          height: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Clock size={14} color="#666666" strokeWidth={1.17} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 230.5,
          top: 904,
          width: 83.4,
          height: 16,
          color: "#666666",
          fontFamily: INTER,
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Today&apos;s Slots
      </div>
      {[
        { x: 210.5, tx: 222.5, t: "10:00" },
        { x: 274.7, tx: 286.7, t: "14:00" },
      ].map((slot) => (
        <div key={slot.t}>
          <div
            style={{
              position: "absolute",
              left: slot.x,
              top: 928,
              width: 56.7,
              height: 27,
              background: "#E8F5E9",
              borderRadius: 12,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: slot.tx,
              top: 934,
              width: 32.7,
              height: 15,
              color: "#2E7D32",
              fontFamily: INTER,
              fontWeight: 600,
              fontSize: 12,
              lineHeight: "14.5px",
            }}
          >
            {slot.t}
          </div>
        </div>
      ))}

      {/* ===== Stats Grid: Past Clients ===== */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 984,
          width: 335,
          height: 87,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 37,
          top: 1002,
          width: 14,
          height: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Briefcase size={14} color="#666666" strokeWidth={1.17} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 57,
          top: 1001,
          width: 73.4,
          height: 16,
          color: "#666666",
          fontFamily: INTER,
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Past Clients
      </div>
      {[
        { x: 37, w: 63.4, tx: 50, tw: 37.4, t: "Nykaa", fg: "#333333" },
        { x: 108.4, w: 93.3, tx: 121.4, tw: 67.3, t: "Mamaearth", fg: "#333333" },
        { x: 209.7, w: 54.2, tx: 222.7, tw: 28.2, t: "H&M", fg: "#333333" },
        { x: 272, w: 46.9, tx: 285, tw: 20.9, t: "+12", fg: "#888888" },
      ].map((c) => (
        <div key={c.t}>
          <div
            style={{
              position: "absolute",
              left: c.x,
              top: 1025,
              width: c.w,
              height: 29,
              background: "#FFFFFF",
              border: "1px solid #F0F0F0",
              borderRadius: 12,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: c.tx,
              top: 1032,
              width: c.tw,
              height: 15,
              color: c.fg,
              fontFamily: INTER,
              fontWeight: 700,
              fontSize: 12,
              lineHeight: "14.5px",
            }}
          >
            {c.t}
          </div>
        </div>
      ))}

      {/* ===== Editing Styles Packages ===== */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 1095,
          width: 114.1,
          height: 20,
          color: "#1A1A1A",
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 17,
          lineHeight: "20.6px",
        }}
      >
        Editing Styles
      </div>

      {packages.map((p) => {
        const d = p.x - 20; // delta from active-package coords
        const contentRight = p.x + 273;
        return (
          <div key={p.title}>
            {/* card */}
            <div
              style={{
                position: "absolute",
                left: p.x,
                top: 1131,
                width: 290,
                height: 427.4,
                background: p.active
                  ? "linear-gradient(135deg,#F8F5FF,#FFFFFF)"
                  : "#FFFFFF",
                border: `1px solid ${p.active ? "#D1C4E9" : "#FFFFFF"}`,
                borderRadius: 20,
              }}
            />
            {/* preview image */}
            <div
              style={{
                position: "absolute",
                left: 37 + d,
                top: 1148,
                width: 256,
                height: 140,
                background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            />
            {/* play overlay */}
            <div
              style={{
                position: "absolute",
                left: 147 + d,
                top: 1200,
                width: 36,
                height: 36,
                background: "#000000",
                borderRadius: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" strokeWidth={1.5} />
            </div>
            {/* title */}
            <div
              style={{
                position: "absolute",
                left: 37 + d,
                top: 1302,
                width: 256,
                height: 19,
                color: "#1A1A1A",
                fontFamily: INTER,
                fontWeight: 700,
                fontSize: 16,
                lineHeight: "19.4px",
              }}
            >
              {p.title}
            </div>
            {/* description */}
            <div
              style={{
                position: "absolute",
                left: 37 + d,
                top: 1325,
                width: 256,
                height: 37,
                color: "#666666",
                fontFamily: INTER,
                fontWeight: 400,
                fontSize: 13,
                lineHeight: "18.2px",
              }}
            >
              {p.desc}
            </div>
            {/* list items */}
            {p.items.map((item, i) => (
              <div key={item}>
                <div
                  style={{
                    position: "absolute",
                    left: 37 + d,
                    top: 1373 + i * 24,
                    width: 14,
                    height: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={12} color="#6A1B9A" strokeWidth={1.75} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 59 + d,
                    top: 1372 + i * 24,
                    width: 160,
                    height: 16,
                    color: "#333333",
                    fontFamily: INTER,
                    fontWeight: 500,
                    fontSize: 13,
                    lineHeight: "15.7px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item}
                </div>
              </div>
            ))}
            {/* divider */}
            <div
              style={{
                position: "absolute",
                left: 37 + d,
                top: 1450,
                width: 256,
                height: 0,
                borderTop: "1px solid #EDEDED",
              }}
            />
            {/* hrs */}
            <div
              style={{
                position: "absolute",
                left: 37 + d,
                top: 1465.5,
                width: 14,
                height: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={14} color="#777777" strokeWidth={1.17} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 55 + d,
                top: 1465,
                width: 40,
                height: 15,
                color: "#777777",
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: 12,
                lineHeight: "14.5px",
              }}
            >
              {p.hrs}
            </div>
            {/* revisions */}
            <div
              style={{
                position: "absolute",
                left: 108.4 + d,
                top: 1465.5,
                width: 14,
                height: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RefreshCw size={14} color="#777777" strokeWidth={1.17} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 126.4 + d,
                top: 1465,
                width: 70,
                height: 15,
                color: "#777777",
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: 12,
                lineHeight: "14.5px",
              }}
            >
              {p.revisions}
            </div>
            {/* price */}
            <div
              style={{
                position: "absolute",
                left: 37 + d,
                top: 1514.9,
                width: 60,
                height: 20,
                color: "#1A1A1A",
                fontFamily: INTER,
                fontWeight: 800,
                fontSize: 16,
                lineHeight: "19.4px",
              }}
            >
              {p.price}
            </div>
            <div
              style={{
                position: "absolute",
                left: 93.2 + d,
                top: 1517.9,
                width: 43,
                height: 16,
                color: "#666666",
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: 13,
                lineHeight: "15.7px",
              }}
            >
              / video
            </div>
            {/* select button */}
            <div
              style={{
                position: "absolute",
                left: contentRight - p.btnWidth,
                top: 1508.4,
                width: p.btnWidth,
                height: 33,
                background: p.active ? "#312B28" : "#FFFFFF",
                border: `1px solid ${p.active ? "#1A1A1A" : "#000000"}`,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: p.active ? "#FFFFFF" : "#1A1A1A",
                fontFamily: "'Liberation Sans', Inter, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                lineHeight: "14.9px",
              }}
            >
              {p.btnText}
            </div>
          </div>
        );
      })}

      {/* ===== Bottom action bar (fixed, gradient) ===== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 765,
          width: 375,
          height: 108,
          background:
            "linear-gradient(to top, #FAF9F6, rgba(250,249,246,0.0))",
        }}
      >
        {/* Skip */}
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 16,
            width: 128,
            height: 59,
            background: "#FFFFFF",
            border: "1px solid #FFFFFF",
            borderRadius: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#1A1A1A",
              fontFamily: INTER,
              fontWeight: 500,
              fontSize: 14,
              lineHeight: "16.9px",
            }}
          >
            Skip
          </span>
        </div>
        {/* Reject */}
        <div
          style={{
            position: "absolute",
            left: 193,
            top: 16,
            width: 60,
            height: 60,
            background: "#FFFFFF",
            border: "1px solid #EAEAEA",
            borderRadius: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={28} color="#FF5252" strokeWidth={2.33} />
        </div>
        {/* Accept / send */}
        <div
          style={{
            position: "absolute",
            left: 298,
            top: 16,
            width: 60,
            height: 60,
            background: "#312B28",
            border: "1px solid #EAEAEA",
            borderRadius: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Send size={28} color="#FFFFFF" strokeWidth={2.33} />
        </div>
      </div>
    </div>
  );
}
