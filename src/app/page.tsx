import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, Globe2, LineChart, Lock, Sparkles, Workflow, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { DashboardPreview } from "@/components/dashboard-preview";
import { LogoMarquee } from "@/components/logo-marquee";

const DEFAULT_LABS = [
  "OpenAI", "Anthropic", "Google DeepMind", "Meta AI", "xAI", "Mistral AI",
  "Cohere", "Perplexity", "Inflection AI", "Adept", "Hugging Face", "Scale AI",
];

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ setup?: string }> }) {
  const { setup } = await searchParams;
  let labs: { slug: string; name: string }[] = [];
  if (isSupabaseConfigured()) {
    try {
      const db = createAdminClient();
      const { data } = await db.from("labs").select("slug,name").eq("is_featured", true).limit(12);
      labs = data ?? [];
    } catch { /* env not ready */ }
  }
  const labNames = labs.length > 0 ? labs.map((l) => l.name) : DEFAULT_LABS;

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />

      {(setup === "missing-supabase-env" || !isSupabaseConfigured()) && (
        <div className="border-b bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Setup incomplete: add Supabase keys to <code className="font-mono">.env.local</code> to enable auth, billing, and tracking. See the README.
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-bg grid-fade opacity-50" />
        <div className="pointer-events-none absolute inset-0 gradient-mesh" />
        <div className="container relative pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur transition hover:text-foreground"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-emerald-500" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live: new departures detected this week
              <ArrowRight className="h-3 w-3" />
            </Link>

            <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tighter md:text-7xl">
              <span className="gradient-text">Know the moment</span>
              <br />
              <span>AI talent moves.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
              Real-time monitoring of researchers and engineers at OpenAI, Anthropic, DeepMind, and 20+ top
              AI labs. Get a Slack ping the moment someone goes stealth.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="group h-11 px-6">
                <Link href="/login">
                  Start tracking free
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 px-6">
                <Link href="/feed">See the live feed</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card · 5 free profiles · Cancel anytime
            </p>
          </div>

          {/* Dashboard preview */}
          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="absolute inset-x-12 -bottom-6 -z-10 h-32 rounded-full bg-foreground/10 blur-3xl" />
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Logo cloud */}
      <section className="border-y bg-muted/20 py-10">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Tracking talent at
        </p>
        <div className="mt-6">
          <LogoMarquee items={labNames} />
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="rounded-full">Features</Badge>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Built for sourcing the next wave.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Multi-signal change detection, real-time alerts, and curated lab rosters in one place.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={<Bell className="h-5 w-5" />} title="Real-time alerts" body="Email, Slack, or HMAC-signed webhook the moment a tracked profile changes company, headline, or location." />
          <FeatureCard icon={<Sparkles className="h-5 w-5" />} title="Stealth & founder detection" body="An LLM-backed classifier labels departures, stealth flips, and founding-role headlines automatically." />
          <FeatureCard icon={<LineChart className="h-5 w-5" />} title="Curated lab rosters" body="Pre-built employee lists for every major AI lab. One click to track an entire org." />
          <FeatureCard icon={<Workflow className="h-5 w-5" />} title="Multi-signal" body="LinkedIn plus GitHub activity, X bio changes, and new domain registrations. Higher confidence per alert." />
          <FeatureCard icon={<Globe2 className="h-5 w-5" />} title="Public departure feed" body="A free, programmatically updated feed at /feed. Great for sourcing, journalism, and SEO." />
          <FeatureCard icon={<Lock className="h-5 w-5" />} title="Compliant by design" body="Licensed data providers, clear DSAR and opt-out flow, no direct scraping from our infrastructure." />
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/20 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="rounded-full">How it works</Badge>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              From profile to alert in three steps.
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            <Step n={1} title="Build your watchlist" body="Paste LinkedIn URLs or one-click a curated lab roster. Up to 1,000 profiles on Team." />
            <Step n={2} title="We poll & diff" body="Durable Inngest jobs refresh profiles on your plan's cadence and hash-diff against historical snapshots." />
            <Step n={3} title="Get classified alerts" body="A rule-based + LLM classifier labels the change (left, joined, stealth, founder) and pushes to your channels." />
          </div>
        </div>
      </section>

      {/* Who uses */}
      <section className="container py-20 md:py-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <Badge variant="secondary" className="rounded-full">Who uses this</Badge>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              If your edge is being first, this is for you.
            </h2>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                ["VCs & scouts", "reach researchers the day they go stealth"],
                ["AI startup recruiters", "source candidates from real-time departures"],
                ["Executive search firms", "fresher pipelines than Sales Navigator alerts"],
                ["Competitive intel teams", "track who's being poached, and by whom"],
                ["Journalists & analysts", "covering the AI labor market"],
              ].map(([who, why]) => (
                <li key={who} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span><span className="font-medium">{who}</span> — {why}.</span>
                </li>
              ))}
            </ul>
          </div>

          <SampleAlert />
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-foreground to-foreground/80 p-10 text-center text-background md:p-16">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute inset-0 grid-bg" style={{ maskImage: "radial-gradient(circle at center, black, transparent 70%)" }} />
          </div>
          <Zap className="mx-auto h-8 w-8" />
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Start with 5 free profiles.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-background/80">
            Sign up with email, paste a few LinkedIn URLs, and the next change becomes your next intro.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="h-11 px-6">
              <Link href="/login">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 border-background/30 bg-transparent px-6 text-background hover:bg-background/10 hover:text-background">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-colors hover:border-foreground/30">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5 text-foreground transition-colors group-hover:bg-foreground/10">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-xl border bg-background p-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground font-mono text-sm text-background">
        {n}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function SampleAlert() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-foreground/5 to-transparent blur-2xl" />
      <div className="rounded-2xl border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-amber-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            New alert · just now
          </div>
          <div className="font-mono text-xs text-muted-foreground">#openai</div>
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-200 to-purple-400 text-sm font-semibold text-purple-900">
              JR
            </div>
            <div>
              <div className="text-sm font-semibold">Jane Researcher</div>
              <div className="text-xs text-muted-foreground">Detected 14 minutes ago · confidence 0.92</div>
            </div>
            <Badge variant="warning" className="ml-auto">Went stealth</Badge>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            Headline changed from <span className="line-through text-muted-foreground">&ldquo;Member of Technical Staff, OpenAI&rdquo;</span> to{" "}
            <span className="font-medium">&ldquo;Building something new.&rdquo;</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">View on LinkedIn</Button>
            <Button size="sm" className="flex-1">Reach out</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
