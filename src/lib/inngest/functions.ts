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

const CADENCE_HOURS: Record<RefreshCadence, number> = {
  weekly: 24 * 7,
  daily: 24,
  hourly: 1,
};

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
      const now = new Date().toISOString();
      const { data, error } = await db
        .from("profiles")
        .select("id")
        .or(`next_sync_at.lte."${now}",next_sync_at.is.null`)
        .eq("is_opted_out", false)
        .limit(500);
      if (error) throw error;
      return (data ?? []) as { id: string }[];
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
      return data as Profile;
    });

    if (profile.is_opted_out) return { changed: false, skipped: "opted_out" };

    const fetched = await step.run("fetch-from-provider", async () => provider.fetch(profile.linkedin_url));
    const hash = hashSnapshot(fetched);

    const { stored, isFirstSnapshot } = await step.run("store-snapshot", async () => {
      const { count: priorCount } = await db
        .from("profile_snapshots")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profileId);

      const { data: existing } = await db
        .from("profile_snapshots")
        .select("id")
        .eq("profile_id", profileId)
        .eq("content_hash", hash)
        .maybeSingle();
      if (existing) return { stored: null, isFirstSnapshot: false };

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
      if (error) throw error;
      return { stored: data as ProfileSnapshot, isFirstSnapshot: (priorCount ?? 0) === 0 };
    });

    const nextSync = await step.run("compute-next-sync", async () => computeNextSyncAt(db, profileId, profile));

    // Always bump last_synced_at + reschedule.
    await step.run("touch-profile", async () => {
      await db
        .from("profiles")
        .update({
          full_name: fetched.full_name ?? profile.full_name,
          headline: fetched.headline ?? profile.headline,
          current_company: fetched.current_company,
          current_title: fetched.current_title,
          location: fetched.location ?? profile.location,
          avatar_url: fetched.avatar_url ?? profile.avatar_url,
          about: fetched.about ?? profile.about,
          github_handle: fetched.github_handle ?? profile.github_handle,
          x_handle: fetched.x_handle ?? profile.x_handle,
          last_synced_at: new Date().toISOString(),
          next_sync_at: nextSync,
        })
        .eq("id", profileId);
    });

    if (!stored) return { changed: false };
    if (isFirstSnapshot) return { changed: false, baseline: true };

    const prev = await step.run("load-previous-snapshot", async () => {
      const { data: priorSnaps } = await db
        .from("profile_snapshots")
        .select("raw")
        .eq("profile_id", profileId)
        .neq("id", stored.id)
        .order("fetched_at", { ascending: false })
        .limit(1);
      const raw = (priorSnaps?.[0] as { raw?: Record<string, unknown> } | undefined)?.raw;
      if (raw && typeof raw === "object") {
        return snapshotToProviderProfile(raw);
      }
      return {
        full_name: profile.full_name,
        headline: profile.headline,
        current_company: profile.current_company,
        current_title: profile.current_title,
        location: profile.location,
        about: profile.about,
        github_handle: profile.github_handle,
        x_handle: profile.x_handle,
      } satisfies Partial<ProviderProfile>;
    });

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

async function computeNextSyncAt(
  db: ReturnType<typeof createAdminClient>,
  profileId: string,
  profile: Profile,
): Promise<string> {
  const { data: watchers } = await db
    .from("watchlist_profiles")
    .select("watchlists(organizations(refresh_cadence))")
    .eq("profile_id", profileId);

  let hours = CADENCE_HOURS.weekly;
  for (const row of watchers ?? []) {
    const cadence = extractRefreshCadence(row);
    if (cadence) hours = Math.min(hours, CADENCE_HOURS[cadence]);
  }

  if (profile.status === "left" || profile.status === "stealth") {
    hours = Math.min(hours, 6);
  }

  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function extractRefreshCadence(row: unknown): RefreshCadence | null {
  const watchlists = (row as { watchlists?: unknown }).watchlists;
  if (!watchlists) return null;
  const wl = Array.isArray(watchlists) ? watchlists[0] : watchlists;
  const orgs = (wl as { organizations?: unknown }).organizations;
  if (!orgs) return null;
  const org = Array.isArray(orgs) ? orgs[0] : orgs;
  const cadence = (org as { refresh_cadence?: RefreshCadence }).refresh_cadence;
  return cadence ?? null;
}

function snapshotToProviderProfile(raw: Record<string, unknown>): Partial<ProviderProfile> {
  return {
    full_name: stringOrNull(raw.full_name),
    headline: stringOrNull(raw.headline),
    current_company: stringOrNull(raw.current_company),
    current_title: stringOrNull(raw.current_title),
    location: stringOrNull(raw.location),
    about: stringOrNull(raw.about),
    github_handle: stringOrNull(raw.github_handle),
    x_handle: stringOrNull(raw.x_handle),
  };
}

function stringOrNull(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
