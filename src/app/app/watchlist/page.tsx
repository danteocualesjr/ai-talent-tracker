import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { listOrgProfiles } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddProfileForm } from "./add-profile-form";
import { removeProfileForm, refreshNowForm } from "./actions";
import { formatRelative } from "@/lib/utils";
import { RefreshCw, Trash2 } from "lucide-react";

export const metadata = { title: "Watchlist" };

export default async function WatchlistPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);
  const profiles = await listOrgProfiles(org.id);

  return (
    <div className="container max-w-5xl space-y-6 py-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Watchlist</h1>
          <p className="text-sm text-muted-foreground">
            {profiles.length}/{org.profile_limit} profiles tracked
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a LinkedIn profile</CardTitle>
        </CardHeader>
        <CardContent>
          <AddProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tracked profiles</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {profiles.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No profiles yet.</div>
          ) : (
            profiles.map((p) => {
              const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
              return (
                <div key={p.id} className="flex items-center gap-4 py-3">
                  <Avatar>
                    {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <a href={p.linkedin_url} target="_blank" rel="noreferrer noopener" className="truncate font-medium hover:underline">
                        {p.full_name || p.linkedin_handle}
                      </a>
                      <Badge variant="secondary" className="capitalize">{p.status}</Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {p.headline || p.current_title || p.current_company || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last synced {formatRelative(p.last_synced_at)} · {p.current_company ?? "no current company"}
                    </p>
                  </div>
                  <form action={refreshNowForm}>
                    <input type="hidden" name="profile_id" value={p.id} />
                    <Button variant="ghost" size="icon" title="Refresh now"><RefreshCw className="h-4 w-4" /></Button>
                  </form>
                  <form action={removeProfileForm}>
                    <input type="hidden" name="profile_id" value={p.id} />
                    <Button variant="ghost" size="icon" title="Remove"><Trash2 className="h-4 w-4" /></Button>
                  </form>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
