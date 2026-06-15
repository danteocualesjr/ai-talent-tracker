import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { listLabs } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Lab rosters" };

export default async function LabsIndexPage() {
  const labs = await listLabs();
  return (
    <div className="container max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="Lab rosters"
        eyebrow="Tracking"
        icon={<Sparkles className="h-4 w-4" />}
        description="Curated employee lists for top AI labs. Click to view and bulk-add."
        divider
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((l) => (
          <Link
            key={l.id}
            href={`/app/labs/${l.slug}`}
            className="group surface-card surface-card-hover relative overflow-hidden p-6"
          >
            <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="flex items-center justify-between">
              {l.logo_url ? (
                <Image
                  src={l.logo_url}
                  alt={l.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-xl border border-border/60 bg-muted object-contain p-1"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-muted text-lg font-bold text-muted-foreground">
                  {l.name.slice(0, 1)}
                </div>
              )}
              {l.is_featured && <Badge variant="secondary">Featured</Badge>}
            </div>
            <div className="mt-5 font-bold tracking-tight">{l.name}</div>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {l.description ?? l.domain}
            </p>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
              View roster <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
