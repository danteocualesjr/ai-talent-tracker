import Link from "next/link";
import { Rss } from "lucide-react";
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

        <section className="container max-w-3xl py-10 md:py-12">
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
              events
                .filter((e): e is typeof e & { profile: NonNullable<typeof e.profile> } => Boolean(e.profile))
                .map((e) => <EventListItem key={e.id} event={e} profile={e.profile} href={`/feed/${e.id}`} />)
            )}
          </Panel>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
