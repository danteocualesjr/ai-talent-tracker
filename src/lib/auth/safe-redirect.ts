/**
 * Validates a post-login redirect target. Rejects absolute URLs and protocol-relative paths.
 */
export function safeRedirectPath(next: string | null | undefined, fallback = "/app"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
