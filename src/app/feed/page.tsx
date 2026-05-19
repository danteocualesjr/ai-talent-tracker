import Link from "next/link";
import { Rss } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { EventListItem } from "@/components/event-row";
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
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
          <div className="container relative py-14 md:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                  </span>
                  <span className="text-foreground">Live</span>
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                  AI lab departure feed
                </h1>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  Public, real-time view of profile changes at top AI labs.{" "}
                  Want alerts the moment one happens?{" "}
                  <Link href="/login" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
                    Start tracking →
                  </Link>
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href="/feed/rss.xml"><Rss className="h-3 w-3" /> RSS</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="container max-w-3xl py-10">
          <div className="rounded-lg border bg-card">
            <div className="border-b px-5 py-3 text-sm font-semibold">
              <span className="tnum">{events.length}</span> recent events
            </div>
            {events.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Feed is warming up. Check back soon.
              </div>
            ) : (
              <div className="divide-y">
                {events.map((e) => <EventListItem key={e.id} event={e} profile={e.profile} href={`/feed/${e.id}`} />)}
              </div>
            )}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
