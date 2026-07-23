"use client";

import { useTransition } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addLabRosterToWatchlist } from "@/app/app/watchlist/actions";

export function AddLabRosterButton({
  labId,
  labSlug,
  count,
}: {
  labId: string;
  labSlug: string;
  count: number;
}) {
  const [pending, start] = useTransition();

  function onAdd() {
    if (
      !window.confirm(
        `Add ${count} profile${count === 1 ? "" : "s"} from this lab to your watchlist? Duplicates are skipped automatically.`,
      )
    ) {
      return;
    }

    start(async () => {
      const res = await addLabRosterToWatchlist(labId, labSlug);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        const parts = [`${res.added} added`];
        if (res.skipped) parts.push(`${res.skipped} already tracked`);
        if (res.limitReached) parts.push("plan limit reached");
        toast.success(`Watchlist updated — ${parts.join(", ")}.`);
      }
    });
  }

  if (count === 0) return null;

  return (
    <Button
      type="button"
      variant="signal"
      size="sm"
      className="shrink-0 gap-2"
      disabled={pending}
      aria-busy={pending}
      onClick={onAdd}
    >
      <UserPlus className="h-4 w-4" />
      {pending ? "Adding…" : `Add ${count} to watchlist`}
    </Button>
  );
}
