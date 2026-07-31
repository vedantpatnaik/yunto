import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import {
  useCampaigns,
  useCreators,
  useInvoices,
  useLeads,
  useLeaves,
  useMe,
  useNotifications,
  useReminders,
  useUpdate,
  useUsers,
  type Lead,
  type Reminder,
  type User,
} from "../../../src/api/hooks";

/**
 * Home — Admin / Owner — Figma 7846:36664 "admin home" (375x2796).
 *
 * The operator dashboard. Content is the sales home superset: header, presence
 * pill, new-leads alert, the 2x2 Lead Matrix, then — and this is the section
 * only the admin/owner build carries — the 335x380 Team Glance panel at y=669,
 * followed by Performance, Total Revenue, Monthly Target, Top Creators, Explore
 * Services, Reminders and Recent Activity, with the floating tab bar last.
 *
 * The frame is an unclipped 2796pt canvas on a 375x876 viewport, so the whole
 * thing scrolls in design space; <Screen> scales the 375pt canvas to the device
 * and every coordinate below is a raw frame coordinate lifted from the spec.
 *
 * Type: the frame sets its headings in Geist, which is not one of the two faces
 * registered in app/_layout.tsx, so — as every other agency frame does — those
 * nodes render in Inter. expo-blur is not a dependency either, so the spec's
 * BACKGROUND_BLUR layers render as their translucent fills alone.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 2796;

/** Team Glance — panel at (15,669,335x380); rows step 112 inside it. */
const GLANCE_ROW_Y = 776;
const GLANCE_ROW_STEP = 112;
/** The panel draws two rows above its footer button, so two is what fits. */
const GLANCE_ROWS = 2;

const CREATOR_ROW_Y = 1669;
const CREATOR_ROW_STEP = 82; // 74 card + 8 gap
const CREATOR_ROWS = 2; // 335x174 container at y=1660 holds two

const REMINDER_ROW_Y = 2125;
const REMINDER_ROW_STEP = 72; // 64 card + 8 gap
const REMINDER_ROWS = 2; // 335x136 container at y=2125

const ACTIVITY_ROW_Y = 2355;
const ACTIVITY_ROW_STEP = 79.75;
const ACTIVITY_ROWS = 3; // 335x273.25 container at y=2335

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const INK = "#1e1e1e";
const INK_STRONG = "#111111";
const SLATE = "#64748b";
const GREEN = "#00a63e";
const DOT_GREEN = "#05df72";
const DOT_GREY = "#d1d5dc";
const DARK = "#1f1a17";
const DARK_ALT = "#312b28";
const ICON_ON_DARK = "#f1eee8";
const BADGE = "#ffcdea";
const GLANCE_META = "#787274";
const TOGGLE_ON_INK = "#f4f6f8";

const INK_80 = "rgba(30,30,30,0.8)";
const INK_70 = "rgba(30,30,30,0.7)";
const INK_60 = "rgba(30,30,30,0.6)";
const INK_50 = "rgba(30,30,30,0.5)";
const INK_40 = "rgba(30,30,30,0.4)";
const TIMELINE = "rgba(30,30,30,0.1)";

const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";

/* ------------------------------ derivations ------------------------------- */
const DAY = 86_400_000;
const HOUR = 3_600_000;
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const pad2 = (n: number) => String(n).padStart(2, "0");
const clampPct = (n: number) => (n > 100 ? 100 : n < 0 ? 0 : n);

/**
 * Every money figure on this frame is set in thousands — "8,400k", "42k",
 * "42.8k / 50.0k" — so one formatter covers the whole screen.
 */
function k(n: number, dp = 0): string {
  return `${(n / 1000).toLocaleString("en-IN", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })}k`;
}

/**
 * The four pipeline buckets the matrix draws. LeadStatus has no UNATTENDED or
 * WON member, so both are derived exactly as the Leads screen derives them:
 * CONVERTED is the win, and a NEW lead untouched for a day is unattended. DEAD
 * leads have left the pipeline and are not counted.
 */
type Bucket = "UNATTENDED" | "NEW" | "CONTACTED" | "WON";

const STALE = 24 * HOUR;

function bucketOf(lead: Lead, now: number): Bucket | null {
  if (lead.status === "CONVERTED") return "WON";
  if (lead.status === "CONTACTED" || lead.status === "CONNECTED") return "CONTACTED";
  if (lead.status !== "NEW") return null;
  const touched = lead.updatedAt ? new Date(lead.updatedAt).getTime() : now;
  return now - touched > STALE ? "UNATTENDED" : "NEW";
}

/** Role, as the header's second line spells it out. */
function roleLabel(role: string | undefined): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Owner";
    case "SALES_MANAGER":
    case "OPS_MANAGER":
      return "Manager";
    case "SALES_EMPLOYEE":
      return "Sales";
    case "OPS_EMPLOYEE":
      return "Operations";
    default:
      return "Manager";
  }
}

/** "2H AGO" / "YESTERDAY" — the activity timeline's uppercase stamp. */
function agoUpper(iso: string, now: number): string {
  const mins = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${Math.max(mins, 1)}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  if (hrs < 48) return "YESTERDAY";
  return `${Math.floor(hrs / 24)}D AGO`;
}

/** "Due today at 5 PM", or "Due 4 Aug at 5 PM" once it is not today. */
function dueLabel(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes();
  const clock = `${h}${m ? `:${pad2(m)}` : ""} ${d.getHours() >= 12 ? "PM" : "AM"}`;
  return d.toDateString() === new Date().toDateString()
    ? `Due today at ${clock}`
    : `Due ${d.getDate()} ${MONTHS[d.getMonth()]} at ${clock}`;
}

/* ----------------------------- lead matrix -------------------------------- */
interface Cell {
  key: Bucket;
  label: string;
  x: number;
  y: number;
  w: number;
  bg: string;
}

const MATRIX: Cell[] = [
  { key: "UNATTENDED", label: "Unattended", x: 15, y: 352, w: 171.5, bg: "#fef0f4" },
  { key: "NEW", label: "New Leads", x: 195, y: 352, w: 165, bg: "#e2ebe2" },
  { key: "CONTACTED", label: "Contacted", x: 15, y: 498, w: 171.5, bg: "#e8f3ff" },
  { key: "WON", label: "Won", x: 195, y: 498, w: 165, bg: "#e9e1ff" },
];

/* ----------------------------- team glance -------------------------------- */
type Range = "D" | "W" | "M";

const RANGE_DAYS: Record<Range, number> = { D: 1, W: 7, M: 30 };

const RANGE_SEG: { key: Range; x: number; w: number; tx: number }[] = [
  { key: "D", x: 223.97, w: 29, tx: 233.97 },
  { key: "W", x: 256.97, w: 33, tx: 266.97 },
  { key: "M", x: 293.97, w: 31, tx: 303.97 },
];

/** The two row tints the panel draws, keyed by the team's kind. */
const TEAM_TINT: Record<string, string> = {
  SALES: "rgba(224,231,255,0.3)",
  OPERATIONS: "rgba(209,250,229,0.2)",
};

interface GlanceTeam {
  id: string;
  name: string;
  kind: string;
  members: number;
  active: number;
  absent: number;
  metrics: string[];
}

/** Activity dot tints, by notification kind — the three the timeline draws. */
const ACTIVITY_TINT: Record<string, string> = {
  SYSTEM: "#e8e2d9",
  LEAD: "#e6e1f9",
  CAMPAIGN: "#fcf4d9",
  CONTRACT: "#e6e1f9",
  INVOICE: "#fcf4d9",
  LEAVE: "#e8e2d9",
  MESSAGE: "#e6e1f9",
  REMINDER: "#e8e2d9",
};

/* ------------------------------- fragments -------------------------------- */
/** Pill chip in a Team Glance row — its width follows its label, as designed. */
function Chip({ x, y, label, faded }: { x: number; y: number; label: string; faded: boolean }) {
  return (
    <Abs x={x} y={y} h={26} radius={9999} bg={faded ? GLASS_70 : "#ffffff"} style={styles.chip}>
      <Txt size={12} weight="medium" font="inter" color={INK_STRONG} lineHeight={16}>
        {label}
      </Txt>
    </Abs>
  );
}

/**
 * One 293-wide Team Glance row. The design draws its first card 4pt taller
 * than the second and tops the content out 4pt lower to match, so the inset
 * follows the card height rather than being hard-coded per row.
 */
function TeamRow({ team, index }: { team: GlanceTeam; index: number }) {
  const top = GLANCE_ROW_Y + index * GLANCE_ROW_STEP;
  const h = index === 0 ? 100 : 96;
  const pad = index === 0 ? 17 : 13;
  return (
    <>
      <Abs x={36} y={top} w={293} h={h} radius={24} bg={TEAM_TINT[team.kind] ?? TEAM_TINT.SALES} />
      <Txt
        x={53} y={top + pad} w={140}
        size={14} weight="semibold" font="inter" color={INK_STRONG} lineHeight={20}
        numberOfLines={1}
      >
        {team.name}
      </Txt>
      <Txt
        x={53} y={top + pad + 20} w={140}
        size={12} weight="regular" font="inter" color={SLATE} lineHeight={16}
      >
        {`${team.members} Members`}
      </Txt>
      {/* Both counters are right-aligned in the design: 253 and 312. */}
      <Txt
        x={173} y={top + pad + 10} w={80} align="right"
        size={12} weight="medium" font="inter" color={GREEN} lineHeight={16}
      >
        {`${team.active} Active`}
      </Txt>
      <Txt
        x={232} y={top + pad + 10} w={80} align="right"
        size={12} weight="regular" font="inter" color={SLATE} lineHeight={16}
      >
        {`${team.absent} Absent`}
      </Txt>
      {team.metrics.map((m, i) => (
        <Chip key={m + i} x={53 + i * 76} y={top + pad + 44} label={m} faded={i === 0} />
      ))}
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function HomeAdmin() {
  const router = useRouter();
  const [present, setPresent] = useState(true);
  const [range, setRange] = useState<Range>("D");

  const { data: me } = useMe();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: users = [] } = useUsers();
  const { data: leaves = [] } = useLeaves();
  const { data: campaigns = [] } = useCampaigns();
  const { data: invoices = [] } = useInvoices();
  const { data: creators = [], isLoading: creatorsLoading } = useCreators();
  const { data: reminders = [], isLoading: remindersLoading } = useReminders();
  const { data: notifications } = useNotifications();
  const updateReminder = useUpdate<Reminder>("reminders");

  const now = Date.now();

  /* Pipeline buckets — the matrix, the alert count and the "% active" caption. */
  const { counts, activePct } = useMemo(() => {
    const tally: Record<Bucket, number> = { UNATTENDED: 0, NEW: 0, CONTACTED: 0, WON: 0 };
    let live = 0;
    for (const lead of leads) {
      const bucket = bucketOf(lead, now);
      if (!bucket) continue;
      tally[bucket] += 1;
      live += 1;
    }
    return {
      counts: tally,
      activePct: leads.length > 0 ? Math.round((live / leads.length) * 100) : 0,
    };
  }, [leads, now]);

  /**
   * Revenue is the agency's own cut — Invoice.agencyFee — banked in the month.
   * The card's "+x% vs last month" chip and the Performance pair read the same
   * two windows, so both sections always agree.
   */
  const { thisMonth, lastMonth } = useMemo(() => {
    const d = new Date();
    const startThis = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const startLast = new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime();
    let cur = 0;
    let prev = 0;
    for (const inv of invoices) {
      const t = inv.createdAt ? new Date(inv.createdAt).getTime() : 0;
      if (t >= startThis) cur += inv.agencyFee;
      else if (t >= startLast) prev += inv.agencyFee;
    }
    return { thisMonth: cur, lastMonth: prev };
  }, [invoices]);

  const deltaPct = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
  const target = me?.targetMonthly ?? 0;
  const targetPct = target > 0 ? clampPct((thisMonth / target) * 100) : 0;
  const daysLeft = useMemo(() => {
    const d = new Date();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return end - d.getDate();
  }, []);

  /**
   * Team Glance. Teams come from the roster's User.team relation; a member is
   * absent when an APPROVED leave spans today, active otherwise — Attendance is
   * not exposed to the client, and Leave is. The chips are the range-windowed
   * pipeline for a sales team (new / contacted / won leads its members own) and
   * the live campaign load for an operations team, which is the work that side
   * actually carries.
   */
  const teams = useMemo<GlanceTeam[]>(() => {
    const since = now - RANGE_DAYS[range] * DAY;
    const grouped = new Map<string, { name: string; kind: string; members: User[] }>();
    for (const u of users) {
      if (!u.team) continue;
      const row = grouped.get(u.team.id) ?? { name: u.team.name, kind: u.team.kind, members: [] };
      row.members.push(u);
      grouped.set(u.team.id, row);
    }

    const onLeave = new Set(
      leaves
        .filter(
          (l) =>
            l.status === "APPROVED" &&
            new Date(l.from).getTime() <= now &&
            new Date(l.to).getTime() >= now,
        )
        .map((l) => l.userId),
    );

    const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;

    return [...grouped.entries()]
      // Sales first, then operations — the order the panel stacks them in.
      .sort((a, b) => (a[1].kind === b[1].kind ? 0 : a[1].kind === "SALES" ? -1 : 1))
      .map(([id, row]) => {
        const ids = new Set(row.members.map((m) => m.id));
        const absent = row.members.filter((m) => onLeave.has(m.id)).length;
        const owned = leads.filter(
          (l) =>
            !!l.ownerId &&
            ids.has(l.ownerId) &&
            (l.createdAt ? new Date(l.createdAt).getTime() : 0) >= since,
        );
        const metrics =
          row.kind === "OPERATIONS"
            ? [`${activeCampaigns} Campaigns`]
            : (["NEW", "CONTACTED", "WON"] as Bucket[]).map(
                (b) => `${owned.filter((l) => bucketOf(l, now) === b).length} Leads`,
              );
        return {
          id,
          name: row.name,
          kind: row.kind,
          members: row.members.length,
          active: row.members.length - absent,
          absent,
          metrics,
        };
      })
      .slice(0, GLANCE_ROWS);
  }, [users, leaves, leads, campaigns, range, now]);

  const topCreators = useMemo(
    () => [...creators].sort((a, b) => b.engagementRate - a.engagementRate).slice(0, CREATOR_ROWS),
    [creators],
  );

  const reminderRows = useMemo(
    () =>
      [...reminders]
        // Outstanding work first, then by due date — what the two cards show.
        .sort((a, b) => {
          if (a.done !== b.done) return a.done ? 1 : -1;
          return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
        })
        .slice(0, REMINDER_ROWS),
    [reminders],
  );

  const activity = (notifications?.items ?? []).slice(0, ACTIVITY_ROWS);
  const unread = notifications?.unreadCount ?? 0;
  const newLeads = counts.NEW;

  const fillW = Math.min(249, (251 * targetPct) / 100);

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* Frame gradient — a 256pt blush wash over the warm page fill. */}
      <Abs x={0} y={0} w={FRAME_W} h={256}>
        <LinearGradient
          colors={["rgba(249,228,232,0.2)", "rgba(249,228,232,0)"] as const}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fill}
        />
      </Abs>

      {/* ============================== header =============================== */}
      <Abs x={20} y={58} w={48} h={48} radius={24} style={styles.clip}>
        <LinearGradient
          colors={["#f6d64a", "#f7b7da", "#bfd3ff"] as const}
          locations={[0, 0.5, 1] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        />
        {me?.avatarUrl ? <Image source={{ uri: me.avatarUrl }} style={styles.avatar} /> : null}
      </Abs>
      <Txt
        x={80} y={56} w={175}
        size={24} weight="medium" font="inter" color={INK} lineHeight={32} letterSpacing={-0.6}
        numberOfLines={1}
      >
        {me?.name ?? "—"}
      </Txt>
      <Txt
        x={80} y={88} w={175}
        size={14} weight="light" font="inter" color={INK_60} lineHeight={20} letterSpacing={-0.35}
      >
        {roleLabel(me?.role)}
      </Txt>

      {/* Mail button — no messaging route exists yet, so it is chrome, not a link. */}
      <Abs x={267} y={62} w={40} h={40} radius={20} bg={DARK} center>
        <Feather name="mail" size={20} color={ICON_ON_DARK} />
      </Abs>
      <Pressable
        onPress={() => router.push("/agency/profile/notifications")}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        style={({ pressed }) => [styles.bell, pressed && styles.pressed]}
      >
        <Feather name="bell" size={20} color={ICON_ON_DARK} />
      </Pressable>
      {unread > 0 ? <Abs x={342} y={63} w={12} h={12} radius={6} bg={BADGE} /> : null}

      {/* ============================ presence pill ========================== */}
      <Abs x={20} y={137.5} w={335} h={42} radius={21} bg={GLASS_40} />
      <Abs x={37} y={153.5} w={10} h={10} radius={5} bg={present ? DOT_GREEN : DOT_GREY} />
      <Txt x={57} y={147.75} size={13} weight="medium" font="inter" color={INK_80} lineHeight={19.5}>
        {present ? "Active" : "Away"}
      </Txt>
      <Pressable
        onPress={() => setPresent((v) => !v)}
        accessibilityRole="switch"
        accessibilityState={{ checked: present }}
        style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
      >
        <Abs x={present ? 20 : 4} y={4} w={12} h={12} radius={6} bg={PAGE} />
      </Pressable>

      {/* ========================== new-leads alert ========================== */}
      <Pressable
        onPress={() => router.push("/agency/leads/leads-list")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.alert, pressed && styles.pressed]}
      >
        {/* Soft mint bloom, clipped by the card exactly as the spec draws it. */}
        <Abs x={254} y={-15} w={96} h={96} radius={48} bg="rgba(212,226,212,0.3)" />
        <Abs x={21} y={21.75} w={40} h={40} radius={20} bg={GLASS_50} center>
          <MaterialCommunityIcons name="creation" size={20} color={INK} />
        </Abs>
        <Txt
          x={77} y={21} w={197}
          size={16} weight="medium" font="inter" color={INK} lineHeight={24}
          numberOfLines={1}
        >
          {`${newLeads} new lead${newLeads === 1 ? "" : "s"} waiting`}
        </Txt>
        <Txt x={77} y={46.5} w={160} size={12} weight="regular" font="inter" color={INK_70} lineHeight={16}>
          Tap to review pipeline
        </Txt>
        <Abs x={282} y={25.75} w={32} h={32} radius={16} bg={DARK} center>
          <Feather name="arrow-right" size={16} color={ICON_ON_DARK} />
        </Abs>
      </Pressable>

      {/* ============================ Lead Matrix ============================ */}
      <Txt
        x={19} y={303} w={200}
        size={22} weight="medium" font="inter" color={INK} lineHeight={33} letterSpacing={-0.55}
      >
        Lead Matrix
      </Txt>
      <Pressable
        onPress={() => router.push("/agency/leads/leads-list")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.matrixSeeAll, pressed && styles.pressed]}
      >
        <Txt size={14} weight="semibold" font="inter" color={INK_60} lineHeight={20}>
          See all
        </Txt>
      </Pressable>

      {MATRIX.map((cell) => {
        const caption =
          cell.key === "UNATTENDED"
            ? "Needs response"
            : cell.key === "CONTACTED"
              ? `${activePct}% active`
              : null;
        return (
          <Abs key={cell.key} x={cell.x} y={cell.y} w={cell.w} h={130} radius={24} bg={cell.bg}>
            <Txt
              x={21} y={21} w={cell.w - 42}
              size={12} weight="semibold" font="inter" color={INK_60} lineHeight={16}
            >
              {cell.label}
            </Txt>
            <Txt
              x={21} y={56} w={cell.w - 42}
              size={24} weight="bold" font="inter" color={INK} lineHeight={32}
            >
              {leadsLoading ? "—" : pad2(counts[cell.key])}
            </Txt>
            {caption ? (
              <Txt
                x={21} y={92} w={cell.w - 42}
                size={11} weight="medium" font="inter" color={INK_60} lineHeight={16.5}
              >
                {caption}
              </Txt>
            ) : null}
          </Abs>
        );
      })}

      {/* ===================== Team Glance — admin only ====================== */}
      <Abs x={15} y={669} w={335} h={380} radius={24} bg={GLASS_55} />
      <Txt x={36} y={686} w={160} size={16} weight="semibold" font="inter" color={INK_STRONG} lineHeight={24}>
        Team Glance
      </Txt>
      <Txt x={36} y={710} w={160} size={12} weight="regular" font="inter" color={GLANCE_META} lineHeight={16}>
        {`Total Members: ${users.length}`}
      </Txt>

      {/* D / W / M range switch */}
      <Abs x={218.97} y={691} w={111} h={30} radius={9999} bg={GLASS_60} />
      {RANGE_SEG.map((seg) => {
        const on = seg.key === range;
        return (
          <Pressable
            key={seg.key}
            onPress={() => setRange(seg.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[
              styles.rangeSeg,
              { left: seg.x, width: seg.w },
              on ? styles.rangeSegOn : null,
            ]}
          >
            <Txt size={12} weight="semibold" font="inter" color={on ? TOGGLE_ON_INK : SLATE} lineHeight={16}>
              {seg.key}
            </Txt>
          </Pressable>
        );
      })}

      {/* Legend */}
      <Abs x={36} y={738} w={73} h={26} radius={9999} bg="rgba(240,253,244,0.6)" />
      <Abs x={49} y={748} w={6} h={6} radius={3} bg={DOT_GREEN} />
      <Txt x={59} y={743} size={12} weight="medium" font="inter" color={GREEN} lineHeight={16}>
        Active
      </Txt>
      <Abs x={117} y={738} w={78} h={26} radius={9999} bg="rgba(241,245,249,0.4)" />
      <Abs x={130} y={748} w={6} h={6} radius={3} bg={DOT_GREY} />
      <Txt x={140} y={743} size={12} weight="medium" font="inter" color={SLATE} lineHeight={16}>
        Absent
      </Txt>

      {teams.map((team, i) => (
        <TeamRow key={team.id} team={team} index={i} />
      ))}
      {teams.length === 0 ? (
        <Txt
          x={53} y={GLANCE_ROW_Y + 17} w={259}
          size={12} weight="regular" font="inter" color={SLATE} lineHeight={16}
        >
          No teams on the roster yet
        </Txt>
      ) : null}

      <Pressable
        onPress={() => router.push("/agency/people/people-overview")}
        accessibilityRole="button"
        accessibilityLabel="Open people overview"
        style={({ pressed }) => [styles.glanceCta, pressed && styles.pressed]}
      >
        <Feather name="arrow-right" size={14} color={ICON_ON_DARK} />
      </Pressable>

      {/* ============================ Performance ============================ */}
      <Txt
        x={24} y={1067} w={200}
        size={22} weight="medium" font="inter" color={INK} lineHeight={33} letterSpacing={-0.55}
      >
        Performance
      </Txt>
      <Abs x={20} y={1116} w={161.5} h={130} radius={24} bg="#f6f3e6">
        <Txt x={21} y={21} w={119.5} size={12} weight="semibold" font="inter" color={INK_60} lineHeight={16}>
          This Month{" "}
        </Txt>
        <Txt x={21} y={56} w={119.5} size={24} weight="bold" font="inter" color={INK} lineHeight={32}>
          {k(thisMonth)}
        </Txt>
        <Txt x={21} y={92} w={119.5} size={11} weight="medium" font="inter" color={INK_60} lineHeight={16.5}>
          Expected this week
        </Txt>
      </Abs>
      <Abs x={193.5} y={1116} w={161.5} h={130} radius={24} bg="#e4ecf4">
        <Txt x={21} y={21} w={119.5} size={12} weight="semibold" font="inter" color={INK_60} lineHeight={16}>
          Last Month
        </Txt>
        <Txt x={21} y={56} w={119.5} size={24} weight="bold" font="inter" color={INK} lineHeight={32}>
          {k(lastMonth)}
        </Txt>
      </Abs>

      {/* ==================== TOTAL REVENUE + MONTHLY TARGET ================= */}
      <Abs x={20} y={1269} w={335} h={314} radius={32} bg="#f2eff6" style={styles.clip}>
        {/* Two blurred blooms; without expo-blur they are their flat fills. */}
        <Abs x={-39} y={160.5} w={192} h={192} radius={96} bg={GLASS_50} />
        <Abs x={206} y={1} w={128} h={128} radius={64} bg="#f2eff6" />

        <Abs x={25} y={25} w={28} h={28} radius={14} bg={GLASS_50} center>
          <Feather name="dollar-sign" size={14} color={INK} />
        </Abs>
        <Txt
          x={61} y={30.5} w={140}
          size={11} weight="bold" font="inter" color={INK_60} lineHeight={16.5} letterSpacing={1.1}
        >
          TOTAL REVENUE
        </Txt>
        <Txt
          x={25} y={61} w={182.62}
          size={44} weight="bold" font="inter" color={INK} lineHeight={44} letterSpacing={-1.1}
        >
          {k(thisMonth)}
        </Txt>

        {/* Delta chip */}
        <Abs x={25} y={117} w={182.62} h={34} radius={17} bg={GLASS_80} />
        <Abs x={38} y={124} w={20} h={20} radius={10} bg="#bee3b0" center>
          <Feather name={deltaPct >= 0 ? "arrow-up-right" : "arrow-down-right"} size={12} color={INK} />
        </Abs>
        <Txt x={64} y={123.25} size={13} weight="bold" font="inter" color={INK} lineHeight={19.5}>
          {`${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}%`}
        </Txt>
        <Abs x={120.95} y={126.5} w={1} h={15} bg={TIMELINE} />
        <Txt x={129.95} y={126.5} size={10} weight="semibold" font="inter" color={INK_50} lineHeight={15}>
          vs last month
        </Txt>

        {/* Monthly target sub-card */}
        <Abs x={25} y={171} w={285} h={118} radius={20} bg={GLASS_40} />
        <Txt
          x={42} y={188} w={140}
          size={10} weight="bold" font="inter" color={INK_50} lineHeight={15} letterSpacing={1}
        >
          MONTHLY TARGET
        </Txt>
        <Txt
          x={42} y={207} w={140}
          size={14} weight="bold" font="inter" color={INK_40} lineHeight={21} letterSpacing={-0.35}
        >
          {`${k(thisMonth, 1)} / ${k(target, 1)}`}
        </Txt>
        <Pressable
          onPress={() => router.push("/agency/payments/set-revenue-target")}
          accessibilityRole="button"
          style={({ pressed }) => [styles.setTarget, pressed && styles.pressed]}
        >
          <Feather name="target" size={10} color={INK} />
          <Txt
            size={10} weight="bold" font="inter" color={INK} lineHeight={15} letterSpacing={0.5}
            style={styles.setTargetLabel}
          >
            SET TARGET
          </Txt>
        </Pressable>

        <Abs x={42} y={240} w={251} h={10} radius={5} bg={GLASS_50} />
        <Abs x={43} y={241} w={fillW} h={8} radius={4} bg={INK} />
        <Abs x={43 + fillW - 8} y={243} w={4} h={4} radius={2} bg={GLASS_40} />
        <Txt
          x={46} y={258} w={120}
          size={9} weight="bold" font="inter" color={INK_40} lineHeight={13.5} letterSpacing={0.9}
        >
          {`${Math.round(targetPct)}% COMPLETE`}
        </Txt>
        <Txt
          x={209} y={258} w={80} align="right"
          size={9} weight="bold" font="inter" color={INK_40} lineHeight={13.5} letterSpacing={0.9}
        >
          {`${daysLeft} DAYS LEFT`}
        </Txt>
      </Abs>

      {/* ============================ Top Creators =========================== */}
      <Txt
        x={24} y={1611} w={200}
        size={22} weight="medium" font="inter" color={INK} lineHeight={33} letterSpacing={-0.55}
      >
        Top Creators
      </Txt>
      <Pressable
        onPress={() => router.push("/agency/people/assign-creators")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.creatorSeeAll, pressed && styles.pressed]}
      >
        <Txt size={14} weight="semibold" font="inter" color={INK_60} lineHeight={20}>
          See all
        </Txt>
      </Pressable>
      <Abs x={20} y={1660} w={335} h={174} radius={28} bg={GLASS_40} />
      {topCreators.map((c, i) => {
        const top = CREATOR_ROW_Y + i * CREATOR_ROW_STEP;
        return (
          <Abs key={c.id} x={29} y={top} w={317} h={74} radius={20} bg="#ffffff">
            <Abs x={13} y={13} w={48} h={48} radius={24} style={styles.clip}>
              <LinearGradient
                colors={["#f1ffc3", "#c8b3ed"] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fill}
              />
              {c.avatarUrl ? <Image source={{ uri: c.avatarUrl }} style={styles.avatar} /> : null}
            </Abs>
            <Txt
              x={77} y={16.75} w={163.66}
              size={15} weight="bold" font="inter" color={INK} lineHeight={22.5}
              numberOfLines={1}
            >
              {c.name}
            </Txt>
            <Txt
              x={77} y={40.25} w={163.66}
              size={12} weight="medium" font="inter" color={INK_60} lineHeight={16}
              numberOfLines={1}
            >
              {c.niche ?? c.handle}
            </Txt>
            <Txt
              x={216.66} y={17.25} w={79.34} align="right"
              size={15} weight="bold" font="inter" color={INK} lineHeight={22.5}
            >
              {`${c.engagementRate.toFixed(1)}%`}
            </Txt>
            <Txt
              x={216.66} y={40.75} w={79.34} align="right"
              size={10} weight="semibold" font="inter" color={INK_50} lineHeight={15} letterSpacing={0.5}
            >
              ENG
            </Txt>
          </Abs>
        );
      })}
      {topCreators.length === 0 ? (
        <Txt
          x={42} y={CREATOR_ROW_Y + 16} w={290}
          size={12} weight="medium" font="inter" color={INK_60} lineHeight={16}
        >
          {creatorsLoading ? "Loading creators…" : "No creators on the roster"}
        </Txt>
      ) : null}

      {/* ========================== Explore Services ========================= */}
      <Txt
        x={27} y={1873} w={220}
        size={22} weight="medium" font="inter" color={INK} lineHeight={33} letterSpacing={-0.55}
      >
        Explore Services
      </Txt>
      <Pressable
        onPress={() => router.push("/agency/campaigns/campaign-requests")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.seeRequest, pressed && styles.pressed]}
      >
        <Txt size={14} weight="semibold" font="inter" color={INK_60} lineHeight={20}>
          See Request
        </Txt>
      </Pressable>
      <Pressable
        onPress={() => router.push("/agency/creators/videographers-list")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.serviceLeft, pressed && styles.pressed]}
      >
        <Abs x={17} y={17} w={32} h={32} radius={16} bg={GLASS_60} center>
          <Feather name="video" size={16} color={INK} />
        </Abs>
        <Txt x={17} y={53} w={127.5} size={14} weight="bold" font="inter" color={INK} lineHeight={21}>
          Videographers
        </Txt>
        <Txt x={17} y={76} w={127.5} size={11} weight="medium" font="inter" color={INK_60} lineHeight={16.5}>
          Find local talent
        </Txt>
      </Pressable>
      <Pressable
        onPress={() => router.push("/agency/creators/editors-list")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.serviceRight, pressed && styles.pressed]}
      >
        <Abs x={17} y={17} w={32} h={32} radius={16} bg={GLASS_60} center>
          <Feather name="film" size={16} color={INK} />
        </Abs>
        <Txt x={17} y={53} w={127.5} size={14} weight="bold" font="inter" color={INK} lineHeight={21}>
          Video Editors
        </Txt>
        <Txt x={17} y={76} w={127.5} size={11} weight="medium" font="inter" color={INK_60} lineHeight={16.5}>
          Post-production
        </Txt>
      </Pressable>

      {/* ============================= Reminders ============================= */}
      <Txt
        x={27} y={2076} w={200}
        size={22} weight="medium" font="inter" color={INK} lineHeight={33} letterSpacing={-0.55}
      >
        Reminders
      </Txt>
      <Pressable
        onPress={() => router.push("/agency/profile/reminders-list")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.reminderSeeAll, pressed && styles.pressed]}
      >
        <Txt size={14} weight="semibold" font="inter" color={INK_60} lineHeight={20}>
          See all
        </Txt>
      </Pressable>
      {reminderRows.map((r, i) => {
        const top = REMINDER_ROW_Y + i * REMINDER_ROW_STEP;
        return (
          <Abs
            key={r.id}
            x={23} y={top} w={335} h={64} radius={20} bg={GLASS_40}
            opacity={r.done ? 0.7 : 1}
          >
            <Pressable
              onPress={() => updateReminder.mutate({ id: r.id, data: { done: !r.done } })}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: r.done }}
              style={styles.checkbox}
            >
              {r.done ? (
                <Abs x={0} y={0} w={20} h={20} radius={10} bg={INK} center>
                  <Feather name="check" size={12} color={PAGE} />
                </Abs>
              ) : (
                <Abs x={0} y={0} w={20} h={20} radius={10} border={INK_40} borderWidth={1} />
              )}
            </Pressable>
            <Txt
              x={45} y={13} w={277}
              size={14} weight="bold" font="inter" color={r.done ? INK_60 : INK} lineHeight={21}
              numberOfLines={1}
            >
              {r.title}
            </Txt>
            <Txt
              x={45} y={34} w={277}
              size={11} weight="medium" font="inter" color={r.done ? INK_40 : INK_60} lineHeight={16.5}
              numberOfLines={1}
            >
              {r.done ? "Completed" : dueLabel(r.dueAt)}
            </Txt>
          </Abs>
        );
      })}
      {reminderRows.length === 0 ? (
        <Abs x={23} y={REMINDER_ROW_Y} w={335} h={64} radius={20} bg={GLASS_40}>
          <Txt x={45} y={23} w={277} size={12} weight="medium" font="inter" color={INK_60} lineHeight={16.5}>
            {remindersLoading ? "Loading reminders…" : "Nothing due"}
          </Txt>
        </Abs>
      ) : null}

      {/* =========================== Recent Activity ========================= */}
      <Txt
        x={24} y={2286} w={327}
        size={22} weight="medium" font="inter" color={INK} lineHeight={33} letterSpacing={-0.55}
      >
        Recent Activity
      </Txt>
      <Abs x={20} y={2335} w={335} h={273.25} radius={28} bg={GLASS_40} />
      <Abs x={57} y={2356} w={1} h={231.25} bg={TIMELINE} />
      {activity.map((n, i) => {
        const top = ACTIVITY_ROW_Y + i * ACTIVITY_ROW_STEP;
        const dim = n.read;
        return (
          <Abs key={n.id} x={45} y={top + 1} w={289} h={55.75} opacity={dim ? 0.6 : 1}>
            <Abs x={0} y={0} w={24} h={24} radius={12} bg={ACTIVITY_TINT[n.kind] ?? "#e8e2d9"} center>
              <Abs x={9} y={9} w={6} h={6} radius={3} bg={INK} opacity={dim ? 0.5 : 1} />
            </Abs>
            <Txt
              x={37} y={-1} w={252}
              size={15} weight="bold" font="inter" color={INK} lineHeight={18.75}
              numberOfLines={1}
            >
              {n.title}
            </Txt>
            <Txt
              x={37} y={20.75} w={252}
              size={12} weight="medium" font="inter" color={INK_60} lineHeight={16}
              numberOfLines={1}
            >
              {n.body ?? ""}
            </Txt>
            <Txt
              x={37} y={40.75} w={252}
              size={10} weight="bold" font="inter" color={INK_40} lineHeight={15} letterSpacing={0.5}
            >
              {agoUpper(n.createdAt, now)}
            </Txt>
          </Abs>
        );
      })}
      {activity.length === 0 ? (
        <Txt
          x={82} y={ACTIVITY_ROW_Y} w={252}
          size={12} weight="medium" font="inter" color={INK_60} lineHeight={16}
        >
          Nothing has happened yet
        </Txt>
      ) : null}
      {/* Bottom fade over the timeline, per the spec's 333x96 gradient. */}
      <Abs x={21} y={2511.25} w={333} h={96} style={styles.fade}>
        <LinearGradient
          colors={["rgba(249,246,238,0)", "rgba(249,246,238,0.8)"] as const}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fill}
        />
      </Abs>

      {/* ============================== tab bar ============================== */}
      <Abs x={9} y={2690} w={357} h={72} radius={32} bg="rgba(255,255,255,0.54)" style={styles.tabBar}>
        {/* Home — this screen. */}
        <Abs x={25} y={24} w={24} h={24} center>
          <Feather name="home" size={22} color={INK} />
        </Abs>
        <Abs x={35} y={52} w={4} h={4} radius={2} bg="#e36eb2" />
      </Abs>
      <Pressable
        onPress={() => router.push("/agency/payments/invoice-reminders")}
        accessibilityRole="button"
        accessibilityLabel="Payments"
        style={({ pressed }) => [styles.tabItem, { left: 115 }, pressed && styles.pressed]}
      >
        <Feather name="credit-card" size={22} color={INK_60} />
      </Pressable>
      <Pressable
        onPress={() => router.push("/agency/people/people-overview")}
        accessibilityRole="button"
        accessibilityLabel="People"
        style={({ pressed }) => [styles.tabItem, { left: 236 }, pressed && styles.pressed]}
      >
        <Feather name="users" size={22} color={INK_60} />
      </Pressable>
      <Pressable
        onPress={() => router.push("/agency/profile/profile-home")}
        accessibilityRole="button"
        accessibilityLabel="Profile"
        style={({ pressed }) => [styles.tabItem, { left: 317 }, pressed && styles.pressed]}
      >
        <Feather name="user" size={22} color={INK_60} />
      </Pressable>

      {/* Centre FAB — straddles the bar's top edge, so it is a later sibling. */}
      <Abs x={157} y={2661} w={60} h={60} radius={30} bg={PAGE} center>
        <Pressable
          onPress={() => router.push("/agency/profile/add-reminder")}
          accessibilityRole="button"
          accessibilityLabel="Add reminder"
          style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
        >
          <Feather name="plus" size={24} color={INK} />
        </Pressable>
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.85 },
  avatar: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },

  bell: {
    position: "absolute",
    left: 315,
    top: 62,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK,
  },

  toggle: {
    position: "absolute",
    left: 302,
    top: 148.5,
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: DARK,
  },

  alert: {
    position: "absolute",
    left: 20,
    top: 199.5,
    width: 335,
    height: 83.5,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#e2ebe2",
  },

  matrixSeeAll: { position: "absolute", left: 311.44, top: 311 },
  creatorSeeAll: { position: "absolute", left: 306.44, top: 1624 },
  reminderSeeAll: { position: "absolute", left: 309.44, top: 2089 },
  seeRequest: { position: "absolute", left: 268, top: 1886 },

  /* --- team glance --- */
  chip: { paddingHorizontal: 11, justifyContent: "center" },
  rangeSeg: {
    position: "absolute",
    top: 694,
    height: 24,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  rangeSegOn: { backgroundColor: DARK_ALT },
  glanceCta: {
    position: "absolute",
    left: 297,
    top: 996,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK_ALT,
  },

  /* --- revenue --- */
  setTarget: {
    position: "absolute",
    left: 186,
    top: 199,
    width: 107,
    height: 29,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  setTargetLabel: { marginLeft: 4 },

  /* --- services --- */
  serviceLeft: {
    position: "absolute",
    left: 23,
    top: 1922,
    width: 161.5,
    height: 110,
    borderRadius: 24,
    backgroundColor: "#e4ecf4",
  },
  serviceRight: {
    position: "absolute",
    left: 196.5,
    top: 1922,
    width: 161.5,
    height: 110,
    borderRadius: 24,
    backgroundColor: "#f6f3e6",
  },

  /* --- reminders --- */
  checkbox: { position: "absolute", left: 13, top: 22, width: 20, height: 20 },

  fade: { borderBottomLeftRadius: 27, borderBottomRightRadius: 27, overflow: "hidden" },

  /* --- tab bar --- */
  tabBar: {
    shadowColor: "#1e1432",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  tabItem: {
    position: "absolute",
    top: 2714,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BADGE,
  },
});
