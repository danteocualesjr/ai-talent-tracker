import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { PostHogAnalytics } from "@/components/analytics";
import { ThemeProvider } from "@/components/theme-provider";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "AI Talent Tracker — Real-time monitoring of AI lab departures",
    template: "%s · AI Talent Tracker",
  },
  description:
    "Know the moment researchers, engineers, and operators leave OpenAI, Anthropic, DeepMind and other top AI labs. Real-time alerts via email, Slack, and webhooks.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "AI Talent Tracker",
    description: "Real-time monitoring of AI lab talent movement.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full scroll-smooth ${sans.variable} ${serif.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors toastOptions={{ className: "font-sans" }} />
          <PostHogAnalytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
