"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "7 days", param: "7d" },
  { label: "30 days", param: "30d" },
  { label: "All time", param: null },
] as const;

export function EventDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRange = searchParams.get("range") ?? null;

  function selectRange(param: (typeof RANGES)[number]["param"]) {
    const next = new URLSearchParams(searchParams.toString());
    if (param) next.set("range", param);
    else next.delete("range");
    const query = next.toString();
    router.push(query ? `/app/events?${query}` : "/app/events", { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events by date">
      {RANGES.map(({ label, param }) => {
        const active = (param ?? null) === (activeRange ?? null);
        return (
          <button
            key={label}
            type="button"
            aria-pressed={active}
            onClick={() => selectRange(param)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "border-foreground/20 bg-foreground/5 text-foreground"
                : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
