import Link from "next/link";
import { Check, Rocket, Users2, Zap } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHero } from "@/components/marketing-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_DETAILS } from "@/lib/stripe";
import { CheckoutButton } from "./checkout-button";
import { PricingStatusToast } from "./pricing-status-toast";

export const metadata = {
  title: "Pricing",
  description: "Free, Pro $49/mo, Team $299/mo, and Enterprise tiers for AI Talent Tracker.",
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return (
    <div className="flex min-h-screen flex-col">
      <PricingStatusToast status={status} />
      <MarketingNav />
      <main className="flex-1">
        <MarketingHero
          align="center"
          eyebrow={<div className="label-caps">Pricing</div>}
          title="Simple pricing."
          description="Start free. Pay when you need real-time alerts at scale."
        />

        <section className="border-b bg-muted/20">
          <div className="container max-w-6xl py-14">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <PlanCard slug="free" priceEnv={null} ctaHref="/login" cta="Start free" />
              <PlanCard slug="pro" priceEnv={process.env.STRIPE_PRICE_PRO} highlighted />
              <PlanCard slug="team" priceEnv={process.env.STRIPE_PRICE_TEAM} />
              <PlanCard slug="enterprise" priceEnv={null} ctaHref="mailto:hello@aitalenttracker.com" cta="Contact us" />
            </div>
            <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
              All paid plans include the public departure feed. Cancel anytime. Prices in USD.
            </p>
          </div>
        </section>

        <section className="container max-w-6xl py-14 md:py-16">
          <div className="surface-card overflow-hidden">
            <div className="border-b border-border/60 p-6 md:p-8">
              <div className="label-caps">Plan guide</div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                Pick the workspace that matches your signal volume.
              </h2>
            </div>
            <div className="grid divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
              {([
                { persona: "Scout", plan: "Free", description: "Validate a handful of strategic researchers before committing budget.", icon: Rocket, accent: "text-muted-foreground" },
                { persona: "Operator", plan: "Pro", description: "Monitor one target market with Slack alerts and a larger watchlist.", icon: Zap, accent: "text-signal" },
                { persona: "Team", plan: "Team", description: "Coordinate sourcing, competitive intel, and webhooks across a recruiting pod.", icon: Users2, accent: "text-violet-accent" },
              ] as const).map(({ persona, plan, description, icon: Icon, accent }) => (
                <div key={persona} className="group p-6 transition-colors hover:bg-muted/20">
                  <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted/80 ${accent} transition-transform motion-safe:group-hover:scale-105`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-semibold">{persona}</div>
                  <div className="mt-2 inline-flex rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    Best fit: {plan}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function PlanCard({ slug, priceEnv, ctaHref, cta, highlighted }: { slug: keyof typeof PLAN_DETAILS; priceEnv: string | null | undefined; ctaHref?: string; cta?: string; highlighted?: boolean }) {
  const plan = PLAN_DETAILS[slug];
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-card p-7 transition-all duration-300 ${
        highlighted
          ? "surface-elevated z-10 border-signal/40 shadow-lg shadow-signal/10 ring-2 ring-signal/20 hover-lift md:scale-[1.02]"
          : "border-border/60 hover:border-foreground/15 hover:shadow-soft hover-lift"
      }`}
    >
      {highlighted && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-signal/20 via-signal to-signal/20" />
          <div className="absolute -top-3 left-6">
            <Badge className="bg-signal text-signal-foreground shadow-sm">Most popular</Badge>
          </div>
        </>
      )}
      <div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold tracking-tight">{plan.name}</div>
          {slug !== "enterprise" && (
            <span className="tnum rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {plan.profile_limit.toLocaleString()} profiles
            </span>
          )}
        </div>
        <div className="mt-4 flex items-baseline gap-1">
          {slug === "enterprise" ? (
            <span className="text-4xl font-semibold tracking-tight">Custom</span>
          ) : (
            <>
              <span className="tnum text-5xl font-semibold tracking-tight">${plan.price_monthly}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </>
          )}
        </div>
      </div>
      <ul className="mt-7 flex-1 space-y-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="group/feature flex items-start gap-2.5 rounded-lg px-1 py-0.5 transition-colors hover:bg-muted/30">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 motion-safe:group-hover/feature:scale-110 ${highlighted ? "text-signal" : "text-foreground/70"}`} />
            <span className="text-muted-foreground transition-colors group-hover/feature:text-foreground">{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7">
        {priceEnv ? (
          <CheckoutButton priceId={priceEnv} label={`Subscribe to ${plan.name}`} />
        ) : (
          <Button asChild className="w-full" variant={highlighted ? "default" : "outline"} size="lg">
            <Link href={ctaHref ?? "/login"}>{cta ?? "Start free"}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
