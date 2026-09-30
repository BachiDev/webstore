import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions",
  description: "Demo subscription plans with Stripe test checkout — unlock role-gated content.",
};

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
