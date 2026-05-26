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
        window.location.href = "/login?next=%2Fapp%2Fbilling";
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error || "Could not open billing portal");
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open billing portal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" onClick={openPortal} disabled={loading}>
      {loading ? "Loading..." : "Manage subscription"}
    </Button>
  );
}
