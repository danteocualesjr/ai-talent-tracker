"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { refreshNowForm } from "./actions";

export function RefreshProfileButton({
  profileId,
  profileName,
  labeled = false,
}: {
  profileId: string;
  profileName: string;
  labeled?: boolean;
}) {
  const [pending, start] = useTransition();

  function onRefresh() {
    const formData = new FormData();
    formData.set("profile_id", profileId);
    start(async () => {
      const res = await refreshNowForm(formData);
      if ("error" in res) toast.error(res.error);
      else toast.success(`Refresh queued for ${profileName || "profile"}.`);
    });
  }

  return (
    <Button
      type="button"
      variant={labeled ? "outline" : "ghost"}
      size={labeled ? "sm" : "icon"}
      title="Refresh now"
      className={labeled ? "gap-1.5" : "rounded-lg text-muted-foreground hover:text-foreground"}
      disabled={pending}
      aria-busy={pending}
      aria-label={`Refresh ${profileName || "profile"}`}
      onClick={onRefresh}
    >
      <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
      {labeled ? (pending ? "Refreshing…" : "Refresh now") : null}
    </Button>
  );
}
