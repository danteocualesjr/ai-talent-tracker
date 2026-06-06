import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/logo";

const SECTIONS = [
  {
    title: "Product",
    links: [
      { href: "/feed", label: "Departure feed" },
      { href: "/labs", label: "Labs" },
      { href: "/pricing", label: "Pricing" },
      { href: "/feed/rss.xml", label: "RSS", external: true },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/login", label: "Get started" },
      { href: "/feed", label: "Public events" },
      { href: "/app", label: "Dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/opt-out", label: "Opt out / DSAR" },
      { href: "mailto:hello@aitalenttracker.com", label: "Contact", external: true },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer aria-label="Site footer" className="relative border-t bg-card/40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container grid gap-12 py-14 md:grid-cols-[1.4fr_2fr] md:py-16">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
            Real-time monitoring of LinkedIn profiles at top AI labs. Know who&apos;s moving
            before anyone else.
          </p>
          <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            <span>All systems normal · monitoring 20+ labs</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h4 className="label-caps">{s.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-sm"
                    >
                      {l.label}
                      {l.external && (
                        <ArrowUpRight className="h-3 w-3 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container flex flex-col items-start justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} AI Talent Tracker. All rights reserved.</div>
          <div className="font-mono text-[11px] opacity-70">Next.js · Supabase · Inngest · Stripe</div>
        </div>
      </div>
    </footer>
  );
}
