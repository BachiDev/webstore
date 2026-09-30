import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your demo cart and check out with a Stripe test card.",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
