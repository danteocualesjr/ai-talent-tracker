"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Compass, ListChecks, LogOut, Search, Star, Users2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyPanel } from "@/components/panel";
import { RemoveProfileButton } from "./remove-profile-button";
import { RefreshProfileButton } from "./refresh-profile-button";
import { formatRelative, cn } from "@/lib/utils";
import type { Profile } from "@/types/db";

const STATUS_TONE: Record<string, "default" | "secondary" | "success" | "warning"> = {
  active: "secondary",
  left: "warning",
  stealth: "warning",
  founder: "success",
  unknown: "secondary",
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-muted-foreground",
  left: "bg-violet-accent",
  stealth: "bg-amber-accent",
  founder: "bg-signal",
  unknown: "bg-muted-foreground",
};

type SortKey = "name" | "synced" | "company";
type StatusFilter = "all" | Profile["status"];

export function WatchlistProfiles({ profiles }: { profiles: (Profile & { watchlist_id: string })[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("name");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = profiles.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      const haystack = [p.full_name, p.linkedin_handle, p.current_company, p.headline, p.current_title]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sort === "synced") {
        const at = a.last_synced_at ? new Date(a.last_synced_at).getTime() : 0;
        const bt = b.last_synced_at ? new Date(b.last_synced_at).getTime() : 0;
        return bt - at;
      }
      if (sort === "company") {
        return (a.current_company ?? "").localeCompare(b.current_company ?? "");
      }
      return (a.full_name ?? a.linkedin_handle ?? "").localeCompare(b.full_name ?? b.linkedin_handle ?? "");
    });

    return list;
  }, [profiles, query, status, sort]);

  const statusFilters: { key: StatusFilter; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All", icon: <Users2 className="h-3 w-3" /> },
    { key: "active", label: "Active", icon: <Users2 className="h-3 w-3" /> },
    { key: "stealth", label: "Stealth", icon: <Compass className="h-3 w-3" /> },
    { key: "founder", label: "Founder", icon: <Star className="h-3 w-3" /> },
    { key: "left", label: "Left", icon: <LogOut className="h-3 w-3" /> },
  ];

  return (
    <>
      <div className="border-b border-border/60 px-5 py-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, company, or headline…"
            className="pl-9"
            aria-label="Search watchlist"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
            {statusFilters.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                aria-pressed={status === key}
                onClick={() => setStatus(key)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  status === key
                    ? "border-signal/40 bg-signal/10 text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort profiles"
            className="ml-auto rounded-md border border-border/60 bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground"
          >
            <option value="name">Sort: Name</option>
            <option value="synced">Sort: Last synced</option>
            <option value="company">Sort: Company</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyPanel
          icon={<ListChecks className="h-5 w-5" />}
          title={query || status !== "all" ? "No matching profiles" : "No profiles yet"}
          body={
            query || status !== "all"
              ? "Try a different search term or filter."
              : "Paste a LinkedIn URL above, import a CSV roster, or browse curated lab rosters to bulk-add."
          }
          cta={
            !query && status === "all" ? (
              <Button asChild variant="outline">
                <Link href="/app/labs">Browse lab rosters</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        filtered.map((p) => {
          const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
          return (
            <div key={p.id} className="group relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-signal/0 via-signal/60 to-signal/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="relative shrink-0">
                <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm motion-safe:transition-transform motion-safe:group-hover:scale-[1.02]">
                  {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
                  <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                </Avatar>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${STATUS_DOT[p.status] ?? STATUS_DOT.unknown}`}
                  title={p.status}
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/app/profiles/${p.id}`} className="truncate text-sm font-semibold transition-colors hover:text-foreground hover:underline underline-offset-4">
                    {p.full_name || p.linkedin_handle}
                  </Link>
                  <Badge variant={STATUS_TONE[p.status] ?? "secondary"} className="capitalize">
                    {p.status}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {p.headline || p.current_title || p.current_company || "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Last synced {formatRelative(p.last_synced_at)} · {p.current_company ?? "no current company"}
                </p>
              </div>
              <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <RefreshProfileButton profileId={p.id} profileName={p.full_name || p.linkedin_handle || "profile"} />
                <RemoveProfileButton profileId={p.id} profileName={p.full_name || p.linkedin_handle || "profile"} />
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
