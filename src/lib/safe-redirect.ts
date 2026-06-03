/** Restrict post-auth redirects to same-origin relative paths. */
export function safeRedirectPath(next: string | null | undefined, fallback = "/app"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
