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
    <footer className="mt-24 border-t bg-muted/20">
      <div className="container grid gap-10 py-12 md:grid-cols-3">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Real-time monitoring of LinkedIn profiles at top AI labs. Know who&apos;s moving before anyone else.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-2">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.title}</h4>
              <ul className="mt-3 space-y-2 text-sm">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-foreground/80 hover:text-foreground">
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
        <div className="container flex flex-col items-start justify-between gap-2 py-4 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} AI Talent Tracker. All rights reserved.</div>
          <div>Made with Next.js · Supabase · Inngest · Stripe</div>
        </div>
      </div>
    </footer>
  );
}
