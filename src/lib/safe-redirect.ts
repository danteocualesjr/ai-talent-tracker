/**
 * Validates post-auth redirect targets to prevent open redirects.
 * Only same-origin relative paths are allowed (e.g. /app, /app/watchlist).
 */
export function safeRedirectPath(next: string | null | undefined, fallback = "/app"): string {
  if (!next) return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("@")) return fallback;
  try {
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return fallback;
    if (parsed.hostname !== "localhost") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
