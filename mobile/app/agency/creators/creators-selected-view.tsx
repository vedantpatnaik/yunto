import { useMemo, useState } from "react";
import { Image, Pressable, Share, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Ring, Screen, Txt } from "../../../src/ui/Frame";
import { compact, useCreators, type Creator } from "../../../src/api/hooks";

/**
 * Creators — Selected creators — Figma frame 7882:17126 (375x876), traced 1:1.
 *
 * Where the roster lands after "View creators" is tapped in the selection bar:
 * the same Creators list, narrowed to the ids that were ticked. Three things
 * change against the unfiltered list (7882:13945) and are reproduced here:
 *
 *   • the selection bar keeps its count but loses the "View creators" link —
 *     the spec's right-hand Container (277,297.5 65x15) is present and empty,
 *     so nothing is drawn in it;
 *   • both tabs re-count over the selection rather than the whole roster;
 *   • the section heading drops "All Creators" for the bare count.
 *
 * 7882:13581 is this same frame with the My-Creators tab active and the taller
 * card that carries the two insight chips, so it is built as tab state, not a
 * second route: `tab` picks both the highlighted pill and the card variant.
 *
 * Card geometry is the spec's, verbatim. The no-chip stack draws its first card
 * at 211.5 and the rest at 195.5 (379 / 606.5 / 818 / 1029.5, 16pt gutter) —
 * card one keeps the 64pt identity block the chip variant needs; the chip stack
 * is uniformly 211.5 (379 / 606.5 / 834 / 1061.5). Both fall out of one
 * cumulative walk, so a roster of any length stacks the way the frame does.
 *
 * Data — every record value is live:
 *   selection  ids= query param carried in from the roster's selection bar.
 *              With no param the standing selection is the agency's shelved
 *              roster (Creator.listed), which is the only "chosen" flag the
 *              schema has; nothing is invented to fill the screen.
 *   My/All     User has no agencyId (only an unjoinable agencyCode) and Agency
 *              has no code column, so "My Creators" cannot be scoped to the
 *              signed-in operator. It is scoped to what the schema does say:
 *              creators attached to an agency at all (Creator.agencyId), with
 *              "All Creators" the whole selection.
 *   card       name / handle / niche / followers / avgViews / leadsCount /
 *              engagementRate / platform / avatarUrl, and the tick state from
 *              membership in the selection.
 *   chip 1     engagementRate measured against the roster mean.
 *
 * Static: the search placeholder, the Add Creator / Filter / Sort captions, the
 * stat captions, the row-action captions, the "Suggestion: Increase" chip (an
 * advisory label with no Prisma backing) and the CTA.
 *
 * The frame's Geist heading renders in Inter — Geist is not one of the two
 * faces registered in app/_layout.tsx. expo-blur is not a dependency, so the
 * BACKGROUND_BLUR on the stat strip, the chips and the row actions renders as
 * their translucent fill alone, as the other agency frames do.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* -------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

const CARD_X = 16;
const CARD_W = 343;
const CARD_Y0 = 379; // first Background+Shadow
const CARD_GAP = 16; // list Container's vertical gutter

/** Button — 7882:17127. 92pt clear of the frame's bottom edge. */
const CTA_X = 24;
const CTA_W = 327;
const CTA_H = 54.5;
const CTA_BOTTOM_INSET = FRAME_H - 784; // 92 — CTA top to frame bottom
const CTA_TAIL = FRAME_H - 838.5; // 37.5 — clearance under the CTA

/* ------------------------------ spec colours ------------------------------ */
const PAGE_BG = "#f8f5ef";
const INK = "#141311";
const INK_MUTED = "#8c8a84";
const INK_70 = "rgba(0,0,0,0.7)";
const ON_DARK = "#faf7f2";
const BACK_BG = "#1f1a17";
const CTA_BG = "#312b28";
const SELBAR_BG = "rgba(242,237,255,0.5)";
const SELBAR_LINE = "#f2edff";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_30 = "rgba(255,255,255,0.3)";
const DIVIDER = "rgba(20,19,17,0.06)";
const PERF_INK = "#23c16b";
const CARD_TO = "#ffffff80";
const CARD_GRAD_START = { x: 0.23, y: -0.23 };
const CARD_GRAD_END = { x: 0.77, y: 1.23 };

/** The four card paints the stack cycles through — 7882:17502 and siblings. */
const CARD_TINTS = [
  { from: "#f2edffcc", strip: "#f2edff66" },
  { from: "#ffecf3cc", strip: "#ffecf366" },
  { from: "#e8f3ffcc", strip: "#e8f3ff66" },
  { from: "#e9f6edcc", strip: "#e9f6ed66" },
] as const;

/* ------------------------------ card variants ----------------------------- */
/**
 * Card-relative offsets. Everything from the stat strip down is a fixed step
 * off `stats`, so a variant only has to declare where its identity block ends.
 */
interface CardLayout {
  h: number;
  avatar: number;
  badge: number;
  name: number;
  handle: number;
  insight: number | null;
  stats: number;
}

/** No-chip, first card — the 64pt identity block, content centred in it. */
const TALL: CardLayout = { h: 211.5, avatar: 24, badge: 58, name: 27, handle: 47, insight: null, stats: 94 };
/** No-chip, cards 2+ — the 48pt identity block. */
const SHORT: CardLayout = { h: 195.5, avatar: 16, badge: 50, name: 19, handle: 39, insight: null, stats: 78 };
/** My-Creators variant — identity block top-aligned, insight chips beneath. */
const CHIP: CardLayout = { h: 211.5, avatar: 24, badge: 58, name: 16, handle: 36, insight: 60, stats: 94 };

/* ------------------------------ derivations ------------------------------- */
const platformIcon = (p?: string): "youtube" | "music" | "instagram" =>
  p === "YOUTUBE" ? "youtube" : p === "TIKTOK" ? "music" : "instagram";

/** The three row actions — 7882:17547 / :17554 / :17559. */
const ROW_ACTIONS = [
  { label: "Profile", x: 16, icon: "user" },
  { label: "Call", x: 122.33, icon: "phone" },
  { label: "Chat", x: 228.67, icon: "message-circle" },
] as const;

type Tab = "my" | "all";

/**
 * Which variant card index `i` gets. The My-Creators stack is uniformly the
 * chip card; the All-Creators stack draws its first card with the taller
 * identity block and every one after it short — exactly the 379 / 606.5 / 818 /
 * 1029.5 rhythm the frame lays out.
 */
const layoutFor = (tab: Tab, i: number): CardLayout =>
  tab === "my" ? CHIP : i === 0 ? TALL : SHORT;

/* --------------------------------- card ----------------------------------- */
interface CardProps {
  c: Creator;
  top: number;
  layout: CardLayout;
  tint: (typeof CARD_TINTS)[number];
  selected: boolean;
  insight: string | null;
  onToggle: () => void;
}

/** Background+Shadow — 343 wide, children at card-relative coordinates. */
function CreatorCard({ c, top, layout, tint, selected, insight, onToggle }: CardProps) {
  const s = layout.stats;
  const stats: { label: string; value: string; x: number }[] = [
    { label: "FOLLOWERS", value: compact(c.followers).toUpperCase(), x: 26 },
    { label: "VIEWS", value: compact(c.avgViews).toUpperCase(), x: 99 },
    { label: "LEADS", value: `${c.leadsCount ?? 0}`, x: 172 },
  ];

  return (
    <Abs x={CARD_X} y={top} w={CARD_W} h={layout.h} radius={26} style={styles.card}>
      <LinearGradient
        colors={[tint.from, CARD_TO]}
        start={CARD_GRAD_START}
        end={CARD_GRAD_END}
        style={styles.fill}
      />

      {/* ------------------------- identity block -------------------------- */}
      {c.avatarUrl ? (
        <Image source={{ uri: c.avatarUrl }} style={[styles.avatar, { top: layout.avatar }]} />
      ) : (
        <Ring x={16} y={layout.avatar} size={48} />
      )}
      {/* Background — the 16pt platform disc on the avatar's corner */}
      <Abs x={50} y={layout.badge} w={16} h={16} radius={8} bg="#ffffff" center style={styles.disc}>
        <Feather name={platformIcon(c.platform)} size={8} color={INK} />
      </Abs>

      <Txt
        x={76} y={layout.name} w={227}
        size={14} weight="bold" font="inter"
        color={INK} lineHeight={17.5} letterSpacing={-0.35} numberOfLines={1}
      >
        {c.name}
      </Txt>
      <Abs x={76} y={layout.handle} h={20} row gap={6}>
        <Txt size={10} font="inter" color={INK_MUTED} lineHeight={15}>
          {c.handle}
        </Txt>
        {c.niche ? (
          <View style={styles.nicheChip}>
            <Txt size={9} weight="bold" font="inter" color={INK_MUTED} lineHeight={13.5}>
              {c.niche}
            </Txt>
          </View>
        ) : null}
      </Abs>

      {/* --------- Frame 2147223285 — insight chips (My Creators only) ------ */}
      {layout.insight !== null ? (
        <Abs x={76} y={layout.insight} h={20} row gap={7}>
          {insight ? (
            <View style={styles.insightChip}>
              <Feather name="trending-up" size={9} color={INK} />
              <Txt size={9} weight="bold" font="inter" color={INK} lineHeight={13.5}>
                {insight}
              </Txt>
            </View>
          ) : null}
          <View style={styles.insightChip}>
            <Ionicons name="bulb-outline" size={9} color={INK} />
            <Txt size={9} weight="bold" font="inter" color={INK} lineHeight={13.5}>
              Suggestion: Increase
            </Txt>
          </View>
        </Abs>
      ) : null}

      {/* ------------------------- Margin — the tick ----------------------- */}
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${c.name} selected`}
        style={selected ? styles.tickOn : styles.tickOff}
      >
        {selected ? <Feather name="check" size={11} color={ON_DARK} /> : null}
      </Pressable>

      {/* ---------------------- Overlay+OverlayBlur strip ------------------- */}
      <Abs x={16} y={s} w={311} h={53.5} radius={16} bg={tint.strip} />
      {stats.map((st) => (
        <Abs key={st.label} x={0} y={0} w={CARD_W} h={layout.h}>
          <Txt
            x={st.x} y={s + 10} w={72}
            size={9} font="inter" color={INK_MUTED} lineHeight={13.5} letterSpacing={0.45}
            align="center"
          >
            {st.label}
          </Txt>
          <Txt
            x={st.x} y={s + 23.5} w={72}
            size={14} weight="bold" font="inter" color={INK} lineHeight={20}
            align="center" numberOfLines={1}
          >
            {st.value}
          </Txt>
        </Abs>
      ))}
      {[98, 171, 244].map((dx) => (
        <Abs key={dx} x={dx} y={s + 14.75} w={1} h={24} bg={DIVIDER} />
      ))}
      <Txt
        x={245} y={s + 12} w={72}
        size={9} font="inter" color={INK_MUTED} lineHeight={13.5} letterSpacing={0.45}
        align="center"
      >
        PERF.
      </Txt>
      <Txt
        x={245} y={s + 25.5} w={72}
        size={12} weight="bold" font="inter" color={PERF_INK} lineHeight={16}
        align="center" numberOfLines={1}
      >
        {`+${c.engagementRate.toFixed(1)}%`}
      </Txt>

      {/* ------------------- HorizontalBorder — row actions ----------------- */}
      <Abs x={16} y={s + 67.5} w={311} h={1} bg={GLASS_30} />
      {ROW_ACTIONS.map((b) => (
        <Abs
          key={b.label}
          x={b.x} y={s + 70.5} w={98.33} h={31} radius={12} bg={GLASS_80}
          row center gap={6} style={styles.actionShadow}
        >
          <Feather name={b.icon} size={11} color={INK} />
          <Txt size={10} weight="semibold" font="inter" color={INK} lineHeight={15}>
            {b.label}
          </Txt>
        </Abs>
      ))}
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function CreatorsSelectedViewScreen() {
  const router = useRouter();
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  const { data: creators, isLoading } = useCreators();
  const all = useMemo<Creator[]>(() => creators ?? [], [creators]);

  const [tab, setTab] = useState<Tab>("all");
  /** Ticks stay live on this screen: unticking drops a creator from the share. */
  const [dropped, setDropped] = useState<string[]>([]);

  /** Ids ticked on the roster; with none carried in, the shelved roster stands in. */
  const carried = useMemo(
    () => (ids ? ids.split(",").filter(Boolean) : null),
    [ids],
  );
  const selection = useMemo(
    () => (carried ? all.filter((c) => carried.includes(c.id)) : all.filter((c) => c.listed)),
    [all, carried],
  );

  /** Agency-managed slice of the selection — the only "mine" the schema allows. */
  const mine = useMemo(() => selection.filter((c) => !!c.agencyId), [selection]);
  const rows = tab === "my" ? mine : selection;

  /** Roster mean, for the My-Creators card's "+N% Above Average" chip. */
  const meanEngagement = useMemo(
    () => (all.length ? all.reduce((sum, c) => sum + c.engagementRate, 0) / all.length : 0),
    [all],
  );
  const vsMean = (c: Creator): string | null => {
    if (meanEngagement <= 0) return null;
    const d = Math.round(((c.engagementRate - meanEngagement) / meanEngagement) * 100);
    return `${d >= 0 ? "+" : ""}${d}% ${d >= 0 ? "Above" : "Below"} Average`;
  };

  /** Cumulative stack — card heights differ, so tops are walked, not stepped. */
  const tops = useMemo(() => {
    const out: number[] = [];
    let y = CARD_Y0;
    for (let i = 0; i < rows.length; i += 1) {
      out.push(y);
      y += layoutFor(tab, i).h + CARD_GAP;
    }
    return out;
  }, [rows, tab]);

  /**
   * The frame draws four cards against an 876 artboard, so the stack already
   * runs past the bottom edge: the page scrolls. The canvas grows to hold the
   * whole selection and the CTA keeps its 92pt inset from the page bottom —
   * which resolves to the spec's own y=784 whenever the list fits the frame.
   */
  const listBottom = tops.length
    ? tops[tops.length - 1] + layoutFor(tab, tops.length - 1).h
    : CARD_Y0;
  const canvasH = Math.max(FRAME_H, listBottom + CARD_GAP + CTA_H + CTA_TAIL);
  const ctaY = canvasH - CTA_BOTTOM_INSET;

  const kept = selection.filter((c) => !dropped.includes(c.id));
  const toggle = (id: string) =>
    setDropped((d) => (d.includes(id) ? d.filter((k) => k !== id) : [...d, id]));

  const share = () => {
    if (!kept.length) return;
    Share.share({
      message: kept.map((c) => `${c.name} ${c.handle}`).join("\n"),
    }).catch(() => undefined);
  };

  return (
    <Screen height={canvasH} background={PAGE_BG} scroll>
      {/* ========================= Frame 2147223266 ========================= */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={16.2} color={ON_DARK} />
      </Pressable>
      <Txt
        x={72} y={20} w={192}
        size={20} weight="medium" font="inter" color={INK} lineHeight={24} letterSpacing={-0.6}
      >
        Creators
      </Txt>
      <Txt
        x={72} y={49} w={192}
        size={10} weight="medium" font="inter" color={INK_70} lineHeight={10.38}
      >
        {`Total: ${all.length} Creators`}
      </Txt>

      {/* ===================== Container — action buttons ==================== */}
      <Abs x={16} y={107} w={120.89} h={32} radius={16} bg={INK} style={styles.addShadow}>
        <Abs x={16} y={10} w={12} h={12} center>
          <Feather name="plus" size={12} color={ON_DARK} />
        </Abs>
        <Txt
          x={34} y={8} w={70.89}
          size={12} weight="bold" font="inter" color={ON_DARK} lineHeight={16} align="center"
        >
          Add Creator
        </Txt>
      </Abs>
      <Pressable
        onPress={() => router.push("/agency/filters/creators-filter-sheet")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.filterBtn, pressed && styles.pressed]}
      >
        <Abs x={15} y={11} w={12} h={12} center>
          <Feather name="filter" size={11} color={INK} />
        </Abs>
        <Txt
          x={33} y={9} w={29.5}
          size={12} weight="semibold" font="inter" color={INK} lineHeight={16} align="center"
        >
          Filter
        </Txt>
      </Pressable>
      <Pressable
        onPress={() => router.push("/agency/creators/creators-sort-sheet")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.sortBtn, pressed && styles.pressed]}
      >
        <Abs x={15} y={11} w={12} h={12} center>
          <Feather name="sliders" size={11} color={INK} />
        </Abs>
        <Txt
          x={33} y={9} w={24.34}
          size={12} weight="semibold" font="inter" color={INK} lineHeight={16} align="center"
        >
          Sort
        </Txt>
      </Pressable>

      {/* ==================== Background+Border+Shadow — search ============== */}
      <Abs x={16} y={160} w={343} h={46} radius={20} bg="#ffffff" style={styles.searchShadow}>
        <Abs x={17} y={15.5} w={15} h={15} center>
          <Feather name="search" size={14} color={INK_MUTED} />
        </Abs>
        <Txt x={44} y={13} w={282} size={14} font="inter" color={INK_MUTED} lineHeight={20}>
          Search creators, niches...
        </Txt>
      </Abs>

      {/* ============ Background+Border+Shadow — My / All Creators =========== */}
      <Abs x={16} y={216} w={343} h={59} radius={16} bg="#ffffff" style={styles.tabsShadow}>
        {([
          { key: "my", label: "My Creators", x: 5, count: mine.length },
          { key: "all", label: "All Creators", x: 171.5, count: selection.length },
        ] as const).map((t) => {
          const on = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={[
                styles.tab,
                { left: t.x },
                on ? styles.tabOn : null,
              ]}
            >
              <Txt
                x={0} y={8} w={166.5}
                size={12} weight={on ? "bold" : "semibold"} font="inter"
                color={on ? ON_DARK : INK_MUTED} lineHeight={16} align="center"
              >
                {t.label}
              </Txt>
              <Txt
                x={0} y={24} w={166.5}
                size={10} font="inter"
                color={on ? ON_DARK : INK_MUTED} lineHeight={16} align="center"
              >
                {`${t.count} Creators`}
              </Txt>
            </Pressable>
          );
        })}
      </Abs>

      {/* ================== Overlay+Border — selection bar =================== */}
      {/* The "View creators" link is gone in this state: the spec's right-hand
          Container (277,297.5 65x15) ships empty, so nothing is drawn there. */}
      <Abs
        x={16} y={284} w={343} h={42} radius={16}
        bg={SELBAR_BG} border={SELBAR_LINE} borderWidth={1}
      >
        <Abs x={17} y={11} w={20} h={20} radius={10} bg={INK} center>
          <Feather name="check" size={10} color={ON_DARK} />
        </Abs>
        <Txt
          x={45} y={13} w={200}
          size={12} weight="semibold" font="inter" color={INK} lineHeight={16}
          style={styles.underline}
        >
          {`${kept.length} creators selected`}
        </Txt>
      </Abs>

      {/* ====================== Container — list heading ===================== */}
      <Txt
        x={16} y={343} w={200}
        size={14} weight="bold" font="inter" color={INK} lineHeight={20} letterSpacing={-0.35}
      >
        {`${rows.length} Creators`}
      </Txt>
      <Txt
        x={209.89} y={345} w={149.11}
        size={12} font="inter" color={INK_MUTED} lineHeight={16} align="right"
      >
        {`${rows.length} results`}
      </Txt>

      {/* =========================== the card stack ========================== */}
      {rows.map((c, i) => (
        <CreatorCard
          key={c.id}
          c={c}
          top={tops[i]}
          layout={layoutFor(tab, i)}
          tint={CARD_TINTS[i % CARD_TINTS.length]}
          selected={!dropped.includes(c.id)}
          insight={vsMean(c)}
          onToggle={() => toggle(c.id)}
        />
      ))}
      {rows.length === 0 ? (
        <Txt
          x={32} y={CARD_Y0 + 16} w={311}
          size={12} font="inter" color={INK_MUTED} lineHeight={16}
        >
          {isLoading ? "Loading creators…" : "No creators in this selection"}
        </Txt>
      ) : null}

      {/* ============================ Button — CTA =========================== */}
      <Pressable
        onPress={share}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.cta,
          { top: ctaY },
          pressed && styles.pressed,
        ]}
      >
        <Txt size={15} weight="semibold" font="inter" color="#ffffff" lineHeight={22.5}>
          Share Selected Creators
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  pressed: { opacity: 0.85 },
  underline: { textDecorationLine: "underline" },

  /** Overlay+Border — the niche pill beside the handle. */
  nicheChip: {
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_80,
    borderWidth: 1,
    borderColor: GLASS_40,
  },
  /** Overlay+Border+OverlayBlur — the two My-Creators insight chips. */
  insightChip: {
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: GLASS_70,
    borderWidth: 1,
    borderColor: GLASS_30,
  },

  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BACK_BG,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },
  addShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  filterBtn: {
    position: "absolute",
    left: 144.89,
    top: 106,
    width: 77.5,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sortBtn: {
    position: "absolute",
    left: 230.39,
    top: 106,
    width: 72.34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  tabsShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tab: {
    position: "absolute",
    top: 5,
    width: 166.5,
    height: 49,
    borderRadius: 12,
  },
  tabOn: {
    backgroundColor: INK,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  card: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.024,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  avatar: {
    position: "absolute",
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  disc: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tickOn: {
    position: "absolute",
    left: 303,
    top: 18,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: INK,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tickOff: {
    position: "absolute",
    left: 302,
    top: 17,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GLASS_80,
    borderWidth: 1,
    borderColor: "rgba(232,229,223,0.3)",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  actionShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  cta: {
    position: "absolute",
    left: CTA_X,
    width: CTA_W,
    height: CTA_H,
    borderRadius: 27.25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CTA_BG,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
