import "server-only";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { EventRow, Lab, NotificationDelivery, NotificationChannel, Profile, EventType } from "@/types/db";

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

export async function isProfileOnOrgWatchlist(orgId: string, profileId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const db = createAdminClient();
  const { data } = await db
    .from("watchlist_profiles")
    .select("profile_id, watchlists!inner(org_id)")
    .eq("watchlists.org_id", orgId)
    .eq("profile_id", profileId)
    .maybeSingle();
  return Boolean(data);
}

export async function getLabBySlug(slug: string): Promise<Lab | null> {
  if (!isSupabaseConfigured()) return null;
  const db = createAdminClient();
  const { data } = await db.from("labs").select("*").eq("slug", slug).maybeSingle();
  return (data ?? null) as Lab | null;
}

export async function orgWatchesProfile(orgId: string, profileId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const db = createAdminClient();
  const { count } = await db
    .from("watchlist_profiles")
    .select("profile_id, watchlists!inner(org_id)", { count: "exact", head: true })
    .eq("watchlists.org_id", orgId)
    .eq("profile_id", profileId);
  return (count ?? 0) > 0;
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

/** Returns daily event counts for the last N days (oldest first), optionally filtered by event types. */
export async function getOrgDailyEventCounts(
  orgId: string,
  days = 14,
  eventTypes?: EventType[],
): Promise<number[]> {
  if (!isSupabaseConfigured()) return Array(days).fill(0);
  const db = createAdminClient();

  const { data: watched } = await db
    .from("watchlist_profiles")
    .select("profile_id, watchlists!inner(org_id)")
    .eq("watchlists.org_id", orgId);
  const ids = (watched ?? []).map((w) => (w as { profile_id: string }).profile_id);
  if (ids.length === 0) return Array(days).fill(0);

  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await db.from("events").select("detected_at, type").in("profile_id", ids).gte("detected_at", since);

  const buckets = Array(days).fill(0) as number[];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  for (const row of (data ?? []) as { detected_at: string; type: EventType }[]) {
    if (eventTypes && !eventTypes.includes(row.type)) continue;
    const dayIndex = Math.floor((new Date(row.detected_at).getTime() - start.getTime()) / 86400000);
    if (dayIndex >= 0 && dayIndex < days) buckets[dayIndex] += 1;
  }

  return buckets;
}

/** Returns cumulative watchlist size per day for the last N days. */
export async function getOrgWatchlistTrend(orgId: string, days = 14): Promise<number[]> {
  if (!isSupabaseConfigured()) return Array(days).fill(0);
  const db = createAdminClient();

  const { data: watched } = await db
    .from("watchlist_profiles")
    .select("created_at, watchlists!inner(org_id)")
    .eq("watchlists.org_id", orgId);

  const rows = (watched ?? []) as { created_at: string }[];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const buckets: number[] = [];
  for (let i = 0; i < days; i++) {
    const dayEnd = new Date(start.getTime() + (i + 1) * 86400000);
    const count = rows.filter((r) => new Date(r.created_at).getTime() < dayEnd.getTime()).length;
    buckets.push(count);
  }
  return buckets;
}

export type DeliveryLogEntry = NotificationDelivery & {
  channel: Pick<NotificationChannel, "id" | "type" | "config">;
  event: Pick<EventRow, "id" | "type" | "summary"> | null;
};

export type OrgInsights = {
  days: number;
  totalEvents: number;
  dailyCounts: number[];
  byType: { type: EventType; count: number }[];
  topProfiles: {
    profileId: string;
    name: string;
    count: number;
    latestAt: string;
    latestType: EventType;
  }[];
  peakDayIndex: number;
  peakDayCount: number;
};

/** Aggregated signal analytics for the workspace insights view. */
export async function getOrgInsights(orgId: string, days = 30): Promise<OrgInsights> {
  const empty: OrgInsights = {
    days,
    totalEvents: 0,
    dailyCounts: Array(days).fill(0),
    byType: [],
    topProfiles: [],
    peakDayIndex: 0,
    peakDayCount: 0,
  };
  if (!isSupabaseConfigured()) return empty;

  const db = createAdminClient();
  const { data: watched } = await db
    .from("watchlist_profiles")
    .select("profile_id, watchlists!inner(org_id)")
    .eq("watchlists.org_id", orgId);
  const ids = (watched ?? []).map((w) => (w as { profile_id: string }).profile_id);
  if (ids.length === 0) return empty;

  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await db
    .from("events")
    .select("id, type, detected_at, profile_id, profile:profiles(id, full_name, linkedin_handle)")
    .in("profile_id", ids)
    .gte("detected_at", since)
    .order("detected_at", { ascending: false });

  type Row = {
    id: string;
    type: EventType;
    detected_at: string;
    profile_id: string;
    profile: Pick<Profile, "id" | "full_name" | "linkedin_handle"> | null;
  };
  const rows = (data ?? []) as unknown as Row[];

  const dailyCounts = Array(days).fill(0) as number[];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const typeCounts = new Map<EventType, number>();
  const profileCounts = new Map<
    string,
    { count: number; latestAt: string; latestType: EventType; name: string }
  >();

  for (const row of rows) {
    typeCounts.set(row.type, (typeCounts.get(row.type) ?? 0) + 1);

    const dayIndex = Math.floor((new Date(row.detected_at).getTime() - start.getTime()) / 86400000);
    if (dayIndex >= 0 && dayIndex < days) dailyCounts[dayIndex] += 1;

    const name =
      row.profile?.full_name ?? row.profile?.linkedin_handle ?? row.profile_id.slice(0, 8);
    const existing = profileCounts.get(row.profile_id);
    if (!existing) {
      profileCounts.set(row.profile_id, {
        count: 1,
        latestAt: row.detected_at,
        latestType: row.type,
        name,
      });
    } else {
      existing.count += 1;
    }
  }

  let peakDayIndex = 0;
  let peakDayCount = 0;
  dailyCounts.forEach((c, i) => {
    if (c > peakDayCount) {
      peakDayCount = c;
      peakDayIndex = i;
    }
  });

  const byType = [...typeCounts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const topProfiles = [...profileCounts.entries()]
    .map(([profileId, v]) => ({
      profileId,
      name: v.name,
      count: v.count,
      latestAt: v.latestAt,
      latestType: v.latestType,
    }))
    .sort((a, b) => b.count - a.count || b.latestAt.localeCompare(a.latestAt))
    .slice(0, 8);

  return {
    days,
    totalEvents: rows.length,
    dailyCounts,
    byType,
    topProfiles,
    peakDayIndex,
    peakDayCount,
  };
}

export async function getOrgDeliveries(orgId: string, limit = 50): Promise<DeliveryLogEntry[]> {
  if (!isSupabaseConfigured()) return [];
  const db = createAdminClient();

  const { data: channels } = await db.from("notification_channels").select("id").eq("org_id", orgId);
  const channelIds = ((channels ?? []) as { id: string }[]).map((c) => c.id);
  if (channelIds.length === 0) return [];

  const { data } = await db
    .from("notification_deliveries")
    .select("*, channel:notification_channels(id, type, config), event:events(id, type, summary)")
    .in("channel_id", channelIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as unknown as DeliveryLogEntry[];
}
