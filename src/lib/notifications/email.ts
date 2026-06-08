import "server-only";
import { Resend } from "resend";

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
    throw new Error("RESEND_API_KEY not configured");
  }
  const { error } = await r.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(error.message);
}

export function renderEventEmail(args: {
  name: string;
  summary: string;
  type: string;
  linkedinUrl: string;
  detectedAt: string;
}): { subject: string; html: string } {
  const subject = `[Tracker] ${args.name} — ${labelFor(args.type)}`;
  const html = `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;margin:auto;padding:24px">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#666">${labelFor(args.type)}</div>
      <h2 style="margin:8px 0 16px">${escapeHtml(args.name)}</h2>
      <p style="font-size:15px;line-height:1.5">${escapeHtml(args.summary)}</p>
      <p style="margin-top:24px">
        <a href="${escapeHtml(args.linkedinUrl)}" style="display:inline-block;padding:8px 14px;background:#111;color:#fff;text-decoration:none;border-radius:6px">View LinkedIn</a>
      </p>
      <p style="color:#888;font-size:12px;margin-top:32px">Detected ${args.detectedAt}</p>
    </div>`;
  return { subject, html };
}

function labelFor(type: string): string {
  switch (type) {
    case "left_company": return "Left their company";
    case "joined_company": return "Joined a new company";
    case "went_stealth": return "Went stealth";
    case "headline_signals_founding": return "Founding signal";
    case "role_change_internal": return "Role change";
    case "about_changed": return "About updated";
    default: return "Profile change";
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
