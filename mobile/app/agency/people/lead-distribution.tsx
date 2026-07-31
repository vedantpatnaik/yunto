import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useUsers } from "../../../src/api/hooks";
import type { User } from "../../../src/api/hooks";

/**
 * Lead Distribution — Figma 7754:8373 (375x876), traced 1:1.
 *
 * The routing rule for incoming leads, reached from People. The warm #f8f5ef
 * page carries the 876-gen backdrop (three radial washes over a full-bleed
 * rect, a fourth in the bottom-right box, a blurred lilac blob off the
 * bottom-left edge) under the 36pt back disc and the heading. One 335x598
 * frosted panel (20,104) holds the intro copy above a hairline, the three
 * radio options at a 60pt step, a second hairline, the assignment list, and
 * the "Save Preferences" CTA at y=602.
 *
 * The list is the rotation order, not a picker: legacy 899:6120 titles the same
 * block "Assignment Order" and every row carries the hugeicons:menu-09 drag
 * handle. Rows are the live staff — everyone who can own a Lead, which is every
 * User except the SUPER_ADMIN (seed hands Lead.ownerId to exactly that set).
 * The frame's three names are sample rows; a real roster runs longer than the
 * 142pt box, so the rows scroll inside the design's clip rect at the spec's
 * 50pt step rather than being truncated — the geometry is untouched.
 *
 * React Native has no drag-and-drop without a gesture layer, so the handle is
 * wired to the same edit a drag would make: it lifts its row one slot, and the
 * top row wraps to the bottom. The rotation is what the order means, so a
 * single control expresses it.
 *
 * Nothing persists. Prisma has no settings model and the server exposes no
 * distribution route, so mode and order are session state — the frame's own
 * checked option (Round by Round) is the initial mode — and "Save Preferences"
 * is drawn as designed but left inert rather than POSTing to an endpoint that
 * does not exist. The heading's Geist renders in Inter; that face is not loaded
 * in app/_layout.tsx and Inter is the frame's own body face.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/** Overlay+Border+Shadow+OverlayBlur — 7754:8384. */
const PANEL = { x: 20, y: 104, w: 335, h: 598 };

/** Frame 1171275475/6/7 — option i at OPTION_Y + i*OPTION_STEP. */
const OPTION_X = 36;
const OPTION_Y = 196;
const OPTION_STEP = 60;
const OPTION_W = 303;

/** Frame 1171275479 — the 300x42 rows on a 50pt step inside a 142pt box. */
const LIST_X = 37;
const LIST_Y = 437;
const LIST_W = 300;
const LIST_H = 142;
const ROW_H = 42;
const ROW_STEP = 50;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef"; // frame fill
const BACK_FILL = "#1f1a17"; // Button — 7754:8378
const BACK_INK = "#faf7f2"; // Vector — 7754:8381
const HEAD_INK = "#141311"; // Heading 1 — 7754:8383
const PANEL_FILL = "rgba(255,255,255,0.52)";
const PANEL_LINE = "rgba(0,0,0,0.07)";
const RULE_HEAD = "rgba(0,0,0,0.05)"; // HorizontalBorder — 7754:8385
const RULE_BODY = "rgba(0,0,0,0.04)"; // 7754:8402 / 7755:8455
const INTRO_INK = "rgba(17,17,17,0.7)";
const TITLE_INK = "#000000";
const DESC_INK = "rgba(0,0,0,0.7)";
const RADIO_OFF = "#49454f"; // radio_button_unchecked
const RADIO_ON = "#1d1b20"; // radio_button_checked
const LABEL_INK = "#aaaaaa";
const ROW_FILL = "#ffffff";
const ROW_LINE = "#e5e7eb";
const NAME_INK = "rgba(0,0,0,0.7)";
const CTA_FILL = "#312b28"; // Button — 7797:23071

/* -------------------------------- backdrop -------------------------------- */
/**
 * Gradient / Gradient / Overlay+Blur — 7754:8374, :8375, :8376.
 *
 * Figma states each wash as a radial paint on a rectangle with the stops laid
 * along the handle radius; they are restated here in user space so the ellipse
 * centres land on the same points. The blob carries a 55pt layer blur, which RN
 * cannot express, so it is drawn as a radial falloff with the blur folded into
 * the radii.
 */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        {/* 7754:8374 — #ffd7eb 38%, centre (1.08, 0.30) of the full frame */}
        <RadialGradient id="rose" cx={405} cy={262.8} rx={262.5} ry={438} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffd7eb" stopOpacity={0.38} />
          <Stop offset="0.55" stopColor="#ffd7eb" stopOpacity={0} />
        </RadialGradient>
        {/* 7754:8374 — #ebd7ff 40%, centre (-0.05, 0.40) */}
        <RadialGradient id="lilac" cx={-18.75} cy={350.4} rx={300} ry={438} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ebd7ff" stopOpacity={0.4} />
          <Stop offset="0.55" stopColor="#ebd7ff" stopOpacity={0} />
        </RadialGradient>
        {/* 7754:8374 — #c3cdff 65%, centre (0.50, -0.06) */}
        <RadialGradient id="peri" cx={187.5} cy={-52.56} rx={450} ry={438} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#c3cdff" stopOpacity={0.65} />
          <Stop offset="0.5" stopColor="#c3cdff" stopOpacity={0} />
        </RadialGradient>
        {/* 7754:8375 — #bee1ff 50%, centred on the 262.5x350.4 box's far corner */}
        <RadialGradient id="sky" cx={375} cy={876} rx={236.25} ry={262.8} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#bee1ff" stopOpacity={0.5} />
          <Stop offset="0.65" stopColor="#bee1ff" stopOpacity={0} />
        </RadialGradient>
        {/* 7754:8376 — #dcd2ff at 30%, 55pt layer blur */}
        <RadialGradient id="blob" cx={46.875} cy={604.425} rx={139.375} ry={177.635} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#dcd2ff" stopOpacity={0.3} />
          <Stop offset="0.45" stopColor="#dcd2ff" stopOpacity={0.18} />
          <Stop offset="1" stopColor="#dcd2ff" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={FRAME_W} height={FRAME_H} fill="url(#rose)" />
      <Rect x={0} y={0} width={FRAME_W} height={FRAME_H} fill="url(#lilac)" />
      <Rect x={0} y={0} width={FRAME_W} height={FRAME_H} fill="url(#peri)" />
      <Rect x={112.5} y={525.6} width={262.5} height={350.4} fill="url(#sky)" />
      <Ellipse cx={46.875} cy={604.425} rx={139.375} ry={177.635} fill="url(#blob)" />
    </Svg>
  );
}

/* -------------------------------- options --------------------------------- */
type Mode = "random" | "broadcast" | "round_robin";

/**
 * The three rules, in the order the frame draws them. `descLine` is the
 * description's line box: the first two run on a 24pt line, the third (which
 * wraps) on a 20pt one.
 */
const OPTIONS: { key: Mode; title: string; desc: string; descLine: number }[] = [
  {
    key: "random",
    title: "Random",
    desc: "Distributes leads to any available person randomly.",
    descLine: 24,
  },
  {
    key: "broadcast",
    title: "All (Broadcast)",
    desc: "Send leads to all team members. First to respond gets it.",
    descLine: 24,
  },
  {
    key: "round_robin",
    title: "Round by Round",
    desc: "Distributes leads one-by-one in a loop among team members.",
    descLine: 20,
  },
];

/** Material radio — a 20pt ring at (38, y), filled to a 10pt dot when checked. */
function Radio({ on }: { on: boolean }) {
  return (
    <Abs
      x={2} y={2} w={20} h={20} radius={10}
      border={on ? RADIO_ON : RADIO_OFF} borderWidth={2} center
    >
      {on ? <View style={styles.radioDot} /> : null}
    </Abs>
  );
}

/* ------------------------------ assignment row ---------------------------- */
interface RowProps {
  top: number;
  name: string;
  onLift: () => void;
}

/** 300x42 Input row: the member's name and the menu-09 drag handle. */
function AssignmentRow({ top, name, onLift }: RowProps) {
  return (
    <Abs
      x={0} y={top} w={LIST_W} h={ROW_H} radius={8}
      bg={ROW_FILL} border={ROW_LINE} borderWidth={1}
    >
      <Txt
        x={10} y={9} w={100} size={13} weight="medium" font="inter"
        color={NAME_INK} lineHeight={24} numberOfLines={1}
      >
        {name}
      </Txt>

      {/* hugeicons:menu-09 — two 16x1.5 bars, 5.5pt apart */}
      <Pressable
        onPress={onLift}
        hitSlop={8}
        style={({ pressed }) => [styles.handle, pressed && styles.pressed]}
      >
        <View style={[styles.handleBar, styles.handleBarTop]} />
        <View style={[styles.handleBar, styles.handleBarBottom]} />
      </Pressable>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function LeadDistribution() {
  const router = useRouter();
  const { data: users = [], isLoading } = useUsers();

  /** The rotation pool: everyone a Lead can be handed to. */
  const staff = useMemo(() => users.filter((u) => u.role !== "SUPER_ADMIN"), [users]);

  const [mode, setMode] = useState<Mode>("round_robin");
  /** Session-only rotation order, by id; anyone not in it keeps API order. */
  const [order, setOrder] = useState<string[]>([]);

  const rows = useMemo(() => {
    const byId = new Map(staff.map((u) => [u.id, u]));
    const ranked = order
      .map((id) => byId.get(id))
      .filter((u): u is User => u !== undefined);
    const seen = new Set(ranked.map((u) => u.id));
    return [...ranked, ...staff.filter((u) => !seen.has(u.id))];
  }, [staff, order]);

  /** What a drag upward would do; from the top slot it wraps to the bottom. */
  const lift = (i: number) => {
    const ids = rows.map((u) => u.id);
    if (i === 0) {
      setOrder([...ids.slice(1), ids[0]]);
      return;
    }
    const above = ids[i - 1];
    ids[i - 1] = ids[i];
    ids[i] = above;
    setOrder(ids);
  };

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      <Backdrop />

      {/* -------------------------------- Header ----------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={16} color={BACK_INK} />
      </Pressable>
      <Txt
        x={72} y={28} w={222} size={20} weight="medium" font="inter"
        color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Lead Distribution
      </Txt>

      {/* -------------------------------- Panel ------------------------------ */}
      <Abs
        x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} radius={28}
        bg={PANEL_FILL} border={PANEL_LINE} borderWidth={1} style={styles.panel}
      />

      {/* Intro copy — 58pt text box, centred on its 36pt container */}
      <Txt
        x={41} y={121.5} w={293} size={15} font="inter"
        color={INTRO_INK} lineHeight={22.5} letterSpacing={-0.38}
      >
        Choose how you’d like leads to be distributed among your team members.
      </Txt>
      {/* HorizontalBorder — 7754:8385, bottom rule of the intro block */}
      <Abs x={21} y={182} w={333} h={1} bg={RULE_HEAD} />

      {/* ------------------------------- Options ----------------------------- */}
      {OPTIONS.map((o, i) => {
        const y = OPTION_Y + i * OPTION_STEP;
        const on = mode === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => setMode(o.key)}
            style={({ pressed }) => [
              styles.option,
              { top: y, height: i === OPTIONS.length - 1 ? 71 : 48 },
              pressed && styles.pressed,
            ]}
          >
            <Radio on={on} />
            <Txt
              x={34} y={0} w={269} size={15} weight="medium" font="inter"
              color={TITLE_INK} lineHeight={24}
            >
              {o.title}
            </Txt>
            <Txt
              x={34} y={24} w={269} size={10} font="inter"
              color={DESC_INK} lineHeight={o.descLine}
            >
              {o.desc}
            </Txt>
          </Pressable>
        );
      })}

      {/* HorizontalBorder — 7754:8402, above the assignment block */}
      <Abs x={21} y={395} w={333} h={1} bg={RULE_BODY} />
      {/* VerticalBorder — 7755:8455, the block's right rule */}
      <Abs x={353} y={396} w={1} h={193} bg={RULE_BODY} />

      {/* --------------------------- Assignment order ------------------------ */}
      <Txt
        x={37} y={412} w={300} size={11} weight="bold" font="inter"
        color={LABEL_INK} lineHeight={16.5} letterSpacing={1.1}
      >
        ASSIGNED CREATORS
      </Txt>

      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={{
          height: Math.max(LIST_H, rows.length * ROW_STEP - (ROW_STEP - ROW_H)),
        }}
      >
        {rows.map((u, i) => (
          <AssignmentRow key={u.id} top={i * ROW_STEP} name={u.name} onLift={() => lift(i)} />
        ))}
        {rows.length === 0 ? (
          <Txt x={10} y={9} w={280} size={13} weight="medium" font="inter" color={NAME_INK} lineHeight={24}>
            {isLoading ? "Loading team…" : "No team members yet"}
          </Txt>
        ) : null}
      </ScrollView>

      {/* --------------------------------- CTA ------------------------------- */}
      <Pressable style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
        <Txt
          x={82.5} y={18} w={136} size={16} weight="semibold" font="inter"
          color="#ffffff" lineHeight={19.36} align="center"
        >
          Save Preferences
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
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
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },

  panel: {
    shadowColor: "#826ec8",
    shadowOpacity: 0.09,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },

  option: {
    position: "absolute",
    left: OPTION_X,
    width: OPTION_W,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: RADIO_ON },

  list: {
    position: "absolute",
    left: LIST_X,
    top: LIST_Y,
    width: LIST_W,
    height: LIST_H,
  },
  handle: {
    position: "absolute",
    left: 269,
    top: 8,
    width: 24,
    height: 24,
  },
  handleBar: {
    position: "absolute",
    left: 4,
    width: 16,
    height: 1.5,
    borderRadius: 0.75,
    backgroundColor: NAME_INK,
  },
  handleBarTop: { top: 8.5 },
  handleBarBottom: { top: 14 },

  cta: {
    position: "absolute",
    left: 37,
    top: 602,
    width: 301,
    height: 55,
    borderRadius: 100,
    backgroundColor: CTA_FILL,
  },
});
