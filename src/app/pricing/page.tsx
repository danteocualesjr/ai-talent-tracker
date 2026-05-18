import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_DETAILS } from "@/lib/stripe";
import { CheckoutButton } from "./checkout-button";
import { Check } from "lucide-react";

export const metadata = {
  title: "Pricing",
  description: "Free, Pro $49/mo, Team $299/mo, and Enterprise tiers for AI Talent Tracker.",
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="container max-w-5xl space-y-8 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Simple pricing</h1>
          <p className="mt-3 text-muted-foreground">Start free. Pay when you need real-time alerts at scale.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <PlanCard slug="free" priceEnv={null} ctaHref="/login" cta="Start free" />
          <PlanCard slug="pro" priceEnv={process.env.STRIPE_PRICE_PRO} highlighted />
          <PlanCard slug="team" priceEnv={process.env.STRIPE_PRICE_TEAM} />
          <PlanCard slug="enterprise" priceEnv={null} ctaHref="mailto:hello@aitalenttracker.com" cta="Contact us" />
        </div>
        <p className="mx-auto max-w-2xl text-center text-xs text-muted-foreground">
          All paid plans include the public departure feed. Cancel anytime. Prices in USD.
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}

function PlanCard({ slug, priceEnv, ctaHref, cta, highlighted }: { slug: keyof typeof PLAN_DETAILS; priceEnv: string | null | undefined; ctaHref?: string; cta?: string; highlighted?: boolean }) {
  const plan = PLAN_DETAILS[slug];
  return (
    <Card className={highlighted ? "border-foreground shadow-lg" : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{plan.name}</CardTitle>
          {highlighted && <Badge>Most popular</Badge>}
        </div>
        <CardDescription>
          {slug === "enterprise" ? "Custom" : <><span className="text-2xl font-semibold text-foreground">${plan.price_monthly}</span> /mo</>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" />{f}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {priceEnv ? (
          <CheckoutButton priceId={priceEnv} label={`Subscribe to ${plan.name}`} />
        ) : (
          <Button asChild className="w-full" variant={highlighted ? "default" : "outline"}>
            <Link href={ctaHref ?? "/login"}>{cta ?? "Start free"}</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
