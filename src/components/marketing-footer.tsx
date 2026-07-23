import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
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
    <footer aria-label="Site footer" className="relative overflow-hidden border-t bg-card/40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 noise opacity-30" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-signal/8 blur-3xl" />

      <div className="container relative grid gap-12 py-14 md:grid-cols-[1.4fr_2fr] md:py-16">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
            Real-time monitoring of LinkedIn profiles at top AI labs. Know who&apos;s moving
            before anyone else.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-signal/20 bg-signal/5 px-3 py-1.5 text-[11px] text-muted-foreground shadow-[0_0_20px_-10px_hsl(var(--signal)/0.5)] transition-colors hover:border-signal/35 hover:text-foreground">
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
                      className="group/link inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-sm"
                    >
                      <span className="relative">
                        {l.label}
                        <span className="absolute -bottom-px left-0 h-px w-0 bg-signal transition-all duration-200 group-hover/link:w-full" />
                      </span>
                      {l.external && (
                        <ArrowUpRight className="h-3 w-3 opacity-50 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:opacity-100" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-border/60 bg-gradient-to-br from-muted/30 via-muted/20 to-signal/[0.04]">
        <div className="pointer-events-none absolute inset-0 dot-bg opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
        <div className="container flex flex-col items-start justify-between gap-4 py-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
              </span>
              Stay ahead of the next move
            </div>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">
              Get Slack alerts when researchers go stealth — before they hit your LinkedIn feed.
            </p>
          </div>
          <Link
            href="/login"
            className="group/cta inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-2.5 text-xs font-semibold shadow-sm transition-all hover:border-signal/40 hover:bg-signal hover:text-[hsl(var(--signal-foreground))] hover:shadow-[0_8px_24px_-8px_hsl(var(--signal)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            Start tracking free
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container flex flex-col items-start justify-between gap-3 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:py-6">
          <div>© {new Date().getFullYear()} AI Talent Tracker. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a
              href="#top"
              className="group/top inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-sm"
            >
              Back to top
              <ArrowUp className="h-3 w-3 transition-transform motion-safe:group-hover/top:-translate-y-0.5" />
            </a>
            <span className="hidden h-3 w-px bg-border/80 sm:block" aria-hidden />
            <div className="font-mono text-[11px] opacity-70">Next.js · Supabase · Inngest · Stripe</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
