import Link from "next/link";
import { Activity, Bell, Globe2, Route, Search, Sparkles, TrendingUp } from "lucide-react";
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
        <EventMetric label="Last 7 days" value={last7} icon={<TrendingUp className="h-3.5 w-3.5" />} accent="text-signal" />
        <EventMetric label="High confidence" value={highConfidence} icon={<Sparkles className="h-3.5 w-3.5" />} accent="text-violet-accent" />
        <EventMetric label="Public feed" value={publicEvents} icon={<Globe2 className="h-3.5 w-3.5" />} accent="text-amber-accent" />
      </div>

      <div className="surface-card grid gap-4 p-5 md:grid-cols-3">
        {([
          { step: "01", title: "Review", body: "Open high-confidence stealth and founding signals first.", icon: Search },
          { step: "02", title: "Qualify", body: "Compare the summary with the profile timeline before outreach.", icon: Sparkles },
          { step: "03", title: "Route", body: "Send public signals to the feed and private signals to Slack or webhook channels.", icon: Route },
        ] as const).map(({ step, title, body, icon: Icon }) => (
          <div key={title} className="group rounded-xl border border-transparent p-3 transition-colors hover:border-border/60 hover:bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal/10 text-signal transition-transform motion-safe:group-hover:scale-105">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="tnum text-[10px] font-bold text-signal">{step}</div>
                <div className="text-sm font-semibold">{title}</div>
              </div>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
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

function EventMetric({
  label,
  value,
  icon,
  accent = "text-muted-foreground",
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="surface-card surface-card-hover group relative overflow-hidden p-4">
      <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-signal/5 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="tnum text-2xl font-bold">{value}</div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        </div>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80 ${accent}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
