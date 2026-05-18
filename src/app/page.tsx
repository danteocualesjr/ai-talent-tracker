import Link from "next/link";
import { ArrowRight, Bell, Globe2, LineChart, Lock, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ setup?: string }> }) {
  const { setup } = await searchParams;
  let featured: { slug: string; name: string; logo_url: string | null }[] = [];
  if (isSupabaseConfigured()) {
    try {
      const db = createAdminClient();
      const { data } = await db.from("labs").select("slug,name,logo_url").eq("is_featured", true).limit(12);
      featured = data ?? [];
    } catch {
      featured = [];
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />

      {(setup === "missing-supabase-env" || !isSupabaseConfigured()) && (
        <div className="border-b bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Setup incomplete: add Supabase keys to <code className="font-mono">.env.local</code> to enable auth, billing, and tracking. See the README.
        </div>
      )}

      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">Real-time AI talent intelligence</Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            Know the moment AI talent moves.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            We monitor LinkedIn profiles of researchers, engineers, and operators at OpenAI,
            Anthropic, DeepMind, xAI and 20+ other top labs — and notify you within hours of
            a departure, stealth flip, or new founding role.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">Start tracking free <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/feed">See the live feed</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card. 5 free profiles. Cancel anytime.</p>
        </div>

        {featured.length > 0 && (
          <div className="mx-auto mt-16 max-w-4xl">
            <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">Tracking talent at</p>
            <div className="mt-4 grid grid-cols-3 gap-6 opacity-80 sm:grid-cols-4 md:grid-cols-6">
              {featured.map((l) => (
                <Link key={l.slug} href={`/labs/${l.slug}`} className="flex items-center justify-center text-sm font-medium hover:opacity-100">
                  {l.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="container py-12">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard icon={<Bell />} title="Real-time alerts" body="Email, Slack, or webhook the moment a tracked profile changes company, headline, or location." />
          <FeatureCard icon={<Sparkles />} title="Stealth & founder detection" body="An LLM-backed classifier flags departures, stealth flips, and founding-role headlines automatically." />
          <FeatureCard icon={<LineChart />} title="Lab rosters" body="Pre-curated employee lists for every major AI lab. One click to track an entire org." />
          <FeatureCard icon={<Workflow />} title="Multi-signal" body="LinkedIn + GitHub activity + X bio + new domain registrations. More confidence per alert." />
          <FeatureCard icon={<Globe2 />} title="Public feed" body="A free, programmatically updated departure feed at /feed. Great for sourcing and journalism." />
          <FeatureCard icon={<Lock />} title="Compliant by design" body="Licensed data providers, clear DSAR + opt-out, no direct scraping from our IPs." />
        </div>
      </section>

      <section className="container py-16">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Who uses this</h2>
            <p className="mt-4 text-muted-foreground">If your edge comes from knowing who left a top AI lab first, this is for you.</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li><span className="font-medium">VCs &amp; scouts</span> — reach researchers the day they go stealth.</li>
              <li><span className="font-medium">AI startup recruiters</span> — source from real-time departures.</li>
              <li><span className="font-medium">Executive search firms</span> — fresher pipelines than Sales Navigator alerts.</li>
              <li><span className="font-medium">Competitive intel</span> — track who&apos;s being poached, and by whom.</li>
              <li><span className="font-medium">Journalists &amp; analysts</span> — covering the AI labor market.</li>
            </ul>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Sample alert</CardTitle>
              <CardDescription>What lands in your inbox / Slack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-md border bg-muted/30 p-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Went stealth</div>
                <div className="mt-1 font-medium">Jane Researcher</div>
                <div className="mt-1 text-muted-foreground">
                  Headline changed from &quot;Member of Technical Staff, OpenAI&quot; to &quot;Building something new.&quot;
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Detected 14 minutes ago · confidence 0.92</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-16">
        <div className="rounded-2xl border bg-muted/20 p-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Start with 5 free profiles</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Sign up with email, paste a few LinkedIn URLs, and you&apos;ll get an alert as soon as one of them changes.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg"><Link href="/login">Get started</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/pricing">See pricing</Link></Button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">{icon}</div>
        <CardTitle className="mt-3 text-base">{title}</CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
    </Card>
  );
}
