import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gated Content",
  description: "Role-gated demo content unlocked by subscription plans.",
};

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
