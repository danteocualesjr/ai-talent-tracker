import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/utils";

export async function POST() {
  const supa = await createClient();
  await supa.auth.signOut();
  // 303 so the browser follows with GET; the default 307 would re-POST to "/".
  return NextResponse.redirect(new URL("/", siteUrl()), 303);
}
