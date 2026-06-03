import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") return true;
  if (ip.includes(":")) {
    const lower = ip.toLowerCase();
    return lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
  }
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/** Reject webhook URLs that resolve to private/reserved addresses (SSRF mitigation). */
export async function assertSafeWebhookUrl(urlStr: string): Promise<void> {
  const url = new URL(urlStr);
  if (url.protocol !== "https:") throw new Error("Webhook URL must use HTTPS.");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("Webhook URL host is not allowed.");
  }
  const ipVersion = isIP(host);
  if (ipVersion) {
    if (isPrivateIp(host)) throw new Error("Webhook URL host is not allowed.");
    return;
  }
  const { address } = await lookup(host);
  if (isPrivateIp(address)) throw new Error("Webhook URL host is not allowed.");
}
