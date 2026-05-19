import Link from "next/link";
import { Logo } from "@/components/logo";

const SECTIONS = [
  {
    title: "Product",
    links: [
      { href: "/feed", label: "Departure feed" },
      { href: "/labs", label: "Labs" },
      { href: "/pricing", label: "Pricing" },
      { href: "/feed/rss.xml", label: "RSS" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/opt-out", label: "Opt out / DSAR" },
      { href: "mailto:hello@aitalenttracker.com", label: "Contact" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="container grid gap-12 py-14 md:grid-cols-3">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Real-time monitoring of LinkedIn profiles at top AI labs. Know who&apos;s moving before anyone else.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-2">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h4 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {s.title}
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t">
        <div className="container flex flex-col items-start justify-between gap-2 py-5 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} AI Talent Tracker. All rights reserved.</div>
          <div className="font-mono">Next.js · Supabase · Inngest · Stripe</div>
        </div>
      </div>
    </footer>
  );
}
