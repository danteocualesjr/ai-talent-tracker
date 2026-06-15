"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Departures", "Stealth", "Founders", "Joiners"] as const;

export function FeedFilterChips() {
  const [active, setActive] = useState<(typeof FILTERS)[number]>("All");

  return (
    <div className="flex flex-wrap gap-2 sm:justify-end" role="group" aria-label="Filter by signal type">
      {FILTERS.map((chip) => (
        <button
          key={chip}
          type="button"
          aria-pressed={active === chip}
          onClick={() => setActive(chip)}
          className={cn(
            "chip transition-colors",
            active === chip
              ? "border-signal/40 bg-signal/10 text-foreground ring-1 ring-signal/20"
              : "hover:border-signal/25 hover:bg-signal/5 hover:text-foreground",
          )}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
