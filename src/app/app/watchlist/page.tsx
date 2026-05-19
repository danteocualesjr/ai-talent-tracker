import Link from "next/link";
import { ListChecks, RefreshCw, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { listOrgProfiles } from "@/lib/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddProfileForm } from "./add-profile-form";
import { removeProfileForm, refreshNowForm } from "./actions";
import { formatRelative } from "@/lib/utils";

export const metadata = { title: "Watchlist" };

const STATUS_TONE: Record<string, "default" | "secondary" | "success" | "warning"> = {
  active: "secondary",
  left: "warning",
  stealth: "warning",
  founder: "success",
  unknown: "secondary",
};

export default async function WatchlistPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);
  const profiles = await listOrgProfiles(org.id);

  const fill = Math.min(100, (profiles.length / org.profile_limit) * 100);

  return (
    <div className="container max-w-5xl space-y-8 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Profiles you&apos;re tracking across your organization.</p>
        </div>
        <div className="min-w-[240px]">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>{profiles.length} / {org.profile_limit} profiles</span>
            <span className="rounded-full bg-muted px-2 py-0.5">{org.refresh_cadence} refresh</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500" 
              style={{ width: `${fill}%` }} 
            />
          </div>
        </div>
      </header>

      <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 to-purple-500/5 p-6 transition-all hover:shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ListChecks className="h-4 w-4 text-primary" />
            </div>
            Add a LinkedIn profile
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Paste any public profile URL. The first refresh runs immediately.</p>
          <div className="mt-4">
            <AddProfileForm />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="font-semibold">Tracked profiles</div>
          <div className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{profiles.length} total</div>
        </div>

        {profiles.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary">
              <ListChecks className="h-7 w-7" />
            </div>
            <div className="font-semibold">No profiles yet</div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Paste a LinkedIn URL above or browse <Link href="/app/labs" className="font-medium text-primary hover:underline">curated lab rosters</Link> to bulk-add.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {profiles.map((p) => {
              const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
              return (
                <div key={p.id} className="group flex items-center gap-4 px-6 py-4 transition-all duration-200 hover:bg-accent/30">
                  <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm transition-transform group-hover:scale-105">
                    {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <Link href={`/app/profiles/${p.id}`} className="truncate font-semibold transition-colors hover:text-primary">
                        {p.full_name || p.linkedin_handle}
                      </Link>
                      <Badge variant={STATUS_TONE[p.status] ?? "secondary"} className="capitalize">{p.status}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {p.headline || p.current_title || p.current_company || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground/70">
                      Last synced {formatRelative(p.last_synced_at)} · {p.current_company ?? "no current company"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <form action={refreshNowForm}>
                      <input type="hidden" name="profile_id" value={p.id} />
                      <Button variant="ghost" size="icon" title="Refresh now" className="hover:bg-primary/10 hover:text-primary">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </form>
                    <form action={removeProfileForm}>
                      <input type="hidden" name="profile_id" value={p.id} />
                      <Button variant="ghost" size="icon" title="Remove" className="text-destructive/70 hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
