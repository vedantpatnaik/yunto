import { Fragment } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { inr, useCampaigns, useContacts, useInvoices, useLeads } from "../../../src/api/hooks";
import type { Lead } from "../../../src/api/hooks";

/**
 * Lead Added Successfully — Figma 7700:12163 "lead added " (375x876), traced 1:1.
 *
 * The post-submit confirmation for the agency add-lead flow. Four bands:
 *   • two decorative "Gradient" washes (0,0 375x300 and 0,625.5 375x250),
 *   • Frame 2147223267 (0,0 375x80) — the back button; its "Heading 1" frame
 *     carries no text node in the design, so no title is drawn,
 *   • Container (0,96 375x605) — the tick medallion, the hero copy, the meta
 *     chip row and the 335x605 summary card,
 *   • Container (20,717 335x123) — "Create Another Lead" / "View Campaign".
 *
 * GEOMETRY NOTE. In Figma the body Container clips at 605, cutting the summary
 * card off at y=701 even though the card itself runs to y=966 — the action
 * stack sits pinned at 717 and the card slides beneath it. That is reproduced
 * here as an absolutely positioned ScrollView of the container's own box
 * (opened 8pt above its 96 so the amber satellite at y=90 isn't shaved) with
 * the buttons fixed at the spec's 717/783.5. CY() rebases frame coordinates
 * into the scroll content so the numbers in this file stay the numbers in
 * Figma.
 *
 * The two "Gradient" rectangles carry no fill in the export (the exporter drops
 * gradient paints), so they use the blush wash the rest of the 876-gen agency
 * frames already use — rgba(249,228,232,0.2) fading to nothing over #f8f5ef.
 *
 * SCHEMA NOTE. Prisma's Lead models brand / contact / money / peopleCount /
 * status / intent / dealType / channel and nothing else: there is no
 * deliverable, audience-gender, language or age-range column, and no niche or
 * location on a lead. Those four card rows therefore hold an em dash rather
 * than a fabricated value, and the design's "Fashion" and "Delhi" chips are
 * dropped from the chip row entirely instead of being invented.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;

/** "Background+Border+Shadow" — the summary card (20,361 335x605). */
const CARD = { x: 20, y: 361, w: 335, h: 605 } as const;
const CARD_BOTTOM = CARD.y + CARD.h; // 966

/** HorizontalBorder i sits at 370 + i*44, 44 tall, inset to 41..334. */
const ROW_Y = 370;
const ROW_STEP = 44;
const ROW_X = 41;
const ROW_W = 293;
/** LABEL is padded 2pt inside a 12/12 row; the value rides 3pt higher. */
const LABEL_DY = 14;
const LABEL_W = 140;
const VALUE_DY = 11;
const VALUE_X = 181;
const VALUE_W = ROW_X + ROW_W - VALUE_X; // 153

/** Container (0,96 375x605) — the body clip, opened 8pt high for the satellite. */
const BODY_TOP = 88;
const BODY_H = 701 - BODY_TOP; // clip bottom is the container's own 701
const BODY_CONTENT_H = CARD_BOTTOM - BODY_TOP; // scrolls to the card's true 966
/** Frame-space y -> body-scroll content y. */
const CY = (y: number) => y - BODY_TOP;

/** Container (20,717 335x123) — the pinned action stack, 12pt inner gap. */
const ACTIONS_Y = 717;
const PRIMARY_H = 54.5;
const SECONDARY_Y = ACTIONS_Y + PRIMARY_H + 12; // 783.5
const SECONDARY_H = 56.5;
const FRAME_H = 876;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const WASH = ["rgba(249,228,232,0.2)", "rgba(249,228,232,0)"] as const;
const BACK_FILL = "#1f1a17";
const BACK_GLYPH = "#faf7f2";
const HERO_OUTER = "#eaf5ee";
const HERO_MID = "#d2ecda";
const HERO_CORE = "#3e7d52";
const BADGE_AMBER = "#fde08b";
const BADGE_LILAC = "#e6e1f9";
const WHITE = "#ffffff";
const TITLE_INK = "#111111";
const SUB_INK = "#888888";
const HAIRLINE = "#f4f4f4";
const LABEL_INK = "#aaaaaa";
const VALUE_INK = "#222222";
const PRIMARY_FILL = "#312b28";

/** Value a column simply has no column for. */
const DASH = "—";

/* --------------------------------- chips ---------------------------------- */
/**
 * "Background+Border+Shadow" pills: 31 tall, 12pt side padding, an 11pt glyph
 * then 11/16.5 bold copy, 8pt apart and 7.5pt between the design's two rows.
 * Laid out as a centred wrap so the row still reads correctly when a lead
 * carries fewer chips than the design's five.
 */
interface ChipTint {
  bg: string;
  line: string;
  ink: string;
}
const CHIP_TINT: Record<"channel" | "deal" | "intent", ChipTint> = {
  channel: { bg: "#edf2f6", line: "#c8dcee", ink: "#3a5c7e" },
  deal: { bg: "#f0f5f1", line: "#c5dec5", ink: "#3e5c45" },
  intent: { bg: "#fff1f1", line: "#f4bcbc", ink: "#9b3232" },
};

function Chip({
  icon,
  tint,
  label,
}: {
  icon: keyof typeof Feather.glyphMap;
  tint: ChipTint;
  label: string;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: tint.bg, borderColor: tint.line }]}>
      <Feather name={icon} size={11} color={tint.ink} />
      <Txt size={11} weight="bold" font="inter" color={tint.ink} lineHeight={16.5}>
        {label}
      </Txt>
    </View>
  );
}

/* -------------------------------- helpers --------------------------------- */
/** Prisma's Lead carries `channel`; the shared TS surface does not list it. */
type LeadRecord = Lead & { channel?: string | null };

/** "PAID" -> "Paid" — the casing every chip in the design uses. */
const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** Lead.money is a display string ("440k", "₹1.2L", "15000") -> plain rupees. */
function parseMoney(s?: string): number {
  if (!s) return 0;
  const t = s.replace(/[₹,\s]/g, "");
  const n = parseFloat(t);
  if (Number.isNaN(n)) return 0;
  if (/cr$/i.test(t)) return Math.round(n * 10_000_000);
  if (/l$/i.test(t)) return Math.round(n * 100_000);
  if (/m$/i.test(t)) return Math.round(n * 1_000_000);
  if (/k$/i.test(t)) return Math.round(n * 1_000);
  return Math.round(n);
}

const hostOf = (url?: string) =>
  url ? url.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : undefined;
const domainOf = (email?: string) =>
  email && email.includes("@") ? email.split("@")[1] : undefined;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "Oct 15, 2024" — the SUBMISSION DATE format. */
function submittedOn(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/* --------------------------------- screen --------------------------------- */
export default function LeadAddedSuccess() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: leads = [] } = useLeads();
  const { data: contacts = [] } = useContacts();
  const { data: campaigns = [] } = useCampaigns();
  const { data: invoices = [] } = useInvoices();

  /**
   * The lead POST /leads just returned. Deep-linked by id; failing that the
   * newest row in the pipeline, which is the same record after a submit.
   */
  const newest = [...leads].sort(
    (a, b) => Date.parse(b.createdAt ?? "") - Date.parse(a.createdAt ?? ""),
  )[0];
  const lead: LeadRecord | undefined = leads.find((l) => l.id === id) ?? newest;

  // Lead has no email/phone/website columns; the CRM contact for the same
  // person — or failing that the same company — is where those live, and
  // Campaign.website is the only modelled brand URL.
  const contact = contacts.find(
    (c) => (lead?.contactPerson && c.name === lead.contactPerson) || c.company === lead?.brandName,
  );
  const campaign = campaigns.find((c) => c.brandName === lead?.brandName);
  const website = hostOf(campaign?.website) ?? domainOf(contact?.email);

  // Money switches on the deal type: Lead.money is the barter value on a barter
  // lead and the campaign budget on a paid one. Invoice.agencyFee is the only
  // modelled amount the agency keeps, and is zero until an invoice is raised.
  const barter = lead?.dealType === "BARTER";
  const invoice = invoices.find((i) => i.brandName === lead?.brandName);
  const budget = invoice?.budget || parseMoney(lead?.money);
  const agencyFee = invoice?.agencyFee ?? 0;

  const influencers =
    lead === undefined
      ? undefined
      : `${lead.peopleCount} ${lead.peopleCount === 1 ? "Creator" : "Creators"}`;

  /** Every LABEL/value pair the card echoes, in the design's order. */
  const rows: { label: string; value?: string }[] = [
    { label: "BRAND NAME", value: lead?.brandName },
    { label: "BRAND WEBSITE", value: website },
    { label: "EMAIL ADDRESS", value: contact?.email },
    { label: "CONTACT PERSON", value: lead?.contactPerson },
    { label: "PHONE NUMBER", value: contact?.phone },
    { label: barter ? "BARTER VALUE" : "CAMPAIGN BUDGET", value: lead && `₹ ${inr(budget)}` },
    { label: "AGENCY FEE", value: lead && `₹ ${inr(agencyFee)}` },
    { label: "INFLUENCERS", value: influencers },
    { label: "DELIVERABLES" },
    { label: "GENDER" },
    { label: "LANGUAGE" },
    { label: "AGE" },
    { label: "SUBMISSION\nDATE", value: submittedOn(lead?.createdAt) },
  ];

  /** Instagram · Paid · High — the three chips the schema actually backs. */
  const chips: {
    key: string;
    icon: keyof typeof Feather.glyphMap;
    tint: ChipTint;
    label: string;
  }[] = [];
  if (lead?.channel) {
    chips.push({ key: "channel", icon: "instagram", tint: CHIP_TINT.channel, label: lead.channel });
  }
  if (lead?.dealType) {
    chips.push({
      key: "deal",
      icon: "credit-card",
      tint: CHIP_TINT.deal,
      label: titleCase(lead.dealType),
    });
  }
  if (lead?.intent) {
    chips.push({ key: "intent", icon: "zap", tint: CHIP_TINT.intent, label: titleCase(lead.intent) });
  }

  // No add-lead route exists in the native app yet, so "Create Another Lead"
  // returns to the form this screen was pushed from and falls back to the
  // pipeline. There is likewise no campaign-detail route; the campaigns board
  // is the closest real destination.
  const createAnother = () =>
    router.canGoBack() ? router.back() : router.push("/agency/leads/leads-list");
  const viewCampaign = () => router.push("/agency/campaigns/active-campaigns");

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* ===================== "Gradient" (0,0 375x300) ===================== */}
      <Abs x={0} y={0} w={FRAME_W} h={300}>
        <LinearGradient
          colors={WASH}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fill}
        />
      </Abs>
      {/* =================== "Gradient" (0,625.5 375x250) =================== */}
      <Abs x={0} y={625.5} w={FRAME_W} h={250}>
        <LinearGradient
          colors={WASH}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.fill}
        />
      </Abs>

      {/* ================ Frame 2147223267 — header (0,0 375x80) ============ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16} color={BACK_GLYPH} />
      </Pressable>

      {/* ============== Container — body scroll (0,96 375x605) ============== */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {/* ================== Container — medallion (151.5,96) ================ */}
        <Abs x={151.5} y={CY(96)} w={72} h={72} radius={36} bg={HERO_OUTER} style={styles.heroGlow} />
        <Abs x={160.5} y={CY(105)} w={54} h={54} radius={27} bg={HERO_MID} />
        <Abs x={167.5} y={CY(112)} w={40} h={40} radius={20} bg={HERO_CORE} center style={styles.coreGlow}>
          <Feather name="check" size={20} color={WHITE} />
        </Abs>
        {/* "Background+Border" satellites — 2pt white ring, no glyph. */}
        <Abs x={209.5} y={CY(90)} w={20} h={20} radius={10} bg={BADGE_AMBER} border={WHITE} borderWidth={2} />
        <Abs x={145.5} y={CY(158)} w={16} h={16} radius={8} bg={BADGE_LILAC} border={WHITE} borderWidth={2} />

        {/* ======================= Container — hero copy ====================== */}
        <Txt
          x={55.45}
          y={CY(183)}
          w={264.11}
          size={22}
          weight="semibold"
          font="inter"
          color={TITLE_INK}
          lineHeight={27.5}
          letterSpacing={-0.55}
          align="center"
        >
          Lead Added Successfully!
        </Txt>
        <Txt
          x={55.45}
          y={CY(216)}
          w={264.11}
          size={13}
          weight="medium"
          font="inter"
          color={SUB_INK}
          lineHeight={19.5}
          align="center"
        >
          {"Here's your campaign summary."}
        </Txt>

        {/* ==================== Container — chips (20,268) ==================== */}
        <Abs x={20} y={CY(267.75)} w={335} style={styles.chipRow}>
          {chips.map((c) => (
            <Chip key={c.key} icon={c.icon} tint={c.tint} label={c.label} />
          ))}
        </Abs>

        {/* ============ Background+Border+Shadow — card (20,361 335x605) ====== */}
        <Abs
          x={CARD.x}
          y={CY(CARD.y)}
          w={CARD.w}
          h={CARD.h}
          radius={28}
          bg={WHITE}
          border="rgba(0,0,0,0.03)"
          borderWidth={1}
          style={styles.card}
        />
        {rows.map((r, i) => {
          const y = CY(ROW_Y + i * ROW_STEP);
          return (
            <Fragment key={r.label}>
              <Txt
                x={ROW_X}
                y={y + LABEL_DY}
                w={LABEL_W}
                size={11}
                weight="semibold"
                font="inter"
                color={LABEL_INK}
                lineHeight={16.5}
                letterSpacing={1.1}
                numberOfLines={2}
              >
                {r.label}
              </Txt>
              <Txt
                x={VALUE_X}
                y={y + VALUE_DY}
                w={VALUE_W}
                size={13}
                weight="semibold"
                font="inter"
                color={VALUE_INK}
                lineHeight={17.88}
                align="right"
                numberOfLines={1}
              >
                {r.value ?? DASH}
              </Txt>
              {/* Every row but the last carries a 1pt bottom stroke. */}
              {i < rows.length - 1 ? (
                <Abs x={ROW_X} y={y + ROW_STEP - 1} w={ROW_W} h={1} bg={HAIRLINE} />
              ) : null}
            </Fragment>
          );
        })}
      </ScrollView>

      {/* ===================== Container — actions (20,717) ================= */}
      <Pressable
        onPress={createAnother}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
      >
        <Txt size={15} weight="semibold" font="inter" color={WHITE} lineHeight={22.5} align="center">
          Create Another Lead
        </Txt>
      </Pressable>
      <Pressable
        onPress={viewCampaign}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
      >
        <Txt
          size={15}
          weight="semibold"
          font="inter"
          color={VALUE_INK}
          lineHeight={22.5}
          align="center"
        >
          View Campaign
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  pressed: { opacity: 0.85 },

  /* Container (0,96 375x605) — the clipped body viewport (see GEOMETRY NOTE). */
  body: {
    position: "absolute",
    left: 0,
    top: BODY_TOP,
    width: FRAME_W,
    height: BODY_H,
  },
  bodyContent: { height: BODY_CONTENT_H },

  /* Button (16,22 36x36) — "Button:shadow" folds into the disc itself. */
  back: {
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

  /* Background+Shadow (151.5,96) — 0 8 32 #4aa064 @ 12%. */
  heroGlow: {
    shadowColor: "#4aa064",
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  /* Background+Shadow (167.5,112) — 0 4 12 #3e7d52 @ 30%. */
  coreGlow: {
    shadowColor: HERO_CORE,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  /* Container (20,268 335x69) — centred wrap, 8pt columns / 7.5pt rows. */
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 8,
    rowGap: 7.5,
  },
  chip: {
    height: 31,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  /* Background+Border+Shadow (20,361) — 0 12 40 black @ 5%. */
  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },

  /* Button (24,717 327x54.5) — 0 8 24 black @ 15%. */
  primary: {
    position: "absolute",
    left: 24,
    top: ACTIONS_Y,
    width: 327,
    height: PRIMARY_H,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_FILL,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  /* Button (20,783.5 335x56.5) — frosted white; expo-blur is not a dependency,
     so the BACKGROUND_BLUR is drawn as its translucent fill alone. */
  secondary: {
    position: "absolute",
    left: 20,
    top: SECONDARY_Y,
    width: 335,
    height: SECONDARY_H,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: WHITE,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
