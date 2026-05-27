import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, RefreshCadence } from "@/types/db";

const CADENCE_HOURS: Record<RefreshCadence, number> = {
  weekly: 168,
  daily: 24,
  hourly: 1,
};

type ProfileScheduleInput = Pick<Profile, "id" | "status">;

export async function computeNextSyncAt(
  db: SupabaseClient,
  profile: ProfileScheduleInput,
): Promise<string> {
  if (profile.status === "left" || profile.status === "stealth") {
    return new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
  }

  const { data: watchers } = await db
    .from("watchlist_profiles")
    .select("watchlists(organizations(refresh_cadence))")
    .eq("profile_id", profile.id);

  let hours = 168;
  for (const row of watchers ?? []) {
    const wl = (row as {
      watchlists?: {
        organizations?: { refresh_cadence?: RefreshCadence } | { refresh_cadence?: RefreshCadence }[];
      };
    }).watchlists;
    const org = wl?.organizations;
    const cadence = Array.isArray(org) ? org[0]?.refresh_cadence : org?.refresh_cadence;
    if (cadence && cadence in CADENCE_HOURS) {
      hours = Math.min(hours, CADENCE_HOURS[cadence]);
    }
  }

  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}
