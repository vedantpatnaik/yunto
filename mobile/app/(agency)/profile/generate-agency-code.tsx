import { useState } from "react";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen, Abs, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { useCreate } from "../../../src/api/hooks";
import type { Agency } from "../../../src/api/hooks";

/**
 * Generate Agency Code — Figma frame 7911:12706 (375x1030), traced 1:1.
 *
 * Post-auth workspace creation for an agency owner. The frame is authored 1030
 * tall but every node ends by y=802, so the canvas is 876: the tail is unclipped
 * artboard, not scrollable content.
 *
 * One glass card (24,270 327x370) holds three pill fields — name, location and
 * type — over a warm #f8f5ef page with a pink wash across the top 256pt. Below
 * it sit the "OR" rule, the secondary route into an existing workspace, and the
 * privacy caption.
 *
 * Data: submitting POSTs to /agencies. Prisma's Agency has name/description
 * only — there is no `location` or `type` column and no server-side code
 * generator — so those two answers are folded into `description` rather than
 * posted as invented fields, and no fake code is displayed back.
 */

/* ------------------------------ design tokens ----------------------------- */
const INK = "#111111";
const SLATE = "#64748b";
const INDIGO = "#6366f1";
const FIELD_FILL = "rgba(255,255,255,0.6)";
const FIELD_LINE = "rgba(129,140,248,0.2)"; // #818cf8 @ 20%

/**
 * The only agency type the design names. Prisma has no type column and no
 * catalogue endpoint, so the list is exactly what the frame provides — nothing
 * is invented to pad the menu out.
 */
const AGENCY_TYPES = ["Creator / Influencer Agency"] as const;
type AgencyType = (typeof AGENCY_TYPES)[number];

/* -------------------------------- primitives ------------------------------ */
type IconName = keyof typeof Ionicons.glyphMap;

/** A Figma "SVG" node — square box, glyph centred inside it. */
function Icon({
  name, x, y, size, color,
}: { name: IconName; x: number; y: number; size: number; color: string }) {
  return (
    <View
      style={{
        position: "absolute", left: x, top: y, width: size, height: size,
        alignItems: "center", justifyContent: "center",
      }}
    >
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

/** Field caption — rendered upper-case, as the spec's textCase does. */
const Label = ({ y, children }: { y: number; children: string }) => (
  <Txt
    x={49} y={y} w={277} size={12} weight="semibold" font="inter"
    color={SLATE} lineHeight={16} letterSpacing={0.3}
  >
    {children}
  </Txt>
);

/** The 285x50 glass pill every input sits in. */
const FieldShell = ({ y, children }: { y: number; children: ReactNode }) => (
  <Abs
    x={45} y={y} w={285} h={50} radius={40}
    bg={FIELD_FILL} border={FIELD_LINE} borderWidth={1}
  >
    {children}
  </Abs>
);

/** Shared TextInput geometry: icon at 17, text runs 45 -> 269 inside the pill. */
const inputStyle = {
  position: "absolute" as const, left: 45, top: 15, width: 224, height: 20,
  padding: 0, fontFamily: fonts.inter, fontSize: 14, color: INK,
};

/* --------------------------------- screen --------------------------------- */
export default function GenerateAgencyCodeScreen() {
  const router = useRouter();
  const create = useCreate<Agency>("agencies");

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<AgencyType | "">("");
  const [typeOpen, setTypeOpen] = useState(false);

  const canSubmit = name.trim().length > 0 && !create.isPending;

  const submit = () => {
    if (!canSubmit) return;
    // Location and type have no columns of their own; keep them as a readable
    // line on the record instead of dropping the operator's answers.
    const detail = [type, location.trim()].filter(Boolean).join(" · ");
    create.mutate(
      { name: name.trim(), description: detail || undefined },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen height={876} background="#f8f5ef" scroll>
      {/* Top wash — #f9e4e8 at 20% fading out over the first 256pt. */}
      <LinearGradient
        colors={["rgba(249,228,232,0.2)", "rgba(249,228,232,0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", left: 0, top: 0, width: 375, height: 256 }}
      />

      {/* -------------------------------- Header ----------------------------- */}
      <Abs
        x={155.5} y={106} w={64} h={64} radius={40}
        border="rgba(129,140,248,0.3)" borderWidth={1} center
        style={{
          overflow: "hidden",
          shadowColor: "#000000", shadowOpacity: 0.1,
          shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 3,
        }}
      >
        <LinearGradient
          colors={["rgba(129,140,248,0.25)", "rgba(196,181,253,0.18)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="briefcase-outline" size={28} color={INDIGO} />
      </Abs>

      <Txt
        x={58} y={182} w={259} size={24} weight="semibold" font="inter"
        color={INK} lineHeight={32} letterSpacing={-0.6} align="center"
      >
        Generate Agency Code
      </Txt>
      <Txt
        x={47.5} y={218} w={280} size={14} weight="regular" font="inter"
        color={SLATE} lineHeight={20} align="center"
      >
        Set up your agency workspace in seconds
      </Txt>

      {/* --------------------------------- Card ------------------------------ */}
      <Abs
        x={24} y={270} w={327} h={370} radius={28}
        bg="rgba(255,255,255,0.45)" border="rgba(255,255,255,0.7)" borderWidth={1}
        style={{
          shadowColor: "#8264ff", shadowOpacity: 0.07,
          shadowRadius: 32, shadowOffset: { width: 0, height: 4 }, elevation: 2,
        }}
      />

      {/* ------------------------------ Agency Name -------------------------- */}
      <Label y={295}>AGENCY NAME</Label>
      <FieldShell y={317}>
        <Icon name="briefcase-outline" x={17} y={17} size={16} color={SLATE} />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Stellar Creator Agency"
          placeholderTextColor={SLATE}
          style={inputStyle}
        />
      </FieldShell>

      {/* -------------------------------- Location --------------------------- */}
      <Label y={383}>LOCATION</Label>
      <FieldShell y={405}>
        <Icon name="location-outline" x={17} y={17} size={16} color={SLATE} />
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="City, Country"
          placeholderTextColor={SLATE}
          style={inputStyle}
        />
      </FieldShell>

      {/* ------------------------------ Agency Type -------------------------- */}
      <Label y={471}>AGENCY TYPE</Label>
      <FieldShell y={493}>
        <Pressable
          onPress={() => setTypeOpen((o) => !o)}
          style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
        >
          <Icon name="list-outline" x={17} y={17} size={16} color={SLATE} />
          <Txt
            x={45} y={15} w={183} size={14} weight="regular" font="inter"
            color={type ? INK : SLATE} lineHeight={20} numberOfLines={1}
          >
            {type || "Creator / Influencer Agency"}
          </Txt>
          <Icon name="chevron-down" x={253} y={17.5} size={15} color={SLATE} />
        </Pressable>
      </FieldShell>

      {/* ----------------------------- Generate Code ------------------------- */}
      <Pressable
        onPress={submit}
        disabled={!canSubmit}
        style={({ pressed }) => ({
          position: "absolute", left: 45, top: 563, width: 285, height: 52,
          opacity: canSubmit ? (pressed ? 0.9 : 1) : 0.55,
          shadowColor: INDIGO, shadowOpacity: 0.35,
          shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 6,
        })}
      >
        <LinearGradient
          colors={["#6366f1", "#8b5cf6"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{
            position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
            borderRadius: 40,
          }}
        />
        <Icon name="sparkles-outline" x={79} y={18} size={16} color="#ffffff" />
        <Txt
          x={103} y={16} w={103} size={14} weight="semibold" font="inter"
          color="#ffffff" lineHeight={20} align="center"
        >
          Generate Code
        </Txt>
      </Pressable>

      {/* ------------------------------ OR divider --------------------------- */}
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.1)"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: "absolute", left: 24, top: 679.5, width: 135, height: 1 }}
      />
      <Txt x={179} y={672} w={17} size={12} weight="medium" font="inter" color={SLATE} lineHeight={16}>
        OR
      </Txt>
      <LinearGradient
        colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0)"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: "absolute", left: 216, top: 679.5, width: 135.02, height: 1 }}
      />

      {/* -------------------------- Already have a code ---------------------- */}
      <Pressable
        onPress={() => router.push("/profile/enter-agency-code")}
        style={({ pressed }) => ({
          position: "absolute", left: 24, top: 720, width: 327, height: 54,
          borderRadius: 40, backgroundColor: "rgba(255,255,255,0.55)",
          borderWidth: 1, borderColor: "rgba(99,102,241,0.25)",
          opacity: pressed ? 0.9 : 1,
          shadowColor: "#8264ff", shadowOpacity: 0.08,
          shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 2,
        })}
      >
        <Icon name="shapes-outline" x={59.5} y={19.5} size={15} color={INDIGO} />
        <Txt
          x={82.5} y={17} w={185} size={14} weight="semibold" font="inter"
          color={INDIGO} lineHeight={20} align="center"
        >
          Already Have Agency Code
        </Txt>
      </Pressable>

      {/* ----------------------------- Reassurance --------------------------- */}
      <Abs x={24} y={786} w={327} h={16} opacity={0.7}>
        <Icon name="shield-checkmark-outline" x={60.5} y={1.5} size={13} color={SLATE} />
        <Txt x={81.5} y={0} w={185} size={12} weight="regular" font="inter" color={SLATE} lineHeight={16}>
          Your code is private & encrypted
        </Txt>
      </Abs>

      {/* Type menu — drawn last so it sits above the button it overlaps. */}
      {typeOpen ? (
        <Abs
          x={45} y={547} w={285} h={AGENCY_TYPES.length * 44 + 8} radius={20}
          bg="rgba(255,255,255,0.97)" border={FIELD_LINE} borderWidth={1}
          style={{
            shadowColor: "#8264ff", shadowOpacity: 0.12,
            shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
          }}
        >
          {AGENCY_TYPES.map((t, i) => (
            <Pressable
              key={t}
              onPress={() => {
                setType(t);
                setTypeOpen(false);
              }}
              style={({ pressed }) => ({
                position: "absolute", left: 4, top: 4 + i * 44, width: 277, height: 44,
                borderRadius: 16, justifyContent: "center",
                backgroundColor: pressed ? "rgba(99,102,241,0.08)" : "transparent",
              })}
            >
              <Txt
                x={16} y={12} w={245} size={14} weight="regular" font="inter"
                color={INK} lineHeight={20} numberOfLines={1}
              >
                {t}
              </Txt>
            </Pressable>
          ))}
        </Abs>
      ) : null}
    </Screen>
  );
}
