import { Fragment, useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import {
  inr,
  useAgencies,
  useContacts,
  useConvertLead,
  useLeads,
  useMe,
  useUsers,
} from "../../../src/api/hooks";

/**
 * Lead Detail — Lead Info — Figma 7333:12998 (375x875), traced 1:1.
 *
 * The frame pins a glass header at the top and a "Follow Up / Mark Converted"
 * action bar at the bottom; everything between lives in "Frame 2147223255"
 * (0,106 375x667, clipsContent) whose stack runs to y=1410 in frame space. That
 * frame is reproduced as a clipped ScrollView, so the identity card, the
 * segmented tabs, the detail cards, the deliverables list, the add-ons and the
 * payment summary scroll inside it exactly as they do in Figma.
 *
 * Coordinates below are raw frame coordinates from the spec; CY() rebases them
 * into the scroll content so the numbers in this file stay the numbers in Figma.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const SCROLL = { x: 0, y: 106, w: 375, h: 667 } as const;
/** 5pt top padding + the section stack (111..1410) + 5pt bottom padding. */
const CONTENT_H = 1309;

/** Frame coordinate -> scroll-content coordinate. */
const CY = (n: number) => n - SCROLL.y;

const CARD = { x: 15, y: 111, w: 345, h: 205 } as const;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1d1d1f";
const NAV_INK = "#1c1c1e";
const MUTED = "#6e6e73";
const META = "#8a8a8e";
const TAB_OFF = "#6c6c70";
const DARK = "#312b28";
const DEAL = "#c13fba";
const STATUS = "#3776f2";
const PAYOUT = "#2b9a57";
const PLACEHOLDER = "#757575";
const DELETE_RED = "#e74c3c";
const CHIP_BG = "#f4f4f6";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const BORDER_62 = "rgba(255,255,255,0.62)";
const BORDER_61 = "rgba(255,255,255,0.61)";
const BAR_FILL = "rgba(246,239,233,0.85)";

/* ------------------------------- spec copy -------------------------------- */
/**
 * The brand message, the script card, the deliverables and the add-on tiles
 * have no Prisma model yet (Lead carries only brand/contact/money/status), so
 * these stay the design's literals while every field the schema does model is
 * live below.
 */
const BRAND_MESSAGE =
  '"Hi Sophia! We\'re planning a winter\ncampaign for our new Manali property and\nwould love to collaborate. We are looking for\nauthentic experiences..."';

/** List rows step by 65: icon at 857 + i*65, title 859 + i*65, sub 879 + i*65. */
const DELIVERABLES = [
  { key: "reel", title: "1 Reel", sub: "Needs script", tint: "#fff0f5", ink: DEAL, icon: "video" },
  { key: "stories", title: "2 Stories", sub: "Pending shoot", tint: "#f3ebff", ink: "#8a5afe", icon: "instagram" },
] as const;
const DELIVERABLE_STEP = 65;

/** Two 151.5-wide tiles at x=30 and x=193.5. */
const ADD_ONS = [
  { key: "videographer", label: "Videographer", icon: "video" },
  { key: "editor", label: "Editor", icon: "scissors" },
] as const;
const ADD_ON_STEP = 163.5;

/** No add-on fee model yet; the summary's middle row is the design's estimate. */
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

/** Opens a tel:/mailto:/wa.me target when the record actually carries one. */
const openUrl = (url?: string) => {
  if (url) Linking.openURL(url).catch(() => undefined);
};
const tel = (phone?: string) => (phone ? `tel:${phone}` : undefined);
const mailto = (email?: string) => (email ? `mailto:${email}` : undefined);
const whatsapp = (phone?: string) =>
  phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : undefined;

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#haze)" />
    </Svg>
  );
}

/** Identity card fill: a warm diagonal sweep plus three radial glows. */
function CardWash() {
  return (
    <Fragment>
      <LinearGradient
        colors={[
          "rgba(255,229,164,0.82)",
          "rgba(255,245,228,0.92)",
          "rgba(244,211,238,0.88)",
          "rgba(202,217,255,0.76)",
        ]}
        locations={[0, 0.35, 0.72, 1]}
        start={{ x: 0.11, y: -0.21 }}
        end={{ x: 0.89, y: 1.21 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={CARD.w} height={CARD.h} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="cardPink" cx="248.4" cy="180.4" rx="296.7" ry="326" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.4" />
            <Stop offset="0.22" stopColor="#F7B7DA" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="cardGold" cx="282.9" cy="36.9" rx="320.85" ry="352.6" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.3" />
            <Stop offset="0.18" stopColor="#F6D64A" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="cardHaze" cx="62.1" cy="41" rx="320.85" ry="350.55" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
            <Stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width={CARD.w} height={CARD.h} fill="url(#cardPink)" />
        <Rect width={CARD.w} height={CARD.h} fill="url(#cardGold)" />
        <Rect width={CARD.w} height={CARD.h} fill="url(#cardHaze)" />
      </Svg>
    </Fragment>
  );
}

/* -------------------------------- pieces ---------------------------------- */
/**
 * 27pt hug pill — the "Paid" / "Contacted" chips. Fill is the ink at 10%, and
 * the width hugs the label the way the spec's auto-layout frame does.
 */
function Pill({ label, ink, tint }: { label: string; ink: string; tint: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: tint }]}>
      <Txt size={12} weight="semibold" font="inter" color={ink} lineHeight={14.52}>
        {label}
      </Txt>
    </View>
  );
}

/** 44pt white circle carrying one 20pt glyph. */
function QuickAction({ x, y, name, onPress }: {
  x: number; y: number; name: keyof typeof Feather.glyphMap; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quick, { left: x, top: y }, pressed && styles.pressed]}
    >
      <Feather name={name} size={20} color={INK} />
    </Pressable>
  );
}

/** The email / website chips: 32pt white pill, 16pt glyph, hug label. */
function MetaChip({ x, w, iconX, icon, textX, textW, label }: {
  x: number; w: number; iconX: number;
  icon: keyof typeof Feather.glyphMap;
  textX: number; textW: number; label: string;
}) {
  return (
    <Fragment>
      <Abs x={x} y={CY(473)} w={w} h={32} radius={16} bg="#ffffff" />
      <Abs x={iconX} y={CY(481)} w={16} h={16} center>
        <Feather name={icon} size={16} color={META} />
      </Abs>
      <Txt
        x={textX} y={CY(481)} w={textW} size={13} weight="medium" font="inter"
        color={INK} lineHeight={15.73} numberOfLines={1}
      >
        {label}
      </Txt>
    </Fragment>
  );
}

/** 24pt manager avatar — the spec fills this circle with a photo. */
function ManagerAvatar({ uri }: { uri?: string }) {
  return (
    <Abs x={138.29} y={CY(415)} w={24} h={24} radius={12} bg="#f2f2f7" style={styles.avatar}>
      {uri ? (
        <Image source={{ uri }} style={styles.avatarImage} />
      ) : (
        <Abs x={0} y={0} w={24} h={24} radius={12} bg="#c4c4c4" />
      )}
    </Abs>
  );
}

/** Section header: 16pt semibold title with a trailing chevron. */
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
 * One payment-summary row: label on the left at its spec width, value
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
export default function LeadDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: leads = [], isLoading } = useLeads();
  const lead = leads.find((l) => l.id === id) ?? leads[0];

  const { data: users = [] } = useUsers();
  const { data: agencies = [] } = useAgencies();
  const { data: contacts = [] } = useContacts();
  const { data: me } = useMe();
  const convert = useConvertLead();

  // "Managed by" resolves owner -> agency, and reads "Self" when the signed-in
  // creator owns the lead (7224:17808 ships that state).
  const owner = users.find((u) => u.id === lead?.ownerId);
  const agency = agencies.find((a) => a.id === lead?.agencyId);
  const isSelf = !!me && !!lead?.ownerId && lead.ownerId === me.id;
  const managerName = isSelf ? "Self" : (owner?.name ?? agency?.name ?? "Sunil Kumar");

  // Lead has no email column; the CRM contact for the same person carries one.
  const contact = contacts.find((c) => c.name === lead?.contactPerson);

  const heading = lead?.contactPerson ?? lead?.brandName ?? (isLoading ? "" : "Priya Sharma");
  const subheading = lead?.brandName ?? (isLoading ? "" : "Zostel Trip");
  const budget = parseMoney(lead?.money);
  const dealLabel = titleCase(lead?.dealType ?? "PAID");
  const statusLabel = titleCase(lead?.status ?? "CONTACTED");

  // No deliverable-link endpoint yet, so the composer holds the draft.
  const [link, setLink] = useState("");

  const onConvert = () => {
    if (!lead || convert.isPending) return;
    convert.mutate(lead.id, { onSuccess: () => router.back() });
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------- Frame 2147223255 ------------------------- */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {/* --------------------- Background+Shadow (card) ------------------- */}
        <Abs
          x={CARD.x} y={CY(CARD.y)} w={CARD.w} h={CARD.h} radius={24}
          style={styles.identityCard}
        >
          <CardWash />
        </Abs>

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
          {headlineMoney(budget)}
        </Txt>

        <Abs x={39} y={CY(197)} row gap={8}>
          <Pill label={dealLabel} ink={DEAL} tint="rgba(193,63,186,0.1)" />
          <Pill label={statusLabel} ink={STATUS} tint="rgba(55,118,242,0.1)" />
        </Abs>

        <QuickAction x={39} y={CY(248)} name="phone" onPress={() => openUrl(tel(contact?.phone))} />
        <QuickAction x={95} y={CY(248)} name="message-circle" onPress={() => openUrl(whatsapp(contact?.phone))} />
        <QuickAction x={151} y={CY(248)} name="mail" onPress={() => openUrl(mailto(contact?.email))} />

        {/* --------------------- Segmented tabs (y=331) --------------------- */}
        <Abs
          x={15} y={CY(331)} w={345} h={51} radius={999}
          bg={GLASS_65} border={BORDER_90} borderWidth={1}
        />
        <Abs x={20} y={CY(336)} w={167.5} h={41} radius={999} bg={GLASS_90} style={styles.tabActive} />
        <Txt
          x={72.39} y={CY(348)} w={62.72} size={14} weight="semibold" font="inter"
          color={NAV_INK} lineHeight={16.94} align="center"
        >
          Lead Info
        </Txt>
        <Txt
          x={217.07} y={CY(348)} w={108.36} size={14} weight="semibold" font="inter"
          color={TAB_OFF} lineHeight={16.94} align="center"
        >
          {"Notes & Activity"}
        </Txt>

        {/* ------------------------- Managed by row ------------------------- */}
        <Abs
          x={15} y={CY(397)} w={345} h={60} radius={20}
          bg={GLASS_60} border={BORDER_61} borderWidth={1}
        />
        <Txt
          x={35} y={CY(418.5)} w={82.83} size={14} weight="medium" font="inter"
          color={META} lineHeight={16.94}
        >
          Managed by
        </Txt>
        <ManagerAvatar uri={owner?.avatarUrl} />
        <Txt
          x={170.29} y={CY(418.5)} w={81.25} size={14} weight="semibold" font="inter"
          color={INK} lineHeight={16.94} numberOfLines={1}
        >
          {managerName}
        </Txt>
        <Pressable
          onPress={() => openUrl(tel(owner?.phone))}
          style={({ pressed }) => [styles.managerCall, pressed && styles.pressed]}
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
          <MaterialCommunityIcons name="whatsapp" size={18} color="#FFFFFF" />
        </Pressable>

        {/* ----------------------- Email / website ------------------------- */}
        <MetaChip
          x={15} w={166} iconX={31} icon="mail" textX={53} textW={111.95}
          label={contact?.email ?? "priya@zostel.com"}
        />
        <MetaChip
          x={203} w={157} iconX={219} icon="globe" textX={241} textW={67.97}
          label="zostel.com"
        />

        {/* -------------------------- Brand Message ------------------------- */}
        <Abs x={15} y={CY(517)} w={345} h={168} radius={20} bg="#ffffff" />
        <SectionHead y={549} w={120.2} title="Brand Message" chevron="chevron-up" />
        <Txt x={35} y={CY(581)} w={305} size={14} font="inter" color={MUTED} lineHeight={21}>
          {BRAND_MESSAGE}
        </Txt>

        {/* ----------------------- Script & References ---------------------- */}
        <Abs x={15} y={CY(697)} w={345} h={64} radius={20} bg="#ffffff" />
        <SectionHead y={721} w={152.48} title={"Script & References"} chevron="chevron-right" />

        {/* --------------------------- Deliverables ------------------------- */}
        <Abs x={15} y={CY(773)} w={345} h={277} radius={20} bg="#ffffff" />
        <Txt x={35} y={CY(803)} w={95.77} size={16} weight="semibold" font="inter" color={INK} lineHeight={19.36}>
          Deliverables
        </Txt>
        <Abs x={308} y={CY(797)} w={32} h={32} radius={16} bg={CHIP_BG} center>
          <Feather name="plus" size={13} color={INK} />
        </Abs>

        {DELIVERABLES.map((d, i) => (
          <Fragment key={d.key}>
            <Abs
              x={35} y={CY(857 + i * DELIVERABLE_STEP)} w={40} h={40} radius={12}
              bg={d.tint} center
            >
              <Feather name={d.icon} size={20} color={d.ink} />
            </Abs>
            <Txt
              x={87} y={CY(859 + i * DELIVERABLE_STEP)} w={253} size={15} weight="semibold"
              font="inter" color={INK} lineHeight={18.15} numberOfLines={1}
            >
              {d.title}
            </Txt>
            <Txt
              x={87} y={CY(879 + i * DELIVERABLE_STEP)} w={253} size={13}
              font="inter" color={META} lineHeight={15.73} numberOfLines={1}
            >
              {d.sub}
            </Txt>
          </Fragment>
        ))}

        <Abs x={35} y={CY(978)} w={305} h={52} radius={16} bg="#f9f9f9" />
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
          x={35} y={CY(1066)} w={325} size={14} weight="semibold" font="inter"
          color={META} lineHeight={16.94} letterSpacing={0.5}
        >
          ADD-ONS
        </Txt>
        {ADD_ONS.map((a, i) => {
          const x = 30 + i * ADD_ON_STEP;
          return (
            <Fragment key={a.key}>
              <Abs x={x} y={CY(1095)} w={151.5} h={101} radius={20} bg="#ffffff" />
              <Abs x={x + 16} y={CY(1111)} w={40} h={40} radius={12} bg={CHIP_BG} center>
                <Feather name={a.icon} size={20} color={INK} />
              </Abs>
              <Abs x={x + 115.5} y={CY(1111)} w={20} h={20} center>
                <Feather name="plus-circle" size={20} color={META} />
              </Abs>
              <Txt
                x={x + 16} y={CY(1163)} w={119.5} size={14} weight="semibold" font="inter"
                color={INK} lineHeight={16.94} numberOfLines={1}
              >
                {a.label}
              </Txt>
            </Fragment>
          );
        })}

        {/* ------------------------- Payment Summary ------------------------ */}
        <Abs x={15} y={CY(1208)} w={345} h={202} radius={20} bg="#ffffff" />
        <Txt x={35} y={CY(1240)} w={305} size={16} weight="semibold" font="inter" color={INK} lineHeight={19.36}>
          Payment Summary
        </Txt>
        <MoneyRow
          label="Brand Budget" labelY={1279} labelW={91.25} labelSize={14}
          labelWeight="medium" labelLine={16.94} labelInk={INK}
          value={`₹${inr(budget)}`} valueY={1279} valueSize={14}
          valueWeight="medium" valueLine={16.94} valueInk={INK}
        />
        <MoneyRow
          label="Costs (Est.)" labelY={1312} labelW={77.5} labelSize={14}
          labelWeight="medium" labelLine={21} labelInk={MUTED}
          value={`-₹${inr(COSTS_EST)}`} valueY={1312} valueSize={14}
          valueWeight="medium" valueLine={21} valueInk={MUTED}
        />
        <Abs x={35} y={CY(1349)} w={305} h={1} bg="#f2f2f7" />
        <MoneyRow
          label="Final Payout" labelY={1368} labelW={94.2} labelSize={16}
          labelWeight="semibold" labelLine={19.36} labelInk={INK}
          value={`₹${inr(Math.max(budget - COSTS_EST, 0))}`} valueY={1366} valueSize={20}
          valueWeight="bold" valueLine={24.2} valueInk={PAYOUT}
        />
      </ScrollView>

      {/* --------------------------------- Header --------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.headerButton, styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={NAV_INK} />
      </Pressable>
      <Txt
        x={71.5} y={30} w={235} size={16} weight="bold" font="inter"
        color={INK} lineHeight={19.36} align="center"
      >
        Lead Detail
      </Txt>
      <Pressable
        style={({ pressed }) => [styles.headerButton, styles.deleteButton, pressed && styles.pressed]}
      >
        <Feather name="trash-2" size={20} color={DELETE_RED} />
      </Pressable>

      {/* ------------------------------ Action bar -------------------------- */}
      <Abs x={0} y={776} w={FRAME_W} h={99} bg={BAR_FILL} />
      <Pressable
        onPress={() => router.push("/reminders/add-reminder" as never)}
        style={({ pressed }) => [styles.action, styles.followUp, pressed && styles.pressed]}
      >
        <Txt size={14} weight="medium" font="inter" color="#1f1a17" lineHeight={16.94} align="center">
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
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.85 },

  /* Frame 2147223255 (0,106 375x667, clipsContent) */
  scroll: {
    position: "absolute",
    left: SCROLL.x,
    top: SCROLL.y,
    width: SCROLL.w,
    height: SCROLL.h,
    overflow: "hidden",
  },
  scrollContent: { width: SCROLL.w, height: CONTENT_H },

  identityCard: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  pill: {
    height: 27,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quick: {
    position: "absolute",
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
  avatar: { overflow: "hidden" },
  avatarImage: { width: 24, height: 24, borderRadius: 12 },
  managerCall: {
    position: "absolute",
    left: 263.54,
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
    left: 312,
    top: CY(413),
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  linkInput: {
    position: "absolute",
    left: 51,
    top: CY(988),
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
    top: CY(988),
    width: 84.23,
    height: 36,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK,
  },

  /* Header */
  headerButton: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  backButton: { left: 15, top: 18, width: 44, height: 44, borderRadius: 22 },
  deleteButton: { left: 320, top: 20, width: 40, height: 40, borderRadius: 20 },

  /* Overlay+OverlayBlur action bar (0,776 375x99) */
  action: {
    position: "absolute",
    top: 792,
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
    backgroundColor: GLASS_60,
    borderWidth: 1,
    borderColor: BORDER_62,
  },
  convert: { left: 193.5, backgroundColor: DARK },
});
