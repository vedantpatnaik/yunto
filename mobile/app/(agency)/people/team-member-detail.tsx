import { useMemo } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors, gradients } from "../../../src/theme";
import { inr, useCampaigns, useLeads, useMe, useUsers } from "../../../src/api/hooks";

/**
 * Member detail (team context) — Figma 7807:23300 "Detail view - sales" (375x876),
 * with its two sibling frames 7810:23986 "Operations detail view" and
 * 7810:24599 "Sales + operations" folded into the same route.
 *
 * One member seen from inside their team: the 335 glass team card at y=101
 * (team tile + name + member count, rule, the 333x74 member row, then the
 * counter strip), followed by the member's deal feed — 335x147 cards on a 163pt
 * step, each a type chip + stage chip, three round actions and the 2x2
 * Name / Company / Budget / Lead Owner grid.
 *
 * The three frames are the same layout with three swaps, so the variant is
 * derived from the member's team rather than routed separately:
 *   sales       tile 44 orange, card 265 tall, feed at 382, Leads/New/Contacted
 *   operations  tile 48 indigo, card 254 tall, feed at 371, All Campaign/Campaign
 *   both        tile 44 green,  card 254 tall, feed at 371, All Campaign/Campaign
 * The operations frame draws the member row at x=16 where the other two use
 * x=21; that is a stray 5pt in one frame, so all three trace to 21.
 *
 * The feed overflows the 876pt frame (four cards reach 1018), so the canvas is
 * sized to the real row count and scrolls.
 *
 * The frame's Geist heading renders in Inter — Geist is not loaded in
 * app/_layout.tsx and Inter is the frame's own body face. The decorative
 * "Gradient" circle at (240.6,-57.6) exports with no paint, so it is skipped
 * rather than guessed at.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

const CARD_X = 20;
const CARD_W = 335;

const ROW_X = 21; // member row inside the team card
const ROW_W = 333;

const FEED_H = 147;
const FEED_STEP = 163; // 147 card + 16 stack gap

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";
const DIVIDER = "#e2e8f0";
const NAME_INK = "#111111";
const SUB_INK = "#64748b";
const STRIP_FILL = "#111111";
const STRIP_INK = "#f4f6f8";
const ICON_INK = "#64748b";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_20 = "rgba(255,255,255,0.2)";
const BORDER_60 = "rgba(255,255,255,0.6)";
const BORDER_70 = "rgba(255,255,255,0.7)";
const BORDER_75 = "rgba(255,255,255,0.75)";
const BORDER_80 = "rgba(255,255,255,0.8)";

/** "Active" pill on the member row. */
const ACTIVE = {
  fill: "rgba(240,253,244,0.6)",
  line: "#7bf1a8",
  dot: "#05df72",
  ink: "#00a63e",
};

/** Counter-strip chip paints — amber for the pending bucket, green for the done one. */
const STRIP_AMBER = { fill: "rgba(255,251,235,0.6)", line: "#ffd230", dot: "#ffb900", ink: "#bb4d00" };
const STRIP_GREEN = { fill: "rgba(240,253,244,0.6)", line: "#7bf1a8", dot: "#05df72", ink: "#008236" };

/**
 * Card themes. The tint of the card and the paint of its type chip travel
 * together and cycle down the stack — emerald, indigo, sky, pink — exactly as
 * the four cards in the sales frame are drawn.
 */
const THEMES = [
  { tint: "rgba(209,250,229,0.4)", chip: "rgba(240,253,244,0.5)", line: "#7bf1a8", ink: "#008236" },
  { tint: "rgba(224,231,255,0.5)", chip: "rgba(238,242,255,0.5)", line: "#a3b3ff", ink: "#432dd7" },
  { tint: "rgba(219,234,254,0.4)", chip: "rgba(240,249,255,0.5)", line: "#74d4ff", ink: "#0069a8" },
  { tint: "rgba(252,231,243,0.4)", chip: "rgba(253,242,248,0.5)", line: "#fda5d5", ink: "#c6005c" },
];

/** Stage chip paints and widths, from the New / Contacted / Converted variants. */
type Stage = "New" | "Contacted" | "Converted";
const STAGE: Record<Stage, { w: number; textW: number; fill: string; line: string; ink: string }> = {
  New: { w: 49, textW: 27, fill: "rgba(255,251,235,0.5)", line: "#ffd230", ink: "#bb4d00" },
  Contacted: { w: 84, textW: 62, fill: "rgba(239,246,255,0.5)", line: "#8ec5ff", ink: "#1447e6" },
  Converted: { w: 84, textW: 62, fill: "rgba(239,246,255,0.5)", line: "#8ec5ff", ink: "#1447e6" },
};

/** Type chip widths — the two labels the design ships. */
const DEAL: Record<"Barter" | "Paid", { w: number; textW: number }> = {
  Barter: { w: 59, textW: 37 },
  Paid: { w: 48, textW: 26 },
};

/* ------------------------------ team variant ------------------------------ */
type Variant = "sales" | "operations" | "both";

interface VariantSpec {
  /** Team tile: the icon plate left of the team name. */
  tile: { x: number; y: number; size: number; radius: number; from: string; to: string; line?: string; ink: string; icon: number };
  titleX: number;
  titleY: number;
  subY: number;
  cardH: number;
  feedY: number;
  /** Leads strip in the sales frame, campaign strip in the other two. */
  strip: "leads" | "campaigns";
}

const VARIANT: Record<Variant, VariantSpec> = {
  sales: {
    tile: { x: 41, y: 122, size: 44, radius: 22, from: "rgba(225,94,68,0.28)", to: "rgba(225,94,68,0.23)", line: "rgba(255,181,160,0.3)", ink: "#e15e44", icon: 18 },
    titleX: 97, titleY: 124, subY: 148, cardH: 265, feedY: 382, strip: "leads",
  },
  operations: {
    tile: { x: 41, y: 122, size: 48, radius: 24, from: "#c7d2fe", to: "#e0e7ff", ink: "#4f39f6", icon: 20 },
    titleX: 101, titleY: 126, subY: 150, cardH: 254, feedY: 371, strip: "campaigns",
  },
  both: {
    tile: { x: 41, y: 122, size: 44, radius: 22, from: "rgba(222,255,200,0.8)", to: "#e4f7db", line: "#d0ffb7", ink: "#79cb4c", icon: 18 },
    titleX: 97, titleY: 124, subY: 148, cardH: 254, feedY: 371, strip: "campaigns",
  },
};

/* ------------------------------ derivations ------------------------------- */
/** Member row subtitle — the person's function, from User.role. */
const roleLabel = (role: string) => (role.startsWith("OPS") ? "Operations" : "Sales");

/** LeadStatus mapped onto the three stage chips. DEAD has left the pipeline. */
function stageOf(status: string): Stage | null {
  if (status === "NEW") return "New";
  if (status === "CONTACTED" || status === "CONNECTED") return "Contacted";
  if (status === "CONVERTED") return "Converted";
  return null;
}

const trim = (v: number) => (Number.isInteger(v) ? `${v}` : v.toFixed(1));

/** Campaign.budget is an integer; the cards print it Indian-short (₹2.5L, ₹80K). */
function budgetLabel(n: number): string {
  if (n >= 10_000_000) return `₹${trim(n / 10_000_000)}Cr`;
  if (n >= 100_000) return `₹${trim(n / 100_000)}L`;
  if (n >= 1000) return `₹${trim(n / 1000)}K`;
  return `₹${inr(n)}`;
}

/** Lead.money is stored bare ("300k"); the card prefixes it. */
const moneyLabel = (money: string | undefined) =>
  !money ? "—" : money.startsWith("₹") ? money : `₹${money}`;

/** One row of the feed, whichever collection it came from. */
interface FeedRow {
  id: string;
  /** Absent when nothing on record states the deal type. */
  deal: "Barter" | "Paid" | null;
  stage: Stage;
  name: string;
  company: string;
  budget: string;
  owner: string;
}

/* --------------------------------- card ----------------------------------- */
/**
 * 335x147 deal card. Child offsets are card-relative and account for the 1pt
 * stroke, which insets the padding box by a point on each side.
 */
function FeedCard({ top, theme, row }: { top: number; theme: number; row: FeedRow }) {
  const t = THEMES[theme % THEMES.length];
  const s = STAGE[row.stage];
  const deal = row.deal ? DEAL[row.deal] : null;
  const stageX = deal ? 16 + deal.w + 8 : 16;

  return (
    <Abs
      x={CARD_X}
      y={top}
      w={CARD_W}
      h={FEED_H}
      radius={24}
      bg={t.tint}
      border={BORDER_70}
      borderWidth={1}
      style={styles.cardShadow}
    >
      {/* type chip — Barter / Paid */}
      {row.deal && deal ? (
        <Abs x={16} y={17} w={deal.w} h={26} radius={9999} bg={t.chip} border={t.line} borderWidth={1}>
          <Txt x={10} y={4} w={deal.textW} size={12} weight="semibold" font="inter" color={t.ink} lineHeight={16}>
            {row.deal}
          </Txt>
        </Abs>
      ) : null}

      {/* stage chip — New / Contacted / Converted */}
      <Abs x={stageX} y={17} w={s.w} h={26} radius={9999} bg={s.fill} border={s.line} borderWidth={1}>
        <Txt x={10} y={4} w={s.textW} size={12} weight="semibold" font="inter" color={s.ink} lineHeight={16}>
          {row.stage}
        </Txt>
      </Abs>

      {/* row actions */}
      {(["phone", "message-circle", "instagram"] as const).map((icon, i) => (
        <Abs
          key={icon}
          x={217 + i * 36}
          y={16}
          w={28}
          h={28}
          radius={9999}
          bg={GLASS_60}
          border={BORDER_80}
          borderWidth={1}
          center
          style={styles.buttonShadow}
        >
          <Feather name={icon} size={13} color={ICON_INK} />
        </Abs>
      ))}

      {/* 2x2 detail grid */}
      <Txt x={16} y={56} w={142.5} size={12} font="inter" color={SUB_INK} lineHeight={16}>
        Name
      </Txt>
      <Txt
        x={16} y={72} w={142.5} size={14} weight="semibold" font="inter"
        color={NAME_INK} lineHeight={17.5} numberOfLines={1}
      >
        {row.name}
      </Txt>

      <Txt x={174.5} y={56} w={142.5} size={12} font="inter" color={SUB_INK} lineHeight={16}>
        Company
      </Txt>
      <Txt
        x={174.5} y={72} w={142.5} size={14} weight="semibold" font="inter"
        color={NAME_INK} lineHeight={17.5} numberOfLines={1}
      >
        {row.company}
      </Txt>

      <Txt x={16} y={95.5} w={142.5} size={12} font="inter" color={SUB_INK} lineHeight={16}>
        Budget
      </Txt>
      <Txt
        x={16} y={111.5} w={142.5} size={14} weight="semibold" font="inter"
        color={NAME_INK} lineHeight={17.5} numberOfLines={1}
      >
        {row.budget}
      </Txt>

      <Txt x={174.5} y={95.5} w={142.5} size={12} font="inter" color={SUB_INK} lineHeight={16}>
        Lead Owner
      </Txt>
      <Txt
        x={174.5} y={111.5} w={142.5} size={14} weight="semibold" font="inter"
        color={NAME_INK} lineHeight={17.5} numberOfLines={1}
      >
        {row.owner}
      </Txt>
    </Abs>
  );
}

/* ------------------------------ strip pieces ------------------------------ */
/** Dark counter pill: label plus a translucent count bubble. */
function TotalPill({ w, label, labelW, bubbleX, count }: {
  w: number; label: string; labelW: number; bubbleX: number; count: number;
}) {
  return (
    <Abs x={35} y={306} w={w} h={32} radius={9999} bg={STRIP_FILL} style={styles.buttonShadow}>
      <Txt x={12} y={8} w={labelW} size={12} weight="medium" font="inter" color={STRIP_INK} lineHeight={16}>
        {label}
      </Txt>
      <Abs x={bubbleX} y={6} w={20} h={20} radius={9999} bg={GLASS_20} center>
        <Txt size={12} weight="medium" font="inter" color={STRIP_INK} lineHeight={16}>
          {count}
        </Txt>
      </Abs>
    </Abs>
  );
}

/** Outlined counter chip: dot, label, count. */
function CountChip({ x, w, label, labelW, count, paint }: {
  x: number; w: number; label: string; labelW: number; count: number;
  paint: { fill: string; line: string; dot: string; ink: string };
}) {
  return (
    <Abs x={x} y={307} w={w} h={30} radius={9999} bg={paint.fill} border={paint.line} borderWidth={1}>
      <Abs x={12} y={11} w={6} h={6} radius={3} bg={paint.dot} />
      <Txt x={24} y={6} w={labelW} size={12} weight="medium" font="inter" color={paint.ink} lineHeight={16}>
        {label}
      </Txt>
      <Txt x={w - 22} y={6} size={12} weight="medium" font="inter" color={paint.ink} lineHeight={16}>
        {count}
      </Txt>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function TeamMemberDetail() {
  const router = useRouter();
  const { memberId } = useLocalSearchParams<{ memberId?: string }>();

  const { data: me } = useMe();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();

  /** The member this page is about — the routed one, else the signed-in operator. */
  const member = useMemo(
    () => users.find((u) => u.id === memberId) ?? users.find((u) => u.id === me?.id) ?? users.find((u) => u.team),
    [users, memberId, me],
  );

  const team = member?.team;
  const teamSize = useMemo(
    () => (team ? users.filter((u) => u.team?.id === team.id).length : 0),
    [users, team],
  );

  /**
   * Which of the three frames this is. Team.kind is SALES or OPERATIONS, and a
   * combined desk shows up as a team named for both — the design gives that its
   * own tile colour but otherwise draws it like the operations frame.
   */
  const variant: Variant = useMemo(() => {
    const name = team?.name ?? "";
    const ops = team?.kind === "OPERATIONS" || /operation/i.test(name);
    if (ops && /sales/i.test(name)) return "both";
    return ops ? "operations" : "sales";
  }, [team]);
  const v = VARIANT[variant];

  /** Deal type is a Lead column; a campaign borrows it from the lead of the same brand. */
  const dealByBrand = useMemo(() => {
    const m = new Map<string, "Barter" | "Paid">();
    for (const l of leads) m.set(l.brandName, l.dealType === "BARTER" ? "Barter" : "Paid");
    return m;
  }, [leads]);

  /**
   * The member's book.
   *
   * Sales reads straight off Lead.ownerId. Campaign has no owner column — the
   * only person it records is contactPerson, which POST /leads/:id/convert
   * copies over from the lead — so an operations member's campaigns are the ones
   * carrying their name. Every campaign exists because a deal converted, which
   * is the stage its chip states; Campaign.status is delivery, not pipeline.
   */
  const rows: FeedRow[] = useMemo(() => {
    if (!member) return [];
    if (v.strip === "leads") {
      return leads.flatMap((l) => {
        if (l.ownerId !== member.id) return [];
        const stage = stageOf(l.status);
        if (!stage) return [];
        return [{
          id: l.id,
          deal: l.dealType === "BARTER" ? ("Barter" as const) : ("Paid" as const),
          stage,
          name: l.contactPerson ?? l.brandName,
          company: l.brandName,
          budget: moneyLabel(l.money),
          owner: member.name,
        }];
      });
    }
    return campaigns
      .filter((c) => c.contactPerson === member.name)
      .map((c) => ({
        id: c.id,
        deal: dealByBrand.get(c.brandName) ?? null,
        stage: "Converted" as Stage,
        name: c.name,
        company: c.brandName,
        budget: budgetLabel(c.budget),
        owner: c.contactPerson ?? member.name,
      }));
  }, [member, v.strip, leads, campaigns, dealByBrand]);

  /** Counter strip: the pipeline split for sales, the running slice for operations. */
  const newCount = rows.filter((r) => r.stage === "New").length;
  const contactedCount = rows.filter((r) => r.stage === "Contacted").length;
  const runningCount = useMemo(
    () => (member ? campaigns.filter((c) => c.contactPerson === member.name && c.status === "ACTIVE").length : 0),
    [campaigns, member],
  );

  const loading = usersLoading || (v.strip === "leads" ? leadsLoading : campaignsLoading);
  const canvasH = Math.max(FRAME_H, v.feedY + rows.length * FEED_STEP + 20);

  return (
    <Screen height={canvasH} background={PAGE} scroll>
      {/* -------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16} color={BACK_ICON} />
      </Pressable>
      <Txt
        x={72} y={28} w={222} size={20} weight="medium" font="inter"
        color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Team
      </Txt>
      <Abs x={20} y={80} w={335} h={1} bg={DIVIDER} />

      {/* ------------------------------- Team card ---------------------------- */}
      <Abs
        x={CARD_X} y={101} w={CARD_W} h={v.cardH} radius={24}
        bg={GLASS_55} border={BORDER_75} borderWidth={1}
        style={styles.cardShadow}
      />

      <LinearGradient
        colors={[v.tile.from, v.tile.to] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.tile,
          {
            left: v.tile.x,
            top: v.tile.y,
            width: v.tile.size,
            height: v.tile.size,
            borderRadius: v.tile.radius,
            borderWidth: v.tile.line ? 1 : 0,
            borderColor: v.tile.line ?? "transparent",
          },
        ]}
      >
        <Feather name="briefcase" size={v.tile.icon} color={v.tile.ink} />
      </LinearGradient>

      <Txt
        x={v.titleX} y={v.titleY} w={375 - v.titleX - 41} size={16} weight="semibold" font="inter"
        color={NAME_INK} lineHeight={24} numberOfLines={1}
      >
        {team?.name ?? (usersLoading ? "Loading…" : "No team")}
      </Txt>
      <Txt
        x={v.titleX} y={v.subY} w={375 - v.titleX - 41} size={12} font="inter"
        color={SUB_INK} lineHeight={16}
      >
        {`${teamSize} Members`}
      </Txt>

      <Abs x={41} y={186} w={293} h={1} bg={DIVIDER} />

      {/* ------------------------------ Member row ---------------------------- */}
      <Abs
        x={ROW_X} y={203} w={ROW_W} h={74} radius={40}
        bg={GLASS_50} border={BORDER_60} borderWidth={1}
        style={styles.rowShadow}
      >
        {/* 48x48 avatar — photo fill in the design, gradient placeholder without one */}
        {member?.avatarUrl ? (
          <Image source={{ uri: member.avatarUrl }} style={styles.avatar} />
        ) : (
          <LinearGradient
            colors={gradients.avatarA}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          />
        )}

        <Txt
          x={76} y={18} w={120} size={12} weight="semibold" font="inter"
          color={NAME_INK} lineHeight={20} numberOfLines={1}
        >
          {member?.name ?? (usersLoading ? "Loading…" : "No member")}
        </Txt>
        <Txt x={76} y={38} w={120} size={12} font="inter" color={SUB_INK} lineHeight={16} numberOfLines={1}>
          {member ? roleLabel(member.role) : ""}
        </Txt>

        {/* Active pill */}
        <Abs x={208} y={23} w={75} h={26} radius={9999} bg={ACTIVE.fill} border={ACTIVE.line} borderWidth={1}>
          <Abs x={12} y={9} w={6} h={6} radius={3} bg={ACTIVE.dot} />
          <Txt x={24} y={4} w={37} size={12} weight="medium" font="inter" color={ACTIVE.ink} lineHeight={16}>
            Active
          </Txt>
        </Abs>

        {/* Kebab — the row actions menu has no route yet, so it stays inert */}
        <Pressable style={({ pressed }) => [styles.kebab, pressed && styles.pressed]}>
          <Feather name="more-vertical" size={16} color={ICON_INK} />
        </Pressable>
      </Abs>

      {/* ----------------------------- Counter strip -------------------------- */}
      {v.strip === "leads" ? (
        <>
          <TotalPill w={91} label="Leads" labelW={38} bubbleX={60} count={rows.length} />
          <CountChip x={138} w={82} label="New" labelW={26} count={newCount} paint={STRIP_AMBER} />
          <CountChip x={232} w={117} label="Contacted" labelW={61} count={contactedCount} paint={STRIP_GREEN} />
        </>
      ) : (
        <>
          <TotalPill w={133} label="All Campaign" labelW={79} bubbleX={101} count={rows.length} />
          <CountChip x={181.5} w={115} label="Campaign" labelW={59} count={runningCount} paint={STRIP_AMBER} />
        </>
      )}

      {/* -------------------------------- Feed -------------------------------- */}
      {rows.map((row, i) => (
        <FeedCard key={row.id} top={v.feedY + i * FEED_STEP} theme={i} row={row} />
      ))}
      {rows.length === 0 ? (
        <Txt x={37} y={v.feedY + 17} w={301} size={14} font="inter" color={SUB_INK} lineHeight={17.5}>
          {loading
            ? "Loading…"
            : v.strip === "leads"
              ? "No leads assigned yet"
              : "No campaigns assigned yet"}
        </Txt>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },

  backButton: {
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

  tile: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  rowShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  buttonShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  avatar: {
    position: "absolute",
    left: 16,
    top: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.white,
  },
  kebab: {
    position: "absolute",
    left: 295,
    top: 28,
    width: 20,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
