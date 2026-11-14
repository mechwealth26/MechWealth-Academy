import type { MetadataRoute } from "next";
import { SITE_ROUTES, absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: "monthly",
    priority: route.priority,
  }));
}
