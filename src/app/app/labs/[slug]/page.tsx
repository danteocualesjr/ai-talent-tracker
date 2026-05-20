import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLabBySlug, listLabProfiles } from "@/lib/queries";
import { formatRelative } from "@/lib/utils";

export default async function LabRosterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) notFound();
  const people = await listLabProfiles(lab.id, 500);

  const stealth = people.filter((p) => p.status === "stealth").length;
  const left = people.filter((p) => p.status === "left").length;

  return (
    <div className="container max-w-5xl space-y-6 py-8">
      <Button asChild variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
        <Link href="/app/labs"><ArrowLeft className="mr-1 h-4 w-4" /> Back to labs</Link>
      </Button>

      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-4">
          {lab.logo_url ? (
            <img src={lab.logo_url} alt={lab.name} className="h-14 w-14 rounded-md border bg-muted object-contain" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-xl font-semibold">{lab.name.slice(0, 1)}</div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{lab.name}</h1>
            <p className="text-sm text-muted-foreground">{lab.description} · {lab.domain}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Indexed" value={people.length} />
          <Stat label="Stealth" value={stealth} tone="amber" />
          <Stat label="Left" value={left} tone="rose" />
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-3 text-sm font-semibold">Employees</div>
        {people.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No people indexed yet for this lab.
          </div>
        ) : (
          <div className="divide-y">
            {people.map((p) => {
              const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
              return (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar>
                    {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <Link href={`/app/profiles/${p.id}`} className="truncate font-medium hover:underline">
                      {p.full_name || p.linkedin_handle}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">{p.headline ?? p.current_title ?? ""}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{p.status}</Badge>
                  <div className="font-mono text-xs text-muted-foreground">{formatRelative(p.last_synced_at)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "amber" | "rose" }) {
  const color = tone === "amber" ? "text-amber-600" : tone === "rose" ? "text-rose-600" : "";
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
