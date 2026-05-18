import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
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
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute inset-0 grid-bg grid-fade opacity-50" />
          <div className="pointer-events-none absolute inset-0 gradient-mesh" />
          <div className="container relative py-16 text-center">
            <Badge variant="secondary" className="rounded-full">Pricing</Badge>
            <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tighter md:text-6xl">
              Simple pricing.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Start free. Pay when you need real-time alerts at scale.
            </p>
          </div>
        </section>

        <section className="container max-w-6xl py-12">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PlanCard slug="free" priceEnv={null} ctaHref="/login" cta="Start free" />
            <PlanCard slug="pro" priceEnv={process.env.STRIPE_PRICE_PRO} highlighted />
            <PlanCard slug="team" priceEnv={process.env.STRIPE_PRICE_TEAM} />
            <PlanCard slug="enterprise" priceEnv={null} ctaHref="mailto:hello@aitalenttracker.com" cta="Contact us" />
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
            All paid plans include the public departure feed. Cancel anytime. Prices in USD.
          </p>
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
      className={`relative flex flex-col rounded-2xl border bg-card p-6 transition ${highlighted ? "border-foreground shadow-2xl ring-1 ring-foreground/10" : ""}`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge>Most popular</Badge>
        </div>
      )}
      <div>
        <div className="text-sm font-semibold">{plan.name}</div>
        <div className="mt-3 flex items-baseline gap-1">
          {slug === "enterprise" ? (
            <span className="text-3xl font-semibold">Custom</span>
          ) : (
            <>
              <span className="text-4xl font-semibold tracking-tight">${plan.price_monthly}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </>
          )}
        </div>
      </div>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {priceEnv ? (
          <CheckoutButton priceId={priceEnv} label={`Subscribe to ${plan.name}`} />
        ) : (
          <Button asChild className="w-full" variant={highlighted ? "default" : "outline"}>
            <Link href={ctaHref ?? "/login"}>{cta ?? "Start free"}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
