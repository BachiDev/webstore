import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in as guest or with email to try the demo storefront.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
