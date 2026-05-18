import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
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
  const initials = (ev.profile.full_name || ev.profile.linkedin_handle || "??").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="container max-w-2xl flex-1 py-10">
        <Button asChild variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
          <Link href="/feed"><ArrowLeft className="mr-1 h-4 w-4" /> Back to feed</Link>
        </Button>

        <article className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="border-b bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
            Detected {formatRelative(ev.detected_at)} · confidence {Number(ev.confidence).toFixed(2)}
          </div>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                {ev.profile.avatar_url ? <AvatarImage src={ev.profile.avatar_url} alt={ev.profile.full_name ?? ""} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold tracking-tight">{ev.profile.full_name || ev.profile.linkedin_handle}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="warning">{ev.type.replace(/_/g, " ")}</Badge>
                  {ev.profile.current_company && (
                    <span className="text-sm text-muted-foreground">· {ev.profile.current_company}</span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-5 leading-relaxed">{ev.summary}</p>
            <div className="mt-6 flex gap-2">
              <Button asChild variant="outline">
                <a href={ev.profile.linkedin_url} target="_blank" rel="noreferrer noopener">
                  View on LinkedIn <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
              <Button asChild>
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
