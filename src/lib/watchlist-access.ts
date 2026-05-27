import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Returns whether the org has this profile on any of its watchlists. */
export async function orgTracksProfile(
  db: SupabaseClient,
  orgId: string,
  profileId: string,
): Promise<boolean> {
  const { count, error } = await db
    .from("watchlist_profiles")
    .select("profile_id, watchlists!inner(org_id)", { count: "exact", head: true })
    .eq("watchlists.org_id", orgId)
    .eq("profile_id", profileId);
  if (error) throw error;
  return (count ?? 0) > 0;
}
