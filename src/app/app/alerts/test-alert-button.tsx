"use client";

import { useTransition } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendTestAlertAction } from "./actions";

export function TestAlertButton({ channelId }: { channelId: string }) {
  const [pending, start] = useTransition();

  function onSend() {
    const formData = new FormData();
    formData.set("id", channelId);
    start(async () => {
      const res = await sendTestAlertAction(formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Test alert sent.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-lg text-muted-foreground hover:text-signal"
      disabled={pending}
      aria-busy={pending}
      aria-label="Send test alert"
      onClick={onSend}
    >
      <Send className="h-4 w-4" />
    </Button>
  );
}
