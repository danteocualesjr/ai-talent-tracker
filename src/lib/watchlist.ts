import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

type AdminClient = ReturnType<typeof createAdminClient>;

/** True when the profile appears on any watchlist owned by the org. */
export async function isProfileWatchedByOrg(
  db: AdminClient,
  orgId: string,
  profileId: string,
): Promise<boolean> {
  const { count, error } = await db
    .from("watchlist_profiles")
    .select("profile_id, watchlists!inner(org_id)", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("watchlists.org_id", orgId);
  if (error) throw error;
  return (count ?? 0) > 0;
}
