import type { MetadataRoute } from "next";

const siteUrl = "https://bachidev-webstore.web.app";

// Public routes only: /profile is account UI, /content/* is role-gated,
// and /store/[id] entries are catalog-driven (enumerated at runtime, not build).
const routes = ["/", "/store", "/subscription", "/cart", "/auth"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
