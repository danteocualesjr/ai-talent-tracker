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
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profiles.length} of {org.profile_limit} profiles · refresh cadence: {org.refresh_cadence}
          </p>
        </div>
        <Button asChild>
          <Link href="/app/watchlist"><Plus className="mr-1 h-4 w-4" /> Add profile</Link>
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tracked profiles" value={profiles.length} icon={<Users2 className="h-4 w-4" />} sub={`Limit: ${org.profile_limit}`} />
        <StatCard label="Events (30d)" value={last30} icon={<Activity className="h-4 w-4" />} tone="emerald" sub="across your watchlists" />
        <StatCard label="Stealth + founders" value={stealth + founders} icon={<Sparkles className="h-4 w-4" />} tone="amber" sub={`${stealth} stealth · ${founders} founder`} />
        <StatCard label="Departures" value={left} icon={<AlertTriangle className="h-4 w-4" />} tone="rose" sub="profiles flagged left" />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <div className="font-semibold">Recent activity</div>
            <div className="text-xs text-muted-foreground">Latest detected changes across your watchlists</div>
          </div>
          <Button asChild variant="ghost" size="sm"><Link href="/app/events">View all →</Link></Button>
        </div>
        <div className="p-2">
          {events.length === 0 ? (
            <EmptyState
              icon={<Bell className="h-6 w-6" />}
              title="No events yet"
              body="Add a few profiles and we'll start watching. The first refresh runs immediately, then on your plan's cadence."
              cta={<Button asChild><Link href="/app/watchlist">Add profiles</Link></Button>}
            />
          ) : (
            <div className="px-3">
              {events.map((e) => <EventListItem key={e.id} event={e} profile={e.profile} />)}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4" /> Your plan
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{plan.name}</span>
            <span className="text-sm text-muted-foreground">
              {plan.price_monthly ? `$${plan.price_monthly}/mo` : "Free"}
            </span>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground" />
                {f}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/app/billing">Manage plan</Link>
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="h-4 w-4" /> Get notified faster
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Add a Slack webhook to get alerts in seconds — much faster than email.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/app/alerts">Configure alerts</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

const TONE_MAP: Record<string, string> = {
  default: "bg-muted text-foreground",
  emerald: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  amber:   "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  rose:    "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200",
};

function StatCard({ label, value, icon, sub, tone = "default" }: { label: string; value: string | number; icon: React.ReactNode; sub?: string; tone?: keyof typeof TONE_MAP }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${TONE_MAP[tone]}`}>{icon}</div>
      </div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function EmptyState({ icon, title, body, cta }: { icon: React.ReactNode; title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="font-medium">{title}</div>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {cta && <div className="mt-2">{cta}</div>}
    </div>
  );
}
