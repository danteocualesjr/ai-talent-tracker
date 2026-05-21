import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHero } from "@/components/marketing-hero";
import { OptOutForm } from "./form";

export const metadata = { title: "Opt out / DSAR" };

export default function OptOutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <MarketingHero
          align="center"
          eyebrow={<div className="label-caps">Your rights</div>}
          title="Opt out / DSAR"
          description="Request removal from our index or a copy of the data we hold about you."
        />
        <div className="container max-w-xl pb-16">
          <div className="surface-elevated -mt-6 rounded-2xl border border-border/60 bg-card p-8">
            <OptOutForm />
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
