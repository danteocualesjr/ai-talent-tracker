import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.co";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "invalid";
  return createServerClient(
    url,
    anon,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]);
            });
          } catch {
            // Server Component context - safe to ignore.
          }
        },
      },
    },
  );
}

export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // Return a client that lazily fails; lets next build pre-render skeleton
    // pages without crashing when env is not yet configured.
    return createSupabaseClient("https://invalid.supabase.co", "invalid", {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
