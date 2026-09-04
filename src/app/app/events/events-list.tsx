"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EventListItem } from "@/components/event-row";
import type { EventRow, Profile } from "@/types/db";

export function EventsList({ events }: { events: (EventRow & { profile: Profile })[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => {
      const haystack = [e.summary, e.profile.full_name, e.profile.linkedin_handle, e.profile.headline, e.profile.current_company]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [events, query]);

  return (
    <>
      <div className="border-b border-border/60 px-5 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events by name, company, or summary…"
            className="h-9 pl-9 text-sm"
            aria-label="Search events"
          />
        </div>
      </div>
      {filtered.map((e) => (
        <EventListItem key={e.id} event={e} profile={e.profile} />
      ))}
    </>
  );
}
