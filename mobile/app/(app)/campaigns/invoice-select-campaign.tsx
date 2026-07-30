import { useMemo, useState } from "react";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import {
  useCreate,
  useInvoices,
  useLeads,
  useUsers,
  type Invoice,
} from "../../../src/api/hooks";

/**
 * Select the Campaign — Figma 7358:30046 (375x875).
 *
 * The Create Invoice builder ("Main" -> "Section", a 335x1181 glass panel that
 * the 674pt tall Main frame clips at y=780) sits underneath a 0.57 scrim, and a
 * 588pt bottom sheet is presented over it: grabber, title, close button, the
 * campaign cards and the Cancel / Send Invoice footer.
 *
 * Coordinates below are raw frame coordinates from the spec; <Screen> scales the
 * 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** "Main" is y=106 h=674 with clipsContent — the Section overflows it. */
const FORM_CLIP_H = 780;

const SHEET_Y = 287;
const SHEET_H = 588;

const LIST_X = 16;
const LIST_Y = 402;
const LIST_H = 352;
const CARD_W = 335;
const CARD_H = 170;
const CARD_STEP = 182; // 584 - 402
/** 402 + 2*182 = 766 overruns the 754 container bottom, so two cards fit. */
const MAX_CARDS = 2;

/* --------------------------- spec colour tokens --------------------------- */
const HEADING = "#9283B4";
const LABEL = "#787486";
const VALUE = "#6C687A";
const PLACEHOLDER = "#B8B5C6";
const INK = "#1D1D1F";
const TITLE_INK = "#111111";
const META = "#6E6E73";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const BUTTON_INK = "#312B28";
const CANCEL_INK = "#1F1A17";
const SCRIM = "rgba(181,180,185,0.57)";
const DIVIDER_OFF = "rgba(200,190,220,0)";
const DIVIDER_ON = "rgba(200,190,220,0.25)";

/** The two card treatments the design ships, keyed off the lead's stage. */
const TONES = {
  contacted: {
    card: ["#F1EAFA", "#F9F6FC"] as readonly [string, string],
    chipBg: "#E1D7FA",
    chipInk: "#7A54B8",
  },
  won: {
    card: ["#E8F0FC", "#F4F8FE"] as readonly [string, string],
    chipBg: "#C4D8FE",
    chipInk: "#2E60D1",
  },
} as const;

type Tone = keyof typeof TONES;

/* --------------------------------- helpers -------------------------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "14 Jun, 2026" — the format the Invoice Date field uses. */
const dayMonthYear = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;

/** "1 day ago" / "3 days ago" — the card's activity suffix. */
function daysAgo(iso?: string): string {
  const t = iso ? new Date(iso).getTime() : NaN;
  const n = Number.isFinite(t) ? Math.max(1, Math.floor((Date.now() - t) / 86_400_000)) : 1;
  return n === 1 ? "1 day ago" : `${n} days ago`;
}

/** Leads carry money as text ("300k", "1.5L"); invoices need rupees. */
function parseMoney(s?: string): number {
  const m = /([\d.]+)\s*([kKlL])?/.exec(s ?? "");
  if (!m) return 0;
  const n = Number(m[1]);
  const unit = (m[2] ?? "").toLowerCase();
  return Math.round(unit === "k" ? n * 1_000 : unit === "l" ? n * 100_000 : n);
}

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: linear base plus four radial tints. */
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

/* ------------------------------ form fragments ---------------------------- */
const Heading = ({ y, children }: { y: number; children: string }) => (
  <Txt
    x={41} y={y} w={293} size={13} weight="bold" font="inter"
    color={HEADING} lineHeight={15.73} letterSpacing={1}
  >
    {children}
  </Txt>
);

const Label = ({ x, y, w, children }: { x: number; y: number; w: number; children: string }) => (
  <Txt x={x} y={y} w={w} size={13} weight="medium" font="inter" color={LABEL} lineHeight={15.73}>
    {children}
  </Txt>
);

/** Field value / placeholder — 15px Inter medium, filled vs. hint colour. */
const Value = ({
  x, y, w, filled, children,
}: { x: number; y: number; w: number; filled?: boolean; children: string }) => (
  <Txt
    x={x} y={y} w={w} size={15} weight="medium" font="inter"
    color={filled ? VALUE : PLACEHOLDER} lineHeight={18.15}
  >
    {children}
  </Txt>
);

const Divider = ({ y }: { y: number }) => (
  <LinearGradient
    colors={[DIVIDER_OFF, DIVIDER_ON, DIVIDER_OFF]}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
    style={{ position: "absolute", left: 41, top: y, width: 293, height: 1 }}
  />
);

/* ------------------------------ campaign card ----------------------------- */
interface Row {
  id: string;
  contactName: string;
  campaign: string;
  amount: string;
  stage: string;
  tone: Tone;
  meta: string;
  budget: number;
  brand: string;
}

/** The 3-button quick-action row every card carries (x is card-relative). */
const ACTIONS: { key: string; icon: ComponentProps<typeof Ionicons>["name"]; x: number }[] = [
  { key: "view", icon: "eye-outline", x: 16 },
  { key: "copy", icon: "copy-outline", x: 60 },
  { key: "more", icon: "ellipsis-horizontal", x: 104 },
];

function CampaignCard({
  row, top, selected, onPress,
}: { row: Row; top: number; selected: boolean; onPress: () => void }) {
  const tone = TONES[row.tone];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute", left: 0, top, width: CARD_W, height: CARD_H,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <LinearGradient
        colors={tone.card}
        start={{ x: 0.14, y: 0 }}
        end={{ x: 0.86, y: 1 }}
        style={[
          styles.cardFill,
          selected ? { borderWidth: 1.5, borderColor: tone.chipInk } : null,
        ]}
      />

      {/* name + campaign + amount pill */}
      <Txt
        x={16} y={16} w={92.97} size={16} weight="bold" font="inter"
        color={INK} lineHeight={19.36} numberOfLines={1}
      >
        {row.contactName}
      </Txt>
      <Txt
        x={16} y={38} w={92.97} size={13} weight="medium" font="inter"
        color={META} lineHeight={15.73} numberOfLines={2}
      >
        {row.campaign}
      </Txt>
      <Abs x={16} y={16} w={303} h={25} style={styles.pillRow}>
        <View style={styles.pill}>
          <Txt size={14} weight="bold" font="inter" color={INK} lineHeight={16.94} numberOfLines={1}>
            {row.amount}
          </Txt>
        </View>
      </Abs>

      {/* stage chip + managed-by line */}
      <Abs x={16} y={82} w={303} h={20} row gap={8}>
        <View style={[styles.chip, { backgroundColor: tone.chipBg }]}>
          <Txt size={10} weight="bold" font="inter" color={tone.chipInk} lineHeight={12.1}>
            {row.stage}
          </Txt>
        </View>
        <View style={styles.metaBox}>
          <Txt size={12} weight="medium" font="inter" color={META} lineHeight={14.52} numberOfLines={1}>
            {row.meta}
          </Txt>
        </View>
      </Abs>

      {/* quick actions */}
      {ACTIONS.map((a) => (
        <Abs key={a.key} x={a.x} y={118} w={36} h={36} radius={18} bg={GLASS_70} center style={styles.actionShadow}>
          <Ionicons name={a.icon} size={16} color={META} />
        </Abs>
      ))}
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function InvoiceSelectCampaign() {
  const router = useRouter();
  const { data: leads = [], isLoading } = useLeads();
  const { data: users = [] } = useUsers();
  const { data: invoices = [] } = useInvoices();
  const createInvoice = useCreate<Invoice>("invoices");

  const [selected, setSelected] = useState<string | null>(null);

  // Frozen at mount so the invoice date cannot renumber itself mid-edit.
  const invoiceDate = useMemo(() => dayMonthYear(new Date()), []);
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`;

  const rows = useMemo<Row[]>(() => {
    const owners = new Map(users.map((u) => [u.id, u.name]));
    return leads
      .filter((l) => l.status === "CONTACTED" || l.status === "CONVERTED")
      .slice(0, MAX_CARDS)
      .map((l) => {
        const when = daysAgo(l.updatedAt);
        const who = l.ownerId ? owners.get(l.ownerId) : undefined;
        return {
          id: l.id,
          contactName: l.contactPerson ?? l.brandName,
          campaign: l.brandName,
          amount: `₹${(l.money ?? "0").toUpperCase()}`,
          stage: l.status === "CONVERTED" ? "WON" : l.status,
          tone: l.status === "CONVERTED" ? ("won" as Tone) : ("contacted" as Tone),
          meta: who ? `Managed by ${who} • ${when}` : when,
          budget: parseMoney(l.money),
          brand: l.brandName,
        };
      });
  }, [leads, users]);

  const chosen = rows.find((r) => r.id === selected);
  const canSend = !!chosen && !createInvoice.isPending;

  const send = () => {
    if (!chosen || createInvoice.isPending) return;
    createInvoice.mutate(
      { number: invoiceNumber, brandName: chosen.brand, budget: chosen.budget },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* =============================== Main =============================== */}
      <Abs x={0} y={0} w={FRAME_W} h={FORM_CLIP_H} style={styles.clip}>
        {/* Section — the glass panel the whole form sits on */}
        <Abs x={20} y={106} w={335} h={1181} radius={32} bg={GLASS_60} style={styles.panelShadow} />

        {/* ---------------------------- Invoice Details --------------------- */}
        <Heading y={139}>INVOICE DETAILS</Heading>

        <Label x={47} y={177} w={287}>Invoice Number</Label>
        <Abs x={41} y={201} w={293} h={52} radius={20} bg={GLASS_80} style={styles.fieldShadow} />
        <Value x={62} y={218} w={103} filled>{invoiceNumber}</Value>

        <Label x={47} y={269} w={134.5}>Invoice Date</Label>
        <Abs x={41} y={293} w={140} h={52} radius={20} bg={GLASS_80} style={styles.fieldShadow} />
        <Value x={47} y={310} w={102} filled>{invoiceDate}</Value>
        <Abs x={149} y={310} w={18} h={18} center>
          <Ionicons name="calendar-outline" size={18} color={VALUE} />
        </Abs>

        <Label x={199.5} y={269} w={134.5}>Due Date</Label>
        <Abs x={193.5} y={293} w={140} h={52} radius={20} bg={GLASS_80} style={styles.fieldShadow} />
        <Value x={204.5} y={310} w={102}>Select</Value>
        <Abs x={306.5} y={310} w={18} h={18} center>
          <Ionicons name="calendar-outline" size={18} color={PLACEHOLDER} />
        </Abs>

        <Divider y={381} />

        {/* -------------------------- Client Information -------------------- */}
        <Heading y={418}>CLIENT INFORMATION</Heading>

        <Label x={47} y={456} w={287}>Client Name</Label>
        <Abs x={41} y={480} w={293} h={52} radius={20} bg={GLASS_80} style={styles.fieldShadow} />
        <Value x={62} y={497} w={101}>e.g. Nike India</Value>

        <Label x={47} y={548} w={287}>GST Number</Label>
        <Abs x={41} y={572} w={293} h={52} radius={20} bg={GLASS_80} style={styles.fieldShadow} />
        <Value x={62} y={589} w={164}>Enter GSTIN (Optional)</Value>

        <Label x={47} y={640} w={287}>Address</Label>
        <Abs x={41} y={664} w={293} h={88} radius={16} bg={GLASS_80} />
        <Value x={58} y={681} w={163.41}>Client billing address...</Value>

        <Divider y={788} />

        {/* --------------------------- Service Details ---------------------- */}
        <Heading y={825}>SERVICE DETAILS</Heading>

        <Label x={47} y={863} w={287}>Campaign Name</Label>
        <Abs x={41} y={887} w={293} h={53} radius={16} bg="rgba(255,255,255,0.84)" />
        <Value x={58} y={904} w={209.06}>{chosen ? chosen.campaign : "e.g. Summer collection shoot"}</Value>

        <Label x={47} y={956} w={287}>Deliverables</Label>
        <Abs x={41} y={980} w={293} h={53} radius={16} bg="rgba(255,255,255,0.78)" />
        <Value x={58} y={997} w={140.28}>e.g. 2 Reels, 1 Story</Value>

        <Label x={47} y={1049} w={287}>Amount (₹)</Label>
        <Abs x={41} y={1073} w={293} h={53} radius={16} bg={GLASS_80} />
        <Value x={58} y={1090} w={32.81}>0.00</Value>

        <Label x={47} y={1142} w={287}>Notes</Label>
        <Abs x={41} y={1166} w={293} h={88} radius={16} bg="rgba(255,255,255,0.77)" />
        <Value x={58} y={1183} w={230.16}>{"Payment terms, account details,\netc..."}</Value>
      </Abs>

      {/* ============================= Bottom CTA ============================ */}
      <Abs x={71.5} y={794} w={232} h={55} radius={36} bg={BUTTON_INK} style={styles.ctaShadow}>
        <Txt
          x={0} y={18} w={232} size={16} weight="semibold" font="inter"
          color="#FFFFFF" lineHeight={19.36} align="center"
        >
          Save
        </Txt>
      </Abs>

      {/* =============================== Header ============================== */}
      <Abs x={15} y={18} w={44} h={44} radius={22} bg="rgba(255,255,255,0.65)" center style={styles.backShadow}>
        <Ionicons name="chevron-back" size={20} color="#1C1C1E" />
      </Abs>
      <Txt
        x={79.5} y={30} w={236} size={16} weight="bold" font="inter"
        color={INK} lineHeight={19.36} align="center"
      >
        Create Invoice
      </Txt>

      {/* ================================ Scrim ============================== */}
      <Pressable onPress={() => router.back()} style={styles.scrim} />

      {/* ============================= Bottom sheet ========================== */}
      <Abs x={0} y={SHEET_Y} w={FRAME_W} h={SHEET_H} bg="#FFFFFF" style={styles.sheet} />
      <Abs x={167.5} y={303} w={40} h={4} radius={2} bg="#E5E5E5" />
      <Txt
        x={24} y={331} w={280} size={24} weight="semibold" font="inter"
        color={TITLE_INK} lineHeight={29.05} letterSpacing={-0.52}
      >
        Select the Campaign
      </Txt>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.close, pressed && styles.pressed]}
      >
        <Ionicons name="close" size={20} color={INK} />
      </Pressable>

      {/* Campaign cards */}
      <Abs x={LIST_X} y={LIST_Y} w={CARD_W} h={LIST_H}>
        {rows.map((r, i) => (
          <CampaignCard
            key={r.id}
            row={r}
            top={i * CARD_STEP}
            selected={r.id === selected}
            onPress={() => setSelected(r.id)}
          />
        ))}
        {!isLoading && rows.length === 0 ? (
          <Txt
            x={16} y={16} w={303} size={13} weight="medium" font="inter"
            color={META} lineHeight={15.73}
          >
            No campaigns
          </Txt>
        ) : null}
      </Abs>

      {/* Sheet footer */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
      >
        <Txt
          x={0} y={17} w={161.5} size={14} weight="medium" font="inter"
          color={CANCEL_INK} lineHeight={16.94} align="center"
        >
          Cancel
        </Txt>
      </Pressable>
      <Pressable
        onPress={send}
        disabled={!canSend}
        style={({ pressed }) => [
          styles.send,
          { opacity: canSend ? (pressed ? 0.9 : 1) : 0.5 },
        ]}
      >
        <Txt
          x={0} y={17} w={161.5} size={14} weight="medium" font="inter"
          color="#FFFFFF" lineHeight={16.94} align="center"
        >
          Send Invoice
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.85 },

  panelShadow: {
    shadowColor: "#968CAF",
    shadowOpacity: 0.08,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 2,
  },
  fieldShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  ctaShadow: {
    shadowColor: BUTTON_INK,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  backShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  // The spec's scrim is 375x876 at y=-1, but the opaque sheet covers everything
  // below y=287 — stopping there keeps tap-to-dismiss off the sheet body.
  scrim: {
    position: "absolute",
    left: 0,
    top: -1,
    width: FRAME_W,
    height: SHEET_Y + 1,
    backgroundColor: SCRIM,
  },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  close: {
    position: "absolute",
    left: 315,
    top: 331,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
  },

  cardFill: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  pillRow: { alignItems: "flex-end", justifyContent: "center" },
  pill: {
    height: 25,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: GLASS_60,
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    height: 20,
    borderRadius: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  metaBox: { flex: 1 },
  actionShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  cancel: {
    position: "absolute",
    left: 20,
    top: 793.72,
    width: 161.5,
    height: 51,
    borderRadius: 24,
    backgroundColor: GLASS_60,
  },
  send: {
    position: "absolute",
    left: 193.5,
    top: 793.72,
    width: 161.5,
    height: 51,
    borderRadius: 24,
    backgroundColor: BUTTON_INK,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
