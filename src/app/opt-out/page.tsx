import { Clock, FileText, ShieldCheck } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHero } from "@/components/marketing-hero";
import { OptOutForm } from "./form";

export const metadata = { title: "Opt out / DSAR" };

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Verified removal", body: "We confirm opt-outs within 30 days and stop monitoring immediately." },
  { icon: FileText, title: "Data export", body: "Request a copy of the profile data we hold under GDPR/CCPA rights." },
  { icon: Clock, title: "Fast response", body: "Most requests are processed within 5 business days." },
] as const;

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
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {TRUST_ITEMS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="surface-card group p-4 text-center sm:text-left">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-signal/10 text-signal transition-transform motion-safe:group-hover:scale-105 sm:mx-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-xs font-semibold">{title}</div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <div className="surface-elevated relative -mt-2 overflow-hidden rounded-2xl border border-border/60 bg-card p-8">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
            <OptOutForm />
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
