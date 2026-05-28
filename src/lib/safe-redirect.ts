/** Validates a post-auth redirect target is a safe same-origin relative path. */
export function safeRedirectPath(next: string | null, fallback = "/app"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
