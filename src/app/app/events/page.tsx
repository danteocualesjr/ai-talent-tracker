import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { getOrgEvents } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventListItem } from "@/components/event-row";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);
  const events = await getOrgEvents(org.id, 200);

  return (
    <div className="container max-w-5xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">All detected changes across your watchlists.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{events.length} events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No events yet.</div>
          ) : (
            events.map((e) => <EventListItem key={e.id} event={e} profile={e.profile} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
