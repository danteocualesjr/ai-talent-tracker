"use client";

import { useTransition } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/db";

export function CopyUrlsButton({ profiles }: { profiles: Profile[] }) {
  const [pending, start] = useTransition();

  function onCopy() {
    start(async () => {
      const urls = profiles.map((p) => p.linkedin_url).filter(Boolean).join("\n");
      if (!urls) {
        toast.error("No URLs to copy.");
        return;
      }
      await navigator.clipboard.writeText(urls);
      toast.success(`Copied ${profiles.length} URL${profiles.length === 1 ? "" : "s"}.`);
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={pending || profiles.length === 0} onClick={onCopy}>
      <Copy className="h-3.5 w-3.5" />
      {pending ? "Copying…" : "Copy URLs"}
    </Button>
  );
}
