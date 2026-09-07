"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { diffProfiles, type FieldDiff } from "@/lib/diff";
import { snapshotToPartialProfile, toProviderProfile } from "@/lib/snapshot";
import { formatRelative } from "@/lib/utils";
import type { ProfileSnapshot } from "@/types/db";

const FIELD_LABELS: Record<FieldDiff["field"], string> = {
  full_name: "Name",
  headline: "Headline",
  current_company: "Company",
  current_title: "Title",
  location: "Location",
  about: "About",
  github_handle: "GitHub",
  x_handle: "X / Twitter",
};

export function SnapshotList({ snapshots }: { snapshots: ProfileSnapshot[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (snapshots.length === 0) return null;

  return (
    <>
      {snapshots.map((snapshot, index) => {
        const newerSnapshot = index > 0 ? snapshots[index - 1] : null;
        const diffs = newerSnapshot
          ? diffProfiles(
              snapshotToPartialProfile(snapshot),
              toProviderProfile(snapshotToPartialProfile(newerSnapshot)),
            )
          : [];
        const expanded = expandedId === snapshot.id;
        const canExpand = diffs.length > 0;

        return (
          <div key={snapshot.id} className="border-b border-border/60 last:border-0">
            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-3 text-left text-xs transition-colors hover:bg-muted/30 disabled:cursor-default"
              disabled={!canExpand}
              onClick={() => canExpand && setExpandedId(expanded ? null : snapshot.id)}
            >
              <span className="flex items-center gap-2">
                {canExpand ? (
                  expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <span className="inline-block w-3.5" />
                )}
                <span className="font-medium text-foreground">Snapshot {formatRelative(snapshot.fetched_at)}</span>
                {canExpand && (
                  <span className="rounded-full bg-signal/10 px-2 py-0.5 text-[10px] font-semibold text-signal">
                    {diffs.length} change{diffs.length === 1 ? "" : "s"}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-3 text-muted-foreground">
                <span>source: {snapshot.source}</span>
                <span className="font-mono text-muted-foreground/70">{snapshot.content_hash.slice(0, 8)}…</span>
              </span>
            </button>
            {expanded && diffs.length > 0 && (
              <div className="space-y-2 border-t border-border/40 bg-muted/20 px-5 py-3">
                {diffs.map((d) => (
                  <div key={d.field} className="grid gap-1 text-xs sm:grid-cols-[7rem_1fr]">
                    <span className="font-semibold text-foreground/80">{FIELD_LABELS[d.field]}</span>
                    <div className="space-y-0.5">
                      <div className="text-muted-foreground line-through">{d.before || "—"}</div>
                      <div className="font-medium text-foreground">{d.after || "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
