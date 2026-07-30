import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Screen, Abs, Txt } from "../../../src/ui/Frame";

/**
 * Team Management — Figma frame 7728:4778 (375x875), traced 1:1.
 *
 * Section entry menu and the root of the whole team flow: a header row and the
 * "Main" stack (0,106 375x468, 10/20/40/20 padding, 12 gap) holding five
 * 335x74 glass rows at y=116 stepping 86 — Create Teams, Manage Teams, People,
 * Leaves, Assign Creators. Each row is a tinted 48pt icon disc, a 16pt
 * semibold label and a 36pt white chevron disc pinned right.
 *
 * Pure navigation: the frame carries no record data — no counts, no names, no
 * badges — so nothing here is wired to a hook. Adding badge counts would mean
 * inventing text nodes the design does not have.
 *
 * expo-blur is not a dependency, so the spec's BACKGROUND_BLUR(24) on each card
 * is rendered as its translucent fill alone (white @55%), the same substitution
 * the other agency frames make. Header type is Geist in the file; only Outfit
 * and Inter are loaded, so it renders in Inter.
 */

/* ------------------------------ design tokens ----------------------------- */
const PAGE_BG = "#f8f5ef";

const HEADER_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";

const ROW_INK = "#111827";
const CHEVRON = "#6b7280";

const CARD_FILL = "rgba(255,255,255,0.55)"; // #ffffff @ 55%
const CARD_LINE = "rgba(255,255,255,0.9)"; // #ffffff @ 90%
const CHEV_FILL = "rgba(255,255,255,0.6)"; // #ffffff @ 60%

/* -------------------------------- geometry -------------------------------- */
/** Rows: 335x74 at x=20, first at y=116, stepping 86 (74 card + 12 stack gap). */
const CARD_X = 20;
const CARD_W = 335;
const CARD_H = 74;
const CARD_Y0 = 116;
const CARD_STEP = 86;

/** Row-relative offsets — identical across all five cards in the spec. */
const R_DISC = { x: 13, y: 13, size: 48, radius: 20 };
const R_ICON = { x: 25, y: 25, size: 24 };
const R_LABEL = { x: 77, y: 27.5, w: 193 };
const R_CHEV_DISC = { x: 286, y: 21, size: 36 };
const R_CHEV_ICON = { x: 294, y: 29, size: 20 };

/* -------------------------------- primitives ------------------------------ */
/** A Figma icon FRAME — square box with the glyph centred inside it. */
function Icon({
  x, y, size, children,
}: { x: number; y: number; size: number; children: ReactNode }) {
  return (
    <View
      style={{
        position: "absolute", left: x, top: y, width: size, height: size,
        alignItems: "center", justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}

/**
 * Which glyph each row draws. The spec ships iconify/material sets that are not
 * bundled here, so each is matched to its nearest @expo/vector-icons twin at the
 * vector's own size: arcticons:vk-teams -> account-group-outline (18.5 stroke),
 * pajamas:work-item-child -> sitemap (21 filled hierarchy), the 20x17.87 + 8x8
 * stroke pair -> Feather users, the 24.45 calendar group -> Feather calendar and
 * material-symbols:assignment-turned-in-outline -> clipboard-check-outline.
 */
type Glyph = "create" | "manage" | "people" | "leaves" | "assign";

function RowGlyph({ kind, color }: { kind: Glyph; color: string }) {
  switch (kind) {
    case "create":
      return <MaterialCommunityIcons name="account-group-outline" size={24} color={color} />;
    case "manage":
      return <MaterialCommunityIcons name="sitemap" size={21} color={color} />;
    case "people":
      return <Feather name="users" size={22} color={color} />;
    case "leaves":
      return <Feather name="calendar" size={24} color={color} />;
    case "assign":
      return <MaterialCommunityIcons name="clipboard-check-outline" size={22} color={color} />;
  }
}

interface NavRow {
  glyph: Glyph;
  label: string;
  /** Icon disc fill. */
  tint: string;
  /** Glyph stroke/fill colour. */
  ink: string;
  route: string;
}

/**
 * The five destinations, in frame order. Every target lives in this same
 * `people` flow, so its route is `/people/<slug>` — the group folder `(agency)`
 * is not part of the URL.
 */
const ROWS: NavRow[] = [
  {
    glyph: "create", label: "Create Teams",
    tint: "#f3e8ff", ink: "#9333ea", route: "/people/create-teams",
  },
  {
    glyph: "manage", label: "Manage Teams",
    tint: "#dbeafe", ink: "#2563eb", route: "/people/manage-teams",
  },
  {
    glyph: "people", label: "People",
    tint: "#ccfbf1", ink: "#159b7f", route: "/people/people",
  },
  {
    glyph: "leaves", label: "Leaves",
    tint: "#ffedd5", ink: "#ea580c", route: "/people/leaves",
  },
  {
    glyph: "assign", label: "Assign Creators",
    tint: "#d1fae5", ink: "#059669", route: "/people/assign-creators",
  },
];

/* --------------------------------- screen --------------------------------- */
export default function TeamManagementHubScreen() {
  const router = useRouter();

  return (
    <Screen height={875} background={PAGE_BG} scroll>
      {/* ============================ Frame 2147223268 ======================== */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16.2} color={BACK_ICON} />
      </Pressable>
      <Txt
        x={72} y={28} w={222}
        size={20} weight="medium" font="inter"
        color={HEADER_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Team Management
      </Txt>

      {/* ================================= Main =============================== */}
      {ROWS.map((row, i) => (
        <Pressable
          key={row.label}
          onPress={() => router.push(row.route)}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.card,
            { top: CARD_Y0 + i * CARD_STEP },
            pressed && styles.pressed,
          ]}
        >
          {/* Background+Shadow — tinted 48pt disc, r=20 */}
          <Abs
            x={R_DISC.x} y={R_DISC.y} w={R_DISC.size} h={R_DISC.size}
            radius={R_DISC.radius} bg={row.tint} style={styles.discShadow}
          />
          <Icon x={R_ICON.x} y={R_ICON.y} size={R_ICON.size}>
            <RowGlyph kind={row.glyph} color={row.ink} />
          </Icon>

          <Txt
            x={R_LABEL.x} y={R_LABEL.y} w={R_LABEL.w}
            size={16} weight="semibold" font="inter"
            color={ROW_INK} lineHeight={19.36} numberOfLines={1}
          >
            {row.label}
          </Txt>

          {/* Margin > Overlay+Shadow — 36pt white disc holding the chevron */}
          <Abs
            x={R_CHEV_DISC.x} y={R_CHEV_DISC.y}
            w={R_CHEV_DISC.size} h={R_CHEV_DISC.size}
            radius={R_CHEV_DISC.size / 2} bg={CHEV_FILL} style={styles.chevShadow}
          />
          <Icon x={R_CHEV_ICON.x} y={R_CHEV_ICON.y} size={R_CHEV_ICON.size}>
            <Feather name="chevron-right" size={20} color={CHEVRON} />
          </Icon>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },

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

  card: {
    position: "absolute",
    left: CARD_X,
    width: CARD_W,
    height: CARD_H,
    borderRadius: 28,
    backgroundColor: CARD_FILL,
    borderWidth: 1,
    borderColor: CARD_LINE,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  discShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  chevShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
