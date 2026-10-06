import "server-only";
import { Resend } from "resend";
import { shortLabelForEventType } from "@/lib/event-labels";
import { formatConfidenceLabel } from "@/lib/utils";
import type { EventType } from "@/types/db";

const FROM = process.env.RESEND_FROM || "AI Talent Tracker <alerts@example.com>";

let cached: Resend | null = null;
function resend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

export async function sendEventEmail(to: string, subject: string, html: string): Promise<void> {
  const r = resend();
  if (!r) {
    console.warn("[email] RESEND_API_KEY not set; skipping send to", to);
    return;
  }
  // Resend reports API failures in `error` instead of throwing, so surface them
  // here; otherwise the delivery log records a bounced alert as "sent".
  const { error } = await r.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(`Email delivery failed: ${error.message}`);
}

export function renderEventEmail(args: {
  name: string;
  summary: string;
  type: string;
  linkedinUrl: string;
  detectedAt: string;
  confidence?: number;
}): { subject: string; html: string } {
  const typeLabel = shortLabelForEventType(args.type as EventType);
  const subject = `[Tracker] ${args.name} - ${typeLabel}`;
  const html = `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;margin:auto;padding:24px">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#666">${escapeHtml(typeLabel)}</div>
      <h2 style="margin:8px 0 16px">${escapeHtml(args.name)}</h2>
      <p style="font-size:15px;line-height:1.5">${escapeHtml(args.summary)}</p>
      ${safeHttpUrl(args.linkedinUrl) ? `<p style="margin-top:24px">
        <a href="${escapeHtml(safeHttpUrl(args.linkedinUrl)!)}" style="display:inline-block;padding:8px 14px;background:#111;color:#fff;text-decoration:none;border-radius:6px">View LinkedIn</a>
      </p>` : ""}
      <p style="color:#888;font-size:12px;margin-top:32px">Detected ${escapeHtml(args.detectedAt)}${typeof args.confidence === "number" ? ` · ${escapeHtml(formatConfidenceLabel(args.confidence))}` : ""}</p>
    </div>`;
  return { subject, html };
}

/** Only link http(s) URLs so a stored `javascript:` value never becomes a clickable href. */
function safeHttpUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
