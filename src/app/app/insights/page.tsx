import Link from "next/link";
import { ArrowRight, BarChart3, Sparkles, TrendingUp, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { getOrgInsights, listOrgProfiles } from "@/lib/queries";
import { labelForEventType } from "@/lib/event-labels";
import { PageHeader } from "@/components/page-header";
import { Panel, EmptyPanel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { ActivityBarChart, buildDayLabels } from "@/components/activity-bar-chart";
import { formatRelative } from "@/lib/utils";
import { CopyBriefButton } from "./copy-brief-button";

export const metadata = { title: "Insights" };

const DAYS = 30;

export default async function InsightsPage() {
  const supa = await createClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);

  const [insights, profiles] = await Promise.all([
    getOrgInsights(org.id, DAYS),
    listOrgProfiles(org.id),
  ]);

  const dayLabels = buildDayLabels(DAYS);
  const avgPerDay = insights.totalEvents > 0 ? (insights.totalEvents / DAYS).toFixed(1) : "0";
  const peakDate = dayLabels[insights.peakDayIndex];
  const peakLabel = peakDate
    ? new Date(peakDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "n/a";

  const briefText = buildBriefMarkdown(org.name, insights, peakLabel, Number(avgPerDay), profiles.length);

  const maxTypeCount = insights.byType[0]?.count ?? 1;

  return (
    <div className="container max-w-5xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="Insights"
        eyebrow="Analytics"
        icon={<BarChart3 className="h-4 w-4" />}
        description="Signal mix, activity trends, and top movers across your watchlist."
        divider
      >
        <CopyBriefButton text={briefText} />
      </PageHeader>

      {profiles.length === 0 ? (
        <EmptyPanel
          icon={<Users2 className="h-5 w-5" />}
          title="No watchlist data yet"
          body="Add profiles to see event trends, signal breakdowns, and ranked movers."
          cta={
            <Button asChild variant="signal">
              <Link href="/app/watchlist">Build watchlist</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label={`Events (${DAYS}d)`}
              value={insights.totalEvents}
              sub={`~${avgPerDay} / day avg`}
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              accent="text-signal"
              accentBar="via-signal/45"
              href="/app/events"
            />
            <MetricCard
              label="Busiest day"
              value={insights.peakDayCount}
              sub={peakLabel}
              icon={<Sparkles className="h-3.5 w-3.5" />}
              accent="text-amber-accent"
              accentBar="via-amber-500/40"
              href="/app/events"
            />
            <MetricCard
              label="Tracked profiles"
              value={profiles.length}
              sub={`Limit ${org.profile_limit}`}
              icon={<Users2 className="h-3.5 w-3.5" />}
              accent="text-violet-accent"
              accentBar="via-violet-500/40"
              href="/app/watchlist"
            />
          </div>

          <Panel
            title="Activity"
            description={`Detected changes per day over the last ${DAYS} days`}
            bodyClassName="p-5 sm:p-6"
          >
            {insights.totalEvents === 0 ? (
              <p className="text-sm text-muted-foreground">
                No events in this window yet. Refreshes run on your plan cadence (
                {org.refresh_cadence}).
              </p>
            ) : (
              <ActivityBarChart data={insights.dailyCounts} labels={dayLabels} height={140} />
            )}
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Signal mix" description="Event types ranked by volume" bodyClassName="p-5 sm:p-6">
              {insights.byType.length === 0 ? (
                <p className="text-sm text-muted-foreground">No classified events yet.</p>
              ) : (
                <ul className="space-y-3">
                  {insights.byType.map(({ type, count }) => {
                    const pct = Math.round((count / insights.totalEvents) * 100);
                    const label = labelForEventType(type);
                    return (
                      <li key={type}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium" id={`signal-mix-${type}`}>{label}</span>
                          <span className="tnum text-muted-foreground">
                            {count}{" "}
                            <span className="text-[11px]">({pct}%)</span>
                          </span>
                        </div>
                        <div
                          className="progress-track mt-1.5"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={insights.totalEvents}
                          aria-valuenow={count}
                          aria-labelledby={`signal-mix-${type}`}
                          aria-valuetext={`${count} of ${insights.totalEvents} events (${pct} percent)`}
                        >
                          <div
                            className="progress-fill h-full"
                            style={{ width: `${Math.max(4, (count / maxTypeCount) * 100)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            <Panel
              title="Top movers"
              description="Profiles with the most detected changes"
              action={
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                  <Link href="/app/events">
                    All events <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              }
              bodyClassName="divide-y divide-border/60"
            >
              {insights.topProfiles.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">No movers in this period.</p>
              ) : (
                insights.topProfiles.map((row, index) => (
                  <Link
                    key={row.profileId}
                    href={`/app/profiles/${row.profileId}`}
                    className="group flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/30"
                  >
                    <span
                      className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-[11px] font-bold text-muted-foreground group-hover:border-signal/30 group-hover:text-signal"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold group-hover:text-signal">{row.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Latest {labelForEventType(row.latestType).toLowerCase()} ·{" "}
                        {formatRelative(row.latestAt)}
                      </div>
                    </div>
                    <span className="tnum shrink-0 rounded-full bg-signal/10 px-2.5 py-0.5 text-xs font-bold text-signal">
                      {row.count}
                    </span>
                  </Link>
                ))
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  accent,
  accentBar,
  href,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  accent: string;
  accentBar: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div
        className={`pointer-events-none absolute inset-x-4 top-0 h-0.5 rounded-full bg-gradient-to-r from-transparent ${accentBar} to-transparent opacity-90`}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="label-caps">{label}</div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-muted/60 ${accent}`} aria-hidden>
          {icon}
        </div>
      </div>
      <div className="tnum mt-2 font-serif text-3xl font-bold tracking-tight transition-colors group-hover:text-signal">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`Open ${label}`}
        className="surface-card surface-card-hover group relative block overflow-hidden p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/30"
      >
        {body}
      </Link>
    );
  }

  return (
    <div className="surface-card surface-card-hover relative overflow-hidden p-5">
      {body}
    </div>
  );
}

function buildBriefMarkdown(
  orgName: string,
  insights: Awaited<ReturnType<typeof getOrgInsights>>,
  peakLabel: string,
  avgPerDay: number,
  profileCount: number,
): string {
  const date = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const lines = [
    `# ${orgName} - signal brief`,
    `_${date}_`,
    "",
    `**${insights.totalEvents}** events in the last ${insights.days} days (~${avgPerDay}/day) · **${profileCount}** profiles tracked`,
    "",
    "## Signal mix",
    ...(insights.byType.length
      ? insights.byType.map(({ type, count }) => `- ${labelForEventType(type)}: ${count}`)
      : ["- No events yet"]),
    "",
    "## Top movers",
    ...(insights.topProfiles.length
      ? insights.topProfiles.slice(0, 5).map((p) => `- ${p.name}: ${p.count} (${labelForEventType(p.latestType)})`)
      : ["- None yet"]),
    "",
    `Busiest day: **${peakLabel}** (${insights.peakDayCount} events)`,
    "",
    "- Generated by AI Talent Tracker",
  ];
  return lines.join("\n");
}
