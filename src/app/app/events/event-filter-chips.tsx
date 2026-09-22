"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "All", param: null, dot: "bg-foreground/40" },
  { label: "Departures", param: "departures", dot: "bg-violet-accent" },
  { label: "Stealth", param: "stealth", dot: "bg-amber-accent" },
  { label: "Founders", param: "founders", dot: "bg-signal" },
  { label: "Joiners", param: "joiners", dot: "bg-signal/70" },
  { label: "GitHub", param: "github", dot: "bg-rose-500" },
  { label: "Location", param: "location", dot: "bg-sky-500" },
  { label: "About", param: "about", dot: "bg-muted-foreground" },
  { label: "Role", param: "role", dot: "bg-muted-foreground/70" },
] as const;

export function AppEventsFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeParam = searchParams.get("type");
  const highOnly = searchParams.get("confidence") === "high";
  const groupRef = useRef<HTMLDivElement>(null);

  function pushParams(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams.toString());
    mutate(next);
    const query = next.toString();
    router.push(query ? `/app/events?${query}` : "/app/events", { scroll: false });
  }

  function selectFilter(param: (typeof FILTERS)[number]["param"]) {
    pushParams((next) => {
      if (param) next.set("type", param);
      else next.delete("type");
    });
  }

  function toggleHighConfidence() {
    pushParams((next) => {
      if (highOnly) next.delete("confidence");
      else next.set("confidence", "high");
    });
  }

  function focusChip(index: number) {
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>("button[data-filter-chip]");
    const target = buttons?.[index];
    target?.focus();
  }

  function onChipKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const total = FILTERS.length + 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusChip((index + 1) % total);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusChip((index - 1 + total) % total);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusChip(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusChip(total - 1);
    } else if (event.key === "Escape" && (activeParam || highOnly)) {
      event.preventDefault();
      pushParams((next) => {
        next.delete("type");
        next.delete("confidence");
      });
    }
  }

  const activeLabel = FILTERS.find((filter) => (filter.param ?? null) === (activeParam ?? null))?.label ?? "All";

  return (
    <div className="space-y-2">
      <div
        ref={groupRef}
        className="flex flex-wrap gap-2"
        role="toolbar"
        aria-label="Filter events by type"
      >
        {FILTERS.map(({ label, param, dot }, index) => {
          const active = (param ?? null) === (activeParam ?? null);
          return (
            <button
              key={label}
              type="button"
              data-filter-chip
              aria-pressed={active}
              onClick={() => selectFilter(param)}
              onKeyDown={(event) => onChipKeyDown(event, index)}
              className={cn(
                "chip transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 motion-safe:active:scale-95",
                active ? "chip-active motion-safe:scale-[1.02]" : "hover:border-signal/25 hover:bg-signal/5 hover:text-foreground",
              )}
            >
              {active ? (
                <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
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
        <button
          type="button"
          data-filter-chip
          aria-pressed={highOnly}
          onClick={toggleHighConfidence}
          onKeyDown={(event) => onChipKeyDown(event, FILTERS.length)}
          className={cn(
            "chip transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 motion-safe:active:scale-95",
            highOnly ? "chip-active motion-safe:scale-[1.02]" : "hover:border-signal/25 hover:bg-signal/5 hover:text-foreground",
          )}
        >
          <Sparkles className={cn("h-3 w-3 shrink-0", highOnly ? "text-signal" : "text-muted-foreground/70")} aria-hidden />
          High confidence
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {activeLabel} events{highOnly ? ", high confidence only" : ""}
      </p>
    </div>
  );
}
