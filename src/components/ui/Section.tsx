import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  lede?: string;
  tone?: "base" | "raised";
  align?: "center" | "left";
  className?: string;
  children: ReactNode;
};

export function Section({
  id,
  eyebrow,
  title,
  lede,
  tone = "base",
  align = "center",
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "w-full scroll-mt-14 py-20 md:py-28",
        tone === "raised" ? "bg-zinc-900" : "bg-zinc-950",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div
          className={cn(
            "mb-12 max-w-2xl space-y-3",
            align === "center" ? "mx-auto text-center" : "text-left",
          )}
        >
          {eyebrow ? (
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50 md:text-4xl">{title}</h2>
          {lede ? <p className="text-lg text-zinc-400">{lede}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
