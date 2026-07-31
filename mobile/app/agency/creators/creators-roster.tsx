import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Image, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Ring, Screen, Txt } from "../../../src/ui/Frame";
import { fonts, radius } from "../../../src/theme";
import { compact, useAgencies, useCreators, type Creator } from "../../../src/api/hooks";

/**
 * Creators — My Creators. Figma 7779:18561 (375x876), traced 1:1.
 *
 * The roster entry point for the agency app. Five stacked bands over the flat
 * #f8f5ef frame: the "Creators / Total: N Creators" header, the Add Creator |
 * Filter | Sort action row, the search field + segmented My/All tabs, the
 * selection bar, and the card list. Each 343x211.5 card carries an avatar with a
 * platform badge, name / @handle / niche chip, one or two AI insight chips, a
 * 4-up FOLLOWERS / VIEWS / LEADS / PERF. strip and a Profile | Call | Chat row.
 *
 * Scrolling follows the design rather than the frame: the file wraps the cards
 * in a 375x425 clipping container at y=343 that the four cards overflow (they
 * run to y=1273), and parks the "Share Selected Creators" pill at y=784 *below*
 * that box. So the list scrolls inside its own 379..768 window and the pill
 * stays put, exactly as drawn — it is a floating CTA, not the end of a column.
 *
 * Data — every record value is live off GET /creators:
 *   Total: N Creators   agency.creatorsCount (falling back to the roster size)
 *   tab counts          my roster vs. the whole directory
 *   N results           the filtered row count
 *   card fields         name, handle, niche, avatarUrl, platform, followers,
 *                       avgViews, leadsCount
 * Two numbers in the design have no column behind them, so both are derived
 * from the roster rather than invented (see PERF / insight chip notes below).
 * Selection is client state, as the design implies — there is no saved-list
 * model in Prisma.
 *
 * expo-blur is not a dependency, so the chips' BACKGROUND_BLUR(8) renders as
 * their translucent fill alone — the substitution the other agency frames make.
 * The header face is Geist in the file; only Outfit and Inter are loaded, so it
 * renders in Inter, as on the sibling creator screens.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/** "Container" 7779:18562 — the clipping window the card stack scrolls in. */
const LIST_Y = 379;
const LIST_H = 389; // 343 + 425 container bottom (768) - 379
const CARD_X = 16;
const CARD_W = 343;
const CARD_H = 211.5;
const CARD_STEP = 227.5;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef"; // frame fill
const INK = "#141311"; // headings, values, chip text
const MUTED = "#8c8a84"; // captions, handles, idle tab
const ON_DARK = "#faf7f2"; // type on the filled pills
const BACK_FILL = "#1f1a17"; // Button — 7779:18906
const PILL_FILL = "#312b28"; // Button — 7779:18563
const UP = "#23c16b"; // PERF. value
const WHITE = "#ffffff";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const SELECT_BAR = "rgba(242,237,255,0.5)"; // Overlay+Border — 7779:18866
const DIVIDER = "rgba(20,19,17,0.06)"; // Vertical Divider fills
const TOTAL_INK = "rgba(0,0,0,0.7)"; // "Total: 49 Creators"

/**
 * The four card paints, cycled down the stack: a top-stop tint fading to
 * #ffffff80, and the same tint at 40% behind the metric strip.
 */
const TINTS = [
  { from: "#f2edffcc", strip: "rgba(242,237,255,0.4)" },
  { from: "#ffecf3cc", strip: "rgba(255,236,243,0.4)" },
  { from: "#e8f3ffcc", strip: "rgba(232,243,255,0.4)" },
  { from: "#e9f6edcc", strip: "rgba(233,246,237,0.4)" },
] as const;

const CARD_GRAD_START = { x: 0.23, y: -0.23 };
const CARD_GRAD_END = { x: 0.77, y: 1.23 };

/* ------------------------------ derivations ------------------------------- */
/**
 * The design shows two distinct AI numbers per card — "+18.4%" under PERF. and
 * "+35% Above Average" in the first chip — and Creator has no column for
 * either. Both are computed against the live roster instead of faked:
 *   perf  = the creator's engagementRate vs. the roster's mean engagementRate
 *   reach = the creator's avgViews vs. the roster's mean avgViews
 * "Suggestion: Increase" is a recommendation, not a value: the design attaches
 * it only to above-average cards (card 2, the one below average, drops it), so
 * it is gated on a positive perf delta — headroom on the rate card.
 */
function pctDelta(value: number, mean: number): number {
  return mean > 0 ? ((value - mean) / mean) * 100 : 0;
}

/** "+18.4%" / "-6.2%" — the PERF. column format. */
const signed1 = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

/** Seeded handles already carry the @; guard the ones that do not. */
const atHandle = (h: string) => (h.startsWith("@") ? h : `@${h}`);

/** compact() lower-cases the thousands suffix; the design draws "840K". */
const big = (n: number) => compact(n).toUpperCase();

/** Platform badge on the avatar — Creator.platform is INSTAGRAM/YOUTUBE/TIKTOK. */
function platformIcon(p: string | undefined): "instagram" | "youtube" | "music" {
  return p === "YOUTUBE" ? "youtube" : p === "TIKTOK" ? "music" : "instagram";
}

/* ------------------------------- primitives ------------------------------- */
/** Insight chip — 20pt pill, 9pt icon slot, 9/13.5 bold caption. */
function InsightChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <View style={styles.insightChip}>
      <View style={styles.insightIcon}>{icon}</View>
      <Txt size={9} weight="bold" font="inter" color={INK} lineHeight={13.5}>
        {label}
      </Txt>
    </View>
  );
}

/** One column of the 4-up strip. Coordinates are strip-relative. */
function Metric({
  x, label, value, valueSize, valueInk, labelY, valueY,
}: {
  x: number; label: string; value: string; valueSize: number;
  valueInk: string; labelY: number; valueY: number;
}) {
  return (
    <>
      <Txt
        x={x} y={labelY} w={72} align="center"
        size={9} weight="regular" font="inter" color={MUTED}
        lineHeight={13.5} letterSpacing={0.45}
      >
        {label}
      </Txt>
      <Txt
        x={x} y={valueY} w={72} align="center" numberOfLines={1}
        size={valueSize} weight="bold" font="inter" color={valueInk}
        lineHeight={valueSize === 12 ? 16 : 20}
      >
        {value}
      </Txt>
    </>
  );
}

/** Profile | Call | Chat — 98.33x31 glass buttons on the card footer. */
function CardAction({ x, icon, label }: { x: number; icon: ReactNode; label: string }) {
  return (
    <Abs
      x={x} y={164.5} w={98.33} h={31} radius={12}
      bg={GLASS_80} center row gap={6} style={styles.actionShadow}
    >
      {icon}
      <Txt size={10} weight="semibold" font="inter" color={INK} lineHeight={15}>
        {label}
      </Txt>
    </Abs>
  );
}

/* -------------------------------- the card -------------------------------- */
interface CardProps {
  top: number;
  tint: (typeof TINTS)[number];
  creator: Creator;
  perf: number;
  reach: number;
  selected: boolean;
  onToggle: () => void;
}

function CreatorCard({ top, tint, creator, perf, reach, selected, onToggle }: CardProps) {
  const niche = creator.niche;
  return (
    <Abs x={CARD_X} y={top} w={CARD_W} h={CARD_H} radius={26} style={styles.card}>
      <LinearGradient
        colors={[tint.from, "#ffffff80"] as const}
        start={CARD_GRAD_START}
        end={CARD_GRAD_END}
        style={styles.fill}
      />

      {/* Avatar + platform badge — 7779:18570 */}
      {creator.avatarUrl ? (
        <Image source={{ uri: creator.avatarUrl }} style={styles.avatar} />
      ) : (
        <Ring x={16} y={24} size={48} />
      )}
      <Abs x={50} y={58} w={16} h={16} radius={8} bg={WHITE} center style={styles.badge}>
        <Feather name={platformIcon(creator.platform)} size={8} color={INK} />
      </Abs>

      {/* Identity — 7779:18576 */}
      <Txt
        x={76} y={16} w={227} numberOfLines={1}
        size={14} weight="bold" font="inter" color={INK}
        lineHeight={17.5} letterSpacing={-0.35}
      >
        {creator.name}
      </Txt>
      <Abs x={76} y={36} h={20} row gap={6}>
        <Txt size={10} weight="regular" font="inter" color={MUTED} lineHeight={15}>
          {atHandle(creator.handle)}
        </Txt>
        {niche ? (
          <View style={styles.nicheChip}>
            <Txt size={9} weight="bold" font="inter" color={MUTED} lineHeight={13.5}>
              {niche}
            </Txt>
          </View>
        ) : null}
      </Abs>

      {/* AI insight chips — 7779:18586 */}
      <Abs x={76} y={60} h={20} row gap={7}>
        <InsightChip
          icon={
            <Feather
              name={reach >= 0 ? "trending-up" : "trending-down"}
              size={11}
              color={INK}
            />
          }
          label={
            reach >= 0
              ? `+${Math.round(reach)}% Above Average`
              : `${Math.round(reach)}% below avg`
          }
        />
        {perf > 0 ? (
          <InsightChip
            icon={<Feather name="info" size={11} color={INK} />}
            label="Suggestion: Increase"
          />
        ) : null}
      </Abs>

      {/* Selection toggle — filled dark tick when on, glass ring when off. */}
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        style={({ pressed }) => [
          selected ? styles.selectOn : styles.selectOff,
          pressed && styles.pressed,
        ]}
      >
        {selected ? <Feather name="check" size={12} color={ON_DARK} /> : null}
      </Pressable>

      {/* Metric strip — 7779:18600 */}
      <Abs x={16} y={94} w={311} h={53.5} radius={16} bg={tint.strip}>
        <Metric
          x={10} labelY={10} valueY={23.5} valueSize={14} valueInk={INK}
          label="FOLLOWERS" value={big(creator.followers)}
        />
        <Abs x={82} y={14.75} w={1} h={24} bg={DIVIDER} />
        <Metric
          x={83} labelY={10} valueY={23.5} valueSize={14} valueInk={INK}
          label="VIEWS" value={big(creator.avgViews)}
        />
        <Abs x={155} y={14.75} w={1} h={24} bg={DIVIDER} />
        <Metric
          x={156} labelY={10} valueY={23.5} valueSize={14} valueInk={INK}
          label="LEADS" value={`${creator.leadsCount ?? 0}`}
        />
        <Abs x={228} y={14.75} w={1} h={24} bg={DIVIDER} />
        {/* The frame only ever draws a positive PERF., so it only specifies the
            green; a negative delta falls back to the card's own ink. */}
        <Metric
          x={229} labelY={12} valueY={25.5} valueSize={12}
          valueInk={perf >= 0 ? UP : INK}
          label="PERF." value={signed1(perf)}
        />
      </Abs>

      {/* Profile | Call | Chat — 7779:18630. No creator-detail, dialer or chat
          route exists in the app yet, so these render without a destination
          rather than pushing a path that would fail silently. */}
      <CardAction x={16} icon={<Feather name="eye" size={11} color={INK} />} label="Profile" />
      <CardAction x={122.33} icon={<Feather name="phone" size={14} color={INK} />} label="Call" />
      <CardAction x={228.67} icon={<Feather name="message-circle" size={11} color={INK} />} label="Chat" />
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
type Tab = "mine" | "all";

export default function CreatorsRoster() {
  const router = useRouter();

  const { data: creators = [], isLoading } = useCreators();
  const { data: agencies = [] } = useAgencies();

  const [tab, setTab] = useState<Tab>("mine");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [onlySelected, setOnlySelected] = useState(false);

  /** The workspace this roster belongs to — /auth/me returns no agency link. */
  const agency = agencies[0];

  /** My Creators = the roster this agency manages; All Creators = the directory. */
  const mine = useMemo(
    () => (agency ? creators.filter((c) => c.agencyId === agency.id) : []),
    [creators, agency],
  );

  /** Roster means, held over the whole directory so the deltas do not move per tab. */
  const means = useMemo(() => {
    if (creators.length === 0) return { er: 0, views: 0 };
    const sum = creators.reduce(
      (a, c) => ({ er: a.er + c.engagementRate, views: a.views + c.avgViews }),
      { er: 0, views: 0 },
    );
    return { er: sum.er / creators.length, views: sum.views / creators.length };
  }, [creators]);

  const rows = useMemo(() => {
    const base = tab === "mine" ? mine : creators;
    const q = query.trim().toLowerCase();
    const found = q
      ? base.filter((c) =>
          `${c.name} ${c.handle} ${c.niche ?? ""}`.toLowerCase().includes(q),
        )
      : base;
    return onlySelected ? found.filter((c) => selected.includes(c.id)) : found;
  }, [tab, mine, creators, query, onlySelected, selected]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  /** The bar's leading tick: select every visible row, or clear if already all. */
  const toggleAll = () => {
    const ids = rows.map((c) => c.id);
    const allOn = ids.length > 0 && ids.every((id) => selected.includes(id));
    setSelected(allOn ? [] : ids);
  };

  const shareSelected = () => {
    const picked = creators.filter((c) => selected.includes(c.id));
    if (picked.length === 0) return;
    void Share.share({
      message: picked.map((c) => `${c.name} ${atHandle(c.handle)}`).join("\n"),
    });
  };

  const total = agency?.creatorsCount ?? creators.length;

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* ------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={16} color={ON_DARK} />
      </Pressable>
      <Txt
        x={72} y={20} w={192}
        size={20} weight="medium" font="inter" color={INK}
        lineHeight={24} letterSpacing={-0.6}
      >
        Creators
      </Txt>
      <Txt
        x={72} y={49} w={192}
        size={10} weight="medium" font="inter" color={TOTAL_INK} lineHeight={10.38}
      >
        {`Total: ${total} Creators`}
      </Txt>

      {/* ----------------------------- Action row ---------------------------- */}
      {/* Add Creator has no route file yet, so it renders inert. */}
      <Abs
        x={16} y={107} w={120.89} h={32} radius={radius.full}
        bg={INK} style={styles.addShadow}
      >
        <Abs x={16} y={10} w={12} h={12} center>
          <Feather name="plus" size={12} color={ON_DARK} />
        </Abs>
        <Txt
          x={34} y={8} w={70.89} align="center"
          size={12} weight="bold" font="inter" color={ON_DARK} lineHeight={16}
        >
          Add Creator
        </Txt>
      </Abs>
      <Pressable
        onPress={() => router.push("/agency/filters/creators-filter-sheet")}
        style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
      >
        <Abs x={15} y={11} w={12} h={12} center>
          <Feather name="sliders" size={12} color={INK} />
        </Abs>
        <Txt
          x={33} y={9} w={29.5} align="center"
          size={12} weight="semibold" font="inter" color={INK} lineHeight={16}
        >
          Filter
        </Txt>
      </Pressable>
      <Pressable
        onPress={() => router.push("/agency/filters/creators-sort-sheet")}
        style={({ pressed }) => [styles.sortButton, pressed && styles.pressed]}
      >
        <Abs x={15} y={11} w={12} h={12} center>
          <MaterialCommunityIcons name="sort-variant" size={12} color={INK} />
        </Abs>
        <Txt
          x={33} y={9} w={24.34} align="center"
          size={12} weight="semibold" font="inter" color={INK} lineHeight={16}
        >
          Sort
        </Txt>
      </Pressable>

      {/* ------------------------------- Search ------------------------------ */}
      <Abs x={16} y={160} w={343} h={46} radius={20} bg={WHITE} style={styles.searchShadow}>
        <Abs x={17} y={15.5} w={15} h={15} center>
          <Feather name="search" size={15} color={MUTED} />
        </Abs>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search creators, niches..."
          placeholderTextColor={MUTED}
          style={styles.searchInput}
        />
      </Abs>

      {/* ----------------------------- Segmented tabs ------------------------ */}
      <Abs x={16} y={216} w={343} h={59} radius={16} bg={WHITE} style={styles.tabsShadow}>
        <Pressable
          onPress={() => setTab("mine")}
          style={[styles.tab, { left: 5 }, tab === "mine" && styles.tabOn]}
        >
          <Txt
            x={0} y={8} w={166.5} align="center"
            size={12} weight={tab === "mine" ? "bold" : "semibold"} font="inter"
            color={tab === "mine" ? ON_DARK : MUTED} lineHeight={16}
          >
            {`My Creators\n${mine.length} Creators`}
          </Txt>
        </Pressable>
        <Pressable
          onPress={() => setTab("all")}
          style={[styles.tab, { left: 171.5 }, tab === "all" && styles.tabOn]}
        >
          <Txt
            x={0} y={8} w={166.5} align="center"
            size={12} weight={tab === "all" ? "bold" : "semibold"} font="inter"
            color={tab === "all" ? ON_DARK : MUTED} lineHeight={16}
          >
            {`All Creators\n${creators.length} Creators`}
          </Txt>
        </Pressable>
      </Abs>

      {/* ---------------------------- Selection bar -------------------------- */}
      <Abs x={16} y={284} w={343} h={42} radius={16} bg={SELECT_BAR}>
        <Pressable
          onPress={toggleAll}
          hitSlop={10}
          style={({ pressed }) => [styles.selectAll, pressed && styles.pressed]}
        >
          <Feather name="check" size={10} color={ON_DARK} />
        </Pressable>
        <Txt
          x={45} y={13} w={200}
          size={12} weight="semibold" font="inter" color={INK} lineHeight={16}
        >
          {`${selected.length} creator${selected.length === 1 ? "" : "s"} selected`}
        </Txt>
        <Pressable
          onPress={() => setOnlySelected((v) => !v)}
          hitSlop={8}
          style={({ pressed }) => [styles.viewCreators, pressed && styles.pressed]}
        >
          <Txt size={10} weight="regular" font="inter" color={MUTED} lineHeight={15}>
            View creators
          </Txt>
        </Pressable>
      </Abs>

      {/* ---------------------------- Section header ------------------------- */}
      <Txt
        x={16} y={343} w={200}
        size={14} weight="bold" font="inter" color={INK}
        lineHeight={20} letterSpacing={-0.35}
      >
        {tab === "mine" ? "My Creators" : "All Creators"}
      </Txt>
      <Txt
        x={259.89} y={345} w={99.11} align="right"
        size={12} weight="regular" font="inter" color={MUTED} lineHeight={16}
      >
        {`${rows.length} results`}
      </Txt>

      {/* ------------------------------ Card stack --------------------------- */}
      {/* The design's clipping container: the stack scrolls inside 379..768. */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: FRAME_W,
          height: Math.max(LIST_H, rows.length * CARD_STEP),
        }}
      >
        {rows.map((c, i) => (
          <CreatorCard
            key={c.id}
            top={i * CARD_STEP}
            tint={TINTS[i % TINTS.length]}
            creator={c}
            perf={pctDelta(c.engagementRate, means.er)}
            reach={pctDelta(c.avgViews, means.views)}
            selected={selected.includes(c.id)}
            onToggle={() => toggle(c.id)}
          />
        ))}
        {rows.length === 0 ? (
          <Txt
            x={32} y={16} w={311}
            size={12} weight="regular" font="inter" color={MUTED} lineHeight={16}
          >
            {isLoading ? "Loading creators…" : "No creators"}
          </Txt>
        ) : null}
      </ScrollView>

      {/* ----------------------------- Floating CTA -------------------------- */}
      <Pressable
        onPress={shareSelected}
        disabled={selected.length === 0}
        style={({ pressed }) => [
          styles.sharePill,
          selected.length === 0 ? styles.disabled : pressed && styles.pressed,
        ]}
      >
        <Txt
          x={0} y={15} w={327} align="center"
          size={15} weight="semibold" font="inter" color={WHITE} lineHeight={22.5}
        >
          Share Selected Creators
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.45 },

  /* Header */
  backButton: {
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

  /* Action row */
  addShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  filterButton: {
    position: "absolute",
    left: 144.89,
    top: 106,
    width: 77.5,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: WHITE,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sortButton: {
    position: "absolute",
    left: 230.39,
    top: 106,
    width: 72.34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: WHITE,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  /* Search */
  searchShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  searchInput: {
    position: "absolute",
    left: 44,
    top: 13,
    width: 282,
    height: 20,
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 14,
    lineHeight: 20,
    color: INK,
  },

  /* Tabs */
  tabsShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tab: { position: "absolute", top: 5, width: 166.5, height: 49, borderRadius: 12 },
  tabOn: { backgroundColor: INK },

  /* Selection bar */
  selectAll: {
    position: "absolute",
    left: 17,
    top: 11,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: INK,
  },
  viewCreators: { position: "absolute", left: 261, top: 13.5, width: 65, height: 15 },

  /* Card stack */
  list: { position: "absolute", left: 0, top: LIST_Y, width: FRAME_W, height: LIST_H },
  card: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.024,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  avatar: { position: "absolute", left: 16, top: 24, width: 48, height: 48, borderRadius: 24 },
  badge: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  nicheChip: {
    height: 20,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    justifyContent: "center",
    backgroundColor: GLASS_80,
  },
  insightChip: {
    flexDirection: "row",
    alignItems: "center",
    height: 20,
    borderRadius: radius.full,
    paddingHorizontal: 9,
    gap: 4,
    backgroundColor: GLASS_70,
  },
  insightIcon: { width: 8, height: 8, alignItems: "center", justifyContent: "center" },
  selectOn: {
    position: "absolute",
    left: 303,
    top: 18,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: INK,
  },
  selectOff: {
    position: "absolute",
    left: 302,
    top: 17,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_80,
  },
  actionShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  /* Floating CTA */
  sharePill: {
    position: "absolute",
    left: 24,
    top: 784,
    width: 327,
    height: 54.5,
    borderRadius: radius.full,
    backgroundColor: PILL_FILL,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
