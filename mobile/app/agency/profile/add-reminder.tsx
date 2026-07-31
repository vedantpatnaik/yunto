import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { useCreate, useMe, type Reminder } from "../../../src/api/hooks";

/**
 * Add Reminders — Figma frame 7711:22629 (375x876), traced 1:1.
 *
 * The agency-side reminder composer. A dark 36pt back button and the "Add
 * Reminders" heading sit in the 80pt header band; everything else lives in one
 * frosted card (15,106 345x671) — Task Title, Task Details, a 3-up Priority
 * segment, three quick-date chips and a horizontal weekday strip whose tiles
 * (68x73, 78pt step) run to x=489 and are clipped by the card at 313 wide.
 *
 * This frame supersedes the legacy 946 "Create Task" screen: the CTA reads
 * "Create Reminder" and the old Due Date scroller is now the weekday strip.
 *
 * The dates the design draws ("12 Mar", "MON 12" … "SAT 17") are sample values.
 * They are derived from the device clock here, which makes the frame's own
 * selected states — Today, the first strip tile, Medium — the initial state.
 *
 * Prisma's Reminder carries title / dueAt / ownerId / done only. Task Details
 * and Priority have no column, so those two controls are form state and are not
 * sent with the POST; title + dueAt + the signed-in user as owner are.
 *
 * Geist is not one of the two faces registered in app/_layout.tsx, so the
 * heading renders in Inter, the dominant family in this frame.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* -------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

/** Weekday strip: 68pt tiles on a 78pt step, clipped by the card at 313 wide. */
const STRIP_X = 31;
const STRIP_Y = 687;
const STRIP_W = 313;
const STRIP_H = 81;
const TILE_W = 68;
const TILE_H = 73;
const TILE_STEP = 78;
const STRIP_DAYS = 6;

/* ------------------------------ spec colours ------------------------------ */
const PAGE_BG = "#f8f5ef";
const HEADER_INK = "#141311";
const BACK_BG = "#1f1a17";
const BACK_INK = "#faf7f2";
const LABEL_INK = "#2b2240";
const PLACEHOLDER = "#9a91a8";
const MUTED = "#6b627a";
const PRIORITY_ON_INK = "#884400";
const DATE_ON_INK = "#1f4d33";
const CTA_BG = "#312b28";

const CARD_FILL = "rgba(255,255,255,0.55)";
const CARD_LINE = "rgba(255,255,255,0.8)";
const FIELD_FILL = "rgba(255,255,255,0.7)";
const FIELD_LINE = "rgba(255,255,255,0.9)";
const GLASS_FILL = "rgba(255,255,255,0.6)";
const GLASS_LINE = "rgba(255,255,255,0.8)";

/** Selected-tile gradients: orange for Priority, green for every date control. */
const ORANGE = ["#ffebd2e5", "#ffd2a0e5"] as const;
const GREEN = ["#c8f0d7e5", "#b4e6c8e5"] as const;

/* --------------------------------- dates ---------------------------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
/** "12 Mar" — the format the quick-date chips print under their label. */
const dayMonth = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/* -------------------------------- primitives ------------------------------ */
/**
 * A selectable card. Selected cards take the design's gradient plus its solid
 * white hairline and the tinted halo the frame drops under them (0,8 / 24);
 * unselected ones are the translucent glass chip.
 */
function Tile({
  x, y, w, h, selected, gradient, onPress, children,
}: {
  x: number; y: number; w: number; h: number;
  selected: boolean; gradient: readonly [string, string];
  onPress: () => void; children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute", left: x, top: y, width: w, height: h,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {selected ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
            borderRadius: 20, borderWidth: 1, borderColor: "#ffffff",
            shadowColor: gradient[1].slice(0, 7), shadowOpacity: 0.5,
            shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 3,
          }}
        />
      ) : (
        <View
          style={{
            position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
            borderRadius: 20, borderWidth: 1,
            borderColor: GLASS_LINE, backgroundColor: GLASS_FILL,
          }}
        />
      )}
      {children}
    </Pressable>
  );
}

/** Section label — Task Title / Task Details / Priority / Date / Or Select Date. */
const Label = ({ y, children }: { y: number; children: string }) => (
  <Txt
    x={35} y={y} w={309} size={15} weight="bold" font="inter"
    color={LABEL_INK} lineHeight={18.15} letterSpacing={-0.2}
  >
    {children}
  </Txt>
);

/* ------------------------------- taxonomies ------------------------------- */
const PRIORITIES = [
  { key: "low", label: "Low", x: 31 },
  { key: "medium", label: "Medium", x: 139.33 },
  { key: "high", label: "High", x: 247.67 },
] as const;
type Priority = (typeof PRIORITIES)[number]["key"];

/** Quick-date chips — the frame draws them as 12 / 13 / 19 Mar. */
const QUICK = [
  { offset: 0, label: "Today", x: 45, w: 86.67, dateY: 38 },
  { offset: 1, label: "Tomorrow", x: 143.67, w: 87.66, dateY: 38 },
  { offset: 7, label: "Next\nWeek", x: 243.33, w: 86.67, dateY: 55 },
] as const;

/* --------------------------------- screen --------------------------------- */
export default function AgencyAddReminderScreen() {
  const router = useRouter();
  const create = useCreate<Reminder>("reminders");
  const { data: me } = useMe();

  // Frozen at mount so the strip cannot renumber itself mid-edit.
  const today = useMemo(() => new Date(), []);
  const strip = useMemo(
    () => Array.from({ length: STRIP_DAYS }, (_, i) => addDays(today, i)),
    [today],
  );

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [due, setDue] = useState<Date | null>(today);

  /* Title and a date are both required; the frame ships with today selected. */
  const canSubmit = title.trim().length > 0 && due !== null && !create.isPending;

  const submit = () => {
    if (!canSubmit || !due) return;
    create.mutate(
      { title: title.trim(), dueAt: due.toISOString(), ...(me ? { ownerId: me.id } : null) },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen height={FRAME_H} background={PAGE_BG} scroll>
      {/* ------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          position: "absolute", left: 16, top: 22, width: 36, height: 36,
          borderRadius: 18, backgroundColor: BACK_BG,
          alignItems: "center", justifyContent: "center",
          opacity: pressed ? 0.8 : 1,
          shadowColor: "#000000", shadowOpacity: 0.1,
          shadowRadius: 2.7, shadowOffset: { width: 0, height: 0.9 }, elevation: 2,
        })}
      >
        <Ionicons name="arrow-back" size={16} color={BACK_INK} />
      </Pressable>
      <Txt
        x={72} y={28} w={222} size={20} weight="medium" font="inter"
        color={HEADER_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Add Reminders
      </Txt>

      {/* ---------------------------- Frosted card --------------------------- */}
      <Abs
        x={15} y={106} w={345} h={671} radius={32}
        bg={CARD_FILL} border={CARD_LINE} borderWidth={1}
        style={{
          shadowColor: "#1e1432", shadowOpacity: 0.04,
          shadowRadius: 40, shadowOffset: { width: 0, height: 16 }, elevation: 2,
        }}
      />

      {/* ------------------------------ Task Title --------------------------- */}
      <Label y={127}>Task Title</Label>
      <Abs
        x={31} y={155} w={313} h={54} radius={20}
        bg={FIELD_FILL} border={FIELD_LINE} borderWidth={1}
      >
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
          placeholderTextColor={PLACEHOLDER}
          style={{
            position: "absolute", left: 21, top: 16, width: 271, height: 22,
            padding: 0, fontFamily: fonts.inter, fontSize: 16, color: LABEL_INK,
          }}
        />
      </Abs>

      {/* ----------------------------- Task Details -------------------------- */}
      {/* Form-only: Reminder has no detail column, so this is not POSTed. */}
      <Label y={237}>Task Details</Label>
      <Abs
        x={31} y={265} w={313} h={120} radius={24}
        bg={FIELD_FILL} border={FIELD_LINE} borderWidth={1}
      >
        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder="Describe reminder details..."
          placeholderTextColor={PLACEHOLDER}
          multiline
          textAlignVertical="top"
          style={{
            position: "absolute", left: 21, top: 16, width: 271, height: 88,
            padding: 0, fontFamily: fonts.inter, fontSize: 16, color: LABEL_INK,
            lineHeight: 19.36,
          }}
        />
      </Abs>

      {/* ------------------------------- Priority ---------------------------- */}
      {/* Form-only: Reminder has no priority column, so this is not POSTed. */}
      <Label y={413}>Priority</Label>
      {PRIORITIES.map((p) => {
        const on = priority === p.key;
        return (
          <Tile
            key={p.key}
            x={p.x} y={441} w={96.33} h={47}
            selected={on} gradient={ORANGE}
            onPress={() => setPriority(p.key)}
          >
            <Txt
              x={0} y={15} w={96.33} size={14} weight="bold" font="inter"
              color={on ? PRIORITY_ON_INK : MUTED} lineHeight={16.94} align="center"
            >
              {p.label}
            </Txt>
          </Tile>
        );
      })}

      {/* -------------------------- Quick Date Selection --------------------- */}
      <Label y={516}>Date</Label>
      {QUICK.map((q) => {
        const d = addDays(today, q.offset);
        const on = due !== null && sameDay(due, d);
        return (
          <Tile
            key={q.label}
            x={q.x} y={544} w={q.w} h={87}
            selected={on} gradient={GREEN}
            onPress={() => setDue(d)}
          >
            <Txt
              x={0} y={17} w={q.w} size={14} weight="bold" font="inter"
              color={on ? DATE_ON_INK : LABEL_INK} lineHeight={16.94} align="center"
            >
              {q.label}
            </Txt>
            <Txt
              x={0} y={q.dateY} w={q.w} size={12} weight="semibold" font="inter"
              color={on ? DATE_ON_INK : MUTED} lineHeight={14.52} align="center"
            >
              {dayMonth(d)}
            </Txt>
          </Tile>
        );
      })}

      {/* --------------------------- Custom Due Date ------------------------- */}
      <Label y={659}>Or Select Date</Label>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          position: "absolute", left: STRIP_X, top: STRIP_Y,
          width: STRIP_W, height: STRIP_H,
        }}
        contentContainerStyle={{
          width: (STRIP_DAYS - 1) * TILE_STEP + TILE_W, height: STRIP_H,
        }}
      >
        {strip.map((d, i) => {
          const on = due !== null && sameDay(due, d);
          return (
            <Tile
              key={d.toDateString()}
              x={i * TILE_STEP} y={0} w={TILE_W} h={TILE_H}
              selected={on} gradient={GREEN}
              onPress={() => setDue(d)}
            >
              <Txt
                x={0} y={15} w={TILE_W} size={13} weight="semibold" font="inter"
                color={on ? DATE_ON_INK : MUTED} lineHeight={15.73}
                letterSpacing={0.5} align="center"
              >
                {WEEKDAYS[d.getDay()]}
              </Txt>
              <Txt
                x={0} y={37} w={TILE_W} size={18} weight="bold" font="inter"
                color={on ? DATE_ON_INK : LABEL_INK} lineHeight={21.78} align="center"
              >
                {`${d.getDate()}`}
              </Txt>
            </Tile>
          );
        })}
      </ScrollView>

      {/* ----------------------------- Floating CTA -------------------------- */}
      <Pressable
        onPress={submit}
        disabled={!canSubmit}
        style={({ pressed }) => ({
          position: "absolute", left: 71, top: 792, width: 232, height: 55,
          borderRadius: 36, backgroundColor: CTA_BG,
          alignItems: "center", justifyContent: "center",
          opacity: canSubmit ? (pressed ? 0.9 : 1) : 0.5,
          shadowColor: CTA_BG, shadowOpacity: 0.25,
          shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 6,
        })}
      >
        <Txt
          x={0} y={18} w={232} size={16} weight="semibold" font="inter"
          color="#ffffff" lineHeight={19.36} align="center"
        >
          Create Reminder
        </Txt>
      </Pressable>
    </Screen>
  );
}
