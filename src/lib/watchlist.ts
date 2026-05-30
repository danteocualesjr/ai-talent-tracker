import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Returns true when the profile is on any watchlist owned by the org. */
export async function isProfileInOrgWatchlist(
  db: SupabaseClient,
  orgId: string,
  profileId: string,
): Promise<boolean> {
  const { data: wls } = await db.from("watchlists").select("id").eq("org_id", orgId);
  const ids = ((wls ?? []) as { id: string }[]).map((w) => w.id);
  if (ids.length === 0) return false;

  const { count } = await db
    .from("watchlist_profiles")
    .select("profile_id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .in("watchlist_id", ids);
  return (count ?? 0) > 0;
}
