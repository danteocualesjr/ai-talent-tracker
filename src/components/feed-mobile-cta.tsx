"use client";

import Link from "next/link";

export function FeedMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/90 px-4 pt-3 shadow-[0_-10px_40px_-16px_hsl(var(--foreground)/0.14)] backdrop-blur-xl sm:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <p className="mb-2 text-center text-xs text-muted-foreground">
        Get alerts the moment a researcher moves
      </p>
      <Link
        href="/login"
        className="flex h-10 w-full items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background shadow-sm transition-all hover:bg-foreground/90 motion-safe:active:scale-[0.98]"
      >
        Start tracking free
      </Link>
    </div>
  );
}
