import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useReminders, type Reminder } from "../../../src/api/hooks";

/**
 * Reminders — Figma 7358:26244 (375x875).
 *
 * Traced 1:1: glass header, sticky segmented Today / Schedule / All tabs with
 * count badges, a clipped list of 335x195 glass reminder cards and the floating
 * "Add Reminder" pill. Coordinates below are the raw frame coordinates from the
 * spec; <Screen> scales the 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const LIST_Y = 205; // "Reminders List" frame origin
const LIST_H = 575;
const CARD_STEP = 211; // 195 card + 16 stack gap
const MAX_CARDS = 3; // 205 + 2*211 + 195 = 822, the last row the frame holds

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1E1A2B";
const INK_BODY = "#6B627A";
const INK_TIME = "#4A3A6B";
const INK_COUNTDOWN = "#7B6D9C";
const TAB_ACTIVE_INK = "#1F4D33";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const BORDER_80 = "rgba(255,255,255,0.8)";
const BORDER_70 = "rgba(255,255,255,0.7)";

type Priority = "HIGH" | "MEDIUM" | "LOW";

/** Priority pill paints, straight off the three card variants in the spec. */
const PRIORITY: Record<Priority, { from: string; to: string; ink: string; glow: string }> = {
  HIGH: { from: "rgba(255,220,215,0.8)", to: "rgba(255,200,195,0.8)", ink: "#993333", glow: "#FFC8C3" },
  MEDIUM: { from: "rgba(255,235,210,0.8)", to: "rgba(255,220,180,0.8)", ink: "#995511", glow: "#FFDCB4" },
  LOW: { from: "rgba(225,240,255,0.8)", to: "rgba(200,225,255,0.8)", ink: "#224499", glow: "#C8E1FF" },
};

type Scope = "today" | "schedule" | "all";

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

/** 10:00 AM / 2:00 PM / 4:30 PM — the exact clock-chip format in the design. */
function clockLabel(d: Date): string {
  const h = d.getHours() % 12 || 12;
  const suffix = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${suffix}`;
}

/** "in 2 hrs" — computed from dueAt, never stored. */
function countdownLabel(diffMs: number): string {
  if (diffMs <= 0) return "overdue";
  const hrs = Math.max(1, Math.round(diffMs / HOUR));
  if (hrs < 24) return `in ${hrs} ${hrs === 1 ? "hr" : "hrs"}`;
  const days = Math.round(hrs / 24);
  return `in ${days} ${days === 1 ? "day" : "days"}`;
}

/** Urgency buckets drive the HIGH / MEDIUM / LOW pill the design ships. */
function priorityOf(diffMs: number): Priority {
  if (diffMs <= 12 * HOUR) return "HIGH";
  if (diffMs <= 72 * HOUR) return "MEDIUM";
  return "LOW";
}

/** The API may carry a body; when it does not, describe the due date itself. */
type ReminderRow = Reminder & { description?: string };

function bodyFor(row: ReminderRow, due: Date): string {
  return (
    row.description ??
    `Due ${DAYS[due.getDay()]}, ${due.getDate()} ${MONTHS[due.getMonth()]}.`
  );
}

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
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

/* ------------------------------ reminder card ----------------------------- */
interface CardProps {
  top: number;
  time: string;
  priority: Priority;
  countdown: string;
  title: string;
  body: string;
}

/**
 * 335x195 glass card. Child offsets are card-relative and already account for
 * the 1pt stroke, which insets the padding box by a point on each side.
 */
function ReminderCard({ top, time, priority, countdown, title, body }: CardProps) {
  const p = PRIORITY[priority];
  return (
    <Abs
      x={20}
      y={top}
      w={335}
      h={195}
      radius={32}
      bg={GLASS_55}
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
          <MaterialCommunityIcons name="timer-outline" size={14} color={INK_COUNTDOWN} />
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
        {body}
      </Txt>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function Reminders() {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("today");
  const { data = [], isLoading } = useReminders();

  const { counts, rows } = useMemo(() => {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const end = endOfToday.getTime();

    const all: ReminderRow[] = [...data].sort(
      (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
    );
    const today = all.filter((r) => new Date(r.dueAt).getTime() <= end);
    const schedule = all.filter((r) => new Date(r.dueAt).getTime() > end);
    const picked = scope === "today" ? today : scope === "schedule" ? schedule : all;

    return {
      counts: { today: today.length, schedule: schedule.length, all: all.length },
      rows: picked.slice(0, MAX_CARDS),
    };
  }, [data, scope]);

  const now = Date.now();

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* Header */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color="#1C1C1E" />
      </Pressable>
      <Txt
        x={100}
        y={30}
        w={154}
        size={16}
        weight="bold"
        font="inter"
        color="#1D1D1F"
        lineHeight={19.36}
        align="center"
      >
        All Ideas
      </Txt>

      {/* Tabs — the "All" pill runs past the frame edge exactly as designed. */}
      <Abs x={0} y={106} w={375} h={81} style={styles.clip}>
        {TABS.map((t) => {
          const active = t.key === scope;
          return (
            <Pressable
              key={t.key}
              onPress={() => setScope(t.key)}
              style={[
                styles.tab,
                { left: t.x, width: t.w },
                active ? styles.tabActive : styles.tabIdle,
              ]}
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

      {/* Reminders List */}
      <Abs x={0} y={LIST_Y} w={375} h={LIST_H} style={styles.clip}>
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
              body={bodyFor(r, due)}
            />
          );
        })}
        {!isLoading && rows.length === 0 ? (
          <Txt x={44} y={24} w={285} size={15} font="inter" color={INK_BODY} lineHeight={22.5}>
            No reminders
          </Txt>
        ) : null}
      </Abs>

      {/* Floating CTA */}
      <Pressable
        onPress={() => router.push("/reminders/add-reminder" as never)}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <Feather name="plus" size={20} color="#FFFEFE" />
        <Txt size={16} weight="semibold" font="inter" color={colors.white} lineHeight={19.36}>
          Add Reminder
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  spread: { justifyContent: "space-between" },
  pressed: { opacity: 0.9 },

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
    shadowColor: "#B4E6C8",
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

  card: {
    overflow: "hidden",
    shadowColor: "#1E1432",
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
    backgroundColor: "#312B28",
    shadowColor: "#312B28",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
