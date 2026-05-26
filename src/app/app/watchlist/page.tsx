import Link from "next/link";
import { ListChecks, RefreshCw, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { listOrgProfiles } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { EmptyPanel, Panel } from "@/components/panel";
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
    <div className="container max-w-5xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="Watchlist"
        description="Profiles you're tracking across your organization."
      >
        <div className="w-full min-w-[260px] rounded-2xl border border-border/60 bg-card p-4 sm:w-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <span className="tnum font-bold text-foreground">{profiles.length}</span> /{" "}
              <span className="tnum">{org.profile_limit}</span> profiles
            </span>
            <span className="font-medium text-foreground">{org.refresh_cadence}</span>
          </div>
          <div className="progress-track mt-3">
            <div className="progress-fill" style={{ width: `${fill}%` }} />
          </div>
        </div>
      </PageHeader>

      <Panel title="Add a LinkedIn profile" description="Paste any public profile URL. The first refresh runs immediately." bodyClassName="p-5">
        <AddProfileForm />
      </Panel>

      <Panel
        title="Tracked profiles"
        action={<span className="tnum text-xs text-muted-foreground">{profiles.length} total</span>}
        bodyClassName={profiles.length === 0 ? undefined : "divide-y divide-border/60"}
      >
        {profiles.length === 0 ? (
          <EmptyPanel
            icon={<ListChecks className="h-5 w-5" />}
            title="No profiles yet"
            body="Paste a LinkedIn URL above or browse curated lab rosters to bulk-add."
            cta={
              <Button asChild variant="outline">
                <Link href="/app/labs">Browse lab rosters</Link>
              </Button>
            }
          />
        ) : (
          profiles.map((p) => {
            const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
            return (
              <div key={p.id} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                <Avatar className="h-10 w-10 ring-2 ring-background">
                  {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
                  <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/app/profiles/${p.id}`} className="truncate text-sm font-semibold hover:underline">
                      {p.full_name || p.linkedin_handle}
                    </Link>
                    <Badge variant={STATUS_TONE[p.status] ?? "secondary"} className="capitalize">
                      {p.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {p.headline || p.current_title || p.current_company || "—"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Last synced {formatRelative(p.last_synced_at)} · {p.current_company ?? "no current company"}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <form action={refreshNowForm}>
                    <input type="hidden" name="profile_id" value={p.id} />
                    <Button variant="ghost" size="icon" title="Refresh now" className="rounded-lg text-muted-foreground hover:text-foreground">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </form>
                  <form action={removeProfileForm}>
                    <input type="hidden" name="profile_id" value={p.id} />
                    <Button variant="ghost" size="icon" title="Remove" className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}
