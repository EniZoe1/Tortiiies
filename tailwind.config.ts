import type { Config } from "tailwindcss";

/**
 * Design tokens are CSS variables (see globals.css) holding space-separated RGB
 * channels, so every token supports Tailwind's opacity modifier (bg-gold/20)
 * and swaps instantly between light and dark.
 */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        raised: token("raised"),
        fg: token("fg"),
        muted: token("muted"),
        line: token("line"),
        gold: {
          DEFAULT: token("gold"), // decorative gold (borders, fills)
          text: token("gold-text"), // AA-safe gold for text on the current theme
          soft: token("gold-soft"),
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        luxe: "0.28em",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
