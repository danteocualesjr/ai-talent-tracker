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
          <div className="pointer-events-none absolute inset-0 grid-bg grid-fade opacity-50" />
          <div className="pointer-events-none absolute inset-0 gradient-mesh" />
          <div className="container relative py-14">
            <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl">AI labs we track</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Click a lab to see its live roster, departures, and stealth flips.
            </p>
          </div>
        </section>

        <section className="container py-10">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {labs.map((l) => (
              <Link
                key={l.id}
                href={`/labs/${l.slug}`}
                className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-colors hover:border-foreground/30"
              >
                <div className="flex items-center justify-between">
                  {l.logo_url ? (
                    <img src={l.logo_url} alt={l.name} className="h-10 w-10 rounded-md border bg-muted object-contain" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted font-semibold text-muted-foreground">
                      {l.name.slice(0, 1)}
                    </div>
                  )}
                  {l.is_featured && <Badge variant="secondary">Featured</Badge>}
                </div>
                <div className="mt-4 font-semibold">{l.name}</div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.description ?? l.domain}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground transition group-hover:text-foreground">
                  View roster <ArrowRight className="h-3 w-3" />
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
