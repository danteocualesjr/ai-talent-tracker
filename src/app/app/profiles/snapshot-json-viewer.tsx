"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatRelative } from "@/lib/utils";
import type { ProfileSnapshot } from "@/types/db";

export function SnapshotJsonViewer({ snapshots }: { snapshots: ProfileSnapshot[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      {snapshots.map((s) => {
        const expanded = expandedId === s.id;
        return (
          <div key={s.id} className="border-b border-border/60 last:border-0">
            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-3 text-xs transition-colors hover:bg-muted/30"
              onClick={() => setExpandedId(expanded ? null : s.id)}
            >
              <span className="flex items-center gap-2 font-medium text-foreground">
                {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                Snapshot {formatRelative(s.fetched_at)}
              </span>
              <span className="text-muted-foreground">source: {s.source}</span>
            </button>
            {expanded && (
              <pre className="max-h-64 overflow-auto border-t border-border/40 bg-muted/20 px-5 py-3 text-[10px] leading-relaxed text-muted-foreground">
                {JSON.stringify(s.raw, null, 2)}
              </pre>
            )}
          </div>
        );
      })}
    </>
  );
}
