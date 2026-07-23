"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
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
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 hero-backdrop" />
      <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
      <div className="relative flex max-w-lg flex-col items-center text-center">
      <div className="animate-fade-up flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive shadow-sm ring-4 ring-destructive/5">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </div>
      <h1 className="animate-fade-up animate-fade-up-delay-1 mt-5 text-xl font-bold tracking-tight">Something went wrong</h1>
      <p className="animate-fade-up animate-fade-up-delay-2 mt-2 text-sm leading-relaxed text-muted-foreground">
        We hit an error loading this page. Try again, or head back to the dashboard.
      </p>
      {error.digest && (
        <p className="animate-fade-up animate-fade-up-delay-2 mt-3 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
          <span className="text-foreground/70">Error ID</span>
          {error.digest}
        </p>
      )}
      <div className="animate-fade-up animate-fade-up-delay-3 mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" aria-hidden />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/app">Back to dashboard</Link>
        </Button>
      </div>
      </div>
    </div>
  );
}
