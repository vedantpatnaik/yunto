import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useReminders, type Reminder } from "../../../src/api/hooks";

/**
 * Reminders — Figma frame 7711:22526 (375x876), traced 1:1.
 *
 * The agency-side reminders tab: dark pill back button + "Reminders" heading,
 * a counted Today / Schedule / All segment at y=106, the clipped 375x575
 * "Reminders List" region at y=205 holding 335x195 glass cards on a 211pt step,
 * and the floating "Add Reminder" pill at y=791.
 *
 * The list frame clips (three cards measure 617pt against its 575pt box), so it
 * is a ScrollView pinned to the frame's clip rect rather than a capped stack —
 * the geometry stays identical, the overflow just becomes reachable.
 *
 * The frame's Geist heading renders in Inter: Geist is not one of the two faces
 * loaded in app/_layout.tsx and Inter is the frame's own body face.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

const LIST_Y = 205; // "Reminders List" frame origin
const LIST_H = 575;
const CARD_H = 195;
const CARD_STEP = 211; // 195 card + 16 stack gap

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";
const INK_TITLE = "#1e1a2b";
const INK_BODY = "#6b627a";
const INK_TIME = "#4a3a6b";
const INK_COUNTDOWN = "#7b6d9c";
const TAB_ACTIVE_INK = "#1f4d33";
const GLASS_70 = "rgba(255,255,255,0.7)";
const BORDER_80 = "rgba(255,255,255,0.8)";
const BORDER_70 = "rgba(255,255,255,0.7)";

type Priority = "HIGH" | "MEDIUM" | "LOW";

/** Priority pill paints, straight off the three card variants in the spec. */
const PRIORITY: Record<Priority, { from: string; to: string; ink: string; glow: string }> = {
  HIGH: { from: "rgba(255,220,215,0.8)", to: "rgba(255,200,195,0.8)", ink: "#993333", glow: "#ffc8c3" },
  MEDIUM: { from: "rgba(255,235,210,0.8)", to: "rgba(255,220,180,0.8)", ink: "#995511", glow: "#ffdcb4" },
  LOW: { from: "rgba(225,240,255,0.8)", to: "rgba(200,225,255,0.8)", ink: "#224499", glow: "#c8e1ff" },
};

type Scope = "today" | "schedule" | "all";

/** Tab pill geometry — the "All" pill runs to x=408.8 and the frame clips it. */
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

/** "10:00 AM" — the exact clock-chip format in the design. */
function clockLabel(d: Date): string {
  const h = d.getHours() % 12 || 12;
  const suffix = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${suffix}`;
}

/** "in 2 hrs" — recomputed from dueAt on every render, never stored. */
function countdownLabel(diffMs: number): string {
  if (diffMs <= 0) return "overdue";
  const hrs = Math.max(1, Math.round(diffMs / HOUR));
  if (hrs < 24) return `in ${hrs} ${hrs === 1 ? "hr" : "hrs"}`;
  const days = Math.round(hrs / 24);
  return `in ${days} ${days === 1 ? "day" : "days"}`;
}

/**
 * Reminder has no priority column, so the HIGH / MEDIUM / LOW pill the design
 * ships is derived from urgency rather than invented: due within half a day is
 * HIGH, within three days MEDIUM, anything further out LOW.
 */
function priorityOf(diffMs: number): Priority {
  if (diffMs <= 12 * HOUR) return "HIGH";
  if (diffMs <= 72 * HOUR) return "MEDIUM";
  return "LOW";
}

/**
 * The card's three-line body. There is no detail column on Reminder either, so
 * the slot restates the record's own facts — status and the full due moment —
 * instead of showing copy the backend never sent.
 */
function detailFor(r: Reminder, due: Date): string {
  const when = `${DAYS[due.getDay()]}, ${due.getDate()} ${MONTHS[due.getMonth()]} at ${clockLabel(due)}`;
  return r.done ? `Completed. Was due ${when}.` : `Due ${when}.`;
}

/* ------------------------------ reminder card ----------------------------- */
interface CardProps {
  top: number;
  time: string;
  priority: Priority;
  countdown: string;
  title: string;
  detail: string;
}

/**
 * 335x195 glass card. Child offsets are card-relative and already account for
 * the 1pt stroke, which insets the padding box by a point on each side.
 */
function ReminderCard({ top, time, priority, countdown, title, detail }: CardProps) {
  const p = PRIORITY[priority];
  return (
    <Abs
      x={20}
      y={top}
      w={335}
      h={CARD_H}
      radius={32}
      bg="rgba(255,255,255,0.55)"
      border={BORDER_80}
      borderWidth={1}
      style={styles.card}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0)"] as const}
        start={{ x: 0.1, y: -0.18 }}
        end={{ x: 0.9, y: 1.18 }}
        style={styles.sheen}
      />

      {/* Meta row: time + priority on the left, countdown pinned right. */}
      <Abs x={24} y={24} w={285} h={30} row style={styles.spread}>
        <View style={styles.metaLeft}>
          <View style={styles.timeChip}>
            <Feather name="clock" size={14} color={INK_TIME} />
            <Txt size={13} weight="bold" font="inter" color={INK_TIME} lineHeight={15.73}>
              {time}
            </Txt>
          </View>
          <LinearGradient
            colors={[p.from, p.to] as const}
            start={{ x: 0.13, y: -0.27 }}
            end={{ x: 0.87, y: 1.27 }}
            style={[styles.priorityPill, { shadowColor: p.glow }]}
          >
            <Txt size={12} weight="bold" font="inter" color={p.ink} lineHeight={14.52} letterSpacing={0.5}>
              {priority}
            </Txt>
          </LinearGradient>
        </View>

        <View style={styles.countdownChip}>
          <MaterialCommunityIcons name="alarm" size={14} color={INK_COUNTDOWN} />
          <Txt size={12} weight="semibold" font="inter" color={INK_COUNTDOWN} lineHeight={14.52}>
            {countdown}
          </Txt>
        </View>
      </Abs>

      <Txt
        x={24}
        y={70}
        w={285}
        size={20}
        weight="semibold"
        font="inter"
        color={INK_TITLE}
        lineHeight={26}
        letterSpacing={-0.4}
        numberOfLines={1}
      >
        {title}
      </Txt>
      <Txt
        x={24}
        y={101}
        w={285}
        size={15}
        weight="regular"
        font="inter"
        color={INK_BODY}
        lineHeight={22.5}
        numberOfLines={3}
      >
        {detail}
      </Txt>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function AgencyRemindersList() {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("today");
  const { data = [], isLoading } = useReminders();

  const { counts, rows } = useMemo(() => {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const end = endOfToday.getTime();

    const all = [...data].sort(
      (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
    );
    const today = all.filter((r) => new Date(r.dueAt).getTime() <= end);
    const schedule = all.filter((r) => new Date(r.dueAt).getTime() > end);

    return {
      counts: { today: today.length, schedule: schedule.length, all: all.length },
      rows: scope === "today" ? today : scope === "schedule" ? schedule : all,
    };
  }, [data, scope]);

  const now = Date.now();

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* -------------------------------- Header ----------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={16} color={BACK_ICON} />
      </Pressable>
      <Txt
        x={72}
        y={28}
        w={222}
        size={20}
        weight="medium"
        font="inter"
        color={HEAD_INK}
        lineHeight={24}
        letterSpacing={-0.6}
      >
        Reminders
      </Txt>

      {/* --------------------------------- Tabs ------------------------------ */}
      <Abs x={0} y={106} w={375} h={81} style={styles.clip}>
        {TABS.map((t) => {
          const active = t.key === scope;
          return (
            <Pressable
              key={t.key}
              onPress={() => setScope(t.key)}
              style={[styles.tab, { left: t.x, width: t.w }, active ? styles.tabActive : styles.tabIdle]}
            >
              {active ? (
                <LinearGradient
                  colors={["rgba(200,240,215,0.85)", "rgba(180,230,200,0.85)"] as const}
                  start={{ x: 0.16, y: -0.43 }}
                  end={{ x: 0.84, y: 1.43 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <Txt
                size={15}
                weight="semibold"
                font="inter"
                color={active ? TAB_ACTIVE_INK : INK_BODY}
                lineHeight={18.15}
              >
                {t.label}
              </Txt>
              <View style={[styles.badge, active ? styles.badgeActive : styles.badgeIdle]}>
                <Txt
                  size={12}
                  weight="bold"
                  font="inter"
                  color={active ? TAB_ACTIVE_INK : INK_BODY}
                  lineHeight={14.52}
                >
                  {counts[t.key]}
                </Txt>
              </View>
            </Pressable>
          );
        })}
      </Abs>

      {/* ----------------------------- Reminders List ------------------------ */}
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={{
          height: Math.max(LIST_H, rows.length * CARD_STEP - (CARD_STEP - CARD_H)),
        }}
      >
        {rows.map((r, i) => {
          const due = new Date(r.dueAt);
          const diff = due.getTime() - now;
          return (
            <ReminderCard
              key={r.id}
              top={i * CARD_STEP}
              time={clockLabel(due)}
              priority={priorityOf(diff)}
              countdown={countdownLabel(diff)}
              title={r.title}
              detail={detailFor(r, due)}
            />
          );
        })}
        {rows.length === 0 ? (
          <Txt x={44} y={24} w={285} size={15} font="inter" color={INK_BODY} lineHeight={22.5}>
            {isLoading ? "Loading reminders…" : "No reminders"}
          </Txt>
        ) : null}
      </ScrollView>

      {/* ------------------------------ Floating CTA ------------------------- */}
      <Pressable
        onPress={() => router.push("/agency/profile/add-reminder")}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <Feather name="plus" size={20} color="#fffefe" />
        <Txt size={16} weight="semibold" font="inter" color={colors.white} lineHeight={19.36} w={110} align="center">
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

  backButton: {
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
    paddingLeft: 20,
    paddingRight: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  tabActive: {
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#b4e6c8",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  tabIdle: {
    backgroundColor: "rgba(255,255,255,0.45)",
    borderColor: BORDER_70,
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
  badgeActive: { backgroundColor: "rgba(255,255,255,0.9)" },
  badgeIdle: { backgroundColor: GLASS_70 },

  list: {
    position: "absolute",
    left: 0,
    top: LIST_Y,
    width: 375,
    height: LIST_H,
  },

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
  timeChip: {
    height: 30,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    backgroundColor: GLASS_70,
    borderWidth: 1,
    borderColor: BORDER_80,
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
  countdownChip: {
    height: 29,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    backgroundColor: "rgba(240,235,250,0.6)",
    borderWidth: 1,
    borderColor: BORDER_70,
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
    backgroundColor: "#312b28",
    shadowColor: "#312b28",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
