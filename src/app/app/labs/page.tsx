import Link from "next/link";
import { listLabs } from "@/lib/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Lab rosters" };

export default async function LabsIndexPage() {
  const labs = await listLabs();
  return (
    <div className="container max-w-5xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lab rosters</h1>
        <p className="text-sm text-muted-foreground">Curated employee lists for top AI labs.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {labs.map((l) => (
          <Link key={l.id} href={`/app/labs/${l.slug}`}>
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{l.name}</CardTitle>
                  {l.is_featured && <Badge variant="secondary">Featured</Badge>}
                </div>
                <CardDescription>{l.description ?? l.domain}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">{l.domain}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
