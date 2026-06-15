"use client";

import Link from "next/link";

export function FeedMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/90 p-4 backdrop-blur-xl sm:hidden">
      <p className="mb-2 text-center text-xs text-muted-foreground">
        Get alerts the moment a researcher moves
      </p>
      <Link
        href="/login"
        className="flex h-10 w-full items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background shadow-sm transition-colors hover:bg-foreground/90"
      >
        Start tracking free
      </Link>
    </div>
  );
}
