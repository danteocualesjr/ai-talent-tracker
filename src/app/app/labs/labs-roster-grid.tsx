"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyPanel } from "@/components/panel";
import type { Lab } from "@/types/db";

export function LabsRosterGrid({ labs }: { labs: Lab[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? [...labs]
      : labs.filter((lab) => {
          const haystack = [lab.name, lab.slug, lab.domain, lab.description]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        });
    // Featured labs stay easy to find even when the roster is filtered.
    return list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.name.localeCompare(b.name));
  }, [labs, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && query) {
              event.preventDefault();
              setQuery("");
            }
          }}
          placeholder="Search labs by name or domain…"
          className={query ? "pl-9 pr-16" : "pl-9"}
          aria-label="Search lab rosters"
        />
        {query ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40"
            onClick={() => setQuery("")}
            aria-label="Clear lab search"
          >
            Clear
          </button>
        ) : null}
      </div>
      <p className="sr-only" aria-live="polite">
        {filtered.length === 0
          ? "No matching labs"
          : `${filtered.length} lab${filtered.length === 1 ? "" : "s"} shown`}
        {query.trim() ? ` matching "${query.trim()}"` : ""}.
      </p>
      {filtered.length > 0 ? (
        <p className="text-xs text-muted-foreground" role="status">
          {query.trim() ? (
            <>
              Showing <span className="tnum font-semibold text-foreground">{filtered.length}</span> of{" "}
              <span className="tnum">{labs.length}</span> labs matching{" "}
              <span className="font-medium text-foreground">&ldquo;{query.trim()}&rdquo;</span>
            </>
          ) : (
            <>
              <span className="tnum font-semibold text-foreground">{labs.length}</span> lab
              {labs.length === 1 ? "" : "s"} available
            </>
          )}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyPanel
          icon={<Sparkles className="h-5 w-5" />}
          title="No matching labs"
          body="Try another name or domain, or clear the search to see every roster."
          cta={
            <Button type="button" variant="outline" onClick={() => setQuery("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <Link
              key={l.id}
              href={`/app/labs/${l.slug}`}
              className="group surface-card surface-card-hover relative overflow-hidden p-6"
            >
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-gradient-to-r from-transparent via-signal/60 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
              <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="flex items-center justify-between">
                {l.logo_url ? (
                  <Image
                    src={l.logo_url}
                    alt={l.name}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-xl border border-border/60 bg-muted object-contain p-1"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-muted text-lg font-bold text-muted-foreground">
                    {l.name.slice(0, 1)}
                  </div>
                )}
                {l.is_featured && <Badge variant="secondary">Featured</Badge>}
              </div>
              <div className="mt-5 font-bold tracking-tight">{l.name}</div>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {l.description ?? "Curated employee roster and departure signals."}
              </p>
              {l.domain && (
                <div className="mt-3 inline-flex rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {l.domain}
                </div>
              )}
              <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-signal">
                View roster <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
