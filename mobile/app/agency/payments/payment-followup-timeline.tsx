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
  useConvertLead,
  useCreate,
  useLeads,
  useNotes,
  useReminders,
  type Note,
} from "../../../src/api/hooks";

/**
 * Lead Detail — Notes & Activity — Figma 7691:5900 (375x876), traced 1:1.
 *
 * The agency-side payment-chasing tab: the shared lead header, the lavender
 * identity card, the "Lead Info | Notes & Activity" segmented pill, the pink
 * Add Follow-Up row, the quick-note composer and the TODAY / YESTERDAY activity
 * timeline. Same chrome as the payment summary tab — only the body differs.
 *
 * The frame is 876 tall but "3. Activity Timeline" runs to y=945 (Figma clips
 * it inside "Frame 2147223255"), and the frame's own bottom bar is an overlay
 * pinned at y=777. So the canvas is sized to the timeline and scrolls, while the
 * Follow Up / Mark Converted bar is a dock that re-applies the canvas scale and
 * stays pinned to the device bottom — exactly the overlay the frame draws.
 * Every other coordinate below is the raw frame coordinate from the spec.
 *
 * Geist is not one of the two faces registered in app/_layout.tsx, so the
 * header and the tab labels render in Outfit; the Inter nodes render in Inter.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const BAR_H = 99; // "Overlay+OverlayBlur" — 375x99 at y=777
const CONTENT_BOTTOM = 945; // "3. Activity Timeline" — 563 + 382
const CANVAS_H = CONTENT_BOTTOM + BAR_H; // scroll extent + dock clearance

const CARD_X = 15;
const CARD_Y = 111;
const CARD_W = 345;
const CARD_H = 205;

const GROUP_Y = 563; // "Group: Today" origin
const GROUP_STEP = 191; // 754 - 563, to "Group: Yesterday"
const ROW_Y = 31; // first event card, group-relative (594 - 563)
const ROW_STEP = 74; // 668 - 594
/** 563 + 191 + 167 = 921 — the last event card the timeline block holds. */
const MAX_GROUPS = 2;
const MAX_ROWS = 2;

/* --------------------------- spec colour tokens --------------------------- */
const BG = "#f8f5ef";
const INK_TITLE = "#1d1d1f";
const INK_BODY = "#1c1c1e";
const INK_HEAD = "#141311";
const INK_MUTED = "#6c6c70";
const INK_SUB = "#6e6e73";
const INK_CHIP = "#8c8a84";
const INK_DARK = "#1f1a17";
const FOLLOWUP_INK = "#d81b60";
const CARD_FILL = "#f2edff";
const FOLLOWUP_FILL = "#ffe4e8";
const CONVERT_FILL = "#312b28";
const WHITE = "#ffffff";
const CHIP_ALT = "rgba(252,250,255,0.75)";
const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_75 = "rgba(255,255,255,0.75)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const BAR_FILL = "rgba(246,239,233,0.85)";

/* ------------------------------ derivations ------------------------------- */
type IconName = ComponentProps<typeof Feather>["name"];

const MS_DAY = 86_400_000;
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function startOfDay(d: Date): number {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.getTime();
}

/** 0 = today, 1 = yesterday. Rounded so DST shifts cannot skew the bucket. */
function dayOffset(d: Date): number {
  return Math.round((startOfDay(new Date()) - startOfDay(d)) / MS_DAY);
}

/** "Today" / "Yesterday" / "18 Jul" — the prefix of every timestamp line. */
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

/** PAID -> "Paid", CONTACTED -> "Contacted" — the chip casing in the design. */
function label(s: string): string {
  return s
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/** Lead.money is stored bare ("1.2L"); the card in the design is prefixed. */
function moneyLabel(money: string | undefined): string {
  if (!money) return "";
  return money.startsWith("₹") ? money : `₹${money}`;
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
export default function PaymentFollowUpTimeline() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scale = getScale();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: leads = [] } = useLeads();
  const { data: notes = [], isLoading: notesLoading } = useNotes();
  const { data: reminders = [], isLoading: remindersLoading } = useReminders();
  const createNote = useCreate<Note>("notes");
  const convert = useConvertLead();

  const [draft, setDraft] = useState("");

  const lead = useMemo(() => leads.find((l) => l.id === id) ?? leads[0], [leads, id]);

  /**
   * Reminders and notes both feed the timeline; neither carries a leadId in the
   * schema yet, so the owner-scoped stream is shown newest first and bucketed by
   * day. The glyph is derived from the record rather than the row position: a
   * reminder is a bell, one still ahead of now is a clock, a completed one is a
   * check, and a note is a message. The frame's fourth glyph (the "Call" phone)
   * has no call log behind it, so it is not fabricated.
   */
  const groups = useMemo<TimelineGroup[]>(() => {
    const now = Date.now();
    const rows: TimelineEvent[] = [
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
  }, [notes, reminders]);

  /** The "20 Fri" chip tracks the next scheduled follow-up. */
  const followUp = useMemo(() => {
    const now = Date.now();
    const next = reminders
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

  const markConverted = () => {
    if (!lead || convert.isPending) return;
    convert.mutate(lead.id, { onSuccess: () => router.back() });
  };

  const timelineLoading = notesLoading || remindersLoading;

  return (
    <View style={styles.root}>
      <Screen height={CANVAS_H} background={BG} scroll>
        {/* =============================== Header ============================= */}
        {/* Button — 36pt #1F1A17 disc holding the 9.45pt back chevron. */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Feather name="chevron-left" size={16} color={WHITE} />
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
        <Pressable style={({ pressed }) => [styles.flag, pressed && styles.pressed]}>
          <Feather name="flag" size={18} color={INK_DARK} />
        </Pressable>

        {/* ========================== Identity card =========================== */}
        <Abs x={CARD_X} y={CARD_Y} w={CARD_W} h={CARD_H} radius={24} bg={CARD_FILL} style={styles.cardShadow}>
          <Txt
            x={24} y={24} w={156.14}
            size={24} weight="bold" font="inter" color={INK_TITLE} lineHeight={29.04}
            numberOfLines={1}
          >
            {lead?.contactPerson ?? lead?.brandName ?? ""}
          </Txt>
          <Txt
            x={24} y={57} w={156.14}
            size={14} weight="medium" font="inter" color={INK_SUB} lineHeight={16.94}
            numberOfLines={1}
          >
            {lead?.brandName ?? ""}
          </Txt>
          <Txt
            x={24} y={24} w={297}
            size={18} weight="bold" font="inter" color={INK_TITLE} lineHeight={21.78}
            align="right" numberOfLines={1}
          >
            {moneyLabel(lead?.money)}
          </Txt>

          {/* Two 27pt overlay chips — deal type, then pipeline status. */}
          <Abs x={24} y={86} h={27} row gap={8}>
            <View style={[styles.chip, { backgroundColor: GLASS_75 }]}>
              <Txt size={12} font="inter" color={INK_CHIP} lineHeight={14.52}>
                {label(lead?.dealType ?? "")}
              </Txt>
            </View>
            <View style={[styles.chip, { backgroundColor: CHIP_ALT }]}>
              <Txt size={12} font="inter" color={INK_CHIP} lineHeight={14.52}>
                {label(lead?.status ?? "")}
              </Txt>
            </View>
          </Abs>

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

        {/* ======================== Segmented control ========================= */}
        <Abs
          x={15} y={331} w={345} h={51} radius={999}
          bg={GLASS_65} border={WHITE} borderWidth={1}
        >
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

        {/* ======================= 1. Follow-Up Block ========================= */}
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
        <Abs x={20} y={469} w={335} h={50} radius={12} bg={GLASS_40}>
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
                    <Abs x={20} y={cardY + 10} w={24} h={24} radius={12} bg={GLASS_70} center>
                      <Feather name={row.icon} size={14} color={INK_BODY} />
                    </Abs>
                    <Abs x={60} y={cardY} w={295} h={62} radius={12} bg={WHITE}>
                      <Txt
                        x={17} y={13} w={261}
                        size={14} weight="semibold" font="inter" color={INK_BODY}
                        lineHeight={16.94} numberOfLines={1}
                      >
                        {row.title}
                      </Txt>
                      <Txt
                        x={17} y={34} w={261}
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

        {/* Loading / empty fill the first event slot — geometry never moves. */}
        {groups.length === 0 ? (
          <Abs x={60} y={GROUP_Y + ROW_Y} w={295} h={62} radius={12} bg={WHITE}>
            <Txt
              x={17} y={13} w={261}
              size={14} weight="semibold" font="inter" color={INK_BODY}
              lineHeight={16.94} numberOfLines={1}
            >
              {timelineLoading ? "Loading activity…" : "No activity yet"}
            </Txt>
          </Abs>
        ) : null}
      </Screen>

      {/* ===================== Action bar — pinned overlay ==================== */}
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
            disabled={convert.isPending}
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
  },

  /* identity card */
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
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
    shadowRadius: 6,
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
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /* follow-up block */
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
    shadowRadius: 2,
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
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  /* composer */
  input: {
    position: "absolute",
    left: 19,
    top: 15,
    width: 271,
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
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  /* timeline */
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
  followUpAction: { left: 20, backgroundColor: "rgba(255,255,255,0.6)" },
  convertAction: {
    left: 193.5,
    backgroundColor: CONVERT_FILL,
    shadowColor: CONVERT_FILL,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
