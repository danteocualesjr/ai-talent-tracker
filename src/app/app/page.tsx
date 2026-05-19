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
    <div className="container max-w-6xl space-y-8 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              {profiles.length} / {org.profile_limit} profiles
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span>Refresh: {org.refresh_cadence}</span>
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/app/watchlist"><Plus className="mr-2 h-4 w-4" /> Add profile</Link>
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tracked profiles" value={profiles.length} icon={<Users2 className="h-4 w-4" />} sub={`Limit: ${org.profile_limit}`} />
        <StatCard label="Events (30d)" value={last30} icon={<Activity className="h-4 w-4" />} tone="emerald" sub="across your watchlists" />
        <StatCard label="Stealth + founders" value={stealth + founders} icon={<Sparkles className="h-4 w-4" />} tone="amber" sub={`${stealth} stealth · ${founders} founder`} />
        <StatCard label="Departures" value={left} icon={<AlertTriangle className="h-4 w-4" />} tone="rose" sub="profiles flagged left" />
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <Activity className="h-4 w-4 text-primary" />
              Recent activity
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground">Latest detected changes across your watchlists</div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/app/events">View all</Link>
          </Button>
        </div>
        <div className="p-3">
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <div className="flex items-center gap-2.5 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              Your plan
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{plan.name}</span>
              <span className="text-sm text-muted-foreground">
                {plan.price_monthly ? `$${plan.price_monthly}/mo` : "Free"}
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="sm" className="mt-5">
              <Link href="/app/billing">Manage plan</Link>
            </Button>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 transition-all duration-300 hover:shadow-lg dark:from-amber-950/30 dark:to-orange-950/20">
          <div className="relative">
            <div className="flex items-center gap-2.5 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Get notified faster
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Add a Slack webhook to get alerts in seconds — much faster than email. Never miss a stealth flip again.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-5">
              <Link href="/app/alerts">Configure alerts</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const TONE_MAP: Record<string, { bg: string; icon: string; border: string }> = {
  default: { 
    bg: "bg-muted", 
    icon: "text-foreground", 
    border: "hover:border-foreground/20" 
  },
  emerald: { 
    bg: "bg-emerald-100 dark:bg-emerald-950/50", 
    icon: "text-emerald-600 dark:text-emerald-400", 
    border: "hover:border-emerald-300 dark:hover:border-emerald-800" 
  },
  amber: { 
    bg: "bg-amber-100 dark:bg-amber-950/50", 
    icon: "text-amber-600 dark:text-amber-400", 
    border: "hover:border-amber-300 dark:hover:border-amber-800" 
  },
  rose: { 
    bg: "bg-rose-100 dark:bg-rose-950/50", 
    icon: "text-rose-600 dark:text-rose-400", 
    border: "hover:border-rose-300 dark:hover:border-rose-800" 
  },
};

function StatCard({ label, value, icon, sub, tone = "default" }: { label: string; value: string | number; icon: React.ReactNode; sub?: string; tone?: keyof typeof TONE_MAP }) {
  const colors = TONE_MAP[tone];
  return (
    <div className={`group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-lg ${colors.border}`}>
      <div className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 ${tone !== "default" ? `bg-gradient-to-br from-${tone === "emerald" ? "emerald" : tone === "amber" ? "amber" : tone === "rose" ? "rose" : "muted"}-500/5 to-transparent` : ""}`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.bg} ${colors.icon} transition-transform group-hover:scale-110`}>{icon}</div>
        </div>
        <div className="mt-3 text-4xl font-bold tabular-nums tracking-tight">{value}</div>
        {sub && <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, body, cta }: { icon: React.ReactNode; title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary">
        {icon}
      </div>
      <div className="font-semibold">{title}</div>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
      {cta && <div className="mt-2">{cta}</div>}
    </div>
  );
}
