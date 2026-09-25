"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function stampedFilename(prefix: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${prefix}-${stamp}.csv`;
}

export function ExportWatchlistButton() {
  const [pending, start] = useTransition();

  function onExport() {
    start(async () => {
      try {
        const res = await fetch("/api/watchlist/export");
        if (res.status === 403) {
          toast.error("CSV export requires a Team plan or higher.");
          return;
        }
        if (!res.ok) {
          toast.error("Export failed. Try again.");
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = stampedFilename("watchlist");
        anchor.click();
        URL.revokeObjectURL(url);
        toast.success("Watchlist exported.");
      } catch {
        toast.error("Export failed. Try again.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Exporting watchlist CSV" : "Export watchlist CSV"}
      onClick={onExport}
    >
      <Download className="h-3.5 w-3.5" aria-hidden />
      {pending ? "Exporting…" : "Export CSV"}
      <span className="sr-only" aria-live="polite">
        {pending ? "Preparing watchlist CSV export" : ""}
      </span>
    </Button>
  );
}
