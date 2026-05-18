import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { OptOutForm } from "./form";

export const metadata = { title: "Opt out / DSAR" };

export default function OptOutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="container max-w-2xl space-y-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Opt out / DSAR</h1>
        <p className="text-sm text-muted-foreground">
          Submit your LinkedIn URL to be removed from our index. We will stop refreshing your profile, hide your data
          from all customers, and delete historical snapshots within 30 days.
        </p>
        <OptOutForm />
      </main>
      <MarketingFooter />
    </div>
  );
}
