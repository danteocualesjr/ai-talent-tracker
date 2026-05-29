/**
 * Restrict post-login redirects to same-origin relative paths only.
 */
export function safeRedirectPath(next: string | null | undefined): string {
  const path = (next ?? "/app").trim();
  if (!path.startsWith("/") || path.startsWith("//")) return "/app";
  return path;
}
