import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CreditCard, RefreshCw, Users2, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { listOrgProfiles } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_DETAILS } from "@/lib/stripe";
import { cn } from "@/lib/utils";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);
  const plan = PLAN_DETAILS[org.plan];
  const profiles = await listOrgProfiles(org.id);
  const fill = Math.min(100, (profiles.length / org.profile_limit) * 100);
  const capacityTone =
    fill >= 100 ? "full" : fill >= 85 ? "warning" : "default";

  return (
    <div className="container max-w-3xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="Billing"
        eyebrow="Workspace"
        icon={<CreditCard className="h-4 w-4" />}
        description="Manage your subscription and plan limits."
        divider
      />

      <div className="surface-card overflow-hidden">
        <div className="border-b border-border/60 bg-gradient-to-br from-card via-card to-signal/[0.04] p-6">
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
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <BillingMetric label="Profiles used" value={profiles.length} sub={`of ${org.profile_limit}`} icon={<Users2 className="h-3.5 w-3.5" />} accent="text-signal" />
          <BillingMetric label="Refresh cadence" value={org.refresh_cadence} icon={<RefreshCw className="h-3.5 w-3.5" />} accent="text-violet-accent" capitalize />
          <BillingMetric label="Plan tier" value={plan.name} icon={<Zap className="h-3.5 w-3.5" />} accent="text-amber-accent" capitalize />
        </div>
        <div className="border-t border-border/60 px-6 pb-6">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">Watchlist capacity</span>
            <span className="tnum font-semibold">
              {profiles.length}
              <span className="text-muted-foreground"> / {org.profile_limit}</span>
            </span>
          </div>
          <div className="progress-track mt-2" role="progressbar" aria-valuemin={0} aria-valuemax={org.profile_limit} aria-valuenow={profiles.length} aria-label="Watchlist capacity">
            <div
              className={cn(
                "progress-fill",
                capacityTone === "warning" && "!from-amber-500/90 !to-amber-500",
                capacityTone === "full" && "!from-destructive/90 !to-destructive",
              )}
              style={{ width: `${fill}%` }}
            />
          </div>
          {capacityTone !== "default" && (
            <p
              className={cn(
                "mt-2 text-[11px] font-medium",
                capacityTone === "full" ? "text-destructive" : "text-amber-700 dark:text-amber-400",
              )}
            >
              {capacityTone === "full"
                ? "Profile limit reached — upgrade or remove profiles."
                : "Almost at your profile limit."}
            </p>
          )}
        </div>
      </div>

      {org.plan === "free" && (
        <div className="surface-card relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-signal/10 blur-2xl" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Need real-time alerts?</div>
              <p className="mt-1 text-xs text-muted-foreground">Upgrade to Pro for Slack delivery, daily refresh, and 100 profiles.</p>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link href="/pricing">
                View plans <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      <Panel title="Included features" bodyClassName="p-6">
        <ul className="grid gap-3 sm:grid-cols-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 rounded-lg border border-transparent p-2 text-sm transition-colors hover:border-border/60 hover:bg-muted/30">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function BillingMetric({
  label,
  value,
  sub,
  icon,
  accent = "text-muted-foreground",
  capitalize,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  accent?: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
      <div className="flex items-start justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        {icon && (
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-muted/80 ${accent}`}>
            {icon}
          </div>
        )}
      </div>
      <div className={`tnum mt-2 text-xl font-bold ${capitalize ? "capitalize" : ""}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
