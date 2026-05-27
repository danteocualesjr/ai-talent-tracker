/**
 * Restricts post-auth redirects to same-site relative paths.
 */
export function safeRedirectPath(next: string | null | undefined, fallback = "/app"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes(":")) {
    return fallback;
  }
  try {
    const parsed = new URL(next, "http://localhost");
    if (parsed.origin !== "http://localhost") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
