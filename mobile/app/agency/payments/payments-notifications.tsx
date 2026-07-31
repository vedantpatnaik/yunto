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
 * Notifications — Payments filter — Figma 7696:11834 (375x876), agency app.
 *
 * The money inbox. Figma ships one notification frame with the Smart Filter
 * Segment (All / Priority / Campaigns / Payments) drawn on "All"; there is no
 * separate filtered artboard, so Payments is the same traced screen with the
 * segment selection held in state and defaulted to the money tab — which is
 * what this route is for. Selecting a chip filters both halves of the body:
 * the pinned "NEEDS YOUR ATTENTION" cards and the day-grouped feed beneath.
 *
 * Coordinates are raw frame coordinates from the spec; <Screen> scales the
 * 375pt canvas. Content runs past the 876 artboard (last traced row bottom
 * 1001.28 plus the feed group's 52pt bottom padding), so the canvas is sized to
 * the real content bottom and scrolls.
 *
 * Everything below y=189 reflows the way Figma's auto-layout would: the three
 * attention cards stack from 227 on the container's 12pt gap, the feed follows
 * at the section's 24 + 18 + 8 offsets, and rows stack on the 10pt row gap at
 * the two heights the spec draws (76 one-line body, 94.09 two-line). Filtering
 * therefore never breaks the rhythm — it only shortens it.
 *
 * Geist (the header face) is not one of the two families registered in
 * app/_layout.tsx, so the title renders in Outfit at the traced size/tracking.
 */

type IconName = ComponentProps<typeof Feather>["name"];

/**
 * Feather ships no rupee sign, but the spec draws one for both money icons —
 * the payment card's 22pt pill (VECTOR 11x16.5) and the INVOICE row's 20pt pill
 * (VECTOR 10x15) — so those two render the ₹ glyph as text at the icon's size.
 */
const RUPEE = "₹" as const;
type Glyph = IconName | typeof RUPEE;

function Icon({ name, size, color }: { name: Glyph; size: number; color: string }) {
  return name === RUPEE ? (
    <Txt size={size} weight="medium" font="inter" color={color}>
      {RUPEE}
    </Txt>
  ) : (
    <Feather name={name} size={size} color={color} />
  );
}

/* -------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

const CARD_X = 20; // every chip / card / row shares this column
const CARD_W = 335;

/** Priority Section: label at 197, cards container at 227 on a 12pt gap. */
const LABEL_Y = 197;
const ATTENTION_Y = 227;
const ATTENTION_GAP = 12;
const SECTION_PAD_BOTTOM = 24; // "Priority Section" padding-bottom
const SECTION_GAP = 18; // outer VERTICAL gap to the feed group
const GROUP_PAD_TOP = 8; // "Grouped Notifications" padding-top

/** Feed rhythm — the traced values these offsets reproduce: 547 / 580. */
const GROUP_GAP = 14; // "Grouped Notifications" VERTICAL gap
const ROW_GAP = 10; // rows "Container" VERTICAL gap
const DAY_HEADER_H = 19; // day heading text height
const DAY_BLOCK_H = 33; // 14pt padding-top + the 19pt heading
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
const INK_ATTENTION = "#3E2723";
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
/** Opening offset that brings the clipped Payments chip fully into view. */
const SEGMENT_START_X = SEGMENT_CONTENT_W - FRAME_W;

/**
 * NotificationKind -> the chip that shows it. Payments is the invoice feed —
 * the schema's only money kind. Priority has no column of its own, so it is the
 * unread subset: what still needs acting on.
 */
const FILTER_KINDS: Record<"campaigns" | "payments", string[]> = {
  campaigns: ["CAMPAIGN", "CONTRACT"],
  payments: ["INVOICE"],
};

/** NotificationKind -> the row's icon pill, taken from the four traced rows. */
const KIND_STYLE: Record<string, { fg: string; bg: string; icon: Glyph }> = {
  LEAD: { fg: "#9C27B0", bg: "rgba(156,39,176,0.1)", icon: "user-plus" },
  MESSAGE: { fg: "#9C27B0", bg: "rgba(156,39,176,0.1)", icon: "message-circle" },
  CAMPAIGN: { fg: "#F57C00", bg: "rgba(245,124,0,0.1)", icon: "clipboard" },
  CONTRACT: { fg: "#F57C00", bg: "rgba(245,124,0,0.1)", icon: "file-text" },
  INVOICE: { fg: "#388E3C", bg: "rgba(56,142,60,0.1)", icon: RUPEE },
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
 * The body column is 14pt Inter Medium, roughly 7.15pt per character, so a body
 * past that many characters is what makes the design's row grow to its taller
 * two-line height.
 */
const bodyLinesOf = (body: string, width: number) =>
  body.length > Math.floor(width / 7.15) ? 2 : 1;

/* ---------------------------- attention cards ----------------------------- */
/**
 * A pinned "NEEDS YOUR ATTENTION" card. The three the spec draws are one
 * component with different paints, heights and child offsets — all traced —
 * plus the filter chip each belongs to.
 */
interface AttentionCard {
  key: string;
  chip: Exclude<Filter, "all">;
  h: number;
  fill: string;
  stroke: string;
  /** DROP_SHADOW colour, plus the alpha the card and its icon pill each carry. */
  shadow: string;
  cardOpacity: number;
  pillOpacity: number;
  icon: Glyph;
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
  route: string;
}

/** 335-wide tinted card: 44pt icon pill, two-line text stack, chevron. */
function AttentionRow({ card, y, onPress }: { card: AttentionCard; y: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.attentionCard,
        {
          top: y,
          height: card.h,
          backgroundColor: card.fill,
          borderColor: card.stroke,
          shadowColor: card.shadow,
          shadowOpacity: card.cardOpacity,
        },
        pressed && styles.pressed,
      ]}
    >
      {/* "Gradient" — the card's white radial sheen, top-left to transparent. */}
      <LinearGradient
        colors={["rgba(255,255,255,0.6)", "rgba(255,255,255,0)"] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 0.6 }}
        style={[styles.sheen, { height: card.h - 2 }]}
      />

      {/* Overlay+Shadow — 44pt white pill; Figma's r24 clamps to a circle. */}
      <Abs
        x={16} y={card.pillY} w={44} h={44} radius={22} bg={GLASS_80} center
        style={[styles.pillShadow, { shadowColor: card.shadow, shadowOpacity: card.pillOpacity }]}
      >
        <Icon name={card.icon} size={22} color={card.iconInk} />
      </Abs>

      <Txt
        x={74} y={card.titleY} w={209}
        size={15} weight="bold" font="inter" color={INK_ATTENTION} lineHeight={18.15}
        numberOfLines={card.titleLines}
      >
        {card.title}
      </Txt>
      <Txt
        x={74} y={card.subY} w={209}
        size={13} weight="medium" font="inter" color={card.subColor} lineHeight={15.73}
        numberOfLines={1}
      >
        {card.sub}
      </Txt>

      <Abs x={297} y={card.chevronY} w={20} h={20} center>
        <Feather name="chevron-right" size={20} color={card.iconInk} />
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
  icon: Glyph;
  title: string;
  body: string;
  bodyW: number;
  bodyLines: number;
  time: string;
  timeX: number;
  timeW: number;
  unread: boolean;
  entityType?: string;
  entityId?: string;
}

/**
 * Glass notification row. Read and unread are a real visual state: unread keeps
 * the 90%-white card, the white stroke, the drop shadow and the 8pt accent dot
 * the Today group is drawn with; read drops to the 50%-white, un-shadowed,
 * dot-less treatment the Yesterday group uses — which also widens the timestamp
 * column from 46.31 to 61.97, exactly as the spec has it.
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
        <Icon name={row.icon} size={20} color={row.accent} />
      </Abs>

      <Txt
        x={70} y={16} w={row.bodyW}
        size={15} weight="semibold" font="inter" color={INK_DAY} lineHeight={19.5}
        numberOfLines={1}
      >
        {row.title}
      </Txt>
      {row.body ? (
        <Txt
          x={70} y={39} w={row.bodyW}
          size={14} weight="medium" font="inter" color={INK_BODY} lineHeight={18.2}
          numberOfLines={row.bodyLines}
        >
          {row.body}
        </Txt>
      ) : null}

      <Txt
        x={row.timeX} y={16} w={row.timeW}
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

export default function PaymentsNotifications() {
  const router = useRouter();
  const qc = useQueryClient();
  // This route is the money inbox, so the segment opens on Payments; the chips
  // still switch the same list client-side, as the single Figma frame implies.
  const [filter, setFilter] = useState<Filter>("payments");

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

  /* ---- Attention block: derived from the roster, not its own feed ---- */
  const cards = useMemo(() => {
    const now = Date.now();

    const needsResponse = leads.filter((l) => l.status === "NEW").length;

    let soonest: { days: number; name: string } | null = null;
    let anyActive: string | null = null;
    for (const c of campaigns) {
      if (c.status !== "ACTIVE") continue;
      anyActive = anyActive ?? c.name;
      const days = daysUntilDeadline(c.timeline, now);
      if (days === null) continue;
      if (!soonest || days < soonest.days) soonest = { days, name: c.name };
    }

    // OVERDUE first — it is the payment that actually needs chasing.
    const pending =
      invoices.find((i) => i.status === "OVERDUE") ?? invoices.find((i) => i.status !== "PAID");

    const all: AttentionCard[] = [
      {
        key: "leads",
        chip: "priority",
        h: 78,
        fill: "#E2EBE2", stroke: "#E8E2D9",
        shadow: "#FF7043", cardOpacity: 0.08, pillOpacity: 0.12,
        icon: "alert-circle", iconInk: "#1E1E1E",
        pillY: 16, titleY: 19, titleLines: 1, subY: 41, chevronY: 28,
        title: `${needsResponse} ${needsResponse === 1 ? "lead needs" : "leads need"} response`,
        sub: "Tap to review",
        subColor: INK_SUB,
        route: "/leads/leads",
      },
      {
        key: "deadline",
        chip: "campaigns",
        h: 90,
        fill: "#FFEBEE", stroke: HAIRLINE_90,
        shadow: "#E53935", cardOpacity: 0.06, pillOpacity: 0.1,
        icon: "clock", iconInk: "#333333",
        pillY: 22, titleY: 16, titleLines: 2, subY: 56, chevronY: 34,
        title: soonest
          ? `Campaign deadline in ${soonest.days} ${soonest.days === 1 ? "day" : "days"}`
          : "Campaign deadline",
        sub: soonest?.name ?? anyActive ?? "No active campaigns",
        subColor: INK_CAMPAIGN_SUB,
        route: "/campaigns/active-campaigns",
      },
      {
        key: "payment",
        chip: "payments",
        h: 78,
        fill: "#FFF3E0", stroke: HAIRLINE_90,
        shadow: "#F57C00", cardOpacity: 0.06, pillOpacity: 0.1,
        icon: RUPEE, iconInk: "#333333",
        pillY: 16, titleY: 19, titleLines: 1, subY: 41, chevronY: 28,
        title: pending ? `Payment pending from ${pending.brandName}` : "No payments pending",
        sub: "Tap to review",
        subColor: INK_SUB,
        route: "/payments/invoice-hub",
      },
    ];

    // All and Priority keep the pinned block whole; the two topic chips narrow
    // it to their own card, so the filter reads across the entire body.
    return filter === "all" || filter === "priority"
      ? all
      : all.filter((c) => c.chip === filter);
  }, [leads, campaigns, invoices, filter]);

  /* ---- Stack the attention cards, then cascade the feed beneath them ---- */
  const { placed, feedTop } = useMemo(() => {
    let cursor = ATTENTION_Y;
    const out = cards.map((card) => {
      const y = cursor;
      cursor += card.h + ATTENTION_GAP;
      return { card, y };
    });
    // An empty block still holds one card slot, so nothing below it shifts.
    const bottom = out.length ? cursor - ATTENTION_GAP : ATTENTION_Y + ROW_H_1;
    return {
      placed: out,
      feedTop: bottom + SECTION_PAD_BOTTOM + SECTION_GAP + GROUP_PAD_TOP,
    };
  }, [cards]);

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
    let headerY = feedTop;
    let rowsY = feedTop + DAY_HEADER_H + GROUP_GAP;

    for (const day of days) {
      const label = dayLabel(day, today);
      let cursor = rowsY;
      const rows: FeedRow[] = (byDay.get(day) ?? []).map((n) => {
        const style = KIND_STYLE[n.kind] ?? FALLBACK_STYLE;
        const body = n.body ?? "";
        const unread = !n.read;
        const bodyW = unread ? 186.69 : 171.03;
        const lines = bodyLinesOf(body, bodyW);
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
          bodyW,
          bodyLines: lines,
          time: day === today ? relativeTime(n.createdAt) : label,
          timeX: unread ? 270.69 : 255.03,
          timeW: unread ? 46.31 : 61.97,
          unread,
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
      rowsY = end + GROUP_GAP + DAY_BLOCK_H + GROUP_GAP;
    }

    const lastGroup = built[built.length - 1];
    const lastRow = lastGroup.rows[lastGroup.rows.length - 1];
    return {
      groups: built,
      contentBottom: lastRow
        ? lastRow.y + lastRow.h
        : feedTop + DAY_HEADER_H + GROUP_GAP + ROW_H_1,
    };
  }, [items, filter, feedTop]);

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
      {/* Button — 36pt #1F1A17 disc holding the 9.45pt back chevron. */}
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
          scrolls sideways — and opens scrolled to the end, because the chip this
          route selects is the one the frame cuts off. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: SEGMENT_START_X, y: 0 }}
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
        x={20} y={LABEL_Y} w={335}
        size={13} weight="bold" font="inter" color={INK_LABEL} lineHeight={15.73}
        letterSpacing={0.8}
      >
        NEEDS YOUR ATTENTION
      </Txt>

      {placed.map(({ card, y }) => (
        <AttentionRow key={card.key} card={card} y={y} onPress={() => router.push(card.route)} />
      ))}
      {placed.length === 0 ? (
        <Abs
          x={CARD_X} y={ATTENTION_Y} w={CARD_W} h={ROW_H_1} radius={20}
          bg={GLASS_60} border={HAIRLINE_80} borderWidth={1} center
        >
          <Txt size={14} weight="medium" font="inter" color={INK_BODY} lineHeight={18.2}>
            {isLoading ? "Loading…" : "Nothing needs your attention"}
          </Txt>
        </Abs>
      ) : null}

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
          x={36} y={feedTop + DAY_HEADER_H + GROUP_GAP + 16} w={303}
          size={14} weight="medium" font="inter" color={INK_BODY} lineHeight={18.2}
        >
          {isLoading
            ? "Loading notifications…"
            : filter === "payments"
              ? "No payment updates"
              : "No notifications"}
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

  attentionCard: {
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
