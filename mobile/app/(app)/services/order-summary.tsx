import { useState } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { gradients } from "../../../src/theme";
import {
  inr,
  useCalendar,
  useCreators,
  useRemove,
  type CalendarItem,
  type Creator,
} from "../../../src/api/hooks";

/**
 * Services — "Your Order Details" (Figma 1887:3974, 375x812).
 *
 * The confirmed-booking summary that closes the shoot-booking flow: the two
 * creators booked for the shoot — the editor and the videographer — fanned as a
 * pair of tilted cards, each carrying the photo, the name/city, the role line
 * and a white panel with the booked date, time slot and package. This is the
 * only frame in the file covering the confirmed state and it is an 812-era
 * frame, so the geometry, copy, type sizes and card tints below are the spec's
 * verbatim while the chrome (warm backdrop, glass header, dark CTA, soft
 * shadows) is restyled to match the 875-era services screens it is reached
 * from — see editors.tsx / videographers.tsx.
 *
 * Rotated nodes are reported by the extractor as axis-aligned bounding boxes,
 * so each card's true rect is recovered from its AABB (w·cosθ + h·sinθ, …) and
 * every child is expressed in the card's own unrotated space; the numbers in
 * CARD/PANEL below are exactly that de-rotation of the spec's coordinates.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 812;

/** Figma reports rotation in radians (0.14 rad on both cards, mirrored). */
const TILT = "8.02deg";
const COUNTER_TILT = "-8.02deg";

/** True (unrotated) card box behind the spec's 232.4 x 323.71 AABBs. */
const CARD_W = 192.47;
const CARD_H = 299.8;

/** Card-local layout, shared by both cards — they are one component in Figma. */
const PHOTO = { x: 6.38, y: 5.8, w: 179.75, h: 149.01, r: 4.64 };
const CLOSE = { x: 161.16, y: 6.2, size: 24 };
const NAME_ROW = { y: 161.79, h: 13.33 };
const ROLE = { x: 5.15, y: 176.31, w: 182.13 };
const PANEL = { x: 6.32, y: 197.78, w: 179.19, h: 81.85, r: 5.6 };
/** Panel-local rows: label on the left, pill on the right. */
const HEAD_Y = 8.38;
const DATE = { x: 11.46, y: 32.85, w: 43 };
const SLOT = { x: 83.91, y: 30.79, w: 72.79, h: 15.38, r: 9.8 };
const PKG = { x: 10.75, y: 58.76, w: 35 };
const PRICE = { x: 83.55, y: 56.71, w: 83.3, h: 15.37, r: 9.8 };

/** The fan: editor on the left leaning out, videographer on the right. */
const SLOT_LEFT = { x: 22.97, y: 196.25, rotate: COUNTER_TILT, counter: TILT };
const SLOT_RIGHT = { x: 158.1, y: 195.96, rotate: TILT, counter: COUNTER_TILT };

/* --------------------------- colour tokens -------------------------------- */
const INK = "#1D1D1F";
const SUBTLE = "#6E6E73";
const DARK = "#312B28";
const GLASS_65 = "rgba(255,255,255,0.65)";
const BORDER_90 = "rgba(255,255,255,0.9)";

/** Card tints and the pill fill are the spec's, verbatim. */
const EDITOR_TINT = "#C3CFFF";
const VIDEOGRAPHER_TINT = "#CDF8F6";
const PILL = "#C3CFFF";

const PHOTO_FILL = [gradients.creators[0], gradients.creators[1]] as const;

/* ------------------------------ formatting -------------------------------- */
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");
const hour12 = (n: number) => pad(n % 12 === 0 ? 12 : n % 12);

/** "Sat 3 June" — the spec's date format. */
const dateLabel = (iso: string) => {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

/** "01:00-02:00pm" — the booked hour and the hour after it. */
const slotLabel = (iso: string) => {
  const d = new Date(iso);
  const end = (d.getHours() + 1) % 24;
  return `${hour12(d.getHours())}:${pad(d.getMinutes())}-${hour12(end)}:${pad(
    d.getMinutes(),
  )}${end >= 12 ? "pm" : "am"}`;
};

/** The rate card the rest of the services flow prices bookings with. */
const packagePrice = (c: Creator) => `₹${inr(Math.round(c.cpv * c.avgViews))}`;

/* -------------------------------- backdrop -------------------------------- */
/** The services-flow frame fill: a warm vertical base plus four soft glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="pink" cx="285" cy="503" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="blue" cx="90" cy="341" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="gold" cx="292.5" cy="146" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="haze" cx="75" cy="81" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#haze)" />
    </Svg>
  );
}

/* ------------------------------ booking card ------------------------------ */
interface BookingCardProps {
  /** Slot geometry — the de-rotated spec rect plus its fan angle. */
  x: number;
  y: number;
  rotate: string;
  /** The close button is counter-rotated in Figma so it stays upright. */
  counter: string;
  tint: string;
  name: string;
  city: string;
  role: string;
  heading: string;
  date: string;
  slot: string;
  price: string;
  photo?: string;
  /** Tapping a card brings it to the front of the fan. */
  onPress: () => void;
  onCancel: () => void;
}

function BookingCard({
  x, y, rotate, counter, tint, name, city, role,
  heading, date, slot, price, photo, onPress, onCancel,
}: BookingCardProps) {
  return (
    <Pressable onPress={onPress} style={{ position: "absolute", left: x, top: y }}>
      <Abs
        x={0}
        y={0}
        w={CARD_W}
        h={CARD_H}
        radius={6.96}
        bg={tint}
        style={[styles.card, { transform: [{ rotate }] }]}
      >
        <Abs
          x={PHOTO.x}
          y={PHOTO.y}
          w={PHOTO.w}
          h={PHOTO.h}
          radius={PHOTO.r}
          border="#000000"
          borderWidth={0.58}
          style={styles.clip}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: PHOTO.w, height: PHOTO.h }} />
          ) : (
            <LinearGradient
              colors={PHOTO_FILL}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: PHOTO.w, height: PHOTO.h }}
            />
          )}
        </Abs>

        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [
            styles.close,
            { transform: [{ rotate: counter }] },
            pressed && styles.pressed,
          ]}
        >
          <Feather name="x" size={12} color={INK} />
        </Pressable>

        <Abs x={0} y={NAME_ROW.y} w={CARD_W} h={NAME_ROW.h} row center gap={2}>
          <Txt size={11.6} weight="semibold" font="inter" color={INK} lineHeight={16.24} numberOfLines={1}>
            {name}
          </Txt>
          <Txt size={5.92} font="inter" color={INK} lineHeight={9.28}>
            {"📍"}
          </Txt>
          <Txt size={7.54} weight="medium" font="inter" color={SUBTLE} lineHeight={16.24} numberOfLines={1}>
            {city}
          </Txt>
        </Abs>

        <Txt
          x={ROLE.x}
          y={ROLE.y}
          w={ROLE.w}
          size={6.96}
          weight="medium"
          font="inter"
          color={SUBTLE}
          lineHeight={16.24}
          align="center"
          numberOfLines={1}
        >
          {role}
        </Txt>

        <Abs x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} radius={PANEL.r} bg="#FFFFFF" style={styles.clip}>
          <Txt
            x={0}
            y={HEAD_Y}
            w={PANEL.w}
            size={9.8}
            font="inter"
            color={SUBTLE}
            lineHeight={12.25}
            align="center"
            numberOfLines={1}
          >
            {heading}
          </Txt>

          <Txt x={DATE.x} y={DATE.y} w={DATE.w} size={8.4} weight="medium" font="inter" color={INK} lineHeight={10.5} numberOfLines={1}>
            {date}
          </Txt>

          {/* Icon + label are the spec's 9.8pt glyph, 2.8 gap and 53pt text run. */}
          <Abs x={SLOT.x} y={SLOT.y} w={SLOT.w} h={SLOT.h} radius={SLOT.r} bg={PILL}>
            <Abs x={3.6} y={2.79} w={9.8} h={9.8} center>
              <Feather name="clock" size={9.8} color={INK} />
            </Abs>
            <Txt x={16.2} y={2.09} w={53} size={7.14} font="inter" color={INK} lineHeight={11.2} numberOfLines={1}>
              {slot}
            </Txt>
          </Abs>

          <Txt x={PKG.x} y={PKG.y} w={PKG.w} size={8.4} weight="medium" font="inter" color={INK} lineHeight={10.5}>
            Package
          </Txt>

          <Abs x={PRICE.x} y={PRICE.y} w={PRICE.w} h={PRICE.h} radius={PRICE.r} bg={PILL}>
            <Txt
              x={5}
              y={2.09}
              w={PRICE.w - 10}
              size={7.14}
              font="inter"
              color={INK}
              lineHeight={11.2}
              align="center"
              numberOfLines={1}
            >
              {price}
            </Txt>
          </Abs>
        </Abs>
      </Abs>
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function OrderSummary() {
  const router = useRouter();
  const params = useLocalSearchParams<{ editor?: string; videographer?: string }>();

  const { data: creators = [] } = useCreators();
  const { data: calendar = [] } = useCalendar();
  const cancel = useRemove("calendar");

  /** The booking flow passes the two creators it booked; fall back to the pool. */
  const pick = (id: string | undefined, fallback: number): Creator | undefined =>
    creators.find((c) => c.id === id) ?? creators[fallback];
  const editor = pick(params.editor, 0);
  const videographer = pick(params.videographer, 1);

  const bookingFor = (c: Creator | undefined): CalendarItem | undefined =>
    c ? calendar.find((k) => k.creatorId === c.id) : undefined;
  const editorBooking = bookingFor(editor);
  const videographerBooking = bookingFor(videographer);

  /** Tapping the back card brings it forward; the videographer starts on top. */
  const [front, setFront] = useState(1);
  const order = front === 1 ? [0, 1] : [1, 0];

  const firstName = (c: Creator | undefined, fallback: string) =>
    c ? c.name.split(" ")[0] : fallback;

  const cards = [
    {
      ...SLOT_LEFT,
      tint: EDITOR_TINT,
      name: firstName(editor, "Karan"),
      city: editor?.location ?? "Delhi",
      role: `${editor?.niche ?? "Fashion & Lifestyle"} Editor | 6 Yrs Exp.`,
      heading: "Your details for the editor",
      date: editorBooking ? dateLabel(editorBooking.scheduledAt) : "Sat 3 June",
      slot: editorBooking ? slotLabel(editorBooking.scheduledAt) : "01:00-02:00pm",
      price: `${editor ? packagePrice(editor) : "₹5000"} | 2 Hrs Shoot`,
      photo: editor?.avatarUrl,
      onCancel: () => {
        if (editorBooking) cancel.mutate(editorBooking.id);
      },
    },
    {
      ...SLOT_RIGHT,
      tint: VIDEOGRAPHER_TINT,
      name: firstName(videographer, "Sarthak"),
      city: videographer?.location ?? "Delhi",
      role: `${videographer?.niche ?? "Fashion & Lifestyle"} Videographer | 6 Yrs Exp.`,
      heading: "Your details for the videographer",
      date: videographerBooking ? dateLabel(videographerBooking.scheduledAt) : "Sat 3 June",
      slot: videographerBooking ? slotLabel(videographerBooking.scheduledAt) : "01:00-02:00pm",
      price: `${videographer ? packagePrice(videographer) : "₹2000"} | Minimal Style`,
      photo: videographer?.avatarUrl,
      onCancel: () => {
        if (videographerBooking) cancel.mutate(videographerBooking.id);
      },
    },
  ];

  return (
    <Screen height={FRAME_H} background="#F7F0E4">
      <Backdrop />

      {/* ------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={18} color={INK} />
      </Pressable>

      <Txt x={60} y={68} w={133} size={16} weight="medium" color={INK} lineHeight={20} align="center">
        Your Order Details
      </Txt>

      {/* ------------------------------ Booking fan -------------------------- */}
      {order.map((i) => {
        const c = cards[i];
        return (
          <BookingCard
            key={c.heading}
            x={c.x}
            y={c.y}
            rotate={c.rotate}
            counter={c.counter}
            tint={c.tint}
            name={c.name}
            city={c.city}
            role={c.role}
            heading={c.heading}
            date={c.date}
            slot={c.slot}
            price={c.price}
            photo={c.photo}
            onPress={() => setFront(i)}
            onCancel={c.onCancel}
          />
        );
      })}

      {/* --------------------------------- CTA ------------------------------- */}
      <Pressable
        onPress={() => router.push("/")}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <Txt x={75} y={16} w={170} size={15} weight="semibold" color="#FFFFFF" lineHeight={18.9} align="center">
          Done
        </Txt>
      </Pressable>

      {/*
       * Spec: Urbanist 600 / 14.35 / #111827, one line in a 327pt box. Urbanist
       * is not in the bundle; Inter runs ~356pt at this size and wrapped the
       * caption onto a second line, so it takes the app's Outfit face (~326pt)
       * in a box with a little slack, which keeps it on the single line the
       * design shows.
       */}
      <Txt x={30} y={689} w={333} size={14.35} weight="semibold" color={INK} lineHeight={20.09}>
        You can also see your bookings in Add -ons section
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },

  backButton: {
    position: "absolute",
    left: 16,
    top: 62,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  close: {
    position: "absolute",
    left: CLOSE.x,
    top: CLOSE.y,
    width: CLOSE.size,
    height: CLOSE.size,
    borderRadius: CLOSE.size / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  cta: {
    position: "absolute",
    left: 27,
    top: 618,
    width: 320,
    height: 51,
    borderRadius: 16,
    backgroundColor: DARK,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
