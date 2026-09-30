import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Webstore Demo",
    short_name: "Webstore",
    description:
      "Demo storefront: Next.js + Firebase + Stripe test payments — auth, cart, checkout, subscriptions.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
