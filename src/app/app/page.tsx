import Link from "next/link";
import { Activity, AlertTriangle, Bell, Plus, Sparkles, TrendingUp, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { getOrgEvents, listOrgProfiles } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { EventListItem } from "@/components/event-row";
import { PLAN_DETAILS } from "@/lib/stripe";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);

  const [events, profiles] = await Promise.all([getOrgEvents(org.id, 20), listOrgProfiles(org.id)]);
  const plan = PLAN_DETAILS[org.plan];

  const stealth = profiles.filter((p) => p.status === "stealth").length;
  const founders = profiles.filter((p) => p.status === "founder").length;
  const left = profiles.filter((p) => p.status === "left").length;
  const last30 = events.filter((e) => new Date(e.detected_at).getTime() > Date.now() - 30 * 86400000).length;

  return (
    <div className="container max-w-6xl space-y-8 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="tnum">{profiles.length}</span> of <span className="tnum">{org.profile_limit}</span> profiles
            <span className="mx-2 text-border">·</span>
            Refresh: <span className="text-foreground">{org.refresh_cadence}</span>
          </p>
        </div>
        <Button asChild>
          <Link href="/app/watchlist"><Plus className="h-4 w-4" /> Add profile</Link>
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-4">
        <StatCard label="Tracked profiles" value={profiles.length} icon={<Users2 className="h-3.5 w-3.5" />} sub={`Limit ${org.profile_limit}`} />
        <StatCard label="Events (30d)" value={last30} icon={<Activity className="h-3.5 w-3.5" />} sub="across watchlists" />
        <StatCard label="Stealth + founders" value={stealth + founders} icon={<Sparkles className="h-3.5 w-3.5" />} sub={`${stealth} stealth · ${founders} founder`} />
        <StatCard label="Departures" value={left} icon={<AlertTriangle className="h-3.5 w-3.5" />} sub="flagged left" />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <div className="text-sm font-semibold">Recent activity</div>
            <div className="text-xs text-muted-foreground">Latest detected changes across your watchlists</div>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link href="/app/events">View all →</Link>
          </Button>
        </div>
        <div>
          {events.length === 0 ? (
            <EmptyState
              icon={<Bell className="h-5 w-5" />}
              title="No events yet"
              body="Add a few profiles and we'll start watching. The first refresh runs immediately, then on your plan's cadence."
              cta={<Button asChild><Link href="/app/watchlist">Add profiles</Link></Button>}
            />
          ) : (
            <div className="divide-y">
              {events.map((e) => <EventListItem key={e.id} event={e} profile={e.profile} />)}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
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

        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
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
    <div className="bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="tnum mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function EmptyState({ icon, title, body, cta }: { icon: React.ReactNode; title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background text-muted-foreground">
        {icon}
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
      {cta && <div className="mt-1">{cta}</div>}
    </div>
  );
}
