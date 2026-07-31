import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useLeaves, useMe, type Leave } from "../../../src/api/hooks";

/**
 * Leaves — Figma frame 7752:8012 (375x876), traced 1:1.
 *
 * The Leaves stop off the Team Management hub, and a deliberately sparse frame:
 * one 335x271 glass card at y=104.5 holding the calendar row header ("Leaves"),
 * a hairline, the two side-by-side balances ("LEAVE BALANCE" / 2 days / Causal
 * Leave on the left, 2 days / Paid Leave at x=227) and the 301x54 glass
 * "Apply for leave" pill at y=303.5. Nothing else is drawn — the lower two
 * thirds of the frame are empty page.
 *
 * The frame's three full-bleed wash rects (7752:8013/8014 "Gradient",
 * 7752:8015 "Overlay+Blur") carry no paints in the spec, so they are not
 * invented here — the frame's own #f8f5ef ground stands in, exactly as it does
 * on the sibling team-management frames, which ship the flat page with no wash.
 *
 * "Apply for leave" is pressable but inert: the agency file has no apply-leave
 * frame, and a push to a path with no file fails silently.
 *
 * Heading type is Geist in the file; only Outfit and Inter are loaded, so it
 * renders in Inter — the frame's own body face. The legacy 3486:7024 and
 * 4101:66296 cuts carry the same content in the older single-line
 * "Causal Leaves : 2 days" layout; this is the current one.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

const CARD = { x: 20, y: 104.5, w: 335, h: 271 };
/** Card interior runs 21..354, so both hairlines are 333 wide at x=21. */
const RULE_X = 21;
const RULE_W = 333;

/** The two balance columns, straight off the spec's x/y. */
const CASUAL = { x: 41, w: 105, valueY: 225.5, labelY: 257.5, labelW: 77 };
const PAID = { x: 227, w: 63, valueY: 220.5, labelY: 252.5, labelW: 63 };

const CTA = { x: 37, y: 303.5, w: 301, h: 54 };

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";
const ROW_INK = "#111111";
const ICON_TILE = "#ffedd5";
const ICON_INK = "#ea580c";
const CAPTION_INK = "#aaaaaa";
const SUB_INK = "#888888";
const CHEVRON_INK = "#64748b";
const CARD_FILL = "rgba(255,255,255,0.52)"; // #ffffff @ 52%
const CARD_LINE = "rgba(0,0,0,0.07)"; // #000000 @ 7%
const RULE_STRONG = "rgba(0,0,0,0.05)"; // header row bottom border
const RULE_SOFT = "rgba(0,0,0,0.04)"; // balances row bottom border
const CTA_FILL = "rgba(255,255,255,0.5)"; // #ffffff @ 50%
const CTA_LINE = "rgba(255,255,255,0.6)"; // #ffffff @ 60%

/* ------------------------------ derivations ------------------------------- */
const DAY_MS = 86_400_000;

/** Inclusive span of a leave in whole days — the unit the design prints. */
function spanDays(lv: Leave): number {
  const from = new Date(lv.from).setHours(0, 0, 0, 0);
  const to = new Date(lv.to).setHours(0, 0, 0, 0);
  if (Number.isNaN(from) || Number.isNaN(to) || to < from) return 0;
  return Math.round((to - from) / DAY_MS) + 1;
}

/**
 * Which column a record lands in. Leave.type is a free-form string on the
 * Prisma model, so the buckets match the labels the design prints and nothing
 * else — a type that names neither ("Sick", "Earned") counts toward neither.
 * "Causal" is the file's spelling of casual; both are accepted.
 */
function bucketOf(type: string): "casual" | "paid" | null {
  const t = type.toLowerCase();
  if (t.includes("casual") || t.includes("causal")) return "casual";
  if (t.includes("paid") && !t.includes("unpaid")) return "paid";
  return null;
}

/* -------------------------------- primitives ------------------------------ */
/**
 * The big balance figure. Figma splits it with a style run — the count at 28pt,
 * the " days" unit at 16pt — so the unit is a nested Text on the same node.
 */
function Balance({
  x, y, w, days, loading,
}: { x: number; y: number; w: number; days: number; loading: boolean }) {
  return (
    <Txt
      x={x} y={y} w={w}
      size={28} weight="semibold" font="inter" color={ROW_INK}
      lineHeight={28} letterSpacing={-0.7} numberOfLines={1}
    >
      {loading ? "—" : days}
      {loading ? null : <Text style={styles.unit}> days</Text>}
    </Txt>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function LeavesScreen() {
  const router = useRouter();

  const { data: leaves = [], isLoading } = useLeaves();
  const { data: me } = useMe();

  /**
   * Leave balance. No model carries an entitlement or allowance column, so the
   * honest reading of the figure is what is actually on file: the days this
   * user has recorded against that type in the current calendar year, rejected
   * requests excluded. Same derivation web/src/features/apply-leaves uses,
   * counted in days rather than records because the design's unit is days.
   */
  const { casual, paid } = useMemo(() => {
    const year = new Date().getFullYear();
    let c = 0;
    let p = 0;
    for (const lv of leaves) {
      if (me && lv.userId !== me.id) continue;
      if (lv.status === "REJECTED") continue;
      if (new Date(lv.from).getFullYear() !== year) continue;
      const bucket = bucketOf(lv.type);
      if (bucket === "casual") c += spanDays(lv);
      else if (bucket === "paid") p += spanDays(lv);
    }
    return { casual: c, paid: p };
  }, [leaves, me]);

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* ============================ Frame 2147223268 ======================== */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={16} color={BACK_ICON} />
      </Pressable>
      <Txt
        x={72} y={28} w={222}
        size={20} weight="medium" font="inter"
        color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Team Management
      </Txt>

      {/* ================== Overlay+Border+Shadow+OverlayBlur ================== */}
      <Abs
        x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} radius={28}
        bg={CARD_FILL} border={CARD_LINE} borderWidth={1} style={styles.card}
      />

      {/* --------------------------- HorizontalBorder ------------------------ */}
      <Abs
        x={41} y={121.5} w={48} h={48} radius={20}
        bg={ICON_TILE} center style={styles.tileShadow}
      >
        {/* Spec icon is a calendar with a check inside (3 stroked vectors);
            Feather has no calendar-check, so the MCI outline cut stands in. */}
        <MaterialCommunityIcons name="calendar-check-outline" size={26} color={ICON_INK} />
      </Abs>
      <Txt
        x={101} y={134} w={68}
        size={15} weight="semibold" font="inter"
        color={ROW_INK} lineHeight={22.5} letterSpacing={-0.38}
      >
        Leaves
      </Txt>
      <Abs x={RULE_X} y={185.5} w={RULE_W} h={1} bg={RULE_STRONG} />

      {/* ------------------------- Balances (two columns) -------------------- */}
      <Txt
        x={CASUAL.x} y={202.5} w={CASUAL.w}
        size={11} weight="bold" font="inter"
        color={CAPTION_INK} lineHeight={16.5} letterSpacing={1.1}
      >
        LEAVE BALANCE
      </Txt>

      {/* Spec text boxes hug "2 days" (55pt); widened to the column so a
          two-digit balance cannot wrap. Origins are the spec's. */}
      <Balance
        x={CASUAL.x} y={CASUAL.valueY} w={CASUAL.w} days={casual} loading={isLoading}
      />
      <Txt
        x={CASUAL.x} y={CASUAL.labelY} w={CASUAL.labelW}
        size={12} weight="medium" font="inter" color={SUB_INK} lineHeight={18}
      >
        Causal Leave
      </Txt>

      <Balance x={PAID.x} y={PAID.valueY} w={PAID.w} days={paid} loading={isLoading} />
      <Txt
        x={PAID.x} y={PAID.labelY} w={PAID.labelW}
        size={12} weight="medium" font="inter" color={SUB_INK} lineHeight={18}
      >
        Paid Leave
      </Txt>

      <Abs x={RULE_X} y={291.5} w={RULE_W} h={1} bg={RULE_SOFT} />

      {/* --------------------------------- Button ---------------------------- */}
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        {/* Spec box hugs at 100pt, where Figma's Inter metrics just fit one
            line; RN measures a hair wider and wraps, so the box is widened
            10pt each side about the same centre and pinned to one line. */}
        <Txt
          x={5.55} y={17} w={120}
          size={14} weight="medium" font="inter"
          color={ROW_INK} lineHeight={20} align="center" numberOfLines={1}
        >
          Apply for leave
        </Txt>
        <Abs x={267.44} y={18} w={18} h={18} center>
          <Feather name="chevron-right" size={18} color={CHEVRON_INK} />
        </Abs>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },
  unit: { fontSize: 16 },

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

  // Two drop shadows in the spec (8/0,2 black @4% and 40/0,12 #826ec8 @9%);
  // RN takes one, so the wider violet lift is the one that shows.
  card: {
    shadowColor: "#826ec8",
    shadowOpacity: 0.09,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  tileShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  // cornerRadius 40 on a 54pt box clamps to the pill.
  cta: {
    position: "absolute",
    left: CTA.x,
    top: CTA.y,
    width: CTA.w,
    height: CTA.h,
    borderRadius: CTA.h / 2,
    backgroundColor: CTA_FILL,
    borderWidth: 1,
    borderColor: CTA_LINE,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
