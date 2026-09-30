import "server-only";
import { Resend } from "resend";
import { shortLabelForEventType } from "@/lib/event-labels";
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
  await r.emails.send({ from: FROM, to, subject, html });
}

export function renderEventEmail(args: {
  name: string;
  summary: string;
  type: string;
  linkedinUrl: string;
  detectedAt: string;
}): { subject: string; html: string } {
  const typeLabel = shortLabelForEventType(args.type as EventType);
  const subject = `[Tracker] ${args.name} - ${typeLabel}`;
  const html = `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;margin:auto;padding:24px">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#666">${escapeHtml(typeLabel)}</div>
      <h2 style="margin:8px 0 16px">${escapeHtml(args.name)}</h2>
      <p style="font-size:15px;line-height:1.5">${escapeHtml(args.summary)}</p>
      <p style="margin-top:24px">
        <a href="${escapeHtml(args.linkedinUrl)}" style="display:inline-block;padding:8px 14px;background:#111;color:#fff;text-decoration:none;border-radius:6px">View LinkedIn</a>
      </p>
      <p style="color:#888;font-size:12px;margin-top:32px">Detected ${escapeHtml(args.detectedAt)}</p>
    </div>`;
  return { subject, html };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
