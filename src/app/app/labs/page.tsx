import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listLabs } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Lab rosters" };

export default async function LabsIndexPage() {
  const labs = await listLabs();
  return (
    <div className="container max-w-6xl space-y-6 py-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Lab rosters</h1>
        <p className="mt-1 text-sm text-muted-foreground">Curated employee lists for top AI labs. Click to view and bulk-add.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((l) => (
          <Link
            key={l.id}
            href={`/app/labs/${l.slug}`}
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
    </div>
  );
}
