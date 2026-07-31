import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import {
  compact,
  inr,
  useCampaigns,
  useCreators,
  useInvoices,
  useLeads,
  useMe,
  useNotifications,
  useReminders,
  useUpdateMe,
  type Campaign,
  type Creator,
} from "../../../src/api/hooks";

/**
 * Set Revenue Target — Figma 7756:12488 (375x876), agency app.
 *
 * The earnings-goal state of agency Home: the whole dashboard with a #b5b4b9
 * @57% scrim and a 383pt "Set Your Revenue Target" sheet docked at y=494. The
 * sheet is the open state of the small "Set Target" pill inside the revenue
 * card at y=505 — that pill is drawn but inert here, since this route *is* its
 * result.
 *
 * Layering follows the spec exactly: the design nests every dashboard section
 * inside a 375x670 clipping frame at y=124, so that frame is reproduced as a
 * clipped scroller. The page beneath therefore keeps its own scroll (content
 * runs to 2200, far past the 876 artboard) while the nav bar at y=794, the
 * scrim and the sheet stay pinned to the frame, which is how a sheet-over-Home
 * actually behaves. Children inside the scroller are offset by -124 so every
 * node can keep the raw frame coordinates the spec gives.
 *
 * Geist (the section headings) is not one of the two families registered in
 * app/_layout.tsx; those nodes render in Outfit at the traced size and
 * tracking. Everything else keeps the spec's family, weight, line-height and
 * letter-spacing verbatim.
 */

/* -------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/** "Container" — the design's clipping frame around every dashboard section. */
const BODY_Y = 124;
const BODY_H = 670;
/** Bottom of the last traced node (the 343x76 nav spacer at y=2124). */
const CONTENT_BOTTOM = 2200;

/** Bottom sheet: "Frame" x=0 y=494 w=375 h=383, top corners 32. */
const SHEET_Y = 494;
const SHEET_H = 383;

/** Live Campaigns strip: cards 280 wide from x=26, second card at x=322. */
const CARD_W = 280;
const CARD_H = 182;
const CARD_STEP = 296;
const CARD_PAD = 20; // 26 - the strip container's x of 6

/** Top Creators rows: 74pt card, 905 -> 987. */
const CREATOR_Y = 905;
const CREATOR_STEP = 82;

/** Reminder rows: 64pt card, 1625 -> 1697. */
const REMINDER_Y = 1625;
const REMINDER_STEP = 72;

/** Recent Activity rows: 1855 -> 1934.75 -> 2014.5. */
const ACTIVITY_Y = 1855;
const ACTIVITY_STEP = 79.75;

/* --------------------------- spec colour tokens --------------------------- */
const BG = "#f8f5ef";
const INK = "#1e1e1e";
const INK80 = "rgba(30,30,30,0.8)";
const INK70 = "rgba(30,30,30,0.7)";
const INK60 = "rgba(30,30,30,0.6)";
const INK50 = "rgba(30,30,30,0.5)";
const INK40 = "rgba(30,30,30,0.4)";
const INK20 = "rgba(30,30,30,0.2)";
const DARK = "#1f1a17"; // header buttons / arrow pill
const CREAM = "#f9f6ee"; // icon ink on the dark pills
const HAIRLINE = "#e8e2d9";
const GLASS40 = "rgba(255,255,255,0.4)";
const GLASS50 = "rgba(255,255,255,0.5)";
const GLASS60 = "rgba(255,255,255,0.6)";
const GLASS80 = "rgba(255,255,255,0.8)";
const NAV_OFF = "#9a8ea3";
const NAV_ON = "#e36eb2";

/** Live Campaign card tints, in the design's order. */
const CARD_TINTS = [
  { bg: "#fdebf0", border: "rgba(249,228,232,0.6)", rule: "rgba(249,228,232,0.8)", ring: "#ff8eaa" },
  { bg: "#e2ebe2", border: "rgba(212,226,212,0.6)", rule: "rgba(212,226,212,0.8)", ring: "#8dba8e" },
] as const;

/** Recent Activity dot fills, in the design's order. */
const ACTIVITY_DOTS = ["#e6e1f9", "#fcf4d9", "#e8e2d9"] as const;

/**
 * revenueGoal frequency. The User row stores targetMonthly and targetYearly and
 * nothing else, so the picker offers exactly the two the schema can persist.
 */
const FREQUENCIES = ["Monthly", "Yearly"] as const;
type Frequency = (typeof FREQUENCIES)[number];

/* ------------------------------- formatting ------------------------------- */
/** "42.8k / 50.0k" — one decimal, the way the target line is drawn. */
const k1 = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);

/** "8,400k" — the Performance tiles quote thousands with Indian grouping. */
const thousands = (n: number) => `${inr(Math.round(n / 1000))}k`;

/** "₹1,25L" — the budget notation the campaign cards use. */
const lakhs = (n: number) =>
  n >= 100_000 ? `₹${(n / 100_000).toFixed(2).replace(".", ",")}L` : `₹${inr(n)}`;

/** "2H AGO" / "YESTERDAY" — the Recent Activity timestamp format. */
function ago(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "JUST NOW";
  if (h < 24) return `${h}H AGO`;
  const d = Math.floor(h / 24);
  return d === 1 ? "YESTERDAY" : `${d}D AGO`;
}

/** "Due today at 5 PM" — the reminder subtitle format. */
function dueLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  const when = today ? "today" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Due ${when} at ${d.toLocaleTimeString("en-US", { hour: "numeric", hour12: true })}`;
}

/** SALES_MANAGER -> "Sales Manager". The header caption is the user's role. */
const roleLabel = (role: string) =>
  role
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/** Campaign has no dealType column; a zero cash budget is the barter deal. */
const isBarter = (c: Campaign) => c.budget === 0;

/* ------------------------------- primitives ------------------------------- */
/** Image-filled circle in the design; initials while the photo is missing. */
function Avatar({
  x, y, size, uri, name,
}: { x: number; y: number; size: number; uri?: string; name?: string }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <Abs x={x} y={y} w={size} h={size} radius={size / 2} bg="#e6e1f9" center>
      <Txt size={size * 0.32} weight="bold" font="inter" color={INK}>
        {name ? initials(name) : ""}
      </Txt>
    </Abs>
  );
}

/** The 48x48 progress ring on a campaign card — 4pt stroke, opens at 12 o'clock. */
function ProgressRing({ x, y, pct, tint }: { x: number; y: number; pct: number; tint: string }) {
  const r = 21.22;
  const c = 2 * Math.PI * r;
  return (
    <Abs x={x} y={y} w={48} h={48}>
      <Svg width={48} height={48}>
        <Circle cx={24} cy={24} r={r} stroke={GLASS60} strokeWidth={4} fill="none" />
        <Circle
          cx={24} cy={24} r={r} stroke={tint} strokeWidth={4} fill="none"
          strokeDasharray={`${c}`}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(1, pct)))}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
        />
      </Svg>
    </Abs>
  );
}

/** Section heading — Geist 22/500, -0.55 tracking. */
const Heading = ({ x, y, w, children }: { x: number; y: number; w: number; children: string }) => (
  <Txt x={x} y={y} w={w} size={22} weight="medium" color={INK} lineHeight={33} letterSpacing={-0.55}>
    {children}
  </Txt>
);

/** "See all" — Inter 14/600 at 60% ink. */
const SeeAll = ({ x, y, onPress }: { x: number; y: number; onPress: () => void }) => (
  <Pressable onPress={onPress} style={{ position: "absolute", left: x, top: y, width: 44.56, height: 20 }}>
    <Txt size={14} weight="semibold" font="inter" color={INK60} lineHeight={20}>
      See all
    </Txt>
  </Pressable>
);

/** Sheet field label — Inter 14/500, 4pt inside the 24pt gutter. */
const FieldLabel = ({ y, children }: { y: number; children: string }) => (
  <Txt x={28} y={y} w={323} size={14} weight="medium" font="inter" color="#6b7280" lineHeight={16.94}>
    {children}
  </Txt>
);

/** Live Campaigns card — 280x182, the geometry of the first card in the strip. */
function CampaignCard({ left, c, tint }: { left: number; c: Campaign; tint: (typeof CARD_TINTS)[number] }) {
  const barter = isBarter(c);
  return (
    <Abs
      x={left} y={0} w={CARD_W} h={CARD_H} radius={28} bg={tint.bg}
      border={tint.border} borderWidth={1}
      style={{
        overflow: "hidden",
        shadowColor: "#000000", shadowOpacity: 0.1, shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 }, elevation: 2,
      }}
    >
      <Abs x={183} y={1} w={96} h={96} radius={48} bg={GLASS40} />

      {/* brand + deal-type chip ride a row so long names never collide */}
      <View style={{ position: "absolute", left: 21, top: 21, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Txt size={11} weight="bold" font="inter" color={INK} lineHeight={16.5} letterSpacing={0.55}>
          {c.brandName.toUpperCase()}
        </Txt>
        <View style={{ height: 18, borderRadius: 9, paddingHorizontal: 8, backgroundColor: GLASS60, justifyContent: "center" }}>
          <Txt size={9} weight="bold" font="inter" color={INK80} lineHeight={13.5}>
            {barter ? "BARTER" : "PAID"}
          </Txt>
        </View>
      </View>

      <Txt x={21} y={44.25} w={143} size={18} weight="bold" font="inter" color={INK} lineHeight={22.5} numberOfLines={2}>
        {c.name}
      </Txt>

      <ProgressRing x={211} y={21} pct={c.progress / 100} tint={tint.ring} />
      <Txt x={211} y={36.75} w={48} size={11} weight="bold" font="inter" color={INK} lineHeight={16.5} align="center">
        {`${Math.round(c.progress)}%`}
      </Txt>

      <Abs x={21} y={106} w={238} h={1} bg={tint.rule} />
      <Txt x={21} y={123} w={80} size={10} weight="bold" font="inter" color={INK60} lineHeight={15} letterSpacing={0.5}>
        BUDGET
      </Txt>
      <Txt x={21} y={140} w={110} size={14} weight="bold" font="inter" color={INK} lineHeight={21} numberOfLines={1}>
        {barter ? "Product Only" : lakhs(c.budget)}
      </Txt>
      <Txt x={146} y={123} w={90} size={10} weight="bold" font="inter" color={INK60} lineHeight={15} letterSpacing={0.5}>
        TIMELINE
      </Txt>
      <Txt x={146} y={140} w={113} size={12} weight="semibold" font="inter" color={INK80} lineHeight={18} numberOfLines={1}>
        {c.timeline ?? "—"}
      </Txt>
    </Abs>
  );
}

/** Top Creators row — 317x74 white card on the 82pt step. */
function CreatorRow({ y, c }: { y: number; c: Creator }) {
  return (
    <>
      <Abs
        x={29} y={y} w={317} h={74} radius={20} bg="#ffffff"
        border="rgba(232,226,217,0.5)" borderWidth={1}
        style={{
          shadowColor: "#000000", shadowOpacity: 0.02, shadowRadius: 10,
          shadowOffset: { width: 0, height: 2 }, elevation: 1,
        }}
      />
      <Avatar x={42} y={y + 13} size={48} uri={c.avatarUrl} name={c.name} />
      <Txt x={106} y={y + 16.75} w={170} size={15} weight="bold" font="inter" color={INK} lineHeight={22.5} numberOfLines={1}>
        {c.name}
      </Txt>
      <Txt x={106} y={y + 40.25} w={170} size={12} weight="medium" font="inter" color={INK60} lineHeight={16} numberOfLines={1}>
        {c.niche ?? c.handle}
      </Txt>
      <Txt x={285.66} y={y + 17.25} w={39.34} size={15} weight="bold" font="inter" color={INK} lineHeight={22.5} align="right">
        {`${c.engagementRate.toFixed(1)}%`}
      </Txt>
      <Txt x={302.36} y={y + 40.75} w={22.64} size={10} weight="semibold" font="inter" color={INK50} lineHeight={15} letterSpacing={0.5} align="right">
        ENG
      </Txt>
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function AgencySetRevenueTargetScreen() {
  const router = useRouter();
  const saveTarget = useUpdateMe();

  const { data: me } = useMe();
  const { data: invoices } = useInvoices();
  const { data: leads } = useLeads();
  const { data: creators } = useCreators();
  const { data: campaigns } = useCampaigns();
  const { data: reminders } = useReminders();
  const { data: notifications } = useNotifications();

  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  /** null until the field is touched, so the prefill can follow the frequency. */
  const [typed, setTyped] = useState<string | null>(null);
  /** Save failure, surfaced under the CTA. Null whenever there is nothing wrong. */
  const [error, setError] = useState<string | null>(null);

  /**
   * Revenue is the agency's own cut — Invoice.agencyFee on settled invoices —
   * bucketed by the month the invoice was raised in.
   */
  const revenue = useMemo(() => {
    const paid = (invoices ?? []).filter((i) => i.status === "PAID");
    const key = (d: Date) => d.getFullYear() * 12 + d.getMonth();
    const now = new Date();
    const sumOf = (k: number) =>
      paid
        .filter((i) => i.createdAt && key(new Date(i.createdAt)) === k)
        .reduce((s, i) => s + i.agencyFee, 0);

    const thisMonth = sumOf(key(now));
    const lastMonth = sumOf(key(now) - 1);
    return {
      total: paid.reduce((s, i) => s + i.agencyFee, 0),
      thisMonth,
      lastMonth,
      deltaPct: lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null,
      daysLeft: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate(),
    };
  }, [invoices]);

  const goal = me?.targetMonthly ?? 0;
  const progress = goal > 0 ? Math.min(1, revenue.thisMonth / goal) : 0;

  const newLeads = (leads ?? []).filter((l) => l.status === "NEW").length;

  const topCreators = useMemo(
    () => [...(creators ?? [])].sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 2),
    [creators],
  );

  const liveCampaigns = useMemo(
    () => (campaigns ?? []).filter((c) => c.status === "ACTIVE"),
    [campaigns],
  );

  const reminderRows = useMemo(
    () =>
      [...(reminders ?? [])]
        .sort((a, b) => Number(a.done) - Number(b.done) || +new Date(a.dueAt) - +new Date(b.dueAt))
        .slice(0, 2),
    [reminders],
  );

  const activity = (notifications?.items ?? []).slice(0, 3);
  const unread = notifications?.unreadCount ?? 0;

  /* ------------------------------ sheet state ----------------------------- */
  const stored = frequency === "Yearly" ? me?.targetYearly : me?.targetMonthly;
  const amount = typed ?? (stored != null ? inr(stored) : "");
  const digits = Number(amount.replace(/[^0-9]/g, ""));

  const saving = saveTarget.isPending;
  const canSave = digits > 0 && !saving;

  /**
   * Persist the goal onto the signed-in user via PATCH /auth/me. Which column is
   * written follows the frequency picker, matching the two the User row stores.
   * On success the hook seeds the ["me"] cache with the fresh row, so the
   * revenue card behind the sheet is already correct as it closes.
   */
  const submit = () => {
    if (!canSave) return;
    setError(null);
    saveTarget.mutate(
      frequency === "Yearly" ? { targetYearly: digits } : { targetMonthly: digits },
      {
        onSuccess: () => router.back(),
        // `typed` is deliberately left alone — the sheet stays open showing
        // exactly what was entered so the save can be retried.
        onError: (e: unknown) =>
          setError(e instanceof Error && e.message ? e.message : "Couldn't save your target."),
      },
    );
  };

  return (
    <Screen height={FRAME_H} background={BG} scroll>
      {/* Frame wash — #f9e4e8 @20% fading out over the first 256pt ----------- */}
      <LinearGradient
        colors={["rgba(249,228,232,0.2)", "rgba(249,228,232,0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", left: 0, top: 0, width: FRAME_W, height: 256 }}
      />

      {/* ================================ Header ============================= */}
      <Avatar x={20} y={58} size={48} uri={me?.avatarUrl} name={me?.name} />
      <Txt x={80} y={56} w={180} size={24} weight="medium" color={INK} lineHeight={32} letterSpacing={-0.6} numberOfLines={1}>
        {me?.name ?? ""}
      </Txt>
      <Txt x={80} y={88} w={180} weight="light" size={14} font="inter" color={INK60} lineHeight={20} letterSpacing={-0.35} numberOfLines={1}>
        {me?.role ? roleLabel(me.role) : ""}
      </Txt>
      <Abs x={267} y={62} w={40} h={40} radius={20} bg={DARK} center>
        <Feather name="mail" size={20} color={CREAM} />
      </Abs>
      <Pressable
        onPress={() => router.push("/agency/profile/notifications")}
        style={{
          position: "absolute", left: 315, top: 62, width: 40, height: 40, borderRadius: 20,
          backgroundColor: DARK, alignItems: "center", justifyContent: "center",
        }}
      >
        <Feather name="bell" size={20} color={CREAM} />
      </Pressable>
      {unread > 0 ? <Abs x={342} y={63} w={12} h={12} radius={6} bg="#ffcdea" /> : null}

      {/* ===================== Dashboard body (clips 375x670) ================ */}
      <Abs x={0} y={BODY_Y} w={FRAME_W} h={BODY_H} style={{ overflow: "hidden" }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ height: CONTENT_BOTTOM - BODY_Y }}
        >
          {/* children keep raw frame coordinates; the wrapper takes the offset */}
          <View style={{ position: "absolute", left: 0, top: -BODY_Y, width: FRAME_W, height: CONTENT_BOTTOM }}>
            {/* ------------------------- Availability ---------------------- */}
            <Abs x={20} y={137.5} w={335} h={42} radius={21} bg={GLASS40} border={HAIRLINE} borderWidth={1} />
            <Abs x={37} y={153.5} w={10} h={10} radius={5} bg="#05df72" />
            <Txt x={57} y={147.75} w={146.63} size={13} weight="medium" color={INK80} lineHeight={19.5}>
              Active
            </Txt>
            <Abs x={302} y={148.5} w={36} h={20} radius={10} bg={DARK} />
            <Abs x={322} y={152.5} w={12} h={12} radius={6} bg={BG} />

            {/* ------------------------- Leads nudge ----------------------- */}
            <Pressable
              onPress={() => router.push("/agency/leads/leads-list")}
              style={{
                position: "absolute", left: 20, top: 199.5, width: 335, height: 83.5,
                borderRadius: 24, backgroundColor: "#e2ebe2",
                borderWidth: 1, borderColor: HAIRLINE, overflow: "hidden",
              }}
            >
              <Abs x={254} y={-15} w={96} h={96} radius={48} bg="rgba(212,226,212,0.3)" />
              <Abs x={21} y={21.75} w={40} h={40} radius={20} bg={GLASS50} center>
                <Feather name="users" size={20} color={INK} />
              </Abs>
              <Txt x={77} y={21} w={200} size={16} weight="medium" color={INK} lineHeight={24} numberOfLines={1}>
                {`${newLeads} new lead${newLeads === 1 ? "" : "s"} waiting`}
              </Txt>
              <Txt x={77} y={46.5} w={150} size={12} font="inter" color={INK70} lineHeight={16}>
                Tap to review pipeline
              </Txt>
              <Abs x={282} y={25.75} w={32} h={32} radius={16} bg={DARK} center>
                <Feather name="arrow-right" size={16} color={CREAM} />
              </Abs>
            </Pressable>

            {/* -------------------------- Performance ---------------------- */}
            <Heading x={24} y={303} w={127}>
              Performance
            </Heading>
            <Abs x={20} y={352} w={161.5} h={130} radius={24} bg="#f6f3e6" border={HAIRLINE} borderWidth={1} />
            <Txt x={41} y={373} w={119.5} size={12} weight="semibold" font="inter" color={INK60} lineHeight={16}>
              This Month
            </Txt>
            <Txt x={41} y={408} w={119.5} size={24} weight="bold" font="inter" color={INK} lineHeight={32} numberOfLines={1}>
              {thousands(revenue.thisMonth)}
            </Txt>
            <Txt x={41} y={444} w={119.5} size={11} weight="medium" font="inter" color={INK60} lineHeight={16.5}>
              Expected this week
            </Txt>
            <Abs x={193.5} y={352} w={161.5} h={130} radius={24} bg="#e4ecf4" border={HAIRLINE} borderWidth={1} />
            <Txt x={214.5} y={373} w={119.5} size={12} weight="semibold" font="inter" color={INK60} lineHeight={16}>
              Last Month
            </Txt>
            <Txt x={214.5} y={408} w={119.5} size={24} weight="bold" font="inter" color={INK} lineHeight={32} numberOfLines={1}>
              {thousands(revenue.lastMonth)}
            </Txt>

            {/* ------------------- Revenue + Monthly Target ---------------- */}
            <Abs
              x={20} y={505} w={335} h={314} radius={32} bg="#f2eff6"
              border="rgba(230,225,249,0.5)" borderWidth={1}
              style={{
                overflow: "hidden",
                shadowColor: "#000000", shadowOpacity: 0.06, shadowRadius: 24,
                shadowOffset: { width: 0, height: 8 }, elevation: 2,
              }}
            >
              <Abs x={-39} y={160.5} w={192} h={192} radius={96} bg={GLASS50} />
              <Abs x={206} y={1} w={128} h={128} radius={64} bg="#f2eff6" />

              <Abs x={25} y={25} w={28} h={28} radius={14} bg={GLASS50} border={GLASS40} borderWidth={1} center>
                <Feather name="dollar-sign" size={14} color={INK} />
              </Abs>
              <Txt x={61} y={30.5} w={104.73} size={11} weight="bold" font="inter" color={INK60} lineHeight={16.5} letterSpacing={1.1}>
                TOTAL REVENUE
              </Txt>
              <Txt x={25} y={61} w={200} size={44} weight="bold" font="inter" color={INK} lineHeight={44} letterSpacing={-1.1} numberOfLines={1}>
                {compact(revenue.total)}
              </Txt>

              {/* delta pill */}
              <Abs x={25} y={117} w={182.62} h={34} radius={17} bg={GLASS80} border={GLASS50} borderWidth={1}>
                <Abs x={13} y={7} w={20} h={20} radius={10} bg="#bee3b0" center>
                  <Feather name="arrow-up" size={12} color={INK} />
                </Abs>
                <Txt x={39} y={6.25} w={60} size={13} weight="bold" font="inter" color={INK} lineHeight={19.5}>
                  {revenue.deltaPct == null
                    ? "—"
                    : `${revenue.deltaPct >= 0 ? "+" : ""}${revenue.deltaPct.toFixed(1)}%`}
                </Txt>
                <Abs x={95.95} y={9.5} w={1} h={15} bg="rgba(232,226,217,0.4)" />
                <Txt x={104.95} y={9.5} w={64.67} size={10} weight="semibold" font="inter" color={INK50} lineHeight={15}>
                  vs last month
                </Txt>
              </Abs>

              {/* monthly target block */}
              <Abs x={25} y={171} w={285} h={118} radius={20} bg={GLASS40} border={GLASS50} borderWidth={1}>
                <Txt x={17} y={17} w={107.33} size={10} weight="bold" font="inter" color={INK50} lineHeight={15} letterSpacing={1}>
                  MONTHLY TARGET
                </Txt>
                <Txt x={17} y={36} w={130} size={14} weight="bold" font="inter" color={INK40} lineHeight={21} letterSpacing={-0.35}>
                  {`${k1(revenue.thisMonth)} / ${goal > 0 ? k1(goal) : "—"}`}
                </Txt>

                {/* the pill this sheet is the open state of */}
                <Abs x={161} y={28} w={107} h={29} radius={14.5} bg="#ffffff" border="#ffffff" borderWidth={1}>
                  <Feather name="target" size={10} color={INK} style={{ position: "absolute", left: 13, top: 9.5 }} />
                  <Txt x={27} y={7} w={67} size={10} weight="bold" font="inter" color={INK} lineHeight={15} letterSpacing={0.5} align="center">
                    Set Target
                  </Txt>
                </Abs>

                {/* progress track */}
                <Abs x={17} y={69} w={251} h={10} radius={5} bg={GLASS50} style={{ overflow: "hidden" }}>
                  <Abs x={1} y={1} w={249 * progress} h={8} radius={4} bg={INK}>
                    <Abs x={249 * progress - 8} y={2} w={4} h={4} radius={2} bg={GLASS40} />
                  </Abs>
                </Abs>
                <Txt x={21} y={87} w={110} size={9} weight="bold" font="inter" color={INK40} lineHeight={13.5} letterSpacing={0.9}>
                  {`${Math.round(progress * 100)}% COMPLETE`}
                </Txt>
                <Txt x={177.78} y={87} w={86.22} size={9} weight="bold" font="inter" color={INK40} lineHeight={13.5} letterSpacing={0.9} align="right">
                  {`${revenue.daysLeft} DAYS LEFT`}
                </Txt>
              </Abs>
            </Abs>

            {/* ------------------------- Top Creators ---------------------- */}
            <Heading x={24} y={847} w={125}>
              Top Creators
            </Heading>
            <SeeAll x={306.44} y={860} onPress={() => router.push("/agency/people/assign-creators")} />
            <Abs x={20} y={896} w={335} h={174} radius={28} bg={GLASS40} border={HAIRLINE} borderWidth={1} />
            {topCreators.map((c, i) => (
              <CreatorRow key={c.id} y={CREATOR_Y + i * CREATOR_STEP} c={c} />
            ))}

            {/* ------------------------ Live Campaigns --------------------- */}
            <Heading x={30} y={1094} w={327}>
              Live Campaigns
            </Heading>
            <Abs x={6} y={1143} w={FRAME_W} h={205.5} style={{ overflow: "hidden" }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  width: CARD_PAD * 2 + Math.max(1, liveCampaigns.length) * CARD_STEP,
                  height: 205.5,
                }}
              >
                {liveCampaigns.map((c, i) => (
                  <CampaignCard
                    key={c.id}
                    left={CARD_PAD + i * CARD_STEP}
                    c={c}
                    tint={CARD_TINTS[i % CARD_TINTS.length]}
                  />
                ))}
              </ScrollView>
            </Abs>

            {/* ----------------------- Explore Services -------------------- */}
            <Heading x={27} y={1373} w={327}>
              Explore Services
            </Heading>
            <Abs x={23} y={1422} w={161.5} h={110} radius={24} bg="#e4ecf4" border="rgba(217,232,245,0.5)" borderWidth={1} />
            <Abs x={40} y={1439} w={32} h={32} radius={16} bg={GLASS60} center>
              <Feather name="video" size={16} color={INK} />
            </Abs>
            <Txt x={40} y={1475} w={127.5} size={14} weight="bold" font="inter" color={INK} lineHeight={21}>
              Videographers
            </Txt>
            <Txt x={40} y={1498} w={127.5} size={11} weight="medium" font="inter" color={INK60} lineHeight={16.5}>
              Find local talent
            </Txt>
            <Abs x={196.5} y={1422} w={161.5} h={110} radius={24} bg="#f6f3e6" border="rgba(252,244,217,0.5)" borderWidth={1} />
            <Abs x={213.5} y={1439} w={32} h={32} radius={16} bg={GLASS60} center>
              <Feather name="film" size={16} color={INK} />
            </Abs>
            <Txt x={213.5} y={1475} w={127.5} size={14} weight="bold" font="inter" color={INK} lineHeight={21}>
              Video Editors
            </Txt>
            <Txt x={213.5} y={1498} w={127.5} size={11} weight="medium" font="inter" color={INK60} lineHeight={16.5}>
              Post-production
            </Txt>

            {/* --------------------------- Reminders ----------------------- */}
            <Heading x={27} y={1576} w={106}>
              Reminders
            </Heading>
            <SeeAll x={309.44} y={1589} onPress={() => router.push("/agency/profile/reminders-list")} />
            {reminderRows.map((r, i) => {
              const y = REMINDER_Y + i * REMINDER_STEP;
              return (
                <Abs
                  key={r.id}
                  x={23} y={y} w={335} h={64} radius={20} bg={GLASS40}
                  border={HAIRLINE} borderWidth={1} opacity={r.done ? 0.7 : 1}
                >
                  {r.done ? (
                    <Abs x={13} y={22} w={20} h={20} radius={10} bg={INK} center>
                      <Feather name="check" size={12} color={CREAM} />
                    </Abs>
                  ) : (
                    <Abs x={13} y={22} w={20} h={20} radius={10} border={INK20} borderWidth={2} />
                  )}
                  <Txt x={45} y={13} w={277} size={14} weight="bold" font="inter" color={r.done ? INK60 : INK} lineHeight={21} numberOfLines={1}>
                    {r.title}
                  </Txt>
                  <Txt x={45} y={34} w={277} size={11} weight="medium" font="inter" color={r.done ? INK40 : INK60} lineHeight={16.5} numberOfLines={1}>
                    {r.done ? "Completed" : dueLabel(r.dueAt)}
                  </Txt>
                </Abs>
              );
            })}

            {/* ------------------------ Recent Activity -------------------- */}
            <Heading x={24} y={1786} w={327}>
              Recent Activity
            </Heading>
            <Abs x={20} y={1835} w={335} h={273.25} radius={28} bg={GLASS40} border={HAIRLINE} borderWidth={1} />
            <Abs x={57} y={1856} w={1} h={231.25} bg="rgba(232,226,217,0.8)" />
            {activity.map((n, i) => {
              const y = ACTIVITY_Y + i * ACTIVITY_STEP;
              const last = i === activity.length - 1 && activity.length > 2;
              return (
                <Abs key={n.id} opacity={last ? 0.6 : 1}>
                  <Abs
                    x={45} y={y + 1} w={24} h={24} radius={12}
                    bg={ACTIVITY_DOTS[i % ACTIVITY_DOTS.length]}
                    border={CREAM} borderWidth={2} center
                  >
                    <Abs x={7} y={7} w={6} h={6} radius={3} bg={last ? INK50 : INK} />
                  </Abs>
                  <Txt x={82} y={y} w={252} size={15} weight="bold" font="inter" color={INK} lineHeight={18.75} numberOfLines={1}>
                    {n.title}
                  </Txt>
                  <Txt x={82} y={y + 21.75} w={252} size={12} weight="medium" font="inter" color={INK60} lineHeight={16} numberOfLines={1}>
                    {n.body ?? ""}
                  </Txt>
                  <Txt x={82} y={y + 41.75} w={252} size={10} weight="bold" font="inter" color={INK40} lineHeight={15} letterSpacing={0.5}>
                    {ago(n.createdAt)}
                  </Txt>
                </Abs>
              );
            })}
            <LinearGradient
              colors={["rgba(249,246,238,0)", "rgba(249,246,238,0.8)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{ position: "absolute", left: 21, top: 2011.25, width: 333, height: 96 }}
              pointerEvents="none"
            />
          </View>
        </ScrollView>
      </Abs>

      {/* ============================== Bottom nav =========================== */}
      <Abs
        x={9} y={794} w={357} h={72} radius={32}
        bg="rgba(255,255,255,0.54)" border="rgba(249,248,246,0.78)" borderWidth={1}
      />
      <Feather name="home" size={24} color={NAV_ON} style={{ position: "absolute", left: 34, top: 818 }} />
      <Abs x={44} y={846} w={4} h={4} radius={2} bg={NAV_ON} />
      <Pressable onPress={() => router.push("/agency/campaigns/active-campaigns")} style={{ position: "absolute", left: 115, top: 818 }}>
        <Feather name="credit-card" size={24} color={NAV_OFF} />
      </Pressable>
      <Abs x={157} y={765} w={60} h={60} radius={30} bg={BG} center>
        <Abs x={6} y={6} w={48} h={48} radius={24} bg="#ffcdea" center>
          <Feather name="plus" size={24} color="#1c1c1e" />
        </Abs>
      </Abs>
      <Pressable onPress={() => router.push("/agency/payments/invoice-reminders")} style={{ position: "absolute", left: 236, top: 818 }}>
        <Feather name="pie-chart" size={24} color={NAV_OFF} />
      </Pressable>
      <Pressable onPress={() => router.push("/agency/profile/profile-home")} style={{ position: "absolute", left: 317, top: 818 }}>
        <Feather name="user" size={24} color={NAV_OFF} />
      </Pressable>

      {/* ================================ Scrim ============================== */}
      <Pressable
        onPress={() => router.back()}
        style={{
          position: "absolute", left: 0, top: 1, width: FRAME_W, height: FRAME_H,
          backgroundColor: "rgba(181,180,185,0.57)",
        }}
      />

      {/* ============================= Bottom sheet ========================== */}
      <Abs
        x={0} y={SHEET_Y} w={FRAME_W} h={SHEET_H} bg="#ffffff"
        style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
      >
        <Abs x={167.5} y={16} w={40} h={4} radius={2} bg="#e5e5e5" />

        <Txt x={24} y={44} w={280} size={24} weight="semibold" font="inter" color="#111111" lineHeight={29.05} letterSpacing={-0.52}>
          Set Your Revenue Target
        </Txt>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            position: "absolute", left: 315, top: 44, width: 36, height: 36, borderRadius: 18,
            backgroundColor: "#f8f8f8", alignItems: "center", justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Feather name="x" size={14} color="#555555" />
        </Pressable>

        {/* --------------------------- Amount field ------------------------- */}
        <FieldLabel y={106}>How much do you want to earn?</FieldLabel>
        <Abs
          x={24} y={131} w={327} h={52} radius={20} bg={GLASS80}
          border="#e8e8e8" borderWidth={1}
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

        {/* -------------------------- Frequency field ----------------------- */}
        <FieldLabel y={200}>Choose Frequency</FieldLabel>
        <Pressable
          onPress={() =>
            setFrequency(FREQUENCIES[(FREQUENCIES.indexOf(frequency) + 1) % FREQUENCIES.length])
          }
          style={({ pressed }) => ({
            position: "absolute", left: 24, top: 225, width: 327, height: 52, borderRadius: 20,
            backgroundColor: GLASS80, borderWidth: 1, borderColor: "#e5e5e5",
            opacity: pressed ? 0.85 : 1,
            shadowColor: "#000000", shadowOpacity: 0.02, shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 }, elevation: 1,
          })}
        >
          <Txt x={21} y={17} w={268} size={15} weight="medium" font="inter" color="#111827" lineHeight={18.15}>
            {frequency}
          </Txt>
          <Feather name="chevron-down" size={16} color="#6b7280" style={{ position: "absolute", left: 291, top: 18 }} />
        </Pressable>

        {/* ------------------------------- CTA ------------------------------ */}
        <Pressable
          onPress={submit}
          disabled={!canSave}
          style={({ pressed }) => ({
            position: "absolute", left: 37, top: 299.72, width: 301, height: 55, borderRadius: 100,
            backgroundColor: "#312b28", opacity: canSave ? (pressed ? 0.9 : 1) : 0.5,
            shadowColor: "#312b28", shadowOpacity: 0.25, shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 }, elevation: 6,
          })}
        >
          <Txt x={0} y={18} w={301} size={16} weight="bold" font="inter" color="#ffffff" lineHeight={19.36} align="center">
            Set Target
          </Txt>
        </Pressable>

        {/*
          Failure message. Occupies the sheet's empty bottom padding (the CTA
          ends at 354.72, the sheet at 383), so the design is untouched in its
          normal state — this renders only after a save actually fails.
        */}
        {error ? (
          <Txt
            x={37} y={360} w={301} size={11} weight="medium" font="inter"
            color="#b42318" lineHeight={16.5} align="center" numberOfLines={2}
          >
            {error}
          </Txt>
        ) : null}
      </Abs>
    </Screen>
  );
}
