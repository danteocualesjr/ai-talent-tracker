"use client";

import { useTransition } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addProfile } from "@/app/app/watchlist/actions";

export function TrackProfileButton({ linkedinUrl, profileName }: { linkedinUrl: string; profileName: string }) {
  const [pending, start] = useTransition();

  function onTrack() {
    const formData = new FormData();
    formData.set("linkedin_url", linkedinUrl);
    start(async () => {
      const res = await addProfile(formData);
      if ("error" in res) toast.error(res.error);
      else toast.success(`${profileName} added to watchlist.`);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 shrink-0 gap-1 px-2 text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
      disabled={pending}
      aria-busy={pending}
      aria-label={`Track ${profileName}`}
      onClick={onTrack}
    >
      <UserPlus className="h-3.5 w-3.5" />
      Track
    </Button>
  );
}
