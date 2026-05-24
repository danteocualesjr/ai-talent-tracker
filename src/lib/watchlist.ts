import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

/** True when the profile is on any watchlist owned by the org. */
export async function isProfileOnOrgWatchlist(orgId: string, profileId: string): Promise<boolean> {
  const db = createAdminClient();
  const { data: wls } = await db.from("watchlists").select("id").eq("org_id", orgId);
  const ids = ((wls ?? []) as { id: string }[]).map((w) => w.id);
  if (ids.length === 0) return false;

  const { data } = await db
    .from("watchlist_profiles")
    .select("profile_id")
    .eq("profile_id", profileId)
    .in("watchlist_id", ids)
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}
