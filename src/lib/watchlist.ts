import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

export async function isProfileInOrgWatchlist(orgId: string, profileId: string): Promise<boolean> {
  const db = createAdminClient();
  const { count } = await db
    .from("watchlist_profiles")
    .select("profile_id, watchlists!inner(org_id)", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("watchlists.org_id", orgId);
  return (count ?? 0) > 0;
}
