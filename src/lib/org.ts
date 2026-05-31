import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import type { Organization } from "@/types/db";

/**
 * Ensures the user has a personal org. Returns the org row. Idempotent.
 */
export async function ensureOrgForUser(userId: string, email: string | null): Promise<Organization> {
  const db = createAdminClient();

  const existingOrg = await getOrgForUser(userId);
  if (existingOrg) return existingOrg;

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

  await db.from("org_members").insert({ org_id: orgRow.id, user_id: userId, role: "owner" });

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

  // Concurrent sign-up flows can each create an org; keep the earliest membership.
  const { data: memberships } = await db
    .from("org_members")
    .select("org_id, created_at, organizations(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (memberships && memberships.length > 1) {
    const primary = memberships[0] as { organizations?: unknown };
    const primaryOrg = extractOrg(primary.organizations);
    for (const m of memberships.slice(1)) {
      await db.from("organizations").delete().eq("id", (m as { org_id: string }).org_id);
    }
    return primaryOrg;
  }

  return orgRow;
}

function extractOrg(o: unknown): Organization {
  return Array.isArray(o) ? (o[0] as Organization) : (o as Organization);
}

export async function getOrgForUser(userId: string): Promise<Organization | null> {
  const db = createAdminClient();
  const { data } = await db
    .from("org_members")
    .select("organizations(*)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (!data || !(data as { organizations?: unknown }).organizations) return null;
  return extractOrg((data as { organizations: unknown }).organizations);
}
