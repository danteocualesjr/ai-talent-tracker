import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  Plus,
  Sparkles,
  TrendingUp,
  Users2,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { getOrgEvents, listOrgProfiles } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { EmptyPanel, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { EventListItem } from "@/components/event-row";
import { Sparkline, buildTrendSeries } from "@/components/sparkline";
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
  const last7 = events.filter((e) => new Date(e.detected_at).getTime() > Date.now() - 7 * 86400000).length;
  const fill = Math.min(100, (profiles.length / org.profile_limit) * 100);
  const priorityEvents = events
    .filter((event) => event.confidence >= 0.8 || event.type === "went_stealth" || event.type === "headline_signals_founding")
    .slice(0, 3);

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
            <span className="mx-2 text-border">·</span>
            <span className="inline-flex items-center gap-1.5 text-signal">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
              </span>
              <span className="font-medium">Live</span>
            </span>
          </>
        }
      >
        <Button asChild>
          <Link href="/app/watchlist"><Plus className="h-4 w-4" /> Add profile</Link>
        </Button>
      </PageHeader>

      {/* Stat cards with sparklines */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Tracked profiles"
          value={profiles.length}
          icon={<Users2 className="h-3.5 w-3.5" />}
          sub={`Limit ${org.profile_limit}`}
          accent="text-foreground/70"
          series={buildTrendSeries(profiles.length || 1, 14, 0.4)}
        />
        <StatCard
          label="Events (7d)"
          value={last7}
          icon={<Activity className="h-3.5 w-3.5" />}
          sub={`${last30} in last 30 days`}
          accent="text-signal"
          series={buildTrendSeries(last7 || 2, 14, 0.6)}
        />
        <StatCard
          label="Stealth + founders"
          value={stealth + founders}
          icon={<Sparkles className="h-3.5 w-3.5" />}
          sub={`${stealth} stealth · ${founders} founder`}
          accent="text-amber-accent"
          series={buildTrendSeries(stealth + founders || 1, 14, 0.5)}
        />
        <StatCard
          label="Departures"
          value={left}
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          sub="flagged left"
          accent="text-violet-accent"
          series={buildTrendSeries(left || 1, 14, 0.5)}
        />
      </div>

      {/* Plan-capacity bar */}
      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5 text-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold capitalize">{org.name}</div>
            <div className="text-[11px] text-muted-foreground capitalize">{plan.name} plan</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">Watchlist capacity</span>
            <span className="tnum font-semibold">
              {profiles.length}
              <span className="text-muted-foreground"> / {org.profile_limit}</span>
            </span>
          </div>
          <div className="progress-track mt-2">
            <div className="progress-fill" style={{ width: `${fill}%` }} />
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/app/billing">Manage <ArrowUpRight className="h-3 w-3" /></Link>
        </Button>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="label-caps">Priority moves</div>
            <h2 className="mt-1 text-lg font-bold tracking-tight">Highest-confidence changes to review first</h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/app/events">Open event inbox <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </div>
        <div className="grid divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
          {priorityEvents.length === 0 ? (
            <div className="p-5 text-sm text-muted-foreground md:col-span-3">
              No priority moves yet. Add profiles and high-confidence stealth or founding signals will appear here.
            </div>
          ) : (
            priorityEvents.map((event) => (
              <Link key={event.id} href={`/app/profiles/${event.profile.id}`} className="group block p-5 transition-colors hover:bg-muted/30">
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate text-sm font-semibold">{event.profile.full_name ?? event.profile.linkedin_handle}</div>
                  <span className="tnum rounded-full bg-signal/10 px-2 py-0.5 text-[11px] font-semibold text-signal">
                    {Math.round(event.confidence * 100)}%
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{event.summary}</p>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Activity feed */}
      <Panel
        title="Recent activity"
        description="Latest detected changes across your watchlists"
        action={
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link href="/app/events">View all <ArrowRight className="h-3 w-3" /></Link>
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
          events.slice(0, 8).map((e) => <EventListItem key={e.id} event={e} profile={e.profile} />)
        )}
      </Panel>

      {/* Plan + nudge */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="surface-card md:col-span-2 flex flex-col p-6">
          <div className="flex items-center justify-between">
            <div className="label-caps flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" /> Your plan
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Link href="/app/billing">Manage <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight">{plan.name}</span>
            <span className="text-sm text-muted-foreground">
              {plan.price_monthly ? `$${plan.price_monthly}/mo` : "Free"}
            </span>
          </div>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card relative flex flex-col overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-signal/10 blur-3xl" />
          <div className="label-caps flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-signal" /> Slack alerts
          </div>
          <h3 className="mt-3 text-base font-bold tracking-tight">Get notified in seconds</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            Wire up an incoming webhook so your team sees stealth flips the moment they happen.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link href="/app/alerts">Configure alerts <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  sub,
  series,
  accent = "text-signal",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  series?: number[];
  accent?: string;
}) {
  return (
    <div className="surface-card surface-card-hover relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </div>
        <div className="text-muted-foreground/60">{icon}</div>
      </div>
      <div className="tnum mt-3 text-3xl font-bold tracking-tight">{value}</div>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        {series && (
          <div className={`shrink-0 ${accent}`}>
            <Sparkline data={series} width={64} height={22} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </div>
  );
}
