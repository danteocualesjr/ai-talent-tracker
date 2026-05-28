import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured yet, just pass requests through and bounce
  // /app paths to the landing page so the marketing site stays usable.
  if (!url || !key) {
    if (request.nextUrl.pathname.startsWith("/app") || request.nextUrl.pathname.startsWith("/login")) {
      const home = request.nextUrl.clone();
      home.pathname = "/";
      home.searchParams.set("setup", "missing-supabase-env");
      return NextResponse.redirect(home);
    }
    return response;
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAppPath = request.nextUrl.pathname.startsWith("/app");
  if (isAppPath && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    const redirect = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie.name, cookie.value);
    });
    return redirect;
  }

  return response;
}
