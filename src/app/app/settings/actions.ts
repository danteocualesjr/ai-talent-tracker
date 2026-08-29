"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";

const NameSchema = z.object({ name: z.string().trim().min(1).max(80) });

export type ActionResult = { ok: true } | { error: string };

export async function updateWorkspaceName(formData: FormData): Promise<ActionResult> {
  const parsed = NameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: "Enter a workspace name (1–80 characters)." };

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  const { error } = await db
    .from("organizations")
    .update({ name: parsed.data.name })
    .eq("id", org.id);
  if (error) return { error: "Could not update workspace name. Try again." };

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { ok: true };
}
