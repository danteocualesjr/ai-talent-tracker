"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyPanel, Panel } from "@/components/panel";
import { formatRelative } from "@/lib/utils";
import { TrackProfileButton } from "../track-profile-button";
import type { Profile } from "@/types/db";

export function LabRosterList({ labName, people }: { labName: string; people: Profile[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      const haystack = [p.full_name, p.linkedin_handle, p.headline, p.current_title].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [people, query, status]);

  return (
    <Panel title="Employees" bodyClassName="p-0">
      <div className="space-y-3 border-b border-border/60 px-5 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roster…"
            className="pl-9"
            aria-label="Search lab roster"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["all", "active", "stealth", "founder", "left"].map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize transition-colors ${
                status === s ? "border-signal/40 bg-signal/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyPanel
          icon={<span className="text-lg font-bold">{labName.slice(0, 1)}</span>}
          title="No matching people"
          body="Try a different search or status filter."
        />
      ) : (
        <div className="divide-y divide-border/60">
          {filtered.map((p) => {
            const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
            return (
              <div key={p.id} className="group relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                  {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
                  <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <Link href={`/app/profiles/${p.id}`} className="truncate text-sm font-semibold hover:underline underline-offset-4">
                    {p.full_name || p.linkedin_handle}
                  </Link>
                  <p className="truncate text-sm text-muted-foreground">{p.headline ?? p.current_title ?? ""}</p>
                </div>
                <Badge variant="secondary" className="capitalize">{p.status}</Badge>
                {p.linkedin_url && (
                  <TrackProfileButton linkedinUrl={p.linkedin_url} profileName={p.full_name || p.linkedin_handle || "profile"} />
                )}
                <div className="tnum hidden font-mono text-xs text-muted-foreground sm:block">{formatRelative(p.last_synced_at)}</div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
