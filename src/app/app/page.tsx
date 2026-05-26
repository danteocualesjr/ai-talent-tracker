import Link from "next/link";
import { Activity, AlertTriangle, Bell, Plus, Sparkles, TrendingUp, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { countOrgEventsLast30Days, getOrgEvents, listOrgProfiles } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { EmptyPanel, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { EventListItem } from "@/components/event-row";
import { PLAN_DETAILS } from "@/lib/stripe";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);

  const [events, profiles, last30] = await Promise.all([
    getOrgEvents(org.id, 20),
    listOrgProfiles(org.id),
    countOrgEventsLast30Days(org.id),
  ]);
  const plan = PLAN_DETAILS[org.plan];

  const stealth = profiles.filter((p) => p.status === "stealth").length;
  const founders = profiles.filter((p) => p.status === "founder").length;
  const left = profiles.filter((p) => p.status === "left").length;

  return (
    <div className="container max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="Dashboard"
        description={
          <>
            <span className="tnum font-semibold text-foreground">{profiles.length}</span> of{" "}
            <span className="tnum">{org.profile_limit}</span> profiles
            <span className="mx-2 text-border">·</span>
            Refresh: <span className="font-medium text-foreground">{org.refresh_cadence}</span>
          </>
        }
      >
        <Button asChild>
          <Link href="/app/watchlist"><Plus className="h-4 w-4" /> Add profile</Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Tracked profiles" value={profiles.length} icon={<Users2 className="h-3.5 w-3.5" />} sub={`Limit ${org.profile_limit}`} />
        <StatCard label="Events (30d)" value={last30} icon={<Activity className="h-3.5 w-3.5" />} sub="across watchlists" />
        <StatCard label="Stealth + founders" value={stealth + founders} icon={<Sparkles className="h-3.5 w-3.5" />} sub={`${stealth} stealth · ${founders} founder`} />
        <StatCard label="Departures" value={left} icon={<AlertTriangle className="h-3.5 w-3.5" />} sub="flagged left" />
      </div>

      <Panel
        title="Recent activity"
        description="Latest detected changes across your watchlists"
        action={
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link href="/app/events">View all →</Link>
          </Button>
        }
        bodyClassName={events.length === 0 ? undefined : "divide-y divide-border/60"}
      >
        {events.length === 0 ? (
          <EmptyPanel
            icon={<Bell className="h-5 w-5" />}
            title="No events yet"
            body="Add a few profiles and we'll start watching. The first refresh runs immediately, then on your plan's cadence."
            cta={<Button asChild><Link href="/app/watchlist">Add profiles</Link></Button>}
          />
        ) : (
          events.map((e) => <EventListItem key={e.id} event={e} profile={e.profile} />)
        )}
      </Panel>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="surface-elevated rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="label-caps flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" /> Your plan
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Link href="/app/billing">Manage →</Link>
            </Button>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight">{plan.name}</span>
            <span className="text-sm text-muted-foreground">
              {plan.price_monthly ? `$${plan.price_monthly}/mo` : "Free"}
            </span>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-elevated rounded-2xl border border-border/60 bg-card p-6">
          <div className="label-caps flex items-center gap-2">
            <Bell className="h-3.5 w-3.5" /> Get notified faster
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Add a Slack webhook to get alerts in seconds — much faster than email.
            Never miss a stealth flip again.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/app/alerts">Configure alerts</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, sub }: { label: string; value: string | number; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="surface-elevated rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        <div className="text-muted-foreground/70">{icon}</div>
      </div>
      <div className="tnum mt-3 text-3xl font-bold tracking-tight">{value}</div>
      {sub && <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

