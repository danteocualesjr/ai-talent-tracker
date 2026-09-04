"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "All", param: null, dot: "bg-foreground/40" },
  { label: "Departures", param: "departures", dot: "bg-violet-accent" },
  { label: "Stealth", param: "stealth", dot: "bg-amber-accent" },
  { label: "Founders", param: "founders", dot: "bg-signal" },
  { label: "Joiners", param: "joiners", dot: "bg-signal/70" },
  { label: "GitHub", param: "github", dot: "bg-rose-500" },
] as const;

export function AppEventsFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeParam = searchParams.get("type");
  const highConfidence = searchParams.get("confidence") === "high";

  function selectFilter(param: (typeof FILTERS)[number]["param"]) {
    const next = new URLSearchParams(searchParams.toString());
    if (param) next.set("type", param);
    else next.delete("type");
    const query = next.toString();
    router.push(query ? `/app/events?${query}` : "/app/events", { scroll: false });
  }

  function toggleHighConfidence() {
    const next = new URLSearchParams(searchParams.toString());
    if (highConfidence) next.delete("confidence");
    else next.set("confidence", "high");
    const query = next.toString();
    router.push(query ? `/app/events?${query}` : "/app/events", { scroll: false });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events by type">
        {FILTERS.map(({ label, param, dot }) => {
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
                  ? "border-signal/40 bg-signal/10 text-foreground shadow-[inset_0_1px_0_0_hsl(var(--signal)/0.2)] ring-1 ring-signal/20 motion-safe:scale-[1.02]"
                  : "hover:border-signal/25 hover:bg-signal/5 hover:text-foreground",
              )}
            >
              {active ? (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                </span>
              ) : (
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
              )}
              {label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-pressed={highConfidence}
        onClick={toggleHighConfidence}
        className={cn(
          "chip text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40",
          highConfidence
            ? "border-violet-accent/40 bg-violet-500/10 text-foreground ring-1 ring-violet-accent/20"
            : "hover:border-violet-accent/25 hover:bg-violet-500/5",
        )}
      >
        High confidence (≥80%)
      </button>
    </div>
  );
}
