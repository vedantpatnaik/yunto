import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useUsers } from "../../../src/api/hooks";

/**
 * Lead Distribution — Figma 7754:8373 (375x876), traced 1:1.
 *
 * The routing rule for incoming leads, reached from the leads pipeline. The
 * frame carries three background rect nodes, but the exported render shows them
 * as imperceptible over the warm #f8f5ef page, so the page is drawn flat — no
 * washes. On it sit the 36pt back disc and the heading, then one
 * 335x598 frosted panel at (20,104): intro copy above a hairline, the three
 * radio options on a 60pt step from y=196, a second hairline, the assigned
 * list, and the "Save Preferences" CTA at y=602. Everything lands inside 876.
 *
 * Rows are the live roster: everyone a Lead can be handed to, which is every
 * User except the SUPER_ADMIN — seed gives Lead.ownerId to exactly that set. The
 * frame's three names are sample rows, so a longer team scrolls inside the
 * design's 300x142 clip box at the spec's 50pt step rather than being truncated;
 * no coordinate moves.
 *
 * Nothing persists. Prisma has no settings model and the server exposes no
 * distribution route (server/src/routes), so the mode is session state seeded
 * from the frame's own checked option (Round by Round) and "Save Preferences" is
 * drawn as designed but left inert rather than calling an endpoint that does not
 * exist. Likewise the hugeicons:menu-09 drag handle: reordering needs a gesture
 * layer and somewhere to save the order, so it is drawn and not wired.
 *
 * Geist is not loaded in app/_layout.tsx, so the heading and the option titles
 * render in Inter — the frame's own body face. expo-blur is not a dependency, so
 * the panel's BACKGROUND_BLUR is drawn as its translucent fill.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

/** Overlay+Border+Shadow+OverlayBlur — 7754:8384. */
const PANEL = { x: 20, y: 104, w: 335, h: 598 };

/** Frame 1171275475/6/7 — option i at OPTION_Y + i*OPTION_STEP. */
const OPTION_X = 36;
const OPTION_Y = 196;
const OPTION_STEP = 60;
const OPTION_W = 303;

/** Frame 1171275479 — 300x42 rows on a 50pt step inside a 142pt box. */
const LIST = { x: 37, y: 437, w: 300, h: 142 };
const ROW_H = 42;
const ROW_STEP = 50;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef"; // frame fill
const BACK_FILL = "#1f1a17"; // Button — 7754:8378
const BACK_ICON = "#faf7f2"; // Vector — 7754:8381
const HEAD_INK = "#141311"; // Heading 1 — 7754:8383
const PANEL_FILL = "rgba(255,255,255,0.52)";
const PANEL_LINE = "rgba(0,0,0,0.07)";
const RULE_INTRO = "rgba(0,0,0,0.05)"; // HorizontalBorder — 7754:8385
const RULE_BODY = "rgba(0,0,0,0.04)"; // 7754:8402 / VerticalBorder 7755:8455
const INTRO_INK = "rgba(17,17,17,0.7)"; // 7754:8389
const TITLE_INK = "#000000";
const DESC_INK = "rgba(0,0,0,0.7)";
const RADIO_OFF = "#49454f"; // radio_button_unchecked
const RADIO_ON = "#1d1b20"; // radio_button_checked
const LABEL_INK = "#aaaaaa"; // 7755:8457
const ROW_FILL = "#ffffff"; // Input — 7755:8462
const ROW_LINE = "#e5e7eb";
const NAME_INK = "rgba(0,0,0,0.7)";
const CTA_FILL = "#312b28"; // Button — 7797:23071
const CTA_INK = "#ffffff";

/* --------------------------------- options -------------------------------- */
/** The shape the settings payload would carry: GET/PUT /agency/lead-distribution. */
type Mode = "RANDOM" | "BROADCAST" | "ROUND_ROBIN";

/**
 * The three rules in frame order. `descLine` is the description's line box — the
 * first two run on a 24pt line, the third (which wraps inside its 47pt box) on a
 * 20pt one.
 */
const OPTIONS: { key: Mode; title: string; desc: string; descLine: number }[] = [
  {
    key: "RANDOM",
    title: "Random",
    desc: "Distributes leads to any available person randomly.",
    descLine: 24,
  },
  {
    key: "BROADCAST",
    title: "All (Broadcast)",
    desc: "Send leads to all team members. First to respond gets it.",
    descLine: 24,
  },
  {
    key: "ROUND_ROBIN",
    title: "Round by Round",
    desc: "Distributes leads one-by-one in a loop among team members.",
    descLine: 20,
  },
];

/** Material radio — the 20x20 icon vector, inset 2 inside its 24pt box. */
function Radio({ on }: { on: boolean }) {
  return (
    <Abs x={2} y={2} w={20} h={20} radius={10} border={on ? RADIO_ON : RADIO_OFF} borderWidth={2} center>
      {on ? <View style={styles.radioDot} /> : null}
    </Abs>
  );
}

/* ------------------------------- member row ------------------------------- */
/** Input — 300x42 white row: the member's name and the menu-09 handle. */
function MemberRow({ top, name }: { top: number; name: string }) {
  return (
    <Abs x={0} y={top} w={LIST.w} h={ROW_H} radius={8} bg={ROW_FILL} border={ROW_LINE} borderWidth={1}>
      <Txt x={10} y={9} w={100} size={13} weight="medium" font="inter" color={NAME_INK} lineHeight={24} numberOfLines={1}>
        {name}
      </Txt>
      {/* hugeicons:menu-09 — two 16x1.5 bars inside the 24pt icon box */}
      <View style={styles.handleBarTop} />
      <View style={styles.handleBarBottom} />
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function LeadDistributionScreen() {
  const router = useRouter();
  const { data: users = [], isLoading } = useUsers();

  /** The distribution pool: everyone a Lead can be assigned to. */
  const members = useMemo(() => users.filter((u) => u.role !== "SUPER_ADMIN"), [users]);

  const [mode, setMode] = useState<Mode>("ROUND_ROBIN");

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* -------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16} color={BACK_ICON} />
      </Pressable>
      <Txt x={72} y={28} w={222} size={20} weight="medium" font="inter" color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}>
        Lead Distribution
      </Txt>

      {/* -------------------------------- Panel ------------------------------- */}
      <Abs
        x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} radius={28}
        bg={PANEL_FILL} border={PANEL_LINE} borderWidth={1} style={styles.panel}
      />

      {/* Intro copy — the 58pt text box, centred in its 36pt container */}
      <Txt x={41} y={121.5} w={293} size={15} font="inter" color={INTRO_INK} lineHeight={22.5} letterSpacing={-0.38}>
        Choose how you’d like leads to be distributed among your team members.
      </Txt>
      {/* HorizontalBorder — 7754:8385, the intro block's bottom rule */}
      <Abs x={21} y={182} w={333} h={1} bg={RULE_INTRO} />

      {/* -------------------------------- Options ----------------------------- */}
      {OPTIONS.map((o, i) => {
        const on = mode === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => setMode(o.key)}
            style={({ pressed }) => [
              styles.option,
              { top: OPTION_Y + i * OPTION_STEP, height: i === OPTIONS.length - 1 ? 71 : 48 },
              pressed && styles.pressed,
            ]}
          >
            <Radio on={on} />
            <Txt x={34} y={0} w={269} size={15} weight="medium" font="inter" color={TITLE_INK} lineHeight={24}>
              {o.title}
            </Txt>
            <Txt x={34} y={24} w={269} size={10} font="inter" color={DESC_INK} lineHeight={o.descLine}>
              {o.desc}
            </Txt>
          </Pressable>
        );
      })}

      {/* HorizontalBorder — 7754:8402, above the assignment block */}
      <Abs x={21} y={395} w={333} h={1} bg={RULE_BODY} />
      {/* VerticalBorder — 7755:8455, the block's right rule */}
      <Abs x={353} y={396} w={1} h={193} bg={RULE_BODY} />

      {/* --------------------------- Assigned Creators ------------------------ */}
      <Txt x={37} y={412} w={300} size={11} weight="bold" font="inter" color={LABEL_INK} lineHeight={16.5} letterSpacing={1.1}>
        ASSIGNED CREATORS
      </Txt>

      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={{
          height: Math.max(LIST.h, members.length * ROW_STEP - (ROW_STEP - ROW_H)),
        }}
      >
        {members.map((u, i) => (
          <MemberRow key={u.id} top={i * ROW_STEP} name={u.name} />
        ))}
        {members.length === 0 ? (
          <Abs x={0} y={0} w={LIST.w} h={ROW_H} radius={8} bg={ROW_FILL} border={ROW_LINE} borderWidth={1}>
            <Txt x={10} y={9} w={280} size={13} weight="medium" font="inter" color={NAME_INK} lineHeight={24}>
              {isLoading ? "Loading team…" : "No team members yet"}
            </Txt>
          </Abs>
        ) : null}
      </ScrollView>

      {/* --------------------------------- CTA -------------------------------- */}
      <Pressable style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
        <Txt x={82.5} y={18} w={136} size={16} weight="semibold" font="inter" color={CTA_INK} lineHeight={19.36} align="center">
          Save Preferences
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },

  /** Button — 7754:8378, with its 2.7/0.9 drop shadow. */
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

  option: { position: "absolute", left: OPTION_X, width: OPTION_W },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: RADIO_ON },

  list: { position: "absolute", left: LIST.x, top: LIST.y, width: LIST.w, height: LIST.h },
  handleBarTop: { position: "absolute", left: 274, top: 17.5, width: 16, height: 1.5, backgroundColor: NAME_INK },
  handleBarBottom: { position: "absolute", left: 274, top: 23, width: 16, height: 1.5, backgroundColor: NAME_INK },

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
