import { useMemo, useState, type ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
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
 * Notifications — Figma 7333:17565 (375x875).
 *
 * Pushed notification centre: glass back header, a clipped Smart Filter Segment
 * (All / Priority / Campaigns / Payments), the "NEEDS YOUR ATTENTION" block of
 * three gradient priority cards, then the day-grouped feed. Coordinates below
 * are raw frame coordinates from the spec; <Screen> scales the 375pt canvas.
 *
 * The design's feed frame clips at y=857 because the list scrolls inside it, so
 * the canvas height is the traced content bottom (last row + the group's 52pt
 * bottom padding) rather than the 875 artboard — that is what makes the whole
 * traced column reachable. Row heights are the two the spec draws (76 for a
 * one-line body, 94.09 for two) and rows stack on the frame's 10pt gap, so any
 * row count lays out exactly as Figma's auto-layout would.
 */

type IconName = ComponentProps<typeof Feather>["name"];

/* -------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const CARD_X = 20; // every card/row column
const CARD_W = 335;
const ROW_GAP = 10; // "Container" VERTICAL gap in both day groups
const GROUP_GAP = 14; // gap between header container and rows container
const TODAY_ROWS_Y = 586;
const YESTERDAY_HEADER_H = 33; // 14 padding-top + 19 text
const BOTTOM_PAD = 52; // "Grouped Notifications" padding-bottom

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1D1D1F";
const INK_LABEL = "#999999";
const INK_DAY = "#1A1A1A";
const INK_BODY = "#777777";
const INK_TIME = "#AAAAAA";
const INK_CHIP_ON = "#2B2240";
const INK_CHIP_OFF = "#666666";
const INK_PRIORITY = "#3E2723";
const INK_SUB = "rgba(0,0,0,0.5)";

/* -------------------------------- filters --------------------------------- */
type Filter = "all" | "priority" | "campaigns" | "payments";

/** Chip x/w traced from the segment; the label sits 18pt inside every chip. */
const FILTERS: { key: Filter; label: string; x: number; w: number; tw: number }[] = [
  { key: "all", label: "All", x: 20, w: 55.52, tw: 17.52 },
  { key: "priority", label: "Priority", x: 85.52, w: 87.66, tw: 49.66 },
  { key: "campaigns", label: "Campaigns", x: 183.17, w: 114.56, tw: 76.56 },
  { key: "payments", label: "Payments", x: 307.73, w: 104.94, tw: 66.94 },
];

/** NotificationKind -> the chip that shows it. */
const FILTER_KINDS: Record<Exclude<Filter, "all">, string[]> = {
  priority: ["LEAD", "SYSTEM", "REMINDER"],
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

/** entityType -> the detail screen a row deep-links to. */
const ROUTE_OF_ENTITY: Record<string, string> = {
  lead: "/leads/lead-detail",
  campaign: "/campaigns/campaign-brief",
  contract: "/campaigns/campaign-brief",
  invoice: "/campaigns/invoice-select-campaign",
};

/* -------------------------------- helpers --------------------------------- */
const DAY_MS = 86_400_000;

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

/**
 * The body column is 171.03 wide at 14pt Inter Medium, which holds roughly 24
 * characters — past that the design's row grows to its two-line height.
 */
const bodyLinesOf = (body: string) => (body.length > 24 ? 2 : 1);

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#haze)" />
    </Svg>
  );
}

/* ----------------------------- priority card ------------------------------ */
interface PriorityCardProps {
  y: number;
  from: string;
  to: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  shadow: string;
  cardOpacity: number;
  pillOpacity: number;
  accent: string;
  icon: IconName;
  title: string;
  sub: string;
  subColor: string;
  onPress: () => void;
}

/**
 * 335-wide gradient card. Figma hugs its content, so the height is the taller of
 * the 44pt icon pill and the text stack, plus the 16pt padding and 1pt stroke a
 * side — which reproduces the traced 78 / 90 / 78 exactly.
 */
function PriorityCard({
  y, from, to, start, end, shadow, cardOpacity, pillOpacity,
  accent, icon, title, sub, subColor, onPress,
}: PriorityCardProps) {
  const titleLines = title.includes("\n") ? 2 : 1;
  const titleH = titleLines === 2 ? 36 : 18;
  const textH = titleH + 4 + 16;
  const h = Math.max(44, textH) + 34;
  const inner = h - 2;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.priorityCard,
        { top: y, height: h, shadowColor: shadow, shadowOpacity: cardOpacity },
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={[from, to] as const}
        start={start}
        end={end}
        style={[styles.fill, { height: inner }]}
      />
      <LinearGradient
        colors={["rgba(255,255,255,0.6)", "rgba(255,255,255,0)"] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 0.6 }}
        style={[styles.fill, { height: inner }]}
      />

      <Abs
        x={16}
        y={(inner - 44) / 2}
        w={44}
        h={44}
        radius={14}
        bg="rgba(255,255,255,0.8)"
        center
        style={[styles.pillShadow, { shadowColor: shadow, shadowOpacity: pillOpacity }]}
      >
        <Feather name={icon} size={22} color={accent} />
      </Abs>

      <Txt
        x={74}
        y={(inner - textH) / 2}
        w={209}
        size={15}
        weight="bold"
        font="inter"
        color={INK_PRIORITY}
        lineHeight={18.15}
        numberOfLines={titleLines}
      >
        {title}
      </Txt>
      <Txt
        x={74}
        y={(inner - textH) / 2 + titleH + 4}
        w={209}
        size={13}
        weight="medium"
        font="inter"
        color={subColor}
        lineHeight={15.73}
        numberOfLines={1}
      >
        {sub}
      </Txt>

      <Abs x={297} y={(inner - 20) / 2} w={20} h={20} center>
        <Feather name="chevron-right" size={20} color={accent} />
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
}

/**
 * Glass notification row. Read and unread are a real visual state: unread keeps
 * the 90%-white card, the white stroke, the drop shadow and the 8pt accent dot;
 * read drops to the 50%-white, un-shadowed, dot-less treatment the design uses
 * for the Yesterday group.
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
      <Abs x={16} y={16} w={40} h={40} radius={12} bg={row.tint} center>
        <Feather name={row.icon} size={20} color={row.accent} />
      </Abs>

      <Txt
        x={70}
        y={16}
        w={171.03}
        size={15}
        weight="semibold"
        font="inter"
        color={INK_DAY}
        lineHeight={19.5}
        numberOfLines={1}
      >
        {row.title}
      </Txt>
      {row.body ? (
        <Txt
          x={70}
          y={39}
          w={171.03}
          size={14}
          weight="medium"
          font="inter"
          color={INK_BODY}
          lineHeight={18.2}
          numberOfLines={row.bodyLines}
        >
          {row.body}
        </Txt>
      ) : null}

      <Txt
        x={255.03}
        y={16}
        w={61.97}
        size={13}
        weight="medium"
        font="inter"
        color={INK_TIME}
        lineHeight={15.73}
        align="right"
        numberOfLines={1}
      >
        {row.time}
      </Txt>

      {row.unread ? <Abs x={309} y={40} w={8} h={8} radius={4} bg={row.accent} /> : null}
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function Notifications() {
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

  /* Priority block — a derived slice, not its own endpoint. */
  const leadsNeeding = leads.filter((l) => l.status === "NEW").length;
  const deadlineCampaign =
    campaigns.find((c) => c.status === "ACTIVE")?.name ?? "Urban Tech SS24";
  const pendingBrand =
    invoices.find((i) => i.status !== "PAID")?.brandName ?? "Nike";

  /* Feed — filter, bucket by day, then stack on the traced geometry. */
  const { todayRows, yesterdayRows, yesterdayHeaderY, contentBottom } = useMemo(() => {
    const kinds = filter === "all" ? null : FILTER_KINDS[filter];
    const visible = kinds ? items.filter((n) => kinds.includes(n.kind)) : items;

    const today = startOfDay(Date.now());
    const inToday: Notification[] = [];
    const inYesterday: Notification[] = [];
    for (const n of visible) {
      const bucket = startOfDay(new Date(n.createdAt).getTime());
      if (bucket === today) inToday.push(n);
      else if (bucket === today - DAY_MS) inYesterday.push(n);
    }

    const build = (list: Notification[], startY: number, yesterday: boolean): FeedRow[] => {
      let cursor = startY;
      return list.map((n) => {
        const style = KIND_STYLE[n.kind] ?? FALLBACK_STYLE;
        const body = n.body ?? "";
        const lines = bodyLinesOf(body);
        const h = lines === 2 ? 94.09 : 76;
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
          time: yesterday ? "Yesterday" : relativeTime(n.createdAt),
          unread: !n.read,
          entityType: n.entityType,
        };
        cursor += h + ROW_GAP;
        return row;
      });
    };

    const todays = build(inToday, TODAY_ROWS_Y, false);
    const last = todays[todays.length - 1];
    // An empty Today group still occupies one row slot, so the Yesterday header
    // never jumps when the feed loads.
    const todayEnd = last ? last.y + last.h : TODAY_ROWS_Y + 76;
    const headerY = todayEnd + GROUP_GAP;
    const yesterdays = build(
      inYesterday,
      headerY + YESTERDAY_HEADER_H + GROUP_GAP,
      true
    );
    const lastY = yesterdays[yesterdays.length - 1];

    return {
      todayRows: todays,
      yesterdayRows: yesterdays,
      yesterdayHeaderY: headerY,
      contentBottom: lastY ? lastY.y + lastY.h : todayEnd,
    };
  }, [items, filter]);

  const openRow = (row: FeedRow) => {
    if (row.unread) markRead.mutate(row.id);
    const route = ROUTE_OF_ENTITY[(row.entityType ?? "").toLowerCase()];
    if (route) router.push(route as never);
  };

  return (
    <Screen
      height={Math.max(FRAME_H, contentBottom + BOTTOM_PAD)}
      background="#F7F0E4"
      scroll
    >
      <Backdrop />

      {/* Header */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color="#1C1C1E" />
      </Pressable>
      <Txt
        x={124}
        y={30}
        w={154}
        size={16}
        weight="bold"
        font="inter"
        color={INK_TITLE}
        lineHeight={19.36}
        align="center"
      >
        Notifications
      </Txt>

      {/* Smart Filter Segment — clips at the frame edge, as in the design */}
      <Abs x={0} y={106} w={FRAME_W} h={71} style={styles.clip}>
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
              {active ? (
                <LinearGradient
                  colors={["#EBE4FF", "#FFEBF2"] as const}
                  start={{ x: 0.1, y: -0.16 }}
                  end={{ x: 0.9, y: 1.16 }}
                  style={[styles.fill, { height: 33 }]}
                />
              ) : null}
              <Txt
                x={18}
                y={8}
                w={f.tw}
                size={14}
                weight="semibold"
                font="inter"
                color={active ? INK_CHIP_ON : INK_CHIP_OFF}
                lineHeight={16.94}
                numberOfLines={1}
              >
                {f.label}
              </Txt>
            </Pressable>
          );
        })}
      </Abs>

      {/* Priority Section */}
      <Txt
        x={20}
        y={203}
        w={335}
        size={13}
        weight="bold"
        font="inter"
        color={INK_LABEL}
        lineHeight={15.73}
        letterSpacing={0.8}
      >
        NEEDS YOUR ATTENTION
      </Txt>

      <PriorityCard
        y={233}
        from="rgba(255,235,238,0.95)"
        to="rgba(255,243,224,0.95)"
        start={{ x: 0.19, y: -0.85 }}
        end={{ x: 0.81, y: 1.85 }}
        shadow="#FF7043"
        cardOpacity={0.08}
        pillOpacity={0.12}
        accent="#FF7043"
        icon="alert-circle"
        title={`${leadsNeeding} leads need response`}
        sub="Tap to review"
        subColor={INK_SUB}
        onPress={() => router.push("/leads/leads" as never)}
      />
      <PriorityCard
        y={323}
        from="rgba(255,235,238,0.95)"
        to="rgba(253,237,236,0.95)"
        start={{ x: 0.18, y: -0.67 }}
        end={{ x: 0.82, y: 1.67 }}
        shadow="#E53935"
        cardOpacity={0.06}
        pillOpacity={0.1}
        accent="#E53935"
        icon="clock"
        title={"Campaign deadline in 2\ndays"}
        sub={deadlineCampaign}
        subColor="rgba(229,57,53,0.7)"
        onPress={() => router.push("/campaigns/active-campaigns" as never)}
      />
      <PriorityCard
        y={425}
        from="rgba(255,243,224,0.95)"
        to="rgba(255,236,179,0.95)"
        start={{ x: 0.19, y: -0.85 }}
        end={{ x: 0.81, y: 1.85 }}
        shadow="#F57C00"
        cardOpacity={0.06}
        pillOpacity={0.1}
        accent="#F57C00"
        icon="dollar-sign"
        title={`Payment pending from ${pendingBrand}`}
        sub="Tap to review"
        subColor={INK_SUB}
        onPress={() => router.push("/campaigns/invoice-select-campaign" as never)}
      />

      {/* Grouped Notifications: Today */}
      <Txt
        x={20}
        y={553}
        w={335}
        size={16}
        weight="bold"
        font="inter"
        color={INK_DAY}
        lineHeight={19.36}
      >
        Today
      </Txt>
      {todayRows.map((row) => (
        <Row key={row.id} row={row} onPress={() => openRow(row)} />
      ))}
      {!isLoading && todayRows.length === 0 ? (
        <Txt
          x={36}
          y={TODAY_ROWS_Y + 16}
          w={303}
          size={14}
          weight="medium"
          font="inter"
          color={INK_BODY}
          lineHeight={18.2}
        >
          No notifications
        </Txt>
      ) : null}

      {/* Grouped Notifications: Yesterday */}
      {yesterdayRows.length ? (
        <>
          <Txt
            x={20}
            y={yesterdayHeaderY + 14}
            w={335}
            size={16}
            weight="bold"
            font="inter"
            color={INK_DAY}
            lineHeight={19.36}
          >
            Yesterday
          </Txt>
          {yesterdayRows.map((row) => (
            <Row key={row.id} row={row} onPress={() => openRow(row)} />
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },
  fill: { position: "absolute", left: 0, top: 0, right: 0, borderRadius: 20 },

  backButton: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  chip: {
    position: "absolute",
    top: 16,
    height: 35,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  chipOn: {
    borderColor: "#FFFFFF",
    shadowColor: "#9C27B0",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chipOff: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderColor: "rgba(255,255,255,0.8)",
  },

  priorityCard: {
    position: "absolute",
    left: CARD_X,
    width: CARD_W,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    overflow: "hidden",
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  pillShadow: {
    shadowRadius: 6,
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
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  rowRead: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderColor: "rgba(255,255,255,0.6)",
  },
});
