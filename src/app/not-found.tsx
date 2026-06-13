import type { Metadata } from "next";
import Link from "next/link";
import { Building2, CreditCard, LogIn, type LucideIcon } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main aria-labelledby="not-found-title" className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-20">
        <div className="pointer-events-none absolute inset-0 hero-backdrop" />
        <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
        <p
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-serif text-[clamp(8rem,28vw,16rem)] font-normal leading-none tracking-tighter text-foreground/[0.04]"
        >
          404
        </p>
        <div className="relative text-center">
          <p className="label-caps inline-flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            Error 404
          </p>
          <h1 id="not-found-title" className="mt-4 font-serif text-7xl font-normal italic tracking-tight text-foreground md:text-8xl">
            Lost signal
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            That page doesn&apos;t exist or may have moved.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/">Go home</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/feed">Browse feed</Link>
            </Button>
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
            {([
              ["/labs", "Browse labs", "Open curated AI lab rosters.", Building2],
              ["/pricing", "Compare plans", "Pick the right alert volume.", CreditCard],
              ["/login", "Sign in", "Return to your dashboard.", LogIn],
            ] as [string, string, string, LucideIcon][]).map(([href, title, body, Icon]) => (
              <Link key={href} href={href} className="surface-card surface-card-hover group block p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground transition-colors group-hover:border-signal/30 group-hover:bg-signal/10 group-hover:text-signal">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold">{title}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
