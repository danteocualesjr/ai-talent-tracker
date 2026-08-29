"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { refreshStaleProfiles } from "./actions";

export function RefreshStaleButton({ count }: { count: number }) {
  const [pending, start] = useTransition();

  if (count === 0) return null;

  function onRefresh() {
    start(async () => {
      const res = await refreshStaleProfiles();
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success(`Queued refresh for ${res.queued} stale profile${res.queued === 1 ? "" : "s"}.`);
      }
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={pending} aria-busy={pending} onClick={onRefresh}>
      <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
      Refresh {count} stale
    </Button>
  );
}
