import { Fragment, useMemo, useState } from "react";
import { Image, Pressable, Share, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Abs, Ring, Screen, Txt, getScale } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import {
  compact,
  useCampaignFull,
  useCampaigns,
  useCreators,
  useUpdate,
  type Creator,
} from "../../../src/api/hooks";

/**
 * Campaign Creators — Figma frame 7778:16631 (375x876), traced 1:1.
 *
 * The creator roster scoped to one campaign: the heading is the campaign's own
 * name, so this is Creators narrowed by CampaignCreator rather than the agency
 * roster. Layout, top to bottom — a 80pt header (back pill + Heading 1), the
 * Add Creator / Share Link / Request action row at y=106, the 343x50 search
 * field at y=166, the "N creators selected" bar at y=236, the "Matching
 * Creators — N results" heading at y=298 and the 343x181.5 card stack from
 * y=330 stepping 193.5.
 *
 * Two structural notes about the frame:
 *   • the five cards it draws already run to y=1285.5 against an 876 artboard,
 *     so the page scrolls and the canvas grows to hold the whole roster;
 *   • the bulk-action bar at (16,790) is an overlay, not a list sibling — the
 *     third card passes underneath it. It is therefore docked outside the
 *     scroller, re-applying the canvas scale and sitting 24pt (its own frame
 *     inset) above the device bottom inset, the pattern lead-detail-notes uses.
 *
 * Selection is real state, and it is what the whole screen keys off: the
 * selected-count bar and the dock are the shipped state of the frame and both
 * fall away when nothing is ticked, which is the empty-selection variant — no
 * geometry above them moves either way. Ids ticked on another screen can be
 * carried in as `?ids=`, which reproduces the frame's drawn state exactly.
 * Nothing seeds a selection on its own: CampaignCreator has no "pre-selected"
 * column, so ticking two arbitrary rows to match the drawing would be inventing
 * a record value.
 *
 * Data — every record value is live, off GET /campaigns/:id/full:
 *   Zostel Tip      Campaign.name for the id in the route (the first campaign
 *                   when the screen is opened without one).
 *   the cards       CampaignCreator's creator rows: name, handle, followers,
 *                   avgViews, engagementRate. creatorList does not carry niche,
 *                   avatar or platform, so those three come off the same
 *                   Creator record in GET /creators, joined by id.
 *   N results       the filtered row count.
 *   search          filters live over name / handle / niche.
 *
 * Bulk actions. "Mark Shortlisted" writes: Creator.listed is the only shelf the
 * schema has, and PATCH /creators/:id sets it. "Mark Done" and "Delete" want
 * CampaignCreator.done and a link teardown, and the API exposes no route for
 * that join table — so both act on the session only, and are marked with the
 * field they will write once the endpoint exists. Rows already done in the
 * campaign are dropped from "Matching Creators" the same way, since the real
 * CampaignCreator.done drives that filter too.
 *
 * There is no chat route in the app yet, so the card's Message button renders
 * as drawn but does not navigate; Profile opens the creator record. The frame's
 * Geist heading renders in Inter — Geist is not one of the two faces registered
 * in app/_layout.tsx. expo-blur is not a dependency, so the BACKGROUND_BLUR on
 * the dock, the stat strips and the row actions renders as their translucent
 * fill alone, as the other agency frames do.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/** Background+Shadow — the creator card, and the stack's step. */
const CARD_X = 16;
const CARD_W = 343;
const CARD_H = 181.5;
const CARD_Y0 = 330;
const CARD_STEP = 193.5; // 523.5 - 330
const CARD_GAP = CARD_STEP - CARD_H; // 12

/** Overlay+Border+Shadow+OverlayBlur — the docked bulk bar at (16,790). */
const DOCK_H = 62;
const DOCK_INSET = FRAME_H - 852; // 24 — bar bottom to frame bottom

/* ------------------------------ spec colours ------------------------------ */
const PAGE_BG = "#f8f5ef";
const INK = "#141311";
const INK_MUTED = "#8c8a84";
const ON_DARK = "#faf7f2";
const BACK_BG = "#1f1a17";
const PERF_INK = "#23c16b";
const REQUEST_BG = "#f2edff";
const SELBAR_BG = "rgba(242,237,255,0.6)";
const SELBAR_LINE = "#f2edff";
const HAIRLINE = "rgba(232,229,223,0.3)";
const HAIRLINE_10 = "rgba(232,229,223,0.1)";
const DIVIDER = "rgba(20,19,17,0.05)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_30 = "rgba(255,255,255,0.3)";

/** The five card paints the stack cycles through — 7778:16700 and siblings. */
const CARD_TINTS = ["#f2edff", "#ffecf3", "#e8f3ff", "#e9f6ed", "#f7f3ea"] as const;

/** Container 40 / 144 / 248 in the stat strip, card-relative. */
const STAT_X = [24, 128, 232] as const;
/** Vertical Divider 135 / 239, card-relative. */
const DIVIDER_X = [119, 223] as const;

/* ------------------------------ derivations ------------------------------- */
const platformIcon = (p?: string): "youtube" | "music" | "instagram" =>
  p === "YOUTUBE" ? "youtube" : p === "TIKTOK" ? "music" : "instagram";

/** One card's worth of record data, joined across the two endpoints. */
interface Row {
  id: string;
  name: string;
  handle: string;
  followers: number;
  avgViews: number;
  engagementRate: number;
  niche?: string;
  avatarUrl?: string;
  platform?: string;
  done: boolean;
}

const union = (a: string[], b: string[]) => [...a, ...b.filter((id) => !a.includes(id))];

/* --------------------------------- card ----------------------------------- */
interface CardProps {
  row: Row;
  top: number;
  tint: string;
  selected: boolean;
  onToggle: () => void;
  onProfile: () => void;
}

/** Background+Shadow — 343x181.5, children at card-relative coordinates. */
function CreatorCard({ row, top, tint, selected, onToggle, onProfile }: CardProps) {
  const stats: { label: string; value: string; ink: string }[] = [
    { label: "FOLLOWERS", value: compact(row.followers).toUpperCase(), ink: INK },
    { label: "AVG VIEWS", value: compact(row.avgViews).toUpperCase(), ink: INK },
    { label: "ENG. RATE", value: `${row.engagementRate.toFixed(1)}%`, ink: PERF_INK },
  ];

  return (
    <Abs x={CARD_X} y={top} w={CARD_W} h={CARD_H} radius={24} bg={tint} style={styles.card}>
      {/* ------------------------ identity block --------------------------- */}
      {row.avatarUrl ? (
        <Image source={{ uri: row.avatarUrl }} style={styles.avatar} />
      ) : (
        <Ring x={16} y={16} size={44} />
      )}
      {/* Background — the 16pt platform disc on the avatar's corner */}
      <Abs x={46} y={46} w={16} h={16} radius={8} bg="#ffffff" center style={styles.disc}>
        <Feather name={platformIcon(row.platform)} size={8} color={INK} />
      </Abs>

      <Txt
        x={72} y={19} w={227}
        size={14} weight="bold" font="inter"
        color={INK} lineHeight={17.5} letterSpacing={-0.35} numberOfLines={1}
      >
        {row.name}
      </Txt>
      <Abs x={72} y={39} h={18} row gap={6}>
        <Txt size={10} font="inter" color={INK_MUTED} lineHeight={15}>
          {row.handle}
        </Txt>
        {row.niche ? (
          <View style={styles.nicheChip}>
            <Txt size={9} weight="bold" font="inter" color={INK_MUTED} lineHeight={13.5}>
              {row.niche}
            </Txt>
          </View>
        ) : null}
      </Abs>

      {/* ----- Background / Overlay+Border — the select tick, both states ---- */}
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${row.name} selected`}
        style={selected ? styles.tickOn : styles.tickOff}
      >
        {selected ? <Feather name="check" size={13} color={ON_DARK} /> : null}
      </Pressable>

      {/* ------------------- Overlay+OverlayBlur — stat strip ---------------- */}
      <Abs x={16} y={72} w={311} h={45.5} radius={14} bg={GLASS_50} />
      {/* Laid out as loose siblings, not wrapped: a card-sized wrapper would
          sit over the tick and swallow its taps. */}
      {stats.map((st, i) => (
        <Fragment key={st.label}>
          <Txt
            x={STAT_X[i]} y={80} w={87} align="center"
            size={9} font="inter" color={INK_MUTED} lineHeight={13.5} letterSpacing={0.45}
          >
            {st.label}
          </Txt>
          <Txt
            x={STAT_X[i]} y={93.5} w={87} align="center"
            size={12} weight="bold" font="inter" color={st.ink} lineHeight={16}
            numberOfLines={1}
          >
            {st.value}
          </Txt>
        </Fragment>
      ))}
      {DIVIDER_X.map((dx) => (
        <Abs key={dx} x={dx} y={84.75} w={1} h={20} bg={DIVIDER} />
      ))}

      {/* ------------------ HorizontalBorder — the row actions --------------- */}
      <Abs x={16} y={129.5} w={311} h={1} bg={GLASS_30} />
      <Pressable
        onPress={onProfile}
        accessibilityRole="button"
        style={({ pressed }) => [styles.rowAction, styles.rowActionLeft, pressed && styles.pressed]}
      >
        <Feather name="eye" size={11} color={INK} />
        <Txt size={10} weight="semibold" font="inter" color={INK} lineHeight={15}>
          Profile
        </Txt>
      </Pressable>
      <Abs
        x={175.5} y={134.5} w={151.5} h={31} radius={12} bg={GLASS_80}
        row center gap={4} style={styles.actionShadow}
      >
        <Feather name="mail" size={11} color={INK} />
        <Txt size={10} weight="semibold" font="inter" color={INK} lineHeight={15}>
          Message
        </Txt>
      </Abs>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function CampaignCreators() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scale = getScale();
  const { id, ids } = useLocalSearchParams<{ id?: string; ids?: string }>();

  const { data: campaigns = [] } = useCampaigns();
  const campaignId = id ?? campaigns[0]?.id ?? null;
  const { data: full, isLoading } = useCampaignFull(campaignId);
  const { data: creators = [] } = useCreators();
  const shortlist = useUpdate<Creator>("creators");

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(() =>
    ids ? ids.split(",").filter(Boolean) : [],
  );
  /** CampaignCreator has no REST route; both sets are the pending write. */
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const campaignName =
    full?.name ?? campaigns.find((c) => c.id === campaignId)?.name ?? "";

  /** creatorList carries the campaign link; /creators carries niche + avatar. */
  const roster = useMemo<Row[]>(() => {
    const byId = new Map(creators.map((c) => [c.id, c]));
    return (full?.creatorList ?? []).map((cc) => {
      const c = byId.get(cc.id);
      return {
        id: cc.id,
        name: cc.name,
        handle: cc.handle,
        followers: cc.followers,
        avgViews: cc.avgViews,
        engagementRate: cc.engagementRate,
        niche: c?.niche,
        avatarUrl: c?.avatarUrl,
        platform: c?.platform,
        done: cc.done === true,
      };
    });
  }, [full, creators]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roster.filter((r) => {
      if (removedIds.includes(r.id)) return false;
      if (r.done || doneIds.includes(r.id)) return false;
      if (!q) return true;
      return `${r.name} ${r.handle} ${r.niche ?? ""}`.toLowerCase().includes(q);
    });
  }, [roster, query, doneIds, removedIds]);

  const picked = selected.filter((sid) => rows.some((r) => r.id === sid));
  const hasSelection = picked.length > 0;

  const toggle = (rid: string) =>
    setSelected((s) => (s.includes(rid) ? s.filter((k) => k !== rid) : [...s, rid]));

  /** Creator.listed — the one shelf the schema has, and a real write. */
  const markShortlisted = () => {
    if (!picked.length || shortlist.isPending) return;
    picked.forEach((rid) => shortlist.mutate({ id: rid, data: { listed: true } }));
    setSelected([]);
  };
  /** CampaignCreator.done — no endpoint yet, so the rows leave the list only. */
  const markDone = () => {
    if (!picked.length) return;
    setDoneIds((d) => union(d, picked));
    setSelected([]);
  };
  /** CampaignCreator teardown — likewise session-only until a route exists. */
  const removeFromCampaign = () => {
    if (!picked.length) return;
    setRemovedIds((r) => union(r, picked));
    setSelected([]);
  };

  const shareLink = () => {
    if (!campaignName) return;
    const list = (picked.length ? rows.filter((r) => picked.includes(r.id)) : rows)
      .map((r) => `${r.name} ${r.handle}`)
      .join("\n");
    Share.share({ message: `${campaignName}\n${list}` }).catch(() => undefined);
  };

  /**
   * The frame already draws five cards past its own bottom edge, so the canvas
   * is the stack's extent plus the docked bar's clearance — which resolves to
   * the spec's 876 whenever the roster is short enough to fit.
   */
  const listBottom = rows.length ? CARD_Y0 + (rows.length - 1) * CARD_STEP + CARD_H : CARD_Y0;
  const canvasH = Math.max(FRAME_H, listBottom + CARD_GAP + DOCK_H + DOCK_INSET);

  return (
    <View style={styles.root}>
      <Screen height={canvasH} background={PAGE_BG} scroll>
        {/* ======================= Frame 2147223266 ======================== */}
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={16} color={ON_DARK} />
        </Pressable>
        <Txt
          x={72} y={28} w={192}
          size={20} weight="medium" font="inter"
          color={INK} lineHeight={24} letterSpacing={-0.6} numberOfLines={1}
        >
          {campaignName}
        </Txt>

        {/* ==================== Container — the action row ================== */}
        <Pressable
          onPress={() => router.push("/agency/creators/add-creators")}
          accessibilityRole="button"
          style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
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
          accessibilityRole="button"
          style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}
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
          onPress={() => router.push("/agency/campaigns/campaign-requests")}
          accessibilityRole="button"
          style={({ pressed }) => [styles.requestBtn, pressed && styles.pressed]}
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

        {/* ============= Background+Border+Shadow — the search field ======== */}
        <Abs
          x={17} y={166} w={343} h={50} radius={20} bg="#ffffff"
          border={HAIRLINE_10} borderWidth={1} style={styles.searchShadow}
        >
          <Abs x={16} y={16} w={16} h={16} center>
            <Feather name="search" size={13} color={INK_MUTED} />
          </Abs>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search creators, niches..."
            placeholderTextColor={INK_MUTED}
            returnKeyType="search"
            style={styles.searchInput}
          />
          <Abs x={301} y={12} w={24} h={24} radius={12} bg={INK} center>
            <Feather name="mic" size={11} color={ON_DARK} />
          </Abs>
        </Abs>

        {/* ================= Overlay+Border — the selection bar ============= */}
        {/* The shipped state of the frame. With nothing ticked it and the dock
            fall away — the empty-selection variant — and nothing else moves. */}
        {hasSelection ? (
          <Pressable
            onPress={() => setSelected([])}
            accessibilityRole="button"
            accessibilityLabel="Deselect all"
            style={({ pressed }) => [styles.selBar, pressed && styles.pressed]}
          >
            <Abs x={16} y={10} w={20} h={20} radius={10} bg={INK} center>
              <Feather name="check" size={10} color={ON_DARK} />
            </Abs>
            <Txt
              x={44} y={12} w={111.53}
              size={12} weight="semibold" font="inter" color={INK} lineHeight={16}
            >
              {`${picked.length} creators selected`}
            </Txt>
            <Txt
              x={252.44} y={12.5} w={72.56}
              size={10} font="inter" color={INK_MUTED} lineHeight={15}
            >
              Tap to deselect
            </Txt>
          </Pressable>
        ) : null}

        {/* ==================== Container — the list heading ================ */}
        <Txt
          x={16} y={298} w={200}
          size={14} weight="bold" font="inter" color={INK} lineHeight={20} letterSpacing={-0.35}
        >
          Matching Creators
        </Txt>
        <Txt
          x={210.53} y={300} w={148.47} align="right"
          size={12} font="inter" color={INK_MUTED} lineHeight={16}
        >
          {`${rows.length} results`}
        </Txt>

        {/* ========================= the card stack ========================= */}
        {rows.map((row, i) => (
          <CreatorCard
            key={row.id}
            row={row}
            top={CARD_Y0 + i * CARD_STEP}
            tint={CARD_TINTS[i % CARD_TINTS.length]}
            selected={picked.includes(row.id)}
            onToggle={() => toggle(row.id)}
            onProfile={() => router.push(`/agency/creators/creator-detail?id=${row.id}`)}
          />
        ))}
        {rows.length === 0 ? (
          <Txt
            x={32} y={CARD_Y0 + 16} w={311}
            size={12} font="inter" color={INK_MUTED} lineHeight={16}
          >
            {isLoading ? "Loading creators…" : "No creators on this campaign"}
          </Txt>
        ) : null}
      </Screen>

      {/* ============ Container 16,790 — the bulk bar, pinned overlay ======= */}
      {hasSelection ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.dock,
            {
              bottom: insets.bottom + DOCK_INSET * scale,
              width: FRAME_W * scale,
              height: DOCK_H * scale,
            },
          ]}
        >
          <View
            pointerEvents="box-none"
            style={[styles.dockCanvas, { width: FRAME_W, height: DOCK_H, transform: [{ scale }] }]}
          >
            <Abs
              x={16} y={0} w={343} h={62} radius={28} bg={GLASS_90}
              border={GLASS_70} borderWidth={1} style={styles.dockShadow}
            />
            <Pressable
              onPress={markShortlisted}
              disabled={shortlist.isPending}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.bulkBtn,
                styles.shortlistBtn,
                pressed && styles.pressed,
              ]}
            >
              <Txt
                size={12} weight="bold" font="inter" color={INK} lineHeight={16} align="center"
              >
                Mark Shortlisted
              </Txt>
            </Pressable>
            <Pressable
              onPress={markDone}
              accessibilityRole="button"
              style={({ pressed }) => [styles.bulkBtn, styles.doneBtn, pressed && styles.pressed]}
            >
              <Txt
                size={12} weight="bold" font="inter" color={INK} lineHeight={16} align="center"
              >
                Mark Done
              </Txt>
            </Pressable>
            <Pressable
              onPress={removeFromCampaign}
              accessibilityRole="button"
              style={({ pressed }) => [styles.bulkBtn, styles.deleteBtn, pressed && styles.pressed]}
            >
              <Txt
                size={12} weight="bold" font="inter" color={INK} lineHeight={16} align="center"
              >
                Delete
              </Txt>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },
  pressed: { opacity: 0.85 },

  /* ------------------------------ header ---------------------------------- */
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

  /* ---------------------------- action row -------------------------------- */
  addBtn: {
    position: "absolute",
    left: 16,
    top: 107,
    width: 116.89,
    height: 32,
    borderRadius: 16,
    backgroundColor: INK,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  shareBtn: {
    position: "absolute",
    left: 140.89,
    top: 106,
    width: 108.77,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: HAIRLINE,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  requestBtn: {
    position: "absolute",
    left: 257.66,
    top: 106,
    width: 95.53,
    height: 34,
    borderRadius: 17,
    backgroundColor: REQUEST_BG,
    borderWidth: 1,
    borderColor: HAIRLINE_10,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  /* ------------------------------ search ---------------------------------- */
  searchShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  /** Container 62,181 245x20 — the placeholder's own box. */
  searchInput: {
    position: "absolute",
    left: 44,
    top: 14,
    width: 245,
    height: 20,
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 14,
    color: INK,
  },

  /* --------------------------- selection bar ------------------------------ */
  selBar: {
    position: "absolute",
    left: 17,
    top: 236,
    width: 343,
    height: 42,
    borderRadius: 16,
    backgroundColor: SELBAR_BG,
    borderWidth: 1,
    borderColor: SELBAR_LINE,
  },

  /* -------------------------------- card ---------------------------------- */
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
    borderColor: "#ffffff",
  },
  disc: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  /** Overlay — the niche pill beside the handle. */
  nicheChip: {
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 6,
    alignItems: "center",
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
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tickOff: {
    position: "absolute",
    left: 298,
    top: 23,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: GLASS_80,
    borderWidth: 1,
    borderColor: HAIRLINE,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  rowAction: {
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
  rowActionLeft: { left: 16 },
  actionShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  /* ------------------------------- the dock ------------------------------- */
  dock: { position: "absolute", left: 0 },
  dockCanvas: { position: "relative", transformOrigin: "top left" },
  dockShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  bulkBtn: {
    position: "absolute",
    top: 13,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  shortlistBtn: { left: 29, width: 132, backgroundColor: "#ffecf3" },
  doneBtn: { left: 169, width: 91, backgroundColor: "#e9f6ed" },
  deleteBtn: { left: 268, width: 78, backgroundColor: "#bdbebd" },
});
