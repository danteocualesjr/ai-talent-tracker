import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHero } from "@/components/marketing-hero";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <MarketingHero
          align="center"
          eyebrow={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="label-caps">Legal</div>
              <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Last updated Jul 2026
              </span>
            </div>
          }
          title="Privacy"
          description="How we process public professional data and your rights."
        />
        <div className="container max-w-3xl py-12 md:py-16">
          <div className="surface-elevated prose-legal rounded-2xl border border-border/60 bg-card p-8 md:p-10">
            <p>
              AI Talent Tracker monitors <strong>publicly accessible professional information</strong> about
              employees at AI labs to provide alerting to recruiters, investors, and journalists. We do not
              directly scrape LinkedIn; we use licensed third-party data providers.
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
              professional information for the purpose of labor-market intelligence, balanced against the rights of
              the subject. You can object at any time via the form below.
            </p>

            <h2>Your rights — opt out / DSAR</h2>
            <p>
              Anyone listed in our index can request removal or a copy of the data we hold. Use{" "}
              <Link href="/opt-out">the opt-out form</Link> or email{" "}
              <a href="mailto:privacy@aitalenttracker.com">privacy@aitalenttracker.com</a>. We honor verified
              requests within 30 days.
            </p>

            <h2>Sharing</h2>
            <p>
              Data is shared with our infrastructure providers (Supabase, Vercel, Inngest, Stripe, Resend, OpenAI)
              only to the extent necessary to operate the service. We do not sell personal data.
            </p>

            <h2>Retention</h2>
            <p>
              Profile snapshots are retained for as long as a profile is tracked by at least one customer. Removed
              subjects&apos; data is deleted within 30 days of a verified DSAR.
            </p>

            <h2>Contact</h2>
            <p>
              <a href="mailto:privacy@aitalenttracker.com">privacy@aitalenttracker.com</a>
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
