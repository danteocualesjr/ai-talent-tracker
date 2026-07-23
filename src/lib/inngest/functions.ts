import "server-only";
import { inngest } from "./client";
import { createAdminClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers";
import { diffProfiles, hashSnapshot } from "@/lib/diff";
import { classifyByRules } from "@/lib/classifier/rules";
import { classifyWithLLM } from "@/lib/classifier/llm";
import { dispatchEvent } from "@/lib/notifications/dispatch";
import { fetchGitHubActivity } from "@/lib/github/activity";
import { detectGitHubDark } from "@/lib/github/detect-dark";
import type { Profile, ProfileSnapshot, RefreshCadence } from "@/types/db";
import type { ProviderProfile } from "@/lib/providers";

const CADENCE_HOURS: Record<RefreshCadence, number> = {
  hourly: 1,
  daily: 24,
  weekly: 168,
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
      // Only fan out profiles that are on at least one watchlist.
      const { data, error } = await db
        .from("profiles")
        .select("id, watchlist_profiles!inner(profile_id)")
        .or(`next_sync_at.lte.${new Date().toISOString()},next_sync_at.is.null`)
        .eq("is_opted_out", false)
        .limit(500);
      if (error) throw error;
      const ids = [...new Set(((data ?? []) as { id: string }[]).map((p) => p.id))];
      return ids.map((id) => ({ id }));
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

    if (profile.is_opted_out) {
      return { skipped: true, reason: "opted_out" };
    }

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
      if (error) throw error;
      return data as ProfileSnapshot;
    });

    // Always bump last_synced_at + reschedule.
    await step.run("touch-profile", async () => {
      const next = await nextSyncAt(db, profile);
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
          next_sync_at: next,
        })
        .eq("id", profileId);
    });

    const githubHandle = fetched.github_handle ?? profile.github_handle;

    if (!stored) {
      const github = await checkGitHubActivity(step, db, profile, githubHandle);
      return { changed: false, ...github };
    }

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
    if (diffs.length === 0) {
      const github = await checkGitHubActivity(step, db, profile, githubHandle);
      return { changed: false, ...github };
    }

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

    if (!classification) {
      const github = await checkGitHubActivity(step, db, profile, githubHandle);
      return { changed: true, eventCreated: false, ...github };
    }

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
    const github = await checkGitHubActivity(step, db, profile, githubHandle);
    return { changed: true, eventCreated: true, type: classification.type, ...github };
  },
);

/**
 * After a profile refresh, check GitHub commit activity for profiles with a
 * linked handle and emit a github_dark event when activity drops off.
 */
async function checkGitHubActivity(
  step: {
    run: (id: string, fn: () => Promise<unknown>) => Promise<unknown>;
    sendEvent: (id: string, events: { name: "event/created"; data: { event_id: string } }) => Promise<unknown>;
  },
  db: ReturnType<typeof createAdminClient>,
  profile: Profile,
  githubHandle: string | null | undefined,
): Promise<{ githubDark: boolean }> {
  if (!githubHandle) return { githubDark: false };

  const activity = (await step.run("fetch-github-activity", () =>
    fetchGitHubActivity(githubHandle),
  )) as Awaited<ReturnType<typeof fetchGitHubActivity>>;
  if (!activity) return { githubDark: false };

  await step.run("update-github-stats", async () => {
    await db
      .from("profiles")
      .update({
        github_last_commit_at: activity.lastCommitAt,
        github_commits_30d: activity.commits30d,
      })
      .eq("id", profile.id);
  });

  const signal = detectGitHubDark(
    {
      github_last_commit_at: profile.github_last_commit_at,
      github_commits_30d: profile.github_commits_30d,
    },
    activity,
  );
  if (!signal) return { githubDark: false };

  const recent = (await step.run("dedupe-github-dark", async () => {
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data } = await db
      .from("events")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("type", "github_dark")
      .gte("detected_at", since)
      .limit(1);
    return (data ?? []).length > 0;
  })) as boolean;
  if (recent) return { githubDark: false };

  const eventRow = (await step.run("persist-github-dark", async () => {
    const { data, error } = await db
      .from("events")
      .insert({
        profile_id: profile.id,
        type: signal.type,
        confidence: signal.confidence,
        summary: signal.summary,
        before: {
          github_last_commit_at: profile.github_last_commit_at,
          github_commits_30d: profile.github_commits_30d,
        },
        after: activity as object,
        is_public: false,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  })) as { id: string };

  await step.sendEvent("notify-github-dark", { name: "event/created", data: { event_id: eventRow.id } });
  return { githubDark: true };
}

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

async function nextSyncAt(
  db: ReturnType<typeof createAdminClient>,
  profile: Profile,
): Promise<string> {
  // Cadence is the *fastest* among orgs watching this profile.
  const { data } = await db
    .from("watchlist_profiles")
    .select("watchlists!inner(organizations!inner(refresh_cadence))")
    .eq("profile_id", profile.id);

  let cadenceHours = CADENCE_HOURS.weekly;
  for (const row of data ?? []) {
    const watchlist = row.watchlists as unknown as
      | { organizations: { refresh_cadence: RefreshCadence } | { refresh_cadence: RefreshCadence }[] | null }
      | null;
    const org = watchlist?.organizations;
    const cadence = Array.isArray(org) ? org[0]?.refresh_cadence : org?.refresh_cadence;
    if (cadence && cadence in CADENCE_HOURS) {
      cadenceHours = Math.min(cadenceHours, CADENCE_HOURS[cadence]);
    }
  }

  // Hot statuses get a tighter ceiling so departures are rechecked sooner.
  if (profile.status === "left" || profile.status === "stealth") {
    cadenceHours = Math.min(cadenceHours, 6);
  }

  return new Date(Date.now() + cadenceHours * 60 * 60 * 1000).toISOString();
}
