"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Compass, Filter, Github, LogOut, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "All", param: null, icon: Filter },
  { label: "Departures", param: "departures", icon: LogOut },
  { label: "Stealth", param: "stealth", icon: Compass },
  { label: "Founders", param: "founders", icon: Star },
  { label: "Joiners", param: "joiners", icon: Briefcase },
  { label: "GitHub", param: "github", icon: Github },
] as const;

export function FeedFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeParam = searchParams.get("type");
  const groupRef = useRef<HTMLDivElement>(null);

  function selectFilter(param: (typeof FILTERS)[number]["param"]) {
    const next = new URLSearchParams(searchParams.toString());
    if (param) next.set("type", param);
    else next.delete("type");
    const query = next.toString();
    router.push(query ? `/feed?${query}` : "/feed", { scroll: false });
  }

  function focusChip(index: number) {
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>("button[data-filter-chip]");
    buttons?.[index]?.focus();
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
    }
  }

  const activeLabel =
    FILTERS.find((filter) => (filter.param ?? null) === (activeParam ?? null))?.label ?? "All";

  return (
    <div className="space-y-2 sm:space-y-0">
      <div
        ref={groupRef}
        className="flex flex-wrap gap-2 sm:justify-end"
        role="toolbar"
        aria-label="Filter by signal type"
      >
        {FILTERS.map(({ label, param, icon: Icon }, index) => {
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
                active ? "chip-active motion-safe:scale-[1.02]" : "hover:border-signal/25 hover:bg-signal/5 hover:text-foreground hover:shadow-sm",
              )}
            >
              <Icon className={cn("h-3 w-3 shrink-0", active ? "text-signal" : "text-muted-foreground/70")} aria-hidden />
              {active && (
                <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                </span>
              )}
              {label}
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {activeLabel} signals
      </p>
    </div>
  );
}
