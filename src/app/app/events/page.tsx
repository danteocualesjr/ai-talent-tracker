import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { getOrgEvents } from "@/lib/queries";
import { EventListItem } from "@/components/event-row";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);
  const events = await getOrgEvents(org.id, 200);

  return (
    <div className="container max-w-4xl space-y-6 py-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">All detected changes across your watchlists.</p>
      </header>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="text-sm font-medium">{events.length} events</div>
          <div className="text-xs text-muted-foreground">
            Public events also appear on <Link href="/feed" className="underline">/feed</Link>
          </div>
        </div>
        <div className="px-3 pb-1">
          {events.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Bell className="h-6 w-6" />
              </div>
              <div className="font-medium">No events yet</div>
              <p className="max-w-sm text-sm text-muted-foreground">
                Once a tracked profile changes company, headline, or location, you&apos;ll see it here.
              </p>
              <Button asChild className="mt-2"><Link href="/app/watchlist">Add profiles</Link></Button>
            </div>
          ) : (
            events.map((e) => <EventListItem key={e.id} event={e} profile={e.profile} />)
          )}
        </div>
      </div>
    </div>
  );
}
