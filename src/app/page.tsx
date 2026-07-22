import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  Check,
  Globe2,
  LineChart,
  Lock,
  Quote,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { DashboardPreview } from "@/components/dashboard-preview";
import { LogoMarquee } from "@/components/logo-marquee";
import { LiveTicker } from "@/components/live-ticker";

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
        <div className="border-b border-amber-200/70 bg-gradient-to-r from-amber-50 via-amber-50/80 to-transparent px-4 py-2.5 text-center text-xs text-amber-950 dark:border-amber-900/50 dark:from-amber-950/50 dark:to-transparent dark:text-amber-100">
          Setup incomplete: add Supabase keys to{" "}
          <code className="rounded-md bg-amber-100/80 px-1.5 py-0.5 font-mono text-[11px] dark:bg-amber-900/40">
            .env.local
          </code>{" "}
          to enable auth, billing, and tracking.
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 noise opacity-60" />
        <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
        <div className="pointer-events-none absolute inset-0 hero-backdrop" />
        <div className="aurora-orb aurora-orb-a -left-24 top-10 h-72 w-72 bg-signal/25" />
        <div className="aurora-orb aurora-orb-b -right-16 top-32 h-64 w-64 bg-amber-accent/15" />

        <div className="container relative pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              href="/feed"
              className="surface-glass animate-fade-up inline-flex items-center gap-2 rounded-full border-signal/20 px-4 py-1.5 text-xs text-muted-foreground shadow-[0_0_24px_-8px_hsl(var(--signal)/0.45)] transition-all hover:border-signal/35 hover:text-foreground"
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
              <Button asChild size="lg" variant="signal" className="group min-w-[200px]">
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

          <div className="relative mx-auto mt-16 max-w-5xl animate-fade-up animate-fade-up-delay-5">
            <div className="absolute inset-x-16 -bottom-10 -z-10 h-40 rounded-full bg-signal/15 blur-[80px]" />
            <div className="absolute inset-x-24 -bottom-6 -z-10 h-24 rounded-full bg-foreground/6 blur-3xl" />
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Proof metrics — kept below the hero fold */}
      <section className="section-wash border-b border-border/60">
        <div className="container py-10 md:py-12">
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border/60 bg-card/80 p-1 shadow-[0_16px_40px_-28px_hsl(var(--foreground)/0.2)] backdrop-blur-sm">
              {([
                { value: "20+", label: "AI labs tracked", icon: Building2, accent: "text-signal" },
                { value: "<15m", label: "avg. detection", icon: Zap, accent: "text-amber-accent" },
                { value: "3", label: "alert channels", icon: Bell, accent: "text-violet-accent" },
              ] as const).map(({ value, label, icon: Icon, accent }, i) => (
                <div
                  key={label}
                  className={`group rounded-xl px-3 py-4 text-center transition-colors hover:bg-background/70 ${i === 1 ? "border-x border-border/60 bg-background/70" : ""}`}
                >
                  <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80 ${accent} transition-transform motion-safe:group-hover:scale-105`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="tnum text-2xl font-bold tracking-tight md:text-3xl">{value}</div>
                  <div className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            <div className="surface-glass flex flex-col justify-center rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-signal/10 text-signal">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Daily signal brief</div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    A ranked digest of stealth flips, founders, and high-confidence moves across your watchlist.
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  ["7", "urgent"],
                  ["18", "warm"],
                  ["4", "founders"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-border/60 bg-card/80 px-3 py-2">
                    <div className="tnum text-lg font-bold">{value}</div>
                    <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
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

      {/* Live activity ticker */}
      <section className="relative overflow-hidden border-b border-border/60 bg-card/40">
        <div className="pointer-events-none absolute inset-0 dot-bg dot-fade opacity-50" />
        <div className="container relative grid items-center gap-12 py-20 md:grid-cols-[1.05fr_1fr] md:py-24">
          <div>
            <div className="label-caps">Live activity</div>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">
              The feed that{" "}
              <span className="font-serif italic font-normal text-gradient-signal">moves first</span>.
            </h2>
            <p className="mt-5 max-w-md text-pretty text-muted-foreground md:text-lg">
              Headline changes, stealth flips, and founding signals — surfaced minutes after they happen,
              not weeks after they hit the press.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="outline" className="group">
                <Link href="/feed">
                  Browse public feed
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="group">
                <Link href="/feed/rss.xml">
                  Subscribe via RSS
                  <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="chip"><span className="h-1 w-1 rounded-full bg-signal" /> Headline changes</span>
              <span className="chip"><span className="h-1 w-1 rounded-full bg-amber-accent" /> Stealth flips</span>
              <span className="chip"><span className="h-1 w-1 rounded-full bg-violet-accent" /> Founding signals</span>
              <span className="chip">+ 6 more types</span>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-signal/12 via-signal/4 to-transparent blur-2xl" />
            <div className="surface-elevated rounded-2xl border border-border/60 bg-background/50 p-4 backdrop-blur-xl sm:p-5">
              <LiveTicker />
            </div>
          </div>
        </div>
      </section>

      {/* Signal intelligence */}
      <section className="border-b border-border/60">
        <div className="container py-20 md:py-24">
          <div className="grid items-start gap-10 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="label-caps">Signal intelligence</div>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">
              Turn profile noise into{" "}
              <span className="font-serif italic font-normal text-gradient-hero">ranked next actions</span>.
            </h2>
              <p className="mt-5 max-w-md text-pretty text-muted-foreground md:text-lg">
                Every detected change is scored, classified, and routed so your team knows what to do first.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["01", "Classify", "Label departures, stealth pivots, founder language, and joiners automatically."],
                ["02", "Prioritize", "Bubble up high-confidence moves from your target labs and active hiring maps."],
                ["03", "Route", "Send the right brief to Slack, email, webhook, or the public feed."],
              ].map(([step, title, body]) => (
                <div key={step} className="surface-card surface-card-hover p-5">
                  <div className="tnum text-xs font-semibold text-signal">{step}</div>
                  <h3 className="mt-3 text-base font-bold tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border/60">
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="label-caps">Features</div>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">
              Built for sourcing the{" "}
              <span className="font-serif italic font-normal text-gradient-signal">next wave</span>.
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
      <section className="section-wash border-b border-border/60">
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="label-caps">How it works</div>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">
              From profile to alert in{" "}
              <span className="font-serif italic font-normal text-gradient-hero">three steps</span>.
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

      {/* Testimonial / pull-quote */}
      <section className="section-wash relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 noise opacity-40" />
        <div className="container relative py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Quote className="mx-auto h-7 w-7 text-signal/40" />
            <blockquote className="mt-6 text-balance font-serif text-2xl italic leading-snug text-foreground md:text-[2.1rem] md:leading-snug">
              &ldquo;We closed two researchers from a single Slack ping. The departure feed
              is the closest thing to a cheat code we&apos;ve seen for AI sourcing.&rdquo;
            </blockquote>
            <div className="mt-8 inline-flex items-center justify-center gap-3 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-sm shadow-sm backdrop-blur-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background shadow-sm">
                CA
              </div>
              <div className="text-left">
                <div className="font-semibold">Casey Aldridge</div>
                <div className="text-xs text-muted-foreground">Founding recruiter · stealth seed-stage AI lab</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container py-20 md:py-28">
          <div className="cta-halo relative overflow-hidden rounded-2xl bg-foreground text-background">
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
                <div className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-background/80">
                  <Zap className="h-3 w-3" /> Get started
                </div>
                <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight md:text-5xl">
                  Start with 5 free profiles.
                </h2>
                <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-background/65">
                  Sign up with email, paste a few LinkedIn URLs, and the next change becomes your next intro.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                <Button asChild size="lg" variant="outline" className="border-background/25 bg-background text-foreground hover:bg-background/95">
                  <Link href="/login">
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
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
    <div className="group surface-card surface-card-hover relative overflow-hidden p-7">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-signal/8 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-signal/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background text-foreground shadow-sm transition-all duration-300 group-hover:border-signal/40 group-hover:bg-signal/5 group-hover:text-signal group-hover:shadow-[0_0_20px_-6px_hsl(var(--signal)/0.55)]">
        {icon}
      </div>
      <h3 className="relative mt-5 text-base font-bold tracking-tight">{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="group surface-card surface-card-hover relative overflow-hidden p-7">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/30 to-transparent opacity-60" />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground font-mono text-sm font-semibold text-background shadow-[0_8px_20px_-10px_hsl(var(--foreground)/0.55)] transition-transform duration-200 motion-safe:group-hover:scale-105">
          {n}
        </div>
        <div className="label-caps text-[10px]">Step {n}</div>
      </div>
      <h3 className="mt-5 text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function SampleAlert() {
  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-[17px] bg-gradient-to-b from-signal/40 via-border/40 to-transparent" />
      <div className="surface-elevated relative overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-signal/10 blur-3xl" />
        <div className="relative flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-muted/50 to-muted/20 px-5 py-3.5">
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
        <div className="relative space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50 text-sm font-bold text-foreground ring-2 ring-background shadow-sm">
              JR
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Jane Researcher</div>
              <div className="text-xs text-muted-foreground">Detected 14 minutes ago · confidence 0.92</div>
            </div>
            <Badge variant="warning">Went stealth</Badge>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 text-sm leading-relaxed">
            Headline changed from{" "}
            <span className="text-muted-foreground line-through decoration-muted-foreground/40">
              &ldquo;Member of Technical Staff, OpenAI&rdquo;
            </span>{" "}
            to <span className="font-medium">&ldquo;Building something new.&rdquo;</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href="/login">View on LinkedIn</Link>
            </Button>
            <Button size="sm" variant="signal" className="flex-1" asChild>
              <Link href="/login">Reach out</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
