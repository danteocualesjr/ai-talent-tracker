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
  if (diff < 0) {
    const ahead = Math.abs(diff);
    const sec = Math.floor(ahead / 1000);
    if (sec < 60) return `in ${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `in ${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `in ${hr}h`;
    const day = Math.floor(hr / 24);
    return `in ${day}d`;
  }
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

const LINKEDIN_IN_REGEX = /(?:https?:\/\/)?(?:[\w-]+\.)?linkedin\.com\/in\/([\w-]+)/gi;
const CSV_HEADER_RE = /^(linkedin(?:_url)?|url|profile(?:_url)?|link)$/i;

/** Extract unique normalized LinkedIn /in/ URLs from plain text or CSV paste. */
export function extractLinkedInUrlsFromText(text: string): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  function add(raw: string) {
    const normalized = normalizeLinkedInUrl(raw);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      urls.push(normalized);
    }
  }

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const cells = trimmed.includes(",") ? trimmed.split(",") : [trimmed];
    for (const cell of cells) {
      const value = cell.trim().replace(/^["']|["']$/g, "");
      if (!value || CSV_HEADER_RE.test(value)) continue;
      add(value);
    }

    for (const match of trimmed.matchAll(LINKEDIN_IN_REGEX)) {
      add(`https://www.linkedin.com/in/${match[1]}`);
    }
  }

  return urls;
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
