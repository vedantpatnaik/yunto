import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
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
  useCampaigns,
  useCreate,
  useInvoices,
  type Invoice,
} from "../../../src/api/hooks";

/**
 * Create Invoice — Figma 7358:29783 (375x875).
 *
 * One glass "Section" panel (335x1180) carries three divider-separated blocks:
 * INVOICE DETAILS, CLIENT INFORMATION and SERVICE DETAILS. The panel is taller
 * than its parent — "Main" is y=106 h=646 with clipsContent — so the form owns
 * an inner ScrollView while the header and the floating Save pill (y=794) stay
 * pinned to the frame.
 *
 * Coordinates below are raw frame coordinates from the spec; <Screen> scales the
 * 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** "Main": the 646pt viewport the 1180pt Section scrolls inside. */
const MAIN_Y = 106;
const MAIN_H = 646;
const MAIN_PAD_BOTTOM = 10;

const SECTION_Y = 106;
const SECTION_H = 1180;

/** Scroll extent in Main-space, and the frame-space layer height it wraps. */
const SCROLL_H = SECTION_H + MAIN_PAD_BOTTOM;
const LAYER_H = SECTION_Y + SECTION_H;

/* --------------------------- spec colour tokens --------------------------- */
const HEADING = "#9283B4";
const LABEL = "#787486";
const VALUE = "#6C687A";
const PLACEHOLDER = "#B8B5C6";
const ICON = "#B3B0C4";
const INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const BUTTON_INK = "#312B28";

const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_77 = "rgba(255,255,255,0.77)";
const GLASS_78 = "rgba(255,255,255,0.78)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_84 = "rgba(255,255,255,0.84)";
const BORDER_61 = "rgba(255,255,255,0.61)";
const BORDER_80 = "rgba(255,255,255,0.8)";
const BORDER_90 = "rgba(255,255,255,0.9)";

const DIVIDER_OFF = "rgba(200,190,220,0)";
const DIVIDER_ON = "rgba(200,190,220,0.25)";

/* --------------------------------- helpers -------------------------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "14 Jun, 2026" — the format both date fields render in. */
const dayMonthYear = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

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
    color={filled ? VALUE : PLACEHOLDER} lineHeight={18.15} numberOfLines={1}
  >
    {children}
  </Txt>
);

/** The glass input plate every field sits on. */
const FieldBox = ({
  x, y, w, h, r, fill, stroke, shadow,
}: {
  x: number; y: number; w: number; h: number; r: number;
  fill: string; stroke: string; shadow?: boolean;
}) => (
  <Abs
    x={x} y={y} w={w} h={h} radius={r} bg={fill} border={stroke} borderWidth={1}
    style={shadow ? styles.fieldShadow : undefined}
  />
);

const Divider = ({ y }: { y: number }) => (
  <LinearGradient
    colors={[DIVIDER_OFF, DIVIDER_ON, DIVIDER_OFF]}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
    style={{ position: "absolute", left: 41, top: y, width: 293, height: 1 }}
  />
);

/* --------------------------------- screen --------------------------------- */
export default function InvoiceCreate() {
  const router = useRouter();
  const params = useLocalSearchParams<{ campaignId?: string }>();

  const { data: invoices } = useInvoices();
  const { data: campaigns = [] } = useCampaigns();
  const createInvoice = useCreate<Invoice>("invoices");

  /** Next number off the live ledger; the spec literal stands in until it lands. */
  const nextNumber = invoices
    ? `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`
    : "INV-2024-001";

  const [numberEdit, setNumberEdit] = useState<string | null>(null);
  const invoiceNumber = numberEdit ?? nextNumber;

  // No calendar sheet is routed in this flow yet, so the date fields hold real
  // state and step it on tap: Due Date seeds at net-30 off the invoice date.
  const [invoiceDate, setInvoiceDate] = useState(() => new Date());
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const [clientName, setClientName] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  /** The picker screen ("Select the Campaign") hands the choice back by param. */
  const campaign = campaigns.find((c) => c.id === params.campaignId);

  const canSave = invoiceNumber.trim().length > 0 && !createInvoice.isPending;

  const save = () => {
    if (!canSave) return;
    createInvoice.mutate(
      {
        number: invoiceNumber.trim(),
        brandName: clientName.trim() || campaign?.brandName || "",
        campaignId: campaign?.id,
        budget: Math.round(Number(amount.replace(/[^\d.]/g, "")) || 0),
        status: "UNPAID",
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* =============================== Main =============================== */}
      <Abs x={0} y={MAIN_Y} w={FRAME_W} h={MAIN_H} style={styles.clip}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollBody}
        >
          <View style={styles.layer}>
            {/* Section — the glass panel the whole form sits on */}
            <Abs
              x={20} y={SECTION_Y} w={335} h={SECTION_H} radius={32}
              bg={GLASS_60} border={BORDER_90} borderWidth={1} style={styles.panelShadow}
            />

            {/* -------------------------- Invoice Details ------------------- */}
            <Heading y={139}>INVOICE DETAILS</Heading>

            <Label x={47} y={177} w={287}>Invoice Number</Label>
            <FieldBox x={41} y={201} w={293} h={52} r={20} fill={GLASS_80} stroke={BORDER_90} shadow />
            <TextInput
              value={invoiceNumber}
              onChangeText={setNumberEdit}
              placeholder="INV-2024-001"
              placeholderTextColor={PLACEHOLDER}
              autoCapitalize="characters"
              style={[styles.input, { left: 41, top: 201, width: 293, height: 52, paddingLeft: 21, paddingRight: 20 }]}
            />

            <Label x={47} y={269} w={134.5}>Invoice Date</Label>
            <FieldBox x={41} y={293} w={140} h={52} r={20} fill={GLASS_80} stroke={BORDER_90} shadow />
            <Pressable
              onPress={() => setInvoiceDate((d) => addDays(d, 1))}
              style={({ pressed }) => [styles.dateHit, { left: 41, width: 140 }, pressed && styles.pressed]}
            />
            <Value x={47} y={310} w={102} filled>{dayMonthYear(invoiceDate)}</Value>
            <Abs x={149} y={310} w={18} h={18} center>
              <Feather name="calendar" size={18} color={ICON} />
            </Abs>

            <Label x={199.5} y={269} w={134.5}>Due Date</Label>
            <FieldBox x={193.5} y={293} w={140} h={52} r={20} fill={GLASS_80} stroke={BORDER_90} shadow />
            <Pressable
              onPress={() => setDueDate((d) => (d ? addDays(d, 1) : addDays(invoiceDate, 30)))}
              style={({ pressed }) => [styles.dateHit, { left: 193.5, width: 140 }, pressed && styles.pressed]}
            />
            <Value x={204.5} y={310} w={102} filled={!!dueDate}>
              {dueDate ? dayMonthYear(dueDate) : "Select"}
            </Value>
            <Abs x={306.5} y={310} w={18} h={18} center>
              <Feather name="calendar" size={18} color={ICON} />
            </Abs>

            <Divider y={381} />

            {/* ------------------------ Client Information ------------------ */}
            <Heading y={418}>CLIENT INFORMATION</Heading>

            <Label x={47} y={456} w={287}>Client Name</Label>
            <FieldBox x={41} y={480} w={293} h={52} r={20} fill={GLASS_80} stroke={BORDER_90} shadow />
            <TextInput
              value={clientName}
              onChangeText={setClientName}
              placeholder="e.g. Nike India"
              placeholderTextColor={PLACEHOLDER}
              style={[styles.input, { left: 41, top: 480, width: 293, height: 52, paddingLeft: 21, paddingRight: 20 }]}
            />

            <Label x={47} y={548} w={287}>GST Number</Label>
            <FieldBox x={41} y={572} w={293} h={52} r={20} fill={GLASS_80} stroke={BORDER_90} shadow />
            <TextInput
              value={gstin}
              onChangeText={setGstin}
              placeholder="Enter GSTIN (Optional)"
              placeholderTextColor={PLACEHOLDER}
              autoCapitalize="characters"
              style={[styles.input, { left: 41, top: 572, width: 293, height: 52, paddingLeft: 21, paddingRight: 20 }]}
            />

            <Label x={47} y={640} w={287}>Address</Label>
            <FieldBox x={41} y={664} w={293} h={88} r={16} fill={GLASS_80} stroke={BORDER_61} />
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Client billing address..."
              placeholderTextColor={PLACEHOLDER}
              multiline
              style={[styles.area, { left: 41, top: 664, width: 293, height: 88, paddingLeft: 17, paddingRight: 16, paddingTop: 17 }]}
            />

            <Divider y={788} />

            {/* ------------------------- Service Details -------------------- */}
            <Heading y={825}>SERVICE DETAILS</Heading>

            <Label x={47} y={863} w={287}>Campaign Name</Label>
            <FieldBox x={41} y={887} w={293} h={52} r={16} fill={GLASS_84} stroke={BORDER_80} />
            <Pressable
              onPress={() => router.push("/campaigns/invoice-select-campaign")}
              style={({ pressed }) => [
                { position: "absolute", left: 41, top: 887, width: 293, height: 52 },
                pressed && styles.pressed,
              ]}
            />
            <Value x={58} y={904} w={260} filled={!!campaign}>
              {campaign ? campaign.name : "Select"}
            </Value>

            <Label x={47} y={955} w={287}>Deliverables</Label>
            <FieldBox x={41} y={979} w={293} h={53} r={16} fill={GLASS_78} stroke={BORDER_80} />
            <TextInput
              value={deliverables}
              onChangeText={setDeliverables}
              placeholder="e.g. 2 Reels, 1 Story"
              placeholderTextColor={PLACEHOLDER}
              style={[styles.input, { left: 41, top: 979, width: 293, height: 53, paddingLeft: 17, paddingRight: 16 }]}
            />

            <Label x={47} y={1048} w={287}>Amount (₹)</Label>
            <FieldBox x={41} y={1072} w={293} h={53} r={16} fill={GLASS_80} stroke={BORDER_80} />
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={PLACEHOLDER}
              keyboardType="decimal-pad"
              style={[styles.input, { left: 41, top: 1072, width: 293, height: 53, paddingLeft: 17, paddingRight: 16 }]}
            />

            <Label x={47} y={1141} w={287}>Notes</Label>
            <FieldBox x={41} y={1165} w={293} h={88} r={16} fill={GLASS_77} stroke={BORDER_80} />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder={"Payment terms, account details,\netc..."}
              placeholderTextColor={PLACEHOLDER}
              multiline
              style={[styles.area, { left: 41, top: 1165, width: 293, height: 88, paddingLeft: 17, paddingRight: 16, paddingTop: 17 }]}
            />
          </View>
        </ScrollView>
      </Abs>

      {/* ============================= Bottom CTA ============================ */}
      <Pressable
        onPress={save}
        disabled={!canSave}
        style={({ pressed }) => [
          styles.cta,
          { opacity: canSave ? (pressed ? 0.9 : 1) : 0.5 },
        ]}
      >
        <Txt
          x={0} y={18} w={232} size={16} weight="semibold" font="inter"
          color="#FFFFFF" lineHeight={19.36} align="center"
        >
          Save
        </Txt>
      </Pressable>

      {/* =============================== Header ============================== */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={BACK_INK} />
      </Pressable>
      <Txt
        x={79.5} y={30} w={236} size={16} weight="bold" font="inter"
        color={INK} lineHeight={19.36} align="center"
      >
        Create Invoice
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.85 },

  /** Scroll extent in Main-space; the layer re-hoists frame coordinates. */
  scrollBody: { height: SCROLL_H },
  layer: { position: "absolute", left: 0, top: -MAIN_Y, width: FRAME_W, height: LAYER_H },

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

  input: {
    position: "absolute",
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: VALUE,
    paddingTop: 0,
    paddingBottom: 0,
    includeFontPadding: false,
  },
  area: {
    position: "absolute",
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: VALUE,
    paddingBottom: 0,
    textAlignVertical: "top",
    includeFontPadding: false,
  },
  /** Tap target over a date plate — the value text renders above it. */
  dateHit: { position: "absolute", top: 293, height: 52 },

  /** The spec's CTA frame carries no effects — the pill sits flat on the page. */
  cta: {
    position: "absolute",
    left: 71.5,
    top: 794,
    width: 232,
    height: 55,
    borderRadius: 36,
    backgroundColor: BUTTON_INK,
  },
  back: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: BORDER_90,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
});
