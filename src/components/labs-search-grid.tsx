"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Lab } from "@/types/db";

export function LabsSearchGrid({ labs }: { labs: Lab[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return labs;
    return labs.filter((lab) =>
      [lab.name, lab.domain, lab.description, lab.slug].filter(Boolean).join(" ").toLowerCase().includes(q),
    );
  }, [labs, query]);

  return (
    <>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search labs by name or domain…"
          className="pl-9"
          aria-label="Search labs"
        />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((lab) => (
          <Link
            key={lab.id}
            href={`/app/labs/${lab.slug}`}
            className="surface-card surface-card-hover group flex items-start gap-4 p-5"
          >
            {lab.logo_url ? (
              <Image src={lab.logo_url} alt={lab.name} width={48} height={48} className="h-12 w-12 rounded-xl border border-border/60 bg-muted object-contain p-1.5" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted text-lg font-bold">{lab.name.slice(0, 1)}</div>
            )}
            <div className="min-w-0">
              <div className="font-semibold transition-colors group-hover:text-signal">{lab.name}</div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{lab.domain}</div>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No labs match your search.</p>
      )}
    </>
  );
}
