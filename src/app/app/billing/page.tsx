import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
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
    <div className="container max-w-3xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader title="Billing" description="Manage your subscription and plan limits." />

      <Panel bodyClassName="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="label-caps">Current plan</div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-bold tracking-tight">{plan.name}</span>
              <Badge variant="secondary">{plan.price_monthly ? `$${plan.price_monthly}/mo` : "free"}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="tnum font-semibold text-foreground">{org.profile_limit}</span> profiles ·{" "}
              {org.refresh_cadence} refresh
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/pricing">Change plan</Link>
            </Button>
            {org.stripe_customer_id && (
              <form action="/api/portal" method="post">
                <Button type="submit">Manage subscription</Button>
              </form>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="Included features" bodyClassName="p-6">
        <ul className="grid gap-3 sm:grid-cols-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
