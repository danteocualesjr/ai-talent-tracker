import Link from "next/link";
import { Suspense } from "react";
import { Clock, Compass, Filter, Rss, Sparkles, TrendingUp } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { LiveBadge, MarketingHero } from "@/components/marketing-hero";
import { EventListItem } from "@/components/event-row";
import { EmptyPanel, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { FeedFilterChips } from "@/components/feed-filter-chips";
import { FeedMobileCta } from "@/components/feed-mobile-cta";
import { ScrollToTop } from "@/components/scroll-to-top";
import { getPublicEvents } from "@/lib/queries";
import { formatAbsoluteDateTime, formatRelative, isHighConfidence } from "@/lib/utils";
import type { EventType } from "@/types/db";

export const metadata = {
  title: "AI lab departure feed",
  description: "Live, public feed of who's leaving OpenAI, Anthropic, DeepMind and other top AI labs.",
};

export const revalidate = 300;

const FILTER_TYPES: Record<string, EventType[]> = {
  departures: ["left_company"],
  stealth: ["went_stealth"],
  founders: ["headline_signals_founding"],
  joiners: ["joined_company"],
  github: ["github_dark"],
  location: ["location_changed"],
  about: ["about_changed"],
  role: ["role_change_internal"],
};

const FILTER_LABELS: Record<string, string> = {
  departures: "departures",
  stealth: "stealth moves",
  founders: "founder signals",
  joiners: "joiners",
  github: "GitHub dark signals",
  location: "location changes",
  about: "about updates",
  role: "role changes",
};

export default async function PublicFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; confidence?: string; days?: string }>;
}) {
  const { type, confidence, days } = await searchParams;
  const highOnly = confidence === "high";
  const last7Only = days === "7";
  const events = await getPublicEvents(100);
  const allowedTypes = type ? FILTER_TYPES[type] : undefined;
  const filtered = events.filter((event) => {
    if (allowedTypes && !allowedTypes.includes(event.type)) return false;
    if (highOnly && !isHighConfidence(event.confidence)) return false;
    if (last7Only && new Date(event.detected_at).getTime() <= Date.now() - 7 * 86400000) return false;
    return true;
  });
  const filterLabel = type ? FILTER_LABELS[type] : null;

  const last7 = events.filter((event) => new Date(event.detected_at).getTime() > Date.now() - 7 * 86400000).length;
  const highConfidence = events.filter((event) => isHighConfidence(event.confidence)).length;
  const foundingSignals = events.filter((event) => event.type === "headline_signals_founding" || event.type === "went_stealth").length;
  const latestDetectedAt = events[0]?.detected_at ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main id="main-content" className="flex-1">
        <MarketingHero
          eyebrow={<LiveBadge />}
          title="AI lab departure feed"
          description={
            <>
              Public, real-time view of profile changes at top AI labs. Want alerts the moment one happens?{" "}
              <Link href="/login" className="link-subtle">
                Start tracking →
              </Link>
            </>
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            {latestDetectedAt && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-[11px] font-medium text-muted-foreground"
                title={formatAbsoluteDateTime(latestDetectedAt) || undefined}
              >
                <Clock className="h-3 w-3 text-signal" />
                Updated {formatRelative(latestDetectedAt)}
              </span>
            )}
            <Button asChild variant="outline" size="sm" className="shrink-0 hover:border-signal/35 hover:bg-signal/5">
              <a href="/feed/rss.xml" aria-label="Subscribe to the public feed via RSS">
                <Rss className="h-3.5 w-3.5" aria-hidden /> RSS
              </a>
            </Button>
          </div>
        </MarketingHero>

        <section className="section-wash border-b border-border/50">
          <div className="container max-w-3xl space-y-5 py-10 pb-28 md:py-12 md:pb-12">
          <div className="stat-strip grid-cols-3 shadow-pop">
            <FeedStat
              label="Last 7 days"
              value={last7}
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              accent="text-signal"
              href={
                (() => {
                  const params = new URLSearchParams();
                  if (type) params.set("type", type);
                  if (highOnly) params.set("confidence", "high");
                  params.set("days", "7");
                  return `/feed?${params.toString()}`;
                })()
              }
            />
            <FeedStat
              label="High confidence"
              value={highConfidence}
              icon={<Sparkles className="h-3.5 w-3.5" />}
              accent="text-violet-accent"
              href={
                (() => {
                  const params = new URLSearchParams();
                  if (type) params.set("type", type);
                  params.set("confidence", "high");
                  if (last7Only) params.set("days", "7");
                  return `/feed?${params.toString()}`;
                })()
              }
            />
            <FeedStat label="Founder signals" value={foundingSignals} icon={<Compass className="h-3.5 w-3.5" />} accent="text-amber-accent" href="/feed?type=founders" />
          </div>

          <div className="surface-card corner-brackets relative flex flex-col gap-4 overflow-hidden p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-signal/80 via-signal to-signal/80" />
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal" aria-hidden>
                <Filter className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Scan by signal type</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prioritize departures, stealth pivots, and founding headlines from the public stream.
                </p>
              </div>
            </div>
            <Suspense fallback={<div className="h-8 w-48 animate-pulse rounded-md bg-muted/60" />}>
              <FeedFilterChips />
            </Suspense>
            {(highOnly || last7Only) ? (
              <p className="w-full text-xs text-muted-foreground sm:text-right" role="status">
                {highOnly ? "Showing high-confidence events only (≥80%). " : ""}
                {last7Only ? "Limited to the last 7 days. " : ""}
                <Link
                  href={type ? `/feed?type=${type}` : "/feed"}
                  className="link-subtle text-xs font-semibold"
                >
                  Clear filters
                </Link>
              </p>
            ) : null}
          </div>

          <Panel
            title={
              filterLabel ? (
                <>
                  <span className="tnum">{filtered.length}</span> {filterLabel}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    of <span className="tnum">{events.length}</span> total
                  </span>
                </>
              ) : (
                <>
                  <span className="tnum">{events.length}</span> recent events
                </>
              )
            }
            action={
              latestDetectedAt ? (
                <span className="tnum text-xs text-muted-foreground">
                  Latest {formatRelative(latestDetectedAt)}
                </span>
              ) : undefined
            }
            bodyClassName="divide-y divide-border/60"
          >
            {filtered.length === 0 ? (
              <EmptyPanel
                icon={filterLabel ? <Filter className="h-5 w-5" /> : <Rss className="h-5 w-5" />}
                title={filterLabel || highOnly || last7Only ? (filterLabel ? `No ${filterLabel} in this window` : highOnly ? "No high-confidence events in this window" : "No events in the last 7 days") : "Feed is warming up"}
                body={
                  filterLabel || highOnly || last7Only
                    ? "Try another signal type or clear the filter to see the full stream."
                    : "We're indexing the first departures. Check back soon or subscribe via RSS."
                }
                cta={
                  filterLabel || highOnly || last7Only ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/feed">Clear filter</Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              filtered.map((e) => <EventListItem key={e.id} event={e} profile={e.profile} href={`/feed/${e.id}`} />)
            )}
          </Panel>

          <div className="surface-card relative hidden overflow-hidden p-5 sm:block">
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-signal/60 to-transparent" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold">Get these as alerts</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track 5 profiles free and ping Slack the moment a researcher goes stealth.
                </p>
              </div>
              <Button asChild variant="signal" size="sm" className="shrink-0">
                <Link href="/login">Start tracking free</Link>
              </Button>
            </div>
          </div>
          </div>
        </section>
      </main>
      <FeedMobileCta />
      <MarketingFooter />
      <ScrollToTop />
    </div>
  );
}

function FeedStat({
  label,
  value,
  icon,
  accent = "text-muted-foreground",
  href,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  accent?: string;
  href?: string;
}) {
  const inner = (
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="tnum font-serif text-3xl font-medium tracking-tight transition-colors group-hover/stat:text-signal">{value}</div>
          <div className="mt-1.5 label-caps text-muted-foreground transition-colors group-hover/stat:text-foreground/70">{label}</div>
        </div>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-muted/60 shadow-sm ${accent} motion-safe:transition-all motion-safe:group-hover/stat:scale-105 motion-safe:group-hover/stat:border-signal/30 motion-safe:group-hover/stat:bg-signal/10`} aria-hidden>
            {icon}
          </div>
        )}
      </div>
  );
  if (href) {
    return (
      <Link
        href={href}
        aria-label={`Filter feed to ${label.toLowerCase()} (${value})`}
        className="stat-strip-item group/stat block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/30"
      >
        {inner}
      </Link>
    );
  }
  return <div className="stat-strip-item group/stat">{inner}</div>;
}
