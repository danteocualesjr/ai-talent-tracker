import "server-only";
import type { createAdminClient } from "@/lib/supabase/server";

type AdminClient = ReturnType<typeof createAdminClient>;

/** True when the profile is on any watchlist owned by the org. */
export async function isProfileWatchedByOrg(
  db: AdminClient,
  orgId: string,
  profileId: string,
): Promise<boolean> {
  const { data: wls } = await db.from("watchlists").select("id").eq("org_id", orgId);
  const watchlistIds = ((wls ?? []) as { id: string }[]).map((w) => w.id);
  if (watchlistIds.length === 0) return false;

  const { data } = await db
    .from("watchlist_profiles")
    .select("profile_id")
    .eq("profile_id", profileId)
    .in("watchlist_id", watchlistIds)
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}
