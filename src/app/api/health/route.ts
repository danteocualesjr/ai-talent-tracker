import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    supabase: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
}
