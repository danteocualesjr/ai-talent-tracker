import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Returns true when the profile is on any watchlist owned by the org. */
export async function isProfileOnOrgWatchlist(
  db: SupabaseClient,
  orgId: string,
  profileId: string,
): Promise<boolean> {
  const { data: wls } = await db.from("watchlists").select("id").eq("org_id", orgId);
  const watchlistIds = ((wls ?? []) as { id: string }[]).map((w) => w.id);
  if (watchlistIds.length === 0) return false;

  const { count, error } = await db
    .from("watchlist_profiles")
    .select("profile_id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .in("watchlist_id", watchlistIds);
  if (error) throw error;
  return (count ?? 0) > 0;
}
