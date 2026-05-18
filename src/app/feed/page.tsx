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
          <div className="pointer-events-none absolute inset-0 grid-bg grid-fade opacity-50" />
          <div className="pointer-events-none absolute inset-0 gradient-mesh" />
          <div className="container relative py-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-emerald-500" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </div>
                <h1 className="mt-2 text-4xl font-semibold tracking-tighter md:text-5xl">
                  AI lab departure feed
                </h1>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  Public, real-time view of profile changes at top AI labs.{" "}
                  Want alerts the moment one happens? <Link href="/login" className="font-medium text-foreground underline underline-offset-4">Start tracking →</Link>
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href="/feed/rss.xml"><Rss className="mr-1 h-3 w-3" /> RSS</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="container max-w-3xl py-10">
          <div className="rounded-xl border bg-card">
            <div className="border-b px-5 py-3 text-sm font-medium">{events.length} recent events</div>
            <div className="px-3">
              {events.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  Feed is warming up. Check back soon.
                </div>
              ) : events.map((e) => <EventListItem key={e.id} event={e} profile={e.profile} href={`/feed/${e.id}`} />)}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
