import type { Config } from "tailwindcss";

/**
 * Tokens are extracted verbatim from the Figma file `ttAJzr0TmTh9UipWolxLOE`
 * (page "Admin dashboard", canonical frame 7917:13074 "yunto dashboard").
 * Do not invent values — every color/size here traces to a real node.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Wix Madefor Display", "Outfit", "sans-serif"],
        inter: ["Inter", "Outfit", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#000000",
          90: "rgba(0,0,0,0.9)",
          80: "rgba(0,0,0,0.8)",
          70: "rgba(0,0,0,0.7)",
          60: "rgba(0,0,0,0.6)",
        },
        navpill: "#181819", // active sidebar pill
        slate900: "#111827",
        muted: "#8D8D8D",
        line: "#D9D9D9", // dividers + unfilled progress track
        seg: {
          new: "#A9CEE6", // leads/campaigns "new" (blue)
          contacted: "#94CE9D", // "contacted" (green)
          converted: "#EEC589", // "converted" (amber)
        },
        revenue: {
          bar: "#A679F4",
          barAlt: "#AD56E3",
        },
        chip: "#F4F5F5",
      },
      backgroundImage: {
        // page background
        "page-grad":
          "linear-gradient(135deg, #D8D2FF 0%, #FAF7FF 52%, #E1E1E1 100%)",
        // top navigation bar
        "nav-grad":
          "linear-gradient(90deg, #DCD7FF 0%, #F3F1F6 50%, #EDEBEF 100%)",
        // Top Creators card (lime -> lavender)
        "creators-grad": "linear-gradient(135deg, #F1FFC3 0%, #C8B3ED 100%)",
        // Top Agencies card (lavender -> white)
        "agencies-grad": "linear-gradient(160deg, #D2C6E5 0%, #FEFEFE 100%)",
      },
      borderRadius: {
        card: "24px",
        pill: "28px",
        inner: "12px",
        chip: "6.22px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
