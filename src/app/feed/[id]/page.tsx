import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { BackLink } from "@/components/back-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { formatRelative } from "@/lib/utils";
import type { EventRow, Profile } from "@/types/db";

export const revalidate = 300;

export default async function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();
  const db = createAdminClient();
  const { data } = await db
    .from("events")
    .select("*, profile:profiles(*)")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();
  if (!data) notFound();
  const ev = data as unknown as EventRow & { profile: Profile };
  if (ev.profile.is_opted_out) notFound();
  const initials = (ev.profile.full_name || ev.profile.linkedin_handle || "??").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="container max-w-2xl flex-1 px-4 py-10 md:py-14">
        <BackLink href="/feed">Back to feed</BackLink>

        <article className="surface-elevated mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-6 py-3.5 text-xs text-muted-foreground">
            <span>
              Detected <span className="font-medium text-foreground">{formatRelative(ev.detected_at)}</span>
            </span>
            <span className="tnum font-medium">
              Confidence {Number(ev.confidence).toFixed(2)}
            </span>
          </div>
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-background">
                {ev.profile.avatar_url ? <AvatarImage src={ev.profile.avatar_url} alt={ev.profile.full_name ?? ""} /> : null}
                <AvatarFallback className="text-base">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {ev.profile.full_name || ev.profile.linkedin_handle}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="warning" className="capitalize">
                    {ev.type.replace(/_/g, " ")}
                  </Badge>
                  {ev.profile.current_company && (
                    <span className="text-sm text-muted-foreground">· {ev.profile.current_company}</span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-6 text-base leading-relaxed text-foreground/90">{ev.summary}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline" className="flex-1 sm:flex-none">
                <a href={ev.profile.linkedin_url} target="_blank" rel="noreferrer noopener">
                  View on LinkedIn <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </Button>
              <Button asChild className="flex-1 sm:flex-none">
                <Link href="/login">Track profiles like this</Link>
              </Button>
            </div>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
