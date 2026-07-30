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
  useAgencies,
  useCreate,
  useInvoices,
  useLeads,
  useUsers,
  type Invoice,
} from "../../../src/api/hooks";

/**
 * Create Invoice — Select the Campaign. Figma 7358:30046 (375 x 875).
 *
 * A modal STATE of the invoice builder rather than its own destination: the
 * Create Invoice form ("Main" clips a 335x1181 glass "Section" at y=780) stays
 * on screen behind a #B5B4B9 @57% scrim, and a 588pt sheet is raised at y=287
 * with the grabber, title, close button, the selectable campaign cards and the
 * blurred Cancel / Send Invoice footer.
 *
 * Picking a card writes the campaign back into the form's Campaign Name field —
 * visible through the scrim — and Send Invoice posts the invoice.
 *
 * Coordinates are raw Figma frame coordinates; <Screen> scales the 375pt canvas.
 */

/* --------------------------------- geometry ------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** "Main" (y=106, h=674, clipsContent) cuts the taller Section off at y=780. */
const FORM_CLIP_H = 780;

const SHEET_Y = 287;
const SHEET_H = 588;

const LIST_X = 16;
const LIST_Y = 402;
const LIST_W = 335;
const LIST_H = 352;
const CARD_H = 170;
/** Card 1 at y=402, card 2 at y=584 — a 12pt gap under a 170pt card. */
const CARD_STEP = 182;
/** A third card would start at 766 and overrun the 754 list bottom. */
const MAX_CARDS = 2;

/* ------------------------------- spec colours ------------------------------ */
const SECTION_HEADING = "#9283B4";
const FIELD_LABEL = "#787486";
const FIELD_VALUE = "#6C687A";
const FIELD_HINT = "#B8B5C6";
const CAL_ICON = "#B3B0C4";
const INK = "#1D1D1F";
const SHEET_TITLE = "#111111";
const CARD_META = "#6E6E73";
const CLOSE_ICON = "#555555";
const BACK_ICON = "#1C1C1E";
const BTN_DARK = "#312B28";
const CANCEL_INK = "#1F1A17";
const SCRIM = "rgba(181,180,185,0.57)";
const WHITE_60 = "rgba(255,255,255,0.6)";
const WHITE_65 = "rgba(255,255,255,0.65)";
const WHITE_70 = "rgba(255,255,255,0.7)";
const WHITE_77 = "rgba(255,255,255,0.77)";
const WHITE_78 = "rgba(255,255,255,0.78)";
const WHITE_80 = "rgba(255,255,255,0.8)";
const WHITE_84 = "rgba(255,255,255,0.84)";
const WHITE_90 = "rgba(255,255,255,0.9)";
const DIVIDER_FADE = "rgba(200,190,220,0)";
const DIVIDER_MID = "rgba(200,190,220,0.25)";

/** The two card treatments the design ships, selected by the lead's stage. */
const TONES = {
  contacted: {
    fill: ["#F1EAFA", "#F9F6FC"] as readonly [string, string],
    chipBg: "#E1D7FA",
    chipInk: "#7A54B8",
  },
  won: {
    fill: ["#E8F0FC", "#F4F8FE"] as readonly [string, string],
    chipBg: "#C4D8FE",
    chipInk: "#2E60D1",
  },
} as const;

type Tone = keyof typeof TONES;

/* -------------------------------- formatting ------------------------------- */
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "14 Jun, 2026" — the Invoice Date field's format. */
const dayMonthYear = (d: Date) =>
  `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;

/** Leads store money as free text ("300k", "1.5L"); invoices need rupees. */
function toRupees(money?: string): number {
  const m = /([\d.]+)\s*([kKlL])?/.exec(money ?? "");
  if (!m) return 0;
  const n = Number(m[1]);
  const unit = (m[2] ?? "").toLowerCase();
  return Math.round(unit === "k" ? n * 1_000 : unit === "l" ? n * 100_000 : n);
}

/** "₹80K" / "₹1.5L" — the value chip's two shapes. */
function valueChip(rupees: number): string {
  const trim = (v: number) => String(Number(v.toFixed(1)));
  if (rupees >= 100_000) return `₹${trim(rupees / 100_000)}L`;
  if (rupees >= 1_000) return `₹${trim(rupees / 1_000)}K`;
  return `₹${rupees}`;
}

/** "1 day ago" / "3 days ago" — the card's activity suffix. */
function daysAgo(iso?: string): string {
  const t = iso ? Date.parse(iso) : NaN;
  const n = Number.isFinite(t)
    ? Math.max(1, Math.floor((Date.now() - t) / 86_400_000))
    : 1;
  return n === 1 ? "1 day ago" : `${n} days ago`;
}

/* --------------------------------- backdrop -------------------------------- */
/** Frame fill: a vertical base plus the four radial tints of the root node. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear
          id="base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient
          id="rose" cx="285" cy="542.5" rx="1027.5" ry="568.75"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="sky" cx="90" cy="367.5" rx="967.5" ry="533.75"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="sun" cx="292.5" cy="157.5" rx="1338.75" ry="735"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="mist" cx="75" cy="87.5" rx="1466.25" ry="805"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#rose)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#sky)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#sun)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#mist)" />
    </Svg>
  );
}

/* ------------------------------ form fragments ----------------------------- */
const SectionHeading = ({ y, children }: { y: number; children: string }) => (
  <Txt
    x={41} y={y} w={293} size={13} weight="bold" font="inter"
    color={SECTION_HEADING} lineHeight={15.73} letterSpacing={1}
  >
    {children}
  </Txt>
);

const FieldLabel = ({
  x, y, w, children,
}: { x: number; y: number; w: number; children: string }) => (
  <Txt
    x={x} y={y} w={w} size={13} weight="medium" font="inter"
    color={FIELD_LABEL} lineHeight={15.73}
  >
    {children}
  </Txt>
);

/** 15px Inter medium — value colour when filled, hint colour when empty. */
const FieldText = ({
  x, y, w, filled, children,
}: { x: number; y: number; w: number; filled?: boolean; children: string }) => (
  <Txt
    x={x} y={y} w={w} size={15} weight="medium" font="inter"
    color={filled ? FIELD_VALUE : FIELD_HINT} lineHeight={18.15}
  >
    {children}
  </Txt>
);

const Divider = ({ y }: { y: number }) => (
  <LinearGradient
    colors={[DIVIDER_FADE, DIVIDER_MID, DIVIDER_FADE]}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
    style={[styles.divider, { top: y }]}
  />
);

/* ------------------------------- campaign card ----------------------------- */
interface CampaignRow {
  id: string;
  contactName: string;
  campaignTitle: string;
  value: string;
  budget: number;
  brandName: string;
  status: string;
  tone: Tone;
  managedBy: string;
}

/** The quick-action row every card carries, at card-relative x. */
const ACTIONS: {
  key: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  x: number;
}[] = [
  { key: "call", icon: "call-outline", x: 16 },
  { key: "chat", icon: "chatbubble-outline", x: 60 },
  { key: "more", icon: "ellipsis-horizontal", x: 104 },
];

function CampaignCard({
  row, top, selected, onPress,
}: { row: CampaignRow; top: number; selected: boolean; onPress: () => void }) {
  const tone = TONES[row.tone];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { top, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <LinearGradient
        colors={tone.fill}
        start={{ x: 0.14, y: -0.29 }}
        end={{ x: 0.86, y: 1.29 }}
        style={[
          styles.cardFill,
          selected ? { borderColor: tone.chipInk, borderWidth: 1.5 } : null,
        ]}
      />

      {/* contact name, campaign title, value chip */}
      <Txt
        x={16} y={16} w={92.97} size={16} weight="bold" font="inter"
        color={INK} lineHeight={19.36} numberOfLines={1}
      >
        {row.contactName}
      </Txt>
      <Txt
        x={16} y={38} w={92.97} size={13} weight="medium" font="inter"
        color={CARD_META} lineHeight={15.73} numberOfLines={2}
      >
        {row.campaignTitle}
      </Txt>
      <Abs x={16} y={16} w={303} h={25} style={styles.valueRow}>
        <View style={styles.valuePill}>
          <Txt size={14} weight="bold" font="inter" color={INK} lineHeight={16.94}>
            {row.value}
          </Txt>
        </View>
      </Abs>

      {/* status pill + managed-by line */}
      <Abs x={16} y={82} w={303} h={20} row gap={8}>
        <View style={[styles.statusPill, { backgroundColor: tone.chipBg }]}>
          <Txt size={10} weight="bold" font="inter" color={tone.chipInk} lineHeight={12.1}>
            {row.status}
          </Txt>
        </View>
        <View style={styles.metaBox}>
          <Txt
            size={12} weight="medium" font="inter" color={CARD_META}
            lineHeight={14.52} numberOfLines={1}
          >
            {row.managedBy}
          </Txt>
        </View>
      </Abs>

      {/* quick actions */}
      {ACTIONS.map((a) => (
        <Abs
          key={a.key} x={a.x} y={118} w={36} h={36} radius={18}
          bg={WHITE_70} center style={styles.actionShadow}
        >
          <Ionicons name={a.icon} size={16} color={INK} />
        </Abs>
      ))}
    </Pressable>
  );
}

/* ---------------------------------- screen --------------------------------- */
export default function InvoiceCreateSelectCampaign() {
  const router = useRouter();
  const { data: leads = [], isLoading } = useLeads();
  const { data: users = [] } = useUsers();
  const { data: agencies = [] } = useAgencies();
  const { data: invoices = [] } = useInvoices();
  const createInvoice = useCreate<Invoice>("invoices");

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Frozen at mount so the invoice cannot renumber or re-date itself mid-edit.
  const invoiceDate = useMemo(() => dayMonthYear(new Date()), []);
  const invoiceNumber = useMemo(
    () => `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`,
    [invoices.length],
  );

  const rows = useMemo<CampaignRow[]>(() => {
    const owners = new Map(users.map((u) => [u.id, u.name]));
    const houses = new Map(agencies.map((a) => [a.id, a.name]));
    // Invoiceable stages first; if the backend has none, fall back to the list
    // so the sheet still shows real records rather than an empty body.
    const invoiceable = leads.filter(
      (l) => l.status === "CONTACTED" || l.status === "CONVERTED",
    );
    const pool = invoiceable.length ? invoiceable : leads;
    return pool.slice(0, MAX_CARDS).map((l) => {
      const who = (l.ownerId && owners.get(l.ownerId)) || (l.agencyId && houses.get(l.agencyId));
      const when = daysAgo(l.updatedAt ?? l.createdAt);
      const budget = toRupees(l.money);
      return {
        id: l.id,
        contactName: l.contactPerson ?? l.brandName,
        campaignTitle: l.brandName,
        value: valueChip(budget),
        budget,
        brandName: l.brandName,
        status: l.status === "CONVERTED" ? "WON" : l.status,
        tone: l.status === "CONVERTED" ? "won" : "contacted",
        managedBy: who ? `Managed by ${who} • ${when}` : when,
      };
    });
  }, [leads, users, agencies]);

  const chosen = rows.find((r) => r.id === selectedCampaignId);
  const canSend = !!chosen && !createInvoice.isPending;

  const sendInvoice = () => {
    if (!chosen || createInvoice.isPending) return;
    createInvoice.mutate(
      { number: invoiceNumber, brandName: chosen.brandName, budget: chosen.budget },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ================================= Main ================================ */}
      <Abs x={0} y={0} w={FRAME_W} h={FORM_CLIP_H} style={styles.clip}>
        {/* Section — the glass panel the whole builder sits on */}
        <Abs
          x={20} y={106} w={335} h={1181} radius={32} bg={WHITE_60}
          border={WHITE_90} borderWidth={1} style={styles.panelShadow}
        />

        {/* ---------------------------- Invoice Details ------------------------ */}
        <SectionHeading y={139}>INVOICE DETAILS</SectionHeading>

        <FieldLabel x={47} y={177} w={287}>Invoice Number</FieldLabel>
        <Abs
          x={41} y={201} w={293} h={52} radius={20} bg={WHITE_80}
          border={WHITE_90} borderWidth={1} style={styles.fieldShadow}
        />
        <FieldText x={62} y={218} w={103} filled>{invoiceNumber}</FieldText>

        <FieldLabel x={47} y={269} w={134.5}>Invoice Date</FieldLabel>
        <Abs
          x={41} y={293} w={140} h={52} radius={20} bg={WHITE_80}
          border={WHITE_90} borderWidth={1} style={styles.fieldShadow}
        />
        <FieldText x={47} y={310} w={102} filled>{invoiceDate}</FieldText>
        <Abs x={149} y={310} w={18} h={18} center>
          <Ionicons name="calendar-outline" size={18} color={CAL_ICON} />
        </Abs>

        <FieldLabel x={199.5} y={269} w={134.5}>Due Date</FieldLabel>
        <Abs
          x={193.5} y={293} w={140} h={52} radius={20} bg={WHITE_80}
          border={WHITE_90} borderWidth={1} style={styles.fieldShadow}
        />
        <FieldText x={204.5} y={310} w={102}>Select</FieldText>
        <Abs x={306.5} y={310} w={18} h={18} center>
          <Ionicons name="calendar-outline" size={18} color={CAL_ICON} />
        </Abs>

        <Divider y={381} />

        {/* --------------------------- Client Information ---------------------- */}
        <SectionHeading y={418}>CLIENT INFORMATION</SectionHeading>

        <FieldLabel x={47} y={456} w={287}>Client Name</FieldLabel>
        <Abs
          x={41} y={480} w={293} h={52} radius={20} bg={WHITE_80}
          border={WHITE_90} borderWidth={1} style={styles.fieldShadow}
        />
        <FieldText x={62} y={497} w={101}>e.g. Nike India</FieldText>

        <FieldLabel x={47} y={548} w={287}>GST Number</FieldLabel>
        <Abs
          x={41} y={572} w={293} h={52} radius={20} bg={WHITE_80}
          border={WHITE_90} borderWidth={1} style={styles.fieldShadow}
        />
        <FieldText x={62} y={589} w={164}>Enter GSTIN (Optional)</FieldText>

        <FieldLabel x={47} y={640} w={287}>Address</FieldLabel>
        <Abs
          x={41} y={664} w={293} h={88} radius={16} bg={WHITE_80}
          border="rgba(255,255,255,0.61)" borderWidth={1}
        />
        <FieldText x={58} y={681} w={163.41}>Client billing address...</FieldText>

        <Divider y={788} />

        {/* ---------------------------- Service Details ------------------------ */}
        <SectionHeading y={825}>SERVICE DETAILS</SectionHeading>

        {/* The field this sheet writes back into. */}
        <FieldLabel x={47} y={863} w={287}>Campaign Name</FieldLabel>
        <Abs
          x={41} y={887} w={293} h={53} radius={16} bg={WHITE_84}
          border={WHITE_80} borderWidth={1}
        />
        <FieldText x={58} y={904} w={209.06} filled={!!chosen}>
          {chosen ? chosen.campaignTitle : "e.g. Summer collection shoot"}
        </FieldText>

        <FieldLabel x={47} y={956} w={287}>Deliverables</FieldLabel>
        <Abs
          x={41} y={980} w={293} h={53} radius={16} bg={WHITE_78}
          border={WHITE_80} borderWidth={1}
        />
        <FieldText x={58} y={997} w={140.28}>e.g. 2 Reels, 1 Story</FieldText>

        <FieldLabel x={47} y={1049} w={287}>Amount (₹)</FieldLabel>
        <Abs
          x={41} y={1073} w={293} h={53} radius={16} bg={WHITE_80}
          border={WHITE_80} borderWidth={1}
        />
        <FieldText x={58} y={1090} w={32.81}>0.00</FieldText>

        <FieldLabel x={47} y={1142} w={287}>Notes</FieldLabel>
        <Abs
          x={41} y={1166} w={293} h={88} radius={16} bg={WHITE_77}
          border={WHITE_80} borderWidth={1}
        />
        <FieldText x={58} y={1183} w={230.16}>
          {"Payment terms, account details,\netc..."}
        </FieldText>
      </Abs>

      {/* =============================== Bottom CTA ============================ */}
      <Abs x={71.5} y={794} w={232} h={55} radius={36} bg={BTN_DARK} style={styles.ctaShadow}>
        <Txt
          x={0} y={18} w={232} size={16} weight="semibold" font="inter"
          color="#FFFFFF" lineHeight={19.36} align="center"
        >
          Save
        </Txt>
      </Abs>

      {/* ================================= Header ============================== */}
      <Abs
        x={15} y={18} w={44} h={44} radius={22} bg={WHITE_65}
        border={WHITE_90} borderWidth={1} center style={styles.backShadow}
      >
        <Ionicons name="chevron-back" size={20} color={BACK_ICON} />
      </Abs>
      <Txt
        x={79.5} y={30} w={236} size={16} weight="bold" font="inter"
        color={INK} lineHeight={19.36} align="center"
      >
        Create Invoice
      </Txt>

      {/* ================================== Scrim ============================== */}
      {/* Spec scrim is 375x876 at y=-1; the opaque sheet covers everything below
          y=287, so the tappable dismiss area stops there. */}
      <Pressable onPress={() => router.back()} style={styles.scrim} />

      {/* =============================== Bottom sheet ========================== */}
      <Abs x={0} y={SHEET_Y} w={FRAME_W} h={SHEET_H} bg="#FFFFFF" style={styles.sheet} />
      <Abs x={167.5} y={303} w={40} h={4} radius={2} bg="#E5E5E5" />
      <Txt
        x={24} y={331} w={280} size={24} weight="semibold" font="inter"
        color={SHEET_TITLE} lineHeight={29.05} letterSpacing={-0.52}
      >
        Select the Campaign
      </Txt>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.close, pressed ? styles.pressed : null]}
      >
        <Ionicons name="close" size={20} color={CLOSE_ICON} />
      </Pressable>

      {/* Selectable campaign cards */}
      <Abs x={LIST_X} y={LIST_Y} w={LIST_W} h={LIST_H}>
        {rows.map((r, i) => (
          <CampaignCard
            key={r.id}
            row={r}
            top={i * CARD_STEP}
            selected={r.id === selectedCampaignId}
            onPress={() => setSelectedCampaignId(r.id)}
          />
        ))}
        {rows.length === 0 ? (
          <Txt
            x={16} y={16} w={303} size={13} weight="medium" font="inter"
            color={CARD_META} lineHeight={15.73}
          >
            {isLoading ? "Loading campaigns" : "No campaigns to invoice"}
          </Txt>
        ) : null}
      </Abs>

      {/* Sheet footer */}
      <Abs x={0} y={777.72} w={FRAME_W} h={99} bg={WHITE_60} />
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.cancel, pressed ? styles.pressed : null]}
      >
        <Txt
          x={0} y={17} w={161.5} size={14} weight="medium" font="inter"
          color={CANCEL_INK} lineHeight={16.94} align="center"
        >
          Cancel
        </Txt>
      </Pressable>
      <Pressable
        onPress={sendInvoice}
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
  divider: { position: "absolute", left: 41, width: 293, height: 1 },

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
    shadowColor: BTN_DARK,
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

  card: { position: "absolute", left: 0, width: LIST_W, height: CARD_H },
  cardFill: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: WHITE_60,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  valueRow: { alignItems: "flex-end", justifyContent: "center" },
  valuePill: {
    height: 25,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: WHITE_60,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
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
    backgroundColor: WHITE_60,
    borderWidth: 1,
    borderColor: "#E3E3E3",
  },
  send: {
    position: "absolute",
    left: 193.5,
    top: 793.72,
    width: 161.5,
    height: 51,
    borderRadius: 24,
    backgroundColor: BTN_DARK,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
