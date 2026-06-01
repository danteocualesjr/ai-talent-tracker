/** Same-origin relative paths only — blocks open redirects after login. */
export function safeRedirectPath(next: string | null | undefined, fallback = "/app"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  return next;
}
