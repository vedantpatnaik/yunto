import { Fragment, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Ring, Screen, Txt } from "../../../src/ui/Frame";
import { compact, useCreators, type Creator } from "../../../src/api/hooks";

/**
 * Creators — Sort By. Figma 7785:20747 (375x876).
 *
 * The roster in multi-select mode with the Sort bottom sheet open over the 57%
 * scrim. The sheet is the short one — 375x356 pinned at y=520, 32/32/0/0
 * corners — and its body is a plain 327-wide radio list: four options on a 56pt
 * step separated by 1px hairlines. Single select, no Apply button: choosing an
 * option re-sorts the roster underneath and dismisses.
 *
 * One deliberate departure from this frame's own tree: the roster beneath still
 * carries the retired D/W/M segmented control at 16,216. The live roster uses
 * the My / All Creators switch (Figma 7779:18561 / 7882:13945, same 16,216 slot
 * but 59 tall so it still meets the selection banner at y=275), so that is what
 * is drawn here. Only the sheet is authoritative in this frame.
 *
 * Coordinates are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

/** Sheet chrome. */
const SHEET_Y = 520;
const SHEET_H = 356;

/** Radio list: first row at 650, rows 24 tall, hairline 40pt below each row. */
const OPTION_FIRST_Y = 650;
const OPTION_STEP = 56;
const OPTION_W = 327;
const OPTION_H = 24;
const RULE_OFFSET = 40; // 690 - 650

/** Creator cards: 16,379 343x211.5, stacked on a uniform 227.5 step. */
const CARD_X = 16;
const CARD_W = 343;
const CARD_H = 211.5;
const CARD_FIRST_Y = 379;
const CARD_STEP = 227.5;
/** Cards whose top clears the 876pt frame — the rest are cropped away. */
const MAX_CARDS = Math.ceil((FRAME_H - CARD_FIRST_Y) / CARD_STEP);

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const INK = "#141311";
const INK_INVERT = "#faf7f2";
const INK_MUTED = "#8c8a84";
const INK_SHEET_TITLE = "#111111";
const OPTION_INK = "rgba(0,0,0,0.7)";
const OPTION_INK_ALT = "rgba(11,11,11,0.7)";
const HAIRLINE = "#ebeff3";
const RADIO_ON = "#151515";
const RADIO_DOT = "#171718";
const SCRIM = "rgba(181,180,185,0.57)";
const WHITE = "#ffffff";
const HANDLE = "#e5e5e5";
const CLOSE_BG = "#f8f8f8";
const CLOSE_INK = "#555555";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const DIVIDER = "rgba(20,19,17,0.06)";
const PERF_INK = "#23c16b";
const CTA = "#312b28";
const BANNER = "rgba(242,237,255,0.5)";
const BANNER_LINE = "#f2edff";
const SUBTITLE_INK = "rgba(0,0,0,0.7)";

/** Per-card tints: card gradient stop 0 and the stat-strip wash at 40%. */
const CARD_TINTS: { grad: readonly [string, string]; strip: string }[] = [
  { grad: ["#f2edffcc", "#ffffff80"], strip: "#f2edff66" },
  { grad: ["#ffecf3cc", "#ffffff80"], strip: "#ffecf366" },
  { grad: ["#e8f3ffcc", "#ffffff80"], strip: "#e8f3ff66" },
  { grad: ["#e9f6edcc", "#ffffff80"], strip: "#e9f6ed66" },
];

/* --------------------------------- sorting -------------------------------- */
type SortKey =
  | "newest_added"
  | "engagement_rate_desc"
  | "avg_views_desc"
  | "followers_desc";

const OPTIONS: { key: SortKey; label: string; color: string }[] = [
  { key: "newest_added", label: "Newest Added", color: OPTION_INK },
  // The Figma nodes carry textCase: TITLE, so the rendered design reads
  // "High To Low" even though the raw characters say "to".
  { key: "engagement_rate_desc", label: "Engagement Rate – High To Low", color: OPTION_INK },
  { key: "avg_views_desc", label: "Avg. Views – High To Low", color: OPTION_INK_ALT },
  { key: "followers_desc", label: "Followers - High To Low", color: OPTION_INK },
];

/**
 * /creators returns the Prisma row, which carries createdAt — the shared
 * Creator interface just does not spell it out. "Newest Added" needs it, so it
 * is declared here rather than invented: rows without one fall back to the
 * order the server sent, which is already insertion order.
 */
type CreatorRow = Creator & { createdAt?: string };
const added = (c: CreatorRow) => (c.createdAt ? Date.parse(c.createdAt) : 0);

/* ---------------------------------- tabs ---------------------------------- */
type Tab = "my" | "all";

/**
 * "My" is the agency's own roster. Creator carries no per-user owner, so the
 * only honest split the record supports is the one assign-creators already
 * uses: a creator attached to an agency is on the roster, everyone else is
 * platform-wide supply.
 */
const isMine = (c: Creator) => !!c.agencyId;

/* ------------------------------ derivations ------------------------------- */
/**
 * The design labels each card with one of four standing pills. Nothing on
 * Creator ranks a roster like that, so the label is derived from the only
 * quality signals the record has — engagement rate, then niche coverage — and
 * never from a value that is not on the row.
 */
function badgeOf(c: Creator): string {
  if (c.engagementRate >= 6) return "Top Performer";
  if (c.engagementRate >= 4) return "Rising Fast";
  if (c.niche) return "Niche Fit";
  return "High Priority";
}

/** "1.2M" / "840K" — the design's casing for the compact formatter. */
const big = (n: number) => compact(n).toUpperCase();

/* -------------------------------- the card -------------------------------- */
/** The three per-card action buttons: 98.33x31 chips on a 106.33 step. */
const ACTIONS = [
  { x: 32, label: "Profile" },
  { x: 138.33, label: "Call" },
  { x: 244.67, label: "Chat" },
] as const;

/** Stat columns 1..3; PERF. sits 2pt lower and is drawn separately. */
const STATS = [
  { x: 42, label: "FOLLOWERS" },
  { x: 115, label: "VIEWS" },
  { x: 188, label: "LEADS" },
] as const;

function CreatorCard({
  creator,
  index,
  selected,
}: {
  creator: CreatorRow;
  index: number;
  selected: boolean;
}) {
  const top = CARD_FIRST_Y + index * CARD_STEP;
  const tint = CARD_TINTS[index % CARD_TINTS.length];
  const stats = [big(creator.followers), big(creator.avgViews), `${creator.leadsCount ?? 0}`];

  return (
    <Fragment>
      {/* Background+Shadow — 26pt radius, tinted linear wash */}
      <LinearGradient
        colors={tint.grad}
        start={{ x: 0.23, y: -0.23 }}
        end={{ x: 0.77, y: 1.23 }}
        style={{
          position: "absolute",
          left: CARD_X,
          top,
          width: CARD_W,
          height: CARD_H,
          borderRadius: 26,
        }}
      />

      {/* Avatar 48x48 + platform badge */}
      {creator.avatarUrl ? (
        <Image
          source={{ uri: creator.avatarUrl }}
          style={{ position: "absolute", left: 32, top: top + 24, width: 48, height: 48, borderRadius: 24 }}
        />
      ) : (
        <Ring x={32} y={top + 24} size={48} />
      )}
      <Abs x={66} y={top + 58} w={16} h={16} radius={8} bg={WHITE} center>
        <Feather
          name={creator.platform === "YOUTUBE" ? "youtube" : "instagram"}
          size={8}
          color={INK}
        />
      </Abs>

      {/* Name / handle + niche chip / standing pill */}
      <Txt
        x={92} y={top + 16} w={215} size={14} weight="bold" font="inter"
        color={INK} lineHeight={17.5} letterSpacing={-0.35} numberOfLines={1}
      >
        {creator.name}
      </Txt>
      <Abs x={92} y={top + 36} h={22} row gap={6}>
        <Txt size={10} font="inter" color={INK_MUTED} lineHeight={15}>
          {creator.handle}
        </Txt>
        {creator.niche ? (
          <View style={styles.nicheChip}>
            <Txt size={9} weight="bold" font="inter" color={INK_MUTED} lineHeight={13.5}>
              {creator.niche}
            </Txt>
          </View>
        ) : null}
      </Abs>
      <Abs x={92} y={top + 60} h={20} radius={10} bg={GLASS_70} row gap={4} style={styles.badge}>
        <Feather name="alert-circle" size={8} color={INK} />
        <Txt size={9} weight="bold" font="inter" color={INK} lineHeight={13.5}>
          {badgeOf(creator)}
        </Txt>
      </Abs>

      {/* Multi-select toggle — filled when the creator is in the selection */}
      {selected ? (
        <Abs x={319} y={top + 18} w={24} h={24} radius={12} bg={INK} center>
          <Feather name="check" size={12} color={INK_INVERT} />
        </Abs>
      ) : (
        <Abs x={318} y={top + 17} w={26} h={26} radius={13} bg={GLASS_80} />
      )}

      {/* Stat strip 311x53.5 */}
      <Abs x={32} y={top + 94} w={311} h={53.5} radius={16} bg={tint.strip} />
      {STATS.map((s, i) => (
        <Fragment key={s.label}>
          <Txt
            x={s.x} y={top + 104} w={72} size={9} font="inter"
            color={INK_MUTED} lineHeight={13.5} letterSpacing={0.45} align="center"
          >
            {s.label}
          </Txt>
          <Txt
            x={s.x} y={top + 117.5} w={72} size={14} weight="bold" font="inter"
            color={INK} lineHeight={20} align="center"
          >
            {stats[i]}
          </Txt>
        </Fragment>
      ))}
      {[114, 187, 260].map((x) => (
        <Abs key={x} x={x} y={top + 108.75} w={1} h={24} bg={DIVIDER} />
      ))}
      <Txt
        x={261} y={top + 106} w={72} size={9} font="inter"
        color={INK_MUTED} lineHeight={13.5} letterSpacing={0.45} align="center"
      >
        PERF.
      </Txt>
      {/* Engagement rate is the only performance percentage on the record. */}
      <Txt
        x={261} y={top + 119.5} w={72} size={12} weight="bold" font="inter"
        color={PERF_INK} lineHeight={16} align="center"
      >
        {`+${creator.engagementRate.toFixed(1)}%`}
      </Txt>

      {/* HorizontalBorder — Profile / Call / Chat */}
      {ACTIONS.map((a) => (
        <Abs
          key={a.label}
          x={a.x} y={top + 164.5} w={98.33} h={31} radius={12} bg={GLASS_80}
          center row gap={5}
        >
          {a.label === "Call" ? (
            <Ionicons name="call" size={11} color="#000000" />
          ) : (
            <Feather name={a.label === "Profile" ? "eye" : "message-square"} size={11} color={INK} />
          )}
          <Txt size={10} weight="semibold" font="inter" color={INK} lineHeight={15}>
            {a.label}
          </Txt>
        </Abs>
      ))}
    </Fragment>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function CreatorsSortSheetScreen() {
  const router = useRouter();
  const { data } = useCreators();
  const [sort, setSort] = useState<SortKey>("newest_added");
  /** This frame draws the All Creators list, so All is the standing tab. */
  const [tab, setTab] = useState<Tab>("all");

  const all = useMemo<CreatorRow[]>(() => (data ?? []) as CreatorRow[], [data]);
  const mineCount = useMemo(() => all.filter(isMine).length, [all]);

  /**
   * The order the list behind the sheet is drawn in — the same mapping the
   * server would apply for GET /creators?orderBy=…&dir=desc, over the rows the
   * active tab scopes to.
   */
  const creators = useMemo<CreatorRow[]>(() => {
    const list = tab === "my" ? all.filter(isMine) : [...all];
    switch (sort) {
      case "engagement_rate_desc":
        return list.sort((a, b) => b.engagementRate - a.engagementRate);
      case "avg_views_desc":
        return list.sort((a, b) => b.avgViews - a.avgViews);
      case "followers_desc":
        return list.sort((a, b) => b.followers - a.followers);
      default:
        return list.sort((a, b) => added(b) - added(a));
    }
  }, [all, sort, tab]);

  /**
   * Multi-select is state of the Creators list route; a sort sheet opened over
   * it does not carry the selection, so the banner counts what this route
   * actually knows rather than a made-up tally.
   */
  const selectedIds: string[] = [];

  /** Single select: apply and dismiss — the sheet has no Apply button. */
  const choose = (key: SortKey) => {
    setSort(key);
    router.back();
  };

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* ============================ base layer ============================ */}

      {/* Frame 2147223266 — header */}
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Feather name="chevron-left" size={18} color={INK_INVERT} />
      </Pressable>
      <Txt
        x={72} y={20} w={192} size={20} weight="medium" font="inter"
        color={INK} lineHeight={24} letterSpacing={-0.6}
      >
        Creators
      </Txt>
      <Txt
        x={72} y={49} w={192} size={10} weight="medium" font="inter"
        color={SUBTITLE_INK} lineHeight={10.38}
      >
        {`Total: ${all.length} Creators`}
      </Txt>

      {/* Action row — Add Creator / Filter / Sort */}
      <Abs x={16} y={107} w={120.89} h={32} radius={16} bg={INK} />
      <Abs x={32} y={117} w={12} h={12} center>
        <Feather name="plus" size={12} color={INK_INVERT} />
      </Abs>
      <Txt
        x={50} y={115} w={70.89} size={12} weight="bold" font="inter"
        color={INK_INVERT} lineHeight={16} align="center"
      >
        Add Creator
      </Txt>
      <Abs x={144.89} y={106} w={77.5} h={34} radius={17} bg={WHITE} />
      <Abs x={159.89} y={117} w={12} h={12} center>
        <Feather name="sliders" size={12} color={INK} />
      </Abs>
      <Txt
        x={177.89} y={115} w={29.5} size={12} weight="semibold" font="inter"
        color={INK} lineHeight={16} align="center"
      >
        Filter
      </Txt>
      <Abs x={230.39} y={106} w={72.34} h={34} radius={17} bg={WHITE} />
      <Abs x={245.39} y={117} w={12} h={12} center>
        <MaterialCommunityIcons name="sort-variant" size={12} color={INK} />
      </Abs>
      <Txt
        x={263.39} y={115} w={24.34} size={12} weight="semibold" font="inter"
        color={INK} lineHeight={16} align="center"
      >
        Sort
      </Txt>

      {/* Search field */}
      <Abs x={16} y={160} w={343} h={46} radius={20} bg={WHITE} />
      <Abs x={33} y={175.5} w={15} h={15} center>
        <Feather name="search" size={15} color={INK_MUTED} />
      </Abs>
      <Txt x={60} y={173} w={282} size={14} font="inter" color={INK_MUTED} lineHeight={20}>
        Search creators, niches...
      </Txt>

      {/* My / All Creators switch — 343x59 shell, two 166.5x49 buttons */}
      <Abs x={16} y={216} w={343} h={59} radius={16} bg={WHITE} />
      <Pressable onPress={() => setTab("my")} style={[styles.tab, styles.tabMy, tab === "my" && styles.tabOn]}>
        {/* Counts centre on the button, so the label may grow either side. */}
        <Txt
          y={8} w={166.5} size={12} weight={tab === "my" ? "bold" : "semibold"} font="inter"
          color={tab === "my" ? INK_INVERT : INK_MUTED} lineHeight={16} align="center"
        >
          {`My Creators\n${mineCount} Creators`}
        </Txt>
      </Pressable>
      <Pressable onPress={() => setTab("all")} style={[styles.tab, styles.tabAll, tab === "all" && styles.tabOn]}>
        <Txt
          y={8} w={166.5} size={12} weight={tab === "all" ? "bold" : "semibold"} font="inter"
          color={tab === "all" ? INK_INVERT : INK_MUTED} lineHeight={16} align="center"
        >
          {`All Creators\n${all.length} Creators`}
        </Txt>
      </Pressable>

      {/* Selection banner */}
      <Abs x={16} y={275} w={343} h={42} radius={16} bg={BANNER} border={BANNER_LINE} borderWidth={1} />
      <Abs x={33} y={286} w={20} h={20} radius={10} bg={INK} center>
        <Feather name="check" size={12} color={INK_INVERT} />
      </Abs>
      <Txt
        x={61} y={288} w={200} size={12} weight="semibold" font="inter"
        color={INK} lineHeight={16} numberOfLines={1}
      >
        {`${selectedIds.length} creators selected`}
      </Txt>
      <Txt
        x={282} y={288.5} w={60} size={10} font="inter"
        color={INK_MUTED} lineHeight={15} align="right"
      >
        {`${creators.length} total`}
      </Txt>

      {/* List heading — names the scope the tab selected */}
      <Txt
        x={16} y={343} w={200} size={14} weight="bold" font="inter"
        color={INK} lineHeight={20} letterSpacing={-0.35}
      >
        {tab === "my" ? "My Creators" : "All Creators"}
      </Txt>
      <Txt
        x={279} y={345} w={80} size={12} font="inter"
        color={INK_MUTED} lineHeight={16} align="right"
      >
        {`${creators.length} results`}
      </Txt>

      {/* Card stack — the real roster in the chosen order. An empty or still
          loading roster simply draws no cards; the counts above already read 0
          and nothing else shifts. */}
      {creators.slice(0, MAX_CARDS).map((c, i) => (
        <CreatorCard key={c.id} creator={c} index={i} selected={selectedIds.includes(c.id)} />
      ))}

      {/* Share CTA (sits under the sheet) */}
      <Abs x={24} y={784} w={327} h={54.5} radius={27.25} bg={CTA} />
      <Txt
        x={24} y={799} w={327} size={15} weight="semibold" font="inter"
        color={WHITE} lineHeight={22.5} align="center"
      >
        Share Selected Creators
      </Txt>

      {/* ============================ sort sheet ============================ */}
      <Pressable onPress={() => router.back()} style={styles.scrim} />

      <Abs x={0} y={SHEET_Y} w={375} h={SHEET_H} bg={WHITE} style={styles.sheet} />
      <Abs x={167.5} y={536} w={40} h={4} radius={2} bg={HANDLE} />

      <Txt
        x={24} y={588} w={280} size={24} weight="semibold" font="inter"
        color={INK_SHEET_TITLE} lineHeight={29.05} letterSpacing={-0.52}
      >
        Sort By
      </Txt>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.close, pressed && styles.pressed]}
      >
        <Feather name="x" size={20} color={CLOSE_INK} />
      </Pressable>

      {/* Frame 2147223280 — the radio list */}
      {OPTIONS.map((o, i) => {
        const top = OPTION_FIRST_Y + i * OPTION_STEP;
        const on = sort === o.key;
        return (
          <Fragment key={o.key}>
            <Pressable
              onPress={() => choose(o.key)}
              style={({ pressed }) => [
                { position: "absolute", left: 24, top, width: OPTION_W, height: OPTION_H },
                pressed && styles.pressed,
              ]}
            >
              <Txt
                x={0} y={1} w={280} size={16} weight="medium" font="inter"
                color={o.color} lineHeight={21.47} numberOfLines={1}
              >
                {o.label}
              </Txt>
              <View style={[styles.radio, { borderColor: on ? RADIO_ON : HAIRLINE }]}>
                {on ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
            {i < OPTIONS.length - 1 ? (
              <Abs x={24} y={top + RULE_OFFSET} w={OPTION_W} h={1} bg={HAIRLINE} />
            ) : null}
          </Fragment>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1f1a17",
    alignItems: "center",
    justifyContent: "center",
  },
  /** Buttons inside the 343x59 switch: 166.5x49 at 21,221 and 187.5,221. */
  tab: { position: "absolute", top: 221, width: 166.5, height: 49, borderRadius: 12 },
  tabMy: { left: 21 },
  tabAll: { left: 187.5 },
  tabOn: { backgroundColor: INK },
  scrim: { position: "absolute", left: 0, top: 0, width: 375, height: FRAME_H, backgroundColor: SCRIM },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  close: {
    position: "absolute",
    left: 315,
    top: 588,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CLOSE_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  /** Ellipse 4/10/11/12 — 22.95x24 at x=328.05, i.e. 304.05 into the row. */
  radio: {
    position: "absolute",
    left: 304.05,
    top: 0,
    width: 22.95,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 13.39, height: 14, borderRadius: 7, backgroundColor: RADIO_DOT },
  nicheChip: {
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 7,
    justifyContent: "center",
    backgroundColor: GLASS_80,
  },
  badge: { paddingHorizontal: 9 },
  pressed: { opacity: 0.85 },
});
