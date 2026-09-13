import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, ExternalLink, Sparkles } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { BackLink } from "@/components/back-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { formatRelative } from "@/lib/utils";
import type { EventRow, EventType, Profile } from "@/types/db";

export const revalidate = 300;

const TYPE_META: Record<EventType, { label: string; tone: "success" | "warning" | "info" | "purple" | "secondary" }> = {
  left_company: { label: "Left company", tone: "warning" },
  joined_company: { label: "Joined company", tone: "info" },
  went_stealth: { label: "Went stealth", tone: "warning" },
  headline_signals_founding: { label: "Founding signal", tone: "success" },
  role_change_internal: { label: "Role change", tone: "secondary" },
  about_changed: { label: "About updated", tone: "secondary" },
  location_changed: { label: "Location change", tone: "secondary" },
  github_dark: { label: "GitHub dark", tone: "purple" },
  new_domain: { label: "New domain", tone: "success" },
  other: { label: "Update", tone: "secondary" },
};

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
  const typeMeta = TYPE_META[ev.type] ?? TYPE_META.other;

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main id="main-content" className="container max-w-2xl flex-1 px-4 py-10 md:py-14">
        <BackLink href="/feed">Back to feed</BackLink>

        <article className="surface-elevated mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="pointer-events-none h-0.5 bg-gradient-to-r from-signal/80 via-signal to-signal/80" />
          <div className="relative flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-muted/40 via-muted/20 to-signal/[0.06] px-6 py-3.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
              </span>
              Detected <span className="font-medium text-foreground">{formatRelative(ev.detected_at)}</span>
            </span>
            <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-signal/10 px-2.5 py-1 text-[11px] font-semibold text-signal">
              <Sparkles className="h-3 w-3" />
              {Math.round(Number(ev.confidence) * 100)}% confidence
            </span>
          </div>
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-background shadow-sm">
                {ev.profile.avatar_url ? <AvatarImage src={ev.profile.avatar_url} alt={ev.profile.full_name ?? ""} /> : null}
                <AvatarFallback className="text-base">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="font-serif text-2xl font-medium tracking-tight md:text-3xl">
                  {ev.profile.full_name || ev.profile.linkedin_handle}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={typeMeta.tone}>{typeMeta.label}</Badge>
                  {ev.profile.current_company && (
                    <span className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {ev.profile.current_company}
                    </span>
                  )}
                </div>
                {ev.profile.headline && (
                  <p className="mt-2 text-sm text-muted-foreground">{ev.profile.headline}</p>
                )}
              </div>
            </div>
            <p className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-4 text-base leading-relaxed text-foreground/90">{ev.summary}</p>
            <div className="relative mt-8 overflow-hidden rounded-xl border border-signal/20 bg-signal/[0.04] p-4">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/40 to-transparent" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Want alerts when profiles like this change?</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Start a free watchlist and get Slack or email the moment it happens.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="outline" className="flex-1 sm:flex-none">
                    <a href={ev.profile.linkedin_url} target="_blank" rel="noreferrer noopener">
                      View on LinkedIn <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button asChild variant="signal" className="flex-1 sm:flex-none">
                    <Link href="/login">Track profiles like this</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
