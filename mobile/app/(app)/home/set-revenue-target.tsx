import { useState } from "react";
import type { ReactNode } from "react";
import { Alert, Image, Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen, Abs, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { useMe, useLeads, useInvoices, useUpdateMe, compact, inr } from "../../../src/api/hooks";

/**
 * Set Revenue Target — Figma frame 7348:18113 (375x875), traced 1:1.
 *
 * The modal-open state of Home: the live dashboard, a full-bleed #b5b4b9 @57%
 * scrim, and a 383pt bottom sheet at y=493. The backdrop is the same home frame
 * (`Frame 2147223252`), which clips at 375x652 from y=106 — so only the Priority
 * Now / Today's Summary / Lead Pipeline blocks are inside the clip box and get
 * drawn; everything the design places below y=758 is clipped by Figma and is
 * omitted here for the same reason. Below y=493 the opaque sheet covers the rest.
 *
 * Space Grotesk (headings) and Roboto are not registered faces in this app —
 * those nodes fall back to Outfit, the primary family; every other node keeps
 * the spec's family, size, weight, line-height and tracking verbatim.
 */

/* ------------------------------ design tokens ----------------------------- */
const INK = "#1f1a17";
const MUTED = "#8b7e73";
const NAV_OFF = "#9a8ea3";
const NAV_ON = "#b88bff";

/** Frame fill: linear #f7f0e4 -> #f4ebdd (the four radial washes sit under the scrim). */
const PAGE = ["#f7f0e4", "#f4ebdd"] as const;

/** Lead-pipeline card gradients, in the design's grid order. */
const PIPELINE = [
  {
    key: "unattended",
    x: 15, y: 416.25, bubbleX: 134.5, textX: 32,
    grad: ["#ffe28ab8", "#fff8eceb"] as const,
    icon: "alert-circle-outline" as const,
    label: "Unattended",
    caption: "Needs response",
  },
  {
    key: "new",
    x: 193.5, y: 416.25, bubbleX: 313, textX: 210.5,
    grad: ["#dde8b9b8", "#f8fceeeb"] as const,
    icon: "sparkles-outline" as const,
    label: "New",
    caption: null,
  },
  {
    key: "contacted",
    x: 15, y: 540.25, bubbleX: 134.5, textX: 32,
    grad: ["#e5daefdb", "#f9f4fcf0"] as const,
    icon: "call-outline" as const,
    label: "Contacted",
    caption: null,
  },
  {
    key: "won",
    x: 193.5, y: 540.25, bubbleX: 313, textX: 210.5,
    grad: ["#bfd3ffb8", "#f5f9ffeb"] as const,
    icon: "trophy-outline" as const,
    label: "Won",
    caption: null,
  },
] as const;

/** Bottom-tab items — chrome, so the captions stay literal. */
const TABS = [
  { key: "home", iconX: 46.62, icon: "home-outline" as const, on: true, label: "Home", labelX: 48.09, labelW: 31.08 },
  { key: "leads", iconX: 103.88, icon: "people-outline" as const, on: false, label: "Leads", labelX: 104.99, labelW: 31.77 },
  { key: "planner", iconX: 237.12, icon: "calendar-outline" as const, on: false, label: "Planner", labelX: 234.12, labelW: 40 },
  { key: "reminder", iconX: 294.38, icon: "alarm-outline" as const, on: false, label: "Reminder", labelX: 285.88, labelW: 51 },
] as const;

/** revenueGoal.frequencyOptions — the sheet's dropdown cycles these in order. */
const FREQUENCIES = ["Monthly", "Weekly", "Yearly"] as const;
type Frequency = (typeof FREQUENCIES)[number];

/**
 * How many of each period fit in a year. `User` stores only targetMonthly and
 * targetYearly, so the entered figure is normalised to an annual amount on the
 * way out and divided back into the selected period on the way in. That is also
 * what gives "Weekly" — which has no column of its own — a real, round-tripping
 * home instead of a value that vanishes on close.
 */
const PER_YEAR: Record<Frequency, number> = { Monthly: 12, Weekly: 52, Yearly: 1 };

/* -------------------------------- helpers --------------------------------- */
/** The design writes single-digit pipeline counts as "06". */
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/* ------------------------------- primitives ------------------------------- */
/** A gradient-filled Figma FRAME with a white hairline and the card drop shadow. */
function GradCard({
  x, y, w, h, radius, colors, children,
}: {
  x: number; y: number; w: number; h: number; radius: number;
  colors: readonly [string, string]; children?: ReactNode;
}) {
  return (
    <View
      style={{
        position: "absolute", left: x, top: y, width: w, height: h,
        shadowColor: "#4a3722", shadowOpacity: 0.06,
        shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 2,
      }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
          borderRadius: radius, borderWidth: 1, borderColor: "#ffffff",
        }}
      />
      {children}
    </View>
  );
}

/** Today's Summary tile — 130x110, value / label / delta chip. */
function SummaryCard({
  x, colors, value, label, chipX, chipW, chipBg, tint, delta, deltaX, deltaW,
}: {
  x: number; colors: readonly [string, string]; value: string; label: string;
  chipX: number; chipW: number; chipBg: string; tint: string;
  delta: string; deltaX: number; deltaW: number;
}) {
  return (
    <>
      <GradCard x={x} y={0} w={130} h={110} radius={20} colors={colors} />
      <Txt x={x + 17} y={17} size={26} weight="bold" font="inter" color="#1a1a1a" lineHeight={26}>
        {value}
      </Txt>
      <Txt x={x + 17} y={47} size={13} weight="medium" font="inter" color="#666666" lineHeight={15.73}>
        {label}
      </Txt>
      <Abs x={chipX} y={71} w={chipW} h={22} radius={100} bg={chipBg} />
      <Ionicons
        name="trending-up-outline" size={12} color={tint}
        style={{ position: "absolute", left: chipX + 8, top: 76 }}
      />
      <Txt x={deltaX} y={75} w={deltaW} size={11} weight="semibold" font="inter" color={tint} lineHeight={13.31}>
        {delta}
      </Txt>
    </>
  );
}

/** Sheet field label — 14/500 Inter, 4pt left pad off the 24pt gutter. */
const FieldLabel = ({ y, children }: { y: number; children: string }) => (
  <Txt x={28} y={y} w={323} size={14} weight="medium" font="inter" color="#6b7280" lineHeight={16.94}>
    {children}
  </Txt>
);

/* --------------------------------- screen --------------------------------- */
export default function SetRevenueTargetScreen() {
  const router = useRouter();

  const { data: me } = useMe();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const saveTarget = useUpdateMe();

  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  /** null until the field is touched, so the prefill can follow the frequency. */
  const [typed, setTyped] = useState<string | null>(null);

  const rows = leads ?? [];
  const unattended = rows.filter((l) => l.status === "NEW" && l.intent === "HIGH").length;
  const newLeads = rows.filter((l) => l.status === "NEW").length;
  const contacted = rows.filter((l) => l.status === "CONTACTED").length;
  const won = rows.filter((l) => l.status === "CONVERTED").length;
  const counts: Record<string, number> = { unattended, new: newLeads, contacted, won };

  const paid = (invoices ?? []).filter((i) => i.status === "PAID").reduce((s, i) => s + i.payout, 0);

  // revenueGoal.current — the saved target, re-expressed in the selected period,
  // so opening the sheet shows what is already stored. targetYearly is the source
  // of truth; targetMonthly backfills a row that only ever had a monthly figure.
  const storedYearly =
    me?.targetYearly ?? (me?.targetMonthly != null ? me.targetMonthly * 12 : null);
  const stored = storedYearly != null ? Math.round(storedYearly / PER_YEAR[frequency]) : null;
  const amount = typed ?? (stored != null ? inr(stored) : "");

  const digits = Number(amount.replace(/[^0-9]/g, ""));
  const saving = saveTarget.isPending;

  const submit = () => {
    if (saving) return;
    // The design draws one Button state — solid #312b28 — even with the field
    // empty, so the CTA never dims on an empty amount; it asks for one instead.
    if (!digits) {
      Alert.alert("Enter an amount", "Type how much you want to earn.");
      return;
    }
    // Both columns are written from one annual figure so they can never drift
    // apart — the home dashboard reads targetMonthly, the reports targetYearly.
    const targetYearly = digits * PER_YEAR[frequency];
    saveTarget.mutate(
      { targetYearly, targetMonthly: Math.round(targetYearly / 12) },
      {
        onSuccess: () => router.back(),
        // Surfaced, never swallowed. `typed` is left untouched, so the sheet
        // stays open with exactly what was entered still in the field.
        onError: (err) =>
          Alert.alert("Couldn’t save target", err.message || "Please try again."),
      },
    );
  };

  return (
    <Screen height={875} background="#f7f0e4" scroll>
      {/* Frame fill --------------------------------------------------------- */}
      <LinearGradient
        colors={PAGE}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", left: 0, top: 0, width: 375, height: 875 }}
      />

      {/* ============================ Bottom nav ============================= */}
      <Abs
        x={16} y={776.69} w={343} h={76} radius={30}
        bg="rgba(255,255,255,0.54)" border="#f8f8f8" borderWidth={1}
      />
      {TABS.map((t) => (
        <View key={t.key}>
          <Abs
            x={t.iconX} y={790.19} w={34} h={34} radius={14}
            bg={t.on ? "#f8f3ff" : undefined}
          />
          <Ionicons
            name={t.icon} size={20} color={t.on ? NAV_ON : NAV_OFF}
            style={{ position: "absolute", left: t.iconX + 7, top: 797.19 }}
          />
          <Txt
            x={t.labelX} y={828.19} w={t.labelW} size={11} weight="medium" font="inter"
            color={t.on ? NAV_ON : NAV_OFF} lineHeight={11}
          >
            {t.label}
          </Txt>
        </View>
      ))}
      <LinearGradient
        colors={["#f7b7da", "#c7b0ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute", left: 156.5, top: 770.69, width: 62, height: 62,
          borderRadius: 31,
          shadowColor: "#000000", shadowOpacity: 0.25,
          shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 6,
        }}
      />
      <Ionicons name="add" size={24} color="#000000" style={{ position: "absolute", left: 175.5, top: 789.69 }} />

      {/* ====================== Dashboard (clips 375x652) ==================== */}
      <Abs x={0} y={106} w={375} h={652} style={{ overflow: "hidden" }}>
        {/* ---------------------- Section: Priority Now --------------------- */}
        <Abs x={15} y={0} w={345} h={182.23} radius={28} style={{ overflow: "hidden" }}>
          <LinearGradient
            colors={["#ffe5a4d1", "#fff5e4eb", "#f4d3eee0", "#cad9ffc2"]}
            locations={[0, 0.34, 0.67, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
          />
          <Abs x={241} y={-18} w={120} h={120} radius={60} bg="rgba(255,255,255,0.22)" />

          <Abs x={18} y={45.11} w={46} h={46} radius={23} bg="rgba(255,248,241,0.74)" center>
            <Ionicons name="notifications-outline" size={22} color={INK} />
          </Abs>
          <Txt
            x={76} y={17} w={92.89} size={11} weight="bold" font="inter"
            color={MUTED} lineHeight={13.2} letterSpacing={0.88}
          >
            PRIORITY NOW
          </Txt>
          <Txt
            x={76} y={36.23} w={173} size={24} weight="bold"
            color={INK} lineHeight={28} letterSpacing={-1.62}
          >
            {`${leadsLoading ? "—" : unattended} leads need\nattention`}
          </Txt>
          <Txt x={76} y={98.34} w={156.58} size={14} font="inter" color="#2d2430" lineHeight={18.9}>
            From your landing page
          </Txt>
          <Abs x={287} y={18} w={40} h={40} radius={20} bg="rgba(31,26,23,0.92)" center>
            <Ionicons name="arrow-forward" size={18} color="#f1eee8" />
          </Abs>

          <Abs x={18} y={132.23} w={94.52} h={32} radius={16} bg="rgba(255,248,241,0.62)" border="#ffffff" borderWidth={1} />
          <Txt x={31} y={140.73} w={68.52} size={12} weight="semibold" font="inter" color={INK} lineHeight={14.52} align="center">
            Warm leads
          </Txt>
          <Abs x={120.52} y={132.23} w={89.25} h={32} radius={16} bg="rgba(255,248,241,0.62)" border="#ffffff" borderWidth={1} />
          <Txt x={133.52} y={140.73} w={63.25} size={12} weight="semibold" font="inter" color={INK} lineHeight={14.52} align="center">
            High intent
          </Txt>
          <Abs x={217.77} y={132.23} w={95.28} h={32} radius={16} bg="rgba(255,248,241,0.62)" border="#ffffff" borderWidth={1} />
          <Txt x={230.77} y={140.73} w={69.28} size={12} weight="semibold" font="inter" color={INK} lineHeight={14.52} align="center">
            Review now
          </Txt>
        </Abs>

        {/* --------------------- Section: Today's Summary -------------------- */}
        <Txt x={15} y={208.23} w={345} size={17} weight="medium" color={INK} lineHeight={20.4} letterSpacing={-0.51}>
          Today’s Summary
        </Txt>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ position: "absolute", left: 15, top: 243, width: 345, height: 110 }}
          contentContainerStyle={{ width: 414, height: 110 }}
        >
          <SummaryCard
            x={0} colors={["#e6aaff80", "#fff6fadb"]}
            value={leadsLoading ? "—" : `${newLeads}`} label="New Leads"
            chipX={17} chipW={79.05} chipBg="#fadaff" tint="#7b1fa2"
            delta="+3 today" deltaX={41} deltaW={47.05}
          />
          <SummaryCard
            x={142} colors={["#d5ffd7", "#fafbffe0"]}
            value={invoicesLoading ? "—" : `₹${compact(paid).toUpperCase()}`} label="Revenue"
            chipX={159} chipW={62.16} chipBg="rgba(223,255,224,0.92)" tint="#2e7d32"
            delta="+18%" deltaX={183} deltaW={30.16}
          />
          <SummaryCard
            x={284} colors={["#bfd3ff7a", "#fafbffe0"]}
            value="347" label="Page Views"
            chipX={301} chipW={61.97} chipBg="rgba(236,247,255,0.88)" tint="#1565c0"
            delta="+12%" deltaX={325} deltaW={29.97}
          />
        </ScrollView>

        {/* ----------------------- Section: Lead Pipeline -------------------- */}
        <Txt x={15} y={381.25} w={345} size={17} weight="medium" color={INK} lineHeight={20.4} letterSpacing={-0.51}>
          Lead Pipeline
        </Txt>
        {PIPELINE.map((c) => (
          <View key={c.key}>
            <GradCard x={c.x} y={c.y} w={166.5} h={112} radius={24} colors={c.grad} />
            <Abs x={c.bubbleX} y={c.y + 15} w={32} h={32} radius={16} bg="rgba(255,255,255,0.46)" center>
              <Ionicons name={c.icon} size={16} color={INK} />
            </Abs>
            <Txt
              x={c.textX} y={c.y + 19} w={132.5} size={24} weight="bold" font="inter"
              color={INK} lineHeight={24} letterSpacing={-1.2}
            >
              {leadsLoading ? "—" : pad2(counts[c.key])}
            </Txt>
            <Txt x={c.textX} y={c.y + 52} w={132.5} size={14} weight="medium" font="inter" color="#2d2430" lineHeight={16.8}>
              {c.label}
            </Txt>
            {c.caption ? (
              <Txt
                x={c.textX} y={c.y + 78.8} w={123.5} size={11} weight="medium" font="inter"
                color="rgba(230,81,0,0.7)" lineHeight={13.31}
              >
                {c.caption}
              </Txt>
            ) : null}
          </View>
        ))}
      </Abs>

      {/* ============================== Header =============================== */}
      <LinearGradient
        colors={["#f6d64a", "#f7b7da", "#bfd3ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute", left: 15, top: 15, width: 56, height: 56, borderRadius: 28,
          shadowColor: INK, shadowOpacity: 0.08, shadowRadius: 18,
          shadowOffset: { width: 0, height: 6 }, elevation: 3,
        }}
      />
      {me?.avatarUrl ? (
        <Image
          source={{ uri: me.avatarUrl }}
          style={{ position: "absolute", left: 18, top: 18, width: 50, height: 50, borderRadius: 25 }}
        />
      ) : null}
      <Txt x={81} y={15} w={167} size={15} weight="medium" font="inter" color={MUTED} lineHeight={19.5}>
        Good morning,
      </Txt>
      <Txt x={81} y={41} w={167} size={20} weight="medium" color={INK} lineHeight={30.24} letterSpacing={-1.4} numberOfLines={1}>
        {me?.name ?? "Sophia Roy"}
      </Txt>
      <Abs x={258} y={15} w={40} h={40} radius={20} bg="rgba(31,26,23,0.92)" center>
        <Ionicons name="chatbubble-outline" size={20} color="#f1eee8" />
      </Abs>
      <Abs x={310} y={15} w={40} h={40} radius={20} bg="rgba(31,26,23,0.92)" center>
        <Ionicons name="notifications-outline" size={20} color="#f1eee8" />
      </Abs>

      {/* =============================== Scrim =============================== */}
      <Pressable
        onPress={() => router.back()}
        style={{ position: "absolute", left: 0, top: 0, width: 375, height: 876, backgroundColor: "rgba(181,180,185,0.57)" }}
      />

      {/* ============================ Bottom sheet =========================== */}
      <Abs
        x={0} y={493} w={375} h={383} bg="#ffffff"
        style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
      >
        <Abs x={167.5} y={16} w={40} h={4} radius={2} bg="#e5e5e5" />

        <Txt
          x={24} y={44} w={280} size={24} weight="semibold" font="inter"
          color="#111111" lineHeight={29.05} letterSpacing={-0.52}
        >
          Set Your Revenue Target
        </Txt>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            position: "absolute", left: 315, top: 44, width: 36, height: 36,
            borderRadius: 18, backgroundColor: "#f8f8f8",
            alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="close" size={20} color="#555555" />
        </Pressable>

        {/* ------------------------- Amount field -------------------------- */}
        <FieldLabel y={106}>How much do you want to earn?</FieldLabel>
        <Abs
          x={24} y={131} w={327} h={52} radius={20}
          bg="rgba(255,255,255,0.8)" border="#e8e8e8" borderWidth={1}
          style={{
            shadowColor: "#000000", shadowOpacity: 0.02, shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 }, elevation: 1,
          }}
        >
          <TextInput
            value={amount}
            onChangeText={setTyped}
            placeholder="₹  e.g. 5000"
            placeholderTextColor="#111827"
            keyboardType="number-pad"
            style={{
              position: "absolute", left: 21, top: 17, width: 268, height: 18, padding: 0,
              fontFamily: fonts.interMedium, fontSize: 15, color: "#111827",
            }}
          />
        </Abs>

        {/* ------------------------ Frequency field ------------------------ */}
        <FieldLabel y={200}>Choose Frequency</FieldLabel>
        <Pressable
          onPress={() =>
            setFrequency(FREQUENCIES[(FREQUENCIES.indexOf(frequency) + 1) % FREQUENCIES.length])
          }
          style={({ pressed }) => ({
            position: "absolute", left: 24, top: 225, width: 327, height: 52,
            borderRadius: 20, backgroundColor: "rgba(255,255,255,0.8)",
            borderWidth: 1, borderColor: "#e5e5e5", opacity: pressed ? 0.85 : 1,
            shadowColor: "#000000", shadowOpacity: 0.02, shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 }, elevation: 1,
          })}
        >
          <Txt x={21} y={17} w={268} size={15} weight="medium" font="inter" color="#111827" lineHeight={18.15}>
            {frequency}
          </Txt>
          <Ionicons name="chevron-down" size={16} color="#6b7280" style={{ position: "absolute", left: 291, top: 18 }} />
        </Pressable>

        {/* ------------------------------ CTA ------------------------------ */}
        <Pressable
          onPress={submit}
          disabled={saving}
          style={({ pressed }) => ({
            position: "absolute", left: 37, top: 299.72, width: 301, height: 55,
            borderRadius: 100, backgroundColor: "#312b28",
            // Solid at rest, per the design; only an in-flight save dims it.
            opacity: saving ? 0.5 : pressed ? 0.9 : 1,
            shadowColor: "#312b28", shadowOpacity: 0.25, shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 }, elevation: 6,
          })}
        >
          <Txt x={0} y={18} w={301} size={16} weight="bold" font="inter" color="#ffffff" lineHeight={19.36} align="center">
            Set Target
          </Txt>
        </Pressable>
      </Abs>
    </Screen>
  );
}
