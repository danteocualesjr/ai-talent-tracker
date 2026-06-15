"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
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
    <div className="container flex max-w-lg flex-col items-center px-4 py-20 text-center md:py-28">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </div>
      <h1 className="mt-5 text-xl font-bold tracking-tight">Feed unavailable</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        We couldn&apos;t load the departure feed. Try again in a moment.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" aria-hidden />
          Retry
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
