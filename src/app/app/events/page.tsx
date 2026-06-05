import Link from "next/link";
import { Activity, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { getOrgEvents } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { EmptyPanel, Panel } from "@/components/panel";
import { EventListItem } from "@/components/event-row";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);
  const events = await getOrgEvents(org.id, 200);
  const last7 = events.filter((event) => new Date(event.detected_at).getTime() > Date.now() - 7 * 86400000).length;
  const highConfidence = events.filter((event) => event.confidence >= 0.8).length;
  const publicEvents = events.filter((event) => event.is_public).length;

  return (
    <div className="container max-w-4xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="Events"
        eyebrow="Tracking"
        icon={<Activity className="h-4 w-4" />}
        description="All detected changes across your watchlists."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <EventMetric label="Last 7 days" value={last7} />
        <EventMetric label="High confidence" value={highConfidence} />
        <EventMetric label="Public feed" value={publicEvents} />
      </div>

      <Panel
        title={
          <>
            <span className="tnum">{events.length}</span> events
          </>
        }
        action={
          <span className="text-xs text-muted-foreground">
            Public events on{" "}
            <Link href="/feed" className="link-subtle text-xs">
              /feed
            </Link>
          </span>
        }
        bodyClassName={events.length === 0 ? undefined : "divide-y divide-border/60"}
      >
        {events.length === 0 ? (
          <EmptyPanel
            icon={<Bell className="h-5 w-5" />}
            title="No events yet"
            body="Once a tracked profile changes company, headline, or location, you'll see it here."
            cta={
              <Button asChild>
                <Link href="/app/watchlist">Add profiles</Link>
              </Button>
            }
          />
        ) : (
          events.map((e) => <EventListItem key={e.id} event={e} profile={e.profile} />)
        )}
      </Panel>
    </div>
  );
}

function EventMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-card p-4">
      <div className="tnum text-2xl font-bold">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
