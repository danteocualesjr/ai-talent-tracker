"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { Button } from "@/components/ui/button";

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main
        aria-labelledby="feed-error-title"
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-20 md:py-28"
      >
        <div className="pointer-events-none absolute inset-0 hero-backdrop" />
        <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
        <div className="relative flex max-w-lg flex-col items-center text-center animate-fade-up">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive shadow-sm ring-4 ring-destructive/5">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <h1 id="feed-error-title" className="mt-5 font-serif text-2xl font-medium tracking-tight md:text-3xl">
            Feed <span className="italic text-gradient-hero">unavailable</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We couldn&apos;t load the departure feed. Try again in a moment, or browse labs while we recover.
          </p>
          {error.digest && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
              <span className="text-foreground/70">Error ID</span>
              {error.digest}
            </p>
          )}
          <div className="animate-fade-up animate-fade-up-delay-3 mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset} variant="signal" className="gap-2">
              <RefreshCw className="h-4 w-4" aria-hidden />
              Retry
            </Button>
            <Button variant="outline" asChild>
              <Link href="/labs">Browse labs</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
