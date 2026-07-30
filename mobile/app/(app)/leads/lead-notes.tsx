import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors, fonts } from "../../../src/theme";
import {
  useCreate,
  useLeads,
  useNotes,
  useReminders,
  type Note,
} from "../../../src/api/hooks";

/**
 * Lead Detail — Notes & Activity — Figma 7333:14116 (375x875).
 *
 * The second tab of the lead detail: the shared identity card, the
 * "Lead Info | Notes & Activity" segmented pill, a follow-up strip with a date
 * chip, the quick-note composer and the grouped activity timeline. Coordinates
 * below are raw frame coordinates from the spec; <Screen> scales the 375pt
 * canvas to the device.
 *
 * The frame is 875 tall but the timeline block runs to 953 (Figma clips it);
 * the canvas is sized to the block so the whole timeline is reachable by
 * scrolling without moving a single traced coordinate.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;
const CANVAS_H = 953; // "3. Activity Timeline:margin" — 547 + 406

const CARD_X = 15;
const CARD_Y = 111;
const CARD_W = 345;
const CARD_H = 205;

const GROUP_Y = 571; // "Group: Today" origin
const GROUP_STEP = 191; // 762 - 571
const ROW_Y = 31; // first card, group-relative (602 - 571)
const ROW_STEP = 74; // 676 - 602
const MAX_GROUPS = 2; // 571 + 191 + 167 = 929, the last row the block holds
const MAX_ROWS = 2;

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1d1d1f";
const INK_BODY = "#1c1c1e";
const INK_MUTED = "#6c6c70";
const INK_SUB = "#6e6e73";
const FOLLOWUP_INK = "#c05e23";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const BORDER_90 = "rgba(255,255,255,0.9)";

/** The four activity treatments the timeline ships, in the order it uses them. */
const EVENT_STYLES = [
  { dot: "#ffe4e8", border: "rgba(255,228,232,0.9)", ink: "#d81b60", icon: "bell" },
  { dot: "#ffeac4", border: "rgba(255,234,196,0.9)", ink: "#e65100", icon: "clock" },
  { dot: "#e8eaf6", border: "rgba(232,234,246,0.9)", ink: "#3949ab", icon: "phone" },
  { dot: "#e8f5e9", border: "rgba(232,245,233,0.9)", ink: "#2e7d32", icon: "check-circle" },
] as const;

/* ------------------------------ derivations ------------------------------- */
const MS_DAY = 86_400_000;
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function startOfDay(d: Date): number {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.getTime();
}

/** 0 = today, 1 = yesterday. Rounded so DST shifts cannot skew the bucket. */
function dayOffset(d: Date): number {
  return Math.round((startOfDay(new Date()) - startOfDay(d)) / MS_DAY);
}

/** "Today" / "Yesterday" / "18 Jul" — the prefix of every timestamp line. */
function dayWord(d: Date): string {
  const off = dayOffset(d);
  if (off === 0) return "Today";
  if (off === 1) return "Yesterday";
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** "10:00 am" — the clock half of every timestamp line. */
function timeLabel(d: Date): string {
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() >= 12 ? "pm" : "am"}`;
}

/** PAID -> "Paid", CONTACTED -> "Contacted" — the chip casing in the design. */
function label(s: string): string {
  return s
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

interface TimelineEvent {
  id: string;
  title: string;
  at: Date;
}

interface TimelineGroup {
  key: string;
  heading: string;
  rows: TimelineEvent[];
}

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={CANVAS_H} style={styles.backdrop}>
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
      <Rect width={FRAME_W} height={CANVAS_H} fill="url(#base)" />
      <Rect width={FRAME_W} height={CANVAS_H} fill="url(#pink)" />
      <Rect width={FRAME_W} height={CANVAS_H} fill="url(#blue)" />
      <Rect width={FRAME_W} height={CANVAS_H} fill="url(#gold)" />
      <Rect width={FRAME_W} height={CANVAS_H} fill="url(#haze)" />
    </Svg>
  );
}

/** Identity-card fill: a peach-to-periwinkle sweep under three radial glows. */
function CardBackdrop() {
  return (
    <Svg width={CARD_W} height={CARD_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="cardBase" x1="37.95" y1="-43.05" x2="307.05" y2="248.05" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFE5A4" stopOpacity="0.82" />
          <Stop offset="0.35" stopColor="#FFF5E4" stopOpacity="0.92" />
          <Stop offset="0.72" stopColor="#F4D3EE" stopOpacity="0.88" />
          <Stop offset="1" stopColor="#CAD9FF" stopOpacity="0.76" />
        </SvgLinear>
        <RadialGradient id="cardPink" cx="248.4" cy="180.4" rx="296.7" ry="325.95" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.4" />
          <Stop offset="0.22" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="cardGold" cx="282.9" cy="36.9" rx="320.85" ry="352.6" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.3" />
          <Stop offset="0.18" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="cardHaze" cx="62.1" cy="41" rx="320.85" ry="350.55" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={CARD_W} height={CARD_H} fill="url(#cardBase)" />
      <Rect width={CARD_W} height={CARD_H} fill="url(#cardPink)" />
      <Rect width={CARD_W} height={CARD_H} fill="url(#cardGold)" />
      <Rect width={CARD_W} height={CARD_H} fill="url(#cardHaze)" />
    </Svg>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function LeadNotes() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: leads = [] } = useLeads();
  const { data: notes = [] } = useNotes();
  const { data: reminders = [] } = useReminders();
  const createNote = useCreate<Note>("notes");
  const [draft, setDraft] = useState("");

  const lead = useMemo(
    () => leads.find((l) => l.id === id) ?? leads[0],
    [leads, id],
  );

  /**
   * Notes and reminders both feed the timeline; neither carries a leadId yet,
   * so the whole owner-scoped stream is shown newest first, bucketed by day.
   */
  const groups = useMemo<TimelineGroup[]>(() => {
    const rows: TimelineEvent[] = [
      ...reminders.map((r) => ({ id: `r-${r.id}`, title: r.title, at: new Date(r.dueAt) })),
      ...notes.map((n) => ({ id: `n-${n.id}`, title: n.body, at: new Date(n.createdAt) })),
    ].sort((a, b) => b.at.getTime() - a.at.getTime());

    const out: TimelineGroup[] = [];
    for (const row of rows) {
      const key = String(startOfDay(row.at));
      const hit = out.find((g) => g.key === key);
      if (hit) {
        if (hit.rows.length < MAX_ROWS) hit.rows.push(row);
      } else if (out.length < MAX_GROUPS) {
        out.push({ key, heading: dayWord(row.at).toUpperCase(), rows: [row] });
      }
    }
    return out;
  }, [notes, reminders]);

  /** The date chip tracks the next scheduled follow-up. */
  const followUp = useMemo(() => {
    const now = Date.now();
    const next = reminders
      .map((r) => new Date(r.dueAt))
      .filter((d) => d.getTime() >= now)
      .sort((a, b) => a.getTime() - b.getTime());
    return next[0] ?? new Date();
  }, [reminders]);

  const submit = () => {
    const body = draft.trim();
    if (!body || createNote.isPending) return;
    createNote.mutate({ body });
    setDraft("");
  };

  return (
    <Screen height={CANVAS_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* -------------------------------- Header ------------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.headerBack, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={20} color={INK_BODY} />
      </Pressable>
      <Txt
        x={71.5}
        y={30}
        w={235}
        size={16}
        weight="bold"
        font="inter"
        color={INK_TITLE}
        lineHeight={19.36}
        align="center"
      >
        Lead Detail{" "}
      </Txt>
      <View style={styles.headerFlag}>
        <Feather name="flag" size={20} color="#e74c3c" />
      </View>

      {/* ----------------------------- Identity card --------------------------- */}
      <Abs x={CARD_X} y={CARD_Y} w={CARD_W} h={CARD_H} radius={24} style={styles.identityCard}>
        <CardBackdrop />

        <Txt
          x={24}
          y={24}
          w={156.14}
          size={24}
          weight="bold"
          font="inter"
          color={INK_TITLE}
          lineHeight={29.04}
          numberOfLines={1}
        >
          {lead?.contactPerson ?? lead?.brandName ?? ""}
        </Txt>
        <Txt
          x={24}
          y={57}
          w={156.14}
          size={14}
          weight="medium"
          font="inter"
          color={INK_SUB}
          lineHeight={16.94}
          numberOfLines={1}
        >
          {lead?.brandName ?? ""}
        </Txt>
        <Txt
          x={24}
          y={24}
          w={297}
          size={18}
          weight="bold"
          font="inter"
          color={INK_TITLE}
          lineHeight={21.78}
          align="right"
          numberOfLines={1}
        >
          {lead?.money ?? ""}
        </Txt>

        <Abs x={24} y={86} h={27} row gap={8}>
          <View style={[styles.chip, { backgroundColor: "rgba(193,63,186,0.1)" }]}>
            <Txt size={12} weight="semibold" font="inter" color="#c13fba" lineHeight={14.52}>
              {label(lead?.dealType ?? "")}
            </Txt>
          </View>
          <View style={[styles.chip, { backgroundColor: "rgba(55,118,242,0.1)" }]}>
            <Txt size={12} weight="semibold" font="inter" color="#3776f2" lineHeight={14.52}>
              {label(lead?.status ?? "")}
            </Txt>
          </View>
        </Abs>

        <View style={[styles.roundButton, { left: 24, top: 137 }]}>
          <Feather name="phone" size={20} color={INK_TITLE} />
        </View>
        <View style={[styles.roundButton, { left: 80, top: 137 }]}>
          <Feather name="message-circle" size={20} color={INK_TITLE} />
        </View>
        <View style={[styles.roundButton, { left: 136, top: 137 }]}>
          <Feather name="mail" size={20} color={INK_TITLE} />
        </View>
      </Abs>

      {/* --------------------------- Segmented control ------------------------- */}
      <Abs
        x={15}
        y={331}
        w={345}
        h={51}
        radius={999}
        bg={GLASS_65}
        border={BORDER_90}
        borderWidth={1}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.segment, { left: 4, top: 4 }, pressed && styles.pressed]}
        >
          <Txt size={14} weight="semibold" font="inter" color={INK_MUTED} lineHeight={16.94} align="center">
            Lead Info
          </Txt>
        </Pressable>
        <View style={[styles.segment, styles.segmentActive, { left: 171.5, top: 4 }]}>
          <Txt size={14} weight="semibold" font="inter" color={INK_BODY} lineHeight={16.94} align="center">
            Notes & Activity
          </Txt>
        </View>
      </Abs>

      {/* --------------------------- 1. Follow-Up Block ------------------------ */}
      <Abs
        x={15}
        y={397}
        w={345}
        h={58}
        radius={12}
        bg="rgba(255,235,222,0.7)"
        border="rgba(255,218,196,0.8)"
        borderWidth={1}
      >
        <View style={styles.dateChip}>
          <Txt size={13} weight="bold" font="inter" color={FOLLOWUP_INK} lineHeight={15.73} align="center">
            {`${followUp.getDate()} ${DAYS_SHORT[followUp.getDay()]}`}
          </Txt>
        </View>
        <Txt
          x={84.3}
          y={19}
          w={186.22}
          size={15}
          weight="semibold"
          font="inter"
          color={INK_BODY}
          lineHeight={18.15}
        >
          Add Follow-Up
        </Txt>
        <Pressable
          onPress={() => router.push("/reminders/add-reminder" as never)}
          style={({ pressed }) => [styles.addPill, pressed && styles.pressed]}
        >
          <Txt size={13} weight="bold" font="inter" color={INK_BODY} lineHeight={15.73} align="center">
            ADD
          </Txt>
        </Pressable>
      </Abs>

      {/* ------------------------------ 2. Add Note ---------------------------- */}
      <Abs
        x={20}
        y={474}
        w={335}
        h={50}
        radius={12}
        bg="rgba(255,255,255,0.4)"
        border="rgba(255,255,255,0.7)"
        borderWidth={1}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submit}
          returnKeyType="done"
          placeholder="Add a quick note..."
          placeholderTextColor={INK_MUTED}
          style={styles.input}
        />
        <Pressable
          onPress={submit}
          style={({ pressed }) => [styles.send, pressed && styles.pressed]}
        >
          <Feather name="arrow-up" size={16} color={INK_BODY} />
        </Pressable>
      </Abs>

      {/* -------------------------- 3. Activity Timeline ----------------------- */}
      <LinearGradient
        colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.08)", "rgba(0,0,0,0)"] as const}
        locations={[0, 0.8, 1]}
        style={styles.divider}
      />

      {groups.map((group, gi) => {
        const groupY = GROUP_Y + gi * GROUP_STEP;
        return (
          <View key={group.key}>
            <Txt
              x={60}
              y={groupY}
              w={295}
              size={12}
              weight="bold"
              font="inter"
              color={INK_MUTED}
              lineHeight={14.52}
              letterSpacing={0.6}
            >
              {group.heading}
            </Txt>

            {group.rows.map((row, ri) => {
              const cardY = groupY + ROW_Y + ri * ROW_STEP;
              const style = EVENT_STYLES[(gi * MAX_ROWS + ri) % EVENT_STYLES.length];
              return (
                <View key={row.id}>
                  <Abs x={20} y={cardY + 10} w={24} h={24} radius={12} bg={style.dot} center>
                    <Feather name={style.icon} size={14} color={style.ink} />
                  </Abs>
                  <Abs
                    x={60}
                    y={cardY}
                    w={295}
                    h={62}
                    radius={12}
                    bg={colors.white}
                    border={style.border}
                    borderWidth={1}
                  >
                    <Txt
                      x={16}
                      y={12}
                      w={261}
                      size={14}
                      weight="semibold"
                      font="inter"
                      color={INK_BODY}
                      lineHeight={16.94}
                      numberOfLines={1}
                    >
                      {row.title}
                    </Txt>
                    <Txt
                      x={16}
                      y={33}
                      w={261}
                      size={12}
                      weight="medium"
                      font="inter"
                      color={INK_MUTED}
                      lineHeight={14.52}
                      numberOfLines={1}
                    >
                      {`${dayWord(row.at)} • ${timeLabel(row.at)}`}
                    </Txt>
                  </Abs>
                </View>
              );
            })}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.9 },

  headerBack: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  headerFlag: {
    position: "absolute",
    left: 320,
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_65,
    borderWidth: 0.91,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 5.45,
    shadowOffset: { width: 0, height: 3.64 },
  },

  identityCard: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chip: {
    height: 27,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  roundButton: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  segment: {
    position: "absolute",
    width: 167.5,
    height: 41,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
    backgroundColor: GLASS_90,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  dateChip: {
    position: "absolute",
    left: 12,
    top: 12,
    width: 60.3,
    height: 32,
    borderRadius: 6,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  addPill: {
    position: "absolute",
    left: 270.52,
    top: 12,
    width: 60.48,
    height: 32,
    borderRadius: 999,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  input: {
    position: "absolute",
    left: 16,
    top: 14,
    width: 275,
    height: 20,
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 15,
    color: "#1c1c1e",
  },
  send: {
    position: "absolute",
    left: 291,
    top: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  divider: { position: "absolute", left: 31, top: 607, width: 2, height: 326 },
});
