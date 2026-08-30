import Link from "next/link";
import { Logo } from "@/components/logo";

const LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/labs", label: "Labs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
  { href: "/opt-out", label: "Opt out" },
];

export function MarketingFooter() {
  return (
    <footer aria-label="Site footer" className="border-t border-border/70">
      <div className="container flex flex-col items-start justify-between gap-6 py-8 md:flex-row md:items-center md:py-10">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Logo showWordmark={false} />
          <span className="label-caps text-[10px] text-muted-foreground">AI Talent Tracker</span>
        </Link>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="label-caps text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-border/60">
        <div className="container py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} AI Talent Tracker
        </div>
      </div>
    </footer>
  );
}
