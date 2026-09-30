import type { MetadataRoute } from "next";

const siteUrl = "https://bachidev-webstore.web.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
