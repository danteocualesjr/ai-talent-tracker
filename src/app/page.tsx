import Link from "next/link";
import { ArrowRight, ArrowUpRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { LandingFeedTable } from "@/components/landing-feed-table";
import { LabGrid } from "@/components/lab-grid";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { PLAN_DETAILS } from "@/lib/stripe";
import { ScrollToTop } from "@/components/scroll-to-top";

const DEFAULT_LABS = [
  "OpenAI", "Anthropic", "Google DeepMind", "Meta AI", "xAI", "Mistral AI",
  "Cohere", "Perplexity", "Inflection AI", "Adept", "Hugging Face", "Scale AI",
];

const FEATURES = [
  ["01", "Real-time alerts", "Email, Slack, or HMAC-signed webhook the moment a tracked profile changes company, headline, or location."],
  ["02", "Stealth & founder detection", "An LLM-backed classifier labels departures, stealth flips, and founding-role headlines automatically."],
  ["03", "Curated lab rosters", "Pre-built employee lists for every major AI lab. One click to track an entire org."],
  ["04", "Multi-signal", "LinkedIn plus GitHub activity, X bio changes, and new domain registrations. Higher confidence per alert."],
  ["05", "Public departure feed", "A free, programmatically updated feed at /feed. Great for sourcing, journalism, and SEO."],
  ["06", "Compliant by design", "Licensed data providers, clear DSAR and opt-out flow, no direct scraping from our infrastructure."],
] as const;

const AUDIENCES = [
  ["AI startup recruiters", "Source candidates from real-time departures."],
  ["Executive search firms", "Fresher pipelines than Sales Navigator alerts."],
  ["VCs & scouts", "Reach researchers the day they go stealth."],
  ["Competitive intel teams", "Track who's being poached, and by whom."],
  ["Journalists & analysts", "Cover the AI labor market with primary signal."],
] as const;

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

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />

      <main id="main-content">
        {(setup === "missing-supabase-env" || !isSupabaseConfigured()) && (
          <div className="border-b border-amber-200/70 bg-gradient-to-r from-amber-50 via-amber-50/80 to-transparent px-4 py-2.5 text-center text-xs text-amber-950 dark:border-amber-900/50 dark:from-amber-950/50 dark:to-transparent dark:text-amber-100">
            Setup incomplete: add Supabase keys to{" "}
            <code className="rounded-md bg-amber-100/80 px-1.5 py-0.5 font-mono text-[11px] dark:bg-amber-900/40">.env.local</code>{" "}
            to enable auth, billing, and tracking.
          </div>
        )}

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/70">
          <div className="pointer-events-none absolute inset-0 noise opacity-35" />
          <div className="pointer-events-none absolute inset-0 hero-backdrop" />
          <div className="pointer-events-none absolute inset-0 grid-bg grid-fade opacity-40" />

          <div className="container relative">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <span className="text-signal">Intelligence brief</span>
              <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
              <span className="flex-1 sm:flex-none">{today}</span>
              <Link href="/feed" className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                </span>
                Live · departures detected this week
              </Link>
            </div>

            <div className="grid items-start gap-12 py-14 md:py-20 lg:grid-cols-[1fr_280px] lg:gap-16">
              <div>
                <h1 className="animate-fade-up text-balance font-serif text-[44px] font-medium leading-[1.05] tracking-tight md:text-[56px] lg:text-[64px]">
                  Know the moment{" "}
                  <span className="italic text-gradient-hero">AI talent</span>{" "}
                  moves.
                </h1>
                <p className="animate-fade-up animate-fade-up-delay-1 mt-6 max-w-lg text-pretty text-[17px] leading-relaxed text-muted-foreground md:text-lg">
                  Real-time monitoring of researchers and engineers at OpenAI, Anthropic, DeepMind,
                  and 20+ top AI labs. Slack ping the moment someone goes stealth.
                </p>
                <div className="animate-fade-up animate-fade-up-delay-2 mt-10 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" variant="signal" className="group">
                    <Link href="/login">
                      Start tracking free
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="group">
                    <Link href="/feed">
                      See the live feed
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="animate-fade-up animate-fade-up-delay-3 lg:pt-2">
                <p className="label-caps max-w-[240px] leading-relaxed text-muted-foreground/80">
                  Built for recruiters, scouts and search firms whose edge is being first.
                </p>
                <div className="stat-strip mt-6 grid-cols-1">
                  {[
                    { value: "20+", label: "Labs tracked" },
                    { value: "<15m", label: "Avg detection" },
                    { value: "3", label: "Alert channels" },
                  ].map((stat) => (
                    <div key={stat.label} className="stat-strip-item">
                      <div className="tnum font-serif text-3xl font-medium tracking-tight">{stat.value}</div>
                      <div className="mt-1 label-caps text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live activity feed table */}
        <section className="border-b border-border/60">
          <div className="container py-16 md:py-20">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <div className="label-caps text-signal">Live activity</div>
                <h2 className="mt-3 text-balance font-serif text-3xl font-medium tracking-tight md:text-4xl lg:text-[2.75rem]">
                  The feed that moves first.
                </h2>
                <p className="mt-4 max-w-md text-pretty text-muted-foreground md:text-[17px]">
                  Headline changes, stealth flips, and founding signals — surfaced minutes after they happen,
                  not weeks after they hit the press.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Button asChild variant="outline" className="group">
                  <Link href="/feed">
                    Browse public feed
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="label-caps text-[11px]">
                  <Link href="/feed/rss.xml">RSS</Link>
                </Button>
              </div>
            </div>

            <div className="mt-10">
              <LandingFeedTable />
            </div>
          </div>
        </section>

        {/* Labs + signal type chips */}
        <section className="border-b border-border/60 bg-muted/20">
          <div className="container py-14 md:py-16">
            <div className="flex flex-wrap gap-2">
              <span className="chip"><span className="h-1 w-1 rounded-full bg-signal" /> Headline changes</span>
              <span className="chip"><span className="h-1 w-1 rounded-full bg-amber-accent" /> Stealth flips</span>
              <span className="chip"><span className="h-1 w-1 rounded-full bg-violet-accent" /> Founding signals</span>
              <span className="chip">+ 8 more types</span>
            </div>
            <p className="label-caps mt-10">Tracking talent at</p>
            <div className="mt-5">
              <LabGrid items={labNames} />
            </div>
          </div>
        </section>

        {/* Signal intelligence */}
        <section className="border-b border-border/60">
          <div className="container py-16 md:py-20">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div>
                <div className="label-caps text-signal">Signal intelligence</div>
                <h2 className="mt-4 text-balance font-serif text-3xl font-medium tracking-tight md:text-4xl lg:text-[2.75rem]">
                  Turn profile noise into ranked next actions.
                </h2>
                <p className="mt-5 max-w-md text-pretty text-muted-foreground md:text-[17px]">
                  Every detected change is scored, classified, and routed so your team knows what to do first.
                </p>
              </div>
              <div className="numbered-list divide-y divide-border/70">
                {[
                  ["01", "Classify", "Label departures, stealth pivots, founder language, and joiners automatically."],
                  ["02", "Prioritize", "Bubble up high-confidence moves from your target labs and active hiring maps."],
                  ["03", "Route", "Send the right brief to Slack, email, webhook, or the public feed."],
                ].map(([step, title, body]) => (
                  <div key={step} className="grid gap-4 py-6 first:pt-0 last:pb-0 sm:grid-cols-[48px_1fr] sm:gap-6">
                    <div className="tnum text-sm font-semibold text-signal">{step}</div>
                    <div>
                      <h3 className="text-base font-bold tracking-tight">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="border-b border-border/60">
          <div className="container py-16 md:py-20">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <h2 className="text-balance font-serif text-3xl font-medium tracking-tight md:text-4xl lg:text-[2.75rem]">
                  Built for sourcing the next wave.
                </h2>
                <p className="mt-4 max-w-sm text-pretty text-muted-foreground md:text-[17px]">
                  Multi-signal change detection, real-time alerts, and curated lab rosters in one place.
                </p>
              </div>
              <div className="feature-grid grid gap-px overflow-hidden rounded-lg border border-border/80 bg-border/80 sm:grid-cols-2">
                {FEATURES.map(([n, title, body]) => (
                  <div key={n} className="bg-card p-6 md:p-7">
                    <div className="tnum text-xs font-semibold text-signal">{n}</div>
                    <h3 className="mt-3 text-sm font-bold tracking-tight">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Who uses this */}
        <section className="border-b border-border/60">
          <div className="container py-16 md:py-20">
            <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-16">
              <div>
                <div className="label-caps text-signal">Who uses this</div>
                <h2 className="mt-4 text-balance font-serif text-3xl font-medium tracking-tight md:text-4xl">
                  If your edge is being first, this is for you.
                </h2>
                <ul className="editorial-list mt-10 divide-y divide-border/70">
                  {AUDIENCES.map(([who, why]) => (
                    <li key={who} className="grid gap-1 py-4 sm:grid-cols-[1fr_1.1fr] sm:gap-8">
                      <span className="text-sm font-semibold">{who}</span>
                      <span className="text-sm text-muted-foreground">{why}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <SampleAlert />
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="section-wash border-b border-border/60">
          <div className="container py-16 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <Quote className="mx-auto h-6 w-6 text-signal/30" />
              <blockquote className="mt-6 text-balance font-serif text-2xl font-medium leading-snug md:text-[1.75rem] md:leading-snug">
                &ldquo;We closed two researchers from a single Slack ping. The departure feed
                is the closest thing to a cheat code we&apos;ve seen for AI sourcing.&rdquo;
              </blockquote>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-[11px] font-bold">
                  CA
                </div>
                <div className="text-left text-sm">
                  <div className="font-semibold">Casey Aldridge</div>
                  <div className="text-xs text-muted-foreground">Founding recruiter · stealth seed-stage AI lab</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA + pricing */}
        <section>
          <div className="container py-16 md:py-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <div className="label-caps text-signal">Get started</div>
                <h2 className="mt-4 text-balance font-serif text-3xl font-medium tracking-tight md:text-4xl lg:text-[2.75rem]">
                  Start with 5 free profiles.
                </h2>
                <p className="mt-4 max-w-md text-pretty text-muted-foreground md:text-[17px]">
                  Sign up with email, paste a few LinkedIn URLs, and the next change becomes your next intro.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" variant="signal">
                    <Link href="/login">Get started</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/pricing">See pricing</Link>
                  </Button>
                </div>
              </div>
              <PricingRows />
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
      <ScrollToTop />
    </div>
  );
}

function PricingRows() {
  const rows = [
    { slug: "free" as const, detail: "5 profiles · daily poll" },
    { slug: "pro" as const, detail: "100 profiles · hourly poll" },
    { slug: "team" as const, detail: "1,000 profiles · 15m poll" },
  ];

  return (
    <div className="pricing-rows divide-y divide-border/70 self-center lg:self-end lg:max-w-md lg:w-full">
      {rows.map(({ slug, detail }) => {
        const plan = PLAN_DETAILS[slug];
        return (
          <div key={slug} className="grid grid-cols-[1fr_auto] items-center gap-4 py-4 first:pt-0">
            <div>
              <div className="text-sm font-semibold">{plan.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>
            </div>
            <div className="tnum font-serif text-2xl font-medium">
              {plan.price_monthly === 0 ? "$0" : `$${plan.price_monthly}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SampleAlert() {
  return (
    <div className="surface-card overflow-hidden rounded-lg border border-border/70">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
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
      <div className="space-y-4 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-sm font-bold">JR</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">Jane Researcher</div>
            <div className="text-xs text-muted-foreground">Detected 14 minutes ago · confidence 0.92</div>
          </div>
          <Badge variant="warning">Went stealth</Badge>
        </div>
        <div className="rounded-md border border-border/60 bg-muted/30 p-3.5 text-sm leading-relaxed">
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
  );
}
