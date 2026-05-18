import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { getOrgEvents, listOrgProfiles } from "@/lib/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventListItem } from "@/components/event-row";
import { PLAN_DETAILS } from "@/lib/stripe";
import { Plus } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);

  const [events, profiles] = await Promise.all([getOrgEvents(org.id, 20), listOrgProfiles(org.id)]);
  const plan = PLAN_DETAILS[org.plan];

  return (
    <div className="container max-w-5xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {profiles.length} of {org.profile_limit} profiles · refresh cadence: {org.refresh_cadence}
          </p>
        </div>
        <Button asChild>
          <Link href="/app/watchlist"><Plus className="mr-1 h-4 w-4" /> Add profile</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Tracked profiles" value={profiles.length} sub={`Limit: ${org.profile_limit}`} />
        <StatCard label="Events (30d)" value={events.length} sub="across your watchlists" />
        <StatCard label="Plan" value={plan.name} sub={plan.price_monthly ? `$${plan.price_monthly}/mo` : "free"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest detected changes across your watchlists.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No events yet. Add a few profiles and we&apos;ll start watching.
              <div className="mt-3"><Button asChild><Link href="/app/watchlist">Add profiles</Link></Button></div>
            </div>
          ) : (
            <div>
              {events.map((e) => <EventListItem key={e.id} event={e} profile={e.profile} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      {sub && <CardContent className="text-xs text-muted-foreground">{sub}</CardContent>}
    </Card>
  );
}
