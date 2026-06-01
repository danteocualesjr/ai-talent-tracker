"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { normalizeLinkedInUrl } from "@/lib/utils";
import { inngest } from "@/lib/inngest/client";
import type { Profile, Watchlist } from "@/types/db";

const AddSchema = z.object({ linkedin_url: z.string().min(1) });

export type ActionResult = { ok: true } | { error: string };

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

  const { count } = await db
    .from("watchlist_profiles")
    .select("profile_id, watchlists!inner(org_id)", { count: "exact", head: true })
    .eq("watchlists.org_id", org.id);
  if ((count ?? 0) >= org.profile_limit) {
    return { error: `Plan limit reached (${org.profile_limit}). Upgrade to add more.` };
  }

  let { data: profile } = await db.from("profiles").select("*").eq("linkedin_url", url).maybeSingle();
  if (!profile) {
    const ins = await db.from("profiles").insert({ linkedin_url: url }).select("*").single();
    if (ins.error || !ins.data) return { error: ins.error?.message ?? "Insert failed" };
    profile = ins.data;
  }
  const profileRow = profile as Profile;
  if (profileRow.is_opted_out) {
    return { error: "This profile has opted out of tracking." };
  }

  let { data: wl } = await db.from("watchlists").select("*").eq("org_id", org.id).limit(1).maybeSingle();
  if (!wl) {
    const insWl = await db.from("watchlists").insert({ org_id: org.id, name: "My Watchlist" }).select("*").single();
    if (!insWl.data) return { error: "Could not create watchlist." };
    wl = insWl.data;
  }
  const watchlistRow = wl as Watchlist;

  await db.from("watchlist_profiles").upsert(
    { watchlist_id: watchlistRow.id, profile_id: profileRow.id, added_by: user.id },
    { onConflict: "watchlist_id,profile_id" },
  );

  try {
    await inngest.send({ name: "profile/refresh.requested", data: { profile_id: profileRow.id, reason: "manual_add" } });
  } catch (e) {
    console.warn("[inngest] send failed", e);
  }

  revalidatePath("/app/watchlist");
  revalidatePath("/app");
  return { ok: true };
}

export async function removeProfileForm(formData: FormData): Promise<void> {
  const profileId = String(formData.get("profile_id") ?? "");
  if (!profileId) return;

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return;

  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  const { data: wls } = await db.from("watchlists").select("id").eq("org_id", org.id);
  const ids = ((wls ?? []) as { id: string }[]).map((w) => w.id);
  if (ids.length === 0) return;
  await db.from("watchlist_profiles").delete().eq("profile_id", profileId).in("watchlist_id", ids);

  revalidatePath("/app/watchlist");
}

export async function refreshNowForm(formData: FormData): Promise<void> {
  const profileId = String(formData.get("profile_id") ?? "");
  if (!profileId) return;

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return;

  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  const { data: wls } = await db.from("watchlists").select("id").eq("org_id", org.id);
  const ids = ((wls ?? []) as { id: string }[]).map((w) => w.id);
  if (ids.length === 0) return;

  const { count } = await db
    .from("watchlist_profiles")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .in("watchlist_id", ids);
  if (!count) return;

  try {
    await inngest.send({ name: "profile/refresh.requested", data: { profile_id: profileId, reason: "manual" } });
  } catch (e) {
    console.warn("[inngest] send failed", e);
  }
  revalidatePath("/app/watchlist");
}
