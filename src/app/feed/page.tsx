import Link from "next/link";
import { Compass, Rss, Sparkles, TrendingUp } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { LiveBadge, MarketingHero } from "@/components/marketing-hero";
import { EventListItem } from "@/components/event-row";
import { EmptyPanel, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { getPublicEvents } from "@/lib/queries";

export const metadata = {
  title: "AI lab departure feed",
  description: "Live, public feed of who's leaving OpenAI, Anthropic, DeepMind and other top AI labs.",
};

export const revalidate = 300;

export default async function PublicFeedPage() {
  const events = await getPublicEvents(100);
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

        <section className="container max-w-3xl space-y-5 py-10 md:py-12">
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
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {["Departures", "Stealth", "Founders", "Joiners"].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="chip cursor-default hover:border-signal/25 hover:bg-signal/5 hover:text-foreground"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <Panel
            title={
              <>
                <span className="tnum">{events.length}</span> recent events
              </>
            }
            bodyClassName="divide-y divide-border/60"
          >
            {events.length === 0 ? (
              <EmptyPanel
                icon={<Rss className="h-5 w-5" />}
                title="Feed is warming up"
                body="We're indexing the first departures. Check back soon or subscribe via RSS."
              />
            ) : (
              events.map((e) => <EventListItem key={e.id} event={e} profile={e.profile} href={`/feed/${e.id}`} />)
            )}
          </Panel>
        </section>
      </main>
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
