import { useMemo, useState, type ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { api } from "../../../src/api/client";
import {
  useCampaigns,
  useInvoices,
  useLeads,
  useNotifications,
  type Notification,
} from "../../../src/api/hooks";

/**
 * Notifications — Figma 7696:11834 (375x876), agency app.
 *
 * The operator's notification centre: dark-disc back header, a clipped Smart
 * Filter Segment (All / Priority / Campaigns / Payments) at y=100, the
 * "NEEDS YOUR ATTENTION" block of three tinted priority cards, then the
 * day-grouped feed. Coordinates below are raw frame coordinates from the spec;
 * <Screen> scales the 375pt canvas.
 *
 * Content runs to 1053 (last row bottom 1001.28 + the feed group's 52pt bottom
 * padding), past the 876 artboard, so the canvas is sized to the traced content
 * bottom and scrolls. Row heights are the two the spec draws — 76 for a
 * one-line body, 94.09 for two — and rows stack on the frame's 10pt gap, so any
 * row count lays out exactly as Figma's auto-layout would.
 *
 * The design draws two day groups; the feed builds them generically, so a
 * notification older than yesterday gets its own dated group on the same
 * geometry rather than being dropped.
 *
 * Geist (the header face) is not one of the two families registered in
 * app/_layout.tsx, so the title renders in Outfit at the traced size/tracking.
 */

type IconName = ComponentProps<typeof Feather>["name"];

/* -------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

const CARD_X = 20; // every chip / card / row column
const CARD_W = 335;

/** Feed group rhythm, all traced: "Today" text 547, its rows 580. */
const FIRST_HEADER_Y = 547;
const FIRST_ROWS_Y = 580;
const ROW_GAP = 10; // rows "Container" VERTICAL gap
const GROUP_GAP = 14; // "Grouped Notifications" VERTICAL gap
const DAY_HEADER_H = 33; // 14pt padding-top + 19pt text
const BOTTOM_PAD = 52; // "Grouped Notifications" padding-bottom
const ROW_H_1 = 76; // one-line body
const ROW_H_2 = 94.09; // two-line body

/* --------------------------- spec colour tokens --------------------------- */
const BG = "#F8F5EF";
const BACK_FILL = "#1F1A17";
const BACK_INK = "#FAF7F2";
const TITLE_INK = "#141311";
const INK_LABEL = "#999999";
const INK_DAY = "#1A1A1A";
const INK_BODY = "#777777";
const INK_TIME = "#AAAAAA";
const INK_CHIP_ON = "#2B2240";
const INK_CHIP_OFF = "#666666";
const INK_PRIORITY = "#3E2723";
const INK_SUB = "rgba(0,0,0,0.5)";
const INK_CAMPAIGN_SUB = "#737773";
const CHIP_ON_BG = "#D4DCFF";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const HAIRLINE_60 = "rgba(255,255,255,0.6)";
const HAIRLINE_80 = "rgba(255,255,255,0.8)";
const HAIRLINE_90 = "rgba(255,255,255,0.9)";

/* -------------------------------- filters --------------------------------- */
type Filter = "all" | "priority" | "campaigns" | "payments";

/** Chip x/w traced from the segment; every label sits 19pt inside its chip. */
const FILTERS: { key: Filter; label: string; x: number; w: number; tw: number }[] = [
  { key: "all", label: "All", x: 20, w: 55.52, tw: 17.52 },
  { key: "priority", label: "Priority", x: 85.52, w: 87.66, tw: 49.66 },
  { key: "campaigns", label: "Campaigns", x: 183.17, w: 114.56, tw: 76.56 },
  { key: "payments", label: "Payments", x: 307.73, w: 104.94, tw: 66.94 },
];
/** Chips overrun the 375 frame (last edge 412.67); the segment clips them. */
const SEGMENT_CONTENT_W = 432.67;

/** NotificationKind -> the chip that shows it. Priority has no column of its
 *  own in the schema, so it is the unread subset — what still needs acting on. */
const FILTER_KINDS: Record<"campaigns" | "payments", string[]> = {
  campaigns: ["CAMPAIGN", "CONTRACT"],
  payments: ["INVOICE"],
};

/** NotificationKind -> the row's icon pill, taken from the four traced rows. */
const KIND_STYLE: Record<string, { fg: string; bg: string; icon: IconName }> = {
  LEAD: { fg: "#9C27B0", bg: "rgba(156,39,176,0.1)", icon: "user-plus" },
  MESSAGE: { fg: "#9C27B0", bg: "rgba(156,39,176,0.1)", icon: "message-circle" },
  CAMPAIGN: { fg: "#F57C00", bg: "rgba(245,124,0,0.1)", icon: "clipboard" },
  CONTRACT: { fg: "#F57C00", bg: "rgba(245,124,0,0.1)", icon: "file-text" },
  INVOICE: { fg: "#388E3C", bg: "rgba(56,142,60,0.1)", icon: "dollar-sign" },
  REMINDER: { fg: "#1976D2", bg: "rgba(25,118,210,0.1)", icon: "bell" },
  LEAVE: { fg: "#1976D2", bg: "rgba(25,118,210,0.1)", icon: "calendar" },
  SYSTEM: { fg: "#1976D2", bg: "rgba(25,118,210,0.1)", icon: "trending-up" },
};
const FALLBACK_STYLE = KIND_STYLE.SYSTEM;

/* -------------------------------- helpers --------------------------------- */
const DAY_MS = 86_400_000;
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** "2m ago" / "1h ago" — the two relative forms the design draws for today. */
function relativeTime(iso: string): string {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;
}

/** "Today" / "Yesterday" / "12 Jul" — the day group's heading. */
function dayLabel(day: number, today: number): string {
  if (day === today) return "Today";
  if (day === today - DAY_MS) return "Yesterday";
  const d = new Date(day);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/**
 * Campaign carries no deadline column — `timeline` is free text ("10 Jul -
 * 20 Jul"), so the end of that range is the only deadline the schema can offer.
 * Returns null when it cannot be read, and the card then drops the day count
 * rather than inventing one.
 */
function daysUntilDeadline(timeline: string | undefined, now: number): number | null {
  if (!timeline) return null;
  const tail = timeline.split("-").pop() ?? "";
  const m = /(\d{1,2})\s*([A-Za-z]{3})/.exec(tail);
  if (!m) return null;
  const month = MONTHS.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
  if (month < 0) return null;
  const end = new Date(now);
  end.setMonth(month, Number(m[1]));
  end.setHours(23, 59, 59, 999);
  const days = Math.ceil((end.getTime() - now) / DAY_MS);
  return days >= 0 ? days : null;
}

/**
 * The body column is 171.03 wide at 14pt Inter Medium, which holds roughly 24
 * characters — past that the design's row grows to its two-line height.
 */
const bodyLinesOf = (body: string) => (body.length > 24 ? 2 : 1);

/* ----------------------------- priority card ------------------------------ */
interface PriorityCardProps {
  y: number;
  h: number;
  fill: string;
  stroke: string;
  /** DROP_SHADOW colour + the alpha the card and its icon pill each carry. */
  shadow: string;
  cardOpacity: number;
  pillOpacity: number;
  icon?: IconName;
  /** Text glyph drawn instead of a Feather icon (₹ has no Feather glyph). */
  iconGlyph?: string;
  iconInk: string;
  /** Child offsets, card-relative and already 1pt in from the stroke. */
  pillY: number;
  titleY: number;
  titleLines: number;
  subY: number;
  chevronY: number;
  title: string;
  sub: string;
  subColor: string;
  onPress: () => void;
}

/** 335-wide tinted card: 44pt icon pill, two-line text stack, chevron. */
function PriorityCard({
  y, h, fill, stroke, shadow, cardOpacity, pillOpacity, icon, iconGlyph, iconInk,
  pillY, titleY, titleLines, subY, chevronY, title, sub, subColor, onPress,
}: PriorityCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.priorityCard,
        { top: y, height: h, backgroundColor: fill, borderColor: stroke,
          shadowColor: shadow, shadowOpacity: cardOpacity },
        pressed && styles.pressed,
      ]}
    >
      {/* "Gradient" — the card's white radial sheen, top-left to transparent. */}
      <LinearGradient
        colors={["rgba(255,255,255,0.6)", "rgba(255,255,255,0)"] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 0.6 }}
        style={[styles.sheen, { height: h - 2 }]}
      />

      {/* Overlay+Shadow — 44pt white pill; Figma's r24 clamps to a circle. */}
      <Abs
        x={16} y={pillY} w={44} h={44} radius={22} bg={GLASS_80} center
        style={[styles.pillShadow, { shadowColor: shadow, shadowOpacity: pillOpacity }]}
      >
        {iconGlyph ? (
          <Txt size={24} weight="regular" font="inter" color={iconInk} lineHeight={28}>
            {iconGlyph}
          </Txt>
        ) : icon ? (
          <Feather name={icon} size={22} color={iconInk} />
        ) : null}
      </Abs>

      <Txt
        x={74} y={titleY} w={209}
        size={15} weight="bold" font="inter" color={INK_PRIORITY} lineHeight={18.15}
        numberOfLines={titleLines}
      >
        {title}
      </Txt>
      <Txt
        x={74} y={subY} w={209}
        size={13} weight="medium" font="inter" color={subColor} lineHeight={15.73}
        numberOfLines={1}
      >
        {sub}
      </Txt>

      <Abs x={297} y={chevronY} w={20} h={20} center>
        <Feather name="chevron-right" size={20} color={iconInk} />
      </Abs>
    </Pressable>
  );
}

/* -------------------------------- feed row -------------------------------- */
interface FeedRow {
  id: string;
  y: number;
  h: number;
  accent: string;
  tint: string;
  icon: IconName;
  title: string;
  body: string;
  bodyLines: number;
  time: string;
  unread: boolean;
  entityType?: string;
  entityId?: string;
}

/**
 * Glass notification row. Read and unread are a real visual state: unread keeps
 * the 90%-white card, the white stroke, the drop shadow and the 8pt accent dot
 * the Today group is drawn with; read drops to the 50%-white, un-shadowed,
 * dot-less treatment the Yesterday group uses.
 */
function Row({ row, onPress }: { row: FeedRow; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { top: row.y, height: row.h },
        row.unread ? styles.rowUnread : styles.rowRead,
        pressed && styles.pressed,
      ]}
    >
      {/* Overlay — 40pt tinted pill; Figma's r24 clamps to a circle. */}
      <Abs x={16} y={16} w={40} h={40} radius={20} bg={row.tint} center>
        <Feather name={row.icon} size={20} color={row.accent} />
      </Abs>

      <Txt
        x={70} y={16} w={171.03}
        size={15} weight="semibold" font="inter" color={INK_DAY} lineHeight={19.5}
        numberOfLines={1}
      >
        {row.title}
      </Txt>
      {row.body ? (
        <Txt
          x={70} y={39} w={171.03}
          size={14} weight="medium" font="inter" color={INK_BODY} lineHeight={18.2}
          numberOfLines={row.bodyLines}
        >
          {row.body}
        </Txt>
      ) : null}

      <Txt
        x={255.03} y={16} w={61.97}
        size={13} weight="medium" font="inter" color={INK_TIME} lineHeight={15.73}
        align="right" numberOfLines={1}
      >
        {row.time}
      </Txt>

      {row.unread ? <Abs x={309} y={40} w={8} h={8} radius={4} bg={row.accent} /> : null}
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
interface DayGroup {
  key: number;
  label: string;
  headerY: number;
  rows: FeedRow[];
}

export default function AgencyNotifications() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading } = useNotifications();
  const { data: leads = [] } = useLeads();
  const { data: campaigns = [] } = useCampaigns();
  const { data: invoices = [] } = useInvoices();

  const markRead = useMutation({
    mutationFn: (id: string) =>
      api<Notification>(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const items = useMemo(() => data?.items ?? [], [data]);

  /* ---- Priority block: a derived slice of the roster, not its own feed ---- */
  const needsResponse = leads.filter((l) => l.status === "NEW").length;

  const deadline = useMemo(() => {
    const now = Date.now();
    let soonest: { days: number; name: string } | null = null;
    let anyActive: string | null = null;
    for (const c of campaigns) {
      if (c.status !== "ACTIVE") continue;
      anyActive = anyActive ?? c.name;
      const days = daysUntilDeadline(c.timeline, now);
      if (days === null) continue;
      if (!soonest || days < soonest.days) soonest = { days, name: c.name };
    }
    return { soonest, anyActive };
  }, [campaigns]);

  const pending = invoices.find((i) => i.status !== "PAID");

  /* ---- Feed: filter, bucket by day, then stack on the traced geometry ---- */
  const { groups, contentBottom } = useMemo(() => {
    const visible =
      filter === "all"
        ? items
        : filter === "priority"
          ? items.filter((n) => !n.read)
          : items.filter((n) => FILTER_KINDS[filter].includes(n.kind));

    const today = startOfDay(Date.now());
    const byDay = new Map<number, Notification[]>();
    for (const n of visible) {
      const day = startOfDay(new Date(n.createdAt).getTime());
      const list = byDay.get(day);
      if (list) list.push(n);
      else byDay.set(day, [n]);
    }

    // Today always leads the feed, empty or not, so the heading the design
    // draws is never missing and the groups below it cannot jump.
    const days = [today, ...[...byDay.keys()].filter((d) => d !== today).sort((a, b) => b - a)];

    const built: DayGroup[] = [];
    let headerY = FIRST_HEADER_Y;
    let rowsY = FIRST_ROWS_Y;

    for (const day of days) {
      const label = dayLabel(day, today);
      let cursor = rowsY;
      const rows: FeedRow[] = (byDay.get(day) ?? []).map((n) => {
        const style = KIND_STYLE[n.kind] ?? FALLBACK_STYLE;
        const body = n.body ?? "";
        const lines = bodyLinesOf(body);
        const h = lines === 2 ? ROW_H_2 : ROW_H_1;
        const row: FeedRow = {
          id: n.id,
          y: cursor,
          h,
          accent: style.fg,
          tint: style.bg,
          icon: style.icon,
          title: n.title,
          body,
          bodyLines: lines,
          time: day === today ? relativeTime(n.createdAt) : label,
          unread: !n.read,
          entityType: n.entityType,
          entityId: n.entityId,
        };
        cursor += h + ROW_GAP;
        return row;
      });

      built.push({ key: day, label, headerY, rows });

      // An empty group still holds one row slot, so nothing below it shifts.
      const last = rows[rows.length - 1];
      const end = last ? last.y + last.h : rowsY + ROW_H_1;
      headerY = end + GROUP_GAP + 14; // next container + its 14pt padding-top
      rowsY = end + GROUP_GAP + DAY_HEADER_H + GROUP_GAP;
    }

    const lastGroup = built[built.length - 1];
    const lastRow = lastGroup.rows[lastGroup.rows.length - 1];
    return {
      groups: built,
      contentBottom: lastRow ? lastRow.y + lastRow.h : FIRST_ROWS_Y + ROW_H_1,
    };
  }, [items, filter]);

  /** Tapping a row clears its badge and opens whatever record it points at. */
  const openRow = (row: FeedRow) => {
    if (row.unread) markRead.mutate(row.id);
    switch ((row.entityType ?? "").toLowerCase()) {
      case "lead":
        router.push({ pathname: "/leads/lead-detail", params: { id: row.entityId ?? "" } });
        break;
      case "campaign":
      case "contract":
        router.push("/agency/campaigns/campaign-detail");
        break;
      case "invoice":
        router.push("/agency/payments/invoice-reminders");
        break;
      default:
        break;
    }
  };

  return (
    <Screen height={Math.max(FRAME_H, contentBottom + BOTTOM_PAD)} background={BG} scroll>
      {/* =============================== Header ============================== */}
      {/* Button — 36pt #1F1A17 disc holding the back arrow. */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16} color={BACK_INK} />
      </Pressable>
      {/* Heading 1 — Geist 500 20 / 24, -0.6 tracking. */}
      <Txt
        x={72} y={28} w={192}
        size={20} weight="medium" color={TITLE_INK} lineHeight={24} letterSpacing={-0.6}
        numberOfLines={1}
      >
        Notifications
      </Txt>

      {/* ========================= Smart Filter Segment ======================= */}
      {/* The chip row is authored 412.67 wide inside a 375 clip box, so it
          scrolls sideways to reach the Payments chip the frame cuts off. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.segment}
        contentContainerStyle={styles.segmentContent}
      >
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={({ pressed }) => [
                styles.chip,
                { left: f.x, width: f.w },
                active ? styles.chipOn : styles.chipOff,
                pressed && styles.pressed,
              ]}
            >
              <Txt
                x={18} y={8} w={f.tw}
                size={14} weight="semibold" font="inter" lineHeight={16.94}
                color={active ? INK_CHIP_ON : INK_CHIP_OFF}
                numberOfLines={1}
              >
                {f.label}
              </Txt>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* =========================== Priority Section ======================== */}
      <Txt
        x={20} y={197} w={335}
        size={13} weight="bold" font="inter" color={INK_LABEL} lineHeight={15.73}
        letterSpacing={0.8}
      >
        NEEDS YOUR ATTENTION
      </Txt>

      <PriorityCard
        y={227} h={78}
        fill="#E2EBE2" stroke="#E8E2D9"
        shadow="#FF7043" cardOpacity={0.08} pillOpacity={0.12}
        icon="alert-circle" iconInk="#1E1E1E"
        pillY={16} titleY={19} titleLines={1} subY={41} chevronY={28}
        title={`${needsResponse} ${needsResponse === 1 ? "lead needs" : "leads need"} response`}
        sub="Tap to review"
        subColor={INK_SUB}
        onPress={() => router.push("/agency/leads/leads-list")}
      />
      <PriorityCard
        y={317} h={90}
        fill="#FFEBEE" stroke={HAIRLINE_90}
        shadow="#E53935" cardOpacity={0.06} pillOpacity={0.1}
        icon="clock" iconInk="#333333"
        pillY={22} titleY={16} titleLines={2} subY={56} chevronY={34}
        title={
          deadline.soonest
            ? `Campaign deadline in ${deadline.soonest.days} ${
                deadline.soonest.days === 1 ? "day" : "days"
              }`
            : "Campaign deadline"
        }
        sub={deadline.soonest?.name ?? deadline.anyActive ?? "No active campaigns"}
        subColor={INK_CAMPAIGN_SUB}
        onPress={() => router.push("/agency/campaigns/active-campaigns")}
      />
      <PriorityCard
        y={419} h={78}
        fill="#FFF3E0" stroke={HAIRLINE_90}
        shadow="#F57C00" cardOpacity={0.06} pillOpacity={0.1}
        iconGlyph="₹" iconInk="#333333"
        pillY={16} titleY={19} titleLines={1} subY={41} chevronY={28}
        title={pending ? `Payment pending from ${pending.brandName}` : "No payments pending"}
        sub="Tap to review"
        subColor={INK_SUB}
        onPress={() => router.push("/agency/payments/invoice-reminders")}
      />

      {/* ======================== Grouped Notifications ====================== */}
      {groups.map((g) => (
        <Txt
          key={`h-${g.key}`}
          x={20} y={g.headerY} w={335}
          size={16} weight="bold" font="inter" color={INK_DAY} lineHeight={19.36}
        >
          {g.label}
        </Txt>
      ))}
      {groups.map((g) => g.rows.map((row) => (
        <Row key={row.id} row={row} onPress={() => openRow(row)} />
      )))}

      {/* Loading / empty state sits in the first group's row slot, so the
          traced geometry below it never moves. */}
      {groups[0].rows.length === 0 ? (
        <Txt
          x={36} y={FIRST_ROWS_Y + 16} w={303}
          size={14} weight="medium" font="inter" color={INK_BODY} lineHeight={18.2}
        >
          {isLoading ? "Loading notifications…" : "No notifications"}
        </Txt>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },
  sheen: { position: "absolute", left: 0, top: 0, right: 0, borderRadius: 20 },

  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BACK_FILL,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },

  segment: { position: "absolute", left: 0, top: 100, width: FRAME_W, height: 71 },
  segmentContent: { width: SEGMENT_CONTENT_W, height: 71 },
  chip: {
    position: "absolute",
    top: 16,
    height: 35,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipOn: {
    backgroundColor: CHIP_ON_BG,
    borderColor: "#FFFFFF",
    shadowColor: "#9C27B0",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chipOff: {
    backgroundColor: GLASS_60,
    borderColor: HAIRLINE_80,
  },

  priorityCard: {
    position: "absolute",
    left: CARD_X,
    width: CARD_W,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  pillShadow: {
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  row: {
    position: "absolute",
    left: CARD_X,
    width: CARD_W,
    borderRadius: 20,
    borderWidth: 1,
  },
  rowUnread: {
    backgroundColor: GLASS_90,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  rowRead: {
    backgroundColor: GLASS_50,
    borderColor: HAIRLINE_60,
  },
});
