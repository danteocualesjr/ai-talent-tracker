"use client";

import { cn } from "@/lib/utils";
import type { DeliveryLogEntry } from "@/lib/queries";

export function DeliveryLogFilters({
  statusFilter,
  typeFilter,
  onStatusChange,
  onTypeChange,
}: {
  statusFilter: string;
  typeFilter: string;
  onStatusChange: (v: string) => void;
  onTypeChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-border/60 px-5 py-3">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label="Filter by delivery status"
        className="rounded-md border border-border/60 bg-background px-2 py-1 text-xs"
      >
        <option value="all">All statuses</option>
        <option value="sent">Sent</option>
        <option value="failed">Failed</option>
        <option value="skipped">Skipped</option>
        <option value="queued">Queued</option>
      </select>
      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
        aria-label="Filter by channel type"
        className="rounded-md border border-border/60 bg-background px-2 py-1 text-xs"
      >
        <option value="all">All channels</option>
        <option value="email">Email</option>
        <option value="slack">Slack</option>
        <option value="webhook">Webhook</option>
      </select>
    </div>
  );
}

export function filterDeliveries(
  deliveries: DeliveryLogEntry[],
  statusFilter: string,
  typeFilter: string,
): DeliveryLogEntry[] {
  return deliveries.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (typeFilter !== "all" && d.channel.type !== typeFilter) return false;
    return true;
  });
}
