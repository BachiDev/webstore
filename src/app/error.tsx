"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-20 text-center md:py-28">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
        Something went wrong
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
        This page hit an error
      </h1>
      <p className="mt-3 max-w-md text-zinc-400">
        Please try again — if it persists, the demo backend may be briefly unreachable.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="secondary">
          Back home
        </Button>
      </div>
    </div>
  );
}
