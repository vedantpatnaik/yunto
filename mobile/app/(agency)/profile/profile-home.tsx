import type { ReactNode } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen, Abs, Txt } from "../../../src/ui/Frame";
import { gradients } from "../../../src/theme";
import { useCampaigns, useCreators, useList, useMe } from "../../../src/api/hooks";

/**
 * Profile — Figma frame 7721:4248 (375x876), traced 1:1.
 *
 * Hub of the agency profile flow. A frosted identity card (20,106 335x347)
 * carries the avatar, name, role, agency-code pill and the 3-up stat row; below
 * it the "Account" section lists four 76.5-tall glass rows, then a hairline and
 * the Log Out card.
 *
 * The frame is 876 but the design's "Container" (0,106 375x750) clips at 856
 * while its content runs to y=967 — the last 111pt of the Log Out card is
 * simply cut off in Figma. That is a clip artefact, not intent, so the canvas
 * here is the true content bottom (967) and the screen scrolls.
 *
 * expo-blur is not a dependency, so the spec's BACKGROUND_BLUR effects are
 * rendered as their translucent fills alone (white @55% / @70%). Header type is
 * Geist in the file; only Outfit and Inter are loaded, so it renders in Inter —
 * the same substitution the other agency frames make.
 */

/* ------------------------------ design tokens ----------------------------- */
const PAGE_BG = "#f8f5ef";
const CONTENT_BOTTOM = 967; // Log Out card: y=889 + h=78

const HEADER_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";

const INK = "#111111";
const MUTED = "#888888";
const LABEL = "#999999";
const STAT_LABEL = "#aaaaaa";
const STAT_RULE = "#eaeaea";
const ROW_ICON = "#333333";
const CHEVRON = "#cccccc";
const DANGER = "#9b3232";

const CODE_INK = "#5560cc";
const CODE_VALUE = "#333333";
const CODE_DOT = "#7a8ae8";
const CODE_FILL = "rgba(200,210,255,0.25)"; // #c8d2ff @ 25%
const CODE_LINE = "rgba(160,170,255,0.35)"; // #a0aaff @ 35%

const CARD_FILL = "rgba(255,255,255,0.55)";
const CARD_LINE = "rgba(0,0,0,0.07)";
const ROW_FILL = "rgba(255,255,255,0.7)";
const HAIRLINE = "rgba(0,0,0,0.06)";
const DIVIDER = "rgba(0,0,0,0.05)";

/* -------------------------------- geometry -------------------------------- */
/** Account rows: 335x76.5 at y=510, stepping 88.5 (76.5 card + 12 stack gap). */
const ROW_X = 20;
const ROW_W = 335;
const ROW_H = 76.5;
const ROW_Y0 = 510;
const ROW_STEP = 88.5;

/** Row-relative offsets — identical across all four cards in the spec. */
const R_DISC = { x: 21, y: 18.25, size: 40 };
const R_ICON = { x: 32, y: 29.25, size: 18 };
const R_TITLE = { x: 77, y: 16, w: 205 };
const R_SUB = { x: 77, y: 41.5, w: 205 };
const R_CHEV = { x: 298, y: 30.25, size: 16 };

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
 * Which glyph each account row draws. The spec ships these as INSTANCE
 * variants; the vector bounding boxes identify them exactly — variant=5 is
 * Feather chevron-right (4x8 in a 16 box), variant=6 Feather users, variant=7
 * Feather git-branch (both 4.5pt circles land on its exact coordinates) and
 * variant=9 Feather log-out (13.5x13.5 in an 18 box).
 */
type Glyph = "identity" | "team" | "distribution" | "integrations";

function RowGlyph({ kind }: { kind: Glyph }) {
  switch (kind) {
    case "identity":
      return <Ionicons name="person-circle-outline" size={18} color={ROW_ICON} />;
    case "team":
      return <Feather name="users" size={18} color={ROW_ICON} />;
    case "distribution":
      return <Feather name="git-branch" size={18} color={ROW_ICON} />;
    case "integrations":
      return <MaterialCommunityIcons name="power-plug-outline" size={18} color={ROW_ICON} />;
  }
}

interface AccountRowProps {
  index: number;
  glyph: Glyph;
  tint: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

/** One 335x76.5 glass row: tinted icon disc, two-line label stack, chevron. */
function AccountRow({ index, glyph, tint, title, subtitle, onPress }: AccountRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowCard,
        { top: ROW_Y0 + index * ROW_STEP, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Abs
        x={R_DISC.x} y={R_DISC.y} w={R_DISC.size} h={R_DISC.size}
        radius={R_DISC.size / 2} bg={tint}
      />
      <Icon x={R_ICON.x} y={R_ICON.y} size={R_ICON.size}>
        <RowGlyph kind={glyph} />
      </Icon>

      <Txt
        x={R_TITLE.x} y={R_TITLE.y} w={R_TITLE.w}
        size={15} weight="semibold" font="inter"
        color={INK} lineHeight={22.5} letterSpacing={-0.38} numberOfLines={1}
      >
        {title}
      </Txt>
      <Txt
        x={R_SUB.x} y={R_SUB.y} w={R_SUB.w}
        size={12} weight="medium" font="inter"
        color={LABEL} lineHeight={18} numberOfLines={1}
      >
        {subtitle}
      </Txt>

      <Icon x={R_CHEV.x} y={R_CHEV.y} size={R_CHEV.size}>
        <Feather name="chevron-right" size={16} color={CHEVRON} />
      </Icon>
    </Pressable>
  );
}

/* ------------------------------- derivations ------------------------------ */
/** Role enum -> the design's "Super Admin" casing. */
const roleLabel = (role: string) =>
  role
    .split("_")
    .filter(Boolean)
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");

/** Counts read "—" until their query lands, so the row geometry never shifts. */
const statText = (loading: boolean, n: number) => (loading ? "—" : String(n));

/** Teams come from /teams; hooks.ts has no named helper, so useList is used directly. */
interface Team {
  id: string;
  name: string;
  kind: string;
}

/**
 * `/auth/me` returns the whole User row minus its password hash, so agencyCode
 * is on the wire even though the shared `User` interface in hooks.ts stops at
 * the fields the influencer app needed. Narrowed here rather than widening a
 * type other screens share.
 */
type WithAgencyCode = { agencyCode?: string | null };

/* --------------------------------- screen --------------------------------- */
export default function ProfileHomeScreen() {
  const router = useRouter();

  const { data: me } = useMe();
  const { data: creators = [], isLoading: creatorsLoading } = useCreators();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const { data: teams = [], isLoading: teamsLoading } = useList<Team>("teams");

  const agencyCode = (me as (typeof me & WithAgencyCode) | undefined)?.agencyCode;
  const teamCount = teams.length;

  return (
    <Screen height={CONTENT_BOTTOM} background={PAGE_BG} scroll>
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
        Profile
      </Txt>

      {/* ======================= Identity card (20,106) ======================== */}
      <Abs
        x={20} y={106} w={335} h={347} radius={32}
        bg={CARD_FILL} border={CARD_LINE} borderWidth={1}
        style={styles.identityShadow}
      />

      {/* Avatar — 90x88 white ring holding an 86.95 round image. */}
      <Abs x={142.5} y={143} w={90} h={88} radius={44} bg="#ffffff" style={styles.avatarShadow} />
      <Abs
        x={142.92} y={143.51} w={86.95} h={86.95} radius={43.475}
        border="rgba(0,0,0,0.14)" borderWidth={1.45} style={styles.clip}
      >
        <LinearGradient
          colors={gradients.avatarA}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {me?.avatarUrl ? (
          <Image source={{ uri: me.avatarUrl }} style={StyleSheet.absoluteFill} />
        ) : null}
      </Abs>
      {/* Presence dot. No presence column exists — this is the design's badge on
          the signed-in user's own card, so it is drawn as chrome, not as data. */}
      <Abs
        x={210.5} y={209} w={20} h={20} radius={10}
        bg="#3e7d52" border="#ffffff" borderWidth={2}
      />

      {/*
        Name and role are hug-width auto-layout boxes centred in the 285pt card
        column (45 -> 330). Rendered across the full column with align="center"
        so the centre line matches the spec for any length of name.
      */}
      <Txt
        x={45} y={243} w={285} align="center"
        size={22} weight="semibold" font="inter"
        color={INK} lineHeight={33} letterSpacing={-0.55} numberOfLines={1}
      >
        {me?.name ?? "…"}
      </Txt>
      <Txt
        x={45} y={277} w={285} align="center"
        size={13} weight="medium" font="inter"
        color={MUTED} lineHeight={19.5} numberOfLines={1}
      >
        {me ? roleLabel(me.role) : "…"}
      </Txt>

      {/* --------------------------- Agency Code pill ------------------------- */}
      <Abs
        x={83} y={309} w={209} h={38} radius={19}
        bg={CODE_FILL} border={CODE_LINE} borderWidth={1}
      />
      <Abs x={100} y={324} w={8} h={8} radius={4} bg={CODE_DOT} />
      <Txt
        x={116} y={319} w={82}
        size={12} weight="bold" font="inter"
        color={CODE_INK} lineHeight={18} letterSpacing={0.3}
      >
        Agency Code
      </Txt>
      <Txt
        x={206} y={319} w={39}
        size={12} weight="bold" font="inter"
        color={CODE_VALUE} lineHeight={18} numberOfLines={1}
      >
        {agencyCode ?? "—"}
      </Txt>
      {/* Copy affordance. No clipboard module is installed, so the disc is drawn
          as the spec has it rather than wired to a tap that cannot copy. */}
      <Abs x={255} y={318} w={20} h={20} radius={10} bg="rgba(255,255,255,0.7)" center>
        <Feather name="copy" size={11} color={MUTED} />
      </Abs>

      {/* ------------------------------ Stat row ------------------------------ */}
      <Abs x={45} y={367} w={285} h={1} bg={HAIRLINE} />

      <Txt
        x={45} y={384} w={73} align="center"
        size={18} weight="semibold" font="inter"
        color={INK} lineHeight={27} letterSpacing={-0.45}
      >
        {statText(creatorsLoading, creators.length)}
      </Txt>
      <Txt
        x={45} y={413} w={73} align="center"
        size={10} weight="bold" font="inter"
        color={STAT_LABEL} lineHeight={15} letterSpacing={1}
      >
        CREATORS
      </Txt>

      <Abs x={134} y={384} w={1} h={44} bg={STAT_RULE} />

      <Txt
        x={151} y={384} w={73} align="center"
        size={18} weight="semibold" font="inter"
        color={INK} lineHeight={27} letterSpacing={-0.45}
      >
        {statText(campaignsLoading, campaigns.length)}
      </Txt>
      <Txt
        x={151} y={413} w={73} align="center"
        size={10} weight="bold" font="inter"
        color={STAT_LABEL} lineHeight={15} letterSpacing={1}
      >
        CAMPAIGNS
      </Txt>

      <Abs x={240} y={384} w={1} h={44} bg={STAT_RULE} />

      <Txt
        x={257} y={384} w={73} align="center"
        size={18} weight="semibold" font="inter"
        color={INK} lineHeight={27} letterSpacing={-0.45}
      >
        {statText(teamsLoading, teamCount)}
      </Txt>
      <Txt
        x={257} y={413} w={73} align="center"
        size={10} weight="bold" font="inter"
        color={STAT_LABEL} lineHeight={15} letterSpacing={1}
      >
        TEAM
      </Txt>

      {/* ============================ Account section ========================= */}
      <Txt
        x={24} y={477} w={327}
        size={11} weight="semibold" font="inter"
        color={LABEL} lineHeight={16.5} letterSpacing={1.1}
      >
        ACCOUNT
      </Txt>

      <AccountRow
        index={0}
        glyph="identity"
        tint="#edf2f6"
        title="Profile & Agency Info"
        subtitle="Manage your details"
        onPress={() => router.push("/profile/profile-agency-info")}
      />
      <AccountRow
        index={1}
        glyph="team"
        tint="#f0f5f1"
        title="Team Management"
        subtitle={teamsLoading ? "Loading…" : `${teamCount} ${teamCount === 1 ? "Team" : "Teams"}`}
        onPress={() => router.push("/teams/team-management")}
      />
      <AccountRow
        index={2}
        glyph="distribution"
        tint="#f5f0fa"
        title="Lead Distribution"
        subtitle="Auto-assign rules"
        onPress={() => router.push("/leads/lead-distribution")}
      />
      {/*
        The provider list is the design's own copy. Nothing in the Prisma schema
        models an integration or its connection state, so it stays literal
        rather than being faked from an unrelated table.
      */}
      <AccountRow
        index={3}
        glyph="integrations"
        tint="#fef9ee"
        title="Integrations"
        subtitle="Facebook, Wordpress, Google Ads"
        onPress={() => router.push("/profile/integrations")}
      />

      {/* =============================== Log Out ============================== */}
      <Abs x={20} y={872} w={335} h={1} bg={DIVIDER} />

      <Pressable
        onPress={() => router.push("/profile/logout-confirm")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.logoutCard, pressed && styles.pressed]}
      >
        <Abs x={21} y={21} w={40} h={40} radius={20} bg="#fff1f1" />
        <Icon x={32} y={32} size={18}>
          <Feather name="log-out" size={18} color={DANGER} />
        </Icon>
        <Txt
          x={77} y={28.75} w={237}
          size={15} weight="semibold" font="inter"
          color={DANGER} lineHeight={22.5} letterSpacing={-0.38}
        >
          Log Out
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  clip: { overflow: "hidden" },

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

  identityShadow: {
    shadowColor: "#8c78c8",
    shadowOpacity: 0.12,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 16 },
    elevation: 3,
  },
  avatarShadow: {
    shadowColor: "#8c78c8",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  rowCard: {
    position: "absolute",
    left: ROW_X,
    width: ROW_W,
    height: ROW_H,
    borderRadius: 24,
    backgroundColor: ROW_FILL,
    borderWidth: 1,
    borderColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  logoutCard: {
    position: "absolute",
    left: 20,
    top: 889,
    width: 335,
    height: 78,
    borderRadius: 24,
    backgroundColor: ROW_FILL,
    borderWidth: 1,
    borderColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
