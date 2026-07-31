import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
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
  useContacts,
  useConvertLead,
  useLeads,
  useUpdate,
  useUsers,
  type Lead,
} from "../../../src/api/hooks";

/**
 * Lead Detail — Figma 7333:14674 "lead detail - mark closed" (375x875).
 *
 * The later-pipeline stage of the lead-detail body. Every node below is the
 * same as 7333:12998; only the bottom action bar differs, so the CTA is a
 * variant of one component rather than a second route: a lead that is already
 * CONVERTED / CONNECTED offers "Mark Closed" (PATCH status DEAD), anything
 * earlier offers "Mark Converted" (POST /leads/:id/convert).
 *
 * The design's content frame (7333:14690) is 375x667 with clipsContent and a
 * 1013pt stack inside it, i.e. the body scrolls under a pinned header and a
 * pinned action bar. That is reproduced literally: the frame coordinates are
 * used everywhere, offset by CONTENT_Y inside the scrolling region.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** 7333:14690 — the clipped, scrolling body. */
const CONTENT_Y = 106;
const CONTENT_H = 667;
/** 1410 (bottom of Payment Summary) - 106 + 5 frame padding-bottom. */
const CONTENT_SCROLL_H = 1309;

/** Body children keep their raw frame Y, shifted into the scroll region. */
const cy = (y: number) => y - CONTENT_Y;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1D1D1F";
const INK_SOFT = "#6E6E73";
const MUTED = "#8A8A8E";
const HAIRLINE = "#F2F2F7";
const PINK = "#C13FBA";
const BLUE = "#3776F2";
const PURPLE = "#8A5AFE";
const GREEN = "#2B9A57";
const CHIP_BG = "#F4F4F6";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const BORDER_61 = "rgba(255,255,255,0.61)";
const BUTTON_INK = "#312B28";
const BAR_INK = "#1F1A17";
const BAR_DISABLED = "#ACAAAA";
const PLACEHOLDER = "#757575";

/** Costs (Est.) — 7333:14859. No cost model on the lead yet, so it is fixed. */
const EST_COSTS = 15000;

/* ------------------------------ derivations ------------------------------- */
/** Lead.money is stored loosely ("300k", "1.2L"); the card shows rupees. */
function rupees(money?: string): number {
  if (!money) return 0;
  const n = parseFloat(money);
  if (!isFinite(n)) return 0;
  const unit = money.trim().slice(-1).toLowerCase();
  if (unit === "k") return Math.round(n * 1_000);
  if (unit === "l") return Math.round(n * 100_000);
  if (unit === "m") return Math.round(n * 1_000_000);
  return Math.round(n);
}

/** CONTACTED -> "Contacted": the chips are title-case in the design. */
const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** CONVERTED / CONNECTED leads are closable; everything earlier converts. */
const isClosable = (status?: string) =>
  status === "CONVERTED" || status === "CONNECTED";

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

/* ---------------------------------- chip ---------------------------------- */
/** 27pt pill, 12pt radius, 12pt horizontal padding — 7333:14700 / 14702. */
function StatusChip({ label, tint }: { label: string; tint: string }) {
  return (
    <View style={[styles.statusChip, { backgroundColor: `${tint}1A` }]}>
      <Txt size={12} weight="semibold" font="inter" color={tint} lineHeight={14.52} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function LeadDetailMarkClosed() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [tab, setTab] = useState<"info" | "notes">("info");
  const [link, setLink] = useState("");

  const { data: leads = [] } = useLeads();
  const { data: users = [] } = useUsers();
  const { data: contacts = [] } = useContacts();
  const convert = useConvertLead();
  const patch = useUpdate<Lead>("leads");

  const lead = useMemo(
    () => (id ? leads.find((l) => l.id === id) : undefined) ?? leads[0],
    [leads, id],
  );

  const owner = users.find((u) => u.id === lead?.ownerId);
  const contact = contacts.find((c) => c.company === lead?.brandName);

  const person = lead?.contactPerson ?? "Priya Sharma";
  const brand = lead?.brandName ?? "Zostel Trip";
  const headline = lead?.money ? `₹${lead.money}` : "₹1.2L";
  const dealChip = lead?.dealType === "BARTER" ? "Barter" : "Paid";
  const statusChip = titleCase(lead?.status ?? "CONTACTED");
  const managedBy = owner?.name ?? "Sunil Kumar";
  const email = contact?.email ?? "priya@zostel.com";
  const website = email.split("@")[1] ?? "zostel.com";

  const budget = rupees(lead?.money) || 120000;
  const payout = budget - EST_COSTS;

  const closable = isClosable(lead?.status);
  const primaryLabel = closable ? "Mark Closed" : "Mark Converted";
  const onPrimary = () => {
    if (!lead) return;
    if (closable) patch.mutate({ id: lead.id, data: { status: "DEAD" } });
    else convert.mutate(lead.id);
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color="#1C1C1E" />
      </Pressable>
      <Txt x={71.5} y={30} w={235} size={16} weight="bold" font="inter" color={INK} lineHeight={19.36} align="center">
        Lead Detail{" "}
      </Txt>
      <Abs x={320} y={20} w={40} h={40} radius={20} bg={GLASS_65} border={BORDER_90} borderWidth={0.91} center style={styles.headerAction}>
        <Feather name="trash-2" size={20} color="#E74C3C" />
      </Abs>

      {/* --------------------- Body (clipped, scrolling) -------------------- */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card — 7333:14691 */}
        <Abs x={15} y={cy(111)} w={345} h={205} radius={24} style={styles.heroCard}>
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
        </Abs>
        <Txt x={39} y={cy(135)} w={200} size={24} weight="bold" font="inter" color={INK} lineHeight={29.04} numberOfLines={1}>
          {person}
        </Txt>
        <Txt x={39} y={cy(168)} w={200} size={14} weight="medium" font="inter" color={INK_SOFT} lineHeight={16.94} numberOfLines={1}>
          {brand}
        </Txt>
        <Txt x={39} y={cy(135)} w={297} size={18} weight="bold" font="inter" color={INK} lineHeight={21.78} align="right">
          {headline}
        </Txt>

        <Abs x={39} y={cy(197)} h={27} row gap={8}>
          <StatusChip label={dealChip} tint={PINK} />
          <StatusChip label={statusChip} tint={BLUE} />
        </Abs>

        <Abs x={39} y={cy(248)} w={44} h={44} radius={22} bg="#FFFFFF" center style={styles.roundShadow}>
          <Feather name="phone" size={20} color={INK} />
        </Abs>
        <Abs x={95} y={cy(248)} w={44} h={44} radius={22} bg="#FFFFFF" center style={styles.roundShadow}>
          <Feather name="message-circle" size={20} color={INK} />
        </Abs>
        <Abs x={151} y={cy(248)} w={44} h={44} radius={22} bg="#FFFFFF" center style={styles.roundShadow}>
          <Feather name="mail" size={20} color={INK} />
        </Abs>

        {/* Segmented control — 7333:14719 */}
        <Abs
          x={15}
          y={cy(331)}
          w={345}
          h={51}
          radius={999}
          bg={GLASS_65}
          border={BORDER_90}
          borderWidth={1}
          style={styles.clip}
        >
          <Abs
            x={tab === "info" ? 4 : 171.5}
            y={4}
            w={167.5}
            h={41}
            radius={999}
            bg={GLASS_90}
            style={styles.pillShadow}
          />
          <Pressable onPress={() => setTab("info")} style={[styles.tab, { left: 4 }]}>
            <Txt size={14} weight="semibold" font="inter" color={tab === "info" ? "#1C1C1E" : "#6C6C70"} lineHeight={16.94}>
              Lead Info
            </Txt>
          </Pressable>
          <Pressable onPress={() => setTab("notes")} style={[styles.tab, { left: 171.5 }]}>
            <Txt size={14} weight="semibold" font="inter" color={tab === "notes" ? "#1C1C1E" : "#6C6C70"} lineHeight={16.94}>
              Notes &amp; Activity
            </Txt>
          </Pressable>
        </Abs>

        {/* Managed by — 7333:14725 */}
        <Abs x={15} y={cy(397)} w={345} h={60} radius={20} bg={GLASS_60} border={BORDER_61} borderWidth={1} />
        <Abs x={35} y={cy(413)} w={305} h={28} row style={styles.spread}>
          <Txt size={14} weight="medium" font="inter" color={MUTED} lineHeight={16.94}>
            Managed by
          </Txt>
          <View style={styles.ownerRow}>
            <View style={styles.avatar} />
            <Txt size={14} weight="semibold" font="inter" color={INK} lineHeight={16.94} numberOfLines={1}>
              {managedBy}
            </Txt>
            <View style={styles.ownerButtonMargin}>
              <View style={styles.ownerButton}>
                <Feather name="phone" size={14} color={INK} />
              </View>
            </View>
          </View>
          {/* 7333:14737 "logos:whatsapp-icon" — a filled green badge, not an outline. */}
          <View style={styles.whatsapp}>
            <Ionicons name="call" size={16} color="#FFFFFF" />
          </View>
        </Abs>

        {/* Contact chips — 7333:14742 / 14749 */}
        <Abs x={15} y={cy(473)} w={166} h={32} radius={16} bg="#FFFFFF">
          <Abs x={16} y={8} w={16} h={16} center>
            <Feather name="mail" size={16} color={MUTED} />
          </Abs>
          <Txt x={38} y={8} w={112} size={13} weight="medium" font="inter" color={INK} lineHeight={15.73} numberOfLines={1}>
            {email}
          </Txt>
        </Abs>
        <Abs x={203} y={cy(473)} w={157} h={32} radius={16} bg="#FFFFFF">
          <Abs x={16} y={8} w={16} h={16} center>
            <Feather name="globe" size={16} color={MUTED} />
          </Abs>
          <Txt x={38} y={8} w={103} size={13} weight="medium" font="inter" color={INK} lineHeight={15.73} numberOfLines={1}>
            {website}
          </Txt>
        </Abs>

        {/* Brand Message — 7333:14756 */}
        <Abs x={15} y={cy(517)} w={345} h={168} radius={20} bg="#FFFFFF" />
        <Txt x={35} y={cy(549)} w={200} size={16} weight="semibold" font="inter" color={INK} lineHeight={19.36}>
          Brand Message
        </Txt>
        <Abs x={320} y={cy(549)} w={20} h={20} center>
          <Feather name="chevron-up" size={20} color={MUTED} />
        </Abs>
        <Txt x={35} y={cy(581)} w={305} size={14} weight="regular" font="inter" color={INK_SOFT} lineHeight={21}>
          {"“Hi Sophia! We're planning a winter\ncampaign for our new Manali property and\nwould love to collaborate. We are looking for\nauthentic experiences...”"}
        </Txt>

        {/* Script & References — 7333:14765 */}
        <Abs x={15} y={cy(697)} w={345} h={64} radius={20} bg="#FFFFFF" />
        <Txt x={35} y={cy(721)} w={240} size={16} weight="semibold" font="inter" color={INK} lineHeight={19.36}>
          Script &amp; References
        </Txt>
        <Abs x={320} y={cy(721)} w={20} h={20} center>
          <Feather name="chevron-right" size={20} color={MUTED} />
        </Abs>

        {/* Deliverables — 7333:14772 */}
        <Abs x={15} y={cy(773)} w={345} h={277} radius={20} bg="#FFFFFF" />
        <Txt x={35} y={cy(803)} w={200} size={16} weight="semibold" font="inter" color={INK} lineHeight={19.36}>
          Deliverables
        </Txt>
        <Abs x={308} y={cy(797)} w={32} h={32} radius={16} bg={CHIP_BG} center>
          <Feather name="plus" size={14} color={INK} />
        </Abs>

        <Abs x={35} y={cy(857)} w={40} h={40} radius={12} bg="#FFF0F5" center>
          <Feather name="video" size={20} color={PINK} />
        </Abs>
        <Txt x={87} y={cy(859)} w={253} size={15} weight="semibold" font="inter" color={INK} lineHeight={18.15}>
          1 Reel
        </Txt>
        <Txt x={87} y={cy(879)} w={253} size={13} weight="regular" font="inter" color={MUTED} lineHeight={15.73}>
          Needs script
        </Txt>
        <Abs x={35} y={cy(910)} w={305} h={1} bg={HAIRLINE} />

        <Abs x={35} y={cy(922)} w={40} h={40} radius={12} bg="#F3EBFF" center>
          <Feather name="aperture" size={20} color={PURPLE} />
        </Abs>
        <Txt x={87} y={cy(924)} w={253} size={15} weight="semibold" font="inter" color={INK} lineHeight={18.15}>
          2 Stories
        </Txt>
        <Txt x={87} y={cy(944)} w={253} size={13} weight="regular" font="inter" color={MUTED} lineHeight={15.73}>
          Pending shoot
        </Txt>

        <Abs x={35} y={cy(978)} w={305} h={52} radius={16} bg="#F9F9F9" />
        <TextInput
          value={link}
          onChangeText={setLink}
          placeholder="Add deliverable link..."
          placeholderTextColor={PLACEHOLDER}
          style={[styles.linkInput, { top: cy(988) }]}
        />
        <Pressable
          onPress={() => setLink("")}
          style={({ pressed }) => [styles.submit, { top: cy(988) }, pressed && styles.pressed]}
        >
          <Txt size={13} weight="semibold" font="inter" color="#FFFFFF" lineHeight={15.73}>
            Submit
          </Txt>
        </Pressable>

        {/* Add-ons — 7333:14814 */}
        <Txt x={35} y={cy(1066)} w={325} size={14} weight="semibold" font="inter" color={MUTED} lineHeight={16.94} letterSpacing={0.5}>
          ADD-ONS
        </Txt>

        <Abs x={30} y={cy(1095)} w={151.5} h={101} radius={20} bg="#FFFFFF" />
        <Abs x={46} y={cy(1111)} w={40} h={40} radius={12} bg={CHIP_BG} center>
          <Feather name="video" size={20} color={INK} />
        </Abs>
        <Abs x={145.5} y={cy(1111)} w={20} h={20} center>
          <Feather name="plus-circle" size={20} color={MUTED} />
        </Abs>
        <Txt x={46} y={cy(1163)} w={119.5} size={14} weight="semibold" font="inter" color={INK} lineHeight={16.94} numberOfLines={1}>
          Videographer
        </Txt>

        <Abs x={193.5} y={cy(1095)} w={151.5} h={101} radius={20} bg="#FFFFFF" />
        <Abs x={209.5} y={cy(1111)} w={40} h={40} radius={12} bg={CHIP_BG} center>
          <Feather name="scissors" size={20} color={INK} />
        </Abs>
        <Abs x={309} y={cy(1111)} w={20} h={20} center>
          <Feather name="plus-circle" size={20} color={MUTED} />
        </Abs>
        <Txt x={209.5} y={cy(1163)} w={119.5} size={14} weight="semibold" font="inter" color={INK} lineHeight={16.94} numberOfLines={1}>
          Editor
        </Txt>

        {/* Payment Summary — 7333:14846 */}
        <Abs x={15} y={cy(1208)} w={345} h={202} radius={20} bg="#FFFFFF" />
        <Txt x={35} y={cy(1240)} w={305} size={16} weight="semibold" font="inter" color={INK} lineHeight={19.36}>
          Payment Summary
        </Txt>
        <Txt x={35} y={cy(1279)} w={160} size={14} weight="medium" font="inter" color={INK} lineHeight={16.94}>
          Brand Budget
        </Txt>
        <Txt x={35} y={cy(1279)} w={305} size={14} weight="medium" font="inter" color={INK} lineHeight={16.94} align="right">
          {`₹${inr(budget)}`}
        </Txt>
        <Txt x={35} y={cy(1312)} w={160} size={14} weight="medium" font="inter" color={INK_SOFT} lineHeight={21}>
          Costs (Est.)
        </Txt>
        <Txt x={35} y={cy(1312)} w={305} size={14} weight="medium" font="inter" color={INK_SOFT} lineHeight={21} align="right">
          {`-₹${inr(EST_COSTS)}`}
        </Txt>
        <Abs x={35} y={cy(1349)} w={305} h={1} bg={HAIRLINE} />
        <Txt x={35} y={cy(1368)} w={160} size={16} weight="semibold" font="inter" color={INK} lineHeight={19.36}>
          Final Payout
        </Txt>
        <Txt x={35} y={cy(1366)} w={305} size={20} weight="bold" font="inter" color={GREEN} lineHeight={24.2} align="right">
          {`₹${inr(payout)}`}
        </Txt>
      </ScrollView>

      {/* --------------------------- Action bar ----------------------------- */}
      <Abs x={0} y={776} w={FRAME_W} h={99} bg="rgba(246,239,233,0.85)" />
      <Pressable
        onPress={() => router.push("/reminders/add-reminder")}
        style={({ pressed }) => [styles.followUp, pressed && styles.pressed]}
      >
        <Txt size={14} weight="medium" font="inter" color={BAR_INK} lineHeight={16.94}>
          Follow Up
        </Txt>
      </Pressable>
      <Pressable
        onPress={onPrimary}
        disabled={!lead || patch.isPending || convert.isPending}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
      >
        <Txt size={14} weight="medium" font="inter" color="#FFFFFF" lineHeight={16.94}>
          {primaryLabel}
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },
  spread: { justifyContent: "space-between" },

  backButton: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  headerAction: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 5.45,
    shadowOffset: { width: 0, height: 3.64 },
  },

  body: {
    position: "absolute",
    left: 0,
    top: CONTENT_Y,
    width: FRAME_W,
    height: CONTENT_H,
  },
  bodyContent: { height: CONTENT_SCROLL_H },

  heroCard: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  roundShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statusChip: {
    height: 27,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
  },

  pillShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tab: {
    position: "absolute",
    top: 4,
    width: 167.5,
    height: 41,
    alignItems: "center",
    justifyContent: "center",
  },

  ownerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#C4C4C4" },
  whatsapp: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
  },
  ownerButtonMargin: { paddingLeft: 4 },
  ownerButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CHIP_BG,
    alignItems: "center",
    justifyContent: "center",
  },

  linkInput: {
    position: "absolute",
    left: 51,
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
    width: 84.23,
    height: 36,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BUTTON_INK,
  },

  followUp: {
    position: "absolute",
    left: 20,
    top: 792,
    width: 161.5,
    height: 51,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_60,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.62)",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primary: {
    position: "absolute",
    left: 193.5,
    top: 792,
    width: 161.5,
    height: 51,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BAR_DISABLED,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
