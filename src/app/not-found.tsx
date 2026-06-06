import type { Metadata } from "next";
import Link from "next/link";
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
        <div className="relative text-center">
          <p className="label-caps">Error 404</p>
          <h1 id="not-found-title" className="mt-4 font-serif text-7xl font-normal italic tracking-tight text-foreground md:text-8xl">
            Lost signal
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            That page doesn&apos;t exist or may have moved.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Button asChild size="lg">
              <Link href="/">Go home</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/feed">Browse feed</Link>
            </Button>
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
            {[
              ["/labs", "Browse labs", "Open curated AI lab rosters."],
              ["/pricing", "Compare plans", "Pick the right alert volume."],
              ["/login", "Sign in", "Return to your dashboard."],
            ].map(([href, title, body]) => (
              <Link key={href} href={href} className="surface-card surface-card-hover block p-4">
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
