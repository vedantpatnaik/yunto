import { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, G } from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { gradients } from "../../../src/theme";
import {
  compact,
  inr,
  useCampaigns,
  useCreators,
  useInvoices,
  useLeads,
  useMe,
  useNotifications,
  useReminders,
  type Invoice,
} from "../../../src/api/hooks";

/**
 * Home — Operations role. Figma 7756:13954 "Operation- Home" (375x876).
 *
 * The reference composition for all three role homes. Three top-level layers,
 * reproduced here as three layers:
 *
 *   1. Header   — "Container" (0,0 375x124). Pinned, never scrolls.
 *   2. Body     — "Container" (0,124 375x609, clipped) whose children run to
 *                 y=2200 (the trailing 343x76 spacer at y=2124). It is a
 *                 clipped viewport, so it owns the vertical ScrollView and one
 *                 -124 offset on the inner canvas keeps every child on its raw
 *                 frame coordinate.
 *   3. Tab bar  — "Frame 2147223282": the 357x72 glass bar at y=765 plus the
 *                 60pt FAB at y=736, drawn last so both sit above the body.
 *
 * The Ops body differs from the Sales home in one section: where Sales carries
 * the Lead Matrix, this frame carries the Live Campaigns carousel — 280x182
 * cards on a 296 step, scrolling horizontally out past the right frame edge.
 *
 * Geist is the heading face in Figma and is not one of the two families
 * registered in app/_layout.tsx, so every Geist node renders in Inter — the
 * same substitution the other agency frames make. expo-blur is not a
 * dependency either, so the spec's BACKGROUND_BLUR layers are drawn as their
 * translucent fills alone.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

const BODY_Y = 124; // scroll viewport origin
const BODY_H = 609; // …and its clipped height
const CONTENT_BOTTOM = 2200; // trailing spacer: y=2124 + h=76

/** Top Creators — 317x74 rows inside the 335x174 panel, stepping 82. */
const CREATOR_Y0 = 905;
const CREATOR_STEP = 82;
const CREATOR_MAX = 2;

/** Live Campaigns — 280x182 cards at x=26, stepping 296 (280 + 16 gap). */
const CAMPAIGN_W = 280;
const CAMPAIGN_H = 182;
const CAMPAIGN_GAP = 16;

/** Reminders — 335x64 rows at y=1625, stepping 72. */
const REMINDER_Y0 = 1625;
const REMINDER_STEP = 72;
const REMINDER_MAX = 2;

/** Recent Activity — 276x56.75 items at y=1855, stepping 79.75. */
const ACTIVITY_Y0 = 1855;
const ACTIVITY_STEP = 79.75;
const ACTIVITY_MAX = 3;

/** Monthly-target bar: 251pt track, 1pt inset each side. */
const TRACK_INNER = 249;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE_BG = "#f8f5ef";
const INK = "#1e1e1e";
const INK_80 = "rgba(30,30,30,0.8)";
const INK_70 = "rgba(30,30,30,0.7)";
const INK_60 = "rgba(30,30,30,0.6)";
const INK_50 = "rgba(30,30,30,0.5)";
const INK_40 = "rgba(30,30,30,0.4)";

const DARK = "#1f1a17"; // filled circular buttons
const ON_DARK = "#f8f5ef"; // glyphs on those buttons
const PRESENCE = "#05df72";
const PINK = "#ffcdea"; // notification badge + FAB
const ACTIVE_DOT = "#e36eb2";

const ALERT_BG = "#e2ebe2";
const ALERT_ORB = "rgba(212,226,212,0.3)"; // #d4e2d4 @ 30%
const CARD_SAND = "#f6f3e6";
const CARD_BLUE = "#e4ecf4";
const REVENUE_BG = "#f2eff6";
const DELTA_DISC = "#bee3b0";

/** The two campaign card paints, cycled across the carousel. */
const CAMPAIGN_FILLS = ["#fdebf0", "#e2ebe2"] as const;
/** The three activity marker paints, cycled down the timeline. */
const ACTIVITY_DOTS = ["#e6e1f9", "#fcf4d9", "#e8e2d9"] as const;

const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_54 = "rgba(255,255,255,0.54)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_80 = "rgba(255,255,255,0.8)";

/**
 * Hairlines. The spec names these nodes "VerticalBorder" / "HorizontalBorder" /
 * "Border" but carries no stroke paint for them, so they are drawn as the ink
 * at the lowest weight that still reads on each surface.
 */
const RULE = "rgba(30,30,30,0.08)";
const CHECKBOX_LINE = "rgba(30,30,30,0.25)";
const RING_TRACK = "rgba(255,255,255,0.6)";

/* --------------------------- gradient directions --------------------------- */
const ORIGIN = { x: 0, y: 0 } as const;
const CORNER = { x: 1, y: 1 } as const;
const TOP = { x: 0.5, y: 0 } as const;
const BOTTOM = { x: 0.5, y: 1 } as const;

/* ------------------------------ derivations ------------------------------- */
/** Role.OPS_MANAGER → "Manager", the label under the name in the header. */
function roleLabel(role: string | undefined): string {
  switch (role) {
    case "SALES_MANAGER":
    case "OPS_MANAGER":
      return "Manager";
    case "SALES_EMPLOYEE":
      return "Sales";
    case "OPS_EMPLOYEE":
      return "Operations";
    case "SUPER_ADMIN":
      return "Admin";
    default:
      return "Manager";
  }
}

/** "8,400k" — the Performance cards' format: thousands, Indian grouping. */
const thousands = (n: number) => `${inr(Math.round(n / 1000))}k`;

/** "42.8k" — the target line's one-decimal form. */
const oneDecimalK = (n: number) => `${(n / 1000).toFixed(1)}k`;

/** "₹1.2L" / "₹125K" — campaign budgets, the same scale the design prints. */
function inrShort(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${Math.round(n / 1_000)}K`;
  return `₹${n}`;
}

/** Sums the agency's cut of every invoice raised inside a window. */
function sumFeeBetween(list: Invoice[], from: number, to: number): number {
  return list.reduce((sum, i) => {
    const t = i.createdAt ? new Date(i.createdAt).getTime() : 0;
    return t >= from && t < to ? sum + i.agencyFee : sum;
  }, 0);
}

/** "Due today at 5 PM" — recomputed from Reminder.dueAt, never stored. */
function dueLabel(iso: string): string {
  const due = new Date(iso);
  const h = due.getHours();
  const m = due.getMinutes();
  const hh = ((h + 11) % 12) + 1;
  const clock = `${hh}${m === 0 ? "" : `:${String(m).padStart(2, "0")}`} ${h < 12 ? "AM" : "PM"}`;

  const today = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  if (sameDay(due, today)) return `Due today at ${clock}`;
  if (sameDay(due, tomorrow)) return `Due tomorrow at ${clock}`;
  return `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${clock}`;
}

/** "2H AGO" / "YESTERDAY" — the activity timeline's meta line. */
function agoLabel(iso: string, now: number): string {
  const mins = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  if (hrs < 48) return "YESTERDAY";
  return `${Math.floor(hrs / 24)}D AGO`;
}

/* ------------------------------- primitives ------------------------------- */
/** Section heading — Geist 500 22 / 33 at -0.55 tracking, rendered in Inter. */
function Heading({ x, y, w, children }: { x: number; y: number; w: number; children: string }) {
  return (
    <Txt
      x={x}
      y={y}
      w={w}
      size={22}
      weight="medium"
      font="inter"
      color={INK}
      lineHeight={33}
      letterSpacing={-0.55}
    >
      {children}
    </Txt>
  );
}

/**
 * The 48x48 completion ring on a campaign card. Both vectors in the spec share
 * a 42.44 bounding box, which a 19.72 radius at a 3pt stroke reproduces exactly.
 */
function ProgressRing({ pct }: { pct: number }) {
  const r = 19.72;
  const circumference = 2 * Math.PI * r;
  const len = (Math.min(Math.max(pct, 0), 100) / 100) * circumference;
  return (
    <Svg width={48} height={48}>
      <Circle cx={24} cy={24} r={r} stroke={RING_TRACK} strokeWidth={3} fill="none" />
      <G rotation={-90} origin="24, 24">
        <Circle
          cx={24}
          cy={24}
          r={r}
          stroke={INK}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${len} ${circumference - len}`}
        />
      </G>
    </Svg>
  );
}

/* --------------------------------- rows ----------------------------------- */
interface CreatorRowProps {
  index: number;
  name: string;
  niche: string;
  eng: string;
  avatarUrl?: string;
}

/** 317x74 white card; child offsets are card-relative. */
function CreatorRow({ index, name, niche, eng, avatarUrl }: CreatorRowProps) {
  return (
    <Abs
      x={29}
      y={CREATOR_Y0 + index * CREATOR_STEP}
      w={317}
      h={74}
      radius={20}
      bg="#ffffff"
      style={styles.rowShadow}
    >
      <Abs x={13} y={13} w={48} h={48} radius={24} style={styles.clip}>
        <LinearGradient colors={gradients.avatarB} start={ORIGIN} end={CORNER} style={StyleSheet.absoluteFill} />
        {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatar48} /> : null}
      </Abs>

      <Txt
        x={77}
        y={16.75}
        w={163.66}
        size={15}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={22.5}
        numberOfLines={1}
      >
        {name}
      </Txt>
      <Txt
        x={77}
        y={40.25}
        w={163.66}
        size={12}
        weight="medium"
        font="inter"
        color={INK_60}
        lineHeight={16}
        numberOfLines={1}
      >
        {niche}
      </Txt>

      <Txt
        x={256.66}
        y={17.25}
        w={39.34}
        size={15}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={22.5}
        align="right"
      >
        {eng}
      </Txt>
      <Txt
        x={273.36}
        y={40.75}
        w={22.64}
        size={10}
        weight="semibold"
        font="inter"
        color={INK_50}
        lineHeight={15}
        letterSpacing={0.5}
        align="right"
      >
        ENG
      </Txt>
    </Abs>
  );
}

interface CampaignCardProps {
  index: number;
  brand: string;
  title: string;
  tag: string;
  pct: number;
  budget: string;
  timeline: string;
  onPress: () => void;
}

/** 280x182 carousel card. Offsets are card-relative. */
function CampaignCard({ index, brand, title, tag, pct, budget, timeline, onPress }: CampaignCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.campaignCard, { backgroundColor: CAMPAIGN_FILLS[index % CAMPAIGN_FILLS.length] }]}
    >
      {/* Blurred orb, clipped by the card exactly as in the design. */}
      <Abs x={183} y={1} w={96} h={96} radius={48} bg={GLASS_40} />

      <Abs x={21} y={21} h={18} row gap={8}>
        <Txt
          size={11}
          weight="bold"
          font="inter"
          color={INK}
          lineHeight={16.5}
          letterSpacing={0.55}
          numberOfLines={1}
          style={styles.brand}
        >
          {brand}
        </Txt>
        <View style={styles.tag}>
          <Txt size={9} weight="bold" font="inter" color={INK_80} lineHeight={13.5}>
            {tag}
          </Txt>
        </View>
      </Abs>

      <Abs x={211} y={21} w={48} h={48}>
        <ProgressRing pct={pct} />
      </Abs>
      <Txt
        x={211}
        y={36.75}
        w={48}
        size={11}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={16.5}
        align="center"
      >
        {`${Math.round(pct)}%`}
      </Txt>

      <Txt
        x={21}
        y={44.25}
        w={143}
        size={18}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={22.5}
        numberOfLines={2}
      >
        {title}
      </Txt>

      {/* "HorizontalBorder" — the rule above the budget / timeline footer. */}
      <Abs x={21} y={106} w={238} h={1} bg={RULE} />

      <Txt x={21} y={123} w={90} size={10} weight="bold" font="inter" color={INK_60} lineHeight={15} letterSpacing={0.5}>
        BUDGET
      </Txt>
      <Txt x={21} y={140} w={115} size={14} weight="bold" font="inter" color={INK} lineHeight={21} numberOfLines={1}>
        {budget}
      </Txt>

      <Txt
        x={146}
        y={123}
        w={51.03}
        size={10}
        weight="bold"
        font="inter"
        color={INK_60}
        lineHeight={15}
        letterSpacing={0.5}
      >
        TIMELINE
      </Txt>
      <Txt x={146} y={140} w={113} size={12} weight="semibold" font="inter" color={INK_80} lineHeight={18} numberOfLines={1}>
        {timeline}
      </Txt>
    </Pressable>
  );
}

interface ReminderRowProps {
  index: number;
  title: string;
  sub: string;
  done: boolean;
}

/** 335x64 glass row; the completed variant dims the whole row to 70%. */
function ReminderRow({ index, title, sub, done }: ReminderRowProps) {
  return (
    <Abs
      x={23}
      y={REMINDER_Y0 + index * REMINDER_STEP}
      w={335}
      h={64}
      radius={20}
      bg={GLASS_40}
      opacity={done ? 0.7 : undefined}
    >
      {done ? (
        <Abs x={13} y={22} w={20} h={20} radius={10} bg={INK} center>
          <Feather name="check" size={12} color={ON_DARK} />
        </Abs>
      ) : (
        <Abs x={13} y={22} w={20} h={20} radius={10} border={CHECKBOX_LINE} borderWidth={1} />
      )}

      <Txt
        x={45}
        y={13}
        w={277}
        size={14}
        weight="bold"
        font="inter"
        color={done ? INK_60 : INK}
        lineHeight={21}
        numberOfLines={1}
      >
        {title}
      </Txt>
      <Txt
        x={45}
        y={34}
        w={277}
        size={11}
        weight="medium"
        font="inter"
        color={done ? INK_40 : INK_60}
        lineHeight={16.5}
        numberOfLines={1}
      >
        {sub}
      </Txt>
    </Abs>
  );
}

interface ActivityItemProps {
  index: number;
  title: string;
  detail: string;
  when: string;
}

/** Timeline entry. Offsets are panel-relative (the panel sits at 20,1835). */
function ActivityItem({ index, title, detail, when }: ActivityItemProps) {
  const top = 20 + index * ACTIVITY_STEP;
  const last = index === ACTIVITY_MAX - 1;
  return (
    <Abs x={0} y={0} w={335} h={273.25} opacity={last ? 0.6 : undefined}>
      <Abs
        x={25}
        y={top + 1}
        w={24}
        h={24}
        radius={12}
        bg={ACTIVITY_DOTS[index % ACTIVITY_DOTS.length]}
        center
      >
        <Abs x={9} y={9} w={6} h={6} radius={3} bg={INK} opacity={last ? 0.5 : undefined} />
      </Abs>

      <Txt x={62} y={top} w={252} size={15} weight="bold" font="inter" color={INK} lineHeight={18.75} numberOfLines={1}>
        {title}
      </Txt>
      <Txt
        x={62}
        y={top + 21.75}
        w={252}
        size={12}
        weight="medium"
        font="inter"
        color={INK_60}
        lineHeight={16}
        numberOfLines={1}
      >
        {detail}
      </Txt>
      <Txt
        x={62}
        y={top + 41.75}
        w={252}
        size={10}
        weight="bold"
        font="inter"
        color={INK_40}
        lineHeight={15}
        letterSpacing={0.5}
      >
        {when}
      </Txt>
    </Abs>
  );
}

/* --------------------------------- screen ---------------------------------- */
export default function HomeOperations() {
  const router = useRouter();

  const { data: me } = useMe();
  const { data: notifications } = useNotifications();
  const { data: leads = [] } = useLeads();
  const { data: invoices = [] } = useInvoices();
  const { data: creators = [], isLoading: creatorsLoading } = useCreators();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const { data: reminders = [], isLoading: remindersLoading } = useReminders();

  const now = Date.now();

  const newLeads = useMemo(() => leads.filter((l) => l.status === "NEW").length, [leads]);

  /** Revenue is the agency's own cut — Invoice.agencyFee, not the payout. */
  const money = useMemo(() => {
    const today = new Date();
    const startThis = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
    const startLast = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();
    const startNext = new Date(today.getFullYear(), today.getMonth() + 1, 1).getTime();

    const thisMonth = sumFeeBetween(invoices, startThis, startNext);
    const lastMonth = sumFeeBetween(invoices, startLast, startThis);
    const total = invoices.reduce((sum, i) => sum + i.agencyFee, 0);
    const deltaPct = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return {
      thisMonth,
      lastMonth,
      total,
      deltaPct,
      daysLeft: Math.max(0, daysInMonth - today.getDate()),
    };
  }, [invoices]);

  const target = me?.targetMonthly ?? 0;
  const targetPct = target > 0 ? Math.min(money.thisMonth / target, 1) : 0;

  const topCreators = useMemo(
    () => [...creators].sort((a, b) => b.engagementRate - a.engagementRate).slice(0, CREATOR_MAX),
    [creators],
  );

  /**
   * Campaign carries no deal type of its own, so PAID / BARTER is read off the
   * money: a campaign booked with no budget is a barter, which is exactly what
   * the design's BARTER card prints under BUDGET ("Product Only").
   */
  const liveCampaigns = useMemo(
    () =>
      campaigns
        .filter((c) => c.status === "ACTIVE")
        .map((c) => ({
          id: c.id,
          brand: c.brandName.toUpperCase(),
          title: c.name,
          tag: c.budget > 0 ? "PAID" : "BARTER",
          pct: c.progress,
          budget: c.budget > 0 ? inrShort(c.budget) : "Product Only",
          timeline: c.timeline ?? "—",
        })),
    [campaigns],
  );

  const reminderRows = useMemo(
    () =>
      [...reminders]
        .sort((a, b) => {
          if (a.done !== b.done) return a.done ? 1 : -1;
          return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
        })
        .slice(0, REMINDER_MAX),
    [reminders],
  );

  const activity = useMemo(
    () => (notifications?.items ?? []).slice(0, ACTIVITY_MAX),
    [notifications],
  );

  const unread = notifications?.unreadCount ?? 0;

  return (
    <Screen height={FRAME_H} background={PAGE_BG} scroll>
      {/* Frame fill wash — "Gradient" 375x256, #f9e4e8 20% → 0%. */}
      <Abs x={0} y={0} w={FRAME_W} h={256}>
        <LinearGradient
          colors={["rgba(249,228,232,0.2)", "rgba(249,228,232,0)"] as const}
          start={TOP}
          end={BOTTOM}
          style={StyleSheet.absoluteFill}
        />
      </Abs>

      {/* ========================= body — 0,124 375x609 ========================= */}
      <Abs x={0} y={BODY_Y} w={FRAME_W} h={BODY_H} style={styles.clip}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ height: CONTENT_BOTTOM - BODY_Y }}
        >
          {/* One -124 offset, so everything below keeps raw frame coordinates. */}
          <Abs x={0} y={-BODY_Y} w={FRAME_W} h={CONTENT_BOTTOM}>
            {/* ------------------- 1. presence pill (137.5 → 179.5) ------------------ */}
            <Abs x={20} y={137.5} w={335} h={42} radius={21} bg={GLASS_40}>
              <Abs x={17} y={16} w={10} h={10} radius={5} bg={PRESENCE} />
              <Txt x={37} y={10.25} w={146.63} size={13} weight="medium" font="inter" color={INK_80} lineHeight={19.5}>
                Active
              </Txt>
              <Abs x={282} y={11} w={36} h={20} radius={10} bg={DARK}>
                <Abs x={20} y={4} w={12} h={12} radius={6} bg={PAGE_BG} />
              </Abs>
            </Abs>

            {/* ------------------ 2. new-leads alert (199.5 → 283) ------------------- */}
            <Pressable onPress={() => router.push("/agency/leads/leads-list")} style={styles.alertCard}>
              {/* Blurred orb, clipped by the card as in the design. */}
              <Abs x={254} y={-15} w={96} h={96} radius={48} bg={ALERT_ORB} />

              <Abs x={21} y={21.75} w={40} h={40} radius={20} bg={GLASS_50} center>
                {/* 16.54 square + 3.31 marker — the pipeline glyph. */}
                <Feather name="users" size={20} color={INK} />
              </Abs>

              <Txt x={77} y={21} w={149} size={16} weight="medium" font="inter" color={INK} lineHeight={24} numberOfLines={1}>
                {`${newLeads} new ${newLeads === 1 ? "lead" : "leads"} waiting`}
              </Txt>
              <Txt x={77} y={46.5} w={124} size={12} weight="regular" font="inter" color={INK_70} lineHeight={16}>
                Tap to review pipeline
              </Txt>

              <Abs x={282} y={25.75} w={32} h={32} radius={16} bg={DARK} center>
                <Feather name="arrow-up-right" size={16} color={ON_DARK} />
              </Abs>
            </Pressable>

            {/* -------------------- 3. Performance (303 → 482) ---------------------- */}
            <Heading x={24} y={303} w={127}>
              Performance
            </Heading>

            <Abs x={20} y={352} w={161.5} h={130} radius={24} bg={CARD_SAND}>
              <Txt x={21} y={21} w={119.5} size={12} weight="semibold" font="inter" color={INK_60} lineHeight={16}>
                This Month{" "}
              </Txt>
              <Txt x={21} y={56} w={119.5} size={24} weight="bold" font="inter" color={INK} lineHeight={32} numberOfLines={1}>
                {thousands(money.thisMonth)}
              </Txt>
              <Txt x={21} y={92} w={119.5} size={11} weight="medium" font="inter" color={INK_60} lineHeight={16.5}>
                Expected this week
              </Txt>
            </Abs>

            <Abs x={193.5} y={352} w={161.5} h={130} radius={24} bg={CARD_BLUE}>
              <Txt x={21} y={21} w={119.5} size={12} weight="semibold" font="inter" color={INK_60} lineHeight={16}>
                Last Month
              </Txt>
              <Txt x={21} y={56} w={119.5} size={24} weight="bold" font="inter" color={INK} lineHeight={32} numberOfLines={1}>
                {thousands(money.lastMonth)}
              </Txt>
            </Abs>

            {/* ------------------ 4. revenue + target (505 → 819) ------------------- */}
            <Abs x={20} y={505} w={335} h={314} radius={32} bg={REVENUE_BG} style={styles.clip}>
              <Abs x={-39} y={160.5} w={192} h={192} radius={96} bg={GLASS_50} />
              <Abs x={206} y={1} w={128} h={128} radius={64} bg={REVENUE_BG} />

              <Abs x={25} y={25} w={28} h={28} radius={14} bg={GLASS_50} center>
                <MaterialCommunityIcons name="currency-inr" size={14} color={INK} />
              </Abs>
              <Txt
                x={61}
                y={30.5}
                w={104.73}
                size={11}
                weight="bold"
                font="inter"
                color={INK_60}
                lineHeight={16.5}
                letterSpacing={1.1}
              >
                TOTAL REVENUE
              </Txt>

              <Txt
                x={25}
                y={61}
                w={182.62}
                size={44}
                weight="bold"
                font="inter"
                color={INK}
                lineHeight={44}
                letterSpacing={-1.1}
                numberOfLines={1}
              >
                {compact(money.total)}
              </Txt>

              <Abs x={25} y={117} w={182.62} h={34} radius={17} bg={GLASS_80}>
                <Abs x={13} y={7} w={20} h={20} radius={10} bg={DELTA_DISC} center>
                  <Feather name="arrow-up-right" size={12} color={INK} />
                </Abs>
                <Txt x={39} y={6.25} w={48.95} size={13} weight="bold" font="inter" color={INK} lineHeight={19.5}>
                  {`${money.deltaPct >= 0 ? "+" : ""}${money.deltaPct.toFixed(1)}%`}
                </Txt>
                <Abs x={95.95} y={9.5} w={1} h={15} bg={RULE} />
                <Txt x={104.95} y={9.5} w={64.67} size={10} weight="semibold" font="inter" color={INK_50} lineHeight={15}>
                  vs last month
                </Txt>
              </Abs>

              <Abs x={25} y={171} w={285} h={118} radius={20} bg={GLASS_40}>
                <Txt
                  x={17}
                  y={17}
                  w={107.33}
                  size={10}
                  weight="bold"
                  font="inter"
                  color={INK_50}
                  lineHeight={15}
                  letterSpacing={1}
                >
                  MONTHLY TARGET
                </Txt>
                <Txt
                  x={17}
                  y={36}
                  w={107.33}
                  size={14}
                  weight="bold"
                  font="inter"
                  color={INK_40}
                  lineHeight={21}
                  letterSpacing={-0.35}
                  numberOfLines={1}
                >
                  {target > 0
                    ? `${oneDecimalK(money.thisMonth)} / ${oneDecimalK(target)}`
                    : oneDecimalK(money.thisMonth)}
                </Txt>

                <Pressable onPress={() => router.push("/agency/payments/set-revenue-target")} style={styles.setTarget}>
                  <Abs x={13} y={9.5} w={10} h={10} center>
                    <Feather name="target" size={10} color={INK} />
                  </Abs>
                  <Txt
                    x={27}
                    y={7}
                    w={67}
                    size={10}
                    weight="bold"
                    font="inter"
                    color={INK}
                    lineHeight={15}
                    letterSpacing={0.5}
                    align="center"
                  >
                    Set Target
                  </Txt>
                </Pressable>

                <Abs x={17} y={69} w={251} h={10} radius={5} bg={GLASS_50}>
                  <Abs x={1} y={1} w={TRACK_INNER * targetPct} h={8} radius={4} bg={INK}>
                    {TRACK_INNER * targetPct >= 12 ? (
                      <Abs x={TRACK_INNER * targetPct - 8} y={2} w={4} h={4} radius={2} bg={GLASS_40} />
                    ) : null}
                  </Abs>
                </Abs>

                <Txt
                  x={21}
                  y={87}
                  w={83.38}
                  size={9}
                  weight="bold"
                  font="inter"
                  color={INK_40}
                  lineHeight={13.5}
                  letterSpacing={0.9}
                >
                  {`${Math.round(targetPct * 100)}% COMPLETE`}
                </Txt>
                <Txt
                  x={197.78}
                  y={87}
                  w={66.22}
                  size={9}
                  weight="bold"
                  font="inter"
                  color={INK_40}
                  lineHeight={13.5}
                  letterSpacing={0.9}
                >
                  {`${money.daysLeft} ${money.daysLeft === 1 ? "DAY" : "DAYS"} LEFT`}
                </Txt>
              </Abs>
            </Abs>

            {/* ------------------- 5. Top Creators (847 → 1070) --------------------- */}
            <Heading x={24} y={847} w={125}>
              Top Creators
            </Heading>
            <Txt x={306.44} y={860} w={44.56} size={14} weight="semibold" font="inter" color={INK_60} lineHeight={20}>
              See all
            </Txt>

            <Abs x={20} y={896} w={335} h={174} radius={28} bg={GLASS_40} />
            {topCreators.map((c, i) => (
              <CreatorRow
                key={c.id}
                index={i}
                name={c.name}
                niche={c.niche ?? c.handle}
                eng={`${c.engagementRate.toFixed(1)}%`}
                avatarUrl={c.avatarUrl}
              />
            ))}
            {topCreators.length === 0 ? (
              <Txt x={49} y={938} w={277} size={13} weight="medium" font="inter" color={INK_60} lineHeight={16}>
                {creatorsLoading ? "Loading creators…" : "No creators yet"}
              </Txt>
            ) : null}

            {/* ------------------ 6. Live Campaigns (1094 → 1325) ------------------- */}
            <Heading x={30} y={1094} w={327}>
              Live Campaigns
            </Heading>

            <Abs x={0} y={1143} w={FRAME_W} h={CAMPAIGN_H}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                {liveCampaigns.map((c, i) => (
                  <CampaignCard
                    key={c.id}
                    index={i}
                    brand={c.brand}
                    title={c.title}
                    tag={c.tag}
                    pct={c.pct}
                    budget={c.budget}
                    timeline={c.timeline}
                    onPress={() => router.push("/agency/campaigns/active-campaigns")}
                  />
                ))}
                {liveCampaigns.length === 0 ? (
                  <View style={styles.carouselEmpty}>
                    <Txt size={13} weight="medium" font="inter" color={INK_60} lineHeight={16}>
                      {campaignsLoading ? "Loading campaigns…" : "No live campaigns"}
                    </Txt>
                  </View>
                ) : null}
              </ScrollView>
            </Abs>

            {/* ---------------- 7. Explore Services (1373 → 1532) ------------------ */}
            <Heading x={27} y={1373} w={165}>
              Explore Services
            </Heading>
            <Pressable onPress={() => router.push("/agency/campaigns/campaign-requests")} style={styles.seeRequest}>
              <Txt size={14} weight="semibold" font="inter" color={INK_60} lineHeight={20}>
                See Request
              </Txt>
            </Pressable>

            <Pressable onPress={() => router.push("/agency/creators/videographers-list")} style={styles.serviceLeft}>
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

            <Pressable onPress={() => router.push("/agency/creators/editors-list")} style={styles.serviceRight}>
              <Abs x={17} y={17} w={32} h={32} radius={16} bg={GLASS_60} center>
                <Feather name="scissors" size={16} color={INK} />
              </Abs>
              <Txt x={17} y={53} w={127.5} size={14} weight="bold" font="inter" color={INK} lineHeight={21}>
                Video Editors
              </Txt>
              <Txt x={17} y={76} w={127.5} size={11} weight="medium" font="inter" color={INK_60} lineHeight={16.5}>
                Post-production
              </Txt>
            </Pressable>

            {/* -------------------- 8. Reminders (1576 → 1761) --------------------- */}
            <Heading x={27} y={1576} w={106}>
              Reminders
            </Heading>
            <Pressable onPress={() => router.push("/agency/profile/reminders-list")} style={styles.remindersSeeAll}>
              <Txt size={14} weight="semibold" font="inter" color={INK_60} lineHeight={20}>
                See all
              </Txt>
            </Pressable>

            {reminderRows.map((r, i) => (
              <ReminderRow
                key={r.id}
                index={i}
                title={r.title}
                sub={r.done ? "Completed" : dueLabel(r.dueAt)}
                done={r.done}
              />
            ))}
            {reminderRows.length === 0 ? (
              <Txt x={68} y={1638} w={277} size={14} weight="bold" font="inter" color={INK_60} lineHeight={21}>
                {remindersLoading ? "Loading reminders…" : "Nothing due"}
              </Txt>
            ) : null}

            {/* ----------------- 9. Recent Activity (1786 → 2108) ------------------ */}
            <Heading x={24} y={1786} w={327}>
              Recent Activity
            </Heading>

            <Abs x={20} y={1835} w={335} h={273.25} radius={28} bg={GLASS_40} style={styles.clip}>
              {/* "VerticalBorder" — the rail the markers hang off. */}
              <Abs x={37} y={21} w={1} h={231.25} bg={RULE} />

              {activity.map((n, i) => (
                <ActivityItem
                  key={n.id}
                  index={i}
                  title={n.title}
                  detail={n.body ?? ""}
                  when={agoLabel(n.createdAt, now)}
                />
              ))}
              {activity.length === 0 ? (
                <Txt x={62} y={20} w={252} size={15} weight="bold" font="inter" color={INK_60} lineHeight={18.75}>
                  No recent activity
                </Txt>
              ) : null}

              {/* Bottom fade over the timeline — #f9f6ee 80% → 0%, rising. */}
              <Abs x={1} y={176.25} w={333} h={96}>
                <LinearGradient
                  colors={["rgba(249,246,238,0.8)", "rgba(249,246,238,0)"] as const}
                  start={BOTTOM}
                  end={TOP}
                  style={StyleSheet.absoluteFill}
                />
              </Abs>
            </Abs>
          </Abs>
        </ScrollView>
      </Abs>

      {/* ============================== header =============================== */}
      <Abs x={20} y={58} w={48} h={48} radius={24} style={styles.clip}>
        <LinearGradient colors={gradients.avatarA} start={ORIGIN} end={CORNER} style={StyleSheet.absoluteFill} />
        {me?.avatarUrl ? <Image source={{ uri: me.avatarUrl }} style={styles.avatar48} /> : null}
      </Abs>

      <Txt
        x={80}
        y={56}
        w={132}
        size={24}
        weight="medium"
        font="inter"
        color={INK}
        lineHeight={32}
        letterSpacing={-0.6}
        numberOfLines={1}
      >
        {me?.name ?? "—"}
      </Txt>
      <Txt x={80} y={88} w={132} size={14} weight="light" font="inter" color={INK_60} lineHeight={20} letterSpacing={-0.35}>
        {roleLabel(me?.role)}
      </Txt>

      <Abs x={267} y={62} w={40} h={40} radius={20} bg={DARK} center>
        <Feather name="inbox" size={20} color={ON_DARK} />
      </Abs>

      <Pressable onPress={() => router.push("/agency/profile/notifications")} style={styles.bellButton}>
        <Feather name="bell" size={20} color={ON_DARK} />
      </Pressable>
      {unread > 0 ? <Abs x={342} y={63} w={12} h={12} radius={6} bg={PINK} /> : null}

      {/* ============================== tab bar ============================== */}
      <Abs x={9} y={765} w={357} h={72} radius={32} bg={GLASS_54} style={styles.tabBar}>
        <Abs x={25} y={24} w={24} h={24} center>
          <Feather name="home" size={24} color={INK} />
        </Abs>
        <Abs x={35} y={52} w={4} h={4} radius={2} bg={ACTIVE_DOT} />

        <Pressable onPress={() => router.push("/agency/payments/invoice-reminders")} style={[styles.tabItem, { left: 106 }]}>
          <Feather name="credit-card" size={24} color={INK} />
        </Pressable>
        <Pressable onPress={() => router.push("/agency/people/people-overview")} style={[styles.tabItem, { left: 227 }]}>
          <Feather name="users" size={24} color={INK} />
        </Pressable>
        <Pressable onPress={() => router.push("/agency/profile/profile-home")} style={[styles.tabItem, { left: 308 }]}>
          <Feather name="user" size={24} color={INK} />
        </Pressable>
      </Abs>

      {/* Centre FAB — overlaps the bar's top edge, so it is drawn as a sibling. */}
      <Abs x={157} y={736} w={60} h={60} radius={30} bg={PAGE_BG} center>
        <Pressable onPress={() => router.push("/agency/profile/add-reminder")} style={styles.fab}>
          <Feather name="plus" size={24} color={INK} />
        </Pressable>
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  avatar48: { position: "absolute", left: 0, top: 0, width: 48, height: 48 },

  alertCard: {
    position: "absolute",
    left: 20,
    top: 199.5,
    width: 335,
    height: 83.5,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: ALERT_BG,
  },

  rowShadow: {
    shadowColor: "#1e1e1e",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  setTarget: {
    position: "absolute",
    left: 161,
    top: 28,
    width: 107,
    height: 29,
    borderRadius: 14.5,
    backgroundColor: "#ffffff",
  },

  carousel: { paddingLeft: 26, paddingRight: 20, gap: CAMPAIGN_GAP, height: CAMPAIGN_H },
  carouselEmpty: { width: CAMPAIGN_W, height: CAMPAIGN_H, justifyContent: "center" },
  campaignCard: {
    width: CAMPAIGN_W,
    height: CAMPAIGN_H,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#1e1e1e",
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  brand: { maxWidth: 120 },
  tag: {
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: GLASS_60,
  },

  seeRequest: { position: "absolute", left: 268, top: 1386, width: 86, height: 20 },
  remindersSeeAll: { position: "absolute", left: 309.44, top: 1589, width: 44.56, height: 20 },
  serviceLeft: {
    position: "absolute",
    left: 23,
    top: 1422,
    width: 161.5,
    height: 110,
    borderRadius: 24,
    backgroundColor: CARD_BLUE,
  },
  serviceRight: {
    position: "absolute",
    left: 196.5,
    top: 1422,
    width: 161.5,
    height: 110,
    borderRadius: 24,
    backgroundColor: CARD_SAND,
  },

  bellButton: {
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

  tabBar: {
    shadowColor: "#1e1e1e",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  tabItem: {
    position: "absolute",
    top: 24,
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
    backgroundColor: PINK,
  },
});
