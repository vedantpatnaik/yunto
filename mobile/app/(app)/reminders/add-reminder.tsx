import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen, Abs, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { useCreate } from "../../../src/api/hooks";
import type { Reminder } from "../../../src/api/hooks";

/**
 * Add Reminder — Figma frame 7358:26384 (375x875), traced 1:1.
 *
 * One glass panel (15,106 345x671) holds the whole form: title, details,
 * priority segments, quick-date cards and a horizontally scrolling day strip
 * that overflows the panel's clip box (tiles run to x=489). The dates shown in
 * the design ("12 Mar", "MON 12", ...) are sample values — they are derived
 * from the device clock here, so the frame's selected states (today + medium)
 * are the component's initial state.
 */

/* ------------------------------ design tokens ----------------------------- */
const GREEN = ["#c8f0d7e5", "#b4e6c8e5"] as const;
const ORANGE = ["#ffebd2e5", "#ffd2a0e5"] as const;
const GLASS_FILL = "rgba(255,255,255,0.6)";
const GLASS_LINE = "rgba(255,255,255,0.8)";

/* --------------------------------- dates ---------------------------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
/** "12 Mar" — the format the quick-date cards use. */
const dayMonth = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/* -------------------------------- primitives ------------------------------ */
/**
 * A selectable card. Selected cards carry the design's gradient + solid white
 * hairline; unselected ones are the translucent glass chip.
 */
function Tile({
  x, y, w, h, radius, selected, gradient, onPress, children,
}: {
  x: number; y: number; w: number; h: number; radius: number;
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
            borderRadius: radius, borderWidth: 1, borderColor: "#ffffff",
          }}
        />
      ) : (
        <View
          style={{
            position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
            borderRadius: radius, borderWidth: 1,
            borderColor: GLASS_LINE, backgroundColor: GLASS_FILL,
          }}
        />
      )}
      {children}
    </Pressable>
  );
}

/** Section label — "Task Title", "Priority", "Date", "Or Select Date". */
const Label = ({ y, children }: { y: number; children: string }) => (
  <Txt
    x={35} y={y} w={309} size={15} weight="bold" font="inter"
    color="#2b2240" lineHeight={18.15} letterSpacing={-0.2}
  >
    {children}
  </Txt>
);

/* --------------------------------- screen --------------------------------- */
const PRIORITIES = [
  { key: "low", label: "Low", x: 31 },
  { key: "medium", label: "Medium", x: 139.33 },
  { key: "high", label: "High", x: 247.67 },
] as const;
type Priority = (typeof PRIORITIES)[number]["key"];

/** Quick-date presets: today, tomorrow, next week (frame shows 12/13/19 Mar). */
const QUICK = [
  { offset: 0, label: "Today", x: 45, w: 86.67, dateY: 38 },
  { offset: 1, label: "Tomorrow", x: 143.67, w: 87.66, dateY: 38 },
  { offset: 7, label: "Next\nWeek", x: 243.33, w: 86.67, dateY: 55 },
] as const;

export default function AddReminderScreen() {
  const router = useRouter();
  const create = useCreate<Reminder>("reminders");

  // Frozen at mount so the strip cannot renumber itself mid-edit.
  const today = useMemo(() => new Date(), []);
  const strip = useMemo(() => [0, 1, 2, 3, 4, 5].map((i) => addDays(today, i)), [today]);

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [due, setDue] = useState<Date>(today);

  const canSubmit = title.trim().length > 0 && !create.isPending;

  const submit = () => {
    if (!canSubmit) return;
    create.mutate(
      { title: title.trim(), dueAt: due.toISOString() },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen height={875} background="#f7f0e4" scroll>
      {/* Frame fill: linear #f7f0e4 -> #f4ebdd */}
      <LinearGradient
        colors={["#f7f0e4", "#f4ebdd"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", left: 0, top: 0, width: 375, height: 875 }}
      />

      {/* ------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          position: "absolute", left: 15, top: 18, width: 44, height: 44,
          borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.9)",
          backgroundColor: "rgba(255,255,255,0.65)",
          alignItems: "center", justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Ionicons name="chevron-back" size={20} color="#1c1c1e" />
      </Pressable>
      <Txt
        x={114} y={30} w={154} size={16} weight="bold" font="inter"
        color="#1d1d1f" lineHeight={19.36} align="center"
      >
        Add Reminder
      </Txt>

      {/* ---------------------------- Glass panel ---------------------------- */}
      <Abs
        x={15} y={106} w={345} h={671} radius={32}
        bg="rgba(255,255,255,0.55)" border="rgba(255,255,255,0.8)" borderWidth={1}
        style={{
          shadowColor: "#1e1432", shadowOpacity: 0.04,
          shadowRadius: 40, shadowOffset: { width: 0, height: 16 }, elevation: 2,
        }}
      />

      {/* ------------------------------ Task Title --------------------------- */}
      <Label y={127}>Task Title</Label>
      <Abs
        x={31} y={155} w={313} h={54} radius={20}
        bg="rgba(255,255,255,0.7)" border="rgba(255,255,255,0.9)" borderWidth={1}
      >
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
          placeholderTextColor="#9a91a8"
          style={{
            position: "absolute", left: 20, top: 14, width: 271, height: 24,
            padding: 0, fontFamily: fonts.inter, fontSize: 16, color: "#2b2240",
          }}
        />
      </Abs>

      {/* ----------------------------- Task Details -------------------------- */}
      <Label y={237}>Task Details</Label>
      <Abs
        x={31} y={265} w={313} h={120} radius={24}
        bg="rgba(255,255,255,0.7)" border="rgba(255,255,255,0.9)" borderWidth={1}
      >
        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder="Describe reminder details..."
          placeholderTextColor="#9a91a8"
          multiline
          textAlignVertical="top"
          style={{
            position: "absolute", left: 20, top: 14, width: 271, height: 90,
            padding: 0, fontFamily: fonts.inter, fontSize: 16, color: "#2b2240",
            lineHeight: 19.36,
          }}
        />
      </Abs>

      {/* ------------------------------- Priority ---------------------------- */}
      <Label y={413}>Priority</Label>
      {PRIORITIES.map((p) => {
        const on = priority === p.key;
        return (
          <Tile
            key={p.key}
            x={p.x} y={441} w={96.33} h={47} radius={20}
            selected={on} gradient={ORANGE}
            onPress={() => setPriority(p.key)}
          >
            <Txt
              x={0} y={15} w={96.33} size={14} weight="bold" font="inter"
              color={on ? "#884400" : "#6b627a"} lineHeight={16.94} align="center"
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
        const on = sameDay(due, d);
        return (
          <Tile
            key={q.label}
            x={q.x} y={544} w={q.w} h={87} radius={20}
            selected={on} gradient={GREEN}
            onPress={() => setDue(d)}
          >
            <Txt
              x={0} y={17} w={q.w} size={14} weight="bold" font="inter"
              color={on ? "#1f4d33" : "#2b2240"} lineHeight={16.94} align="center"
            >
              {q.label}
            </Txt>
            <Txt
              x={0} y={q.dateY} w={q.w} size={12} weight="semibold" font="inter"
              color={on ? "#1f4d33" : "#6b627a"} lineHeight={14.52} align="center"
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
        style={{ position: "absolute", left: 31, top: 687, width: 313, height: 81 }}
        contentContainerStyle={{ width: 458, height: 81 }}
      >
        {strip.map((d, i) => {
          const on = sameDay(due, d);
          return (
            <Tile
              key={d.toDateString()}
              x={i * 78} y={0} w={68} h={73} radius={20}
              selected={on} gradient={GREEN}
              onPress={() => setDue(d)}
            >
              <Txt
                x={0} y={15} w={68} size={13} weight="semibold" font="inter"
                color={on ? "#1f4d33" : "#6b627a"} lineHeight={15.73}
                letterSpacing={0.5} align="center"
              >
                {WEEKDAYS[d.getDay()]}
              </Txt>
              <Txt
                x={0} y={37} w={68} size={18} weight="bold" font="inter"
                color={on ? "#1f4d33" : "#2b2240"} lineHeight={21.78} align="center"
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
          borderRadius: 36, backgroundColor: "#312b28",
          alignItems: "center", justifyContent: "center",
          opacity: canSubmit ? (pressed ? 0.9 : 1) : 0.5,
          shadowColor: "#312b28", shadowOpacity: 0.25,
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
