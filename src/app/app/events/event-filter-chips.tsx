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

export function AppEventsFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeParam = searchParams.get("type");

  function selectFilter(param: (typeof FILTERS)[number]["param"]) {
    const next = new URLSearchParams(searchParams.toString());
    if (param) next.set("type", param);
    else next.delete("type");
    const query = next.toString();
    router.push(query ? `/app/events?${query}` : "/app/events", { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events by type">
      {FILTERS.map(({ label, param }) => {
        const active = (param ?? null) === (activeParam ?? null);
        return (
          <button
            key={label}
            type="button"
            aria-pressed={active}
            onClick={() => selectFilter(param)}
            className={cn(
              "chip transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40",
              active
                ? "border-signal/40 bg-signal/10 text-foreground shadow-[inset_0_1px_0_0_hsl(var(--signal)/0.2)] ring-1 ring-signal/20"
                : "hover:border-signal/25 hover:bg-signal/5 hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
