import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { OptOutForm } from "./form";

export const metadata = { title: "Opt out / DSAR" };

export default function OptOutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="container max-w-2xl flex-1 py-12">
        <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl">Opt out / DSAR</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Submit your LinkedIn URL to be removed from our index. We will stop refreshing your profile, hide your data
          from all customers, and delete historical snapshots within 30 days.
        </p>
        <div className="mt-8 rounded-2xl border bg-card p-6">
          <OptOutForm />
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
