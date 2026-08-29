"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    posthog?: {
      identify: (id: string, props?: Record<string, unknown>) => void;
      group: (type: string, id: string, props?: Record<string, unknown>) => void;
    };
  }
}

export function PostHogIdentify({
  userId,
  email,
  orgId,
  orgName,
  plan,
}: {
  userId: string;
  email: string | null;
  orgId: string;
  orgName: string;
  plan: string;
}) {
  useEffect(() => {
    const ph = window.posthog;
    if (!ph) return;

    ph.identify(userId, {
      email: email ?? undefined,
      org_id: orgId,
      org_name: orgName,
      plan,
    });
    ph.group("organization", orgId, { name: orgName, plan });
  }, [userId, email, orgId, orgName, plan]);

  return null;
}
