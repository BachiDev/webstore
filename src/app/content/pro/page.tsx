"use client";

import withAuth from "@/components/withAuth";
import { useContent } from "../../../lib/useContent";
import { useRole } from "../../../lib/useRole";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { EmptyState, Skeleton } from "@/components/ui/ShopBits";

const ProContentPage = () => {
  const { isPro } = useRole();
  const { content, loading } = useContent("content-pro");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <Pill>Pro plan</Pill>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 md:text-4xl">
        Pro Content
      </h1>
      <div className="mt-10">
        {!isPro ? (
          <EmptyState
            title="Pro plan required"
            lede="This content unlocks with a Pro subscription or higher."
            action={<Button href="/subscription">See plans</Button>}
          />
        ) : loading ? (
          <div className="flex flex-col gap-3" role="status" aria-label="Loading content">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : content.length === 0 ? (
          <EmptyState title="No content yet" lede="Check back soon." />
        ) : (
          <Card>
            <ul className="flex flex-col gap-3 text-zinc-200">
              {content.map((item, index) => (
                <li key={index} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

export default withAuth(ProContentPage);
