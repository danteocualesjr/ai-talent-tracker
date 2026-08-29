import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { EmptyPanel, Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import type { DeliveryLogEntry } from "@/lib/queries";

export function DeliveryLog({ deliveries }: { deliveries: DeliveryLogEntry[] }) {
  return (
    <Panel title="Delivery log" description="Recent alert deliveries across all channels." bodyClassName={deliveries.length === 0 ? undefined : "divide-y divide-border/60"}>
      {deliveries.length === 0 ? (
        <EmptyPanel
          icon={<Clock className="h-5 w-5" />}
          title="No deliveries yet"
          body="When an event triggers an alert, delivery status will appear here."
        />
      ) : (
        deliveries.map((d) => (
          <div key={d.id} className="flex items-start gap-3 px-5 py-4 text-sm">
            <StatusIcon status={d.status} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="uppercase">
                  {d.channel.type}
                </Badge>
                <Badge variant={d.status === "sent" ? "success" : d.status === "failed" ? "destructive" : "secondary"}>
                  {d.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatRelative(d.created_at)}</span>
              </div>
              {d.event && (
                <p className="mt-1 truncate text-muted-foreground">
                  {d.event.type}: {d.event.summary}
                </p>
              )}
              {d.error && (
                <p className="mt-1 text-xs text-destructive">{d.error}</p>
              )}
            </div>
          </div>
        ))
      )}
    </Panel>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "sent") return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal" />;
  if (status === "failed") return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />;
  return <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />;
}
