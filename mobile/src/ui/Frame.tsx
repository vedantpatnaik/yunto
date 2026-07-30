import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, DESIGN_WIDTH, fonts } from "../theme";

/**
 * Pixel-faithful layout primitives.
 *
 * Every Figma mobile frame is authored on a 375pt canvas with absolutely
 * positioned children. Rather than reflowing 281 screens into flexbox by hand
 * — which loses fidelity and cannot be done mechanically — screens declare the
 * same absolute coordinates the design uses and this layer scales the whole
 * canvas to the device width. One multiplier, applied once, keeps every screen
 * proportionally identical to the design on any handset.
 */

const ScaleContext = createContext(1);
export const useScale = () => useContext(ScaleContext);

/** Screen-width scale factor: 1 on a 375pt device, larger on wider phones. */
export function getScale(): number {
  const w = Dimensions.get("window").width;
  return w / DESIGN_WIDTH;
}

export interface ScreenProps {
  children: ReactNode;
  /** Design-space height of the frame; enables scrolling for tall screens. */
  height?: number;
  /** Frame background. Defaults to white, as most Figma frames are. */
  background?: string;
  /** Set false for frames that draw their own status-bar area. */
  safeTop?: boolean;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Root of a design-traced screen. Establishes the scaled 375pt canvas so any
 * `<Abs>` inside can use raw Figma coordinates.
 */
export function Screen({
  children,
  height,
  background = colors.white,
  safeTop = true,
  scroll,
  style,
}: ScreenProps) {
  const scale = getScale();
  const Wrapper = safeTop ? SafeAreaView : View;

  // Tall frames (a 375x1524 scrolling design, say) exceed the viewport, so they
  // scroll in design space and the canvas is sized to the design height.
  const canvas = (
    <ScaleContext.Provider value={scale}>
      <View
        style={[
          styles.canvas,
          { width: DESIGN_WIDTH * scale, transform: [{ scale }] },
          height ? { height } : styles.fill,
          style,
        ]}
      >
        {children}
      </View>
    </ScaleContext.Provider>
  );

  return (
    <Wrapper style={[styles.root, { backgroundColor: background }]}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={height ? { height: height * scale } : undefined}
        >
          {canvas}
        </ScrollView>
      ) : (
        canvas
      )}
    </Wrapper>
  );
}

export interface AbsProps {
  /** Frame-relative coordinates, straight from the Figma spec. */
  x?: number;
  y?: number;
  w?: number | "auto";
  h?: number | "auto";
  bg?: string;
  radius?: number;
  /** Uniform border; matches Figma's stroke on a rectangle. */
  border?: string;
  borderWidth?: number;
  opacity?: number;
  center?: boolean;
  row?: boolean;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * An absolutely positioned box — the direct analogue of a Figma FRAME or
 * RECTANGLE node. `x`/`y` are the node's offset within its parent frame.
 */
export function Abs({
  x = 0,
  y = 0,
  w,
  h,
  bg,
  radius,
  border,
  borderWidth,
  opacity,
  center,
  row,
  gap,
  style,
  children,
}: AbsProps) {
  return (
    <View
      style={[
        styles.abs,
        { left: x, top: y },
        w !== undefined && w !== "auto" ? { width: w } : null,
        h !== undefined && h !== "auto" ? { height: h } : null,
        bg ? { backgroundColor: bg } : null,
        radius !== undefined ? { borderRadius: radius } : null,
        border ? { borderColor: border, borderWidth: borderWidth ?? 1 } : null,
        opacity !== undefined ? { opacity } : null,
        center ? styles.center : null,
        row ? styles.row : null,
        gap !== undefined ? { gap } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export interface TxtProps {
  children: ReactNode;
  /** Figma TEXT node properties. */
  size?: number;
  weight?: "light" | "regular" | "medium" | "semibold" | "bold";
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  align?: "left" | "center" | "right";
  numberOfLines?: number;
  /** Position the text node absolutely, as Figma does. */
  x?: number;
  y?: number;
  w?: number;
  font?: "outfit" | "inter";
  style?: StyleProp<TextStyle>;
}

const WEIGHTS = {
  light: fonts.light,
  regular: fonts.regular,
  medium: fonts.medium,
  semibold: fonts.semibold,
  bold: fonts.bold,
} as const;

/** A Figma TEXT node. Absolute when x/y are supplied, inline otherwise. */
export function Txt({
  children,
  size = 14,
  weight = "regular",
  color = colors.ink,
  lineHeight,
  letterSpacing,
  align,
  numberOfLines,
  x,
  y,
  w,
  font = "outfit",
  style,
}: TxtProps) {
  const family =
    font === "inter"
      ? weight === "medium" || weight === "semibold" || weight === "bold"
        ? fonts.interMedium
        : fonts.inter
      : WEIGHTS[weight];

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        { fontFamily: family, fontSize: size, color },
        lineHeight ? { lineHeight } : null,
        letterSpacing ? { letterSpacing } : null,
        align ? { textAlign: align } : null,
        x !== undefined || y !== undefined
          ? { position: "absolute", left: x ?? 0, top: y ?? 0 }
          : null,
        w !== undefined ? { width: w } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Circular avatar placeholder — the design uses gradient rings throughout. */
export function Ring({
  x, y, size = 40, colorA = "#F1FFC3", colorB = "#C8B3ED",
}: { x?: number; y?: number; size?: number; colorA?: string; colorB?: string }) {
  return (
    <Abs x={x} y={y} w={size} h={size} radius={size / 2} bg={colorA}>
      <View
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: size * 0.62,
          height: size * 0.62,
          borderRadius: size / 2,
          backgroundColor: colorB,
          opacity: 0.85,
        }}
      />
    </Abs>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // Scale from the top-left so design coordinates stay valid after transform.
  canvas: { position: "relative", transformOrigin: "top left" },
  fill: { flex: 1 },
  abs: { position: "absolute" },
  center: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center" },
});
