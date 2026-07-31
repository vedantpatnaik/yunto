import { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import {
  compact,
  inr,
  useCreators,
  useInvoices,
  useLeads,
  useMe,
  useNotifications,
  useReminders,
  type Invoice,
  type Lead,
} from "../../../src/api/hooks";

/**
 * Home — Sales role — Figma frame 7756:8845 "Sales- Home", traced 1:1.
 *
 * The sales operator's landing tab. The design frame is the unclipped 2504pt
 * scroll canvas; the device viewport is 375x876, so the frame decomposes into
 * three layers, exactly as the spec stacks them:
 *
 *   1. Backdrop + header — the 375x256 pink gradient wash on #f8f5ef and the
 *      375x124 header container (avatar, name/role, mail, bell + badge). Fixed.
 *   2. Body — "Container" (0,124 375x2269), whose sections run from the Active
 *      pill at 137.5 to the Recent Activity card ending at 2202.25. It owns the
 *      vertical ScrollView; a single -124 offset on the inner canvas lets every
 *      child keep its raw frame coordinate.
 *   3. Tab bar — the 357x72 glass pill at y=2393 plus the 60x60 centre FAB at
 *      y=2364. Both sit 111/140pt off the frame's bottom edge, so they pin to
 *      the same offsets inside the 876 viewport and are drawn last.
 *
 * Section order down the body: Active status pill, "N new leads waiting" alert,
 * the Lead Matrix 2x2 (node 7876:13492 — the most recently edited node on the
 * page, so this frame is the current one), Performance, the TOTAL REVENUE hero
 * with its MONTHLY TARGET sub-card, Top Creators, Explore Services, Reminders
 * and Recent Activity.
 *
 * Every coordinate, colour, size and weight below is lifted from the spec;
 * <Screen> scales the 375pt canvas to the device. Geist maps to Outfit, the
 * file's primary face; fontWeight 500 -> medium, 600 -> semibold, 700 -> bold.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const VIEWPORT_H = 876; // device frame; the design canvas is 2504 tall

const BODY_Y = 124; // "Container" (0,124 375x2269) — the scroll viewport top
const CONTENT_BOTTOM = 2393; // …and its lower edge, where the tab bar begins

const DESIGN_H = 2504;
const TAB_Y = VIEWPORT_H - (DESIGN_H - 2393); // 765 — glass pill top
const FAB_Y = VIEWPORT_H - (DESIGN_H - 2364); // 736 — centre FAB top

/** Lead Matrix / Performance / Explore Services tiles share one 130pt box. */
const TILE_H = 130;
const CREATOR_STEP = 82; // 74 row + 8 gap
const REMINDER_STEP = 72; // 64 row + 8 gap
const ACTIVITY_STEP = 79.75;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const INK = "#1e1e1e";
const INK_80 = "rgba(30,30,30,0.8)";
const INK_70 = "rgba(30,30,30,0.7)";
const INK_60 = "rgba(30,30,30,0.6)";
const INK_50 = "rgba(30,30,30,0.5)";
const INK_40 = "rgba(30,30,30,0.4)";
const INK_20 = "rgba(30,30,30,0.2)";
const DARK = "#1f1a17";
const ON_DARK = "#f1eee8";
const ON_DARK_ALT = "#f9f6ee";
const BORDER = "#e8e2d9";
const BORDER_50 = "rgba(232,226,217,0.5)";
const BORDER_80 = "rgba(232,226,217,0.8)";
const BORDER_40 = "rgba(232,226,217,0.4)";
const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const HERO_BG = "#f2eff6";
const HERO_BORDER = "rgba(230,225,249,0.5)";
const ACCENT = "#ffcdea";
const TAB_IDLE = "#9a8ea3";
const TAB_ACTIVE = "#e36eb2";

/* ------------------------------ derivations ------------------------------- */
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const STALE = DAY; // a NEW lead untouched for a day has gone unattended

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const pad2 = (n: number) => String(n).padStart(2, "0");

/** "8,400k" — the thousands-grouped k the Performance tiles are set in. */
const kLabel = (n: number) => `${inr(Math.round(n / 1000))}k`;

/** "42.8k" — the one-decimal k of the MONTHLY TARGET line. */
const tenthK = (n: number) => `${(n / 1000).toFixed(1)}k`;

const clampPct = (n: number) => (n > 100 ? 100 : n < 0 ? 0 : n);

/**
 * LeadStatus has no UNATTENDED or WON member, so both are derived the same way
 * the Leads screen derives them: CONVERTED is the win, and a NEW lead nobody
 * has touched in a day is unattended. DEAD leads have left the pipeline.
 */
type Bucket = "UNATTENDED" | "NEW" | "CONTACTED" | "WON";

function bucketOf(lead: Lead, now: number): Bucket | null {
  if (lead.status === "CONVERTED") return "WON";
  if (lead.status === "CONTACTED" || lead.status === "CONNECTED") return "CONTACTED";
  if (lead.status !== "NEW") return null;
  const touched = lead.updatedAt ? new Date(lead.updatedAt).getTime() : now;
  return now - touched > STALE ? "UNATTENDED" : "NEW";
}

/** Calendar month window, `offset` months from the current one. */
function monthWindow(offset: number): { from: number; to: number } {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth() + offset, 1).getTime(),
    to: new Date(now.getFullYear(), now.getMonth() + offset + 1, 1).getTime(),
  };
}

function sumPayout(list: Invoice[], from: number, to: number): number {
  return list.reduce((sum, i) => {
    const t = i.createdAt ? new Date(i.createdAt).getTime() : 0;
    return t >= from && t < to ? sum + i.payout : sum;
  }, 0);
}

/** "Due today at 5 PM" — the exact format the pending reminder row is set in. */
function dueLabel(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours() % 12 || 12;
  const mins = d.getMinutes();
  const clock = `${h}${mins ? `:${pad2(mins)}` : ""} ${d.getHours() >= 12 ? "PM" : "AM"}`;
  return d.toDateString() === new Date().toDateString()
    ? `Due today at ${clock}`
    : `Due ${d.getDate()} ${MONTHS[d.getMonth()]} at ${clock}`;
}

/** "2H AGO" / "YESTERDAY" — the uppercase stamp on the activity rows. */
function agoLabel(iso: string, now: number): string {
  const hrs = Math.floor((now - new Date(iso).getTime()) / HOUR);
  if (hrs < 1) return "JUST NOW";
  if (hrs < 24) return `${hrs}H AGO`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "YESTERDAY" : `${days}D AGO`;
}

/** SALES_MANAGER -> "Manager"; the header sets the bare rank under the name. */
function roleLabel(role: string | undefined): string {
  if (!role) return "";
  const word = role.split("_").pop() ?? role;
  return word.charAt(0) + word.slice(1).toLowerCase();
}

/* --------------------------------- tiles ---------------------------------- */
/**
 * The 130pt stat tile shared by the Lead Matrix 2x2 and the Performance pair:
 * 20pt padding, a 12/600 label, a 24/700 value and an optional 11/500 caption.
 */
function Tile({
  x, y, w, bg, border, label, value, caption, onPress,
}: {
  x: number; y: number; w: number; bg: string; border: string;
  label: string; value: string; caption?: string; onPress?: () => void;
}) {
  const inner = w - 42;
  return (
    <Abs x={x} y={y} w={w} h={TILE_H} radius={24} bg={bg} border={border} borderWidth={1} style={styles.tile}>
      <Pressable onPress={onPress} disabled={!onPress} style={styles.fill}>
        <Txt x={21} y={21} w={inner} size={12} weight="semibold" font="inter" color={INK_60} lineHeight={16} numberOfLines={1}>
          {label}
        </Txt>
        <Txt x={21} y={56} w={inner} size={24} weight="bold" font="inter" color={INK} lineHeight={32} numberOfLines={1}>
          {value}
        </Txt>
        {caption ? (
          <Txt x={21} y={92} w={inner} size={11} weight="medium" font="inter" color={INK_60} lineHeight={16.5} numberOfLines={1}>
            {caption}
          </Txt>
        ) : null}
      </Pressable>
    </Abs>
  );
}

/* ------------------------------ section title ----------------------------- */
function Heading({ x, y, w, children }: { x: number; y: number; w: number; children: string }) {
  return (
    <Txt x={x} y={y} w={w} size={22} weight="medium" color={INK} lineHeight={33} letterSpacing={-0.55}>
      {children}
    </Txt>
  );
}

/** The 14/600 "See all" / "See Request" link that trails each section title. */
function SeeLink({
  x, y, w, label, onPress,
}: { x: number; y: number; w: number; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tap, { left: x, top: y }]}>
      <Txt w={w} size={14} weight="semibold" font="inter" color={INK_60} lineHeight={20}>
        {label}
      </Txt>
    </Pressable>
  );
}

/* ------------------------------ creator rows ------------------------------ */
/** 317x74 white row inside the Top Creators panel; offsets are row-relative. */
function CreatorRow({
  y, avatarUrl, name, niche, eng,
}: { y: number; avatarUrl?: string; name: string; niche: string; eng: string }) {
  return (
    <Abs x={29} y={y} w={317} h={74} radius={20} bg="#ffffff" border={BORDER_50} borderWidth={1} style={styles.creatorRow}>
      <Abs x={13} y={13} w={48} h={48} radius={24} bg="#e6e1f9" style={styles.clip}>
        {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.creatorAvatar} /> : null}
      </Abs>
      <Txt x={77} y={16.75} w={163.66} size={15} weight="bold" font="inter" color={INK} lineHeight={22.5} numberOfLines={1}>
        {name}
      </Txt>
      <Txt x={77} y={40.25} w={163.66} size={12} weight="medium" font="inter" color={INK_60} lineHeight={16} numberOfLines={1}>
        {niche}
      </Txt>
      <Txt x={256.66} y={17.25} w={39.34} align="right" size={15} weight="bold" font="inter" color={INK} lineHeight={22.5} numberOfLines={1}>
        {eng}
      </Txt>
      <Txt
        x={273.36}
        y={40.75}
        w={22.64}
        align="right"
        size={10}
        weight="semibold"
        font="inter"
        color={INK_50}
        lineHeight={15}
        letterSpacing={0.5}
      >
        ENG
      </Txt>
    </Abs>
  );
}

/* ----------------------------- reminder rows ------------------------------ */
/** 335x64 glass row; done rows drop to 0.7 opacity and swap the check disc. */
function ReminderRow({
  y, title, meta, done, onPress,
}: { y: number; title: string; meta: string; done: boolean; onPress: () => void }) {
  return (
    <Abs
      x={23}
      y={y}
      w={335}
      h={64}
      radius={20}
      bg={GLASS_40}
      border={BORDER}
      borderWidth={1}
      opacity={done ? 0.7 : undefined}
      style={styles.tile}
    >
      <Pressable onPress={onPress} style={styles.fill}>
        {done ? (
          <Abs x={13} y={22} w={20} h={20} radius={10} bg={INK} center>
            <Feather name="check" size={12} color={ON_DARK_ALT} />
          </Abs>
        ) : (
          <Abs x={13} y={22} w={20} h={20} radius={10} border={INK_20} borderWidth={2} />
        )}
        <Txt
          x={45}
          y={13}
          w={277}
          size={14}
          weight="bold"
          font="inter"
          color={done ? INK_60 : INK}
          lineHeight={21}
          numberOfLines={1}
        >
          {title}
        </Txt>
        <Txt
          x={45}
          y={34}
          w={277}
          size={11}
          weight="medium"
          font="inter"
          color={done ? INK_40 : INK_60}
          lineHeight={16.5}
          numberOfLines={1}
        >
          {meta}
        </Txt>
      </Pressable>
    </Abs>
  );
}

/* ------------------------------ activity rows ----------------------------- */
/** Timeline dot fills, in the order the three rows are tinted in the design. */
const ACTIVITY_DOTS = ["#e6e1f9", "#fcf4d9", "#e8e2d9"];

/* --------------------------------- screen --------------------------------- */
export default function SalesHome() {
  const router = useRouter();

  const { data: me } = useMe();
  const { data: leads = [] } = useLeads();
  const { data: creators = [], isLoading: creatorsLoading } = useCreators();
  const { data: invoices = [] } = useInvoices();
  const { data: reminders = [], isLoading: remindersLoading } = useReminders();
  const { data: notifications } = useNotifications();

  /* ---- leads: alert banner + the Lead Matrix 2x2 ---- */
  const matrix = useMemo(() => {
    const now = Date.now();
    const tally: Record<Bucket, number> = { UNATTENDED: 0, NEW: 0, CONTACTED: 0, WON: 0 };
    let contactedFresh = 0;

    for (const lead of leads) {
      const bucket = bucketOf(lead, now);
      if (!bucket) continue;
      tally[bucket] += 1;
      // "85% active" under Contacted — the share of contacted leads that have
      // moved in the last week. Nothing in the schema flags activity directly.
      if (bucket === "CONTACTED") {
        const touched = lead.updatedAt ? new Date(lead.updatedAt).getTime() : now;
        if (now - touched < 7 * DAY) contactedFresh += 1;
      }
    }

    const activePct =
      tally.CONTACTED > 0 ? Math.round((contactedFresh / tally.CONTACTED) * 100) : 0;
    return { ...tally, activePct };
  }, [leads]);

  /* ---- invoices: Performance pair, revenue hero, monthly target ---- */
  const money = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "PAID");
    const total = paid.reduce((sum, i) => sum + i.payout, 0);

    const thisM = monthWindow(0);
    const lastM = monthWindow(-1);
    const thisMonth = sumPayout(paid, thisM.from, thisM.to);
    const lastMonth = sumPayout(paid, lastM.from, lastM.to);
    const deltaPct = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    const target = me?.targetMonthly ?? 0;
    const pct = target > 0 ? clampPct(Math.round((thisMonth / target) * 100)) : 0;

    const now = new Date();
    const daysLeft =
      new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

    return { total, thisMonth, lastMonth, deltaPct, target, pct, daysLeft };
  }, [invoices, me]);

  /* ---- creators: the two rows the 174pt panel holds ---- */
  const topCreators = useMemo(
    () => [...creators].sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 2),
    [creators],
  );

  const reminderRows = reminders.slice(0, 2);
  const activityRows = notifications?.items?.slice(0, 3) ?? [];
  const unread = notifications?.unreadCount ?? 0;
  const now = Date.now();

  const goLeads = () => router.push("/agency/leads/leads-list");
  const goRequests = () => router.push("/agency/campaigns/campaign-requests");
  const goNotifications = () => router.push("/agency/profile/notifications");

  return (
    <Screen height={VIEWPORT_H} background={PAGE} scroll>
      {/* ===================== backdrop — 375x256 gradient ==================== */}
      <LinearGradient
        colors={["rgba(249,228,232,0.2)", "rgba(249,228,232,0)"] as const}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.wash}
      />

      {/* ======================= body — Container 0,124 ======================= */}
      <Abs x={0} y={BODY_Y} w={FRAME_W} h={VIEWPORT_H - BODY_Y} style={styles.clip}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ height: CONTENT_BOTTOM - BODY_Y }}
        >
          {/* One -124 offset, so everything below keeps raw frame coordinates. */}
          <Abs x={0} y={-BODY_Y} w={FRAME_W} h={CONTENT_BOTTOM}>
            {/* -------------------- 1. Active status pill (137.5) ------------------- */}
            <Abs x={20} y={137.5} w={335} h={42} radius={999} bg={GLASS_40} border={BORDER} borderWidth={1} style={styles.statusPill}>
              <Abs x={17} y={16} w={10} h={10} radius={5} bg="#05df72" style={styles.presenceDot} />
              <Txt x={37} y={10.25} w={39} size={13} weight="medium" color={INK_80} lineHeight={19.5}>
                Active
              </Txt>
              <Abs x={282} y={11} w={36} h={20} radius={999} bg={DARK}>
                <Abs x={20} y={4} w={12} h={12} radius={6} bg={PAGE} />
              </Abs>
            </Abs>

            {/* --------------------- 2. new-leads alert (199.5) --------------------- */}
            <Abs x={20} y={199.5} w={335} h={83.5} radius={24} bg="#e2ebe2" border={BORDER} borderWidth={1} style={styles.alert}>
              {/* Blurred mint orb, clipped by the card as in the design. */}
              <Abs x={254} y={-15} w={96} h={96} radius={48} bg="rgba(212,226,212,0.3)" />
              <Abs x={21} y={21.75} w={40} h={40} radius={20} bg={GLASS_50} center>
                <Feather name="inbox" size={20} color={INK} />
              </Abs>
              <Txt x={77} y={21} w={149} size={16} weight="medium" color={INK} lineHeight={24} numberOfLines={1}>
                {`${matrix.NEW} new ${matrix.NEW === 1 ? "lead" : "leads"} waiting`}
              </Txt>
              <Txt x={77} y={46.5} w={124} size={12} weight="regular" font="inter" color={INK_70} lineHeight={16}>
                Tap to review pipeline
              </Txt>
              <Pressable onPress={goLeads} style={styles.alertButton}>
                <Feather name="chevron-right" size={16} color={ON_DARK_ALT} />
              </Pressable>
            </Abs>

            {/* ---------- 3. Lead Matrix — node 7876:13492 (303 → 628) ---------- */}
            <Heading x={19} y={303} w={117}>
              Lead Matrix
            </Heading>
            <SeeLink x={311.44} y={311} w={44.56} label="See all" onPress={goLeads} />

            <Tile
              x={15}
              y={352}
              w={171.5}
              bg="#fef0f4"
              border={BORDER}
              label="Unattended"
              value={pad2(matrix.UNATTENDED)}
              caption="Needs response"
              onPress={goLeads}
            />
            <Tile
              x={195}
              y={352}
              w={165}
              bg="#e2ebe2"
              border={BORDER}
              label="New Leads"
              value={pad2(matrix.NEW)}
              onPress={goLeads}
            />
            <Tile
              x={15}
              y={498}
              w={171.5}
              bg="#e8f3ff"
              border="#dfeeff"
              label="Contacted"
              value={pad2(matrix.CONTACTED)}
              caption={`${matrix.activePct}% active`}
              onPress={goLeads}
            />
            <Tile
              x={195}
              y={498}
              w={165}
              bg="#e9e1ff"
              border={BORDER}
              label="Won"
              value={pad2(matrix.WON)}
              onPress={goLeads}
            />

            {/* --------------------- 4. Performance (661 → 840) --------------------- */}
            <Heading x={24} y={661} w={127}>
              Performance
            </Heading>
            <Tile
              x={20}
              y={710}
              w={161.5}
              bg="#f6f3e6"
              border={BORDER}
              label="This Month "
              value={kLabel(money.thisMonth)}
              caption="Expected this week"
            />
            <Tile
              x={193.5}
              y={710}
              w={161.5}
              bg="#e4ecf4"
              border={BORDER}
              label="Last Month"
              value={kLabel(money.lastMonth)}
            />

            {/* ------------- 5. TOTAL REVENUE hero card (863 → 1177) ------------- */}
            <Abs x={20} y={863} w={335} h={314} radius={32} bg={HERO_BG} border={HERO_BORDER} borderWidth={1} style={styles.hero}>
              {/* Two soft discs bleeding past the card edges, clipped by it. */}
              <Abs x={-39} y={160.5} w={192} h={192} radius={96} bg={GLASS_50} />
              <Abs x={206} y={1} w={128} h={128} radius={64} bg={HERO_BG} />

              <Abs x={25} y={25} w={28} h={28} radius={14} bg={GLASS_50} border="rgba(255,255,255,0.4)" borderWidth={1} center>
                <MaterialCommunityIcons name="currency-inr" size={14} color={INK} />
              </Abs>
              <Txt
                x={61}
                y={30.5}
                w={104.73}
                size={11}
                weight="bold"
                font="inter"
                color={INK_60}
                lineHeight={16.5}
                letterSpacing={1.1}
                numberOfLines={1}
              >
                TOTAL REVENUE
              </Txt>
              <Txt x={25} y={61} w={182.62} size={44} weight="bold" font="inter" color={INK} lineHeight={44} letterSpacing={-1.1} numberOfLines={1}>
                {compact(money.total)}
              </Txt>

              <Abs x={25} y={117} w={182.62} h={34} radius={999} bg={GLASS_80} border={GLASS_50} borderWidth={1} style={styles.deltaPill}>
                <Abs x={13} y={7} w={20} h={20} radius={10} bg="#bee3b0" center>
                  <Feather name="arrow-up-right" size={12} color={INK} />
                </Abs>
                <Txt x={39} y={6.25} w={48.95} size={13} weight="bold" font="inter" color={INK} lineHeight={19.5} numberOfLines={1}>
                  {`${money.deltaPct >= 0 ? "+" : ""}${money.deltaPct.toFixed(1)}%`}
                </Txt>
                <Abs x={95.95} y={9.5} w={1} h={15} bg={BORDER_40} />
                <Txt x={104.95} y={9.5} w={64.67} size={10} weight="semibold" font="inter" color={INK_50} lineHeight={15} numberOfLines={1}>
                  vs last month
                </Txt>
              </Abs>

              {/* ---- MONTHLY TARGET sub-card (45,1034 285x118) ---- */}
              <Abs x={25} y={171} w={285} h={118} radius={20} bg={GLASS_40} border={GLASS_50} borderWidth={1}>
                <Txt
                  x={17}
                  y={17}
                  w={107.33}
                  size={10}
                  weight="bold"
                  font="inter"
                  color={INK_50}
                  lineHeight={15}
                  letterSpacing={1}
                  numberOfLines={1}
                >
                  MONTHLY TARGET
                </Txt>
                <Txt
                  x={17}
                  y={36}
                  w={140}
                  size={14}
                  weight="bold"
                  font="inter"
                  color={INK_40}
                  lineHeight={21}
                  letterSpacing={-0.35}
                  numberOfLines={1}
                >
                  {`${tenthK(money.thisMonth)} / ${tenthK(money.target)}`}
                </Txt>

                <Pressable onPress={() => router.push("/agency/payments/set-revenue-target")} style={styles.setTarget}>
                  <Abs x={13} y={9.5} w={10} h={10} center>
                    <Feather name="target" size={10} color={INK} />
                  </Abs>
                  <Txt
                    x={27}
                    y={7}
                    w={67}
                    align="center"
                    size={10}
                    weight="bold"
                    font="inter"
                    color={INK}
                    lineHeight={15}
                    letterSpacing={0.5}
                  >
                    SET TARGET
                  </Txt>
                </Pressable>

                <Abs x={17} y={69} w={251} h={10} radius={999} bg={GLASS_50} style={styles.clip}>
                  <Abs x={1} y={1} w={(249 * money.pct) / 100} h={8} radius={999} bg={INK}>
                    {money.pct > 5 ? (
                      <Abs x={(249 * money.pct) / 100 - 8} y={2} w={4} h={4} radius={2} bg={GLASS_40} />
                    ) : null}
                  </Abs>
                </Abs>

                <Txt
                  x={21}
                  y={87}
                  w={83.38}
                  size={9}
                  weight="bold"
                  font="inter"
                  color={INK_40}
                  lineHeight={13.5}
                  letterSpacing={0.9}
                  numberOfLines={1}
                >
                  {`${money.pct}% COMPLETE`}
                </Txt>
                <Txt
                  x={197.78}
                  y={87}
                  w={66.22}
                  size={9}
                  weight="bold"
                  font="inter"
                  color={INK_40}
                  lineHeight={13.5}
                  letterSpacing={0.9}
                  numberOfLines={1}
                >
                  {`${money.daysLeft} DAYS LEFT`}
                </Txt>
              </Abs>
            </Abs>

            {/* ------------------ 6. Top Creators (1205 → 1428) ------------------ */}
            <Heading x={24} y={1205} w={125}>
              Top Creators
            </Heading>
            <SeeLink
              x={306.44}
              y={1218}
              w={44.56}
              label="See all"
              onPress={() => router.push("/agency/people/assign-creators")}
            />

            <Abs x={20} y={1254} w={335} h={174} radius={28} bg={GLASS_40} border={BORDER} borderWidth={1} style={styles.panel}>
              {topCreators.map((c, i) => (
                <CreatorRow
                  key={c.id}
                  y={9 + i * CREATOR_STEP}
                  avatarUrl={c.avatarUrl}
                  name={c.name}
                  niche={c.niche ?? c.handle}
                  eng={`${c.engagementRate.toFixed(1)}%`}
                />
              ))}
              {topCreators.length === 0 ? (
                <Txt x={26} y={30} w={283} size={12} weight="medium" font="inter" color={INK_60} lineHeight={16}>
                  {creatorsLoading ? "Loading creators…" : "No creators yet"}
                </Txt>
              ) : null}
            </Abs>

            {/* ---------------- 7. Explore Services (1467 → 1626) ---------------- */}
            <Heading x={27} y={1467} w={165}>
              Explore Services
            </Heading>
            <SeeLink x={268} y={1480} w={86} label="See Request" onPress={goRequests} />

            <Abs x={23} y={1516} w={161.5} h={110} radius={24} bg="#e4ecf4" border="rgba(217,232,245,0.5)" borderWidth={1} style={styles.tile}>
              <Pressable onPress={() => router.push("/agency/creators/videographers-list")} style={styles.fill}>
                <Abs x={17} y={17} w={32} h={32} radius={16} bg={GLASS_60} center>
                  <Feather name="video" size={16} color={INK} />
                </Abs>
                <Txt x={17} y={53} w={127.5} size={14} weight="bold" font="inter" color={INK} lineHeight={21} numberOfLines={1}>
                  Videographers
                </Txt>
                <Txt x={17} y={76} w={127.5} size={11} weight="medium" font="inter" color={INK_60} lineHeight={16.5} numberOfLines={1}>
                  Find local talent
                </Txt>
              </Pressable>
            </Abs>
            <Abs x={196.5} y={1516} w={161.5} h={110} radius={24} bg="#f6f3e6" border="rgba(252,244,217,0.5)" borderWidth={1} style={styles.tile}>
              <Pressable onPress={() => router.push("/agency/creators/editors-list")} style={styles.fill}>
                <Abs x={17} y={17} w={32} h={32} radius={16} bg={GLASS_60} center>
                  <Feather name="film" size={16} color={INK} />
                </Abs>
                <Txt x={17} y={53} w={127.5} size={14} weight="bold" font="inter" color={INK} lineHeight={21} numberOfLines={1}>
                  Video Editors
                </Txt>
                <Txt x={17} y={76} w={127.5} size={11} weight="medium" font="inter" color={INK_60} lineHeight={16.5} numberOfLines={1}>
                  Post-production
                </Txt>
              </Pressable>
            </Abs>

            {/* -------------------- 8. Reminders (1670 → 1855) -------------------- */}
            <Heading x={27} y={1670} w={106}>
              Reminders
            </Heading>
            <SeeLink
              x={309.44}
              y={1683}
              w={44.56}
              label="See all"
              onPress={() => router.push("/agency/profile/reminders-list")}
            />

            {reminderRows.map((r, i) => (
              <ReminderRow
                key={r.id}
                y={1719 + i * REMINDER_STEP}
                title={r.title}
                meta={r.done ? "Completed" : dueLabel(r.dueAt)}
                done={r.done}
                onPress={() => router.push("/agency/profile/reminders-list")}
              />
            ))}
            {reminderRows.length === 0 ? (
              <Txt x={45} y={1732} w={277} size={14} weight="bold" font="inter" color={INK_60} lineHeight={21}>
                {remindersLoading ? "Loading reminders…" : "No reminders"}
              </Txt>
            ) : null}

            {/* ----------------- 9. Recent Activity (1880 → 2202.25) ---------------- */}
            <Heading x={24} y={1880} w={327}>
              Recent Activity
            </Heading>

            <Abs x={20} y={1929} w={335} h={273.25} radius={28} bg={GLASS_40} border={BORDER} borderWidth={1} style={styles.panel}>
              {/* The hairline the timeline discs sit on. */}
              <Abs x={37} y={21} w={1} h={231.25} bg={BORDER_80} />

              {activityRows.map((n, i) => {
                const top = 1949 + i * ACTIVITY_STEP - 1929;
                return (
                  <Abs key={n.id} x={0} y={0} w={335} h={273.25} opacity={i === 2 ? 0.6 : undefined}>
                    <Abs x={25} y={top + 1} w={24} h={24} radius={12} bg={ACTIVITY_DOTS[i]} border={ON_DARK_ALT} borderWidth={2} center>
                      <Abs x={7} y={7} w={6} h={6} radius={3} bg={INK} />
                    </Abs>
                    <Txt x={62} y={top} w={252} size={15} weight="bold" font="inter" color={INK} lineHeight={18.75} numberOfLines={1}>
                      {n.title}
                    </Txt>
                    <Txt x={62} y={top + 21.75} w={252} size={12} weight="medium" font="inter" color={INK_60} lineHeight={16} numberOfLines={1}>
                      {n.body ?? ""}
                    </Txt>
                    <Txt
                      x={62}
                      y={top + 41.75}
                      w={252}
                      size={10}
                      weight="bold"
                      font="inter"
                      color={INK_40}
                      lineHeight={15}
                      letterSpacing={0.5}
                    >
                      {agoLabel(n.createdAt, now)}
                    </Txt>
                  </Abs>
                );
              })}
              {activityRows.length === 0 ? (
                <Txt x={62} y={20} w={252} size={15} weight="bold" font="inter" color={INK_60} lineHeight={18.75}>
                  No activity yet
                </Txt>
              ) : null}

              {/* The page-colour fade over the tail of the feed. */}
              <LinearGradient
                colors={["rgba(249,246,238,0)", "rgba(249,246,238,0.8)"] as const}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.activityFade}
                pointerEvents="none"
              />
            </Abs>
          </Abs>
        </ScrollView>
      </Abs>

      {/* ========================= header — 375x124 ========================= */}
      <Abs x={20} y={58} w={48} h={48} radius={24} bg="#e6e1f9" style={styles.clip}>
        {me?.avatarUrl ? <Image source={{ uri: me.avatarUrl }} style={styles.headerAvatar} /> : null}
      </Abs>
      <Txt x={80} y={56} w={132} size={24} weight="medium" color={INK} lineHeight={32} letterSpacing={-0.6} numberOfLines={1}>
        {me?.name ?? ""}
      </Txt>
      <Txt x={80} y={88} w={132} size={14} weight="light" font="inter" color={INK_60} lineHeight={20} letterSpacing={-0.35} numberOfLines={1}>
        {roleLabel(me?.role)}
      </Txt>

      <Pressable onPress={goRequests} style={[styles.headerButton, styles.headerMail]}>
        <Feather name="mail" size={20} color={ON_DARK} />
      </Pressable>
      <Pressable onPress={goNotifications} style={[styles.headerButton, styles.headerBell]}>
        <Feather name="bell" size={20} color={ON_DARK} />
      </Pressable>
      {unread > 0 ? <Abs x={342} y={63} w={12} h={12} radius={6} bg={ACCENT} /> : null}

      {/* ============================= tab bar ============================== */}
      <Abs
        x={9}
        y={TAB_Y}
        w={357}
        h={72}
        radius={32}
        bg="rgba(255,255,255,0.54)"
        border="rgba(249,248,246,0.78)"
        borderWidth={1}
        style={styles.tabBar}
      >
        <Abs x={25} y={24} w={24} h={24} center>
          <Feather name="home" size={24} color={TAB_ACTIVE} />
        </Abs>
        <Abs x={35} y={52} w={4} h={4} radius={2} bg={TAB_ACTIVE} />

        <Pressable onPress={() => router.push("/agency/payments/invoice-reminders")} style={[styles.tabItem, { left: 106 }]}>
          <Feather name="credit-card" size={24} color={TAB_IDLE} />
        </Pressable>
        <Pressable onPress={() => router.push("/agency/people/people-overview")} style={[styles.tabItem, { left: 227 }]}>
          <Feather name="users" size={24} color={TAB_IDLE} />
        </Pressable>
        <Pressable onPress={() => router.push("/agency/profile/profile-home")} style={[styles.tabItem, { left: 308 }]}>
          <Feather name="user" size={24} color={TAB_IDLE} />
        </Pressable>
      </Abs>

      {/* Centre FAB — overlaps the bar's top edge, so it is drawn as a sibling. */}
      <Abs x={157} y={FAB_Y} w={60} h={60} radius={30} bg={PAGE} style={styles.fabRing}>
        <Pressable onPress={() => router.push("/agency/profile/add-reminder")} style={styles.fab}>
          <Feather name="plus" size={24} color="#1c1c1e" />
        </Pressable>
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  clip: { overflow: "hidden" },
  tap: { position: "absolute" },

  wash: { position: "absolute", left: 0, top: 0, width: FRAME_W, height: 256 },

  /* --- body sections --- */
  statusPill: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  presenceDot: {
    shadowColor: "#4ade80",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  alert: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  alertButton: {
    position: "absolute",
    left: 282,
    top: 25.75,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  tile: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  hero: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  deltaPill: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  setTarget: {
    position: "absolute",
    left: 161,
    top: 28,
    width: 107,
    height: 29,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  panel: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  creatorRow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  creatorAvatar: { position: "absolute", left: 0, top: 0, width: 48, height: 48 },
  activityFade: { position: "absolute", left: 1, top: 176.25, width: 333, height: 96 },

  /* --- header --- */
  headerAvatar: { position: "absolute", left: 0, top: 0, width: 48, height: 48 },
  headerButton: {
    position: "absolute",
    top: 62,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  headerMail: { left: 267 },
  headerBell: { left: 315 },

  /* --- tab bar --- */
  tabBar: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  tabItem: {
    position: "absolute",
    top: 24,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  fabRing: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 10,
  },
  fab: {
    position: "absolute",
    left: 6,
    top: 6,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
  },
});
