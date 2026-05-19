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
        <div className="pointer-events-none absolute inset-0 grid-bg grid-fade opacity-40" />
        <div className="pointer-events-none absolute inset-0 gradient-mesh" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
        <div className="container relative pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              href="/feed"
              className="group inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-background hover:text-foreground hover:shadow-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-emerald-500" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live: new departures detected this week
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <h1 className="mt-8 text-balance text-5xl font-bold tracking-tight md:text-7xl">
              <span className="gradient-text">Know the moment</span>
              <br />
              <span className="text-foreground">AI talent moves.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
              Real-time monitoring of researchers and engineers at OpenAI, Anthropic, DeepMind, and 20+ top
              AI labs. Get a Slack ping the moment someone goes stealth.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="group h-12 px-8 text-base">
                <Link href="/login">
                  Start tracking free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                <Link href="/feed">See the live feed</Link>
              </Button>
            </div>
            <p className="mt-5 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 5 free profiles
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Cancel anytime
              </span>
            </p>
          </div>

          {/* Dashboard preview */}
          <div className="relative mx-auto mt-16 max-w-5xl animate-float">
            <div className="absolute inset-x-8 -bottom-8 -z-10 h-40 rounded-full bg-primary/15 blur-[60px]" />
            <div className="absolute inset-x-20 -bottom-4 -z-10 h-24 rounded-full bg-purple-500/10 blur-[40px]" />
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
      <section className="container pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-purple-600 to-pink-500 p-12 text-center text-white shadow-2xl shadow-primary/25 md:p-20">
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute inset-0 grid-bg" style={{ maskImage: "radial-gradient(circle at center, black, transparent 70%)" }} />
          </div>
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Zap className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-balance text-3xl font-bold tracking-tight md:text-5xl">
              Start with 5 free profiles.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              Sign up with email, paste a few LinkedIn URLs, and the next change becomes your next intro.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-white px-8 text-base font-semibold text-primary shadow-xl hover:bg-white/90">
                <Link href="/login">Get started free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-white/30 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25">
          {icon}
        </div>
        <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="group relative rounded-2xl border bg-background p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
      <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500 font-mono text-sm font-bold text-white shadow-lg shadow-primary/25">
        {n}
      </div>
      <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function SampleAlert() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-transparent blur-3xl" />
      <div className="rounded-2xl border bg-card shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-amber-500" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>
            New alert · just now
          </div>
          <div className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">#openai</div>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-sm font-bold text-white shadow-lg shadow-purple-500/25">
              JR
            </div>
            <div className="flex-1">
              <div className="font-semibold">Jane Researcher</div>
              <div className="text-xs text-muted-foreground">Detected 14 minutes ago · confidence 0.92</div>
            </div>
            <Badge variant="warning">Went stealth</Badge>
          </div>
          <div className="rounded-xl border bg-gradient-to-r from-muted/50 to-muted/30 p-4 text-sm">
            Headline changed from <span className="line-through text-muted-foreground/70">&ldquo;Member of Technical Staff, OpenAI&rdquo;</span> to{" "}
            <span className="font-semibold text-foreground">&ldquo;Building something new.&rdquo;</span>
          </div>
          <div className="flex gap-3">
            <Button size="sm" variant="outline" className="flex-1">View on LinkedIn</Button>
            <Button size="sm" className="flex-1">Reach out</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
