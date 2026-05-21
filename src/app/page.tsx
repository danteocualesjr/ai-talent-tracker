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
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 noise opacity-60" />
        <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
        <div className="pointer-events-none absolute inset-0 hero-backdrop" />

        <div className="container relative pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              href="/feed"
              className="surface-glass animate-fade-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground transition-all hover:border-foreground/15 hover:text-foreground"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
              </span>
              <span className="font-semibold text-foreground">Live</span>
              <span className="text-border">·</span>
              <span>New departures detected this week</span>
              <ArrowRight className="h-3 w-3 opacity-60" />
            </Link>

            <h1 className="animate-fade-up animate-fade-up-delay-1 mt-8 text-balance text-[42px] font-bold leading-[1.05] tracking-tight text-foreground md:text-[72px]">
              Know the moment{" "}
              <span className="font-serif text-gradient-hero italic font-normal">AI talent</span>{" "}
              moves.
            </h1>

            <p className="animate-fade-up animate-fade-up-delay-2 mx-auto mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground md:text-lg">
              Real-time monitoring of researchers and engineers at OpenAI, Anthropic, DeepMind,
              and 20+ top AI labs. Get a Slack ping the moment someone goes stealth.
            </p>

            <div className="animate-fade-up animate-fade-up-delay-3 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="group min-w-[200px]">
                <Link href="/login">
                  Start tracking free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="group min-w-[200px]">
                <Link href="/feed">
                  See the live feed
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
            <p className="animate-fade-up animate-fade-up-delay-4 mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-signal" /> No credit card</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-signal" /> 5 free profiles</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-signal" /> Cancel anytime</span>
            </p>
          </div>

          <div className="animate-fade-up animate-fade-up-delay-4 mx-auto mt-12 grid max-w-xl grid-cols-3 gap-4 rounded-2xl border border-border/60 bg-card/60 p-1 shadow-soft backdrop-blur-sm md:max-w-2xl">
            {[
              ["20+", "AI labs tracked"],
              ["<15m", "avg. detection"],
              ["3", "alert channels"],
            ].map(([value, label], i) => (
              <div
                key={label}
                className={`rounded-xl px-4 py-5 text-center ${i === 1 ? "border-x border-border/60 bg-background/80" : ""}`}
              >
                <div className="tnum text-2xl font-bold tracking-tight md:text-3xl">{value}</div>
                <div className="mt-1.5 text-[11px] font-medium text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="absolute inset-x-16 -bottom-10 -z-10 h-40 rounded-full bg-signal/15 blur-[80px]" />
            <div className="absolute inset-x-24 -bottom-6 -z-10 h-24 rounded-full bg-foreground/6 blur-3xl" />
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Logo strip */}
      <section className="border-b border-border/60 bg-muted/30">
        <div className="container py-12">
          <p className="label-caps text-center">
            Tracking talent at
          </p>
          <div className="mt-6">
            <LogoMarquee items={labNames} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border/60">
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="label-caps">Features</div>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">
              Built for sourcing the next wave.
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
              Multi-signal change detection, real-time alerts, and curated lab rosters in one place.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <section className="border-b border-border/60 bg-muted/20">
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="label-caps">How it works</div>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">
              From profile to alert in three steps.
            </h2>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
            <Step n={1} title="Build your watchlist" body="Paste LinkedIn URLs or one-click a curated lab roster. Up to 1,000 profiles on Team." />
            <Step n={2} title="We poll & diff" body="Durable Inngest jobs refresh profiles on your plan's cadence and hash-diff against historical snapshots." />
            <Step n={3} title="Get classified alerts" body="A rule-based + LLM classifier labels the change (left, joined, stealth, founder) and pushes to your channels." />
          </div>
        </div>
      </section>

      {/* Who uses */}
      <section className="border-b border-border/60">
        <div className="container py-20 md:py-28">
          <div className="grid items-center gap-14 md:grid-cols-2">
            <div>
              <div className="label-caps">Who uses this</div>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
                If your edge is being first, this is for you.
              </h2>
              <ul className="mt-8 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
                {[
                  ["VCs & scouts", "Reach researchers the day they go stealth."],
                  ["AI startup recruiters", "Source candidates from real-time departures."],
                  ["Executive search firms", "Fresher pipelines than Sales Navigator alerts."],
                  ["Competitive intel teams", "Track who's being poached, and by whom."],
                  ["Journalists & analysts", "Cover the AI labor market with primary signal."],
                ].map(([who, why]) => (
                  <li key={who} className="flex items-start gap-4 px-5 py-4 first:rounded-t-2xl last:rounded-b-2xl">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
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
          <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-foreground text-background shadow-soft">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-signal/25 blur-[80px]" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, hsl(var(--background)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--background)) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
              }}
            />
            <div className="relative grid items-center gap-10 p-10 md:grid-cols-[1.2fr_1fr] md:p-16">
              <div>
                <Badge variant="outline" className="border-background/25 bg-background/10 text-background/90">
                  Get started
                </Badge>
                <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight md:text-5xl">
                  Start with 5 free profiles.
                </h2>
                <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-background/65">
                  Sign up with email, paste a few LinkedIn URLs, and the next change becomes your next intro.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                <Button asChild size="lg" variant="outline" className="border-background/25 bg-background text-foreground hover:bg-background/95">
                  <Link href="/login">Get started</Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-background/90 hover:bg-background/10 hover:text-background">
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
    <div className="group surface-elevated relative rounded-2xl border border-border/60 bg-card p-7 transition-all duration-300 hover:border-foreground/15 hover:shadow-soft">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background text-foreground shadow-sm transition-all duration-300 group-hover:border-signal/40 group-hover:bg-signal/5 group-hover:text-signal">
        {icon}
      </div>
      <h3 className="mt-5 text-base font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="group surface-elevated relative rounded-2xl border border-border/60 bg-card p-7 transition-all hover:border-foreground/15">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground font-mono text-sm font-semibold text-background">
        {n}
      </div>
      <h3 className="mt-5 text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function SampleAlert() {
  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-[17px] bg-gradient-to-b from-signal/30 via-transparent to-transparent" />
      <div className="surface-elevated relative overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-5 py-3.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            <span className="font-medium text-foreground">New alert</span>
            <span>· just now</span>
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">#openai</div>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50 text-sm font-bold text-foreground ring-2 ring-background">
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
