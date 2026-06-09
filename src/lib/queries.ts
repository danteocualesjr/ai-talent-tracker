import "server-only";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { EventRow, Lab, Profile } from "@/types/db";

export async function orgWatchesProfile(orgId: string, profileId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const db = createAdminClient();
  const { count, error } = await db
    .from("watchlist_profiles")
    .select("profile_id, watchlists!inner(org_id)", { count: "exact", head: true })
    .eq("watchlists.org_id", orgId)
    .eq("profile_id", profileId);
  if (error) return false;
  return (count ?? 0) > 0;
}

export async function listOrgProfiles(orgId: string): Promise<(Profile & { watchlist_id: string })[]> {
  if (!isSupabaseConfigured()) return [];
  const db = createAdminClient();
  const { data } = await db
    .from("watchlist_profiles")
    .select("watchlist_id, profiles(*), watchlists!inner(org_id)")
    .eq("watchlists.org_id", orgId);

  return ((data ?? []) as unknown as Array<{ watchlist_id: string; profiles: Profile }>).map((r) => ({
    ...(r.profiles as Profile),
    watchlist_id: r.watchlist_id,
  }));
}

export async function getOrgEvents(orgId: string, limit = 50): Promise<(EventRow & { profile: Profile })[]> {
  if (!isSupabaseConfigured()) return [];
  const db = createAdminClient();

  const { data: watched } = await db
    .from("watchlist_profiles")
    .select("profile_id, watchlists!inner(org_id)")
    .eq("watchlists.org_id", orgId);
  const ids = (watched ?? []).map((w) => (w as { profile_id: string }).profile_id);
  if (ids.length === 0) return [];

  const { data } = await db
    .from("events")
    .select("*, profile:profiles(*)")
    .in("profile_id", ids)
    .order("detected_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as unknown as (EventRow & { profile: Profile })[];
}

export async function countRecentOrgEvents(orgId: string, days = 7): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const db = createAdminClient();
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const { data: watched } = await db
    .from("watchlist_profiles")
    .select("profile_id, watchlists!inner(org_id)")
    .eq("watchlists.org_id", orgId);
  const ids = (watched ?? []).map((w) => (w as { profile_id: string }).profile_id);
  if (ids.length === 0) return 0;

  const { count } = await db
    .from("events")
    .select("*", { count: "exact", head: true })
    .in("profile_id", ids)
    .gte("detected_at", since);

  return count ?? 0;
}

export async function getPublicEvents(limit = 50): Promise<(EventRow & { profile: Profile })[]> {
  if (!isSupabaseConfigured()) return [];
  const db = createAdminClient();
  const { data } = await db
    .from("events")
    .select("*, profile:profiles(*)")
    .eq("is_public", true)
    .order("detected_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as (EventRow & { profile: Profile })[];
}

export async function listLabs(): Promise<Lab[]> {
  if (!isSupabaseConfigured()) return [];
  const db = createAdminClient();
  const { data } = await db.from("labs").select("*").order("is_featured", { ascending: false }).order("name");
  return (data ?? []) as Lab[];
}

export async function getLabBySlug(slug: string): Promise<Lab | null> {
  if (!isSupabaseConfigured()) return null;
  const db = createAdminClient();
  const { data } = await db.from("labs").select("*").eq("slug", slug).maybeSingle();
  return (data ?? null) as Lab | null;
}

export async function listLabProfiles(labId: string, limit = 100): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return [];
  const db = createAdminClient();
  const { data } = await db
    .from("profiles")
    .select("*")
    .eq("current_company_lab_id", labId)
    .order("status")
    .limit(limit);
  return (data ?? []) as Profile[];
}
