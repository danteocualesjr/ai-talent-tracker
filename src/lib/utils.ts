import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelative(date: Date | string | null | undefined) {
  if (!date) return "never";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "unknown";
  const diff = Date.now() - d.getTime();
  if (diff < 0) return "just now";
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

/** Allow only same-origin relative paths after login (blocks open redirects). */
export function safeRedirectPath(next: string | null | undefined, fallback = "/app"): string {
  if (!next) return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (/^\/\\/.test(trimmed)) return fallback;
  try {
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.hostname !== "localhost") return fallback;
    if (parsed.protocol !== "http:") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback;
  } catch {
    return fallback;
  }
}

export function normalizeLinkedInUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase();
    if (host !== "linkedin.com" && host !== "www.linkedin.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const inIdx = parts.indexOf("in");
    if (inIdx === -1 || !parts[inIdx + 1]) return null;
    const handle = parts[inIdx + 1].toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!handle) return null;
    return `https://www.linkedin.com/in/${handle}`;
  } catch {
    return null;
  }
}

/** Prevent `]]>` from breaking RSS CDATA sections. */
export function escapeRssCdata(text: string): string {
  return text.replace(/]]>/g, "]]]]><![CDATA[>");
}

const PRIVATE_IPV4 =
  /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/;

/** Block SSRF targets for user-configured notification webhooks. */
export function isSafeWebhookUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host === "metadata.google.internal" ||
      host.endsWith(".internal")
    ) {
      return false;
    }
    if (host === "[::1]" || host.startsWith("fc") || host.startsWith("fd")) return false;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      if (PRIVATE_IPV4.test(host)) return false;
      if (host.startsWith("0.")) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
