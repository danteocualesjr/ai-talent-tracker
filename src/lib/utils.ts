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

export function normalizeLinkedInUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes("linkedin.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const inIdx = parts.indexOf("in");
    if (inIdx === -1 || !parts[inIdx + 1]) return null;
    const handle = parts[inIdx + 1].toLowerCase();
    return `https://www.linkedin.com/in/${handle}`;
  } catch {
    return null;
  }
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/** Allow only same-origin relative paths for post-login redirects. */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/app";
  }
  return next;
}

/** Prevent CDATA terminator sequences from breaking RSS XML. */
export function escapeRssCdata(value: string): string {
  return value.replace(/\]\]>/g, "]]]]><![CDATA[>");
}

/** Block webhook URLs that target private/internal networks (SSRF mitigation). */
export function isSafeWebhookUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (!["https:", "http:"].includes(url.protocol)) return false;
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") return false;

    const hostname = url.hostname.toLowerCase();
    if (hostname === "localhost" || hostname.endsWith(".localhost")) return false;
    if (hostname === "127.0.0.1" || hostname === "::1" || hostname === "0.0.0.0") return false;
    if (hostname === "169.254.169.254" || hostname.startsWith("169.254.")) return false;
    if (/^10\./.test(hostname)) return false;
    if (/^192\.168\./.test(hostname)) return false;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return false;
    if (hostname.startsWith("[") && /^(fc|fd|fe80)/i.test(hostname)) return false;

    return true;
  } catch {
    return false;
  }
}
