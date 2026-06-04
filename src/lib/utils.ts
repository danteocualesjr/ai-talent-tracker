import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Same-origin relative path only; blocks open redirects after auth. */
export function safeRedirectPath(path: string | null | undefined, fallback = "/app"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

export function formatRelative(date: Date | string | null | undefined) {
  if (!date) return "never";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "unknown";
  const diff = Date.now() - d.getTime();
  if (diff < 0) return formatDuration(-diff, "in");
  return formatDuration(diff, "ago");
}

function formatDuration(ms: number, suffix: "ago" | "in"): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return suffix === "ago" ? `${sec}s ago` : `in ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return suffix === "ago" ? `${min}m ago` : `in ${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return suffix === "ago" ? `${hr}h ago` : `in ${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 30) return suffix === "ago" ? `${day}d ago` : `in ${day}d`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return suffix === "ago" ? `${mo}mo ago` : `in ${mo}mo`;
  const yr = Math.floor(mo / 12);
  return suffix === "ago" ? `${yr}y ago` : `in ${yr}y`;
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
