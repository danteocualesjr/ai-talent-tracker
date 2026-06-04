import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        signal: {
          DEFAULT: "hsl(var(--signal))",
          foreground: "hsl(var(--signal-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft:
          "0 2px 8px -2px hsl(var(--foreground) / 0.06), 0 12px 32px -12px hsl(var(--foreground) / 0.1)",
        glow: "0 0 80px -20px hsl(var(--signal) / 0.35)",
        ring: "0 0 0 1px hsl(var(--border) / 0.8)",
        "ring-strong": "0 0 0 1px hsl(var(--foreground) / 0.1)",
        pop:
          "0 0 0 1px hsl(var(--border) / 0.6), 0 4px 8px -2px hsl(var(--foreground) / 0.06), 0 16px 40px -8px hsl(var(--foreground) / 0.14)",
      },
      keyframes: {
        "slide-in-from-top": {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-in": "slide-in-from-top 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
