import { Fragment, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import {
  inr,
  useContacts,
  useConvertLead,
  useInvoices,
  useLeads,
  useUsers,
} from "../../../src/api/hooks";

/**
 * Lead Detail — Payment Summary — Figma 7691:5545 "Leads details" (375x876),
 * traced 1:1. The agency-side counterpart of the creator app's 7333:12998.
 *
 * The frame pins a header (0,0 375x80) and a "Follow Up / Mark Converted"
 * action bar (0,777 375x99); everything between lives inside "Frame 2147223255"
 * (0,106 375x655, clipsContent) whose stack runs from y=111 to y=1486 in frame
 * space. That frame is reproduced as a clipped ScrollView, so the identity
 * card, the segmented tabs, the detail cards, the deliverables list, the ADD-ONS
 * tiles and the Payment Summary scroll inside it exactly as they do in Figma —
 * the design ships this screen already scrolled to the summary block.
 *
 * Coordinates below are raw frame coordinates from the spec; CY() rebases them
 * into the scroll content so the numbers in this file stay the numbers in Figma.
 *
 * Geist is not loaded (see app/_layout.tsx), so the header title and the tab
 * labels render in Inter, the frame's own body face. expo-blur is not a
 * dependency, so every BACKGROUND_BLUR is drawn as its translucent fill alone.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/** Frame 2147223255 — the clipped scroll region. */
const SCROLL = { x: 0, y: 106, w: 375, h: 655 } as const;
/** 5pt top padding + the section stack (111..1486) + 5pt bottom padding. */
const CONTENT_H = 1385;

/** Frame coordinate -> scroll-content coordinate. */
const CY = (n: number) => n - SCROLL.y;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1d1d1f";
const NAV_INK = "#1c1c1e";
const TITLE_INK = "#141311";
const MUTED = "#6e6e73";
const META = "#8a8a8e";
const TAB_OFF = "#6c6c70";
const DARK = "#312b28";
const BACK_INK = "#1f1a17";
const PILL_INK = "#8c8a84";
const PAYOUT_INK = "#2b9a57";
const PLACEHOLDER = "#757575";
const DELETE_RED = "#e74c3c";
const CHIP_BG = "#f4f4f6";
const CARD_TINT = "#f2edff";
const HAIRLINE = "#f2f2f7";
const INPUT_BG = "#f9f9f9";
const REEL_TINT = "#fff0f5";
const REEL_INK = "#c13fba";
const STORY_TINT = "#f3ebff";
const STORY_INK = "#8a5afe";
const BORDER_50 = "rgba(232,226,217,0.5)";
const BORDER_61 = "rgba(232,226,217,0.61)";
const WHITE_40 = "rgba(255,255,255,0.4)";
const WHITE_60 = "rgba(255,255,255,0.6)";
const WHITE_62 = "rgba(255,255,255,0.62)";
const WHITE_65 = "rgba(255,255,255,0.65)";
const WHITE_75 = "rgba(255,255,255,0.75)";
const WHITE_90 = "rgba(255,255,255,0.9)";
const PILL_ALT = "rgba(252,250,255,0.75)";
const BAR_FILL = "rgba(246,239,233,0.85)";

/* ------------------------------- spec copy -------------------------------- */
/**
 * The brand message, the deliverables list and the ADD-ONS tiles have no Prisma
 * model — Lead carries brand / contact / money / status / dealType and nothing
 * else — so these stay the design's literals while every field the schema does
 * model is live below.
 */
const BRAND_MESSAGE =
  '"Hi ! We\'re planning a winter\ncampaign for our new Manali property and\nwould love to collaborate. We are looking for\nauthentic experiences..."';

/** List rows step by 65: tile at 933 + i*65, title 935 + i*65, sub 955 + i*65. */
const DELIVERABLES = [
  { key: "reel", title: "1 Reel", sub: "Needs script", tint: REEL_TINT, ink: REEL_INK, icon: "video" },
  { key: "stories", title: "2 Stories", sub: "Pending shoot", tint: STORY_TINT, ink: STORY_INK, icon: "instagram" },
] as const;
const DELIVERABLE_STEP = 65;

/** Two 151.5-wide tiles at x=30 and x=193.5. No fee column exists, so the tiles
 *  carry selection only — inventing a rate would be inventing revenue. */
const ADD_ONS = [
  { key: "videographer", label: "Videographer", icon: "video" },
  { key: "editor", label: "Editor", icon: "scissors" },
] as const;
const ADD_ON_STEP = 163.5;

/** Fallback for "Costs (Est.)" when the brand has no invoice yet. */
const COSTS_EST = 15000;

/* -------------------------------- helpers --------------------------------- */
/** "440k", "₹1.2L", "1200000" -> 1_200_000. */
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

/** 120000 -> "₹1.2L" — the headline format the identity card uses. */
function headlineMoney(n: number): string {
  const trim = (v: number) => String(Math.round(v * 10) / 10);
  if (n >= 10_000_000) return `₹${trim(n / 10_000_000)}Cr`;
  if (n >= 100_000) return `₹${trim(n / 100_000)}L`;
  if (n >= 1_000) return `₹${trim(n / 1_000)}k`;
  return `₹${n}`;
}

/** "CONTACTED" -> "Contacted", the casing the pills use. */
const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** Contact has no website column; the design's chip is the email's own domain. */
const domainOf = (email?: string) => (email && email.includes("@") ? email.split("@")[1] : undefined);

const openUrl = (url?: string) => {
  if (url) Linking.openURL(url).catch(() => undefined);
};
const tel = (phone?: string) => (phone ? `tel:${phone}` : undefined);
const mailto = (email?: string) => (email ? `mailto:${email}` : undefined);
const whatsapp = (phone?: string) =>
  phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : undefined;

/* -------------------------------- pieces ---------------------------------- */
/** 27pt hug pill — the "Paid" / "Contacted" chips, both inked #8c8a84. */
function Pill({ label, tint }: { label: string; tint: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: tint }]}>
      <Txt size={12} font="inter" color={PILL_INK} lineHeight={14.52}>
        {label}
      </Txt>
    </View>
  );
}

/** 44pt white circle carrying one 20pt glyph (Container at 39,236). */
function QuickAction({ x, name, onPress }: {
  x: number; name: keyof typeof Feather.glyphMap; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quick, { left: x }, pressed && styles.pressed]}
    >
      <Feather name={name} size={20} color={INK} />
    </Pressable>
  );
}

/** The email / website chips: 32pt white pill, 16pt glyph, centred label. */
function MetaChip({ x, w, iconX, icon, textX, textW, label, onPress }: {
  x: number; w: number; iconX: number;
  icon: keyof typeof Feather.glyphMap;
  textX: number; textW: number; label: string; onPress: () => void;
}) {
  return (
    <Fragment>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.metaChip, { left: x, width: w }, pressed && styles.pressed]}
      />
      <Abs x={iconX} y={CY(481)} w={16} h={16} center>
        <Feather name={icon} size={16} color={META} />
      </Abs>
      <Txt
        x={textX} y={CY(481)} w={textW} size={13} weight="medium" font="inter"
        color={INK} lineHeight={15.73} align="center" numberOfLines={1}
      >
        {label}
      </Txt>
    </Fragment>
  );
}

/** Section header: 16pt semibold title with a trailing 20pt chevron. */
function SectionHead({ y, w, title, chevron }: {
  y: number; w: number; title: string; chevron: "chevron-up" | "chevron-right";
}) {
  return (
    <Fragment>
      <Txt x={35} y={CY(y)} w={w} size={16} weight="semibold" font="inter" color={INK} lineHeight={19.36}>
        {title}
      </Txt>
      <Abs x={320} y={CY(y)} w={20} h={20} center>
        <Feather name={chevron} size={20} color={META} />
      </Abs>
    </Fragment>
  );
}

/**
 * One Payment Summary row: label on the left at its spec width, value
 * right-aligned on the card's 340 inner edge so live amounts of any length keep
 * the design's right margin.
 */
function MoneyRow(p: {
  label: string; labelY: number; labelW: number; labelSize: number;
  labelWeight: "medium" | "semibold"; labelLine: number; labelInk: string;
  value: string; valueY: number; valueSize: number;
  valueWeight: "medium" | "bold"; valueLine: number; valueInk: string;
}) {
  return (
    <Fragment>
      <Txt
        x={35} y={CY(p.labelY)} w={p.labelW} size={p.labelSize} weight={p.labelWeight}
        font="inter" color={p.labelInk} lineHeight={p.labelLine}
      >
        {p.label}
      </Txt>
      <Txt
        x={180} y={CY(p.valueY)} w={160} size={p.valueSize} weight={p.valueWeight}
        font="inter" color={p.valueInk} lineHeight={p.valueLine} align="right" numberOfLines={1}
      >
        {p.value}
      </Txt>
    </Fragment>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function LeadPaymentSummary() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: leads = [], isLoading } = useLeads();
  const lead = leads.find((l) => l.id === id) ?? leads[0];

  const { data: users = [] } = useUsers();
  const { data: contacts = [] } = useContacts();
  const { data: invoices = [] } = useInvoices();
  const convert = useConvertLead();

  const owner = users.find((u) => u.id === lead?.ownerId);
  // Lead has no email column; the CRM contact for the same person carries one.
  const contact = contacts.find((c) => c.name === lead?.contactPerson);

  const heading = lead?.contactPerson ?? lead?.brandName ?? (isLoading ? "" : "Priya Sharma");
  const subheading = lead?.brandName ?? (isLoading ? "" : "Zostel Trip");
  const dealLabel = titleCase(lead?.dealType ?? "PAID");
  const statusLabel = titleCase(lead?.status ?? "CONTACTED");

  /**
   * Payment Summary. Lead models the brand budget (`money`) but nothing that
   * leaves the agency, so costs read off the brand's invoice when one exists —
   * Invoice.payout is exactly the creator-side money the agency disburses — and
   * fall back to the design's estimate otherwise. Final payout is always the
   * difference, so the three lines can never disagree on screen.
   */
  const invoice = invoices.find((i) => i.brandName === lead?.brandName);
  const brandBudget = invoice?.budget || parseMoney(lead?.money);
  const costsEstimate = invoice ? invoice.payout : COSTS_EST;
  const finalPayout = Math.max(brandBudget - costsEstimate, 0);

  // No deliverable-link endpoint yet, so the composer holds the draft.
  const [link, setLink] = useState("");
  // No add-on model either; selection is local so the tiles are not dead chrome.
  const [picked, setPicked] = useState<string[]>([]);
  const toggleAddOn = (key: string) =>
    setPicked((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const onConvert = () => {
    if (!lead || convert.isPending) return;
    convert.mutate(lead.id, { onSuccess: () => router.back() });
  };

  return (
    <Screen height={FRAME_H} background="#f8f5ef" scroll>
      {/* ------------------------- Frame 2147223255 ------------------------- */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {/* --------------------- Background+Shadow (card) ------------------- */}
        <Abs x={15} y={CY(111)} w={345} h={205} radius={24} bg={CARD_TINT} style={styles.identityCard} />

        <Txt
          x={39} y={CY(135)} w={156.14} size={24} weight="bold" font="inter"
          color={INK} lineHeight={29.04} numberOfLines={1}
        >
          {heading}
        </Txt>
        <Txt
          x={39} y={CY(168)} w={156.14} size={14} weight="medium" font="inter"
          color={MUTED} lineHeight={16.94} numberOfLines={1}
        >
          {subheading}
        </Txt>
        <Txt
          x={190.42} y={CY(135)} w={145.58} size={18} weight="bold" font="inter"
          color={INK} lineHeight={21.78} align="right" numberOfLines={1}
        >
          {headlineMoney(parseMoney(lead?.money))}
        </Txt>

        <Abs x={39} y={CY(197)} row gap={8}>
          <Pill label={dealLabel} tint={WHITE_75} />
          <Pill label={statusLabel} tint={PILL_ALT} />
        </Abs>

        <QuickAction x={39} name="phone" onPress={() => openUrl(tel(contact?.phone))} />
        <QuickAction x={95} name="message-circle" onPress={() => openUrl(whatsapp(contact?.phone))} />
        <QuickAction x={151} name="mail" onPress={() => openUrl(mailto(contact?.email))} />

        {/* --------------------- Segmented tabs (y=331) --------------------- */}
        <Abs
          x={15} y={CY(331)} w={345} h={51} radius={999}
          bg={WHITE_65} border={BORDER_50} borderWidth={1}
        />
        <Abs x={20} y={CY(336)} w={167.5} h={41} radius={999} bg={WHITE_90} style={styles.tabActive} />
        <Txt
          x={72.39} y={CY(348)} w={62.72} size={14} weight="semibold" font="inter"
          color={NAV_INK} lineHeight={18.2} align="center"
        >
          Lead Info
        </Txt>
        <Pressable
          onPress={() =>
            router.push({ pathname: "/leads/lead-notes", params: { id: lead?.id ?? "" } })
          }
          style={({ pressed }) => [styles.tabInactive, pressed && styles.pressed]}
        >
          <Txt size={14} weight="semibold" font="inter" color={TAB_OFF} lineHeight={18.2} align="center">
            {"Notes & Activity"}
          </Txt>
        </Pressable>

        {/* --------------------------- Lead by row -------------------------- */}
        <Abs
          x={15} y={CY(397)} w={345} h={60} radius={20}
          bg={WHITE_60} border={BORDER_61} borderWidth={1}
        />
        <Txt
          x={35} y={CY(418.5)} w={82.83} size={14} weight="medium" font="inter"
          color={META} lineHeight={16.94}
        >
          Lead by
        </Txt>
        <Abs x={104} y={CY(415)} w={24} h={24} radius={12} bg="#f2f2f7" style={styles.avatar}>
          {owner?.avatarUrl ? (
            <Image source={{ uri: owner.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Abs x={0} y={0} w={24} h={24} radius={12} bg="#c4c4c4" />
          )}
        </Abs>
        <Txt
          x={135} y={CY(418.5)} w={137} size={14} weight="semibold" font="inter"
          color={INK} lineHeight={16.94} numberOfLines={1}
        >
          {owner?.name ?? (isLoading ? "" : "Leena Sharma")}
        </Txt>
        <Pressable
          onPress={() => openUrl(tel(owner?.phone))}
          style={({ pressed }) => [styles.ownerCall, pressed && styles.pressed]}
        >
          <Feather name="phone" size={14} color={INK} />
        </Pressable>
        <Pressable
          onPress={() => openUrl(whatsapp(owner?.phone))}
          style={({ pressed }) => [styles.whatsapp, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={["#60D669", "#1FAF38"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <MaterialCommunityIcons name="whatsapp" size={18} color="#ffffff" />
        </Pressable>

        {/* ----------------------- Email / website -------------------------- */}
        <MetaChip
          x={15} w={166} iconX={31} icon="mail" textX={53} textW={111.95}
          label={contact?.email ?? "priya@zostel.com"}
          onPress={() => openUrl(mailto(contact?.email))}
        />
        <MetaChip
          x={203} w={157} iconX={219} icon="globe" textX={241} textW={67.97}
          label={domainOf(contact?.email) ?? "zostel.com"}
          onPress={() => openUrl(`https://${domainOf(contact?.email) ?? "zostel.com"}`)}
        />

        {/* -------------------------- Brand Message ------------------------- */}
        <Abs x={15} y={CY(517)} w={345} h={168} radius={20} bg="#ffffff" border={BORDER_50} borderWidth={1} />
        {/* Expanded, so the disclosure chevron points up (Vector 325,556.5 10x5). */}
        <SectionHead y={549} w={120.2} title="Brand Message" chevron="chevron-up" />
        <Txt x={35} y={CY(581)} w={305} size={14} font="inter" color={MUTED} lineHeight={21}>
          {BRAND_MESSAGE}
        </Txt>

        {/* ----------------------- Script & References ---------------------- */}
        <Abs x={15} y={CY(697)} w={345} h={64} radius={20} bg="#ffffff" border={BORDER_50} borderWidth={1} />
        <SectionHead y={721} w={152.48} title={"Script & References"} chevron="chevron-right" />

        {/* ----------------------------- Creators --------------------------- */}
        <Abs x={15} y={CY(773)} w={345} h={64} radius={20} bg="#ffffff" border={BORDER_50} borderWidth={1} />
        <SectionHead y={797} w={152.48} title="Creators" chevron="chevron-right" />

        {/* --------------------------- Deliverables ------------------------- */}
        <Abs x={15} y={CY(849)} w={345} h={277} radius={20} bg="#ffffff" border={BORDER_50} borderWidth={1} />
        <Txt x={35} y={CY(879)} w={95.77} size={16} weight="semibold" font="inter" color={INK} lineHeight={19.36}>
          Deliverables
        </Txt>
        <Abs x={308} y={CY(873)} w={32} h={32} radius={16} bg={CHIP_BG} center>
          <Feather name="plus" size={13} color={INK} />
        </Abs>

        {DELIVERABLES.map((d, i) => (
          <Fragment key={d.key}>
            <Abs
              x={35} y={CY(933 + i * DELIVERABLE_STEP)} w={40} h={40} radius={12}
              bg={d.tint} center
            >
              <Feather name={d.icon} size={20} color={d.ink} />
            </Abs>
            <Txt
              x={87} y={CY(935 + i * DELIVERABLE_STEP)} w={253} size={15} weight="semibold"
              font="inter" color={INK} lineHeight={18.15} numberOfLines={1}
            >
              {d.title}
            </Txt>
            <Txt
              x={87} y={CY(955 + i * DELIVERABLE_STEP)} w={253} size={13}
              font="inter" color={META} lineHeight={15.73} numberOfLines={1}
            >
              {d.sub}
            </Txt>
          </Fragment>
        ))}
        {/* Item 1 carries a 1pt bottom stroke; the list's only divider. */}
        <Abs x={35} y={CY(985)} w={305} h={1} bg={HAIRLINE} />

        <Abs x={35} y={CY(1054)} w={305} h={52} radius={16} bg={INPUT_BG} />
        <TextInput
          value={link}
          onChangeText={setLink}
          placeholder="Add deliverable link..."
          placeholderTextColor={PLACEHOLDER}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={() => setLink("")}
          style={styles.linkInput}
        />
        <Pressable
          onPress={() => setLink("")}
          style={({ pressed }) => [styles.submit, pressed && styles.pressed]}
        >
          <Txt size={13} weight="semibold" font="inter" color="#ffffff" lineHeight={15.73} align="center">
            Submit
          </Txt>
        </Pressable>

        {/* ------------------------------ ADD-ONS --------------------------- */}
        <Txt
          x={35} y={CY(1142)} w={325} size={14} weight="semibold" font="inter"
          color={META} lineHeight={16.94} letterSpacing={0.5}
        >
          ADD-ONS
        </Txt>
        {ADD_ONS.map((a, i) => {
          const x = 30 + i * ADD_ON_STEP;
          const on = picked.includes(a.key);
          return (
            <Fragment key={a.key}>
              <Pressable
                onPress={() => toggleAddOn(a.key)}
                style={({ pressed }) => [styles.addOn, { left: x }, pressed && styles.pressed]}
              />
              <Abs x={x + 16} y={CY(1187)} w={40} h={40} radius={12} bg={CHIP_BG} center>
                <Feather name={a.icon} size={20} color={INK} />
              </Abs>
              <Abs x={x + 115.5} y={CY(1187)} w={20} h={20} center>
                <Feather name={on ? "check-circle" : "plus-circle"} size={20} color={META} />
              </Abs>
              <Txt
                x={x + 16} y={CY(1239)} w={119.5} size={14} weight="semibold" font="inter"
                color={INK} lineHeight={16.94} numberOfLines={1}
              >
                {a.label}
              </Txt>
            </Fragment>
          );
        })}

        {/* ------------------------- Payment Summary ------------------------ */}
        <Abs x={15} y={CY(1284)} w={345} h={202} radius={20} bg="#ffffff" border={BORDER_50} borderWidth={1} />
        <Txt x={35} y={CY(1316)} w={305} size={16} weight="semibold" font="inter" color={INK} lineHeight={19.36}>
          Payment Summary
        </Txt>
        <MoneyRow
          label="Brand Budget" labelY={1355} labelW={91.25} labelSize={14}
          labelWeight="medium" labelLine={16.94} labelInk={INK}
          value={`₹${inr(brandBudget)}`} valueY={1355} valueSize={14}
          valueWeight="medium" valueLine={16.94} valueInk={INK}
        />
        <MoneyRow
          label="Costs (Est.)" labelY={1388} labelW={77.5} labelSize={14}
          labelWeight="medium" labelLine={21} labelInk={MUTED}
          value={`-₹${inr(costsEstimate)}`} valueY={1388} valueSize={14}
          valueWeight="medium" valueLine={21} valueInk={MUTED}
        />
        <Abs x={35} y={CY(1425)} w={305} h={1} bg={HAIRLINE} />
        <MoneyRow
          label="Final Payout" labelY={1444} labelW={94.2} labelSize={16}
          labelWeight="semibold" labelLine={19.36} labelInk={INK}
          value={`₹${inr(finalPayout)}`} valueY={1442} valueSize={20}
          valueWeight="bold" valueLine={24.2} valueInk={PAYOUT_INK}
        />
      </ScrollView>

      {/* --------------------------- Frame 2147223266 ----------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16} color="#faf7f2" />
      </Pressable>
      <Txt
        x={72} y={28} w={222} size={20} weight="medium" font="inter"
        color={TITLE_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Lead Detail
      </Txt>
      <Pressable style={({ pressed }) => [styles.delete, pressed && styles.pressed]}>
        <Feather name="trash-2" size={20} color={DELETE_RED} />
      </Pressable>

      {/* -------------------- Overlay+OverlayBlur action bar ---------------- */}
      <Abs x={0} y={777} w={FRAME_W} h={99} bg={BAR_FILL} />
      <Pressable
        onPress={() => router.push("/agency/profile/add-reminder")}
        style={({ pressed }) => [styles.action, styles.followUp, pressed && styles.pressed]}
      >
        <Txt size={14} weight="medium" font="inter" color={BACK_INK} lineHeight={16.94} align="center">
          Follow Up
        </Txt>
      </Pressable>
      <Pressable
        onPress={onConvert}
        disabled={convert.isPending}
        style={({ pressed }) => [styles.action, styles.convert, pressed && styles.pressed]}
      >
        <Txt size={14} weight="medium" font="inter" color="#ffffff" lineHeight={16.94} align="center">
          Mark Converted
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },

  /* Frame 2147223255 (0,106 375x655, clipsContent) */
  scroll: {
    position: "absolute",
    left: SCROLL.x,
    top: SCROLL.y,
    width: SCROLL.w,
    height: SCROLL.h,
    overflow: "hidden",
  },
  scrollContent: { width: SCROLL.w, height: CONTENT_H },

  /* Background+Shadow (15,111 345x205) */
  identityCard: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  pill: {
    height: 27,
    borderRadius: 24,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quick: {
    position: "absolute",
    top: CY(248),
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tabActive: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  /* Label (187.5,336 167.5x41) — the inactive tab has no fill of its own. */
  tabInactive: {
    position: "absolute",
    left: 187.5,
    top: CY(336),
    width: 167.5,
    height: 41,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { overflow: "hidden" },
  avatarImage: { width: 24, height: 24, borderRadius: 12 },
  ownerCall: {
    position: "absolute",
    left: 283,
    top: CY(413),
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CHIP_BG,
  },
  whatsapp: {
    position: "absolute",
    left: 321,
    top: CY(413),
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  /* Button (15,473 166x32) and (203,473 157x32) */
  metaChip: {
    position: "absolute",
    top: CY(473),
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BORDER_50,
  },

  linkInput: {
    position: "absolute",
    left: 51,
    top: CY(1064),
    width: 185,
    height: 36,
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 14,
    color: INK,
  },
  submit: {
    position: "absolute",
    left: 246,
    top: CY(1064),
    width: 84.23,
    height: 36,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK,
  },
  /* Background (30,1171 151.5x101) and (193.5,1171 151.5x101) */
  addOn: {
    position: "absolute",
    top: CY(1171),
    width: 151.5,
    height: 101,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BORDER_50,
  },

  /* Frame 2147223266 */
  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BACK_INK,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },
  delete: {
    position: "absolute",
    left: 314,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE_40,
    borderWidth: 0.82,
    borderColor: WHITE_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 9.82,
    shadowOffset: { width: 0, height: 3.27 },
  },

  /* Overlay+OverlayBlur (0,777 375x99) */
  action: {
    position: "absolute",
    top: 793,
    width: 161.5,
    height: 51,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  followUp: {
    left: 20,
    backgroundColor: WHITE_60,
    borderWidth: 1,
    borderColor: WHITE_62,
  },
  convert: { left: 193.5, backgroundColor: DARK },
});
