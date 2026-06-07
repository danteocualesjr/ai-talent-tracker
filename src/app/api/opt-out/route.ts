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
    linkedin_url: String(form.get("linkedin_url") ?? ""),
    email: String(form.get("email") ?? ""),
    notes: String(form.get("notes") ?? "") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const url = normalizeLinkedInUrl(parsed.data.linkedin_url);
  if (!url) return NextResponse.json({ error: "invalid url" }, { status: 400 });

  const db = createAdminClient();
  const { data: profile } = await db.from("profiles").select("id, is_opted_out").eq("linkedin_url", url).maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }
  if (profile.is_opted_out) {
    return NextResponse.json({ ok: true, already_opted_out: true });
  }

  const { error } = await db.from("profiles").update({ is_opted_out: true }).eq("id", profile.id);
  if (error) return NextResponse.json({ error: "update failed" }, { status: 500 });

  // In production, also email the team. Logged for now.
  console.log("[opt-out] received", { url, email: parsed.data.email, notes: parsed.data.notes });

  return NextResponse.json({ ok: true });
}
