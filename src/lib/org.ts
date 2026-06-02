import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import type { Organization } from "@/types/db";

/**
 * Ensures the user has a personal org. Returns the org row. Idempotent.
 */
export async function ensureOrgForUser(userId: string, email: string | null): Promise<Organization> {
  const db = createAdminClient();

  const { data: existing } = await db
    .from("org_members")
    .select("org_id, organizations(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing && (existing as { organizations?: unknown }).organizations) {
    const o = (existing as { organizations: unknown }).organizations;
    return Array.isArray(o) ? (o[0] as Organization) : (o as Organization);
  }

  const slug = (email?.split("@")[0] || `u-${userId.slice(0, 8)}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 32) + "-" + userId.slice(0, 6);

  const { data: org, error } = await db
    .from("organizations")
    .insert({ name: email ? `${email.split("@")[0]}'s workspace` : "My workspace", slug })
    .select("*")
    .single();
  if (error || !org) throw error ?? new Error("failed to create org");
  const orgRow = org as Organization;

  const { error: memberErr } = await db
    .from("org_members")
    .insert({ org_id: orgRow.id, user_id: userId, role: "owner" });
  if (memberErr) {
    await db.from("organizations").delete().eq("id", orgRow.id);
    throw memberErr;
  }

  // Default email channel: alerts go to the signup email.
  if (email) {
    await db.from("notification_channels").insert({
      org_id: orgRow.id,
      type: "email",
      config: { to: email },
    });
  }

  // Default watchlist.
  await db.from("watchlists").insert({ org_id: orgRow.id, name: "My Watchlist", description: "Profiles I'm tracking" });

  return orgRow;
}

export async function getOrgForUser(userId: string): Promise<Organization | null> {
  const db = createAdminClient();
  const { data } = await db
    .from("org_members")
    .select("organizations(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data || !(data as { organizations?: unknown }).organizations) return null;
  const o = (data as { organizations: unknown }).organizations;
  return Array.isArray(o) ? (o[0] as Organization) : (o as Organization);
}
