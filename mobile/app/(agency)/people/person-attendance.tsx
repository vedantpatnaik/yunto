import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useLeaves, useList, useUsers, type Leave, type User } from "../../../src/api/hooks";

/**
 * Attendance & Leaves — Figma frame 4101:66340 "teams - people" (375x1195),
 * traced 1:1.
 *
 * The attendance tab of a person's profile. Same chrome as the sibling tabs —
 * the "Team & Roles" header, the 336x769 glass card at (20,136) carrying the
 * "Teams & Roles" disclosure row, then a white 303x690 panel at (34,198) whose
 * first two rows are the team identity (avatar, name, member count, active
 * pill) and the person card (initial disc, name, role, status pill, kebab).
 * Under them the tab body proper: eight 291x62 stat rows at y=338 on a 68pt
 * step, each a 15pt label with a 12pt value 21pt below it.
 *
 * This is the only current-generation frame for the state — there is no clipped
 * 875/876 variant — so it is built as the scrolling body at its full 1195pt
 * height; the design's own content ends at 905 and the rest is frame padding.
 *
 * The frame's Clash Display text nodes render in Outfit, the app's primary face
 * (Clash is not loaded); the two Inter nodes keep Inter. The three background
 * ellipses each carry a 103pt LAYER_BLUR, which RN cannot apply to a layer, so
 * each is drawn as a radial falloff whose plateau ends where the blur starts
 * eating the original edge. The 0.4-opacity tiled texture over them has no
 * bundled asset, so it is omitted rather than faked.
 *
 * Attendance & Leaves are real tables, so every number here is derived from
 * them — see the accounting note on `stats`. Attendance records `loginAt` but
 * has no logout column, so "Avg. Logout time" shows an em dash rather than a
 * fabricated clock.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 1195;

const CARD = { x: 20, y: 136, w: 336, h: 769 };
const PANEL = { x: 34, y: 198, w: 303, h: 690 };

const ROW_X = 40;
const ROW_W = 291;
const ROW_H = 62;
const ROW_Y = 338; // first stat row
const ROW_STEP = 68; // 62 row + 6 gap
const LABEL_DY = 7;
const VALUE_DY = 28;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#fdfdfd";
const HEAD_INK = "#1b1b1c";
const SECTION_INK = "#242220";
const INK_90 = "rgba(0,0,0,0.9)";
const INK_70 = "rgba(0,0,0,0.7)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const WHITE = "#ffffff";
const TEAM_TILE = "#ecc5f5";
const PERSON_TILE = "#c6a6df";
const PERSON_INITIAL = "#6000aa";
const DOT_GREEN = "#4ccc16";
const PILL_INK = "#222222";

/**
 * Soft Dreamy Background. Each ellipse is blurred by 103.15pt in Figma; the
 * radial stand-in grows by that radius and holds full opacity only out to where
 * the blur begins to erode the original edge — (r - blur) / (r + blur).
 */
const BLUR = 103.15;
const BLOBS = [
  { id: "blush", cx: 313.48, cy: 856.33, rx: 246.86, ry: 244.29, from: "#ff90a9", to: "#ff90a9", op: 0.7 },
  { id: "plum", cx: 373.57, cy: 694.21, rx: 238.36, ry: 236.59, from: "#8673b3", to: "#a79ac6", op: 0.49 },
  { id: "mist", cx: 65.33, cy: 246.03, rx: 81.68, ry: 78.56, from: "#ccf5fd", to: "#ccf5fd", op: 1 },
  { id: "sky", cx: 53.56, cy: 169.39, rx: 78.56, ry: 76.39, from: "#46b5fc", to: "#8fbeff", op: 0.49 },
] as const;

/* ---------------------------------- data ---------------------------------- */
/** GET /attendance — the Prisma Attendance model, one row per user per day. */
interface AttendanceRow {
  id: string;
  userId: string;
  date: string;
  present: boolean;
  loginAt?: string | null;
}

const DAY_MS = 86_400_000;

/** Inclusive day span of a leave; `from` and `to` are ISO datetimes. */
function leaveDays(l: Leave): number {
  const a = Date.parse(l.from);
  const b = Date.parse(l.to);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(1, Math.round((b - a) / DAY_MS) + 1);
}

/**
 * Leave.type is a free-text column (the seed writes Casual / Sick / Earned), so
 * the four leave rows split it by what the type actually says: anything naming
 * a half day, remote work or a loss-of-pay day lands in its own bucket, and
 * every other approved leave is a paid one — which is what Casual, Sick and
 * Earned are. "Leaves Taken" is the sum of the three leave buckets; work from
 * home is counted apart because it is not a leave.
 */
type Bucket = "half" | "wfh" | "unpaid" | "paid";
function bucketOf(type: string): Bucket {
  const t = type.toLowerCase();
  if (t.includes("half")) return "half";
  if (t.includes("wfh") || t.includes("work from home") || t.includes("remote")) return "wfh";
  if (t.includes("unpaid") || t.includes("lop") || t.includes("loss of pay")) return "unpaid";
  return "paid";
}

/** Minutes past midnight -> "10:15 am". Null when nothing is on record. */
function clock(minutes: number | null): string {
  if (minutes == null) return "—";
  const t = Math.round(minutes);
  const h24 = Math.floor(t / 60) % 24;
  const m = t % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
}

/** Row subtitle — the person's seniority, off the Role enum. */
function roleLabel(role: string): string {
  if (role === "SUPER_ADMIN") return "Admin";
  return role.endsWith("MANAGER") ? "Manager" : "Employee";
}

/* -------------------------------- stat row -------------------------------- */
function StatRow({ top, label, labelW, value }: {
  top: number; label: string; labelW: number; value: string;
}) {
  return (
    <>
      <Abs x={ROW_X} y={top} w={ROW_W} h={ROW_H} radius={8} bg={WHITE} />
      <Txt
        x={52} y={top + LABEL_DY} w={labelW}
        size={15} weight="medium" color={INK_90} lineHeight={24} numberOfLines={1}
      >
        {label}
      </Txt>
      <Txt
        x={52} y={top + VALUE_DY} w={110}
        size={12} color={INK_70} lineHeight={24} numberOfLines={1}
      >
        {value}
      </Txt>
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function PersonAttendance() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: users = [], isLoading } = useUsers();
  const { data: leaves = [] } = useLeaves();
  const { data: attendance = [] } = useList<AttendanceRow>("attendance");

  /** The person this tab is about; without a param, the first staff member. */
  const person: User | undefined = useMemo(
    // users[0] is the SUPER_ADMIN, who belongs to no team — a person page
    // defaulting to them renders an empty roster. Prefer a real team member.
    () => users.find((u) => u.id === id) ?? users.find((u) => u.team) ?? users[0],
    [users, id],
  );

  /** Their team, and everyone else on it — the identity row above the stats. */
  const members = useMemo(
    () => (person?.team ? users.filter((u) => u.team?.id === person.team?.id) : []),
    [users, person],
  );

  /**
   * The latest day anyone was marked in. There is no active/inactive flag on
   * User, so presence on that day is what both "Active" reads mean.
   */
  const presentToday = useMemo(() => {
    let latest = "";
    for (const a of attendance) if (a.date > latest) latest = a.date;
    return new Set(attendance.filter((a) => a.present && a.date === latest).map((a) => a.userId));
  }, [attendance]);

  const activeCount = members.filter((u) => presentToday.has(u.id)).length;

  /* ------------------------------ the tab body ---------------------------- */
  const stats = useMemo(() => {
    const mine = attendance.filter((a) => a.userId === person?.id);
    const days: Record<Bucket, number> = { half: 0, wfh: 0, unpaid: 0, paid: 0 };
    for (const l of leaves) {
      if (l.userId !== person?.id || l.status !== "APPROVED") continue;
      days[bucketOf(l.type)] += leaveDays(l);
    }

    const logins = mine
      .map((a) => (a.loginAt ? new Date(a.loginAt) : null))
      .filter((d): d is Date => d != null && !Number.isNaN(d.getTime()));
    const avgLogin = logins.length
      ? logins.reduce((s, d) => s + d.getHours() * 60 + d.getMinutes(), 0) / logins.length
      : null;

    return {
      workingDays: mine.filter((a) => a.present).length,
      leavesTaken: days.paid + days.unpaid + days.half,
      halfDay: days.half,
      unpaidLeaves: days.unpaid,
      wfh: days.wfh,
      paidLeaves: days.paid,
      avgLogin: clock(avgLogin),
      // Attendance has loginAt but no logout column, so this stays unreported.
      avgLogout: clock(null),
    };
  }, [attendance, leaves, person]);

  /** Label / value pairs in the frame's order; only the first label is 230 wide. */
  const rows: { label: string; labelW: number; value: string }[] = [
    { label: "Total Working Days", labelW: 230, value: `${stats.workingDays}` },
    { label: "Leaves Taken", labelW: 138, value: `${stats.leavesTaken}` },
    { label: "Half Day", labelW: 138, value: `${stats.halfDay}` },
    { label: "Unpaid Leaves", labelW: 138, value: `${stats.unpaidLeaves}` },
    { label: "Work from home", labelW: 138, value: `${stats.wfh}` },
    { label: "Paid Leaves", labelW: 138, value: `${stats.paidLeaves}` },
    { label: "Avg. Login Time", labelW: 138, value: stats.avgLogin },
    { label: "Avg. Logout time", labelW: 138, value: stats.avgLogout },
  ];

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* -------------------- Soft Dreamy Background -------------------- */}
      <Abs x={0} y={0} w={375} h={FRAME_H} style={styles.clip}>
        <Svg width={375} height={FRAME_H} style={styles.backdrop}>
          <Defs>
            {BLOBS.map((b) => (
              <RadialGradient key={b.id} id={b.id}>
                <Stop offset="0" stopColor={b.from} stopOpacity={b.op} />
                <Stop
                  offset={`${Math.max(0, (b.rx - BLUR) / (b.rx + BLUR))}`}
                  stopColor={b.to}
                  stopOpacity={b.op}
                />
                <Stop offset="1" stopColor={b.to} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          {BLOBS.map((b) => (
            <Ellipse
              key={b.id}
              cx={b.cx}
              cy={b.cy}
              rx={b.rx + BLUR}
              ry={b.ry + BLUR}
              fill={`url(#${b.id})`}
            />
          ))}
        </Svg>
      </Abs>

      {/* ------------------------------ Container ----------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16} color={HEAD_INK} />
      </Pressable>
      <Txt x={44} y={82} w={298} size={20} weight="medium" color={HEAD_INK} lineHeight={37}>
        Team &amp; Roles
      </Txt>

      {/* --------------------------- ,manager view] --------------------------- */}
      <Abs x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} radius={8} bg={GLASS_60} />

      <Abs x={40} y={152.5} w={20} h={20} center>
        <Feather name="edit" size={16} color={SECTION_INK} />
      </Abs>
      <Txt x={76} y={152.5} w={234} size={14} weight="medium" color={SECTION_INK} lineHeight={20}>
        Teams &amp; Roles
      </Txt>
      <Abs x={319} y={156.5} w={24} h={12} center>
        <Feather name="chevron-down" size={13} color="#000000" />
      </Abs>

      {/* ------------------------------- Input -------------------------------- */}
      <Abs x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} radius={8} bg={WHITE} />

      {/* Team identity: 42pt tile, name, member count, active pill */}
      <Abs x={44} y={206} w={42} h={42} radius={21} bg={TEAM_TILE} center>
        <MaterialCommunityIcons name="account-group" size={19} color="#000000" />
      </Abs>
      <Txt x={99} y={205} w={110} size={15} weight="medium" color={INK_90} lineHeight={24} numberOfLines={1}>
        {person?.team?.name ?? (isLoading ? "Loading…" : "No team")}
      </Txt>
      <Abs x={99} y={228.5} w={16} h={16} center>
        <Ionicons name="people" size={13} color="#000000" />
      </Abs>
      <Txt x={120} y={226} w={110} size={10} color={INK_70} lineHeight={24}>
        {`${members.length} Members`}
      </Txt>
      <Abs x={266} y={206} w={61} h={20} radius={24} bg={WHITE}>
        <Abs x={7.07} y={6.57} w={7.71} h={7.71} radius={3.855} bg={DOT_GREEN} />
        <Txt
          x={16.5} y={4} w={40}
          size={8} weight="medium" font="inter" color={PILL_INK} lineHeight={16} align="center"
        >
          {` ${activeCount} Active`}
        </Txt>
      </Abs>

      {/* Person card — the profile this tab hangs off */}
      <Abs x={41} y={266} w={286} h={ROW_H} bg={WHITE}>
        <Abs x={10} y={8} w={42} h={42} radius={21} bg={PERSON_TILE}>
          <Txt
            x={15} y={9} w={11}
            size={15} weight="medium" color={PERSON_INITIAL} lineHeight={24} align="center"
          >
            {(person?.name ?? "").slice(0, 1).toUpperCase()}
          </Txt>
        </Abs>
        <Txt x={65} y={8} w={110} size={15} weight="medium" color={INK_90} lineHeight={24} numberOfLines={1}>
          {person?.name ?? (isLoading ? "Loading…" : "No people yet")}
        </Txt>
        <Txt x={65} y={27} w={99} size={10} font="inter" color={INK_70} lineHeight={24} numberOfLines={1}>
          {person ? roleLabel(person.role) : ""}
        </Txt>

        {/* Frame 14566 — drawn only while the person is on the day's roster, so
            the pill never claims a status the attendance table does not show. */}
        {person && presentToday.has(person.id) ? (
          <Abs x={185} y={10} w={53} h={20} radius={24} bg={WHITE}>
            <Txt
              x={6} y={4} w={41}
              size={8} weight="medium" font="inter" color={DOT_GREEN} lineHeight={16} align="center"
            >
              Active
            </Txt>
          </Abs>
        ) : null}

        <Pressable style={({ pressed }) => [styles.kebab, pressed && styles.pressed]}>
          <Feather name="more-vertical" size={14} color="#000000" />
        </Pressable>
      </Abs>

      {/* --------------------------- Frame 1171276868 -------------------------- */}
      {rows.map((r, i) => (
        <StatRow
          key={r.label}
          top={ROW_Y + i * ROW_STEP}
          label={r.label}
          labelW={r.labelW}
          value={r.value}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.6 },

  back: {
    position: "absolute",
    left: 16,
    top: 85,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  // pepicons-pop:dots-y at (304,273), row-relative
  kebab: {
    position: "absolute",
    left: 263,
    top: 7,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
