import "server-only";
import { inngest } from "./client";
import { createAdminClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers";
import { diffProfiles, hashSnapshot } from "@/lib/diff";
import { classifyByRules } from "@/lib/classifier/rules";
import { classifyWithLLM } from "@/lib/classifier/llm";
import { dispatchEvent } from "@/lib/notifications/dispatch";
import type { Profile, ProfileSnapshot, RefreshCadence } from "@/types/db";
import type { ProviderProfile } from "@/lib/providers";

/**
 * Cron: every hour scan profiles that are due for a refresh based on the
 * cadence of any org watching them, then fan out refresh events.
 */
export const scheduleRefreshes = inngest.createFunction(
  { id: "schedule-refreshes" },
  { cron: "0 * * * *" },
  async ({ step }) => {
    const db = createAdminClient();
    const due = await step.run("find-due-profiles", async () => {
      const { data, error } = await db
        .from("watchlist_profiles")
        .select("profile_id, profiles!inner(id, next_sync_at, is_opted_out)")
        .eq("profiles.is_opted_out", false)
        .or(`profiles.next_sync_at.lte.${new Date().toISOString()},profiles.next_sync_at.is.null`)
        .limit(500);
      if (error) throw error;
      const seen = new Set<string>();
      const ids: { id: string }[] = [];
      for (const row of data ?? []) {
        const profileId = (row as { profile_id: string }).profile_id;
        if (seen.has(profileId)) continue;
        seen.add(profileId);
        ids.push({ id: profileId });
      }
      return ids;
    });

    if (due.length === 0) return { refreshed: 0 };

    await step.sendEvent(
      "fan-out",
      due.map((p) => ({ name: "profile/refresh.requested", data: { profile_id: p.id, reason: "cron" } })),
    );
    return { refreshed: due.length };
  },
);

/**
 * Refresh a single profile: pull the provider, store a snapshot, diff against
 * the previous snapshot, classify changes, persist events, dispatch alerts.
 */
export const refreshProfile = inngest.createFunction(
  {
    id: "refresh-profile",
    concurrency: { limit: 10 },
    retries: 3,
  },
  { event: "profile/refresh.requested" },
  async ({ event, step }) => {
    const profileId = event.data.profile_id;
    const db = createAdminClient();
    const provider = getProvider();

    const profile = await step.run("load-profile", async () => {
      const { data, error } = await db.from("profiles").select("*").eq("id", profileId).single();
      if (error) throw error;
      const row = data as Profile;
      if (row.is_opted_out) return null;
      return row;
    });
    if (!profile) return { skipped: true, reason: "opted_out" };

    const fetched = await step.run("fetch-from-provider", async () => provider.fetch(profile.linkedin_url));
    const hash = hashSnapshot(fetched);

    const stored = await step.run("store-snapshot", async () => {
      const { data: existing } = await db
        .from("profile_snapshots")
        .select("id")
        .eq("profile_id", profileId)
        .eq("content_hash", hash)
        .maybeSingle();
      if (existing) return null;

      const { data, error } = await db
        .from("profile_snapshots")
        .insert({
          profile_id: profileId,
          source: provider.name,
          raw: fetched.raw as object,
          content_hash: hash,
        })
        .select("*")
        .single();
      if (error) {
        if (error.code === "23505") return null;
        throw error;
      }
      return data as ProfileSnapshot;
    });

    // Always bump last_synced_at + reschedule.
    await step.run("touch-profile", async () => {
      const next = await nextSyncAt(db, profileId, profile);
      const { error } = await db
        .from("profiles")
        .update({
          full_name: fetched.full_name ?? profile.full_name,
          headline: fetched.headline ?? profile.headline,
          current_company: fetched.current_company ?? profile.current_company,
          current_title: fetched.current_title ?? profile.current_title,
          location: fetched.location ?? profile.location,
          avatar_url: fetched.avatar_url ?? profile.avatar_url,
          about: fetched.about ?? profile.about,
          github_handle: fetched.github_handle ?? profile.github_handle,
          x_handle: fetched.x_handle ?? profile.x_handle,
          last_synced_at: new Date().toISOString(),
          next_sync_at: next,
        })
        .eq("id", profileId);
      if (error) throw error;
    });

    if (!stored) return { changed: false };

    // First sync establishes a baseline — skip diffing until a prior snapshot exists.
    if (!profile.last_synced_at) return { changed: false, baseline: true };

    // Diff vs previous snapshot's projection (the profile row prior to update).
    const prev: Partial<ProviderProfile> = {
      full_name: profile.full_name,
      headline: profile.headline,
      current_company: profile.current_company,
      current_title: profile.current_title,
      location: profile.location,
      about: profile.about,
      github_handle: profile.github_handle,
      x_handle: profile.x_handle,
    };
    const diffs = diffProfiles(prev, fetched);
    if (diffs.length === 0) return { changed: false };

    let classification = classifyByRules(
      diffs,
      { current_company: profile.current_company, headline: profile.headline },
      { current_company: fetched.current_company, headline: fetched.headline },
    );

    // Escalate ambiguous results to the LLM.
    if (!classification || classification.confidence < 0.6) {
      const llm = await step.run("llm-classify", async () =>
        classifyWithLLM({
          diffs,
          prev: prev as Record<string, string | null>,
          next: fetched as unknown as Record<string, string | null>,
        }),
      );
      if (llm) classification = llm;
    }

    if (!classification) return { changed: true, eventCreated: false };

    const eventRow = await step.run("persist-event", async () => {
      const { data, error } = await db
        .from("events")
        .insert({
          profile_id: profileId,
          type: classification!.type,
          confidence: classification!.confidence,
          summary: classification!.summary,
          before: prev as object,
          after: fetched as unknown as object,
          is_public: ["left_company", "went_stealth", "headline_signals_founding"].includes(classification!.type)
            && classification!.confidence >= 0.7,
        })
        .select("*")
        .single();
      if (error) throw error;

      if (classification!.status) {
        await db.from("profiles").update({ status: classification!.status }).eq("id", profileId);
      }
      return data;
    });

    await step.sendEvent("notify", { name: "event/created", data: { event_id: eventRow.id } });
    return { changed: true, eventCreated: true, type: classification.type };
  },
);

/**
 * Fan-out event notifications to every channel configured by orgs that watch
 * this profile.
 */
export const notifyEvent = inngest.createFunction(
  { id: "notify-event", retries: 5 },
  { event: "event/created" },
  async ({ event }) => {
    return dispatchEvent(event.data.event_id);
  },
);

function cadenceHours(cadence: RefreshCadence): number {
  switch (cadence) {
    case "hourly": return 1;
    case "daily": return 24;
    case "weekly": return 168;
  }
}

async function nextSyncAt(
  db: ReturnType<typeof createAdminClient>,
  profileId: string,
  profile: Profile,
): Promise<string> {
  const { data: watchers } = await db
    .from("watchlist_profiles")
    .select("watchlists(organizations(refresh_cadence))")
    .eq("profile_id", profileId);

  const cadences = ((watchers ?? []) as Array<{ watchlists?: { organizations?: { refresh_cadence?: RefreshCadence } | { refresh_cadence?: RefreshCadence }[] | null } | { organizations?: { refresh_cadence?: RefreshCadence } | { refresh_cadence?: RefreshCadence }[] | null }[] | null }>)
    .flatMap((w) => {
      const wl = w.watchlists;
      if (!wl) return [];
      const rows = Array.isArray(wl) ? wl : [wl];
      return rows.flatMap((row) => {
        const org = row.organizations;
        if (!org) return [];
        const orgRows = Array.isArray(org) ? org : [org];
        return orgRows.map((o) => o.refresh_cadence).filter((c): c is RefreshCadence => Boolean(c));
      });
    });

  const fastest = cadences.length > 0
    ? Math.min(...cadences.map(cadenceHours))
    : cadenceHours("weekly");

  const base = profile.status === "left" || profile.status === "stealth"
    ? Math.min(fastest, 6)
    : fastest;

  return new Date(Date.now() + base * 60 * 60 * 1000).toISOString();
}
