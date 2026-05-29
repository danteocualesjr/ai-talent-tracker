import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { normalizeLinkedInUrl } from "@/lib/utils";

/**
 * Apply a verified opt-out: mark the profile, purge snapshots, remove from all
 * watchlists, and hide any public events.
 */
export async function applyProfileOptOut(rawUrl: string): Promise<{ profileId: string } | null> {
  const url = normalizeLinkedInUrl(rawUrl);
  if (!url) return null;

  const db = createAdminClient();

  let { data: profile } = await db.from("profiles").select("id").eq("linkedin_url", url).maybeSingle();
  if (!profile) {
    const ins = await db.from("profiles").insert({ linkedin_url: url, is_opted_out: true }).select("id").single();
    if (ins.error || !ins.data) throw ins.error ?? new Error("opt-out insert failed");
    return { profileId: ins.data.id as string };
  }

  const profileId = profile.id as string;

  await db.from("profiles").update({ is_opted_out: true }).eq("id", profileId);
  await db.from("profile_snapshots").delete().eq("profile_id", profileId);
  await db.from("watchlist_profiles").delete().eq("profile_id", profileId);
  await db.from("events").update({ is_public: false }).eq("profile_id", profileId);

  return { profileId };
}
