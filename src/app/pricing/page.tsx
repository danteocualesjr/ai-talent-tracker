import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHero } from "@/components/marketing-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_DETAILS } from "@/lib/stripe";
import { CheckoutButton } from "./checkout-button";

export const metadata = {
  title: "Pricing",
  description: "Free, Pro $49/mo, Team $299/mo, and Enterprise tiers for AI Talent Tracker.",
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <MarketingHero
          align="center"
          eyebrow={<div className="label-caps">Pricing</div>}
          title="Simple pricing."
          description="Start free. Pay when you need real-time alerts at scale."
        />

        <section className="border-b">
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
      </main>
      <MarketingFooter />
    </div>
  );
}

function PlanCard({ slug, priceEnv, ctaHref, cta, highlighted }: { slug: keyof typeof PLAN_DETAILS; priceEnv: string | null | undefined; ctaHref?: string; cta?: string; highlighted?: boolean }) {
  const plan = PLAN_DETAILS[slug];
  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-card p-7 transition-all duration-300 ${
        highlighted
          ? "surface-elevated border-foreground/20 ring-1 ring-foreground/5"
          : "border-border/60 hover:border-foreground/15 hover:shadow-soft"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-6">
          <Badge>Most popular</Badge>
        </div>
      )}
      <div>
        <div className="text-sm font-semibold tracking-tight">{plan.name}</div>
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
          <li key={f} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" />
            <span className="text-muted-foreground">{f}</span>
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
