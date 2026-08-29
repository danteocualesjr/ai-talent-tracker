"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleChannelActive } from "./actions";

export function ToggleChannelButton({ channelId, isActive }: { channelId: string; isActive: boolean }) {
  const [pending, start] = useTransition();

  function onToggle(checked: boolean) {
    const formData = new FormData();
    formData.set("id", channelId);
    formData.set("is_active", String(checked));
    start(async () => {
      const res = await toggleChannelActive(formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success(checked ? "Channel enabled." : "Channel paused.");
      }
    });
  }

  return (
    <Switch
      checked={isActive}
      disabled={pending}
      aria-label={isActive ? "Pause channel" : "Enable channel"}
      onCheckedChange={onToggle}
    />
  );
}
