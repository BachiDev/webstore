import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your demo account, payments, and subscriptions.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
