import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Abs, Screen, Txt, getScale } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import {
  useCampaignFull,
  useCampaigns,
  useCreate,
  useNotes,
  useNotifications,
  useReminders,
  useUpdate,
  type Campaign,
  type Note,
} from "../../../src/api/hooks";

/**
 * Campaign Detail — Notes & Activity — Figma 7691:5900 (375x876), traced 1:1.
 *
 * The second tab state of the campaign-detail shell: identical chrome to the
 * first tab — dark back disc, heading, flag action, the lavender identity card
 * and the two-segment pill — with the body below y=397 swapped for this tab's
 * own panel: the pink Add Follow-Up strip, the quick-note composer and the
 * TODAY / YESTERDAY activity timeline.
 *
 * Two frame quirks drive the layout:
 *   - "3. Activity Timeline:margin" runs to y=945, past the 876pt frame (Figma
 *     clips it), so the canvas is sized to the block and scrolls.
 *   - "Overlay+OverlayBlur", the Follow Up / Mark Converted bar, is pinned at
 *     y=777 over that scroll, so it lives outside the scroller in a dock that
 *     re-applies the canvas scale and rides the device bottom inset.
 * Every other coordinate below is the raw frame coordinate from the spec.
 *
 * Geist is not one of the two faces registered in app/_layout.tsx, so the
 * heading and the tab labels render in Outfit; every Inter node renders Inter.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const BAR_H = 99; // "Overlay+OverlayBlur" — 375x99 at y=777
const CONTENT_BOTTOM = 945; // "3. Activity Timeline:margin" — 539 + 406
const CANVAS_H = CONTENT_BOTTOM + BAR_H; // scroll extent + dock clearance

const GROUP_Y = 563; // "Group: Today"
const GROUP_STEP = 191; // 754 - 563, to "Group: Yesterday"
const ROW_Y = 31; // first event card, group-relative (594 - 563)
const ROW_STEP = 74; // 668 - 594
/** 754 + 31 + 74 = 859 — the last event card the 382pt block holds. */
const MAX_GROUPS = 2;
const MAX_ROWS = 2;

/* --------------------------- spec colour tokens --------------------------- */
const BG = "#f8f5ef";
const WHITE = "#ffffff";
const INK_DARK = "#1f1a17"; // back disc fill / "Follow Up" label
const CHEVRON = "#faf7f2"; // back glyph stroke
const FLAG_INK = "#e74c3c"; // flag glyph stroke
const INK_HEAD = "#141311"; // heading
const INK_TITLE = "#1d1d1f"; // card name + amount
const INK_BODY = "#1c1c1e"; // row titles, active tab
const INK_SUB = "#6e6e73"; // card sub-line
const INK_MUTED = "#6c6c70"; // inactive tab, timestamps, placeholder
const INK_CHIP = "#8c8a84";
const CARD_FILL = "#f2edff";
const CHIP_ALT = "rgba(252,250,255,0.75)";
const FOLLOWUP_FILL = "#ffe4e8";
const FOLLOWUP_INK = "#d81b60";
const CONVERT_FILL = "#312b28";
const BAR_FILL = "rgba(246,239,233,0.85)";
const HAIRLINE = "rgba(232,226,217,0.5)"; // #e8e2d9 @ 50%
const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_62 = "rgba(255,255,255,0.62)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_75 = "rgba(255,255,255,0.75)";
const GLASS_90 = "rgba(255,255,255,0.9)";

/* ------------------------------ derivations ------------------------------- */
type IconName = ComponentProps<typeof Feather>["name"];

const MS_DAY = 86_400_000;
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Notification.kind -> the glyph the timeline disc carries. */
const KIND_ICON: Record<string, IconName> = {
  SYSTEM: "activity",
  LEAD: "user-plus",
  CAMPAIGN: "briefcase",
  CONTRACT: "file-text",
  INVOICE: "credit-card",
  LEAVE: "calendar",
  MESSAGE: "message-square",
  REMINDER: "bell",
};

function startOfDay(d: Date): number {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.getTime();
}

/** 0 = today, 1 = yesterday. Rounded so a DST shift cannot skew the bucket. */
function dayOffset(d: Date): number {
  return Math.round((startOfDay(new Date()) - startOfDay(d)) / MS_DAY);
}

/** "Today" / "Yesterday" / "18 Jul" — group heading and timestamp prefix alike. */
function dayWord(d: Date): string {
  const off = dayOffset(d);
  if (off === 0) return "Today";
  if (off === 1) return "Yesterday";
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** "10:00 am" — the clock half of every timestamp line. */
function timeLabel(d: Date): string {
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() >= 12 ? "pm" : "am"}`;
}

/** ACTIVE -> "Active", PAID -> "Paid" — the chip casing in the design. */
function label(s: string): string {
  return s
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/** "₹1.2L" — the lakh/thousand scale the card prints, as on the home screens. */
function inrShort(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${Math.round(n / 1_000)}K`;
  return `₹${n}`;
}

interface TimelineEvent {
  id: string;
  title: string;
  at: Date;
  icon: IconName;
}

interface TimelineGroup {
  key: string;
  heading: string;
  rows: TimelineEvent[];
}

/* --------------------------------- screen --------------------------------- */
export default function CampaignNotes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scale = getScale();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: campaigns = [] } = useCampaigns();
  const campaign = useMemo(
    () => campaigns.find((c) => c.id === id) ?? campaigns[0],
    [campaigns, id],
  );

  // The full record carries the raised invoice, which is what the first chip
  // reports — Campaign itself has no payment field.
  const { data: full } = useCampaignFull(campaign?.id ?? null);
  const { data: feed, isLoading: feedLoading } = useNotifications();
  const { data: notes = [], isLoading: notesLoading } = useNotes();
  const { data: reminders = [], isLoading: remindersLoading } = useReminders();
  const createNote = useCreate<Note>("notes");
  const updateCampaign = useUpdate<Campaign>("campaigns");

  const [draft, setDraft] = useState("");

  /**
   * The activity stream. Three record types feed it:
   *   - Notifications tagged to this campaign (entityType/entityId) — the only
   *     genuinely campaign-scoped history the schema keeps.
   *   - Reminders — the follow-ups an operator schedules. Reminder has no
   *     campaignId, so the owner-scoped stream is folded in rather than faked
   *     onto this campaign; the glyph comes from the record's own state (ahead
   *     of now a clock, done a check, overdue a bell).
   *   - Notes — what the composer below writes. Note has no campaignId either.
   * Everything is sorted newest-first and bucketed by day, and the frame's block
   * holds exactly two day groups of two rows.
   */
  const groups = useMemo<TimelineGroup[]>(() => {
    const now = Date.now();
    const activity = (feed?.items ?? []).filter(
      (n) => n.entityType === "Campaign" && n.entityId === campaign?.id,
    );
    const rows: TimelineEvent[] = [
      ...activity.map((n) => ({
        id: `a-${n.id}`,
        title: n.title,
        at: new Date(n.createdAt),
        icon: KIND_ICON[n.kind] ?? "activity",
      })),
      ...reminders.map((r) => {
        const at = new Date(r.dueAt);
        const icon: IconName = r.done
          ? "check-circle"
          : at.getTime() > now
            ? "clock"
            : "bell";
        return { id: `r-${r.id}`, title: r.title, at, icon };
      }),
      ...notes.map((n) => ({
        id: `n-${n.id}`,
        title: n.body,
        at: new Date(n.createdAt),
        icon: "message-square" as IconName,
      })),
    ].sort((a, b) => b.at.getTime() - a.at.getTime());

    const out: TimelineGroup[] = [];
    for (const row of rows) {
      const key = String(startOfDay(row.at));
      const hit = out.find((g) => g.key === key);
      if (hit) {
        if (hit.rows.length < MAX_ROWS) hit.rows.push(row);
      } else if (out.length < MAX_GROUPS) {
        out.push({ key, heading: dayWord(row.at).toUpperCase(), rows: [row] });
      }
    }
    return out;
  }, [campaign?.id, feed, notes, reminders]);

  /** The "20 Fri" chip tracks the next follow-up still due. */
  const followUp = useMemo(() => {
    const now = Date.now();
    const next = reminders
      .filter((r) => !r.done)
      .map((r) => new Date(r.dueAt))
      .filter((d) => d.getTime() >= now)
      .sort((a, b) => a.getTime() - b.getTime());
    return next[0] ?? new Date();
  }, [reminders]);

  const submitNote = () => {
    const body = draft.trim();
    if (!body || createNote.isPending) return;
    createNote.mutate({ body });
    setDraft("");
  };

  /**
   * The frame's terminal CTA. A lead converts into a campaign; this record is
   * already the campaign, so the only state left ahead of it in CampaignStatus
   * is DONE — that is what the button commits, and it is spent once it lands.
   */
  const markConverted = () => {
    if (!campaign || campaign.status === "DONE" || updateCampaign.isPending) return;
    updateCampaign.mutate(
      { id: campaign.id, data: { status: "DONE" } },
      { onSuccess: () => router.back() },
    );
  };

  const payChip = full?.invoice ? label(full.invoice.status) : "";
  const stateChip = campaign ? label(campaign.status) : "";
  const timelineLoading = feedLoading || notesLoading || remindersLoading;

  return (
    <View style={styles.root}>
      <Screen height={CANVAS_H} background={BG} scroll>
        {/* =============================== Header ============================= */}
        {/* Button — 36pt #1F1A17 disc carrying the back chevron. */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Feather name="chevron-left" size={16} color={CHEVRON} />
        </Pressable>
        {/* Heading 1 — Geist 500 20 / 24 at -0.6 tracking. */}
        <Txt
          x={72} y={28} w={222}
          size={20} weight="medium" color={INK_HEAD} lineHeight={24} letterSpacing={-0.6}
          numberOfLines={1}
        >
          Lead Detail
        </Txt>
        {/* Overlay+Border+Shadow+OverlayBlur — the flag action. */}
        <View style={styles.flag}>
          <Feather name="flag" size={18} color={FLAG_INK} />
        </View>

        {/* =========================== Identity card ========================== */}
        {/* Background+Shadow — 345x205 lavender card at (15,111). */}
        <Abs x={15} y={111} w={345} h={205} radius={24} bg={CARD_FILL} style={styles.cardShadow}>
          <Txt
            x={24} y={24} w={156.14}
            size={24} weight="bold" font="inter" color={INK_TITLE} lineHeight={29.04}
            numberOfLines={1}
          >
            {campaign?.contactPerson ?? campaign?.brandName ?? ""}
          </Txt>
          <Txt
            x={24} y={57} w={156.14}
            size={14} weight="medium" font="inter" color={INK_SUB} lineHeight={16.94}
            numberOfLines={1}
          >
            {campaign?.name ?? ""}
          </Txt>
          {/* Amount sits flush to the container's right edge (x + w = 336). */}
          <Txt
            x={24} y={24} w={297}
            size={18} weight="bold" font="inter" color={INK_TITLE} lineHeight={21.78}
            align="right" numberOfLines={1}
          >
            {campaign ? inrShort(campaign.budget) : ""}
          </Txt>

          {/* Two 27pt overlay chips — invoice payment state, then campaign state. */}
          <Abs x={24} y={86} h={27} row gap={8}>
            {payChip ? (
              <View style={[styles.chip, { backgroundColor: GLASS_75 }]}>
                <Txt size={12} font="inter" color={INK_CHIP} lineHeight={14.52}>
                  {payChip}
                </Txt>
              </View>
            ) : null}
            {stateChip ? (
              <View style={[styles.chip, { backgroundColor: CHIP_ALT }]}>
                <Txt size={12} font="inter" color={INK_CHIP} lineHeight={14.52}>
                  {stateChip}
                </Txt>
              </View>
            ) : null}
          </Abs>

          {/* Three 44pt white contact buttons. */}
          <View style={[styles.roundButton, { left: 24, top: 137 }]}>
            <Feather name="phone" size={20} color={INK_TITLE} />
          </View>
          <View style={[styles.roundButton, { left: 80, top: 137 }]}>
            <Feather name="message-circle" size={20} color={INK_TITLE} />
          </View>
          <View style={[styles.roundButton, { left: 136, top: 137 }]}>
            <Feather name="mail" size={20} color={INK_TITLE} />
          </View>
        </Abs>

        {/* ========================= Segmented control ======================== */}
        <Abs
          x={15} y={331} w={345} h={51} radius={999}
          bg={GLASS_65} border={HAIRLINE} borderWidth={1}
        >
          {/* This route IS the second tab; the first is the shell we came from. */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.segment, { left: 5, top: 5 }, pressed && styles.pressed]}
          >
            <Txt size={14} weight="semibold" color={INK_MUTED} lineHeight={18.2} align="center">
              Lead Info
            </Txt>
          </Pressable>
          <View style={[styles.segment, styles.segmentActive, { left: 172.5, top: 5 }]}>
            <Txt size={14} weight="semibold" color={INK_BODY} lineHeight={18.2} align="center">
              Notes & Activity
            </Txt>
          </View>
        </Abs>

        {/* ======================== 1. Follow-Up Block ======================== */}
        <Abs x={15} y={397} w={345} h={56} radius={12} bg={FOLLOWUP_FILL}>
          <View style={styles.dateChip}>
            <Txt
              size={13} weight="bold" font="inter" color={FOLLOWUP_INK}
              lineHeight={15.73} align="center"
            >
              {`${followUp.getDate()} ${DAYS_SHORT[followUp.getDay()]}`}
            </Txt>
          </View>
          <Txt
            x={84.3} y={19} w={188.22}
            size={15} weight="semibold" font="inter" color={INK_BODY} lineHeight={18.15}
            numberOfLines={1}
          >
            Add Follow-Up
          </Txt>
          <Pressable
            onPress={() => router.push("/agency/profile/add-reminder")}
            style={({ pressed }) => [styles.addPill, pressed && styles.pressed]}
          >
            <Txt
              size={13} weight="bold" font="inter" color={INK_BODY}
              lineHeight={15.73} align="center"
            >
              ADD
            </Txt>
          </Pressable>
        </Abs>

        {/* ============================ 2. Add Note =========================== */}
        <Abs
          x={20} y={469} w={335} h={50} radius={12}
          bg={GLASS_40} border={HAIRLINE} borderWidth={1}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submitNote}
            returnKeyType="done"
            placeholder="Add a quick note..."
            placeholderTextColor={INK_MUTED}
            style={styles.input}
          />
          <Pressable
            onPress={submitNote}
            style={({ pressed }) => [styles.send, pressed && styles.pressed]}
          >
            <Feather name="arrow-up" size={16} color={INK_BODY} />
          </Pressable>
        </Abs>

        {/* ======================= 3. Activity Timeline ======================= */}
        {/* Vertical Divider — 2x326 black-8% rail fading out over its last fifth. */}
        <LinearGradient
          colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.08)", "rgba(0,0,0,0)"] as const}
          locations={[0, 0.8, 1] as const}
          style={styles.divider}
        />

        {groups.map((group, gi) => {
          const groupY = GROUP_Y + gi * GROUP_STEP;
          return (
            <View key={group.key}>
              <Txt
                x={60} y={groupY} w={295}
                size={12} weight="bold" font="inter" color={INK_MUTED}
                lineHeight={14.52} letterSpacing={0.6}
              >
                {group.heading}
              </Txt>

              {group.rows.map((row, ri) => {
                const cardY = groupY + ROW_Y + ri * ROW_STEP;
                return (
                  <View key={row.id}>
                    {/* 24pt glass disc, centred 10pt into the card's 62pt run. */}
                    <Abs
                      x={20} y={cardY + 10} w={24} h={24} radius={12}
                      bg={GLASS_70} border={GLASS_40} borderWidth={1} center
                    >
                      <Feather name={row.icon} size={14} color={INK_BODY} />
                    </Abs>
                    <Abs
                      x={60} y={cardY} w={295} h={62} radius={12}
                      bg={WHITE} border={HAIRLINE} borderWidth={1}
                    >
                      <Txt
                        x={16} y={12} w={261}
                        size={14} weight="semibold" font="inter" color={INK_BODY}
                        lineHeight={16.94} numberOfLines={1}
                      >
                        {row.title}
                      </Txt>
                      <Txt
                        x={16} y={33} w={261}
                        size={12} weight="medium" font="inter" color={INK_MUTED}
                        lineHeight={14.52} numberOfLines={1}
                      >
                        {`${dayWord(row.at)} • ${timeLabel(row.at)}`}
                      </Txt>
                    </Abs>
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Loading / empty fills the first event slot — geometry never moves. */}
        {groups.length === 0 ? (
          <Abs
            x={60} y={GROUP_Y + ROW_Y} w={295} h={62} radius={12}
            bg={WHITE} border={HAIRLINE} borderWidth={1}
          >
            <Txt
              x={16} y={12} w={261}
              size={14} weight="semibold" font="inter" color={INK_BODY}
              lineHeight={16.94} numberOfLines={1}
            >
              {timelineLoading ? "Loading activity…" : "No activity yet"}
            </Txt>
          </Abs>
        ) : null}
      </Screen>

      {/* ====================== Action bar — pinned overlay ==================== */}
      <View
        pointerEvents="box-none"
        style={[styles.dock, { bottom: insets.bottom, width: FRAME_W * scale, height: BAR_H * scale }]}
      >
        <View
          pointerEvents="box-none"
          style={[styles.dockCanvas, { width: FRAME_W, height: BAR_H, transform: [{ scale }] }]}
        >
          <Abs x={0} y={0} w={FRAME_W} h={BAR_H} bg={BAR_FILL} />
          <Pressable
            onPress={() => router.push("/agency/profile/add-reminder")}
            style={({ pressed }) => [styles.action, styles.followUpAction, pressed && styles.pressed]}
          >
            <Txt size={14} weight="medium" font="inter" color={INK_DARK} lineHeight={16.94} align="center">
              Follow Up
            </Txt>
          </Pressable>
          <Pressable
            onPress={markConverted}
            disabled={!campaign || campaign.status === "DONE" || updateCampaign.isPending}
            style={({ pressed }) => [styles.action, styles.convertAction, pressed && styles.pressed]}
          >
            <Txt size={14} weight="medium" font="inter" color={WHITE} lineHeight={16.94} align="center">
              Mark Converted
            </Txt>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  pressed: { opacity: 0.9 },

  /* header */
  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: INK_DARK,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },
  flag: {
    position: "absolute",
    left: 314,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_40,
    borderWidth: 0.82,
    borderColor: GLASS_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 9.82,
    shadowOffset: { width: 0, height: 3.27 },
  },

  /* identity card */
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chip: {
    height: 27,
    borderRadius: 24,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  roundButton: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /* segmented control */
  segment: {
    position: "absolute",
    width: 167.5,
    height: 41,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
    backgroundColor: GLASS_90,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /* 1. follow-up block */
  dateChip: {
    position: "absolute",
    left: 12,
    top: 12,
    width: 60.3,
    height: 32,
    borderRadius: 6,
    justifyContent: "center",
    backgroundColor: WHITE,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addPill: {
    position: "absolute",
    left: 272.52,
    top: 12,
    width: 60.48,
    height: 32,
    borderRadius: 999,
    justifyContent: "center",
    backgroundColor: WHITE,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  /* 2. composer */
  input: {
    position: "absolute",
    left: 17,
    top: 15,
    width: 275,
    height: 20,
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 15,
    color: INK_BODY,
  },
  send: {
    position: "absolute",
    left: 292,
    top: 7,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  /* 3. timeline */
  divider: { position: "absolute", left: 31, top: 599, width: 2, height: 326 },

  /* action bar — re-applies the canvas scale so it lines up with the body */
  dock: { position: "absolute", left: 0 },
  dockCanvas: { position: "relative", transformOrigin: "top left" },
  action: {
    position: "absolute",
    top: 16,
    width: 161.5,
    height: 51,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  followUpAction: {
    left: 20,
    backgroundColor: GLASS_60,
    borderWidth: 1,
    borderColor: GLASS_62,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  convertAction: {
    left: 193.5,
    backgroundColor: CONVERT_FILL,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
