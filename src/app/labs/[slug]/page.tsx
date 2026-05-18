import { notFound } from "next/navigation";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { getLabBySlug, listLabProfiles } from "@/lib/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <main className="container max-w-5xl space-y-8 py-10">
        <div className="flex items-center gap-4">
          {lab.logo_url && <img src={lab.logo_url} alt={lab.name} className="h-12 w-12 rounded-md border bg-muted" />}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{lab.name}</h1>
            <p className="text-muted-foreground">{lab.description}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{people.length} tracked employees</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {people.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Roster is being indexed. Check back soon.
              </div>
            ) : people.map((p) => {
              const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
              return (
                <div key={p.id} className="flex items-center gap-3 py-3">
                  <Avatar>
                    {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <a href={p.linkedin_url} target="_blank" rel="noreferrer noopener" className="truncate font-medium hover:underline">
                      {p.full_name || p.linkedin_handle}
                    </a>
                    <p className="truncate text-sm text-muted-foreground">{p.headline ?? p.current_title ?? ""}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{p.status}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>
      <MarketingFooter />
    </div>
  );
}
