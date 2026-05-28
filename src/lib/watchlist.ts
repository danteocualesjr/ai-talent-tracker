import "server-only";
import type { createAdminClient } from "@/lib/supabase/server";

type AdminClient = ReturnType<typeof createAdminClient>;

export async function isProfileOnOrgWatchlist(
  db: AdminClient,
  orgId: string,
  profileId: string,
): Promise<boolean> {
  const { data: wls } = await db.from("watchlists").select("id").eq("org_id", orgId);
  const watchlistIds = ((wls ?? []) as { id: string }[]).map((w) => w.id);
  if (watchlistIds.length === 0) return false;

  const { count } = await db
    .from("watchlist_profiles")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .in("watchlist_id", watchlistIds);
  return (count ?? 0) > 0;
}
