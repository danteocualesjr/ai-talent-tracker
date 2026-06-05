import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { normalizeLinkedInUrl } from "@/lib/utils";

const OptOutSchema = z.object({
  linkedin_url: z.string().min(1),
  email: z.string().email(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const parsed = OptOutSchema.safeParse({
    linkedin_url: form.get("linkedin_url"),
    email: form.get("email"),
    notes: form.get("notes") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const url = normalizeLinkedInUrl(parsed.data.linkedin_url);
  if (!url) return NextResponse.json({ error: "invalid_url" }, { status: 400 });

  const db = createAdminClient();
  const { data: profile } = await db.from("profiles").select("id").eq("linkedin_url", url).maybeSingle();
  if (!profile) return NextResponse.json({ error: "profile_not_found" }, { status: 404 });

  const { error } = await db.from("profiles").update({ is_opted_out: true }).eq("id", profile.id);
  if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 });

  await db.from("watchlist_profiles").delete().eq("profile_id", profile.id);

  console.log("[opt-out] received", { url, email: parsed.data.email, notes: parsed.data.notes });

  return NextResponse.json({ ok: true });
}
