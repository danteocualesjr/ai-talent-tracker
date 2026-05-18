import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLabBySlug, listLabProfiles } from "@/lib/queries";
import { formatRelative } from "@/lib/utils";

export default async function LabRosterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) notFound();
  const people = await listLabProfiles(lab.id, 500);

  return (
    <div className="container max-w-5xl space-y-6 py-8">
      <div className="flex items-center gap-4">
        {lab.logo_url && <img src={lab.logo_url} alt={lab.name} className="h-12 w-12 rounded-md border bg-muted" />}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{lab.name}</h1>
          <p className="text-sm text-muted-foreground">{lab.description} · {lab.domain}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{people.length} tracked employees</CardTitle>
          <CardDescription>
            Live roster compiled from public LinkedIn data. Status updates within hours of a profile change.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {people.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No people indexed yet for this lab.
            </div>
          ) : (
            people.map((p) => {
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
                  <div className="text-xs text-muted-foreground">{formatRelative(p.last_synced_at)}</div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
