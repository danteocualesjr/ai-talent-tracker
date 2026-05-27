/** Allow only same-origin relative paths (blocks open redirects). */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next) return "/app";
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return "/app";
}
