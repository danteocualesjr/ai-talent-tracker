import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { getOrgForUser } from "@/lib/org";

/** True when the user's org has this profile on a watchlist. */
export async function userWatchesProfile(userId: string, profileId: string): Promise<boolean> {
  const org = await getOrgForUser(userId);
  if (!org) return false;

  const db = createAdminClient();
  const { data: wls } = await db.from("watchlists").select("id").eq("org_id", org.id);
  const ids = ((wls ?? []) as { id: string }[]).map((w) => w.id);
  if (ids.length === 0) return false;

  const { count } = await db
    .from("watchlist_profiles")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .in("watchlist_id", ids);

  return (count ?? 0) > 0;
}
