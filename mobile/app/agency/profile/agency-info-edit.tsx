import { useState } from "react";
import { Image, Pressable, StyleSheet, TextInput, View } from "react-native";
import type { KeyboardTypeOptions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { useList, useMe, useUpdate } from "../../../src/api/hooks";
import type { Agency, User } from "../../../src/api/hooks";

/**
 * Agency Information — Figma frame 7791:22768 "brand info" (375x876), traced 1:1.
 *
 * Second state of the profile accordion: "Profile Info" sits collapsed at the
 * top (20,116 335x74) and "Agency Info" is the expanded card below it
 * (20,202 335x629) holding the logo dropzone, four pill fields and the dark
 * "Save Changes" CTA. Content ends at y=831 — inside the 876 frame — so nothing
 * is clipped and the frame simply scrolls on shorter handsets.
 *
 * Both cards carry a BACKGROUND_BLUR(24) in the spec. There is no blur view in
 * this app's dependency set, so the translucent white fills stand in for it —
 * the same substitution every other glass screen makes.
 *
 * Data. Prisma's Agency has name / website / logoUrl but no contact columns, so
 * "Email Address" and "Phone" are the signed-in operator's own — the account
 * that owns the workspace — and save back to their User row rather than being
 * invented on the agency. The logo circle renders `agency.logoUrl` when the
 * record has one; there is no image picker in the app's dependencies and no
 * agency-logo upload route on the server, so the dropzone is display-only and
 * its caption stays the design's literal copy.
 */

/* ------------------------------ spec colours ------------------------------ */
const PAGE = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_DISC = "#1f1a17";
const BACK_GLYPH = "#faf7f2";
const TITLE_INK = "#111827";
const MUTED = "#6b7280";
const PROFILE_TILE = "#f3e8ff";
const PROFILE_GLYPH = "#9333ea";
const AGENCY_TILE = "#dbeafe";
const AGENCY_GLYPH = "#2563eb";
const DROPZONE = "#efefef";
const CTA = "#312b28";

const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const LINE_90 = "rgba(255,255,255,0.9)";
const LINE_60 = "rgba(255,255,255,0.6)";
const LINE_63 = "rgba(255,255,255,0.63)";

/* -------------------------------- fields ---------------------------------- */
type FieldKey = "name" | "email" | "phone" | "website";

interface FieldSpec {
  key: FieldKey;
  label: string;
  /** Caption y — the pill follows 24pt below it. */
  labelY: number;
  pillY: number;
  /** The Phone pill is authored 1pt taller than its siblings. */
  pillH: number;
  /** The value the frame shows. Kept as the placeholder, never as data. */
  sample: string;
  keyboard: KeyboardTypeOptions;
}

const FIELDS: FieldSpec[] = [
  { key: "name", label: "Agency Name", labelY: 374, pillY: 398, pillH: 52, sample: "Stellar Talents", keyboard: "default" },
  { key: "email", label: "Email Address", labelY: 466, pillY: 490, pillH: 52, sample: "rohitkumar@gmail.com", keyboard: "email-address" },
  { key: "phone", label: "Phone", labelY: 558, pillY: 582, pillH: 53, sample: "+91 98765 43210", keyboard: "phone-pad" },
  { key: "website", label: "Agency Website", labelY: 651, pillY: 675, pillH: 52, sample: "www.stellartalent.com", keyboard: "url" },
];

/** Prisma's Agency carries `logoUrl`; the shared hook type predates the column. */
type AgencyRow = Agency & { logoUrl?: string };

/* --------------------------- accordion card head -------------------------- */
/**
 * The 309x48 row every card opens with: rounded icon tile, title, chevron disc.
 * Geometry is identical between the two cards — only the card origin, the tile
 * fill/radius, the glyph and the chevron direction change.
 */
function CardHeader({
  y,
  title,
  tile,
  tileRadius,
  glyph,
  glyphColor,
  chevron,
}: {
  y: number;
  title: string;
  tile: string;
  tileRadius: number;
  glyph: keyof typeof Ionicons.glyphMap;
  glyphColor: string;
  chevron: "chevron-down" | "chevron-up";
}) {
  return (
    <>
      <Abs x={33} y={y} w={48} h={48} radius={tileRadius} bg={tile} center style={styles.tileShadow}>
        <Ionicons name={glyph} size={24} color={glyphColor} />
      </Abs>
      <Txt
        x={97}
        y={y + 14.5}
        w={189}
        size={16}
        weight="semibold"
        font="inter"
        color={TITLE_INK}
        lineHeight={19.36}
        numberOfLines={1}
      >
        {title}
      </Txt>
      <Abs x={302} y={y + 6} w={36} h={36} radius={18} bg={GLASS_60} center style={styles.discShadow}>
        <Ionicons name={chevron} size={20} color={MUTED} />
      </Abs>
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function AgencyInfoEdit() {
  const router = useRouter();

  // Same query key as useAgencies() — widened locally so `logoUrl` is typed.
  const { data: agencies = [] } = useList<AgencyRow>("agencies");
  const { data: me } = useMe();

  /** The workspace's own agency, as every other agency-side screen resolves it. */
  const agency = agencies[0];

  const saveAgency = useUpdate<AgencyRow>("agencies");
  const saveContact = useUpdate<User>("users");
  const pending = saveAgency.isPending || saveContact.isPending;

  // Edits layer over the fetched record, so a late-arriving response never
  // clobbers what has already been typed and no effect is needed to seed state.
  const [edits, setEdits] = useState<Partial<Record<FieldKey, string>>>({});
  const live: Record<FieldKey, string> = {
    name: agency?.name ?? "",
    email: me?.email ?? "",
    phone: me?.phone ?? "",
    website: agency?.website ?? "",
  };
  const valueOf = (k: FieldKey) => edits[k] ?? live[k];

  const submit = () => {
    if (!agency || pending) return;
    saveAgency.mutate(
      { id: agency.id, data: { name: valueOf("name"), website: valueOf("website") } },
      { onSuccess: () => router.back() },
    );
    // Contact details live on the operator's User row, not on Agency.
    if (me) {
      saveContact.mutate({ id: me.id, data: { email: valueOf("email"), phone: valueOf("phone") } });
    }
  };

  return (
    <Screen height={876} background={PAGE} scroll>
      {/* ============================ Header — 0,0 375x80 ==================== */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          position: "absolute",
          left: 16,
          top: 22,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: BACK_DISC,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Ionicons name="arrow-back" size={16} color={BACK_GLYPH} />
      </Pressable>
      <Txt x={72} y={28} w={222} size={20} weight="medium" color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}>
        Agency Information
      </Txt>

      {/* ================== Basics (collapsed) — 20,116 335x74 ================ */}
      {/* Inert: the expanded Profile Info state is a route of its own. */}
      <Abs
        x={20}
        y={116}
        w={335}
        h={74}
        radius={28}
        bg={GLASS_55}
        border={LINE_90}
        borderWidth={1}
        style={styles.cardShadow}
      />
      <CardHeader
        y={129}
        title="Profile Info"
        tile={PROFILE_TILE}
        tileRadius={24}
        glyph="person-outline"
        glyphColor={PROFILE_GLYPH}
        chevron="chevron-down"
      />

      {/* ================ Basics (Expanded) — 20,202 335x629 ================== */}
      <Abs
        x={20}
        y={202}
        w={335}
        h={629}
        radius={28}
        bg={GLASS_60}
        border={LINE_90}
        borderWidth={1}
        style={styles.expandedShadow}
      />
      <CardHeader
        y={215}
        title="Agency Info"
        tile={AGENCY_TILE}
        tileRadius={20}
        glyph="business-outline"
        glyphColor={AGENCY_GLYPH}
        chevron="chevron-up"
      />

      {/* ------------------------- Logo — 157.5,266 60x60 -------------------- */}
      <Abs
        x={157.5}
        y={266}
        w={60}
        h={60}
        radius={30}
        bg={DROPZONE}
        border={LINE_63}
        borderWidth={1}
        style={styles.clip}
      >
        {agency?.logoUrl ? <Image source={{ uri: agency.logoUrl }} style={styles.logo} /> : null}
      </Abs>
      <Txt x={122} y={333} w={131} size={11} weight="medium" font="inter" color={MUTED} lineHeight={20} align="center">
        Upload image
      </Txt>

      {/* ------------------ HorizontalBorder — top rule at 357 ---------------- */}
      <Abs x={33} y={357} w={309} h={1} bg={LINE_60} />

      {/* ------------------------------- Fields ------------------------------ */}
      {FIELDS.map((f) => (
        <View key={f.key}>
          <Txt
            x={53}
            y={f.labelY}
            w={285}
            size={13}
            weight="semibold"
            font="inter"
            color={MUTED}
            lineHeight={15.73}
          >
            {f.label}
          </Txt>
          <Abs
            x={37}
            y={f.pillY}
            w={301}
            h={f.pillH}
            radius={f.pillH / 2}
            bg={GLASS_80}
            border={LINE_90}
            borderWidth={1}
            style={styles.pillShadow}
          >
            <TextInput
              value={valueOf(f.key)}
              onChangeText={(t) => setEdits((e) => ({ ...e, [f.key]: t }))}
              placeholder={f.sample}
              placeholderTextColor={MUTED}
              keyboardType={f.keyboard}
              autoCapitalize={f.key === "name" ? "words" : "none"}
              autoCorrect={false}
              style={styles.input}
            />
          </Abs>
        </View>
      ))}

      {/* --------------------- Save Changes — 37,751 301x56 ------------------- */}
      <Pressable
        onPress={submit}
        disabled={!agency || pending}
        style={({ pressed }) => ({
          position: "absolute",
          left: 37,
          top: 751,
          width: 301,
          height: 56,
          borderRadius: 28,
          backgroundColor: CTA,
          alignItems: "center",
          justifyContent: "center",
          opacity: !agency || pending ? 0.55 : pressed ? 0.9 : 1,
        })}
      >
        <Txt size={16} weight="bold" font="inter" color="#ffffff" lineHeight={19.36} align="center">
          Save Changes
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  logo: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  input: {
    position: "absolute",
    left: 20,
    top: 16,
    width: 259,
    height: 20,
    padding: 0,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: TITLE_INK,
  },
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  expandedShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 3,
  },
  tileShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  discShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pillShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
});
