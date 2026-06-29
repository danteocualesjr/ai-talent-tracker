"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "All", param: null },
  { label: "Departures", param: "departures" },
  { label: "Stealth", param: "stealth" },
  { label: "Founders", param: "founders" },
  { label: "Joiners", param: "joiners" },
] as const;

export function FeedFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeParam = searchParams.get("type");

  function selectFilter(param: (typeof FILTERS)[number]["param"]) {
    const next = new URLSearchParams(searchParams.toString());
    if (param) next.set("type", param);
    else next.delete("type");
    const query = next.toString();
    router.push(query ? `/feed?${query}` : "/feed", { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2 sm:justify-end" role="group" aria-label="Filter by signal type">
      {FILTERS.map(({ label, param }) => {
        const active = (param ?? null) === (activeParam ?? null);
        return (
          <button
            key={label}
            type="button"
            aria-pressed={active}
            onClick={() => selectFilter(param)}
            className={cn(
              "chip transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 motion-safe:active:scale-95",
              active
                ? "border-signal/40 bg-signal/10 text-foreground shadow-sm ring-1 ring-signal/20 motion-safe:scale-[1.02]"
                : "hover:border-signal/25 hover:bg-signal/5 hover:text-foreground",
            )}
          >
            {active && (
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
              </span>
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
