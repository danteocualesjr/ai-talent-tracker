import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";
import { listLabs } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const labs = await listLabs().catch(() => []);
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/feed`, lastModified: now, priority: 0.9 },
    { url: `${base}/labs`, lastModified: now, priority: 0.8 },
    { url: `${base}/pricing`, lastModified: now, priority: 0.7 },
    { url: `${base}/login`, lastModified: now, priority: 0.5 },
    { url: `${base}/opt-out`, lastModified: now, priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, priority: 0.3 },
    ...labs.map((l) => ({ url: `${base}/labs/${l.slug}`, lastModified: now, priority: 0.6 })),
  ];
}
