import { useMemo } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { radius } from "../../../src/theme";
import { useAgencies, useCreators, type Creator } from "../../../src/api/hooks";

/**
 * Add Creators — Figma frame 7784:19566 (375x876), traced 1:1.
 *
 * Roster management, reached from the Add Creator action on Creators. One
 * 345x266 frosted panel at (15,106) holds two bands: a "Creator / 50 Creators"
 * header with the dark Add Creator pill on its right, and below it the roster
 * list — 301x77 glass rows carrying a 42pt avatar, name, @handle, a status pill
 * and a kebab. Frame content ends at y=372, the panel's own bottom edge.
 *
 * Panel children use panel-relative coordinates with the origin at (16, 107) —
 * the panel's (15, 106) plus its 1pt stroke, since Yoga positions absolute
 * children against the padding box. Row children are offset the same way
 * against each card's own 1pt stroke, as are the pills' dot and label.
 *
 * The list grows. The panel is a VERTICAL auto-layout that hugs its children,
 * so its height is 1 + 65 (header) + 18 (gap) + list + 15 (pad) + 1, i.e.
 * 89n + 88 — which is the drawn 266 at the two rows the file shows. Rows step
 * by 89 (77 + the 12pt gap) and are capped at the 7 that still land inside the
 * 876 frame; loading and empty states keep the panel at its drawn height so no
 * geometry moves.
 *
 * Data — the rows are the live roster off GET /creators:
 *   50 Creators      the roster size
 *   name / @handle   Creator.name, Creator.handle
 *   avatar           Creator.avatarUrl, falling back to the spec's #c4c4c4 disc
 * /auth/me returns no agency link, so the workspace is read as agencies[0] and
 * the roster is the creators carrying that agencyId — the same resolution
 * creators-roster.tsx makes.
 *
 * Invite state has no column: Prisma's Creator has no inviteStatus and there is
 * no CreatorInvite model. Rather than fabricate one, the pill is derived from
 * the fields that do exist, matching the reading assign-creators.tsx already
 * uses for "pending approvals" — a creator claimed by the agency whose roster
 * listing is published (`listed`) is Active; one claimed but not yet published
 * is still out for acceptance, so it reads Invite Sent.
 *
 * expo-blur is not a dependency, so the panel's BACKGROUND_BLUR(20) and the
 * rows' BACKGROUND_BLUR(8) render as their translucent fills alone — the
 * substitution the other agency frames make. The header face is Geist in the
 * file; only Outfit and Inter are loaded, so it renders in Inter.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

/** Overlay+Border+Shadow+OverlayBlur — 7784:20282. */
const PANEL = { x: 15, y: 106, w: 345, h: 266, r: 28 };
/** Inner box after the 1pt stroke: 343 wide. */
const INNER_W = 343;

/** HorizontalBorder 7784:20283 — 343x65 with a bottom hairline. */
const HEADER_H = 65;

/** Frame 2147223281 — the row stack, first card at panel-rel y=83. */
const LIST_Y = 83;
const CARD_X = 21;
const CARD_W = 301;
const CARD_H = 77;
const CARD_STEP = 89; // 77 + the stack's 12pt gap

/** Panel height for n rows: 1 + 65 + 18 + (89n - 12) + 15 + 1. */
const panelHeight = (n: number) => (n > 0 ? CARD_STEP * n + 88 : PANEL.h);
/** The last row that still closes inside the 876 frame (106 + 89n + 88). */
const MAX_ROWS = 7;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef"; // frame fill
const BACK_FILL = "#1f1a17"; // Button — 7784:19985
const ON_DARK = "#faf7f2"; // Vector / Text on the dark pills
const TITLE_INK = "#141311"; // "Add Creators" — 7784:19990
const BTN_FILL = "#141311"; // Button — 7784:20287

const PANEL_FILL = "rgba(255,255,255,0.52)";
const PANEL_LINE = "rgba(0,0,0,0.07)";
const RULE = "rgba(0,0,0,0.05)"; // 7784:20283 bottom border

const CARD_FILL = "rgba(255,255,255,0.7)";
const CARD_LINE = "#ffffff";
const AVATAR_FILL = "#c4c4c4"; // image — 7784:20295
const NAME_INK = "#111111"; // "Creator" / "Leena Sharma"
const SUB_INK = "#888888"; // "50 Creators"
const HANDLE_INK = "#999999"; // "@leenabliss"
const KEBAB_INK = "#64748b"; // Component 1 vectors

/* ------------------------------ status pills ------------------------------ */
/**
 * Overlay+Border 7784:20302 (Active) and 7784:20315 (Invite Sent).
 *
 * The row is a HORIZONTAL auto-layout, so the pill's x follows its own width:
 * the file draws Active at 232 (59 wide) and Invite Sent at 210 (79 wide),
 * which are panel-card-relative 194 and 172. Everything downstream falls out of
 * that — the name block runs to 16pt before the pill (pillX - 94, i.e. the
 * spec's 100 and 78) and the kebab sits 16 + 4 past its trailing edge (273 and
 * 271, the spec's 311 and 309).
 */
interface Status {
  label: string;
  labelW: number;
  pillX: number;
  pillW: number;
  fill: string;
  line: string;
  dot: string;
  ink: string;
}

const ACTIVE: Status = {
  label: "Active", labelW: 31, pillX: 194, pillW: 59,
  fill: "rgba(240,253,244,0.6)", line: "#7bf1a8", dot: "#05df72", ink: "#00a63e",
};
const INVITED: Status = {
  label: "Invite Sent", labelW: 51, pillX: 172, pillW: 79,
  fill: "#e5ecff", line: "#6990fd", dot: "#1d4ed8", ink: "#1d4ed8",
};

/* ------------------------------ derivations ------------------------------- */
/** Seeded handles already carry the @; guard the ones that do not. */
const atHandle = (h: string) => (h.startsWith("@") ? h : `@${h}`);

/* --------------------------------- the row -------------------------------- */
function CreatorRow({ top, creator }: { top: number; creator: Creator }) {
  const status = creator.listed ? ACTIVE : INVITED;
  const nameW = status.pillX - 94;

  return (
    <Abs
      x={CARD_X} y={top} w={CARD_W} h={CARD_H} radius={24}
      bg={CARD_FILL} border={CARD_LINE} borderWidth={1} style={styles.cardShadow}
    >
      {/* image — 7784:20295 */}
      {creator.avatarUrl ? (
        <Image source={{ uri: creator.avatarUrl }} style={styles.avatar} />
      ) : (
        <Abs x={20} y={16.5} w={42} h={42} radius={21} bg={AVATAR_FILL} />
      )}

      {/* Container — 7784:20296 */}
      <Txt
        x={78} y={15} w={nameW} numberOfLines={1}
        size={15} weight="semibold" font="inter" color={NAME_INK}
        lineHeight={22.5} letterSpacing={-0.38}
      >
        {creator.name}
      </Txt>
      <Txt
        x={78} y={40.5} w={nameW} numberOfLines={1}
        size={12} weight="medium" font="inter" color={HANDLE_INK} lineHeight={18}
      >
        {atHandle(creator.handle)}
      </Txt>

      {/* Overlay+Border — the status pill */}
      <Abs
        x={status.pillX} y={24.5} w={status.pillW} h={26} radius={radius.full}
        bg={status.fill} border={status.line} borderWidth={1}
      >
        <Abs x={9} y={9} w={6} h={6} radius={3} bg={status.dot} />
        <Txt
          x={19} y={4} w={status.labelW}
          size={10} weight="medium" font="inter" color={status.ink} lineHeight={16}
        >
          {status.label}
        </Txt>
      </Abs>

      {/* Button > Component 1 — the row overflow menu has no route file yet, so
          it renders without a destination rather than pushing a dead path. */}
      <Abs x={status.pillX + status.pillW + 20} y={29.5} w={16} h={16} center>
        <Feather name="more-vertical" size={16} color={KEBAB_INK} />
      </Abs>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function AddCreatorsScreen() {
  const router = useRouter();

  const { data: creators = [], isLoading: creatorsLoading } = useCreators();
  const { data: agencies = [], isLoading: agenciesLoading } = useAgencies();
  const loading = creatorsLoading || agenciesLoading;

  /** The workspace this roster belongs to — /auth/me returns no agency link. */
  const agency = agencies[0];

  const roster = useMemo(
    () => (agency ? creators.filter((c) => c.agencyId === agency.id) : []),
    [creators, agency],
  );

  const rows = roster.slice(0, MAX_ROWS);

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* ============================ Frame 2147223267 ======================== */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16.2} color={ON_DARK} />
      </Pressable>
      <Txt
        x={72} y={28} w={222}
        size={20} weight="medium" font="inter"
        color={TITLE_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Add Creators
      </Txt>

      {/* ================== Overlay+Border+Shadow+OverlayBlur ================== */}
      <Abs
        x={PANEL.x} y={PANEL.y} w={PANEL.w} h={panelHeight(rows.length)} radius={PANEL.r}
        bg={PANEL_FILL} border={PANEL_LINE} borderWidth={1}
        style={styles.panel}
      >
        {/* ---------------------- HorizontalBorder (header) ------------------ */}
        <Txt
          x={20} y={18.75} w={71}
          size={15} weight="semibold" font="inter" color={NAME_INK}
          lineHeight={22.5} letterSpacing={-0.38}
        >
          Creator
        </Txt>
        <Txt
          x={21} y={39} w={120} numberOfLines={1}
          size={12} weight="medium" font="inter" color={SUB_INK} lineHeight={18}
        >
          {`${loading ? "—" : roster.length} Creators`}
        </Txt>

        {/* Button — 7784:20287. The add-creator form has no route file yet, so
            this renders inert rather than pushing a path that fails silently. */}
        <Abs
          x={202.11} y={16} w={120.89} h={32} radius={radius.full}
          bg={BTN_FILL} style={styles.addShadow}
        >
          <Abs x={16} y={10} w={12} h={12} center>
            <Feather name="plus" size={12} color={ON_DARK} />
          </Abs>
          <Txt
            x={34} y={8} w={70.89} align="center"
            size={12} weight="bold" font="inter" color={ON_DARK} lineHeight={16}
          >
            Add Creator
          </Txt>
        </Abs>
        <Abs x={0} y={HEADER_H - 1} w={INNER_W} h={1} bg={RULE} />

        {/* ---------------------- Frame 2147223281 (rows) -------------------- */}
        {rows.map((c, i) => (
          <CreatorRow key={c.id} top={LIST_Y + i * CARD_STEP} creator={c} />
        ))}
        {rows.length === 0 ? (
          <Txt
            x={CARD_X} y={LIST_Y} w={CARD_W}
            size={12} weight="medium" font="inter" color={SUB_INK} lineHeight={18}
          >
            {loading ? "Loading creators…" : "No creators on this roster yet"}
          </Txt>
        ) : null}
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },

  /* Button — 7784:19985, with the Button:shadow rect folded in. */
  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BACK_FILL,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },

  panel: {
    overflow: "hidden",
    shadowColor: "#826ec8",
    shadowOpacity: 0.09,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  addShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    position: "absolute",
    left: 20,
    top: 16.5,
    width: 42,
    height: 42,
    borderRadius: 21,
  },
});
