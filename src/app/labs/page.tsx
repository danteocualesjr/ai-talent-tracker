import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
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
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
          <div className="container relative py-14 md:py-16">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Labs
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              AI labs we track
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">
              Click a lab to see its live roster, departures, and stealth flips.
            </p>
          </div>
        </section>

        <section className="container py-12">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {labs.map((l) => (
              <Link
                key={l.id}
                href={`/labs/${l.slug}`}
                className="group relative flex flex-col rounded-lg border bg-card p-5 transition-colors hover:border-foreground/30 hover:bg-accent/40"
              >
                <div className="flex items-center justify-between">
                  {l.logo_url ? (
                    <img src={l.logo_url} alt={l.name} className="h-10 w-10 rounded-md border bg-muted object-contain" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted font-semibold text-muted-foreground">
                      {l.name.slice(0, 1)}
                    </div>
                  )}
                  {l.is_featured && <Badge variant="secondary">Featured</Badge>}
                </div>
                <div className="mt-5 font-semibold tracking-tight">{l.name}</div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.description ?? l.domain}</p>
                <div className="mt-5 flex items-center gap-1 text-xs font-medium text-muted-foreground transition group-hover:text-foreground">
                  View roster
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
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
