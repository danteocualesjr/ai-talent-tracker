"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, Briefcase, Clock, Compass, Filter, Github, Globe, Link2, LogOut, Pencil, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { labelForFilterChipParam, type EventFilterChipParam } from "@/lib/event-filter-chips";

const FILTERS: { label: string; param: EventFilterChipParam; icon: typeof Filter }[] = [
  { label: labelForFilterChipParam(null), param: null, icon: Filter },
  { label: labelForFilterChipParam("departures"), param: "departures", icon: LogOut },
  { label: labelForFilterChipParam("stealth"), param: "stealth", icon: Compass },
  { label: labelForFilterChipParam("founders"), param: "founders", icon: Star },
  { label: labelForFilterChipParam("joiners"), param: "joiners", icon: Briefcase },
  { label: labelForFilterChipParam("github"), param: "github", icon: Github },
  { label: labelForFilterChipParam("location"), param: "location", icon: Globe },
  { label: labelForFilterChipParam("about"), param: "about", icon: Pencil },
  { label: labelForFilterChipParam("role"), param: "role", icon: ArrowLeftRight },
  { label: labelForFilterChipParam("domain"), param: "domain", icon: Link2 },
];

export function FeedFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeParam = searchParams.get("type");
  const highOnly = searchParams.get("confidence") === "high";
  const last7Only = searchParams.get("days") === "7";
  const groupRef = useRef<HTMLDivElement>(null);

  function pushParams(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams.toString());
    mutate(next);
    const query = next.toString();
    router.push(query ? `/feed?${query}` : "/feed", { scroll: false });
  }

  function selectFilter(param: EventFilterChipParam) {
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

  function toggleLast7Days() {
    pushParams((next) => {
      if (last7Only) next.delete("days");
      else next.set("days", "7");
    });
  }

  function focusChip(index: number) {
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>("button[data-filter-chip]");
    buttons?.[index]?.focus();
  }

  function onChipKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const total = FILTERS.length + 2;
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
    } else if (event.key === "Escape" && (activeParam || highOnly || last7Only)) {
      event.preventDefault();
      pushParams((next) => {
        next.delete("type");
        next.delete("confidence");
        next.delete("days");
      });
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
        <button
          type="button"
          data-filter-chip
          aria-pressed={highOnly}
          onClick={toggleHighConfidence}
          onKeyDown={(event) => onChipKeyDown(event, FILTERS.length)}
          className={cn(
            "chip transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 motion-safe:active:scale-95",
            highOnly ? "chip-active motion-safe:scale-[1.02]" : "hover:border-signal/25 hover:bg-signal/5 hover:text-foreground hover:shadow-sm",
          )}
        >
          <Sparkles className={cn("h-3 w-3 shrink-0", highOnly ? "text-signal" : "text-muted-foreground/70")} aria-hidden />
          High confidence
        </button>
        <button
          type="button"
          data-filter-chip
          aria-pressed={last7Only}
          onClick={toggleLast7Days}
          onKeyDown={(event) => onChipKeyDown(event, FILTERS.length + 1)}
          className={cn(
            "chip transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 motion-safe:active:scale-95",
            last7Only ? "chip-active motion-safe:scale-[1.02]" : "hover:border-signal/25 hover:bg-signal/5 hover:text-foreground hover:shadow-sm",
          )}
        >
          <Clock className={cn("h-3 w-3 shrink-0", last7Only ? "text-signal" : "text-muted-foreground/70")} aria-hidden />
          Last 7 days
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {activeLabel} signals{highOnly ? ", high confidence only" : ""}{last7Only ? ", last 7 days" : ""}
      </p>
    </div>
  );
}
