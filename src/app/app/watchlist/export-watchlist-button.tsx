"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
        anchor.download = "watchlist.csv";
        anchor.click();
        URL.revokeObjectURL(url);
        toast.success("Watchlist exported.");
      } catch {
        toast.error("Export failed. Try again.");
      }
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={pending} aria-busy={pending} onClick={onExport}>
      <Download className="h-3.5 w-3.5" />
      {pending ? "Exporting…" : "Export CSV"}
    </Button>
  );
}
