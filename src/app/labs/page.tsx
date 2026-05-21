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
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <MarketingHero
          eyebrow={<div className="label-caps">Labs</div>}
          title="AI labs we track"
          description="Click a lab to see its live roster, departures, and stealth flips."
        />

        <section className="container py-12 md:py-16">
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
