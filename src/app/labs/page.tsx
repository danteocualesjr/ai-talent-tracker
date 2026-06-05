import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHero } from "@/components/marketing-hero";
import { listLabs } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "AI labs we track",
  description: "Curated rosters for OpenAI, Anthropic, DeepMind, Meta AI, xAI, Mistral and more.",
};

export const revalidate = 600;

export default async function PublicLabsPage() {
  const labs = await listLabs();
  const featuredCount = labs.filter((lab) => lab.is_featured).length;
  const domainCount = labs.filter((lab) => lab.domain).length;

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <MarketingHero
          eyebrow={<div className="label-caps">Labs</div>}
          title="AI labs we track"
          description="Click a lab to see its live roster, departures, and stealth flips."
        />

        <section className="container space-y-6 py-12 md:py-16">
          <div className="grid gap-3 md:grid-cols-3">
            <LabMetric label="Labs indexed" value={labs.length} />
            <LabMetric label="Featured rosters" value={featuredCount} />
            <LabMetric label="Domains mapped" value={domainCount} />
          </div>

          <div className="surface-card grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="text-sm font-semibold">Roster playbook</div>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Start with featured labs, bulk-add priority researchers, then route stealth and departure alerts into your team workflow.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <span className="chip">Bulk watchlist</span>
              <span className="chip">Lab changes</span>
              <span className="chip">Hiring maps</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {labs.map((l) => (
              <Link
                key={l.id}
                href={`/labs/${l.slug}`}
                className="hover-lift group surface-elevated flex flex-col rounded-2xl border border-border/60 bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  {l.logo_url ? (
                    <img src={l.logo_url} alt={l.name} className="h-11 w-11 rounded-xl border border-border/60 bg-muted object-contain p-1" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-muted text-lg font-bold text-muted-foreground">
                      {l.name.slice(0, 1)}
                    </div>
                  )}
                  {l.is_featured && <Badge variant="secondary">Featured</Badge>}
                </div>
                <div className="mt-5 text-base font-bold tracking-tight">{l.name}</div>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {l.description ?? l.domain}
                </p>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
                  View roster
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function LabMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-card p-4">
      <div className="tnum text-2xl font-bold">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
