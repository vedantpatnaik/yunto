import { Fragment, useMemo } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { gradients } from "../../../src/theme";
import { useList, type User } from "../../../src/api/hooks";

/**
 * People — Figma frame 7739:2412 "teams - people" (375x876), traced 1:1.
 *
 * The People dashboard of the agency Team Management flow. Three glass sections
 * stack inside the frame's clipped 741pt container (0,105) on a 16pt gap:
 *
 *   1. People (20,105 335x282) — Total Employees + the "N Active" pill above a
 *      3-up Teams / Attendance / Avg Login row split by hairline rules.
 *   2. People Highlights (20,403 335x263) — 301x74 birthday rows on an 86 step.
 *   3. Teams & Roles (20,682 335x496.5) — a 301x78 team card, its 301x74 member
 *      rows on an 86 step, and the "View all N members" button.
 *
 * Content runs to y1178.5, well past the 876 frame, so the canvas is sized to
 * the stack and scrolls. Sections 2 and 3 grow with their data, so their y is
 * computed from section 1 rather than hard-coded — with the design's own data
 * (2 highlights, one team, 3 members) the arithmetic lands exactly on the spec's
 * 403 / 682. Figma measures each card 1pt taller than its padding box (the card
 * stroke), which is the +STROKE below; drop it and every section shifts up 1pt.
 *
 * Wiring. Employees are the real roster, teams the real Team rows and the pills
 * the real attendance register:
 *   - Total Employees  = users.length
 *   - "N Active"       = users present on the latest attendance day on file
 *   - Teams            = teams.length
 *   - Attendance       = present / recorded on that day
 *   - Avg Login        = mean Attendance.loginAt time-of-day for that day
 *   - team card counts = members by team relation, active by the same register
 *   - member Active/Offline = that member's row in the register
 *
 * People Highlights reads User.dateOfBirth. The column exists on the model but
 * GET /users does not select it, so the section renders its empty state until it
 * does — the honest outcome. Deriving a "Happy Birthday" row from createdAt (the
 * joining date) would put the design's label over a date that is not a birthday,
 * so it is left unwired rather than faked.
 *
 * expo-blur is not a dependency: the spec's BACKGROUND_BLUR on every card is
 * rendered as its translucent fill alone, as the sibling agency frames do. The
 * header's Geist face is not loaded either, so it renders in Inter — the frame's
 * own body face. Iconify glyphs are matched to their nearest vector-icons twin
 * at the spec's own box size (see ICONS below).
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 876;
/** The frame keeps a 30pt tail below its 741pt container (846 -> 876). */
const TAIL = 30;

const CARD_X = 20;
const CARD_W = 335;
const ROW_X = 37; // card x + 16pt body padding
const ROW_W = 301;

const SECTION_GAP = 16;
const PAD = 16;
/** Section header block, including the card's 1pt top stroke. */
const HEAD_H = 70;
const BODY_DY = HEAD_H + PAD; // first body child, card-relative
const STROKE = 1;

/** Section 1 is fixed: its stat grid has no variable-length list. */
const CARD1_Y = 105;
const CARD1_H = 282;

/** Header-row offsets shared by sections 2 and 3 (identical 36pt tile). */
const TILE_DY = 17;
const TITLE_DY = 22.75;
const CHEV_DY = 27;
const RULE_DY = 69;

const HL_H = 74;
const HL_STEP = 86; // 74 row + 12 stack gap
/** The highlights body clips at 192pt — exactly the two rows the spec draws. */
const MAX_HIGHLIGHTS = 2;

const TEAM_H = 78;
const MEMBER_H = 74;
const MEMBER_STEP = 86; // 74 row + 12 stack gap
const VIEW_ALL_H = 45.5;
const STACK_GAP = 12;
/** The spec draws three member rows per team, then defers to "View all". */
const MAX_MEMBERS = 3;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";

const INK = "#111111";
const LABEL_INK = "#aaaaaa";
const SUB_INK = "#888888";
const BLUE_INK = "#3a7de8";
const NAME_OFF_INK = "#666666";
const MUTED_40 = "rgba(0,0,0,0.4)";
const MUTED_30 = "rgba(0,0,0,0.3)";

const CARD_FILL = "rgba(255,255,255,0.52)";
const CARD_LINE = "rgba(0,0,0,0.07)";
const HEAD_RULE = "rgba(0,0,0,0.05)";
const STAT_RULE = "rgba(0,0,0,0.04)";

const HL_FILL = "rgba(255,255,255,0.65)";
const TEAM_FILL = "rgba(255,255,255,0.6)";
const MEMBER_FILL = "rgba(255,255,255,0.5)";
const MEMBER_OFF_FILL = "rgba(255,255,255,0.35)";
const LINE_90 = "rgba(255,255,255,0.9)";
const LINE_85 = "rgba(255,255,255,0.85)";
const LINE_70 = "rgba(255,255,255,0.7)";

const PILL_FILL = "rgba(240,253,244,0.6)";
const PILL_LINE = "#7bf1a8";
const PILL_DOT = "#05df72";
const PILL_INK = "#00a63e";
const OFF_PILL_FILL = "rgba(0,0,0,0.04)";
const OFF_PILL_LINE = "rgba(0,0,0,0.1)";

const CHEVRON = "#bbbbbb";
const KEBAB = "#bbbbbb";
const KEBAB_OFF = "#cccccc";
const BTN_FILL = "rgba(255,255,255,0.4)";
const BTN_INK = "rgba(0,0,0,0.5)";
const BTN_CHEV = "#aaaaaa";

/**
 * Section header tiles, in frame order. Iconify sets are not bundled, so each
 * glyph is its nearest @expo/vector-icons twin at the vector's own box size:
 * the 20x17.87 + 8x8 stroke pair -> Feather users, the 13.34 shape + 2.67 speck
 * -> party-popper, the four 4.67 squares -> Feather grid.
 */
const HL_TILE = "#fef9ee";
const HL_TILE_INK = "#7e5c2a";
const TEAMS_TILE = "#f0f5f1";
const TEAMS_TILE_INK = "#3e5c45";

/** Highlight avatar paints, in the order the spec draws its two rows. */
const HL_PALETTES = [
  { from: "#ffe6b4cc", to: "#ffd2a0b2", ring: "rgba(255,190,120,0.3)", ink: "#e8943a" },
  { from: "#ffd7ebcc", to: "#fac8e1b2", ring: "rgba(240,170,200,0.3)", ink: "#cc5580" },
] as const;

/** Member avatars are photo fills in the design; without a URL, a gradient. */
const AVATARS = [gradients.avatarA, gradients.avatarB, gradients.avatarC] as const;

/* --------------------------------- data ----------------------------------- */
/** GET /teams — the bare Prisma Team model, no relations eager-loaded. */
interface Team {
  id: string;
  name: string;
  kind: string;
}

/** GET /attendance — one row per user per day, newest first. */
interface AttendanceDay {
  id: string;
  userId: string;
  date: string;
  present: boolean;
  loginAt?: string | null;
}

/**
 * The roster row. Same endpoint and query key as useUsers(), widened with the
 * User.dateOfBirth column so People Highlights lights up the moment GET /users
 * selects it. Nothing else on this screen depends on it.
 */
interface Person extends User {
  dateOfBirth?: string | null;
}

interface Highlight {
  id: string;
  name: string;
  /** "16/09" — the day the design prints. */
  day: string;
  /** Year of the next occurrence, the design's second line. */
  year: string;
  /** Days until that occurrence; the sort key. */
  due: number;
}

/* ------------------------------ derivations ------------------------------- */
const two = (n: number) => String(n).padStart(2, "0");

/** Role enum -> the member row's subtitle. */
function roleLabel(role: string): string {
  switch (role) {
    case "SUPER_ADMIN": return "Admin";
    case "SALES_MANAGER": return "Sales Manager";
    case "OPS_MANAGER": return "Operations Manager";
    case "OPS_EMPLOYEE": return "Operations";
    default: return "Sales";
  }
}

/** Mean minutes-past-midnight -> "10:15" + "am", the two nodes the spec draws. */
function clockParts(minutes: number | null): { value: string; suffix: string } {
  if (minutes === null) return { value: "—", suffix: "" };
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return { value: `${h % 12 || 12}:${two(m)}`, suffix: h < 12 ? "am" : "pm" };
}

/* -------------------------------- backdrop -------------------------------- */
/**
 * The soft corner glow each card carries: a radial from its top-right corner
 * out to 1.41x the box, clipped to the card's 28pt radius.
 */
function Glow({
  gid, x, y, size, color, opacity,
}: { gid: string; x: number; y: number; size: number; color: string; opacity: number }) {
  return (
    <Svg width={size} height={size} style={[styles.glow, { left: x, top: y }]}>
      <Defs>
        <RadialGradient
          id={gid}
          cx={size}
          cy={0}
          rx={size * 1.41}
          ry={size * 1.41}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.65" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={size} height={size} rx={28} fill={`url(#${gid})`} />
    </Svg>
  );
}

/* ------------------------------ section header ---------------------------- */
/** The 36pt tile + title + collapse caret shared by sections 2 and 3. */
function SectionHead({
  top, tile, ink, glyph, title,
}: { top: number; tile: string; ink: string; glyph: "party" | "grid"; title: string }) {
  return (
    <>
      <Abs x={41} y={top + TILE_DY} w={36} h={36} radius={18} bg={tile} center>
        {glyph === "party" ? (
          <MaterialCommunityIcons name="party-popper" size={16} color={ink} />
        ) : (
          <Feather name="grid" size={16} color={ink} />
        )}
      </Abs>
      <Txt
        x={89} y={top + TITLE_DY} w={217}
        size={15} weight="semibold" font="inter" color={INK}
        lineHeight={22.5} letterSpacing={-0.38} numberOfLines={1}
      >
        {title}
      </Txt>
      <Abs x={318} y={top + CHEV_DY} w={16} h={16} center>
        <Feather name="chevron-up" size={16} color={CHEVRON} />
      </Abs>
      <Abs x={21} y={top + RULE_DY} w={333} h={1} bg={HEAD_RULE} />
    </>
  );
}

/* ------------------------------ highlight row ----------------------------- */
/** 301x74 glass row. Child offsets below are row-relative. */
function HighlightRow({
  top, palette, name, day, year,
}: {
  top: number;
  palette: (typeof HL_PALETTES)[number];
  name: string;
  day: string;
  year: string;
}) {
  return (
    <Abs
      x={ROW_X} y={top} w={ROW_W} h={HL_H} radius={18}
      bg={HL_FILL} border={LINE_90} borderWidth={1} style={styles.hlShadow}
    >
      {/* Background+Border — 44pt gradient disc holding the emoji */}
      <Abs x={17} y={15} w={44} h={44} radius={22} border={palette.ring} borderWidth={1} style={styles.clip}>
        <LinearGradient
          colors={[palette.from, palette.to] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        />
        <Txt x={12} y={7} w={20} size={20} lineHeight={30} align="center" color={INK}>
          🎂
        </Txt>
      </Abs>

      <Txt
        x={73} y={17.5} w={167}
        size={10} weight="bold" font="inter" color={palette.ink}
        lineHeight={15} letterSpacing={1} style={styles.upper}
      >
        Happy Birthday
      </Txt>
      <Txt
        x={73} y={33.5} w={167}
        size={15} weight="semibold" font="inter" color={INK}
        lineHeight={22.5} letterSpacing={-0.38} numberOfLines={1}
      >
        {name}
      </Txt>

      <Txt
        x={252} y={21} w={32}
        size={11} weight="bold" font="inter" color={SUB_INK} lineHeight={16.5} align="right"
      >
        {day}
      </Txt>
      <Txt
        x={252} y={38} w={32}
        size={10} weight="medium" font="inter" color={LABEL_INK} lineHeight={15} align="right"
      >
        {year}
      </Txt>
    </Abs>
  );
}

/* -------------------------------- team card ------------------------------- */
/** 301x78 glass row — the team header inside Teams & Roles. */
function TeamCard({
  top, name, members, active, onPress,
}: { top: number; name: string; members: number; active: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.teamCard, { top }, pressed && styles.pressed]}
    >
      {/* Background+Border — 44pt gradient disc with the team glyph */}
      <Abs x={17} y={17} w={44} h={44} radius={22} border="rgba(160,170,255,0.3)" borderWidth={1} center style={styles.clip}>
        <LinearGradient
          colors={["#c8d2ffcc", "#dccdffcc"] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        />
        <Feather name="briefcase" size={18} color="#5560cc" />
      </Abs>

      <Txt
        x={73} y={16.75} w={123}
        size={15} weight="semibold" font="inter" color={INK}
        lineHeight={22.5} letterSpacing={-0.38} numberOfLines={1}
      >
        {name}
      </Txt>
      <Txt
        x={73} y={42.25} w={123}
        size={12} weight="medium" font="inter" color={MUTED_40} lineHeight={18} numberOfLines={1}
      >
        {`${members} ${members === 1 ? "Member" : "Members"}`}
      </Txt>

      {/* Overlay+Border — active-count pill */}
      <Abs x={210} y={26} w={74} h={26} radius={13} bg={PILL_FILL} border={PILL_LINE} borderWidth={1}>
        <Abs x={10} y={10} w={6} h={6} radius={3} bg={PILL_DOT} />
        <Txt
          x={20} y={5} w={44}
          size={10} weight="medium" font="inter" color={PILL_INK} lineHeight={16} numberOfLines={1}
        >
          {`${active} Active`}
        </Txt>
      </Abs>
    </Pressable>
  );
}

/* ------------------------------- member row ------------------------------- */
/**
 * 301x74 glass row. The spec draws two variants — present and offline — which
 * differ only in fill, stroke, ink and the shape of the status pill.
 */
function MemberRow({
  top, name, role, online, avatarUrl, palette,
}: {
  top: number;
  name: string;
  role: string;
  online: boolean;
  avatarUrl?: string;
  palette: (typeof AVATARS)[number];
}) {
  return (
    <Abs
      x={ROW_X} y={top} w={ROW_W} h={MEMBER_H} radius={18}
      bg={online ? MEMBER_FILL : MEMBER_OFF_FILL}
      border={online ? LINE_85 : LINE_70}
      borderWidth={1}
      style={styles.memberShadow}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.avatar, !online && styles.dim]}
        />
      ) : (
        <LinearGradient
          colors={palette}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.avatar, !online && styles.dim]}
        />
      )}

      <Txt
        x={73} y={17} w={online ? 109 : 111}
        size={14} weight="semibold" font="inter" color={online ? INK : NAME_OFF_INK}
        lineHeight={21} letterSpacing={-0.35} numberOfLines={1}
      >
        {name}
      </Txt>
      <Txt
        x={73} y={40} w={online ? 109 : 111}
        size={11} weight="medium" font="inter" color={online ? MUTED_40 : MUTED_30}
        lineHeight={16.5} numberOfLines={1}
      >
        {role}
      </Txt>

      {online ? (
        <Abs x={194} y={24} w={58} h={26} radius={13} bg={PILL_FILL} border={PILL_LINE} borderWidth={1}>
          <Abs x={10} y={10} w={6} h={6} radius={3} bg={PILL_DOT} />
          <Txt
            x={20} y={5} w={31}
            size={10} weight="medium" font="inter" color={PILL_INK} lineHeight={16} numberOfLines={1}
          >
            Active
          </Txt>
        </Abs>
      ) : (
        <Abs x={196} y={24.5} w={56} h={25} radius={12.5} bg={OFF_PILL_FILL} border={OFF_PILL_LINE} borderWidth={1}>
          <Txt
            x={11} y={5} w={34}
            size={10} weight="bold" font="inter" color={LABEL_INK} lineHeight={15} numberOfLines={1}
          >
            Offline
          </Txt>
        </Abs>
      )}

      <Abs x={260} y={25} w={24} h={24} center>
        <Feather name="more-vertical" size={14} color={online ? KEBAB : KEBAB_OFF} />
      </Abs>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function PeopleOverview() {
  const router = useRouter();

  const { data: users = [], isLoading: loadingUsers } = useList<Person>("users");
  const { data: teams = [], isLoading: loadingTeams } = useList<Team>("teams");
  const { data: attendance = [] } = useList<AttendanceDay>("attendance");

  /**
   * The latest day on the register. User carries no active/inactive column, so
   * "present that day" is the honest reading of every Active pill on the screen.
   */
  const register = useMemo(() => {
    let latest = "";
    for (const a of attendance) if (a.date > latest) latest = a.date;

    const day = attendance.filter((a) => a.date === latest);
    const present = new Set<string>();
    const logins: number[] = [];
    for (const a of day) {
      if (!a.present) continue;
      present.add(a.userId);
      if (!a.loginAt) continue;
      const t = new Date(a.loginAt);
      logins.push(t.getHours() * 60 + t.getMinutes());
    }

    return {
      present,
      recorded: day.length,
      avgLogin: logins.length ? logins.reduce((s, m) => s + m, 0) / logins.length : null,
    };
  }, [attendance]);

  /** Roster by team, in the order GET /users returns it. */
  const byTeam = useMemo(() => {
    const map = new Map<string, Person[]>();
    for (const u of users) {
      if (!u.team) continue;
      const list = map.get(u.team.id);
      if (list) list.push(u);
      else map.set(u.team.id, [u]);
    }
    return map;
  }, [users]);

  /** Upcoming birthdays — empty until GET /users selects User.dateOfBirth. */
  const highlights = useMemo<Highlight[]>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const out: Highlight[] = [];

    for (const u of users) {
      if (!u.dateOfBirth) continue;
      const dob = new Date(u.dateOfBirth);
      if (Number.isNaN(dob.getTime())) continue;
      let next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      if (next < today) next = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
      out.push({
        id: u.id,
        name: u.name,
        day: `${two(dob.getDate())}/${two(dob.getMonth() + 1)}`,
        year: String(next.getFullYear()),
        due: Math.round((next.getTime() - today.getTime()) / 86_400_000),
      });
    }

    return out.sort((a, b) => a.due - b.due);
  }, [users]);

  const activeCount = users.filter((u) => register.present.has(u.id)).length;
  const attendanceRate =
    register.recorded > 0
      ? `${Math.round((register.present.size / register.recorded) * 100)}%`
      : "—";
  const clock = clockParts(register.avgLogin);

  /* ---- section 2: People Highlights, sized to its rows ---- */
  const hlRows = highlights.slice(0, MAX_HIGHLIGHTS);
  const hlSlots = Math.max(hlRows.length, 1); // the empty state occupies one slot
  const card2Y = CARD1_Y + CARD1_H + SECTION_GAP; // 403
  const card2H = BODY_DY + (hlSlots * HL_STEP - STACK_GAP) + PAD + STROKE; // 263 at 2

  /* ---- section 3: Teams & Roles, one block per team ---- */
  const card3Y = card2Y + card2H + SECTION_GAP; // 682
  const blockTop = card3Y + BODY_DY; // 768

  const blocks: { team: Team; members: Person[]; top: number; buttonY: number }[] = [];
  let cursor = blockTop;
  for (const team of teams) {
    const members = byTeam.get(team.id) ?? [];
    const slots = Math.max(Math.min(members.length, MAX_MEMBERS), 1);
    const buttonY = cursor + TEAM_H + STACK_GAP + slots * MEMBER_STEP;
    blocks.push({ team, members, top: cursor, buttonY });
    cursor = buttonY + VIEW_ALL_H + STACK_GAP;
  }
  const bodyBottom = blocks.length ? cursor - STACK_GAP : blockTop + TEAM_H;
  const card3H = bodyBottom - card3Y + PAD + STROKE; // 496.5 at one 3-member team

  const canvasH = Math.max(FRAME_H, card3Y + card3H + TAIL);

  return (
    <Screen height={canvasH} background={PAGE} scroll>
      {/* ============================ Frame 2147223268 ======================== */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16.2} color={BACK_ICON} />
      </Pressable>
      <Txt
        x={72} y={28} w={222}
        size={20} weight="medium" font="inter" color={HEAD_INK}
        lineHeight={24} letterSpacing={-0.6}
      >
        Team Management
      </Txt>

      {/* ================================ People ============================== */}
      <Abs
        x={CARD_X} y={CARD1_Y} w={CARD_W} h={CARD1_H} radius={28}
        bg={CARD_FILL} border={CARD_LINE} borderWidth={1} style={styles.cardShadow}
      />
      <Glow gid="glowPeople" x={210} y={CARD1_Y + 1} size={144} color="#d2cdff" opacity={0.38} />

      {/* HorizontalBorder — 48pt tile, section title, collapse caret */}
      <Abs x={41} y={122} w={48} h={48} radius={20} bg="#ccfbf1" center style={styles.tileShadow}>
        <Feather name="users" size={22} color="#159b7f" />
      </Abs>
      <Txt
        x={101} y={133.75} w={205}
        size={15} weight="semibold" font="inter" color={INK}
        lineHeight={22.5} letterSpacing={-0.38}
      >
        People
      </Txt>
      <Abs x={318} y={138} w={16} h={16} center>
        <Feather name="chevron-up" size={16} color={CHEVRON} />
      </Abs>
      <Abs x={21} y={186} w={333} h={1} bg={HEAD_RULE} />

      {/* Total Employees + the active pill */}
      <Txt
        x={41} y={203} w={121}
        size={11} weight="bold" font="inter" color={LABEL_INK}
        lineHeight={16.5} letterSpacing={1.1} style={styles.upper}
      >
        Total Employees
      </Txt>
      <Txt
        x={41} y={226} w={121}
        size={28} weight="semibold" font="inter" color={INK}
        lineHeight={28} letterSpacing={-0.7}
      >
        {users.length}
      </Txt>
      <Txt
        x={41} y={258} w={121}
        size={12} weight="medium" font="inter" color={SUB_INK} lineHeight={18}
      >
        Members
      </Txt>
      <Abs x={264} y={203} w={74} h={26} radius={13} bg={PILL_FILL} border={PILL_LINE} borderWidth={1}>
        <Abs x={10} y={10} w={6} h={6} radius={3} bg={PILL_DOT} />
        <Txt
          x={20} y={5} w={44}
          size={10} weight="medium" font="inter" color={PILL_INK} lineHeight={16} numberOfLines={1}
        >
          {`${activeCount} Active`}
        </Txt>
      </Abs>
      <Abs x={21} y={292} w={333} h={1} bg={STAT_RULE} />

      {/* 3-up stat row — two VerticalBorder rules split the three cells */}
      <Abs x={128.06} y={293} w={1} h={92} bg={STAT_RULE} />
      <Abs x={247.94} y={293} w={1} h={92} bg={STAT_RULE} />

      <Txt
        x={37} y={309} w={74.06} align="center"
        size={11} weight="bold" font="inter" color={LABEL_INK}
        lineHeight={16.5} letterSpacing={1.1} style={styles.upper}
      >
        Teams
      </Txt>
      <Txt
        x={37} y={334} w={74.06} align="center"
        size={26} weight="semibold" font="inter" color={INK} lineHeight={26} letterSpacing={-0.65}
      >
        {teams.length}
      </Txt>

      <Txt
        x={144.05} y={309} w={86.89} align="center"
        size={11} weight="bold" font="inter" color={LABEL_INK}
        lineHeight={16.5} letterSpacing={1.1} style={styles.upper}
      >
        Attendance
      </Txt>
      <Txt
        x={144.05} y={334} w={86.89} align="center"
        size={26} weight="semibold" font="inter" color={BLUE_INK} lineHeight={26} letterSpacing={-0.65}
      >
        {attendanceRate}
      </Txt>

      <Txt
        x={263.95} y={309} w={74.06} align="center"
        size={11} weight="bold" font="inter" color={LABEL_INK}
        lineHeight={16.5} letterSpacing={1.1} style={styles.upper}
      >
        Avg Login
      </Txt>
      <Txt
        x={263.95} y={334} w={74.06} align="center"
        size={16} weight="semibold" font="inter" color={INK} lineHeight={20} letterSpacing={-0.4}
      >
        {clock.value}
      </Txt>
      <Txt
        x={263.95} y={354} w={74.06} align="center"
        size={10} weight="medium" font="inter" color={LABEL_INK} lineHeight={15}
      >
        {clock.suffix}
      </Txt>

      {/* =========================== People Highlights ======================== */}
      <Abs
        x={CARD_X} y={card2Y} w={CARD_W} h={card2H} radius={28}
        bg={CARD_FILL} border={CARD_LINE} borderWidth={1} style={styles.cardShadow}
      />
      <Glow gid="glowHighlights" x={226} y={card2Y + 1} size={128} color="#ffd7e6" opacity={0.35} />
      <SectionHead
        top={card2Y}
        tile={HL_TILE}
        ink={HL_TILE_INK}
        glyph="party"
        title="People Highlights"
      />

      {hlRows.map((h, i) => (
        <HighlightRow
          key={h.id}
          top={card2Y + BODY_DY + i * HL_STEP}
          palette={HL_PALETTES[i % HL_PALETTES.length]}
          name={h.name}
          day={h.day}
          year={h.year}
        />
      ))}
      {hlRows.length === 0 ? (
        <Txt
          x={ROW_X + 20} y={card2Y + BODY_DY + 28} w={ROW_W - 40}
          size={13} weight="medium" font="inter" color={SUB_INK} lineHeight={18}
        >
          {loadingUsers ? "Loading people…" : "No birthdays on record"}
        </Txt>
      ) : null}

      {/* ============================ Teams & Roles =========================== */}
      <Abs
        x={CARD_X} y={card3Y} w={CARD_W} h={card3H} radius={28}
        bg={CARD_FILL} border={CARD_LINE} borderWidth={1} style={styles.cardShadow}
      />
      <Glow gid="glowTeams" x={226} y={card3Y + 1} size={128} color="#cddcff" opacity={0.4} />
      <SectionHead
        top={card3Y}
        tile={TEAMS_TILE}
        ink={TEAMS_TILE_INK}
        glyph="grid"
        title="Teams & Roles"
      />

      {blocks.map((b) => {
        const rows = b.members.slice(0, MAX_MEMBERS);
        const active = b.members.filter((m) => register.present.has(m.id)).length;
        return (
          <Fragment key={b.team.id}>
            <TeamCard
              top={b.top}
              name={b.team.name}
              members={b.members.length}
              active={active}
              onPress={() => router.push("/agency/people/team-roster")}
            />

            {rows.map((m, i) => (
              <MemberRow
                key={m.id}
                top={b.top + TEAM_H + STACK_GAP + i * MEMBER_STEP}
                name={m.name}
                role={roleLabel(m.role)}
                online={register.present.has(m.id)}
                avatarUrl={m.avatarUrl}
                palette={AVATARS[i % AVATARS.length]}
              />
            ))}
            {rows.length === 0 ? (
              <Txt
                x={ROW_X + 20} y={b.top + TEAM_H + STACK_GAP + 28} w={ROW_W - 40}
                size={13} weight="medium" font="inter" color={SUB_INK} lineHeight={18}
              >
                No members yet
              </Txt>
            ) : null}

            {/* Button — "View all N members" */}
            <Pressable
              onPress={() => router.push("/agency/people/team-roster")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.viewAll, { top: b.buttonY }, pressed && styles.pressed]}
            >
              <Abs x={0} y={12} w={ROW_W} h={21.5} row gap={8} center>
                <Txt
                  size={13} weight="semibold" font="inter" color={BTN_INK} lineHeight={19.5} align="center"
                >
                  {`View all ${b.members.length} members`}
                </Txt>
                <Feather name="chevron-right" size={14} color={BTN_CHEV} />
              </Abs>
            </Pressable>
          </Fragment>
        );
      })}
      {blocks.length === 0 ? (
        <Txt
          x={ROW_X + 20} y={blockTop + 30} w={ROW_W - 40}
          size={13} weight="medium" font="inter" color={SUB_INK} lineHeight={18}
        >
          {loadingTeams ? "Loading teams…" : "No teams yet"}
        </Txt>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  clip: { overflow: "hidden" },
  glow: { position: "absolute" },
  upper: { textTransform: "uppercase" },
  pressed: { opacity: 0.9 },
  dim: { opacity: 0.75 },

  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BACK_FILL,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },

  cardShadow: {
    shadowColor: "#826ec8",
    shadowOpacity: 0.09,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  tileShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  hlShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  memberShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  avatar: { position: "absolute", left: 17, top: 15, width: 44, height: 44, borderRadius: 22 },

  teamCard: {
    position: "absolute",
    left: ROW_X,
    width: ROW_W,
    height: TEAM_H,
    borderRadius: 20,
    backgroundColor: TEAM_FILL,
    borderWidth: 1,
    borderColor: LINE_90,
  },

  viewAll: {
    position: "absolute",
    left: ROW_X,
    width: ROW_W,
    height: VIEW_ALL_H,
    borderRadius: 18,
    backgroundColor: BTN_FILL,
    borderWidth: 1,
    borderColor: CARD_LINE,
  },
});
