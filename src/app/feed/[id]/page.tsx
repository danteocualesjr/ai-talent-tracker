import { notFound } from "next/navigation";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/server";
import { formatRelative } from "@/lib/utils";
import type { EventRow, Profile } from "@/types/db";

export const revalidate = 300;

export default async function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
      <main className="container max-w-2xl space-y-6 py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar>
                {ev.profile.avatar_url ? <AvatarImage src={ev.profile.avatar_url} alt={ev.profile.full_name ?? ""} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{ev.profile.full_name || ev.profile.linkedin_handle}</CardTitle>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{ev.type.replace(/_/g, " ")}</Badge>
                  <span>{formatRelative(ev.detected_at)}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{ev.summary}</p>
            <a href={ev.profile.linkedin_url} target="_blank" rel="noreferrer noopener" className="mt-4 inline-block text-sm underline">
              View on LinkedIn →
            </a>
          </CardContent>
        </Card>
      </main>
      <MarketingFooter />
    </div>
  );
}
