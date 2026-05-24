import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatRelativeSpan(diffMs: number, suffix: "ago" | "from now") {
  const abs = Math.abs(diffMs);
  const sec = Math.floor(abs / 1000);
  if (sec < 60) return suffix === "ago" ? "just now" : "soon";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ${suffix}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ${suffix}`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ${suffix}`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ${suffix}`;
  return `${Math.floor(mo / 12)}y ${suffix}`;
}

export function formatRelative(date: Date | string | null | undefined) {
  if (!date) return "never";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "unknown";
  const diff = Date.now() - d.getTime();
  if (diff < 0) return formatRelativeSpan(diff, "from now");
  return formatRelativeSpan(diff, "ago");
}

/** Restrict post-login redirects to same-origin relative paths. */
export function safeRedirectPath(next: string | null | undefined, fallback = "/app"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return fallback;
  }
  return next;
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
