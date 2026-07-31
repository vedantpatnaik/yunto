import type { ComponentProps } from "react";
import { useState } from "react";
import { Image, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts, gradients } from "../../../src/theme";
import { useMe, useUpdate, type User } from "../../../src/api/hooks";

/**
 * Profile & Agency Info — Figma 7791:22556 "personal information" (375x876),
 * with 7728:4280 "Profile & Agency Info" as its second accordion state.
 *
 * Two sections, "Profile Info" and "Agency Info". The traced frame is the
 * landing state: Profile Info open as a 335x821 glass card holding the avatar,
 * the First/Last Name pair, Email, Assign as, Phone, Birth Date, Gender and the
 * "Save Changes" CTA, with the collapsed "Agency Info" row parked at y=949.
 *
 * 7728:4280 is not a separate screen — it is this same frame with both
 * accordions shut (rows at 116 and 202, header title "Profile"), so it lives
 * here as the closed state rather than as a second route. The agency app's
 * frame set draws no expanded body for Agency Info, so that row's only designed
 * behaviour is to sit collapsed; pressing it shuts Profile Info, which is
 * exactly the 7728:4280 layout.
 *
 * The open state stacks 1023pt of content behind Main's clip box, so the canvas
 * is sized to that bottom plus Main's 40pt bottom padding and scrolls. Every
 * coordinate below is a raw frame coordinate from the spec.
 */

/* ------------------------------- geometry -------------------------------- */
/** Closed state: the frame's own height. */
const FRAME_H = 876;
/** Open state: Agency Info row bottom (949+74) + Main's 40pt bottom padding. */
const CANVAS_OPEN = 1063;

const CARD_X = 20;
const CARD_W = 335;

/** Profile Info card — 74pt collapsed, 821pt expanded, both at y=116. */
const PROFILE_Y = 116;
const EXP_H = 821;
const ROW_H = 74;
/** Agency Info: 949 with Profile open, 202 (116 + 74 + 12 gap) with it shut. */
const AGENCY_Y_OPEN = 949;
const AGENCY_Y_SHUT = 202;

/* Section-header offsets, relative to the card's own x/y (spec absolute minus
   the card origin). Identical for the expanded card and the collapsed rows. */
const TILE_OFF = 13; // 33-20, 129-116
const TILE_SIZE = 48;
const LABEL_X = 77; // 97-20
const LABEL_Y = 27.5; // 143.5-116
const LABEL_W = 189;
const DISC_X = 282; // 302-20
const DISC_Y = 19; // 135-116
const DISC_SIZE = 36;

/* Field interior. Spec text starts at 58 = 37 + 20pt padding + 1pt border, so a
   full-width 301pt card leaves 259pt and a 144.5pt half-card 102.5pt. */
const FIELD_X = 37;
const FIELD_TEXT_X = 58;
const FIELD_W_FULL = 301;
const FIELD_W_HALF = 144.5;
const INNER_W_FULL = 259;
const INNER_W_HALF = 102.5;

/* --------------------------- spec colour tokens --------------------------- */
const BG = "#F8F5EF";
const TITLE_INK = "#141311";
const BACK_FILL = "#1F1A17";
const BACK_INK = "#FAF7F2";
const LABEL_INK = "#111827";
const CAPTION_INK = "#6B7280";
const CHEV_INK = "#6B7280";
const CTA_BG = "#312B28";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const HAIRLINE_60 = "rgba(255,255,255,0.6)";
const HAIRLINE_63 = "rgba(255,255,255,0.63)";
const HAIRLINE_90 = "rgba(255,255,255,0.9)";
const TILE_PROFILE = "#F3E8FF";
const INK_PROFILE = "#9333EA";
const TILE_AGENCY = "#DBEAFE";
const INK_AGENCY = "#2563EB";

/* ------------------------------ role options ------------------------------ */
/**
 * The agency-side values of Prisma's `Role` enum — the operator roles a staff
 * account can hold. SUPER_ADMIN belongs to the admin platform and is never
 * assignable here, but an account already holding it still renders (see
 * `roleLabel`), rather than being silently relabelled.
 */
const ROLES = [
  { value: "SALES_MANAGER", label: "Sales Manager" },
  { value: "SALES_EMPLOYEE", label: "Sales Employee" },
  { value: "OPS_MANAGER", label: "Ops Manager" },
  { value: "OPS_EMPLOYEE", label: "Ops Employee" },
] as const;

const roleLabel = (value: string) =>
  ROLES.find((r) => r.value === value)?.label ??
  value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/* --------------------------------- dates ---------------------------------- */
const pad = (n: number) => `${n}`.padStart(2, "0");

/** ISO -> "01/01/2001", the format the Birth Date field is authored in. */
function formatDob(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

/** "01/01/2001" -> ISO. Undefined when the entry is not a complete date. */
function parseDob(value: string): string | undefined {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!m) return undefined;
  const d = new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/* ------------------------------- section head ----------------------------- */
type IconName = ComponentProps<typeof Ionicons>["name"];

/** Icon tile + label + chevron disc — shared by both sections, open or shut. */
function SectionHead({
  tile,
  ink,
  icon,
  label,
  expanded,
}: {
  tile: string;
  ink: string;
  icon: IconName;
  label: string;
  expanded?: boolean;
}) {
  return (
    <>
      {/* Background+Shadow — 48x48 r20 icon tile. */}
      <Abs
        x={TILE_OFF}
        y={TILE_OFF}
        w={TILE_SIZE}
        h={TILE_SIZE}
        radius={20}
        bg={tile}
        center
        style={styles.tileShadow}
      >
        <Ionicons name={icon} size={24} color={ink} />
      </Abs>

      {/* Label — Inter 600 16 / 19.36. */}
      <Txt
        x={LABEL_X}
        y={LABEL_Y}
        w={LABEL_W}
        size={16}
        weight="semibold"
        font="inter"
        color={LABEL_INK}
        lineHeight={19.36}
        numberOfLines={1}
      >
        {label}
      </Txt>

      {/* Overlay+Shadow — 36x36 r18 glass disc holding the 10x5 chevron. */}
      <Abs
        x={DISC_X}
        y={DISC_Y}
        w={DISC_SIZE}
        h={DISC_SIZE}
        radius={18}
        bg={GLASS_60}
        center
        style={styles.discShadow}
      >
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={CHEV_INK} />
      </Abs>
    </>
  );
}

/* ------------------------------ form fields ------------------------------- */
/** The caption above a field — Inter 600 13 / 15.73, indented 16pt. */
function Caption({ x, y, w, children }: { x: number; y: number; w: number; children: string }) {
  return (
    <Txt x={x} y={y} w={w} size={13} weight="semibold" font="inter" color={CAPTION_INK} lineHeight={15.73}>
      {children}
    </Txt>
  );
}

/**
 * A r100 glass pill wrapping a single-line value.
 *
 * The spec's authored copy ("Rohit", "rohitkumar@gmail.com", ...) is passed as
 * the placeholder rather than as the value, so an account still in flight —
 * or a column the record genuinely has not filled — reads as empty instead of
 * as somebody else's data, without the geometry moving.
 */
function PillField({
  x,
  y,
  w,
  h,
  textX,
  innerW,
  value,
  placeholder,
  onChange,
  keyboard,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  textX: number;
  innerW: number;
  value: string;
  placeholder: string;
  onChange: (next: string) => void;
  keyboard?: "email-address" | "phone-pad" | "numbers-and-punctuation";
}) {
  return (
    <>
      <Abs
        x={x}
        y={y}
        w={w}
        h={h}
        radius={100}
        bg={GLASS_80}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.fieldShadow}
      />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={CAPTION_INK}
        keyboardType={keyboard}
        autoCapitalize={keyboard === "email-address" ? "none" : "words"}
        selectionColor={LABEL_INK}
        style={[styles.input, { left: textX, top: y + 1, width: innerW, height: h - 2 }]}
      />
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function ProfileAgencyInfo() {
  const router = useRouter();

  /* /auth/me returns the whole row minus the password hash, so the schema's
     `dateOfBirth` column arrives even though the shared User type omits it. */
  type Account = User & { dateOfBirth?: string | null };
  const { data: me } = useMe() as { data: Account | undefined };
  const save = useUpdate<Account>("users");

  /** Profile Info open is the traced frame; shut is 7728:4280. */
  const [profileOpen, setProfileOpen] = useState(true);

  /* The API models the account as one `name`, so the first token is the first
     name and the remainder the last — the same split the web profile uses. */
  const parts = (me?.name ?? "").trim().split(/\s+/).filter(Boolean);

  /* Edits are held as overrides so each field shows the live record the moment
     it lands and keeps the user's typing thereafter, without an effect. */
  const [draft, setDraft] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    phone?: string;
    dob?: string;
    gender?: string;
  }>({});

  const firstName = draft.firstName ?? parts[0] ?? "";
  const lastName = draft.lastName ?? parts.slice(1).join(" ");
  const email = draft.email ?? me?.email ?? "";
  const role = draft.role ?? me?.role ?? "";
  const phone = draft.phone ?? me?.phone ?? "";
  const dob = draft.dob ?? formatDob(me?.dateOfBirth);
  /* The User table carries no gender column, so this one is local to the form:
     it is never prefilled from a record and never sent. */
  const gender = draft.gender ?? "";

  const avatarUrl = me?.avatarUrl;

  /** Assign as is a select; with no picker dependency it steps the enum. */
  const cycleRole = () => {
    const i = ROLES.findIndex((r) => r.value === role);
    setDraft((d) => ({ ...d, role: ROLES[(i + 1) % ROLES.length].value }));
  };

  const onSave = () => {
    if (!me) {
      router.back();
      return;
    }
    const dateOfBirth = parseDob(dob);
    save.mutate(
      {
        id: me.id,
        data: {
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          ...(role ? { role } : null),
          ...(dateOfBirth ? { dateOfBirth } : null),
        },
      },
      { onSuccess: () => router.back(), onError: () => router.back() }
    );
  };

  return (
    <Screen height={profileOpen ? CANVAS_OPEN : FRAME_H} background={BG} scroll>
      {/* =============================== Header ============================== */}
      {/* Button — 36x36 disc, #1F1A17, holding the 9.45pt back chevron. */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={16} color={BACK_INK} />
      </Pressable>
      {/* Heading 1 — Geist 500 20 / 24, -0.6 tracking. The closed state is
          authored with its own title, so the two frames' copy both live here. */}
      <Txt
        x={72}
        y={28}
        w={222}
        size={20}
        weight="medium"
        color={TITLE_INK}
        lineHeight={24}
        letterSpacing={-0.6}
        numberOfLines={1}
      >
        {profileOpen ? "Personal Information" : "Profile"}
      </Txt>

      {/* ========================= Profile Info card ========================= */}
      <Abs
        x={CARD_X}
        y={PROFILE_Y}
        w={CARD_W}
        h={profileOpen ? EXP_H : ROW_H}
        radius={28}
        bg={profileOpen ? GLASS_60 : GLASS_55}
        border={HAIRLINE_90}
        borderWidth={1}
        style={profileOpen ? styles.cardShadow : styles.rowShadow}
      />
      <Pressable
        onPress={() => setProfileOpen((open) => !open)}
        style={({ pressed }) => [styles.head, pressed && styles.pressed]}
      >
        <SectionHead
          tile={TILE_PROFILE}
          ink={INK_PROFILE}
          icon="person-outline"
          label="Profile Info"
          expanded={profileOpen}
        />
      </Pressable>

      {profileOpen ? (
        <>
          {/* HorizontalBorder — 1pt #FFFFFF @60% rule under the section head. */}
          <Abs x={33} y={181} w={309} h={1} bg={HAIRLINE_60} />

          {/* ----------------------------- Avatar ---------------------------- */}
          {/* image — 60x60 circle, 1pt #FFFFFF @63% ring. Falls back to the
              app's gradient avatar when the account carries no picture. */}
          <Abs
            x={157.5}
            y={201}
            w={60}
            h={60}
            radius={30}
            border={HAIRLINE_63}
            borderWidth={1}
            style={styles.clip}
          >
            <LinearGradient
              colors={gradients.avatarA}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatar} /> : null}
          </Abs>
          {/* Inter 500 11 / 20, centred under the avatar. No image-picker
              dependency ships with the app, so this stays the spec's caption. */}
          <Txt
            x={122}
            y={268}
            w={131}
            size={11}
            weight="medium"
            font="inter"
            color={CAPTION_INK}
            lineHeight={20}
            align="center"
          >
            Change profile picture
          </Txt>

          {/* ------------------------ First / Last Name ---------------------- */}
          <Caption x={53} y={304} w={128.5}>
            First Name
          </Caption>
          <PillField
            x={FIELD_X}
            y={328}
            w={FIELD_W_HALF}
            h={52}
            textX={FIELD_TEXT_X}
            innerW={INNER_W_HALF}
            value={firstName}
            placeholder="Rohit"
            onChange={(v) => setDraft((d) => ({ ...d, firstName: v }))}
          />

          <Caption x={209.5} y={304} w={128.5}>
            Last Name
          </Caption>
          <PillField
            x={193.5}
            y={328}
            w={FIELD_W_HALF}
            h={52}
            textX={214.5}
            innerW={INNER_W_HALF}
            value={lastName}
            placeholder="Kumar"
            onChange={(v) => setDraft((d) => ({ ...d, lastName: v }))}
          />

          {/* ------------------------------ Email ---------------------------- */}
          <Caption x={53} y={396} w={285}>
            Email
          </Caption>
          <PillField
            x={FIELD_X}
            y={420}
            w={FIELD_W_FULL}
            h={52}
            textX={FIELD_TEXT_X}
            innerW={INNER_W_FULL}
            value={email}
            placeholder="rohitkumar@gmail.com"
            onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
            keyboard="email-address"
          />

          {/* ---------------------------- Assign as -------------------------- */}
          <Caption x={53} y={488} w={285}>
            {"Assign as "}
          </Caption>
          <Pressable onPress={cycleRole} style={({ pressed }) => [styles.select, pressed && styles.pressed]}>
            <View style={styles.pillFill} />
            <Txt
              x={FIELD_TEXT_X - FIELD_X}
              y={17}
              w={INNER_W_FULL}
              size={15}
              weight="medium"
              font="inter"
              color={role ? LABEL_INK : CAPTION_INK}
              lineHeight={18.15}
              numberOfLines={1}
            >
              {role ? roleLabel(role) : "Manager"}
            </Txt>
          </Pressable>

          {/* ------------------------------ Phone ---------------------------- */}
          <Caption x={53} y={581} w={285}>
            Phone
          </Caption>
          <PillField
            x={FIELD_X}
            y={605}
            w={FIELD_W_FULL}
            h={53}
            textX={FIELD_TEXT_X}
            innerW={INNER_W_FULL}
            value={phone}
            placeholder="+91 98765 43210"
            onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
            keyboard="phone-pad"
          />

          {/* ---------------------------- Birth Date ------------------------- */}
          {/* Authored as a date picker; the app ships no picker dependency, so
              the pill takes the same DD/MM/YYYY the design shows and is parsed
              back to the record's `dateOfBirth` on save. */}
          <Caption x={53} y={674} w={285}>
            Birth Date
          </Caption>
          <PillField
            x={FIELD_X}
            y={698}
            w={FIELD_W_FULL}
            h={52}
            textX={FIELD_TEXT_X}
            innerW={INNER_W_FULL}
            value={dob}
            placeholder="01/01/2001"
            onChange={(v) => setDraft((d) => ({ ...d, dob: v }))}
            keyboard="numbers-and-punctuation"
          />

          {/* ------------------------------ Gender --------------------------- */}
          <Caption x={53} y={767} w={285}>
            Gender
          </Caption>
          <PillField
            x={FIELD_X}
            y={791}
            w={FIELD_W_FULL}
            h={52}
            textX={FIELD_TEXT_X}
            innerW={INNER_W_FULL}
            value={gender}
            placeholder="Male"
            onChange={(v) => setDraft((d) => ({ ...d, gender: v }))}
          />

          {/* ------------------------------- CTA ----------------------------- */}
          <Pressable
            onPress={onSave}
            disabled={save.isPending}
            style={({ pressed }) => [styles.cta, (pressed || save.isPending) && styles.pressed]}
          >
            <Txt
              x={94.62}
              y={18}
              w={111.77}
              size={16}
              weight="bold"
              font="inter"
              color="#FFFFFF"
              lineHeight={19.36}
              align="center"
            >
              Save Changes
            </Txt>
          </Pressable>
        </>
      ) : null}

      {/* ======================== Agency Info (collapsed) ==================== */}
      <Pressable
        onPress={() => setProfileOpen(false)}
        style={({ pressed }) => [
          styles.agencyRow,
          { top: profileOpen ? AGENCY_Y_OPEN : AGENCY_Y_SHUT },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.rowFill} />
        <SectionHead tile={TILE_AGENCY} ink={INK_AGENCY} icon="business-outline" label="Agency Info" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.88 },
  clip: { overflow: "hidden" },

  /* Button — 36x36 r18 #1F1A17 disc, twin 1.8/2.7pt drop shadows. */
  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BACK_FILL,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },

  /* Tap target over the Profile Info card's own 309x48 header container. */
  head: {
    position: "absolute",
    left: CARD_X,
    top: PROFILE_Y,
    width: CARD_W,
    height: ROW_H,
  },

  agencyRow: {
    position: "absolute",
    left: CARD_X,
    width: CARD_W,
    height: ROW_H,
  },
  /* Collapsed row card — #FFFFFF @55%, 1pt #FFFFFF @90% hairline, r28. */
  rowFill: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: GLASS_55,
    borderWidth: 1,
    borderColor: HAIRLINE_90,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  rowShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  cardShadow: {
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

  avatar: { position: "absolute", left: 0, top: 0, width: 58, height: 58, borderRadius: 29 },

  /* Overlay+Border+Shadow — the drop shadow plus the 2pt inner shadow the spec
     paints inside each field, approximated with a single soft shadow. */
  fieldShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  /* Assign as — the one field that selects rather than types, so its pill is a
     Pressable with the same fill the typed pills carry. */
  select: {
    position: "absolute",
    left: FIELD_X,
    top: 512,
    width: FIELD_W_FULL,
    height: 52,
  },
  pillFill: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
    backgroundColor: GLASS_80,
    borderWidth: 1,
    borderColor: HAIRLINE_90,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /* Field value — Inter 500 15, #111827. Absolute so the input sits exactly
     where the spec's TEXT node does. */
  input: {
    position: "absolute",
    padding: 0,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: LABEL_INK,
    textAlignVertical: "center",
    includeFontPadding: false,
  },

  cta: {
    position: "absolute",
    left: FIELD_X,
    top: 868,
    width: FIELD_W_FULL,
    height: 56,
    borderRadius: 100,
    backgroundColor: CTA_BG,
    shadowColor: CTA_BG,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
