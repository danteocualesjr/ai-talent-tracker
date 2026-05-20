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
    <div className="container max-w-5xl space-y-7 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Watchlist</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Profiles you&apos;re tracking across your organization.
          </p>
        </div>
        <div className="min-w-[240px]">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span><span className="tnum text-foreground">{profiles.length}</span> / <span className="tnum">{org.profile_limit}</span> profiles</span>
            <span>{org.refresh_cadence}</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-foreground transition-all duration-500" style={{ width: `${fill}%` }} />
          </div>
        </div>
      </header>

      <div className="rounded-lg border bg-card p-5">
        <div className="text-sm font-semibold">Add a LinkedIn profile</div>
        <p className="mt-1 text-xs text-muted-foreground">Paste any public profile URL. The first refresh runs immediately.</p>
        <div className="mt-4">
          <AddProfileForm />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="text-sm font-semibold">Tracked profiles</div>
          <div className="text-xs text-muted-foreground"><span className="tnum">{profiles.length}</span> total</div>
        </div>

        {profiles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background text-muted-foreground">
              <ListChecks className="h-5 w-5" />
            </div>
            <div className="text-sm font-semibold">No profiles yet</div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Paste a LinkedIn URL above or browse{" "}
              <Link href="/app/labs" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
                curated lab rosters
              </Link>{" "}
              to bulk-add.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {profiles.map((p) => {
              const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
              return (
                <div key={p.id} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/40">
                  <Avatar className="h-9 w-9">
                    {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
                    <AvatarFallback className="bg-muted text-[11px] font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/app/profiles/${p.id}`} className="truncate text-sm font-medium hover:underline">
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
                  <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <form action={refreshNowForm}>
                      <input type="hidden" name="profile_id" value={p.id} />
                      <Button variant="ghost" size="icon" title="Refresh now" className="text-muted-foreground hover:text-foreground">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </form>
                    <form action={removeProfileForm}>
                      <input type="hidden" name="profile_id" value={p.id} />
                      <Button variant="ghost" size="icon" title="Remove" className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
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
