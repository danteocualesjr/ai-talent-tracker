"use client";

import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeedMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/90 px-4 pt-3 shadow-[0_-10px_40px_-16px_hsl(var(--foreground)/0.14)] backdrop-blur-xl sm:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mb-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
        </span>
        Get alerts the moment a researcher moves
      </div>
      <Button asChild className="group h-11 w-full shadow-md">
        <Link href="/login">
          <Bell className="h-4 w-4" />
          Start tracking free
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Button>
    </div>
  );
}
