/**
 * Design tokens for the Yunto native app.
 *
 * Values are the same ones traced from Figma file ttAJzr0TmTh9UipWolxLOE that
 * the web app uses (see web/tailwind.config.js) — keep the two in sync so the
 * platforms cannot drift. Do not invent values; every entry maps to a real node.
 */

export const colors = {
  ink: "#000000",
  ink90: "rgba(0,0,0,0.9)",
  ink80: "rgba(0,0,0,0.8)",
  ink70: "rgba(0,0,0,0.7)",
  ink60: "rgba(0,0,0,0.6)",
  ink50: "rgba(0,0,0,0.5)",
  white: "#FFFFFF",
  navpill: "#181819",
  slate900: "#111827",
  muted: "#8D8D8D",
  line: "#D9D9D9",
  chip: "#F4F5F5",

  /** Pipeline segment colours (leads + campaigns progress bars). */
  segNew: "#A9CEE6",
  segContacted: "#94CE9D",
  segConverted: "#EEC589",

  revenueBar: "#A679F4",
  revenueBarAlt: "#AD56E3",

  /** Status/semantic. */
  success: "#1FB37A",
  successSoft: "#34C759",
  danger: "#E8735B",
  dangerAlt: "#FD564B",
  warning: "#EEC589",
  accent: "#7C5CFC",
  accentDeep: "#603CFF",
  brand: "#EA6135",

  /** Common surface tints used across the mobile frames. */
  surface: "#F5F5F5",
  surfaceAlt: "#FAFAFA",
  overlay: "rgba(0,0,0,0.20)",
} as const;

/** Gradient stop pairs — feed to expo-linear-gradient or a custom Svg defs. */
export const gradients = {
  page: ["#D8D2FF", "#FAF7FF", "#E1E1E1"],
  nav: ["#DCD7FF", "#F3F1F6", "#EDEBEF"],
  creators: ["#F1FFC3", "#C8B3ED"],
  agencies: ["#D2C6E5", "#FEFEFE"],
  avatarA: ["#F1FFC3", "#C8B3ED"],
  avatarB: ["#FFD6E7", "#C8B3ED"],
  avatarC: ["#C8E6FF", "#C8B3ED"],
} as const;

export const radius = {
  card: 24,
  pill: 28,
  inner: 12,
  chip: 6.22,
  full: 999,
} as const;

/**
 * Font families. The Figma file uses Outfit as the primary face with Inter and
 * Wix Madefor Display for specific blocks; these keys are the names registered
 * in app/_layout.tsx via expo-font.
 */
export const fonts = {
  regular: "Outfit_400Regular",
  medium: "Outfit_500Medium",
  semibold: "Outfit_600SemiBold",
  bold: "Outfit_700Bold",
  light: "Outfit_300Light",
  inter: "Inter_400Regular",
  interMedium: "Inter_500Medium",
} as const;

/**
 * Figma mobile frames are authored at 375pt wide. Screens are laid out with
 * absolute coordinates lifted straight from the design, so on wider handsets we
 * scale rather than reflow — this keeps 281 screens pixel-faithful without
 * hand-tuning each one.
 */
export const DESIGN_WIDTH = 375;

export type ColorToken = keyof typeof colors;
