import { useMemo } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useUsers, type User } from "../../../src/api/hooks";

/**
 * Person Profile — Figma frame 7741:2575 ("Frame", 375x876), traced 1:1.
 *
 * The newest-generation people record, reached from the people overview: the
 * "Team Management" header, then three glass cards on the #f8f5ef page —
 *   1. 335x287 at y=106: team context row (icon + team name + member count +
 *      active-count pill), the person row (avatar, name, function, status,
 *      kebab) and the "Attendance & Leaves" link into the person's attendance;
 *   2. 335x410 at y=409: "Detailed Information" + "Add Information", then eight
 *      label/value rows on a 41pt step (the first is 45 tall, the last carries
 *      no hairline);
 *   3. 335x277 at y=835: "Access Permission" + "Add Permissions" and the three
 *      permission rows.
 *
 * Content runs to y=1112, past the 876 frame box, so the canvas is sized to
 * 1160 (1112 + the container's 48pt bottom padding) and scrolls.
 *
 * The frame's Geist heading renders in Inter — Geist is not loaded in
 * app/_layout.tsx and Inter is the frame's own body face. Icon glyphs are the
 * nearest Feather equivalents of the design's vector components, at the spec's
 * sizes and colours.
 */

/* ------------------------------- geometry --------------------------------- */
const CANVAS_H = 1160;

const ROW_X = 41; // detail/permission rows share the cards' padding box
const ROW_W = 293;
const DETAIL_Y = 487; // first label/value baseline
const DETAIL_STEP = 41;
const DETAIL_RULE_Y = 515; // first row's bottom hairline
const VALUE_X = 169; // right-aligned value container
const VALUE_W = 165;

/* ----------------------------- spec palette ------------------------------- */
const PAGE = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";
const INK = "#111111";
const SUB = "#64748b";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const BORDER_75 = "rgba(255,255,255,0.75)";
const BORDER_60 = "rgba(255,255,255,0.6)";
const HAIRLINE = "rgba(255,255,255,0.4)";
const DIVIDER = "rgba(226,232,240,0.3)";
const TILE = "#e0e7ff";
const TILE_INK = "#615fff";
const CTA_FILL = "#111111";
const CTA_INK = "#f4f6f8";
const TOGGLE_ON = "#05df72";
const TOGGLE_OFF = "#e2e8f0"; // the frame draws no off state; reuses its divider grey
const AVATAR_FILL = "#c4c4c4";
const AVATAR_INK = "#5560cc";
const KEBAB_INK = "#64748b";

/** Status pill paints. `active` is the frame's; `invite_sent` is the roster's sibling variant. */
const STATUS = {
  active: {
    label: "Active", w: 75, textW: 37,
    fill: "rgba(240,253,244,0.6)", line: "#7bf1a8", dot: "#05df72", ink: "#00a63e",
  },
  invite_sent: {
    label: "Invite Sent", w: 88, textW: 50,
    fill: "#e5ecff", line: "#6990fd", dot: "#1d4ed8", ink: "#1d4ed8",
  },
} as const;

/* ------------------------------ derivations ------------------------------- */
/** GET /users selects createdAt; the shared User interface predates it. */
type Person = User & { createdAt?: string };

/** No value on record. Better an honest blank than a plausible-looking invention. */
const DASH = "—";

/**
 * User has no invitation column. POST /users provisions a member from name,
 * email, role and team alone and leaves the target unset, so a person with no
 * target on record is still a pending invite and one with a target is Active —
 * the same reading team-roster uses.
 */
const isActive = (u?: User) => !!u && (u.targetMonthly != null || u.targetYearly != null);

/** Seniority, from User.role — the design's "Manager" subtitle and "Assign As". */
const seniority = (role?: string) =>
  !role ? DASH : role === "SUPER_ADMIN" ? "Admin" : role.endsWith("MANAGER") ? "Manager" : "Employee";

/** "07/02/2025" / "22/05/1998" — the frame's day-first format. */
function ddmmyyyy(iso?: string): string {
  if (!iso) return DASH;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return DASH;
  const p = (n: number) => `${n}`.padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Access permission is not a column — the only permission model that exists is
 * the server's RBAC policy table (server/src/middleware/rbac.ts), keyed on
 * User.role. These three rows mirror it exactly, so each toggle reflects what
 * the API would actually let this person do:
 *   Assign Leads / Campaigns    -> POLICY.leads.write ∪ POLICY.campaigns.write
 *   Reallocate Campaigns & Leads-> reassigning owners is a personnel write (POLICY.users.write)
 *   Approve Leaves              -> POLICY.leaves.write
 * With nothing to persist to, they render as derived state rather than controls.
 */
const MANAGERS = ["SUPER_ADMIN", "SALES_MANAGER", "OPS_MANAGER"];
const LEAD_WRITERS = ["SUPER_ADMIN", "SALES_MANAGER", "SALES_EMPLOYEE"];
const CAMPAIGN_WRITERS = ["SUPER_ADMIN", "SALES_MANAGER", "OPS_MANAGER", "OPS_EMPLOYEE"];

function permissionsFor(role?: string): boolean[] {
  if (!role) return [false, false, false];
  return [
    LEAD_WRITERS.includes(role) || CAMPAIGN_WRITERS.includes(role),
    MANAGERS.includes(role),
    MANAGERS.includes(role),
  ];
}

/* ----------------------------- permission rows ---------------------------- */
/** Row geometry straight off the frame — the three rows are not on a uniform step. */
const PERMS = [
  {
    label: "Assign Leads / Campaigns", icon: "send",
    tileX: 41, tileY: 919, tileW: 32,
    textX: 85, textY: 925, textW: 178,
    switchX: 286, switchY: 923, switchW: 48,
    ruleY: 965,
  },
  {
    label: "Reallocate Campaigns &\nLeads", icon: "repeat",
    tileX: 41, tileY: 984, tileW: 31.42,
    textX: 84.42, textY: 980, textW: 162,
    switchX: 286.7, switchY: 988, switchW: 47.3,
    ruleY: 1034,
  },
  {
    label: "Approve Leaves", icon: "check-circle",
    tileX: 41, tileY: 1049, tileW: 32,
    textX: 85, textY: 1055, textW: 108,
    switchX: 286, switchY: 1053, switchW: 48,
    ruleY: 0, // last row carries no hairline
  },
] as const;

/** 48x24 pill with a 16x16 knob inset 4pt — on = knob right, off = knob left. */
function Toggle({ x, y, w, on }: { x: number; y: number; w: number; on: boolean }) {
  return (
    <Abs x={x} y={y} w={w} h={24} radius={9999} bg={on ? TOGGLE_ON : TOGGLE_OFF}>
      <Abs
        x={on ? w - 20 : 4}
        y={4}
        w={16}
        h={16}
        radius={9999}
        bg={colors.white}
        style={styles.knobShadow}
      />
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function PersonProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: users = [], isLoading } = useUsers();

  /** The record this screen is about — the id we were pushed with, else the first person. */
  const person = useMemo<Person | undefined>(
    // users[0] is the SUPER_ADMIN, who belongs to no team — a person page
    // defaulting to them renders an empty roster. Prefer a real team member.
    () => (id ? users.find((u) => u.id === id) : undefined) ?? users.find((u) => u.team) ?? users[0],
    [users, id],
  );

  /** Everyone on this person's team — drives the header's member and active counts. */
  const teammates = useMemo(() => {
    const teamId = person?.team?.id;
    return teamId ? users.filter((u) => u.team?.id === teamId) : [];
  }, [users, person]);
  const activeCount = useMemo(() => teammates.filter(isActive).length, [teammates]);

  /** Reporting manager: the manager on the same team who isn't this person. */
  const reportsTo = useMemo(
    () => teammates.find((u) => u.id !== person?.id && u.role.endsWith("MANAGER"))?.name,
    [teammates, person],
  );

  const status = STATUS[isActive(person) ? "active" : "invite_sent"];
  const perms = permissionsFor(person?.role);

  /** The eight label/value rows, in frame order. */
  const details: [string, string][] = [
    ["Full Name", person?.name ?? (isLoading ? "Loading…" : DASH)],
    ["Join Date", ddmmyyyy(person?.createdAt)],
    ["Contact Number", person?.phone ?? DASH],
    ["Email Address", person?.email ?? DASH],
    // No employment-type or date-of-birth column reaches this client, so both
    // stay blank rather than showing a value that isn't on record.
    ["Employment Type", DASH],
    ["Assign As", seniority(person?.role)],
    ["Reporting Manager", reportsTo ?? DASH],
    ["Birth Date", DASH],
  ];

  return (
    <Screen height={CANVAS_H} background={PAGE} scroll>
      {/* -------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={16} color={BACK_ICON} />
      </Pressable>
      <Txt
        x={72} y={28} w={222} size={20} weight="medium" font="inter"
        color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Team Management
      </Txt>

      {/* ======================= Card 1 — team + person ======================= */}
      <Abs
        x={20} y={106} w={335} h={287} radius={24}
        bg={GLASS_55} border={BORDER_75} borderWidth={1}
        style={styles.cardShadow}
      />

      {/* Team context row */}
      <LinearGradient
        colors={["#c8d2ffcc", "#dccdffcc"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.teamTile}
      >
        <Feather name="users" size={18} color={AVATAR_INK} />
      </LinearGradient>
      <Txt
        x={97} y={131} w={134} size={14} weight="semibold" font="inter"
        color={INK} lineHeight={20} numberOfLines={1}
      >
        {person?.team?.name ?? (isLoading ? "Loading…" : DASH)}
      </Txt>
      <Txt x={97} y={151} w={134} size={12} font="inter" color={SUB} lineHeight={16}>
        {`${teammates.length} Members`}
      </Txt>

      <Abs
        x={243} y={136} w={91} h={26} radius={9999}
        bg={STATUS.active.fill} border={STATUS.active.line} borderWidth={1}
      >
        <Abs x={12} y={9} w={6} h={6} radius={9999} bg={STATUS.active.dot} />
        <Txt
          x={24} y={4} w={53} size={12} weight="medium" font="inter"
          color={STATUS.active.ink} lineHeight={16}
        >
          {`${activeCount} Active`}
        </Txt>
      </Abs>

      {/* Horizontal Divider */}
      <Abs x={41} y={191} w={293} h={1} bg={DIVIDER} />

      {/* Person row */}
      <Abs
        x={37} y={208} w={301} h={82} radius={40}
        bg={GLASS_50} border={BORDER_60} borderWidth={1}
        style={styles.rowShadow}
      >
        {person?.avatarUrl ? (
          <Image source={{ uri: person.avatarUrl }} style={styles.personAvatar} />
        ) : (
          <View style={[styles.personAvatar, { backgroundColor: AVATAR_FILL }]} />
        )}

        <Txt
          x={76} y={12} w={88} size={14} weight="semibold" font="inter"
          color={INK} lineHeight={20} numberOfLines={2}
        >
          {person?.name ?? (isLoading ? "Loading…" : DASH)}
        </Txt>
        <Txt x={76} y={52} w={88} size={12} font="inter" color={SUB} lineHeight={16}>
          {seniority(person?.role)}
        </Txt>

        {/* Status pill */}
        <Abs
          x={176} y={27} w={status.w} h={26} radius={9999}
          bg={status.fill} border={status.line} borderWidth={1}
        >
          <Abs x={12} y={9} w={6} h={6} radius={9999} bg={status.dot} />
          <Txt
            x={24} y={4} w={status.textW} size={12} weight="medium" font="inter"
            color={status.ink} lineHeight={16} numberOfLines={1}
          >
            {status.label}
          </Txt>
        </Abs>

        {/* Row actions — inert until the actions sheet lands (a push with no file is silent) */}
        <Pressable style={({ pressed }) => [styles.kebab, pressed && styles.pressed]}>
          <Feather name="more-vertical" size={16} color={KEBAB_INK} />
        </Pressable>
      </Abs>

      {/* Attendance & Leaves */}
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/people/person-attendance",
            params: { id: person?.id ?? "" },
          })
        }
        style={({ pressed }) => [styles.attendance, pressed && styles.pressed]}
      >
        <Abs x={16} y={16} w={36} h={36} radius={32} bg={TILE} center>
          <Feather name="clipboard" size={16} color={TILE_INK} />
        </Abs>
        <Txt
          x={64} y={24} w={142} size={14} weight="medium" font="inter"
          color={INK} lineHeight={20} align="center"
        >
          Attendance & Leaves
        </Txt>
        <Abs x={265.89} y={25} w={18} h={18} center>
          <Feather name="chevron-right" size={18} color={KEBAB_INK} />
        </Abs>
      </Pressable>

      {/* ==================== Card 2 — Detailed Information =================== */}
      <Abs
        x={20} y={409} w={335} h={410} radius={24}
        bg={GLASS_55} border={BORDER_75} borderWidth={1}
        style={styles.cardShadow}
      />

      <Txt
        x={41} y={430} w={138} size={14} weight="semibold" font="inter"
        color={INK} lineHeight={20}
      >
        Detailed Information
      </Txt>
      {/* Inert until the add-information sheet lands */}
      <Pressable
        style={({ pressed }) => [styles.addInfo, pressed && styles.pressed]}
      >
        <Abs x={12} y={8} w={12} h={12} center>
          <Feather name="plus" size={12} color={CTA_INK} />
        </Abs>
        <Txt
          x={28} y={6} w={93} size={12} weight="medium" font="inter"
          color={CTA_INK} lineHeight={16} align="center"
        >
          Add Information
        </Txt>
      </Pressable>

      <Abs x={41} y={470} w={293} h={1} bg={DIVIDER} />

      {details.map(([label, value], i) => (
        <View key={label}>
          <Txt
            x={ROW_X} y={DETAIL_Y + i * DETAIL_STEP} w={128} size={12}
            font="inter" color={SUB} lineHeight={16}
          >
            {label}
          </Txt>
          <Txt
            x={VALUE_X} y={DETAIL_Y + i * DETAIL_STEP} w={VALUE_W} size={12}
            weight="medium" font="inter" color={INK} lineHeight={16}
            align="right" numberOfLines={1}
          >
            {value}
          </Txt>
          {/* HorizontalBorder — every row but the last */}
          {i < details.length - 1 ? (
            <Abs x={ROW_X} y={DETAIL_RULE_Y + i * DETAIL_STEP} w={ROW_W} h={1} bg={HAIRLINE} />
          ) : null}
        </View>
      ))}

      {/* ===================== Card 3 — Access Permission ===================== */}
      <Abs
        x={20} y={835} w={335} h={277} radius={24}
        bg={GLASS_55} border={BORDER_75} borderWidth={1}
        style={styles.cardShadow}
      />

      <Txt
        x={41} y={856} w={129} size={14} weight="semibold" font="inter"
        color={INK} lineHeight={20}
      >
        Access Permission
      </Txt>
      {/* Inert until the add-permissions sheet lands */}
      <Pressable
        style={({ pressed }) => [styles.addPerms, pressed && styles.pressed]}
      >
        <Abs x={12} y={8} w={12} h={12} center>
          <Feather name="plus" size={12} color={CTA_INK} />
        </Abs>
        <Txt
          x={28} y={6} w={97} size={12} weight="medium" font="inter"
          color={CTA_INK} lineHeight={16} align="center"
        >
          Add Permissions
        </Txt>
      </Pressable>

      <Abs x={41} y={896} w={293} h={1} bg={DIVIDER} />

      {PERMS.map((p, i) => (
        <View key={p.label}>
          <Abs x={p.tileX} y={p.tileY} w={p.tileW} h={32} radius={32} bg={TILE} center>
            <Feather name={p.icon} size={14} color={TILE_INK} />
          </Abs>
          <Txt
            x={p.textX} y={p.textY} w={p.textW} size={14} weight="medium"
            font="inter" color={INK} lineHeight={20}
          >
            {p.label}
          </Txt>
          <Toggle x={p.switchX} y={p.switchY} w={p.switchW} on={perms[i]} />
          {p.ruleY ? <Abs x={ROW_X} y={p.ruleY} w={ROW_W} h={1} bg={HAIRLINE} /> : null}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },

  backButton: {
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

  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  rowShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  knobShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  // 44x44 gradient disc at (41,127) with the frame's 1pt #a0aaff/30 hairline
  teamTile: {
    position: "absolute",
    left: 41,
    top: 127,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(160,170,255,0.3)",
  },

  // 48x48 photo at (54,225) — row-relative, inside the 301x82 person row
  personAvatar: {
    position: "absolute",
    left: 16,
    top: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  kebab: {
    position: "absolute",
    left: 263,
    top: 32,
    width: 20,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  attendance: {
    position: "absolute",
    left: 37,
    top: 306,
    width: 301,
    height: 70,
    borderRadius: 40,
    backgroundColor: GLASS_50,
    borderWidth: 1,
    borderColor: BORDER_60,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  addInfo: {
    position: "absolute",
    left: 201,
    top: 426,
    width: 133,
    height: 28,
    borderRadius: 9999,
    backgroundColor: CTA_FILL,
  },
  addPerms: {
    position: "absolute",
    left: 197,
    top: 852,
    width: 137,
    height: 28,
    borderRadius: 9999,
    backgroundColor: CTA_FILL,
  },
});
