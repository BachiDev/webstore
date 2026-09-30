import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store",
  description: "Browse demo products and pay with a Stripe test card — no real charges.",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
