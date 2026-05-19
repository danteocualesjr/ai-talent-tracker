import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { getLabBySlug, listLabProfiles } from "@/lib/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) return { title: "Lab not found" };
  return {
    title: `${lab.name} — roster & departures`,
    description: `Live roster of ${lab.name} employees, departures, and stealth flips.`,
  };
}

export default async function PublicLabPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) notFound();
  const people = await listLabProfiles(lab.id, 200);

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
          <div className="container relative py-12 md:py-14">
            <Button asChild variant="ghost" size="sm" className="-ml-3 mb-5 text-muted-foreground hover:text-foreground">
              <Link href="/labs"><ArrowLeft className="h-4 w-4" /> All labs</Link>
            </Button>
            <div className="flex items-center gap-5">
              {lab.logo_url ? (
                <img src={lab.logo_url} alt={lab.name} className="h-16 w-16 rounded-md border bg-background object-contain" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-background text-2xl font-semibold">{lab.name.slice(0, 1)}</div>
              )}
              <div>
                <h1 className="text-4xl font-semibold tracking-tight">{lab.name}</h1>
                <p className="mt-1.5 text-muted-foreground">{lab.description}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container max-w-4xl py-10">
          <div className="rounded-lg border bg-card">
            <div className="border-b px-5 py-3 text-sm font-semibold">
              <span className="tnum">{people.length}</span> tracked employees
            </div>
            {people.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm text-muted-foreground">
                Roster is being indexed. Check back soon.
              </div>
            ) : (
              <div className="divide-y">
                {people.map((p) => {
                  const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/40">
                      <Avatar className="h-9 w-9">
                        {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
                        <AvatarFallback className="bg-muted text-[11px] font-semibold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <a href={p.linkedin_url} target="_blank" rel="noreferrer noopener" className="truncate text-sm font-medium hover:underline">
                          {p.full_name || p.linkedin_handle}
                        </a>
                        <p className="truncate text-sm text-muted-foreground">{p.headline ?? p.current_title ?? ""}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize">{p.status}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
