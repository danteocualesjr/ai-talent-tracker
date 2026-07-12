"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function BillingStatusToast({ status }: { status?: string }) {
  useEffect(() => {
    if (status === "success") {
      toast.success("Subscription updated — your plan limits are now active.");
    }
  }, [status]);

  if (status !== "success") return null;

  return (
    <div role="status" className="rounded-xl border border-signal/20 bg-signal/5 px-4 py-3 text-sm">
      Your subscription is active. Plan limits may take a moment to sync.
    </div>
  );
}
