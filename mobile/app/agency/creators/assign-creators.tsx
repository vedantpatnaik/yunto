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
 * The creator-allocation summary in the creators flow, entered from Team
 * Management (the back header still reads "Team Management"). A single 335x289
 * frosted panel at (20, 104.5) carries three stacked bands:
 *
 *   1. header row  — mint 48pt disc + "Assign Creators", closed by a hairline
 *   2. total row   — "TOTAL CREATORS / 90 / Creators", full width
 *   3. split row   — Assigned | Unassigned | Pending Approvals, three cells
 *                    each drawing its own right-hand hairline
 *
 * Panel children are positioned against the panel's padding box, whose origin
 * is (21, 105.5) in frame space — the panel's own (20, 104.5) plus its 1pt
 * stroke. That is exactly where Figma puts its first child, so every panel-
 * relative constant below is the spec coordinate minus (21, 105.5). The panel
 * clips, which is what lets the third cell's right rule and the bottom rule die
 * on the rounded corners the way the design draws them.
 *
 * expo-blur is not a dependency, so the panel's BACKGROUND_BLUR(20) renders as
 * its translucent fill alone — the substitution the other agency frames make.
 * The header face is Geist in the file; only Outfit and Inter are loaded, so it
 * renders in Inter, as on the sibling agency screens.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/** Overlay+Border+Shadow+OverlayBlur — 7753:8333. */
const PANEL = { x: 20, y: 104.5, w: 335, h: 289, r: 28 };
/** Panel width inside the 1pt stroke — the span every full-width rule uses. */
const INNER_W = 333;

/* Band edges, panel-relative: header 0..81, total 81..187, split 187..287. */
const HEADER_RULE_Y = 80;
const TOTAL_Y = 81;
const TOTAL_RULE_Y = 186;
const SPLIT_Y = 187;
const SPLIT_H = 99;
const SPLIT_RULE_Y = 286;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef"; // frame fill
const BACK_FILL = "#1f1a17"; // Button — 7753:8235
const BACK_INK = "#faf7f2"; // Vector — 7753:8238
const HEADER_INK = "#141311"; // "Team Management" — 7753:8240

const PANEL_FILL = "rgba(255,255,255,0.52)";
const PANEL_LINE = "rgba(0,0,0,0.07)";
const RULE_HEAD = "rgba(0,0,0,0.05)"; // 7753:8334 bottom border
const RULE_SOFT = "rgba(0,0,0,0.04)"; // 7753:8343 / :8351 / the three cells

const DISC_FILL = "#d1fae5"; // Background+Shadow — 7797:23041
const DISC_INK = "#059669"; // Vector — 7797:23043
const TITLE_INK = "#111111"; // "Assign Creators" — 7753:8338
const CAPTION_INK = "#aaaaaa"; // the four uppercase metric captions
const VALUE_INK = "#111111"; // "90" — 7753:8348 / "70" — 7753:8356
const UNIT_INK = "#888888"; // "Creators" — 7753:8350

/* -------------------------------- backdrop -------------------------------- */
/**
 * Gradient / Gradient / Overlay+Blur — 7753:8231, :8232, :8233.
 *
 * The page wash shared by every 876-tall agency frame: a full-bleed rect
 * carrying three radial paints, a fourth confined to the bottom-right
 * 262.5x350.4 box, and a blurred lilac blob hanging off the bottom-left edge.
 * The spec exporter drops gradient paints entirely (no frame in the cache
 * carries one), so the geometry here is the spec's and the stops are the wash
 * already established across the agency flow — see profile/integrations.tsx and
 * leads/lead-distribution.tsx, which trace the same three nodes at the same
 * coordinates. The blob's layer blur has no RN equivalent and is folded into
 * the radial falloff.
 */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        {/* 7753:8231 — #ffd7eb 38%, centre (1.08, 0.30) of the frame */}
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
        {/* 7753:8233 — #dcd2ff 30%, 55pt layer blur folded into the falloff */}
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

/* ------------------------------- split cells ------------------------------ */
type CellKey = "assigned" | "unassigned" | "pending";

interface Cell {
  key: CellKey;
  /** VerticalBorder id — 7753:8352 / :8357 / :8362. */
  x: number;
  w: number;
  label: string;
  /** Caption bounds inside the cell (the spec's own wrapped text box). */
  labelX: number;
  labelW: number;
  /** Value bounds inside the cell — the Container, so longer counts stay centred. */
  valueX: number;
  valueW: number;
  ink: string;
  /**
   * Drill-in target, where one exists. "Pending Approvals" has no destination
   * screen in the app, so that cell stays inert rather than pointing somewhere
   * that would not show what it counts.
   */
  route?: string;
}

const CELLS: Cell[] = [
  {
    key: "assigned", label: "Assigned Creators",
    x: 0, w: 101, labelX: 13, labelW: 74, valueX: 16, valueW: 68,
    ink: VALUE_INK, route: "/creators/creators-roster",
  },
  {
    key: "unassigned", label: "Unassigned Creators",
    x: 101, w: 117, labelX: 14.5, labelW: 87, valueX: 16, valueW: 84,
    ink: "#3a7de8", route: "/creators/creators-roster-all-tab",
  },
  {
    key: "pending", label: "Pending Approvals",
    x: 218, w: 115, labelX: 13.5, labelW: 87, valueX: 16, valueW: 82,
    ink: "#4acd6d",
  },
];

/* --------------------------------- screen --------------------------------- */
export default function AssignCreatorsScreen() {
  const router = useRouter();
  const { data: creators = [], isLoading } = useCreators();

  /**
   * Every figure on the panel comes off GET /creators:
   *   total       creators.length
   *   assigned    creators carrying an agencyId
   *   unassigned  the remainder — the rows an assignment write would fill, and
   *               the rows `{ agencyId: null }` puts back (server schemas.ts:14)
   *   pending     Prisma has no approval model for creator assignment, so this
   *               is derived from the two flags that do exist: claimed by an
   *               agency but not yet published to its roster (agencyId set,
   *               listed false). A real count off real columns, not a stand-in.
   */
  const counts = useMemo(() => {
    const total = creators.length;
    const assigned = creators.filter((c) => !!c.agencyId).length;
    return {
      total,
      assigned,
      unassigned: total - assigned,
      pending: creators.filter((c) => !!c.agencyId && !c.listed).length,
    };
  }, [creators]);

  /** Counts read as an em dash until the roster lands, so 0 never lies. */
  const show = (n: number) => (isLoading ? "—" : `${n}`);

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
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
        color={HEADER_INK} lineHeight={24} letterSpacing={-0.6}
        numberOfLines={1}
      >
        Team Management
      </Txt>

      {/* ================== Overlay+Border+Shadow+OverlayBlur ================== */}
      <Abs
        x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} radius={PANEL.r}
        bg={PANEL_FILL} border={PANEL_LINE} borderWidth={1}
        style={styles.panel}
      >
        {/* ------------------- HorizontalBorder — 7753:8334 ------------------- */}
        <Abs
          x={20} y={16} w={48} h={48} radius={20} bg={DISC_FILL} center
          style={styles.disc}
        >
          <MaterialCommunityIcons name="clipboard-check-outline" size={22} color={DISC_INK} />
        </Abs>
        <Txt
          x={80} y={28} w={135}
          size={15} weight="semibold" font="inter"
          color={TITLE_INK} lineHeight={22.5} letterSpacing={-0.38}
          numberOfLines={1}
        >
          Assign Creators
        </Txt>
        <Abs x={0} y={HEADER_RULE_Y} w={INNER_W} h={1} bg={RULE_HEAD} />

        {/* ------------------- HorizontalBorder — 7753:8343 ------------------- */}
        <Txt
          x={20} y={TOTAL_Y + 16} w={113}
          size={11} weight="bold" font="inter"
          color={CAPTION_INK} lineHeight={16.5} letterSpacing={1.1}
          style={styles.upper}
        >
          Total Creators
        </Txt>
        <Txt
          x={20} y={TOTAL_Y + 39} w={113}
          size={28} weight="semibold" font="inter"
          color={VALUE_INK} lineHeight={28} letterSpacing={-0.7}
          numberOfLines={1}
        >
          {show(counts.total)}
        </Txt>
        <Txt
          x={20} y={TOTAL_Y + 71} w={113}
          size={12} weight="medium" font="inter"
          color={UNIT_INK} lineHeight={18}
        >
          Creators
        </Txt>
        <Abs x={0} y={TOTAL_RULE_Y} w={INNER_W} h={1} bg={RULE_SOFT} />

        {/* ------------------- HorizontalBorder — 7753:8351 ------------------- */}
        {CELLS.map((cell) => (
          <Pressable
            key={cell.key}
            disabled={!cell.route}
            onPress={() => cell.route && router.push(cell.route)}
            accessibilityRole={cell.route ? "button" : undefined}
            accessibilityLabel={`${cell.label} ${show(counts[cell.key])}`}
            style={({ pressed }) => [
              styles.cell,
              { left: cell.x, width: cell.w },
              pressed && styles.pressed,
            ]}
          >
            {/* VerticalBorder — the cell's right hairline */}
            <Abs x={cell.w - 1} y={0} w={1} h={SPLIT_H} bg={RULE_SOFT} />
            <Txt
              x={cell.labelX} y={16} w={cell.labelW}
              size={11} weight="bold" font="inter"
              color={CAPTION_INK} lineHeight={16.5} letterSpacing={1.1}
              align="center" style={styles.upper}
            >
              {cell.label}
            </Txt>
            <Txt
              x={cell.valueX} y={57} w={cell.valueW}
              size={26} weight="semibold" font="inter"
              color={cell.ink} lineHeight={26} letterSpacing={-0.65}
              align="center" numberOfLines={1}
            >
              {show(counts[cell.key])}
            </Txt>
          </Pressable>
        ))}
        <Abs x={0} y={SPLIT_RULE_Y} w={INNER_W} h={1} bg={RULE_SOFT} />
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.85 },
  upper: { textTransform: "uppercase" },

  /** Button — 7753:8235, with 7753:8236's two drop shadows collapsed into one. */
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
  disc: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  cell: {
    position: "absolute",
    top: SPLIT_Y,
    height: SPLIT_H,
  },
});
