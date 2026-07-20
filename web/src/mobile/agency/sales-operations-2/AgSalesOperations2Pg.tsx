import { ChevronLeft, Check, MoreVertical } from "lucide-react";

/**
 * Agency app — Sales + Operations (team detail).
 * Figma frame 7810:24305 "Sales + operations", 375×876, fill #F8F5EF.
 * Rebuilt pixel-exact from the outline: every node absolutely positioned with
 * its frame-relative coords. Static content, no props/hooks.
 */
export default function AgSalesOperations2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 876,
        background: "#F8F5EF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Decorative gradient blob (top-right) */}
      <div
        style={{
          position: "absolute",
          left: 240.6,
          top: -57.6,
          width: 192,
          height: 192,
          borderRadius: 9999,
          background:
            "linear-gradient(135deg, rgba(222,255,200,0.7), rgba(124,134,255,0.18))",
          filter: "blur(2px)",
        }}
      />

      {/* ── Header ── */}
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
          boxShadow: "0 6px 16px rgba(31,26,23,0.18)",
        }}
      >
        <ChevronLeft
          size={16.2}
          strokeWidth={1.35}
          color="#FAF7F2"
          style={{ position: "absolute", left: 9.9, top: 9.9 }}
        />
      </div>
      {/* Heading */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 28,
          width: 222,
          height: 24,
          color: "#141311",
          fontFamily: "Geist, sans-serif",
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Team
      </div>

      {/* Divider under header */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 80,
          width: 335,
          height: 1,
          background: "#E2E8F0",
        }}
      />

      {/* ── Main info card ── */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 101,
          width: 335,
          height: 222,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
          boxShadow: "0 8px 30px rgba(17,17,17,0.06)",
        }}
      >
        {/* Green icon circle */}
        <div
          style={{
            position: "absolute",
            left: 21,
            top: 21,
            width: 44,
            height: 44,
            background:
              "linear-gradient(135deg, rgba(222,255,200,0.8), #E4F7DB)",
            border: "1px solid #D0FFB7",
            borderRadius: 9999,
          }}
        >
          <Check
            size={18}
            strokeWidth={2}
            color="#79CB4C"
            style={{ position: "absolute", left: 13, top: 13 }}
          />
        </div>

        {/* Title + members count */}
        <div
          style={{
            position: "absolute",
            left: 77,
            top: 23,
            width: 177,
            height: 24,
            color: "#111111",
            fontWeight: 600,
            fontSize: 16,
            lineHeight: "24px",
          }}
        >
          Sales + Operations
        </div>
        <div
          style={{
            position: "absolute",
            left: 77,
            top: 47,
            width: 177,
            height: 16,
            color: "#64748B",
            fontWeight: 400,
            fontSize: 12,
            lineHeight: "16px",
          }}
        >
          10 Members
        </div>

        {/* Toggle (on) */}
        <div
          style={{
            position: "absolute",
            left: 266,
            top: 31,
            width: 48,
            height: 24,
            background: "#7C86FF",
            borderRadius: 9999,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 28,
              top: 4,
              width: 16,
              height: 16,
              background: "#FFFFFF",
              borderRadius: 9999,
              boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            }}
          />
        </div>

        {/* Inner divider */}
        <div
          style={{
            position: "absolute",
            left: 21,
            top: 85,
            width: 293,
            height: 1,
            background: "#E2E8F0",
          }}
        />

        {/* Stats panel */}
        <div
          style={{
            position: "absolute",
            left: 7,
            top: 102,
            width: 311,
            height: 103,
            background:
              "linear-gradient(135deg, rgba(209,250,229,0.55), rgba(187,247,208,0.3))",
            border: "1px solid #FFFFFF",
            borderRadius: 24,
          }}
        >
          {/* Stat: All Campaigns */}
          <StatCell left={17} valueLeft={17} value="20" label={"All\nCampaigns"} valueW={54.2} />
          {/* Stat: All Leads */}
          <StatCell left={88.2} valueLeft={88.2} value="20" label={"All\nLeads"} valueW={54.2} />
          {/* Stat: Unattended */}
          <StatCell left={159.5} valueLeft={159.5} value="7" label={"Unattended"} valueW={62.2} labelW={62} />
          {/* Stat: Contacted */}
          <StatCell left={230.8} valueLeft={230.8} value="3" label={"Contacted"} valueW={55.2} labelW={55.2} />
        </div>
      </div>

      {/* ── Members header row ── */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 345,
          width: 74,
          height: 24,
          color: "#111111",
          fontWeight: 600,
          fontSize: 16,
          lineHeight: "24px",
        }}
      >
        Members
      </div>
      {/* Add Members button */}
      <div
        style={{
          position: "absolute",
          left: 250,
          top: 343,
          width: 105,
          height: 28,
          background: "#111111",
          borderRadius: 9999,
          boxShadow: "0 4px 12px rgba(17,17,17,0.18)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 6,
            width: 81,
            height: 16,
            color: "#F4F6F8",
            fontWeight: 500,
            fontSize: 12,
            lineHeight: "16px",
            textAlign: "center",
          }}
        >
          Add Members
        </div>
      </div>

      {/* ── Member cards ── */}
      {/* Card 1 — Riya Verma (Active) */}
      <MemberCard
        top={387}
        avatarTop={400}
        radius={40}
        name="Riya Verma"
        role="Operations"
        roleColor="#64748B"
        roleWeight={400}
        roleSize={12}
        roleLh={16}
      />
      {/* Card 2 — Lisa Rai (Active) */}
      <MemberCard
        top={473}
        avatarTop={486}
        radius={40}
        name="Lisa Rai"
        role="Operations"
        roleColor="#64748B"
        roleWeight={400}
        roleSize={12}
        roleLh={16}
      />
      {/* Card 3 — Sanjay Sharma (Offline) */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 559,
          width: 335,
          height: 72,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 18,
          boxShadow: "0 8px 24px rgba(17,17,17,0.06)",
        }}
      >
        {/* Avatar (no stroke) */}
        <div
          style={{
            position: "absolute",
            left: 13,
            top: 13,
            width: 46,
            height: 46,
            borderRadius: 9999,
            background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)",
          }}
        />
        {/* Name */}
        <div
          style={{
            position: "absolute",
            left: 71,
            top: 17,
            width: 142,
            height: 21,
            color: "#111111",
            fontWeight: 600,
            fontSize: 14,
            lineHeight: "21px",
          }}
        >
          Sanjay Sharma
        </div>
        {/* Role */}
        <div
          style={{
            position: "absolute",
            left: 71,
            top: 38,
            width: 142,
            height: 17,
            color: "#000000",
            fontWeight: 500,
            fontSize: 11,
            lineHeight: "16.5px",
          }}
        >
          Sales
        </div>
        {/* Offline badge */}
        <div
          style={{
            position: "absolute",
            left: 225,
            top: 23,
            width: 65,
            height: 26,
            background: "#F1F5F9",
            border: "1px solid #E2E8F0",
            borderRadius: 9999,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 10,
              top: 10,
              width: 6,
              height: 6,
              background: "#D1D5DC",
              borderRadius: 9999,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 5,
              width: 32,
              height: 16,
              color: "#64748B",
              fontWeight: 500,
              fontSize: 10,
              lineHeight: "16px",
            }}
          >
            Offline
          </div>
        </div>
        {/* Menu */}
        <MoreVertical
          size={14}
          strokeWidth={2}
          color="#BBBBBB"
          style={{ position: "absolute", left: 303, top: 29 }}
        />
      </div>

      {/* Card 4 — Rahul Singh (Active) */}
      <MemberCard
        top={647}
        avatarTop={660}
        radius={40}
        name="Rahul Singh"
        role="Sales"
        roleColor="#64748B"
        roleWeight={400}
        roleSize={12}
        roleLh={16}
      />
    </div>
  );
}

/* ── Stat cell inside the green stats panel ──
   left/valueLeft are relative to the stats-panel top-left (7,102). */
function StatCell({
  left,
  valueLeft,
  value,
  label,
  valueW,
  labelW = 59,
}: {
  left: number;
  valueLeft: number;
  value: string;
  label: string;
  valueW: number;
  labelW?: number;
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: valueLeft,
          top: 17,
          width: valueW,
          height: 18,
          color: "#111111",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: "18px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          position: "absolute",
          left,
          top: 38,
          width: labelW,
          height: 30,
          color: "#64748B",
          fontWeight: 400,
          fontSize: 10,
          lineHeight: "15px",
          whiteSpace: "pre-line",
        }}
      >
        {label}
      </div>
    </>
  );
}

/* ── Standard member card (Active status, radius 40) ──
   top = card top; avatarTop = avatar top. Coordinates inside are card-relative. */
function MemberCard({
  top,
  avatarTop,
  radius,
  name,
  role,
  roleColor,
  roleWeight,
  roleSize,
  roleLh,
}: {
  top: number;
  avatarTop: number;
  radius: number;
  name: string;
  role: string;
  roleColor: string;
  roleWeight: number;
  roleSize: number;
  roleLh: number;
}) {
  const avatarInnerTop = avatarTop - top; // 13
  return (
    <div
      style={{
        position: "absolute",
        left: 20,
        top,
        width: 335,
        height: 70,
        background: "#FFFFFF",
        border: "1px solid #FFFFFF",
        borderRadius: radius,
        boxShadow: "0 6px 20px rgba(17,17,17,0.05)",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          position: "absolute",
          left: 17,
          top: avatarInnerTop,
          width: 44,
          height: 44,
          borderRadius: 9999,
          border: "2px solid #FFFFFF",
          background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)",
        }}
      />
      {/* Name */}
      <div
        style={{
          position: "absolute",
          left: 73,
          top: 17,
          width: 142,
          height: 20,
          color: "#111111",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "20px",
        }}
      >
        {name}
      </div>
      {/* Role */}
      <div
        style={{
          position: "absolute",
          left: 73,
          top: 37,
          width: 142,
          height: 16,
          color: roleColor,
          fontWeight: roleWeight,
          fontSize: roleSize,
          lineHeight: `${roleLh}px`,
        }}
      >
        {role}
      </div>
      {/* Active badge */}
      <div
        style={{
          position: "absolute",
          left: 227,
          top: 22,
          width: 59,
          height: 26,
          background: "#F0FDF4",
          border: "1px solid #7BF1A8",
          borderRadius: 9999,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 10,
            width: 6,
            height: 6,
            background: "#05DF72",
            borderRadius: 9999,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 5,
            width: 31,
            height: 16,
            color: "#00A63E",
            fontWeight: 500,
            fontSize: 10,
            lineHeight: "16px",
          }}
        >
          Active
        </div>
      </div>
      {/* Menu */}
      <MoreVertical
        size={16}
        strokeWidth={2}
        color="#64748B"
        style={{ position: "absolute", left: 300, top: 27 }}
      />
    </div>
  );
}
