import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
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
      <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>

      <div className="rounded-2xl border bg-gradient-to-br from-card to-muted/30 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Current plan</div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">{plan.name}</span>
              <Badge variant="secondary">{plan.price_monthly ? `$${plan.price_monthly}/mo` : "free"}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {org.profile_limit} profiles · {org.refresh_cadence} refresh
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link href="/pricing">Change plan</Link></Button>
            {org.stripe_customer_id && (
              <form action="/api/portal" method="post">
                <Button type="submit">Manage subscription</Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="text-sm font-semibold">Included features</div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
