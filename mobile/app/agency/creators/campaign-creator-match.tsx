import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Abs, Ring, Screen, Txt } from "../../../src/ui/Frame";
import { fonts, radius } from "../../../src/theme";
import {
  compact,
  useCampaignFull,
  useCampaigns,
  useCreators,
  useUpdate,
  type Creator,
} from "../../../src/api/hooks";

/**
 * Campaign — Matching Creators. Figma 7778:16631 (375x876), traced 1:1.
 *
 * The campaign-scoped variant of the creator roster: reached from a campaign,
 * so the back-header carries the campaign's own name rather than "Creators",
 * and the action row is Add Creator | Share Link | Request instead of the
 * roster's Add Creator | Filter | Sort. Below it the search field, the
 * "N creators selected / Tap to deselect" bar, the "Matching Creators /
 * N results" section head, and the card stack.
 *
 * The cards are the lighter campaign card — 343x181.5 on a flat tint with no
 * gradient and no AI insight chips: avatar + platform badge, name / @handle /
 * niche chip, a FOLLOWERS / AVG VIEWS / ENG. RATE triple and a Profile |
 * Message footer (no LEADS / PERF. columns, no Call / Chat).
 *
 * Scrolling follows the design rather than the frame: the file wraps the stack
 * in a 375x435 clipping container at y=298 that the five cards overflow (they
 * run to y=1285.5), and parks the row-action popover at y=790 *below* that box.
 * So the stack scrolls inside its own 330..733 window and the popover stays
 * put, exactly as drawn — it floats over the frame, it is not the end of a
 * column.
 *
 * Data — every record value is live:
 *   header title      the campaign name off GET /campaigns/:id/full
 *   card fields       name, @handle, niche, avatarUrl, platform, followers,
 *                     avgViews, engagementRate off GET /creators
 *   ordering          creators already linked to this campaign lead the stack —
 *                     which is why the design's first two cards are the ticked
 *                     ones — then everyone else by Creator.matchPct descending,
 *                     the "matching" score the column exists for
 *   N results         the filtered row count
 *   N creators sel.   the tick count, seeded from the campaign's creatorList so
 *                     the bar opens reading the campaign's real roster size
 * The campaign is read from an `id` route param, falling back to the first
 * active campaign so the screen stands up when opened directly.
 *
 * The popover's three actions have uneven backing, so they are wired to exactly
 * what exists and no further:
 *   Mark Shortlisted  PATCH /creators/:id { listed: true } — Creator.listed is
 *                     the only "chosen" flag in the schema, the same reading
 *                     creators-selected-view.tsx already makes of it
 *   Mark Done         CampaignCreator.done is the only "done" the schema has and
 *                     no route exposes CampaignCreator writes, so this clears
 *                     the selection locally rather than pretending to persist
 *   Delete            likewise local — it drops the picked creators from the
 *                     match list for the session; unlinking needs the same
 *                     missing route
 *
 * Children of the stroked boxes — the search field, the selection bar, the
 * Share Link / Request pills and the popover — carry their frame offset less
 * the 1pt stroke, since Yoga positions absolute children against the padding
 * box, i.e. inside the border. The same correction add-creators.tsx makes.
 *
 * expo-blur is not a dependency, so the metric strip's and the popover's
 * BACKGROUND_BLUR render as their translucent fills alone — the substitution
 * the other agency frames make. The header face is Geist in the file; only
 * Outfit and Inter are loaded, so it renders in Inter, as on the sibling
 * creator screens.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/** "Container" 7778:16631/list — the clipping window the stack scrolls in. */
const LIST_Y = 330; // first card top
const LIST_H = 403; // container bottom (298 + 435) - 330
const CARD_X = 16;
const CARD_W = 343;
const CARD_H = 181.5;
const CARD_STEP = 193.5; // 523.5 - 330

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef"; // frame fill
const INK = "#141311"; // headings, values, button labels
const MUTED = "#8c8a84"; // captions, handles, placeholder
const ON_DARK = "#faf7f2"; // type and glyphs on the filled pills
const BACK_FILL = "#1f1a17"; // Button — back chevron
const UP = "#23c16b"; // ENG. RATE value
const WHITE = "#ffffff";
const GLASS_90 = "rgba(255,255,255,0.9)"; // popover fill
const GLASS_80 = "rgba(255,255,255,0.8)"; // footer buttons, idle tick
const GLASS_70 = "rgba(255,255,255,0.7)"; // niche chip
const GLASS_60 = "rgba(255,255,255,0.6)"; // popover stroke
const GLASS_50 = "rgba(255,255,255,0.5)"; // metric strip
const HAIRLINE = "rgba(255,255,255,0.3)"; // card footer top border
const SELECT_BAR = "rgba(242,237,255,0.6)"; // Overlay+Border — selection bar
const SELECT_LINE = "#f2edff"; // its stroke, and the Request pill fill
const BORDER_30 = "rgba(232,229,223,0.3)"; // Share Link / idle tick stroke
const BORDER_10 = "rgba(232,229,223,0.1)"; // search + Request stroke
const DIVIDER = "rgba(20,19,17,0.05)"; // metric strip dividers
const SHORTLIST_FILL = "#ffecf3";
const DONE_FILL = "#e9f6ed";
const DELETE_FILL = "#bdbebd";

/** The five card paints, cycled down the stack. */
const TINTS = ["#f2edff", "#ffecf3", "#e8f3ff", "#e9f6ed", "#f7f3ea"] as const;

/* ------------------------------ derivations ------------------------------- */
/** Seeded handles already carry the @; guard the ones that do not. */
const atHandle = (h: string) => (h.startsWith("@") ? h : `@${h}`);

/** compact() lower-cases the thousands suffix; the design draws "840K". */
const big = (n: number) => compact(n).toUpperCase();

/** Platform badge on the avatar — Creator.platform is INSTAGRAM/YOUTUBE/TIKTOK. */
function platformIcon(p: string | undefined): "instagram" | "youtube" | "music" {
  return p === "YOUTUBE" ? "youtube" : p === "TIKTOK" ? "music" : "instagram";
}

/* ------------------------------- primitives ------------------------------- */
/** One column of the 3-up strip. Coordinates are strip-relative. */
function Metric({
  x, label, value, valueInk,
}: {
  x: number; label: string; value: string; valueInk: string;
}) {
  return (
    <>
      <Txt
        x={x} y={8} w={87} align="center"
        size={9} weight="regular" font="inter" color={MUTED}
        lineHeight={13.5} letterSpacing={0.45}
      >
        {label}
      </Txt>
      <Txt
        x={x} y={21.5} w={87} align="center" numberOfLines={1}
        size={12} weight="bold" font="inter" color={valueInk} lineHeight={16}
      >
        {value}
      </Txt>
    </>
  );
}

/* -------------------------------- the card -------------------------------- */
interface CardProps {
  top: number;
  tint: string;
  creator: Creator;
  selected: boolean;
  onToggle: () => void;
  onProfile: () => void;
}

/** 343x181.5 campaign creator card. Child offsets are card-relative. */
function MatchCard({ top, tint, creator, selected, onToggle, onProfile }: CardProps) {
  const niche = creator.niche;
  return (
    <Abs x={CARD_X} y={top} w={CARD_W} h={CARD_H} radius={24} bg={tint} style={styles.card}>
      {/* Avatar + platform badge — 7778:16700 */}
      {creator.avatarUrl ? (
        <Image source={{ uri: creator.avatarUrl }} style={styles.avatar} />
      ) : (
        <Ring x={16} y={16} size={44} />
      )}
      <Abs x={46} y={46} w={16} h={16} radius={8} bg={WHITE} center style={styles.badge}>
        <Feather name={platformIcon(creator.platform)} size={8} color={INK} />
      </Abs>

      {/* Identity — 7778:16706 */}
      <Txt
        x={72} y={19} w={214} numberOfLines={1}
        size={14} weight="bold" font="inter" color={INK}
        lineHeight={17.5} letterSpacing={-0.35}
      >
        {creator.name}
      </Txt>
      <Abs x={72} y={39} h={18} row gap={6}>
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

      {/* Roster tick — filled dark check when on the campaign, glass ring when not. */}
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        style={({ pressed }) => [
          selected ? styles.tickOn : styles.tickOff,
          pressed && styles.pressed,
        ]}
      >
        {selected ? <Feather name="check" size={13} color={ON_DARK} /> : null}
      </Pressable>

      {/* Metric strip — 7778:16723 */}
      <Abs x={16} y={72} w={311} h={45.5} radius={14} bg={GLASS_50}>
        <Metric x={8} label="FOLLOWERS" value={big(creator.followers)} valueInk={INK} />
        <Abs x={103} y={12.75} w={1} h={20} bg={DIVIDER} />
        <Metric x={112} label="AVG VIEWS" value={big(creator.avgViews)} valueInk={INK} />
        <Abs x={207} y={12.75} w={1} h={20} bg={DIVIDER} />
        <Metric
          x={216} label="ENG. RATE"
          value={`${creator.engagementRate.toFixed(1)}%`} valueInk={UP}
        />
      </Abs>

      {/* Profile | Message — 7778:16752, over the HorizontalBorder hairline. */}
      <Abs x={16} y={129.5} w={311} h={1} bg={HAIRLINE} />
      <Pressable
        onPress={onProfile}
        style={({ pressed }) => [styles.cardAction, { left: 16 }, pressed && styles.pressed]}
      >
        <Feather name="eye" size={11} color={INK} />
        <Txt size={10} weight="semibold" font="inter" color={INK} lineHeight={15}>
          Profile
        </Txt>
      </Pressable>
      {/* No chat route exists in the app yet, so Message renders without a
          destination rather than pushing a path that would fail silently. */}
      <Abs x={175.5} y={134.5} w={151.5} h={31} radius={12} bg={GLASS_80} center row gap={4}>
        <Feather name="mail" size={11} color={INK} />
        <Txt size={10} weight="semibold" font="inter" color={INK} lineHeight={15}>
          Message
        </Txt>
      </Abs>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function CampaignCreatorMatch() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: creators = [], isLoading } = useCreators();
  const { data: campaigns = [] } = useCampaigns();

  /** Opened from a campaign; standing alone, the first active one stands in. */
  const campaignId =
    id ?? campaigns.find((c) => c.status === "ACTIVE")?.id ?? campaigns[0]?.id ?? null;
  const { data: campaign } = useCampaignFull(campaignId);
  const title = campaign?.name ?? campaigns.find((c) => c.id === campaignId)?.name ?? "";

  const update = useUpdate<Creator>("creators");

  const [query, setQuery] = useState("");
  /** Null until the operator touches a tick — until then the campaign's own roster. */
  const [picked, setPicked] = useState<string[] | null>(null);
  const [dropped, setDropped] = useState<string[]>([]);

  const linked = useMemo(
    () => (campaign?.creatorList ?? []).map((c) => c.id),
    [campaign],
  );
  const selected = picked ?? linked;

  /**
   * Matching order: the creators already on this campaign lead — the two ticked
   * cards the design puts at the top of the stack — then the rest by matchPct.
   */
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = creators.filter((c) => !dropped.includes(c.id));
    const found = q
      ? pool.filter((c) =>
          `${c.name} ${c.handle} ${c.niche ?? ""}`.toLowerCase().includes(q),
        )
      : pool;
    const onCampaign = (c: Creator) => (linked.includes(c.id) ? 1 : 0);
    return [...found].sort(
      (a, b) => onCampaign(b) - onCampaign(a) || (b.matchPct ?? 0) - (a.matchPct ?? 0),
    );
  }, [creators, query, dropped, linked]);

  const toggle = (cid: string) =>
    setPicked((s) => {
      const base = s ?? linked;
      return base.includes(cid) ? base.filter((x) => x !== cid) : [...base, cid];
    });

  const shareLink = () => {
    const chosen = creators.filter((c) => selected.includes(c.id));
    if (chosen.length === 0) return;
    void Share.share({
      message: [title, ...chosen.map((c) => `${c.name} ${atHandle(c.handle)}`)]
        .filter(Boolean)
        .join("\n"),
    });
  };

  const markShortlisted = () => {
    selected.forEach((cid) => update.mutate({ id: cid, data: { listed: true } }));
  };
  const markDone = () => setPicked([]);
  const removeSelected = () => {
    setDropped((d) => [...d, ...selected]);
    setPicked([]);
  };

  const idle = selected.length === 0;

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* ------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16} color={ON_DARK} />
      </Pressable>
      <Txt
        x={72} y={28} w={192} numberOfLines={1}
        size={20} weight="medium" font="inter" color={INK}
        lineHeight={24} letterSpacing={-0.6}
      >
        {title}
      </Txt>

      {/* ----------------------------- Action row ---------------------------- */}
      <Pressable
        onPress={() => router.push("/agency/creators/add-creators")}
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
      >
        <Abs x={14} y={10} w={12} h={12} center>
          <Feather name="plus" size={12} color={ON_DARK} />
        </Abs>
        <Txt
          x={32} y={8} w={70.89} align="center"
          size={12} weight="bold" font="inter" color={ON_DARK} lineHeight={16}
        >
          Add Creator
        </Txt>
      </Pressable>
      <Pressable
        onPress={shareLink}
        style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
      >
        <Abs x={14} y={10} w={12} h={12} center>
          <Feather name="share-2" size={12} color={INK} />
        </Abs>
        <Txt
          x={32} y={8} w={60.77} align="center"
          size={12} weight="semibold" font="inter" color={INK} lineHeight={16}
        >
          Share Link
        </Txt>
      </Pressable>
      <Pressable
        onPress={() => router.push("/agency/creators/add-creator-invite")}
        style={({ pressed }) => [styles.requestButton, pressed && styles.pressed]}
      >
        <Abs x={14} y={10} w={12} h={12} center>
          <Feather name="send" size={12} color={INK} />
        </Abs>
        <Txt
          x={32} y={8} w={47.53} align="center"
          size={12} weight="semibold" font="inter" color={INK} lineHeight={16}
        >
          Request
        </Txt>
      </Pressable>

      {/* ------------------------------- Search ------------------------------ */}
      <Abs
        x={17} y={166} w={343} h={50} radius={20} bg={WHITE}
        border={BORDER_10} borderWidth={1} style={styles.searchShadow}
      >
        <Abs x={16} y={16} w={16} h={16} center>
          <Feather name="search" size={16} color={MUTED} />
        </Abs>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search creators, niches..."
          placeholderTextColor={MUTED}
          style={styles.searchInput}
        />
        <Abs x={301} y={12} w={24} h={24} radius={12} bg={INK} center>
          <Feather name="mic" size={11} color={ON_DARK} />
        </Abs>
      </Abs>

      {/* ---------------------------- Selection bar -------------------------- */}
      <Abs
        x={17} y={236} w={343} h={42} radius={16}
        bg={SELECT_BAR} border={SELECT_LINE} borderWidth={1}
      >
        <Abs x={16} y={10} w={20} h={20} radius={10} bg={INK} center>
          <Feather name="check" size={10} color={ON_DARK} />
        </Abs>
        <Txt
          x={44} y={12} w={200}
          size={12} weight="semibold" font="inter" color={INK} lineHeight={16}
        >
          {`${selected.length} creator${selected.length === 1 ? "" : "s"} selected`}
        </Txt>
        <Pressable
          onPress={() => setPicked([])}
          hitSlop={8}
          style={({ pressed }) => [styles.deselect, pressed && styles.pressed]}
        >
          <Txt size={10} weight="regular" font="inter" color={MUTED} lineHeight={15}>
            Tap to deselect
          </Txt>
        </Pressable>
      </Abs>

      {/* ---------------------------- Section header ------------------------- */}
      <Txt
        x={16} y={298} w={200}
        size={14} weight="bold" font="inter" color={INK}
        lineHeight={20} letterSpacing={-0.35}
      >
        Matching Creators
      </Txt>
      <Txt
        x={259.53} y={300} w={99.47} align="right"
        size={12} weight="regular" font="inter" color={MUTED} lineHeight={16}
      >
        {`${rows.length} results`}
      </Txt>

      {/* ------------------------------ Card stack --------------------------- */}
      {/* The design's clipping container: the stack scrolls inside 330..733. */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: FRAME_W,
          height: Math.max(LIST_H, rows.length * CARD_STEP),
        }}
      >
        {rows.map((c, i) => (
          <MatchCard
            key={c.id}
            top={i * CARD_STEP}
            tint={TINTS[i % TINTS.length]}
            creator={c}
            selected={selected.includes(c.id)}
            onToggle={() => toggle(c.id)}
            onProfile={() => router.push(`/agency/creators/creator-detail?id=${c.id}`)}
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

      {/* --------------------------- Row-action popover ---------------------- */}
      <Abs
        x={16} y={790} w={343} h={62} radius={28} bg={GLASS_90}
        border={GLASS_60} borderWidth={1} style={styles.popover}
      >
        <Pressable
          onPress={markShortlisted}
          disabled={idle}
          style={({ pressed }) => [
            styles.popButton,
            { left: 12, width: 132, backgroundColor: SHORTLIST_FILL },
            idle ? styles.disabled : pressed && styles.pressed,
          ]}
        >
          <Txt size={12} weight="bold" font="inter" color={INK} lineHeight={16} align="center">
            Mark Shortlisted
          </Txt>
        </Pressable>
        <Pressable
          onPress={markDone}
          disabled={idle}
          style={({ pressed }) => [
            styles.popButton,
            { left: 152, width: 91, backgroundColor: DONE_FILL },
            idle ? styles.disabled : pressed && styles.pressed,
          ]}
        >
          <Txt size={12} weight="bold" font="inter" color={INK} lineHeight={16} align="center">
            Mark Done
          </Txt>
        </Pressable>
        <Pressable
          onPress={removeSelected}
          disabled={idle}
          style={({ pressed }) => [
            styles.popButton,
            { left: 251, width: 78, backgroundColor: DELETE_FILL },
            idle ? styles.disabled : pressed && styles.pressed,
          ]}
        >
          <Txt size={12} weight="bold" font="inter" color={INK} lineHeight={16} align="center">
            Delete
          </Txt>
        </Pressable>
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  addButton: {
    position: "absolute",
    left: 16,
    top: 107,
    width: 116.89,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: INK,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  shareButton: {
    position: "absolute",
    left: 140.89,
    top: 106,
    width: 108.77,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER_30,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  requestButton: {
    position: "absolute",
    left: 257.66,
    top: 106,
    width: 95.53,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: SELECT_LINE,
    borderWidth: 1,
    borderColor: BORDER_10,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
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
    top: 14,
    width: 245,
    height: 20,
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 14,
    lineHeight: 20,
    color: INK,
  },

  /* Selection bar */
  deselect: { position: "absolute", left: 252.44, top: 12.5, width: 72.56, height: 15 },

  /* Card stack */
  list: { position: "absolute", left: 0, top: LIST_Y, width: FRAME_W, height: LIST_H },
  card: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  avatar: {
    position: "absolute",
    left: 16,
    top: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: WHITE,
  },
  badge: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  nicheChip: {
    height: 18,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    justifyContent: "center",
    backgroundColor: GLASS_70,
  },
  tickOn: {
    position: "absolute",
    left: 299,
    top: 24,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: INK,
  },
  tickOff: {
    position: "absolute",
    left: 298,
    top: 23,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_80,
    borderWidth: 1,
    borderColor: BORDER_30,
  },
  cardAction: {
    position: "absolute",
    top: 134.5,
    width: 151.5,
    height: 31,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: GLASS_80,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  /* Row-action popover */
  popover: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  popButton: {
    position: "absolute",
    top: 12,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
