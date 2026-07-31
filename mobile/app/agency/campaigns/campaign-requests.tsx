import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Rect } from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useCampaignFull, useCampaigns, useCreators } from "../../../src/api/hooks";

/**
 * All Requests — Figma 7696:11416 "all requests" (375x876), traced 1:1.
 *
 * Reached from a campaign card's "View" on Active Campaigns. Four bands over
 * the flat #f8f5ef frame: the dark pill back button + "All Requests" heading,
 * the floating Accepted / Pending / History segmented filter, the clipped
 * 375x587 "Main - Campaign Cards" column of 335x214 glass person cards, and the
 * "Browse more" pill parked at the bottom of the frame.
 *
 * The card and the segmented filter are the same chrome Active Campaigns uses
 * in this batch, so both live here as standalone components (`RequestCard`,
 * `SegmentedFilter`) with card-relative child offsets — lift them into src/ui
 * verbatim when the two screens are reconciled.
 *
 * Data — schema.prisma has no Request model: the real roster of people attached
 * to a campaign is CampaignCreator, served as `creatorList` by /campaigns/:id/full,
 * so that is what the cards render. The screen is campaign-scoped exactly like
 * the design (it is opened from one campaign) and takes the campaign id as its
 * `id` param, falling back to the first active campaign when opened without one.
 *   • bucket — CampaignCreator carries `done` and nothing else about acceptance,
 *     so a finished link is History, a link on a DRAFT campaign is still Pending
 *     and a link on a live campaign is Accepted. Documented in `bucketOf`.
 *   • role chip — `creatorList` omits niche/avatar, so each row is joined back to
 *     /creators by id. Creator.niche ("Fashion", "Tech") is the only discipline
 *     the schema stores; the design's "Videographer" has no column, so the chip
 *     shows the niche and simply does not render when it is null.
 *   • deadline — Campaign.timeline is the only date the schema keeps for a
 *     campaign, and the row is omitted when it is unset rather than invented.
 * The status chip keeps the single green paint the file draws for every card;
 * the spec has no Pending/History variant to copy.
 *
 * expo-blur is not a dependency, so the BACKGROUND_BLUR on the filter and the
 * cards renders as its translucent fill alone — the substitution the other
 * agency frames make.
 */

/* -------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

const LIST_Y = 188; // "Main - Campaign Cards", clipsContent
const LIST_H = 587;
const CARD_X = 20;
const CARD_W = 335;
const CARD_H = 214;
const CARD_TOP = 12; // 200 - 188
const CARD_STEP = 230; // 214 card + 16 stack gap
const MAX_CARDS = 3; // row 3 starts at 472 and is cut by the 587 clip, as drawn; a 4th at 702 never shows

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef"; // frame fill
const INK_TITLE = "#141311"; // Heading 1
const INK_NAME = "#1a1a1a"; // Heading 2, Portfolio, Browse more
const INK_META = "#555555"; // Campaign: / Deadline:
const INK_ICON = "#888888"; // every iconify vector stroke
const INK_TAB_IDLE = "#777777";
const ON_DARK = "#faf7f2"; // back chevron
const BACK_FILL = "#1f1a17";
const CHAT_FILL = "#312b28";
const AVATAR_FILL = "rgba(196,196,196,0.62)";
const ROLE_BG = "rgba(243,232,255,0.8)";
const ROLE_INK = "#6a1b9a";
const STATUS_BG = "rgba(232,245,233,0.8)";
const STATUS_INK = "#2e7d32";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_62 = "rgba(255,255,255,0.62)";
const GLASS_LINE_80 = "rgba(255,255,255,0.8)";
const GLASS_LINE_60 = "rgba(255,255,255,0.6)";
const BUTTON_LINE = "rgba(232,232,232,0.62)";

/* ---------------------------------- tabs ---------------------------------- */
type Tab = "accepted" | "pending" | "history";

/**
 * Pill-relative geometry. The 345x50 container carries a 1pt stroke, which
 * insets its absolutely positioned children by a point, so each x is the
 * frame coordinate less 15 (the container) less 1 (the stroke).
 */
const TABS: { key: Tab; label: string; x: number; w: number; tx: number; tw: number }[] = [
  { key: "accepted", label: "Accepted", x: 6, w: 129, tx: 18, tw: 93 },
  { key: "pending", label: "Pending", x: 140, w: 109, tx: 16, tw: 77 },
  { key: "history", label: "History", x: 253, w: 81, tx: -14, tw: 109 },
];

const STATUS_LABEL: Record<Tab, string> = {
  accepted: "Accepted",
  pending: "Pending",
  history: "History",
};

/**
 * CampaignCreator has no acceptance column — `done` is the only per-link state
 * it stores. A finished link (or a wrapped campaign) is history; on a campaign
 * still in DRAFT the roster has not been confirmed, so those links are pending.
 */
function bucketOf(done: boolean | undefined, status: string): Tab {
  if (done || status === "DONE") return "history";
  return status === "DRAFT" ? "pending" : "accepted";
}

interface RequestRow {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  status: string;
  campaign: string;
  deadline?: string;
}

/* ---------------------------- segmented filter ---------------------------- */
/** Floating Segmented Filter — 7696:11533. Shared with Active Campaigns. */
function SegmentedFilter({
  value,
  counts,
  onChange,
}: {
  value: Tab;
  counts: Record<Tab, number>;
  onChange: (tab: Tab) => void;
}) {
  return (
    <Abs
      x={15}
      y={110}
      w={345}
      h={50}
      radius={30}
      bg={GLASS_60}
      border={GLASS_LINE_80}
      borderWidth={1}
      style={[styles.clip, styles.filterShadow]}
    >
      {TABS.map((t) => {
        const active = t.key === value;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={[styles.tab, { left: t.x, width: t.w }, active && styles.tabActive]}
          >
            {active ? (
              <LinearGradient
                colors={["#1A1A1A", "#333333"] as const}
                start={{ x: 0.14, y: -0.34 }}
                end={{ x: 0.86, y: 1.34 }}
                style={styles.fill}
              />
            ) : null}
            <Txt
              x={t.tx}
              y={10}
              w={t.tw}
              size={14}
              weight="medium"
              font="inter"
              color={active ? colors.white : INK_TAB_IDLE}
              lineHeight={16.94}
              align="center"
            >
              {active ? `${t.label}  (${counts[t.key]})` : t.label}
            </Txt>
          </Pressable>
        );
      })}
    </Abs>
  );
}

/* ------------------------------ request card ------------------------------ */
/**
 * 335x214 glass person card — Card 1, 7696:11425. Shared with Active Campaigns.
 * Child offsets are card-relative and already account for the 1pt stroke, which
 * insets the padding box by a point a side.
 */
function RequestCard({
  top,
  row,
  onPortfolio,
  onChat,
}: {
  top: number;
  row: RequestRow;
  onPortfolio: () => void;
  onChat: () => void;
}) {
  return (
    <Abs
      x={CARD_X}
      y={top}
      w={CARD_W}
      h={CARD_H}
      radius={24}
      border={colors.white}
      borderWidth={1}
      style={styles.card}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.5)"] as const}
        start={{ x: 0.1, y: -0.07 }}
        end={{ x: 0.9, y: 1.07 }}
        style={styles.cardFill}
      />
      <LinearGradient
        colors={["rgba(232,245,233,0.3)", "rgba(232,245,233,0)"] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardSheen}
      />

      {/* Avatar — the file's image fill; the grey disc shows when there is none */}
      <Abs x={20} y={20} w={64} h={64} radius={32} bg={AVATAR_FILL} style={styles.clip}>
        {row.avatarUrl ? <Image source={{ uri: row.avatarUrl }} style={styles.avatar} /> : null}
      </Abs>

      {/* Name + chips */}
      <Txt
        x={100}
        y={23.5}
        w={213}
        size={18}
        weight="bold"
        font="inter"
        color={INK_NAME}
        lineHeight={21.6}
        numberOfLines={1}
      >
        {row.name}
      </Txt>
      <Abs x={100} y={53.5} h={27} row gap={6}>
        {row.role ? (
          <View style={[styles.chip, { backgroundColor: ROLE_BG }]}>
            <Txt size={12} weight="semibold" font="inter" color={ROLE_INK} lineHeight={14.52}>
              {row.role}
            </Txt>
          </View>
        ) : null}
        <View style={[styles.chip, { backgroundColor: STATUS_BG }]}>
          <Txt size={12} weight="semibold" font="inter" color={STATUS_INK} lineHeight={14.52}>
            {row.status}
          </Txt>
        </View>
      </Abs>

      {/* Meta rows */}
      {row.campaign ? (
        <>
          <Abs x={20} y={100.5}>
            {/* layout-panel-top — the file's iconify glyph (wide bar over two
                squares, 3 vectors); Feather has no equivalent, so it is drawn. */}
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
              <Rect x={3} y={3} width={18} height={7} rx={1} stroke={INK_ICON} strokeWidth={2} strokeLinejoin="round" />
              <Rect x={3} y={14} width={7} height={7} rx={1} stroke={INK_ICON} strokeWidth={2} strokeLinejoin="round" />
              <Rect x={14} y={14} width={7} height={7} rx={1} stroke={INK_ICON} strokeWidth={2} strokeLinejoin="round" />
            </Svg>
          </Abs>
          <Txt
            x={43}
            y={100}
            w={270}
            size={13}
            weight="medium"
            font="inter"
            color={INK_META}
            lineHeight={15.73}
            numberOfLines={1}
          >
            Campaign: {row.campaign}
          </Txt>
        </>
      ) : null}
      {row.deadline ? (
        <>
          <Abs x={20} y={124.5}>
            <Feather name="calendar" size={15} color={INK_ICON} />
          </Abs>
          <Txt
            x={43}
            y={124}
            w={270}
            size={13}
            weight="medium"
            font="inter"
            color={INK_META}
            lineHeight={15.73}
            numberOfLines={1}
          >
            Deadline: {row.deadline}
          </Txt>
        </>
      ) : null}

      {/* Footer buttons */}
      <Pressable
        onPress={onPortfolio}
        style={({ pressed }) => [styles.portfolioButton, pressed && styles.pressed]}
      >
        <Txt
          x={24}
          y={10}
          w={77}
          size={14}
          weight="semibold"
          font="inter"
          color={INK_NAME}
          lineHeight={16.94}
          align="center"
        >
          Portfolio
        </Txt>
      </Pressable>
      <Pressable onPress={onChat} style={({ pressed }) => [styles.chatButton, pressed && styles.pressed]}>
        <Txt
          x={24}
          y={10}
          w={77}
          size={14}
          weight="semibold"
          font="inter"
          color={colors.white}
          lineHeight={16.94}
          align="center"
        >
          Open Chat
        </Txt>
      </Pressable>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function CampaignRequests() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const [tab, setTab] = useState<Tab>("accepted");

  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const { data: creators = [] } = useCreators();

  // Opened from a campaign card, so the campaign is the route param; opened
  // cold, the screen falls back to the first live campaign rather than nothing.
  const campaignId =
    params.id ?? campaigns.find((c) => c.status === "ACTIVE")?.id ?? campaigns[0]?.id ?? null;
  const { data: campaign, isLoading: rosterLoading } = useCampaignFull(campaignId);

  const { counts, rows } = useMemo(() => {
    const profiles = new Map(creators.map((c) => [c.id, c]));
    const status = campaign?.status ?? "ACTIVE";

    const all: (RequestRow & { tab: Tab })[] = (campaign?.creatorList ?? []).map((link) => {
      const bucket = bucketOf(link.done, status);
      const profile = profiles.get(link.id);
      return {
        id: link.id,
        name: link.name,
        avatarUrl: profile?.avatarUrl,
        role: profile?.niche,
        status: STATUS_LABEL[bucket],
        campaign: campaign?.name ?? "",
        deadline: campaign?.timeline,
        tab: bucket,
      };
    });

    const tally: Record<Tab, number> = { accepted: 0, pending: 0, history: 0 };
    for (const r of all) tally[r.tab] += 1;

    return { counts: tally, rows: all.filter((r) => r.tab === tab).slice(0, MAX_CARDS) };
  }, [campaign, creators, tab]);

  const loading = campaignsLoading || rosterLoading;

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
        x={72}
        y={28}
        w={192}
        size={20}
        weight="medium"
        color={INK_TITLE}
        lineHeight={24}
        letterSpacing={-0.6}
      >
        All Requests
      </Txt>

      {/* -------------------------- Segmented filter ------------------------- */}
      <SegmentedFilter value={tab} counts={counts} onChange={setTab} />

      {/* ------------------------ Main - Campaign Cards ---------------------- */}
      <Abs x={0} y={LIST_Y} w={FRAME_W} h={LIST_H} style={styles.clip}>
        {rows.map((r, i) => (
          <RequestCard
            key={r.id}
            top={CARD_TOP + i * CARD_STEP}
            row={r}
            onPortfolio={() =>
              router.push({ pathname: "/creators/creator-detail", params: { id: r.id } })
            }
            // No per-person DM route exists in the app; the campaign brief is the
            // only thread surface, so Open Chat lands there.
            onChat={() => router.push("/agency/campaigns/campaign-detail")}
          />
        ))}
        {rows.length === 0 ? (
          <Txt
            x={40}
            y={32}
            w={293}
            size={13}
            weight="medium"
            font="inter"
            color={INK_META}
            lineHeight={15.73}
          >
            {loading ? "Loading requests…" : "No requests"}
          </Txt>
        ) : null}
      </Abs>

      {/* -------------------- Bottom Floating Browse Button ------------------ */}
      <Pressable
        onPress={() => router.push("/agency/creators/creators-roster")}
        style={({ pressed }) => [styles.browseButton, pressed && styles.pressed]}
      >
        <Txt
          x={20}
          y={16.5}
          w={88}
          size={14}
          weight="medium"
          font="inter"
          color={INK_NAME}
          lineHeight={16.94}
          align="center"
        >
          Browse more
        </Txt>
        <Abs x={122} y={16}>
          <Feather name="search" size={18} color={INK_ICON} />
        </Abs>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },

  /* Header — Button 7700:12081 */
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

  /* Floating Segmented Filter */
  filterShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  tab: {
    position: "absolute",
    top: 6,
    height: 36,
    borderRadius: 24,
    overflow: "hidden",
  },
  tabActive: {
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  /* Request card */
  card: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  cardFill: { position: "absolute", left: 0, top: 0, width: 333, height: 212, borderRadius: 24 },
  cardSheen: { position: "absolute", left: 0, top: 0, width: 333, height: 211.59, borderRadius: 24 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  chip: {
    height: 27,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: GLASS_LINE_80,
  },
  portfolioButton: {
    position: "absolute",
    left: 20,
    top: 156,
    width: 137,
    height: 36,
    borderRadius: 20,
    backgroundColor: GLASS_60,
    borderWidth: 1,
    borderColor: BUTTON_LINE,
  },
  chatButton: {
    position: "absolute",
    left: 176,
    top: 156,
    width: 137,
    height: 36,
    borderRadius: 20,
    backgroundColor: CHAT_FILL,
  },

  /* Bottom Floating Browse Button */
  browseButton: {
    position: "absolute",
    left: 103.5,
    top: 809,
    width: 168,
    height: 52,
    borderRadius: 28,
    backgroundColor: GLASS_62,
    borderWidth: 1,
    borderColor: GLASS_LINE_60,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
});
