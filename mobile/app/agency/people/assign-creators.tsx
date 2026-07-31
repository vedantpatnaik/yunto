import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useCreators } from "../../../src/api/hooks";

/**
 * Assign Creators — Figma frame 7753:8230 (375x876), traced 1:1.
 *
 * The creator-allocation summary, reached from Team Management > Assign
 * Creators. One 335x289 frosted panel (20,104.5) holds three stacked rows: a
 * titled header with the mint assignment glyph, a full-width "Total Creators /
 * 90 / Creators" block, and a 3-up split — Assigned / Unassigned / Pending
 * Approvals — divided by hairline rules. The legacy 3598:8160 gen laid all four
 * metrics out as stacked full-width cards; this 876 gen compresses the last
 * three into a single row, which is what is drawn here.
 *
 * Panel children use panel-relative coordinates with the origin at (21, 105.5)
 * — the panel's own (20, 104.5) plus its 1pt stroke, since Yoga positions
 * absolute children against the padding box. That is the same inset Figma
 * applies: its first child sits at x=21, one point inside the panel edge. The
 * panel clips, so the bottom rule and the third column's right rule fall on the
 * rounded edge exactly as the design draws them.
 *
 * Data — every number is derived from the live creator roster:
 *   total       = creators.length
 *   assigned    = creators with an agencyId
 *   unassigned  = total - assigned
 * Prisma has no approval model for creator assignment (only Leave carries
 * PENDING/APPROVED), so "Pending Approvals" is read from the fields that do
 * exist: a creator attached to an agency whose roster listing has not been
 * published yet (agencyId set, listed false). It is a derivation, not a stored
 * status, and it resolves to a real count rather than a fabricated one.
 *
 * expo-blur is not a dependency, so the panel's BACKGROUND_BLUR(20) renders as
 * its translucent fill alone — the substitution the other agency frames make.
 * Header type is Geist in the file; only Outfit and Inter are loaded, so it
 * renders in Inter.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/** Overlay+Border+Shadow+OverlayBlur — 7753:8333. */
const PANEL = { x: 20, y: 104.5, w: 335, h: 289, r: 28 };
/** Inner box after the 1pt stroke: 333 x 287. */
const INNER_W = 333;

/* Row bands inside the panel (rel): header 0..81, total 81..187, split 187..287. */
const ROW1_RULE_Y = 80;
const ROW2_Y = 81;
const ROW2_RULE_Y = 186;
const ROW3_Y = 187;
const ROW3_H = 99;
const ROW3_RULE_Y = 286;

/* --------------------------- spec colour tokens --------------------------- */
const BG = "#f8f5ef"; // frame fill
const BACK_FILL = "#1f1a17"; // Button — 7753:8235
const BACK_INK = "#faf7f2"; // Vector — 7753:8238
const TITLE_INK = "#141311"; // Heading 1 — 7753:8240

const PANEL_FILL = "rgba(255,255,255,0.52)";
const PANEL_LINE = "rgba(0,0,0,0.07)";
const RULE_STRONG = "rgba(0,0,0,0.05)"; // 7753:8334 bottom border
const RULE_SOFT = "rgba(0,0,0,0.04)"; // 7753:8343 / :8351 / the three columns

const DISC_FILL = "#d1fae5"; // Background+Shadow — 7797:23041
const DISC_INK = "#059669"; // Vector — 7797:23043
const SECTION_INK = "#111111"; // "Assign Creators" — 7753:8338
const LABEL_INK = "#aaaaaa"; // metric captions
const VALUE_INK = "#111111"; // "90" / "70"
const UNIT_INK = "#888888"; // "Creators" — 7753:8350

/* -------------------------------- backdrop -------------------------------- */
/**
 * Gradient / Gradient / Overlay+Blur — 7753:8231, :8232, :8233.
 *
 * The 876-gen page wash: a full-bleed rect carrying three radial paints, a
 * fourth in the bottom-right 262.5x350.4 box, and a blurred lilac blob hanging
 * off the bottom-left edge. This export dropped the paints from the three
 * rects; the stops below are the same shared backdrop measured at identical
 * coordinates on 7756:8482, so nothing here is guessed. The blob's 55pt layer
 * blur has no React Native equivalent and is folded into the radial falloff.
 */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        {/* 7753:8231 — #ffd7eb 38%, centre (1.08, 0.30) of the full frame */}
        <RadialGradient id="rose" cx={405} cy={262.8} rx={262.5} ry={438} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffd7eb" stopOpacity={0.38} />
          <Stop offset="0.55" stopColor="#ffd7eb" stopOpacity={0} />
        </RadialGradient>
        {/* 7753:8231 — #ebd7ff 40%, centre (-0.05, 0.40) */}
        <RadialGradient id="lilac" cx={-18.75} cy={350.4} rx={300} ry={438} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ebd7ff" stopOpacity={0.4} />
          <Stop offset="0.55" stopColor="#ebd7ff" stopOpacity={0} />
        </RadialGradient>
        {/* 7753:8231 — #c3cdff 65%, centre (0.50, -0.06) */}
        <RadialGradient id="peri" cx={187.5} cy={-52.56} rx={450} ry={438} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#c3cdff" stopOpacity={0.65} />
          <Stop offset="0.5" stopColor="#c3cdff" stopOpacity={0} />
        </RadialGradient>
        {/* 7753:8232 — #bee1ff 50%, centred on the box's bottom-right */}
        <RadialGradient id="sky" cx={375} cy={876} rx={236.25} ry={262.8} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#bee1ff" stopOpacity={0.5} />
          <Stop offset="0.65" stopColor="#bee1ff" stopOpacity={0} />
        </RadialGradient>
        {/* 7753:8233 — #dcd2ff at 30%, 55pt layer blur */}
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

/* -------------------------------- columns --------------------------------- */
type ColKey = "assigned" | "unassigned" | "pending";

/**
 * The three VerticalBorder cells — 7753:8352 / :8357 / :8362. Each carries a
 * right-hand hairline (the third's lands on the panel edge and is clipped by
 * the corner radius), a two-line uppercase caption and the metric. Caption and
 * value x/w are the spec's own text bounds, which sit centred on the cell's
 * 16pt-padded content box.
 */
const COLUMNS: {
  key: ColKey;
  label: string;
  ink: string;
  ruleX: number;
  labelX: number;
  labelW: number;
  valueX: number;
  valueW: number;
}[] = [
  {
    key: "assigned", label: "Assigned Creators", ink: VALUE_INK,
    ruleX: 100, labelX: 13, labelW: 74, valueX: 16, valueW: 68,
  },
  {
    key: "unassigned", label: "Unassigned Creators", ink: "#3a7de8",
    ruleX: 217, labelX: 115.5, labelW: 87, valueX: 117, valueW: 84,
  },
  {
    key: "pending", label: "Pending Approvals", ink: "#4acd6d",
    ruleX: 332, labelX: 231.5, labelW: 87, valueX: 234, valueW: 82,
  },
];

/* --------------------------------- screen --------------------------------- */
export default function AssignCreatorsScreen() {
  const router = useRouter();
  const { data: creators = [], isLoading } = useCreators();

  const summary = useMemo(() => {
    const total = creators.length;
    const assigned = creators.filter((c) => !!c.agencyId).length;
    return {
      total,
      assigned,
      unassigned: total - assigned,
      // Claimed by an agency but not yet published to the roster.
      pending: creators.filter((c) => !!c.agencyId && !c.listed).length,
    };
  }, [creators]);

  /** Counts read as an em dash until the roster lands, so 0 never lies. */
  const show = (n: number) => (isLoading ? "—" : `${n}`);

  return (
    <Screen height={FRAME_H} background={BG} scroll>
      <Backdrop />

      {/* ============================ Frame 2147223268 ======================== */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16.2} color={BACK_INK} />
      </Pressable>
      <Txt
        x={72} y={28} w={222}
        size={20} weight="medium" font="inter"
        color={TITLE_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Team Management
      </Txt>

      {/* ================== Overlay+Border+Shadow+OverlayBlur ================== */}
      <Abs
        x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} radius={PANEL.r}
        bg={PANEL_FILL} border={PANEL_LINE} borderWidth={1}
        style={styles.panel}
      >
        {/* ---------------------- HorizontalBorder (header) ------------------ */}
        <Abs x={20} y={16} w={48} h={48} radius={20} bg={DISC_FILL} center style={styles.discShadow}>
          <MaterialCommunityIcons name="clipboard-check-outline" size={22} color={DISC_INK} />
        </Abs>
        <Txt
          x={80} y={28} w={135}
          size={15} weight="semibold" font="inter"
          color={SECTION_INK} lineHeight={22.5} letterSpacing={-0.38}
          numberOfLines={1}
        >
          Assign Creators
        </Txt>
        <Abs x={0} y={ROW1_RULE_Y} w={INNER_W} h={1} bg={RULE_STRONG} />

        {/* ------------------ HorizontalBorder (total creators) -------------- */}
        <Txt
          x={20} y={ROW2_Y + 16} w={113}
          size={11} weight="bold" font="inter"
          color={LABEL_INK} lineHeight={16.5} letterSpacing={1.1}
          style={styles.upper}
        >
          Total Creators
        </Txt>
        <Txt
          x={20} y={ROW2_Y + 39} w={113}
          size={28} weight="semibold" font="inter"
          color={VALUE_INK} lineHeight={28} letterSpacing={-0.7}
          numberOfLines={1}
        >
          {show(summary.total)}
        </Txt>
        <Txt
          x={20} y={ROW2_Y + 71} w={113}
          size={12} weight="medium" font="inter"
          color={UNIT_INK} lineHeight={18}
        >
          Creators
        </Txt>
        <Abs x={0} y={ROW2_RULE_Y} w={INNER_W} h={1} bg={RULE_SOFT} />

        {/* -------------- HorizontalBorder (assigned / unassigned / pending) -- */}
        {COLUMNS.map((c) => (
          <Abs key={c.key} x={0} y={0} w={INNER_W} h={PANEL.h}>
            {/* VerticalBorder — right hairline */}
            <Abs x={c.ruleX} y={ROW3_Y} w={1} h={ROW3_H} bg={RULE_SOFT} />
            <Txt
              x={c.labelX} y={ROW3_Y + 16} w={c.labelW}
              size={11} weight="bold" font="inter"
              color={LABEL_INK} lineHeight={16.5} letterSpacing={1.1}
              align="center" style={styles.upper}
            >
              {c.label}
            </Txt>
            <Txt
              x={c.valueX} y={ROW3_Y + 57} w={c.valueW}
              size={26} weight="semibold" font="inter"
              color={c.ink} lineHeight={26} letterSpacing={-0.65}
              align="center" numberOfLines={1}
            >
              {show(summary[c.key])}
            </Txt>
          </Abs>
        ))}
        <Abs x={0} y={ROW3_RULE_Y} w={INNER_W} h={1} bg={RULE_SOFT} />
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.85 },
  upper: { textTransform: "uppercase" },

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
    overflow: "hidden",
    shadowColor: "#826ec8",
    shadowOpacity: 0.09,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  discShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
});
