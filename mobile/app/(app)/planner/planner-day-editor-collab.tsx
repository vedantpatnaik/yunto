import { Fragment, useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import type { ViewStyle } from "react-native";
import { useRouter } from "expo-router";
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
import {
  useCalendar,
  useCreate,
  useCreators,
  useMe,
  useUpdate,
} from "../../../src/api/hooks";
import type { CalendarItem } from "../../../src/api/hooks";
import { fonts } from "../../../src/theme";

/**
 * Planner day editor — brand collaboration ON — Figma frame 7348:21143
 * "brand collb" (375x875), traced 1:1.
 *
 * The dirty/valid state of the day editor: the "Brand Collaboration" knob has
 * travelled from x293 to x312 and the track has flipped from #cccccc to
 * #c9a7ff, which reveals the 118x56 dark "Save" pill at 237.3,765. It is the
 * only frame in the day-editor set that carries a save affordance, so the pill
 * is bound to a real dirty check rather than being drawn unconditionally.
 *
 * Figma's BACKGROUND_BLUR and INNER_SHADOW have no React Native equivalent, so
 * the glass surfaces (header buttons, day tiles, editor card, controls card)
 * keep their translucent fills and drop shadows without the backdrop blur or
 * inner highlight. The 2x22 #c9a7ff "Vertical Divider" sitting inside the title
 * block is Figma's rendering of the text caret; it is reproduced as the title
 * field's live caret (selectionColor) instead of a static bar. Every other
 * value — geometry, colour, radius, size, weight, line-height, letter-spacing —
 * is verbatim from the spec.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Header: back "Button" 15,20 40x40 r20; platform "Button" 121,21.5 152.88x37 r20. */
const BACK = { x: 15, y: 20, size: 40 };
const PILL = { x: 121, y: 21.5, w: 152.88, h: 37 };

/** Calendar strip: six 56x69 r20 tiles on y=107, stepping 68 from x=20. */
const TILE_Y = 107;
const TILE_W = 56;
const TILE_H = 69;
const TILE_X = [20, 88, 156, 224, 292, 360];

/** Main editor card: "Overlay+Border+Shadow+OverlayBlur" 20,200 335x331 r24. */
const CARD = { x: 20, y: 200, w: 335, h: 331 };

/** Extra controls card: "Extra Controls" 20,571 335x155 r24. */
const CONTROLS = { x: 20, y: 571, w: 335, h: 155 };

/** Toggle rows: "Toggle 1" 41,580 293x69 and "Toggle 2" 41,649 293x68. */
const ROW_1_Y = 580;
const ROW_2_Y = 649;
const ROW_W = 293;
/** Track "Background+Shadow" 290,602 / 290,671 — 44x24 r12. */
const TRACK_X = 290;
const TRACK_W = 44;
const TRACK_H = 24;
/** Knob "Background+Shadow" 20x20 r10 — 293 when off, 312 when on. */
const KNOB_OFF_X = 293;
const KNOB_ON_X = 312;

/** Save: "Button" 237.3,765 118x56 r28. */
const SAVE = { x: 237.3, y: 765, w: 118, h: 56 };

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1a1a1c";
const MUTED = "#5e5e62";
const PLACEHOLDER = "#a0a0a5";
const ACCENT = "#c9a7ff";
const PINK = "#ec4899";
const INSTAGRAM = "#e1306c";
const TRACK_OFF = "#cccccc";
const SAVE_FILL = "#312b28";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_BORDER = "rgba(255,255,255,0.9)";
const ROW_DIVIDER = "rgba(0,0,0,0.04)";

/* -------------------------------- shadows --------------------------------- */
/** Back button: DROP_SHADOW 0/4 r12 #000 @3%. */
const backShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.03,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
};

/** Platform pill: DROP_SHADOW 0/4 r12 #000 @4%. */
const pillShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
};

/** Day tile: DROP_SHADOW 0/4 r12 #000 @2%. */
const tileShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.02,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
};

/** Selected day tile: DROP_SHADOW 0/8 r20 #90c1ab @25%. */
const activeTileShadow: ViewStyle = {
  shadowColor: "#90c1ab",
  shadowOpacity: 0.25,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
};

/** Editor card: DROP_SHADOW 0/12 r32 #000 @3%. */
const cardShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.03,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 12 },
  elevation: 2,
};

/** Controls card: DROP_SHADOW 0/8 r24 #000 @2%. */
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

/* ------------------------- the day the design ships ----------------------- */
/** Strip labels: the window always opens on a Monday, so these are fixed. */
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa"];
/** Fallback numbers and selection for a cold/empty calendar. */
const SPEC_DAYS = [16, 17, 18, 19, 20, 21];
const SPEC_SELECTED = 2;
const SPEC_TITLE = "Instagram Post: Behind the\nScenes...";
const SPEC_PLATFORM = "Instagram";
/** Brand-collab days are marked with this status on CalendarContent. */
const COLLAB_STATUS = "collab";

const DAY_MS = 86_400_000;

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Monday of the week the given date falls in. */
function mondayOf(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

/** "INSTAGRAM" -> "Instagram", matching the pill the design ships. */
const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="bc-base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="bc-pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="bc-blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="bc-gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="bc-haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#bc-base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#bc-pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#bc-blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#bc-gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#bc-haze)" />
    </Svg>
  );
}

/* --------------------------------- toggle --------------------------------- */
interface ToggleProps {
  y: number;
  icon: "briefcase" | "calendar";
  iconColor: string;
  label: string;
  labelW: number;
  on: boolean;
  onPress: () => void;
}

/**
 * One control row. The knob and track are the whole point of this frame: ON
 * paints the track #c9a7ff and parks the knob at 312, OFF paints it #cccccc
 * and parks the knob at 293.
 */
function Toggle({ y, icon, iconColor, label, labelW, on, onPress }: ToggleProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.toggleRow,
        { top: y, height: y === ROW_1_Y ? 69 : 68 },
        pressed && styles.pressed,
      ]}
    >
      <Abs x={0} y={16} w={36} h={36} radius={12} bg={GLASS_80} center>
        <Feather name={icon} size={18} color={iconColor} />
      </Abs>
      <Txt
        x={48}
        y={24.5}
        w={labelW}
        size={15}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={18.15}
        numberOfLines={1}
      >
        {label}
      </Txt>
      <Abs
        x={TRACK_X - 41}
        y={22}
        w={TRACK_W}
        h={TRACK_H}
        radius={12}
        bg={on ? ACCENT : TRACK_OFF}
      />
      <Abs
        x={(on ? KNOB_ON_X : KNOB_OFF_X) - 41}
        y={24}
        w={20}
        h={20}
        radius={10}
        bg="#FFFFFF"
        style={knobShadow}
      />
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function PlannerDayEditorCollab() {
  const router = useRouter();

  /** The scheduled content this editor writes back to. */
  const { data: calendar = [], isLoading } = useCalendar();
  const { data: creators = [] } = useCreators();
  const { data: me } = useMe();
  const update = useUpdate<CalendarItem>("calendar");
  const create = useCreate<CalendarItem>("calendar");

  const items = [...calendar].sort(
    (a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt),
  );

  /**
   * The strip is the Monday-anchored week around the first scheduled entry, so
   * the six tiles carry real dates. An empty or still-loading calendar keeps
   * the numbers the design ships without moving a single coordinate.
   */
  const anchor = items[0] ? new Date(items[0].scheduledAt) : null;
  const monday = anchor ? mondayOf(anchor) : null;
  const week = monday
    ? TILE_X.map((_unused, i) => new Date(monday.getTime() + i * DAY_MS))
    : null;
  const anchorIndex = anchor ? Math.min((anchor.getDay() + 6) % 7, 5) : SPEC_SELECTED;

  const [picked, setPicked] = useState<number | null>(null);
  const selectedIndex = picked ?? anchorIndex;
  const selectedDate = week ? week[selectedIndex] : null;
  const item = selectedDate
    ? items.find((entry) => sameDay(new Date(entry.scheduledAt), selectedDate))
    : undefined;

  /** The creator that owns the slot drives the platform pill. */
  const owner =
    creators.find((c) => c.id === item?.creatorId) ??
    creators.find((c) => c.name === me?.name);
  const platform = owner?.platform ? titleCase(owner.platform) : SPEC_PLATFORM;

  /* ------------------------------ edit state ----------------------------- */
  const baseTitle = item?.title ?? SPEC_TITLE;
  const recordCollab = item?.status === COLLAB_STATUS;

  const [draftTitle, setDraftTitle] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [collab, setCollab] = useState(true);
  const [shift, setShift] = useState(false);

  const title = draftTitle ?? baseTitle;

  /** Save only appears once the form diverges from the record. */
  const dirty =
    collab !== recordCollab || shift || caption !== "" || title !== baseTitle;

  const save = () => {
    const base = item
      ? new Date(item.scheduledAt)
      : (selectedDate ?? new Date());
    const scheduledAt = new Date(
      shift ? base.getTime() + DAY_MS : base.getTime(),
    ).toISOString();
    const status = collab ? COLLAB_STATUS : "scheduled";

    if (item) {
      update.mutate({ id: item.id, data: { title, status, scheduledAt } });
    } else if (owner) {
      create.mutate({ creatorId: owner.id, title, status, scheduledAt });
    }
    router.back();
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, backShadow, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={INK} />
      </Pressable>

      <Abs
        x={PILL.x}
        y={PILL.y}
        w={PILL.w}
        h={PILL.h}
        radius={20}
        bg={GLASS_80}
        border={GLASS_BORDER}
        borderWidth={1}
        style={pillShadow}
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
        numberOfLines={1}
      >
        {platform}
      </Txt>
      <Abs x={240.88} y={32} w={16} h={16} center>
        <Feather name="chevron-down" size={16} color={MUTED} />
      </Abs>

      {/* -------------------------- Calendar Strip -------------------------- */}
      {TILE_X.map((x, i) => {
        const active = i === selectedIndex;
        const day = week ? week[i].getDate() : SPEC_DAYS[i];
        return (
          <Fragment key={x}>
            {active ? (
              <LinearGradient
                colors={["#a2b5f5", "#8dc49d"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.tile, { left: x }, activeTileShadow]}
              />
            ) : (
              <Abs
                x={x}
                y={TILE_Y}
                w={TILE_W}
                h={TILE_H}
                radius={20}
                bg={GLASS_50}
                border={GLASS_BORDER}
                borderWidth={1}
                style={tileShadow}
              />
            )}
            <Pressable
              onPress={() => setPicked(i)}
              style={({ pressed }) => [
                styles.tileHit,
                { left: x },
                pressed && styles.pressed,
              ]}
            >
              <Txt
                x={0}
                y={active ? 12 : 13}
                w={TILE_W}
                size={13}
                weight="semibold"
                font="inter"
                color={active ? "rgba(255,255,255,0.8)" : MUTED}
                lineHeight={15.73}
                align="center"
              >
                {WEEKDAYS[i]}
              </Txt>
              <Txt
                x={0}
                y={active ? 34 : 35}
                w={TILE_W}
                size={18}
                weight="bold"
                font="inter"
                color={active ? "#FFFFFF" : INK}
                lineHeight={21.78}
                align="center"
              >
                {day}
              </Txt>
            </Pressable>
          </Fragment>
        );
      })}

      {/* -------------------------- Main Editor Card ------------------------ */}
      <Abs
        x={CARD.x}
        y={CARD.y}
        w={CARD.w}
        h={CARD.h}
        radius={24}
        bg={GLASS_65}
        border={GLASS_BORDER}
        borderWidth={1}
        style={cardShadow}
      />
      <TextInput
        value={title}
        onChangeText={setDraftTitle}
        multiline
        selectionColor={ACCENT}
        cursorColor={ACCENT}
        editable={!isLoading}
        style={styles.titleInput}
      />
      <TextInput
        value={caption}
        onChangeText={setCaption}
        multiline
        placeholder={"Write your caption here or let AI draft\nit for you."}
        placeholderTextColor={PLACEHOLDER}
        selectionColor={ACCENT}
        cursorColor={ACCENT}
        style={styles.captionInput}
      />

      {/* --------------------------- Extra Controls ------------------------- */}
      <Abs
        x={CONTROLS.x}
        y={CONTROLS.y}
        w={CONTROLS.w}
        h={CONTROLS.h}
        radius={24}
        bg={GLASS_60}
        border={GLASS_BORDER}
        borderWidth={1}
        style={controlsShadow}
      />
      <Toggle
        y={ROW_1_Y}
        icon="briefcase"
        iconColor={ACCENT}
        label="Brand Collaboration"
        labelW={143.75}
        on={collab}
        onPress={() => setCollab((prev) => !prev)}
      />
      {/* "Toggle 1" carries a 1pt bottom stroke at rgba(0,0,0,0.04). */}
      <Abs x={41} y={ROW_2_Y} w={ROW_W} h={1} bg={ROW_DIVIDER} />
      <Toggle
        y={ROW_2_Y}
        icon="calendar"
        iconColor={PINK}
        label="Shift content +1 day"
        labelW={143.3}
        on={shift}
        onPress={() => setShift((prev) => !prev)}
      />

      {/* ------------------------------- Save ------------------------------- */}
      {dirty ? (
        <Pressable
          onPress={save}
          disabled={update.isPending || create.isPending}
          style={({ pressed }) => [styles.save, pressed && styles.pressed]}
        >
          <Txt
            x={24}
            y={18.5}
            w={38}
            size={16}
            weight="semibold"
            font="inter"
            color="#FFFFFF"
            lineHeight={19.36}
            align="center"
          >
            Save
          </Txt>
          <Abs x={74} y={18} w={20} h={20} center>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </Abs>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.9 },

  /* Header — 40x40 glass button at 15,20. */
  backButton: {
    position: "absolute",
    left: BACK.x,
    top: BACK.y,
    width: BACK.size,
    height: BACK.size,
    borderRadius: BACK.size / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_70,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },

  /* Selected day tile — the #a2b5f5 -> #8dc49d horizontal gradient. */
  tile: {
    position: "absolute",
    top: TILE_Y,
    width: TILE_W,
    height: TILE_H,
    borderRadius: 20,
  },
  /* Text + hit target sit above whichever tile surface was drawn. */
  tileHit: {
    position: "absolute",
    top: TILE_Y,
    width: TILE_W,
    height: TILE_H,
  },

  /* Title — "Instagram Post: Behind the Scenes..." at 45,224.4 (Inter 700/22). */
  titleInput: {
    position: "absolute",
    left: 45,
    top: 224.4,
    width: 278.86,
    height: 62,
    padding: 0,
    fontFamily: fonts.interMedium,
    fontSize: 22,
    lineHeight: 30.8,
    letterSpacing: -0.4,
    color: INK,
    textAlignVertical: "top",
  },

  /* Caption — placeholder block at 45,298.59 285x48 (Inter 500/16). */
  captionInput: {
    position: "absolute",
    left: 45,
    top: 298.59,
    width: 285,
    height: 48,
    padding: 0,
    fontFamily: fonts.interMedium,
    fontSize: 16,
    lineHeight: 24,
    color: INK,
    textAlignVertical: "top",
  },

  /* Control row — "Toggle 1"/"Toggle 2" 41,580 and 41,649, 293 wide. */
  toggleRow: {
    position: "absolute",
    left: 41,
    width: ROW_W,
  },

  /* Save — "Button" 237.3,765 118x56 r28. */
  save: {
    position: "absolute",
    left: SAVE.x,
    top: SAVE.y,
    width: SAVE.w,
    height: SAVE.h,
    borderRadius: 28,
    backgroundColor: SAVE_FILL,
  },
});
