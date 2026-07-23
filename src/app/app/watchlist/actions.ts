"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { isProfileOnOrgWatchlist } from "@/lib/queries";
import { extractLinkedInUrlsFromText, normalizeLinkedInUrl } from "@/lib/utils";
import { inngest } from "@/lib/inngest/client";
import type { Organization, Profile, Watchlist } from "@/types/db";

const AddSchema = z.object({ linkedin_url: z.string().min(1) });
const ImportSchema = z.object({ csv_text: z.string().min(1) });

const MAX_CSV_IMPORT = 200;

export type ActionResult = { ok: true } | { error: string };

export type ImportResult =
  | { error: string }
  | { ok: true; added: number; skipped: number; invalid: number; limitReached: boolean };

type TrackOutcome = "added" | "already_tracked" | "limit_reached" | "opted_out";

async function getWatchlistCount(db: ReturnType<typeof createAdminClient>, orgId: string) {
  const { count } = await db
    .from("watchlist_profiles")
    .select("profile_id, watchlists!inner(org_id)", { count: "exact", head: true })
    .eq("watchlists.org_id", orgId);
  return count ?? 0;
}

async function ensureWatchlist(
  db: ReturnType<typeof createAdminClient>,
  orgId: string,
): Promise<Watchlist | null> {
  let { data: wl } = await db.from("watchlists").select("*").eq("org_id", orgId).limit(1).maybeSingle();
  if (!wl) {
    const insWl = await db.from("watchlists").insert({ org_id: orgId, name: "My Watchlist" }).select("*").single();
    if (!insWl.data) return null;
    wl = insWl.data;
  }
  return wl as Watchlist;
}

async function trackProfileUrl(
  db: ReturnType<typeof createAdminClient>,
  org: Organization,
  userId: string,
  watchlist: Watchlist,
  url: string,
  currentCount: number,
): Promise<{ outcome: TrackOutcome; newCount: number }> {
  if (currentCount >= org.profile_limit) {
    return { outcome: "limit_reached", newCount: currentCount };
  }

  let { data: profile } = await db.from("profiles").select("*").eq("linkedin_url", url).maybeSingle();
  if (!profile) {
    const ins = await db.from("profiles").insert({ linkedin_url: url }).select("*").single();
    if (ins.error || !ins.data) return { outcome: "limit_reached", newCount: currentCount };
    profile = ins.data;
  }
  const profileRow = profile as Profile;

  if (profileRow.is_opted_out) {
    return { outcome: "opted_out", newCount: currentCount };
  }

  const { data: existing } = await db
    .from("watchlist_profiles")
    .select("profile_id")
    .eq("watchlist_id", watchlist.id)
    .eq("profile_id", profileRow.id)
    .maybeSingle();

  if (existing) {
    return { outcome: "already_tracked", newCount: currentCount };
  }

  await db.from("watchlist_profiles").upsert(
    { watchlist_id: watchlist.id, profile_id: profileRow.id, added_by: userId },
    { onConflict: "watchlist_id,profile_id" },
  );

  try {
    await inngest.send({ name: "profile/refresh.requested", data: { profile_id: profileRow.id, reason: "manual_add" } });
  } catch (e) {
    console.warn("[inngest] send failed", e);
  }

  return { outcome: "added", newCount: currentCount + 1 };
}

export async function addProfile(formData: FormData): Promise<ActionResult> {
  const parsed = AddSchema.safeParse({ linkedin_url: formData.get("linkedin_url") });
  if (!parsed.success) return { error: "Invalid LinkedIn URL." };

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  const url = normalizeLinkedInUrl(parsed.data.linkedin_url);
  if (!url) return { error: "Please paste a full https://www.linkedin.com/in/... URL." };

  const watchlist = await ensureWatchlist(db, org.id);
  if (!watchlist) return { error: "Could not create watchlist." };

  const count = await getWatchlistCount(db, org.id);
  const { outcome } = await trackProfileUrl(db, org, user.id, watchlist, url, count);

  if (outcome === "limit_reached") {
    return { error: `Plan limit reached (${org.profile_limit}). Upgrade to add more.` };
  }
  if (outcome === "already_tracked") {
    return { error: "This profile is already on your watchlist." };
  }
  if (outcome === "opted_out") {
    return { error: "This profile has opted out of tracking." };
  }

  revalidatePath("/app/watchlist");
  revalidatePath("/app");
  return { ok: true };
}

export async function importProfilesFromCsv(formData: FormData): Promise<ImportResult> {
  const parsed = ImportSchema.safeParse({ csv_text: formData.get("csv_text") });
  if (!parsed.success) return { error: "Paste at least one LinkedIn URL." };

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  const extracted = extractLinkedInUrlsFromText(parsed.data.csv_text);
  const rawLines = parsed.data.csv_text.split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith("#")).length;
  const invalid = Math.max(0, rawLines - extracted.length);

  if (extracted.length === 0) {
    return { error: "No valid LinkedIn /in/ URLs found. Paste full profile links or a CSV with a linkedin_url column." };
  }

  if (extracted.length > MAX_CSV_IMPORT) {
    return { error: `Too many URLs (${extracted.length}). Import up to ${MAX_CSV_IMPORT} profiles at a time.` };
  }

  const watchlist = await ensureWatchlist(db, org.id);
  if (!watchlist) return { error: "Could not create watchlist." };

  let currentCount = await getWatchlistCount(db, org.id);
  let added = 0;
  let skipped = 0;
  let limitReached = false;

  for (const url of extracted) {
    const { outcome, newCount } = await trackProfileUrl(db, org, user.id, watchlist, url, currentCount);
    currentCount = newCount;

    if (outcome === "added") added += 1;
    else if (outcome === "already_tracked" || outcome === "opted_out") skipped += 1;
    else if (outcome === "limit_reached") {
      limitReached = true;
      break;
    }
  }

  if (added === 0 && skipped === 0 && !limitReached) {
    return { error: "Import failed — no profiles could be added." };
  }

  revalidatePath("/app/watchlist");
  revalidatePath("/app");
  return { ok: true, added, skipped, invalid, limitReached };
}

export async function addLabRosterToWatchlist(labId: string, labSlug?: string): Promise<ImportResult> {
  if (!labId) return { error: "Missing lab id." };

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  const { data: profiles } = await db
    .from("profiles")
    .select("linkedin_url")
    .eq("current_company_lab_id", labId)
    .not("linkedin_url", "is", null)
    .limit(500);

  const urls = (profiles ?? []).map((p) => p.linkedin_url as string).filter(Boolean);

  if (urls.length === 0) {
    return { error: "No profiles indexed for this lab yet." };
  }

  const watchlist = await ensureWatchlist(db, org.id);
  if (!watchlist) return { error: "Could not create watchlist." };

  let currentCount = await getWatchlistCount(db, org.id);
  let added = 0;
  let skipped = 0;
  let limitReached = false;

  for (const url of urls) {
    const { outcome, newCount } = await trackProfileUrl(db, org, user.id, watchlist, url, currentCount);
    currentCount = newCount;

    if (outcome === "added") added += 1;
    else if (outcome === "already_tracked" || outcome === "opted_out") skipped += 1;
    else if (outcome === "limit_reached") {
      limitReached = true;
      break;
    }
  }

  if (added === 0 && skipped === 0 && !limitReached) {
    return { error: "No profiles could be added." };
  }

  revalidatePath("/app/watchlist");
  revalidatePath("/app");
  if (labSlug) revalidatePath(`/app/labs/${labSlug}`);
  return { ok: true, added, skipped, invalid: 0, limitReached };
}

export async function removeProfileForm(formData: FormData): Promise<ActionResult> {
  const profileId = String(formData.get("profile_id") ?? "");
  if (!profileId) return { error: "Missing profile id." };

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  const { data: wls } = await db.from("watchlists").select("id").eq("org_id", org.id);
  const ids = ((wls ?? []) as { id: string }[]).map((w) => w.id);
  if (ids.length === 0) return { error: "No watchlist found." };

  const { error } = await db.from("watchlist_profiles").delete().eq("profile_id", profileId).in("watchlist_id", ids);
  if (error) return { error: "Could not remove profile. Try again." };

  revalidatePath("/app/watchlist");
  return { ok: true };
}

export async function refreshNowForm(formData: FormData): Promise<ActionResult> {
  const profileId = String(formData.get("profile_id") ?? "");
  if (!profileId) return { error: "Missing profile id." };

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const onWatchlist = await isProfileOnOrgWatchlist(org.id, profileId);
  if (!onWatchlist) return { error: "Profile is not on your watchlist." };

  const db = createAdminClient();
  const { data: profile } = await db
    .from("profiles")
    .select("is_opted_out")
    .eq("id", profileId)
    .maybeSingle();
  if (!profile) return { error: "Profile not found." };
  if (profile.is_opted_out) return { error: "This profile has opted out of tracking." };

  try {
    await inngest.send({ name: "profile/refresh.requested", data: { profile_id: profileId, reason: "manual" } });
  } catch (e) {
    console.warn("[inngest] send failed", e);
    return { error: "Refresh could not be queued. Try again shortly." };
  }
  revalidatePath("/app/watchlist");
  return { ok: true };
}
