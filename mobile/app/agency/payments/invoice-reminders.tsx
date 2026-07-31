import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useReminders, type Reminder } from "../../../src/api/hooks";

/**
 * Reminders — Figma frame 7711:22526 (375x876), traced 1:1.
 *
 * The payments flow's task list: the invoicing work an agency operator owes
 * somebody — "Send invoice to Sephora", "Payout batch to creators". Layout is
 * an 80pt header band (dark 36pt back pill + heading), the counted
 * Today / Schedule / All segment inside the 375x81 "Tabs" clip at y=106, the
 * 375x575 "Reminders List" clip at y=205 holding 335x195 glass cards on a 211pt
 * step, and the floating "Add Reminder" pill at (71,791) 232x56.
 *
 * The frame draws three cards (617pt) into a 575pt clip box, so the third is cut
 * 42pt short by design. That is reproduced rather than corrected: the list is a
 * fixed clip rect, not a scroller, and renders at most MAX_CARDS rows.
 *
 * Geist — the heading's face in Figma — is not registered in app/_layout.tsx, so
 * the heading renders in Inter, which is the frame's own body family anyway.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* -------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

const LIST_Y = 205; // "Reminders List" frame origin
const LIST_H = 575;
const CARD_W = 335;
const CARD_H = 195;
const CARD_STEP = 211; // 195 card + the list's 16pt stack gap

/** Cards the 575pt clip box can reach — the frame's own third card is clipped. */
const MAX_CARDS = Math.ceil(LIST_H / CARD_STEP);

/* ------------------------------ spec palette ------------------------------ */
const PAGE = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";
const CTA_FILL = "#312b28";
const INK_TITLE = "#1e1a2b";
const INK_BODY = "#6b627a";
const INK_CLOCK = "#4a3a6b";
const INK_DUEIN = "#7b6d9c";
const TAB_ON_INK = "#1f4d33";
const GLASS_70 = "rgba(255,255,255,0.7)";
const LINE_80 = "rgba(255,255,255,0.8)";
const LINE_70 = "rgba(255,255,255,0.7)";

type Priority = "HIGH" | "MEDIUM" | "LOW";

/**
 * Priority pill paints — one entry per card variant in the frame, including
 * each variant's own gradient handles.
 */
const PRIORITY: Record<
  Priority,
  {
    from: string;
    to: string;
    ink: string;
    glow: string;
    start: { x: number; y: number };
    end: { x: number; y: number };
  }
> = {
  HIGH: {
    from: "rgba(255,220,215,0.8)", to: "rgba(255,200,195,0.8)",
    ink: "#993333", glow: "#ffc8c3",
    start: { x: 0.13, y: -0.27 }, end: { x: 0.87, y: 1.27 },
  },
  MEDIUM: {
    from: "rgba(255,235,210,0.8)", to: "rgba(255,220,180,0.8)",
    ink: "#995511", glow: "#ffdcb4",
    start: { x: 0.16, y: -0.47 }, end: { x: 0.84, y: 1.47 },
  },
  LOW: {
    from: "rgba(225,240,255,0.8)", to: "rgba(200,225,255,0.8)",
    ink: "#224499", glow: "#c8e1ff",
    start: { x: 0.12, y: -0.24 }, end: { x: 0.88, y: 1.24 },
  },
};

type Scope = "today" | "schedule" | "all";

/** Segment geometry. "All" runs to x=408.8 and the 375pt Tabs frame clips it. */
const TABS: { key: Scope; label: string; x: number; w: number }[] = [
  { key: "today", label: "Today", x: 20, w: 118.17 },
  { key: "schedule", label: "Schedule", x: 149.91, w: 146.62 },
  { key: "all", label: "All", x: 308.53, w: 100.27 },
];

/* ------------------------------ derivations ------------------------------- */
const HOUR = 3_600_000;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2:00 PM" — the clock chip's exact format. */
function clockLabel(d: Date): string {
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`;
}

/** "in 6 hrs" — recomputed from dueAt on every render, never persisted. */
function dueInLabel(diffMs: number): string {
  if (diffMs <= 0) return "overdue";
  const hrs = Math.max(1, Math.round(diffMs / HOUR));
  if (hrs < 24) return `in ${hrs} ${hrs === 1 ? "hr" : "hrs"}`;
  const days = Math.round(hrs / 24);
  return `in ${days} ${days === 1 ? "day" : "days"}`;
}

/**
 * Reminder carries no priority column, so the pill is derived from urgency
 * rather than invented. Thresholds are calibrated to the frame's own three
 * cards: "in 2 hrs" reads HIGH, "in 6 hrs" MEDIUM, "in 8 hrs" LOW.
 */
function priorityOf(diffMs: number): Priority {
  if (diffMs < 4 * HOUR) return "HIGH";
  if (diffMs < 8 * HOUR) return "MEDIUM";
  return "LOW";
}

/**
 * There is no `kind` column either, so the billing work this screen exists for
 * is recognised from the record's own title — the only signal a Reminder
 * carries. Used purely for ordering: money tasks lead, everything else follows.
 */
const MONEY = /invoice|payout|payment|billing|bill\b|fee/i;

/**
 * The card's three-line body. With no detail column on Reminder, the slot
 * restates the record's own facts — completion state and the full due moment —
 * instead of showing copy the backend never sent.
 */
function detailFor(r: Reminder, due: Date, diffMs: number): string {
  const when = `${DAYS[due.getDay()]}, ${due.getDate()} ${MONTHS[due.getMonth()]} at ${clockLabel(due)}`;
  if (r.done) return `Completed. Was due ${when}.`;
  return diffMs <= 0 ? `Overdue since ${when}.` : `Due ${when}.`;
}

/* ------------------------------ reminder card ----------------------------- */
interface CardProps {
  top: number;
  time: string;
  priority: Priority;
  dueIn: string;
  title: string;
  detail: string;
}

/**
 * 335x195 glass card. Child offsets are card-relative: the 1pt stroke insets
 * the padding box by a point, so the spec's 25pt inset is written as 24 here.
 */
function ReminderCard({ top, time, priority, dueIn, title, detail }: CardProps) {
  const p = PRIORITY[priority];
  return (
    <Abs
      x={20} y={top} w={CARD_W} h={CARD_H} radius={32}
      bg="rgba(255,255,255,0.55)" border={LINE_80} borderWidth={1}
      style={styles.card}
    >
      {/* Gradient 333x192.5 — white 40% down to transparent. */}
      <LinearGradient
        colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0)"] as const}
        start={{ x: 0.1, y: -0.18 }}
        end={{ x: 0.9, y: 1.18 }}
        style={styles.sheen}
      />

      {/* Meta row: clock + priority on the left, the due-in pill pinned right. */}
      <Abs x={24} y={24} w={285} h={30} row style={styles.spread}>
        <View style={styles.metaLeft}>
          <View style={styles.clockChip}>
            <Feather name="clock" size={14} color={INK_CLOCK} />
            <Txt size={13} weight="bold" font="inter" color={INK_CLOCK} lineHeight={15.73}>
              {time}
            </Txt>
          </View>
          <LinearGradient
            colors={[p.from, p.to] as const}
            start={p.start}
            end={p.end}
            style={[styles.priorityPill, { shadowColor: p.glow }]}
          >
            <Txt
              size={12} weight="bold" font="inter" color={p.ink}
              lineHeight={14.52} letterSpacing={0.5}
            >
              {priority}
            </Txt>
          </LinearGradient>
        </View>

        <View style={styles.dueChip}>
          <MaterialCommunityIcons name="timer-outline" size={14} color={INK_DUEIN} />
          <Txt size={12} weight="semibold" font="inter" color={INK_DUEIN} lineHeight={14.52}>
            {dueIn}
          </Txt>
        </View>
      </Abs>

      <Txt
        x={24} y={70} w={285} size={20} weight="semibold" font="inter"
        color={INK_TITLE} lineHeight={26} letterSpacing={-0.4} numberOfLines={1}
      >
        {title}
      </Txt>
      <Txt
        x={24} y={101} w={285} size={15} weight="regular" font="inter"
        color={INK_BODY} lineHeight={22.5} numberOfLines={3}
      >
        {detail}
      </Txt>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function InvoiceRemindersScreen() {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("today");
  const { data = [], isLoading } = useReminders();

  const now = Date.now();

  const { counts, rows } = useMemo(() => {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const end = endOfToday.getTime();

    // Billing work first, then earliest due — the payments flow's own ordering.
    const byUrgency = [...data].sort((a, b) => {
      const money = Number(MONEY.test(b.title)) - Number(MONEY.test(a.title));
      return money || new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });

    const open = byUrgency.filter((r) => !r.done);
    const today = open.filter((r) => new Date(r.dueAt).getTime() <= end);
    const schedule = open.filter((r) => new Date(r.dueAt).getTime() > end);

    return {
      // "All" is the whole ledger — completed and past reminders included.
      counts: { today: today.length, schedule: schedule.length, all: byUrgency.length },
      rows: scope === "today" ? today : scope === "schedule" ? schedule : byUrgency,
    };
  }, [data, scope]);

  return (
    <Screen height={FRAME_H} background={PAGE}>
      {/* -------------------------------- Header ----------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16} color={BACK_ICON} />
      </Pressable>
      <Txt
        x={72} y={28} w={222} size={20} weight="medium" font="inter"
        color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Reminders
      </Txt>

      {/* --------------------------------- Tabs ------------------------------ */}
      <Abs x={0} y={106} w={375} h={81} style={styles.clip}>
        {TABS.map((t) => {
          const on = t.key === scope;
          return (
            <Pressable
              key={t.key}
              onPress={() => setScope(t.key)}
              style={[styles.tab, { left: t.x, width: t.w }, on ? styles.tabOn : styles.tabOff]}
            >
              {on ? (
                <LinearGradient
                  colors={["rgba(200,240,215,0.85)", "rgba(180,230,200,0.85)"] as const}
                  start={{ x: 0.16, y: -0.43 }}
                  end={{ x: 0.84, y: 1.43 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <Txt
                size={15} weight="semibold" font="inter"
                color={on ? TAB_ON_INK : INK_BODY} lineHeight={18.15}
              >
                {t.label}
              </Txt>
              <View style={[styles.badge, on ? styles.badgeOn : styles.badgeOff]}>
                <Txt
                  size={12} weight="bold" font="inter"
                  color={on ? TAB_ON_INK : INK_BODY} lineHeight={14.52}
                >
                  {counts[t.key]}
                </Txt>
              </View>
            </Pressable>
          );
        })}
      </Abs>

      {/* ----------------------------- Reminders List ------------------------ */}
      <Abs x={0} y={LIST_Y} w={375} h={LIST_H} style={styles.clip}>
        {rows.slice(0, MAX_CARDS).map((r, i) => {
          const due = new Date(r.dueAt);
          const diff = due.getTime() - now;
          return (
            <ReminderCard
              key={r.id}
              top={i * CARD_STEP}
              time={clockLabel(due)}
              priority={priorityOf(diff)}
              dueIn={dueInLabel(diff)}
              title={r.title}
              detail={detailFor(r, due, diff)}
            />
          );
        })}
        {/* Loading and empty sit on the first card's text baseline — no reflow. */}
        {rows.length === 0 ? (
          <Txt x={44} y={70} w={285} size={15} font="inter" color={INK_BODY} lineHeight={22.5}>
            {isLoading ? "Loading reminders…" : "Nothing due — no open reminders."}
          </Txt>
        ) : null}
      </Abs>

      {/* ------------------------------ Floating CTA ------------------------- */}
      <Pressable
        onPress={() => router.push("/agency/profile/add-reminder")}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <Feather name="plus" size={20} color="#fffefe" />
        <Txt
          size={16} weight="semibold" font="inter" color={colors.white}
          lineHeight={19.36} w={110} align="center"
        >
          Add Reminder
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  spread: { justifyContent: "space-between" },
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
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  tab: {
    position: "absolute",
    top: 12,
    height: 45,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  tabOn: {
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#b4e6c8",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  tabOff: {
    backgroundColor: "rgba(255,255,255,0.45)",
    borderColor: LINE_70,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  badgeOn: { backgroundColor: "rgba(255,255,255,0.9)" },
  badgeOff: { backgroundColor: GLASS_70 },

  card: {
    overflow: "hidden",
    shadowColor: "#1e1432",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 2,
  },
  sheen: { position: "absolute", left: 0, top: 0, width: 333, height: 192.5, borderRadius: 32 },
  metaLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  clockChip: {
    height: 30,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    backgroundColor: GLASS_70,
    borderWidth: 1,
    borderColor: LINE_80,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  priorityPill: {
    height: 29,
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  dueChip: {
    height: 29,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    backgroundColor: "rgba(240,235,250,0.6)",
    borderWidth: 1,
    borderColor: LINE_70,
  },

  cta: {
    position: "absolute",
    left: 71,
    top: 791,
    width: 232,
    height: 56,
    borderRadius: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CTA_FILL,
    shadowColor: CTA_FILL,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
