import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { BackLink } from "@/components/back-link";
import { EmptyPanel, Panel } from "@/components/panel";
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

  const stealth = people.filter((p) => p.status === "stealth").length;
  const left = people.filter((p) => p.status === "left").length;

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 hero-backdrop" />
          <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
          <div className="container relative py-12 md:py-16">
            <BackLink href="/labs" className="mb-6">
              All labs
            </BackLink>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {lab.logo_url ? (
                <Image
                  src={lab.logo_url}
                  alt={lab.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-2xl border border-border/60 bg-card object-contain p-2 shadow-sm"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border/60 bg-card text-3xl font-bold shadow-sm">
                  {lab.name.slice(0, 1)}
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{lab.name}</h1>
                <p className="mt-2 max-w-xl text-muted-foreground md:text-lg">{lab.description}</p>
              </div>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              <MiniStat label="Indexed" value={people.length} />
              <MiniStat label="Stealth" value={stealth} highlight />
              <MiniStat label="Left" value={left} />
            </div>
            <Button asChild className="mt-8">
              <Link href="/login">Track this lab</Link>
            </Button>
          </div>
        </section>

        <section className="container max-w-4xl py-10 md:py-12">
          <Panel
            title={
              <>
                <span className="tnum">{people.length}</span> tracked employees
              </>
            }
            bodyClassName={people.length === 0 ? undefined : "divide-y divide-border/60"}
          >
            {people.length === 0 ? (
              <EmptyPanel
                icon={<span className="text-lg font-bold">{lab.name.slice(0, 1)}</span>}
                title="Roster is being indexed"
                body="We're building the employee list for this lab. Check back soon."
              />
            ) : (
              people.map((p) => {
                const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
                return (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                    <Avatar className="h-10 w-10">
                      {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
                      <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <a
                        href={p.linkedin_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="truncate text-sm font-semibold hover:underline"
                      >
                        {p.full_name || p.linkedin_handle}
                      </a>
                      <p className="truncate text-sm text-muted-foreground">{p.headline ?? p.current_title ?? ""}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {p.status}
                    </Badge>
                  </div>
                );
              })
            )}
          </Panel>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-border/60 px-4 py-3 text-center ${highlight ? "bg-signal/5" : "bg-card"}`}
    >
      <div className="tnum text-2xl font-bold">{value}</div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
