import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
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
import { useCalendar, useRemove, useUpdate } from "../../../src/api/hooks";
import type { CalendarItem } from "../../../src/api/hooks";

/**
 * "Date Occupied — shift or delete" — Figma frame 7348:21253 "shift content"
 * (375x875), traced 1:1.
 *
 * The conflict state of the day editor: the composer sits underneath with both
 * Extra Controls toggles ON, a #b5b4b9 @57% scrim covers the frame, and a 279pt
 * bottom sheet at y=597 asks whether to shift the clashing entry a day forward
 * or delete it outright. The sheet is the app's move/delete-post affordance —
 * "Shift Date" PATCHes /calendar/:id with scheduledAt + 1 day, "Delete" DELETEs
 * the entry.
 *
 * Figma's BACKGROUND_BLUR and INNER_SHADOW have no React Native equivalent, so
 * the glass surfaces (header buttons, day chips, editor card, controls card)
 * keep their translucent fills without the backdrop blur and the toggle tracks
 * drop their inner shadow. Day-chip label/number nodes are centred on their
 * 56pt chip rather than pinned to the per-string x Figma baked in, because the
 * numbers are live dates — the rendering is identical for the traced week.
 * Every other value — geometry, colour, radius, size, weight, line-height,
 * tracking — is verbatim.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Calendar Strip: six 56x69 chips from x=20 on a 68pt step, y=107. */
const CHIP_X0 = 20;
const CHIP_STEP = 68;
const CHIP_Y = 107;
const CHIP_W = 56;
const CHIP_H = 69;
/** The design highlights the third chip (We 18) — the day being edited. */
const ACTIVE_INDEX = 2;

/** Main Editor Card: "Overlay+Border+Shadow+OverlayBlur" 20,200 335x331. */
const EDITOR_X = 20;
const EDITOR_Y = 200;
const EDITOR_W = 335;
const EDITOR_H = 331;

/** Extra Controls card: 20,571 335x155. */
const CONTROLS_X = 20;
const CONTROLS_Y = 571;
const CONTROLS_W = 335;
const CONTROLS_H = 155;

/** Bottom sheet: "Frame" 0,597 375x279, r32 on the top corners only. */
const SHEET_Y = 597;
const SHEET_H = 279;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1a1a1c";
const SUBTLE_INK = "#5e5e62";
const PLACEHOLDER = "#a0a0a5";
const ACCENT = "#c9a7ff";
const INSTAGRAM = "#e1306c";
const SHIFT_ICON = "#ec4899";
const DARK = "#312b28";
const SHEET_TITLE = "#111111";
const SHEET_BODY = "rgba(0,0,0,0.5)";
const CLOSE_BG = "#f8f8f8";
const CLOSE_INK = "#555555";
const GRABBER = "#e5e5e5";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_BORDER = "rgba(255,255,255,0.9)";
const ROW_RULE = "rgba(0,0,0,0.04)";
const SCRIM = "rgba(181,180,185,0.57)";
const SHIFT_BORDER = "#e3e3e3";
const SHIFT_INK = "#1f1a17";
const ACTIVE_CHIP = ["#a2b5f5", "#8dc49d"] as const;

/* -------------------------------- shadows --------------------------------- */
/** Header / day chip: DROP_SHADOW 0/4 r12 #000 @2-4%. */
const chipShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.03,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
};

/** Active chip: DROP_SHADOW 0/8 r20 #90c1ab @25%. */
const activeChipShadow: ViewStyle = {
  shadowColor: "#90c1ab",
  shadowOpacity: 0.25,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
};

/** Editor card: DROP_SHADOW 0/12 r32 #000 @3%. */
const editorShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.03,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 12 },
  elevation: 2,
};

/** Extra Controls: DROP_SHADOW 0/8 r24 #000 @2%. */
const controlsShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.02,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
};

/** Toggle knob: DROP_SHADOW 0/2 r4 #000 @20%. */
const knobShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.2,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

/** Delete: DROP_SHADOW 0/8 r20 #000 @10%. */
const deleteShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 8 },
  elevation: 4,
};

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="dc-base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="dc-pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="dc-blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="dc-gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="dc-haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#dc-base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#dc-pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#dc-blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#dc-gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#dc-haze)" />
    </Svg>
  );
}

/* --------------------------------- data ----------------------------------- */
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** The week the design ships: Mo 16 … Sa 21, with We 18 selected. */
const SPEC_WEEK = [
  { label: "Mo", day: "16" },
  { label: "Tu", day: "17" },
  { label: "We", day: "18" },
  { label: "Th", day: "19" },
  { label: "Fr", day: "20" },
  { label: "Sa", day: "21" },
];

const SPEC_TITLE = "Instagram Post: Behind the\nScenes...";
const DAY_MS = 86_400_000;

export default function PlannerDayConflict() {
  const router = useRouter();

  /**
   * The planner hands over the entry it collided with — by id, or by the target
   * ISO date it was trying to write to. Entering the route cold falls back to
   * the first scheduled item so the sheet always has something to act on.
   */
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();

  const { data: calendar = [], isLoading } = useCalendar();
  const update = useUpdate<CalendarItem>("calendar");
  const remove = useRemove("calendar");

  /** The conflicting entry: what the sheet's two buttons operate on. */
  const entry = useMemo(() => {
    if (id) return calendar.find((c) => c.id === id);
    if (date) return calendar.find((c) => c.scheduledAt.slice(0, 10) === date);
    return calendar[0];
  }, [calendar, id, date]);

  /**
   * Six consecutive days centred so the occupied one lands on the design's
   * third chip. Keeps the traced geometry while the numbers stay real dates.
   */
  const week = useMemo(() => {
    if (!entry) return SPEC_WEEK;
    const at = new Date(entry.scheduledAt).getTime();
    return SPEC_WEEK.map((_unused, i) => {
      const d = new Date(at + (i - ACTIVE_INDEX) * DAY_MS);
      return { label: WEEKDAYS[d.getDay()], day: String(d.getDate()) };
    });
  }, [entry]);

  const busy = isLoading || update.isPending || remove.isPending;

  /** Shift Date — move the clashing entry one day on, matching Toggle 2. */
  const shiftDate = () => {
    if (entry) {
      const next = new Date(new Date(entry.scheduledAt).getTime() + DAY_MS);
      update.mutate({ id: entry.id, data: { scheduledAt: next.toISOString() } });
    }
    router.back();
  };

  const deleteEntry = () => {
    if (entry) remove.mutate(entry.id);
    router.back();
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Header ------------------------------ */}
      <Abs
        x={15}
        y={20}
        w={40}
        h={40}
        radius={20}
        bg={GLASS_70}
        border={GLASS_BORDER}
        borderWidth={1}
        style={chipShadow}
      />
      <Abs x={25} y={30} w={20} h={20} center>
        <Feather name="arrow-left" size={20} color={INK} />
      </Abs>

      <Abs
        x={121}
        y={21.5}
        w={152.88}
        h={37}
        radius={20}
        bg={GLASS_80}
        border={GLASS_BORDER}
        borderWidth={1}
        style={chipShadow}
      />
      <Abs x={134} y={31} w={18} h={18} center>
        <Feather name="instagram" size={18} color={INSTAGRAM} />
      </Abs>
      <Txt
        x={160}
        y={30.5}
        w={72.88}
        size={15}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={18.15}
        align="center"
      >
        Instagram
      </Txt>
      <Abs x={240.88} y={32} w={16} h={16} center>
        <Feather name="chevron-down" size={16} color={SUBTLE_INK} />
      </Abs>

      {/* --------------------------- Calendar Strip -------------------------- */}
      {week.map((cell, i) => {
        const x = CHIP_X0 + i * CHIP_STEP;
        const active = i === ACTIVE_INDEX;
        return (
          <Abs
            key={`${cell.label}-${cell.day}`}
            x={x}
            y={CHIP_Y}
            w={CHIP_W}
            h={CHIP_H}
            radius={20}
            bg={active ? undefined : GLASS_50}
            border={active ? undefined : GLASS_BORDER}
            borderWidth={active ? undefined : 1}
            style={active ? activeChipShadow : chipShadow}
          >
            {active ? (
              <LinearGradient
                colors={ACTIVE_CHIP}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.activeChip}
              />
            ) : null}
          </Abs>
        );
      })}
      {week.map((cell, i) => {
        const x = CHIP_X0 + i * CHIP_STEP;
        const active = i === ACTIVE_INDEX;
        return (
          <Txt
            key={`label-${cell.label}-${cell.day}`}
            x={x}
            y={active ? 119 : 120}
            w={CHIP_W}
            size={13}
            weight="semibold"
            font="inter"
            color={active ? "rgba(255,255,255,0.8)" : SUBTLE_INK}
            lineHeight={15.73}
            align="center"
          >
            {cell.label}
          </Txt>
        );
      })}
      {week.map((cell, i) => {
        const x = CHIP_X0 + i * CHIP_STEP;
        const active = i === ACTIVE_INDEX;
        return (
          <Txt
            key={`day-${cell.label}-${cell.day}`}
            x={x}
            y={active ? 141 : 142}
            w={CHIP_W}
            size={18}
            weight="bold"
            font="inter"
            color={active ? "#ffffff" : INK}
            lineHeight={21.78}
            align="center"
          >
            {cell.day}
          </Txt>
        );
      })}

      {/* -------------------------- Main Editor Card ------------------------- */}
      <Abs
        x={EDITOR_X}
        y={EDITOR_Y}
        w={EDITOR_W}
        h={EDITOR_H}
        radius={24}
        bg={GLASS_65}
        border={GLASS_BORDER}
        borderWidth={1}
        style={editorShadow}
      />
      <Txt
        x={45}
        y={224.4}
        w={278.86}
        size={22}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={30.8}
        letterSpacing={-0.4}
        numberOfLines={2}
      >
        {entry?.title ?? SPEC_TITLE}
      </Txt>
      {/* Vertical Divider — the caret parked at the end of the title. */}
      <Abs x={145.03} y={261.8} w={2} h={22} bg={ACCENT} />
      <Txt
        x={45}
        y={298.59}
        w={285}
        size={16}
        weight="medium"
        font="inter"
        color={PLACEHOLDER}
        lineHeight={24}
      >
        {"Write your caption here or let AI draft\nit for you."}
      </Txt>

      {/* --------------------------- Extra Controls -------------------------- */}
      <Abs
        x={CONTROLS_X}
        y={CONTROLS_Y}
        w={CONTROLS_W}
        h={CONTROLS_H}
        radius={24}
        bg={GLASS_60}
        border={GLASS_BORDER}
        borderWidth={1}
        style={controlsShadow}
      />

      {/* Toggle 1 — Brand Collaboration, ON */}
      <Abs x={41} y={596} w={36} h={36} radius={12} bg={GLASS_80} center>
        <Feather name="briefcase" size={18} color={ACCENT} />
      </Abs>
      <Txt
        x={89}
        y={604.5}
        w={143.75}
        size={15}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={18.15}
      >
        Brand Collaboration
      </Txt>
      <Abs x={290} y={602} w={44} h={24} radius={12} bg={ACCENT} />
      <Abs x={312} y={604} w={20} h={20} radius={10} bg="#ffffff" style={knobShadow} />
      <Abs x={41} y={648} w={293} h={1} bg={ROW_RULE} />

      {/* Toggle 2 — Shift content +1 day, ON */}
      <Abs x={41} y={665} w={36} h={36} radius={12} bg={GLASS_80} center>
        <Feather name="calendar" size={18} color={SHIFT_ICON} />
      </Abs>
      <Txt
        x={89}
        y={673.5}
        w={143.3}
        size={15}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={18.15}
      >
        Shift content +1 day
      </Txt>
      <Abs x={290} y={671} w={44} h={24} radius={12} bg={ACCENT} />
      <Abs x={312} y={673} w={20} h={20} radius={10} bg="#ffffff" style={knobShadow} />

      {/* ------------------------------- Save -------------------------------- */}
      <Abs x={237.3} y={765} w={118} h={56} radius={28} bg={DARK} />
      <Txt
        x={261.3}
        y={783.5}
        w={38}
        size={16}
        weight="semibold"
        font="inter"
        color="#ffffff"
        lineHeight={19.36}
        align="center"
      >
        Save
      </Txt>
      <Abs x={311.3} y={783} w={20} h={20} center>
        <Feather name="arrow-right" size={20} color="#ffffff" />
      </Abs>

      {/* ------------------------------- Scrim ------------------------------- */}
      <Pressable onPress={() => router.back()} style={styles.scrim} />

      {/* ---------------------------- Bottom sheet --------------------------- */}
      <Abs x={0} y={SHEET_Y} w={FRAME_W} h={SHEET_H} bg="#ffffff" style={styles.sheet} />
      <Abs x={167.5} y={613} w={40} h={4} radius={2} bg={GRABBER} />
      <Txt
        x={24}
        y={641}
        w={280}
        size={24}
        weight="semibold"
        font="inter"
        color={SHEET_TITLE}
        lineHeight={29.05}
        letterSpacing={-0.52}
      >
        Date Occupied
      </Txt>
      <Pressable onPress={() => router.back()} style={styles.close}>
        <Feather name="x" size={20} color={CLOSE_INK} />
      </Pressable>
      <Txt
        x={43}
        y={705}
        w={288}
        size={15}
        weight="medium"
        font="inter"
        color={SHEET_BODY}
        lineHeight={24}
        align="center"
      >
        Oops! There&apos;s already content set for this date. Please shift or delete the one.
      </Txt>

      <Pressable
        onPress={shiftDate}
        disabled={busy}
        style={({ pressed }) => [styles.shiftButton, pressed && styles.pressed]}
      >
        <Txt
          x={47.75}
          y={17}
          w={67}
          size={14}
          weight="medium"
          font="inter"
          color={SHIFT_INK}
          lineHeight={16.94}
          align="center"
        >
          Shift Date
        </Txt>
      </Pressable>
      <Pressable
        onPress={deleteEntry}
        disabled={busy}
        style={({ pressed }) => [styles.deleteButton, deleteShadow, pressed && styles.pressed]}
      >
        <Txt
          x={59.25}
          y={17}
          w={44}
          size={14}
          weight="medium"
          font="inter"
          color="#ffffff"
          lineHeight={16.94}
          align="center"
        >
          Delete
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.9 },

  /** Active day chip fill — the gradient rides inside the 56x69 r20 chip. */
  activeChip: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, borderRadius: 20 },

  /** Frame 2147223240 — #b5b4b9 @57% over the whole 375x876 frame. */
  scrim: {
    position: "absolute",
    left: 0,
    top: 0,
    width: FRAME_W,
    height: 876,
    backgroundColor: SCRIM,
  },

  /** Sheet corners: r32 top-left/top-right, square at the bottom. */
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32 },

  /** Close: "Background" 315,641 36x36 r18 #f8f8f8. */
  close: {
    position: "absolute",
    left: 315,
    top: 641,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CLOSE_BG,
  },

  /** Frame 2147223236 — 20,793 161.5x51 r24, glass with an #e3e3e3 hairline. */
  shiftButton: {
    position: "absolute",
    left: 20,
    top: 793,
    width: 161.5,
    height: 51,
    borderRadius: 24,
    backgroundColor: GLASS_60,
    borderWidth: 1,
    borderColor: SHIFT_BORDER,
  },

  /** Frame 2147223235 — 193.5,793 161.5x51 r24 #312b28. */
  deleteButton: {
    position: "absolute",
    left: 193.5,
    top: 793,
    width: 161.5,
    height: 51,
    borderRadius: 24,
    backgroundColor: DARK,
  },
});
