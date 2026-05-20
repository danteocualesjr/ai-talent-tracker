import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bell, Building2, Check, Globe2, LineChart, Lock, Sparkles, Workflow } from "lucide-react";
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
        <div className="border-b border-amber-200/60 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
          Setup incomplete: add Supabase keys to <code className="font-mono">.env.local</code> to enable auth, billing, and tracking.
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
        <div className="pointer-events-none absolute inset-0 hero-backdrop" />

        <div className="container relative pt-20 pb-20 md:pt-28 md:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              href="/feed"
              className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur transition-colors hover:border-foreground/20 hover:text-foreground"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
              </span>
              <span className="font-medium text-foreground">Live</span>
              <span className="text-border">·</span>
              <span>New departures detected this week</span>
              <ArrowRight className="h-3 w-3" />
            </Link>

            <h1 className="animate-fade-up animate-fade-up-delay-1 mt-7 text-balance text-[44px] font-semibold leading-[1.04] tracking-tight text-foreground md:text-[68px]">
              Know the moment{" "}
              <span className="text-gradient-hero italic font-medium">AI talent</span>{" "}
              moves.
            </h1>

            <p className="animate-fade-up animate-fade-up-delay-2 mx-auto mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground md:text-lg">
              Real-time monitoring of researchers and engineers at OpenAI, Anthropic, DeepMind,
              and 20+ top AI labs. Get a Slack ping the moment someone goes stealth.
            </p>

            <div className="animate-fade-up animate-fade-up-delay-3 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="group shadow-md shadow-foreground/10">
                <Link href="/login">
                  Start tracking free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="group border-border/80 bg-background/80 backdrop-blur">
                <Link href="/feed">
                  See the live feed
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
            <p className="animate-fade-up animate-fade-up-delay-4 mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> No credit card</span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> 5 free profiles</span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Cancel anytime</span>
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3 border-y py-6 md:max-w-2xl">
            {[
              ["20+", "AI labs tracked"],
              ["<15m", "avg. detection"],
              ["3", "alert channels"],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <div className="tnum text-2xl font-semibold tracking-tight">{value}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          {/* Dashboard preview */}
          <div className="relative mx-auto mt-12 max-w-5xl">
            <div className="absolute inset-x-12 -bottom-8 -z-10 h-32 rounded-full bg-signal/10 blur-3xl" />
            <div className="absolute inset-x-20 -bottom-4 -z-10 h-20 rounded-full bg-foreground/5 blur-2xl" />
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Logo strip */}
      <section className="border-b bg-card">
        <div className="container py-10">
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Tracking talent at
          </p>
          <div className="mt-6">
            <LogoMarquee items={labNames} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b">
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Features
            </div>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              Built for sourcing the next wave.
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
              Multi-signal change detection, real-time alerts, and curated lab rosters in one place.
            </p>
          </div>

          <div className="mt-14 grid divide-y border-y md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-3">
            <FeatureCard icon={<Bell className="h-4 w-4" />} title="Real-time alerts" body="Email, Slack, or HMAC-signed webhook the moment a tracked profile changes company, headline, or location." />
            <FeatureCard icon={<Sparkles className="h-4 w-4" />} title="Stealth & founder detection" body="An LLM-backed classifier labels departures, stealth flips, and founding-role headlines automatically." />
            <FeatureCard icon={<LineChart className="h-4 w-4" />} title="Curated lab rosters" body="Pre-built employee lists for every major AI lab. One click to track an entire org." />
            <FeatureCard icon={<Workflow className="h-4 w-4" />} title="Multi-signal" body="LinkedIn plus GitHub activity, X bio changes, and new domain registrations. Higher confidence per alert." />
            <FeatureCard icon={<Globe2 className="h-4 w-4" />} title="Public departure feed" body="A free, programmatically updated feed at /feed. Great for sourcing, journalism, and SEO." />
            <FeatureCard icon={<Lock className="h-4 w-4" />} title="Compliant by design" body="Licensed data providers, clear DSAR and opt-out flow, no direct scraping from our infrastructure." />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b bg-card">
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              How it works
            </div>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              From profile to alert in three steps.
            </h2>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
            <Step n={1} title="Build your watchlist" body="Paste LinkedIn URLs or one-click a curated lab roster. Up to 1,000 profiles on Team." />
            <Step n={2} title="We poll & diff" body="Durable Inngest jobs refresh profiles on your plan's cadence and hash-diff against historical snapshots." />
            <Step n={3} title="Get classified alerts" body="A rule-based + LLM classifier labels the change (left, joined, stealth, founder) and pushes to your channels." />
          </div>
        </div>
      </section>

      {/* Who uses */}
      <section className="border-b">
        <div className="container py-20 md:py-28">
          <div className="grid items-center gap-14 md:grid-cols-2">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Who uses this
              </div>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                If your edge is being first, this is for you.
              </h2>
              <ul className="mt-8 divide-y border-y">
                {[
                  ["VCs & scouts", "Reach researchers the day they go stealth."],
                  ["AI startup recruiters", "Source candidates from real-time departures."],
                  ["Executive search firms", "Fresher pipelines than Sales Navigator alerts."],
                  ["Competitive intel teams", "Track who's being poached, and by whom."],
                  ["Journalists & analysts", "Cover the AI labor market with primary signal."],
                ].map(([who, why]) => (
                  <li key={who} className="flex items-start gap-4 py-4">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{who}</div>
                      <div className="text-sm text-muted-foreground">{why}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SampleAlert />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container py-20 md:py-28">
          <div className="relative overflow-hidden rounded-xl border bg-foreground text-background">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, hsl(var(--background)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--background)) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage: "radial-gradient(ellipse at center, black, transparent 70%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 70%)",
              }}
            />
            <div className="relative grid items-center gap-10 p-10 md:grid-cols-[1.2fr_1fr] md:p-16">
              <div>
                <Badge variant="outline" className="border-background/30 bg-transparent text-background/80">
                  Get started
                </Badge>
                <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-5xl">
                  Start with 5 free profiles.
                </h2>
                <p className="mt-4 max-w-md text-pretty text-base text-background/70">
                  Sign up with email, paste a few LinkedIn URLs, and the next change becomes your next intro.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                <Button asChild size="lg" variant="outline" className="border-background/20 bg-background text-foreground hover:bg-background/90">
                  <Link href="/login">Get started</Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-background hover:bg-background/10 hover:text-background">
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>
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
    <div className="group relative p-8 transition-colors duration-200 hover:bg-accent/50">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-foreground shadow-sm transition-all duration-200 group-hover:border-signal/30 group-hover:text-signal">
        {icon}
      </div>
      <h3 className="mt-5 font-semibold tracking-tight transition-colors group-hover:text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="group relative rounded-xl border bg-background p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted/50 font-mono text-xs font-medium text-foreground">
        {n}
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function SampleAlert() {
  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-[13px] bg-gradient-to-b from-amber-200/60 via-transparent to-transparent dark:from-amber-900/40" />
      <div className="relative overflow-hidden rounded-xl border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-amber-500" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
            </span>
            <span className="font-medium text-foreground">New alert</span>
            <span>· just now</span>
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">#openai</div>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
              JR
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Jane Researcher</div>
              <div className="text-xs text-muted-foreground">Detected 14 minutes ago · confidence 0.92</div>
            </div>
            <Badge variant="warning">Went stealth</Badge>
          </div>
          <div className="rounded-md border bg-muted/30 p-3 text-sm leading-relaxed">
            Headline changed from{" "}
            <span className="text-muted-foreground line-through decoration-muted-foreground/40">
              &ldquo;Member of Technical Staff, OpenAI&rdquo;
            </span>{" "}
            to <span className="font-medium">&ldquo;Building something new.&rdquo;</span>
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
