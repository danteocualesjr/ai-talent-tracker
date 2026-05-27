import "server-only";
import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set(["localhost", "metadata.google.internal"]);

/** Rejects URLs that could be used for SSRF against internal networks. */
export function assertSafeWebhookUrl(urlString: string): void {
  const u = new URL(urlString);
  if (u.protocol !== "https:") {
    throw new Error("Webhook URL must use HTTPS");
  }

  const host = u.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("Webhook URL host is not allowed");
  }

  if (isIP(host)) {
    if (isPrivateIp(host)) {
      throw new Error("Webhook URL must not target a private or reserved IP");
    }
    return;
  }

  // Block literal private IPs in hostname (e.g. 169.254.169.254)
  if (isIP(host.replace(/^\[|\]$/g, ""))) {
    if (isPrivateIp(host)) {
      throw new Error("Webhook URL must not target a private or reserved IP");
    }
  }
}

function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "0.0.0.0") return true;
  if (ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.") || ip.startsWith("100.64.")) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80:")) return true;
  return false;
}
