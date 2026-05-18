import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listLabs } from "@/lib/queries";

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
      <main className="container max-w-5xl space-y-6 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">AI labs we track</h1>
          <p className="mt-2 text-muted-foreground">Click a lab to see its live roster and recent departures.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {labs.map((l) => (
            <Link key={l.id} href={`/labs/${l.slug}`}>
              <Card className="h-full transition-colors hover:bg-accent/40">
                <CardHeader>
                  <CardTitle className="text-base">{l.name}</CardTitle>
                  <CardDescription>{l.description ?? l.domain}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
