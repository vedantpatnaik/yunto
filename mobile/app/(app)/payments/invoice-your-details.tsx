import { useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, TextInput } from "react-native";
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
import { fonts } from "../../../src/theme";
import { useMe, usePayoutDetail, useSavePayoutDetail } from "../../../src/api/hooks";

/**
 * Your Details — Figma 7358:30364 (375x875).
 *
 * The seller's own billing identity, stamped onto every invoice they raise.
 * Glass header (back chevron + centred title), then "Main Content" at y=106:
 * a 327x147 mint "Info Banner" nudging unregistered sellers towards GST, and a
 * 327x551 "Details Form" card holding six fields on a 96pt step — Full Name,
 * Trade Name, GST Number, Mobile Number, then Pincode | State side by side.
 *
 * Coordinates are raw frame coordinates from the spec; <Screen> scales the
 * 375pt canvas to the device. The form card bottoms out at 844 inside an
 * 875pt frame, so nothing is clipped and every node sits at its spec x/y.
 *
 * Persistence: the six fields are the "Your Details" half of the caller's
 * PayoutDetail row (legalName / tradeName / gstNumber / mobile / pincode /
 * state), saved through the singleton /payout-details endpoint. The frame
 * authors no Save button — the back chevron is its only action — so the
 * chevron commits the edits and only then pops. Nothing is written when the
 * form was not touched, and a failed write keeps the user on the screen with
 * every keystroke intact.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Details Form: fields start at y=359 and repeat every 96pt (76 + 20 gap). */
const FIELD_X = 49;
const FIELD_W = 277;
const FIELD_Y = 359;
const FIELD_STEP = 96;
/** The Pincode | State grid row splits 277 into two 130.5 columns. */
const HALF_W = 130.5;
const HALF_X2 = 195.5;

const LABEL_INSET = 4;
const BOX_OFFSET = 24;
const BOX_H = 52;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#27272A";
const TITLE_INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const HEADING_INK = "#71717A";
const PLACEHOLDER_INK = "#A1A1AA";
const EMERALD_INK = "#064E3B";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const HAIRLINE_90 = "rgba(255,255,255,0.9)";
const HAIRLINE_80 = "rgba(255,255,255,0.8)";
const HAIRLINE_60 = "rgba(255,255,255,0.6)";

const BANNER_FILL = ["#FFFFFFF2", "#DCFCE799"] as const;
const BUTTON_FILL = ["#A7F3D0", "#6EE7B7"] as const;
const CARD_FILL = ["#FFFFFFE5", "#FEF6E480"] as const;

/** GST registration is external — the Figma file has no destination frame. */
const GST_PORTAL = "https://www.gst.gov.in/";

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: the beige linear base plus four radial tints. */
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

/* --------------------------------- field ---------------------------------- */
interface FieldProps {
  /** Frame-space top-left of the 76pt label+input stack. */
  x: number;
  y: number;
  w: number;
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (next: string) => void;
  keyboardType?: "default" | "phone-pad" | "number-pad";
  autoCapitalize?: "none" | "words" | "characters";
}

/**
 * "Label" + "Overlay+Border+Shadow" pair. The label sits 4pt in from the
 * column, the 52pt input box 24pt below it, and its text 16pt inside the box —
 * exactly the padding the spec's auto-layout resolves to.
 */
function Field({
  x,
  y,
  w,
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "words",
}: FieldProps) {
  return (
    <>
      {/* Label — Inter 700 13 / 15.73. */}
      <Txt
        x={x + LABEL_INSET}
        y={y}
        w={w - LABEL_INSET}
        size={13}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={15.73}
        numberOfLines={1}
      >
        {label}
      </Txt>

      {/* Overlay+Border+Shadow — #FFFFFF @70%, 1pt #FFFFFF @80% hairline, r6. */}
      <Abs
        x={x}
        y={y + BOX_OFFSET}
        w={w}
        h={BOX_H}
        radius={6}
        bg={GLASS_70}
        border={HAIRLINE_80}
        borderWidth={1}
        style={styles.inputShadow}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={PLACEHOLDER_INK}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={styles.input}
        />
      </Abs>
    </>
  );
}

/* --------------------------------- record --------------------------------- */
/** The columns this frame owns. The bank half of the row is edited elsewhere. */
type DetailKey = "legalName" | "tradeName" | "gstNumber" | "mobile" | "pincode" | "state";

/* --------------------------------- screen --------------------------------- */
export default function InvoiceYourDetails() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: detail } = usePayoutDetail();
  const save = useSavePayoutDetail();

  /**
   * Edits are held as per-key overrides rather than seeded into state by an
   * effect: a field shows its saved value the moment the record lands, adopts
   * the user's keystroke the moment they type, and the geometry never moves in
   * between. An empty draft also means "untouched", which is what decides
   * whether leaving the screen writes anything at all.
   */
  const [draft, setDraft] = useState<Partial<Record<DetailKey, string>>>({});
  const edit = (key: DetailKey) => (next: string) => setDraft((d) => ({ ...d, [key]: next }));

  /* Draft > saved record > the account the invoice is raised from. Pincode and
     State keep the spec's pre-filled values as their last resort, exactly as
     the frame renders them before anything is saved. */
  const fullName = draft.legalName ?? detail?.legalName ?? me?.name ?? "";
  const tradeName = draft.tradeName ?? detail?.tradeName ?? "";
  const gstin = draft.gstNumber ?? detail?.gstNumber ?? "";
  const mobile = draft.mobile ?? detail?.mobile ?? me?.phone ?? "";
  const pincode = draft.pincode ?? detail?.pincode ?? "400001";
  const state = draft.state ?? detail?.state ?? "Maharashtra";

  /**
   * The chevron is this frame's only action, so it saves before it pops. An
   * untouched form goes straight back rather than writing the placeholder
   * defaults, and a rejected write stays put with the typed values still in
   * `draft` — the platform alert is the only way to report it without adding a
   * node the design does not have.
   */
  const saveAndBack = () => {
    if (save.isPending) return;
    if (Object.keys(draft).length === 0) {
      router.back();
      return;
    }
    save.mutate(
      { legalName: fullName, tradeName, gstNumber: gstin, mobile, pincode, state },
      {
        onSuccess: () => router.back(),
        onError: (err) =>
          Alert.alert("Couldn't save your details", err.message, [{ text: "OK" }]),
      }
    );
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* =============================== Header ============================== */}
      <Pressable
        onPress={saveAndBack}
        disabled={save.isPending}
        style={({ pressed }) => [styles.back, (pressed || save.isPending) && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={20} color={BACK_INK} />
      </Pressable>
      <Txt
        x={79.5}
        y={30}
        w={236}
        size={16}
        weight="bold"
        font="inter"
        color={TITLE_INK}
        lineHeight={19.36}
        align="center"
      >
        Your Details
      </Txt>

      {/* ============================ Info Banner ============================ */}
      <Abs x={24} y={122} w={327} h={147} radius={20} style={styles.cardShadow}>
        <LinearGradient
          colors={BANNER_FILL}
          start={{ x: 0.23, y: -0.36 }}
          end={{ x: 0.77, y: 1.36 }}
          style={[StyleSheet.absoluteFill, styles.bannerFill]}
        />
      </Abs>

      {/* Inter 600 15 / 21, hard-wrapped exactly as the design authors it. */}
      <Txt x={45} y={143} w={285} size={15} weight="semibold" font="inter" color={INK} lineHeight={21}>
        {"If you are not registered as a business\nthen click here."}
      </Txt>

      {/* Button — 167x47 r100 mint pill, icon + label centred with an 8pt gap. */}
      <Pressable
        onPress={() => void Linking.openURL(GST_PORTAL)}
        style={({ pressed }) => [styles.getRegistered, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={BUTTON_FILL}
          start={{ x: 0.18, y: -0.67 }}
          end={{ x: 0.82, y: 1.67 }}
          style={[StyleSheet.absoluteFill, styles.buttonFill]}
        />
        <Ionicons name="briefcase-outline" size={16} color={EMERALD_INK} />
        <Txt size={14} weight="semibold" font="inter" color={EMERALD_INK} lineHeight={16.94} align="center">
          Get Registered
        </Txt>
      </Pressable>

      {/* ============================ Details Form =========================== */}
      <Abs x={24} y={293} w={327} h={551} radius={24} style={styles.cardShadow}>
        <LinearGradient
          colors={CARD_FILL}
          start={{ x: -0.06, y: 0.03 }}
          end={{ x: 1.06, y: 0.97 }}
          style={[StyleSheet.absoluteFill, styles.formFill]}
        />
      </Abs>

      {/* Heading 2 — Inter 800 14 / 16.94, +1 tracking, uppercase. */}
      <Txt
        x={49}
        y={318}
        w={277}
        size={14}
        weight="bold"
        font="inter"
        color={HEADING_INK}
        lineHeight={16.94}
        letterSpacing={1}
      >
        YOUR DETAILS
      </Txt>

      <Field
        x={FIELD_X}
        y={FIELD_Y}
        w={FIELD_W}
        label="Full Name"
        value={fullName}
        placeholder="Sophia Roy"
        onChangeText={edit("legalName")}
      />

      <Field
        x={FIELD_X}
        y={FIELD_Y + FIELD_STEP}
        w={FIELD_W}
        label="Trade Name"
        value={tradeName}
        placeholder="e.g. SR Creations"
        onChangeText={edit("tradeName")}
      />

      <Field
        x={FIELD_X}
        y={FIELD_Y + FIELD_STEP * 2}
        w={FIELD_W}
        label="GST Number"
        value={gstin}
        placeholder="22AAAAA0000A1Z5"
        onChangeText={edit("gstNumber")}
        autoCapitalize="characters"
      />

      <Field
        x={FIELD_X}
        y={FIELD_Y + FIELD_STEP * 3}
        w={FIELD_W}
        label="Mobile Number"
        value={mobile}
        placeholder="+91 98765 43210"
        onChangeText={edit("mobile")}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />

      {/* Grid row — two 130.5pt columns at x=49 and x=195.5. */}
      <Field
        x={FIELD_X}
        y={FIELD_Y + FIELD_STEP * 4}
        w={HALF_W}
        label="Pincode"
        value={pincode}
        placeholder="400001"
        onChangeText={edit("pincode")}
        keyboardType="number-pad"
        autoCapitalize="none"
      />
      <Field
        x={HALF_X2}
        y={FIELD_Y + FIELD_STEP * 4}
        w={HALF_W}
        label="State"
        value={state}
        placeholder="Maharashtra"
        onChangeText={edit("state")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.85 },

  back: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: HAIRLINE_90,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /** Both glass cards carry the same 0/4/12 @3% drop shadow. */
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bannerFill: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HAIRLINE_90,
  },
  formFill: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: HAIRLINE_90,
  },

  getRegistered: {
    position: "absolute",
    left: 45,
    top: 201,
    width: 167,
    height: 47,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#6EE7B7",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonFill: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: HAIRLINE_60,
  },

  inputShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  /** Inter 500 15, 16pt inset — puts the value's baseline at the spec's y. */
  input: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: INK,
  },
});
