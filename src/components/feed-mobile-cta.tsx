"use client";

import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeedMobileCta() {
  return (
    <div
      role="region"
      aria-label="Start tracking call to action"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-signal/25 bg-background/95 px-4 pt-3 shadow-[0_-16px_40px_-12px_hsl(var(--foreground)/0.14),0_0_0_1px_hsl(var(--signal)/0.08)] backdrop-blur-xl sm:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-signal/60 via-signal to-signal/60" />
      <div className="mb-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
        </span>
        Get alerts the moment a researcher moves
      </div>
      <Button asChild variant="signal" className="group h-11 w-full btn-signal-glow">
        <Link href="/login">
          <Bell className="h-4 w-4" aria-hidden />
          Start tracking free
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
