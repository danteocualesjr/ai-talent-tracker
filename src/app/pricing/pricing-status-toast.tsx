"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function PricingStatusToast({ status }: { status?: string }) {
  useEffect(() => {
    if (status === "cancelled") {
      toast.message("Checkout cancelled — no changes were made to your plan.");
    }
  }, [status]);

  return null;
}
