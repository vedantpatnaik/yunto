import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { useAgencies, useCreate, useCreators, type Creator } from "../../../src/api/hooks";

/**
 * Add Creators — invite sheet. Figma 7784:20329 (375x876).
 *
 * The roster panel from add-creators with the invite bottom sheet pulled over
 * the 57% scrim: sheet at y=493 (375x383, 32/32/0/0), title at 537, two
 * instruction+field pairs and the Send Invite CTA at 792.72.
 *
 * The frame's own labelling reads instruction-above / placeholder-inside —
 * "Enter creator's name" is the grey line at y=599 and "Full Name" is the
 * placeholder sitting in the 52pt box at y=624. Both strings are drawn at their
 * own coordinates rather than collapsed into one.
 *
 * There is no success screen in the flow: a successful POST dismisses the sheet
 * and the new row leads the panel carrying the blue "Invite Sent" pill, which is
 * exactly the second row this frame draws.
 *
 * Coordinates are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

/** Roster panel — 345x266 at 15,106; rows start at 190 on an 89pt step. */
const ROW_X = 37;
const ROW_W = 301;
const ROW_H = 77;
const ROW_FIRST_Y = 190;
const ROW_STEP = 89;
/** Rows whose full 77pt height clears the panel's 372pt bottom edge. */
const MAX_ROWS = Math.floor((372 - ROW_FIRST_Y - ROW_H) / ROW_STEP) + 1;

/** Sheet chrome. */
const SHEET_Y = 493;
const SHEET_H = 383;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const INK = "#141311";
const INK_INVERT = "#faf7f2";
const BACK_BG = "#1f1a17";
const PANEL_FILL = "rgba(255,255,255,0.52)";
const PANEL_LINE = "rgba(0,0,0,0.07)";
const PANEL_RULE = "rgba(0,0,0,0.05)";
const ROW_FILL = "rgba(255,255,255,0.7)";
const WHITE = "#ffffff";
const NAME_INK = "#111111";
const SUB_INK = "#888888";
const HANDLE_INK = "#999999";
const AVATAR = "#c4c4c4";
const KEBAB = "#64748b";
const SCRIM = "rgba(181,180,185,0.57)";
const GRABBER = "#e5e5e5";
const CLOSE_BG = "#f8f8f8";
const CLOSE_INK = "#555555";
const LABEL_INK = "#6b7280";
const FIELD_FILL = "rgba(255,255,255,0.8)";
const FIELD_LINE_NAME = "#e8e8e8";
const FIELD_LINE_EMAIL = "#e5e5e5";
const FIELD_INK = "#111827";
const CTA = "#312b28";

/**
 * The two status pills the frame draws, with the auto-layout run they sit in
 * baked out: the name box hugs its text, so pill x, kebab x and the name's own
 * width all shift together per variant. nameW = pillX - 16 - 116 reproduces the
 * frame's 100 (Active) and 78 (Invite Sent) exactly.
 */
const PILLS = {
  active: {
    label: "Active", x: 232, w: 59, dotX: 242, textX: 252, textW: 31, kebabX: 311,
    fill: "rgba(240,253,244,0.6)", line: "#7bf1a8", dot: "#05df72", ink: "#00a63e",
  },
  invited: {
    label: "Invite Sent", x: 210, w: 79, dotX: 220, textX: 230, textW: 51, kebabX: 309,
    fill: "#e5ecff", line: "#6990fd", dot: "#1d4ed8", ink: "#1d4ed8",
  },
} as const;

/* ------------------------------- validation ------------------------------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* --------------------------------- screen --------------------------------- */
export default function AddCreatorInviteScreen() {
  const router = useRouter();

  const { data: creators = [] } = useCreators();
  const { data: agencies = [] } = useAgencies();
  const create = useCreate<Creator>("creators");

  /** The workspace this roster belongs to — /auth/me returns no agency link. */
  const agency = agencies[0];

  const [sheetOpen, setSheetOpen] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  /**
   * Creators invited from this screen. Creator carries no invite/acceptance
   * column, so the blue pill is honestly scoped to what this session did rather
   * than read off a field that does not exist — every other row on an agency's
   * roster is a live creator and takes the green pill.
   */
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  /**
   * The panel lists the agency's roster, newest invites first so the row that
   * just flipped to "Invite Sent" is the one you land back on.
   */
  const roster = useMemo(() => {
    const list = agency ? creators.filter((c) => c.agencyId === agency.id) : creators;
    const fresh = invitedIds
      .map((id) => list.find((c) => c.id === id))
      .filter((c): c is Creator => !!c);
    return [...fresh, ...list.filter((c) => !invitedIds.includes(c.id))];
  }, [creators, agency, invitedIds]);

  const canSubmit =
    name.trim().length > 0 && EMAIL_RE.test(email.trim()) && !create.isPending;

  /**
   * POST /creators { name, handle, agencyId }. `handle` goes out empty — the
   * invite has not been accepted, so there is no channel handle yet — and the
   * email address addresses the invite; Creator has no email column, so it is
   * deliberately not written to a field that would make it look stored.
   */
  const submit = () => {
    if (!canSubmit) return;
    create.mutate(
      { name: name.trim(), handle: "", agencyId: agency?.id },
      {
        onSuccess: (row) => {
          setInvitedIds((ids) => [row.id, ...ids]);
          setName("");
          setEmail("");
          setSheetOpen(false);
        },
      },
    );
  };

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* ============================ base layer ============================= */}

      {/* Frame 2147223267 — header */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16} color={INK_INVERT} />
      </Pressable>
      <Txt
        x={72} y={28} w={222} size={20} weight="medium" font="inter"
        color={INK} lineHeight={24} letterSpacing={-0.6}
      >
        Add Creators
      </Txt>

      {/* Overlay+Border+Shadow+OverlayBlur — the roster panel */}
      <Abs
        x={15} y={106} w={345} h={266} radius={28}
        bg={PANEL_FILL} border={PANEL_LINE} borderWidth={1}
        style={styles.panelShadow}
      />
      {/* HorizontalBorder — 343x65 header strip, hairline on its bottom edge */}
      <Abs x={16} y={172} w={343} h={1} bg={PANEL_RULE} />
      <Txt
        x={36} y={125.75} w={71} size={15} weight="semibold" font="inter"
        color={NAME_INK} lineHeight={22.5} letterSpacing={-0.38}
      >
        Creator
      </Txt>
      {/* Widened past the frame's hug width so a four-digit roster still fits. */}
      <Txt
        x={37} y={146} w={120} size={12} weight="medium" font="inter"
        color={SUB_INK} lineHeight={18} numberOfLines={1}
      >
        {`${roster.length} Creators`}
      </Txt>

      {/* Add Creator — reopens the sheet once an invite has dismissed it */}
      <Pressable
        onPress={() => setSheetOpen(true)}
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
      >
        <Feather name="plus" size={12} color={INK_INVERT} style={styles.addIcon} />
        <Txt
          x={34} y={8} w={70.89} size={12} weight="bold" font="inter"
          color={INK_INVERT} lineHeight={16} align="center"
        >
          Add Creator
        </Txt>
      </Pressable>

      {/* Frame 2147223281 — the roster rows. A still-loading or empty roster
          simply draws none; the count above already reads 0 and the panel,
          divider and button hold their positions. */}
      {roster.slice(0, MAX_ROWS).map((c, i) => {
        const y = ROW_FIRST_Y + i * ROW_STEP;
        const pill = invitedIds.includes(c.id) ? PILLS.invited : PILLS.active;
        const nameW = pill.x - 16 - 116;
        return (
          <Abs
            key={c.id}
            x={ROW_X} y={y} w={ROW_W} h={ROW_H} radius={24}
            bg={ROW_FILL} border={WHITE} borderWidth={1}
            style={styles.rowShadow}
          >
            {/* image */}
            <Abs x={21} y={17.5} w={42} h={42} radius={21} bg={AVATAR} />
            <Txt
              x={79} y={16} w={nameW} size={15} weight="semibold" font="inter"
              color={NAME_INK} lineHeight={22.5} letterSpacing={-0.38} numberOfLines={1}
            >
              {c.name}
            </Txt>
            {/* Handles are posted empty on invite and filled in on acceptance,
                so a pending row leaves this line blank rather than showing a
                bare "@". */}
            <Txt
              x={79} y={41.5} w={nameW} size={12} weight="medium" font="inter"
              color={HANDLE_INK} lineHeight={18} numberOfLines={1}
            >
              {c.handle ? (c.handle.startsWith("@") ? c.handle : `@${c.handle}`) : ""}
            </Txt>

            {/* Overlay+Border — status pill */}
            <Abs
              x={pill.x - ROW_X} y={25.5} w={pill.w} h={26} radius={13}
              bg={pill.fill} border={pill.line} borderWidth={1}
            />
            <Abs x={pill.dotX - ROW_X} y={35.5} w={6} h={6} radius={3} bg={pill.dot} />
            <Txt
              x={pill.textX - ROW_X} y={30.5} w={pill.textW} size={10} weight="medium"
              font="inter" color={pill.ink} lineHeight={16}
            >
              {pill.label}
            </Txt>

            {/* Component 1 / variant=6 — row overflow */}
            <Abs x={pill.kebabX - ROW_X} y={30.5} w={16} h={16} center>
              <Feather name="more-vertical" size={16} color={KEBAB} />
            </Abs>
          </Abs>
        );
      })}

      {/* =========================== invite sheet =========================== */}
      {sheetOpen ? (
        <>
          {/* Frame 2147223240 — scrim */}
          <Pressable onPress={() => router.back()} style={styles.scrim} />

          {/* Frame — 375x383 sheet, 32/32/0/0 */}
          <Abs x={0} y={SHEET_Y} w={375} h={SHEET_H} bg={WHITE} style={styles.sheet} />
          <Abs x={167.5} y={509} w={40} h={4} radius={2} bg={GRABBER} />

          <Txt
            x={24} y={537} w={280} size={24} weight="semibold" font="inter"
            color={NAME_INK} lineHeight={29.05} letterSpacing={-0.52}
          >
            Add Creator
          </Txt>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.close, pressed && styles.pressed]}
          >
            <Feather name="x" size={20} color={CLOSE_INK} />
          </Pressable>

          {/* Container 24,599 — full name */}
          <Txt
            x={28} y={599} w={323} size={14} weight="medium" font="inter"
            color={LABEL_INK} lineHeight={16.94}
          >
            Enter creator’s name
          </Txt>
          <Abs
            x={24} y={624} w={327} h={52} radius={20}
            bg={FIELD_FILL} border={FIELD_LINE_NAME} borderWidth={1}
            style={styles.fieldShadow}
          >
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor={FIELD_INK}
              style={styles.input}
            />
          </Abs>

          {/* Container 24,693 — email address */}
          <Txt
            x={28} y={693} w={323} size={14} weight="medium" font="inter"
            color={LABEL_INK} lineHeight={16.94}
          >
            Enter creator’s email address
          </Txt>
          <Abs
            x={24} y={718} w={327} h={52} radius={20}
            bg={FIELD_FILL} border={FIELD_LINE_EMAIL} borderWidth={1}
            style={styles.fieldShadow}
          >
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              placeholderTextColor={FIELD_INK}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </Abs>

          {/* Button:margin 37,784.72 — the CTA sits 8pt into it. The frame has
              no dimmed variant, so the pill stays full #312b28 even while the
              form is incomplete; submit() simply no-ops until it validates. */}
          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.cta,
              pressed && canSubmit && styles.pressed,
            ]}
          >
            <Txt
              x={0} y={18} w={301} size={16} weight="semibold" font="inter"
              color={WHITE} lineHeight={19.36} align="center"
            >
              Send Invite
            </Txt>
          </Pressable>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },

  /** Button 16,22 36x36, fully rounded. */
  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BACK_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  panelShadow: {
    shadowColor: "#826ec8",
    shadowOpacity: 0.09,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  /** Button 218.11,123 120.89x32. */
  addButton: {
    position: "absolute",
    left: 218.11,
    top: 123,
    width: 120.89,
    height: 32,
    borderRadius: 16,
    backgroundColor: INK,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  /** Container 234.11,133 12x12 — 16 into the button. */
  addIcon: { position: "absolute", left: 16, top: 10 },
  rowShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  scrim: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 375,
    height: FRAME_H,
    backgroundColor: SCRIM,
  },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  /** Background 315,537 36x36. */
  close: {
    position: "absolute",
    left: 315,
    top: 537,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CLOSE_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  /** Text 45,641 268x18 — 21 into the 52pt box, centred on its 20pt line. */
  input: {
    position: "absolute",
    left: 21,
    top: 16,
    width: 268,
    height: 20,
    padding: 0,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    lineHeight: 18.15,
    color: FIELD_INK,
  },
  /** Button 37,792.72 301x55. */
  cta: {
    position: "absolute",
    left: 37,
    top: 792.72,
    width: 301,
    height: 55,
    borderRadius: 100,
    backgroundColor: CTA,
  },
});
