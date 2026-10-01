import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Two-letter avatar initials from a full name or handle (e.g. "Jane Doe" -> "JD"). */
export function initialsFromName(name: string | null | undefined, fallback = "??"): string {
  const raw = (name ?? "").trim();
  if (!raw) return fallback;
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase() || fallback;
  }
  const single = parts[0] ?? "";
  if (single.length >= 2) return single.slice(0, 2).toUpperCase();
  return (single[0] ?? fallback[0] ?? "?").toUpperCase().padEnd(2, fallback[1] ?? "?");
}

/**
 * Best-effort display name from a LinkedIn handle ("jane-2-doe-81a" -> "Jane Doe A").
 * Strips digits and collapses the gaps they leave behind.
 */
export function humanizeLinkedInHandle(handle: string | null | undefined): string | null {
  if (!handle) return null;
  return (
    handle
      .replace(/[-_]+/g, " ")
      .replace(/\d+/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || null
  );
}

export function formatRelative(date: Date | string | null | undefined) {
  if (!date) return "never";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "unknown";
  const diff = Date.now() - d.getTime();
  if (diff < 0) {
    const ahead = Math.abs(diff);
    const sec = Math.floor(ahead / 1000);
    // Small negative diffs are server/client clock skew, not real future times.
    if (sec < 5) return "just now";
    if (sec < 60) return `in ${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `in ${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `in ${hr}h`;
    const day = Math.floor(hr / 24);
    return `in ${day}d`;
  }
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "just now";
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
    const host = u.hostname.toLowerCase();
    // Exact domain or a real subdomain only; `includes` let hosts like
    // "linkedin.com.evil.io" or "notlinkedin.com" slip through.
    if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const inIdx = parts.indexOf("in");
    if (inIdx === -1 || !parts[inIdx + 1]) return null;
    const handle = parts[inIdx + 1].toLowerCase().replace(/\/+$/, "").split("?")[0].split("#")[0];
    if (!handle || handle.length < 2) return null;
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

/** Allow only same-origin relative paths after login (blocks open redirects). */
export function safeRedirectPath(next: string | null | undefined, fallback = "/app"): string {
  if (!next) return fallback;
  let path = next;
  try {
    path = decodeURIComponent(next);
  } catch {
    return fallback;
  }
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (/^\/[^/]*:/i.test(path)) return fallback;
  return path;
}

/** Escape `]]>` sequences so RSS CDATA sections stay well-formed. */
export function escapeRssCdata(text: string): string {
  return text.replace(/]]>/g, "]]]]><![CDATA[>");
}

export function normalizeSocialHandle(handle: string): string {
  return handle.trim().replace(/^@/, "");
}

export function githubProfileUrl(handle: string): string {
  return `https://github.com/${normalizeSocialHandle(handle)}`;
}

export function xProfileUrl(handle: string): string {
  return `https://x.com/${normalizeSocialHandle(handle)}`;
}

/** Compact month/day label for charts and dense UI. */
export function formatShortDate(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "n/a";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Minimum confidence treated as high-quality in filters and badges. */
export const HIGH_CONFIDENCE_THRESHOLD = 0.8;

/** True when detection confidence meets the high-quality bar (≥80%). */
export function isHighConfidence(confidence: number): boolean {
  return Number.isFinite(confidence) && confidence >= HIGH_CONFIDENCE_THRESHOLD;
}

/** Whole-number percent for detection confidence (0-1). */
export function formatConfidencePercent(confidence: number): number {
  if (!Number.isFinite(confidence)) return 0;
  return Math.max(0, Math.min(100, Math.round(confidence * 100)));
}

/** Absolute local datetime for tooltips beside relative timestamps. */
export function formatAbsoluteDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Quote a CSV cell when it contains a delimiter, quote, or line break. */
export function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Date-stamped CSV download name (UTC YYYY-MM-DD). */
export function stampedCsvFilename(prefix: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${prefix}-${stamp}.csv`;
}

/**
 * Trigger a browser download for a blob and revoke the object URL after a short
 * delay so Chromium/Safari finish starting the download first.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
