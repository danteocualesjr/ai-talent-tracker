"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { removeChannel } from "./actions";

export function RemoveChannelButton({ channelId }: { channelId: string }) {
  const [pending, start] = useTransition();

  function onRemove() {
    if (!window.confirm("Remove this alert channel? Delivery will stop immediately.")) return;

    const formData = new FormData();
    formData.set("id", channelId);
    start(async () => {
      const res = await removeChannel(formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Channel removed.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/35"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Removing channel" : "Remove channel"}
      onClick={onRemove}
    >
      <Trash2 className="h-4 w-4" aria-hidden />
    </Button>
  );
}
