import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import {
  compact,
  useInvoices,
  useLeads,
  useMe,
  useNotifications,
  useUpdateMe,
  type Invoice,
  type MePatch,
} from "../../../src/api/hooks";

/**
 * Home — Set Revenue Target. Figma frame 7756:12488 ("target", 375x876).
 *
 * The modal state of the agency home dashboard, opened by the "Set Target"
 * button inside the MONTHLY TARGET card. Three layers, bottom to top:
 *
 *   1. the home frame itself on the #f8f5ef page — greeting header, the Active
 *      status pill, the "3 new leads waiting" nudge, the Performance pair and
 *      the 335x314 TOTAL REVENUE card that owns the trigger. The design's body
 *      container clips at 375x670 from y=124, so the Top Creators / Live
 *      Campaigns / Explore Services / Reminders / Recent Activity sections the
 *      file places from y=847 downwards are cropped by Figma and are omitted
 *      here for the same reason;
 *   2. a full-bleed #b5b4b9 @57% scrim (frame "Frame 2147223240", y=1), which
 *      dismisses on tap;
 *   3. the 375x383 sheet at y=494, 32/32/0/0 corners — drag handle, title +
 *      close, the amount field, the frequency select and the pill CTA.
 *
 * The sheet is role-agnostic: nothing in it reads the Operations home it is
 * drawn over, so the same route serves whichever home tab is active and
 * dismissing returns there.
 *
 * The frame's Geist headings render in Outfit — Geist is not registered in
 * app/_layout.tsx and Outfit is this app's primary face. Icon glyphs are the
 * nearest Feather equivalents of the design's vector components, at the spec's
 * boxes. Coordinates are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry --------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/** Body container: 375x670 at y=124, clipping everything the design stacks below. */
const BODY_Y = 124;
const BODY_H = 670;

/** Bottom sheet. */
const SHEET_Y = 494;
const SHEET_H = 383;

/** MONTHLY TARGET progress bar: 251x10 track at (62,745), 249pt of travel. */
const BAR_X = 63;
const BAR_Y = 746;
const BAR_MAX = 249;

/* ----------------------------- spec palette ------------------------------- */
const PAGE = "#f8f5ef";
const INK = "#1e1e1e";
const INK_80 = "rgba(30,30,30,0.8)";
const INK_70 = "rgba(30,30,30,0.7)";
const INK_60 = "rgba(30,30,30,0.6)";
const INK_50 = "rgba(30,30,30,0.5)";
const INK_40 = "rgba(30,30,30,0.4)";
const BUTTON_FILL = "#1f1a17";
const BUTTON_INK = "#f8f5ef";
const BADGE = "#ffcdea";
const DOT_ACTIVE = "#05df72";
const NUDGE_CARD = "#e2ebe2";
const NUDGE_ORB = "rgba(212,226,212,0.3)";
const PERF_WARM = "#f6f3e6";
const PERF_COOL = "#e4ecf4";
const REVENUE_CARD = "#f2eff6";
const DELTA_DOT = "#bee3b0";
const NAV_DOT = "#e36eb2";
const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_54 = "rgba(255,255,255,0.54)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const WHITE = "#ffffff";
const SCRIM = "rgba(181,180,185,0.57)";

/** Sheet chrome. */
const HANDLE = "#e5e5e5";
const SHEET_TITLE = "#111111";
const FIELD_LABEL = "#6b7280";
const FIELD_INK = "#111827";
/** The two "…+Border…" field frames carry no stroke paint in the spec export; */
/** these are the greys the sibling creator-side sheet (7348:18113) traced. */
const FIELD_LINE = "#e8e8e8";
const CLOSE_BG = "#f8f8f8";
const CLOSE_INK = "#555555";
const CTA = "#312b28";
/**
 * The frame draws no error state — it has no node for one. This colour paints a
 * single line in the sheet's empty 355..383 band below the CTA, and only while
 * a save has actually failed, so the resting design is byte-for-byte the spec.
 */
const ERROR_INK = "#b3261e";

/** Header wash: "Gradient" 375x256, #f9e4e8 @20% -> transparent, top to bottom. */
const WASH = ["#f9e4e833", "#f9e4e800"] as const;
/** Avatar placeholder when the user has no photo on record. */
const AVATAR = ["#f6d64a", "#f7b7da", "#bfd3ff"] as const;

/* -------------------------------- frequency ------------------------------- */
/**
 * User stores targetMonthly and targetYearly and nothing else, so those are the
 * only two frequencies this sheet can honestly read back or persist. The design
 * shows the select resting on "Monthly".
 */
const FREQUENCIES = ["Monthly", "Yearly"] as const;
type Frequency = (typeof FREQUENCIES)[number];

/* ------------------------------ derivations ------------------------------- */
const DAY = 86_400_000;

/** Role has no job-title column; the enum's own half is the honest subtitle. */
function roleLabel(role?: string): string {
  if (!role) return "—";
  if (role === "SUPER_ADMIN") return "Admin";
  return role.endsWith("MANAGER") ? "Manager" : "Employee";
}

/** Paid invoices whose createdAt falls in the calendar month `offset` back. */
function paidInMonth(invoices: Invoice[], offset: number): number {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - offset, 1).getTime();
  const to = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1).getTime();
  return invoices.reduce((sum, i) => {
    if (!i.createdAt) return sum;
    const t = new Date(i.createdAt).getTime();
    return t >= from && t < to ? sum + i.payout : sum;
  }, 0);
}

/** Whole days left in the current calendar month — the "5 DAYS LEFT" caption. */
function daysLeftInMonth(): number {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  return Math.max(0, Math.ceil((end - now.getTime()) / DAY));
}

/* ------------------------------- primitives ------------------------------- */
/** A 40x40 pill button in the header — dark fill, centred glyph. */
function HeaderButton({ x, icon }: { x: number; icon: "mail" | "bell" }) {
  return (
    <Abs x={x} y={62} w={40} h={40} radius={20} bg={BUTTON_FILL} center>
      <Feather name={icon} size={20} color={BUTTON_INK} />
    </Abs>
  );
}

/** Performance tile — 161.5x130, caption / value / optional footnote. */
function PerfCard({
  x, bg, caption, value, footnote,
}: {
  x: number; bg: string; caption: string; value: string; footnote?: string;
}) {
  return (
    <>
      <Abs x={x} y={352} w={161.5} h={130} radius={24} bg={bg} />
      <Txt
        x={x + 21} y={373} w={119.5} size={12} weight="semibold" font="inter"
        color={INK_60} lineHeight={16}
      >
        {caption}
      </Txt>
      <Txt
        x={x + 21} y={408} w={119.5} size={24} weight="bold" font="inter"
        color={INK} lineHeight={32} numberOfLines={1}
      >
        {value}
      </Txt>
      {footnote ? (
        <Txt
          x={x + 21} y={444} w={119.5} size={11} weight="medium" font="inter"
          color={INK_60} lineHeight={16.5}
        >
          {footnote}
        </Txt>
      ) : null}
    </>
  );
}

/** Bottom-tab glyph. The frame paints no per-tab colour, only the active dot. */
function NavIcon({
  x, icon, active,
}: {
  x: number; icon: "home" | "list" | "briefcase" | "user"; active?: boolean;
}) {
  return (
    <>
      <Feather name={icon} size={24} color={INK} style={{ position: "absolute", left: x, top: 818 }} />
      {active ? <Abs x={x + 10} y={846} w={4} h={4} radius={2} bg={NAV_DOT} /> : null}
    </>
  );
}

/** Sheet field label — 14/500 Inter, 4pt inside the 24pt gutter. */
const FieldLabel = ({ y, children }: { y: number; children: string }) => (
  <Txt x={28} y={y} w={323} size={14} weight="medium" font="inter" color={FIELD_LABEL} lineHeight={16.94}>
    {children}
  </Txt>
);

/* --------------------------------- screen --------------------------------- */
export default function HomeSetTargetSheetScreen() {
  const router = useRouter();

  const { data: me } = useMe();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: notifications } = useNotifications();
  const save = useUpdateMe();

  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  /** null until the field is touched, so the prefill can follow the frequency. */
  const [typed, setTyped] = useState<string | null>(null);
  /** Set only when a save is rejected; cleared on the next attempt. */
  const [error, setError] = useState<string | null>(null);

  const newLeads = leads.filter((l) => l.status === "NEW").length;

  /* Revenue. `payout` on PAID invoices is what every other home surface in this
     app treats as booked revenue, so the three money read-outs agree. */
  const money = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "PAID");
    const total = paid.reduce((sum, i) => sum + i.payout, 0);
    const thisMonth = paidInMonth(paid, 0);
    const lastMonth = paidInMonth(paid, 1);
    const deltaPct = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
    return { total, thisMonth, lastMonth, deltaPct };
  }, [invoices]);

  /* revenue.target.current — the stored goal for the selected frequency. */
  const target = frequency === "Yearly" ? me?.targetYearly : me?.targetMonthly;
  const pct =
    target && target > 0 ? Math.min(100, Math.round((money.total / target) * 100)) : 0;
  const daysLeft = daysLeftInMonth();

  const amount = typed ?? (target != null ? `${target}` : "");
  const digits = Number(amount.replace(/[^0-9]/g, ""));

  /** Nothing to send until an amount is typed, and no double submits in flight. */
  const canSave = digits > 0 && !save.isPending;

  /**
   * setRevenueTarget. PATCH /auth/me writes targetMonthly / targetYearly on the
   * caller's own User row — the row is chosen from the token, so this sheet
   * cannot address anyone else's record. useUpdateMe seeds the ["me"] query with
   * the server's response, so the MONTHLY TARGET card behind the scrim is
   * already showing the saved figure by the time the sheet closes.
   *
   * A rejection leaves `typed` and `frequency` untouched and the sheet open, so
   * the amount the user entered is still there to retry.
   */
  const submit = () => {
    if (!canSave) return;
    setError(null);
    const patch: Partial<MePatch> =
      frequency === "Yearly" ? { targetYearly: digits } : { targetMonthly: digits };
    save.mutate(patch, {
      onSuccess: () => router.back(),
      onError: (e) =>
        setError(e instanceof Error && e.message ? e.message : "Couldn't save your target."),
    });
  };

  const dash = (loading: boolean, value: string) => (loading ? "—" : value);

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* ------------------------------ Background ------------------------- */}
      <LinearGradient
        colors={WASH}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.wash}
      />

      {/* ================================ Header =========================== */}
      <LinearGradient
        colors={AVATAR}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      />
      {me?.avatarUrl ? <Image source={{ uri: me.avatarUrl }} style={styles.avatar} /> : null}
      <Txt
        x={80} y={56} w={132} size={24} weight="medium"
        color={INK} lineHeight={32} letterSpacing={-0.6} numberOfLines={1}
      >
        {me?.name ?? "—"}
      </Txt>
      <Txt
        x={80} y={88} w={132} size={14} weight="light" font="inter"
        color={INK_60} lineHeight={20} letterSpacing={-0.35}
      >
        {roleLabel(me?.role)}
      </Txt>

      <HeaderButton x={267} icon="mail" />
      <HeaderButton x={315} icon="bell" />
      {notifications && notifications.unreadCount > 0 ? (
        <Abs x={342} y={63} w={12} h={12} radius={6} bg={BADGE} />
      ) : null}

      {/* ===================== Body — clips 375x670 at y=124 ================ */}
      <Abs x={0} y={BODY_Y} w={FRAME_W} h={BODY_H} style={styles.clip}>
        {/* One -124 offset keeps every child on raw frame coordinates. */}
        <Abs x={0} y={-BODY_Y} w={FRAME_W} h={BODY_Y + BODY_H}>
          {/* -------------------------- Status pill ------------------------ */}
          <Abs x={20} y={137.5} w={335} h={42} radius={21} bg={GLASS_40} />
          <Abs x={37} y={153.5} w={10} h={10} radius={5} bg={DOT_ACTIVE} />
          <Txt x={57} y={147.75} w={39} size={13} weight="medium" color={INK_80} lineHeight={19.5}>
            Active
          </Txt>
          <Abs x={302} y={148.5} w={36} h={20} radius={10} bg={BUTTON_FILL} />
          <Abs x={322} y={152.5} w={12} h={12} radius={6} bg={PAGE} />

          {/* --------------------------- Lead nudge ------------------------ */}
          <Abs x={20} y={199.5} w={335} h={83.5} radius={24} bg={NUDGE_CARD} style={styles.clip}>
            <Abs x={254} y={-15} w={96} h={96} radius={48} bg={NUDGE_ORB} />
          </Abs>
          <Abs x={41} y={221.25} w={40} h={40} radius={20} bg={GLASS_50} center>
            <MaterialCommunityIcons name="creation" size={20} color={INK} />
          </Abs>
          <Txt x={97} y={220.5} w={149} size={16} weight="medium" color={INK} lineHeight={24} numberOfLines={1}>
            {leadsLoading
              ? "— new leads waiting"
              : `${newLeads} new lead${newLeads === 1 ? "" : "s"} waiting`}
          </Txt>
          <Txt x={97} y={246} w={124} size={12} font="inter" color={INK_70} lineHeight={16}>
            Tap to review pipeline
          </Txt>
          <Abs x={302} y={225.25} w={32} h={32} radius={16} bg={BUTTON_FILL} center>
            <Feather name="arrow-right" size={16} color={BUTTON_INK} />
          </Abs>

          {/* -------------------------- Performance ------------------------ */}
          <Txt x={24} y={303} w={127} size={22} weight="medium" color={INK} lineHeight={33} letterSpacing={-0.55}>
            Performance
          </Txt>
          <PerfCard
            x={20} bg={PERF_WARM} caption={"This Month "}
            value={dash(invoicesLoading, compact(money.thisMonth))}
            footnote="Expected this week"
          />
          <PerfCard
            x={193.5} bg={PERF_COOL} caption="Last Month"
            value={dash(invoicesLoading, compact(money.lastMonth))}
          />

          {/* ============ TOTAL REVENUE card — owns the "Set Target" ======== */}
          <Abs x={20} y={505} w={335} h={314} radius={32} bg={REVENUE_CARD} style={styles.clip}>
            <Abs x={-39} y={160.5} w={192} h={192} radius={96} bg={GLASS_50} />
            <Abs x={206} y={1} w={128} h={128} radius={64} bg={REVENUE_CARD} />
          </Abs>

          <Abs x={45} y={530} w={28} h={28} radius={14} bg={GLASS_50} center>
            <MaterialCommunityIcons name="currency-inr" size={14} color={INK} />
          </Abs>
          <Txt
            x={81} y={535.5} w={104.73} size={11} weight="bold" font="inter"
            color={INK_60} lineHeight={16.5} letterSpacing={1.1}
          >
            TOTAL REVENUE
          </Txt>
          <Txt
            x={45} y={566} w={182.62} size={44} weight="bold" font="inter"
            color={INK} lineHeight={44} letterSpacing={-1.1} numberOfLines={1}
          >
            {dash(invoicesLoading, compact(money.total))}
          </Txt>

          <Abs x={45} y={622} w={182.62} h={34} radius={17} bg={GLASS_80} />
          <Abs x={58} y={629} w={20} h={20} radius={10} bg={DELTA_DOT} center>
            <Feather name="arrow-up" size={12} color={INK} />
          </Abs>
          <Txt x={84} y={628.25} w={48.95} size={13} weight="bold" font="inter" color={INK} lineHeight={19.5}>
            {dash(
              invoicesLoading,
              `${money.deltaPct >= 0 ? "+" : ""}${money.deltaPct.toFixed(1)}%`,
            )}
          </Txt>
          <Txt x={149.95} y={631.5} w={64.67} size={10} weight="semibold" font="inter" color={INK_50} lineHeight={15}>
            vs last month
          </Txt>

          {/* -------------------- Monthly target panel --------------------- */}
          <Abs x={45} y={676} w={285} h={118} radius={20} bg={GLASS_40} />
          <Txt
            x={62} y={693} w={107.33} size={10} weight="bold" font="inter"
            color={INK_50} lineHeight={15} letterSpacing={1}
          >
            MONTHLY TARGET
          </Txt>
          <Txt
            x={62} y={712} w={88} size={14} weight="bold" font="inter"
            color={INK_40} lineHeight={21} letterSpacing={-0.35} numberOfLines={1}
          >
            {dash(invoicesLoading, `${compact(money.total)} / ${target ? compact(target) : "—"}`)}
          </Txt>

          <Abs x={206} y={704} w={107} h={29} radius={14.5} bg={WHITE} />
          <Feather name="target" size={10} color={INK} style={styles.setTargetIcon} />
          <Txt
            x={233} y={711} w={67} size={10} weight="bold" font="inter"
            color={INK} lineHeight={15} letterSpacing={0.5} align="center"
          >
            Set Target
          </Txt>

          <Abs x={62} y={745} w={251} h={10} radius={5} bg={GLASS_50} />
          <Abs x={BAR_X} y={BAR_Y} w={(BAR_MAX * pct) / 100} h={8} radius={4} bg={INK} />
          {pct > 4 ? (
            <Abs x={BAR_X + (BAR_MAX * pct) / 100 - 8} y={748} w={4} h={4} radius={2} bg={GLASS_40} />
          ) : null}
          <Txt
            x={66} y={763} w={83.38} size={9} weight="bold" font="inter"
            color={INK_40} lineHeight={13.5} letterSpacing={0.9}
          >
            {`${pct}% COMPLETE`}
          </Txt>
          <Txt
            x={242.78} y={763} w={66.22} size={9} weight="bold" font="inter"
            color={INK_40} lineHeight={13.5} letterSpacing={0.9}
          >
            {`${daysLeft} DAY${daysLeft === 1 ? "" : "S"} LEFT`}
          </Txt>
        </Abs>
      </Abs>

      {/* ============================= Bottom nav ========================== */}
      <Abs x={9} y={794} w={357} h={72} radius={32} bg={GLASS_54} />
      <NavIcon x={34} icon="home" active />
      <NavIcon x={115} icon="list" />
      <Abs x={157} y={765} w={60} h={60} radius={30} bg={PAGE} />
      <Abs x={163} y={771} w={48} h={48} radius={24} bg={BADGE} center>
        <Feather name="plus" size={24} color={BUTTON_FILL} />
      </Abs>
      <NavIcon x={236} icon="briefcase" />
      <NavIcon x={317} icon="user" />

      {/* =============================== Scrim ============================= */}
      <Pressable onPress={() => router.back()} style={styles.scrim} />

      {/* ============================ Bottom sheet ========================= */}
      <Abs x={0} y={SHEET_Y} w={FRAME_W} h={SHEET_H} bg={WHITE} style={styles.sheet}>
        <Abs x={167.5} y={16} w={40} h={4} radius={2} bg={HANDLE} />

        <Txt
          x={24} y={44} w={280} size={24} weight="semibold" font="inter"
          color={SHEET_TITLE} lineHeight={29.05} letterSpacing={-0.52}
        >
          Set Your Revenue Target
        </Txt>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <Feather name="x" size={20} color={CLOSE_INK} />
        </Pressable>

        {/* --------------------------- Amount ---------------------------- */}
        <FieldLabel y={106}>How much do you want to earn?</FieldLabel>
        <Abs
          x={24} y={131} w={327} h={52} radius={20}
          bg={GLASS_80} border={FIELD_LINE} borderWidth={1} style={styles.fieldShadow}
        >
          <TextInput
            value={amount}
            onChangeText={setTyped}
            placeholder="₹  e.g. 5000"
            placeholderTextColor={FIELD_INK}
            keyboardType="number-pad"
            style={styles.input}
          />
        </Abs>

        {/* -------------------------- Frequency -------------------------- */}
        <FieldLabel y={200}>Choose Frequency</FieldLabel>
        <Pressable
          onPress={() =>
            setFrequency(FREQUENCIES[(FREQUENCIES.indexOf(frequency) + 1) % FREQUENCIES.length])
          }
          style={({ pressed }) => [styles.select, pressed && styles.pressed]}
        >
          <Txt x={21} y={17} w={268} size={15} weight="medium" font="inter" color={FIELD_INK} lineHeight={18.15}>
            {frequency}
          </Txt>
          <Feather name="chevron-down" size={20} color={FIELD_INK} style={styles.selectChevron} />
        </Pressable>

        {/* ----------------------------- CTA ----------------------------- */}
        {/* The frame paints the resting button at full #312b28 even with an
            empty amount, so there is no dimmed state — `disabled` alone guards
            empty input and in-flight PATCHes without changing the pixels. */}
        <Pressable
          onPress={submit}
          disabled={!canSave}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Txt x={0} y={18} w={301} size={16} weight="bold" font="inter" color={WHITE} lineHeight={19.36} align="center">
            Set Target
          </Txt>
        </Pressable>

        {/* Failure notice. Absent unless a save was rejected, and it sits in the
            blank band the frame leaves between the CTA (ends y=354.72) and the
            sheet's own bottom edge (y=383), so no spec node ever moves. */}
        {error ? (
          <Txt
            x={37} y={360} w={301} size={11} weight="medium" font="inter"
            color={ERROR_INK} lineHeight={16} align="center" numberOfLines={1}
          >
            {error}
          </Txt>
        ) : null}
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wash: { position: "absolute", left: 0, top: 0, width: FRAME_W, height: 256 },
  avatar: { position: "absolute", left: 20, top: 58, width: 48, height: 48, borderRadius: 24 },
  clip: { overflow: "hidden" },
  setTargetIcon: { position: "absolute", left: 219, top: 713.5 },
  scrim: { position: "absolute", left: 0, top: 1, width: FRAME_W, height: FRAME_H, backgroundColor: SCRIM },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  close: {
    position: "absolute",
    left: 315,
    top: 44,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CLOSE_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  input: {
    position: "absolute",
    left: 21,
    top: 17,
    width: 268,
    height: 18,
    padding: 0,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: FIELD_INK,
  },
  select: {
    position: "absolute",
    left: 24,
    top: 225,
    width: 327,
    height: 52,
    borderRadius: 20,
    backgroundColor: GLASS_80,
    borderWidth: 1,
    borderColor: FIELD_LINE,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  selectChevron: { position: "absolute", left: 289, top: 16 },
  cta: {
    position: "absolute",
    left: 37,
    top: 299.72,
    width: 301,
    height: 55,
    borderRadius: 100,
    backgroundColor: CTA,
    shadowColor: CTA,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  pressed: { opacity: 0.85 },
});
