import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/utils";

export async function POST() {
  const supa = await createClient();
  await supa.auth.signOut();
  return NextResponse.redirect(new URL("/", siteUrl()));
}
