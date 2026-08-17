import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, Globe2, Star } from "lucide-react";
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
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border/80 bg-border/80">
            <LabMetric label="Labs indexed" value={labs.length} icon={<Building2 className="h-3.5 w-3.5" />} accent="text-signal" />
            <LabMetric label="Featured rosters" value={featuredCount} icon={<Star className="h-3.5 w-3.5" />} accent="text-amber-accent" />
            <LabMetric label="Domains mapped" value={domainCount} icon={<Globe2 className="h-3.5 w-3.5" />} accent="text-violet-accent" />
          </div>

          <div className="surface-card relative grid gap-4 overflow-hidden p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-signal" />
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
                className="group surface-card surface-card-hover relative flex flex-col overflow-hidden p-6"
              >
                <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="flex items-center justify-between">
                  {l.logo_url ? (
                    <Image
                      src={l.logo_url}
                      alt={l.name}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-md border border-border/70 bg-muted object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border/70 bg-muted font-serif text-lg font-medium text-muted-foreground">
                      {l.name.slice(0, 1)}
                    </div>
                  )}
                  {l.is_featured && <Badge variant="secondary">Featured</Badge>}
                </div>
                <div className="mt-5 font-serif text-lg font-medium tracking-tight">{l.name}</div>
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

function LabMetric({
  label,
  value,
  icon,
  accent = "text-muted-foreground",
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="tnum font-serif text-2xl font-medium">{value}</div>
          <div className="mt-1 label-caps text-muted-foreground">{label}</div>
        </div>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-md bg-muted/80 ${accent}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
