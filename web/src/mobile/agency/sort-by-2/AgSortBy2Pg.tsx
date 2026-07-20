import type { ReactNode } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  ArrowDownUp,
  Plus,
  Filter,
  Phone,
  User,
  Globe,
  Star,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Wifi,
  BatteryFull,
  SignalHigh,
} from "lucide-react";

const CD = "'Clash Display', sans-serif";
const URB = "'Urbanist', sans-serif";

export default function AgSortBy2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 931,
        background: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ===== Ambient background blobs (soft, from image/blob layer) ===== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: "blur(42px)",
          opacity: 0.9,
          pointerEvents: "none",
        }}
      >
        {/* Group 35898 - blue pastel */}
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
        {/* Group 35897 - pink / purple */}
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
      </div>

      {/* ===== Header container ===== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 70,
          width: 375,
          height: 54,
          background: "#FFFFFF",
          border: "1px solid #717171",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 85,
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowUp size={18} color="#000000" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 82,
          width: 298,
          height: 30,
          color: "#1B1B1C",
          fontFamily: CD,
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "30px",
          textAlign: "left",
        }}
      >
        Creators
      </div>

      {/* ===== D / W / M toggle (Frame 14614) ===== */}
      <div
        style={{
          position: "absolute",
          left: 261,
          top: 179,
          width: 30,
          height: 30,
          borderRadius: 9999,
          background: "#000000",
          border: "1px solid #DCDCDC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        D
      </div>
      <div
        style={{
          position: "absolute",
          left: 295,
          top: 179,
          width: 30,
          height: 30,
          borderRadius: 9999,
          background: "#B1B1B1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#000000",
          fontFamily: URB,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        W
      </div>
      <div
        style={{
          position: "absolute",
          left: 329,
          top: 179,
          width: 30,
          height: 30,
          borderRadius: 9999,
          background: "#B1B1B1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#000000",
          fontFamily: URB,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "24px",
        }}
      >
        M
      </div>

      {/* ===== Filter chips row (Frame 1171275431) ===== */}
      {/* Add Creator */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 134,
          width: 139,
          height: 36,
          background: "#FFFFFF",
          border: "1px solid #100F0F",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 143,
          width: 18,
          height: 18,
          borderRadius: 9999,
          background: "#131212",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={12} color="#F3F3F3" strokeWidth={2.5} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 53,
          top: 144,
          width: 88,
          height: 16,
          color: "#000000",
          fontFamily: CD,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "16px",
          display: "flex",
          alignItems: "center",
        }}
      >
        Add Creator
      </div>
      {/* Filter */}
      <div
        style={{
          position: "absolute",
          left: 163,
          top: 134,
          width: 89,
          height: 36,
          background: "#FFFFFF",
          border: "1px solid #100F0F",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 177,
          top: 143,
          width: 18,
          height: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Filter size={15} color="#000000" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 144,
          width: 38,
          height: 16,
          color: "#000000",
          fontFamily: CD,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "16px",
          display: "flex",
          alignItems: "center",
        }}
      >
        Filter
      </div>
      {/* Sort by */}
      <div
        style={{
          position: "absolute",
          left: 260,
          top: 134,
          width: 99,
          height: 36,
          background: "#FFFFFF",
          border: "1px solid #100F0F",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 271.5,
          top: 143,
          width: 18,
          height: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowDownUp size={15} color="#000000" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 294.5,
          top: 144,
          width: 53,
          height: 16,
          color: "#000000",
          fontFamily: CD,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "16px",
          display: "flex",
          alignItems: "center",
        }}
      >
        Sort by
      </div>

      {/* ===== Creator cards ===== */}
      {/* Card 1 */}
      <CreatorCard
        top={217}
        avatarStroke={undefined}
        name="Leena Sharma"
        handle="@leenabliss"
        handleLeft={156}
        handleWidth={51}
        nameWidth={89}
        emoji="🔥"
        followers="1.2M"
        followersWidth={22}
        views="900k views"
        viewsWidth={58}
        leads="89 leads"
        leadsWidth={42}
        callLeft={297}
        arrowLeft={326}
        badgeLeft={61}
        badgeIconLeft={61}
        badgeTrend="up"
        badgeText=" +35% above avg  "
        badgeTextLeft={77}
        badgeTextWidth={64}
        badgeColor="#FD564B"
        badgeWidth={80}
        secondBadge={{
          left: 148,
          textLeft: 167,
          text: " Suggestion:  Increase",
          textWidth: 85,
          color: "#FD564B",
        }}
        checkbox={{ left: 339, top: 270, fill: "#D9D9D9", stroke: "#000000" }}
        rowY={249}
        nameY={229}
        handleY={231.5}
        avatarY={229}
        emojiY={250}
        badgeY={268}
      />
      {/* Card 2 */}
      <CreatorCard
        top={300}
        avatarStroke="#25AEFD"
        name="Leena Sharma"
        handle="@leenabliss"
        handleLeft={156}
        handleWidth={51}
        nameWidth={89}
        emoji="😥"
        followers="1.2M"
        followersWidth={22}
        views="300k views"
        viewsWidth={58}
        leads="39 leads"
        leadsWidth={42}
        callLeft={297}
        arrowLeft={326}
        badgeLeft={61}
        badgeIconLeft={61}
        badgeTrend="down"
        badgeText=" -15% below avg  "
        badgeTextLeft={77}
        badgeTextWidth={62}
        badgeColor="#25AEFD"
        badgeWidth={78}
        checkbox={{ left: 338, top: 352, fill: "#D9D9D9", stroke: "#000000" }}
        rowY={332}
        nameY={312}
        handleY={314.5}
        avatarY={312}
        emojiY={333}
        badgeY={351}
      />
      {/* Card 3 */}
      <CreatorCard
        top={383}
        avatarStroke="#B5B5B5"
        name="Diya  Sharma"
        handle="@diya444"
        handleLeft={147}
        handleWidth={51}
        nameWidth={80}
        emoji="😿"
        followers="1.1M"
        followersWidth={19}
        views="30k views"
        viewsWidth={51}
        leads="5 leads"
        leadsWidth={35}
        callLeft={292}
        arrowLeft={321}
        badgeLeft={60}
        badgeIconLeft={60}
        badgeTrend="down"
        badgeText=" -15%  avg  "
        badgeTextLeft={76}
        badgeTextWidth={40}
        badgeColor="#666767"
        badgeWidth={56}
        checkbox={{ left: 338, top: 435, fill: "#FFFFFF", stroke: "#000000" }}
        rowY={415}
        nameY={395}
        handleY={397.5}
        avatarY={395}
        emojiY={416}
        badgeY={433}
      />

      {/* ===== Share button (Frame 1171275387) ===== */}
      <div
        style={{
          position: "absolute",
          left: 19,
          top: 847,
          width: 335,
          height: 48,
          background: "#B7D0EE",
          border: "1px solid #000000",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#333333",
            fontFamily: CD,
            fontWeight: 500,
            fontSize: 15,
            lineHeight: "18.5px",
          }}
        >
          Share
        </span>
      </div>

      {/* ===== Modal scrim ===== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 375,
          height: 931,
          background: "rgba(0,0,0,0.4)",
        }}
      />

      {/* ===== Sort by bottom sheet (Frame 1171275432) ===== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 668,
          width: 375,
          height: 278,
          background: "#FFFFFF",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 13,
            top: 14,
            width: 63,
            height: 20,
            color: "#000000",
            fontFamily: CD,
            fontWeight: 500,
            fontSize: 12,
            lineHeight: "14.8px",
            display: "flex",
            alignItems: "center",
          }}
        >
          SORT BY
        </div>

        {/* Option 1 - Newest Added (selected) */}
        <div
          style={{
            position: "absolute",
            left: 18,
            top: 50,
            width: 114,
            height: 22,
            color: "#000000",
            fontFamily: CD,
            fontWeight: 500,
            fontSize: 16,
            lineHeight: "21.5px",
          }}
        >
          Newest Added
        </div>
        <div
          style={{
            position: "absolute",
            left: 336,
            top: 49,
            width: 24,
            height: 24,
            borderRadius: 9999,
            background: "#FFFFFF",
            border: "1px solid #151515",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 341,
            top: 54,
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: "#171718",
            border: "1px solid #151515",
          }}
        />

        {/* Divider 437 */}
        <div
          style={{
            position: "absolute",
            left: 13,
            top: 92,
            width: 351,
            height: 1,
            background: "#EBEFF3",
          }}
        />

        {/* Option 2 - Engagement Rate */}
        <div
          style={{
            position: "absolute",
            left: 18,
            top: 106,
            width: 246,
            height: 23,
            color: "#000000",
            fontFamily: CD,
            fontWeight: 500,
            fontSize: 16,
            lineHeight: "21.5px",
          }}
        >
          Engagement Rate – High to Low
        </div>
        <div
          style={{
            position: "absolute",
            left: 336,
            top: 105,
            width: 24,
            height: 24,
            borderRadius: 9999,
            background: "#FFFFFF",
            border: "1px solid #EBEFF3",
          }}
        />

        {/* Divider 438 */}
        <div
          style={{
            position: "absolute",
            left: 13,
            top: 145,
            width: 351,
            height: 1,
            background: "#EBEFF3",
          }}
        />

        {/* Option 3 - Avg. Views */}
        <div
          style={{
            position: "absolute",
            left: 18,
            top: 162,
            width: 193,
            height: 23,
            color: "#0B0B0B",
            fontFamily: CD,
            fontWeight: 500,
            fontSize: 16,
            lineHeight: "21.5px",
          }}
        >
          Avg. Views – High to Low
        </div>
        <div
          style={{
            position: "absolute",
            left: 336,
            top: 161,
            width: 24,
            height: 24,
            borderRadius: 9999,
            background: "#FFFFFF",
            border: "1px solid #EBEFF3",
          }}
        />

        {/* Divider 439 */}
        <div
          style={{
            position: "absolute",
            left: 13,
            top: 205,
            width: 351,
            height: 1,
            background: "#EBEFF3",
          }}
        />

        {/* Option 4 - Followers */}
        <div
          style={{
            position: "absolute",
            left: 18,
            top: 218,
            width: 182,
            height: 22,
            color: "#000000",
            fontFamily: CD,
            fontWeight: 500,
            fontSize: 16,
            lineHeight: "21.5px",
          }}
        >
          Followers - High To Low
        </div>
        <div
          style={{
            position: "absolute",
            left: 336,
            top: 217,
            width: 24,
            height: 24,
            borderRadius: 9999,
            background: "#FFFFFF",
            border: "1px solid #EBEFF3",
          }}
        />
      </div>

      {/* ===== Status bar (on top) ===== */}
      <div
        style={{
          position: "absolute",
          left: 19,
          top: 31,
          width: 54,
          height: 18,
          color: "#000000",
          fontFamily: URB,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "18px",
          textAlign: "center",
        }}
      >
        19:56
      </div>
      <div style={{ position: "absolute", left: 292, top: 33, width: 17, height: 12 }}>
        <SignalHigh size={16} color="#000000" strokeWidth={2} />
      </div>
      <div style={{ position: "absolute", left: 314, top: 33, width: 16, height: 12 }}>
        <Wifi size={16} color="#000000" strokeWidth={2} />
      </div>
      <div style={{ position: "absolute", left: 333, top: 32, width: 25, height: 13 }}>
        <BatteryFull size={22} color="#000000" strokeWidth={1.5} />
      </div>
    </div>
  );
}

/* ---------- Creator card (internal, static content only) ---------- */

type SecondBadge = {
  left: number;
  textLeft: number;
  text: string;
  textWidth: number;
  color: string;
};

type Checkbox = {
  left: number;
  top: number;
  fill: string;
  stroke: string;
};

function CreatorCard(props: {
  top: number;
  avatarStroke?: string;
  name: string;
  nameWidth: number;
  handle: string;
  handleLeft: number;
  handleWidth: number;
  emoji: string;
  followers: string;
  followersWidth: number;
  views: string;
  viewsWidth: number;
  leads: string;
  leadsWidth: number;
  callLeft: number;
  arrowLeft: number;
  badgeLeft: number;
  badgeIconLeft: number;
  badgeTrend: "up" | "down";
  badgeText: string;
  badgeTextLeft: number;
  badgeTextWidth: number;
  badgeColor: string;
  badgeWidth: number;
  secondBadge?: SecondBadge;
  checkbox: Checkbox;
  rowY: number;
  nameY: number;
  handleY: number;
  avatarY: number;
  emojiY: number;
  badgeY: number;
}) {
  const p = props;
  const iconTop = p.avatarY; // avatar/button vertical anchor
  return (
    <>
      {/* container */}
      <div
        style={{
          position: "absolute",
          left: 17,
          top: p.top,
          width: 343,
          height: 75,
          background: "#FBFFFC",
          border: "1px solid #000000",
          borderRadius: 12,
        }}
      />
      {/* avatar */}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: p.avatarY,
          width: 32,
          height: 32,
          borderRadius: 9999,
          background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)",
          border: p.avatarStroke ? `2px solid ${p.avatarStroke}` : undefined,
        }}
      />
      {/* name */}
      <div
        style={{
          position: "absolute",
          left: 59,
          top: p.nameY,
          width: p.nameWidth,
          height: 18,
          color: "#000000",
          fontFamily: CD,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "18px",
          textAlign: "center",
          whiteSpace: "pre",
        }}
      >
        {p.name}
      </div>
      {/* handle */}
      <div
        style={{
          position: "absolute",
          left: p.handleLeft,
          top: p.handleY,
          width: p.handleWidth,
          height: 13,
          color: "#000000",
          fontFamily: CD,
          fontWeight: 500,
          fontSize: 8,
          lineHeight: "13px",
          textAlign: "left",
        }}
      >
        {p.handle}
      </div>
      {/* emoji */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: p.emojiY,
          width: 16,
          height: 16,
          fontSize: 14,
          lineHeight: "16px",
          textAlign: "center",
        }}
      >
        {p.emoji}
      </div>

      {/* stats row */}
      <StatIcon left={59} top={p.rowY}>
        <User size={13} color="#000000" strokeWidth={1.6} />
      </StatIcon>
      <StatText left={78} top={p.rowY} width={p.followersWidth}>
        {p.followers}
      </StatText>

      <StatIcon left={109} top={p.rowY}>
        <Globe size={13} color="#000000" strokeWidth={1.4} />
      </StatIcon>
      <StatText left={128} top={p.rowY} width={p.viewsWidth}>
        {p.views}
      </StatText>

      <StatIcon left={195} top={p.rowY}>
        <Star size={13} color="#000000" strokeWidth={1.4} />
      </StatIcon>
      <StatText left={214} top={p.rowY} width={p.leadsWidth}>
        {p.leads}
      </StatText>

      {/* call button */}
      <div
        style={{
          position: "absolute",
          left: p.callLeft,
          top: iconTop,
          width: 25,
          height: 25,
          borderRadius: 9999,
          background: "#FFFFFF",
          border: "1px solid #EAEAEA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Phone size={13} color="#000000" strokeWidth={1.6} />
      </div>
      {/* arrow button */}
      <div
        style={{
          position: "absolute",
          left: p.arrowLeft,
          top: iconTop,
          width: 25,
          height: 25,
          borderRadius: 9999,
          background: "#FFFFFF",
          border: "1px solid #EAEAEA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowUpRight size={14} color="#000000" strokeWidth={1.5} />
      </div>

      {/* badge 1 */}
      <div
        style={{
          position: "absolute",
          left: p.badgeIconLeft,
          top: p.badgeY + 4,
          width: 14,
          height: 10,
          display: "flex",
          alignItems: "center",
        }}
      >
        {p.badgeTrend === "up" ? (
          <TrendingUp size={12} color={p.badgeColor} strokeWidth={1.6} />
        ) : (
          <TrendingDown size={12} color={p.badgeColor} strokeWidth={1.6} />
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: p.badgeTextLeft,
          top: p.badgeY,
          width: p.badgeTextWidth,
          height: 17,
          color: p.badgeColor,
          fontFamily: CD,
          fontWeight: 500,
          fontSize: 8,
          lineHeight: "17px",
          textAlign: "center",
          whiteSpace: "pre",
        }}
      >
        {p.badgeText}
      </div>

      {/* badge 2 (optional) */}
      {p.secondBadge && (
        <>
          <div
            style={{
              position: "absolute",
              left: p.secondBadge.left + 2,
              top: p.badgeY,
              width: 14,
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IndianRupee size={11} color={p.secondBadge.color} strokeWidth={1.6} />
          </div>
          <div
            style={{
              position: "absolute",
              left: p.secondBadge.textLeft,
              top: p.badgeY,
              width: p.secondBadge.textWidth,
              height: 17,
              color: p.secondBadge.color,
              fontFamily: CD,
              fontWeight: 500,
              fontSize: 8,
              lineHeight: "17px",
              textAlign: "center",
              whiteSpace: "pre",
            }}
          >
            {p.secondBadge.text}
          </div>
        </>
      )}

      {/* checkbox */}
      <div
        style={{
          position: "absolute",
          left: p.checkbox.left,
          top: p.checkbox.top,
          width: 15,
          height: 15,
          background: p.checkbox.fill,
          border: `1px solid ${p.checkbox.stroke}`,
          borderRadius: 5,
        }}
      />
    </>
  );
}

function StatIcon(props: { left: number; top: number; children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        left: props.left,
        top: props.top,
        width: 16,
        height: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {props.children}
    </div>
  );
}

function StatText(props: {
  left: number;
  top: number;
  width: number;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: props.left,
        top: props.top,
        width: props.width,
        height: 16,
        color: "#000000",
        fontFamily: CD,
        fontWeight: 500,
        fontSize: 10.2,
        lineHeight: "16px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {props.children}
    </div>
  );
}
