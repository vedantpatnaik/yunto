import { Fragment, useMemo } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import {
  useCampaigns, useInvoices, useLeads, useList, useUsers, type User,
} from "../../../src/api/hooks";

/**
 * Team detail — Figma frame 7808:23677 "Operations" (375x876), traced 1:1.
 *
 * One team's dashboard: the header row, a 335x222 glass card holding the team
 * identity (gradient disc, name, member count, state switch) above a 311x103
 * KPI panel, then the "Members" heading with its "Add Members" pill and the
 * 335x70 member rows at y=387 stepping 86.
 *
 * ONE screen, three KPI configurations. Frames 7808:23677 (Operations),
 * 7751:7578 (Sales) and 7810:24305 (Sales + Operations) are the same card with
 * a different four-up strip, so the strip is data — `KPIS` below — and every
 * other coordinate comes from 7808:23677. Only the Operations set carries the
 * percentage caption and progress bar; the other two draw value + label alone,
 * exactly as their frames do. The Sales set keeps its frame's per-cell value
 * inks (#ff7e67 / #3a7de8 / #3e7d52), which are the only paints that differ.
 *
 * Team has no `type` column — TeamKind is SALES | OPERATIONS only — so a
 * combined team is read off its roster: a team carrying both SALES_* and OPS_*
 * members is the design's "Sales + Operations", otherwise Team.kind decides.
 *
 * The frame's decorative "Gradient" disc at (240.6,-57.6) carries no fill in
 * the spec, so it is not drawn — painting it would mean inventing a colour.
 * Geist is not loaded (see app/_layout.tsx); the header renders in Inter, which
 * is the frame's own body face. expo-blur is not a dependency, so the cards'
 * BACKGROUND_BLUR is rendered as its translucent fill alone.
 *
 * "Add Members" is pressable but inert: no add-member route exists yet and a
 * push to a path with no file fails silently.
 */

/* -------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

const CARD = { x: 20, y: 101, w: 335, h: 222 };

/** KPI strip: four cells inside the 311x103 panel, 71.25 apart. */
const PANEL = { x: 27, y: 203, w: 311, h: 103 };
const CELL_X = [44, 115.25, 186.5, 257.75];
const CELL_W = [54.25, 54.25, 54.25, 55.25];
const CELL_RULE_DX = 62.25; // VerticalBorder — 1pt right rule on cells 0-2
const CELL_TOP = 220;
const CELL_H = 69;

/** Member rows: 335x70 at x=20, first at y=387, stepping 86 (70 + 16 gap). */
const ROW_X = 20;
const ROW_W = 335;
const ROW_H = 70;
const ROW_Y0 = 387;
const ROW_STEP = 86;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE_BG = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";

const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const RULE_TOP = "rgba(226,232,240,0.5)"; // #e2e8f0 @ 50%
const RULE_CARD = "rgba(226,232,240,0.4)"; // #e2e8f0 @ 40%

const TITLE_INK = "#111111";
const META_INK = "#64748b";

const SWITCH_FILL = "#7c86ff";

const PANEL_FROM = "rgba(209,250,229,0.55)"; // #d1fae58c
const PANEL_TO = "rgba(187,247,208,0.30)"; // #bbf7d04d
const PANEL_LINE = GLASS_60;
const CELL_RULE = "#b9f8cf";
const KPI_INK = "#111111";
const KPI_PCT_INK = "#00a63e";
const BAR_TRACK = "#e5e7eb";

const CTA_FILL = "#111111";
const CTA_INK = "#f4f6f8";

/* --------------------------------- data ----------------------------------- */
/** GET /teams — the Prisma Team model, no relations eager-loaded. */
interface Team {
  id: string;
  name: string;
  kind: string;
}

/** GET /attendance — one row per user per day. */
interface AttendanceDay {
  id: string;
  userId: string;
  date: string;
  present: boolean;
}

/**
 * Which strip the card draws. Team.kind only knows SALES and OPERATIONS, so
 * "both" is derived from the roster — see `teamType` in the screen.
 */
type TeamType = "sales" | "operations" | "both";

/** Identity disc paints, one per team type, from each type's own frame. */
const PALETTES: Record<TeamType, { from: string; to: string; line: string; ink: string }> = {
  operations: { from: "#c7d2fe", to: "#e0e7ff", line: "#e0e7ff", ink: "#4f39f6" },
  sales: {
    from: "rgba(225,94,68,0.28)", to: "rgba(225,94,68,0.23)",
    line: "rgba(255,181,160,0.3)", ink: "#e15e44",
  },
  both: { from: "rgba(222,255,200,0.8)", to: "#e4f7db", line: "#d0ffb7", ink: "#79cb4c" },
};

/** One cell of the four-up strip. `pct`/`bar` are the Operations set only. */
interface Kpi {
  value: number;
  /** May carry a newline — the frame wraps "All Campaigns" and "All Leads". */
  label: string;
  labelW: number;
  ink: string;
  pct?: number;
  bar?: string;
}

/* ------------------------------ derivations ------------------------------- */
/** Row subtitle — the member's function, from User.role. */
const roleLabel = (role: string) => (role.startsWith("OPS") ? "Operations" : "Sales");

/**
 * Status pill paints, straight off the frame's two row variants. The dot and
 * label offsets are identical; only the pill origin and its widths differ.
 */
const STATUS = {
  active: {
    label: "Active", x: 227, w: 59, textW: 31,
    fill: "rgba(240,253,244,0.6)", line: "#7bf1a8", dot: "#05df72", ink: "#00a63e",
  },
  offline: {
    label: "Offline", x: 221, w: 65, textW: 32,
    fill: "rgba(241,245,249,0.4)", line: "#e2e8f0", dot: "#d1d5dc", ink: "#64748b",
  },
} as const;

type Status = keyof typeof STATUS;

/* -------------------------------- member row ------------------------------ */
interface RowProps {
  top: number;
  name: string;
  role: string;
  status: Status;
  avatarUrl?: string;
  onPress: () => void;
}

/** 335x70 glass row. Child offsets below are row-relative. */
function MemberRow({ top, name, role, status, avatarUrl, onPress }: RowProps) {
  const s = STATUS[status];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { top }, pressed && styles.pressed]}
    >
      {/* 44pt avatar — photo fill in the design, gradient stand-in without one */}
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <LinearGradient
          colors={["#c8d2ffcc", "#dccdffcc"] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        />
      )}

      <Txt
        x={73} y={17} w={142}
        size={14} weight="semibold" font="inter" color={TITLE_INK} lineHeight={20}
        numberOfLines={1}
      >
        {name}
      </Txt>
      <Txt
        x={73} y={37} w={142}
        size={12} font="inter" color={META_INK} lineHeight={16} numberOfLines={1}
      >
        {role}
      </Txt>

      {/* Overlay+Border — the presence pill */}
      <Abs
        x={s.x} y={22} w={s.w} h={26} radius={13}
        bg={s.fill} border={s.line} borderWidth={1}
      >
        <Abs x={10} y={10} w={6} h={6} radius={3} bg={s.dot} />
        <Txt
          x={20} y={5} w={s.textW}
          size={10} weight="medium" font="inter" color={s.ink} lineHeight={16}
          numberOfLines={1}
        >
          {s.label}
        </Txt>
      </Abs>

      {/* Row kebab — 20x16 button box */}
      <Abs x={298} y={27} w={20} h={16} center>
        <Feather name="more-vertical" size={16} color={META_INK} />
      </Abs>
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function TeamDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: teams = [] } = useList<Team>("teams");
  const { data: users = [], isLoading } = useUsers();
  const { data: attendance = [] } = useList<AttendanceDay>("attendance");
  const { data: campaigns = [] } = useCampaigns();
  const { data: invoices = [] } = useInvoices();
  const { data: leads = [] } = useLeads();

  /** The team this card is about — the pushed id, else the first on file. */
  const team = useMemo(
    () => teams.find((t) => t.id === id) ?? teams[0],
    [teams, id],
  );

  /** Roster = the Users whose team relation points at this row. */
  const members = useMemo<User[]>(
    () => (team ? users.filter((u) => u.team?.id === team.id) : []),
    [users, team],
  );

  /**
   * A roster carrying both functions is the design's "Sales + Operations"; a
   * single-function roster follows its members, and an empty one falls back to
   * Team.kind. Nothing here is invented — Role and TeamKind are both columns.
   */
  const teamType = useMemo<TeamType>(() => {
    const hasSales = members.some((m) => m.role.startsWith("SALES"));
    const hasOps = members.some((m) => m.role.startsWith("OPS"));
    if (hasSales && hasOps) return "both";
    if (hasOps) return "operations";
    if (hasSales) return "sales";
    return team?.kind === "OPERATIONS" ? "operations" : "sales";
  }, [members, team]);

  /**
   * "Active" — present on the latest attendance day on file. User has no
   * online flag, so attendance is the honest reading of the pill; everyone
   * else reads Offline.
   */
  const activeIds = useMemo(() => {
    let latest = "";
    for (const a of attendance) if (a.date > latest) latest = a.date;
    return new Set(
      attendance.filter((a) => a.present && a.date === latest).map((a) => a.userId),
    );
  }, [attendance]);

  /**
   * The four-up strip.
   *
   * Campaigns carry an agency, not a team, so the campaign cells are the whole
   * book — the design labels them "All Campaigns" for exactly that reason.
   * Leads do carry an owner, so lead cells are scoped to this team's members.
   * Every percentage is one metric: the cell's share of All Campaigns, which is
   * what the bar underneath fills to. "Successful" is a completed campaign
   * whose invoice is settled (Invoice.status PAID) — the only success signal
   * the schema has.
   */
  const kpis = useMemo<Kpi[]>(() => {
    const total = campaigns.length;
    const share = (n: number) => (total ? Math.round((n / total) * 100) : 0);

    const memberIds = new Set(members.map((m) => m.id));
    const teamLeads = leads.filter((l) => l.ownerId && memberIds.has(l.ownerId));
    const byStatus = (s: string) => teamLeads.filter((l) => l.status === s).length;

    if (teamType === "sales") {
      return [
        { value: teamLeads.length, label: "Leads", labelW: 54.25, ink: KPI_INK },
        { value: byStatus("NEW"), label: "Unattended", labelW: 62, ink: "#ff7e67" },
        { value: byStatus("CONTACTED"), label: "Contacted", labelW: 54.25, ink: "#3a7de8" },
        { value: byStatus("CONVERTED"), label: "Converted", labelW: 55.25, ink: "#3e7d52" },
      ];
    }

    if (teamType === "both") {
      return [
        { value: total, label: "All\nCampaigns", labelW: 59, ink: KPI_INK },
        { value: teamLeads.length, label: "All\nLeads", labelW: 59, ink: KPI_INK },
        { value: byStatus("NEW"), label: "Unattended", labelW: 62, ink: KPI_INK },
        { value: byStatus("CONTACTED"), label: "Contacted", labelW: 55.25, ink: KPI_INK },
      ];
    }

    const done = campaigns.filter((c) => c.status === "DONE");
    const ongoing = campaigns.filter((c) => c.status === "ACTIVE").length;
    const paid = new Set(
      invoices.filter((i) => i.status === "PAID").map((i) => i.campaignId),
    );
    const successful = done.filter((c) => paid.has(c.id)).length;

    return [
      { value: total, label: "All\nCampaigns", labelW: 59, ink: KPI_INK },
      {
        value: done.length, label: "Completed", labelW: 54.25, ink: KPI_INK,
        pct: share(done.length), bar: "#34d399",
      },
      {
        value: ongoing, label: "Ongoing", labelW: 54.25, ink: KPI_INK,
        pct: share(ongoing), bar: "#a3e635",
      },
      {
        value: successful, label: "Successful", labelW: 55.25, ink: KPI_INK,
        pct: share(successful), bar: "#4ade80",
      },
    ];
  }, [teamType, campaigns, invoices, leads, members]);

  const palette = PALETTES[teamType];

  /** The page grows with the roster; the frame's own six rows end at 887. */
  const height = Math.max(
    FRAME_H,
    ROW_Y0 + Math.max(members.length - 1, 0) * ROW_STEP + ROW_H + 20,
  );

  return (
    <Screen height={height} background={PAGE_BG} scroll>
      {/* -------------------------------- Header ----------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={16} color={BACK_ICON} />
      </Pressable>
      <Txt
        x={72} y={28} w={222}
        size={20} weight="medium" font="inter" color={HEAD_INK}
        lineHeight={24} letterSpacing={-0.6}
      >
        Team
      </Txt>
      <Abs x={20} y={80} w={335} h={1} bg={RULE_TOP} />

      {/* ---------------------------- Team identity card --------------------- */}
      <Abs
        x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} radius={24}
        bg={GLASS_60} border={GLASS_80} borderWidth={1} style={styles.cardShadow}
      />

      {/* 48pt gradient disc + the briefcase glyph, tinted per team type */}
      <Abs
        x={41} y={122} w={48} h={48} radius={24}
        border={palette.line} borderWidth={1} center style={styles.clip}
      >
        <LinearGradient
          colors={[palette.from, palette.to] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        />
        <Feather name="briefcase" size={20} color={palette.ink} />
      </Abs>

      <Txt
        x={101} y={126} w={173}
        size={16} weight="semibold" font="inter" color={TITLE_INK} lineHeight={24}
        numberOfLines={1}
      >
        {team?.name ?? (isLoading ? "Loading…" : "No team")}
      </Txt>
      <Txt
        x={101} y={150} w={173}
        size={12} font="inter" color={META_INK} lineHeight={16} numberOfLines={1}
      >
        {`${members.length} ${members.length === 1 ? "Member" : "Members"}`}
      </Txt>

      {/* Background+Shadow — the team state switch, on. No column backs it, so
          it is drawn as the design draws it and left inert. */}
      <Abs x={286} y={134} w={48} h={24} radius={12} bg={SWITCH_FILL}>
        <Abs x={28} y={4} w={16} h={16} radius={8} bg="#ffffff" />
      </Abs>

      <Abs x={41} y={186} w={293} h={1} bg={RULE_CARD} />

      {/* ------------------------------- KPI strip --------------------------- */}
      <Abs
        x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} radius={24}
        border={PANEL_LINE} borderWidth={1} style={styles.clip}
      >
        <LinearGradient
          colors={[PANEL_FROM, PANEL_TO] as const}
          start={{ x: 0.17, y: 0 }}
          end={{ x: 0.83, y: 1 }}
          style={styles.fill}
        />
      </Abs>

      {kpis.map((k, i) => (
        <Fragment key={k.label}>
          <Txt
            x={CELL_X[i]} y={CELL_TOP} w={CELL_W[i]}
            size={18} weight="bold" font="inter" color={k.ink} lineHeight={18}
          >
            {String(k.value)}
          </Txt>
          <Txt
            x={CELL_X[i]} y={242} w={k.labelW}
            size={10} font="inter" color={META_INK} lineHeight={15}
          >
            {k.label}
          </Txt>

          {k.pct !== undefined ? (
            <Fragment>
              <Txt
                x={CELL_X[i]} y={261} w={CELL_W[i]}
                size={12} weight="semibold" font="inter" color={KPI_PCT_INK} lineHeight={16}
              >
                {`${k.pct}%`}
              </Txt>
              <Abs x={CELL_X[i]} y={285} w={CELL_W[i]} h={4} radius={2} bg={BAR_TRACK}>
                <Abs w={(CELL_W[i] * k.pct) / 100} h={4} radius={2} bg={k.bar} />
              </Abs>
            </Fragment>
          ) : null}

          {/* VerticalBorder — 1pt rule between cells */}
          {i < kpis.length - 1 ? (
            <Abs x={CELL_X[i] + CELL_RULE_DX} y={CELL_TOP} w={1} h={CELL_H} bg={CELL_RULE} />
          ) : null}
        </Fragment>
      ))}

      {/* ------------------------------- Members ----------------------------- */}
      <Txt
        x={20} y={345} w={74}
        size={16} weight="semibold" font="inter" color={TITLE_INK} lineHeight={24}
      >
        Members
      </Txt>
      <Pressable style={({ pressed }) => [styles.addMembers, pressed && styles.pressed]}>
        <Txt
          x={12} y={6} w={81}
          size={12} weight="medium" font="inter" color={CTA_INK} lineHeight={16}
          align="center"
        >
          Add Members
        </Txt>
      </Pressable>

      {members.map((m, i) => (
        <MemberRow
          key={m.id}
          top={ROW_Y0 + i * ROW_STEP}
          name={m.name}
          role={roleLabel(m.role)}
          status={activeIds.has(m.id) ? "active" : "offline"}
          avatarUrl={m.avatarUrl}
          onPress={() =>
            router.push({ pathname: "/people/team-member-detail", params: { id: m.id } })
          }
        />
      ))}
      {/* Loading and empty both sit in the first row slot — geometry unchanged. */}
      {members.length === 0 ? (
        <Txt
          x={ROW_X + 16} y={ROW_Y0 + 27} w={ROW_W - 32}
          size={14} font="inter" color={META_INK} lineHeight={20}
        >
          {isLoading ? "Loading members…" : "No members yet"}
        </Txt>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },

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
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  addMembers: {
    position: "absolute",
    left: 250,
    top: 343,
    width: 105,
    height: 28,
    borderRadius: 14,
    backgroundColor: CTA_FILL,
  },

  // 40 in the spec on a 70pt box; clamped to h/2 so both platforms agree.
  row: {
    position: "absolute",
    left: ROW_X,
    width: ROW_W,
    height: ROW_H,
    borderRadius: 35,
    backgroundColor: GLASS_60,
    borderWidth: 1,
    borderColor: GLASS_80,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  avatar: {
    position: "absolute",
    left: 17,
    top: 13,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
});
