import Link from "next/link";
import { Suspense } from "react";
import { Compass, Filter, Rss, Sparkles, TrendingUp } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { LiveBadge, MarketingHero } from "@/components/marketing-hero";
import { EventListItem } from "@/components/event-row";
import { EmptyPanel, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { FeedFilterChips } from "@/components/feed-filter-chips";
import { FeedMobileCta } from "@/components/feed-mobile-cta";
import { getPublicEvents } from "@/lib/queries";
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
};

const FILTER_LABELS: Record<string, string> = {
  departures: "departures",
  stealth: "stealth moves",
  founders: "founder signals",
  joiners: "joiners",
};

export default async function PublicFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const events = await getPublicEvents(100);
  const allowedTypes = type ? FILTER_TYPES[type] : undefined;
  const filtered = allowedTypes ? events.filter((event) => allowedTypes.includes(event.type)) : events;
  const filterLabel = type ? FILTER_LABELS[type] : null;

  const last7 = events.filter((event) => new Date(event.detected_at).getTime() > Date.now() - 7 * 86400000).length;
  const highConfidence = events.filter((event) => event.confidence >= 0.8).length;
  const foundingSignals = events.filter((event) => event.type === "headline_signals_founding" || event.type === "went_stealth").length;

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
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
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href="/feed/rss.xml">
              <Rss className="h-3.5 w-3.5" /> RSS
            </a>
          </Button>
        </MarketingHero>

        <section className="container max-w-3xl space-y-5 py-10 pb-28 md:py-12 md:pb-12">
          <div className="grid gap-3 sm:grid-cols-3">
            <FeedStat label="Last 7 days" value={last7} icon={<TrendingUp className="h-3.5 w-3.5" />} accent="text-signal" />
            <FeedStat label="High confidence" value={highConfidence} icon={<Sparkles className="h-3.5 w-3.5" />} accent="text-violet-accent" />
            <FeedStat label="Founder signals" value={foundingSignals} icon={<Compass className="h-3.5 w-3.5" />} accent="text-amber-accent" />
          </div>

          <div className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Scan by signal type</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Prioritize departures, stealth pivots, and founding headlines from the public stream.
              </p>
            </div>
            <Suspense fallback={<div className="h-8 w-48 animate-pulse rounded-full bg-muted/60" />}>
              <FeedFilterChips />
            </Suspense>
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
            bodyClassName="divide-y divide-border/60"
          >
            {filtered.length === 0 ? (
              <EmptyPanel
                icon={filterLabel ? <Filter className="h-5 w-5" /> : <Rss className="h-5 w-5" />}
                title={filterLabel ? `No ${filterLabel} in this window` : "Feed is warming up"}
                body={
                  filterLabel
                    ? "Try another signal type or clear the filter to see the full stream."
                    : "We're indexing the first departures. Check back soon or subscribe via RSS."
                }
                cta={
                  filterLabel ? (
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
        </section>
      </main>
      <FeedMobileCta />
      <MarketingFooter />
    </div>
  );
}

function FeedStat({
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-gradient-to-r from-transparent via-signal/60 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
      <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-signal/5 blur-2xl opacity-60 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="tnum text-2xl font-bold tracking-tight">{value}</div>
          <div className="mt-1 label-caps text-muted-foreground">{label}</div>
        </div>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80 transition-transform duration-200 motion-safe:group-hover:scale-110 ${accent}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
