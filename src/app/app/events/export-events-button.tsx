"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadBlob, stampedCsvFilename } from "@/lib/utils";

export function ExportEventsButton() {
  const [pending, start] = useTransition();

  function onExport() {
    start(async () => {
      try {
        const res = await fetch("/api/events/export");
        if (res.status === 403) {
          toast.error("CSV export requires a Team plan or higher.");
          return;
        }
        if (!res.ok) {
          toast.error("Export failed. Try again.");
          return;
        }
        const blob = await res.blob();
        downloadBlob(blob, stampedCsvFilename("events"));
        toast.success("Events exported.");
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
      className="gap-1.5 hover:border-signal/35 hover:bg-signal/5"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Exporting events CSV" : "Export events CSV"}
      onClick={onExport}
    >
      <Download className="h-3.5 w-3.5" aria-hidden />
      {pending ? "Exporting…" : "Export CSV"}
      <span className="sr-only" aria-live="polite">
        {pending ? "Preparing events CSV export" : ""}
      </span>
    </Button>
  );
}
