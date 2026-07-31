import { useMemo } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../../src/ui/Frame";
import { colors, gradients } from "../../../../src/theme";
import { useCalendar, useCreators, useRemove } from "../../../../src/api/hooks";

/**
 * Services — order summary, videographer slot empty (Figma 1887:4246, 375x812).
 *
 * The state the order lands in once the videographer booking is cancelled: the
 * editor card survives (tilted, with its own cancel affordance) and the
 * videographer's place in the stack becomes an outlined empty slot carrying an
 * "Add Videographer" CTA that re-fills it. Coordinates below are raw frame
 * coordinates from the spec; <Screen> scales the 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 812;

/**
 * The editor card is authored rotated (Figma reports radians: -0.14 = -8.02°),
 * so the spec's x/y/w/h for it and everything inside are axis-aligned bounding
 * boxes. The card is laid out here at its true un-rotated box and rotated as a
 * whole, with children carrying their card-local coordinates — that is the only
 * way the tilt reads the same as the design instead of shearing the contents.
 */
const CARD = { x: 22.98, y: 196.25, w: 192.45, h: 299.79 } as const;
const CARD_ROTATION = "-8.02deg";

/* --------------------------- spec colour tokens --------------------------- */
const PAGE_BG = "#e9ffb6";
/** Editor card + its inner detail pills. */
const PERIWINKLE = "#c3cfff";
const DONE_BG = "#ffbcb8";
const DONE_INK = "#333333";
const SUBTLE_INK = "#4b5563";

/* ------------------------------- formatting ------------------------------- */
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");
/** "01:00" — 12-hour clock, zero padded, matching the design's pill. */
const clock12 = (d: Date) => `${pad(((d.getHours() + 11) % 12) + 1)}:${pad(d.getMinutes())}`;

/** "Sat 3 June" */
const dayLabel = (d: Date) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;

/** "01:00-02:00pm" — the booked hour, suffixed once like the spec. */
const slotLabel = (d: Date) => {
  const end = new Date(d.getTime() + 60 * 60 * 1000);
  return `${clock12(d)}-${clock12(end)}${end.getHours() >= 12 ? "pm" : "am"}`;
};

/* --------------------------------- screen --------------------------------- */
export default function OrderSummaryPartial() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: creators = [] } = useCreators();
  const { data: calendar = [] } = useCalendar();
  const cancelBooking = useRemove("calendar");

  /** The editor still on the order — addressed by id, else the first on file. */
  const editor = useMemo(
    () => creators.find((c) => c.id === id) ?? creators[0],
    [creators, id],
  );

  /** That editor's scheduled slot drives the date and time chips. */
  const booking = useMemo(
    () => (editor ? calendar.find((c) => c.creatorId === editor.id) : undefined),
    [calendar, editor],
  );
  const bookedAt = booking ? new Date(booking.scheduledAt) : undefined;

  const editorName = editor ? editor.name.split(" ")[0] : "Karan";
  const editorCity = editor?.location ?? "Delhi";
  const editorNiche = editor?.niche ?? "Fashion & Lifestyle";

  const dropEditor = () => {
    if (booking) cancelBooking.mutate(booking.id);
  };

  return (
    <Screen height={FRAME_H} background={PAGE_BG}>
      {/* ------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.headerBack, pressed && styles.pressed]}
      >
        <Abs x={6} y={6} w={20} h={20} center>
          <Feather name="arrow-left" size={20} color={colors.ink} />
        </Abs>
      </Pressable>

      <Txt
        x={60}
        y={68}
        w={133}
        size={16}
        weight="medium"
        color={colors.ink}
        lineHeight={20}
        align="center"
      >
        Your Order Details
      </Txt>

      {/* ------------------- Empty slot left by the videographer -------------- */}
      <Pressable
        onPress={() => router.push("/services/videographers" as never)}
        style={({ pressed }) => [styles.emptySlot, pressed && styles.pressed]}
      >
        <Abs x={109.72} y={118.86} w={32} h={32} radius={16} bg={colors.white} center>
          <Feather name="plus" size={20} color={colors.ink} />
        </Abs>
        <Txt
          x={71.72}
          y={157.86}
          w={108}
          size={12}
          weight="medium"
          color={colors.ink}
          lineHeight={15}
          align="center"
        >
          Add Videographer
        </Txt>
      </Pressable>

      {/* ---------------------------- Editor booking -------------------------- */}
      <Abs
        x={CARD.x}
        y={CARD.y}
        w={CARD.w}
        h={CARD.h}
        radius={6.96}
        bg={PERIWINKLE}
        style={styles.editorCard}
      >
        <Abs
          x={6.37}
          y={5.8}
          w={179.75}
          h={149}
          radius={4.64}
          border={colors.ink}
          borderWidth={0.58}
          style={styles.clip}
        >
          {editor?.avatarUrl ? (
            <Image source={{ uri: editor.avatarUrl }} style={styles.photo} />
          ) : (
            <LinearGradient
              colors={[gradients.creators[0], gradients.creators[1]] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.photo}
            />
          )}
        </Abs>

        {/* Cancel the remaining booking — the same affordance that emptied the
            videographer slot behind this card. */}
        <Pressable
          onPress={dropEditor}
          style={({ pressed }) => [styles.cancelDot, pressed && styles.pressed]}
        >
          <Abs x={0} y={0} w={24} h={24} center>
            <Feather name="x" size={17} color={colors.ink} />
          </Abs>
        </Pressable>

        <Txt
          x={57.35}
          y={161.79}
          w={47.56}
          size={11.6}
          weight="semibold"
          color={colors.slate900}
          lineHeight={16.24}
          align="center"
          numberOfLines={1}
        >
          {editorName}
        </Txt>
        <Txt x={104.91} y={161.79} w={6.37} size={5.92} font="inter" color={colors.ink} lineHeight={9.28}>
          {"📍"}
        </Txt>
        {/* Wider than the spec's "Delhi" box (23.2) so live city names render
            whole instead of ellipsizing; left-aligned, so short names still sit
            where the sample does. */}
        <Txt
          x={111.29}
          y={161.79}
          w={58}
          size={7.54}
          weight="medium"
          color={SUBTLE_INK}
          lineHeight={16.24}
          numberOfLines={1}
        >
          {editorCity}
        </Txt>

        <Txt
          x={5.15}
          y={176.31}
          w={182.12}
          size={6.96}
          weight="medium"
          font="inter"
          color={colors.ink70}
          lineHeight={16.24}
          align="center"
          numberOfLines={1}
        >
          {`${editorNiche} Editor | 6 Yrs Exp.`}
        </Txt>

        {/* Booking detail panel */}
        <Abs x={6.3} y={197.77} w={179.18} h={81.84} radius={5.6} bg={colors.white} />

        <Txt
          x={36.41}
          y={206.16}
          w={118.01}
          size={9.8}
          font="inter"
          color={colors.ink80}
          lineHeight={12.25}
        >
          Your details for the editor
        </Txt>

        <Txt
          x={17.76}
          y={230.63}
          w={43}
          size={8.4}
          weight="medium"
          font="inter"
          color={colors.ink}
          lineHeight={10.5}
          numberOfLines={1}
        >
          {bookedAt ? dayLabel(bookedAt) : "Sat 3 June"}
        </Txt>

        <Abs x={90.21} y={228.57} w={72.8} h={15.37} radius={9.8} bg={PERIWINKLE} />
        <Abs x={93.81} y={231.35} w={9.8} h={9.8} center>
          <Feather name="clock" size={9} color={colors.ink} />
        </Abs>
        <Txt
          x={106.41}
          y={230.27}
          w={53}
          size={7.14}
          font="inter"
          color={colors.ink}
          lineHeight={11.2}
          numberOfLines={1}
        >
          {bookedAt ? slotLabel(bookedAt) : "01:00-02:00pm"}
        </Txt>

        <Txt
          x={17.05}
          y={256.53}
          w={35}
          size={8.4}
          weight="medium"
          font="inter"
          color={colors.ink}
          lineHeight={10.5}
        >
          Package
        </Txt>

        <Abs x={89.85} y={254.48} w={83.3} h={15.37} radius={9.8} bg={PERIWINKLE} />
        <Txt
          x={97.5}
          y={256.17}
          w={68}
          size={7.14}
          font="inter"
          color={colors.ink}
          lineHeight={11.2}
          numberOfLines={1}
        >
          {"₹5000 | 2 Hrs Shoot"}
        </Txt>
      </Abs>

      {/* -------------------------------- Done -------------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.done, pressed && styles.pressed]}
      >
        <Txt
          x={75}
          y={16}
          w={170}
          size={15}
          weight="semibold"
          color={DONE_INK}
          lineHeight={18.9}
          align="center"
        >
          Done
        </Txt>
      </Pressable>

      <Txt
        x={30}
        y={689}
        w={327}
        size={14.35}
        weight="semibold"
        color={colors.slate900}
        lineHeight={20.09}
      >
        You can also see your bookings in Add -ons section
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },
  photo: { width: 179.75, height: 149 },

  headerBack: {
    position: "absolute",
    left: 16,
    top: 62,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },

  /** Outlined stand-in where the cancelled videographer card used to sit. */
  emptySlot: {
    position: "absolute",
    left: 153,
    top: 191,
    width: 192.54,
    height: 299.83,
    borderWidth: 1.6,
    borderColor: "#000000",
    /**
     * The slot reads as a placeholder in the design: dashed, ~5pt on / 5pt off,
     * square corners. No borderRadius on purpose — iOS renders dashed borders
     * as solid the moment a radius is present, and the design's dashes run
     * straight into sharp corners anyway.
     */
    borderStyle: "dashed",
  },

  editorCard: {
    transform: [{ rotate: CARD_ROTATION }],
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 1.16,
    shadowOffset: { width: 0, height: 0.58 },
    elevation: 2,
  },
  /**
   * 24pt across in the design, and authored with a +8.02° rotation of its own so
   * it stands upright against the tilted card — hence the counter-rotation here.
   * Left/top keep the button centred on the same point as the spec's box.
   */
  cancelDot: {
    position: "absolute",
    left: 161.15,
    top: 6.19,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "8.02deg" }],
  },

  done: {
    position: "absolute",
    left: 27,
    top: 618,
    width: 320,
    height: 51,
    borderRadius: 16,
    backgroundColor: DONE_BG,
    borderWidth: 1,
    borderColor: "#000000",
    shadowColor: "#333333",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
    elevation: 3,
  },
});
