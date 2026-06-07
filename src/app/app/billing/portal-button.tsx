"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PortalButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent("/app/billing")}`;
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else toast.error(data.error || "Could not open billing portal");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open billing portal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" onClick={openPortal} disabled={loading} aria-busy={loading}>
      {loading ? "Loading..." : "Manage subscription"}
    </Button>
  );
}
