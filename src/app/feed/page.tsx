import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventListItem } from "@/components/event-row";
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
      <main className="container max-w-3xl space-y-6 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">AI lab departure feed</h1>
          <p className="mt-2 text-muted-foreground">
            Public, real-time view of profile changes at top AI labs. Want alerts the moment one of these happens?{" "}
            <Link href="/login" className="font-medium text-foreground underline">Start tracking →</Link>
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{events.length} recent events</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Feed is warming up. Check back soon.
              </div>
            ) : events.map((e) => <EventListItem key={e.id} event={e} profile={e.profile} href={`/feed/${e.id}`} />)}
          </CardContent>
        </Card>
      </main>
      <MarketingFooter />
    </div>
  );
}
