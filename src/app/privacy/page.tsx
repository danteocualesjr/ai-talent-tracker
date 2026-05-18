import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="container max-w-3xl space-y-6 py-10 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul>li]:text-sm [&_ul>li]:text-muted-foreground">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
        <p>
          AI Talent Tracker monitors <strong>publicly accessible professional information</strong> about employees at AI labs to provide
          alerting to recruiters, investors, and journalists. We do not directly scrape LinkedIn; we use licensed
          third-party data providers.
        </p>

        <h2>Information we process</h2>
        <ul>
          <li>Names, headlines, current employer, location, and public LinkedIn URL.</li>
          <li>Optional public handles for GitHub, X / Twitter, personal sites.</li>
          <li>Historical snapshots of the above for change detection.</li>
        </ul>

        <h2>Lawful basis</h2>
        <p>
          For data subjects in the EU/UK, we rely on legitimate interest (Art. 6(1)(f) GDPR) to process public
          professional information for the purpose of labor-market intelligence, balanced against the rights of the
          subject. You can object at any time via the form below.
        </p>

        <h2>Your rights — opt out / DSAR</h2>
        <p>
          Anyone listed in our index can request removal or a copy of the data we hold. Use{" "}
          <Link href="/opt-out" className="underline">the opt-out form</Link>{" "}or email <a className="underline" href="mailto:privacy@aitalenttracker.com">privacy@aitalenttracker.com</a>.
          We honor verified requests within 30 days.
        </p>

        <h2>Sharing</h2>
        <p>
          Data is shared with our infrastructure providers (Supabase, Vercel, Inngest, Stripe, Resend, OpenAI) only to
          the extent necessary to operate the service. We do not sell personal data.
        </p>

        <h2>Retention</h2>
        <p>
          Profile snapshots are retained for as long as a profile is tracked by at least one customer. Removed
          subjects&apos; data is deleted within 30 days of a verified DSAR.
        </p>

        <h2>Contact</h2>
        <p>
          privacy@aitalenttracker.com
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
