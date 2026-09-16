"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { removeProfileForm } from "./actions";

export function RemoveProfileButton({
  profileId,
  profileName,
}: {
  profileId: string;
  profileName: string;
}) {
  const [pending, start] = useTransition();

  function onRemove() {
    const label = profileName || "this profile";
    if (!window.confirm(`Remove ${label} from your watchlist?`)) return;

    const formData = new FormData();
    formData.set("profile_id", profileId);
    start(async () => {
      const res = await removeProfileForm(formData);
      if ("error" in res) toast.error(res.error);
      else toast.success(`${label} removed from watchlist.`);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title="Remove"
      className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/35"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? `Removing ${profileName || "profile"}` : `Remove ${profileName || "profile"} from watchlist`}
      onClick={onRemove}
    >
      <Trash2 className="h-4 w-4" aria-hidden />
    </Button>
  );
}
