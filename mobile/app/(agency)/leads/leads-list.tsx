import { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { useContacts, useLeads, type Lead } from "../../../src/api/hooks";

/**
 * Leads — Figma 7771:15146 (375x876), traced 1:1.
 *
 * The agency pipeline root: back header (0,0 375x80), the "N leads need
 * response" banner (15,106 345x64), the horizontally scrolling Status Filters
 * row (8,196 354x49) and the card stack inside "Frame 2147223267" (6,265
 * 363x599) — 343x138 cards on a 152pt step from y=270.
 *
 * Figma ships four sibling frames, one per chip. They are the same screen with
 * a different selection: the cards never change, only which subset is drawn. So
 * the chip row is local state (`status`) over one card list, not four routes.
 *
 * The list frame clips at 864 in the design; here the canvas grows with the row
 * count and the whole screen scrolls, so a real roster stays reachable without
 * moving a single coordinate.
 *
 * Geist is not loaded (see app/_layout.tsx), so the "Leads" heading and the
 * banner's bold run render in Inter, the frame's own body face. expo-blur is
 * not a dependency, so every BACKGROUND_BLUR is drawn as its translucent fill.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

/** Card stack — "Background+Border+Shadow", 138 tall on a 14pt stack gap. */
const CARD_X = 16;
const CARD_Y0 = 270;
const CARD_W = 343;
const CARD_H = 138;
const CARD_STEP = 152;
/** The list frame's 5pt bottom padding, below the last card. */
const LIST_PAD_B = 5;

/** Card-relative: the badge's right edge sits at 326 (frame x=342). */
const BADGE_RIGHT = 326;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";
const BANNER_FILL = "#e1ebe1";
const BANNER_INK = "#1d1d1f";
const DARK = "#312b28";
const DARK_INK = "#f9f2ef";
const PILL_INK = "#f8f5ef";
const CHIP_IDLE_INK = "#666666";
const NAME_INK = "#141311";
const META_INK = "#8c8a84";
const META_ICON = "rgba(140,138,132,0.8)";
const AVATAR_FILL = "#c4c4c4";
const CARD_CONTACTED = "#f2edff";
const CARD_CAMPAIGN = "#ffecf3";
const CARD_NEW = "#e4ecf4";
const BORDER_WARM = "#e8e2d9";
const BORDER_20 = "rgba(232,229,223,0.2)";
const BORDER_40 = "rgba(232,229,223,0.4)";
const BORDER_10 = "rgba(232,229,223,0.1)";
const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_75 = "rgba(255,255,255,0.75)";
const WHITE = "#ffffff";

/* ------------------------------ derivations ------------------------------- */
/**
 * The three card variants in the design. LeadStatus has five members: CONNECTED
 * is a contacted lead that answered, so it shares the Contacted paint; CONVERTED
 * is a lead that became a campaign — the design's "Campaign" badge; DEAD has
 * left the pipeline and is not drawn or counted, exactly as the chip totals in
 * the frame (12 = 1 + 4 + 5 + the rest) imply.
 */
type Status = "NEW" | "CONTACTED" | "CAMPAIGN";

function statusOf(lead: Lead): Status | null {
  if (lead.status === "CONVERTED") return "CAMPAIGN";
  if (lead.status === "CONTACTED" || lead.status === "CONNECTED") return "CONTACTED";
  if (lead.status === "NEW") return "NEW";
  return null;
}

/**
 * Per-status paints and badge box, lifted from the four cards in the spec —
 * cards 1 and 4 are both Contacted and both carry the purple fill and the solid
 * warm stroke, so the tint tracks the status rather than the row index.
 */
const STATUS: Record<Status, { label: string; fill: string; line: string; badgeW: number }> = {
  CONTACTED: { label: "Contacted", fill: CARD_CONTACTED, line: BORDER_WARM, badgeW: 84 },
  CAMPAIGN: { label: "Campaign", fill: CARD_CAMPAIGN, line: BORDER_20, badgeW: 75 },
  NEW: { label: "NEW", fill: CARD_NEW, line: BORDER_20, badgeW: 43 },
};

type Filter = "all" | "contacted" | "new" | "campaign";

/** Chip copy is the design's, spacing quirks included ("Contacted(1)"). */
const FILTERS: { key: Filter; label: (n: number) => string }[] = [
  { key: "all", label: (n) => `All (${n})` },
  { key: "contacted", label: (n) => `Contacted(${n})` },
  { key: "new", label: (n) => `New (${n})` },
  { key: "campaign", label: (n) => `Campaign(${n})` },
];

const FILTER_STATUS: Record<Exclude<Filter, "all">, Status> = {
  contacted: "CONTACTED",
  new: "NEW",
  campaign: "CAMPAIGN",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "12 July" — the card's date line. */
function dayMonth(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "PAID" -> "Paid", "BARTER" -> "Barter" — the deal-type tag. */
const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** Lead.money is stored bare ("1.2L"); the tag in the design is prefixed. */
function budgetTag(money?: string): string | null {
  if (!money) return null;
  return `Budget ${money.startsWith("₹") ? money : `₹${money}`}`;
}

const openUrl = (url?: string) => {
  if (url) Linking.openURL(url).catch(() => undefined);
};

/* --------------------------------- pieces --------------------------------- */
/** 21pt hug pill — "Barter" / "Budget ₹1.2L" / "Zostel Trip". */
function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Txt size={10} font="inter" color={META_INK} lineHeight={15} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

interface CardProps {
  top: number;
  status: Status;
  name: string;
  date: string;
  tags: string[];
  onOpen: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
}

/**
 * 343x138 lead card. Child offsets are card-relative — the design's frame
 * coordinates less the card origin (16, top).
 */
function LeadCard({ top, status, name, date, tags, onOpen, onCall, onWhatsApp }: CardProps) {
  const s = STATUS[status];
  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [
        styles.card,
        { top, backgroundColor: s.fill, borderColor: s.line },
        pressed && styles.pressed,
      ]}
    >
      {/* Avatar — the design ships an empty 44pt image placeholder. */}
      <Abs x={17} y={17} w={44} h={44} radius={22} bg={AVATAR_FILL} border={WHITE} borderWidth={1} />

      <Txt
        x={73} y={21} w={87} size={14} weight="bold" font="inter"
        color={NAME_INK} lineHeight={20} letterSpacing={-0.35} numberOfLines={1}
      >
        {name}
      </Txt>
      <Abs x={166} y={25} w={12} h={12} center>
        <Feather name="target" size={12} color={META_ICON} />
      </Abs>
      <Abs x={180} y={25} w={12} h={12} center>
        <Feather name="users" size={12} color={META_ICON} />
      </Abs>
      <Txt
        x={73} y={41} w={119} size={12} font="inter"
        color={META_INK} lineHeight={16} numberOfLines={1}
      >
        {date}
      </Txt>

      {/* Background+Border status badge, right-anchored at 326. */}
      <Abs
        x={BADGE_RIGHT - s.badgeW} y={17} w={s.badgeW} h={25} radius={9999}
        bg={WHITE} border={BORDER_40} borderWidth={1} center
      >
        <Txt
          size={10} weight="bold" font="inter" color={NAME_INK}
          lineHeight={15} letterSpacing={0.25} numberOfLines={1} style={styles.upper}
        >
          {s.label}
        </Txt>
      </Abs>

      {/* Tag row — 12pt gaps put the pills at 13 / 73 / 164, as designed. */}
      <Abs x={13} y={86} w={231} h={21} row gap={12} style={styles.clip}>
        {tags.map((t) => (
          <Tag key={t} label={t} />
        ))}
      </Abs>

      {/* Frame 14595 — the 30pt call + WhatsApp cluster. */}
      <Abs x={259} y={82} w={67} h={30} row gap={7}>
        <Pressable
          onPress={onCall}
          style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
        >
          <Feather name="phone" size={20} color="#000000" />
        </Pressable>
        <Pressable
          onPress={onWhatsApp}
          style={({ pressed }) => [styles.waButton, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={["#1faf38", "#60d669"] as const}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={styles.fill}
          />
          <MaterialCommunityIcons name="whatsapp" size={22} color={WHITE} />
        </Pressable>
      </Abs>
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function LeadsList() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const { data: leads = [], isLoading } = useLeads();
  // Lead has no phone column; the CRM contact for the same person carries one.
  const { data: contacts = [] } = useContacts();

  const phones = useMemo(
    () => new Map(contacts.filter((c) => c.phone).map((c) => [c.name, c.phone as string])),
    [contacts],
  );

  const { counts, rows } = useMemo(() => {
    const tally: Record<Status, number> = { NEW: 0, CONTACTED: 0, CAMPAIGN: 0 };

    const pipeline: { lead: Lead; status: Status }[] = [];
    for (const lead of leads) {
      const s = statusOf(lead);
      if (!s) continue;
      tally[s] += 1;
      pipeline.push({ lead, status: s });
    }

    // Newest first — the card's own date line is what the stack reads by.
    pipeline.sort(
      (a, b) =>
        new Date(b.lead.createdAt ?? 0).getTime() - new Date(a.lead.createdAt ?? 0).getTime(),
    );

    return {
      counts: tally,
      rows: filter === "all" ? pipeline : pipeline.filter((p) => p.status === FILTER_STATUS[filter]),
    };
  }, [leads, filter]);

  const total = counts.NEW + counts.CONTACTED + counts.CAMPAIGN;
  /**
   * "3 leads need response". Lead has no unattended flag and no last-contacted
   * column — the one thing the schema does say about being owed a reply is the
   * status itself: a NEW lead is one nobody has answered yet. The design's own
   * numbers do not reconcile (All 12 against 1 + 4 + 5), so there is nothing to
   * infer from its banner reading 3 while its New chip reads 4.
   */
  const unattended = counts.NEW;
  const chipCount = (key: Filter) => (key === "all" ? total : counts[FILTER_STATUS[key]]);

  const canvasH = Math.max(
    FRAME_H,
    CARD_Y0 + Math.max(rows.length - 1, 0) * CARD_STEP + CARD_H + LIST_PAD_B,
  );

  return (
    <Screen height={canvasH} background={PAGE} scroll>
      {/* ------------------------- Frame 2147223266 -------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={16} color={BACK_ICON} />
      </Pressable>
      <Txt
        x={72} y={28} w={192} size={20} weight="medium" font="inter"
        color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Leads
      </Txt>

      {/* --------------------- Frame 2147223253 — banner --------------------- */}
      <Abs x={15} y={106} w={345} h={64} radius={16} bg={BANNER_FILL} style={styles.bannerShadow} />
      <Txt
        x={35} y={129.5} size={14} weight="bold" font="inter"
        color={BANNER_INK} lineHeight={16.94} numberOfLines={1}
      >
        {`${unattended} ${unattended === 1 ? "lead" : "leads"}`}
        <Text style={styles.bannerRest}>
          {unattended === 1 ? " needs response" : " need response"}
        </Text>
      </Txt>
      <Pressable
        onPress={() => setFilter("new")}
        style={({ pressed }) => [styles.reviewPill, pressed && styles.pressed]}
      >
        <Txt
          w={69.28} size={12} weight="semibold" font="inter"
          color={PILL_INK} lineHeight={14.52} align="center"
        >
          Review now
        </Txt>
      </Pressable>

      {/* ------------------------- Status Filters ---------------------------- */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
            >
              <Txt
                size={14} weight="semibold" font="inter" lineHeight={16.94}
                color={active ? DARK_INK : CHIP_IDLE_INK}
              >
                {f.label(chipCount(f.key))}
              </Txt>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ---------------------- Frame 2147223267 — cards --------------------- */}
      {rows.map(({ lead, status }, i) => {
        const phone = lead.contactPerson ? phones.get(lead.contactPerson) : undefined;
        const digits = phone?.replace(/\D/g, "");
        const budget = budgetTag(lead.money);
        return (
          <LeadCard
            key={lead.id}
            top={CARD_Y0 + i * CARD_STEP}
            status={status}
            name={lead.contactPerson ?? lead.brandName}
            date={dayMonth(lead.createdAt)}
            tags={[
              titleCase(lead.dealType ?? "PAID"),
              ...(budget ? [budget] : []),
              lead.brandName,
            ]}
            onOpen={() =>
              router.push({ pathname: "/leads/lead-detail-info", params: { id: lead.id } })
            }
            onCall={() => openUrl(phone ? `tel:${phone}` : undefined)}
            onWhatsApp={() => openUrl(digits ? `https://wa.me/${digits}` : undefined)}
          />
        );
      })}
      {rows.length === 0 ? (
        <Txt
          x={33} y={CARD_Y0 + 21} w={309} size={14} weight="bold" font="inter"
          color={META_INK} lineHeight={20} letterSpacing={-0.35}
        >
          {isLoading ? "Loading leads…" : "No leads"}
        </Txt>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  clip: { overflow: "hidden" },
  upper: { textTransform: "uppercase" },
  /** The banner's second style run: Geist 400, rendered in Inter. */
  bannerRest: { fontFamily: fonts.inter },

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
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  bannerShadow: {
    shadowColor: "#fee5f1",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  reviewPill: {
    position: "absolute",
    left: 246.72,
    top: 122,
    width: 93.28,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK,
  },

  filters: { position: "absolute", left: 8, top: 196, width: 354, height: 49 },
  filtersContent: { alignItems: "center", paddingHorizontal: 5, gap: 10 },
  chip: {
    height: 39,
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  chipActive: {
    backgroundColor: DARK,
    shadowColor: "#5a3e75",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chipIdle: {
    backgroundColor: GLASS_40,
    borderWidth: 1,
    borderColor: GLASS_50,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  card: {
    position: "absolute",
    left: CARD_X,
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tag: {
    height: 21,
    borderRadius: 9999,
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: GLASS_75,
    borderWidth: 1,
    borderColor: BORDER_10,
  },
  callButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },
  waButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
