"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const groupRef = useRef<HTMLDivElement>(null);

  function selectFilter(param: (typeof FILTERS)[number]["param"]) {
    const next = new URLSearchParams(searchParams.toString());
    if (param) next.set("type", param);
    else next.delete("type");
    const query = next.toString();
    router.push(query ? `/app/events?${query}` : "/app/events", { scroll: false });
  }

  function focusChip(index: number) {
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>("button[data-filter-chip]");
    const target = buttons?.[index];
    target?.focus();
  }

  function onChipKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusChip((index + 1) % FILTERS.length);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusChip((index - 1 + FILTERS.length) % FILTERS.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusChip(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusChip(FILTERS.length - 1);
    } else if (event.key === "Escape" && activeParam) {
      event.preventDefault();
      selectFilter(null);
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
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {activeLabel} events
      </p>
    </div>
  );
}
