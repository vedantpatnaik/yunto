import type { ComponentProps } from "react";
import { useMemo } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Abs, Screen, Txt, getScale } from "../../../src/ui/Frame";
import { gradients } from "../../../src/theme";
import {
  compact,
  inr,
  useCalendar,
  useCampaignFull,
  useCampaigns,
  useCreators,
  useList,
  useNotifications,
  useUpdate,
  type Creator,
} from "../../../src/api/hooks";

/**
 * Campaign — creator detail. Figma 7778:17093 "creator profile" (375x876).
 *
 * One creator inside one campaign, reached from the campaigns flow: the header
 * is the campaign, the identity card carries the deal tag / status control and
 * the CAMPAIGN | DEADLINE | BUDGET strip, and every number under it is scoped
 * to this single engagement.
 *
 * Two frame quirks drive the layout:
 *   - the section stack (identity 106, analytics 311, deliverables 578,
 *     add-ons 814, timeline 1018) runs to y=1288.5, far past the 876pt frame —
 *     Figma clips the scroller at 748 — so the canvas is sized to the real
 *     content and scrolls.
 *   - the Manage Calendar / Mark Shortlist bar is authored at y=790, *over* the
 *     deliverables card: it is a floating dock, so it lives outside the
 *     scroller in a bar that re-applies the canvas scale and rides the device
 *     bottom inset.
 * Every other coordinate below is the raw frame coordinate from the spec.
 *
 * Geist (the header face) is not registered in app/_layout.tsx, so the title
 * renders in Inter — the face every other node in this frame already uses.
 *
 * What the schema cannot back, and how it is handled:
 *   - there is no Deliverable model. CalendarContent *is* the creator's content
 *     schedule (title + scheduledAt + status), so the checklist, the "N of M
 *     Done" pill and the progress bar all read from it; a row still "scheduled"
 *     gets no Done badge and no submitted line rather than a borrowed date.
 *   - there is no Activity model either. Notification is the app's event log —
 *     kind + title + body + createdAt, addressed by entityType/entityId — so
 *     the timeline is this campaign's notifications, oldest first.
 *   - Campaign has no deadline column; `timeline` is the only schedule string
 *     it stores, so that is what DEADLINE prints.
 *   - Campaign has no dealType either. Its Invoice does, and the invoice is
 *     joined by campaignId, so the Paid / Barter tag reads from there and falls
 *     back to the budget (a campaign with no money on it is a barter).
 *   - the two delta captions ("+8.4% this month", "+0.6% vs last") need a time
 *     series nothing stores, so those lines are left out rather than invented.
 *     The two descriptor captions beside them are the design's own copy.
 *   - EST. REACH is exactly that: avg views across the content booked for this
 *     campaign.
 *   - there is no service catalogue, so the two add-on rows keep the design's
 *     names and prices and route to the booking decks that do price them.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const CONTENT_BOTTOM = 1288.5; // Activity Timeline — 1018 + 270.5
const DOCK_H = 86; // action bar (62) + the 24 the frame leaves under it
const CANVAS_H = CONTENT_BOTTOM + DOCK_H;

/** Analytics: 165.5x102 tiles on a 177.5 x 113.5 grid anchored at (16, 343). */
const TILE_W = 165.5;
const TILE_H = 102;
const TILE_STEP_X = 177.5;
const TILE_STEP_Y = 113.5;

/**
 * Deliverables: the 163pt card holds exactly two rows, and the frame sizes each
 * to its title (one line at 647, two at 708.5). Content is centred in the slot.
 */
const DELIV_SLOTS = [
  { y: 647, h: 53.5, lines: 1, block: 29.5 },
  { y: 708.5, h: 69.5, lines: 2, block: 45.5 },
] as const;
const TRACK_W = 343;

/** Timeline: 32pt plate + 299pt card on a 60pt step; the last card is 58.5 tall. */
const TL_Y = 1050;
const TL_STEP = 60;
const TL_MAX = 4;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const INK = "#141311";
const MUTED = "#8c8a84";
const ON_DARK = "#faf7f2";
const BACK_FILL = "#1f1a17";

const GREEN = "#23c16b";
const MINT = "#e9f6ed";
const LILAC = "#f2edff";
const BLUSH = "#ffecf3";
const SAND = "#f7f3ea";

const TRACK = "#e8e5df";
const HAIRLINE = "rgba(232,229,223,0.1)";
const DIVIDER = "rgba(232,229,223,0.3)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_90 = "rgba(255,255,255,0.9)";

/* ------------------------------ gradient card ----------------------------- */
interface GlassProps {
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
  stops: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
}

/** A Figma FRAME whose fill is a linear gradient — the three section cards. */
function Glass({ x, y, w, h, radius, stops, locations, start, end, style }: GlassProps) {
  return (
    <Abs x={x} y={y} w={w} h={h} radius={radius} style={[styles.clip, style]}>
      <LinearGradient colors={stops} locations={locations} start={start} end={end} style={styles.fill} />
    </Abs>
  );
}

/* ------------------------------ analytics tile ---------------------------- */
interface TileProps {
  col: number;
  row: number;
  fill: string;
  label: string;
  glyph: ComponentProps<typeof Feather>["name"];
  value: string;
  /** Design footnote; dropped entirely when no record backs it. */
  caption?: string;
}

/** 165.5x102 stat tile: caption label, glass glyph disc, big value, footnote. */
function Tile({ col, row, fill, label, glyph, value, caption }: TileProps) {
  const x = 16 + col * TILE_STEP_X;
  const y = 343 + row * TILE_STEP_Y;
  return (
    <>
      <Abs x={x} y={y} w={TILE_W} h={TILE_H} radius={20} bg={fill} style={styles.tileShadow} />
      <Txt x={x + 14} y={y + 17} size={9} font="inter" color={MUTED} lineHeight={13.5} letterSpacing={0.45}>
        {label}
      </Txt>
      <Abs x={x + 131.5} y={y + 14} w={20} h={20} radius={9999} bg={GLASS_70} center>
        <Feather name={glyph} size={9} color={INK} />
      </Abs>
      <Txt
        x={x + 14} y={y + 40} w={137.5} numberOfLines={1}
        size={20} weight="bold" font="inter" color={INK} lineHeight={28} letterSpacing={-0.5}
      >
        {value}
      </Txt>
      {caption ? (
        <Txt
          x={x + 14} y={y + 74} w={137.5} numberOfLines={1}
          size={9} weight="semibold" font="inter" color={MUTED} lineHeight={13.5}
        >
          {caption}
        </Txt>
      ) : null}
    </>
  );
}

/* -------------------------------- add-on row ------------------------------ */
interface AddOnProps {
  y: number;
  glyph: ComponentProps<typeof Feather>["name"];
  /** Two-line label — service over variant, exactly as the frame sets it. */
  label: string;
  price: string;
  onPress: () => void;
}

/** 311x52 glass row inside the Add-ons card. */
function AddOn({ y, glyph, label, price, onPress }: AddOnProps) {
  return (
    <>
      <Abs x={32} y={y} w={311} h={52} radius={12} bg={GLASS_70} />
      <Abs x={42} y={y + 20} w={12} h={12} center>
        <Feather name={glyph} size={12} color={MUTED} />
      </Abs>
      <Txt x={66} y={y + 10} w={165} size={12} font="inter" color={INK} lineHeight={16}>
        {label}
      </Txt>
      <Txt
        x={233} y={y + 18} w={100} align="right"
        size={12} weight="bold" font="inter" color={INK} lineHeight={16}
      >
        {price}
      </Txt>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.addOnHit, { top: y }, pressed && styles.pressed]} />
    </>
  );
}

/* ------------------------------ derivations ------------------------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Jul 28" — the short stamp the checklist and the timeline both print. */
const stamp = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${MONTHS[d.getMonth()]} ${d.getDate()}`;
};

/** compact() lowercases the thousands suffix; the frame prints "840K", "1.2M". */
const short = (n: number) => compact(n).toUpperCase();

/** engagementRate is a Float — "4.2%", not "4.2000000000000002%". */
const pct = (n: number) => `${Number(n.toFixed(1))}%`;

/** ACTIVE -> Active. Enum values are shouted; the pill is not. */
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** CalendarContent seeds "scheduled" | "submitted" | "approved". */
const isDelivered = (status: string) => status !== "scheduled";

/** The four section tints, cycled by the timeline plates in frame order. */
const PLATE = [MINT, LILAC, BLUSH, SAND];

/** Notification.kind is the only clue to what an activity row was. */
const KIND_GLYPH: Record<string, ComponentProps<typeof Feather>["name"]> = {
  LEAD: "send",
  MESSAGE: "message-circle",
  CONTRACT: "file-text",
  INVOICE: "file-text",
  CAMPAIGN: "check-circle",
  REMINDER: "clock",
  LEAVE: "calendar",
  SYSTEM: "bell",
};

/** Creator.platform decides the badge clipped to the avatar. */
const PLATFORM_GLYPH: Record<string, ComponentProps<typeof Feather>["name"]> = {
  INSTAGRAM: "instagram",
  YOUTUBE: "youtube",
  TIKTOK: "music",
};

/**
 * GET /invoices returns the Prisma row, so `dealType` is on the wire even though
 * the shared Invoice type does not name it. Only the two columns used here.
 */
interface CampaignInvoice {
  id: string;
  campaignId?: string;
  dealType?: string;
}

/* --------------------------------- screen --------------------------------- */
export default function CampaignCreatorDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scale = getScale();
  const { campaignId, creatorId } = useLocalSearchParams<{ campaignId?: string; creatorId?: string }>();

  const { data: campaigns = [], isLoading } = useCampaigns();
  const campaign = useMemo(
    () => campaigns.find((c) => c.id === campaignId) ?? campaigns[0],
    [campaigns, campaignId],
  );

  const { data: full } = useCampaignFull(campaign?.id ?? null);
  const { data: creators = [] } = useCreators();
  const { data: calendar = [] } = useCalendar();
  const { data: invoices = [] } = useList<CampaignInvoice>("invoices");
  const { data: inbox } = useNotifications();
  const update = useUpdate<Creator>("creators");

  /** The CampaignCreator join row — the record this whole screen is about. */
  const member = useMemo(
    () => full?.creatorList.find((c) => c.id === creatorId) ?? full?.creatorList[0],
    [full, creatorId],
  );
  const rosterId = member?.id ?? creatorId;
  /** creatorList carries the campaign counters; the roster row carries niche + avatar. */
  const creator = useMemo(() => creators.find((c) => c.id === rosterId), [creators, rosterId]);
  const stats = member ?? creator;

  /** Paid / Barter — off this campaign's invoice, else off whether it holds money. */
  const dealType = useMemo(() => {
    const invoice = campaign ? invoices.find((i) => i.campaignId === campaign.id) : undefined;
    const raw = invoice?.dealType ?? ((campaign?.budget ?? 0) > 0 ? "PAID" : "BARTER");
    return raw === "BARTER" ? "Barter" : "Paid";
  }, [invoices, campaign]);

  /** Deliverables — this creator's content schedule, oldest first. */
  const deliverables = useMemo(
    () =>
      calendar
        .filter((c) => c.creatorId === rosterId)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [calendar, rosterId],
  );
  const doneCount = deliverables.filter((d) => isDelivered(d.status)).length;
  const doneRatio = deliverables.length > 0 ? doneCount / deliverables.length : 0;

  /** Activity — the event log filed against this campaign, chronological. */
  const activity = useMemo(() => {
    const items = inbox?.items ?? [];
    return items
      .filter((n) => n.entityType?.toLowerCase() === "campaign" && n.entityId === campaign?.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, TL_MAX);
  }, [inbox, campaign]);

  const estReach = stats ? stats.avgViews * Math.max(deliverables.length, 1) : 0;

  /** The creator's status in this campaign — the join's own `done` flag. */
  const status = member ? (member.done ? "Done" : title(campaign?.status ?? "")) : "Status";

  /** Creator.listed is the shortlist column the roster decks already read. */
  const shortlist = () => {
    if (!creator) return;
    update.mutate({ id: creator.id, data: { listed: !creator.listed } });
  };

  return (
    <View style={styles.root}>
      <Screen height={CANVAS_H} background={PAGE} scroll>
        {/* ================================ Header ============================ */}
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Feather name="arrow-left" size={16} color={ON_DARK} />
        </Pressable>
        <Txt
          x={72} y={28} w={192} numberOfLines={1}
          size={20} weight="medium" font="inter" color={INK} lineHeight={24} letterSpacing={-0.6}
        >
          {campaign?.name ?? (isLoading ? "Loading…" : "No campaign")}
        </Txt>

        {/* =============================== Identity =========================== */}
        <Glass
          x={16} y={106} w={343} h={185} radius={28}
          stops={["#f2edff", "rgba(255,255,255,0.6)", "rgba(255,236,243,0.6)"] as const}
          locations={[0, 0.5, 1] as const}
          start={{ x: 0.27, y: -0.27 }}
          end={{ x: 0.73, y: 1.27 }}
          style={styles.heroShadow}
        />

        {/* Avatar — an IMAGE fill in the design, the gradient plate without one */}
        {creator?.avatarUrl ? (
          <Image source={{ uri: creator.avatarUrl }} style={styles.avatar} />
        ) : (
          <LinearGradient
            colors={gradients.creators}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          />
        )}
        <Abs x={74.25} y={175.75} w={20} h={20} radius={9999} bg="#ffffff" center style={styles.chipShadow}>
          <Feather name={PLATFORM_GLYPH[creator?.platform ?? "INSTAGRAM"] ?? "instagram"} size={10} color={INK} />
        </Abs>

        <Txt
          x={104.25} y={125} w={152} numberOfLines={1}
          size={18} weight="bold" font="inter" color={INK} lineHeight={22.5} letterSpacing={-0.45}
        >
          {member?.name ?? creator?.name ?? (isLoading ? "Loading…" : "No creator")}
        </Txt>
        <Txt x={104.25} y={148} w={152} numberOfLines={1} size={12} font="inter" color={MUTED} lineHeight={16}>
          {member?.handle ?? creator?.handle ?? ""}
        </Txt>

        {/* Niche chip */}
        <Abs
          x={104.25} y={175} w={56} h={20} radius={9999}
          bg={GLASS_90} border={HAIRLINE} borderWidth={1} style={styles.chipShadow}
        />
        <Txt
          x={104.25} y={178} w={56} align="center" numberOfLines={1}
          size={9} weight="bold" font="inter" color={INK} lineHeight={13.5}
        >
          {creator?.niche ?? "—"}
        </Txt>

        {/* Deal tag — "Paid" over "Campaign", two lines as the frame sets it */}
        <Abs
          x={166.25} y={168.5} w={79.45} h={33} radius={9999}
          bg={GLASS_90} border={HAIRLINE} borderWidth={1} style={styles.chipShadow}
        />
        <Txt x={175.25} y={171.5} w={61.45} size={9} weight="bold" font="inter" color={INK} lineHeight={13.5}>
          {`${dealType}\nCampaign`}
        </Txt>

        {/* Status control — the join's own state, under the frame's picker chevron */}
        <Abs x={265} y={148.25} w={74.23} h={31} radius={9999} bg={INK} style={styles.chipShadow} />
        <Txt
          x={277} y={156.25} w={40} numberOfLines={1}
          size={10} weight="bold" font="inter" color={ON_DARK} lineHeight={15} letterSpacing={0.25}
        >
          {status}
        </Txt>
        <Abs x={317} y={158.75} w={10} h={10} center>
          <Feather name="chevron-down" size={10} color={ON_DARK} />
        </Abs>

        {/* CAMPAIGN | DEADLINE | BUDGET */}
        <Abs x={36} y={217.5} w={303} h={53.5} radius={18} bg={GLASS_70} style={styles.stripShadow} />
        <Txt x={48} y={229.5} size={9} font="inter" color={MUTED} lineHeight={13.5} letterSpacing={0.45}>
          CAMPAIGN
        </Txt>
        <Txt x={48} y={243} w={100} numberOfLines={1} size={12} weight="bold" font="inter" color={INK} lineHeight={16}>
          {campaign?.name ?? "—"}
        </Txt>
        <Txt
          x={184.78} y={229.5} w={47.91} align="right"
          size={9} font="inter" color={MUTED} lineHeight={13.5} letterSpacing={0.45}
        >
          DEADLINE
        </Txt>
        <Txt
          x={132.69} y={243} w={100} align="right" numberOfLines={1}
          size={12} weight="bold" font="inter" color={INK} lineHeight={16}
        >
          {campaign?.timeline ?? "—"}
        </Txt>
        <Txt
          x={287.26} y={229.5} w={39.72} align="right"
          size={9} font="inter" color={MUTED} lineHeight={13.5} letterSpacing={0.45}
        >
          BUDGET
        </Txt>
        <Txt
          x={226.98} y={243} w={100} align="right" numberOfLines={1}
          size={12} weight="bold" font="inter" color={INK} lineHeight={16}
        >
          {campaign ? `₹${inr(campaign.budget)}` : "—"}
        </Txt>

        {/* =========================== Creator Analytics ====================== */}
        <Txt x={16} y={311} w={343} size={14} weight="bold" font="inter" color={INK} lineHeight={20} letterSpacing={-0.35}>
          Creator Analytics
        </Txt>
        <Tile col={0} row={0} fill={MINT} label="FOLLOWERS" glyph="users" value={stats ? short(stats.followers) : "—"} />
        <Tile
          col={1} row={0} fill={LILAC} label="AVG VIEWS" glyph="eye"
          value={stats ? short(stats.avgViews) : "—"} caption="per reel avg"
        />
        <Tile
          col={0} row={1} fill={BLUSH} label="ENGAGEMENT" glyph="trending-up"
          value={stats ? pct(stats.engagementRate) : "—"}
        />
        <Tile
          col={1} row={1} fill={SAND} label="EST. REACH" glyph="target"
          value={estReach > 0 ? short(estReach) : "—"} caption="this campaign"
        />

        {/* ============================= Deliverables ========================= */}
        <Txt x={16} y={579.5} w={200} size={14} weight="bold" font="inter" color={INK} lineHeight={20} letterSpacing={-0.35}>
          Deliverables
        </Txt>
        <Abs x={283.48} y={578} w={75.52} h={23} radius={9999} bg={MINT} />
        <Txt
          x={283.48} y={582} w={75.52} align="center" numberOfLines={1}
          size={10} weight="bold" font="inter" color={GREEN} lineHeight={15}
        >
          {`${doneCount} of ${deliverables.length} Done`}
        </Txt>

        {/* Progress track — the checklist ratio, nothing else */}
        <Abs x={16} y={613} w={TRACK_W} h={6} radius={9999} bg={TRACK} />
        <Abs x={16} y={613} w={TRACK_W * doneRatio} h={6} radius={9999} bg={INK} />

        <Glass
          x={16} y={631} w={343} h={163} radius={22}
          stops={["rgba(242,237,255,0.7)", "rgba(255,255,255,0.6)"] as const}
          start={{ x: 0.17, y: -0.17 }}
          end={{ x: 0.83, y: 1.17 }}
          style={styles.tileShadow}
        />
        {deliverables.slice(0, DELIV_SLOTS.length).map((d, i) => {
          const slot = DELIV_SLOTS[i];
          const mid = slot.y + slot.h / 2;
          const titleY = mid - slot.block / 2;
          const done = isDelivered(d.status);
          return (
            <View key={d.id}>
              <Abs x={32} y={slot.y} w={311} h={slot.h} radius={14} bg={GLASS_70} />
              <Abs x={44} y={mid - 10} w={20} h={20} radius={9999} bg={done ? GREEN : TRACK} center>
                {done ? <Feather name="check" size={10} color={ON_DARK} /> : null}
              </Abs>
              <Txt
                x={76} y={titleY} w={204.02} numberOfLines={slot.lines}
                size={12} font="inter" color={INK} lineHeight={16}
              >
                {d.title}
              </Txt>
              {done ? (
                <>
                  <Txt
                    x={76} y={titleY + slot.lines * 16 - 0.5} w={204.02} numberOfLines={1}
                    size={9} font="inter" color={MUTED} lineHeight={13.5}
                  >
                    {`Submitted ${stamp(d.scheduledAt)}`}
                  </Txt>
                  <Abs x={292.02} y={mid - 9} w={38.98} h={18} radius={9999} bg={MINT} />
                  <Txt
                    x={292.02} y={mid - 7} w={38.98} align="center"
                    size={9} weight="bold" font="inter" color={GREEN} lineHeight={13.5}
                  >
                    Done
                  </Txt>
                </>
              ) : null}
            </View>
          );
        })}
        {deliverables.length === 0 ? (
          <Txt x={76} y={DELIV_SLOTS[0].y + 12} w={250} size={12} font="inter" color={MUTED} lineHeight={16}>
            {isLoading ? "Loading deliverables…" : "No deliverables yet"}
          </Txt>
        ) : null}

        {/* =============================== Add-ons ============================ */}
        <Glass
          x={16} y={814} w={343} h={184} radius={22}
          stops={["rgba(232,243,255,0.7)", "rgba(255,255,255,0.5)"] as const}
          start={{ x: 0.34, y: -0.34 }}
          end={{ x: 0.66, y: 1.34 }}
          style={styles.tileShadow}
        />
        <Abs x={32} y={830} w={24} h={24} radius={9999} bg="#ffffff" center style={styles.chipShadow}>
          <Feather name="briefcase" size={11} color={INK} />
        </Abs>
        <Txt x={64} y={834} w={200} size={12} weight="bold" font="inter" color={INK} lineHeight={16} letterSpacing={-0.3}>
          Add-ons
        </Txt>
        <Abs x={330} y={835.5} w={13} h={13} center>
          <Feather name="chevron-down" size={13} color={MUTED} />
        </Abs>
        <AddOn
          y={868} glyph="video" label={"Videographer\nOn-Site Shoot"} price="₹5,000"
          onPress={() => router.push("/agency/creators/videographers-list")}
        />
        <AddOn
          y={930} glyph="edit-3" label={"Editor\nMinimal Style"} price="₹3,000"
          onPress={() => router.push("/agency/creators/editors-list")}
        />

        {/* ========================== Activity Timeline ======================= */}
        <Txt x={16} y={1018} w={343} size={14} weight="bold" font="inter" color={INK} lineHeight={20} letterSpacing={-0.35}>
          Activity Timeline
        </Txt>
        {activity.map((n, i) => {
          const top = TL_Y + i * TL_STEP;
          const last = i === activity.length - 1;
          return (
            <View key={n.id}>
              <Abs x={16} y={top} w={32} h={32} radius={9999} bg={PLATE[i % PLATE.length]} center style={styles.chipShadow}>
                <Feather name={KIND_GLYPH[n.kind] ?? "bell"} size={12} color={INK} />
              </Abs>
              {last ? null : <Abs x={31.5} y={top + 36} w={1} h={24} bg={DIVIDER} />}

              <Abs
                x={60} y={top} w={299} h={last ? 58.5 : 52} radius={16}
                bg={GLASS_80} border={HAIRLINE} borderWidth={1} style={styles.rowShadow}
              />
              <Txt
                x={73} y={top + 13} w={230} numberOfLines={1}
                size={12} weight="bold" font="inter" color={INK} lineHeight={16}
              >
                {n.title}
              </Txt>
              <Txt x={246} y={top + 14} w={100} align="right" size={9} font="inter" color={MUTED} lineHeight={13.5}>
                {stamp(n.createdAt)}
              </Txt>
              {n.body ? (
                <Txt x={73} y={top + 30.5} w={250} numberOfLines={1} size={10} font="inter" color={MUTED} lineHeight={15}>
                  {n.body}
                </Txt>
              ) : null}
            </View>
          );
        })}
        {activity.length === 0 ? (
          <>
            <Abs
              x={60} y={TL_Y} w={299} h={52} radius={16}
              bg={GLASS_80} border={HAIRLINE} borderWidth={1} style={styles.rowShadow}
            />
            <Txt x={73} y={TL_Y + 18} w={250} size={12} font="inter" color={MUTED} lineHeight={16}>
              {isLoading ? "Loading activity…" : "No activity yet"}
            </Txt>
          </>
        ) : null}
      </Screen>

      {/* =================== Action dock — pinned, drawn over ================= */}
      <View
        pointerEvents="box-none"
        style={[styles.dock, { bottom: insets.bottom, width: FRAME_W * scale, height: DOCK_H * scale }]}
      >
        <View
          pointerEvents="box-none"
          style={[styles.dockCanvas, { width: FRAME_W, height: DOCK_H, transform: [{ scale }] }]}
        >
          <Abs
            x={16} y={0} w={343} h={62} radius={28}
            bg={GLASS_90} border="rgba(255,255,255,0.6)" borderWidth={1} style={styles.dockShadow}
          />
          <Pressable
            onPress={() => router.push("/agency/campaigns/campaign-detail")}
            style={({ pressed }) => [styles.calendarButton, pressed && styles.pressed]}
          >
            <Txt x={0} y={12} w={156.5} align="center" size={12} weight="bold" font="inter" color={INK} lineHeight={16}>
              Manage Calendar
            </Txt>
          </Pressable>
          <Pressable
            onPress={shortlist}
            disabled={!creator || update.isPending}
            style={({ pressed }) => [styles.shortlistButton, pressed && styles.pressed]}
          >
            <Txt x={0} y={12} w={156.5} align="center" size={12} weight="bold" font="inter" color={INK} lineHeight={16}>
              Mark Shortlist
            </Txt>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE },
  pressed: { opacity: 0.9 },
  clip: { overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },

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

  avatar: {
    position: "absolute",
    left: 36,
    top: 135.75,
    width: 54.25,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#ffffff",
  },

  heroShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  tileShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  stripShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  chipShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  rowShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.012,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  /** The whole 311x52 add-on row is the hit target. */
  addOnHit: { position: "absolute", left: 32, width: 311, height: 52, borderRadius: 12 },

  dock: { position: "absolute", left: 0 },
  dockCanvas: { position: "relative", transformOrigin: "top left" },
  dockShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  calendarButton: {
    position: "absolute",
    left: 27,
    top: 11,
    width: 156.5,
    height: 40,
    borderRadius: 9999,
    backgroundColor: BLUSH,
  },
  shortlistButton: {
    position: "absolute",
    left: 191.5,
    top: 11,
    width: 156.5,
    height: 40,
    borderRadius: 9999,
    backgroundColor: MINT,
  },
});
