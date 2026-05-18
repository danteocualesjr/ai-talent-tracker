import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_DETAILS } from "@/lib/stripe";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);
  const plan = PLAN_DETAILS[org.plan];

  return (
    <div className="container max-w-3xl space-y-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current plan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold">{plan.name}</span>
              <Badge variant="secondary">{plan.price_monthly ? `$${plan.price_monthly}/mo` : "free"}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {org.profile_limit} profiles · {org.refresh_cadence} refresh
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link href="/pricing">Change plan</Link></Button>
            {org.stripe_customer_id && (
              <form action="/api/portal" method="post">
                <Button type="submit">Manage subscription</Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan benefits</CardTitle>
          <CardDescription>Included with your current plan</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {plan.features.map((f) => <li key={f}>• {f}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
