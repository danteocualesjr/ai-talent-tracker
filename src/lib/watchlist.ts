import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

/** True when the org has this profile on any of its watchlists. */
export async function orgWatchesProfile(orgId: string, profileId: string): Promise<boolean> {
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
  return !!data;
}
