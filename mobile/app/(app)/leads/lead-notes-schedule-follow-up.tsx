import { useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen, Abs, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { useCreate, useLeads, useReminders } from "../../../src/api/hooks";
import type { Reminder } from "../../../src/api/hooks";

/**
 * Lead Detail — Notes & Activity, "Schedule Follow-Up" modal open.
 * Figma frame 7348:19497 "Leads notes" (375x875), traced 1:1.
 *
 * Two stacked layers, exactly as the frame is authored:
 *   1. the notes base layer (header, lead card, tab pills, follow-up strip,
 *      quick-note row, activity timeline) — inert here, it sits under the scrim;
 *   2. "Frame 2147223240" (0,-1 375x876, #b5b4b9 @57%) carrying the bottom sheet
 *      at y=428: date field, update picker, three quick presets and the Add CTA.
 *
 * Data gap: Reminder has no leadId (server/prisma/schema.prisma:285), so the
 * follow-up created here lands on the owner's reminder list rather than this
 * lead's timeline. Adding Reminder.leadId would close the loop — the timeline
 * below already reads from /reminders and would pick it up unchanged.
 */

/* ------------------------------ design tokens ----------------------------- */
const GLASS = "rgba(255,255,255,0.65)";
const GLASS_LINE = "rgba(255,255,255,0.9)";

const SHADOW_SOFT = {
  shadowColor: "#000000",
  shadowOpacity: 0.03,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;

const SHADOW_CARD = {
  shadowColor: "#000000",
  shadowOpacity: 0.02,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
} as const;

const SHADOW_CHIP = {
  shadowColor: "#000000",
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

/* --------------------------------- dates ---------------------------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfDay(d: Date): Date {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

/** "Thu, Jun 19" — the preset caption format. */
const longDate = (d: Date) => `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;

/** "06/19/2025" — what the mm/dd/yyyy field shows once a preset is picked. */
const slashDate = (d: Date) =>
  `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;

/** "20 Fri" — the follow-up strip's date chip. */
const dayWeekday = (d: Date) => `${d.getDate()} ${WEEKDAYS[d.getDay()]}`;

/** "10:00 am" */
function clock(d: Date): string {
  const h = d.getHours();
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(d.getMinutes()).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
}

/** "Today" / "Yesterday" / "Tomorrow" / "Mon, Jun 23" — timeline sub-caption. */
function dayLabel(d: Date, today: Date): string {
  const diff = Math.round((startOfDay(d).getTime() - startOfDay(today).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff === 1) return "Tomorrow";
  return longDate(d);
}

/** "PAID" -> "Paid", "CONTACTED" -> "Contacted". */
const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/* ----------------------------- timeline slots ----------------------------- */
type IconName = keyof typeof Ionicons.glyphMap;

/** Row geometry + per-row tint, straight from the frame. Rows 0-1 sit under
 *  "TODAY", rows 2-3 under "YESTERDAY"; the step inside a group is 74. */
const SLOTS: {
  y: number; tint: string; border: string; icon: IconName; iconColor: string;
}[] = [
  { y: 602, tint: "#ffe4e8", border: "rgba(255,228,232,0.9)", icon: "notifications-outline", iconColor: "#d81b60" },
  { y: 676, tint: "#ffeac4", border: "rgba(255,234,196,0.9)", icon: "calendar-outline", iconColor: "#e65100" },
  { y: 793, tint: "#e8eaf6", border: "rgba(232,234,246,0.9)", icon: "call-outline", iconColor: "#3949ab" },
  { y: 867, tint: "#e8f5e9", border: "rgba(232,245,233,0.9)", icon: "checkmark-circle-outline", iconColor: "#2e7d32" },
];

/* ------------------------------- presets ---------------------------------- */
/** Quick presets — geometry per button, offsets per the frame's Jun 19/20/26. */
const PRESETS = [
  {
    label: "Today", offset: 0, stroke: "#e4e4e4",
    x: 24, y: 524, w: 108, h: 69,
    labelX: 55.34, labelY: 538, labelW: 37.59,
    dateX: 44, dateY: 563, dateW: 59.85,
  },
  {
    label: "Tomorrow", offset: 1, stroke: "#d1d5db",
    x: 137, y: 523, w: 100, h: 69,
    labelX: 155, labelY: 537, labelW: 64.68,
    dateX: 159.34, dateY: 560.67, dateW: 52.92,
  },
  {
    label: "Next Week", offset: 7, stroke: "#d1d5db",
    x: 242, y: 524, w: 100, h: 69,
    labelX: 257, labelY: 539, labelW: 69.49,
    dateX: 261.25, dateY: 561.67, dateW: 59.85,
  },
] as const;

/* --------------------------------- screen --------------------------------- */
export default function LeadNotesScheduleFollowUpScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: leads } = useLeads();
  const { data: reminders } = useReminders();
  const create = useCreate<Reminder>("reminders");

  // Frozen at mount so the presets cannot renumber themselves mid-edit.
  const today = useMemo(() => new Date(), []);

  const lead = useMemo(
    () => (id ? leads?.find((l) => l.id === id) : undefined) ?? leads?.[0],
    [leads, id],
  );

  /** Upcoming reminders fill the TODAY group, past ones the YESTERDAY group. */
  const rows = useMemo(() => {
    const items = reminders ?? [];
    const dawn = startOfDay(today).getTime();
    const at = (r: Reminder) => new Date(r.dueAt).getTime();
    const upcoming = items.filter((r) => at(r) >= dawn).sort((a, b) => at(a) - at(b)).slice(0, 2);
    const past = items.filter((r) => at(r) < dawn).sort((a, b) => at(b) - at(a)).slice(0, 2);
    return [...upcoming, ...past].map((r, i) => ({
      reminder: r,
      slot: SLOTS[i < upcoming.length ? i : 2 + (i - upcoming.length)],
    }));
  }, [reminders, today]);

  /** The strip's date chip tracks the next follow-up on the books. */
  const nextDue = useMemo(() => {
    const next = (reminders ?? [])
      .map((r) => new Date(r.dueAt))
      .filter((d) => d.getTime() >= today.getTime())
      .sort((a, b) => a.getTime() - b.getTime())[0];
    return next ?? addDays(today, 1);
  }, [reminders, today]);

  const [dateText, setDateText] = useState("");
  const [update, setUpdate] = useState("");
  const [picked, setPicked] = useState<number | null>(null);

  const choosePreset = (i: number) => {
    setPicked(i);
    setDateText(slashDate(addDays(today, PRESETS[i].offset)));
  };

  const dueDate = useMemo(() => {
    if (picked !== null) return addDays(today, PRESETS[picked].offset);
    const parts = dateText.split("/");
    if (parts.length !== 3) return null;
    const [m, d, y] = parts.map((p) => Number(p));
    if (!m || !d || !y) return null;
    const parsed = new Date(y, m - 1, d, 9, 0, 0, 0);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [picked, dateText, today]);

  const canSubmit = !!dueDate && update.trim().length > 0 && !create.isPending;

  const submit = () => {
    if (!dueDate || !canSubmit) return;
    create.mutate(
      { title: update.trim(), dueAt: dueDate.toISOString() },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen height={875} background="#f7f0e4" scroll>
      {/* Frame fill: linear #f7f0e4 -> #f4ebdd */}
      <LinearGradient
        colors={["#f7f0e4", "#f4ebdd"] as const}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", left: 0, top: 0, width: 375, height: 875 }}
      />

      {/* ============================== Header ============================== */}
      <Abs
        x={15} y={18} w={44} h={44} radius={22}
        bg={GLASS} border={GLASS_LINE} borderWidth={1} style={SHADOW_SOFT}
      />
      <View style={{ position: "absolute", left: 27, top: 30 }}>
        <Ionicons name="chevron-back" size={20} color="#1c1c1e" />
      </View>
      <Txt
        x={71.5} y={30} w={235} size={16} weight="bold" font="inter"
        color="#1d1d1f" lineHeight={19.36} align="center"
      >
        Lead Detail
      </Txt>
      <Abs
        x={320} y={20} w={40} h={40} radius={20}
        bg={GLASS} border={GLASS_LINE} borderWidth={0.91} style={SHADOW_SOFT}
      />
      <View style={{ position: "absolute", left: 330, top: 30 }}>
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </View>

      {/* ============================ Lead card ============================= */}
      <LinearGradient
        colors={[
          "rgba(255,229,164,0.82)",
          "rgba(255,245,228,0.92)",
          "rgba(244,211,238,0.88)",
          "rgba(202,217,255,0.76)",
        ] as const}
        locations={[0, 0.35, 0.72, 1] as const}
        start={{ x: 0.11, y: -0.21 }}
        end={{ x: 0.89, y: 1.21 }}
        style={{
          position: "absolute", left: 15, top: 111, width: 345, height: 205,
          borderRadius: 24, ...SHADOW_CARD,
        }}
      />
      <Txt
        x={39} y={135} w={156.14} size={24} weight="bold" font="inter"
        color="#1d1d1f" lineHeight={29.04} numberOfLines={1}
      >
        {lead?.contactPerson ?? ""}
      </Txt>
      <Txt
        x={39} y={168} w={156.14} size={14} weight="medium" font="inter"
        color="#6e6e73" lineHeight={16.94} numberOfLines={1}
      >
        {lead?.brandName ?? ""}
      </Txt>
      <Txt
        x={290.42} y={135} w={45.58} size={18} weight="bold" font="inter"
        color="#1d1d1f" lineHeight={21.78} numberOfLines={1}
      >
        {lead?.money ?? ""}
      </Txt>

      <Abs x={39} y={197} w={49.17} h={27} radius={12} bg="rgba(193,63,186,0.1)" />
      <Txt
        x={51} y={203} w={25.17} size={12} weight="semibold" font="inter"
        color="#c13fba" lineHeight={14.52} numberOfLines={1}
      >
        {lead?.dealType ? titleCase(lead.dealType) : ""}
      </Txt>
      <Abs x={96.17} y={197} w={84.38} h={27} radius={12} bg="rgba(55,118,242,0.1)" />
      <Txt
        x={108.17} y={203} w={60.38} size={12} weight="semibold" font="inter"
        color="#3776f2" lineHeight={14.52} numberOfLines={1}
      >
        {lead?.status ? titleCase(lead.status) : ""}
      </Txt>

      {([
        { x: 39, ix: 51, icon: "call-outline" as IconName },
        { x: 95, ix: 107, icon: "chatbubble-outline" as IconName },
        { x: 151, ix: 163, icon: "mail-outline" as IconName },
      ]).map((b) => (
        <View key={b.x}>
          <Abs
            x={b.x} y={248} w={44} h={44} radius={22} bg="#ffffff"
            style={{ ...SHADOW_SOFT, shadowOpacity: 0.04 }}
          />
          <View style={{ position: "absolute", left: b.ix, top: 260 }}>
            <Ionicons name={b.icon} size={20} color="#1d1d1f" />
          </View>
        </View>
      ))}

      {/* ============================ Tab pills ============================= */}
      <Abs
        x={15} y={331} w={345} h={51} radius={999}
        bg={GLASS} border={GLASS_LINE} borderWidth={1}
      />
      <Txt
        x={72.39} y={348} w={62.72} size={14} weight="semibold" font="inter"
        color="#6c6c70" lineHeight={16.94} align="center"
      >
        Lead Info
      </Txt>
      <Abs
        x={187.5} y={336} w={167.5} h={41} radius={999}
        bg="rgba(255,255,255,0.9)"
        style={{ ...SHADOW_SOFT, shadowOpacity: 0.05 }}
      />
      <Txt
        x={217.07} y={348} w={108.36} size={14} weight="semibold" font="inter"
        color="#1c1c1e" lineHeight={16.94} align="center"
      >
        Notes &amp; Activity
      </Txt>

      {/* ======================== 1. Follow-Up Block ======================== */}
      <Abs
        x={15} y={397} w={345} h={58} radius={12}
        bg="rgba(255,235,222,0.7)" border="rgba(255,218,196,0.8)" borderWidth={1}
      />
      <Abs x={28} y={410} w={60.3} h={32} radius={6} bg="#ffffff" style={SHADOW_CARD} />
      <Txt
        x={40} y={418} w={36.3} size={13} weight="bold" font="inter"
        color="#c05e23" lineHeight={15.73} numberOfLines={1}
      >
        {dayWeekday(nextDue)}
      </Txt>
      <Txt
        x={100.3} y={417} w={186.22} size={15} weight="semibold" font="inter"
        color="#1c1c1e" lineHeight={18.15}
      >
        Add Follow-Up
      </Txt>
      <Abs x={286.52} y={410} w={60.48} h={32} radius={999} bg="#ffffff" style={SHADOW_CHIP} />
      <Txt
        x={302.52} y={418} w={28.48} size={13} weight="bold" font="inter"
        color="#1c1c1e" lineHeight={15.73}
      >
        ADD
      </Txt>

      {/* =========================== 2. Add Note =========================== */}
      <Abs
        x={20} y={474} w={335} h={50} radius={12}
        bg="rgba(255,255,255,0.4)" border="rgba(255,255,255,0.7)" borderWidth={1}
      />
      <Txt
        x={39} y={490} w={271} size={15} weight="regular" font="inter"
        color="#6c6c70" lineHeight={18.15}
      >
        Add a quick note...
      </Txt>
      <Abs x={312} y={481} w={36} h={36} radius={18} bg="#ffffff" style={SHADOW_CHIP} />
      <View style={{ position: "absolute", left: 322, top: 491 }}>
        <Ionicons name="arrow-up" size={16} color="#1c1c1e" />
      </View>

      {/* ======================= 3. Activity Timeline ======================= */}
      <LinearGradient
        colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.08)", "rgba(0,0,0,0)"] as const}
        locations={[0, 0.8, 1] as const}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", left: 31, top: 607, width: 2, height: 326 }}
      />
      <Txt
        x={60} y={571} w={295} size={12} weight="bold" font="inter"
        color="#6c6c70" lineHeight={14.52} letterSpacing={0.6}
      >
        TODAY
      </Txt>
      <Txt
        x={60} y={762} w={295} size={12} weight="bold" font="inter"
        color="#6c6c70" lineHeight={14.52} letterSpacing={0.6}
      >
        YESTERDAY
      </Txt>
      {rows.map(({ reminder, slot }) => {
        const due = new Date(reminder.dueAt);
        return (
          <View key={reminder.id}>
            <Abs x={20} y={slot.y + 10} w={24} h={24} radius={12} bg={slot.tint} />
            <View style={{ position: "absolute", left: 25, top: slot.y + 15 }}>
              <Ionicons name={slot.icon} size={14} color={slot.iconColor} />
            </View>
            <Abs
              x={60} y={slot.y} w={295} h={62} radius={12}
              bg="#ffffff" border={slot.border} borderWidth={1}
            />
            <Txt
              x={77} y={slot.y + 13} w={261} size={14} weight="semibold" font="inter"
              color="#1c1c1e" lineHeight={16.94} numberOfLines={1}
            >
              {reminder.title}
            </Txt>
            <Txt
              x={77} y={slot.y + 34} w={261} size={12} weight="medium" font="inter"
              color="#6c6c70" lineHeight={14.52} numberOfLines={1}
            >
              {`${dayLabel(due, today)} • ${clock(due)}`}
            </Txt>
          </View>
        );
      })}

      {/* ====================== Scrim + follow-up sheet ===================== */}
      <Pressable
        onPress={() => router.back()}
        style={{
          position: "absolute", left: 0, top: -1, width: 375, height: 876,
          backgroundColor: "rgba(181,180,185,0.57)",
        }}
      />

      <Abs
        x={0} y={428} w={375} h={447} bg="#ffffff"
        style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
      />
      <Abs x={167.5} y={444} w={40} h={4} radius={2} bg="#e5e5e5" />
      <Txt
        x={24} y={472} w={280} size={24} weight="semibold" font="inter"
        color="#111111" lineHeight={29.05} letterSpacing={-0.52}
      >
        Schedule Follow - Up
      </Txt>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          position: "absolute", left: 315, top: 472, width: 36, height: 36,
          borderRadius: 18, backgroundColor: "#f8f8f8",
          alignItems: "center", justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Ionicons name="close" size={20} color="#555555" />
      </Pressable>

      {/* --------------------------- Quick presets -------------------------- */}
      {PRESETS.map((p, i) => {
        const on = picked === i;
        return (
          <Pressable
            key={p.label}
            onPress={() => choosePreset(i)}
            style={({ pressed }) => ({
              position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h,
              borderRadius: 8, borderWidth: 1, borderColor: p.stroke,
              backgroundColor: on ? "#f8f8f8" : "transparent",
              opacity: pressed ? 0.7 : 1,
            })}
          />
        );
      })}
      {PRESETS.map((p, i) => {
        const d = addDays(today, p.offset);
        return (
          <View key={`${p.label}-text`} pointerEvents="none">
            <Txt
              x={p.labelX} y={p.labelY} w={p.labelW} size={11.9} weight="medium" font="inter"
              color="#374151" lineHeight={20} align="center"
            >
              {p.label}
            </Txt>
            <Txt
              x={p.dateX} y={p.dateY} w={p.dateW} size={10.2} weight="regular" font="inter"
              color={picked === i ? "#374151" : "#6b7280"} lineHeight={16} align="center"
            >
              {longDate(d)}
            </Txt>
          </View>
        );
      })}

      {/* ---------------------------- Date field ---------------------------- */}
      <Abs
        x={24} y={611} w={327} h={52} radius={20}
        bg="rgba(255,255,255,0.8)" border="#e8e8e8" borderWidth={1} style={SHADOW_CARD}
      />
      <TextInput
        value={dateText}
        onChangeText={(t) => {
          setDateText(t);
          setPicked(null);
        }}
        placeholder="mm/dd/yyyy"
        placeholderTextColor="#000000"
        keyboardType="numbers-and-punctuation"
        style={{
          position: "absolute", left: 45, top: 629, width: 101, height: 16,
          padding: 0, textAlign: "center",
          fontFamily: fonts.interMedium, fontSize: 14, lineHeight: 16, color: "#000000",
        }}
      />
      <View style={{ position: "absolute", left: 307, top: 625 }} pointerEvents="none">
        <Ionicons name="calendar-outline" size={24} color="#6b7280" />
      </View>

      {/* --------------------------- Update picker -------------------------- */}
      <Txt
        x={28} y={681} w={323} size={14} weight="medium" font="inter"
        color="#6b7280" lineHeight={16.94}
      >
        Set an Update
      </Txt>
      <Abs
        x={24} y={706} w={327} h={52} radius={20}
        bg="rgba(255,255,255,0.8)" border="#e5e5e5" borderWidth={1} style={SHADOW_CARD}
      />
      <TextInput
        value={update}
        onChangeText={setUpdate}
        placeholder="Select an Update"
        placeholderTextColor="#111827"
        style={{
          position: "absolute", left: 45, top: 723, width: 268, height: 18,
          padding: 0,
          fontFamily: fonts.interMedium, fontSize: 15, lineHeight: 18.15, color: "#111827",
        }}
      />
      <View style={{ position: "absolute", left: 313, top: 722 }} pointerEvents="none">
        <Ionicons name="chevron-down" size={20} color="#6b7280" />
      </View>

      {/* -------------------------------- CTA ------------------------------- */}
      <Pressable
        onPress={submit}
        disabled={!canSubmit}
        style={({ pressed }) => ({
          position: "absolute", left: 37, top: 784, width: 301, height: 55,
          borderRadius: 100, backgroundColor: "#312b28",
          alignItems: "center", justifyContent: "center",
          opacity: canSubmit ? (pressed ? 0.9 : 1) : 0.5,
        })}
      >
        <Txt
          x={134.5} y={18} w={32} size={16} weight="bold" font="inter"
          color="#ffffff" lineHeight={19.36} align="center"
        >
          Add
        </Txt>
      </Pressable>
    </Screen>
  );
}
